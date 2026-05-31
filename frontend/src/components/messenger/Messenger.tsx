import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import type { StompSubscription } from "@stomp/stompjs";

import {
  createGroupRoom,
  getChatEmployees,
  getChatMessages,
  getChatParticipants,
  getMyChatRooms,
  getOrCreateDirectRoom,
  hideChatRoom,
  pinChatRoom,
  unpinChatRoom,
} from "../../api/chatApi";
import { changeMyPresenceStatus } from "../../api/memberApi";
import {
  connectChatSocket,
  sendChatMessage,
  subscribeChatRoom,
} from "../../api/chatSocket";
import useCustomLogin from "../../hooks/useCustomLogin";
import type {
  ChatEmployee,
  ChatEmployeeList,
  ChatMessage,
  ChatParticipant,
  ChatRoom,
  MessengerTab,
  PresenceStatus,
} from "../../types/chat";

import GroupChatCreateModal from "./GroupChatCreateModal";
import MessengerEmployeeTab from "./MessengerEmployeeTab";
import MessengerRoomTab from "./MessengerRoomTab";

export default function Messenger() {
  const { loginState, doSave } = useCustomLogin();

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MessengerTab>("EMPLOYEE");

  const [employeeList, setEmployeeList] =
    useState<ChatEmployeeList | null>(null);

  const [openedDepartments, setOpenedDepartments] = useState<string[]>([]);
  const [selectedEmployee, setSelectedEmployee] =
    useState<ChatEmployee | null>(null);

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");

  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [participantPanelOpen, setParticipantPanelOpen] = useState(false);

  const [groupModalOpen, setGroupModalOpen] = useState(false);

  const [contextMenu, setContextMenu] = useState<{
    room: ChatRoom;
    x: number;
    y: number;
  } | null>(null);

  const subscriptionRef = useRef<StompSubscription | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const totalUnreadCount = useMemo(() => {
    return rooms.reduce((sum, room) => sum + room.unreadCount, 0);
  }, [rooms]);

  const fetchEmployees = async () => {
    try {
      const result = await getChatEmployees();

      setEmployeeList(result);
    } catch (e) {
      console.error(e);
      alert("메신저 사원목록을 불러오지 못했습니다.");
    }
  };

  const fetchRooms = async () => {
    try {
      const result = await getMyChatRooms();

      setRooms(result);
    } catch (e) {
      console.error(e);
      alert("채팅방 목록을 불러오지 못했습니다.");
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    fetchEmployees();
    fetchRooms();

    connectChatSocket();
  }, [open]);

  useEffect(() => {
    setEmployeeList((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        me: {
          ...prev.me,
          presenceStatus:
            (loginState.presenceStatus as PresenceStatus) || "OFFLINE",
        },
      };
    });
  }, [loginState.presenceStatus]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    return () => {
      subscriptionRef.current?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!contextMenu) {
      return;
    }

    const closeContextMenu = () => {
      setContextMenu(null);
    };

    window.addEventListener("click", closeContextMenu);
    window.addEventListener("scroll", closeContextMenu, true);

    return () => {
      window.removeEventListener("click", closeContextMenu);
      window.removeEventListener("scroll", closeContextMenu, true);
    };
  }, [contextMenu]);

  const normalizeMessage = (message: ChatMessage): ChatMessage => {
    return {
      ...message,
      mine: message.senderEmployeeNo === loginState.employeeNo,
    };
  };

  const toggleDepartment = (department: string) => {
    setOpenedDepartments((prev) => {
      if (prev.includes(department)) {
        return prev.filter((item) => item !== department);
      }

      return [...prev, department];
    });
  };

  const handlePresenceChange = async (presenceStatus: PresenceStatus) => {
    try {
      await changeMyPresenceStatus(presenceStatus);

      doSave({
        ...loginState,
        presenceStatus,
      });

      setEmployeeList((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          me: {
            ...prev.me,
            presenceStatus,
          },
        };
      });
    } catch (e) {
      console.error(e);
      alert("현재 상태 변경에 실패했습니다.");
    }
  };

  const handleCreateDirectRoom = async () => {
    if (!selectedEmployee) {
      return;
    }

    try {
      const room = await getOrCreateDirectRoom(
        selectedEmployee.employeeNo
      );

      setActiveTab("ROOM");
      setSelectedEmployee(null);

      await fetchRooms();
      await openRoom(room);
    } catch (e: unknown) {
      console.error(e);

      if (axios.isAxiosError(e)) {
        const message =
          e.response?.data?.message ||
          e.response?.data?.error ||
          e.response?.data;

        if (message) {
          alert(message);
          return;
        }
      }

      alert("채팅방을 생성하지 못했습니다.");
    }
  };

  const handleCreateGroupRoom = async (
    roomName: string,
    memberEmployeeNos: string[]
  ) => {
    try {
      const room = await createGroupRoom({
        roomName,
        memberEmployeeNos,
      });

      setGroupModalOpen(false);
      setActiveTab("ROOM");

      await fetchRooms();
      await openRoom(room);
    } catch (e: unknown) {
      console.error(e);

      if (axios.isAxiosError(e)) {
        const message =
          e.response?.data?.message ||
          e.response?.data?.error ||
          e.response?.data;

        if (message) {
          alert(message);
          return;
        }
      }

      alert("그룹채팅 생성에 실패했습니다.");
    }
  };

  const openRoom = async (room: ChatRoom) => {
    try {
      subscriptionRef.current?.unsubscribe();

      setSelectedRoom(room);
      setActiveTab("ROOM");
      setParticipants([]);
      setParticipantPanelOpen(false);

      const result = await getChatMessages(room.roomId);

      setMessages(result.map(normalizeMessage));

      connectChatSocket(() => {
        subscriptionRef.current = subscribeChatRoom(
          room.roomId,
          (message) => {
            const normalizedMessage = normalizeMessage(message);

            setMessages((prev) => {
              const duplicated = prev.some(
                (item) => item.id === normalizedMessage.id
              );

              if (duplicated) {
                return prev;
              }

              return [...prev, normalizedMessage];
            });

            fetchRooms();
          }
        );
      });

      fetchRooms();
    } catch (e) {
      console.error(e);
      alert("채팅방 메시지를 불러오지 못했습니다.");
    }
  };

  const handleSendMessage = () => {
    if (!selectedRoom) {
      return;
    }

    if (!messageInput.trim()) {
      return;
    }

    try {
      sendChatMessage({
        roomId: selectedRoom.roomId,
        content: messageInput.trim(),
      });

      setMessageInput("");
    } catch (e) {
      console.error(e);
      alert("메시지 전송에 실패했습니다.");
    }
  };

  const handlePinRoom = async (room: ChatRoom) => {
    try {
      if (room.pinned) {
        await unpinChatRoom(room.roomId);
      } else {
        await pinChatRoom(room.roomId);
      }

      setContextMenu(null);
      await fetchRooms();
    } catch (e: unknown) {
      console.error(e);

      if (axios.isAxiosError(e)) {
        const message =
          e.response?.data?.message ||
          e.response?.data?.error ||
          e.response?.data;

        if (message) {
          alert(message);
          return;
        }
      }

      alert("채팅방 고정 상태 변경에 실패했습니다.");
    }
  };

  const handleHideRoom = async (room: ChatRoom) => {
    if (!window.confirm("채팅방을 나가시겠습니까?")) {
      return;
    }

    try {
      await hideChatRoom(room.roomId);

      setContextMenu(null);

      if (selectedRoom?.roomId === room.roomId) {
        setSelectedRoom(null);
        setMessages([]);
        setParticipants([]);
        setParticipantPanelOpen(false);
        subscriptionRef.current?.unsubscribe();
      }

      await fetchRooms();
    } catch (e) {
      console.error(e);
      alert("채팅방 나가기에 실패했습니다.");
    }
  };

  const handleContextMenu = (
    room: ChatRoom,
    x: number,
    y: number
  ) => {
    setContextMenu({
      room,
      x,
      y,
    });
  };

  const handleToggleParticipants = async () => {
    if (!selectedRoom) {
      return;
    }

    if (selectedRoom.roomType !== "GROUP") {
      return;
    }

    if (participantPanelOpen) {
      setParticipantPanelOpen(false);
      return;
    }

    try {
      const result = await getChatParticipants(selectedRoom.roomId);

      setParticipants(result);
      setParticipantPanelOpen(true);
    } catch (e) {
      console.error(e);
      alert("참여자 목록을 불러오지 못했습니다.");
    }
  };

  const handleOpenGroupCreate = async () => {
    if (!employeeList) {
      await fetchEmployees();
    }

    setGroupModalOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed right-5 bottom-8 z-40 w-16 h-16 rounded-full bg-[#3B82F6] text-white shadow-xl hover:bg-blue-500 hover:-translate-y-1 transition text-2xl"
      >
        💬

        {totalUnreadCount > 0 && (
          <span className="absolute -right-1 -top-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white" />
        )}
      </button>

      {open && (
        <div className="fixed right-5 top-[120px] bottom-[112px] z-40 w-[720px] bg-white rounded-[30px] border border-slate-200 shadow-2xl shadow-slate-400/20 overflow-hidden flex flex-col">
          <div className="shrink-0 h-14 px-5 bg-[#0F172A] flex items-center justify-between">
            <p className="font-bold text-white">메신저</p>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-9 h-9 rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 min-h-0 bg-white">
            {activeTab === "EMPLOYEE" && (
              <MessengerEmployeeTab
                employeeList={employeeList}
                openedDepartments={openedDepartments}
                selectedEmployee={selectedEmployee}
                onToggleDepartment={toggleDepartment}
                onSelectEmployee={setSelectedEmployee}
                onPresenceChange={handlePresenceChange}
                onCreateDirectRoom={handleCreateDirectRoom}
              />
            )}

            {activeTab === "ROOM" && (
              <MessengerRoomTab
                rooms={rooms}
                selectedRoom={selectedRoom}
                messages={messages}
                messageInput={messageInput}
                messageEndRef={messageEndRef}
                participants={participants}
                participantPanelOpen={participantPanelOpen}
                onOpenRoom={openRoom}
                onContextMenu={handleContextMenu}
                onMessageInputChange={setMessageInput}
                onSendMessage={handleSendMessage}
                onOpenGroupCreate={handleOpenGroupCreate}
                onToggleParticipants={handleToggleParticipants}
              />
            )}
          </div>

          <div className="shrink-0 h-14 border-t border-slate-100 grid grid-cols-2 bg-white">
            <button
              type="button"
              onClick={() => setActiveTab("EMPLOYEE")}
              className={`text-sm font-bold transition ${activeTab === "EMPLOYEE"
                ? "text-blue-600 bg-blue-50"
                : "text-slate-400 hover:bg-slate-50"
                }`}
            >
              사원목록
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("ROOM");
                fetchRooms();
              }}
              className={`relative text-sm font-bold transition ${activeTab === "ROOM"
                ? "text-blue-600 bg-blue-50"
                : "text-slate-400 hover:bg-slate-50"
                }`}
            >
              채팅방목록

              {totalUnreadCount > 0 && (
                <span className="absolute right-[38%] top-3 w-2 h-2 rounded-full bg-red-500" />
              )}
            </button>
          </div>
        </div>
      )}

      {contextMenu && (
        <div
          className="fixed z-50 w-40 bg-white rounded-2xl border border-slate-200 shadow-xl p-2"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => handlePinRoom(contextMenu.room)}
            className="w-full px-3 py-2 rounded-xl text-left text-sm text-slate-600 hover:bg-teal-50 hover:text-teal-700"
          >
            {contextMenu.room.pinned ? "고정 해제" : "맨위로 고정"}
          </button>

          <button
            type="button"
            onClick={() => handleHideRoom(contextMenu.room)}
            className="w-full px-3 py-2 rounded-xl text-left text-sm text-red-500 hover:bg-red-50"
          >
            채팅방 나가기
          </button>
        </div>
      )}

      {groupModalOpen && (
        <GroupChatCreateModal
          employeeList={employeeList}
          myEmployeeNo={loginState.employeeNo}
          onClose={() => setGroupModalOpen(false)}
          onCreate={handleCreateGroupRoom}
        />
      )}
    </>
  );
}