import { addSubFolderToFolderStaticData, staticProjectToMove, staticResponse } from '../staticData/staticData';

describe('Project CRUD', function () {
  beforeEach(function () {
    cy.login(
      Cypress.env('auth0_username'),
      Cypress.env('auth0_password')
    )
  })
  it('project creation', function () {
    cy.get('[data-testid="esymia"').click()
    cy.contains("+ New Project").click()
    cy.createProject("TestProject", "description")
    cy.get('[data-testid="dashboard"]').click()
    cy.get('[data-testid="projectsContainer"').find('#TestProject').should('exist')
  })

  it('project deletion', function () {
    cy.get('[data-testid="esymia"').click()
    cy.contains("+ New Project").click()
    cy.createProject("TestProject", "description")
    cy.get('[data-testid="dashboard"]').click()
    cy.intercept({
      method: 'POST',
      url: `https://db.fauna.com/query/1`,
    },(req) => {
      if(req.body.query.fql[2].includes('delete')){
        req.reply(staticResponse)
      }
    }).as('deleteProject')

    cy.get('[data-testid="Projects"]').last().click()
    cy.get('[data-testid="projectsBox"').children().contains('TestProject').rightclick()
    cy.get('[data-testid="deleteButton"]').last().click()
    cy.wait('@deleteProject')
    cy.get('[data-testid="createProjectButton"]').should('be.visible')
  })

  it('project move', function () {
    cy.get('[data-testid="esymia"').click()
    cy.get('[data-testid="Projects"]').last().click()
    cy.contains("+ New Project").click()
    cy.createProject("TestProject", "description")
    cy.get('[data-testid="dashboard"]').click()
    cy.get('[data-testid="Projects"]').last().click()
    cy.createFolder("Folder", "411709773404176588")
    cy.get('[data-testid="TestProject"]').rightclick()
    cy.intercept({
      method: 'POST',
      url: `https://db.fauna.com/query/1`,
    },(req) => {
      if(req.body.query.fql[2].includes('update')){
        req.reply(staticProjectToMove)
      }
      if(req.body.query.fql[0].includes('add_project_to_folder')){
        req.reply(addSubFolderToFolderStaticData)
      }
    }).as('move')
    cy.get('[data-testid="411709773404176588"]').click({force: true})
    cy.get('[data-testid="Folder"]').dblclick()
    cy.contains("TestProject").should('exist')
  })

})
