package com.bluemoon.dto.request;

import jakarta.validation.constraints.NotBlank;

public class FeedbackReplyDto {
    @NotBlank(message = "Reply cannot be empty")
    private String reply;

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }
}
