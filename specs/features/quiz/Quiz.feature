Feature: Take a quiz

  Background:
    Given questions
      | bookmark | question                            | answers                                            |
      | Sky      | What is the standard colour of sky? | Red, Blue (*), Green, Black                        |
      | France   | What is capital of France?          | Marseille, Lyon, Paris (*), Toulouse               |
      | Nose     | Which animal has long nose?         | Elephant (*), Anteater (*), Swordfish (*), Bulldog |

    Given quizes
      | bookmark | title  | description   | questions     | mode  | pass score | time limit |
      | -1       | Quiz A | Description A | Sky,France    | exam  | 85         | 120        |
      | -3       | Quiz B | Description B | Nose,France   | exam  | 40         | 120        |

    # Given a quiz containing questions "Sky" and "France"
  Scenario: Quiz question is not answered and the next button is clicked
    Given I start quiz "-1"
    When I click the next button
    Then I see question "France"
    And I see bookmark to previous question "Sky"
    And I see bookmark link "Sky"

  Scenario: User proceed to last question
    Given I start quiz "-1"
    When I answer "Green"
    Then I see question "France"
    Then I should not see the evaluate button
    When I answer "Lyon"
    Then I should see the evaluate button
    Then I should not see the next button

  Scenario: User navigate to evaluation page
    Given I start quiz "-1"
    When I answer "Green"
    Then I see question "France"
    Then I should not see the evaluate button
    When I answer "Lyon"
    Then I click the evaluate button

  Scenario: User reloads page on answered question
    Given I start quiz "-1"
    When I answer "Green"
    * I check answer "Lyon,Paris"
    * I uncheck answer "Lyon"
    * I refresh the page
    Then no answer is selected

  Scenario: Back button is not visible on the quiz page
    Given I start quiz "-1"
    Then I should not see the back button

  Scenario: Back button is visible
    Given I start quiz "-1"
    When I answer "Green"
    Then I should see the back button

  Scenario: Back button is clicked
    Given I start quiz "-1"
    When I answer "Green"
    Then I see question "France"
    And I click the back button
    Then I see question "Sky"

  Scenario: Last question is not answered and there are any skipped questions
    Given I start quiz "-1"
    When I click the next button
    Then I see question "France"
    Then I should not see the evaluate button
    Then I should see the next button

  Scenario: Last question is answered and there are any skipped questions
    Given I start quiz "-1"
    When I click the next button
    Then I see question "France"
    When I answer "Paris"
    Then I should not see the evaluate button
    Then I should see the next button

  Scenario: Last question is answered and show skipped question
    Given I start quiz "-1"
    When I click the next button
    Then I see question "France"
    When I answer "Paris"
    Then I should not see the evaluate button
    Then I should see the next button
    When I click the next button
    Then I see question "Sky"

  Scenario: Last question is skipped and there are any skipped questions
    Given I start quiz "-1"
    When I click the next button
    Then I see question "France"
    Then I should see the next button
    When I click the next button
    Then I see question "Sky"

  Scenario: Do not show skipped question which was submited
    Given I start quiz "-1"
    When I click the next button
    Then I see question "France"
    When I answer "Paris"
    Then I should not see the evaluate button
    Then I should see the next button
    When I click the next button
    Then I see question "Sky"
    When I answer "Blue"
    Then I should see the evaluate button

  Scenario: Remembered answer after back button
    Given I start quiz "-1"
    When I answer "Green"
    Then I see question "France"
    When I click the back button
    Then I see answer "Green" checked

  Scenario: Remembered multiple choices after back button
    Given questions
      | Bookmark | Question                    | Answers                                            |
      | Nose     | Which animal has long nose? | Elephant (*), Anteater (*), Swordfish (*), Bulldog |
      | France   | What is capital of France?  | Marseille, Lyon, Paris (*), Toulouse               |

    And I start quiz "-3"
    Then I see question "Nose"
    When I answer "Elephant, Anteater"

    Then I see question "France"
    When I click the back button
    Then I see answer "Elephant" checked
    Then I see answer "Anteater" checked

  Scenario: Submit button is visible as active when answer is checked
    Given questions
      | bookmark | question                    | answers                                            |
      | Nose     | Which animal has long nose? | Elephant (*), Anteater (*), Swordfish (*), Bulldog |
      | France   | What is capital of France?  | Marseille, Lyon, Paris (*), Toulouse               |

    Given I start quiz "-3"
    Then I see question "Nose"
    When I check answer "Elephant"
    Then I see the submit button as active

Scenario: Submit button is visible as inactive when no answer is checked
  Given questions
    | bookmark | question                            | answers                                            |
    | Nose     | Which animal has long nose?         | Elephant (*), Anteater (*), Swordfish (*), Bulldog |
    | France   | What is capital of France?          | Marseille, Lyon, Paris (*), Toulouse               |

    Given I start quiz "-3"
    Then I see question "Nose"
    Then I see the submit button as inactive
    When I check answer "Elephant"
    Then I see the submit button as active
    When I uncheck answer "Elephant"
    Then I see the submit button as inactive


  Scenario: When I click next button answer is submitted
    Given questions
      | bookmark | question                            | answers                                            |
      | Nose     | Which animal has long nose?         | Elephant (*), Anteater (*), Swordfish (*), Bulldog |
      | France   | What is capital of France?          | Marseille, Lyon, Paris (*), Toulouse               |

    Given I start quiz "-3"
    Then I see question "Nose"
    When I check answer "Elephant"
    And I click the next button
    Then I see question "France"
    When I click the back button
    Then I see answer "Elephant" checked
@skip
Scenario: When I click back button answer is submitted
    Given questions
      | bookmark | question                            | answers                                            |
      | Nose     | Which animal has long nose?         | Elephant (*), Anteater (*), Swordfish (*), Bulldog |
      | France   | What is capital of France?          | Marseille, Lyon, Paris (*), Toulouse               |
      | Madagascar      | What is capital of Madagascar?      | Antananarivo (*), Nairobi, Cairo, Dakar            |

    Given I start quiz "-3"
    Then I see question "Nose"
    And I click the next button
    Then I see question "France"
    And I check answer "Paris"
    When I click the next button
    Then I see question "Madagascar"
    When I click the back button
    Then I see answer "Paris" checked
