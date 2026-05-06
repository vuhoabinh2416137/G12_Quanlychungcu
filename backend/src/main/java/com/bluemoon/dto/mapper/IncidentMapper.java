package com.bluemoon.dto.mapper;

import com.bluemoon.dto.IncidentResponseAdminDto;
import com.bluemoon.dto.IncidentResponseUserDto;
import com.bluemoon.dto.request.IncidentRequestDto;
import com.bluemoon.model.Incident;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface IncidentMapper {

    // =====================================================
    // Entity → Admin DTO (đầy đủ: apartmentId, apartmentNumber, createdAt)
    // =====================================================

    @Mapping(target = "apartmentId",     source = "apartment.id")
    @Mapping(target = "apartmentNumber", source = "apartment.apartmentNumber")
    IncidentResponseAdminDto toAdminDto(Incident incident);

    List<IncidentResponseAdminDto> toAdminDtoList(List<Incident> incidents);


    // =====================================================
    // Entity → User DTO (chỉ thấy sự cố của căn hộ mình)
    // apartmentId và apartmentNumber không có trong record → tự bỏ qua
    // =====================================================

    IncidentResponseUserDto toUserDto(Incident incident);

    List<IncidentResponseUserDto> toUserDtoList(List<Incident> incidents);


    // =====================================================
    // Request DTO → Entity (dùng khi POST báo sự cố)
    // =====================================================

    @Mapping(target = "id",        ignore = true)  // DB tự sinh
    @Mapping(target = "apartment", ignore = true)  // Service gán sau qua apartmentId
    @Mapping(target = "status",    ignore = true)  // luôn bắt đầu là PENDING
    @Mapping(target = "createdAt", ignore = true)  // DB tự sinh bằng @ColumnDefault
    Incident toEntity(IncidentRequestDto requestDto);


    // =====================================================
    // Cập nhật status từ string (dùng khi Admin PATCH status)
    // Không dùng updateEntityFromDto vì chỉ cho phép đổi status,
    // không cho phép đổi title/description sau khi đã tạo
    // =====================================================

    @AfterMapping
    default void setDefaultStatus(@MappingTarget Incident incident) {
        if (incident.getStatus() == null) {
            incident.setStatus("PENDING");
        }
    }
}
