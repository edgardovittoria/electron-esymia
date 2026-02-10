import { ipcMain, IpcMainEvent } from 'electron';
import nodeChildProcess from 'child_process';
import { Worker } from 'worker_threads';
import { getServerPath, getOs } from './CommonUtils';
import { IpcChannels, ComputationStatus } from '../../shared/ipc-types';

let serverProcesses: {
    mesher?: nodeChildProcess.ChildProcessWithoutNullStreams;
    solver?: nodeChildProcess.ChildProcessWithoutNullStreams;
} = {};

export class ComputationManager {
    private static meshingComputations = false;
    private static solvingComputations = false;

    static hasPendingOperations() {
        return this.meshingComputations || this.solvingComputations;
    }

    private static spawnProcess(channel: IpcChannels, scriptName: string, e: IpcMainEvent) {
        const script = getOs() === 'windows' ? `scripts/${scriptName}.bat` : `scripts/${scriptName}.sh`;
        const shell = getOs() === 'windows' ? 'cmd.exe' : 'bash';
        const args = getOs() === 'windows' ? ['/c', getServerPath(script)] : [getServerPath(script)];

        const process = nodeChildProcess.spawn(shell, args);

        process.on('error', (err) => {
            const response: ComputationStatus = { type: 'exit', data: `Failed to start process: ${err.message}`, exitCode: -1 };
            e.reply(channel, response);
        });

        process.stdout?.on('data', (data: any) => {
            const response: ComputationStatus = { type: 'stdout', data: data.toString() };
            e.reply(channel, response);
        });

        process.stderr?.on('data', (err: any) => {
            const response: ComputationStatus = { type: 'stderr', data: err.toString() };
            e.reply(channel, response);
        });

        process.on('exit', (code: number | null) => {
            const response: ComputationStatus = {
                type: 'exit',
                data: code === 0 ? 'Process completed successfully.' : `Process exited with code ${code}`,
                exitCode: code ?? undefined
            };
            e.reply(channel, response);
        });

        return process;
    }

    static registerHandlers() {
        ipcMain.on(IpcChannels.RUN_MESHER, (e: IpcMainEvent) => {
            if (serverProcesses.mesher && serverProcesses.mesher.exitCode === null) {
                e.reply(IpcChannels.RUN_MESHER, { type: 'stderr', data: 'Mesher is already running.' });
                return;
            }
            serverProcesses.mesher = this.spawnProcess(IpcChannels.RUN_MESHER, 'mesherINIT', e);
        });

        ipcMain.on(IpcChannels.RUN_SOLVER, (e: IpcMainEvent) => {
            if (serverProcesses.solver && serverProcesses.solver.exitCode === null) {
                e.reply(IpcChannels.RUN_SOLVER, { type: 'stderr', data: 'Solver is already running.' });
                return;
            }
            serverProcesses.solver = this.spawnProcess(IpcChannels.RUN_SOLVER, 'solverINIT', e);
        });

        ipcMain.on(IpcChannels.HALT_MESHER, () => {
            if (serverProcesses.mesher) {
                serverProcesses.mesher.kill();
                const script = getOs() === 'windows' ? 'scripts/mesherHALT.bat' : 'scripts/mesherHALT.sh';
                const shell = getOs() === 'windows' ? 'cmd.exe' : 'bash';
                const args = getOs() === 'windows' ? ['/c', getServerPath(script)] : [getServerPath(script)];
                nodeChildProcess.spawn(shell, args);
            }
        });

        ipcMain.on(IpcChannels.HALT_SOLVER, () => {
            if (serverProcesses.solver) {
                serverProcesses.solver.kill();
                const script = getOs() === 'windows' ? 'scripts/solverHALT.bat' : 'scripts/solverHALT.sh';
                const shell = getOs() === 'windows' ? 'cmd.exe' : 'bash';
                const args = getOs() === 'windows' ? ['/c', getServerPath(script)] : [getServerPath(script)];
                nodeChildProcess.spawn(shell, args);
            }
        });

        ipcMain.on(IpcChannels.MESHING_COMPUTATION, (e, args) => {
            this.meshingComputations = args[0];
        });

        ipcMain.on(IpcChannels.SOLVING_COMPUTATION, (e, args) => {
            this.solvingComputations = args[0];
        });

        ipcMain.on(IpcChannels.COMPUTE_MESH_RIS, (e: IpcMainEvent, args) => {
            const worker = new Worker(getServerPath('mesherTypescript/mainfile.js'), {
                workerData: args,
            });

            ipcMain.on(IpcChannels.STOP_MESHING, () => {
                worker.terminate();
            });

            worker.on('message', (result) => {
                e.reply(IpcChannels.COMPUTE_MESH_RIS, result);
            });

            worker.on('error', (error) => {
                console.error('Worker error:', error);
                e.reply(IpcChannels.COMPUTE_MESH_RIS, { error: error.message });
            });

            worker.on('exit', (code) => {
                if (code !== 0) {
                    console.error(`Worker stopped with exit code ${code}`);
                }
            });
        });
    }
}
