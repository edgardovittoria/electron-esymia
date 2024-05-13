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
    cy.createProject("TestProject", "description")

  })
  it('generate meshing', function () {
    cy.intercept('POST', 'http://127.0.0.1:8003/meshing', mesherOutput)
    cy.generateMesh([0.8, 0.6, 0.666])
    cy.get('[data-tip="Reset canvas focus"]').click()
    cy.get('[data-testid="numberOfBricks"]').should('have.text', 1138)
  })

  it('meshing failure due to wrong quantum on x', function () {
    cy.intercept('POST', 'http://127.0.0.1:8003/meshing', mesherOutputNotValidOnAxis('x'))
    cy.generateMesh([4, 0.6, 0.666])
    cy.get('[data-testid="alert"]').should('be.visible')
    cy.get('[data-testid="alertMessage"]').should('have.text', 'Error! Mesh not valid. Please adjust quantum along x axis.')
  })

  it.skip('meshing failure due to wrong quantum on y', function () {
    cy.intercept('POST', 'http://127.0.0.1:8003/meshing', mesherOutputNotValidOnAxis('y'))
    cy.generateMesh([0.8, 6, 0.666])
    cy.get('[data-testid="alert"]').should('be.visible')
    cy.get('[data-testid="alertMessage"]').should('have.text', 'Error! Mesh not valid. Please adjust quantum along y axis.')
  })

  it.skip('meshing failure due to wrong quantum on x', function () {
    cy.intercept('POST', 'http://127.0.0.1:8003/meshing', mesherOutputNotValidOnAxis('z'))
    cy.get('[data-testid="alert"]').should('be.visible')
    cy.get('[data-testid="alertMessage"]').should('have.text', 'Error! Mesh not valid. Please adjust quantum along z axis.')
  })

  it('solving failure due to solver not ready', function () {
    //cy.intercept('POST', 'http://127.0.0.1:8003/solving', solverOutput)
    cy.intercept('POST', 'http://127.0.0.1:8003/meshing', mesherOutput)
    cy.generateMesh([0.8, 0.6, 0.666])
    cy.get('[data-tip="Reset canvas focus"]').click()
    cy.get('[data-testid="startSimulationButton"]').click()
    cy.get('[data-testid="alert"]').should('be.visible')
    cy.get('[data-testid="alertMessage"]').should('have.text', "Error while solving, please start solver on plugins section and try again")
  })
  it.only('solving', function () {
    cy.intercept('POST', 'http://127.0.0.1:8003/solving', solverOutput)
    cy.intercept('POST', 'http://127.0.0.1:8003/meshing', mesherOutput)
    cy.generateMesh([0.8, 0.6, 0.666])
    cy.get('[data-tip="Reset canvas focus"]').click()
    //cy.get('[data-testid="startSimulationButton"]').click()
    /* const request = { type: 'request', payload: 'PING' }
    const response = { type: 'response', payload: 'PONG'}
    cy.mockWebSocket('ws://cypress-websocket/ws') */

  })
})
