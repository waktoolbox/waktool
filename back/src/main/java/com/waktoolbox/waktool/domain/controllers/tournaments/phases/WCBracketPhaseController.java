package com.waktoolbox.waktool.domain.controllers.tournaments.phases;

import com.waktoolbox.waktool.domain.controllers.tournaments.TournamentPhaseControllerContext;
import com.waktoolbox.waktool.domain.models.tournaments.*;
import com.waktoolbox.waktool.domain.models.tournaments.matches.MatchesSearchParameters;
import com.waktoolbox.waktool.domain.models.tournaments.matches.MatchesSearchType;
import com.waktoolbox.waktool.domain.models.tournaments.matches.TournamentMatch;
import com.waktoolbox.waktool.domain.models.tournaments.matches.TournamentMatchRound;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Wakfu Champions Bracket Phase Controller.
 * <p>
 * Single-elimination bracket with seeding from qualification (0-defeat vs 1-defeat).
 * Handles petite finale (3rd place match) alongside the finale.
 * Draft module is used. Match dates and draft deadlines are auto-set from phase config.
 * <p>
 * Round model BO config: 16th(BO1), 8th(BO1), Quarters(BO3), Semis(BO3), Petite Finale(BO3), Finale(BO5).
 */
public class WCBracketPhaseController extends PhaseTypeController {
    private static final Random RANDOM = new SecureRandom();

    public WCBracketPhaseController(TournamentPhaseControllerContext context) {
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

            // Update lost count from previous phase
            updateLostCount(phaseData.getTeams());

            // Take qualified teams (lost < 2 in double elim qualification)
            List<TournamentPhaseDataTeam> qualifiedTeams = new ArrayList<>(
                    phaseData.getTeams().stream().filter(t -> t.getLost() < 2).toList()
            );

            // Seed: teams with 0 defeats first, then teams with 1 defeat
            // Within each group, order is preserved (random from qualification)
            List<TournamentPhaseDataTeam> zeroDefeat = qualifiedTeams.stream().filter(t -> t.getLost() == 0).collect(Collectors.toList());
            List<TournamentPhaseDataTeam> oneDefeat = qualifiedTeams.stream().filter(t -> t.getLost() == 1).collect(Collectors.toList());
            Collections.shuffle(zeroDefeat);
            Collections.shuffle(oneDefeat);

            List<TournamentPhaseDataTeam> seededTeams = new ArrayList<>();
            seededTeams.addAll(zeroDefeat);
            seededTeams.addAll(oneDefeat);

            // Limit to bracket size if configured
            TournamentPhase currentPhaseConfig = context.getTournament().getPhases().get(context.getPhase());
            int bracketSize = currentPhaseConfig.getPoolSize() > 0 ? currentPhaseConfig.getPoolSize() : seededTeams.size();
            seededTeams = seededTeams.subList(0, Math.min(bracketSize, seededTeams.size()));

            // Reset loss count for bracket phase
            tournamentPhaseData.setTeams(seededTeams.stream()
                    .map(t -> new TournamentPhaseDataTeam(t.getId(), t.getBreeds(), t.getBannedBreeds(), 0))
                    .toList());
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

        List<TournamentPhaseDataTeam> teams = new ArrayList<>(phaseData.getTeams());
        if (phaseData.getCurrentRound() > 0) {
            if (!context.getTournamentMatchRepository().isAllMatchesDone(tournamentId, context.getPhase(), phaseData.getCurrentRound()))
                return false;

            updateBracketLostCount(teams, phaseData.getCurrentRound());
            phaseData.setTeams(new ArrayList<>(teams));
        }

        phaseData.setCurrentRound(phaseData.getCurrentRound() + 1);
        if (phaseData.getMatches() == null) phaseData.setMatches(new ArrayList<>());

        // Determine remaining active teams (not eliminated)
        List<TournamentPhaseDataTeam> activeTeams = teams.stream().filter(t -> t.getLost() == 0).toList();

        if (activeTeams.size() <= 1) {
            // Tournament is over
            context.getTournamentPhaseRepository().save(tournamentData);
            return false;
        }

        List<TournamentMatch> matchesToSave = new ArrayList<>();

        if (activeTeams.size() == 2) {
            // Finale: create finale match + petite finale match
            matchesToSave.addAll(createFinaleRound(phaseData, teams, activeTeams));
        } else {
            // Normal bracket round
            matchesToSave.addAll(createBracketRoundMatches(phaseData, activeTeams));
        }

        context.getTournamentMatchRepository().saveAll(tournamentId, matchesToSave);
        context.getTournamentPhaseRepository().save(tournamentData);
        return true;
    }

