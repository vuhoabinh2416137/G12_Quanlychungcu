package com.bluemoon.dto.mapper;

import com.bluemoon.dto.InvoiceResponseDto;
import com.bluemoon.dto.request.InvoiceRequestDto;
import com.bluemoon.model.Invoice;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING,
        uses = {FeeMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface InvoiceMapper {

    @Mapping(target = "apartmentId",     source = "apartment.id")
    @Mapping(target = "apartmentNumber", source = "apartment.apartmentNumber")
    @Mapping(target = "paymentId",       source = "paymentId")
    @Mapping(target = "fees",            source = "fees")
    InvoiceResponseDto toDto(Invoice invoice);

    List<InvoiceResponseDto> toDtoList(List<Invoice> invoices);

    @Mapping(target = "id",            ignore = true)
    @Mapping(target = "invoiceNumber", ignore = true)
    @Mapping(target = "apartment",     ignore = true)
    @Mapping(target = "paymentId",     ignore = true)
    @Mapping(target = "fees",          ignore = true)
    @Mapping(target = "issuedDate",    ignore = true)
    @Mapping(target = "status",        ignore = true)
    Invoice toEntity(InvoiceRequestDto requestDto);
}
