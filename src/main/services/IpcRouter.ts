import { ipcMain, app, BrowserWindow, dialog } from 'electron';
import axios from 'axios';
import getmac from 'getmac';
import path from 'path';
import { BrokerManager } from './BrokerManager';
import { ComputationManager } from './ComputationManager';
import { writeTouchstone } from './TouchstoneManager';
import { resolveHtmlPath } from '../util';
import { IpcChannels } from '../../shared/ipc-types';

export class IpcRouter {
    static register() {
        // Basic IPC
        ipcMain.on(IpcChannels.IPC_EXAMPLE, async (event, arg) => {
            const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
            console.log(msgTemplate(arg));
            event.reply(IpcChannels.IPC_EXAMPLE, msgTemplate('pong'));
        });

        ipcMain.handle(IpcChannels.API_CALL, async (e, args) => {
            const response = await axios.get(args);
            return response.data;
        });

        ipcMain.on(IpcChannels.CLOSE_APP, () => {
            app.quit();
        });

        ipcMain.on(IpcChannels.CHECK_LOGOUT, (e) => {
            if (ComputationManager.hasPendingOperations()) {
                dialog.showErrorBox(
                    'PAY ATTENTION',
                    'You have pending operations server side, complete or stop them before logout.',
                );
            } else {
                e.reply(IpcChannels.CHECK_LOGOUT, 'allowed');
            }
        });

        ipcMain.on(IpcChannels.LOGOUT, (e, args) => {
            BrowserWindow.getAllWindows().forEach((win) => {
                win
                    .loadURL(`https://${args[0]}/v2/logout`)
                    .then(() => {
                        win.loadURL(resolveHtmlPath('index.html'));
                    })
                    .catch((err) => console.log(err));
            });
        });

        ipcMain.handle(IpcChannels.GET_INSTALLATION_DIR, () => {
            return app.getPath('home');
        });

        ipcMain.handle(IpcChannels.GET_MAC, () => {
            return getmac();
        });

        ipcMain.on(IpcChannels.EXPORT_TOUCHSTONE, async (e, args) => {
            let fileName = path.join(
                app.getPath('home'),
                'Downloads',
                args[4] + `.s${args[3]}p`,
            );
            try {
                await writeTouchstone(args[0], args[1], args[2], fileName);
                console.log('Touchstone file exported:', fileName);
            } catch (err: any) {
                console.error('Failed to export Touchstone:', err);
                dialog.showErrorBox('Export Error', `Failed to export Touchstone file: ${err.message}`);
            }
        });

        // Delegate service specific handlers
        BrokerManager.registerHandlers();
        ComputationManager.registerHandlers();
    }
}
