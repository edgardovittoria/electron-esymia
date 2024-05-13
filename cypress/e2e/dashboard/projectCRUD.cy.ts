import { staticResponse } from '../staticData/staticData';

describe('Project CRUD', function () {
  beforeEach(function () {
    cy.login(
      Cypress.env('auth0_username'),
      Cypress.env('auth0_password')
    )
    cy.createProject("TestProject", "description")
  })
  it('project creation', function () {
    cy.get('[data-testid="dashboard"]').click()
    cy.get('[data-testid="projectsContainer"').find('#TestProject').should('exist')
  })

  it('project deletion', function () {
    cy.get('[data-testid="dashboard"]').click()
    cy.intercept({
      method: 'POST',
      url: `https://db.fauna.com/`,
    },(req) => {
      if(Object.keys(JSON.parse(req.body)).includes('delete')){
        req.reply(staticResponse)
      }
    }).as('deleteProject')

    cy.get('[data-testid="Projects"]').click()
    cy.get('[data-testid="projectsBox"').children().contains('TestProject').rightclick()
    cy.get('[data-testid="deleteButton"]').click()
    cy.wait('@deleteProject')
    cy.get('[data-testid="projectsBox"').children().should('not.contain', 'TestProject')
  })
})
