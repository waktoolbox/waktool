package com.waktoolbox.waktool.api.models;

import com.waktoolbox.waktool.domain.models.tournaments.DisplayableApplication;

import java.util.List;

public record PendingApplicationsResponse(List<DisplayableApplication> applications) {
}
