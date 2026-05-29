package org.yujin.backend.notice.controller;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.yujin.backend.member.dto.MemberDTO;
import org.yujin.backend.notice.dto.NoticeDetailDTO;
import org.yujin.backend.notice.dto.NoticeDownloadFileDTO;
import org.yujin.backend.notice.dto.NoticeListDTO;
import org.yujin.backend.notice.dto.NoticeModifyDTO;
import org.yujin.backend.notice.dto.NoticeRequestDTO;
import org.yujin.backend.notice.service.NoticeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notices")
public class NoticeController {

        private final NoticeService noticeService;

        @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public Map<String, Long> registerNotice(
                        @AuthenticationPrincipal MemberDTO memberDTO,
                        @ModelAttribute NoticeRequestDTO requestDTO,
                        @RequestPart(value = "files", required = false) List<MultipartFile> files) {

                Long noticeId = noticeService.registerNotice(
                                memberDTO.getUsername(),
                                requestDTO,
                                files);

                return Map.of("noticeId", noticeId);
        }

        @PutMapping("/{noticeId}")
        public Map<String, Long> modifyNotice(
                        @AuthenticationPrincipal MemberDTO memberDTO,
                        @PathVariable("noticeId") Long noticeId,
                        @RequestBody NoticeModifyDTO modifyDTO) {

                Long modifiedNoticeId = noticeService.modifyNotice(
                                memberDTO.getUsername(),
                                noticeId,
                                modifyDTO);

                return Map.of("noticeId", modifiedNoticeId);
        }

        @DeleteMapping("/{noticeId}")
        public Map<String, String> deleteNotice(
                        @AuthenticationPrincipal MemberDTO memberDTO,
                        @PathVariable("noticeId") Long noticeId) {

                noticeService.deleteNotice(
                                memberDTO.getUsername(),
                                noticeId);

                return Map.of("result", "success");
        }

        @GetMapping("/all")
        public List<NoticeListDTO> getAllNotices(
                        @AuthenticationPrincipal MemberDTO memberDTO,
                        @RequestParam(value = "keyword", required = false) String keyword) {

                return noticeService.getAllNotices(
                                memberDTO.getUsername(),
                                keyword);
        }

        @GetMapping("/department")
        public List<NoticeListDTO> getDepartmentNotices(
                        @AuthenticationPrincipal MemberDTO memberDTO,
                        @RequestParam(value = "keyword", required = false) String keyword) {

                return noticeService.getDepartmentNotices(
                                memberDTO.getUsername(),
                                keyword);
        }

        @GetMapping("/unread/me")
        public List<NoticeListDTO> getUnreadNotices(
                        @AuthenticationPrincipal MemberDTO memberDTO) {

                return noticeService.getUnreadNotices(
                                memberDTO.getUsername());
        }

        @GetMapping("/{noticeId}")
        public NoticeDetailDTO getNoticeDetail(
                        @AuthenticationPrincipal MemberDTO memberDTO,
                        @PathVariable("noticeId") Long noticeId) {

                return noticeService.getNoticeDetail(
                                memberDTO.getUsername(),
                                noticeId);
        }

        @GetMapping("/files/{fileId}/download")
        public ResponseEntity<Resource> downloadFile(
                        @AuthenticationPrincipal MemberDTO memberDTO,
                        @PathVariable("fileId") Long fileId) {

                NoticeDownloadFileDTO fileDTO = noticeService.downloadFile(
                                memberDTO.getUsername(),
                                fileId);

                ContentDisposition contentDisposition = ContentDisposition.attachment()
                                .filename(
                                                fileDTO.getOriginalFileName(),
                                                StandardCharsets.UTF_8)
                                .build();

                String contentType = fileDTO.getContentType() == null
                                ? MediaType.APPLICATION_OCTET_STREAM_VALUE
                                : fileDTO.getContentType();

                return ResponseEntity.ok()
                                .header(
                                                HttpHeaders.CONTENT_DISPOSITION,
                                                contentDisposition.toString())
                                .contentType(MediaType.parseMediaType(contentType))
                                .body(fileDTO.getResource());
        }
}