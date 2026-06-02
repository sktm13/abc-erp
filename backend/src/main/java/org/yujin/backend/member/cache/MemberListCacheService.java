package org.yujin.backend.member.cache;

import java.time.Duration;
import java.util.Set;
import java.util.function.Supplier;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.yujin.backend.common.dto.PageResponseDTO;
import org.yujin.backend.member.dto.MemberResponseDTO;
import org.yujin.backend.member.dto.MemberSearchDTO;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Log4j2
public class MemberListCacheService {

    private static final String CACHE_PREFIX = "member:list:";

    private final StringRedisTemplate stringRedisTemplate;

    private final ObjectMapper objectMapper;

    @Value("${app.cache.member.enabled:false}")
    private boolean memberCacheEnabled;

    @Value("${app.cache.member.ttl-minutes:10}")
    private long memberCacheTtlMinutes;

    public PageResponseDTO<MemberResponseDTO> getOrLoad(
            MemberSearchDTO searchDTO,
            Supplier<PageResponseDTO<MemberResponseDTO>> dbLoader
    ) {

        if (!memberCacheEnabled) {
            log.info("MEMBER_CACHE | disabled | key={}", createCacheKey(searchDTO));
            return dbLoader.get();
        }

        String cacheKey =
                createCacheKey(searchDTO);

        try {
            String cachedJson =
                    stringRedisTemplate.opsForValue().get(cacheKey);

            if (cachedJson != null && !cachedJson.isBlank()) {
                log.info("MEMBER_CACHE | hit | key={}", cacheKey);

                return objectMapper.readValue(
                        cachedJson,
                        new TypeReference<PageResponseDTO<MemberResponseDTO>>() {
                        }
                );
            }

            log.info("MEMBER_CACHE | miss | key={}", cacheKey);

            PageResponseDTO<MemberResponseDTO> response =
                    dbLoader.get();

            String responseJson =
                    objectMapper.writeValueAsString(response);

            stringRedisTemplate.opsForValue().set(
                    cacheKey,
                    responseJson,
                    Duration.ofMinutes(memberCacheTtlMinutes)
            );

            log.info(
                    "MEMBER_CACHE | saved | key={} | ttlMinutes={}",
                    cacheKey,
                    memberCacheTtlMinutes
            );

            return response;

        } catch (Exception e) {
            log.warn(
                    "MEMBER_CACHE | error | fallback db | key={} | message={}",
                    cacheKey,
                    e.getMessage()
            );

            return dbLoader.get();
        }
    }

    public void evictAll() {

        if (!memberCacheEnabled) {
            return;
        }

        Set<String> keys =
                stringRedisTemplate.keys(CACHE_PREFIX + "*");

        if (keys == null || keys.isEmpty()) {
            return;
        }

        stringRedisTemplate.delete(keys);

        log.info("MEMBER_CACHE | evict all | count={}", keys.size());
    }

    private String createCacheKey(
            MemberSearchDTO searchDTO
    ) {

        int page =
                searchDTO.getPage();

        int size =
                searchDTO.getSize();

        String keyword =
                normalize(searchDTO.getKeyword());

        String department =
                normalize(searchDTO.getDepartment());

        String status =
                searchDTO.getStatus() == null
                        ? "ALL"
                        : searchDTO.getStatus().name();

        String role =
                searchDTO.getRole() == null
                        ? "ALL"
                        : searchDTO.getRole().name();

        return CACHE_PREFIX
                + "page=" + page
                + ":size=" + size
                + ":keyword=" + keyword
                + ":department=" + department
                + ":status=" + status
                + ":role=" + role;
    }

    private String normalize(
            String value
    ) {

        if (value == null || value.isBlank()) {
            return "ALL";
        }

        return value.trim();
    }
}