package com.bluemoon.dto.mapper;

import com.bluemoon.dto.NotificationResponseAdminDto;
import com.bluemoon.dto.NotificationResponseUserDto;
import com.bluemoon.dto.request.NotificationRequestDto;
import com.bluemoon.model.Notification;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface NotificationMapper {

    @Mapping(target = "senderId",        source = "sender.id")
    @Mapping(target = "senderUsername",  source = "sender.username")
    @Mapping(target = "apartmentId",     source = "apartment.id")
    @Mapping(target = "apartmentNumber", source = "apartment.apartmentNumber")
    NotificationResponseAdminDto toAdminDto(Notification notification);

    List<NotificationResponseAdminDto> toAdminDtoList(List<Notification> notifications);

    NotificationResponseUserDto toUserDto(Notification notification);

    List<NotificationResponseUserDto> toUserDtoList(List<Notification> notifications);

    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "sender",    ignore = true)
    @Mapping(target = "apartment", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Notification toEntity(NotificationRequestDto requestDto);
}
