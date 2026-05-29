package org.yujin.backend.notice.dto;

import org.springframework.core.io.Resource;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NoticeDownloadFileDTO {

    private Resource resource;

    private String originalFileName;

    private String contentType;
}