package com.bluemoon.repository;

import com.bluemoon.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByApartmentIdOrderByCreatedAtDesc(Long apartmentId);
    List<Feedback> findAllByOrderByCreatedAtDesc();

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Feedback f SET f.author = null WHERE f.author = :author")
    void unlinkAuthor(@org.springframework.data.repository.query.Param("author") com.bluemoon.model.User author);
}
