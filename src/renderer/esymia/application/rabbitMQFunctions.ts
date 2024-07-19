import { SolverOutput } from '../model/esymiaModels';
import { setMesherStatus, setSolverStatus } from '../store/pluginsSlice';
import {
  setAWSExternalGridsData,
  setCompress,
  setGridsCreationLength,
  setGridsCreationValue,
  setIterations,
  setMeshAdvice,
  setMeshProgress,
  setMeshProgressLength,
  setMesherResults,
  setMeshingProgress,
  setSolverResults,
  setcomputingLp,
  setcomputingP,
} from '../store/tabsAndMenuItemsSlice';

export const callback_mesh_advices = function (
  message: any,
  dispatch: Function,
) {
  // called when the client receives a STOMP message from the server
  message.ack();
  let res = JSON.parse(message.body);
  console.log(res);
  dispatch(setMeshAdvice({ quantum: JSON.parse(res.quantum), id: res.id }));
};

export const callback_server_init = function (
  message: any,
  dispatch: Function,
) {
  // called when the client receives a STOMP message from the server
  message.ack();
  let res = JSON.parse(message.body);
  if (res.target === 'mesher') {
    dispatch(setMesherStatus(res.status as 'idle' | 'starting' | 'ready'));
  } else if (res.target === 'solver') {
    dispatch(setSolverStatus(res.status as 'idle' | 'starting' | 'ready'));
  }
};

export const callback_mesher_feedback = (message: any, dispatch: Function) => {
  message.ack();
  if (message.body) {
    let body = JSON.parse(message.body);
    if (body['length']) {
      dispatch(
        setMeshProgressLength({ length: body['length'], id: body['id'] }),
      );
    } else if (body['index']) {
      dispatch(setMeshProgress({ index: body['index'], id: body['id'] }));
    } else if (body['meshingStep']) {
      dispatch(
        setMeshingProgress({
          meshingStep: body['meshingStep'],
          id: body['id'],
        }),
      );
    } else if (body['gridsCreationLength']) {
      dispatch(
        setGridsCreationLength({
          gridsCreationLength: body['gridsCreationLength'],
          id: body['id'],
        }),
      );
    }else if (body['gridsCreationValue']) {
      dispatch(
        setGridsCreationValue({
          gridsCreationValue: body['gridsCreationValue'],
          id: body['id'],
        }),
      );
    } else if (body['compress']) {
      dispatch(setCompress({ compress: body['compress'], id: body['id'] }));
    }
  }
};

export const callback_mesher_results = (message: any, dispatch: Function) => {
  message.ack();
  let res = JSON.parse(message.body);
  dispatch(
    setMesherResults({
      id: res.id,
      gridsPath: res.grids,
      meshPath: res.mesh,
      isStopped: res.isStopped ? res.isStopped : false,
      isValid: res.isValid,
      error: res.error,
    }),
  );
};

export const callback_mesher_grids = (message: any, dispatch: Function) => {
  message.ack();
  let res = JSON.parse(message.body);
  console.log(res);
  res.grids_exist && dispatch(setAWSExternalGridsData(res.grids));
  // dispatch(setMesherResults({id: res.id, gridsPath: res.grids, meshPath: res.mesh, isStopped: (res.isStopped) ? res.isStopped : false, isValid: res.isValid, error: res.error}))
};

export const callback_solver_feedback = (message: any, dispatch: Function) => {
  message.ack();
  if (message.body) {
    let body = JSON.parse(message.body);
    if (body['computingP']) {
      dispatch(setcomputingP({ done: body['computingP'], id: body['id'] }));
    } else if (body['computingLp']) {
      dispatch(setcomputingLp({ done: body['computingLp'], id: body['id'] }));
    } else if (body['freqNumber']) {
      dispatch(
        setIterations({ freqNumber: body['freqNumber'], id: body['id'] }),
      );
    }
  }
};

export const callback_solver_results = (message: any, dispatch: Function) => {
  message.ack();
  let res = JSON.parse(message.body);
  dispatch(
    setSolverResults({
      id: res.id,
      matrices: !res.isStopped ? res.matrices : ({} as SolverOutput),
      isStopped: res.isStopped,
      partial: res.partial,
      freqIndex: res.freqIndex,
    }),
  );
};
