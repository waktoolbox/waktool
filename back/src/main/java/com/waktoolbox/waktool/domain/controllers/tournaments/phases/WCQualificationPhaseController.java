package com.waktoolbox.waktool.domain.controllers.tournaments.phases;

import com.waktoolbox.waktool.domain.controllers.tournaments.TournamentPhaseControllerContext;
import com.waktoolbox.waktool.domain.models.Breeds;
import com.waktoolbox.waktool.domain.models.drafts.DraftTeamResult;
import com.waktoolbox.waktool.domain.models.tournaments.*;
import com.waktoolbox.waktool.domain.models.tournaments.matches.TournamentMatch;
import com.waktoolbox.waktool.domain.models.tournaments.matches.TournamentMatchRound;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Wakfu Champions Qualification Phase Controller.
 * <p>
 * Double elimination: teams are paired by loss count.
 * - 2 wins = qualified (stop playing)
 * - 2 losses = eliminated (stop playing)
 * - Teams with same V-D record are matched together.
 * <p>
 * Fixed compositions from inscription (no draft module).
 * Match dates are auto-set from phase round model configuration.
 */
public class WCQualificationPhaseController extends PhaseTypeController {
    private static final Random RANDOM = new SecureRandom();

    public WCQualificationPhaseController(TournamentPhaseControllerContext context) {
        super(context);
    }

    @Override
    public boolean initPhase() {
        TournamentPhaseData tournamentPhaseData = new TournamentPhaseData();
        if (context.getTournamentData().isEmpty()) {
            List<Team> teams = context.getTournamentTeamRepository().getTeamsByTournamentId(context.getTournament().getId());
            tournamentPhaseData.setTeams(teams.stream().map(team -> new TournamentPhaseDataTeam(team.getId(), team.getBreeds(), team.getBannedBreeds(), 0)).toList());
        } else {
            String tournamentId = context.getTournament().getId();
            TournamentData previousPhase = context.getTournamentData().get(context.getPhase() - 1);
            TournamentPhaseData phaseData = previousPhase.getContent();
            if (!context.getTournamentMatchRepository().isAllMatchesDone(tournamentId, previousPhase.getPhase(), phaseData.getCurrentRound()))
                return false;

            updateLostCount(phaseData.getTeams());
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
            if (!context.getTournamentMatchRepository().isAllMatchesDone(tournamentId, context.getPhase(), phaseData.getCurrentRound()))
                return false;

            updateLostCount(teams);
        }

        phaseData.setCurrentRound(phaseData.getCurrentRound() + 1);
        if (phaseData.getMatches() == null) phaseData.setMatches(new ArrayList<>());

        List<TournamentMatch> matchesToSave = createDoubleEliminationRoundMatches(phaseData, teams);
        context.getTournamentMatchRepository().saveAll(tournamentId, matchesToSave);
        context.getTournamentPhaseRepository().save(tournamentData);
        return true;
    }

    private List<TournamentMatch> createDoubleEliminationRoundMatches(TournamentPhaseData phaseData, List<TournamentPhaseDataTeam> teams) {
        List<TournamentMatch> matchesToSave = new ArrayList<>();
        Instant roundDate = getRoundDate(phaseData.getCurrentRound());
        TournamentPhase currentPhase = getCurrentPhase();

        // Group teams by loss count and create matches within each group
        teams.stream()
                .collect(Collectors.groupingBy(TournamentPhaseDataTeam::getLost))
                .forEach((lossCount, fightingTeams) -> {
                    if (lossCount >= 2) return; // eliminated, no more matches

                    // After round 1, teams with 0 losses and having played enough rounds to have 2 wins are qualified
                    // In round 3, only 1V-1D teams play (lossCount == 1)
                    if (phaseData.getCurrentRound() >= 3 && lossCount == 0) return; // 2V+ = qualified

                    List<TournamentPhaseDataTeam> group = new ArrayList<>(fightingTeams);
                    if (group.size() % 2 != 0) group.add(null); // bye if odd
                    Collections.shuffle(group);

                    for (int i = 0; i < group.size(); i += 2) {
                        TournamentPhaseDataTeam teamA = group.get(i);
                        TournamentPhaseDataTeam teamB = group.get(i + 1);

                        if (teamA == null && teamB == null) {
                            throw new IllegalStateException("Double null team, should not happen");
                        }

                        TournamentMatch match = createBaseMatch(phaseData, teamA, teamB);
                        match.setDate(roundDate);

                        // Set match start deadline
                        if (roundDate != null) {
                            int deadlineMinutes = currentPhase.getEffectiveMatchStartDeadlineAfterMatchMinutes();
                            Instant matchStartDeadline = roundDate.plusSeconds((long) deadlineMinutes * 60);
                            // Store deadline on match rounds
                            match.setRounds(createRoundsWithDeadlines(teams, match, null, matchStartDeadline));
                        } else {
                            match.setRounds(createRoundsWithDeadlines(teams, match, null, null));
                        }

                        if (teamA == null) {
                            match.setWinner(teamB.getId());
                            match.setDone(true);
                            addAWinTo(teamB.getId());
                        } else if (teamB == null) {
                            match.setWinner(teamA.getId());
                            match.setDone(true);
                            addAWinTo(teamA.getId());
                        }

                        phaseData.getMatches().add(match.getId());
                        matchesToSave.add(match);
                    }
                });

        return matchesToSave;
    }

