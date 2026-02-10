export type IpcResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
};

export type BrokerStatus = {
    type: 'log' | 'error' | 'status';
    message: string;
    success?: boolean;
    exitCode?: number;
};

export type ComputationStatus = {
    type: 'stdout' | 'stderr' | 'exit';
    data: string;
    exitCode?: number;
};

export enum IpcChannels {
    IPC_EXAMPLE = 'ipc-example',
    API_CALL = 'api:call',
    CLOSE_APP = 'closeApp',
    CHECK_LOGOUT = 'checkLogout',
    LOGOUT = 'logout',
    RUN_BROKER = 'runBroker',
    RUN_MESHER = 'runMesher',
    RUN_SOLVER = 'runSolver',
    HALT_MESHER = 'haltMesher',
    HALT_SOLVER = 'haltSolver',
    GET_INSTALLATION_DIR = 'getInstallationDir',
    GET_MAC = 'getMac',
    EXPORT_TOUCHSTONE = 'exportTouchstone',
    MESHING_COMPUTATION = 'meshingComputation',
    SOLVING_COMPUTATION = 'solvingComputation',
    COMPUTE_MESH_RIS = 'computeMeshRis',
    STOP_MESHING = 'stopMeshing',
    API_RESPONSE = 'api:response',
    FAUNA_GET_FOLDERS = 'fauna:getFoldersByOwner',
    FAUNA_GET_PROJECTS = 'fauna:getSimulationProjectsByOwner'
}
