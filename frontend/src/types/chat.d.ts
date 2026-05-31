export type ChatRoomType = "DIRECT" | "GROUP";

export type MessengerTab = "EMPLOYEE" | "ROOM";

export type PresenceStatus = "ONLINE" | "AWAY" | "OFFLINE";

export interface ChatEmployee {
  employeeNo: string;
  name: string;
  department: string;
  departmentName: string;
  presenceStatus: PresenceStatus;
  highestRole: string;
}

export interface ChatParticipant {
  employeeNo: string;
  name: string;
  department: string;
  departmentName: string;
  presenceStatus: PresenceStatus;
  highestRole: string;
}

export interface ChatDepartment {
  department: string;
  departmentName: string;
  members: ChatEmployee[];
}

export interface ChatEmployeeList {
  me: ChatEmployee;
  departments: ChatDepartment[];
}

export interface ChatRoom {
  roomId: number;
  roomType: ChatRoomType;

  displayName: string;

  targetEmployeeNo: string | null;
  targetName: string | null;
  targetDepartment: string | null;
  targetPresenceStatus: PresenceStatus | null;

  lastMessage: string | null;
  lastMessageTime: string | null;

  pinned: boolean;
  unreadCount: number;
}

export interface ChatMessage {
  id: number;
  roomId: number;

  senderEmployeeNo: string;
  senderName: string;
  senderDepartment: string;

  content: string;
  createdAt: string;

  mine: boolean;

  unreadCount: number;
}

export interface ChatMessageRequest {
  roomId: number;
  content: string;
}

export interface GroupRoomCreateRequest {
  roomName: string;
  memberEmployeeNos: string[];
}