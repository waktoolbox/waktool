Feature: Team registration with breeds and banned breeds

  Background:
    Given that the current time is 2026-06-01T00:00:00Z
    Given that the accounts table will contain:
      | id    | username | discriminator | email          | ankamaName | ankamaDiscriminator |
      | lead1 | Leader1  | 0001          | lead1@test.com | Leader1    | 0001                |
      | usr2  | User2    | 0002          | usr2@test.com  | User2      | 0002                |
      | usr3  | User3    | 0003          | usr3@test.com  | User3      | 0003                |
      | usr4  | User4    | 0004          | usr4@test.com  | User4      | 0004                |
      | usr5  | User5    | 0005          | usr5@test.com  | User5      | 0005                |
      | usr6  | User6    | 0006          | usr6@test.com  | User6      | 0006                |

  # ─────────────────────────────────────────────────
  # New tournament format: 7 picks + 1 ban, max 5 players
  # ─────────────────────────────────────────────────

  Scenario: Create a team with 7 picks and 1 valid ban
    Given the tournaments table will contain:
    """yml
    id: t1
    content:
      id: t1
      name: Ignemikhal's Fury
      startDate: 2026-07-01T00:00:00Z
      endDate: 2026-07-21T00:00:00Z
      mustRegisterTeamComposition: true
      requiredBannedBreeds: 1
      requiredBreeds: 7
      maxTeamPlayers: 5
      phases: []
    """
    Given token is a valid token for lead1
    When we post on "/api/tournaments/t1/teams" a Request:
    """yaml
    headers:
      Cookie: token={{token}}

    body:
      payload:
        name: TestTeam
        server: Pandora
        catchPhrase: GG
        displayOnTeamList: true
        breeds: [1, 3, 5, 7, 9, 11, 13]
        bannedBreeds: [2]
    """
    Then we receive a status OK_200 and:
    """yaml
    success: true
    team:
      name: TestTeam
      server: Pandora
      breeds: [1, 3, 5, 7, 9, 11, 13]
      bannedBreeds: [2]
    """


  Scenario: Fail to create team when banned breed is among the picks
    Given the tournaments table will contain:
    """yml
    id: t1
    content:
      id: t1
      name: Ignemikhal's Fury
      startDate: 2026-07-01T00:00:00Z
      endDate: 2026-07-21T00:00:00Z
      mustRegisterTeamComposition: true
      requiredBannedBreeds: 1
      requiredBreeds: 7
      maxTeamPlayers: 5
      phases: []
    """
    Given token is a valid token for lead1
    When we post on "/api/tournaments/t1/teams" a Request:
    """yaml
    headers:
      Cookie: token={{token}}

    body:
      payload:
        name: BadTeam
        server: Pandora
        catchPhrase: Oops
        displayOnTeamList: true
        breeds: [1, 3, 5, 7, 9, 11, 13]
        bannedBreeds: [5]
    """
    Then we receive a status OK_200 and:
    """yaml
    success: false
    error: error.badBannedBreed
    """


  Scenario: Fail to create team with fewer than 7 breeds when 7 required
    Given the tournaments table will contain:
    """yml
    id: t1
    content:
      id: t1
      name: Ignemikhal's Fury
      startDate: 2026-07-01T00:00:00Z
      endDate: 2026-07-21T00:00:00Z
      mustRegisterTeamComposition: true
      requiredBannedBreeds: 1
      requiredBreeds: 7
      maxTeamPlayers: 5
      phases: []
    """
    Given token is a valid token for lead1
    When we post on "/api/tournaments/t1/teams" a Request:
    """yaml
    headers:
      Cookie: token={{token}}

    body:
      payload:
        name: SmallTeam
        server: Pandora
        catchPhrase: Short
        displayOnTeamList: true
        breeds: [1, 3, 5, 7, 9, 11]
        bannedBreeds: [2]
    """
    Then we receive a status OK_200 and:
    """yaml
    success: false
    error: error.badPickedBreeds
    """


  Scenario: Fail to create team without banned breeds when required
    Given the tournaments table will contain:
    """yml
    id: t1
    content:
      id: t1
      name: Ignemikhal's Fury
      startDate: 2026-07-01T00:00:00Z
      endDate: 2026-07-21T00:00:00Z
      mustRegisterTeamComposition: true
      requiredBannedBreeds: 1
      requiredBreeds: 7
      maxTeamPlayers: 5
      phases: []
    """
    Given token is a valid token for lead1
    When we post on "/api/tournaments/t1/teams" a Request:
    """yaml
    headers:
      Cookie: token={{token}}

    body:
      payload:
        name: NoBanTeam
        server: Pandora
        catchPhrase: NoBan
        displayOnTeamList: true
        breeds: [1, 3, 5, 7, 9, 11, 13]
    """
    Then we receive a status OK_200 and:
    """yaml
    success: false
    error: error.badBannedBreed
    """


  Scenario: Reject 6th player application when max is 5
    Given the tournaments table will contain:
    """yml
    id: t1
    content:
      id: t1
      name: Ignemikhal's Fury
      startDate: 2026-07-01T00:00:00Z
      endDate: 2026-07-21T00:00:00Z
      mustRegisterTeamComposition: true
      requiredBannedBreeds: 1
      requiredBreeds: 7
      maxTeamPlayers: 5
      admins: [admin1]
      phases: []
    """
    Given the teams table will contain:
    """yml
    - id: team1
      createdAt: 2026-06-15T00:00:00Z
      content:
        id: team1
        tournament: t1
        name: FullTeam
        server: Pandora
        leader: lead1
        catchPhrase: Full
        displayOnTeamList: true
        breeds: [1, 3, 5, 7, 9, 11, 13]
        bannedBreeds: [2]
        validatedPlayers: [lead1, usr2, usr3, usr4, usr5]
    """
    Given the applications table will contain:
      | id   | tournamentId | teamId | userId |
      | app1 | t1           | team1  | usr6   |
    Given token is a valid token for lead1
    When we post on "/api/tournaments/t1/teams/team1/applications/app1" a Request:
    """yaml
    headers:
      Cookie: token={{token}}

    body:
      payload: {}
    """
    Then we receive a status BAD_REQUEST_400


  Scenario: Accept 5th player application when max is 5
    Given the tournaments table will contain:
    """yml
    id: t1
    content:
      id: t1
      name: Ignemikhal's Fury
      startDate: 2026-07-01T00:00:00Z
      endDate: 2026-07-21T00:00:00Z
      mustRegisterTeamComposition: true
      requiredBannedBreeds: 1
      requiredBreeds: 7
      maxTeamPlayers: 5
      admins: [admin1]
      phases: []
    """
    Given the teams table will contain:
    """yml
    - id: team1
      createdAt: 2026-06-15T00:00:00Z
      content:
        id: team1
        tournament: t1
        name: AlmostFullTeam
        server: Pandora
        leader: lead1
        catchPhrase: Almost
        displayOnTeamList: true
        breeds: [1, 3, 5, 7, 9, 11, 13]
        bannedBreeds: [2]
        validatedPlayers: [lead1, usr2, usr3, usr4]
    """
    Given the applications table will contain:
      | id   | tournamentId | teamId | userId |
      | app1 | t1           | team1  | usr5   |
    Given token is a valid token for lead1
    When we post on "/api/tournaments/t1/teams/team1/applications/app1" a Request:
    """yaml
    headers:
      Cookie: token={{token}}

    body:
      payload: {}
    """
    Then we receive a status OK_200


  # ─────────────────────────────────────────────────
  # Backward compatibility: old tournament with 6 breeds, no ban
  # ─────────────────────────────────────────────────

  Scenario: Backward compatibility - Create team with 6 picks and no ban on legacy tournament
    Given the tournaments table will contain:
    """yml
    id: legacy
    content:
      id: legacy
      name: Legacy Tournament
      startDate: 2026-07-01T00:00:00Z
      endDate: 2026-07-21T00:00:00Z
      mustRegisterTeamComposition: true
      phases: []
    """
    Given token is a valid token for lead1
    When we post on "/api/tournaments/legacy/teams" a Request:
    """yaml
    headers:
      Cookie: token={{token}}

    body:
      payload:
        name: LegacyTeam
        server: Pandora
        catchPhrase: Old school
        displayOnTeamList: true
        breeds: [1, 3, 5, 7, 9, 11]
    """
    Then we receive a status OK_200 and:
    """yaml
    success: true
    team:
      name: LegacyTeam
      breeds: [1, 3, 5, 7, 9, 11]
      bannedBreeds: ?isNull
    """


