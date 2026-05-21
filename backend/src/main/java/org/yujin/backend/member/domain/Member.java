package org.yujin.backend.member.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@ToString(exclude = "memberRoleList")
@Table(name = "erp_member")
public class Member {

    // 사번 = 로그인 ID = ABC-YY-DEPT-XXX
    @Id
    private String employeeNo;

    private String pw;

    @Column(unique = true, nullable = false)
    private String email;

    private String name;

    private String department;
    // DEV = 개발팀
    // HR = 인사팀
    // PUR = 구매팀
    // FIN = 재무팀
    // OPS = 운영팀

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private MemberStatus status = MemberStatus.ACTIVE;
    // ACTIVE = 재직 (default)
    // LEAVE = 휴직
    // RESIGNED = 퇴사

    @ElementCollection(fetch = FetchType.LAZY)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private List<MemberRole> memberRoleList = new ArrayList<>();

    public void addRole(MemberRole memberRole) {
        memberRoleList.add(memberRole);
    }

    public void clearRole() {
        memberRoleList.clear();
    }

    public void changePw(String pw) {
        this.pw = pw;
    }

    public void changeEmail(String email) {
        this.email = email;
    }

    public void changeName(String name) {
        this.name = name;
    }

    public void changeDepartment(String department) {
        this.department = department;
    }

    // 재직 처리
    public void activate() {
        this.status = MemberStatus.ACTIVE;
    }

    // 휴직 처리
    public void leave() {
        this.status = MemberStatus.LEAVE;
    }

    // 퇴사 처리
    public void resign() {
        this.status = MemberStatus.RESIGNED;
    }
}