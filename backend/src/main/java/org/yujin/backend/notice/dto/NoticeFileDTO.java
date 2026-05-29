package org.yujin.backend.notice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NoticeFileDTO {

    private Long id;

    private String originalFileName;

    private String storedFileName;

    private String contentType;

    private Long fileSize;

    // 다운로드 API 경로
    private String downloadUrl;
}