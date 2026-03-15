package com.petshop.service;

import com.petshop.dto.response.AnalyticsDTO;

import java.time.LocalDate;

public interface AnalyticsService {
    
    AnalyticsDTO getFullAnalytics();
    
    AnalyticsDTO getFullAnalytics(LocalDate startDate, LocalDate endDate);
    
    AnalyticsDTO.ServiceAnalytics getServiceAnalytics(LocalDate startDate, LocalDate endDate);
    
    AnalyticsDTO.RetailInventoryAnalytics getRetailInventoryAnalytics();
    
    AnalyticsDTO.PetProfileAnalytics getPetProfileAnalytics();
}
