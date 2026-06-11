package com.bluemoon.dto.mapper;

import com.bluemoon.dto.FeeResponseAdminDto;
import com.bluemoon.dto.FeeResponseUserDto;
import com.bluemoon.dto.request.FeeRequestDto;
import com.bluemoon.model.Fee;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface FeeMapper {

    // =====================================================
    // Entity → Admin DTO (đầy đủ thông tin)
    // =====================================================

    @Mapping(target = "apartmentId",     source = "apartment.id")
    @Mapping(target = "apartmentNumber", source = "apartment.apartmentNumber")
    // Lưu ý: FeeResponseAdminDto cần có field "name" — hiện đang thiếu trong record
    FeeResponseAdminDto toAdminDto(Fee fee);

    List<FeeResponseAdminDto> toAdminDtoList(List<Fee> fees);


    // =====================================================
    // Entity → User DTO (ẩn thông tin nội bộ)
    // =====================================================

    @Mapping(target = "type", ignore = true) // phân loại nội bộ, user không cần thấy
    FeeResponseUserDto toUserDto(Fee fee);

    List<FeeResponseUserDto> toUserDtoList(List<Fee> fees);


    // =====================================================
    // Request DTO → Entity (dùng khi POST tạo mới)
    // =====================================================

    @Mapping(target = "id",        ignore = true) // DB tự sinh
    @Mapping(target = "apartment", ignore = true) // Service gán sau qua apartmentId
    @Mapping(target = "paid",      ignore = true) // mặc định false, không nhận từ client
    Fee toEntity(FeeRequestDto requestDto);


    // =====================================================
    // Request DTO → Entity có sẵn (dùng khi PUT cập nhật)
    // =====================================================

    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "apartment", ignore = true)
    @Mapping(target = "paid",      ignore = true) // trạng thái paid chỉ đổi qua API riêng
    void updateEntityFromDto(FeeRequestDto requestDto, @MappingTarget Fee fee);
}
