Feature: Quiz Difficulty

  Scenario Outline: Quiz Difficulty
    Quiz difficulty can override individual questions difficulty.
    - Default difficulty keeps each individual question difficulty.
    - Easy difficulty overrides all questions to easy.
    - Hard difficulty overrides all questions to hard.

    Note: Single choice questions never show the correct answers count, they're already easy.

    Given questions
      | bookmark | easy  | question           | answers                         |
      | Single   |       | Capital of France? | Paris (*), Nice                 |
      | Easy     | true  | Food?              | Pork (*), Fish (*), Shoe        |
      | Hard     | false | Animal?            | Dog (*), Cat (*), Bird (*), Car |
    And quizes
      | bookmark | title | description | questions          | difficulty   | mode | pass score | time limit |
      | Quiz     | Quiz  | Description | Single, Easy, Hard | <difficulty> | exam |         40 |        120 |
    When I start quiz "Quiz"
    And I progress through the questions
    Then I see the correct answers count
      | Single | <single> |
      | Easy   | <easy>   |
      | Hard   | <hard>   |

    Examples:
      | difficulty    | single | easy | hard |
      | Keep Question | -      | 2    | -    |
      | Easy          | -      | 2    | 3    |
      | Hard          | -      | -    | -    |
