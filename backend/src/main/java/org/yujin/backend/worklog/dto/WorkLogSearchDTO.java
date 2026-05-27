package org.yujin.backend.worklog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WorkLogSearchDTO {

    // 특정 사원 조회
    private String employeeNo;

    // 사번 / 이름 검색용
    private String keyword;

    // 부서 필터
    private String department;

    // 월별 조회
    private Integer year;

    private Integer month;
}