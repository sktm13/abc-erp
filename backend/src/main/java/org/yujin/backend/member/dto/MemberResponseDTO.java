package org.yujin.backend.member.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class MemberResponseDTO {

    private String employeeNo;

    private String email;

    private String name;

    private String department;

    private String status;

    private String presenceStatus;
    
    private List<String> roleNames;
}