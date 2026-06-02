package org.yujin.backend.config.performance;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;

@Component
@Log4j2
public class ApiPerformanceLoggingFilter extends OncePerRequestFilter {

    private static final String RESPONSE_TIME_HEADER = "X-Response-Time-Ms";

    @Value("${app.performance.logging.enabled:true}")
    private boolean performanceLoggingEnabled;

    @Value("${app.cache.member.enabled:false}")
    private boolean memberCacheEnabled;

    @Override
    protected boolean shouldNotFilter(
            HttpServletRequest request
    ) {

        if (!performanceLoggingEnabled) {
            return true;
        }

        String uri =
                request.getRequestURI();

        return !uri.startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        long startTime =
                System.nanoTime();

        ContentCachingResponseWrapper wrappedResponse =
                new ContentCachingResponseWrapper(response);

        try {
            filterChain.doFilter(
                    request,
                    wrappedResponse
            );
        } finally {

            long elapsedNanos =
                    System.nanoTime() - startTime;

            double elapsedMs =
                    elapsedNanos / 1_000_000.0;

            String elapsedMsText =
                    String.format("%.2f", elapsedMs);

            wrappedResponse.setHeader(
                    RESPONSE_TIME_HEADER,
                    elapsedMsText
            );

            log.info(
                    "PERF | method={} | uri={} | status={} | elapsedMs={} | memberCacheEnabled={}",
                    request.getMethod(),
                    request.getRequestURI(),
                    wrappedResponse.getStatus(),
                    elapsedMsText,
                    memberCacheEnabled
            );

            wrappedResponse.copyBodyToResponse();
        }
    }
}