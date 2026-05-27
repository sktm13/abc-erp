package org.yujin.backend.worklog.service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.yujin.backend.member.domain.Member;
import org.yujin.backend.member.repository.MemberRepository;
import org.yujin.backend.worklog.domain.WorkLog;
import org.yujin.backend.worklog.domain.WorkLogStatus;
import org.yujin.backend.worklog.dto.WorkLogCurrentResponseDTO;
import org.yujin.backend.worklog.dto.WorkLogDTO;
import org.yujin.backend.worklog.dto.WorkLogEndRequestDTO;
import org.yujin.backend.worklog.repository.WorkLogRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkLogServiceImpl implements WorkLogService {

    private final WorkLogRepository workLogRepository;

    private final MemberRepository memberRepository;

    @Override
    public WorkLogCurrentResponseDTO startWork(String employeeNo) {

        Member member = memberRepository.findById(employeeNo)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 사원입니다."));

        // 이미 근무 중인 기록이 있으면 다시 시작 불가
        workLogRepository.findByMemberAndStatus(member, WorkLogStatus.WORKING)
                .ifPresent(workLog -> {
                    throw new RuntimeException("이미 근무 시작 상태입니다.");
                });

        LocalDateTime now = LocalDateTime.now();

        WorkLog workLog = WorkLog.builder()
                .member(member)
                .workDate(now.toLocalDate())
                .startTime(now)
                .status(WorkLogStatus.WORKING)
                .build();

        WorkLog savedWorkLog = workLogRepository.save(workLog);

        return WorkLogCurrentResponseDTO.builder()
                .working(true)
                .workLogId(savedWorkLog.getId())
                .startTime(savedWorkLog.getStartTime())
                .build();
    }

    @Override
    public WorkLogDTO endWork(
            String employeeNo,
            WorkLogEndRequestDTO requestDTO
    ) {

        Member member = memberRepository.findById(employeeNo)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 사원입니다."));

        WorkLog workLog = workLogRepository.findByMemberAndStatus(
                        member,
                        WorkLogStatus.WORKING
                )
                .orElseThrow(() -> new RuntimeException("근무 시작 기록이 없습니다."));

        if (requestDTO.getContent() == null || requestDTO.getContent().isBlank()) {
            throw new RuntimeException("근무 내용을 입력해주세요.");
        }

        LocalDateTime endTime = LocalDateTime.now();

        long minutes = Duration.between(
                workLog.getStartTime(),
                endTime
        ).toMinutes();

        workLog.completeWork(
                endTime,
                (int) minutes,
                requestDTO.getContent()
        );

        return entityToDTO(workLog);
    }

    @Override
    @Transactional(readOnly = true)
    public WorkLogCurrentResponseDTO getCurrentWorkStatus(String employeeNo) {

        Member member = memberRepository.findById(employeeNo)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 사원입니다."));

        return workLogRepository.findByMemberAndStatus(member, WorkLogStatus.WORKING)
                .map(workLog ->
                        WorkLogCurrentResponseDTO.builder()
                                .working(true)
                                .workLogId(workLog.getId())
                                .startTime(workLog.getStartTime())
                                .build()
                )
                .orElseGet(() ->
                        WorkLogCurrentResponseDTO.builder()
                                .working(false)
                                .workLogId(null)
                                .startTime(null)
                                .build()
                );
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkLogDTO> getMyWorkLogs(
            String employeeNo,
            int year,
            int month
    ) {

        Member member = memberRepository.findById(employeeNo)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 사원입니다."));

        YearMonth yearMonth = YearMonth.of(year, month);

        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<WorkLog> workLogs =
                workLogRepository.findByMemberAndWorkDateBetweenOrderByWorkDateAscStartTimeAsc(
                        member,
                        startDate,
                        endDate
                );

        return workLogs.stream()
                .map(this::entityToDTO)
                .toList();
    }

    private WorkLogDTO entityToDTO(WorkLog workLog) {

        Integer workMinutes = workLog.getWorkMinutes();

        Double workHours = null;

        if (workMinutes != null) {
            workHours = workMinutes / 60.0;
        }

        return WorkLogDTO.builder()
                .id(workLog.getId())
                .employeeNo(workLog.getMember().getEmployeeNo())
                .name(workLog.getMember().getName())
                .department(workLog.getMember().getDepartment())
                .workDate(workLog.getWorkDate())
                .startTime(workLog.getStartTime())
                .endTime(workLog.getEndTime())
                .workMinutes(workMinutes)
                .workHours(workHours)
                .content(workLog.getContent())
                .status(workLog.getStatus().name())
                .build();
    }
}