package com.petshop.repository;

import com.petshop.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {
    
    List<Pet> findByOwnerIdAndActiveOrderByCreatedAtDesc(Long ownerId, Boolean active);
    
    List<Pet> findByOwnerId(Long ownerId);
    
    Optional<Pet> findByIdAndOwnerId(Long id, Long ownerId);
    
    Long countByOwnerId(Long ownerId);
}
