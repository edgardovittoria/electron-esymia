import { IMessage } from '@stomp/stompjs';
import { Project, SolverOutput, SolverOutputElectricFields } from '../model/esymiaModels';
import { takeAllProjectsIn } from '../store/auxiliaryFunctions/managementProjectsAndFoldersFunction';
import { setMesherStatus, setSolverStatus } from '../store/pluginsSlice';
import {
  addItemToResultsView,
  resetItemToResultsView,
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
  setSpinnerSolverResults,
  setcomputingLp,
  setcomputingP,
} from '../store/tabsAndMenuItemsSlice';
import { setMeshASize } from '../store/projectSlice';

export const callback_mesh_advices = function (
  message: IMessage,
  dispatch: Function,
  getState: Function
) {
  // called when the client receives a STOMP message from the server
  let projects:Project[] = takeAllProjectsIn(getState().projects.projects)

  let res = JSON.parse(message.body);
  projects.forEach(p => {
    if(p.id === res.id){
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
      if(p.id === body.id){
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
    if(p.id === res.id){
      message.ack();
      if(res.ASize) dispatch(setMeshASize({ASize: res.ASize, projectToUpdate: res.id}))
      dispatch(
        setMesherResults({
          id: res.id,
          gridsPath: res.grids ? res.grids : "",
          meshPath: res.mesh,
          surfacePath: res.surface ? res.surface : "",
          isStopped: res.isStopped ? res.isStopped : false,
          isValid: res.isValid,
          validTopology: res.validTopology,
          error: res.error,
          ASize: res.ASize,
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
    if(p.id === res.id){
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
      if(p.id === body.id){
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
  console.log(res)
  if(res.simulationType === "matrix"){
    if(res.portIndex !== undefined && res.partial){
      dispatch(resetItemToResultsView())
      dispatch(addItemToResultsView({
        portIndex: parseInt(res.portIndex),
        results: res.results,
        freqIndex: res.freqIndex,
      }))
    }else{
      dispatch(addItemToResultsView({
        portIndex: parseInt(res.portIndex),
        results: res.results,
      }))
    }
    projects.forEach(p => {
      if(p.id === res.id){
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
    dispatch(setSpinnerSolverResults(false))
  }else{
    dispatch(
      setSolverResults({
        id: res.id,
        results: {
          Ex: JSON.parse(res.results.Ex),
          Ey: JSON.parse(res.results.Ey),
          Ez: JSON.parse(res.results.Ez),
          Ex_3D: JSON.parse(res.results.Ex_3D),
          Ey_3D: JSON.parse(res.results.Ey_3D),
          Ez_3D: JSON.parse(res.results.Ez_3D),
          Hx_3D: JSON.parse(res.results.Hx_3D),
          Hy_3D: JSON.parse(res.results.Hy_3D),
          Hz_3D: JSON.parse(res.results.Hz_3D),
          centri_oss_3D: JSON.parse(res.results.centri_oss_3D),
          distanze_3D: JSON.parse(res.results.distanze_3D),
          theta_vals: JSON.parse(res.results.theta_vals),
          x_grid: JSON.parse(res.results.x_grid),
          y_grid: JSON.parse(res.results.y_grid),
          z_grid: JSON.parse(res.results.z_grid),
          baricentro: JSON.parse(res.results.baricentro),
          Vp: JSON.parse(res.results.Vp),
          f: JSON.parse(res.results.f),
        } as SolverOutputElectricFields,
        isStopped: false,
        error: false
      }),
    );
    dispatch(setSpinnerSolverResults(false))
  }
  
};
