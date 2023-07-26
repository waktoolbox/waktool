package com.waktoolbox.waktool.infra.db;


import com.waktoolbox.waktool.domain.models.tournaments.LightTournament;
import com.waktoolbox.waktool.domain.models.tournaments.Tournament;
import com.waktoolbox.waktool.domain.repositories.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class TournamentRepositoryImpl implements TournamentRepository {
    private final TournamentSpringDataRepository _repository;

    @Override
    public boolean isTournamentStarted(String id) {
        String tournamentStartDate = _repository.getRawTournamentStartDate(id);
        return Instant.parse(tournamentStartDate).isBefore(Instant.now());
    }

    @Override
    public boolean isAdmin(String id, String user) {
        return _repository.isAdmin(id, user);
    }

    @Override
    public boolean isStreamer(String id, String user) {
        return _repository.isStreamer(id, user);
    }

    @Override
    public boolean isReferee(String id, String user) {
        return _repository.isReferee(id, user);
    }

    @Override
    public LightTournament getFeaturedTournament() {
        return _repository.getFeaturedTournamentLight();
    }

    @Override
    public Optional<Tournament> getTournament(String id) {
        return _repository.findById(id).map(TournamentEntity::getContent);
    }

    public Optional<String> getDiscordGuildId(String id) {
        return _repository.getDiscordGuildId(id);
    }
}
