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
                searchDTO.getSize()
        );

        QMember member = QMember.member;

        BooleanBuilder builder = new BooleanBuilder();

        if (searchDTO.getKeyword() != null && !searchDTO.getKeyword().isBlank()) {
            String keyword = searchDTO.getKeyword();

            builder.and(
                    member.employeeNo.contains(keyword)
                            .or(member.name.contains(keyword))
                            .or(member.email.contains(keyword))
            );
        }

        if (searchDTO.getDepartment() != null && !searchDTO.getDepartment().isBlank()) {
            builder.and(member.department.eq(searchDTO.getDepartment()));
        }

        if (searchDTO.getStatus() != null) {
            builder.and(member.status.eq(searchDTO.getStatus()));
        }

        /*
         * 주의:
         * memberRoleList는 ElementCollection이다.
         *
         * 이 컬렉션을 where/orderBy에서 any()로 여러 번 사용한 상태에서
         * DB 페이징을 걸면 조인 결과 row 수 기준으로 페이징이 먼저 적용되어
         * 실제 사원 목록이 1페이지 1명, 2페이지 3명처럼 깨질 수 있다.
         *
         * 그래서 기본 조건(keyword / department / status)만 DB에서 조회하고,
         * 권한 필터 / 권한 정렬 / 최종 페이징은 Java에서 처리한다.
         */
        JPQLQuery<Member> query = from(member)
                .where(builder);

        List<Member> fetchedList = query.fetch();

        List<Member> filteredAndSortedList =
                fetchedList.stream()
                        .filter(m -> matchesHighestRoleFilter(
                                m,
                                searchDTO.getRole()
                        ))
                        .sorted(
                                Comparator
                                        .comparingInt(this::statusOrder)
                                        .thenComparingInt(this::highestRoleOrder)
                                        .thenComparingInt(this::hireYearOrder)
                                        .thenComparing(
                                                Member::getEmployeeNo,
                                                Comparator.nullsLast(String::compareTo)
                                        )
                        )
                        .toList();

        long totalCount = filteredAndSortedList.size();

        int start = (int) pageable.getOffset();
        int end = Math.min(
                start + pageable.getPageSize(),
                filteredAndSortedList.size()
        );

        List<Member> pagedMemberList =
                start >= filteredAndSortedList.size()
                        ? List.of()
                        : filteredAndSortedList.subList(start, end);

        List<MemberResponseDTO> dtoList =
                pagedMemberList.stream()
                        .map(m -> MemberResponseDTO.builder()
                                .employeeNo(m.getEmployeeNo())
                                .email(m.getEmail())
                                .name(m.getName())
                                .department(m.getDepartment())
                                .status(m.getStatus().name())
                                .presenceStatus(
                                        m.getPresenceStatus() == null
                                                ? "OFFLINE"
                                                : m.getPresenceStatus().name()
                                )
                                .roleNames(
                                        m.getMemberRoleList()
                                                .stream()
                                                .map(role -> role.name())
                                                .toList()
                                )
                                .build()
                        )
                        .toList();

        return PageResponseDTO.<MemberResponseDTO>withAll()
                .dtoList(dtoList)
                .pageRequestDTO(searchDTO)
                .totalCount(totalCount)
                .build();
    }

    private boolean matchesHighestRoleFilter(
            Member member,
            MemberRole searchRole
    ) {

        if (searchRole == null) {
            return true;
        }

        return getHighestRole(member) == searchRole;
    }

    private MemberRole getHighestRole(
            Member member
    ) {

        if (member.getMemberRoleList().contains(MemberRole.ADMIN)) {
            return MemberRole.ADMIN;
        }

        if (member.getMemberRoleList().contains(MemberRole.MANAGER)) {
            return MemberRole.MANAGER;
        }

        return MemberRole.EMPLOYEE;
    }

    private int statusOrder(
            Member member
    ) {

        MemberStatus status = member.getStatus();

        if (status == MemberStatus.ACTIVE) {
            return 1;
        }

        if (status == MemberStatus.LEAVE) {
            return 2;
        }

        if (status == MemberStatus.RESIGNED) {
            return 3;
        }

        return 4;
    }

    private int highestRoleOrder(
            Member member
    ) {

        MemberRole highestRole = getHighestRole(member);

        if (highestRole == MemberRole.ADMIN) {
            return 1;
        }

        if (highestRole == MemberRole.MANAGER) {
            return 2;
        }

        return 3;
    }

    private int hireYearOrder(
            Member member
    ) {

        String employeeNo = member.getEmployeeNo();

        if (employeeNo == null || employeeNo.isBlank()) {
            return 9999;
        }

        String[] parts = employeeNo.split("-");

        if (parts.length < 2) {
            return 9999;
        }

        try {
            return Integer.parseInt(parts[1]);
        } catch (NumberFormatException e) {
            return 9999;
        }
    }
}