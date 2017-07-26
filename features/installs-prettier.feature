Feature: Installs prettier
  Scenario: Installing prettier
    When I run prettier-install
    Then I must be told "NPM detected"
    Then prettier must be installed using "npm install -D prettier"
    And prettier script must be added to package.json
    And prettier must run using "npm run prettier"

  Scenario: With yarn available
    Given yarn is present on the system
    When I run prettier-install
    Then I must be told "Yarn detected"
    Then prettier must be installed using "yarn add --dev prettier"
    And prettier script must be added to package.json
    And prettier must run using "yarn prettier"

  Scenario: With git available
    Given the project is git controlled
    When I run prettier-install
    Then I must be told "NPM detected"
    Then prettier must be installed using "npm install -D prettier"
    And prettier script must be added to package.json
    And prettier must run using "npm run prettier"
    And changes must be committed
