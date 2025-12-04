Feature: Take a quiz in EasyMode

  Background:
    Given questions
      | bookmark | question                                | answers                                           | easyMode |
      | Question1       | Which of these countries are in Europe? | Italy (*), France (*), Morocco, Spain (*), Canada | false     |
      | Question2       | Which of these countries are in Europe? | Italy (*), France (*), Morocco, Spain (*), Canada | true      |
      | Question3       | What is the capital of France?          | Paris (*), Lyon, Marseille                        |           |
    And quizes
      | bookmark                  | title  | description  | questions  | easyMode   | mode  | pass score | time limit |
      | QuizWithEasyModePerQuestion |Quiz B | Description B | Question1,Question2,Question3 | PERQUESTION | exam  | 40         | 120        |
      | QuizWithEasyModeAlways   |  Quiz B | Description B  | Question1,Question2,Question3 | ALWAYS     | exam  | 40         | 120        |
      | QuizWithEasyModeNever     | Quiz B | Description B  | Question1,Question2,Question3 | NEVER      | exam  | 40         | 120        |
@skip
  Scenario: Quiz Easy Mode PerQuestion - question Easy Mode mixed
    When I start quiz "QuizWithEasyModePerQuestion"
    Then I do not see correct answers count
    When I proceed to the next question
    Then I see that question has number of correct answers displayed
    When I proceed to the next question
    Then I do not see correct answers count
@skip
Scenario: Quiz Easy Mode Never - question Easy Mode mixed
  When I start quiz "QuizWithEasyModeNever"
  Then I do not see correct answers count
  When I proceed to the next question
  Then I do not see correct answers count
  When I proceed to the next question
  Then I do not see correct answers count
@skip
  Scenario: Quiz Easy Mode Always - overrides question Easy Mode mixed
    When I start quiz "QuizWithEasyModeAlways"
    Then I see that question has number of correct answers displayed
    When I proceed to the next question
    Then I see that question has number of correct answers displayed
    When I proceed to the next question
    Then I do not see correct answers count
