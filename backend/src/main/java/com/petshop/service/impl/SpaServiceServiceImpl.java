package com.petshop.service.impl;

import com.petshop.dto.request.SpaServiceRequest;
import com.petshop.dto.response.ServicePricingDTO;
import com.petshop.dto.response.SpaServiceDTO;
import com.petshop.entity.ServicePricing;
import com.petshop.entity.SpaService;
import com.petshop.exception.BadRequestException;
import com.petshop.exception.ResourceNotFoundException;
import com.petshop.repository.ServicePricingRepository;
import com.petshop.repository.SpaServiceRepository;
import com.petshop.service.SpaServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SpaServiceServiceImpl implements SpaServiceService {
    
    private final SpaServiceRepository spaServiceRepository;
    private final ServicePricingRepository servicePricingRepository;
    
    @Override
    @Transactional
    public SpaServiceDTO createService(SpaServiceRequest request) {
        if (spaServiceRepository.existsBySlug(request.getSlug())) {
            throw new BadRequestException("Slug đã tồn tại");
        }
        
        SpaService service = SpaService.builder()
            .name(request.getName())
            .slug(request.getSlug())
            .description(request.getDescription())
            .imageUrl(request.getImage())
            .duration(request.getDuration())
            .active(true)
            .build();
        
        service = spaServiceRepository.save(service);
        
        // Add pricings
        if (request.getPricings() != null && !request.getPricings().isEmpty()) {
            SpaService finalService = service;
            List<ServicePricing> pricings = request.getPricings().stream()
                .map(p -> ServicePricing.builder()
                    .service(finalService)
                    .petType(p.getPetType())
                    .minWeight(p.getMinWeight())
                    .maxWeight(p.getMaxWeight())
                    .price(p.getPrice())
                    .build())
                .collect(Collectors.toList());
            servicePricingRepository.saveAll(pricings);
            service.getPricingList().addAll(pricings);
        }
        
        return mapToDTO(service);
    }
    
    @Override
    @Transactional
    public SpaServiceDTO updateService(Long id, SpaServiceRequest request) {
        SpaService service = spaServiceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Dịch vụ không tồn tại"));
        
        if (!service.getSlug().equals(request.getSlug()) && 
            spaServiceRepository.existsBySlug(request.getSlug())) {
            throw new BadRequestException("Slug đã tồn tại");
        }
        
        service.setName(request.getName());
        service.setSlug(request.getSlug());
        service.setDescription(request.getDescription());
        service.setImageUrl(request.getImage());
        service.setDuration(request.getDuration());
        
        // Update pricings - delete old and add new
        if (request.getPricings() != null) {
            servicePricingRepository.deleteAll(service.getPricingList());
            service.getPricingList().clear();
            
            SpaService finalService = service;
            List<ServicePricing> newPricings = request.getPricings().stream()
                .map(p -> ServicePricing.builder()
                    .service(finalService)
                    .petType(p.getPetType())
                    .minWeight(p.getMinWeight())
                    .maxWeight(p.getMaxWeight())
                    .price(p.getPrice())
                    .build())
                .collect(Collectors.toList());
            servicePricingRepository.saveAll(newPricings);
            service.getPricingList().addAll(newPricings);
        }
        
        service = spaServiceRepository.save(service);
        return mapToDTO(service);
    }
    
    @Override
    @Transactional
    public void deleteService(Long id) {
        SpaService service = spaServiceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Dịch vụ không tồn tại"));
        
        // Soft delete
        service.setActive(false);
        spaServiceRepository.save(service);
    }
    
    @Override
    public SpaServiceDTO getServiceById(Long id) {
        SpaService service = spaServiceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Dịch vụ không tồn tại"));
        return mapToDTO(service);
    }
    
    @Override
    public SpaServiceDTO getServiceBySlug(String slug) {
        SpaService service = spaServiceRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Dịch vụ không tồn tại"));
        return mapToDTO(service);
    }
    
    @Override
    public List<SpaServiceDTO> getAllServices() {
        return spaServiceRepository.findAll().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<SpaServiceDTO> getActiveServices() {
        return spaServiceRepository.findByActiveOrderByDisplayOrderAsc(true).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    private SpaServiceDTO mapToDTO(SpaService service) {
        List<ServicePricingDTO> pricingDTOs = new ArrayList<>();
        if (service.getPricingList() != null) {
            pricingDTOs = service.getPricingList().stream()
                .map(p -> ServicePricingDTO.builder()
                    .id(p.getId())
                    .tierName(p.getPetType() != null ? p.getPetType().name() : null)
                    .minWeight(p.getMinWeight())
                    .maxWeight(p.getMaxWeight())
                    .price(p.getPrice())
                    .build())
                .collect(Collectors.toList());
        }
        
        return SpaServiceDTO.builder()
            .id(service.getId())
            .name(service.getName())
            .slug(service.getSlug())
            .description(service.getDescription())
            .imageUrl(service.getImageUrl())
            .duration(service.getDuration())
            .petType(service.getPetType())
            .displayOrder(service.getDisplayOrder())
            .active(service.getActive())
            .pricingList(pricingDTOs)
            .createdAt(service.getCreatedAt())
            .build();
    }
}
