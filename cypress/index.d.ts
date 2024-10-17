declare namespace Cypress {
  interface Chainable {
    login(username: string, password:string),
    createProject(name: string, description: string),
    createFolder(name:string, id:string),
    generateMesh()
  }
}
