package org.yujin.backend.notice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.yujin.backend.notice.domain.Notice;
import org.yujin.backend.notice.domain.NoticeFile;

public interface NoticeFileRepository extends JpaRepository<NoticeFile, Long> {

    // 특정 공지의 첨부파일 목록
    List<NoticeFile> findByNoticeOrderByIdAsc(
            Notice notice
    );

    // 목록 화면에서 첨부파일 개수 표시용
    long countByNotice(
            Notice notice
    );
}