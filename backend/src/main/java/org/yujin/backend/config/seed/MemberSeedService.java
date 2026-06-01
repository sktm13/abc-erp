package org.yujin.backend.config.seed;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.yujin.backend.member.domain.Member;
import org.yujin.backend.member.domain.MemberRole;
import org.yujin.backend.member.domain.MemberStatus;
import org.yujin.backend.member.domain.PresenceStatus;
import org.yujin.backend.member.repository.MemberRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Log4j2
public class MemberSeedService {

    private final MemberRepository memberRepository;

    private final PasswordEncoder passwordEncoder;

    private static final String INITIAL_ADMIN_EMPLOYEE_NO = "ABC-21-DEV-001";

    @Transactional
    public List<Member> seedIfNeeded() {

        if (memberRepository.existsById(INITIAL_ADMIN_EMPLOYEE_NO)) {
            log.info("초기 사원 데이터가 이미 존재합니다. 사원 생성을 건너뜁니다.");
            return memberRepository.findAll();
        }

        return seed();
    }

    private List<Member> seed() {

        log.info("초기 사원 데이터를 생성합니다.");

        List<Member> members = new ArrayList<>();

        addDepartmentMembers(members, "DEV", "개발팀", true);
        addDepartmentMembers(members, "HR", "인사팀", false);
        addDepartmentMembers(members, "PUR", "구매팀", false);
        addDepartmentMembers(members, "FIN", "재무팀", false);
        addDepartmentMembers(members, "OPS", "운영팀", false);

        List<Member> savedMembers =
                memberRepository.saveAll(members);

        log.info("초기 사원 데이터 생성 완료. 총 {}명", savedMembers.size());

        return savedMembers;
    }

    private void addDepartmentMembers(
            List<Member> members,
            String department,
            String departmentName,
            boolean includeAdmin
    ) {

        // 1 ~ 5: 팀장
        for (int i = 1; i <= 5; i++) {

            MemberStatus status =
                    getStatusByGroupIndex(i);

            PresenceStatus presenceStatus =
                    getPresenceStatusByStatusAndIndex(status, i);

            Member manager =
                    createMember(
                            department,
                            departmentName,
                            i,
                            "팀장",
                            i,
                            status,
                            presenceStatus
                    );

            // MANAGER는 EMPLOYEE 권한을 포함한다.
            manager.addRole(MemberRole.EMPLOYEE);
            manager.addRole(MemberRole.MANAGER);

            // 개발팀 팀장1만 ADMIN 권한 부여
            // ADMIN은 EMPLOYEE + MANAGER + ADMIN 누적 권한 구조
            if (includeAdmin && i == 1) {
                manager.addRole(MemberRole.ADMIN);
            }

            members.add(manager);
        }

        // 6 ~ 10: 사원
        for (int i = 6; i <= 10; i++) {

            int employeeIndex =
                    i - 5;

            MemberStatus status =
                    getStatusByGroupIndex(employeeIndex);

            PresenceStatus presenceStatus =
                    getPresenceStatusByStatusAndIndex(status, employeeIndex);

            Member employee =
                    createMember(
                            department,
                            departmentName,
                            i,
                            "사원",
                            employeeIndex,
                            status,
                            presenceStatus
                    );

            employee.addRole(MemberRole.EMPLOYEE);

            members.add(employee);
        }
    }

    private Member createMember(
            String department,
            String departmentName,
            int sequence,
            String positionText,
            int positionIndex,
            MemberStatus status,
            PresenceStatus presenceStatus
    ) {

        String employeeNo =
                String.format(
                        "ABC-%02d-%s-%03d",
                        20 + sequence,
                        department,
                        sequence
                );

        String email =
                String.format(
                        "abc%02d%s%03d@abc.com",
                        20 + sequence,
                        department.toLowerCase(),
                        sequence
                );

        String name =
                departmentName + " " + positionText + positionIndex;

        return Member.builder()
                .employeeNo(employeeNo)
                .pw(passwordEncoder.encode("1111"))
                .email(email)
                .name(name)
                .department(department)
                .status(status)
                .presenceStatus(presenceStatus)
                .build();
    }

    private MemberStatus getStatusByGroupIndex(
            int index
    ) {

        if (index <= 3) {
            return MemberStatus.ACTIVE;
        }

        if (index == 4) {
            return MemberStatus.LEAVE;
        }

        return MemberStatus.RESIGNED;
    }

    private PresenceStatus getPresenceStatusByStatusAndIndex(
            MemberStatus status,
            int index
    ) {

        if (status != MemberStatus.ACTIVE) {
            return PresenceStatus.OFFLINE;
        }

        return switch (index) {
            case 1 -> PresenceStatus.ONLINE;
            case 2 -> PresenceStatus.AWAY;
            default -> PresenceStatus.OFFLINE;
        };
    }
}