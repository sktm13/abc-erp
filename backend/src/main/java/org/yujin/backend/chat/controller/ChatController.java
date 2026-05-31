package org.yujin.backend.chat.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.yujin.backend.chat.dto.ChatEmployeeListDTO;
import org.yujin.backend.chat.dto.ChatMessageDTO;
import org.yujin.backend.chat.dto.ChatParticipantDTO;
import org.yujin.backend.chat.dto.ChatRoomDTO;
import org.yujin.backend.chat.dto.GroupRoomCreateDTO;
import org.yujin.backend.chat.service.ChatService;
import org.yujin.backend.member.dto.MemberDTO;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {

        private final ChatService chatService;

        // 메신저 사원목록 조회
        @GetMapping("/employees")
        public ChatEmployeeListDTO getEmployeeList(
                        @AuthenticationPrincipal MemberDTO memberDTO) {

                return chatService.getEmployeeList(
                                memberDTO.getUsername());
        }

        // 내 채팅방 목록 조회
        @GetMapping("/rooms")
        public List<ChatRoomDTO> getMyRooms(
                        @AuthenticationPrincipal MemberDTO memberDTO) {

                return chatService.getMyRooms(
                                memberDTO.getUsername());
        }

        // 1:1 채팅방 생성 또는 기존 방 조회
        @PostMapping("/rooms/direct/{targetEmployeeNo}")
        public ChatRoomDTO getOrCreateDirectRoom(
                        @AuthenticationPrincipal MemberDTO memberDTO,
                        @PathVariable("targetEmployeeNo") String targetEmployeeNo) {

                return chatService.getOrCreateDirectRoom(
                                memberDTO.getUsername(),
                                targetEmployeeNo);
        }

        // 그룹 채팅방 생성
        @PostMapping("/rooms/group")
        public ChatRoomDTO createGroupRoom(
                        @AuthenticationPrincipal MemberDTO memberDTO,
                        @RequestBody GroupRoomCreateDTO requestDTO) {

                return chatService.createGroupRoom(
                                memberDTO.getUsername(),
                                requestDTO);
        }

        // 채팅방 메시지 내역 조회
        @GetMapping("/rooms/{roomId}/messages")
        public List<ChatMessageDTO> getMessages(
                        @AuthenticationPrincipal MemberDTO memberDTO,
                        @PathVariable("roomId") Long roomId) {

                return chatService.getMessages(
                                memberDTO.getUsername(),
                                roomId);
        }

        // 채팅방 참여자 목록 조회
        @GetMapping("/rooms/{roomId}/participants")
        public List<ChatParticipantDTO> getRoomParticipants(
                        @AuthenticationPrincipal MemberDTO memberDTO,
                        @PathVariable("roomId") Long roomId) {

                return chatService.getRoomParticipants(
                                memberDTO.getUsername(),
                                roomId);
        }

        // 채팅방 맨위 고정
        @PutMapping("/rooms/{roomId}/pin")
        public Map<String, String> pinRoom(
                        @AuthenticationPrincipal MemberDTO memberDTO,
                        @PathVariable("roomId") Long roomId) {

                chatService.pinRoom(
                                memberDTO.getUsername(),
                                roomId);

                return Map.of("result", "pinned");
        }

        // 채팅방 고정 해제
        @PutMapping("/rooms/{roomId}/unpin")
        public Map<String, String> unpinRoom(
                        @AuthenticationPrincipal MemberDTO memberDTO,
                        @PathVariable("roomId") Long roomId) {

                chatService.unpinRoom(
                                memberDTO.getUsername(),
                                roomId);

                return Map.of("result", "unpinned");
        }

        // 채팅방 나가기
        // 실제 채팅방 삭제가 아니라 내 목록에서만 hidden 처리
        @DeleteMapping("/rooms/{roomId}/hide")
        public Map<String, String> hideRoom(
                        @AuthenticationPrincipal MemberDTO memberDTO,
                        @PathVariable("roomId") Long roomId) {

                chatService.hideRoom(
                                memberDTO.getUsername(),
                                roomId);

                return Map.of("result", "hidden");
        }
}