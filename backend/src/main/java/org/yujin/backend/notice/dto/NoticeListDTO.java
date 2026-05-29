package org.yujin.backend.notice.dto;

import java.time.LocalDateTime;

import org.yujin.backend.notice.domain.NoticeScope;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NoticeListDTO {

    private Long id;

    private String title;

    private NoticeScope scope;

    private String targetDepartment;

    private String writerEmployeeNo;

    private String writerName;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // 현재 로그인 사용자의 읽음 여부
    private boolean read;

    // 첨부파일 개수
    private long fileCount;
}