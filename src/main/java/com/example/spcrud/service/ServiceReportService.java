
package com.example.spcrud.service;

import com.example.spcrud.entity.ServiceReport;
import com.example.spcrud.repository.ServiceReportRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ServiceReportService {

    private final ServiceReportRepository repository;

    public ServiceReportService(ServiceReportRepository repository) {
        this.repository = repository;
    }

    public List<ServiceReport> getAllReports() {
        return repository.findAll();
    }

    public List<ServiceReport> getReportsByUserId(Long userId) {
        return repository.findBySubmittedBy_Id(userId);
    }

    public Optional<ServiceReport> getReportById(Long id) {
        return repository.findById(id);
    }

    public ServiceReport saveReport(ServiceReport report) {
        return repository.save(report);
    }

    public void deleteReport(Long id) {
        repository.deleteById(id);
    }
}