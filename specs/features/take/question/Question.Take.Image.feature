Feature: Displaying an image for a question when answering
  Scenario: User sees the question image when answering

   Given a question "Which animal is on the picture? 😺"
    * with answers:
      | Cat   | * |
      | Dog  |   |
      | Mouse |   |
      | Swan   |   |
    * saved and bookmarked as "Animals"

    When I take question "Animals"
    Then I see the image "photo-1529778873920-4da4926a72c2"


  Scenario: User does not see the question image when answering

   Given a question "Which animal is on the picture?"
    * with answers:
      | Cat   | * |
      | Dog  |   |
      | Mouse |   |
      | Swan   |   |
    * saved and bookmarked as "Animals"

    When I take question "Animals"
    Then I do not see the image "photo-1529778873920-4da4926a72c2"
