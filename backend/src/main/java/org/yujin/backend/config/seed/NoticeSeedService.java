package org.yujin.backend.config.seed;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.yujin.backend.member.domain.Member;
import org.yujin.backend.notice.domain.Notice;
import org.yujin.backend.notice.domain.NoticeScope;
import org.yujin.backend.notice.repository.NoticeRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Log4j2
public class NoticeSeedService {

    private final NoticeRepository noticeRepository;

    @Transactional
    public List<Notice> seedIfNeeded(
            List<Member> members
    ) {

        if (noticeRepository.count() > 0) {
            log.info("초기 공지 데이터가 이미 존재합니다. 공지 생성을 건너뜁니다.");
            return noticeRepository.findAll();
        }

        return seed(members);
    }

    private List<Notice> seed(
            List<Member> members
    ) {

        log.info("초기 공지 데이터를 생성합니다.");

        List<Notice> notices = new ArrayList<>();

        Member admin =
                findMember(members, "ABC-21-DEV-001");

        addAllNotices(
                notices,
                admin
        );

        addDepartmentNotices(
                notices,
                members,
                "DEV",
                "개발팀",
                "ABC-21-DEV-001"
        );

        addDepartmentNotices(
                notices,
                members,
                "HR",
                "인사팀",
                "ABC-21-HR-001"
        );

        addDepartmentNotices(
                notices,
                members,
                "PUR",
                "구매팀",
                "ABC-21-PUR-001"
        );

        addDepartmentNotices(
                notices,
                members,
                "FIN",
                "재무팀",
                "ABC-21-FIN-001"
        );

        addDepartmentNotices(
                notices,
                members,
                "OPS",
                "운영팀",
                "ABC-21-OPS-001"
        );

        List<Notice> savedNotices =
                noticeRepository.saveAll(notices);

        /*
         * 중요:
         * NoticeRead는 생성하지 않는다.
         *
         * 이유:
         * 현재 서비스 로직은 NoticeRead가 존재하면 읽음,
         * 존재하지 않으면 안읽음으로 판단한다.
         *
         * 따라서 초기 공지는 전체/부서공지 모두 안읽음 상태로 시작한다.
         */

        log.info("초기 공지 데이터 생성 완료. 총 {}건", savedNotices.size());

        return savedNotices;
    }

    private void addAllNotices(
            List<Notice> notices,
            Member writer
    ) {

        for (int i = 1; i <= 20; i++) {

            notices.add(
                    Notice.builder()
                            .title(String.format("[전체공지] ERP 시스템 운영 안내 %02d", i))
                            .content(
                                    """
                                    전체 사원을 대상으로 하는 초기 공지사항입니다.

                                    이 공지는 Docker 초기 데이터 확인용으로 생성되었습니다.
                                    공지 목록, 검색, 상세 조회, 읽음/안읽음 상태를 테스트할 수 있습니다.

                                    확인 항목:
                                    - 전체공지 목록 조회
                                    - 공지 상세 조회
                                    - 안읽음 상태 표시
                                    - 상세 조회 후 읽음 처리
                                    """
                            )
                            .scope(NoticeScope.ALL)
                            .targetDepartment(null)
                            .writer(writer)
                            .build()
            );
        }
    }

    private void addDepartmentNotices(
            List<Notice> notices,
            List<Member> members,
            String department,
            String departmentName,
            String writerEmployeeNo
    ) {

        Member writer =
                findMember(members, writerEmployeeNo);

        for (int i = 1; i <= 20; i++) {

            notices.add(
                    Notice.builder()
                            .title(String.format("[%s 공지] 부서 업무 안내 %02d", departmentName, i))
                            .content(
                                    """
                                    %s 구성원을 대상으로 하는 초기 부서 공지사항입니다.

                                    이 공지는 Docker 초기 데이터 확인용으로 생성되었습니다.
                                    부서공지 목록, 검색, 상세 조회, 읽음/안읽음 상태를 테스트할 수 있습니다.

                                    확인 항목:
                                    - 부서공지 목록 조회
                                    - 본인 부서 공지만 조회되는지 확인
                                    - 안읽음 상태 표시
                                    - 상세 조회 후 읽음 처리
                                    """.formatted(departmentName)
                            )
                            .scope(NoticeScope.DEPARTMENT)
                            .targetDepartment(department)
                            .writer(writer)
                            .build()
            );
        }
    }

    private Member findMember(
            List<Member> members,
            String employeeNo
    ) {

        return members.stream()
                .filter(member ->
                        member.getEmployeeNo().equals(employeeNo)
                )
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException("초기 데이터 사원을 찾을 수 없습니다. employeeNo=" + employeeNo)
                );
    }
}