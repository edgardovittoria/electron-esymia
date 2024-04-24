import { CanvasState, ComponentEntity, UsersState } from "cad-library"
import {
  Brick
} from '../application/simulationTabsManagement/tabs/simulator/rightPanelSimulator/components/createGridsExternals';

export type Folder = {
    name: string,
    owner: UsersState,
    sharedWith: sharingInfoUser[],
    projectList: Project[],
    subFolders: Folder[],
    parent: string,
    faunaDocumentId?: string
}


export type sharingInfoUser = {
    userEmail: string,
    read: boolean,
    write: boolean
}


export type Project = {
    name: string,
    description: string,
    model: CanvasState,
    modelUnit?: string,
    modelS3?: string,
    ports: (Port | Probe | TempLumped)[],
    scatteringValue?: number,
    frequencies?: number[],
    //signal: Signal | undefined,
    simulation?: Simulation,
    meshData: MeshData,
    screenshot: string | undefined,
    owner: UsersState
    sharedWith: sharingInfoUser[]
    faunaDocumentId?: string,
    parentFolder: string,
    boundingBoxDimension?: number,
    suggestedQuantum?: [number, number, number]
}

export type TempLumped = {
    name: string,
    category: 'port' | 'lumped',
    type: number,
    inputElement: ComponentEntity,
    outputElement: ComponentEntity,
    isSelected: boolean,
    rlcParams: RLCParams,
    value: number
}

export type Port = {
  name: string,
  category: 'port' | 'lumped',
  inputElement: ComponentEntity,
  outputElement: ComponentEntity,
  isSelected: boolean,
}

export type RLCParams = {
    inductance?: number,
    resistance?: number,
    capacitance?: number,
}

export interface Signal {
    id: string,
    name: string,
    type: string,
    signalValues: SignalValues[]
    powerPort: string | undefined
}

export interface SignalValues {
    freq: number,
    signal: {
        Re: number,
        Im: number
    }
}

export type Probe = {
    name: string,
    category: 'probe',
    isSelected: boolean,
    elements: ComponentEntity[],
    groupPosition: [number, number, number]
}

export type MeshData = {
    mesh?: string,
    externalGrids?: string
    meshGenerated: "Not Generated" | "Generated" | "Generating",
    meshApproved: boolean
}


export type Simulation = {
    name: string,
    started: string,
    ended: string,
    status: 'Queued' | 'Paused' | 'Completed' | 'Failed'
    results: SolverOutput,
    associatedProject: string,
    solverAlgoParams: {
        innerIteration: number,
        outerIteration: number,
        convergenceThreshold: number
    }
}

export type SolverOutput = {
    matrix_Z: string,
    matrix_S: string,
    matrix_Y: string,
}

export type ExternalGridsObject = {
    externalGrids: Brick[][],
    cell_size: {
        cell_size_x: number,
        cell_size_y: number,
        cell_size_z: number
    },
    origin: {
        origin_x: number,
        origin_y: number,
        origin_z: number
    },
    n_cells:{
        n_cells_x: number,
        n_cells_y: number,
        n_cells_z: number,
    }
}
