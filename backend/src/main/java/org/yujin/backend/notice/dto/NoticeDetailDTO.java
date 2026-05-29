package org.yujin.backend.notice.dto;

import java.time.LocalDateTime;
import java.util.List;

import org.yujin.backend.notice.domain.NoticeScope;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NoticeDetailDTO {

    private Long id;

    private String title;

    private String content;

    private NoticeScope scope;

    private String targetDepartment;

    private String writerEmployeeNo;

    private String writerName;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // 현재 로그인 사용자의 읽음 여부
    private boolean read;

    // 첨부파일 목록
    private List<NoticeFileDTO> files;
}