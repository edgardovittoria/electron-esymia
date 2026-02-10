import { app } from 'electron';
import path from 'path';
import os from 'os';

export function getOs() {
    switch (os.platform()) {
        case 'win32':
            return 'windows';
        case 'darwin': // macOS
        case 'linux':
            return 'unix-like';
        default:
            return 'unknown';
    }
}

export const SERVER_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'server')
    : path.join(__dirname, '../../server');

export const getServerPath = (...paths: string[]): string => {
    return path.join(SERVER_PATH, ...paths);
};

export const DOCKER_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'docker')
    : path.join(__dirname, '../../docker');

export const getDockerPath = (...paths: string[]): string => {
    return path.join(DOCKER_PATH, ...paths);
};
