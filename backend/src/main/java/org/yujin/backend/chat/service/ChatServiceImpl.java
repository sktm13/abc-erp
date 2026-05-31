package org.yujin.backend.chat.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.yujin.backend.chat.domain.ChatMessage;
import org.yujin.backend.chat.domain.ChatRoom;
import org.yujin.backend.chat.domain.ChatRoomMember;
import org.yujin.backend.chat.domain.ChatRoomType;
import org.yujin.backend.chat.dto.ChatDepartmentDTO;
import org.yujin.backend.chat.dto.ChatEmployeeDTO;
import org.yujin.backend.chat.dto.ChatEmployeeListDTO;
import org.yujin.backend.chat.dto.ChatMessageDTO;
import org.yujin.backend.chat.dto.ChatMessageRequestDTO;
import org.yujin.backend.chat.dto.ChatParticipantDTO;
import org.yujin.backend.chat.dto.ChatRoomDTO;
import org.yujin.backend.chat.dto.GroupRoomCreateDTO;
import org.yujin.backend.chat.repository.ChatMessageRepository;
import org.yujin.backend.chat.repository.ChatRoomMemberRepository;
import org.yujin.backend.chat.repository.ChatRoomRepository;
import org.yujin.backend.member.domain.Member;
import org.yujin.backend.member.domain.MemberRole;
import org.yujin.backend.member.domain.MemberStatus;
import org.yujin.backend.member.domain.PresenceStatus;
import org.yujin.backend.member.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatServiceImpl implements ChatService {

        private final ChatRoomRepository chatRoomRepository;

        private final ChatRoomMemberRepository chatRoomMemberRepository;

        private final ChatMessageRepository chatMessageRepository;

        private final MemberRepository memberRepository;

        private static final int MAX_PINNED_ROOM_COUNT = 3;

        private static final List<String> DEPARTMENT_ORDER = List.of("DEV", "HR", "PUR", "FIN", "OPS");

        @Override
        @Transactional(readOnly = true)
        public ChatEmployeeListDTO getEmployeeList(
                        String employeeNo) {

                Member me = memberRepository.getWithRoles(employeeNo);

                if (me == null) {
                        throw new RuntimeException("사원 정보를 찾을 수 없습니다.");
                }

                List<Member> activeMembers = memberRepository.findAll()
                                .stream()
                                .filter(member -> member.getStatus() == MemberStatus.ACTIVE)
                                .sorted(
                                                Comparator
                                                                .comparingInt(this::highestRoleOrder)
                                                                .thenComparing(Member::getEmployeeNo))
                                .toList();

                List<ChatDepartmentDTO> departments = DEPARTMENT_ORDER.stream()
                                .map(department -> ChatDepartmentDTO.builder()
                                                .department(department)
                                                .departmentName(departmentText(department))
                                                .members(
                                                                activeMembers.stream()
                                                                                .filter(member -> department.equals(
                                                                                                member.getDepartment()))
                                                                                .map(this::memberToEmployeeDTO)
                                                                                .toList())
                                                .build())
                                .toList();

                return ChatEmployeeListDTO.builder()
                                .me(memberToEmployeeDTO(me))
                                .departments(departments)
                                .build();
        }

        @Override
        @Transactional(readOnly = true)
        public List<ChatRoomDTO> getMyRooms(
                        String employeeNo) {

                Member me = getMember(employeeNo);

                List<ChatRoom> rooms = chatRoomRepository.findVisibleRoomsByEmployeeNo(employeeNo);

                return rooms.stream()
                                .map(room -> roomToDTO(room, me))
                                .toList();
        }

        @Override
        public ChatRoomDTO getOrCreateDirectRoom(
                        String myEmployeeNo,
                        String targetEmployeeNo) {

                if (myEmployeeNo.equals(targetEmployeeNo)) {
                        throw new RuntimeException("자기 자신과는 채팅할 수 없습니다.");
                }

                Member me = getMember(myEmployeeNo);

                Member target = getMember(targetEmployeeNo);

                if (target.getStatus() != MemberStatus.ACTIVE) {
                        throw new RuntimeException("재직 중인 사원과만 채팅할 수 있습니다.");
                }

                ChatRoom room = chatRoomRepository.findDirectRoom(
                                ChatRoomType.DIRECT,
                                myEmployeeNo,
                                targetEmployeeNo)
                                .orElseGet(() -> createDirectRoom(me, target));

                ChatRoomMember myRoomMember = chatRoomMemberRepository.findByRoomAndMember(room, me)
                                .orElseThrow(() -> new RuntimeException("채팅방 참여자 정보를 찾을 수 없습니다."));

                if (myRoomMember.isHidden()) {
                        myRoomMember.show();
                }

                return roomToDTO(room, me);
        }

        @Override
        public ChatRoomDTO createGroupRoom(
                        String creatorEmployeeNo,
                        GroupRoomCreateDTO requestDTO) {

                if (requestDTO.getRoomName() == null || requestDTO.getRoomName().isBlank()) {
                        throw new RuntimeException("그룹 채팅방 이름을 입력해주세요.");
                }

                if (requestDTO.getMemberEmployeeNos() == null
                                || requestDTO.getMemberEmployeeNos().isEmpty()) {
                        throw new RuntimeException("초대할 사원을 선택해주세요.");
                }

                Member creator = getMember(creatorEmployeeNo);

                ChatRoom room = ChatRoom.builder()
                                .roomType(ChatRoomType.GROUP)
                                .roomName(requestDTO.getRoomName())
                                .build();

                ChatRoom savedRoom = chatRoomRepository.save(room);

                List<String> participantNos = new ArrayList<>();

                participantNos.add(creatorEmployeeNo);

                requestDTO.getMemberEmployeeNos()
                                .stream()
                                .filter(employeeNo -> !participantNos.contains(employeeNo))
                                .forEach(participantNos::add);

                for (String employeeNo : participantNos) {
                        Member member = getMember(employeeNo);

                        if (member.getStatus() != MemberStatus.ACTIVE) {
                                continue;
                        }

                        ChatRoomMember roomMember = ChatRoomMember.builder()
                                        .room(savedRoom)
                                        .member(member)
                                        .hidden(false)
                                        .pinned(false)
                                        .build();

                        chatRoomMemberRepository.save(roomMember);
                }

                return roomToDTO(savedRoom, creator);
        }

        @Override
        public List<ChatMessageDTO> getMessages(
                        String employeeNo,
                        Long roomId) {

                Member me = getMember(employeeNo);

                ChatRoom room = getRoom(roomId);

                ChatRoomMember roomMember = getRoomMember(roomId, employeeNo);

                List<ChatMessage> messages;

                if (roomMember.getVisibleAfterMessageId() == null) {
                        messages = chatMessageRepository.findByRoomOrderByIdAsc(room);
                } else {
                        messages = chatMessageRepository.findByRoomAndIdGreaterThanOrderByIdAsc(
                                        room,
                                        roomMember.getVisibleAfterMessageId());
                }

                ChatMessage lastMessage = messages.isEmpty()
                                ? null
                                : messages.get(messages.size() - 1);

                if (lastMessage != null) {
                        roomMember.changeLastReadMessageId(
                                        lastMessage.getId());
                }

                return messages.stream()
                                .map(message -> messageToDTO(message, me))
                                .toList();
        }

        @Override
        @Transactional(readOnly = true)
        public List<ChatParticipantDTO> getRoomParticipants(
                        String employeeNo,
                        Long roomId) {

                ChatRoom room = getRoom(roomId);

                // 요청자가 이 채팅방 참여자인지 확인
                getRoomMember(roomId, employeeNo);

                return chatRoomMemberRepository.findByRoom(room)
                                .stream()
                                .filter(roomMember -> !roomMember.isHidden())
                                .map(ChatRoomMember::getMember)
                                .sorted(
                                                Comparator
                                                                .comparingInt(this::highestRoleOrder)
                                                                .thenComparing(Member::getEmployeeNo))
                                .map(this::memberToParticipantDTO)
                                .toList();
        }

        @Override
        public ChatMessageDTO saveMessage(
                        String senderEmployeeNo,
                        ChatMessageRequestDTO requestDTO) {

                if (requestDTO.getRoomId() == null) {
                        throw new RuntimeException("채팅방 정보가 없습니다.");
                }

                if (requestDTO.getContent() == null || requestDTO.getContent().isBlank()) {
                        throw new RuntimeException("메시지를 입력해주세요.");
                }

                Member sender = getMember(senderEmployeeNo);

                ChatRoom room = getRoom(requestDTO.getRoomId());

                getRoomMember(room.getId(), senderEmployeeNo);

                ChatMessage message = ChatMessage.builder()
                                .room(room)
                                .sender(sender)
                                .content(requestDTO.getContent())
                                .build();

                ChatMessage savedMessage = chatMessageRepository.save(message);

                room.updateLastMessageAt(
                                LocalDateTime.now());

                if (room.getRoomType() == ChatRoomType.DIRECT) {
                        List<ChatRoomMember> hiddenMembers = chatRoomMemberRepository.findHiddenMembersByRoom(room);

                        hiddenMembers.forEach(ChatRoomMember::show);
                }

                return messageToDTO(savedMessage, sender);
        }

        @Override
        public void pinRoom(
                        String employeeNo,
                        Long roomId) {

                ChatRoomMember roomMember = getRoomMember(roomId, employeeNo);

                if (roomMember.isPinned()) {
                        roomMember.pin();
                        return;
                }

                long pinnedCount = chatRoomMemberRepository.countPinnedRooms(employeeNo);

                if (pinnedCount >= MAX_PINNED_ROOM_COUNT) {
                        throw new RuntimeException("채팅방 고정은 최대 3개까지 가능합니다.");
                }

                roomMember.pin();
        }

        @Override
        public void unpinRoom(
                        String employeeNo,
                        Long roomId) {

                ChatRoomMember roomMember = getRoomMember(roomId, employeeNo);

                roomMember.unpin();
        }

        @Override
        public void hideRoom(
                        String employeeNo,
                        Long roomId) {

                ChatRoom room = getRoom(roomId);

                ChatRoomMember roomMember = getRoomMember(roomId, employeeNo);

                Long lastMessageId = chatMessageRepository.findTopByRoomOrderByIdDesc(room)
                                .map(ChatMessage::getId)
                                .orElse(null);

                roomMember.hide(lastMessageId);
        }

        private ChatRoom createDirectRoom(
                        Member memberA,
                        Member memberB) {

                ChatRoom room = ChatRoom.builder()
                                .roomType(ChatRoomType.DIRECT)
                                .build();

                ChatRoom savedRoom = chatRoomRepository.save(room);

                ChatRoomMember roomMemberA = ChatRoomMember.builder()
                                .room(savedRoom)
                                .member(memberA)
                                .hidden(false)
                                .pinned(false)
                                .build();

                ChatRoomMember roomMemberB = ChatRoomMember.builder()
                                .room(savedRoom)
                                .member(memberB)
                                .hidden(false)
                                .pinned(false)
                                .build();

                chatRoomMemberRepository.save(roomMemberA);
                chatRoomMemberRepository.save(roomMemberB);

                return savedRoom;
        }

        private ChatRoomDTO roomToDTO(
                        ChatRoom room,
                        Member me) {

                ChatRoomMember myRoomMember = chatRoomMemberRepository.findByRoomAndMember(room, me)
                                .orElseThrow(() -> new RuntimeException("채팅방 참여자 정보를 찾을 수 없습니다."));

                ChatMessage lastMessage = chatMessageRepository.findTopByRoomOrderByIdDesc(room)
                                .orElse(null);

                Member target = room.getRoomType() == ChatRoomType.DIRECT
                                ? findDirectTarget(room, me)
                                : null;

                long unreadCount = getUnreadCount(room, myRoomMember, me);

                String displayName = room.getRoomType() == ChatRoomType.GROUP
                                ? room.getRoomName()
                                : target == null ? "알 수 없음" : target.getName();

                return ChatRoomDTO.builder()
                                .roomId(room.getId())
                                .roomType(room.getRoomType())
                                .displayName(displayName)
                                .targetEmployeeNo(target == null ? null : target.getEmployeeNo())
                                .targetName(target == null ? null : target.getName())
                                .targetDepartment(target == null ? null : target.getDepartment())
                                .targetPresenceStatus(
                                                target == null
                                                                ? null
                                                                : target.getPresenceStatus() == null
                                                                                ? PresenceStatus.OFFLINE.name()
                                                                                : target.getPresenceStatus().name())
                                .lastMessage(lastMessage == null ? null : lastMessage.getContent())
                                .lastMessageTime(lastMessage == null ? null : lastMessage.getCreatedAt())
                                .pinned(myRoomMember.isPinned())
                                .unreadCount(unreadCount)
                                .build();
        }

        private Member findDirectTarget(
                        ChatRoom room,
                        Member me) {

                return chatRoomMemberRepository.findByRoom(room)
                                .stream()
                                .map(ChatRoomMember::getMember)
                                .filter(member -> !member.getEmployeeNo().equals(me.getEmployeeNo()))
                                .findFirst()
                                .orElse(null);
        }

        private long getUnreadCount(
                        ChatRoom room,
                        ChatRoomMember roomMember,
                        Member me) {

                if (roomMember.getLastReadMessageId() == null) {
                        return chatMessageRepository.countUnreadMessagesWhenNeverRead(
                                        room,
                                        me.getEmployeeNo());
                }

                return chatMessageRepository.countUnreadMessages(
                                room,
                                roomMember.getLastReadMessageId(),
                                me.getEmployeeNo());
        }

        private ChatMessageDTO messageToDTO(
                        ChatMessage message,
                        Member me) {

                Member sender = message.getSender();

                return ChatMessageDTO.builder()
                                .id(message.getId())
                                .roomId(message.getRoom().getId())
                                .senderEmployeeNo(sender.getEmployeeNo())
                                .senderName(sender.getName())
                                .senderDepartment(sender.getDepartment())
                                .content(message.getContent())
                                .createdAt(message.getCreatedAt())
                                .mine(sender.getEmployeeNo().equals(me.getEmployeeNo()))
                                .unreadCount(calculateUnreadCount(message))
                                .build();
        }

        private long calculateUnreadCount(
                        ChatMessage message) {

                Long messageId = message.getId();

                String senderEmployeeNo = message.getSender().getEmployeeNo();

                return chatRoomMemberRepository.findByRoom(message.getRoom())
                                .stream()

                                // 보낸 사람은 읽음 수에서 제외
                                .filter(roomMember -> !roomMember.getMember().getEmployeeNo().equals(senderEmployeeNo))

                                // 채팅방을 나간 사람은 제외
                                .filter(roomMember -> !roomMember.isHidden())

                                // 이 메시지를 볼 수 있는 사람만 계산
                                .filter(roomMember -> {
                                        Long visibleAfterMessageId = roomMember.getVisibleAfterMessageId();

                                        return visibleAfterMessageId == null
                                                        || messageId > visibleAfterMessageId;
                                })

                                // 아직 읽지 않은 사람만 계산
                                .filter(roomMember -> {
                                        Long lastReadMessageId = roomMember.getLastReadMessageId();

                                        return lastReadMessageId == null
                                                        || lastReadMessageId < messageId;
                                })

                                .count();
        }

        private ChatEmployeeDTO memberToEmployeeDTO(
                        Member member) {

                return ChatEmployeeDTO.builder()
                                .employeeNo(member.getEmployeeNo())
                                .name(member.getName())
                                .department(member.getDepartment())
                                .departmentName(departmentText(member.getDepartment()))
                                .presenceStatus(
                                                member.getPresenceStatus() == null
                                                                ? PresenceStatus.OFFLINE.name()
                                                                : member.getPresenceStatus().name())
                                .highestRole(getHighestRole(member).name())
                                .build();
        }

        private ChatParticipantDTO memberToParticipantDTO(
                        Member member) {

                return ChatParticipantDTO.builder()
                                .employeeNo(member.getEmployeeNo())
                                .name(member.getName())
                                .department(member.getDepartment())
                                .departmentName(departmentText(member.getDepartment()))
                                .presenceStatus(
                                                member.getPresenceStatus() == null
                                                                ? PresenceStatus.OFFLINE.name()
                                                                : member.getPresenceStatus().name())
                                .highestRole(getHighestRole(member).name())
                                .build();
        }

        private Member getMember(
                        String employeeNo) {

                return memberRepository.findById(employeeNo)
                                .orElseThrow(() -> new RuntimeException("사원 정보를 찾을 수 없습니다."));
        }

        private ChatRoom getRoom(
                        Long roomId) {

                return chatRoomRepository.findById(roomId)
                                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));
        }

        private ChatRoomMember getRoomMember(
                        Long roomId,
                        String employeeNo) {

                return chatRoomMemberRepository.findByRoomIdAndEmployeeNo(
                                roomId,
                                employeeNo)
                                .orElseThrow(() -> new RuntimeException("채팅방 참여자가 아닙니다."));
        }

        private MemberRole getHighestRole(
                        Member member) {

                if (member.getMemberRoleList().contains(MemberRole.ADMIN)) {
                        return MemberRole.ADMIN;
                }

                if (member.getMemberRoleList().contains(MemberRole.MANAGER)) {
                        return MemberRole.MANAGER;
                }

                return MemberRole.EMPLOYEE;
        }

        private int highestRoleOrder(
                        Member member) {

                MemberRole highestRole = getHighestRole(member);

                if (highestRole == MemberRole.ADMIN) {
                        return 1;
                }

                if (highestRole == MemberRole.MANAGER) {
                        return 2;
                }

                return 3;
        }

        private String departmentText(
                        String department) {

                if ("DEV".equals(department)) {
                        return "개발팀";
                }

                if ("HR".equals(department)) {
                        return "인사팀";
                }

                if ("PUR".equals(department)) {
                        return "구매팀";
                }

                if ("FIN".equals(department)) {
                        return "재무팀";
                }

                if ("OPS".equals(department)) {
                        return "운영팀";
                }

                return department;
        }
}