package com.waktoolbox.waktool.infra.db;

import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

public interface MatchReportSpringDataRepository extends CrudRepository<MatchReportEntity, MatchReportEntity.MatchReportId> {

    List<MatchReportEntity> findAllByMatchId(String matchId);

    Optional<MatchReportEntity> findByMatchIdAndRound(String matchId, int round);

    void deleteAllByMatchId(String matchId);
}

