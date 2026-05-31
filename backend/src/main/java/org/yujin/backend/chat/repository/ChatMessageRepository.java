package org.yujin.backend.chat.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.yujin.backend.chat.domain.ChatMessage;
import org.yujin.backend.chat.domain.ChatRoom;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByRoomOrderByIdAsc(
            ChatRoom room
    );

    List<ChatMessage> findByRoomAndIdGreaterThanOrderByIdAsc(
            ChatRoom room,
            Long messageId
    );

    Optional<ChatMessage> findTopByRoomOrderByIdDesc(
            ChatRoom room
    );

    @Query("""
            select count(m)
            from ChatMessage m
            where m.room = :room
              and m.id > :lastReadMessageId
              and m.sender.employeeNo <> :employeeNo
            """)
    long countUnreadMessages(
            @Param("room") ChatRoom room,
            @Param("lastReadMessageId") Long lastReadMessageId,
            @Param("employeeNo") String employeeNo
    );

    @Query("""
            select count(m)
            from ChatMessage m
            where m.room = :room
              and m.sender.employeeNo <> :employeeNo
            """)
    long countUnreadMessagesWhenNeverRead(
            @Param("room") ChatRoom room,
            @Param("employeeNo") String employeeNo
    );
}