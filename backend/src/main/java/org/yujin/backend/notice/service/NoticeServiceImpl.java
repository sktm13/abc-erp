package org.yujin.backend.notice.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.yujin.backend.member.domain.Member;
import org.yujin.backend.member.domain.MemberRole;
import org.yujin.backend.member.repository.MemberRepository;
import org.yujin.backend.notice.domain.Notice;
import org.yujin.backend.notice.domain.NoticeFile;
import org.yujin.backend.notice.domain.NoticeRead;
import org.yujin.backend.notice.domain.NoticeScope;
import org.yujin.backend.notice.dto.NoticeDetailDTO;
import org.yujin.backend.notice.dto.NoticeDownloadFileDTO;
import org.yujin.backend.notice.dto.NoticeFileDTO;
import org.yujin.backend.notice.dto.NoticeListDTO;
import org.yujin.backend.notice.dto.NoticeModifyDTO;
import org.yujin.backend.notice.dto.NoticeRequestDTO;
import org.yujin.backend.notice.dto.NoticeStoredFileDTO;
import org.yujin.backend.notice.repository.NoticeFileRepository;
import org.yujin.backend.notice.repository.NoticeReadRepository;
import org.yujin.backend.notice.repository.NoticeRepository;
import org.yujin.backend.notice.util.NoticeFileUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class NoticeServiceImpl implements NoticeService {

        private final NoticeRepository noticeRepository;

        private final NoticeFileRepository noticeFileRepository;

        private final NoticeReadRepository noticeReadRepository;

        private final MemberRepository memberRepository;

        private final NoticeFileUtil noticeFileUtil;

        @Override
        public Long registerNotice(
                        String writerEmployeeNo,
                        NoticeRequestDTO requestDTO,
                        List<MultipartFile> files) {

                Member writer = memberRepository.getWithRoles(writerEmployeeNo);

                if (writer == null) {
                        throw new RuntimeException("작성자 정보를 찾을 수 없습니다.");
                }

                validateWriterPermission(writer);

                validateNoticeRequest(requestDTO, writer);

                String targetDepartment = requestDTO.getScope() == NoticeScope.ALL
                                ? null
                                : writer.getDepartment();

                Notice notice = Notice.builder()
                                .title(requestDTO.getTitle())
                                .content(requestDTO.getContent())
                                .scope(requestDTO.getScope())
                                .targetDepartment(targetDepartment)
                                .writer(writer)
                                .build();

                Notice savedNotice = noticeRepository.save(notice);

                List<NoticeStoredFileDTO> storedFiles = noticeFileUtil.saveFiles(files);

                List<NoticeFile> noticeFiles = storedFiles.stream()
                                .map(fileDTO -> NoticeFile.builder()
                                                .notice(savedNotice)
                                                .originalFileName(fileDTO.getOriginalFileName())
                                                .storedFileName(fileDTO.getStoredFileName())
                                                .filePath(fileDTO.getFilePath())
                                                .contentType(fileDTO.getContentType())
                                                .fileSize(fileDTO.getFileSize())
                                                .build())
                                .toList();

                noticeFileRepository.saveAll(noticeFiles);

                return savedNotice.getId();
        }

        @Override
        public Long modifyNotice(
                        String employeeNo,
                        Long noticeId,
                        NoticeModifyDTO modifyDTO) {

                Member member = getMemberWithRoles(employeeNo);

                Notice notice = noticeRepository.findById(noticeId)
                                .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));

                validateNoticeManagePermission(notice, member);

                validateModifyRequest(modifyDTO);

                notice.modifyNotice(
                                modifyDTO.getTitle(),
                                modifyDTO.getContent());

                noticeReadRepository.deleteByNotice(notice);

                return notice.getId();
        }

        @Override
        public void deleteNotice(
                        String employeeNo,
                        Long noticeId) {

                Member member = getMemberWithRoles(employeeNo);

                Notice notice = noticeRepository.findById(noticeId)
                                .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));

                validateNoticeManagePermission(notice, member);

                List<NoticeFile> files = noticeFileRepository.findByNoticeOrderByIdAsc(notice);

                for (NoticeFile file : files) {
                        noticeFileUtil.deleteFile(file.getFilePath());
                }

                noticeReadRepository.deleteByNotice(notice);
                noticeFileRepository.deleteAll(files);
                noticeRepository.delete(notice);
        }

        @Override
        @Transactional(readOnly = true)
        public List<NoticeListDTO> getAllNotices(
                        String employeeNo,
                        String keyword) {

                Member member = getMember(employeeNo);

                List<Notice> notices = noticeRepository.searchNoticeList(
                                NoticeScope.ALL,
                                null,
                                keyword);

                return notices.stream()
                                .map(notice -> entityToListDTO(notice, member))
                                .toList();
        }

        @Override
        @Transactional(readOnly = true)
        public List<NoticeListDTO> getDepartmentNotices(
                        String employeeNo,
                        String keyword) {

                Member member = getMember(employeeNo);

                List<Notice> notices = noticeRepository.searchNoticeList(
                                NoticeScope.DEPARTMENT,
                                member.getDepartment(),
                                keyword);

                return notices.stream()
                                .map(notice -> entityToListDTO(notice, member))
                                .toList();
        }

        @Override
        public NoticeDetailDTO getNoticeDetail(
                        String employeeNo,
                        Long noticeId) {

                Member member = getMember(employeeNo);

                Notice notice = noticeRepository.findById(noticeId)
                                .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));

                validateNoticeReadable(notice, member);

                markAsReadIfNeeded(notice, member);

                List<NoticeFile> files = noticeFileRepository.findByNoticeOrderByIdAsc(notice);

                List<NoticeFileDTO> fileDTOList = files.stream()
                                .map(this::entityToFileDTO)
                                .toList();

                return NoticeDetailDTO.builder()
                                .id(notice.getId())
                                .title(notice.getTitle())
                                .content(notice.getContent())
                                .scope(notice.getScope())
                                .targetDepartment(notice.getTargetDepartment())
                                .writerEmployeeNo(notice.getWriter().getEmployeeNo())
                                .writerName(notice.getWriter().getName())
                                .createdAt(notice.getCreatedAt())
                                .updatedAt(notice.getUpdatedAt())
                                .read(true)
                                .files(fileDTOList)
                                .build();
        }

        @Override
        @Transactional(readOnly = true)
        public List<NoticeListDTO> getUnreadNotices(
                        String employeeNo) {

                Member member = getMember(employeeNo);

                List<Notice> visibleNotices = new ArrayList<>();

                List<Notice> allNotices = noticeRepository.findByScopeOrderByCreatedAtDesc(
                                NoticeScope.ALL);

                List<Notice> departmentNotices = noticeRepository.findByScopeAndTargetDepartmentOrderByCreatedAtDesc(
                                NoticeScope.DEPARTMENT,
                                member.getDepartment());

                visibleNotices.addAll(allNotices);
                visibleNotices.addAll(departmentNotices);

                return visibleNotices.stream()
                                .filter(notice -> isNoticeTargetForMember(notice, member))
                                .filter(notice -> !noticeReadRepository.existsByNoticeAndMember(
                                                notice,
                                                member))
                                .sorted((n1, n2) -> getNoticeTargetTime(n2).compareTo(
                                                getNoticeTargetTime(n1)))
                                .map(notice -> entityToListDTO(notice, member))
                                .toList();
        }

        @Override
        @Transactional(readOnly = true)
        public NoticeDownloadFileDTO downloadFile(
                        String employeeNo,
                        Long fileId) {

                Member member = getMember(employeeNo);

                NoticeFile noticeFile = noticeFileRepository.findById(fileId)
                                .orElseThrow(() -> new RuntimeException("첨부파일을 찾을 수 없습니다."));

                Notice notice = noticeFile.getNotice();

                validateNoticeReadable(notice, member);

                Resource resource = noticeFileUtil.loadFileAsResource(
                                noticeFile.getFilePath());

                return NoticeDownloadFileDTO.builder()
                                .resource(resource)
                                .originalFileName(noticeFile.getOriginalFileName())
                                .contentType(noticeFile.getContentType())
                                .build();
        }

        private Member getMember(
                        String employeeNo) {

                return memberRepository.findById(employeeNo)
                                .orElseThrow(() -> new RuntimeException("사원 정보를 찾을 수 없습니다."));
        }

        private Member getMemberWithRoles(
                        String employeeNo) {

                Member member = memberRepository.getWithRoles(employeeNo);

                if (member == null) {
                        throw new RuntimeException("사원 정보를 찾을 수 없습니다.");
                }

                return member;
        }

        private void validateWriterPermission(
                        Member writer) {

                boolean canWrite = writer.getMemberRoleList().contains(MemberRole.MANAGER)
                                || writer.getMemberRoleList().contains(MemberRole.ADMIN);

                if (!canWrite) {
                        throw new RuntimeException("공지사항 작성 권한이 없습니다.");
                }
        }

        private void validateNoticeManagePermission(
                        Notice notice,
                        Member member) {

                boolean isWriter = notice.getWriter().getEmployeeNo()
                                .equals(member.getEmployeeNo());

                boolean isAdmin = member.getMemberRoleList().contains(MemberRole.ADMIN);

                if (!isWriter && !isAdmin) {
                        throw new RuntimeException("공지사항을 수정/삭제할 권한이 없습니다.");
                }
        }

        private void validateNoticeRequest(
                        NoticeRequestDTO requestDTO,
                        Member writer) {

                if (requestDTO.getTitle() == null || requestDTO.getTitle().isBlank()) {
                        throw new RuntimeException("공지 제목을 입력해주세요.");
                }

                if (requestDTO.getContent() == null || requestDTO.getContent().isBlank()) {
                        throw new RuntimeException("공지 내용을 입력해주세요.");
                }

                if (requestDTO.getScope() == null) {
                        throw new RuntimeException("공지 범위를 선택해주세요.");
                }

                if (requestDTO.getScope() == NoticeScope.DEPARTMENT) {

                        String requestTargetDepartment = requestDTO.getTargetDepartment();

                        if (requestTargetDepartment != null
                                        && !requestTargetDepartment.isBlank()
                                        && !requestTargetDepartment.equals(writer.getDepartment())) {

                                throw new RuntimeException("본인 부서의 공지사항만 등록할 수 있습니다.");
                        }
                }
        }

        private void validateModifyRequest(
                        NoticeModifyDTO modifyDTO) {

                if (modifyDTO.getTitle() == null || modifyDTO.getTitle().isBlank()) {
                        throw new RuntimeException("공지 제목을 입력해주세요.");
                }

                if (modifyDTO.getContent() == null || modifyDTO.getContent().isBlank()) {
                        throw new RuntimeException("공지 내용을 입력해주세요.");
                }
        }

        private void validateNoticeReadable(
                        Notice notice,
                        Member member) {

                if (notice.getScope() == NoticeScope.ALL) {
                        return;
                }

                if (notice.getScope() == NoticeScope.DEPARTMENT) {
                        if (notice.getTargetDepartment().equals(member.getDepartment())) {
                                return;
                        }
                }

                throw new RuntimeException("해당 공지사항을 조회할 권한이 없습니다.");
        }

        private void markAsReadIfNeeded(
                        Notice notice,
                        Member member) {

                if (!isNoticeTargetForMember(notice, member)) {
                        return;
                }

                boolean alreadyRead = noticeReadRepository.existsByNoticeAndMember(
                                notice,
                                member);

                if (alreadyRead) {
                        return;
                }

                NoticeRead noticeRead = NoticeRead.builder()
                                .notice(notice)
                                .member(member)
                                .build();

                noticeReadRepository.save(noticeRead);
        }

        private NoticeListDTO entityToListDTO(
                        Notice notice,
                        Member member) {

                boolean targetNotice = isNoticeTargetForMember(
                                notice,
                                member);

                boolean read = !targetNotice
                                || noticeReadRepository.existsByNoticeAndMember(
                                                notice,
                                                member);

                long fileCount = noticeFileRepository.countByNotice(notice);

                return NoticeListDTO.builder()
                                .id(notice.getId())
                                .title(notice.getTitle())
                                .scope(notice.getScope())
                                .targetDepartment(notice.getTargetDepartment())
                                .writerEmployeeNo(notice.getWriter().getEmployeeNo())
                                .writerName(notice.getWriter().getName())
                                .createdAt(notice.getCreatedAt())
                                .updatedAt(notice.getUpdatedAt())
                                .read(read)
                                .fileCount(fileCount)
                                .build();
        }

        private boolean isNoticeTargetForMember(
                        Notice notice,
                        Member member) {

                if (member.getCreatedAt() == null) {
                        return true;
                }

                LocalDateTime noticeTargetTime = getNoticeTargetTime(notice);

                if (noticeTargetTime == null) {
                        return true;
                }

                return !noticeTargetTime.isBefore(
                                member.getCreatedAt());
        }

        private LocalDateTime getNoticeTargetTime(
                        Notice notice) {

                if (notice.getUpdatedAt() != null) {
                        return notice.getUpdatedAt();
                }

                return notice.getCreatedAt();
        }

        private NoticeFileDTO entityToFileDTO(
                        NoticeFile noticeFile) {

                return NoticeFileDTO.builder()
                                .id(noticeFile.getId())
                                .originalFileName(noticeFile.getOriginalFileName())
                                .storedFileName(noticeFile.getStoredFileName())
                                .contentType(noticeFile.getContentType())
                                .fileSize(noticeFile.getFileSize())
                                .downloadUrl("/api/notices/files/" + noticeFile.getId() + "/download")
                                .build();
        }
}