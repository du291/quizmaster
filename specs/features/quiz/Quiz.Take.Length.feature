Feature: Take a quiz

  Background:
    Given questions
      | bookmark  | questions                                             | answers                   |
      | Planet    | Which planet is known as the Red Planet?              | Mars (*), Venus           |
      | Australia | What's the capital city of Australia?                 | Sydney, Canberra (*)      |
      | Fruit     | Which fruit is known for having seeds on the outside? | Strawberry (*), Blueberry |
    And quizes
      | bookmark | questions                | size | mode | pass score | time limit |
      | Normal   | Planet, Australia, Fruit |    2 | exam |        100 |        120 |
      | Empty    | Planet, Australia, Fruit |     | exam |        100 |        120 |

  Scenario: Normal mode
    - Quiz with question pool size displayed same value in question count at welcome page.

    When I open quiz "Normal"
    Then I see the welcome page
    * I see question count 2
    When I start quiz "Normal"
    * I answer "Mars"
    * I answer "Canberra"
    * I proceed to the score page
    Then I see the result 2 correct out of 2, 100%, passed, required passScore 100%

  Scenario: Empty mode
  - Quiz with question pool size displayed same value in question count at welcome page.

    When I open quiz "Empty"
    Then I see the welcome page
    * I see question count 3
    When I start quiz "Empty"
    * I answer "Mars"
    * I answer "Canberra"
    * I answer "Strawberry"
    * I proceed to the score page
    Then I see the result 3 correct out of 3, 100%, passed, required passScore 100%

  
