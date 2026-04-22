package com.waktoolbox.waktool.api;

import com.waktoolbox.waktool.domain.controllers.draft.DraftManager;
import com.waktoolbox.waktool.domain.models.drafts.Draft;
import com.waktoolbox.waktool.domain.models.drafts.DraftAction;
import com.waktoolbox.waktool.domain.models.drafts.DraftTeam;
import com.waktoolbox.waktool.domain.models.drafts.DraftUser;
import com.waktoolbox.waktool.domain.models.users.UserDisconnectedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import java.util.Map;
import java.util.Optional;

import static com.waktoolbox.waktool.utils.JwtHelper.DISCORD_ID;
import static com.waktoolbox.waktool.utils.JwtHelper.USERNAME;

@Controller
@RequiredArgsConstructor
public class DraftController {
    private final DraftManager _draftManager;

    private String extractUserId(Map<String, Optional<String>> attributes, String simpSessionId) {
        if (attributes.containsKey(DISCORD_ID) && attributes.get(DISCORD_ID).isPresent()) {
            return attributes.get(DISCORD_ID).get();
        }
        if (attributes.containsKey("guest-id") && attributes.get("guest-id").isPresent()) {
            return attributes.get("guest-id").get();
        }
        return simpSessionId;
    }

    private record DraftIdOnlyMessage(String id) {
    }

    @MessageMapping("/whoami")
    @SendToUser("/topic/whoami")
    public DraftIdOnlyMessage whoami(
            @Header("simpSessionAttributes") Map<String, Optional<String>> attributes,
            @Header String simpSessionId
    ) {
        return new DraftIdOnlyMessage(extractUserId(attributes, simpSessionId));
    }

    @MessageMapping("/draft::get")
    @SendToUser("/topic/draft::data")
    public Draft getDraft(
            @Header("simpSessionAttributes") Map<String, Optional<String>> attributes,
            @Header String simpSessionId,
            DraftIdOnlyMessage draft
    ) {
        DraftUser user = computeDraftUser(attributes, simpSessionId);
        return _draftManager.userRequestDraft(user, draft.id);
    }

    private record DraftCreateMessage(DraftAction[] actions, Integer turnDurationSeconds) {
    }

    @MessageMapping("/draft::create")
    @SendToUser("/topic/draft")
    public DraftIdOnlyMessage createDraft(
            @Header("simpSessionAttributes") Map<String, Optional<String>> attributes,
            @Header String simpSessionId,
            DraftCreateMessage message
    ) {
        DraftUser user = computeDraftUser(attributes, simpSessionId);
        return new DraftIdOnlyMessage(_draftManager.createDraftByUser(user, message.actions, message.turnDurationSeconds).getId());
    }

    private record DraftActionMessage(String draftId, DraftAction action) {
    }

    @MessageMapping("/draft::action")
    public void draftAction(
            @Header("simpSessionAttributes") Map<String, Optional<String>> attributes,
            @Header String simpSessionId,
            DraftActionMessage message
    ) {
        _draftManager.onAction(message.draftId, extractUserId(attributes, simpSessionId), message.action);
    }

    private record DraftAssignUserMessage(String draftId, String target, DraftTeam team) {
    }

    @MessageMapping("/draft::assignUser")
    public void draftAssignUser(
            @Header("simpSessionAttributes") Map<String, Optional<String>> attributes,
            @Header String simpSessionId,
            DraftAssignUserMessage message
    ) {
        _draftManager.assignUser(message.draftId, extractUserId(attributes, simpSessionId), message.target, message.team);
    }

    private record DraftTeamReadyMessage(String draftId, boolean ready) {
    }

    @MessageMapping("/draft::teamReady")
    public void draftTeamReady(
            @Header("simpSessionAttributes") Map<String, Optional<String>> attributes,
            @Header String simpSessionId,
            DraftTeamReadyMessage message
    ) {
        _draftManager.onTeamReady(message.draftId, extractUserId(attributes, simpSessionId), message.ready);
    }

    private DraftUser computeDraftUser(Map<String, Optional<String>> attributes, String simpSessionId) {
        String id = extractUserId(attributes, simpSessionId);
        return _draftManager.getUser(id).orElse(new DraftUser(id, attributes.getOrDefault(USERNAME, Optional.empty()).orElse(null)));
    }

    @EventListener
    public void onUserDisconnected(UserDisconnectedEvent event) {
        _draftManager.onUserDisconnected(event.getUser().id());
    }
}
