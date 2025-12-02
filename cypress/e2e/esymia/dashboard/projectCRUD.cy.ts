import { addSubFolderToFolderStaticData, staticFolder, staticFolderToMove, staticProjectToMove, staticResponse } from '../../staticData/staticData';

describe('Project CRUD', function () {
  beforeEach(function () {
    cy.intercept({
      method: 'POST',
      url: `https://dynamodb.eu-north-1.amazonaws.com/`,
    }, (req) => {
      console.log(req)
      if (req.body.IndexName === "FoldersByUserEmail") {
        req.reply([])
      }
      if (req.body.IndexName === "ProjectsByOwnerEmail") {
        req.reply([])
      }
      if (req.body.Item && req.body.Item.name.S === "Folder To Move") {
        req.reply(staticFolderToMove())
      }
      if (req.body.Item && req.body.Item.name.S === "Folder To Test") {
        req.reply(staticFolder())
      }
    }).as('createProject')
    cy.login(
      Cypress.env('auth0_username'),
      Cypress.env('auth0_password')
    )
  })
  it('project creation', function () {
    cy.get('[data-testid="esymia"').click()
    cy.contains("New Project").click()
    cy.createProject("TestProject", "description")
    cy.get('[data-testid="dashboard"]').click()
    cy.contains("TestProject").should('exist')
  })

  it('project deletion', function () {
    cy.get('[data-testid="esymia"').click()
    cy.contains("New Project").click()
    cy.createProject("TestProject", "description")
    cy.get('[data-testid="dashboard"]').click()
    cy.get('[data-testid="projectsBox"').children().contains('TestProject').rightclick()
    cy.get('[data-testid="deleteButton"]').last().click()
    cy.get('[data-testid="createProjectButton"]').should('be.visible')
  })

  it('project move', function () {
    cy.get('[data-testid="esymia"').click()
    cy.contains("New Project").click()
    cy.createProject("TestProject", "description")
    cy.get('[data-testid="dashboard"]').click()
    cy.createFolder("Folder", "411709773404176588")
    cy.get('[data-testid="TestProject"]').rightclick()
    cy.get('[data-testid="subItem-Folder"]').click({ force: true })
    cy.get('[data-testid="Folder"]').dblclick()
    cy.contains("TestProject").should('exist')
  })

})
