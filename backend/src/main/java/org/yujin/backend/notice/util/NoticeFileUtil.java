package org.yujin.backend.notice.util;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.yujin.backend.notice.dto.NoticeStoredFileDTO;

@Component
public class NoticeFileUtil {

    @Value("${notice.upload.path}")
    private String uploadDir;

    public List<NoticeStoredFileDTO> saveFiles(
            List<MultipartFile> files
    ) {

        List<NoticeStoredFileDTO> storedFiles =
                new ArrayList<>();

        if (files == null || files.isEmpty()) {
            return storedFiles;
        }

        createUploadDirectory();

        for (MultipartFile file : files) {

            if (file == null || file.isEmpty()) {
                continue;
            }

            storedFiles.add(saveFile(file));
        }

        return storedFiles;
    }

    private NoticeStoredFileDTO saveFile(
            MultipartFile file
    ) {

        String originalFileName =
                file.getOriginalFilename();

        if (originalFileName == null || originalFileName.isBlank()) {
            throw new RuntimeException("파일명이 올바르지 않습니다.");
        }

        String safeOriginalFileName =
                originalFileName.replace("\\", "_")
                        .replace("/", "_");

        String storedFileName =
                UUID.randomUUID() + "_" + safeOriginalFileName;

        Path savePath =
                Paths.get(uploadDir, storedFileName)
                        .toAbsolutePath()
                        .normalize();

        try {
            file.transferTo(savePath.toFile());
        } catch (IOException e) {
            throw new RuntimeException("공지사항 첨부파일 저장에 실패했습니다.", e);
        }

        return NoticeStoredFileDTO.builder()
                .originalFileName(safeOriginalFileName)
                .storedFileName(storedFileName)
                .filePath(savePath.toString())
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .build();
    }

    private void createUploadDirectory() {

        File directory =
                new File(uploadDir);

        if (!directory.exists()) {
            boolean created =
                    directory.mkdirs();

            if (!created) {
                throw new RuntimeException("공지사항 파일 저장 폴더 생성에 실패했습니다.");
            }
        }
    }

    public Resource loadFileAsResource(
            String filePath
    ) {

        try {
            Path path =
                    Paths.get(filePath)
                            .toAbsolutePath()
                            .normalize();

            Resource resource =
                    new UrlResource(path.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException("파일을 읽을 수 없습니다.");
            }

            return resource;

        } catch (MalformedURLException e) {
            throw new RuntimeException("파일 경로가 올바르지 않습니다.", e);
        }
    }

    public void deleteFile(
            String filePath
    ) {

        if (filePath == null || filePath.isBlank()) {
            return;
        }

        try {
            Path path =
                    Paths.get(filePath)
                            .toAbsolutePath()
                            .normalize();

            Files.deleteIfExists(path);

        } catch (IOException e) {
            throw new RuntimeException("공지사항 첨부파일 삭제에 실패했습니다.", e);
        }
    }
}