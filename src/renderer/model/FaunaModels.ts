import { CanvasState, UsersState } from "cad-library"
import { MeshData, Port, Probe, sharingInfoUser, Signal, Simulation } from "./esymiaModels"

export type FaunaProject = {
    id: string,
    project: FaunaProjectDetails
}

export type FaunaProjectDetails = {
    name: string,
    description: string,
    modelS3?: string,
    ports: (Port | Probe)[],
    portKey: number,
    signal: Signal,
    simulation?: Simulation|null,
    meshData: MeshData,
    screenshot: string | undefined,
    owner: UsersState
    sharedWith?: sharingInfoUser[],
    parentFolder: string

}

export type FaunaFolder = {
    id: string,
    folder: FaunaFolderDetails
}

export type FaunaFolderDetails = {
    name: string,
    owner: UsersState,
    sharedWith?: sharingInfoUser[],
    projectList: string[],
    subFolders: string[],
    parent: string,
}