package org.yujin.backend.member.dto;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.*;
import java.util.stream.Collectors;

public class MemberDTO extends User {

    private String employeeNo;
    private String email;
    
    @SuppressWarnings("unused")
    private String pw;

    private String name;
    private String department;
    private String status;
    private String presenceStatus;

    private List<String> roleNames = new ArrayList<>();

    public MemberDTO(
            String employeeNo,
            String email,
            String pw,
            String name,
            String department,
            String status,
            String presenceStatus,
            List<String> roleNames
    ) {
        super(
                employeeNo,
                pw,
                roleNames.stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                        .collect(Collectors.toList())
        );

        this.employeeNo = employeeNo;
        this.email = email;
        this.pw = pw;
        this.name = name;
        this.department = department;
        this.status = status;
        this.presenceStatus = presenceStatus;
        this.roleNames = roleNames;
    }

    public Map<String, Object> getClaims() {

        Map<String, Object> dataMap = new HashMap<>();

        dataMap.put("employeeNo", employeeNo);
        dataMap.put("email", email);
        // pw는 JWT/응답에 넣지 않음
        dataMap.put("name", name);
        dataMap.put("department", department);
        dataMap.put("status", status);
        dataMap.put("presenceStatus", presenceStatus);
        dataMap.put("roleNames", roleNames);

        return dataMap;
    }
}