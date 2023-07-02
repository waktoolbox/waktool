package com.waktoolbox.waktool.infra.db;


import com.waktoolbox.waktool.domain.models.tournaments.LightTournament;
import com.waktoolbox.waktool.domain.models.tournaments.Tournament;
import com.waktoolbox.waktool.domain.repositories.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class TournamentRepositoryImpl implements TournamentRepository {
    private final TournamentSpringDataRepository _repository;

    @Override
    public LightTournament getFeaturedTournament() {
        return _repository.getFeaturedTournamentLight();
    }

    @Override
    public Optional<Tournament> getTournament(String id) {
        return _repository.findById(id).map(TournamentEntity::getContent);
    }
}
