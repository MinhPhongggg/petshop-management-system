package com.petshop.integration;

import com.petshop.dto.response.BookingDTO;
import com.petshop.entity.Booking;
import com.petshop.entity.Category;
import com.petshop.entity.Pet;
import com.petshop.entity.SpaService;
import com.petshop.entity.User;
import com.petshop.repository.BookingRepository;
import com.petshop.repository.PetRepository;
import com.petshop.repository.SpaServiceRepository;
import com.petshop.repository.UserRepository;
import com.petshop.service.BookingService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:petshop_test;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_UPPER=false",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.show-sql=false"
})
class BookingPromotionRaceConditionIT {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private SpaServiceRepository spaServiceRepository;

    @AfterEach
    void tearDown() {
        bookingRepository.deleteAll();
        petRepository.deleteAll();
        spaServiceRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void shouldApplyFreeBookingOnlyOnce_whenTwoPaymentsRunConcurrentlyForSamePetAndService() throws Exception {
        User customer = userRepository.save(User.builder()
            .email("race-customer@test.com")
            .password("pwd")
            .fullName("Race Customer")
            .phone("0911111111")
            .role(User.Role.CUSTOMER)
            .active(true)
            .build());

        SpaService service = spaServiceRepository.save(SpaService.builder()
            .name("Grooming Basic")
            .slug("grooming-basic-race")
            .duration(60)
            .petType(Category.PetType.ALL)
            .active(true)
            .build());

        SpaService otherService = spaServiceRepository.save(SpaService.builder()
            .name("Spa Deluxe")
            .slug("spa-deluxe-race")
            .duration(90)
            .petType(Category.PetType.ALL)
            .active(true)
            .build());

        Pet pet = petRepository.save(Pet.builder()
            .owner(customer)
            .name("Coco")
            .type(Pet.PetType.DOG)
            .weight(7.5)
            .active(true)
            .build());

        // 3 booking da thanh toan cung dich vu => du dieu kien tang 1.
        bookingRepository.save(buildBooking(customer, pet, service, Booking.BookingStatus.COMPLETED, Booking.PaymentStatus.PAID, new BigDecimal("200000"), 1));
        bookingRepository.save(buildBooking(customer, pet, service, Booking.BookingStatus.COMPLETED, Booking.PaymentStatus.PAID, new BigDecimal("220000"), 2));
        bookingRepository.save(buildBooking(customer, pet, service, Booking.BookingStatus.COMPLETED, Booking.PaymentStatus.PAID, new BigDecimal("230000"), 3));

        // Khac dich vu khong duoc tinh vao chuong trinh cua service hien tai.
        bookingRepository.save(buildBooking(customer, pet, otherService, Booking.BookingStatus.COMPLETED, Booking.PaymentStatus.PAID, new BigDecimal("300000"), 6));

        Booking currentA = bookingRepository.save(buildBooking(customer, pet, service, Booking.BookingStatus.COMPLETED, Booking.PaymentStatus.PENDING, new BigDecimal("240000"), 4));
        Booking currentB = bookingRepository.save(buildBooking(customer, pet, service, Booking.BookingStatus.COMPLETED, Booking.PaymentStatus.PENDING, new BigDecimal("250000"), 5));

        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch startLatch = new CountDownLatch(1);

        Callable<BookingDTO> payA = () -> {
            startLatch.await(5, TimeUnit.SECONDS);
            return bookingService.payBooking(currentA.getId());
        };

        Callable<BookingDTO> payB = () -> {
            startLatch.await(5, TimeUnit.SECONDS);
            return bookingService.payBooking(currentB.getId());
        };

        Future<BookingDTO> futureA = executor.submit(payA);
        Future<BookingDTO> futureB = executor.submit(payB);

        startLatch.countDown();

        BookingDTO resultA = futureA.get(15, TimeUnit.SECONDS);
        BookingDTO resultB = futureB.get(15, TimeUnit.SECONDS);

        executor.shutdownNow();

        List<Booking> all = bookingRepository.findAll();
        long rewardCount = all.stream().filter(b -> Boolean.TRUE.equals(b.getPromotionReward())).count();
        long consumedCount = all.stream().filter(b -> Boolean.TRUE.equals(b.getPromotionConsumed())).count();
        long paidCountForTargetService = all.stream()
            .filter(b -> b.getService().getId().equals(service.getId()))
            .filter(b -> b.getPaymentStatus() == Booking.PaymentStatus.PAID)
            .count();

        assertThat(resultA.getStatus()).isEqualTo(Booking.BookingStatus.COMPLETED);
        assertThat(resultB.getStatus()).isEqualTo(Booking.BookingStatus.COMPLETED);
        assertThat(resultA.getPaymentStatus()).isEqualTo(Booking.PaymentStatus.PAID);
        assertThat(resultB.getPaymentStatus()).isEqualTo(Booking.PaymentStatus.PAID);
        assertThat(rewardCount).isEqualTo(1);
        assertThat(consumedCount).isEqualTo(3);
        assertThat(paidCountForTargetService).isEqualTo(5);
        assertThat(all.stream().filter(b -> Boolean.TRUE.equals(b.getPromotionReward())).findFirst().orElseThrow().getPrice())
            .isEqualByComparingTo(BigDecimal.ZERO);
    }

    private Booking buildBooking(User user,
                                 Pet pet,
                                 SpaService service,
                                 Booking.BookingStatus status,
                                 Booking.PaymentStatus paymentStatus,
                                 BigDecimal price,
                                 int dayOffset) {
        LocalDate bookingDate = LocalDate.now().minusDays(10L - dayOffset);
        LocalTime startTime = LocalTime.of(9 + dayOffset % 8, 0);
        LocalDateTime completedAt = status == Booking.BookingStatus.COMPLETED
            ? LocalDateTime.now().minusDays(10L - dayOffset)
            : null;

        return Booking.builder()
            .bookingCode("RACE-" + dayOffset + "-" + System.nanoTime())
            .user(user)
            .pet(pet)
            .service(service)
            .bookingDate(bookingDate)
            .startTime(startTime)
            .endTime(startTime.plusMinutes(60))
            .status(status)
            .paymentStatus(paymentStatus)
            .price(price)
            .completedAt(completedAt)
            .promotionConsumed(false)
            .promotionReward(false)
            .promotionDiscountPercent(BigDecimal.ZERO)
            .build();
    }
}
