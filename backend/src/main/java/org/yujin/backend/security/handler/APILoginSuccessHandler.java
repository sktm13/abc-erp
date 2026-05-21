package org.yujin.backend.security.handler;

import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.yujin.backend.member.dto.MemberDTO;
import org.yujin.backend.util.JWTUtil;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

@Log4j2
public class APILoginSuccessHandler
        implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        log.info("Login Success");

        MemberDTO memberDTO =
                (MemberDTO) authentication.getPrincipal();

        Map<String, Object> claims =
                memberDTO.getClaims();

        // Access Token (30분)
        String accessToken =
                JWTUtil.generateToken(
                        claims,
                        30
                );

        // Refresh Token (1일)
        String refreshToken =
                JWTUtil.generateToken(
                        claims,
                        60 * 24
                );

        claims.put("accessToken", accessToken);
        claims.put("refreshToken", refreshToken);

        Gson gson = new Gson();

        String jsonStr =
                gson.toJson(claims);

        response.setContentType(
                "application/json;charset=UTF-8"
        );

        PrintWriter writer =
                response.getWriter();

        writer.println(jsonStr);
        writer.close();
    }
}