package org.yujin.backend.worklog.repository;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.yujin.backend.member.domain.Member;
import org.yujin.backend.member.repository.MemberRepository;
import org.yujin.backend.worklog.domain.WorkLog;
import org.yujin.backend.worklog.domain.WorkLogStatus;

import lombok.extern.log4j.Log4j2;

@SpringBootTest
@Log4j2
public class WorkLogRepositoryTest {

    @Autowired
    private WorkLogRepository workLogRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Test
    public void insertWorkLogTestData() {

        // 반복 실행 시 중복 데이터가 쌓이지 않도록 기존 근무일지 삭제
        workLogRepository.deleteAll();

        List<Member> members = memberRepository.findAll();

        List<WorkLog> workLogs = new ArrayList<>();

        for (Member member : members) {

            // 2026년 4월 테스트 데이터 3개
            workLogs.add(createCompletedWorkLog(
                    member,
                    LocalDate.of(2026, 4, 3),
                    9,
                    0,
                    17,
                    30,
                    "4월 1차 근무일지 테스트 데이터입니다."
            ));

            workLogs.add(createCompletedWorkLog(
                    member,
                    LocalDate.of(2026, 4, 12),
                    10,
                    0,
                    18,
                    0,
                    "4월 2차 근무일지 테스트 데이터입니다."
            ));

            workLogs.add(createCompletedWorkLog(
                    member,
                    LocalDate.of(2026, 4, 24),
                    9,
                    30,
                    16,
                    30,
                    "4월 3차 근무일지 테스트 데이터입니다."
            ));

            // 2026년 5월 테스트 데이터 3개
            workLogs.add(createCompletedWorkLog(
                    member,
                    LocalDate.of(2026, 5, 5),
                    9,
                    0,
                    17,
                    0,
                    "5월 1차 근무일지 테스트 데이터입니다."
            ));

            workLogs.add(createCompletedWorkLog(
                    member,
                    LocalDate.of(2026, 5, 16),
                    13,
                    0,
                    18,
                    30,
                    "5월 2차 근무일지 테스트 데이터입니다."
            ));

            workLogs.add(createCompletedWorkLog(
                    member,
                    LocalDate.of(2026, 5, 27),
                    9,
                    30,
                    18,
                    0,
                    "5월 3차 근무일지 테스트 데이터입니다."
            ));
        }

        workLogRepository.saveAll(workLogs);

        log.info("Inserted WorkLog test data count: {}", workLogs.size());
    }

    private WorkLog createCompletedWorkLog(
            Member member,
            LocalDate workDate,
            int startHour,
            int startMinute,
            int endHour,
            int endMinute,
            String content
    ) {

        LocalDateTime startTime =
                workDate.atTime(startHour, startMinute);

        LocalDateTime endTime =
                workDate.atTime(endHour, endMinute);

        int workMinutes =
                (int) Duration.between(startTime, endTime).toMinutes();

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
}