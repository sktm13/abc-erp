package org.yujin.backend.member.service;

import org.springframework.transaction.annotation.Transactional;
import org.yujin.backend.common.dto.PageResponseDTO;
import org.yujin.backend.member.domain.Member;
import org.yujin.backend.member.dto.MemberDTO;
import org.yujin.backend.member.dto.MemberJoinDTO;
import org.yujin.backend.member.dto.MemberModifyDTO;
import org.yujin.backend.member.dto.MemberResponseDTO;
import org.yujin.backend.member.dto.MemberSearchDTO;

import java.util.Map;
import java.util.stream.Collectors;

@Transactional
public interface MemberService {

    String join(MemberJoinDTO memberJoinDTO);

    MemberResponseDTO get(String employeeNo);

    void modify(String employeeNo, MemberModifyDTO memberModifyDTO);

    PageResponseDTO<MemberResponseDTO> getList(MemberSearchDTO memberSearchDTO);

    Map<String, Object> refreshToken(String refreshToken);

    default MemberDTO entityToDTO(Member member) {

        return new MemberDTO(
                member.getEmployeeNo(),
                member.getEmail(),
                member.getPw(),
                member.getName(),
                member.getDepartment(),
                member.getStatus().name(),
                member.getMemberRoleList()
                        .stream()
                        .map(role -> role.name())
                        .collect(Collectors.toList()));
    }

    default MemberResponseDTO entityToResponseDTO(Member member) {

        return MemberResponseDTO.builder()
                .employeeNo(member.getEmployeeNo())
                .email(member.getEmail())
                .name(member.getName())
                .department(member.getDepartment())
                .status(member.getStatus().name())
                .roleNames(
                        member.getMemberRoleList()
                                .stream()
                                .map(role -> role.name())
                                .collect(Collectors.toList()))
                .build();
    }
}