package com.example.spcrud.repository;

import com.example.spcrud.entity.ServiceReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.spcrud.entity.AppUser;
import java.util.List;

@Repository
public interface ServiceReportRepository
        extends JpaRepository<ServiceReport, Long> {

    List<ServiceReport> findBySubmittedBy_Id(Long userId);

    List<ServiceReport> findAllByOrderByCreatedAtDesc();

    List<ServiceReport> findBySubmittedBy(AppUser submittedBy);
}
