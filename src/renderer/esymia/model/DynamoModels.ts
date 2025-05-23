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
    frequencies?: number[],
    times?: number[],
    interestFrequenciesIndexes?: number[],
    maxFrequency?: number,
    simulation?: Simulation|null,
    meshData: MeshData,
    screenshot: string | undefined,
    owner: UsersState
    ownerEmail: string,
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
    ownerEmail: string,
    sharedWith?: sharingInfoUser[],
    projectList: string[],
    subFolders: string[],
    parent: string,
}

export type DynamoUserSessionInfo = {
  userSessionInfo: UserSessionInfo
}

export type UserSessionInfo = {
  email: string,
  mac: string,
  logged: boolean
}
