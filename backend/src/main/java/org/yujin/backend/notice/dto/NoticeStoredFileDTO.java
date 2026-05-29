package org.yujin.backend.notice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NoticeStoredFileDTO {

    private String originalFileName;

    private String storedFileName;

    private String filePath;

    private String contentType;

    private Long fileSize;
}