package com.petshop.controller;

import com.petshop.dto.request.BookingRequest;
import com.petshop.dto.response.BookingDTO;
import com.petshop.entity.Booking;
import com.petshop.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
    
    private final BookingService bookingService;
    
    // Customer endpoints
    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(@Valid @RequestBody BookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(request));
    }
    
    @GetMapping("/my-bookings")
    public ResponseEntity<Page<BookingDTO>> getMyBookings(
            @PageableDefault(size = 10, sort = "bookingDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(bookingService.getMyBookings(pageable));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }
    
    @GetMapping("/code/{bookingCode}")
    public ResponseEntity<BookingDTO> getBookingByCode(@PathVariable String bookingCode) {
        return ResponseEntity.ok(bookingService.getBookingByCode(bookingCode));
    }
    
    @PostMapping("/{id}/cancel")
    public ResponseEntity<BookingDTO> cancelBooking(@PathVariable Long id, 
                                                     @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, reason));
    }
    
    @GetMapping("/check-availability")
    public ResponseEntity<Map<String, Boolean>> checkAvailability(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime) {
        boolean available = bookingService.isTimeSlotAvailable(date, startTime, endTime);
        return ResponseEntity.ok(Map.of("available", available));
    }
    
    // Admin/Staff endpoints
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Page<BookingDTO>> getAllBookings(
            @PageableDefault(size = 10, sort = "bookingDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(bookingService.getAllBookings(pageable));
    }
    
    @GetMapping("/date/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<BookingDTO>> getBookingsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(bookingService.getBookingsByDate(date));
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Page<BookingDTO>> getBookingsByStatus(
            @PathVariable String status,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(bookingService.getBookingsByStatus(
            Booking.BookingStatus.valueOf(status.toUpperCase()), pageable));
    }
    
    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<BookingDTO> confirmBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.confirmBooking(id));
    }
    
    @PostMapping("/{id}/start")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<BookingDTO> startBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.startBooking(id));
    }
    
    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<BookingDTO> completeBooking(@PathVariable Long id, 
                                                       @RequestParam(required = false) String staffNote) {
        return ResponseEntity.ok(bookingService.completeBooking(id, staffNote));
    }
    
    @PostMapping("/{id}/admin-cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<BookingDTO> adminCancelBooking(@PathVariable Long id, 
                                                          @RequestParam String reason) {
        return ResponseEntity.ok(bookingService.adminCancelBooking(id, reason));
    }
    
    @PostMapping("/{id}/no-show")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<BookingDTO> markNoShow(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.markNoShow(id));
    }
    
    @PostMapping("/{id}/assign-staff")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<BookingDTO> assignStaff(@PathVariable Long id, 
                                                   @RequestParam Long staffId) {
        return ResponseEntity.ok(bookingService.assignStaff(id, staffId));
    }
}
