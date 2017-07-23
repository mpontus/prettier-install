Feature: Installs prettier
  Scenario: Installing prettier
    When I run prettier-install
    Then prettier must be installed
