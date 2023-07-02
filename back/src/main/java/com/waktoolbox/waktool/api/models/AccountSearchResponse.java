package com.waktoolbox.waktool.api.models;

import java.util.List;

public record AccountSearchResponse(List<LightAccountResponse> accounts) {
}
