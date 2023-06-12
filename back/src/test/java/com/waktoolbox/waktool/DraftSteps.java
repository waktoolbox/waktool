package com.waktoolbox.waktool;

import com.waktoolbox.waktool.domain.DraftController;
import com.waktoolbox.waktool.domain.DraftNotifier;
import com.waktoolbox.waktool.domain.models.draft.*;
import io.cucumber.java.ParameterType;
import io.cucumber.java.Transpose;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;

import java.util.Arrays;
import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

public class DraftSteps implements DraftNotifier {
    private Draft _draft;
    private DraftController _controller;
    private boolean _lastActionSuccess;

    @ParameterType("A|B")
    public DraftTeam team(String team) {
        return DraftTeam.valueOf("TEAM_" + team);
    }

    @ParameterType("bans|picks")
    public DraftActionType action(String action) {
        return DraftActionType.valueOf(action.substring(0, action.length() - 1).toUpperCase());
    }

    @Given("a Wakfu Warrior draft")
    public void aWakfuWarriorDraft() {
        DraftConfiguration configuration = new DraftConfiguration();
        configuration.setActions(DraftDefaultModels.WAKFU_WARRIORS.getActions());

        _draft = new Draft();
        _draft.setConfiguration(configuration);

        _controller = new DraftController(_draft, this);
    }

    @Given("draft is now server provided {word}")
    public void whenServerProvided(String isServer) {
        _draft.getConfiguration().setProvidedByServer(Boolean.parseBoolean(isServer));
    }

    @Given("{word} joins draft")
    public void whenJoin(String id) {
        DraftUser user = new DraftUser();
        user.setId(id);
        _controller.onUserJoin(user);
    }

    @Given("{word} joins team {team}")
    public void whenJoin(String id, DraftTeam team) {
        DraftUser user = new DraftUser();
        user.setId(id);
        _controller.assignUser(id, team);
    }

    @Given("team {team} set ready to {word}")
    public void whenReady(DraftTeam team, String ready) {
        _controller.onTeamReady(team, Boolean.parseBoolean(ready));
        _lastActionSuccess = true;
    }

    @Given("{word} {action} {int} for team {team} {word} {word}")
    public void whenAction(String user, DraftActionType action, int breed, DraftTeam team, String lockForPicking, String lockForOpponent) {
        DraftAction draftAction = new DraftAction(team, action, (byte) breed, Boolean.parseBoolean(lockForPicking), Boolean.parseBoolean(lockForOpponent));
        _lastActionSuccess = _controller.onAction(draftAction, user);
    }

    @Given("a draft null action from {word}")
    public void whenDraftNullAction(String user) {
        _lastActionSuccess = _controller.onAction(null, user);
    }

    @Then("the last action should be {word}")
    public void thenLastActionShouldBeSuccessful(String success) {
        assertThat(_lastActionSuccess, is(Boolean.parseBoolean(success)));
    }

    @Then("team {team} is ready")
    public void thenTeamIsReady(DraftTeam team) {
        boolean ready = team == DraftTeam.TEAM_A ? _draft.isTeamAReady() : _draft.isTeamBReady();
        assertThat(ready, is(true));
    }

    @Then("team {team} is not ready")
    public void thenTeamIsNotReady(DraftTeam team) {
        boolean ready = team == DraftTeam.TEAM_A ? _draft.isTeamAReady() : _draft.isTeamBReady();
        assertThat(ready, is(false));
    }

    @Then("team {team} contains user {word}")
    public void thenTeamContainsUser(DraftTeam target, String id) {
        List<DraftUser> team = target == DraftTeam.TEAM_A ? _draft.getTeamA() : _draft.getTeamB();

        assertThat(team.stream().filter(u -> u.getId().equals(id)).count(), is(1L));
    }

    @Then("team {team} does not contains user {word}")
    public void thenTeamDoesNotContainsUser(DraftTeam target, String id) {
        List<DraftUser> team = target == DraftTeam.TEAM_A ? _draft.getTeamA() : _draft.getTeamB();

        assertThat(team.stream().filter(u -> u.getId().equals(id)).count(), is(0L));
    }

    @Then("draft is over")
    public void thenDraftIsOver() {
        assertThat(_draft.getHistory().size(), is(_draft.getCurrentAction()));
        assertThat(_draft.getHistory().size(), is(_draft.getConfiguration().getActions().length));
    }

    @Then("pick result for team {team} is")
    public void thenPickResultIs(DraftTeam team, @Transpose List<Byte> result) {
        DraftTeamResult draftTeamResult = _controller.computeDraftResult(team);

        List<Byte> pickedClasses = Arrays.stream(draftTeamResult.getPickedClasses()).toList();
        assertThat(result.size(), is(pickedClasses.size()));
        for (Byte breed : result) {
            assertThat(pickedClasses.contains(breed), is(true));
        }
    }

    @Then("ban result for team {team} is")
    public void thenBanResultIs(DraftTeam team, @Transpose List<Byte> result) {
        DraftTeamResult draftTeamResult = _controller.computeDraftResult(team);

        List<Byte> bannedClasses = Arrays.stream(draftTeamResult.getBannedClasses()).toList();
        assertThat(result.size(), is(bannedClasses.size()));
        for (Byte breed : result) {
            assertThat(bannedClasses.contains(breed), is(true));
        }
    }

    @Override
    public void onUserJoin(DraftUser user) {

    }

    @Override
    public void onUserAssigned(DraftUser user, DraftTeam team) {

    }

    @Override
    public void onAction(DraftAction action) {

    }

    @Override
    public void onTeamReady(DraftTeam team, boolean ready) {

    }
}
