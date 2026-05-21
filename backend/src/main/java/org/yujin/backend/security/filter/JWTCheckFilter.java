package org.yujin.backend.security.filter;

import com.google.gson.Gson;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import org.yujin.backend.member.dto.MemberDTO;
import org.yujin.backend.util.JWTUtil;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

@Log4j2
public class JWTCheckFilter extends OncePerRequestFilter {

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request)
            throws ServletException {

        String path = request.getRequestURI();

        log.info("check uri: {}", path);

        // JWT 검사제외 목록

        // Health Check
        if (path.equals("/health")) {
            return true;
        }
        // 로그인 API
        if (path.equals("/api/member/login")) {
            return true;
        }

        // CORS preflight 제외
        if (request.getMethod().equals("OPTIONS")) {
            return true;
        }

        return false;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String authHeaderStr = request.getHeader("Authorization");

        try {
            String accessToken = authHeaderStr.substring(7);

            Map<String, Object> claims = JWTUtil.validateToken(accessToken);

            log.info("JWT claims: {}", claims);

            String employeeNo = (String) claims.get("employeeNo");

            String email = (String) claims.get("email");

            //JWT에 pw넣지않음
            String pw = "";

            String name = (String) claims.get("name");

            String department = (String) claims.get("department");

            String status = (String) claims.get("status");

            List<String> roleNames = ((List<?>) claims.get("roleNames"))
                    .stream()
                    .map(Object::toString)
                    .toList();

            MemberDTO memberDTO = new MemberDTO(
                    employeeNo,
                    email,
                    pw,
                    name,
                    department,
                    status,
                    roleNames);

            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                    memberDTO,
                    null,
                    memberDTO.getAuthorities());

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authenticationToken);

            filterChain.doFilter(request, response);

        } catch (Exception e) {

            log.error("JWT Check Error: {}", e.getMessage());

            Gson gson = new Gson();

            String msg = gson.toJson(
                    Map.of(
                            "error",
                            "ERROR_ACCESS_TOKEN"));

            response.setContentType(
                    "application/json;charset=UTF-8");

            PrintWriter writer = response.getWriter();

            writer.println(msg);
            writer.close();
        }
    }
}