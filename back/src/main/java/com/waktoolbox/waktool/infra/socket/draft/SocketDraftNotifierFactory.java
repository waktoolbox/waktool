package com.waktoolbox.waktool.infra.socket.draft;

import com.waktoolbox.waktool.domain.controllers.draft.DraftNotifier;
import com.waktoolbox.waktool.domain.controllers.draft.DraftNotifierFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SocketDraftNotifierFactory implements DraftNotifierFactory {
    private final SimpMessagingTemplate _simpMessagingTemplate;

    @Override
    public DraftNotifier create(String draftId) {
        return new SocketDraftNotifier(draftId, _simpMessagingTemplate);
    }
}
