import { IMessage } from '@stomp/stompjs';
import { Project, SolverOutput } from '../model/esymiaModels';
import { takeAllProjectsIn } from '../store/auxiliaryFunctions/managementProjectsAndFoldersFunction';
import { setMesherStatus, setSolverStatus } from '../store/pluginsSlice';
import {
  setAWSExternalGridsData,
  setCompress,
  setEstimatedTime,
  setGridsCreationLength,
  setGridsCreationValue,
  setIterations,
  setMeshAdvice,
  setMeshProgress,
  setMeshProgressLength,
  setMesherResults,
  setMeshingProgress,
  setSolverResults,
  setSolverResultsS3,
  setcomputingLp,
  setcomputingP,
} from '../store/tabsAndMenuItemsSlice';

export const callback_mesh_advices = function (
  message: IMessage,
  dispatch: Function,
  getState: Function
) {
  // called when the client receives a STOMP message from the server
  let projects:Project[] = takeAllProjectsIn(getState().projects.projects)

  let res = JSON.parse(message.body);
  projects.forEach(p => {
    if(p.faunaDocumentId === res.id){
      dispatch(setMeshAdvice({ quantum: JSON.parse(res.quantum), id: res.id }));
      message.ack();
    }
  })
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

export const callback_mesher_feedback = (message: any, dispatch: Function, getState: Function) => {
  let projects:Project[] = takeAllProjectsIn(getState().projects.projects)
  if (message.body) {
    let body = JSON.parse(message.body);
    projects.forEach(p => {
      if(p.faunaDocumentId === body.id){
        message.ack();
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
    })
  }
};

export const callback_mesher_results = (message: any, dispatch: Function, getState: Function) => {
  let projects:Project[] = takeAllProjectsIn(getState().projects.projects)
  let res = JSON.parse(message.body);
  projects.forEach(p => {
    if(p.faunaDocumentId === res.id){
      message.ack();
      dispatch(
        setMesherResults({
          id: res.id,
          gridsPath: res.grids,
          meshPath: res.mesh,
          isStopped: res.isStopped ? res.isStopped : false,
          isValid: res.isValid,
          validTopology: res.validTopology,
          error: res.error,
        }),
      );
    }
  })
};

export const callback_mesher_grids = (message: any, dispatch: Function, getState: Function) => {
  let projects:Project[] = takeAllProjectsIn(getState().projects.projects)
  let res = JSON.parse(message.body);
  console.log(res)
  projects.forEach(p => {
    if(p.faunaDocumentId === res.id){
      message.ack();
      res.grids_exist && dispatch(setAWSExternalGridsData(res.grids));
    }
  })
};

export const callback_solver_feedback = (message: any, dispatch: Function, getState: Function) => {
  let projects:Project[] = takeAllProjectsIn(getState().projects.projects)
  if (message.body) {
    let body = JSON.parse(message.body);
    projects.forEach(p => {
      if(p.faunaDocumentId === body.id){
        message.ack();
        if (body['computingP']) {
          dispatch(setcomputingP({ done: body['computingP'], id: body['id'] }));
        } else if (body['computingLp']) {
          dispatch(setcomputingLp({ done: body['computingLp'], id: body['id'] }));
        } else if (body['freqNumber']) {
          dispatch(setIterations({ freqNumber: body['freqNumber'], id: body['id'] }));
        } else if (body['estimatedTime']){
          dispatch(setEstimatedTime({estimatedTime: body['estimatedTime'], portIndex: body['portIndex'], id: body['id']}))
        } else if(body['computation_completed']){
          dispatch(setSolverResultsS3(body['path']))
        }
      }
    })
  }
};

export const callback_solver_results = (message: any, dispatch: Function, getState: Function) => {
  let projects:Project[] = takeAllProjectsIn(getState().projects.projects)
  let res = JSON.parse(message.body);
  projects.forEach(p => {
    if(p.faunaDocumentId === res.id){
      message.ack();
      if(!res.error){
        dispatch(
          setSolverResults({
            id: res.id,
            matrices: !res.isStopped ? res.matrices : ({} as SolverOutput),
            isStopped: res.isStopped,
            partial: res.partial,
            freqIndex: res.freqIndex,
          }),
        );
        dispatch(setEstimatedTime(undefined))
      }else{
        dispatch(
          setSolverResults({
            id: res.id,
            matrices: {} as SolverOutput,
            isStopped: res.isStopped,
            partial: res.partial,
            error: res.error
          }),
        );
        dispatch(setEstimatedTime(undefined))
      }
    }
  })
};
