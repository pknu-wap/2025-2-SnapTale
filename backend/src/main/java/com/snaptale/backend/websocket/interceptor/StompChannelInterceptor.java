package com.snaptale.backend.websocket.interceptor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class StompChannelInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor != null) {
            StompCommand command = accessor.getCommand();
            String sessionId = accessor.getSessionId();
            
            if (StompCommand.CONNECT.equals(command)) {
                log.info("=== STOMP CONNECT ===");
                log.info("Session ID: {}", sessionId);
                log.info("Headers: {}", accessor.toNativeHeaderMap());
            } else if (StompCommand.SUBSCRIBE.equals(command)) {
                log.info("=== STOMP SUBSCRIBE ===");
                log.info("Session ID: {}", sessionId);
                log.info("Destination: {}", accessor.getDestination());
            } else if (StompCommand.SEND.equals(command)) {
                log.info("=== STOMP SEND ===");
                log.info("Session ID: {}", sessionId);
                log.info("Destination: {}", accessor.getDestination());
            } else if (StompCommand.DISCONNECT.equals(command)) {
                log.info("=== STOMP DISCONNECT ===");
                log.info("Session ID: {}", sessionId);
            }
        }
        
        return message;
    }

    @Override
    public void postSend(Message<?> message, MessageChannel channel, boolean sent) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor != null && StompCommand.CONNECTED.equals(accessor.getCommand())) {
            String sessionId = accessor.getSessionId();
            log.info("=== STOMP CONNECTED (응답) ===");
            log.info("Session ID: {}", sessionId);
        }
    }

    @Override
    public void afterSendCompletion(Message<?> message, MessageChannel channel, boolean sent, Exception ex) {
        if (ex != null) {
            StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
            if (accessor != null) {
                log.error("=== STOMP 메시지 전송 실패 ===");
                log.error("Command: {}", accessor.getCommand());
                log.error("Session ID: {}", accessor.getSessionId());
                log.error("Destination: {}", accessor.getDestination());
                log.error("Error: ", ex);
            }
        }
    }
}

