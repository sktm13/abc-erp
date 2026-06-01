package org.yujin.backend.config.seed;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.IntStream;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.yujin.backend.member.domain.Member;
import org.yujin.backend.worklog.domain.WorkLog;
import org.yujin.backend.worklog.domain.WorkLogStatus;
import org.yujin.backend.worklog.repository.WorkLogRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Log4j2
public class WorkLogSeedService {

    private final WorkLogRepository workLogRepository;

    @Transactional
    public List<WorkLog> seedIfNeeded(
            List<Member> members
    ) {

        if (workLogRepository.count() > 0) {
            log.info("초기 근무일지 데이터가 이미 존재합니다. 근무일지 생성을 건너뜁니다.");
            return workLogRepository.findAll();
        }

        return seed(members);
    }

    private List<WorkLog> seed(
            List<Member> members
    ) {

        log.info("초기 근무일지 데이터를 생성합니다.");

        LocalDate previousWeekMonday =
                getPreviousWeekMonday();

        List<LocalDate> workDates =
                IntStream.range(0, 5)
                        .mapToObj(previousWeekMonday::plusDays)
                        .toList();

        List<Member> sortedMembers =
                members.stream()
                        .sorted(Comparator.comparing(Member::getEmployeeNo))
                        .toList();

        List<WorkLog> workLogs =
                sortedMembers.stream()
                        .flatMap(member ->
                                IntStream.range(0, workDates.size())
                                        .mapToObj(dayIndex ->
                                                createWorkLog(
                                                        member,
                                                        workDates.get(dayIndex),
                                                        dayIndex
                                                )
                                        )
                        )
                        .toList();

        List<WorkLog> savedWorkLogs =
                workLogRepository.saveAll(workLogs);

        log.info(
                "초기 근무일지 데이터 생성 완료. 기준 주 시작일={}, 총 {}건",
                previousWeekMonday,
                savedWorkLogs.size()
        );

        return savedWorkLogs;
    }

    private WorkLog createWorkLog(
            Member member,
            LocalDate workDate,
            int dayIndex
    ) {

        int employeeOffset =
                Math.abs(member.getEmployeeNo().hashCode()) % 15;

        LocalDateTime startTime =
                LocalDateTime.of(
                        workDate,
                        LocalTime.of(9, employeeOffset)
                );

        LocalDateTime endTime =
                LocalDateTime.of(
                        workDate,
                        LocalTime.of(18, 0)
                ).plusMinutes(dayIndex * 5L);

        int workMinutes =
                (int) java.time.Duration.between(
                        startTime,
                        endTime
                ).toMinutes();

        String content =
                """
                전 주 근무일지 초기 데이터입니다.

                담당 업무:
                - 부서별 업무 진행 상황 확인
                - ERP 시스템 기능 테스트
                - 공지사항 및 메신저 확인
                - 일일 업무 내용 정리
                """;

        return WorkLog.builder()
                .member(member)
                .workDate(workDate)
                .startTime(startTime)
                .endTime(endTime)
                .workMinutes(workMinutes)
                .content(content)
                .status(WorkLogStatus.COMPLETED)
                .build();
    }

    private LocalDate getPreviousWeekMonday() {

        LocalDate today =
                LocalDate.now();

        LocalDate thisWeekMonday =
                today.with(DayOfWeek.MONDAY);

        return thisWeekMonday.minusWeeks(1);
    }
}