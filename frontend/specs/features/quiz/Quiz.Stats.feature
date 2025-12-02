Feature: Show stats

Background:
    Given a workspace with questions
      | question                       | answers            |
      | Jaký nábytek má Ikea?          | Stůl (*), Auto     |
      | Jaké nádobí má Ikea?           | Talíř (*), Kolo    |

  Scenario: Show empty stats page for quiz
    - Shows empty stats page for brand new created quiz.

    When I start creating a new quiz
    And I enter quiz name "Stats Quiz"
    And I select feedback mode "EXAM"
    And I select question "Jaký nábytek má Ikea?"
    And I select question "Jaké nádobí má Ikea?"
    And I submit the quiz
    Then I see the quiz "Stats Quiz" in the workspace
    And I click the stats button "Stats Quiz"
