package com.petshop.service;

import com.petshop.dto.response.DashboardDTO;

import java.time.LocalDate;

public interface DashboardService {
    
    // Dashboard tổng hợp
    DashboardDTO getDashboard();
    
    // Thống kê theo khoảng thời gian
    DashboardDTO getDashboard(LocalDate startDate, LocalDate endDate);
}
