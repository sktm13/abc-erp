package org.yujin.backend.chat.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.yujin.backend.chat.domain.ChatRoom;
import org.yujin.backend.chat.domain.ChatRoomType;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    /*
     * 1:1 채팅방 조회
     *
     * DIRECT 방 중에서
     * memberA와 memberB가 모두 참여자인 방을 찾는다.
     */
    @Query("""
            select r
            from ChatRoom r
            where r.roomType = :roomType
              and exists (
                    select 1
                    from ChatRoomMember rm1
                    where rm1.room = r
                      and rm1.member.employeeNo = :memberA
              )
              and exists (
                    select 1
                    from ChatRoomMember rm2
                    where rm2.room = r
                      and rm2.member.employeeNo = :memberB
              )
            """)
    Optional<ChatRoom> findDirectRoom(
            @Param("roomType") ChatRoomType roomType,
            @Param("memberA") String memberA,
            @Param("memberB") String memberB
    );

    /*
     * 내가 참여 중이고 숨김 처리하지 않은 채팅방 목록
     *
     * 고정 채팅방 우선
     * 고정 채팅방끼리는 pinnedAt 최신순
     * 일반 채팅방은 lastMessageAt 최신순
     */
    @Query("""
            select r
            from ChatRoom r
            join ChatRoomMember rm on rm.room = r
            where rm.member.employeeNo = :employeeNo
              and rm.hidden = false
            order by
              rm.pinned desc,
              rm.pinnedAt desc,
              r.lastMessageAt desc
            """)
    List<ChatRoom> findVisibleRoomsByEmployeeNo(
            @Param("employeeNo") String employeeNo
    );
}