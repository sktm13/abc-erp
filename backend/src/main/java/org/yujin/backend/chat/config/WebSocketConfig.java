package org.yujin.backend.chat.config;

import java.util.Map;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.yujin.backend.util.JWTUtil;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(
            MessageBrokerRegistry registry
    ) {

        // 클라이언트가 구독하는 주소
        // 예: /sub/chat/room/1
        registry.enableSimpleBroker("/sub");

        // 클라이언트가 서버로 메시지를 보내는 주소
        // 예: /pub/chat/message
        registry.setApplicationDestinationPrefixes("/pub");
    }

    @Override
    public void registerStompEndpoints(
            StompEndpointRegistry registry
    ) {

        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("http://localhost:5173")
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(
            ChannelRegistration registration
    ) {

        registration.interceptors(new ChannelInterceptor() {

            @Override
            public Message<?> preSend(
                    Message<?> message,
                    MessageChannel channel
            ) {

                StompHeaderAccessor accessor =
                        StompHeaderAccessor.wrap(message);

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {

                    String authorization =
                            accessor.getFirstNativeHeader("Authorization");

                    if (authorization == null || authorization.isBlank()) {
                        authorization =
                                accessor.getFirstNativeHeader("authorization");
                    }

                    if (authorization == null || !authorization.startsWith("Bearer ")) {
                        throw new MessagingException("WebSocket 인증 토큰이 없습니다.");
                    }

                    String token =
                            authorization.substring(7);

                    Map<String, Object> claims =
                            JWTUtil.validateToken(token);

                    String employeeNo =
                            (String) claims.get("employeeNo");

                    if (employeeNo == null || employeeNo.isBlank()) {
                        throw new MessagingException("WebSocket 인증 정보가 올바르지 않습니다.");
                    }

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    employeeNo,
                                    null,
                                    null
                            );

                    accessor.setUser(authentication);
                }

                return message;
            }
        });
    }
}