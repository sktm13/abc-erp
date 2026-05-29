package org.yujin.backend.notice.repository;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.yujin.backend.member.domain.Member;
import org.yujin.backend.member.repository.MemberRepository;
import org.yujin.backend.notice.domain.Notice;
import org.yujin.backend.notice.domain.NoticeFile;
import org.yujin.backend.notice.domain.NoticeScope;

import lombok.extern.log4j.Log4j2;

@SpringBootTest
@Log4j2
public class NoticeRepositoryTest {

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private NoticeFileRepository noticeFileRepository;

    @Autowired
    private NoticeReadRepository noticeReadRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Value("${notice.upload.path}")
    private String noticeUploadPath;

    @Test
    public void insertNoticeTestData() {

        /*
         * 테스트 데이터 재생성을 위해 기존 공지 관련 데이터를 삭제한다.
         *
         * 삭제 순서:
         * 1. 로컬 첨부파일 실제 파일 삭제
         * 2. notice_read 삭제
         * 3. notice_file 삭제
         * 4. notice 삭제
         *
         * NoticeFile DB 데이터를 먼저 삭제하면 filePath를 알 수 없기 때문에
         * 로컬 파일 삭제를 가장 먼저 수행한다.
         */
        deleteNoticeFilesFromLocal();

        noticeReadRepository.deleteAllInBatch();
        noticeFileRepository.deleteAllInBatch();
        noticeRepository.deleteAllInBatch();

        Member writer = memberRepository.findById("ABC-21-DEV-001")
                .orElseThrow(() -> new RuntimeException("공지 작성자 사원을 찾을 수 없습니다."));

        List<Notice> notices = new ArrayList<>();

        // 전체 공지 20개
        for (int i = 1; i <= 20; i++) {
            notices.add(
                    Notice.builder()
                            .title("[전체공지] 사내 공지사항 안내 " + i)
                            .content(
                                    "전체 사원을 대상으로 하는 공지사항 테스트 데이터입니다.\n\n"
                                            + "공지 번호: " + i + "\n"
                                            + "모든 사원은 해당 공지사항을 확인하고 읽음 상태로 변경해야 합니다."
                            )
                            .scope(NoticeScope.ALL)
                            .targetDepartment(null)
                            .writer(writer)
                            .build()
            );
        }

        addDepartmentNotices(
                notices,
                writer,
                "DEV",
                "개발팀",
                "개발 업무 및 코드리뷰 관련 공지사항입니다."
        );

        addDepartmentNotices(
                notices,
                writer,
                "HR",
                "인사팀",
                "인사 정책 및 제출 서류 관련 공지사항입니다."
        );

        addDepartmentNotices(
                notices,
                writer,
                "PUR",
                "구매팀",
                "구매 요청 및 발주 절차 관련 공지사항입니다."
        );

        addDepartmentNotices(
                notices,
                writer,
                "FIN",
                "재무팀",
                "정산 및 비용 처리 관련 공지사항입니다."
        );

        addDepartmentNotices(
                notices,
                writer,
                "OPS",
                "운영팀",
                "서비스 운영 및 장애 대응 관련 공지사항입니다."
        );

        noticeRepository.saveAll(notices);

        log.info("Inserted notice test data count: {}", notices.size());
    }

    private void addDepartmentNotices(
            List<Notice> notices,
            Member writer,
            String departmentCode,
            String departmentName,
            String baseContent
    ) {

        for (int i = 1; i <= 20; i++) {
            notices.add(
                    Notice.builder()
                            .title("[" + departmentName + "공지] 부서 공지사항 안내 " + i)
                            .content(
                                    departmentName + " 사원을 대상으로 하는 공지사항 테스트 데이터입니다.\n\n"
                                            + baseContent + "\n"
                                            + "공지 번호: " + i + "\n"
                                            + "해당 부서 사원은 공지 내용을 확인하고 읽음 상태로 변경해야 합니다."
                            )
                            .scope(NoticeScope.DEPARTMENT)
                            .targetDepartment(departmentCode)
                            .writer(writer)
                            .build()
            );
        }
    }

    private void deleteNoticeFilesFromLocal() {

        List<NoticeFile> noticeFiles = noticeFileRepository.findAll();

        for (NoticeFile noticeFile : noticeFiles) {
            try {
                String filePath = noticeFile.getFilePath();

                if (filePath == null || filePath.isBlank()) {
                    continue;
                }

                Path path = Paths.get(filePath)
                        .toAbsolutePath()
                        .normalize();

                Files.deleteIfExists(path);

                log.info("Deleted notice file: {}", path);

            } catch (Exception e) {
                log.warn(
                        "공지 첨부파일 삭제 실패: {}",
                        noticeFile.getOriginalFileName()
                );
            }
        }

        /*
         * 혹시 DB에 기록되지 않은 테스트 파일이 uploads/notice 폴더에 남아있을 수 있으므로,
         * 폴더가 비어 있으면 정리한다.
         * 폴더 안에 다른 파일이 있으면 삭제하지 않는다.
         */
        try {
            Path uploadPath = Paths.get(noticeUploadPath)
                    .toAbsolutePath()
                    .normalize();

            if (Files.exists(uploadPath) && Files.isDirectory(uploadPath)) {
                try (var files = Files.list(uploadPath)) {
                    boolean isEmpty = files.findAny().isEmpty();

                    if (isEmpty) {
                        Files.deleteIfExists(uploadPath);
                        log.info("Deleted empty notice upload directory: {}", uploadPath);
                    }
                }
            }

        } catch (Exception e) {
            log.warn("공지 첨부파일 폴더 정리 중 오류가 발생했습니다.");
        }
    }
}