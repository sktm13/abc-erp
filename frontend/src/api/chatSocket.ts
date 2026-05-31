import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import { getCookie } from "../util/cookieUtil";
import type { ChatMessage, ChatMessageRequest } from "../types/chat";

const API_SERVER_HOST = import.meta.env.VITE_API_SERVER;

let stompClient: Client | null = null;

let connecting = false;

const connectCallbacks: (() => void)[] = [];

const pendingMessages: ChatMessageRequest[] = [];

const getAccessToken = () => {
  const memberInfo = getCookie("member");

  if (!memberInfo?.accessToken) {
    throw new Error("REQUIRE_LOGIN");
  }

  return memberInfo.accessToken;
};

const publishMessage = (request: ChatMessageRequest) => {
  if (!stompClient?.connected) {
    return;
  }

  const accessToken = getAccessToken();

  stompClient.publish({
    destination: "/pub/chat/message",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  });
};

const flushPendingMessages = () => {
  if (!stompClient?.connected) {
    return;
  }

  while (pendingMessages.length > 0) {
    const request = pendingMessages.shift();

    if (!request) {
      continue;
    }

    publishMessage(request);
  }
};

export const connectChatSocket = (
  onConnect?: () => void
) => {
  if (stompClient?.connected) {
    onConnect?.();
    return stompClient;
  }

  if (onConnect) {
    connectCallbacks.push(onConnect);
  }

  if (connecting && stompClient) {
    return stompClient;
  }

  connecting = true;

  const accessToken = getAccessToken();

  stompClient = new Client({
    webSocketFactory: () =>
      new SockJS(`${API_SERVER_HOST}/ws`),

    connectHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },

    reconnectDelay: 5000,

    onConnect: () => {
      console.log("Chat WebSocket connected");

      connecting = false;

      while (connectCallbacks.length > 0) {
        const callback = connectCallbacks.shift();

        callback?.();
      }

      flushPendingMessages();
    },

    onStompError: (frame) => {
      console.error("Chat WebSocket STOMP error", frame);

      connecting = false;
    },

    onWebSocketError: (error) => {
      console.error("Chat WebSocket error", error);

      connecting = false;
    },

    onDisconnect: () => {
      console.log("Chat WebSocket disconnected");

      connecting = false;
    },
  });

  stompClient.activate();

  return stompClient;
};

export const disconnectChatSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }

  connecting = false;
  connectCallbacks.length = 0;
  pendingMessages.length = 0;
};

export const subscribeChatRoom = (
  roomId: number,
  callback: (message: ChatMessage) => void
) => {
  if (!stompClient || !stompClient.connected) {
    throw new Error("WEBSOCKET_NOT_CONNECTED");
  }

  return stompClient.subscribe(
    `/sub/chat/room/${roomId}`,
    (frame) => {
      const message: ChatMessage = JSON.parse(frame.body);

      callback(message);
    }
  );
};

export const sendChatMessage = (
  request: ChatMessageRequest
) => {
  if (!stompClient || !stompClient.connected) {
    pendingMessages.push(request);
    connectChatSocket();
    return;
  }

  publishMessage(request);
};