Feature: Installs prettier
  Scenario: Installing prettier
    When I run prettier-install
    Then prettier must be installed using "npm install -D prettier"
    And prettier must run using "npm run prettier"

  Scenario: With yarn available
    Given yarn is present on the system
    When I run prettier-install
    Then prettier must be installed using "yarn add --dev prettier"
    And prettier must run using "yarn prettier"

  Scenario: With git available
    Given the project is git controlled
    When I run prettier-install
    Then prettier must be installed using "npm install -D prettier"
    And prettier must run using "npm run prettier"
    And changes must be committed
