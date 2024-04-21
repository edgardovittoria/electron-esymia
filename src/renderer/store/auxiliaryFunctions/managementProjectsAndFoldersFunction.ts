import { Folder, Project } from "../../model/esymiaModels";
import { folderByID, ProjectState } from "../projectSlice";

export const removeProjectFromStore = (state: ProjectState, projectToRemove: string) => {
    let selectedFolder = folderByID(state, state.selectedFolder)
    if (selectedFolder){
        selectedFolder.projectList = selectedFolder.projectList.filter(p => p.faunaDocumentId !== projectToRemove)
    }
}

export const removeFolderFromStore = (state: ProjectState, folderToRemove: Folder) => {
    let parentFolder = folderByID(state, folderToRemove.parent)
    if (parentFolder){
        parentFolder.subFolders = parentFolder.subFolders.filter(f => f.faunaDocumentId !== folderToRemove.faunaDocumentId)
    }
}

export const recursiveFindFolders = (folder: Folder, allFolders: Folder[]): Folder[] => {
    allFolders.push(folder)
    folder.subFolders.forEach(sb => recursiveFindFolders(sb, allFolders))
    return allFolders
}

export const takeAllProjectsIn = (folder: Folder): Project[] => {
    return folder.subFolders.reduce((projects, subF) => projects.concat(takeAllProjectsIn(subF)), folder.projectList)
}

export const takeAllProjectsInArrayOf = (folders: Folder[]): Project[] => {
  let projs: Project[] = []
  folders.forEach(folder => {
    let projectsList = folder.subFolders.reduce((projects, subF) => projects.concat(takeAllProjectsIn(subF)), folder.projectList)
    projs.push(...projectsList)
  })
  return projs
 }

