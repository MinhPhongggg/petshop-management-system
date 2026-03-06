package com.petshop.repository;

import com.petshop.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {
    
    List<Pet> findByOwnerIdAndActiveOrderByCreatedAtDesc(Long ownerId, Boolean active);
    
    List<Pet> findByOwnerId(Long ownerId);
    
    Optional<Pet> findByIdAndOwnerId(Long id, Long ownerId);
    
    Long countByOwnerId(Long ownerId);

    // Tìm pet có sinh nhật hôm nay (theo tháng, ngày)
    @Query("SELECT p FROM Pet p WHERE p.birthday IS NOT NULL " +
           "AND FUNCTION('MONTH', p.birthday) = :month " +
           "AND FUNCTION('DAY', p.birthday) = :day " +
           "AND p.active = true")
    List<Pet> findPetsWithBirthdayOn(@Param("month") int month, @Param("day") int day);
    
    // ==================== ANALYTICS QUERIES ====================
    
    // Phân loại giống loài
    @Query(value = "SELECT type, COUNT(*) as cnt FROM pets GROUP BY type ORDER BY cnt DESC", nativeQuery = true)
    List<Object[]> countByPetType();
    
    // Tổng số pet
    @Query("SELECT COUNT(p) FROM Pet p")
    Long countAllPets();
}
