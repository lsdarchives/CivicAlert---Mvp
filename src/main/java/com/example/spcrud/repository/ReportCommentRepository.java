package com.example.spcrud.repository;

import com.example.spcrud.entity.ReportComment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import com.example.spcrud.entity.AppUser;

public interface ReportCommentRepository
        extends JpaRepository<ReportComment, Long> {

    List<ReportComment> findByReport_IdOrderByCreatedAtAsc(Long reportId);

    void deleteByAuthor(com.example.spcrud.entity.AppUser author);
}
