package org.yujin.backend.member.service;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.yujin.backend.common.dto.PageResponseDTO;
import org.yujin.backend.member.domain.Member;
import org.yujin.backend.member.domain.MemberRole;
import org.yujin.backend.member.domain.MemberStatus;
import org.yujin.backend.member.domain.PresenceStatus;
import org.yujin.backend.member.dto.MemberDTO;
import org.yujin.backend.member.dto.MemberJoinDTO;
import org.yujin.backend.member.dto.MemberModifyDTO;
import org.yujin.backend.member.dto.MemberResponseDTO;
import org.yujin.backend.member.dto.MemberSearchDTO;
import org.yujin.backend.member.repository.MemberRepository;
import org.yujin.backend.util.JWTUtil;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public String join(MemberJoinDTO dto) {

        if (memberRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }

        String employeeNo = generateEmployeeNo(dto.getDepartment());

        Member member = Member.builder()
                .employeeNo(employeeNo)
                .email(dto.getEmail())
                .pw(passwordEncoder.encode(dto.getPw()))
                .name(dto.getName())
                .department(dto.getDepartment())
                .build();

        member.addRole(MemberRole.EMPLOYEE);

        memberRepository.save(member);

        return employeeNo;
    }

    @Override
    public MemberResponseDTO get(String employeeNo) {

        Member member = memberRepository.getWithRoles(employeeNo);

        if (member == null) {
            throw new RuntimeException("존재하지 않는 사원입니다.");
        }

        return entityToResponseDTO(member);
    }

    @Override
    public void modify(String employeeNo, MemberModifyDTO dto) {

        Member member = memberRepository.findById(employeeNo)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 사원입니다."));

        if (dto.getEmail() != null) {
            member.changeEmail(dto.getEmail());
        }

        if (dto.getPw() != null && !dto.getPw().isBlank()) {
            member.changePw(passwordEncoder.encode(dto.getPw()));
        }

        if (dto.getName() != null) {
            member.changeName(dto.getName());
        }

        if (dto.getDepartment() != null) {
            member.changeDepartment(dto.getDepartment());
        }

        if (dto.getStatus() != null) {
            if (dto.getStatus() == MemberStatus.ACTIVE) {
                member.activate();
            } else if (dto.getStatus() == MemberStatus.LEAVE) {
                member.leave();
            } else if (dto.getStatus() == MemberStatus.RESIGNED) {
                member.resign();
            }
        }

        if (dto.getRoleList() != null && !dto.getRoleList().isEmpty()) {
            member.clearRole();

            dto.getRoleList().forEach(member::addRole);
        }
    }

    @Override
    public PageResponseDTO<MemberResponseDTO> getList(MemberSearchDTO memberSearchDTO) {
        return memberRepository.searchList(memberSearchDTO);
    }

    @Override
    public Map<String, Object> refreshToken(String refreshToken) {

        Map<String, Object> refreshClaims = JWTUtil.validateToken(refreshToken);

        String employeeNo = (String) refreshClaims.get("employeeNo");

        Member member = memberRepository.getWithRoles(employeeNo);

        if (member == null) {
            throw new RuntimeException("존재하지 않는 사원입니다.");
        }

        if (member.getStatus() == MemberStatus.RESIGNED) {
            throw new RuntimeException("퇴사 처리된 사원입니다.");
        }

        MemberDTO memberDTO = entityToDTO(member);

        Map<String, Object> claims = memberDTO.getClaims();

        String newAccessToken = JWTUtil.generateToken(claims, 30);

        String newRefreshToken = JWTUtil.generateToken(claims, 60 * 24);

        claims.put("accessToken", newAccessToken);
        claims.put("refreshToken", newRefreshToken);

        return claims;
    }

    @Override
    public void changeMyPresenceStatus(
            String employeeNo,
            PresenceStatus presenceStatus) {

        Member member = memberRepository.findById(employeeNo)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 사원입니다."));

        if (member.getStatus() == MemberStatus.RESIGNED) {
            throw new RuntimeException("퇴사 처리된 사원은 상태를 변경할 수 없습니다.");
        }

        member.changePresenceStatus(presenceStatus);
    }

    private String generateEmployeeNo(String department) {

        String year = String.valueOf(LocalDate.now().getYear()).substring(2);

        String prefix = "ABC-" + year + "-" + department + "-";

        List<String> lastEmployeeNoList = memberRepository.findLastEmployeeNo(
                prefix,
                PageRequest.of(0, 1));

        String lastEmployeeNo = lastEmployeeNoList.isEmpty()
                ? null
                : lastEmployeeNoList.get(0);

        int nextNumber = 1;

        if (lastEmployeeNo != null) {
            String lastNumberStr = lastEmployeeNo.substring(lastEmployeeNo.lastIndexOf("-") + 1);
            nextNumber = Integer.parseInt(lastNumberStr) + 1;
        }

        return prefix + String.format("%03d", nextNumber);
    }

}