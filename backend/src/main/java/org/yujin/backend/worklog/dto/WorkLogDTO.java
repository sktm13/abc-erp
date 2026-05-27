package org.yujin.backend.worklog.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WorkLogDTO {

    private Long id;

    private String employeeNo;

    private String name;

    private String department;

    private LocalDate workDate;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    // 분 단위 근무 시간
    private Integer workMinutes;

    // 화면 표시용 시간
    // ex) 390분 -> 6.5
    private Double workHours;

    private String content;

    private String status;
}