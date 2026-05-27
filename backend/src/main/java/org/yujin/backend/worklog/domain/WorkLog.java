package org.yujin.backend.worklog.domain;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.yujin.backend.member.domain.Member;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "work_log")
public class WorkLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 근무자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_employee_no")
    private Member member;

    // 근무 날짜
    private LocalDate workDate;

    // 근무 시작 시각
    private LocalDateTime startTime;

    // 근무 종료 시각
    private LocalDateTime endTime;

    // 근무 시간. 분 단위 저장.
    // ex) 6시간 30분 = 390
    private Integer workMinutes;

    // 근무 내용
    @Column(columnDefinition = "TEXT")
    private String content;

    // WORKING / COMPLETED
    @Enumerated(EnumType.STRING)
    private WorkLogStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void completeWork(
            LocalDateTime endTime,
            Integer workMinutes,
            String content
    ) {
        this.endTime = endTime;
        this.workMinutes = workMinutes;
        this.content = content;
        this.status = WorkLogStatus.COMPLETED;
    }
}