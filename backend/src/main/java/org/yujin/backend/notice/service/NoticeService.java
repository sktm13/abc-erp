package org.yujin.backend.notice.service;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.yujin.backend.notice.dto.NoticeDetailDTO;
import org.yujin.backend.notice.dto.NoticeDownloadFileDTO;
import org.yujin.backend.notice.dto.NoticeListDTO;
import org.yujin.backend.notice.dto.NoticeModifyDTO;
import org.yujin.backend.notice.dto.NoticeRequestDTO;

@Transactional
public interface NoticeService {

    Long registerNotice(
            String writerEmployeeNo,
            NoticeRequestDTO requestDTO,
            List<MultipartFile> files
    );

    Long modifyNotice(
            String employeeNo,
            Long noticeId,
            NoticeModifyDTO modifyDTO
    );

    void deleteNotice(
            String employeeNo,
            Long noticeId
    );

    List<NoticeListDTO> getAllNotices(
            String employeeNo,
            String keyword
    );

    List<NoticeListDTO> getDepartmentNotices(
            String employeeNo,
            String keyword
    );

    NoticeDetailDTO getNoticeDetail(
            String employeeNo,
            Long noticeId
    );

    List<NoticeListDTO> getUnreadNotices(
            String employeeNo
    );

    NoticeDownloadFileDTO downloadFile(
            String employeeNo,
            Long fileId
    );
}