package org.yujin.backend.member.repository.search;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.JPQLQuery;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.support.QuerydslRepositorySupport;
import org.yujin.backend.common.dto.PageResponseDTO;
import org.yujin.backend.member.domain.Member;
import org.yujin.backend.member.domain.MemberRole;
import org.yujin.backend.member.domain.MemberStatus;
import org.yujin.backend.member.domain.QMember;
import org.yujin.backend.member.dto.MemberResponseDTO;
import org.yujin.backend.member.dto.MemberSearchDTO;

import java.util.Comparator;
import java.util.List;

@Log4j2
public class MemberSearchImpl extends QuerydslRepositorySupport implements MemberSearch {

    public MemberSearchImpl() {
        super(Member.class);
    }

    @Override
    public PageResponseDTO<MemberResponseDTO> searchList(MemberSearchDTO searchDTO) {

        Pageable pageable = PageRequest.of(
                searchDTO.getPage() - 1,
                searchDTO.getSize());

        QMember member = QMember.member;

        BooleanBuilder builder = new BooleanBuilder();

        if (searchDTO.getKeyword() != null && !searchDTO.getKeyword().isBlank()) {
            String keyword = searchDTO.getKeyword();

            builder.and(
                    member.employeeNo.contains(keyword)
                            .or(member.name.contains(keyword))
                            .or(member.email.contains(keyword)));
        }

        if (searchDTO.getDepartment() != null && !searchDTO.getDepartment().isBlank()) {
            builder.and(member.department.eq(searchDTO.getDepartment()));
        }

        if (searchDTO.getStatus() != null) {
            builder.and(member.status.eq(searchDTO.getStatus()));
        }

        if (searchDTO.getRole() != null) {
            builder.and(member.memberRoleList.any().eq(searchDTO.getRole()));
        }

        JPQLQuery<Member> query = from(member)
                .where(builder);

        /*
         * 기본 정렬 기준
         *
         * 1순위 재직상태:
         * ACTIVE(재직) > LEAVE(휴직) > RESIGNED(퇴사)
         *
         * 2순위 권한:
         * ADMIN(관리자) > MANAGER(팀장급) > EMPLOYEE(사원)
         *
         * 3순위 입사년도 빠른 순:
         * ABC-21-DEV-001 > ABC-22-DEV-001 > ABC-26-DEV-001
         *
         * 4순위 사번 낮은 순
         */
        List<Member> sortedMemberList = query.fetch()
                .stream()
                .distinct()
                .sorted(
                        Comparator
                                .comparingInt(this::statusOrder)
                                .thenComparingInt(this::roleOrder)
                                .thenComparingInt(this::joinYearOrder)
                                .thenComparing(Member::getEmployeeNo)
                )
                .toList();

        long totalCount = sortedMemberList.size();

        int start = (int) pageable.getOffset();

        int end = Math.min(
                start + pageable.getPageSize(),
                sortedMemberList.size()
        );

        List<Member> memberList =
                start >= sortedMemberList.size()
                        ? List.of()
                        : sortedMemberList.subList(start, end);

        List<MemberResponseDTO> dtoList = memberList.stream()
                .map(m -> MemberResponseDTO.builder()
                        .employeeNo(m.getEmployeeNo())
                        .email(m.getEmail())
                        .name(m.getName())
                        .department(m.getDepartment())
                        .status(m.getStatus().name())
                        .presenceStatus(
                                m.getPresenceStatus() == null
                                        ? "OFFLINE"
                                        : m.getPresenceStatus().name())
                        .roleNames(
                                m.getMemberRoleList()
                                        .stream()
                                        .map(role -> role.name())
                                        .toList())
                        .build())
                .toList();

        return PageResponseDTO.<MemberResponseDTO>withAll()
                .dtoList(dtoList)
                .pageRequestDTO(searchDTO)
                .totalCount(totalCount)
                .build();
    }

    private int statusOrder(Member member) {

        if (member.getStatus() == MemberStatus.ACTIVE) {
            return 1;
        }

        if (member.getStatus() == MemberStatus.LEAVE) {
            return 2;
        }

        if (member.getStatus() == MemberStatus.RESIGNED) {
            return 3;
        }

        return 4;
    }

    private int roleOrder(Member member) {

        if (member.getMemberRoleList().contains(MemberRole.ADMIN)) {
            return 1;
        }

        if (member.getMemberRoleList().contains(MemberRole.MANAGER)) {
            return 2;
        }

        if (member.getMemberRoleList().contains(MemberRole.EMPLOYEE)) {
            return 3;
        }

        return 4;
    }

    private int joinYearOrder(Member member) {

        try {
            String employeeNo = member.getEmployeeNo();

            // ABC-21-DEV-001 기준
            String year = employeeNo.substring(4, 6);

            return Integer.parseInt(year);

        } catch (Exception e) {
            return 99;
        }
    }
}