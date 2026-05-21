package org.yujin.backend.member.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.yujin.backend.member.dto.MemberResponseDTO;
import org.yujin.backend.member.dto.MemberSearchDTO;
import org.yujin.backend.common.dto.PageResponseDTO;
import org.yujin.backend.member.dto.MemberDTO;
import org.yujin.backend.member.dto.MemberJoinDTO;
import org.yujin.backend.member.dto.MemberModifyDTO;
import org.yujin.backend.member.service.MemberService;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/member")
public class MemberController {

    private final MemberService memberService;

    // 사원 등록
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/register")
    public Map<String, String> register(@RequestBody MemberJoinDTO dto) {

        String employeeNo = memberService.join(dto);

        return Map.of("employeeNo", employeeNo);
    }

    // 사원 목록 조회
    @GetMapping("/list")
    public PageResponseDTO<MemberResponseDTO> list(MemberSearchDTO memberSearchDTO) {
        return memberService.getList(memberSearchDTO);
    }

    // 사원 단건 조회
    @GetMapping("/{employeeNo}")
    public MemberResponseDTO get(@PathVariable String employeeNo) {

        return memberService.get(employeeNo);
    }

    // 로그인한 사용자 정보 조회
    @GetMapping("/me")
    public MemberResponseDTO getMyInfo(
            @AuthenticationPrincipal MemberDTO memberDTO) {

        return memberService.get(
                memberDTO.getUsername());
    }

    // 사원 정보 수정 + Role/Status 변경
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{employeeNo}")
    public Map<String, String> modify(
            @PathVariable String employeeNo,
            @RequestBody MemberModifyDTO dto) {

        memberService.modify(employeeNo, dto);

        return Map.of("result", "modified");
    }
}