package org.yujin.backend.worklog.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.yujin.backend.member.domain.Member;
import org.yujin.backend.worklog.domain.WorkLog;
import org.yujin.backend.worklog.domain.WorkLogStatus;

public interface WorkLogRepository extends JpaRepository<WorkLog, Long> {

    // 현재 근무 중인 기록 조회
    Optional<WorkLog> findByMemberAndStatus(
            Member member,
            WorkLogStatus status
    );

    // 특정 사원의 월별 근무일지 조회
    List<WorkLog> findByMemberAndWorkDateBetweenOrderByWorkDateAscStartTimeAsc(
            Member member,
            LocalDate startDate,
            LocalDate endDate
    );
}