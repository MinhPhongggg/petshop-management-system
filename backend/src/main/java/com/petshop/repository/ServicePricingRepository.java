package com.petshop.repository;

import com.petshop.entity.ServicePricing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServicePricingRepository extends JpaRepository<ServicePricing, Long> {
    
    List<ServicePricing> findByServiceIdOrderByMinWeightAsc(Long serviceId);
    
    void deleteByServiceId(Long serviceId);
}
