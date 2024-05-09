const staticResponse = {
  statusCode: 201,
  body: {
    "resource": {
      "ref": {
        "@ref": {
          "id": "397390190629356097",
          "collection": {
            "@ref": {
              "id": "SimulationProjects",
              "collection": {
                "@ref": {
                  "id": "collections"
                }
              }
            }
          }
        }
      },
      "ts": 1715239668400000,
      "data": {
        "name": "Test Project",
        "description": "Test Project Descriprion",
        "model": {},
        "ports": [],
        "portKey": 0,
        "meshData": {
          "meshApproved": false,
          "meshGenerated": "Not Generated",
          "quantum": [
            0,
            0,
            0
          ]
        },
        "owner": {
          "email": "edgardo.vittoria.teema@gmail.com",
          "userName": "edgardo.vittoria.teema",
          "userRole": "Premium"
        },
        "sharedWith": [],
        "parentFolder": "root"
      }
    }
  }
}
describe('Project CRUD', function () {
  beforeEach(function () {
    cy.login(
      Cypress.env('auth0_username'),
      Cypress.env('auth0_password')
    )
    cy.intercept({
      method: 'POST',
      url: `https://db.fauna.com/`,
    },(req) => {
      if(Object.keys(JSON.parse(req.body)).includes('create')){
        req.reply(staticResponse)
      }
    }).as('createProject')

    cy.contains("+ New Project").click()
    cy.get('[data-testid="projectName"').type("TestProject")
    cy.get('[data-testid="projectDescription"').type("Test Project Description")
    cy.get('[data-testid="createNewProjectModal"').find('button').contains("CREATE", {matchCase: false}).click()
    cy.wait('@createProject')
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
