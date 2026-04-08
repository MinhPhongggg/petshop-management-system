package com.petshop.repository;

import com.petshop.entity.BookingTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingTransactionRepository extends JpaRepository<BookingTransaction, Long> {

    Optional<BookingTransaction> findByOrderId(String orderId);

    List<BookingTransaction> findByBookingIdOrderByCreatedAtDesc(Long bookingId);

    boolean existsByOrderId(String orderId);

    Optional<BookingTransaction> findFirstByBookingIdAndStatusOrderByCreatedAtDesc(Long bookingId, BookingTransaction.TransactionStatus status);
}
