Feature: Match reporting and auto-refereeing

  Background:
    Given that the accounts table will contain:
      | id       | username   | discriminator | email              | ankamaName | ankamaDiscriminator |
      | leader-a | LeaderA    | 0001          | leadera@test.com   | LeaderA    | 0001                |
      | player-a | PlayerA    | 0002          | playera@test.com   | PlayerA    | 0002                |
      | leader-b | LeaderB    | 0003          | leaderb@test.com   | LeaderB    | 0003                |
      | ref-1    | Referee1   | 0004          | ref1@test.com      | Referee1   | 0004                |
      | outsider | Outsider   | 0005          | outsider@test.com  | Outsider   | 0005                |

    Given that the tournaments table will contain:
    """yml
    id: t1
    content:
      id: t1
      name: Test Tournament
      admins:
        - ref-1
      referees:
        - ref-1
      streamers: []
      maps: [975]
      phases:
        - phase: 1
          phaseType: 3
          autoRefereeing: true
          roundModel:
            - round: 1
        - phase: 2
          phaseType: 3
          autoRefereeing: false
          roundModel:
            - round: 1
    """

    Given that the teams table will contain:
    """yml
    - id: team-a
      content:
        id: team-a
        name: Team Alpha
        tournament: t1
        leader: leader-a
        server: Pandora
        players:
          - leader-a
          - player-a
        validatedPlayers:
          - leader-a
          - player-a
        breeds: [1, 3, 5, 7, 9, 11]
        displayOnTeamList: true
      createdAt: 2026-01-01T00:00:00Z
    - id: team-b
      content:
        id: team-b
        name: Team Beta
        tournament: t1
        leader: leader-b
        server: Pandora
        players:
          - leader-b
        validatedPlayers:
          - leader-b
        breeds: [2, 4, 6, 8, 10, 12]
        displayOnTeamList: true
      createdAt: 2026-01-01T00:00:00Z
    """

    Given that the matches table will contain:
    """yml
    - id: match-1
      tournamentId: t1
      phase: 1
      content:
        id: match-1
        phase: 1
        round: 1
        done: false
        teamA: team-a
        teamB: team-b
        rounds:
          - round: 0
            map: 975
    - id: match-2
      tournamentId: t1
      phase: 2
      content:
        id: match-2
        phase: 2
        round: 1
        done: false
        teamA: team-a
        teamB: team-b
        rounds:
          - round: 0
            map: 975
    """


  Scenario: Both teams report the same winner — round resolved, match not done
    Given token is a valid token for leader-a
    When we post on "/api/tournaments/t1/matches/match-1/rounds/0/report" a Request:
    """yaml
    headers:
      Cookie: token={{token}}
    body:
      payload:
        winner: team-a
    """
    Then we receive a status OK_200 and:
    """yaml
    success: true
    """

    Given tokenB is a valid token for leader-b
    When we post on "/api/tournaments/t1/matches/match-1/rounds/0/report" a Request:
    """yaml
    headers:
      Cookie: token={{tokenB}}
    body:
      payload:
        winner: team-a
    """
    Then we receive a status OK_200 and:
    """yaml
    success: true
    """

    # Auto resolution as both teams agreed
    Then the match_reports table contains nothing

    # Match should be marked as done
    And the matches table contains:
    """yml
    id: match-1
    content:
      done: true
      winner: team-a
    """


  Scenario: Teams report different winners — auto-disputed
    Given token is a valid token for leader-a
    When we post on "/api/tournaments/t1/matches/match-1/rounds/0/report" a Request:
    """yaml
    headers:
      Cookie: token={{token}}
    body:
      payload:
        winner: team-a
    """
    Then we receive a status OK_200 and:
    """yaml
    success: true
    """

    Given tokenB is a valid token for leader-b
    When we post on "/api/tournaments/t1/matches/match-1/rounds/0/report" a Request:
    """yaml
    headers:
      Cookie: token={{tokenB}}
    body:
      payload:
        winner: team-b
    """
    Then we receive a status OK_200 and:
    """yaml
    success: true
    """

    Then the match_reports table contains:
    """yml
    matchId: match-1
    round: 0
    teamAReportedWinner: team-a
    teamBReportedWinner: team-b
    disputed: true
    """


  Scenario: A player adds a dispute explanation
    Given token is a valid token for leader-a
    When we post on "/api/tournaments/t1/matches/match-1/rounds/0/report" a Request:
    """yaml
    headers:
      Cookie: token={{token}}
    body:
      payload:
        winner: team-a
    """
    Then we receive a status OK_200

    Given tokenB is a valid token for leader-b
    When we post on "/api/tournaments/t1/matches/match-1/rounds/0/report" a Request:
    """yaml
    headers:
      Cookie: token={{tokenB}}
    body:
      payload:
        winner: team-b
    """
    Then we receive a status OK_200

    When we post on "/api/tournaments/t1/matches/match-1/rounds/0/report" a Request:
    """yaml
    headers:
      Cookie: token={{token}}
    body:
      payload:
        winner: team-a
        disputeExplanation: The opponent disconnected before the end
    """
    Then we receive a status OK_200 and:
    """yaml
    success: true
    """

    Then the match_reports table contains:
    """yml
    matchId: match-1
    round: 0
    teamADisputeExplanation: The opponent disconnected before the end
    """


  Scenario: Referee validates match — reports are cleaned up
    Given token is a valid token for leader-a
    When we post on "/api/tournaments/t1/matches/match-1/rounds/0/report" a Request:
    """yaml
    headers:
      Cookie: token={{token}}
    body:
      payload:
        winner: team-a
    """
    Then we receive a status OK_200

    Given refToken is a valid token for ref-1
    When we post on "/api/tournaments/t1/matches/match-1/referee-validate-match-result" a Request:
    """yaml
    headers:
      Cookie: token={{refToken}}
    body:
      payload:
        winner: team-a
    """
    Then we receive a status OK_200 and:
    """yaml
    success: true
    """

    And the matches table contains:
    """yml
    id: match-1
    content:
      done: true
      winner: team-a
    """

    Then the match_reports table contains nothing


  Scenario: A non-member cannot report
    Given token is a valid token for outsider
    When we post on "/api/tournaments/t1/matches/match-1/rounds/0/report" a Request:
    """yaml
    headers:
      Cookie: token={{token}}
    body:
      payload:
        winner: team-a
    """
    Then we receive a status OK_200 and:
    """yaml
    success: false
    """


  Scenario: Report is rejected when autoRefereeing is disabled on the phase
    Given token is a valid token for leader-a
    When we post on "/api/tournaments/t1/matches/match-2/rounds/0/report" a Request:
    """yaml
    headers:
      Cookie: token={{token}}
    body:
      payload:
        winner: team-a
    """
    Then we receive a status OK_200 and:
    """yaml
    success: false
    """


  Scenario: A regular team member (non-leader) can report
    Given token is a valid token for player-a
    When we post on "/api/tournaments/t1/matches/match-1/rounds/0/report" a Request:
    """yaml
    headers:
      Cookie: token={{token}}
    body:
      payload:
        winner: team-a
    """
    Then we receive a status OK_200 and:
    """yaml
    success: true
    """

    Then the match_reports table contains:
    """yml
    matchId: match-1
    round: 0
    teamAReportedWinner: team-a
    teamAReporterId: player-a
    """


  Scenario: A second report from same team overwrites the first (upsert)
    Given token is a valid token for leader-a
    When we post on "/api/tournaments/t1/matches/match-1/rounds/0/report" a Request:
    """yaml
    headers:
      Cookie: token={{token}}
    body:
      payload:
        winner: team-a
    """
    Then we receive a status OK_200

    Given token2 is a valid token for player-a
    When we post on "/api/tournaments/t1/matches/match-1/rounds/0/report" a Request:
    """yaml
    headers:
      Cookie: token={{token2}}
    body:
      payload:
        winner: team-b
    """
    Then we receive a status OK_200 and:
    """yaml
    success: true
    """

    Then the match_reports table contains:
    """yml
    matchId: match-1
    round: 0
    teamAReportedWinner: team-b
    teamAReporterId: player-a
    """


  Scenario: Admin can view reports
    Given token is a valid token for leader-a
    When we post on "/api/tournaments/t1/matches/match-1/rounds/0/report" a Request:
    """yaml
    headers:
      Cookie: token={{token}}
    body:
      payload:
        winner: team-a
    """
    Then we receive a status OK_200

    Given refToken is a valid token for ref-1
    When we gets on "/api/tournaments/t1/matches/match-1/reports" a Request:
    """yaml
    headers:
      Cookie: token={{refToken}}
    """
    Then we receive a status OK_200 and:
    """yaml
    reports:
      - matchId: match-1
        round: 0
        teamAReportedWinner: team-a
    """


  Scenario: Non-referee non-member cannot view reports
    Given token is a valid token for leader-a
    When we post on "/api/tournaments/t1/matches/match-1/rounds/0/report" a Request:
    """yaml
    headers:
      Cookie: token={{token}}
    body:
      payload:
        winner: team-a
    """
    Then we receive a status OK_200

    Given outsiderToken is a valid token for outsider
    When we gets on "/api/tournaments/t1/matches/match-1/reports" a Request:
    """yaml
    headers:
      Cookie: token={{outsiderToken}}
    """
    Then we receive a status OK_200 and:
    """yaml
    reports: ?isNull
    """


  Scenario: Team member can view reports without screenshots
    Given token is a valid token for leader-a
    When we post on "/api/tournaments/t1/matches/match-1/rounds/0/report" a Request:
    """yaml
    headers:
      Cookie: token={{token}}
    body:
      payload:
        winner: team-a
        screenshot: data:image/png;base64,fakedata
    """
    Then we receive a status OK_200

    Given tokenB is a valid token for leader-b
    When we gets on "/api/tournaments/t1/matches/match-1/reports" a Request:
    """yaml
    headers:
      Cookie: token={{tokenB}}
    """
    Then we receive a status OK_200 and:
    """yaml
    reports:
      - matchId: match-1
        round: 0
        teamAReportedWinner: team-a
        teamAScreenshot: ?isNull
    """


