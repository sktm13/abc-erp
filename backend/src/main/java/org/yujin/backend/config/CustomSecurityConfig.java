package org.yujin.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.yujin.backend.security.CustomUserDetailsService;
import org.yujin.backend.security.filter.JWTCheckFilter;
import org.yujin.backend.security.handler.APILoginFailHandler;
import org.yujin.backend.security.handler.APILoginSuccessHandler;
import org.yujin.backend.security.handler.CustomAccessDeniedHandler;

@Configuration
@RequiredArgsConstructor
@Log4j2
@EnableMethodSecurity
public class CustomSecurityConfig {

        private final CustomUserDetailsService customUserDetailsService;

        @Bean
        public SecurityFilterChain filterChain(
                        HttpSecurity http) throws Exception {

                log.info("Security Config");

                http

                                // CORS 설정
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                                // JWT 방식
                                .sessionManagement(session -> session.sessionCreationPolicy(
                                                SessionCreationPolicy.STATELESS))

                                // csrf off
                                .csrf(csrf -> csrf.disable())

                                // userDetailsService 등록
                                .userDetailsService(
                                                customUserDetailsService)

                                // 권한 설정
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(
                                                                "/health",
                                                                "/api/member/login",
                                                                "/api/auth/refresh",
                                                                "/ws/**"
                                                )
                                                .permitAll()

                                                .anyRequest()
                                                .authenticated())

                                // 로그인 처리
                                .formLogin(config -> {

                                        config.loginProcessingUrl(
                                                        "/api/member/login");

                                        config.successHandler(
                                                        new APILoginSuccessHandler());

                                        config.failureHandler(
                                                        new APILoginFailHandler());
                                })

                                // 접근 거부 처리(권한없는 행동 ex:사원등록, 수정)
                                .exceptionHandling(
                                                config -> config.accessDeniedHandler(new CustomAccessDeniedHandler()))

                                // JWT 필터
                                .addFilterBefore(
                                                new JWTCheckFilter(),
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {

                return new BCryptPasswordEncoder();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {

                CorsConfiguration configuration = new CorsConfiguration();

                configuration.setAllowedOrigins(List.of(
                                "http://localhost:5173"));

                configuration.setAllowedMethods(List.of(
                                "GET",
                                "POST",
                                "PUT",
                                "PATCH",
                                "DELETE",
                                "OPTIONS"));

                configuration.setAllowedHeaders(List.of(
                                "Authorization",
                                "Cache-Control",
                                "Content-Type"));

                /*
                 * SockJS가 /ws/info 요청을 보낼 때 credentials mode가 include로 동작한다.
                 * 따라서 Access-Control-Allow-Credentials: true 응답이 필요하다.
                 *
                 * 단, allowedOrigins를 "*"로 열지 않고
                 * http://localhost:5173처럼 명확히 제한해야 한다.
                 */
                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

                source.registerCorsConfiguration("/**", configuration);

                return source;
        }
}