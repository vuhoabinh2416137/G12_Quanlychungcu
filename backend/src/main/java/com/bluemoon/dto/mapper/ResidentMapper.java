package com.bluemoon.dto.mapper;

import com.bluemoon.dto.ResidentResponseAdminDto;
import com.bluemoon.dto.ResidentResponseUserDto;
import com.bluemoon.dto.request.ResidentRequestDto;
import com.bluemoon.model.Resident;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ResidentMapper {

    // =====================================================
    // Entity → Admin DTO (đầy đủ thông tin)
    // =====================================================

    @Mapping(target = "apartmentId",     source = "apartment.id")
    @Mapping(target = "apartmentNumber", source = "apartment.apartmentNumber") // FIX: "number" → "apartmentNumber"
    ResidentResponseAdminDto toAdminDto(Resident resident);

    List<ResidentResponseAdminDto> toAdminDtoList(List<Resident> residents);


    // =====================================================
    // Entity → User DTO (ẩn thông tin nhạy cảm)
    // =====================================================

    @Mapping(target = "dateOfBirth", ignore = true) // FIX: ẩn ngày sinh với user thường
    ResidentResponseUserDto toUserDto(Resident resident);

    List<ResidentResponseUserDto> toUserDtoList(List<Resident> residents); // FIX: thêm list cho user


    // =====================================================
    // Request DTO → Entity (dùng khi POST tạo mới)
    // =====================================================

    @Mapping(target = "id",        ignore = true) // DB tự sinh
    @Mapping(target = "apartment", ignore = true) // Service gán sau qua apartmentId
    Resident toEntity(ResidentRequestDto requestDto);


    // =====================================================
    // Request DTO → Entity có sẵn (dùng khi PUT cập nhật)
    // @MappingTarget: ghi đè lên entity đang có, giữ nguyên
    // id, apartment, idCard (không cho đổi sau khi tạo)
    // =====================================================

    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "apartment", ignore = true)
    @Mapping(target = "idCard",    ignore = true) // FIX: CCCD không được cập nhật
    void updateEntityFromDto(ResidentRequestDto requestDto, @MappingTarget Resident resident);
}