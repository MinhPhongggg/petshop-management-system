package com.petshop.repository;

import com.petshop.entity.SpaService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpaServiceRepository extends JpaRepository<SpaService, Long> {
    
    Optional<SpaService> findBySlug(String slug);
    
    List<SpaService> findByActiveOrderByDisplayOrderAsc(Boolean active);
    
    boolean existsBySlug(String slug);
}
