package com.waktoolbox.waktool.domain.repositories;

import com.waktoolbox.waktool.domain.models.tournaments.DisplayableApplication;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository {
    List<DisplayableApplication> findPendingApplicationsForTeam(String teamId);

    boolean doesApplicationExist(String applicationId);

    boolean doesThisApplicationExist(String tournamentId, String teamId, String userId);

    void saveApplication(String tournamentId, String teamId, String userId);

    void deleteUserApplications(String tournamentId, String userId);

    void deleteApplication(String tournamentId, String teamId, String applicationId);

    Optional<String> getApplicationUserId(String applicationId);
}
