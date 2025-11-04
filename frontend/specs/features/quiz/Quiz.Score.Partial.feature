Feature: Take a quiz with partial score

  Background:
    Given questions
      | bookmark | question                                              | answers                                      | explanation |
      | Planets  | Given a question "Which of the following are planets? | Mars (*), Pluto, Titan, Venus (*), Earth (*) | Planets     |
    Given quizes
      | bookmark | title  | description   | questions | mode | pass score | time limit |
      |       -1 | Quiz A | Description A | Planets   | exam |         50 |        120 |

@skip
  Scenario Outline: Multiple choice question with score
    Question is scored as follows:
    - all correct answers gives 1 point
    - one incorrect answer selected gives 0.5 point
    - more than one incorrect answer selected gives 0 point

    When I start the quiz
    And I answer "<answer>"
    And I click the evaluate button
    Then I see the result <correct> correct out of 1, <percentage>%, <result>, required passScore 50%

    Examples:
      | answer                    | correct | percentage | result |
      | Mars, Venus, Earth        |       1 |        100 | passed |
      | Mars, Venus, Titan, Earth |     0.5 |         50 | passed |
      | Mars, Venus               |     0.5 |         50 | passed |
      | Mars, Pluto               |       0 |          0 | failed |
      | Mars, Pluto, Venus, Titan |       0 |          0 | failed |
      | Pluto, Titan              |       0 |          0 | failed |
