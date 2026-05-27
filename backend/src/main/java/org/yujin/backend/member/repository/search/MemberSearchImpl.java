package org.yujin.backend.member.repository.search;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.JPQLQuery;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.support.QuerydslRepositorySupport;
import org.yujin.backend.common.dto.PageResponseDTO;
import org.yujin.backend.member.domain.Member;
import org.yujin.backend.member.domain.QMember;
import org.yujin.backend.member.dto.MemberResponseDTO;
import org.yujin.backend.member.dto.MemberSearchDTO;

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
                .where(builder)
                .orderBy(member.employeeNo.desc());

        long totalCount = query.fetchCount();

        getQuerydsl().applyPagination(pageable, query);

        List<Member> memberList = query.fetch();

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
}