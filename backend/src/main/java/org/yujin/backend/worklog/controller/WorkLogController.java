package org.yujin.backend.worklog.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.yujin.backend.member.dto.MemberDTO;
import org.yujin.backend.worklog.dto.WorkLogCurrentResponseDTO;
import org.yujin.backend.worklog.dto.WorkLogDTO;
import org.yujin.backend.worklog.dto.WorkLogEndRequestDTO;
import org.yujin.backend.worklog.service.WorkLogService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/worklogs")
public class WorkLogController {

    private final WorkLogService workLogService;

    // 현재 근무 중 여부 조회
    @GetMapping("/current")
    public WorkLogCurrentResponseDTO current(
            @AuthenticationPrincipal MemberDTO memberDTO
    ) {

        return workLogService.getCurrentWorkStatus(
                memberDTO.getUsername()
        );
    }

    // 근무 시작
    @PostMapping("/start")
    public WorkLogCurrentResponseDTO start(
            @AuthenticationPrincipal MemberDTO memberDTO
    ) {

        return workLogService.startWork(
                memberDTO.getUsername()
        );
    }

    // 근무 종료
    @PostMapping("/end")
    public WorkLogDTO end(
            @AuthenticationPrincipal MemberDTO memberDTO,
            @RequestBody WorkLogEndRequestDTO requestDTO
    ) {

        return workLogService.endWork(
                memberDTO.getUsername(),
                requestDTO
        );
    }

    // 내 월별 근무일지 조회
    @GetMapping("/me")
    public List<WorkLogDTO> myWorkLogs(
            @AuthenticationPrincipal MemberDTO memberDTO,
            @RequestParam("year") int year,
            @RequestParam("month") int month
    ) {

        return workLogService.getMyWorkLogs(
                memberDTO.getUsername(),
                year,
                month
        );
    }
}