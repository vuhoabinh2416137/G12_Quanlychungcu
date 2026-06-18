package com.bluemoon.dto.mapper;

import com.bluemoon.dto.FeedbackResponseDto;
import com.bluemoon.dto.request.FeedbackRequestDto;
import com.bluemoon.model.Feedback;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class FeedbackMapper {

    public Feedback toEntity(FeedbackRequestDto dto) {
        if (dto == null) {
            return null;
        }
        Feedback entity = new Feedback();
        entity.setTitle(dto.getTitle());
        entity.setContent(dto.getContent());
        return entity;
    }

    public FeedbackResponseDto toDto(Feedback entity) {
        if (entity == null) {
            return null;
        }
        FeedbackResponseDto dto = new FeedbackResponseDto();
        dto.setId(entity.getId());
        if (entity.getApartment() != null) {
            dto.setApartmentId(entity.getApartment().getId());
            dto.setApartmentNumber(entity.getApartment().getApartmentNumber());
        }
        if (entity.getAuthor() != null) {
            dto.setAuthorName(entity.getAuthor().getFullName());
        }
        dto.setTitle(entity.getTitle());
        dto.setContent(entity.getContent());
        dto.setReply(entity.getReply());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setRepliedAt(entity.getRepliedAt());
        return dto;
    }

    public List<FeedbackResponseDto> toDtoList(List<Feedback> entities) {
        if (entities == null) {
            return null;
        }
        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
