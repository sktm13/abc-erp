package org.yujin.backend.notice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.yujin.backend.notice.domain.Notice;
import org.yujin.backend.notice.domain.NoticeScope;
import org.yujin.backend.notice.repository.search.NoticeSearch;

public interface NoticeRepository extends JpaRepository<Notice, Long>, NoticeSearch {

    List<Notice> findByScopeOrderByCreatedAtDesc(
            NoticeScope scope
    );

    List<Notice> findByScopeAndTargetDepartmentOrderByCreatedAtDesc(
            NoticeScope scope,
            String targetDepartment
    );
}