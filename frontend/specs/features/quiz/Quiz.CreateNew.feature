Feature: Create Quiz from Workspace

  Background:
    Given a workspace with questions
      | question                       | answers            |
      |                      2 + 2 = ? |           4 (*), 5 |
      |                      3 * 3 = ? |           9 (*), 6 |
      |                      4 / 2 = ? |           2 (*), 3 |
      | Jaký nábytek má Ikea?          | Stůl (*), Auto     |
      | Jaké nádobí má Ikea?           | Talíř (*), Kolo    |
      | Jaký venkovní Nábytek má Ikea? | Židle (*), Triangl |

  Scenario: Create quiz and display it in quiz list
    When I start creating a new quiz
    * I enter quiz name "Math Quiz"
    * I enter quiz description "Very hard math quiz"
    * I select question "2 + 2 = ?"
    * I select question "4 / 2 = ?"
    * I submit the quiz
    Then I see the quiz "Math Quiz" in the workspace
    * I take quiz "Math Quiz"

  Scenario: Create quiz with default values
    When I start creating a new quiz
    Then I see empty quiz title
    And I see empty quiz description
    And I see time limit "600" seconds
    And I see pass score "80"
    And I see quiz question "2 + 2 = ?"
    And I see quiz question "3 * 3 = ?"
    And I see quiz question "4 / 2 = ?"

  @skip
  Scenario: Create quiz with 4 questions
    When I start creating a new quiz
    * I enter quiz name "Math Quiz"
    * I enter quiz description "Very hard math quiz"
    * I select question "2 + 2 = ?"
    * I select question "4 / 2 = ?"
    * I select question "4 * 2 = ?"
    * I select question "4 - 2 = ?"
    * I check randomized function
    * I enter number of randomized questions in quiz 3
    * I submit the quiz
    * I take quiz "Math Quiz"
    Then I see the welcome page
    * I see quiz name "Math Quiz"
    * I see quiz description "Very hard math quiz"
    * I see question count 3

  @skip
  Scenario: Quiz form with only default values
    When I start creating a new quiz
    And I submit the quiz
    Then I see error messages in quiz form
      | titleRequired              |
      | descriptionRequired        |
      | atLeastOneQuestionRequired |

  @skip
  Scenario: Display error when score is above 100
    When I start creating a new quiz
    And I enter quiz name "Math Quiz"
    And I enter quiz description "Very hard math quiz"
    And I enter pass score "220"
    And I submit the quiz
    Then I see error messages in quiz form
      | scoreAboveMax |

  @skip
  Scenario: Display error when limit is negative
    When I start creating a new quiz
    And I enter quiz name "Math Quiz"
    And I enter quiz description "Very hard math quiz"
    And I enter time limit "-10"
    And I submit the quiz
    Then I see error messages in quiz form
      | negativeTimeLimit |

  @skip
  Scenario: Display error when limit is over 21600
    When I start creating a new quiz
    And I enter quiz name "Math Quiz"
    And I enter quiz description "Very hard math quiz"
    And I enter time limit "21601"
    And I submit the quiz
    Then I see error messages in quiz form
      | timeLimitAboveMax |

  @skip
  Scenario: Display no error when timelimit is cleared
    When I start creating a new quiz
    And I enter quiz name "Math Quiz"
    And I enter quiz description "Very hard math quiz"
    And I clear time limit
    And I select question "2 + 2 = ?"
    And I submit the quiz
    Then I see no error messages in quiz form
    And I see time limit "0" seconds

  @skip
  Scenario: Display no error when score is cleared
    When I start creating a new quiz
    And I enter quiz name "Math Quiz"
    And I enter quiz description "Very hard math quiz"
    And I clear score
    And I select question "2 + 2 = ?"
    And I submit the quiz
    Then I see no error messages in quiz form
    And I see pass score "0"

  @skip
  Scenario Outline: Filter questions in quiz creation form
    When I start creating a new quiz
    And I filter questions by "<filter>"
    Then I see quiz question "<visibleQuestion1>"
    And I see quiz question "<visibleQuestion2>"
    And I don't see quiz questions "<hiddenQuestion1>"
    And I don't see quiz questions "<hiddenQuestion2>"
    Examples:
      | filter  | visibleQuestion1      | visibleQuestion2               | hiddenQuestion1 | hiddenQuestion2       |
      |       2 |             2 + 2 = ? |                      4 / 2 = ? |       3 * 3 = ? | Jaký nábytek má Ikea? |
      | Ikea    | Jaký nábytek má Ikea? | Jaké nádobí má Ikea?           |       2 + 2 = ? |             3 * 3 = ? |
      | nábytek | Jaký nábytek má Ikea? | Jaký venkovní Nábytek má Ikea? |       2 + 2 = ? |             4 / 2 = ? |
