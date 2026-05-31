package org.yujin.backend.chat.domain;

import java.time.LocalDateTime;

import org.yujin.backend.member.domain.Member;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "chat_room_member")
public class ChatRoomMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 참여 중인 채팅방
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private ChatRoom room;

    // 참여 사원
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_employee_no")
    private Member member;

    // 내 채팅방 목록에서 숨김 여부
    private boolean hidden;

    // 숨김 처리 시각
    private LocalDateTime hiddenAt;

    /*
     * 이 사용자가 볼 수 있는 메시지 시작 기준
     *
     * null이면 전체 메시지 조회 가능
     * 값이 있으면 해당 messageId보다 큰 메시지만 조회
     *
     * 예:
     * visibleAfterMessageId = 100
     * → 101번 메시지부터 조회 가능
     */
    private Long visibleAfterMessageId;

    // 맨위 고정 여부
    private boolean pinned;

    // 고정한 시각
    private LocalDateTime pinnedAt;

    // 마지막으로 읽은 메시지 ID
    private Long lastReadMessageId;

    // 채팅방 참여 시각
    private LocalDateTime joinedAt;

    @PrePersist
    public void prePersist() {
        this.joinedAt = LocalDateTime.now();
    }

    public void hide(Long lastMessageId) {
        this.hidden = true;
        this.hiddenAt = LocalDateTime.now();
        this.visibleAfterMessageId = lastMessageId;
        this.pinned = false;
        this.pinnedAt = null;
    }

    public void show() {
        this.hidden = false;
        this.hiddenAt = null;
    }

    public void pin() {
        this.pinned = true;
        this.pinnedAt = LocalDateTime.now();
    }

    public void unpin() {
        this.pinned = false;
        this.pinnedAt = null;
    }

    public void changeLastReadMessageId(Long lastReadMessageId) {
        this.lastReadMessageId = lastReadMessageId;
    }
}