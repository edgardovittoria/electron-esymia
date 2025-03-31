import { CanvasState, UsersState } from "../../cad_library"
import { MeshData, PlaneWaveParameters, Port, Probe, RadialFieldParameters, sharingInfoUser, Signal, Simulation } from "./esymiaModels"

export type DynamoProject = {
    id: string,
    project: DynamoProjectDetails
}

export type DynamoProjectDetails = {
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
    modelUnit: string,
    planeWaveParameters: PlaneWaveParameters,
    radialFieldParameters: RadialFieldParameters
}

export type DynamoFolder = {
    id: string,
    folder: DynamoFolderDetails
}

export type DynamoFolderDetails = {
    name: string,
    owner: UsersState,
    sharedWith?: sharingInfoUser[],
    projectList: string[],
    subFolders: string[],
    parent: string,
}

export type DynamoUserSessionInfo = {
  id: string,
  userSessionInfo: UserSessionInfo
}

export type UserSessionInfo = {
  email: string,
  mac: string,
  logged: boolean
}
