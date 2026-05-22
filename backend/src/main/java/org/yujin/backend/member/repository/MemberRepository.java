package org.yujin.backend.member.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.yujin.backend.member.domain.Member;
import org.yujin.backend.member.repository.search.MemberSearch;

public interface MemberRepository extends JpaRepository<Member, String>, MemberSearch {

    // 로그인 시 권한 조회
    @EntityGraph(attributePaths = "memberRoleList")
    @Query("SELECT m FROM Member m WHERE m.employeeNo = :employeeNo")
    Member getWithRoles(@Param("employeeNo") String employeeNo);

    // 이메일 중복 체크
    boolean existsByEmail(String email);

    // 사원등록 시 사번 자동 생성을 위한 마지막 사번 조회
    // ex) ABC-26-DEV-??
    @Query("""
            SELECT m.employeeNo
            FROM Member m
            WHERE m.employeeNo LIKE CONCAT(:prefix, '%')
            ORDER BY m.employeeNo DESC
            """)
    List<String> findLastEmployeeNo(
            @Param("prefix") String prefix,
            Pageable pageable);
}