package com.multipurpose.app.repository;

import com.multipurpose.app.model.ConversionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversionHistoryRepository extends JpaRepository<ConversionHistory, Long> {

    List<ConversionHistory> findTop20ByOrderByCreatedAtDesc();

    long countByConversionType(String conversionType);

    long countByStatus(String status);

    @Query("SELECT ch.conversionType, COUNT(ch) FROM ConversionHistory ch GROUP BY ch.conversionType ORDER BY COUNT(ch) DESC")
    List<Object[]> countByConversionTypeGrouped();
}
