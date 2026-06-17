package com.bluemoon.controller;

import com.bluemoon.dto.FeedbackResponseDto;
import com.bluemoon.dto.mapper.FeedbackMapper;
import com.bluemoon.dto.request.FeedbackReplyDto;
import com.bluemoon.dto.request.FeedbackRequestDto;
import com.bluemoon.model.Feedback;
import com.bluemoon.security.ResidentAccessService;
import com.bluemoon.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final FeedbackMapper feedbackMapper;
    private final ResidentAccessService residentAccessService;

    public FeedbackController(
            FeedbackService feedbackService,
            FeedbackMapper feedbackMapper,
            ResidentAccessService residentAccessService
    ) {
        this.feedbackService = feedbackService;
        this.feedbackMapper = feedbackMapper;
        this.residentAccessService = residentAccessService;
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<FeedbackResponseDto> createFeedback(
            @Valid @RequestBody FeedbackRequestDto requestDto,
            Authentication authentication
    ) {
        residentAccessService.ensureResidentApartmentAccess(authentication, requestDto.getApartmentId());
        String username = authentication.getName();
        Feedback feedback = feedbackMapper.toEntity(requestDto);
        Feedback saved = feedbackService.createFeedback(username, requestDto.getApartmentId(), feedback);
        return ResponseEntity.status(HttpStatus.CREATED).body(feedbackMapper.toDto(saved));
    }

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
    public ResponseEntity<List<FeedbackResponseDto>> getAllFeedbacks() {
        return ResponseEntity.ok(feedbackMapper.toDtoList(feedbackService.getAllFeedbacks()));
    }

    @GetMapping("/apartment/{apartmentId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'CASHIER', 'RESIDENT')")
    public ResponseEntity<List<FeedbackResponseDto>> getFeedbacksByApartment(
            @PathVariable Long apartmentId,
            Authentication authentication
    ) {
        residentAccessService.ensureResidentApartmentAccess(authentication, apartmentId);
        return ResponseEntity.ok(feedbackMapper.toDtoList(feedbackService.getFeedbacksByApartment(apartmentId)));
    }

    @PutMapping("/{id}/reply")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
    public ResponseEntity<FeedbackResponseDto> replyFeedback(
            @PathVariable Long id,
            @Valid @RequestBody FeedbackReplyDto replyDto
    ) {
        Feedback updated = feedbackService.replyFeedback(id, replyDto.getReply());
        return ResponseEntity.ok(feedbackMapper.toDto(updated));
    }
}
