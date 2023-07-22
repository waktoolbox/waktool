package com.waktoolbox.waktool.infra.db;

import com.waktoolbox.waktool.domain.models.tournaments.TournamentData;
import com.waktoolbox.waktool.domain.repositories.TournamentPhaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class TournamentPhaseRepositoryImpl implements TournamentPhaseRepository {
    private final TournamentPhaseSpringDataRepository _repository;

    @Override
    public void save(TournamentData tournamentData) {
        TournamentPhaseEntity.TournamentPhaseId id = new TournamentPhaseEntity.TournamentPhaseId();
        id.setTournamentId(tournamentData.getTournamentId());
        id.setPhase(tournamentData.getPhase());

        TournamentPhaseEntity entity = new TournamentPhaseEntity();
        entity.setId(id);
        entity.setContent(tournamentData.getContent());

        _repository.save(entity);
    }

    @Override
    public List<TournamentData> getTournamentData(String tournamentId) {
        return _repository.findAllByIdTournamentId(tournamentId).stream()
                .map(entity -> TournamentData.builder()
                        .tournamentId(entity.getId().getTournamentId())
                        .phase(entity.getId().getPhase())
                        .content(entity.getContent())
                        .build()
                )
                .toList();
    }

    public int getMaxTournamentPhase(String tournamentId) {
        return _repository.getMaxPhaseByIdTournamentId(tournamentId);
    }
}
