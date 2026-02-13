package com.petshop.controller;

import com.petshop.dto.request.SpaServiceRequest;
import com.petshop.dto.response.SpaServiceDTO;
import com.petshop.service.SpaServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class SpaServiceController {
    
    private final SpaServiceService spaServiceService;
    
    // Public endpoints
    @GetMapping
    public ResponseEntity<List<SpaServiceDTO>> getActiveServices() {
        return ResponseEntity.ok(spaServiceService.getActiveServices());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<SpaServiceDTO> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(spaServiceService.getServiceById(id));
    }
    
    @GetMapping("/slug/{slug}")
    public ResponseEntity<SpaServiceDTO> getServiceBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(spaServiceService.getServiceBySlug(slug));
    }
    
    // Admin endpoints
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SpaServiceDTO>> getAllServices() {
        return ResponseEntity.ok(spaServiceService.getAllServices());
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SpaServiceDTO> createService(@Valid @RequestBody SpaServiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(spaServiceService.createService(request));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SpaServiceDTO> updateService(@PathVariable Long id, 
                                                        @Valid @RequestBody SpaServiceRequest request) {
        return ResponseEntity.ok(spaServiceService.updateService(id, request));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        spaServiceService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}
