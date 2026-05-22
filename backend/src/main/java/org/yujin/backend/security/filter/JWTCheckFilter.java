package org.yujin.backend.security.filter;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import org.yujin.backend.member.dto.MemberDTO;
import org.yujin.backend.util.JWTUtil;

import com.google.gson.Gson;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;

@Log4j2
public class JWTCheckFilter extends OncePerRequestFilter {

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request)
            throws ServletException {

        String path = request.getRequestURI();

        log.info("check uri: {}", path);

        // ELB / 서버 상태 확인
        if (path.equals("/health")) {
            return true;
        }

        // 로그인 API는 JWT 검사 제외
        if (path.equals("/api/member/login")) {
            return true;
        }

        // Refresh Token 재발급 API는 JWT 검사 제외
        if (path.equals("/api/auth/refresh")) {
            return true;
        }

        // CORS Preflight 요청 제외
        if (request.getMethod().equals("OPTIONS")) {
            return true;
        }

        return false;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeaderStr = request.getHeader("Authorization");

        /*
         * 여기서는 JWT 검증만 처리한다.
         * Controller / Service 로직에서 발생한 예외는 여기서 잡으면 안 된다.
         */
        try {
            if (authHeaderStr == null || !authHeaderStr.startsWith("Bearer ")) {
                throw new RuntimeException("Authorization header is missing or invalid");
            }

            String accessToken = authHeaderStr.substring(7);

            Map<String, Object> claims =
                    JWTUtil.validateToken(accessToken);

            log.info("JWT claims: {}", claims);

            String employeeNo =
                    (String) claims.get("employeeNo");

            String email =
                    (String) claims.get("email");

            String name =
                    (String) claims.get("name");

            String department =
                    (String) claims.get("department");

            String status =
                    (String) claims.get("status");

            List<String> roleNames =
                    ((List<?>) claims.get("roleNames"))
                            .stream()
                            .map(Object::toString)
                            .toList();

            MemberDTO memberDTO =
                    new MemberDTO(
                            employeeNo,
                            email,
                            "",
                            name,
                            department,
                            status,
                            roleNames
                    );

            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(
                            memberDTO,
                            null,
                            memberDTO.getAuthorities()
                    );

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authenticationToken);

        } catch (Exception e) {

            log.error("JWT Check Error: {}", e.getMessage());

            Gson gson = new Gson();

            String msg =
                    gson.toJson(
                            Map.of(
                                    "error",
                                    "ERROR_ACCESS_TOKEN"
                            )
                    );

            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");

            PrintWriter writer =
                    response.getWriter();

            writer.println(msg);
            writer.close();

            return;
        }

        /*
         * 중요:
         * 이 코드는 try-catch 밖에 둔다.
         *
         * 그래야 Controller / Service에서 발생한 예외가
         * ERROR_ACCESS_TOKEN으로 잘못 변환되지 않는다.
         */
        filterChain.doFilter(request, response);
    }
}