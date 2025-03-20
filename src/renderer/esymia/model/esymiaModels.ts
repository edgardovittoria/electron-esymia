import { CanvasState, ComponentEntity, UsersState } from "../../cad_library"

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
  storage: 'local' | 'online'
  name: string,
  description: string,
  model: CanvasState,
  modelUnit?: string,
  modelS3?: string,
  bricks?: string,
  ports: (Port | Probe | TempLumped)[],
  portsS3?: string | null,
  scatteringValue?: number,
  frequencies?: number[],
  simulation?: Simulation,
  meshData: MeshData,
  screenshot: string | undefined,
  owner: UsersState
  sharedWith: sharingInfoUser[],
  shared?: boolean,
  faunaDocumentId?: string,
  parentFolder: string,
  boundingBoxDimension?: number,
  suggestedQuantum?: [number, number, number],
  radialFieldParameters?: RadialFieldParameters
}

export type TempLumped = {
  name: string,
  category: 'port' | 'lumped',
  type: number,
  inputElement: [number, number, number],
  outputElement: [number, number, number],
  isSelected: boolean,
  rlcParams: RLCParams,
  value: number
}

export type Port = {
  name: string,
  category: 'port' | 'lumped',
  inputElement: [number, number, number],
  outputElement: [number, number, number],
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
  externalGrids?: string,
  surface?: string,
  previousMeshStatus?:  "Not Generated" | "Generated",
  meshGenerated: "Not Generated" | "Generated" | "Generating" | "Queued",
  type: 'Standard' | 'Ris',
  meshApproved: boolean,
  quantum: [number, number, number],
  pathToExternalGridsNotFound: boolean,
  validTopology: boolean,
  lambdaFactor?: number,
  ASize?: number[],
}


export type Simulation = {
  name: string,
  started: string,
  ended: string,
  status: 'Queued' | 'Running' | 'Completed' | 'Failed'
  results: SolverOutput,
  resultS3?: string,
  associatedProject: string,
  solverAlgoParams: {
    solverType: 1|2,
    innerIteration: number,
    outerIteration: number,
    convergenceThreshold: number
  }
}

export type SolverOutput = {
  matrix_Z: string,
  matrix_S: string,
  matrix_Y: string,
  freqIndex?: number
}

export type ExternalGridsRisObject = {
  vertices: number[][]
  materials: string[]
}

export type ExternalGridsObject = {
  externalGrids: Object,
  cell_size: CellSize,
  origin: OriginPoint,
  n_cells: CellsNumber
}

export type CellSize = {
  cell_size_x: number,
  cell_size_y: number,
  cell_size_z: number
}

export type OriginPoint = {
  origin_x: number,
  origin_y: number,
  origin_z: number
}

export type CellsNumber = {
  n_cells_x: number,
  n_cells_y: number,
  n_cells_z: number,
}

export type RadialFieldParameters = {
  radius: number,
  center: {x:number, y:number, z:number},
  plane: string
}
