package org.yujin.backend.notice.repository.search;

import java.util.List;

import org.yujin.backend.notice.domain.Notice;
import org.yujin.backend.notice.domain.NoticeScope;

public interface NoticeSearch {

    List<Notice> searchNoticeList(
            NoticeScope scope,
            String targetDepartment,
            String keyword
    );
}