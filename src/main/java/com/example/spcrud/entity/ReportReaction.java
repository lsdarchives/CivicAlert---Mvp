
package com.example.spcrud.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "report_reactions",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_report_reaction_user",
                columnNames = {"report_id", "user_id"}
        )
)
public class ReportReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String reactionType;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "report_id", nullable = false)
    private ServiceReport report;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    public ReportReaction() {}

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }

    public String getReactionType() { return reactionType; }
    public void setReactionType(String reactionType) {
        this.reactionType = reactionType;
    }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public ServiceReport getReport() { return report; }
    public void setReport(ServiceReport report) {
        this.report = report;
    }

    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }
}
