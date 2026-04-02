package com.petshop.repository;

import com.petshop.entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    Optional<Supplier> findByCode(String code);

    boolean existsByCode(String code);

    List<Supplier> findByActiveIsTrue();

    @Query("SELECT s FROM Supplier s WHERE " +
           "(:keyword IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%',:keyword,'%')) " +
           "OR LOWER(s.code) LIKE LOWER(CONCAT('%',:keyword,'%')) " +
           "OR LOWER(s.phone) LIKE LOWER(CONCAT('%',:keyword,'%')))")
    Page<Supplier> search(@Param("keyword") String keyword, Pageable pageable);
}
