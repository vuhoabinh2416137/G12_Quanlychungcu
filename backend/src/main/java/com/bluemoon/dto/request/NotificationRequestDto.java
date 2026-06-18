package com.bluemoon.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public class NotificationRequestDto {

    private List<Long> apartmentIds; // Rỗng hoặc null nếu là thông báo chung

    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(max = 200, message = "Tiêu đề không được vượt quá 200 ký tự")
    private String title;

    @NotBlank(message = "Nội dung không được để trống")
    private String content;

    @Size(max = 50, message = "Loại thông báo không được vượt quá 50 ký tự")
    private String type;

    public List<Long> getApartmentIds() {
        return apartmentIds;
    }

    public void setApartmentIds(List<Long> apartmentIds) {
        this.apartmentIds = apartmentIds;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
