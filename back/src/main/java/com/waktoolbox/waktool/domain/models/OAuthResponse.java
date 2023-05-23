package com.waktoolbox.waktool.domain.models;

public record OAuthResponse(
        String accessToken,
        String tokenType) {
}
