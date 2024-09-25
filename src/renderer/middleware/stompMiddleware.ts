import { Middleware } from "@reduxjs/toolkit";
import { Client } from "@stomp/stompjs";
import { callback_mesh_advices, callback_mesher_feedback, callback_mesher_grids, callback_mesher_results, callback_server_init, callback_solver_feedback, callback_solver_results } from "../esymia/application/rabbitMQFunctions";
import { setBrokerConnected, unsetBrokerConnected } from "../esymia/store/tabsAndMenuItemsSlice";

export const stompMiddleware: Middleware = (dispatch) => {

  const client = new Client({
    brokerURL: 'ws://localhost:15674/ws'
    //brokerURL: 'ws://34.69.174.97:15674/ws'
    // connectHeaders: {
    //   login: 'user',
    //   passcode: 'password',
    // },
    // debug: function (str) {
    //   console.log(str);
    // },
    // reconnectDelay: 1000,
    // heartbeatIncoming: 1000,
    // heartbeatOutgoing: 1000,
  });

  client.onConnect = function (frame) {
    client.subscribe('server_init', (msg) => callback_server_init(msg, dispatch.dispatch), {ack: 'client'});
    client.subscribe('mesh_advices', (msg) => callback_mesh_advices(msg, dispatch.dispatch), {ack: 'client'});
    client.subscribe(
      'mesher_results',
      (msg) => callback_mesher_results(msg, dispatch.dispatch),
      { ack: 'client' },
    );
    client.subscribe(
      'mesher_feedback',
      (msg) => callback_mesher_feedback(msg, dispatch.dispatch),
      { ack: 'client' },
    );
    client.subscribe('mesher_grids', (msg) => callback_mesher_grids(msg, dispatch.dispatch), {ack: 'client'});
    client.subscribe('solver_results', (msg) => callback_solver_results(msg, dispatch.dispatch), {ack: 'client'})
    client.subscribe('solver_feedback', (msg) => callback_solver_feedback(msg, dispatch.dispatch), {ack: 'client'})
    dispatch.dispatch(setBrokerConnected())
  };

  client.onDisconnect = function (frame) {
    dispatch.dispatch(unsetBrokerConnected())
  }

  client.onStompError = function (frame) {
    // Will be invoked in case of error encountered at Broker
    console.error('Broker reported error: ' + frame.headers['message']);
    console.error('Additional details: ' + frame.body);
  };

  return (next:any) => (action:any) => {
      switch (action.type) {
        case 'connect':
          client.activate();
          break;
        case 'disconnect':
          client.deactivate();
          break;
        case 'publish':
          client.publish({
            destination: action.payload.queue,
            body: JSON.stringify(action.payload.body),
          });
        default:
          return next(action);
      }
    }
  };


// An action to start stomp connection.
export const connectStomp = () => ({ type: 'connect' });
// An action to disconnect stomp connection.
export const disconnectStomp = () => ({ type: 'disconnect' });
// An action to publish message on broker.
export const publishMessage = (payload: any) => ({ type: 'publish', payload: payload });
