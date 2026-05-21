package org.yujin.backend.member.dto;

import lombok.Data;
import org.yujin.backend.member.domain.MemberRole;
import org.yujin.backend.member.domain.MemberStatus;

import java.util.List;

@Data
public class MemberModifyDTO {

    private String email;

    private String pw;

    private String name;

    private String department;

    private MemberStatus status;

    private List<MemberRole> roleList;
}