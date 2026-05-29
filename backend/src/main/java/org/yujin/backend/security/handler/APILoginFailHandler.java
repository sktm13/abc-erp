package org.yujin.backend.security.handler;

import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

@Log4j2
public class APILoginFailHandler
        implements AuthenticationFailureHandler {

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException, ServletException {

        log.info("Login Fail : {}",
                exception.getMessage());

        response.setStatus(
                HttpServletResponse.SC_UNAUTHORIZED
        );

        response.setContentType(
                "application/json;charset=UTF-8"
        );

        String message = "로그인에 실패했습니다.";

        if (exception instanceof BadCredentialsException) {
            message = "사번 또는 비밀번호가 올바르지 않습니다.";
        } else if (exception.getMessage() != null
                && !exception.getMessage().isBlank()) {
            message = exception.getMessage();
        }

        Gson gson = new Gson();

        String jsonStr =
                gson.toJson(
                        Map.of(
                                "error", "ERROR_LOGIN",
                                "message", message
                        )
                );

        PrintWriter writer =
                response.getWriter();

        writer.println(jsonStr);
        writer.close();
    }
}