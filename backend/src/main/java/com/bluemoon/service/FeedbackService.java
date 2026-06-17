package com.bluemoon.service;

import com.bluemoon.exception.ResourceNotFoundException;
import com.bluemoon.model.Apartment;
import com.bluemoon.model.Feedback;
import com.bluemoon.model.FeedbackStatus;
import com.bluemoon.model.User;
import com.bluemoon.repository.ApartmentRepository;
import com.bluemoon.repository.FeedbackRepository;
import com.bluemoon.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final ApartmentRepository apartmentRepository;

    public FeedbackService(FeedbackRepository feedbackRepository, UserRepository userRepository, ApartmentRepository apartmentRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
        this.apartmentRepository = apartmentRepository;
    }

    public List<Feedback> getAllFeedbacks() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Feedback> getFeedbacksByApartment(Long apartmentId) {
        return feedbackRepository.findByApartmentIdOrderByCreatedAtDesc(apartmentId);
    }

    public Feedback createFeedback(String username, Long apartmentId, Feedback feedback) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment not found: " + apartmentId));

        feedback.setAuthor(author);
        feedback.setApartment(apartment);
        feedback.setStatus(FeedbackStatus.PENDING);
        return feedbackRepository.save(feedback);
    }

    public Feedback replyFeedback(Long feedbackId, String replyContent) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found: " + feedbackId));

        feedback.setReply(replyContent);
        feedback.setStatus(FeedbackStatus.REPLIED);
        feedback.setRepliedAt(Instant.now());
        return feedbackRepository.save(feedback);
    }

    public Feedback getFeedbackById(Long id) {
        return feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found: " + id));
    }
}
