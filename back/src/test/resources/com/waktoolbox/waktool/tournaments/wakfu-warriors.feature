Feature: Wakfu Warriors workflow

  Background:
    Given the tournaments table will contain:
  """yml
  id: ww
  content:
    id: ww
    name: Wakfu Warriors
    phases:
    - phase: 1
      phaseType: 3
      roundModel:
      - round: 1
      - round: 2
      - round: 3
    - phase: 2
      phaseType: 3
      roundModel:
      - round: 1
      - round: 2
    - phase: 3
      phaseType: 3
      roundModel:
      - round: 1
      - round: 2
    - phase: 4
      phaseType: 3
      roundModel:
      - round: 1
      - round: 2
    - phase: 5
      phaseType: 3
      roundModel:
      - round: 1
      - round: 2
      - round: 3
    maps: [975]
  """

  Scenario Outline: We can proceed with 63/64 teams
    Given we have <numberOfTeams> teams in tournament ww

    # Phased 1 round 1 - First roll - 63/64 teams
    When we start next round or phase of tournament ww

    Then the tournaments_data table contains:
    """yml
    id:
      tournamentId: ww
      phase: 1
    content:
      teams:
      - id: 1
        breeds: [1, 3, 5, 7, 9, 11]
      currentRound: 1
    """

    And the matches table contains:
    """yml
    tournamentId: ww
    phase: 1
    content:
      phase: 1
      round: 1
      rounds:
      - map: 975
        round: 0
        winner: ?isNull
    """

    # First match for all teams, all random
    And if <numberOfTeams> == 63 => there is 31 pending matches in tournament ww
    And if <numberOfTeams> == 64 => there is 32 pending matches in tournament ww
    Given all teams A of tournament ww win their match

    # Phase 1 round 2
    When we start next round or phase of tournament ww

    # Second match for all teams, 1 loss teams vs 1 loss teams, no loss vs no loss
    Then if <numberOfTeams> == 63 => there is 31 pending matches in tournament ww
    Then if <numberOfTeams> == 64 => there is 32 pending matches in tournament ww
    And the matches drafts are using predefined team breeds in tournament ww phase 1
    Given all teams A of tournament ww win their match

    # Phase 1 round 3
    When we start next round or phase of tournament ww

    # 2 loss are eliminated, 2 wins are qualified, let's fight between 1 loss again
    Then there is 16 pending matches in tournament ww
    And the matches drafts are using predefined team breeds in tournament ww phase 1
    Given all teams A of tournament ww win their match

    # Phase 2 round 1 - 32 teams
    When we start next round or phase of tournament ww

    # 1 loss teams encounter each other, no loss teams encounter each others
    Then there is 16 pending matches in tournament ww
    And the matches drafts are using predefined team breeds in tournament ww phase 2
    Given all teams A of tournament ww win their match

    # Phase 2 round 2
    When we start next round or phase of tournament ww

    # 1 loss from winner bracket encounters 1 loss from looser bracket
    Then there is 8 pending matches in tournament ww
    And the matches drafts are using predefined team breeds in tournament ww phase 2
    Given all teams A of tournament ww win their match

    # Phase 3 round 1 - 16 teams
    When we start next round or phase of tournament ww

    Then there is 8 pending matches in tournament ww
    And the matches drafts are manual in tournament ww phase 3
    Given all teams A of tournament ww win their match

    # Phase 3 round 2
    When we start next round or phase of tournament ww

    Then there is 4 pending matches in tournament ww
    And the matches drafts are manual in tournament ww phase 3
    Given all teams A of tournament ww win their match

    # Phase 4 round 1 - 8 teams
    When we start next round or phase of tournament ww

    Then there is 4 pending matches in tournament ww
    And the matches drafts are manual in tournament ww phase 4
    Given all teams A of tournament ww win their match

    # Phase 4 round 2
    When we start next round or phase of tournament ww

    Then there is 2 pending matches in tournament ww
    And the matches drafts are manual in tournament ww phase 4
    Given all teams A of tournament ww win their match

    # Phase 5 round 1 - Semi
    When we start next round or phase of tournament ww

    Then there is 2 pending matches in tournament ww
    And the matches drafts are manual in tournament ww phase 5
    Given all teams A of tournament ww win their match

    # 3rd place
    When we start next round or phase of tournament ww

    Then there is 1 pending matches in tournament ww
    And the matches drafts are manual in tournament ww phase 5
    Given all teams A of tournament ww win their match

    # Final
    When we start next round or phase of tournament ww

    Then there is 1 pending matches in tournament ww
    And the matches drafts are manual in tournament ww phase 5 round 3 match round 1
    Given all teams A of tournament ww win their match

    # Tournament is ended, it shouldn't generate anything
    When we start next round or phase of tournament ww

    Then there is 0 pending matches in tournament ww

    Examples:
      | numberOfTeams |
      | 63            |
      | 64            |
