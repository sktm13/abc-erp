package org.yujin.backend.chat.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GroupRoomCreateDTO {

    private String roomName;

    private List<String> memberEmployeeNos;
}