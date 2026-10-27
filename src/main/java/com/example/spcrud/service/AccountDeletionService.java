package com.example.spcrud.service;

import com.example.spcrud.entity.AppUser;
import com.example.spcrud.entity.Role;
import com.example.spcrud.entity.ServiceReport;
import com.example.spcrud.repository.AppUserRepository;
import com.example.spcrud.repository.ReportCommentRepository;
import com.example.spcrud.repository.ReportReactionRepository;
import com.example.spcrud.repository.ServiceReportRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountDeletionService {

    private final AppUserRepository userRepository;
    private final ReportCommentRepository commentRepository;
    private final ReportReactionRepository reactionRepository;
    private final ServiceReportRepository reportRepository;
    private final PasswordEncoder passwordEncoder;

    public AccountDeletionService(
            AppUserRepository userRepository,
            ReportCommentRepository commentRepository,
            ReportReactionRepository reactionRepository,
            ServiceReportRepository reportRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.reactionRepository = reactionRepository;
        this.reportRepository = reportRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void deleteAccount(String email, String currentPassword) {
        if (currentPassword == null || currentPassword.isBlank()) {
            throw new IllegalArgumentException(
                    "Enter your current password to delete your account.");
        }

        AppUser user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("Account not found."));

        if (user.getRole() != Role.ROLE_USER) {
            throw new IllegalArgumentException(
                    "Administrator accounts cannot be deleted here.");
        }

        if (!passwordEncoder.matches(
                currentPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException(
                    "The current password is incorrect.");
        }

        // Remove records that require this user to exist.
        commentRepository.deleteByAuthor(user);
        reactionRepository.deleteByUser(user);

        // Preserve service reports and their reference numbers.
        for (ServiceReport report :
                reportRepository.findBySubmittedBy(user)) {
            report.setSubmittedBy(null);
        }

        // Persist the detached reports before removing the user.
        reportRepository.saveAll(
                reportRepository.findBySubmittedBy(user));

        userRepository.delete(user);
    }
}