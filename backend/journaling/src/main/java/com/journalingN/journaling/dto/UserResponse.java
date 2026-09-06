package com.journalingN.journaling.dto;

import com.journalingN.journaling.entity.User;
import java.util.List;

public record UserResponse(String id, String userName, String email, Boolean sentimentAnalysis, List<String> roles) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId() == null ? null : user.getId().toHexString(),
                user.getUserName(),
                user.getEmail(),
                user.getSentimentAnalysis(),
                user.getRoles()
        );
    }
}
