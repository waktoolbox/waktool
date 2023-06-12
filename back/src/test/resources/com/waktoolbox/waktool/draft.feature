Feature: Draft works as expected

  Background:


  Scenario: Happy path - A typical Wakfu Warrior draft
    Given a Wakfu Warrior draft

    # Join does not mean being in a team
    Given 1 joins draft
    Then team A does not contains user 1
    Then team B does not contains user 1
    Given 1 joins team A
    Then team A contains user 1
    Then team B does not contains user 1

    Given 2 joins draft
    Then team A does not contains user 2
    Then team B does not contains user 2
    Given 2 joins team B
    Then team A does not contains user 2
    Then team B contains user 2

    # Pick can't happen if not ready
    Given 1 picks 1 for team A true true
    Then the last action should be false
    Given 2 picks 2 for team B true true
    Then the last action should be false

    # Can toggle ready state
    Given team A set ready to true
    Then team A is ready
    And team B is not ready

    Given team A set ready to false
    Then team A is not ready
    And team B is not ready

    Given team A set ready to true
    And team B set ready to true
    Then team A is ready
    And team B is ready

    And team B set ready to false
    Then team A is ready
    And team B is not ready
    Then team B set ready to true

    # Being ready does not mean you can do any action
    Given 1 picks 1 for team A true true
    Then the last action should be false
    Given 2 picks 2 for team B true true
    Then the last action should be false

    # Can't act for other teamm
    Given 2 bans 1 for team A true true
    Then the last action should be false
    Given 1 bans 2 for team B true true
    Then the last action should be false

    # Then rollout the draft

    Given 1 bans 1 for team A true true
    Then the last action should be true
    Given 2 bans 2 for team B true true
    Then the last action should be true

    # Can't pick banned characters
    Given 1 picks 1 for team A true true
    Then the last action should be false
    Given 1 picks 2 for team A true true
    Then the last action should be false
    Given 2 picks 1 for team B true true
    Then the last action should be false
    Given 2 picks 2 for team B true true
    Then the last action should be false

    # But picking correct breed is ok
    Given 1 picks 3 for team A true true
    Then the last action should be true
    Given 2 picks 4 for team B true true
    Then the last action should be true

    # Process whole true true crap
    Given 2 bans 5 for team B true true
    Given 1 bans 6 for team A true true
    Given 2 picks 7 for team B true true
    Given 1 picks 8 for team A true true
    Given 1 bans 9 for team A true true
    Given 2 bans 10 for team B true true
    Given 1 picks 11 for team A true true
    Given 2 picks 12 for team B true true

    # Sending bad step info is not allowed
    Given 1 picks 13 for team A true true
    Then the last action should be false
    Given 2 picks 13 for team B false false
    Then the last action should be false

    # Not banned so we can take the same breed on both sides
    Given 1 picks 13 for team A true false
    Then the last action should be true
    Given 2 picks 13 for team B true false
    Then the last action should be true

    # But locked for picking team so can't take it twice
    Given 1 picks 13 for team A true false
    Then the last action should be false
    Given 2 picks 13 for team B true false
    Then the last action should be false

    Given 1 picks 14 for team A true false
    Given 2 picks 15 for team B true false
    Given 1 picks 16 for team A true false
    Given 2 picks 17 for team B true false

    Then draft is over

    And pick result for team A is
      | 3 | 8 | 11 | 13 | 14 | 16 |
    And ban result for team A is
      | 1 | 6 | 9 |

    And pick result for team B is
      | 4 | 7 | 12 | 13 | 15 | 17 |
    And ban result for team B is
      | 2 | 5 | 10 |