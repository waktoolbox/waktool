Feature: Discord roles are managed for tournament teams

  Background:
    Given that the current time is 2026-06-01T00:00:00Z
    Given that the accounts table will contain:
      | id    | username | discriminator | email          | ankamaName | ankamaDiscriminator |
      | lead1 | Leader1  | 0001          | lead1@test.com | Leader1    | 0001                |
      | usr2  | User2    | 0002          | usr2@test.com  | User2      | 0002                |
      | usr3  | User3    | 0003          | usr3@test.com  | User3      | 0003                |

  Scenario: Role is created and assigned when a player is accepted after discordRoleStartDate
    Given the tournaments table will contain:
    """yml
    id: t1
    discordGuildId: guild123
    content:
      id: t1
      name: Test Tournament
      startDate: 2026-07-01T00:00:00Z
      endDate: 2026-07-21T00:00:00Z
      discordRoleStartDate: 2026-05-30T00:00:00Z
      admins: [lead1]
      phases: []
    """
    Given the teams table will contain:
    """yml
    - id: team1
      createdAt: 2026-05-15T00:00:00Z
      content:
        id: team1
        tournament: t1
        name: Alpha Wolves
        server: Pandora
        leader: lead1
        catchPhrase: Go!
        displayOnTeamList: true
        validatedPlayers: [lead1]
    """
    Given the applications table will contain:
      | id   | tournamentId | teamId | userId |
      | app1 | t1           | team1  | usr2   |

    Given token is a valid token for lead1

    Given that posting on "/discord/guilds/guild123/roles" will return a status OK_200 and:
    """yaml
    id: role-abc-123
    """
    Given that putting on "/discord/guilds/guild123/members/lead1/roles/role-abc-123" will return a status NO_CONTENT_204
    Given that putting on "/discord/guilds/guild123/members/usr2/roles/role-abc-123" will return a status NO_CONTENT_204
    Given that posting on "/discord/users/@me/channels" will return a status OK_200 and:
    """yaml
    id: dm-channel-1
    """
    Given that posting on "/discord/channels/dm-channel-1/messages" will return a status OK_200

    When we post on "/api/tournaments/t1/teams/team1/applications/app1" a Request:
    """yaml
    headers:
      Cookie: token={{token}}

    body:
      payload: {}
    """
    Then we receive a status OK_200

    Then within 100ms "/discord/guilds/guild123/roles" has received a POST and:
    """yaml
    name: Alpha Wolves
    """
    Then "/discord/guilds/guild123/members/lead1/roles/role-abc-123" has received a PUT
    Then "/discord/guilds/guild123/members/usr2/roles/role-abc-123" has received a PUT


  Scenario: No role is created when discordRoleStartDate is not yet reached
    Given that the current time is 2026-05-20T00:00:00Z
    Given the tournaments table will contain:
    """yml
    id: t1
    discordGuildId: guild123
    content:
      id: t1
      name: Test Tournament
      startDate: 2026-07-01T00:00:00Z
      endDate: 2026-07-21T00:00:00Z
      discordRoleStartDate: 2026-05-30T00:00:00Z
      admins: [lead1]
      phases: []
    """
    Given the teams table will contain:
    """yml
    - id: team1
      createdAt: 2026-05-15T00:00:00Z
      content:
        id: team1
        tournament: t1
        name: Alpha Wolves
        server: Pandora
        leader: lead1
        catchPhrase: Go!
        displayOnTeamList: true
        validatedPlayers: [lead1]
    """
    Given the applications table will contain:
      | id   | tournamentId | teamId | userId |
      | app1 | t1           | team1  | usr2   |

    Given token is a valid token for lead1

    Given that posting on "/discord/users/@me/channels" will return a status OK_200 and:
    """yaml
    id: dm-channel-1
    """
    Given that posting on "/discord/channels/dm-channel-1/messages" will return a status OK_200

    When we post on "/api/tournaments/t1/teams/team1/applications/app1" a Request:
    """yaml
    headers:
      Cookie: token={{token}}

    body:
      payload: {}
    """
    Then we receive a status OK_200
    Then within 100ms "/discord/guilds/guild123/roles" has received 0 POST


  Scenario: No role is created when discordRoleStartDate is null (legacy tournament)
    Given the tournaments table will contain:
    """yml
    id: t1
    discordGuildId: guild123
    content:
      id: t1
      name: Legacy Tournament
      startDate: 2026-07-01T00:00:00Z
      endDate: 2026-07-21T00:00:00Z
      admins: [lead1]
      phases: []
    """
    Given the teams table will contain:
    """yml
    - id: team1
      createdAt: 2026-05-15T00:00:00Z
      content:
        id: team1
        tournament: t1
        name: Alpha Wolves
        server: Pandora
        leader: lead1
        catchPhrase: Go!
        displayOnTeamList: true
        validatedPlayers: [lead1]
    """
    Given the applications table will contain:
      | id   | tournamentId | teamId | userId |
      | app1 | t1           | team1  | usr2   |

    Given token is a valid token for lead1

    Given that posting on "/discord/users/@me/channels" will return a status OK_200 and:
    """yaml
    id: dm-channel-1
    """
    Given that posting on "/discord/channels/dm-channel-1/messages" will return a status OK_200

    When we post on "/api/tournaments/t1/teams/team1/applications/app1" a Request:
    """yaml
    headers:
      Cookie: token={{token}}

    body:
      payload: {}
    """
    Then we receive a status OK_200
    Then within 100ms "/discord/guilds/guild123/roles" has received 0 POST


  Scenario: Role is deleted when team is deleted
    Given the tournaments table will contain:
    """yml
    id: t1
    discordGuildId: guild123
    content:
      id: t1
      name: Test Tournament
      startDate: 2026-05-01T00:00:00Z
      endDate: 2026-07-21T00:00:00Z
      discordRoleStartDate: 2026-05-30T00:00:00Z
      admins: [lead1]
      phases: []
    """
    Given the teams table will contain:
    """yml
    - id: team1
      createdAt: 2026-05-15T00:00:00Z
      content:
        id: team1
        tournament: t1
        name: Alpha Wolves
        server: Pandora
        leader: lead1
        catchPhrase: Go!
        displayOnTeamList: true
        validatedPlayers: [lead1]
        discordRoleId: role-to-delete
    """

    Given token is a valid token for lead1

    Given that deleting on "/discord/guilds/guild123/roles/role-to-delete" will return a status NO_CONTENT_204

    When we delete on "/api/tournaments/t1/teams/team1" a Request:
    """yaml
    headers:
      Cookie: token={{token}}
    """
    Then we receive a status OK_200
    Then within 100ms "/discord/guilds/guild123/roles/role-to-delete" has received a DELETE


  Scenario: User role is removed when player is removed from team
    Given the tournaments table will contain:
    """yml
    id: t1
    discordGuildId: guild123
    content:
      id: t1
      name: Test Tournament
      startDate: 2026-05-01T00:00:00Z
      endDate: 2026-07-21T00:00:00Z
      discordRoleStartDate: 2026-05-30T00:00:00Z
      admins: [lead1]
      phases: []
    """
    Given the teams table will contain:
    """yml
    - id: team1
      createdAt: 2026-05-15T00:00:00Z
      content:
        id: team1
        tournament: t1
        name: Alpha Wolves
        server: Pandora
        leader: lead1
        catchPhrase: Go!
        displayOnTeamList: true
        validatedPlayers: [lead1, usr2]
        discordRoleId: role-xyz
    """

    Given token is a valid token for lead1

    Given that deleting on "/discord/guilds/guild123/members/usr2/roles/role-xyz" will return a status NO_CONTENT_204

    When we delete on "/api/tournaments/t1/teams/team1/players/usr2" a Request:
    """yaml
    headers:
      Cookie: token={{token}}
    """
    Then we receive a status OK_200
    Then within 100ms "/discord/guilds/guild123/members/usr2/roles/role-xyz" has received a DELETE


  Scenario: Admin recompute discord roles returns success
    Given the tournaments table will contain:
    """yml
    id: t1
    discordGuildId: guild123
    content:
      id: t1
      name: Test Tournament
      startDate: 2026-05-01T00:00:00Z
      endDate: 2026-07-21T00:00:00Z
      discordRoleStartDate: 2026-05-30T00:00:00Z
      admins: [lead1]
      phases: []
    """

    Given token is a valid token for lead1

    When we post on "/api/tournaments/t1/admin-recompute-discord-roles" a Request:
    """yaml
    headers:
      Cookie: token={{token}}

    body: {}
    """
    Then we receive a status OK_200 and:
    """yaml
    success: true
    """


  Scenario: Non-admin cannot recompute discord roles
    Given the tournaments table will contain:
    """yml
    id: t1
    discordGuildId: guild123
    content:
      id: t1
      name: Test Tournament
      startDate: 2026-05-01T00:00:00Z
      endDate: 2026-07-21T00:00:00Z
      discordRoleStartDate: 2026-05-30T00:00:00Z
      admins: [lead1]
      phases: []
    """

    Given token is a valid token for usr2

    When we post on "/api/tournaments/t1/admin-recompute-discord-roles" a Request:
    """yaml
    headers:
      Cookie: token={{token}}

    body: {}
    """
    Then we receive a status OK_200 and:
    """yaml
    success: false
    """






