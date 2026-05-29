package org.yujin.backend.member.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChangePasswordDTO {

    // 기존 비밀번호
    private String currentPw;

    // 새 비밀번호
    private String newPw;

    // 새 비밀번호 확인
    private String confirmPw;
}