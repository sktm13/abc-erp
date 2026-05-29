package org.yujin.backend.notice.repository.search;

import java.util.List;

import org.springframework.data.jpa.repository.support.QuerydslRepositorySupport;
import org.yujin.backend.notice.domain.Notice;
import org.yujin.backend.notice.domain.NoticeScope;
import org.yujin.backend.notice.domain.QNotice;
import org.yujin.backend.member.domain.QMember;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.JPQLQuery;

public class NoticeSearchImpl extends QuerydslRepositorySupport implements NoticeSearch {

    public NoticeSearchImpl() {
        super(Notice.class);
    }

    @Override
    public List<Notice> searchNoticeList(
            NoticeScope scope,
            String targetDepartment,
            String keyword
    ) {

        QNotice notice = QNotice.notice;
        QMember writer = QMember.member;

        BooleanBuilder builder = new BooleanBuilder();

        builder.and(notice.scope.eq(scope));

        if (scope == NoticeScope.DEPARTMENT) {
            builder.and(notice.targetDepartment.eq(targetDepartment));
        }

        if (keyword != null && !keyword.isBlank()) {
            builder.and(
                    notice.title.containsIgnoreCase(keyword)
                            .or(notice.content.containsIgnoreCase(keyword))
                            .or(writer.name.containsIgnoreCase(keyword))
            );
        }

        JPQLQuery<Notice> query =
                from(notice)
                        .leftJoin(notice.writer, writer)
                        .where(builder)
                        .orderBy(notice.createdAt.desc());

        return query.fetch();
    }
}