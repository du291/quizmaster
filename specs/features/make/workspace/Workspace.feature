Feature: Workspace - where workspace and quiz list are displayed

  Scenario: Take question in a workspace
    Given a workspace with questions
      | question  | answers  |
      | 2 + 2 = ? | 4 (*), 5 |
      | 3 * 3 = ? | 9 (*), 6 |
    When I take question "2 + 2 = ?" from the list
    Then I see the question and the answers

  Scenario: Delete question in a workspace
    Given a workspace with questions
      | question  | answers  |
      | 2 + 2 = ? | 4 (*), 5 |
    When I delete question "2 + 2 = ?" from the list
    Then I see an empty workspace

  @skip
  Scenario: Do not show delete button for question used in a quiz
    Given a workspace with questions
      | question                       | answers            |
      | Jaký nábytek má Ikea?          | Stůl (*), Auto     |
      | Jaké nádobí má Ikea?           | Talíř (*), Kolo    |
    When I start creating a new quiz
    And I enter quiz name "Math Quiz"
    And I select exam mode
    And I select question "Jaký nábytek má Ikea?"
    And I select question "Jaké nádobí má Ikea?"
    And I submit the quiz
    Then I see the quiz "Math Quiz" in the workspace
    Then I cannot see delete button for question "Jaký nábytek má Ikea?"

  Scenario: Copy a take question URL
    Given a workspace with question
      | question  | answers  |
      | 2 + 2 = ? | 4 (*), 5 |
    When I copy the take question URL "2 + 2 = ?" from the list
    And I follow the copied URL
    Then I see the question and the answers

  Scenario: Edit question in a workspace
    Given a workspace with questions
      | question  | answers  |
      | 2 + 2 = ? | 4 (*), 5 |
      | 3 * 3 = ? | 9 (*), 6 |
    When I edit question "2 + 2 = ?" from the list
    And I check show explanations checkbox
    Then I see question edit page
    And I see "2 + 2 = ?" in the question field

  Scenario: Copy an edit question URL
    Given a workspace with question
      | question  | answers  |
      | 2 + 2 = ? | 4 (*), 5 |
    When I copy the edit question URL "2 + 2 = ?" from the list
    And I follow the copied URL
    Then I see question edit page

  Scenario: Show edited question in a workspace
    Given a workspace with questions
      | question  | answers  |
      | 2 + 2 = ? | 4 (*), 5 |
      | 3 * 3 = ? | 9 (*), 6 |
    When I edit question "2 + 2 = ?" from the list
    Then I see question edit page
    And I enter question "A + B = ?"
    When I submit the question
    Then I see question in list "A + B = ?"
