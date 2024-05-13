/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
// @ts-ignore

import { modelS3, s3Output, staticResponse } from '../e2e/staticData/staticData';
import 'cypress-mock-websocket-plugin';


function loginViaAuth0Ui(username: string, password: string) {
  // App landing page redirects to Auth0.
  cy.visit("http://localhost:1212")
  cy.contains("Login").click()


  // Login on Auth0.
  cy.origin(
    Cypress.env('auth0_domain')+"/u/login",
    { args: { username, password } },
    ({ username, password }) => {
      cy.get('input#username').type(username)
      cy.get('input#password').type(password, { log: false })
      cy.contains('button[value=default]', 'Continue').click()
    }
  )

  // Ensure Auth0 has redirected us back to the RWA.
  cy.url().should('equal', 'http://localhost:1212/')
}

Cypress.Commands.add('login', (username: string, password: string) => {
  const log = Cypress.log({
    displayName: 'AUTH0 LOGIN',
    message: [`🔐 Authenticating | ${username}`],
    // @ts-ignore
    autoEnd: false,
  })
  log.snapshot('before')

  loginViaAuth0Ui(username, password)

  log.snapshot('after')
  log.end()
})

function createProject(name: string, description: string) {
  cy.intercept({
    method: 'POST',
    url: `https://db.fauna.com/`,
  },(req) => {
    if(Object.keys(JSON.parse(req.body)).includes('create')){
      req.reply(staticResponse)
    }
  }).as('createProject')

  cy.contains("+ New Project").click()
  cy.get('[data-testid="projectName"').type(name)
  cy.get('[data-testid="projectDescription"').type(description)
  cy.get('[data-testid="createNewProjectModal"').find('button').contains("CREATE", {matchCase: false}).click()
  cy.wait('@createProject')
}

Cypress.Commands.add('createProject', (name: string, description: string) => {
  createProject(name, description)
})

function generateMesh(quantum: [number, number, number]){
  cy.intercept('POST', 'http://127.0.0.1:8003/meshingAdvice', [2, 2, 1])
  cy.intercept('POST', 'https://models-bucket-49718971291.s3.amazonaws.com/', {statusCode: 204})
  cy.intercept('GET', 'https://models-bucket-49718971291.s3.amazonaws.com/*.json', s3Output)
  cy.intercept('GET', 'https://models-bucket-49718971291.s3.amazonaws.com/vZVvPynHi2oB36dKk4PWma.json', modelS3)
  cy.intercept({
    method: 'POST',
    url: `https://db.fauna.com/`,
  },(req) => {
    if(Object.keys(JSON.parse(req.body)).includes('update')){
      req.reply(staticResponse)
    }
  })

  cy.contains("import from db", {matchCase: false}).click()
  cy.get('input[type="radio"]').click()
  cy.get('button').contains('Load').click()
  cy.get('[data-testid="Physics"]').click()

  cy.get('[data-testid="addPort"]').click()
  cy.get('[data-testid="port"]').click()
  cy.get('#inputPositionX').clear().type("0")
  cy.get('#inputPositionY').clear().type("2")
  cy.get('#inputPositionZ').clear().type("1")
  cy.get('#outputPositionX').clear().type("0")
  cy.get('#outputPositionY').clear().type("10")
  cy.get('#outputPositionZ').clear().type("1")
  cy.get('[data-testid="scattering"]').clear().type("50")

  cy.get('[data-testid="Frequencies"]').click()
  cy.get('[data-testid="fmin"]').clear().type('1e2')
  cy.get('[data-testid="fmax"]').clear().type('1e8')
  cy.get('[data-testid="fnum"]').clear().type('10')
  cy.get('[data-testid="generateFrequencies"]').click()
  //cy.get('[data-testid="savePhysics"]').click()
  cy.get('[data-testid="Simulator"]').click()
  cy.get('[data-testid="quantumInput0"]').clear().type(quantum[0].toString())
  cy.get('[data-testid="quantumInput1"]').clear().type(quantum[1].toString())
  cy.get('[data-testid="quantumInput2"]').clear().type(quantum[2].toString())
  cy.get('[data-testid="generateMeshButton"]').should('not.be.disabled')
  cy.get('[data-testid="generateMeshButton"]').click()
}

Cypress.Commands.add('generateMesh', (quantum) => {
  generateMesh(quantum)
})
