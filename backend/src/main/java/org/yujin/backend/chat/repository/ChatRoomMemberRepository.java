package org.yujin.backend.chat.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.yujin.backend.chat.domain.ChatRoom;
import org.yujin.backend.chat.domain.ChatRoomMember;
import org.yujin.backend.member.domain.Member;

public interface ChatRoomMemberRepository extends JpaRepository<ChatRoomMember, Long> {

    Optional<ChatRoomMember> findByRoomAndMember(
            ChatRoom room,
            Member member
    );

    List<ChatRoomMember> findByRoom(
            ChatRoom room
    );

    boolean existsByRoomAndMember(
            ChatRoom room,
            Member member
    );

    @Query("""
            select rm
            from ChatRoomMember rm
            where rm.room.id = :roomId
              and rm.member.employeeNo = :employeeNo
            """)
    Optional<ChatRoomMember> findByRoomIdAndEmployeeNo(
            @Param("roomId") Long roomId,
            @Param("employeeNo") String employeeNo
    );

    @Query("""
            select count(rm)
            from ChatRoomMember rm
            where rm.member.employeeNo = :employeeNo
              and rm.pinned = true
            """)
    long countPinnedRooms(
            @Param("employeeNo") String employeeNo
    );

    @Query("""
            select rm
            from ChatRoomMember rm
            where rm.room = :room
              and rm.hidden = true
            """)
    List<ChatRoomMember> findHiddenMembersByRoom(
            @Param("room") ChatRoom room
    );
}