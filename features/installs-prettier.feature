Feature: Installs prettier
  Scenario: Installing prettier
    When I run prettier-install
    Then I must be told "NPM detected"
    Then I must be told "Installing prettier"
    Then prettier must be installed using "npm install -D prettier"
    Then I must be told "Adding prettier command"
    And prettier script must be added to package.json
    Then I must be told "Running prettier"
    And prettier must run using "npm run prettier"

  Scenario: With yarn available
    Given yarn is present on the system
    When I run prettier-install
    Then I must be told "Yarn detected"
    Then I must be told "Installing prettier"
    Then prettier must be installed using "yarn add --dev prettier"
    Then I must be told "Adding prettier command"
    And prettier script must be added to package.json
    Then I must be told "Running prettier"
    And prettier must run using "yarn prettier"

  Scenario: With git available
    Given the project is git controlled
    When I run prettier-install
    Then I must be told "NPM detected"
    And I must be told "Git detected"
    Then I must be told "Installing prettier"
    Then prettier must be installed using "npm install -D prettier"
    Then I must be told "Adding prettier command"
    And prettier script must be added to package.json
    Then I must be told "Running prettier"
    And prettier must run using "npm run prettier"
    And changes must be committed
