package org.yujin.backend.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.yujin.backend.config.seed.MemberSeedService;
import org.yujin.backend.config.seed.NoticeSeedService;
import org.yujin.backend.config.seed.WorkLogSeedService;
import org.yujin.backend.member.domain.Member;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Configuration
@RequiredArgsConstructor
@Log4j2
public class DataInitializer {

    private final MemberSeedService memberSeedService;

    private final NoticeSeedService noticeSeedService;

    private final WorkLogSeedService workLogSeedService;

    @Bean
    public CommandLineRunner initData() {

        return args -> {

            log.info("초기 데이터 생성을 확인합니다.");

            List<Member> members =
                    memberSeedService.seedIfNeeded();

            noticeSeedService.seedIfNeeded(members);

            workLogSeedService.seedIfNeeded(members);

            log.info("초기 데이터 확인이 완료되었습니다.");
        };
    }
}