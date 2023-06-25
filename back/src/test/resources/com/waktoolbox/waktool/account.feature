Feature: Account features are working

  Background:
    Given that the accounts table will contain:
      | id | username     | discriminator | email           | ankamaName  | ankamaDiscriminator | twitchUrl                     |
      | 1  | Maude Clonet | 1324          | maude@clonet.fr | MaudeClonet | 1234                | https://twitch.tv/maudeclonet |


  Scenario: Happy path - We can update our own data
    Given token is a valid token for 1
    When we post on "/api/accounts/1" a Request:
    """yaml
    headers:
      Cookie: token={{token}}

    body:
      payload:
        ankamaName: ClonetMaude
        ankamaDiscriminator: 4321
        twitchUrl: https://www.twitch.tv/clonetmaude
    """
    Then we receive a status OK_200 and:
    """
    id: 1
    displayName: Maude Clonet#1324
    ankamaName: ClonetMaude
    ankamaDiscriminator: 4321
    twitchUrl: https://www.twitch.tv/clonetmaude
    """

    And the accounts table contains only:
      | id | username     | discriminator | email           | ankamaName  | ankamaDiscriminator | twitchUrl                     |
      | 1  | Maude Clonet | 1324          | maude@clonet.fr | ClonetMaude | 4321                | https://www.twitch.tv/clonetmaude |


    Then when we gets on "/api/accounts" a Request:
    """yaml
    headers:
      Cookie: token={{token}}
    """
    Then we receive a status OK_200 and exactly:
    """yaml
    id: 1
    displayName: Maude Clonet#1324
    ankamaName: ClonetMaude
    ankamaDiscriminator: 4321
    twitchUrl: https://www.twitch.tv/clonetmaude
    """

  Scenario Template: Errors - Check a bunch of errors
    Given token is a valid token for <id>
    When we post on "/api/accounts/1" a Request:
      """yaml
      headers:
        Cookie: token=<token>

      body:
        payload:
          ankamaName: <name>
          ankamaDiscriminator: <discriminator>
          twitchUrl: <twitch>
      """
    And the accounts table contains only:
      | id | username     | discriminator | email           | ankamaName  | ankamaDiscriminator | twitchUrl                     |
      | 1  | Maude Clonet | 1324          | maude@clonet.fr | MaudeClonet | 1234                | https://twitch.tv/maudeclonet |

    Then we receive a status <status>
    Examples:
      | id | token     | name | discriminator | twitch                                                  | status           |
      | 1  |           | name | 134           | https://twitch.tv/maudeclonet                           | UNAUTHORIZED_401 |
      | 2  | {{token}} | name | 134           | https://twitch.tv/maudeclonet                           | FORBIDDEN_403    |
      | 1  | {{token}} | n?me | 134           | https://twitch.tv/maudeclonet                           | BAD_REQUEST_400  |
      | 1  | {{token}} |      | 134           | https://twitch.tv/maudeclonet                           | BAD_REQUEST_400  |
      | 1  | {{token}} | name |               | https://twitch.tv/maudeclonet                           | BAD_REQUEST_400  |
      | 1  | {{token}} | name | 10000         | https://twitch.tv/maudeclonet                           | BAD_REQUEST_400  |
      | 1  | {{token}} | name | -1            | https://twitch.tv/maudeclonet                           | BAD_REQUEST_400  |
      | 1  | {{token}} | name | hey           | https://twitch.tv/maudeclonet                           | BAD_REQUEST_400  |
      | 1  | {{token}} | name | 134           | http://twitch.tv/maudeclonet                            | BAD_REQUEST_400  |
      | 1  | {{token}} | name | 134           | https://twitchtv/maudeclonet                            | BAD_REQUEST_400  |
      | 1  | {{token}} | name | 134           | https://twitchtv/                                       | BAD_REQUEST_400  |
      | 1  | {{token}} | name | 134           | https://twitch.tv/1234567891234567891234567989123456789 | BAD_REQUEST_400  |