package com.petshop.service.impl;

import com.petshop.dto.request.SpaServiceRequest;
import com.petshop.dto.response.ServicePricingDTO;
import com.petshop.dto.response.SpaServiceDTO;
import com.petshop.entity.Category;
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

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SpaServiceServiceImpl implements SpaServiceService {
    
    private final SpaServiceRepository spaServiceRepository;
    private final ServicePricingRepository servicePricingRepository;
    
    private String generateSlug(String name) {
        String slug = name.toLowerCase()
            .replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a")
            .replaceAll("[èéẹẻẽêềếệểễ]", "e")
            .replaceAll("[ìíịỉĩ]", "i")
            .replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o")
            .replaceAll("[ùúụủũưừứựửữ]", "u")
            .replaceAll("[ỳýỵỷỹ]", "y")
            .replaceAll("[đ]", "d")
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("[\\s]+", "-")
            .replaceAll("-+", "-")
            .replaceAll("^-|-$", "");
        return slug;
    }
    
    @Override
    @Transactional
    public SpaServiceDTO createService(SpaServiceRequest request) {
        // Auto-generate slug from name if not provided
        String slug = (request.getSlug() != null && !request.getSlug().isBlank()) 
            ? request.getSlug() 
            : generateSlug(request.getName());
        
        // Ensure unique slug
        String baseSlug = slug;
        int counter = 1;
        while (spaServiceRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }
        
        SpaService service = SpaService.builder()
            .name(request.getName())
            .slug(slug)
            .description(request.getDescription())
            .imageUrl(request.getImage())
            .duration(request.getDuration())
            .petType(request.getPetType() != null ? request.getPetType() : Category.PetType.ALL)
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
        
        // Auto-generate slug from name if not provided
        String slug = (request.getSlug() != null && !request.getSlug().isBlank()) 
            ? request.getSlug() 
            : generateSlug(request.getName());
        
        if (!service.getSlug().equals(slug) && 
            spaServiceRepository.existsBySlug(slug)) {
            throw new BadRequestException("Slug đã tồn tại");
        }
        
        service.setName(request.getName());
        service.setSlug(slug);
        service.setDescription(request.getDescription());
        service.setImageUrl(request.getImage());
        service.setDuration(request.getDuration());
        if (request.getPetType() != null) {
            service.setPetType(request.getPetType());
        }
        if (request.getActive() != null) {
            service.setActive(request.getActive());
        }
        
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
    public SpaServiceDTO toggleActive(Long id) {
        SpaService service = spaServiceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Dịch vụ không tồn tại"));
        service.setActive(!service.getActive());
        service = spaServiceRepository.save(service);
        return mapToDTO(service);
    }
    
    @Override
    @Transactional
    public void deleteService(Long id) {
        SpaService service = spaServiceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Dịch vụ không tồn tại"));
        
        // Kiểm tra có booking liên quan không
        if (service.getBookings() != null && !service.getBookings().isEmpty()) {
            // Có booking -> soft delete để giữ lịch sử
            service.setActive(false);
            spaServiceRepository.save(service);
        } else {
            // Không có booking -> xóa hoàn toàn
            servicePricingRepository.deleteAll(service.getPricingList());
            spaServiceRepository.delete(service);
        }
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
        BigDecimal minPrice = null;
        BigDecimal maxPrice = null;
        
        if (service.getPricingList() != null && !service.getPricingList().isEmpty()) {
            pricingDTOs = service.getPricingList().stream()
                .map(p -> ServicePricingDTO.builder()
                    .id(p.getId())
                    .tierName(p.getPetType() != null ? p.getPetType().name() : null)
                    .minWeight(p.getMinWeight())
                    .maxWeight(p.getMaxWeight())
                    .price(p.getPrice())
                    .build())
                .collect(Collectors.toList());
            
            minPrice = service.getPricingList().stream()
                .map(ServicePricing::getPrice)
                .min(BigDecimal::compareTo)
                .orElse(null);
            maxPrice = service.getPricingList().stream()
                .map(ServicePricing::getPrice)
                .max(BigDecimal::compareTo)
                .orElse(null);
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
            .minPrice(minPrice)
            .maxPrice(maxPrice)
            .createdAt(service.getCreatedAt())
            .build();
    }
}
