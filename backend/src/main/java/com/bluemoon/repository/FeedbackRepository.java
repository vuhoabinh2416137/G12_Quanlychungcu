package com.bluemoon.repository;

import com.bluemoon.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByApartmentIdOrderByCreatedAtDesc(Long apartmentId);
    List<Feedback> findAllByOrderByCreatedAtDesc();
}
