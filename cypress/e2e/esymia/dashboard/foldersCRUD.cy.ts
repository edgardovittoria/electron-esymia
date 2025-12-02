import { staticFolder, staticFolderToMove } from "../../staticData/staticData"

describe('Folders CRUD', function () {
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
    }).as('createFolder')
    cy.login(
      Cypress.env('auth0_username'),
      Cypress.env('auth0_password')
    )
    cy.get('[data-testid="esymia"]').click()
    cy.createFolder("Folder To Test", "411709773404176587")
  })

  it('folder creation', function () {
    cy.get('[data-testid="Folder To Test"]').should('be.visible')
  })
  it('empty folder deletion', function () {
    cy.get('[data-testid="Folder To Test"]').rightclick()
    cy.get('[data-testid="deleteButtonFolder"]').last().click()
    cy.contains("Folder To Test").should('not.exist')
  })
  it('not empty folder deletion', function () {
    cy.get('[data-testid="Folder To Test"]').dblclick()
    cy.createFolder("F1", "411709773404176588")
    cy.contains("New Project").click()
    cy.createProject("TestProject", "description")
    cy.get('[data-testid="dashboard"]').click()
    cy.get('[data-testid="Folder To Test"]').rightclick()
    cy.get('[data-testid="deleteButtonFolder"]').last().click()
    cy.contains("Folder To Test").should('not.exist')
  })
  it('folder move', function () {
    cy.createFolder("Folder To Move", "411709773404176588")
    cy.get('[data-testid="Folder To Move"]').rightclick()
    cy.get('[data-testid="moveMenu"]').trigger('mouseenter')
    cy.get('[data-testid="subItem-Folder To Test"]').click({ force: true })
    cy.get('[data-testid="Folder To Test"]').dblclick()
    cy.contains("Folder To Move").should('exist')
  })
})