    private List<TournamentMatch> createBracketRoundMatches(TournamentPhaseData phaseData, List<TournamentPhaseDataTeam> activeTeams) {
        List<TournamentMatch> matchesToSave = new ArrayList<>();
        List<TournamentPhaseDataTeam> orderedTeams = new ArrayList<>(activeTeams);

        // First round: use seeding (1 vs N, 2 vs N-1, etc.)
        if (phaseData.getCurrentRound() == 1) {
            orderedTeams = seedBracket(orderedTeams);
        } else {
            // Subsequent rounds: order teams based on previous round match indices
            // so the bracket tree stays consistent
            orderedTeams = orderByPreviousRoundMatchIndex(phaseData, activeTeams);
        }

        int matchIndex = 0;

        if (orderedTeams.size() % 2 != 0) {
            // Bye for last team
            TournamentPhaseDataTeam byeTeam = orderedTeams.removeLast();
            TournamentMatch byeMatch = createBaseMatch(phaseData, byeTeam, null);
            byeMatch.setWinner(byeTeam.getId());
            byeMatch.setDone(true);
            byeMatch.setRounds(List.of());
            byeMatch.setMatchIndex(matchIndex++);
            phaseData.getMatches().add(byeMatch.getId());
            matchesToSave.add(byeMatch);
        }

        Instant roundDate = getRoundDate(phaseData.getCurrentRound());
        int bo = getBoForRound(phaseData.getCurrentRound());

        for (int i = 0; i < orderedTeams.size(); i += 2) {
            TournamentPhaseDataTeam teamA = orderedTeams.get(i);
            TournamentPhaseDataTeam teamB = orderedTeams.get(i + 1);

            TournamentMatch match = createBaseMatch(phaseData, teamA, teamB);
            match.setDate(roundDate);
            match.setRounds(createDraftRounds(match, bo, roundDate));
            match.setMatchIndex(matchIndex++);

            // Set notification date to draft open time for bracket phase (notify before draft, not match)
            if (roundDate != null) {
                int draftBeforeMinutes = getCurrentPhase().getEffectiveDraftAvailableBeforeMatchMinutes();
                match.setNotificationDate(roundDate.minus(15 + draftBeforeMinutes, ChronoUnit.MINUTES));
            }

            phaseData.getMatches().add(match.getId());
            matchesToSave.add(match);
        }

        return matchesToSave;
    }

    private List<TournamentMatch> createFinaleRound(TournamentPhaseData phaseData, List<TournamentPhaseDataTeam> allTeams, List<TournamentPhaseDataTeam> finalists) {
        List<TournamentMatch> matchesToSave = new ArrayList<>();
        Instant roundDate = getRoundDate(phaseData.getCurrentRound());

        // Finale
        int finaleBo = getBoForRound(phaseData.getCurrentRound());
        TournamentPhaseDataTeam finalistA = finalists.get(0);
        TournamentPhaseDataTeam finalistB = finalists.get(1);

        TournamentMatch finaleMatch = createBaseMatch(phaseData, finalistA, finalistB);
        finaleMatch.setDate(roundDate);
        finaleMatch.setRounds(createDraftRounds(finaleMatch, finaleBo, roundDate));
        finaleMatch.setMatchIndex(0);
        if (roundDate != null) {
            int draftBeforeMinutes = getCurrentPhase().getEffectiveDraftAvailableBeforeMatchMinutes();
            finaleMatch.setNotificationDate(roundDate.minus(15 + draftBeforeMinutes, ChronoUnit.MINUTES));
        }
        phaseData.getMatches().add(finaleMatch.getId());
        matchesToSave.add(finaleMatch);

        // Petite finale (3rd place match) - teams who lost in the previous round (semi-final losers)
        List<TournamentPhaseDataTeam> semiLosers = allTeams.stream()
                .filter(t -> t.getLost() == 1)
                .toList();

        if (semiLosers.size() >= 2) {
            // Get petite finale date from next round slot if configured, otherwise use same date
            Instant petiteFinaleDate = getRoundDate(phaseData.getCurrentRound() + 1);
            if (petiteFinaleDate == null) petiteFinaleDate = roundDate;

            int petiteFinaleBo = getBoForRound(phaseData.getCurrentRound() + 1);
            if (petiteFinaleBo <= 0) petiteFinaleBo = 3; // default BO3

            TournamentPhaseDataTeam petiteA = semiLosers.get(0);
            TournamentPhaseDataTeam petiteB = semiLosers.get(1);

            TournamentMatch petiteFinaleMatch = createBaseMatch(phaseData, petiteA, petiteB);
            petiteFinaleMatch.setDate(petiteFinaleDate);
            petiteFinaleMatch.setThirdPlaceMatch(Boolean.TRUE);
            petiteFinaleMatch.setRounds(createDraftRounds(petiteFinaleMatch, petiteFinaleBo, petiteFinaleDate));
            if (petiteFinaleDate != null) {
                int draftBeforeMinutes = getCurrentPhase().getEffectiveDraftAvailableBeforeMatchMinutes();
                finaleMatch.setNotificationDate(petiteFinaleDate.minus(15 + draftBeforeMinutes, ChronoUnit.MINUTES));
            }
            phaseData.getMatches().add(petiteFinaleMatch.getId());
            matchesToSave.add(petiteFinaleMatch);
        }

        return matchesToSave;
    }

