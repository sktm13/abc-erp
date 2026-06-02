package org.yujin.backend.member.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MemberResponseDTO {

    private String employeeNo;

    private String email;

    private String name;

    private String department;

    private String status;

    private String presenceStatus;
    
    private List<String> roleNames;
}