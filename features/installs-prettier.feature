Feature: Installs prettier
  Scenario: Installing prettier
    When I run prettier-install
    Given yarn is not found
    And project is not under git control
    Then installer must print "NPM detected"
    Then installer must print "Installing prettier"
    And prettier must be installed with "npm install -D prettier"
    When prettier has been installed successfully
    Then installer must print "Adding prettier script"
    And prettier script must be added with arguments "**/*.js"
    When prettier script is added successfully
    Then installer must print "Running prettier"
    And prettier script must be executed

  @options
  Scenario: Specifying custom prettier options
    When I run prettier-install with arguments:
      """
      --print-width 120
      --tab-width 8
      --use-tabs
      --no-semi
      --single-quote
      --trailing-comma es5
      --no-bracket-spacing
      --jsx-bracket-same-line
      """
    Given yarn is not found
    And project is not under git control
    Then installer must print "NPM detected"
    Then installer must print "Installing prettier"
    And prettier must be installed with "npm install -D prettier"
    When prettier has been installed successfully
    Then installer must print "Adding prettier script"
    And prettier script must be added with arguments:
      """
      --print-width 120
      --tab-width 8
      --use-tabs
      --no-semi
      --single-quote
      --trailing-comma es5
      --no-bracket-spacing
      --jsx-bracket-same-line
      **/*.js
      """
    When prettier script is added successfully
    Then prettier script must be executed

  @yarn
  Scenario: Installing prettier with Yarn
    When I run prettier-install
    Given yarn is found
    And project is not under git control
    Then installer must print "Yarn detected"
    Then installer must print "Installing prettier"
    And prettier must be installed with "yarn add --dev prettier"
    When prettier has been installed successfully
    Then installer must print "Adding prettier script"
    And prettier script must be added with arguments "**/*.js"
    When prettier script is added successfully
    Then installer must print "Running prettier"
    And prettier script must be executed

  @git
  Scenario: Saving changes to Git
    When I run prettier-install
    Given yarn is not found
    And project is under git control
    Then installer must print "NPM detected"
    Then installer must print "Installing prettier"
    And prettier must be installed with "npm install -D prettier"
    When prettier has been installed successfully
    Then installer must print "Adding prettier script"
    And prettier script must be added with arguments "**/*.js"
    When prettier script is added successfully
    Then installer must print "Running prettier"
    When prettier script has finished successfully
    And prettier script must be executed
    And installer must print "Committing changes"
    And changes must be committed
