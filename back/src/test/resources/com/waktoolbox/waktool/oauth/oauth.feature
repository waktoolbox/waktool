Feature: OAuth through Discord system

  Background:
    Given that the accounts table will contain:
      | id | username     | discriminator | email           | ankama_name | ankama_discriminator | twitch_url                    |
      | 1  | Maude Clonet | 1324          | maude@clonet.fr | MaudeClonet | 1234                 | https://twitch.tv/maudeclonet |


  Scenario: Happy path - a known user can auth through Discord OAuth
    Given that posting on "/discord/token.*" will return a status OK_200 and:
    """yaml
    access_token: abc
    expires_in: 1000000
    refresh_token: def
    scope: ghi
    token_type: klm
    """
    And that getting on "/discord/user.*" will return a status OK_200 and:
    """yaml
    id: 1
    username: ClonetMaude
    discriminator: 4321
    email: clonet@maude.fr
    useless_field: dummy_value
    """

    When we get on "/api/oauth/discord/redirect?code=super-code"
    Then we receive a status OK_200 and a Response:
    """yaml
    headers:
        Set-Cookie: ?e token=eyJhbGciOiJIUzUxMiJ9.eyJkaXNjb3JkX2lkIjoiMSIsInVzZXJuYW1lIjoiQ2xvbmV0TWF1ZGUiLCJkaXNjcmltaW5hdG9yIjoiNDMyMSIsImlhdCI6MTY4NDg1.*
        Location: changeme
    """

    And the accounts table contains only:
      | id | username    | discriminator | email           | ankama_name | ankama_discriminator | twitch_url                    |
      | 1  | ClonetMaude | 4321          | clonet@maude.fr | MaudeClonet | 1234                 | https://twitch.tv/maudeclonet |

  Scenario Template: Errors - if something goes wrong, we got a 500 error
    Given that if <token-mock> == full => posting on "/discord/token.*" will return a status OK_200 and:
    """yaml
    access_token: abc
    expires_in: 1000000
    refresh_token: def
    scope: ghi
    token_type: klm
    """
    Given that if <token-mock> == void => posting on "/discord/token.*" will return a status OK_200 and:
    """yaml

    """
    Given that if <token-mock> == error => posting on "/discord/token.*" will return a status INTERNAL_SERVER_ERROR_500

    Given that if <user-mock> == full => getting on "/discord/user.*" will return a status OK_200 and:
    """yaml
    id: 1
    username: ClonetMaude
    discriminator: 4321
    email: clonet@maude.fr
    useless_field: dummy_value
    """
    Given that if <user-mock> == void => getting on "/discord/user.*" will return a status OK_200 and:
    """yaml

    """
    Given that if <user-mock> == error => getting on "/discord/user.*" will return a status INTERNAL_SERVER_ERROR_500

    When we get on "/api/oauth/discord/redirect?code=super-code"
    Then we receive a status INTERNAL_SERVER_ERROR_500

    Examples:
      | token-mock | user-mock |
      | void       | full      |
      | error      | full      |
      | full       | void      |
      | full       | error     |