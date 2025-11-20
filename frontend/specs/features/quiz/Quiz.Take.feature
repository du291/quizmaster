Feature: Take a quiz

  Background:
    Given questions
      | bookmark  | question                                              | answers                   |
      | Planet    | Which planet is known as the Red Planet?              | Mars (*), Venus           |
      | Australia | What's the capital city of Australia?                 | Sydney, Canberra (*)      |
      | Fruit     | Which fruit is known for having seeds on the outside? | Strawberry (*), Blueberry |
    And quizes
      | bookmark | questions                | mode  | pass score | time limit |
      | Exam     | Planet, Australia, Fruit | exam  | 100        | 120        |
      | Learn    | Planet, Australia, Fruit | learn | 100        | 120        |
    And a workspace with questions
      | question                       | answers            |
      | Jaký nábytek má Ikea?          | Stůl (*), Auto     |
      | Jaké nádobí má Ikea?           | Talíř (*), Kolo    |

  @skip
  Scenario: Exam mode - UI
    When I start creating a new quiz
    And I enter quiz name "Math Quiz"
    And I select feedback mode "EXAM"
    And I select question "Jaký nábytek má Ikea?"
    And I select question "Jaké nádobí má Ikea?"
    And I submit the quiz
    Then I see the quiz "Math Quiz" in the workspace
    And I take quiz "Math Quiz"
    And I click the start button
    And I see question "Jaký nábytek má Ikea?"
    And I see feedback mode "EXAM"

  @skip
  Scenario: Learn mode - UI
    When I start creating a new quiz
    And I enter quiz name "Math Quiz2"
    And I select feedback mode "LEARN"
    And I select question "Jaký nábytek má Ikea?"
    And I select question "Jaké nádobí má Ikea?"
    And I submit the quiz
    Then I see the quiz "Math Quiz2" in the workspace
    And I take quiz "Math Quiz2"
    And I click the start button
    And I see question "Jaký nábytek má Ikea?"
    And I see feedback mode "LEARN"

  Scenario: Exam mode
    - Quiz in exam mode does not show feedback until the quiz is finished.
    - Submitting an answer proceeds directly to the next question

    When I start quiz "Exam"
    Then I see question "Planet"

    When I answer "Mars"
    Then I see question "Australia"


  Scenario: Learning mode
    - Quiz on learning mode feedback shows feedback after each question
    - User must manually proceed to the next question

    When I start quiz "Learn"
    Then I see question "Planet"

    When I answer "Mars"
    Then I see feedback "Correct!"

    When I proceed to the next question
    Then I see question "Australia"


  Scenario: Learning mode - Retake question
    - User can retake a question and see the feedback again

    When I start quiz "Learn"
    Then I see question "Planet"

    When I answer "Mars"
    Then I see feedback "Correct!"

    When I answer "Venus"
    Then I see feedback "Incorrect!"

  Scenario: Browser navigation during quiz
    - User can use browser back and forward buttons to navigate between questions
    When I start quiz "Learn"
    Then I see question "Planet"
    When I answer "Mars"
    Then I see feedback "Correct!"
    Then I proceed to the next question
    Then I see question "Australia"
    When I use the browser back button
    Then I see question "Planet"
    When I use the browser forward button
    Then I see question "Australia"
