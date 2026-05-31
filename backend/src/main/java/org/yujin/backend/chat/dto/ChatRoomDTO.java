package org.yujin.backend.chat.dto;

import java.time.LocalDateTime;

import org.yujin.backend.chat.domain.ChatRoomType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatRoomDTO {

    private Long roomId;

    private ChatRoomType roomType;

    // GROUP이면 방 이름, DIRECT면 상대방 이름
    private String displayName;

    // DIRECT 채팅방일 때 상대 사원 정보
    private String targetEmployeeNo;

    private String targetName;

    private String targetDepartment;

    private String targetPresenceStatus;

    // 마지막 메시지
    private String lastMessage;

    private LocalDateTime lastMessageTime;

    // 내 기준 고정 여부
    private boolean pinned;

    // 안읽은 메시지 수
    private long unreadCount;
}