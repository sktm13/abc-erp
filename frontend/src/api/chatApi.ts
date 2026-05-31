import jwtAxios from "./jwtAxios";
import type {
  ChatEmployeeList,
  ChatMessage,
  ChatParticipant,
  ChatRoom,
  GroupRoomCreateRequest,
} from "../types/chat";

export const getChatEmployees = async (): Promise<ChatEmployeeList> => {
  const res = await jwtAxios.get("/api/chat/employees");

  return res.data;
};

export const getMyChatRooms = async (): Promise<ChatRoom[]> => {
  const res = await jwtAxios.get("/api/chat/rooms");

  return res.data;
};

export const getOrCreateDirectRoom = async (
  targetEmployeeNo: string
): Promise<ChatRoom> => {
  const res = await jwtAxios.post(
    `/api/chat/rooms/direct/${targetEmployeeNo}`
  );

  return res.data;
};

export const createGroupRoom = async (
  data: GroupRoomCreateRequest
): Promise<ChatRoom> => {
  const res = await jwtAxios.post("/api/chat/rooms/group", data);

  return res.data;
};

export const getChatMessages = async (
  roomId: number
): Promise<ChatMessage[]> => {
  const res = await jwtAxios.get(`/api/chat/rooms/${roomId}/messages`);

  return res.data;
};

export const getChatParticipants = async (
  roomId: number
): Promise<ChatParticipant[]> => {
  const res = await jwtAxios.get(
    `/api/chat/rooms/${roomId}/participants`
  );

  return res.data;
};

export const pinChatRoom = async (
  roomId: number
): Promise<{ result: string }> => {
  const res = await jwtAxios.put(`/api/chat/rooms/${roomId}/pin`);

  return res.data;
};

export const unpinChatRoom = async (
  roomId: number
): Promise<{ result: string }> => {
  const res = await jwtAxios.put(`/api/chat/rooms/${roomId}/unpin`);

  return res.data;
};

export const hideChatRoom = async (
  roomId: number
): Promise<{ result: string }> => {
  const res = await jwtAxios.delete(`/api/chat/rooms/${roomId}/hide`);

  return res.data;
};