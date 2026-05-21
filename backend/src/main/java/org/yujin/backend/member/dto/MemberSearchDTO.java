package org.yujin.backend.member.dto;

import lombok.*;
import lombok.experimental.SuperBuilder;
import org.yujin.backend.common.dto.PageRequestDTO;
import org.yujin.backend.member.domain.MemberRole;
import org.yujin.backend.member.domain.MemberStatus;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class MemberSearchDTO extends PageRequestDTO {

    private String keyword;

    private String department;

    private MemberStatus status;

    private MemberRole role;
}