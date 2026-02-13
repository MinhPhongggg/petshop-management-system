package com.petshop.service.impl;

import com.petshop.dto.request.BookingRequest;
import com.petshop.dto.response.BookingDTO;
import com.petshop.entity.*;
import com.petshop.exception.BadRequestException;
import com.petshop.exception.ResourceNotFoundException;
import com.petshop.repository.*;
import com.petshop.security.UserPrincipal;
import com.petshop.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {
    
    private final BookingRepository bookingRepository;
    private final SpaServiceRepository spaServiceRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    
    @Override
    @Transactional
    public BookingDTO createBooking(BookingRequest request) {
        User user = getCurrentUser();
        
        SpaService service = spaServiceRepository.findById(request.getServiceId())
            .orElseThrow(() -> new ResourceNotFoundException("Dịch vụ không tồn tại"));
        
        if (!service.getActive()) {
            throw new BadRequestException("Dịch vụ không còn hoạt động");
        }
        
        Pet pet;
        if (request.getPetId() != null) {
            // Sử dụng pet đã có
            pet = petRepository.findByIdAndOwnerId(request.getPetId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Thú cưng không tồn tại"));
        } else if (request.getPetInfo() != null) {
            // Tạo pet mới từ petInfo
            Pet.PetType petType;
            try {
                petType = Pet.PetType.valueOf(request.getPetInfo().getType().toUpperCase());
            } catch (Exception e) {
                petType = Pet.PetType.OTHER;
            }
            
            pet = Pet.builder()
                .owner(user)
                .name(request.getPetInfo().getName())
                .type(petType)
                .breed(request.getPetInfo().getBreed())
                .weight(request.getPetInfo().getWeight())
                .active(true)
                .build();
            pet = petRepository.save(pet);
        } else {
            throw new BadRequestException("Vui lòng chọn thú cưng hoặc nhập thông tin thú cưng mới");
        }
        
        // Check time slot availability
        LocalTime endTime = request.getStartTime().plusMinutes(service.getDuration());
        if (!isTimeSlotAvailable(request.getBookingDate(), request.getStartTime(), endTime)) {
            throw new BadRequestException("Khung giờ đã được đặt");
        }
        
        // Get price based on pet weight
        BigDecimal price = getServicePrice(service, pet);
        
        Booking booking = Booking.builder()
            .user(user)
            .service(service)
            .pet(pet)
            .bookingCode(generateBookingCode())
            .bookingDate(request.getBookingDate())
            .startTime(request.getStartTime())
            .endTime(endTime)
            .status(Booking.BookingStatus.PENDING)
            .price(price)
            .customerNote(request.getCustomerNote())
            .build();
        
        booking = bookingRepository.save(booking);
        return mapToDTO(booking);
    }
    
    @Override
    public boolean isTimeSlotAvailable(LocalDate date, LocalTime startTime, LocalTime endTime) {
        List<Booking> existingBookings = bookingRepository.findByDate(date);
        
        for (Booking booking : existingBookings) {
            if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
                continue;
            }
            
            // Check overlap
            if (startTime.isBefore(booking.getEndTime()) && endTime.isAfter(booking.getStartTime())) {
                return false;
            }
        }
        
        return true;
    }
    
    @Override
    public BookingDTO getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Lịch hẹn không tồn tại"));
        return mapToDTO(booking);
    }
    
    @Override
    public BookingDTO getBookingByCode(String bookingCode) {
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
            .orElseThrow(() -> new ResourceNotFoundException("Lịch hẹn không tồn tại"));
        return mapToDTO(booking);
    }
    
    @Override
    public Page<BookingDTO> getMyBookings(Pageable pageable) {
        User user = getCurrentUser();
        return bookingRepository.findByUserIdOrderByBookingDateDescStartTimeDesc(user.getId(), pageable)
            .map(this::mapToDTO);
    }
    
    @Override
    @Transactional
    public BookingDTO cancelBooking(Long id, String reason) {
        User user = getCurrentUser();
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Lịch hẹn không tồn tại"));
        
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Không có quyền truy cập");
        }
        
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new BadRequestException("Chỉ có thể hủy lịch hẹn đang chờ xác nhận");
        }
        
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setCancelReason(reason);
        booking = bookingRepository.save(booking);
        
        return mapToDTO(booking);
    }
    
    // === Admin/Staff Methods ===
    
    @Override
    public List<BookingDTO> getBookingsByDate(LocalDate date) {
        return bookingRepository.findByDate(date).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public Page<BookingDTO> getAllBookings(Pageable pageable) {
        return bookingRepository.findAll(pageable).map(this::mapToDTO);
    }
    
    @Override
    public Page<BookingDTO> getBookingsByStatus(Booking.BookingStatus status, Pageable pageable) {
        return bookingRepository.findByStatusOrderByBookingDateDescStartTimeDesc(status, pageable).map(this::mapToDTO);
    }
    
    @Override
    @Transactional
    public BookingDTO confirmBooking(Long id) {
        Booking booking = getBookingEntity(id);
        validateStatusTransition(booking.getStatus(), Booking.BookingStatus.CONFIRMED);
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        booking = bookingRepository.save(booking);
        return mapToDTO(booking);
    }
    
    @Override
    @Transactional
    public BookingDTO startBooking(Long id) {
        Booking booking = getBookingEntity(id);
        validateStatusTransition(booking.getStatus(), Booking.BookingStatus.IN_PROGRESS);
        booking.setStatus(Booking.BookingStatus.IN_PROGRESS);
        booking = bookingRepository.save(booking);
        return mapToDTO(booking);
    }
    
    @Override
    @Transactional
    public BookingDTO completeBooking(Long id, String staffNote) {
        Booking booking = getBookingEntity(id);
        validateStatusTransition(booking.getStatus(), Booking.BookingStatus.COMPLETED);
        booking.setStatus(Booking.BookingStatus.COMPLETED);
        booking.setStaffNote(staffNote);
        booking = bookingRepository.save(booking);
        return mapToDTO(booking);
    }
    
    @Override
    @Transactional
    public BookingDTO adminCancelBooking(Long id, String reason) {
        Booking booking = getBookingEntity(id);
        
        if (booking.getStatus() == Booking.BookingStatus.COMPLETED || 
            booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new BadRequestException("Không thể hủy lịch hẹn này");
        }
        
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setCancelReason(reason);
        booking = bookingRepository.save(booking);
        
        return mapToDTO(booking);
    }
    
    @Override
    @Transactional
    public BookingDTO markNoShow(Long id) {
        Booking booking = getBookingEntity(id);
        
        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new BadRequestException("Chỉ có thể đánh dấu không đến cho lịch hẹn đã xác nhận");
        }
        
        booking.setStatus(Booking.BookingStatus.NO_SHOW);
        booking = bookingRepository.save(booking);
        
        return mapToDTO(booking);
    }
    
    @Override
    @Transactional
    public BookingDTO assignStaff(Long id, Long staffId) {
        Booking booking = getBookingEntity(id);
        
        User staff = userRepository.findById(staffId)
            .orElseThrow(() -> new ResourceNotFoundException("Nhân viên không tồn tại"));
        
        if (staff.getRole() != User.Role.STAFF && staff.getRole() != User.Role.ADMIN) {
            throw new BadRequestException("User không phải nhân viên");
        }
        
        booking.setStaff(staff);
        booking = bookingRepository.save(booking);
        
        return mapToDTO(booking);
    }
    
    private Booking getBookingEntity(Long id) {
        return bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Lịch hẹn không tồn tại"));
    }
    
    private void validateStatusTransition(Booking.BookingStatus current, Booking.BookingStatus next) {
        boolean valid = switch (current) {
            case PENDING -> next == Booking.BookingStatus.CONFIRMED || 
                           next == Booking.BookingStatus.CANCELLED;
            case CONFIRMED -> next == Booking.BookingStatus.IN_PROGRESS || 
                             next == Booking.BookingStatus.CANCELLED ||
                             next == Booking.BookingStatus.NO_SHOW;
            case IN_PROGRESS -> next == Booking.BookingStatus.COMPLETED;
            default -> false;
        };
        
        if (!valid) {
            throw new BadRequestException("Không thể chuyển trạng thái từ " + current + " sang " + next);
        }
    }
    
    private BigDecimal getServicePrice(SpaService service, Pet pet) {
        if (service.getPricingList() == null || service.getPricingList().isEmpty()) {
            throw new BadRequestException("Dịch vụ chưa có bảng giá");
        }
        
        // Find price based on pet weight
        return service.getPriceForWeight(pet.getWeight());
    }
    
    private String generateBookingCode() {
        return "BK" + System.currentTimeMillis() + 
            UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("Chưa đăng nhập");
        }
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return userRepository.findById(userPrincipal.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
    
    private BookingDTO mapToDTO(Booking booking) {
        return BookingDTO.builder()
            .id(booking.getId())
            .bookingCode(booking.getBookingCode())
            .userId(booking.getUser().getId())
            .userName(booking.getUser().getFullName())
            .userPhone(booking.getUser().getPhone())
            .userEmail(booking.getUser().getEmail())
            .petId(booking.getPet().getId())
            .petName(booking.getPet().getName())
            .petType(booking.getPet().getType() != null ? booking.getPet().getType().name() : null)
            .petWeight(booking.getPet().getWeight())
            .serviceId(booking.getService().getId())
            .serviceName(booking.getService().getName())
            .duration(booking.getService().getDuration())
            .bookingDate(booking.getBookingDate())
            .startTime(booking.getStartTime())
            .endTime(booking.getEndTime())
            .status(booking.getStatus())
            .price(booking.getPrice())
            .customerNote(booking.getCustomerNote())
            .staffNote(booking.getStaffNote())
            .cancelReason(booking.getCancelReason())
            .staffId(booking.getStaff() != null ? booking.getStaff().getId() : null)
            .staffName(booking.getStaff() != null ? booking.getStaff().getFullName() : null)
            .confirmedAt(booking.getConfirmedAt())
            .completedAt(booking.getCompletedAt())
            .createdAt(booking.getCreatedAt())
            .build();
    }
}
