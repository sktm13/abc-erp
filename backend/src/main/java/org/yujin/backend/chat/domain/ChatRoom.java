package org.yujin.backend.chat.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "chat_room")
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // DIRECT = 1:1 채팅방, GROUP = 그룹 채팅방
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChatRoomType roomType;

    // 그룹 채팅방 이름
    // 1:1 채팅방은 null 가능
    private String roomName;

    private LocalDateTime createdAt;

    // 채팅방 목록 정렬용
    // 메시지가 생성될 때마다 최신 메시지 시간으로 갱신
    private LocalDateTime lastMessageAt;

    public void changeRoomName(String roomName) {
        this.roomName = roomName;
    }

    public void updateLastMessageAt(LocalDateTime lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();

        if (this.lastMessageAt == null) {
            this.lastMessageAt = this.createdAt;
        }
    }
}