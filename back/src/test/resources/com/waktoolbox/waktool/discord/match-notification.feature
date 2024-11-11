Feature: A match notification is sent to the discord channel

  Scenario: A match notification is sent to the discord channel
    Given that the current time is {{2024-11-11T15:15:30.000Z}}
    Given the tournaments table will contain:
    """yml
    id: ww
    content:
      matchNotificationChannel: 123
    """

    Given the teams table will contain:
    """yml
    - id: T1
      content:
        name: Team A
        validatedPlayers: ["A", "B", "C"]
      createdAt: {{@now}}
    - id: T2
      content:
        name: Team B
        validatedPlayers: ["D", "E", "F"]
      createdAt: {{@now}}
    """

    Given the matches table will contain:
    """yml
    - id: 1
      tournamentId: ww
      content:
        date: {{@now}}
        teamA: T1
        teamB: T2
        rounds:
        - map: 972
        referee: Ashed
    """

    Given that the current time is {{2024-11-11T15:00:00.000Z}}

    Given that posting on "/discord/channels/123/messages" will return a status OK_200

    When the match notificator runs

    Then within 100ms "/discord/channels/123/messages" has received a POST and:
    """yml
    content: "||<@Ashed> <@A> <@B> <@C> <@D> <@E> <@F>||"
    embeds:
    - title: ":crossed_swords: **Team A** vs **Team B** :crossed_swords:"
      description: "Dalle blanche / White Slab"
      url: ?e .*/mocked-front/tournament/ww/tab/4/match/1
      image:
        url: ?e .*/mocked-front/maps/972.jpg
      timestamp: "2024-11-11T15:15:30"
    """