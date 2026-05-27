package org.yujin.backend.worklog.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WorkLogCurrentResponseDTO {

    private boolean working;

    private Long workLogId;

    private LocalDateTime startTime;
}