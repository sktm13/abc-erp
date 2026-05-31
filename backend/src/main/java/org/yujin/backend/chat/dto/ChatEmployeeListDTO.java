package org.yujin.backend.chat.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatEmployeeListDTO {

    // 로그인한 사용자 정보
    private ChatEmployeeDTO me;

    // 부서별 사원 목록
    private List<ChatDepartmentDTO> departments;
}