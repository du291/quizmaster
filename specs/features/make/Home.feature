Feature: Home Page Links

  Scenario: Validate home page has correct navigation links
    Given I am on the home page
    Then I should see a link to create a new question
    And I should see a link to create a new workspace

  Scenario: Validate home cube rotates on click
    Given I am on the home page
    Then the home cube should change rotation on 3 clicks
