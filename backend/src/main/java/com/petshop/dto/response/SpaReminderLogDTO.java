package com.petshop.dto.response;

import com.petshop.entity.SpaReminderLog;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpaReminderLogDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long petId;
    private String petName;
    private String petType;
    private Long serviceId;
    private String serviceName;
    private String bookingCode;
    private String subject;
    private SpaReminderLog.ReminderStatus status;
    private String errorMessage;
    private LocalDateTime sentAt;
}
