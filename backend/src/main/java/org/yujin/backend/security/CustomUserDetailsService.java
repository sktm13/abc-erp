package org.yujin.backend.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.yujin.backend.member.domain.Member;
import org.yujin.backend.member.domain.MemberStatus;
import org.yujin.backend.member.dto.MemberDTO;
import org.yujin.backend.member.repository.MemberRepository;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class CustomUserDetailsService implements UserDetailsService {

    private final MemberRepository memberRepository;

    @Transactional
    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        log.info("loadUserByUsername: {}", username);

        // username = employeeNo
        Member member = memberRepository.getWithRoles(username);

        if (member == null) {
            throw new UsernameNotFoundException("존재하지 않는 사원입니다.");
        }

        if (member.getStatus() == MemberStatus.RESIGNED) {
            throw new UsernameNotFoundException("퇴사 처리된 사원입니다.");
        }

        MemberDTO memberDTO = new MemberDTO(
                member.getEmployeeNo(),
                member.getEmail(),
                member.getPw(),
                member.getName(),
                member.getDepartment(),
                member.getStatus().name(),
                member.getMemberRoleList()
                        .stream()
                        .map(role -> role.name())
                        .collect(Collectors.toList())
        );

        log.info(memberDTO);

        return memberDTO;
    }
}