import type { RefObject } from "react";

import type {
  ChatMessage,
  ChatParticipant,
  ChatRoom,
} from "../../types/chat";
import {
  departmentText,
  formatTime,
  presenceDotClass,
  presenceText,
  roleText,
} from "./messengerUtils";

interface MessengerRoomTabProps {
  rooms: ChatRoom[];
  selectedRoom: ChatRoom | null;
  messages: ChatMessage[];
  messageInput: string;
  messageEndRef: RefObject<HTMLDivElement | null>;

  participants: ChatParticipant[];
  participantPanelOpen: boolean;

  onOpenRoom: (room: ChatRoom) => void;
  onContextMenu: (room: ChatRoom, x: number, y: number) => void;
  onMessageInputChange: (value: string) => void;
  onSendMessage: () => void;
  onOpenGroupCreate: () => void;
  onToggleParticipants: () => void;
}

export default function MessengerRoomTab({
  rooms,
  selectedRoom,
  messages,
  messageInput,
  messageEndRef,
  participants,
  participantPanelOpen,
  onOpenRoom,
  onContextMenu,
  onMessageInputChange,
  onSendMessage,
  onOpenGroupCreate,
  onToggleParticipants,
}: MessengerRoomTabProps) {
  return (
    <div className="h-full min-h-0 flex bg-white">
      <div className="w-[210px] border-r border-slate-100 flex flex-col bg-white">
        <div className="shrink-0 p-3 border-b border-slate-100 flex items-center justify-between">
          <p className="font-bold text-slate-800">채팅방</p>

          <button
            type="button"
            onClick={onOpenGroupCreate}
            className="w-7 h-7 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
          >
            +
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-2 bg-white">
          {rooms.map((room) => (
            <button
              key={room.roomId}
              type="button"
              onClick={() => onOpenRoom(room)}
              onContextMenu={(e) => {
                e.preventDefault();
                onContextMenu(room, e.clientX, e.clientY);
              }}
              className={`w-full rounded-2xl px-3 py-2.5 text-left mb-1 transition ${selectedRoom?.roomId === room.roomId
                  ? "bg-blue-50"
                  : "hover:bg-slate-50"
                }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-700 truncate">
                    {room.pinned ? "📌 " : ""}
                    {room.displayName}
                  </p>

                  <p className="text-xs text-slate-400 mt-1 truncate">
                    {room.lastMessage || "메시지가 없습니다."}
                  </p>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className="text-[10px] text-slate-300">
                    {formatTime(room.lastMessageTime)}
                  </span>

                  {room.unreadCount > 0 && (
                    <span className="min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] flex items-center justify-center">
                      {room.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}

          {rooms.length === 0 && (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 text-center px-4">
              채팅방이 없습니다.
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col bg-white relative">
        {!selectedRoom && (
          <div className="h-full flex items-center justify-center text-sm text-slate-400">
            채팅방을 선택해주세요.
          </div>
        )}

        {selectedRoom && (
          <>
            <div className="shrink-0 px-4 py-3 border-b border-slate-100 bg-white flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">
                  {selectedRoom.displayName}
                </p>

                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedRoom.roomType === "DIRECT"
                    ? "1:1 채팅"
                    : "그룹 채팅"}
                </p>
              </div>

              {selectedRoom.roomType === "GROUP" && (
                <button
                  type="button"
                  onClick={onToggleParticipants}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
                >
                  참여자 목록
                </button>
              )}
            </div>

            {participantPanelOpen && selectedRoom.roomType === "GROUP" && (
              <div className="absolute right-4 top-[58px] z-20 w-[240px] max-h-[360px] bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="font-bold text-slate-800 text-sm">
                    참여자 {participants.length}명
                  </p>
                </div>

                <div className="max-h-[300px] overflow-y-auto p-2">
                  {participants.map((participant) => (
                    <div
                      key={participant.employeeNo}
                      className="px-3 py-2 rounded-xl hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-700 truncate">
                            {participant.name}
                          </p>

                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            {participant.employeeNo} ·{" "}
                            {departmentText(participant.department)} ·{" "}
                            {roleText(participant.highestRole)}
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${presenceDotClass(
                              participant.presenceStatus
                            )}`}
                          />

                          <span className="text-[11px] text-slate-400">
                            {presenceText(participant.presenceStatus)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {participants.length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-400">
                      참여자가 없습니다.
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end gap-1.5 ${message.mine ? "justify-end" : "justify-start"
                    }`}
                >
                  {message.mine && message.unreadCount > 0 && (
                    <span className="mb-1 text-[10px] font-bold text-amber-500">
                      {message.unreadCount}
                    </span>
                  )}

                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${message.mine
                        ? "bg-white text-slate-700 border border-slate-200"
                        : "bg-[#3B82F6] text-white"
                      }`}
                  >
                    {!message.mine && (
                      <p className="text-[11px] font-semibold text-blue-100 mb-1">
                        {message.senderName}
                      </p>
                    )}

                    <p className="whitespace-pre-wrap break-words">
                      {message.content}
                    </p>

                    <p
                      className={`text-[10px] mt-1 text-right ${message.mine ? "text-slate-300" : "text-blue-100"
                        }`}
                    >
                      {formatTime(message.createdAt)}
                    </p>
                  </div>

                  {!message.mine && message.unreadCount > 0 && (
                    <span className="mb-1 text-[10px] font-bold text-amber-500">
                      {message.unreadCount}
                    </span>
                  )}
                </div>
              ))}

              <div ref={messageEndRef} />
            </div>

            <div className="shrink-0 p-3 border-t border-slate-100 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => onMessageInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onSendMessage();
                    }
                  }}
                  placeholder="메시지를 입력하세요."
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                <button
                  type="button"
                  onClick={onSendMessage}
                  className="px-4 py-2.5 rounded-2xl bg-[#1E293B] text-white text-sm font-bold hover:bg-[#334155] transition"
                >
                  전송
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}