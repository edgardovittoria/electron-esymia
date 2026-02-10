import { ipcMain, IpcMainEvent } from 'electron';
import nodeChildProcess from 'child_process';
import { getDockerPath, getOs } from './CommonUtils';
import { IpcChannels, BrokerStatus } from '../../shared/ipc-types';

export class BrokerManager {
    static stopBroker() {
        const script = getOs() === 'windows' ? 'BROKER_STOP.bat' : 'BROKER_STOP.sh';
        const shell = getOs() === 'windows' ? 'cmd.exe' : 'bash';
        const args = getOs() === 'windows' ? ['/c', getDockerPath(script)] : [getDockerPath(script)];

        nodeChildProcess.spawn(shell, args).on('error', (err) => {
            console.error('Failed to stop broker:', err);
        });
    }

    static registerHandlers() {
        ipcMain.on(IpcChannels.RUN_BROKER, (e: IpcMainEvent) => {
            const script = getOs() === 'windows' ? 'BROKER.bat' : 'BROKER.sh';
            const shell = getOs() === 'windows' ? 'cmd.exe' : 'bash';
            const args = getOs() === 'windows' ? ['/c', getDockerPath(script)] : [getDockerPath(script)];

            const scriptBroker = nodeChildProcess.spawn(shell, args);

            scriptBroker.on('error', (err) => {
                const response: BrokerStatus = {
                    type: 'status',
                    success: false,
                    message: `Failed to start broker process: ${err.message}`,
                };
                e.reply(IpcChannels.RUN_BROKER, response);
            });

            scriptBroker.stdout?.on('data', (data: any) => {
                const response: BrokerStatus = { type: 'log', message: data.toString() };
                e.reply(IpcChannels.RUN_BROKER, response);
            });

            scriptBroker.stderr?.on('data', (err: any) => {
                const response: BrokerStatus = { type: 'error', message: err.toString() };
                e.reply(IpcChannels.RUN_BROKER, response);
            });

            scriptBroker.on('exit', (code: number | null) => {
                if (code === 10) {
                    const response: BrokerStatus = {
                        type: 'status',
                        success: false,
                        message: 'Docker is not running. Please start Docker Desktop and try again.',
                        exitCode: code,
                    };
                    e.reply(IpcChannels.RUN_BROKER, response);
                } else if (code !== 0 && code !== null) {
                    const response: BrokerStatus = {
                        type: 'status',
                        success: false,
                        message: `Broker exited with error code ${code}.`,
                        exitCode: code,
                    };
                    e.reply(IpcChannels.RUN_BROKER, response);
                } else {
                    const response: BrokerStatus = {
                        type: 'status',
                        success: true,
                        message: 'Broker started successfully.',
                    };
                    e.reply(IpcChannels.RUN_BROKER, response);
                }
            });
        });
    }
}
