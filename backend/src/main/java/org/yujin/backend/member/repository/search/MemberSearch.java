package org.yujin.backend.member.repository.search;

import org.yujin.backend.common.dto.PageResponseDTO;
import org.yujin.backend.member.dto.MemberResponseDTO;
import org.yujin.backend.member.dto.MemberSearchDTO;

public interface MemberSearch {

    PageResponseDTO<MemberResponseDTO> searchList(MemberSearchDTO memberSearchDTO);
}