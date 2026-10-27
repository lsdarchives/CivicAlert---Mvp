package com.example.spcrud.dto;

import com.example.spcrud.entity.ServiceReport;
import java.time.LocalDateTime;

public record CommunityReportResponse(
        Long id,
        String referenceNumber,
        String title,
        String description,
        String category,
        String streetAddress,
        String suburb,
        String status,
        LocalDateTime createdAt
) {
    public static CommunityReportResponse from(ServiceReport report) {
        return new CommunityReportResponse(
                report.getId(),
                report.getReferenceNumber(),
                report.getTitle(),
                report.getDescription(),
                report.getCategory(),
                report.getStreetAddress(),
                report.getSuburb(),
                report.getStatus(),
                report.getCreatedAt()
        );
    }
}