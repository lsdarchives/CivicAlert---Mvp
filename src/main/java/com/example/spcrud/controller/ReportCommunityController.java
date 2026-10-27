
package com.example.spcrud.controller;

import com.example.spcrud.dto.ReportCommentResponse;
import com.example.spcrud.entity.AppUser;
import com.example.spcrud.entity.ReportComment;
import com.example.spcrud.entity.ReportReaction;
import com.example.spcrud.entity.ServiceReport;
import com.example.spcrud.repository.AppUserRepository;
import com.example.spcrud.repository.ReportCommentRepository;
import com.example.spcrud.repository.ReportReactionRepository;
import com.example.spcrud.repository.ServiceReportRepository;

import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/reports/{reportId}")
public class ReportCommunityController {

    private final ServiceReportRepository reportRepository;
    private final AppUserRepository userRepository;
    private final ReportCommentRepository commentRepository;
    private final ReportReactionRepository reactionRepository;

    public ReportCommunityController(
            ServiceReportRepository reportRepository,
            AppUserRepository userRepository,
            ReportCommentRepository commentRepository,
            ReportReactionRepository reactionRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.reactionRepository = reactionRepository;
    }

    private AppUser findUser(Jwt jwt) {
        if (jwt == null) {
            return null;
        }

        return userRepository
                .findByEmailIgnoreCase(jwt.getSubject())
                .orElse(null);
    }

    @GetMapping("/comments")
    @Transactional
    public ResponseEntity<?> getComments(
            @PathVariable Long reportId) {

        if (!reportRepository.existsById(reportId)) {
            return ResponseEntity.notFound().build();
        }

        List<ReportCommentResponse> comments =
                commentRepository
                        .findByReport_IdOrderByCreatedAtAsc(reportId)
                        .stream()
                        .map(ReportCommentResponse::from)
                        .toList();

        return ResponseEntity.ok(comments);
    }

    @PostMapping("/comments")
    @Transactional
    public ResponseEntity<?> addComment(
            @PathVariable Long reportId,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal Jwt jwt) {

        AppUser user = findUser(jwt);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authenticated user not found."));
        }

        String content = body == null ? null : body.get("content");

        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Comment cannot be empty."));
        }

        content = content.trim();

        if (content.length() > 2000) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error",
                            "Comment must be 2000 characters or fewer."));
        }

        ServiceReport report = reportRepository.findById(reportId)
                .orElse(null);

        if (report == null) {
            return ResponseEntity.notFound().build();
        }

        ReportComment comment = new ReportComment();
        comment.setReport(report);
        comment.setAuthor(user);
        comment.setContent(content);

        ReportComment saved = commentRepository.save(comment);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ReportCommentResponse.from(saved));
    }

    @GetMapping("/reactions")
    @Transactional
    public ResponseEntity<?> getReactions(
            @PathVariable Long reportId,
            @AuthenticationPrincipal Jwt jwt) {

        if (!reportRepository.existsById(reportId)) {
            return ResponseEntity.notFound().build();
        }

        AppUser user = findUser(jwt);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authenticated user not found."));
        }

        Map<String, Long> counts = new LinkedHashMap<>();
        counts.put("LIKE",
                reactionRepository.countByReport_IdAndReactionType(
                        reportId, "LIKE"));
        counts.put("SUPPORT",
                reactionRepository.countByReport_IdAndReactionType(
                        reportId, "SUPPORT"));
        counts.put("IMPORTANT",
                reactionRepository.countByReport_IdAndReactionType(
                        reportId, "IMPORTANT"));

        String myReaction = reactionRepository
                .findByReport_IdAndUser_Id(reportId, user.getId())
                .map(ReportReaction::getReactionType)
                .orElse(null);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("counts", counts);
        result.put("myReaction", myReaction);

        return ResponseEntity.ok(result);
    }

    @PutMapping("/reactions")
    @Transactional
    public ResponseEntity<?> setReaction(
            @PathVariable Long reportId,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal Jwt jwt) {

        AppUser user = findUser(jwt);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authenticated user not found."));
        }

        ServiceReport report = reportRepository.findById(reportId)
                .orElse(null);

        if (report == null) {
            return ResponseEntity.notFound().build();
        }

        String type = body == null ? null : body.get("reactionType");
        type = type == null ? "" : type.trim().toUpperCase(Locale.ROOT);

        if (!List.of("LIKE", "SUPPORT", "IMPORTANT").contains(type)) {
            return ResponseEntity.badRequest().body(
                    Map.of("error",
                            "Choose LIKE, SUPPORT or IMPORTANT."));
        }

        ReportReaction reaction = reactionRepository
                .findByReport_IdAndUser_Id(reportId, user.getId())
                .orElseGet(ReportReaction::new);

        reaction.setReport(report);
        reaction.setUser(user);
        reaction.setReactionType(type);
        reactionRepository.save(reaction);

        return ResponseEntity.ok(Map.of(
                "reportId", reportId,
                "reactionType", type,
                "message", "Reaction saved."
        ));
    }

    @DeleteMapping("/reactions")
    @Transactional
    public ResponseEntity<?> removeReaction(
            @PathVariable Long reportId,
            @AuthenticationPrincipal Jwt jwt) {

        AppUser user = findUser(jwt);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authenticated user not found."));
        }

        if (!reportRepository.existsById(reportId)) {
            return ResponseEntity.notFound().build();
        }

        reactionRepository
                .findByReport_IdAndUser_Id(reportId, user.getId())
                .ifPresent(reactionRepository::delete);

        return ResponseEntity.noContent().build();
    }
}
