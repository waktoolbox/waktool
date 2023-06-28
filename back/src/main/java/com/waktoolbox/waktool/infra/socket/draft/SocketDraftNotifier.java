package com.waktoolbox.waktool.infra.socket.draft;

import com.waktoolbox.waktool.domain.controllers.draft.DraftNotifier;
import com.waktoolbox.waktool.domain.models.drafts.DraftAction;
import com.waktoolbox.waktool.domain.models.drafts.DraftTeam;
import com.waktoolbox.waktool.domain.models.drafts.DraftUser;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@RequiredArgsConstructor
public class SocketDraftNotifier implements DraftNotifier {
    private final String draftId;
    private final SimpMessagingTemplate simpMessagingTemplate;

    private static final String TOPIC_PREFIX = "/topic/draft-";

    private record DraftNotificationWrapper(String type, Object payload) {
    }

    private record DraftUserAssigned(DraftUser user, DraftTeam team) {
    }

    private record DraftActionWithIndex(DraftAction draftAction, int index) {
    }

    private record DraftTeamReady(DraftTeam team, boolean ready) {
    }

    private void send(DraftNotificationWrapper wrapper) {
        simpMessagingTemplate.convertAndSend(TOPIC_PREFIX + draftId, wrapper);
    }

    @Override
    public void onUserJoin(DraftUser user) {
        send(new DraftNotificationWrapper("draft::userJoined", user));
    }

    @Override
    public void onUserAssigned(DraftUser user, DraftTeam team) {
        send(new DraftNotificationWrapper("draft::userAssigned", new DraftUserAssigned(user, team)));
    }

    @Override
    public void onAction(DraftAction action, int index) {
        send(new DraftNotificationWrapper("draft::action", new DraftActionWithIndex(action, index)));
    }


    @Override
    public void onTeamReady(DraftTeam team, boolean ready) {
        send(new DraftNotificationWrapper("draft::teamReady", new DraftTeamReady(team, ready)));

    }
}
