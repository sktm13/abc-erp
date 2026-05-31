package org.yujin.backend.chat.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageDTO {

    private Long id;

    private Long roomId;

    private String senderEmployeeNo;

    private String senderName;

    private String senderDepartment;

    private String content;

    private LocalDateTime createdAt;

    // 내가 보낸 메시지인지 여부
    private boolean mine;

    // 이 메시지를 아직 읽지 않은 사람 수
    private long unreadCount;
}