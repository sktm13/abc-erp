package org.yujin.backend.member.dto;

import lombok.Data;

@Data
public class MemberJoinDTO {

    // 관리자가 직원 등록 시 입력
    private String email;

    private String pw;

    private String name;

    // DEV, HR, PUR, FIN, OPS
    private String department;
}