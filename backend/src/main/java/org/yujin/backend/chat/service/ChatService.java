package org.yujin.backend.chat.service;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;
import org.yujin.backend.chat.dto.ChatEmployeeListDTO;
import org.yujin.backend.chat.dto.ChatMessageDTO;
import org.yujin.backend.chat.dto.ChatMessageRequestDTO;
import org.yujin.backend.chat.dto.ChatParticipantDTO;
import org.yujin.backend.chat.dto.ChatRoomDTO;
import org.yujin.backend.chat.dto.GroupRoomCreateDTO;

@Transactional
public interface ChatService {

    // 메신저 사원목록 조회
    ChatEmployeeListDTO getEmployeeList(
            String employeeNo
    );

    // 내 채팅방 목록 조회
    List<ChatRoomDTO> getMyRooms(
            String employeeNo
    );

    // 1:1 채팅방 생성 또는 기존 방 조회
    ChatRoomDTO getOrCreateDirectRoom(
            String myEmployeeNo,
            String targetEmployeeNo
    );

    // 그룹 채팅방 생성
    ChatRoomDTO createGroupRoom(
            String creatorEmployeeNo,
            GroupRoomCreateDTO requestDTO
    );

    // 채팅방 메시지 조회
    List<ChatMessageDTO> getMessages(
            String employeeNo,
            Long roomId
    );

    // 채팅방 참여자 목록 조회
    List<ChatParticipantDTO> getRoomParticipants(
            String employeeNo,
            Long roomId
    );

    // 메시지 저장
    ChatMessageDTO saveMessage(
            String senderEmployeeNo,
            ChatMessageRequestDTO requestDTO
    );

    // 채팅방 고정
    void pinRoom(
            String employeeNo,
            Long roomId
    );

    // 채팅방 고정 해제
    void unpinRoom(
            String employeeNo,
            Long roomId
    );

    // 채팅방 나가기
    void hideRoom(
            String employeeNo,
            Long roomId
    );
}