Feature: Installs prettier
  Scenario: Installing prettier
    When I run prettier-install
    Given yarn is not found
    And project is not under git control
    And eslint is not installed
    Then installer must print "NPM detected"
    Then installer must print "Installing prettier"
    And prettier must be installed using "npm"
    When prettier has been installed successfully
    Then installer must print "Adding prettier script"
    And prettier script must be added with arguments "**/*.js"
    When prettier script is added successfully
    Then installer must print "Running prettier"
    And prettier script must be executed
    When prettier script has finished successfully
    Then installer must finish

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
    And eslint is not installed
    Then installer must print "NPM detected"
    Then installer must print "Installing prettier"
    And prettier must be installed using "npm"
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
    When prettier script has finished successfully
    Then installer must finish

  @yarn
  Scenario: Installing prettier with Yarn
    When I run prettier-install
    Given yarn is found
    And project is not under git control
    And eslint is not installed
    Then installer must print "Yarn detected"
    Then installer must print "Installing prettier"
    And prettier must be installed using "yarn"
    When prettier has been installed successfully
    Then installer must print "Adding prettier script"
    And prettier script must be added with arguments "**/*.js"
    When prettier script is added successfully
    Then installer must print "Running prettier"
    And prettier script must be executed
    When prettier script has finished successfully
    Then installer must finish

  @git
  Scenario: Saving changes to Git
    When I run prettier-install
    Given yarn is not found
    And project is under git control
    And eslint is not installed
    And there are no uncommitted changes
    Then installer must print "NPM detected"
    Then installer must print "Installing prettier"
    And prettier must be installed using "npm"
    When prettier has been installed successfully
    Then installer must print "Adding prettier script"
    And prettier script must be added with arguments "**/*.js"
    When prettier script is added successfully
    Then installer must print "Running prettier"
    When prettier script has finished successfully
    And prettier script must be executed
    And installer must print "Committing changes"
    And changes must be committed
    When git finished successfully
    Then installer must finish

  @git @warning
  Scenario: Uncommitted changes warning
    When I run prettier-install
    Given yarn is not found
    Then installer must print "NPM detected"
    Given project is under git control
    Then installer must print "Git detected"
    And eslint is not installed
    And there are uncommited changes
    Then installer must ask:
      """
      Working tree contains uncommitted changes. Proceed anyway?
      """
    When I answer "y"
    Then installer must print "Installing prettier"
    And prettier must be installed using "npm"
    When prettier has been installed successfully
    Then installer must print "Adding prettier script"
    And prettier script must be added with arguments "**/*.js"
    When prettier script is added successfully
    Then installer must print "Running prettier"
    When prettier script has finished successfully
    And prettier script must be executed
    And installer must print "Committing changes"
    And changes must be committed
    When git finished successfully
    Then installer must finish

  Scenario: Uncommitted changes error
    When I run prettier-install
    Given yarn is not found
    And project is under git control
    And eslint is not installed
    And there are uncommited changes
    Then installer must ask:
      """
      Working tree contains uncommitted changes. Proceed anyway?
      """
    When I answer "n"
    Then installer must print "Aborting"
    Then installer must exit

  @eslint
  Scenario: Eslint integration
    When I run prettier-install
    Given yarn is not found
    And project is not under git control
    And eslint is installed
    Then installer must print "NPM detected"
    Then installer must print "Installing prettier"
    And prettier must be installed using "npm"
    When prettier has been installed successfully
    Then installer must print "Adding prettier script"
    And prettier script must be added with arguments "**/*.js"
    When prettier script is added successfully
    Then eslint extras must be installed
    When eslint extras were successfuly installed
    Then installer must print "Running prettier"
    And prettier script must be executed
    When prettier script has finished successfully
    And installer must finish
