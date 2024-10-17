import {
  mesherOutput, mesherOutputNotValidOnAxis,
  modelS3,
  s3Output,
  solverOutput,
  staticResponse
} from '../staticData/staticData';

describe('Meshing and Solving', function () {
  beforeEach(function () {
    cy.login(
      Cypress.env('auth0_username'),
      Cypress.env('auth0_password')
    )
    cy.get('[data-testid="esymia"').click()
    cy.contains("+ New Project").click()
    cy.createProject("TestProject", "description")
  })
  it('generate mesh', function () {
    cy.generateMesh()
  })

  it('solving', function () {
    cy.intercept('POST', 'http://127.0.0.1:8003/solving', solverOutput)
    cy.intercept('POST', 'http://127.0.0.1:8003/meshing', mesherOutput)
    cy.generateMesh()
    cy.get('[data-tip="Reset canvas focus"]').click()
    cy.get('[data-testid="solverSettings"]').click()
    cy.get('[data-testid="startSimulationButton"]').click()
    cy.wait(5000)
    cy.get('[data-testid="resultsButton"]').should('be.visible')
    cy.get('[data-testid="resultsButton"]').click()
  })
})
