package com.petshop.repository;

import com.petshop.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
    
    Optional<Brand> findBySlug(String slug);
    
    List<Brand> findByActiveOrderByNameAsc(Boolean active);
    
    boolean existsByName(String name);
    
    boolean existsBySlug(String slug);
}
