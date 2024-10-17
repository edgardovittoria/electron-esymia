import { addSubFolderToFolderStaticData, staticFolder, staticFolders, staticFolderToMove, staticFolderWithProjectInProjectList, staticProjects, staticProjectsOfSubfolders, staticProjectsOfSubfoldersFull, staticSubFolders, staticSubFoldersFull } from "../staticData/staticData"

describe('Folders CRUD', function () {
  beforeEach(function () {
    cy.login(
      Cypress.env('auth0_username'),
      Cypress.env('auth0_password')
    )
    cy.get('[data-testid="esymia"]').click()
    cy.get('[data-testid="Projects"]').last().click()
    cy.createFolder("Folder To Test", "411709773404176587")
  })

  it('folder creation', function () {
    cy.get('[data-testid="Folder To Test"]').should('be.visible')
  })
  it('empty folder deletion', function () {
    cy.intercept({
      method: 'POST',
      url: `https://db.fauna.com/query/1`,
    },(req) => {
      if(req.body.query.fql[0].includes('get_all_subfolders_of_folder')){
        req.reply(staticSubFolders)
      }
    }).as("getAllSubFolders")
    cy.intercept({
      method: 'POST',
      url: `https://db.fauna.com/query/1`,
    },(req) => {
      if(req.body.query.fql[0].includes('get_all_projects_recursively_of_folder')){
        req.reply(staticProjectsOfSubfolders)
      }
    }).as("getAllProjectsRecursively")
    cy.intercept({
      method: 'POST',
      url: `https://db.fauna.com/query/1`,
    },(req) => {
      if(req.body.query.fql[2].includes('delete')){
        req.reply(staticFolder("Folder", "411709773404176587"))
      }
    }).as('deleteFolder')
    cy.get('[data-testid="Folder To Test"]').rightclick()
    cy.get('[data-testid="deleteButtonFolder"]').last().click()
    cy.wait('@deleteFolder')
    cy.contains("Folder To Test").should('not.exist')
    //cy.get('[data-testid="createProjectButton"]').should('be.visible')
  })
  it('not empty folder deletion', function () {
    cy.intercept({
      method: 'POST',
      url: `https://db.fauna.com/query/1`,
    },(req) => {
      if(req.body.query.fql[0].includes('get_all_subfolders_of_folder')){
        req.reply(staticSubFoldersFull)
      }
    }).as("getAllSubFolders")
    cy.intercept({
      method: 'POST',
      url: `https://db.fauna.com/query/1`,
    },(req) => {
      if(req.body.query.fql[0].includes('get_all_projects_recursively_of_folder')){
        req.reply(staticProjectsOfSubfoldersFull)
      }
    }).as("getAllProjectsRecursively")
    cy.intercept({
      method: 'POST',
      url: `https://db.fauna.com/query/1`,
    },(req) => {
      if(req.body.query.fql[2].includes('delete')){
        req.reply(staticFolder("Folder", "411709773404176587"))
      }
    }).as('deleteFolder')
    cy.intercept({
        method: 'POST',
        url: `https://db.fauna.com/query/1`,
    },(req) => {
        if(req.body.query.fql[2].includes('update')){
          req.reply(staticFolderWithProjectInProjectList())
        }
    }).as("getAllSubFolders")
    cy.get('[data-testid="Folder To Test"]').dblclick()
    cy.createFolder("F1", "411709773404176588")
    cy.contains("+ New Project").click()
    cy.createProject("TestProject", "description")
    cy.get('[data-testid="dashboard"]').click()
    cy.get('[data-testid="Projects"]').last().click()
    cy.get('[data-testid="Folder To Test"]').rightclick()
    cy.get('[data-testid="deleteButtonFolder"]').last().click()
    cy.wait('@deleteFolder')
    cy.contains("Folder To Test").should('not.exist')
  })
  it('folder move', function () {
    cy.createFolder("Folder To Move", "411709773404176588")
    cy.intercept({
      method: 'POST',
      url: `https://db.fauna.com/query/1`,
    },(req) => {
      if(req.body.query.fql[2].includes('update')){
        req.reply(staticFolderToMove())
      }
      if(req.body.query.fql[0].includes('add_subfolder_to_folder')){
        req.reply(addSubFolderToFolderStaticData)
      }
    }).as('move')
    cy.get('[data-testid="Folder To Move"]').rightclick()
    cy.get('[data-testid="411709773404176587"]').click({force: true})
    cy.get('[data-testid="Folder To Test"]').dblclick()
    cy.contains("Folder To Move").should('exist')
  })
})
