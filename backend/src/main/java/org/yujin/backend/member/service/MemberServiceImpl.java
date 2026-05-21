package org.yujin.backend.member.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.yujin.backend.common.dto.PageResponseDTO;
import org.yujin.backend.member.domain.Member;
import org.yujin.backend.member.domain.MemberRole;
import org.yujin.backend.member.domain.MemberStatus;
import org.yujin.backend.member.dto.MemberJoinDTO;
import org.yujin.backend.member.dto.MemberModifyDTO;
import org.yujin.backend.member.dto.MemberResponseDTO;
import org.yujin.backend.member.dto.MemberSearchDTO;
import org.yujin.backend.member.repository.MemberRepository;

import java.time.LocalDate;

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

    private String generateEmployeeNo(String department) {

        String year = String.valueOf(LocalDate.now().getYear()).substring(2);

        String prefix = "ABC-" + year + "-" + department + "-";

        String lastEmployeeNo = memberRepository.findLastEmployeeNo(prefix);

        int nextNumber = 1;

        if (lastEmployeeNo != null) {
            String lastNumberStr = lastEmployeeNo.substring(lastEmployeeNo.lastIndexOf("-") + 1);
            nextNumber = Integer.parseInt(lastNumberStr) + 1;
        }

        return prefix + String.format("%03d", nextNumber);
    }

}