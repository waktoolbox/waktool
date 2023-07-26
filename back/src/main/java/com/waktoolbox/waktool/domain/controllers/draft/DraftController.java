package com.waktoolbox.waktool.domain.controllers.draft;

import com.waktoolbox.waktool.domain.models.drafts.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.Accessors;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@RequiredArgsConstructor
@Accessors(prefix = "_")
public class DraftController {
    private static final int MAX_TEAM_SIZE = 6;

    @Getter
    private final Draft _draft;
    private final DraftNotifier _notifier;
    private final Instant _startDate = Instant.now();

    private final Set<Byte> _lockedForTeamA = new HashSet<>();
    private final Set<Byte> _lockedForTeamB = new HashSet<>();
    private final List<Byte> _pickedByTeamA = new ArrayList<>();
    private final List<Byte> _pickedByTeamB = new ArrayList<>();

    /**
     * Call only once to initialize the draft after loading from database
     */
    public void restore() {
        _draft.getUsers().forEach(user -> user.setPresent(false));
        _draft.getTeamA().forEach(user -> user.setPresent(false));
        _draft.getTeamB().forEach(user -> user.setPresent(false));
        _draft.setTeamAReady(false);
        _draft.setTeamBReady(false);
        _draft.getHistory().forEach(this::computeAction);
    }

    /**
     * Add the user to draft users & notify it, then check if it must be auto assigned to a team
     *
     * @param user to process
     */
    public void onUserJoin(DraftUser user) {
        if (!_draft.getUsers().contains(user)) _draft.getUsers().add(user);
        else
            _draft.getUsers().stream().filter(u -> Objects.equals(u.getId(), user.getId())).findFirst().ifPresent(u -> u.setPresent(true));

        if (_draft.getTeamA().contains(user))
            _draft.getTeamA().stream().filter(u -> Objects.equals(u.getId(), user.getId())).findFirst().ifPresent(u -> u.setPresent(true));
        if (_draft.getTeamB().contains(user))
            _draft.getTeamB().stream().filter(u -> Objects.equals(u.getId(), user.getId())).findFirst().ifPresent(u -> u.setPresent(true));

        _notifier.onUserJoin(user);

        DraftTeam userTeam = getUserTeam(user.getId());
        if (userTeam != DraftTeam.NONE) onUserAssigned(user, userTeam);
    }

    public void onUserDisconnected(DraftUser user) {
        if (!_draft.isTeamAReady() || !_draft.isTeamBReady()
                || _draft.getTeamA().stream().anyMatch(u -> Objects.equals(u.getId(), user.getId()))
                || _draft.getTeamB().stream().anyMatch(u -> Objects.equals(u.getId(), user.getId()))
        ) {
            _notifier.onUserLeave(user);
        }
    }

    /**
     * Manual assignation to a team for non-server provided draft, will add user only if draft has not started, is not already present in another team and if team is not full
     *
     * @param user to process
     * @param team to assign to
     */
    public void assignUser(String user, DraftTeam team) {
        if (_draft.getCurrentAction() > 0) return;
        if (_draft.getConfiguration().isProvidedByServer()) return;
        if (getUserTeam(user) != DraftTeam.NONE) return;
        final List<DraftUser> associatedTeam = team == DraftTeam.TEAM_A ? _draft.getTeamA() : _draft.getTeamB();
        if (associatedTeam.size() >= MAX_TEAM_SIZE) return;

        _draft.getUsers().stream()
                .filter(u -> u.getId().equals(user))
                .findFirst()
                .ifPresent(u -> onUserAssigned(u, team));
    }

    /**
     * Validate, process and notify the action
     *
     * @param action to process
     * @param user   doing it
     * @return true if action was valid and processed
     */
    public boolean onAction(DraftAction action, String user) {
        if (!validate(action, user)) return false;

        int currentAction = _draft.getCurrentAction();

        doProcessAction(action);
        _notifier.onAction(action, currentAction);
        return true;
    }

    /**
     * Toggle ready state for a team and notify it
     *
     * @param team  to toggle
     * @param ready state
     */
    public void onTeamReady(DraftTeam team, boolean ready) {
        if (team == DraftTeam.TEAM_A) _draft.setTeamAReady(ready);
        if (team == DraftTeam.TEAM_B) _draft.setTeamBReady(ready);

        _notifier.onTeamReady(team, ready);
    }

    /**
     * Compute a draft result for a single team
     *
     * @param team to compute
     * @return the picked and banned classes
     */
    public DraftTeamResult computeDraftResult(DraftTeam team) {
        final Byte[] picked = _draft.getHistory().stream()
                .filter(a -> a.getTeam() == team && a.getType() == DraftActionType.PICK)
                .map(DraftAction::getBreed)
                .toArray(Byte[]::new);

        final Byte[] banned = _draft.getHistory().stream()
                .filter(a -> a.getTeam() == team && a.getType() == DraftActionType.BAN)
                .map(DraftAction::getBreed)
                .toArray(Byte[]::new);

        return new DraftTeamResult(picked, banned);
    }

