Feature: Quiz progress bar
  As a quiz taker, I want to see
  - how much of the quiz I have completed, and,
  - how much I have still left to answer.

  Scenario: Exam mode
    - In exam mode, next question is shown after answering the current question
    - Progress bar shows the current page of the quiz

    Given a quiz "Exam" with 3 questions, exam mode and 85% pass score

    When I start the quiz
    Then progress shows 1 of 3

    When I answer the question
    Then progress shows 2 of 3

    When I answer the question
    Then progress shows 3 of 3


  Scenario: Learning mode
    - In learning mode, progress bar updates after navigating to the next question
    - Progress bar updates after navigating to the next question

    Given a quiz "Learn" with 3 questions, learn mode and 85% pass score

    When I start the quiz
    Then progress shows 1 of 3

    When I answer the question
    Then progress shows 1 of 3

    When I proceed to the next question
    Then progress shows 2 of 3
