package com.example.spcrud.dto;

import com.example.spcrud.entity.ReportComment;
import java.time.LocalDateTime;

public record ReportCommentResponse(
        Long id,
        Long reportId,
        String author,
        String content,
        LocalDateTime createdAt
) {
    public static ReportCommentResponse from(ReportComment comment) {
        return new ReportCommentResponse(
                comment.getId(),
                comment.getReport().getId(),
                comment.getAuthor().getEmail(),
                comment.getContent(),
                comment.getCreatedAt()
        );
    }
}

