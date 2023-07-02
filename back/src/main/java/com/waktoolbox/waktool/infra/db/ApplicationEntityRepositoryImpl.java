package com.waktoolbox.waktool.infra.db;


import com.waktoolbox.waktool.domain.models.tournaments.DisplayableApplication;
import com.waktoolbox.waktool.domain.repositories.ApplicationRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@AllArgsConstructor
public class ApplicationEntityRepositoryImpl implements ApplicationRepository {
    private final ApplicationSpringDataRepository _applicationsSpringDataRepository;

    @Override
    public List<DisplayableApplication> findPendingApplicationsForTeam(String teamId) {
        return _applicationsSpringDataRepository.findAllByTeamId(teamId);
    }

    @Override
    public boolean doesApplicationExist(String applicationId) {
        return _applicationsSpringDataRepository.existsById(applicationId);
    }

    @Override
    public boolean doesThisApplicationExist(String tournamentId, String teamId, String userId) {
        return _applicationsSpringDataRepository.findByTournamentIdAndUserIdAndTeamId(tournamentId, userId, teamId) != null;
    }

    @Override
    public void saveApplication(String tournamentId, String teamId, String userId) {
        if (_applicationsSpringDataRepository.findByTournamentIdAndUserIdAndTeamId(tournamentId, userId, teamId) != null)
            return;

        ApplicationEntity applicationEntity = new ApplicationEntity();
        applicationEntity.setId(UUID.randomUUID().toString());
        applicationEntity.setTournamentId(tournamentId);
        applicationEntity.setUserId(userId);
        applicationEntity.setTeamId(teamId);
        _applicationsSpringDataRepository.save(applicationEntity);
    }

    @Override
    public void deleteUserApplications(String tournamentId, String userId) {
        _applicationsSpringDataRepository.deleteAllByTournamentIdAndUserId(tournamentId, userId);
    }

    @Override
    public void deleteApplication(String tournamentId, String teamId, String applicationId) {
        _applicationsSpringDataRepository.deleteByTournamentIdAndTeamIdAndId(tournamentId, teamId, applicationId);
    }

    @Override
    public Optional<String> getApplicationUserId(String applicationId) {
        return _applicationsSpringDataRepository.findById(applicationId).map(ApplicationEntity::getUserId);
    }
}
