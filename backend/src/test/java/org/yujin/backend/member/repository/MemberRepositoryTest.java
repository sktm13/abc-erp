package org.yujin.backend.member.repository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.yujin.backend.member.domain.Member;
import org.yujin.backend.member.domain.MemberRole;
import org.yujin.backend.member.domain.MemberStatus;

@SpringBootTest
public class MemberRepositoryTest {

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    public void insertDummyMembers() {

        memberRepository.deleteAll();

        createDeptMembers("DEV", "개발팀");
        createDeptMembers("HR", "인사팀");
        createDeptMembers("PUR", "구매팀");
        createDeptMembers("FIN", "재무팀");
        createDeptMembers("OPS", "운영팀");
    }

    private void createDeptMembers(
            String deptCode,
            String deptName
    ) {

        // 팀장급
        saveMember("21", deptCode, 1,
                deptName + " 팀장1",
                MemberStatus.ACTIVE,
                true);

        saveMember("22", deptCode, 2,
                deptName + " 팀장2",
                MemberStatus.LEAVE,
                true);

        saveMember("23", deptCode, 3,
                deptName + " 팀장3",
                MemberStatus.RESIGNED,
                true);

        // 사원급
        saveMember("24", deptCode, 4,
                deptName + " 사원1",
                MemberStatus.ACTIVE,
                false);

        saveMember("25", deptCode, 5,
                deptName + " 사원2",
                MemberStatus.LEAVE,
                false);

        saveMember("26", deptCode, 6,
                deptName + " 사원3",
                MemberStatus.RESIGNED,
                false);
    }

    private void saveMember(
            String year,
            String deptCode,
            int number,
            String name,
            MemberStatus status,
            boolean manager
    ) {

        String employeeNo =
                "ABC-" +
                year +
                "-" +
                deptCode +
                "-" +
                String.format("%03d", number);

        Member member = Member.builder()
                .employeeNo(employeeNo)
                .email(employeeNo
                        .toLowerCase()
                        .replace("-", "") + "@abc.com")
                .pw(passwordEncoder.encode("1111"))
                .name(name)
                .department(deptCode)
                .status(status)
                .build();

        // 기본 권한
        member.addRole(MemberRole.EMPLOYEE);

        // 팀장급
        if (manager) {
            member.addRole(MemberRole.MANAGER);
        }

        // 개발팀 팀장급만 ADMIN
        if (deptCode.equals("DEV") && manager) {
            member.addRole(MemberRole.ADMIN);
        }

        memberRepository.save(member);
    }
}