Feature: Show stats

  Scenario: Show empty stats page for quiz
    - Shows empty stats page for brand new created quiz.

    Given a quiz "Quiz" with questions
      | question              | answers         |
      | Jaký nábytek má Ikea? | Stůl (*), Auto  |
      | Jaké nádobí má Ikea?  | Talíř (*), Kolo |
    When I click the stats button for quiz "Quiz"
    And I see stats page for quiz "Quiz"

  Scenario: Show stats page for successfully answered quiz
    Given a quiz "Stats Quiz" with questions
      | question              | answers         |
      | Jaký nábytek má Ikea? | Stůl (*), Auto  |
      | Jaké nádobí má Ikea?  | Talíř (*), Kolo |
    And a I take quiz "Stats Quiz" with answers
      | question              | answers |
      | Jaký nábytek má Ikea? | Stůl    |
      | Jaké nádobí má Ikea?  | Talíř   |
    When I click the stats button for quiz "Stats Quiz"
    Then I see stats page for quiz "Stats Quiz"
    And I see stats table
      | Duration | Score |
      |          |   100 |

  Scenario: Show stats page for unsuccessfully answered quiz
    Given a quiz "Stats Quiz" with questions
      | question              | answers         |
      | Jaký nábytek má Ikea? | Stůl (*), Auto  |
      | Jaké nádobí má Ikea?  | Talíř (*), Kolo |
    And a I take quiz "Stats Quiz" with answers
      | question              | answers |
      | Jaký nábytek má Ikea? | Auto    |
      | Jaké nádobí má Ikea?  | Kolo    |
    When I click the stats button for quiz "Stats Quiz"
    Then I see stats page for quiz "Stats Quiz"
    And I see stats table
      | Duration | Score |
      |          |     0 |
