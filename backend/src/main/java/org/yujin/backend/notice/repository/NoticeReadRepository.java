package org.yujin.backend.notice.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.yujin.backend.member.domain.Member;
import org.yujin.backend.notice.domain.Notice;
import org.yujin.backend.notice.domain.NoticeRead;

public interface NoticeReadRepository extends JpaRepository<NoticeRead, Long> {

    Optional<NoticeRead> findByNoticeAndMember(
            Notice notice,
            Member member
    );

    boolean existsByNoticeAndMember(
            Notice notice,
            Member member
    );

    List<NoticeRead> findByMember(
            Member member
    );

    void deleteByNotice(
            Notice notice
    );
}