    /**
     * Orders active teams by their previous round match index so that bracket progression
     * stays consistent (winner of match 0 plays winner of match 1, etc.).
     */
    private List<TournamentPhaseDataTeam> orderByPreviousRoundMatchIndex(TournamentPhaseData phaseData, List<TournamentPhaseDataTeam> activeTeams) {
        int previousRound = phaseData.getCurrentRound() - 1;
        MatchesSearchParameters params = new MatchesSearchParameters();
        params.setType(MatchesSearchType.RESULTS);
        params.setPhase(context.getPhase());
        List<TournamentMatch> allMatches = context.getTournamentMatchRepository().getMatches(context.getTournament().getId(), params);

        Set<String> activeTeamIds = activeTeams.stream().map(TournamentPhaseDataTeam::getId).collect(Collectors.toSet());
        Map<String, TournamentPhaseDataTeam> teamById = activeTeams.stream()
                .collect(Collectors.toMap(TournamentPhaseDataTeam::getId, t -> t));

        // Get previous round matches (excluding third place), sorted by matchIndex
        List<TournamentMatch> previousRoundMatches = allMatches.stream()
                .filter(m -> Objects.equals(m.getRound(), previousRound)
                        && !Boolean.TRUE.equals(m.getThirdPlaceMatch()))
                .sorted(Comparator.comparingInt(m -> Optional.ofNullable(m.getMatchIndex()).orElse(Integer.MAX_VALUE)))
                .toList();

        // Build ordered list from winners in matchIndex order
        List<TournamentPhaseDataTeam> ordered = new ArrayList<>();
        for (TournamentMatch m : previousRoundMatches) {
            if (m.getWinner() != null && activeTeamIds.contains(m.getWinner())) {
                TournamentPhaseDataTeam team = teamById.remove(m.getWinner());
                if (team != null) ordered.add(team);
            }
        }

        // Append any remaining active teams (shouldn't happen, but safety)
        for (TournamentPhaseDataTeam remaining : activeTeams) {
            if (teamById.containsKey(remaining.getId())) {
                ordered.add(remaining);
            }
        }

        return ordered;
    }

