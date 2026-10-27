
package com.example.spcrud.controller;

import com.example.spcrud.dto.CreateReportRequest;
import com.example.spcrud.entity.AppUser;
import com.example.spcrud.entity.ServiceReport;
import com.example.spcrud.repository.AppUserRepository;
import com.example.spcrud.service.ServiceReportService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import com.example.spcrud.dto.CommunityReportResponse;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class ServiceReportController {

    private final ServiceReportService service;
    private final AppUserRepository userRepository;

    public ServiceReportController(
            ServiceReportService service,
            AppUserRepository userRepository) {
        this.service = service;
        this.userRepository = userRepository;
    }

    // Admin: retrieve all reports
    @GetMapping
    public List<ServiceReport> getAllReports() {
        return service.getAllReports();
    }

    // Resident: retrieve only reports belonging to the logged-in user
    @GetMapping("/mine")
    public ResponseEntity<?> getMyReports(
            @AuthenticationPrincipal Jwt jwt) {

        AppUser user = userRepository
                .findByEmailIgnoreCase(jwt.getSubject())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authenticated user not found."));
        }

        return ResponseEntity.ok(
                service.getReportsByUserId(user.getId()));
    }

    // Resident community feed: newest reports first
    @GetMapping("/community")
    public List<CommunityReportResponse> getCommunityReports() {
        return service.getAllReports()
                .stream()
                .map(CommunityReportResponse::from)
                .toList();
    }

    // Retrieve a report by ID
    @GetMapping("/{id}")
    public ResponseEntity<ServiceReport> getReportById(
            @PathVariable Long id) {

        return service.getReportById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create a report for the authenticated user
    @PostMapping
    public ResponseEntity<?> createReport(
            @RequestBody(required = false) CreateReportRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        if (request == null
                || isBlank(request.getTitle())
                || isBlank(request.getDescription())
                || isBlank(request.getCategory())) {

            return ResponseEntity.badRequest().body(
                    Map.of("error",
                            "Title, description and category are required."));
        }

        String title = request.getTitle().trim();
        String description = request.getDescription().trim();
        String category = request.getCategory().trim()
                .toUpperCase(java.util.Locale.ROOT);

        if (title.length() > 255 || description.length() > 2000) {
            return ResponseEntity.badRequest().body(
                    Map.of("error",
                            "Title must be at most 255 characters and "
                                    + "description at most 2000 characters."));
        }

        AppUser user = userRepository
                .findByEmailIgnoreCase(jwt.getSubject())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authenticated user not found."));
        }

        ServiceReport report = new ServiceReport();

        report.setReferenceNumber(
                "CA-" + UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase(java.util.Locale.ROOT));

        report.setTitle(title);
        report.setDescription(description);
        report.setCategory(category);
        report.setStreetAddress(cleanOptional(request.getStreetAddress()));
        report.setSuburb(cleanOptional(request.getSuburb()));
        report.setNearestLandmark(
                cleanOptional(request.getNearestLandmark()));

        // Residents cannot choose their own status or priority.
        report.setStatus("SUBMITTED");
        report.setPriority("MEDIUM");
        report.setSubmittedBy(user);

        ServiceReport savedReport = service.saveReport(report);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savedReport);
    }

    // Admin: update a report
    @PutMapping("/{id}")
    public ResponseEntity<ServiceReport> updateReport(
            @PathVariable Long id,
            @RequestBody ServiceReport details) {

        return service.getReportById(id)
                .map(existing -> {
                    existing.setTitle(details.getTitle());
                    existing.setDescription(details.getDescription());
                    existing.setCategory(details.getCategory());
                    existing.setStreetAddress(details.getStreetAddress());
                    existing.setSuburb(details.getSuburb());
                    existing.setNearestLandmark(
                            details.getNearestLandmark());
                    existing.setStatus(details.getStatus());
                    existing.setPriority(details.getPriority());

                    return ResponseEntity.ok(
                            service.saveReport(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Admin: delete a report
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(
            @PathVariable Long id) {

        if (service.getReportById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        service.deleteReport(id);
        return ResponseEntity.noContent().build();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String cleanOptional(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        return value.trim();
    }
}
