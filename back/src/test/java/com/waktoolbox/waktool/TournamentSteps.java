package com.waktoolbox.waktool;

import com.decathlon.tzatziki.steps.ObjectSteps;
import com.decathlon.tzatziki.utils.Guard;
import com.waktoolbox.waktool.domain.controllers.tournaments.TournamentPhaseController;
import com.waktoolbox.waktool.domain.controllers.tournaments.TournamentPhaseControllerFactory;
import com.waktoolbox.waktool.domain.controllers.tournaments.TournamentStatsController;
import com.waktoolbox.waktool.domain.models.Account;
import com.waktoolbox.waktool.domain.models.drafts.DraftTeamResult;
import com.waktoolbox.waktool.domain.models.tournaments.Team;
import com.waktoolbox.waktool.domain.models.tournaments.TournamentData;
import com.waktoolbox.waktool.domain.models.tournaments.matches.MatchesSearchParameters;
import com.waktoolbox.waktool.domain.models.tournaments.matches.MatchesSearchType;
import com.waktoolbox.waktool.domain.models.tournaments.matches.TournamentMatch;
import com.waktoolbox.waktool.domain.repositories.AccountRepository;
import com.waktoolbox.waktool.domain.repositories.TournamentMatchRepository;
import com.waktoolbox.waktool.domain.repositories.TournamentPhaseRepository;
import com.waktoolbox.waktool.infra.db.TeamEntity;
import com.waktoolbox.waktool.infra.db.TeamSpringDataRepository;
import com.waktoolbox.waktool.infra.db.TournamentMatchEntity;
import com.waktoolbox.waktool.infra.db.TournamentMatchSpringDataRepository;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.Assertions;
import org.testcontainers.shaded.com.google.common.collect.Lists;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.decathlon.tzatziki.utils.Guard.GUARD;
import static com.decathlon.tzatziki.utils.Patterns.*;

@RequiredArgsConstructor
public class TournamentSteps {
    private static final List<Byte> BREEDS_ODD = List.of((byte) 1, (byte) 3, (byte) 5, (byte) 7, (byte) 9, (byte) 11);
    private static final List<Byte> BREEDS_EVEN = List.of((byte) 2, (byte) 4, (byte) 6, (byte) 8, (byte) 10, (byte) 12);

    private final ObjectSteps _objectSteps;
    private final TeamSpringDataRepository _teamSpringDataRepository;
    private final TournamentMatchRepository _tournamentMatchRepository;
    private final TournamentMatchSpringDataRepository _tournamentMatchSpringDataRepository;
    private final TournamentPhaseControllerFactory _tournamentPhaseControllerFactory;
    private final TournamentPhaseRepository _tournamentPhaseRepository;
    private final TournamentStatsController _tournamentStatsController;
    private final AccountRepository _accountRepository;


    @Given(THAT + "we have " + NUMBER + " teams in tournament " + VARIABLE + "$")
    public void teamsInTournamentWithId(Number teamNb, String id) {
        int nb = teamNb.intValue();
        for (int i = 0; i < nb; i++) {
            _accountRepository.save(
                    Account.builder()
                            .id("" + i)
                            .globalName("GlobalName " + i)
                            .username("Username " + i)
                            .discriminator("" + i)
                            .ankamaName("AnkamaName " + i)
                            .ankamaDiscriminator("" + i)
                            .email("account" + i + "@wakfu.com")
                            .build()
            );

            Team team = new Team();
            team.setId("" + i);
            team.setName("Team " + i);
            team.setLeader("" + i);
            team.setServer("Server " + i);
            team.setPlayers(List.of("" + i));
            team.setBreeds(i % 2 == 0 ? BREEDS_EVEN : BREEDS_ODD);
            team.setTournament(id);
            team.setCatchPhrase("Catch phrase " + i);
            team.setDisplayOnTeamList(true);
            team.setValidatedPlayers(List.of("" + i));

            TeamEntity teamEntity = new TeamEntity();
            teamEntity.setId("" + i);
            teamEntity.setContent(team);
            teamEntity.setCreatedAt(Instant.now());
            _teamSpringDataRepository.save(teamEntity);
        }
    }

    @Given(THAT + "we start next round or phase of tournament " + VARIABLE + "$")
    public void startNextPhaseOfTournament(String id) {
        TournamentPhaseController tournamentPhaseController = _tournamentPhaseControllerFactory.get(id);

        if (tournamentPhaseController.hasANextRound()) {
            tournamentPhaseController.startNextRound();
            return;
        }

        if (tournamentPhaseController.hasANextPhase()) {
            tournamentPhaseController.startNextPhase();
        }
    }

