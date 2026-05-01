package com.waktoolbox.waktool.domain.controllers.tournaments;

import com.waktoolbox.waktool.domain.repositories.DemoActionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.function.Consumer;

@Service
@Slf4j
public class DemoActionService {
    private final Map<String, Consumer<String>> _actions;

    public DemoActionService(DemoActionRepository demoActionRepository) {
        _actions = Map.of(
                "TOURNAMENT_START", tournamentId ->
                        demoActionRepository.executeSqlFile("classpath:db/demo/" + tournamentId + "-start.sql"),
                "RESET", tournamentId ->
                        demoActionRepository.executeSqlFile("classpath:db/demo/" + tournamentId + "-reset.sql")
        );
    }

    public boolean execute(String actionKey, String tournamentId) {
        Consumer<String> action = _actions.get(actionKey);
        if (action == null) {
            log.warn("Unknown demo action: {} for tournament: {}", actionKey, tournamentId);
            return false;
        }

        log.info("Executing demo action: {} for tournament: {}", actionKey, tournamentId);
        action.accept(tournamentId);
        return true;
    }

    public boolean isValidAction(String actionKey) {
        return _actions.containsKey(actionKey);
    }
}

