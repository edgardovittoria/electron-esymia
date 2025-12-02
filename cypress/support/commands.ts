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

import { mesherOutput, modelFromS3, project1, staticModels } from '../e2e/staticData/staticData';


function loginViaAuth0Ui(username: string, password: string) {
  // App landing page redirects to Auth0.
  cy.visit("http://localhost:1212")
  cy.contains("Login").click()


  //Login on Auth0.
  cy.origin(
    Cypress.env('auth0_domain') + "/u/login",
    { args: { username, password } },
    ({ username, password }) => {
      cy.get('input[name="username"]').type(username)
      cy.contains('Continue').click()
      cy.get('input[name="password"]').type(password, { log: false })
      cy.contains('Continue').click()
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
    url: `https://dynamodb.eu-north-1.amazonaws.com/`,
  }, (req) => {
    req.reply(project1)
  }).as('createProject')
  cy.get('[data-testid="projectName"').type(name)
  cy.get('[data-testid="projectDescription"').type(description)
  cy.get('[data-testid="createNewProjectModal"').find('button').contains("CREATE", { matchCase: false }).click()
  cy.wait('@createProject')
}

Cypress.Commands.add('createProject', (name: string, description: string) => {
  createProject(name, description)
})

function createFolder(name: string, id: string) {
  cy.contains("New Folder").click()
  cy.get('[data-testid="folderName"]').type(name)
  cy.get('[data-testid="createNewFolderModal"]').find('button').contains("CREATE", { matchCase: false }).click()
}

Cypress.Commands.add('createFolder', (name: string, id: string) => {
  createFolder(name, id)
})

function generateMesh() {
  cy.intercept('POST', 'http://localhost:8002/quantumAdvice', { quantum: [2, 2, 1], id: project1.id })
  cy.intercept('POST', 'http://localhost:8002/meshing', mesherOutput)
  cy.intercept('POST', `https://cadmia-bucket.s3.eu-north-1.amazonaws.com/`, { statusCode: 204 })
  cy.intercept('GET', `https://cadmia-bucket.s3.eu-north-1.amazonaws.com/kjJ1gPszvch3LefSqASYZs.json
`, modelFromS3)
  cy.intercept({
    method: 'POST',
    url: `https://dynamodb.eu-north-1.amazonaws.com/`,
  }, (req) => {
    //console.log(req)
    req.reply(staticModels)
  })

  cy.contains("import from db", { matchCase: false }).click()
  cy.get('[data-testid="modelChoose"]').eq(1).click()
  cy.get('button').contains('Load').click()
  // cy.get('[data-testid="Terminations"]').click()

  // cy.get('[data-testid="addPort"]').click()
  // cy.get('[data-testid="port"]').click()
  // cy.get('[data-testid="terminationSettings"]').click()
  // cy.get('#inputPositionX').clear().type("0")
  // cy.get('#inputPositionY').clear().type("2")
  // cy.get('#inputPositionZ').clear().type("1")
  // cy.get('#outputPositionX').clear().type("0")
  // cy.get('#outputPositionY').clear().type("10")
  // cy.get('#outputPositionZ').clear().type("1")
  // cy.get('[data-testid="scattering"]').clear().type("50")

  // cy.get('[data-testid="frequenciesSettings"]').click()
  // cy.get('[data-testid="fmin"]').clear().type('1e2')
  // cy.get('[data-testid="fmax"]').clear().type('1e8')
  // cy.get('[data-testid="fnum"]').clear().type('10')
  // cy.get('[data-testid="generateFrequencies"]').click()
  //cy.get('[data-testid="savePhysics"]').click()
  cy.get('[data-testid="Mesher"]').click()
  cy.get('[data-testid="maxFrequencyInput"]').clear().type("1e8")
  cy.get('[data-testid="setMaxFrequencyButton"]').click()
  cy.get('[data-testid="generateMeshButton"]').should('not.be.disabled')
  cy.get('[data-testid="generateMeshButton"]').click()
  cy.wait(5000)
  // 
  // cy.get('[data-testid="coarsenButton"]').should('be.visible')
}

Cypress.Commands.add('generateMesh', () => {
  generateMesh()
})

