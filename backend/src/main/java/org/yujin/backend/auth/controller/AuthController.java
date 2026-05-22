package org.yujin.backend.auth.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.yujin.backend.member.service.MemberService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final MemberService memberService;

    @GetMapping("/refresh")
    public Map<String, Object> refresh(
            @RequestParam("refreshToken") String refreshToken
    ) {

        return memberService.refreshToken(refreshToken);
    }
}