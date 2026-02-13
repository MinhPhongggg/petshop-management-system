package com.petshop.repository;

import com.petshop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    boolean existsByPhone(String phone);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'CUSTOMER'")
    long countCustomers();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'CUSTOMER' " +
           "AND u.createdAt BETWEEN :startDate AND :endDate")
    long countNewCustomers(@Param("startDate") LocalDateTime startDate,
                           @Param("endDate") LocalDateTime endDate);
}
