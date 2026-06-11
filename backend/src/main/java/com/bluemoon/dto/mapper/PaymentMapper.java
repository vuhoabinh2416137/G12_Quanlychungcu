package com.bluemoon.dto.mapper;

import com.bluemoon.dto.PaymentResponseAdminDto;
import com.bluemoon.dto.PaymentResponseUserDto;
import com.bluemoon.dto.request.PaymentRequestDto;
import com.bluemoon.model.Payment;
import org.mapstruct.*;
import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PaymentMapper {

    // Entity → Admin DTO
    // fee là LAZY → Service phải @Transactional khi gọi hàm này
    @Mapping(target = "feeId",           source = "fee.id")
    @Mapping(target = "feeName",         source = "fee.name")
    @Mapping(target = "apartmentNumber", source = "fee.apartment.apartmentNumber")
    PaymentResponseAdminDto toAdminDto(Payment payment);
    List<PaymentResponseAdminDto> toAdminDtoList(List<Payment> payments);

    // Entity → User DTO (ẩn note, feeName, apartmentNumber)
    PaymentResponseUserDto toUserDto(Payment payment);
    List<PaymentResponseUserDto> toUserDtoList(List<Payment> payments);

    // Request DTO → Entity (POST)
    @Mapping(target = "id",          ignore = true)
    @Mapping(target = "fee",         ignore = true)  // Service gán sau qua feeId
    @Mapping(target = "paymentDate", ignore = true)  // DB tự sinh @ColumnDefault
    Payment toEntity(PaymentRequestDto requestDto);

    // Không có updateEntityFromDto — thanh toán không được sửa sau khi tạo
}
