package org.yujin.backend.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatEmployeeDTO {

    private String employeeNo;

    private String name;

    private String department;

    private String departmentName;

    private String presenceStatus;

    private String highestRole;
}