Feature: Evaluate quiz score

  Background:
    Given questions
      | bookmark | question                            | answers                                   | explanation |
      | Sky      | What is the standard colour of sky? | Red, Blue (*), Green, Black               | Rayleigh    |
      | France   | What is capital of France?          | Marseille, Lyon, Paris (*), Toulouse      |             |

    Given quizes
      | bookmark | title  | description   | questions     | mode  | pass score | time limit |
      | -1       | Quiz A | Description A | Sky,France    | exam  | 85         | 120        |

  Scenario Outline: Quiz score
    Given a quiz "A" with 4 questions, exam mode and 75% pass score
    When I start the quiz
    * I answer <correct> questions correctly
    * I answer <incorrect> questions incorrectly
    * I proceed to the score page
    Then I see the result <correct> correct out of 4, <percentage>%, <result>, required passScore 75%

    Examples:
      | correct | incorrect | percentage | result |
      | 4       | 0         | 100        | passed |
      | 3       | 1         | 75         | passed |
      | 2       | 2         | 50         | failed |
      | 0       | 4         | 0          | failed |


@skip
  Scenario: Quiz score in learing mode
    - In learning mode, quiz taker can retake questions
    - Score page shows two separate results:
      - score for the first answers of each question, and,
      - score for the corrected answers.

    Given a quiz "A" with 2 questions, learn mode and 100% pass score
    When I start the quiz
    * I answer correctly
    * I proceed to the next question
    * I answer incorrectly
    * I answer correctly
    * I proceed to the score page
    Then I see the result 2 correct out of 2, 100%, passed, required passScore 100%
    Then I see the original result 1, 50%, failed

  Scenario Outline: Show question on score page
    Given I start quiz "-1"
    When I answer "Blue"
    * I answer "Marseille"
    * I click the evaluate button
    Then I see the question "<question>"

    Examples:
      | question                            |
      | What is the standard colour of sky? |
      | What is capital of France?          |

  Scenario: Show options of question on score page
    Given I start quiz "-1"
    When I answer "Blue"
    * I answer "Marseille"
    * I click the evaluate button
    Then I see all options for question "Sky"

  Scenario: Show question explanation of question on score page
    Given I start quiz "-1"
    When I answer "Blue"
    * I answer "Marseille"
    * I click the evaluate button
    Then I see question explanation "Rayleigh" for question "Sky"

  Scenario: Show user select
    Given I start quiz "-1"
    When I answer "Blue"
    * I answer "Marseille"
    * I click the evaluate button
    Then I see user select "Blue" for question "Sky"
