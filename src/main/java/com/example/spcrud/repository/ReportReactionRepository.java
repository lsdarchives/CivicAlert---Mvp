package com.example.spcrud.repository;

import com.example.spcrud.entity.ReportReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import com.example.spcrud.entity.AppUser;

public interface ReportReactionRepository
        extends JpaRepository<ReportReaction, Long> {

    List<ReportReaction> findByReport_Id(Long reportId);

    Optional<ReportReaction> findByReport_IdAndUser_Id(
            Long reportId, Long userId);

    long countByReport_IdAndReactionType(Long reportId, String reactionType);

    void deleteByUser(com.example.spcrud.entity.AppUser user);
}
