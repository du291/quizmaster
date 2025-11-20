Feature: Create question GUI - Show/hide choice explanations
  Show/hide explanation answer fields when toggling "Add explanation to your answer" checkbox

  @skip
  Scenario: Default values
    When I start creating a question
    Then I see add explanation to your answer is unchecked
    And I do not see answer explanation fields
    When I check "Add explanation to your answer" checkbox
    Then explanation fields are visible for answers