    public DraftTeam getUserTeam(String user) {
        if (_draft.getTeamA().stream().anyMatch(u -> u.getId().equals(user))) return DraftTeam.TEAM_A;
        if (_draft.getTeamB().stream().anyMatch(u -> u.getId().equals(user))) return DraftTeam.TEAM_B;
        return DraftTeam.NONE;
    }

    public boolean isExpired() {
        return Instant.now().isAfter(_startDate.plus(1, ChronoUnit.HOURS));
    }

    public boolean isEnded() {
        return _draft.getCurrentAction() >= _draft.getConfiguration().getActions().length;
    }

    // *****************************************************************************************************************
    // ***************************************** INTERNAL MECHANIC ONLY METHODS ****************************************
    // *****************************************************************************************************************

    private void onUserAssigned(DraftUser user, DraftTeam team) {
        if (team == DraftTeam.NONE) throw new IllegalStateException("Unexpected team: " + team);
        final List<DraftUser> associatedTeam = team == DraftTeam.TEAM_A ? _draft.getTeamA() : _draft.getTeamB();

        if (!_draft.getConfiguration().isProvidedByServer()) {
            final List<DraftUser> otherTeam = team == DraftTeam.TEAM_A ? _draft.getTeamB() : _draft.getTeamA();
            if (otherTeam.contains(user)) return; // do not allow to be in both teams

            if (!associatedTeam.contains(user)) associatedTeam.add(user);
            _notifier.onUserAssigned(user, team);
            return;
        }

        associatedTeam.stream()
                .filter(u -> Objects.equals(u.getId(), user.getId()))
                .findFirst()
                .ifPresent(u -> {
                    u.setDisplayName(user.getDisplayName());
                    u.setPresent(true);
                    _notifier.onUserAssigned(u, team);
                });
    }

    private void doProcessAction(DraftAction action) {
        computeAction(action);
        _draft.getHistory().add(action);
        _draft.setCurrentAction(_draft.getCurrentAction() + 1);
    }

    private void computeAction(DraftAction action) {
        switch (action.getType()) {
            case PICK -> {
                lockForAppropriateTeam(action);
                switch (action.getTeam()) {
                    case TEAM_A -> _pickedByTeamA.add(action.getBreed());
                    case TEAM_B -> _pickedByTeamB.add(action.getBreed());
                    default -> throw new IllegalStateException("Unexpected team action: " + action.getTeam());
                }
            }
            case BAN -> lockForAppropriateTeam(action);
            default -> throw new IllegalStateException("Unexpected action type: " + action.getType());
        }
    }

    private void lockForAppropriateTeam(DraftAction action) {
        if (action.isLockForOpponentTeam()) {
            if (action.getTeam() == DraftTeam.TEAM_A) _lockedForTeamB.add(action.getBreed());
            else if (action.getTeam() == DraftTeam.TEAM_B) _lockedForTeamA.add(action.getBreed());
        }
        if (action.isLockForPickingTeam()) {
            if (action.getTeam() == DraftTeam.TEAM_A) _lockedForTeamA.add(action.getBreed());
            else if (action.getTeam() == DraftTeam.TEAM_B) _lockedForTeamB.add(action.getBreed());
        }
    }

    private boolean validate(DraftAction action, String user) {
        if (!areTeamReady()) return false;
        if (!isCurrentActionTheSameThanProvidedAction(action, getCurrentAction())) return false;
        if (action.getBreed() == null) return false;

        DraftTeam userTeam = getUserTeam(user);
        if (userTeam == DraftTeam.NONE || action.getTeam() != userTeam) return false;

        if (action.getType() == DraftActionType.PICK) {
            if (action.getTeam() == DraftTeam.TEAM_A && _lockedForTeamA.contains(action.getBreed())) return false;
            if (action.getTeam() == DraftTeam.TEAM_B && _lockedForTeamB.contains(action.getBreed())) return false;
        }

        return true;
    }

    private static boolean isCurrentActionTheSameThanProvidedAction(DraftAction action, DraftAction currentAction) {
        if (currentAction == null) return false;
        if (action == null) return false;
        if (currentAction.getType() != action.getType()) return false;
        if (currentAction.isLockForOpponentTeam() != action.isLockForOpponentTeam()) return false;
        if (currentAction.isLockForPickingTeam() != action.isLockForPickingTeam()) return false;
        return currentAction.getTeam() == action.getTeam();
    }

    private boolean areTeamReady() {
        return _draft.isTeamAReady() && _draft.isTeamBReady();
    }

    private DraftAction getCurrentAction() {
        return _draft.getConfiguration().getActions()[_draft.getCurrentAction()];
    }
}
