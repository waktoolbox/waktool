package com.waktoolbox.waktool.domain.controllers.draft;

import com.waktoolbox.waktool.domain.models.draft.*;
import com.waktoolbox.waktool.domain.repositories.DraftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DraftManager {
    private final Map<String, DraftController> _currentDrafts = new HashMap<>();
    private final Map<String, DraftUser> _users = new HashMap<>();
    private final DraftRepository _draftRepository;
    private final DraftNotifierFactory _draftNotifierFactory;

    @Scheduled(fixedDelay = 60 * 1000)
    private void cleanup() {
        _currentDrafts.entrySet().removeIf(entry -> entry.getValue().isExpired());
    }

    public Optional<DraftUser> getUser(String id) {
        if (!_users.containsKey(id)) return Optional.empty();
        return Optional.ofNullable(_users.get(id));
    }

    public Draft userRequestDraft(DraftUser user, String draftId) {
        if (this._currentDrafts.containsKey(draftId)) {
            return joinDraft(user, draftId);
        }

        // Else, try to load draft from database
        Draft draft = _draftRepository.load(draftId);
        if (draft == null) return null;

        DraftController controller = new DraftController(draft, _draftNotifierFactory.create(draft.getId()));
        controller.restore();
        _currentDrafts.put(draft.getId(), controller);
        return joinDraft(user, draft.getId());
    }

    public Draft createDraftByUser(DraftUser user, DraftAction[] actions) {
        DraftConfiguration configuration = new DraftConfiguration();
        configuration.setProvidedByServer(false);
        configuration.setLeader(user.getId());
        configuration.setActions(actions);

        Draft draft = new Draft();
        draft.setId(String.valueOf(UUID.randomUUID()));
        draft.setConfiguration(configuration);
        draft.setTeamAInfo(new DraftTeamInfo("1", "Team A"));
        draft.setTeamBInfo(new DraftTeamInfo("2", "Team B"));

        DraftController controller = new DraftController(draft, _draftNotifierFactory.create(draft.getId()));
        _currentDrafts.put(draft.getId(), controller);
        return joinDraft(user, draft.getId());
    }

    private Draft joinDraft(DraftUser user, String draftId) {
        DraftController draft = _currentDrafts.get(draftId);
        if (draft == null) return null;

        DraftUser updatableUser = Optional.ofNullable(_users.putIfAbsent(user.getId(), user)).orElse(user);
        updatableUser.setPresent(true);
        updatableUser.addDraft(draftId);

        draft.onUserJoin(updatableUser);
        return draft.getDraft();
    }

    public void onAction(String draftId, String user, DraftAction action) {
        DraftController draft = _currentDrafts.get(draftId);
        if (draft == null) return;

        boolean executed = draft.onAction(action, user);

        if (executed && draft.getDraft().getConfiguration().isProvidedByServer()) {
            saveDraft(draft);
        }

        if (draft.isEnded()) {
            // TODO implement me
            // saveDraftEnd(draft)
            _currentDrafts.remove(draftId);
            draft.getDraft().getUsers().forEach(u -> removeDraftFromUser(u, draftId));
        }
    }

    public void assignUser(String draftId, String user, String target, DraftTeam team) {
        DraftController draft = _currentDrafts.get(draftId);
        if (draft == null) return;
        if (!draft.getDraft().getConfiguration().getLeader().equals(user)) return;

        draft.assignUser(target, team);
    }

    public void onTeamReady(String draftId, String user, boolean ready) {
        DraftController draft = _currentDrafts.get(draftId);
        if (draft == null) return;

        DraftTeam team = draft.getUserTeam(user);
        if (team == null || team == DraftTeam.NONE) return;

        draft.onTeamReady(team, ready);
    }

    public void onUserDisconnected(String id) {
        if (!_users.containsKey(id)) return;
        DraftUser user = _users.remove(id);
        user.setPresent(false);
    }

    private void saveDraft(DraftController draft) {
        _draftRepository.save(draft.getDraft());
    }

    private void removeDraftFromUser(DraftUser user, String draftId) {
        user.removeDraft(draftId);
        if (!user.hasDrafts()) {
            _users.remove(user.getId());
        }
    }
}
