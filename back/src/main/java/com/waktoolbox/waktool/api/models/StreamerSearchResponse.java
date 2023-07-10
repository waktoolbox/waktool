package com.waktoolbox.waktool.api.models;

import com.waktoolbox.waktool.domain.models.users.Streamer;

import java.util.List;

public record StreamerSearchResponse(List<Streamer> streamers) {
}
