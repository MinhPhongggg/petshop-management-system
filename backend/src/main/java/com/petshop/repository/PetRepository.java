package com.petshop.repository;

import com.petshop.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {
    
    List<Pet> findByOwnerIdAndActiveOrderByCreatedAtDesc(Long ownerId, Boolean active);
    
    List<Pet> findByOwnerId(Long ownerId);
    
    Optional<Pet> findByIdAndOwnerId(Long id, Long ownerId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Pet p WHERE p.id = :id")
    Optional<Pet> findByIdForUpdate(@Param("id") Long id);

    @Query("SELECT p.type, COUNT(p) FROM Pet p WHERE p.active = true GROUP BY p.type")
    List<Object[]> countByPetType();

    @Query("SELECT COUNT(p) FROM Pet p WHERE p.active = true")
    Long countAllPets();

    @Query("SELECT p FROM Pet p WHERE p.birthday IS NOT NULL AND MONTH(p.birthday) = :month AND DAY(p.birthday) = :day")
    List<Pet> findPetsWithBirthdayOn(@Param("month") int month, @Param("day") int day);
    
    Long countByOwnerId(Long ownerId);
}
