Feature: Run timer

  Background:
    Given questions
      | bookmark  | question                                              | answers                   |
      | Planet    | Which planet is known as the Red Planet?              | Mars (*), Venus           |
      | Australia | What's the capital city of Australia?                 | Sydney, Canberra (*)      |

    Given quizes
      | bookmark | title  | description   | questions        | mode  | pass score | time limit  |
      | -1       | Quiz A | Description A | Planet,Australia | exam  | 85         | 120         |
      | -2       | Quiz B | Description B | Planet,Australia | exam  | 85         | 60          |

  Scenario Outline: Display countdown timer
    Given I start quiz "<bookmark>"
    Then I should see the countdown timer "<time>"

    Examples:
      | bookmark  | time  |
      | -1        | 02:00  |
      | -2        | 01:00  |

  Scenario: Display result table after 1 minutes
    Given I start quiz "-2"
    When I will wait for "01:00"
    And I should see the text "Game over time"
    Then I should see the dialog evaluate button
    And I click on the dialog evaluate button
    Then I should see the results table

  Scenario: Display score 0 when no answers were given
    Given I start quiz "-1"
    When I will wait for "02:00"
    And I should see the text "Game over time"
    Then I should see the dialog evaluate button
    And I click on the dialog evaluate button
    Then I should see the results table
    Then I see the result 0 correct out of 2, 0%, failed, required passScore 85%

  Scenario: Display score 1/2 when answered one correctly and timed out
    Given I start quiz "-1"
    When I answer "Mars"
    Then I will wait for "02:00"
    And I should see the text "Game over time"
    Then I should see the dialog evaluate button
    And I click on the dialog evaluate button
    Then I should see the results table
    Then I see the result 1 correct out of 2, 50%, failed, required passScore 85%
