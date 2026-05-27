package org.yujin.backend.worklog.service;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;
import org.yujin.backend.worklog.dto.WorkLogCurrentResponseDTO;
import org.yujin.backend.worklog.dto.WorkLogDTO;
import org.yujin.backend.worklog.dto.WorkLogEndRequestDTO;

@Transactional
public interface WorkLogService {

        // 근무 시작
        WorkLogCurrentResponseDTO startWork(String employeeNo);

        // 근무 종료
        WorkLogDTO endWork(
                        String employeeNo,
                        WorkLogEndRequestDTO requestDTO);

        // 현재 근무 중 여부 조회
        WorkLogCurrentResponseDTO getCurrentWorkStatus(String employeeNo);

        // 내 월별 근무일지 조회
        List<WorkLogDTO> getMyWorkLogs(
                        String employeeNo,
                        int year,
                        int month);

        // 특정 사원의 월별 근무일지 조회
        List<WorkLogDTO> getMemberWorkLogs(
                        String requesterEmployeeNo,
                        String targetEmployeeNo,
                        int year,
                        int month);
}