package org.yujin.backend.chat.controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.yujin.backend.chat.dto.ChatMessageDTO;
import org.yujin.backend.chat.dto.ChatMessageRequestDTO;
import org.yujin.backend.chat.service.ChatService;
import org.yujin.backend.util.JWTUtil;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class ChatMessageController {

    private final ChatService chatService;

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/message")
    public void sendMessage(
            @Payload ChatMessageRequestDTO requestDTO,
            SimpMessageHeaderAccessor headerAccessor
    ) {

        String senderEmployeeNo =
                extractEmployeeNo(headerAccessor);

        ChatMessageDTO savedMessage =
                chatService.saveMessage(
                        senderEmployeeNo,
                        requestDTO
                );

        messagingTemplate.convertAndSend(
                "/sub/chat/room/" + savedMessage.getRoomId(),
                savedMessage
        );
    }

    private String extractEmployeeNo(
            SimpMessageHeaderAccessor headerAccessor
    ) {

        Principal principal =
                headerAccessor.getUser();

        if (principal != null
                && principal.getName() != null
                && !principal.getName().isBlank()) {
            return principal.getName();
        }

        String authorization =
                getNativeHeader(headerAccessor, "Authorization");

        if (authorization == null || authorization.isBlank()) {
            authorization =
                    getNativeHeader(headerAccessor, "authorization");
        }

        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new RuntimeException("WebSocket 인증 정보가 없습니다.");
        }

        String token =
                authorization.substring(7);

        Map<String, Object> claims =
                JWTUtil.validateToken(token);

        String employeeNo =
                (String) claims.get("employeeNo");

        if (employeeNo == null || employeeNo.isBlank()) {
            throw new RuntimeException("WebSocket 인증 정보가 올바르지 않습니다.");
        }

        return employeeNo;
    }

    private String getNativeHeader(
            SimpMessageHeaderAccessor headerAccessor,
            String headerName
    ) {

        List<String> values =
                headerAccessor.getNativeHeader(headerName);

        if (values == null || values.isEmpty()) {
            return null;
        }

        return values.get(0);
    }
}