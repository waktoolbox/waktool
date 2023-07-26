package com.waktoolbox.waktool.domain.controllers.tournaments.phases;

import com.waktoolbox.waktool.domain.controllers.tournaments.TournamentPhaseControllerContext;
import com.waktoolbox.waktool.domain.models.tournaments.*;
import com.waktoolbox.waktool.domain.models.tournaments.matches.TournamentMatch;
import com.waktoolbox.waktool.domain.models.tournaments.matches.TournamentMatchRound;

import java.security.SecureRandom;
import java.util.*;
import java.util.stream.Collectors;

public class WWDoubleEliminationPhaseController extends PhaseTypeController {
    private static final Random RANDOM = new SecureRandom();

    // Sadly Lombok has no @SuperConstructor annotation
    public WWDoubleEliminationPhaseController(TournamentPhaseControllerContext context) {
        super(context);
    }

    @Override
    public boolean initPhase() {
        TournamentPhaseData tournamentPhaseData = new TournamentPhaseData();
        if (context.getTournamentData().isEmpty()) { // first init
            List<Team> teams = context.getTournamentTeamRepository().getTeamsByTournamentId(context.getTournament().getId());
            tournamentPhaseData.setTeams(teams.stream().map(Team::getId).map(id -> new TournamentPhaseDataTeam(id, 0)).toList());
        } else {
            String tournamentId = context.getTournament().getId();
            TournamentData previousPhase = context.getTournamentData().get(context.getPhase() - 1);
            TournamentPhaseData phaseData = previousPhase.getContent();
            if (!context.getTournamentMatchRepository().isAllMatchesDone(tournamentId, previousPhase.getPhase(), phaseData.getCurrentRound()))
                return false;

            updateLostCount(phaseData.getTeams());

            // TODO late: do something better to gather teams from previous phase using it dedicated controller
            List<TournamentPhaseDataTeam> previousTeamList = phaseData.getTeams().stream().filter(team -> team.getLost() < 2).toList();
            tournamentPhaseData.setTeams(previousTeamList);
        }

        tournamentPhaseData.setCurrentRound(0);
        TournamentData data = TournamentData.builder()
                .tournamentId(context.getTournament().getId())
                .phase(context.getPhase() + 1)
                .content(tournamentPhaseData)
                .build();

        context.setPhase(data.getPhase());
        context.getTournamentPhaseRepository().save(data);
        context.getTournamentData().add(data);
        return true;
    }

    @Override
    public boolean startNextRound() {
        String tournamentId = context.getTournament().getId();
        TournamentData tournamentData = context.getTournamentData().get(context.getTournamentData().size() - 1);
        TournamentPhaseData phaseData = tournamentData.getContent();

        List<TournamentPhaseDataTeam> teams = phaseData.getTeams();
        if (phaseData.getCurrentRound() > 0) {
            // To go to next round, all matches must be done
            if (!context.getTournamentMatchRepository().isAllMatchesDone(tournamentId, context.getPhase(), phaseData.getCurrentRound()))
                return false;

            // Updated at phase start for the round 0, so we don't update it twice
            updateLostCount(teams);
        }

        phaseData.setCurrentRound(phaseData.getCurrentRound() + 1);

        if (phaseData.getMatches() == null) phaseData.setMatches(new ArrayList<>());

        if (teams.size() <= 4) {
            if (phaseData.getCurrentRound() == 1) {
                processMatchesCreationBeforeFinals(phaseData, teams);
                context.getTournamentPhaseRepository().save(tournamentData);
                return true;
            }

            if (phaseData.getCurrentRound() == 2) {
                processMatchesCreationBeforeFinals(phaseData, teams.stream().filter(team -> team.getLost() == 1).toList());
                context.getTournamentPhaseRepository().save(tournamentData);
                return true;
            }

            Optional<TournamentPhaseDataTeam> noLoss = teams.stream().filter(team -> team.getLost() == 0).findFirst();
            Optional<TournamentPhaseDataTeam> oneLoss = teams.stream().filter(team -> team.getLost() == 1).findFirst();

            if (noLoss.isEmpty() || oneLoss.isEmpty()) {
                throw new IllegalStateException("Final but no team with 0 loss or 1 loss");
            }

            TournamentMatch baseMatch = createBaseMatch(phaseData, noLoss.get(), oneLoss.get());
            baseMatch.setRounds(createRoundsForFinals(baseMatch, noLoss.get(), oneLoss.get()));

            phaseData.getMatches().add(baseMatch.getId());
            context.getTournamentMatchRepository().saveAll(context.getTournament().getId(), List.of(baseMatch));
        } else {
            processMatchesCreationBeforeFinals(phaseData, teams);
        }

        context.getTournamentPhaseRepository().save(tournamentData);
        return true;
    }

