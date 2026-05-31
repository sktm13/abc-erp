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
public class ChatDepartmentDTO {

    private String department;

    private String departmentName;

    private List<ChatEmployeeDTO> members;
}