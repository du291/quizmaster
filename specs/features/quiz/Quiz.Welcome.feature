Feature: Quiz Welcome page

  Scenario Outline: Quiz welcome page
    Given quizes
      | bookmark | title  | description   | questions | mode  | pass score | time limit |
      | A        | Quiz A | Description A | 3         | exam  | 66         | 120        |
      | B        | Quiz B | Description B | 4         | learn | 75         | 60         |
    When I open quiz "<quiz>"
    Then I see the welcome page
    * I see quiz name "<name>"
    * I see quiz description "<description>"
    * I see question count <count>
    * I see time limit set to <time limit> seconds
    * I see pass score <score> %
    * I see feedback type "<mode>"

    Examples:
      | quiz | name   | description   | count | score | mode                | time limit |
      | A    | Quiz A | Description A | 3     | 66    | Feedback at the end | 120        |
      | B    | Quiz B | Description B | 4     | 75    | Continuous feedback | 60         |
