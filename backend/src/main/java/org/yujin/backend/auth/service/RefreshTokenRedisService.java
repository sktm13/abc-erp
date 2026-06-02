package org.yujin.backend.auth.service;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Log4j2
public class RefreshTokenRedisService {

    private static final String KEY_PREFIX = "refresh:";

    private final StringRedisTemplate stringRedisTemplate;

    @Value("${app.auth.refresh-token.ttl-minutes:1440}")
    private long refreshTokenTtlMinutes;

    public void save(
            String employeeNo,
            String refreshToken
    ) {

        String key =
                createKey(employeeNo);

        stringRedisTemplate.opsForValue().set(
                key,
                refreshToken,
                Duration.ofMinutes(refreshTokenTtlMinutes)
        );

        log.info(
                "REFRESH_TOKEN | saved | employeeNo={} | ttlMinutes={}",
                employeeNo,
                refreshTokenTtlMinutes
        );
    }

    public void validate(
            String employeeNo,
            String requestRefreshToken
    ) {

        String key =
                createKey(employeeNo);

        String savedRefreshToken =
                stringRedisTemplate.opsForValue().get(key);

        if (savedRefreshToken == null || savedRefreshToken.isBlank()) {
            throw new RuntimeException("Refresh Token이 만료되었거나 존재하지 않습니다.");
        }

        if (!savedRefreshToken.equals(requestRefreshToken)) {
            throw new RuntimeException("Refresh Token이 일치하지 않습니다.");
        }

        log.info(
                "REFRESH_TOKEN | valid | employeeNo={}",
                employeeNo
        );
    }

    public void delete(
            String employeeNo
    ) {

        String key =
                createKey(employeeNo);

        stringRedisTemplate.delete(key);

        log.info(
                "REFRESH_TOKEN | deleted | employeeNo={}",
                employeeNo
        );
    }

    private String createKey(
            String employeeNo
    ) {

        return KEY_PREFIX + employeeNo;
    }
}