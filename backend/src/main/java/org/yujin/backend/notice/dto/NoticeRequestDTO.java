package org.yujin.backend.notice.dto;

import org.yujin.backend.notice.domain.NoticeScope;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NoticeRequestDTO {

    private String title;

    private String content;

    // ALL / DEPARTMENT
    private NoticeScope scope;

    // 부서 공지일 경우 DEV, HR, PUR, FIN, OPS
    // 전체 공지일 경우 null
    private String targetDepartment;
}