    private TournamentMatch createBaseMatch(TournamentPhaseData phaseData, TournamentPhaseDataTeam teamA, TournamentPhaseDataTeam teamB) {
        TournamentMatch match = new TournamentMatch();
        match.setId(UUID.randomUUID().toString());
        match.setPhase(context.getPhase());
        match.setRound(phaseData.getCurrentRound());
        match.setTeamA(Optional.ofNullable(teamA).map(TournamentPhaseDataTeam::getId).orElse(null));
        match.setTeamB(Optional.ofNullable(teamB).map(TournamentPhaseDataTeam::getId).orElse(null));
        return match;
    }

    /**
     * Creates match rounds using fixed team compositions (no draft module in qualification).
     */
    private List<TournamentMatchRound> createRoundsWithDeadlines(List<TournamentPhaseDataTeam> teams, TournamentMatch match, Instant draftJoinDeadline, Instant matchStartDeadline) {
        List<TournamentMatchRound> rounds = new ArrayList<>();
        Map<String, DraftTeamResult> breedsByTeam = collectTeamBreeds(teams);
        boolean mustUseDifferentMaps = getCurrentPhase().isEffectiveMustUseDifferentMapsPerRound();
        Set<Integer> usedMaps = new HashSet<>();

        // Qualification is always BO1
        TournamentMatchRound matchRound = new TournamentMatchRound();
        matchRound.setDraftFirstPicker(match.getTeamA());

        int map = rollMap(mustUseDifferentMaps ? usedMaps : null);
        matchRound.setMap(map);
        matchRound.setRound(0);

        // Use fixed compositions - no draft ID
        matchRound.setTeamADraft(breedsByTeam.get(match.getTeamA()));
        matchRound.setTeamBDraft(breedsByTeam.get(match.getTeamB()));
        matchRound.setMatchStartDeadline(matchStartDeadline);

        rounds.add(matchRound);
        return rounds;
    }

    private Map<String, DraftTeamResult> collectTeamBreeds(List<TournamentPhaseDataTeam> teams) {
        return context.getTournamentTeamRepository().getTeamsWithIds(teams.stream().map(TournamentPhaseDataTeam::getId).toList())
                .stream()
                .collect(Collectors.toMap(Team::getId, team -> {
                    Breeds[] pickedClasses = team.getBreeds().stream().map(Breeds::fromId).filter(Objects::nonNull).toArray(Breeds[]::new);
                    Breeds[] bannedClasses = team.getBannedBreeds() != null
                            ? team.getBannedBreeds().stream().map(Breeds::fromId).filter(Objects::nonNull).toArray(Breeds[]::new)
                            : new Breeds[0];
                    return new DraftTeamResult(pickedClasses, bannedClasses);
                }));
    }

    private Instant getRoundDate(int currentRound) {
        TournamentPhase currentPhase = getCurrentPhase();
        TournamentRoundModel[] roundModels = currentPhase.getRoundModel();
        if (roundModels != null) {
            for (TournamentRoundModel model : roundModels) {
                if (model.getRound() == currentRound && model.getDate() != null) {
                    return model.getDate();
                }
            }
        }
        return null;
    }

    private int rollMap(Set<Integer> excludedMaps) {
        int[] allMaps = context.getTournament().getMaps();
        if (excludedMaps != null && !excludedMaps.isEmpty()) {
            int[] available = java.util.Arrays.stream(allMaps).filter(m -> !excludedMaps.contains(m)).toArray();
            if (available.length > 0) {
                return available[RANDOM.nextInt(available.length)];
            }
        }
        return allMaps[RANDOM.nextInt(allMaps.length)];
    }

    private TournamentPhase getCurrentPhase() {
        return context.getTournament().getPhases().stream()
                .filter(p -> p.getPhase() == context.getPhase())
                .findFirst()
                .orElse(new TournamentPhase());
    }

    private void updateLostCount(List<TournamentPhaseDataTeam> teamsToUpdate) {
        List<Team> teams = context.getTournamentTeamRepository().getTeamsWithIds(teamsToUpdate.stream().map(TournamentPhaseDataTeam::getId).toList());

        Map<String, Integer> lostCount = new HashMap<>();
        for (Team team : teams) {
            lostCount.put(team.getId(), Optional.ofNullable(team.getStats()).map(s -> s.getPlayed() - s.getVictories()).orElse(0));
        }
        teamsToUpdate.forEach(team -> team.setLost(lostCount.getOrDefault(team.getId(), 0)));
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

