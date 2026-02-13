package com.petshop.service;

import com.petshop.dto.request.SpaServiceRequest;
import com.petshop.dto.response.SpaServiceDTO;

import java.util.List;

public interface SpaServiceService {
    
    // CRUD
    SpaServiceDTO createService(SpaServiceRequest request);
    SpaServiceDTO updateService(Long id, SpaServiceRequest request);
    void deleteService(Long id);
    SpaServiceDTO getServiceById(Long id);
    SpaServiceDTO getServiceBySlug(String slug);
    
    // Danh sách dịch vụ
    List<SpaServiceDTO> getAllServices();
    List<SpaServiceDTO> getActiveServices();
}
