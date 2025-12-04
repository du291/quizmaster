Feature: Take a quiz

  Background:
    Given a workspace with questions
      | question                       | answers            |
      | Jaký nábytek má Ikea?          | Stůl (*), Auto     |
      | Jaké nádobí má Ikea?           | Talíř (*), Kolo    |

  Scenario: Exam mode
    - Quiz in exam mode does not show feedback until the quiz is finished.
    - Submitting an answer proceeds directly to the next question

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
    And I see question "Jaký nábytek má Ikea?"
    When I answer "Stůl"
    Then I see question "Jaké nádobí má Ikea?"

  Scenario: Learn mode
    - Quiz on learning mode feedback shows feedback after each question
    - User must manually proceed to the next question

    When I start creating a new quiz
    And I enter quiz name "Ikea quiz"
    And I select feedback mode "LEARN"
    And I select question "Jaký nábytek má Ikea?"
    And I select question "Jaké nádobí má Ikea?"
    And I submit the quiz
    Then I see the quiz "Ikea quiz" in the workspace
    And I take quiz "Ikea quiz"
    And I click the start button
    And I see question "Jaký nábytek má Ikea?"
    And I see feedback mode "LEARN"
    And I see question "Jaký nábytek má Ikea?"
    When I answer "Stůl"
    Then I see feedback "Correct!"
    When I proceed to the next question
    Then I see question "Jaké nádobí má Ikea?"

  Scenario: Learn mode - Retake question
    - User can retake a question and see the feedback again

    When I start creating a new quiz
    And I enter quiz name "Ikea quiz"
    And I select feedback mode "LEARN"
    And I select question "Jaký nábytek má Ikea?"
    And I select question "Jaké nádobí má Ikea?"
    And I submit the quiz
    Then I see the quiz "Ikea quiz" in the workspace
    And I take quiz "Ikea quiz"
    And I click the start button
    And I see question "Jaký nábytek má Ikea?"
    And I see feedback mode "LEARN"
    And I see question "Jaký nábytek má Ikea?"
    When I answer "Stůl"
    Then I see feedback "Correct!"
    When I answer "Auto"
    Then I see feedback "Incorrect!"

  Scenario: Browser navigation during quiz
    - User can use browser back and forward buttons to navigate between questions

    When I start creating a new quiz
    And I enter quiz name "Ikea quiz"
    And I select feedback mode "LEARN"
    And I select question "Jaký nábytek má Ikea?"
    And I select question "Jaké nádobí má Ikea?"
    And I submit the quiz
    Then I see the quiz "Ikea quiz" in the workspace
    And I take quiz "Ikea quiz"
    And I click the start button
    And I see question "Jaký nábytek má Ikea?"
    And I see feedback mode "LEARN"
    And I see question "Jaký nábytek má Ikea?"
    When I answer "Stůl"
    Then I see feedback "Correct!"
    When I proceed to the next question
    Then I see question "Jaké nádobí má Ikea?"
    When I use the browser back button
    Then I see question "Jaký nábytek má Ikea?"
    When I use the browser forward button
    Then I see question "Jaké nádobí má Ikea?"
