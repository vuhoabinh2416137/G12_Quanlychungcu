package com.bluemoon.dto.mapper;

import com.bluemoon.dto.ApartmentResponseAdminDto;
import com.bluemoon.dto.ApartmentResponseUserDto;
import com.bluemoon.dto.request.ApartmentRequestDto;
import com.bluemoon.model.Apartment;
import org.mapstruct.*;
import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ApartmentMapper {

    // Entity → Admin DTO
    ApartmentResponseAdminDto toAdminDto(Apartment apartment);
    List<ApartmentResponseAdminDto> toAdminDtoList(List<Apartment> apartments);

    // Entity → User DTO (area không có trong record → tự bỏ qua)
    ApartmentResponseUserDto toUserDto(Apartment apartment);
    List<ApartmentResponseUserDto> toUserDtoList(List<Apartment> apartments);

    // Request DTO → Entity (POST)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "motorbikeCount", ignore = true)
    @Mapping(target = "carCount", ignore = true)
    @Mapping(target = "residentCount", ignore = true)
    Apartment toEntity(ApartmentRequestDto requestDto);

    // Request DTO → Entity có sẵn (PUT)
    // apartmentNumber không cho đổi sau khi tạo
    @Mapping(target = "id",              ignore = true)
    @Mapping(target = "apartmentNumber", ignore = true)
    @Mapping(target = "motorbikeCount",  ignore = true)
    @Mapping(target = "carCount",        ignore = true)
    @Mapping(target = "residentCount",   ignore = true)
    void updateEntityFromDto(ApartmentRequestDto requestDto, @MappingTarget Apartment apartment);
}
