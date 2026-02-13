package com.petshop.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class BookingRequest {
    
    // Pet ID - optional for guest booking with petInfo
    private Long petId;
    
    @NotNull(message = "Service ID is required")
    private Long serviceId;
    
    @NotNull(message = "Booking date is required")
    private LocalDate bookingDate;
    
    @NotNull(message = "Start time is required")
    private LocalTime startTime;
    
    private String customerNote;
    
    // Guest booking fields
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    
    // Pet info for guest booking (when petId is null)
    private PetInfo petInfo;
    
    @Data
    public static class PetInfo {
        private String name;
        private String type;  // DOG, CAT, etc.
        private String breed;
        private Double weight;
    }
}
