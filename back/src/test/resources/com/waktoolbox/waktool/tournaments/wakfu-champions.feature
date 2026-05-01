Feature: Wakfu Champions workflow

  Scenario: P1 qualification with 64 teams - double elimination with fixed compositions
    Given the tournaments table will contain:
  """yml
  id: wc
  content:
    id: wc
    name: Wakfu Champions
    phases:
    - phase: 1
      phaseType: 4
      roundModel:
      - round: 1
        bo: 1
        date: 2026-05-30T16:00:00Z
      - round: 2
        bo: 1
        date: 2026-05-30T19:00:00Z
      - round: 3
        bo: 1
        date: 2026-05-31T16:00:00Z
      matchStartDeadlineAfterMatchMinutes: 15
    - phase: 2
      phaseType: 5
      poolSize: 32
      draftAvailableBeforeMatchMinutes: 60
      draftJoinDeadlineAfterOpenMinutes: 15
      matchStartDeadlineAfterMatchMinutes: 15
      mustUseDifferentMapsPerRound: true
      roundModel:
      - round: 1
        bo: 1
        date: 2026-06-06T16:00:00Z
      - round: 2
        bo: 1
        date: 2026-06-07T16:00:00Z
      - round: 3
        bo: 3
        date: 2026-06-13T16:00:00Z
      - round: 4
        bo: 3
        date: 2026-06-14T16:00:00Z
      - round: 5
        bo: 5
        date: 2026-06-21T14:00:00Z
      - round: 6
        bo: 3
        date: 2026-06-20T16:00:00Z
    maps: [968, 969, 970, 971, 972, 973, 975, 976]
  """
    Given we have 64 teams in tournament wc

    # Phase 1 round 1 - All 64 teams (32 matches, random pairs, BO1)
    When we start next round or phase of tournament wc

    Then the tournaments_data table contains:
    """yml
    id:
      tournamentId: wc
      phase: 1
    content:
      currentRound: 1
    """

    And there is 32 pending matches in tournament wc
    And the matches drafts are using predefined team breeds in tournament wc phase 1
    And all matches of tournament wc phase 1 have date "2026-05-30T16:00:00Z"
    Given all teams A of tournament wc win their match

    # Phase 1 round 2 - winners vs winners (32 teams, 16 matches) + losers vs losers (32 teams, 16 matches)
    When we start next round or phase of tournament wc

    Then there is 32 pending matches in tournament wc
    And the matches drafts are using predefined team breeds in tournament wc phase 1
    And all matches of tournament wc phase 1 have date "2026-05-30T19:00:00Z"
    Given all teams A of tournament wc win their match

    # Phase 1 round 3 - only 1V-1D teams play (16 matches)
    # Teams with 2V are qualified, teams with 2D are eliminated
    When we start next round or phase of tournament wc

    Then there is 16 pending matches in tournament wc
    And the matches drafts are using predefined team breeds in tournament wc phase 1
    And all matches of tournament wc phase 1 have date "2026-05-31T16:00:00Z"
    Given all teams A of tournament wc win their match

    # Phase 2 init - bracket with 32 qualified teams (seeded: 0-defeat first, then 1-defeat)
    # Round 1: 16th de finale - 16 matches BO1
    When we start next round or phase of tournament wc

    Then there is 16 pending matches in tournament wc
    And the matches drafts are manual in tournament wc phase 2
    And all matches of tournament wc phase 2 have date "2026-06-06T16:00:00Z"
    And all matches of tournament wc phase 2 have draft dates
    Given all teams A of tournament wc win their match

    # Phase 2 round 2: 8th de finale - 8 matches BO1
    When we start next round or phase of tournament wc

    Then there is 8 pending matches in tournament wc
    And the matches drafts are manual in tournament wc phase 2
    Given all teams A of tournament wc win their match

    # Phase 2 round 3: Quarters - 4 matches BO3
    When we start next round or phase of tournament wc

    Then there is 4 pending matches in tournament wc
    And the matches have 3 rounds in tournament wc phase 2
    Given all teams A of tournament wc win their match

    # Phase 2 round 4: Semis - 2 matches BO3
    When we start next round or phase of tournament wc

    Then there is 2 pending matches in tournament wc
    And the matches have 3 rounds in tournament wc phase 2
    Given all teams A of tournament wc win their match

    # Phase 2 round 5: Finale (BO5) + Petite finale (BO3)
    When we start next round or phase of tournament wc

    Then there is 2 pending matches in tournament wc
    And there is a third place match in tournament wc phase 2
    Given all teams A of tournament wc win their match

    # Tournament is over
    When we start next round or phase of tournament wc

    Then there is 0 pending matches in tournament wc


  Scenario: P1 qualification with odd number of teams (63) handles byes correctly
    Given the tournaments table will contain:
  """yml
  id: wc2
  content:
    id: wc2
    name: Wakfu Champions 2
    phases:
    - phase: 1
      phaseType: 4
      roundModel:
      - round: 1
        bo: 1
        date: 2026-05-30T16:00:00Z
      - round: 2
        bo: 1
        date: 2026-05-30T19:00:00Z
      - round: 3
        bo: 1
        date: 2026-05-31T16:00:00Z
      matchStartDeadlineAfterMatchMinutes: 15
    - phase: 2
      phaseType: 5
      poolSize: 32
      draftAvailableBeforeMatchMinutes: 60
      draftJoinDeadlineAfterOpenMinutes: 15
      matchStartDeadlineAfterMatchMinutes: 15
      roundModel:
      - round: 1
        bo: 1
        date: 2026-06-06T16:00:00Z
    maps: [975]
  """
    Given we have 63 teams in tournament wc2

    # Phase 1 round 1 - 63 teams = 31 matches + 1 bye
    When we start next round or phase of tournament wc2

    Then there is 31 pending matches in tournament wc2
    And the matches drafts are using predefined team breeds in tournament wc2 phase 1
    Given all teams A of tournament wc2 win their match

    # Phase 1 round 2 - winners (32) vs winners + losers (31) vs losers
    When we start next round or phase of tournament wc2

    And the matches drafts are using predefined team breeds in tournament wc2 phase 1
    Given all teams A of tournament wc2 win their match

    # Phase 1 round 3 - only 1V-1D teams play
    When we start next round or phase of tournament wc2

    And the matches drafts are using predefined team breeds in tournament wc2 phase 1
    Given all teams A of tournament wc2 win their match


  Scenario: Bracket correctly tracks losses from bracket matches only (regression: skip from seizièmes to quarts)
    # Verifies that teams with 1 loss in qualification are NOT incorrectly eliminated in the bracket
    # when they WIN their bracket match. Previously, updateLostCount used global stats which caused
    # 1-defeat qualified teams to appear eliminated even after winning in the bracket.
    Given the tournaments table will contain:
  """yml
  id: wc-regression
  content:
    id: wc-regression
    name: Wakfu Champions Regression
    phases:
    - phase: 1
      phaseType: 4
      roundModel:
      - round: 1
        bo: 1
      - round: 2
        bo: 1
      - round: 3
        bo: 1
    - phase: 2
      phaseType: 5
      poolSize: 32
      roundModel:
      - round: 1
        bo: 1
      - round: 2
        bo: 1
      - round: 3
        bo: 3
      - round: 4
        bo: 3
      - round: 5
        bo: 5
      - round: 6
        bo: 3
    maps: [975]
  """
    Given we have 64 teams in tournament wc-regression

    # Run full qualification phase
    When we start next round or phase of tournament wc-regression
    Given all teams A of tournament wc-regression win their match
    When we start next round or phase of tournament wc-regression
    Given all teams A of tournament wc-regression win their match
    When we start next round or phase of tournament wc-regression
    Given all teams A of tournament wc-regression win their match

    # Phase 2 round 1 (seizièmes): 16 matches - all teams B (1-defeat qualified) win (upset!)
    When we start next round or phase of tournament wc-regression

    Then there is 16 pending matches in tournament wc-regression
    Given all teams B of tournament wc-regression win their match

    # Phase 2 round 2: must be huitièmes (8 matches), NOT quarts (4 matches)
    # Bug: old code using global stats would skip directly to quarts or produce 0 active teams
    When we start next round or phase of tournament wc-regression

    Then there is 8 pending matches in tournament wc-regression
    Given all teams A of tournament wc-regression win their match

    # Phase 2 round 3: quarts - 4 matches
    When we start next round or phase of tournament wc-regression

    Then there is 4 pending matches in tournament wc-regression


  Scenario: Admin recompute stats returns success
    Given the accounts table will contain:
      | id     | username | discriminator | email          | ankamaName | ankamaDiscriminator |
      | admin1 | Admin    | 0001          | admin@test.com | Admin      | 0001                |

    Given the tournaments table will contain:
    """yml
    id: wc-admin
    content:
      id: wc-admin
      name: Wakfu Champions Admin Test
      admins:
        - admin1
      referees: []
      streamers: []
      phases:
      - phase: 1
        phaseType: 4
        roundModel:
        - round: 1
          bo: 1
          date: 2026-05-30T16:00:00Z
        matchStartDeadlineAfterMatchMinutes: 15
      maps: [975]
    """
    Given we have 4 teams in tournament wc-admin
    When we start next round or phase of tournament wc-admin
    Given all teams A of tournament wc-admin win their match

    Given token is a valid token for admin1
    When we post on "/api/tournaments/wc-admin/admin-recompute-stats" a Request:
    """yaml
    headers:
      Cookie: token={{token}}
    body:
      payload: {}
    """
    Then we receive a status OK_200 and:
    """yaml
    success: true
    """

    # Non-admin cannot recompute stats
    Given tokenNonAdmin is a valid token for 0
    When we post on "/api/tournaments/wc-admin/admin-recompute-stats" a Request:
    """yaml
    headers:
      Cookie: token={{tokenNonAdmin}}
    body:
      payload: {}
    """
    Then we receive a status OK_200 and:
    """yaml
    success: false
    """
