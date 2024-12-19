import { CanvasState, UsersState } from "../../cad_library"
import { MeshData, Port, Probe, sharingInfoUser, Signal, Simulation } from "./esymiaModels"

export type FaunaProject = {
    id: string,
    project: FaunaProjectDetails
}

export type FaunaProjectDetails = {
    name: string,
    description: string,
    storage: 'local' | 'online',
    model: string,
    modelS3?: string,
    bricks?: string,
    portsS3?: string,
    frequencies?: number[]
    simulation?: Simulation|null,
    meshData: MeshData,
    screenshot: string | undefined,
    owner: UsersState
    sharedWith?: sharingInfoUser[],
    shared?: boolean,
    parentFolder: string,
    boundingBoxDimension?: number,
    suggestedQuantum?: [number, number, number]
    scatteringValue?: number,
    modelUnit: string
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

export type FaunaUserSessionInfo = {
  id: string,
  userSessionInfo: UserSessionInfo
}

export type UserSessionInfo = {
  email: string,
  mac: string,
  logged: boolean
}