    /**
     * Seeds teams in bracket order (1 vs N, 2 vs N-1, etc.)
     */
    private List<TournamentPhaseDataTeam> seedBracket(List<TournamentPhaseDataTeam> teams) {
        List<TournamentPhaseDataTeam> seeded = new ArrayList<>();
        int size = teams.size();
        for (int i = 0; i < size / 2; i++) {
            seeded.add(teams.get(i));
            seeded.add(teams.get(size - 1 - i));
        }
        if (size % 2 != 0) {
            seeded.add(teams.get(size / 2));
        }
        return seeded;
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
     * Creates match rounds with draft IDs and date/deadline auto-assignment.
     */
    private List<TournamentMatchRound> createDraftRounds(TournamentMatch match, int bo, Instant matchDate) {
        List<TournamentMatchRound> rounds = new ArrayList<>();
        TournamentPhase currentPhase = getCurrentPhase();
        boolean mustUseDifferentMaps = currentPhase.isEffectiveMustUseDifferentMapsPerRound();
        Set<Integer> usedMaps = new HashSet<>();

        // Calculate draft and deadline times
        Instant draftDate = null;
        Instant draftJoinDeadline = null;
        Instant matchStartDeadline = null;

        if (matchDate != null) {
            int draftBeforeMinutes = currentPhase.getEffectiveDraftAvailableBeforeMatchMinutes();
            int draftJoinAfterMinutes = currentPhase.getEffectiveDraftJoinDeadlineAfterOpenMinutes();
            int matchDeadlineAfterMinutes = currentPhase.getEffectiveMatchStartDeadlineAfterMatchMinutes();

            draftDate = matchDate.minus(draftBeforeMinutes, ChronoUnit.MINUTES);
            draftJoinDeadline = draftDate.plus(draftJoinAfterMinutes, ChronoUnit.MINUTES);
            matchStartDeadline = matchDate.plus(matchDeadlineAfterMinutes, ChronoUnit.MINUTES);
        }

        for (int round = 0; round < bo; round++) {
            TournamentMatchRound matchRound = new TournamentMatchRound();

            if (round == 0) {
                matchRound.setDraftFirstPicker(RANDOM.nextInt(2) == 0 ? match.getTeamA() : match.getTeamB());
            }

            int map = rollMap(mustUseDifferentMaps ? usedMaps : null);
            matchRound.setMap(map);
            usedMaps.add(map);
            matchRound.setRound(round);
            matchRound.setDraftId(match.getId() + "_" + round);

            // Set timing info on all rounds
            matchRound.setDraftDate(draftDate);
            matchRound.setDraftJoinDeadline(draftJoinDeadline);
            matchRound.setMatchStartDeadline(matchStartDeadline);

            rounds.add(matchRound);
        }
        return rounds;
    }

    private int getBoForRound(int currentRound) {
        TournamentPhase currentPhase = getCurrentPhase();
        TournamentRoundModel[] roundModels = currentPhase.getRoundModel();
        if (roundModels != null) {
            for (TournamentRoundModel model : roundModels) {
                if (model.getRound() == currentRound) {
                    return Math.max(1, model.getBo());
                }
            }
        }
        return 1; // default BO1
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

    /**
     * Tracks bracket-only losses by reading match results for the completed round within this bracket phase.
     * This avoids relying on global team stats (which include qualification losses), which would cause teams
     * who lost in qualification to be incorrectly eliminated in the bracket.
     */
    private void updateBracketLostCount(List<TournamentPhaseDataTeam> teamsToUpdate, int completedRound) {
        MatchesSearchParameters params = new MatchesSearchParameters();
        params.setType(MatchesSearchType.RESULTS);
        params.setPhase(context.getPhase());
        List<TournamentMatch> bracketMatches = context.getTournamentMatchRepository().getMatches(context.getTournament().getId(), params);

        Set<String> losers = bracketMatches.stream()
                .filter(m -> Objects.equals(m.getRound(), completedRound)
                        && !Boolean.TRUE.equals(m.getThirdPlaceMatch())
                        && m.getWinner() != null
                        && m.getTeamB() != null) // exclude bye matches (teamB == null)
                .map(m -> m.getWinner().equals(m.getTeamA()) ? m.getTeamB() : m.getTeamA())
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        teamsToUpdate.forEach(team -> {
            if (losers.contains(team.getId())) {
                team.setLost(team.getLost() + 1);
            }
        });
    }

    /**
     * Updates lost count from global team stats (played - victories).
     * Only used during bracket initialization to read qualification results from the previous phase.
     * Must NOT be used during bracket round progression — use {@link #updateBracketLostCount} instead.
     */
    private void updateLostCount(List<TournamentPhaseDataTeam> teamsToUpdate) {
        List<Team> teams = context.getTournamentTeamRepository().getTeamsWithIds(teamsToUpdate.stream().map(TournamentPhaseDataTeam::getId).toList());

        Map<String, Integer> lostCount = new HashMap<>();
        for (Team team : teams) {
            lostCount.put(team.getId(), Optional.ofNullable(team.getStats()).map(s -> s.getPlayed() - s.getVictories()).orElse(0));
        }
        teamsToUpdate.forEach(team -> team.setLost(lostCount.getOrDefault(team.getId(), 0)));
    }
}