    private void processMatchesCreationBeforeFinals(TournamentPhaseData phaseData, List<TournamentPhaseDataTeam> teams) {
        List<TournamentMatch> matchesToSave = new ArrayList<>();
        teams.stream().collect(Collectors.groupingBy(TournamentPhaseDataTeam::getLost)).forEach((lossCount, fightingTeams) -> {
            if (lossCount >= 2) return; // no match for losers
            if (context.getPhase() == 1 && phaseData.getCurrentRound() == 3 && lossCount == 0)
                return; // no match for winners of 2
            if (context.getPhase() > 1 && phaseData.getCurrentRound() > 1 && lossCount == 0)
                return; // no match for winners of 1 after phase 1

            if (fightingTeams.size() % 2 != 0) fightingTeams.add(null); // add a null for stats if odd number of teams
            Collections.shuffle(fightingTeams);

            for (int i = 0; i < fightingTeams.size(); i += 2) {
                TournamentPhaseDataTeam teamA = fightingTeams.get(i);
                TournamentPhaseDataTeam teamB = fightingTeams.get(i + 1);

                if (teamA == null && teamB == null) {
                    throw new IllegalStateException("Double null team here, alert !");
                }

                TournamentMatch tournamentMatch = createBaseMatch(phaseData, teamA, teamB);

                if (teamA == null) {
                    tournamentMatch.setWinner(teamB.getId());
                    tournamentMatch.setDone(true);
                    addAWinTo(teamB.getId());
                } else if (teamB == null) {
                    tournamentMatch.setWinner(teamA.getId());
                    tournamentMatch.setDone(true);
                    addAWinTo(teamA.getId());
                }

                tournamentMatch.setRounds(createRoundsBeforeFinals(teams, tournamentMatch));

                phaseData.getMatches().add(tournamentMatch.getId());
                matchesToSave.add(tournamentMatch);
            }
        });
        context.getTournamentMatchRepository().saveAll(context.getTournament().getId(), matchesToSave);
    }

    private TournamentMatch createBaseMatch(TournamentPhaseData phaseData, TournamentPhaseDataTeam teamA, TournamentPhaseDataTeam teamB) {
        TournamentMatch tournamentMatch = new TournamentMatch();
        tournamentMatch.setId(UUID.randomUUID().toString());
        tournamentMatch.setPhase(context.getPhase());
        tournamentMatch.setRound(phaseData.getCurrentRound());
        tournamentMatch.setTeamA(Optional.ofNullable(teamA).map(TournamentPhaseDataTeam::getId).orElse(null));
        tournamentMatch.setTeamB(Optional.ofNullable(teamB).map(TournamentPhaseDataTeam::getId).orElse(null));
        return tournamentMatch;
    }

    private List<TournamentMatchRound> createRoundsBeforeFinals(List<TournamentPhaseDataTeam> teams, TournamentMatch tournamentMatch) {
        List<TournamentMatchRound> rounds = new ArrayList<>();
        // TODO late: use config
        int lowerTeamSizeRoundCount = teams.size() <= 4 ? 5 : 3;
        int roundsCount = teams.size() <= 8 ? lowerTeamSizeRoundCount : 1;
        for (int round = 0; round < roundsCount; round++) {
            TournamentMatchRound matchRound = new TournamentMatchRound();

            if (round == 0) {
                matchRound.setDraftFirstPicker(tournamentMatch.getTeamA());
            }

            matchRound.setMap(rollMap());
            matchRound.setRound(round);
            matchRound.setDraftId(tournamentMatch.getId() + "_" + round);

            rounds.add(matchRound);
        }
        return rounds;
    }

    private List<TournamentMatchRound> createRoundsForFinals(TournamentMatch tournamentMatch, TournamentPhaseDataTeam noLoss, TournamentPhaseDataTeam oneLoss) {
        List<TournamentMatchRound> rounds = new ArrayList<>();
        for (int round = 0; round < 5; round++) {
            TournamentMatchRound matchRound = new TournamentMatchRound();

            if (round == 0) {
                matchRound.setWinner(noLoss.getId());
            } else if (round == 1) {
                matchRound.setDraftFirstPicker(RANDOM.nextInt(2) == 0 ? noLoss.getId() : oneLoss.getId());
            }
            matchRound.setMap(rollMap());
            matchRound.setRound(round);
            matchRound.setDraftId(tournamentMatch.getId() + "_" + round);

            rounds.add(matchRound);
        }
        return rounds;
    }

    private int rollMap() {
        int[] maps = context.getTournament().getMaps();
        return maps[RANDOM.nextInt(maps.length)];
    }

    private void updateLostCount(List<TournamentPhaseDataTeam> teamsToUpdate) {
        List<Team> teams = context.getTournamentTeamRepository().getTeamsWithIds(teamsToUpdate.stream().map(TournamentPhaseDataTeam::getId).toList());

        Map<String, Integer> lostCount = new HashMap<>();
        for (Team team : teams) {
            lostCount.put(team.getId(), team.getStats().getPlayed() - team.getStats().getVictories());
        }
        teamsToUpdate.forEach(team -> team.setLost(lostCount.get(team.getId())));
    }

    private void addAWinTo(String teamId) {
        context.getTournamentTeamRepository().getTeam(teamId).ifPresent(team -> {
            if (team.getStats() == null) {
                team.setStats(new TeamStats());
            }
            TeamStats stats = team.getStats();
            stats.setPlayed(Optional.ofNullable(stats.getPlayed()).orElse(0) + 1);
            stats.setVictories(Optional.ofNullable(stats.getVictories()).orElse(0) + 1);
            context.getTournamentTeamRepository().saveTeam(team);
        });
    }
}