    @Given(THAT + "all teams " + VARIABLE + " of tournament " + VARIABLE + " win their match$")
    public void allTeamWinTheirMatch(String team, String id) {
        int maxTournamentPhase = _tournamentPhaseRepository.getMaxTournamentPhase(id);

        MatchesSearchParameters parameters = new MatchesSearchParameters();
        parameters.setPhase(maxTournamentPhase);
        parameters.setType(MatchesSearchType.PLANNING);

        List<TournamentMatch> matches = _tournamentMatchRepository.getMatches(id, parameters);

        matches.forEach(match -> {
            match.setWinner("A".equals(team) ? match.getTeamA() : match.getTeamB());
            match.setDone(true);

            _tournamentStatsController.fillStats(match, match.getTeamA());
            _tournamentStatsController.fillStats(match, match.getTeamB());
            _tournamentMatchRepository.save(id, match);
        });
    }

    @Then(THAT + GUARD + "there is " + NUMBER + " pending matches in tournament " + VARIABLE + "$")
    public void pendingMatches(Guard guard, Number nbMatches, String id) {
        guard.in(_objectSteps, () -> {
            List<TournamentData> tournamentData = _tournamentPhaseRepository.getTournamentData(id);
            TournamentData maxTournamentPhase = tournamentData.stream().max(Comparator.comparing(TournamentData::getPhase)).orElseThrow();

            Assertions.assertEquals(nbMatches, _tournamentMatchSpringDataRepository.countAllNotDoneMatchesByTournamentIdAndPhaseAndRound(
                    id,
                    maxTournamentPhase.getPhase(),
                    "" + maxTournamentPhase.getContent().getCurrentRound()
            ));
        });
    }

    @Then(THAT + "the matches drafts are using predefined team breeds in tournament " + VARIABLE + " phase " + NUMBER + "$")
    public void matchDraftUsingPredefinedTeamBreeds(String id, Number phase) {
        Map<String, Team> teams = _teamSpringDataRepository.getTeamsByTournamentId(id)
                .stream()
                .map(TeamEntity::getContent)
                .collect(Collectors.groupingBy(Team::getId, Collectors.reducing(null, team -> team, (team1, team2) -> team1 == null ? team2 : team1)));

        List<TournamentMatch> matches = _tournamentMatchSpringDataRepository.findAllMatchesByTournamentIdAndPhase(id, phase.intValue()).stream().map(TournamentMatchEntity::getContent).toList();

        matches.forEach(match -> {
            Team teamA = teams.get(match.getTeamA());
            Team teamB = teams.get(match.getTeamB());

            if (match.getTeamA() != null) {
                if (teamA == null) throw new IllegalStateException("Team A not found");

                DraftTeamResult teamADraft = match.getRounds().getFirst().getTeamADraft();
                List<Byte> teamAClasses = Lists.newArrayList(teamADraft.getPickedClasses());
                Assertions.assertTrue(teamAClasses.containsAll(teamA.getBreeds()));
            }

            if (match.getTeamB() != null) {
                if (teamB == null) throw new IllegalStateException("Team B not found");

                DraftTeamResult teamBDraft = match.getRounds().getFirst().getTeamBDraft();
                List<Byte> teamBClasses = Lists.newArrayList(teamBDraft.getPickedClasses());
                Assertions.assertTrue(teamBClasses.containsAll(teamB.getBreeds()));
            }
        });
    }

    @Then(THAT + "the matches drafts are manual in tournament " + VARIABLE + " phase " + NUMBER + "$")
    public void matchDraftUsingManual(String id, Number phase) {
        List<TournamentMatch> matches = _tournamentMatchSpringDataRepository.findAllMatchesByTournamentIdAndPhase(id, phase.intValue())
                .stream()
                .map(TournamentMatchEntity::getContent)
                .toList();

        Assertions.assertTrue(matches.stream().allMatch(m -> m.getRounds().getFirst().getDraftFirstPicker() != null));
    }

    @Then(THAT + "the matches drafts are manual in tournament " + VARIABLE + " phase " + NUMBER + " round " + NUMBER + " match round " + NUMBER + "$")
    public void matchDraftUsingManual(String id, Number phase, Number round, Number matchRound) {
        List<TournamentMatch> matches = _tournamentMatchSpringDataRepository.findAllMatchesByTournamentIdAndPhase(id, phase.intValue())
                .stream()
                .map(TournamentMatchEntity::getContent)
                .filter(m -> m.getRound() == round.intValue())
                .toList();

        Assertions.assertTrue(matches.stream().allMatch(m -> m.getRounds().get(matchRound.intValue()).getDraftFirstPicker() != null));
    }
}
