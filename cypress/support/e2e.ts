// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

Cypress.on('window:before:load', (win) => {
    // @ts-ignore
    win.electron = win.electron || {};

    // @ts-ignore
    if (!win.electron.ipcRenderer) {
        // @ts-ignore
        win.electron.ipcRenderer = {
            sendMessage: (channel: string, args: any[]) => {
                console.log(`[Mock IPC] sendMessage: ${channel}`, args);
            },
            on: (channel: string, func: any) => {
                console.log(`[Mock IPC] on: ${channel}`);
                return () => { }; // Return a cleanup function
            },
            once: (channel: string, func: any) => {
                console.log(`[Mock IPC] once: ${channel}`);
            },
            invoke: async (channel: string, ...args: any[]) => {
                console.log(`[Mock IPC] invoke: ${channel}`, args);
                // Return default values based on channel if needed
                if (channel === 'getMac') {
                    return '00:00:00:00:00:00';
                }
                return Promise.resolve(null);
            },
            removeAllListeners: (channel: string) => {
                console.log(`[Mock IPC] removeAllListeners: ${channel}`);
            },
        };
    }
});