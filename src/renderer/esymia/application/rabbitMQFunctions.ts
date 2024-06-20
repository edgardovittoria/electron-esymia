import { Folder, Project } from '../model/esymiaModels';
import { findProjectByFaunaID, setExternalGrids, setMesh, setMeshGenerated, setSuggestedQuantum } from '../store/projectSlice';
import { takeAllProjectsInArrayOf } from '../store/auxiliaryFunctions/managementProjectsAndFoldersFunction';
import { updateProjectInFauna } from '../faunadb/projectsFolderAPIs';
import { convertInFaunaProjectThis } from '../faunadb/apiAuxiliaryFunctions';
import { client } from '../Esymia';
import { setIsAlertInfoModal, setMeshProgress, setMeshProgressLength, setMessageInfoModal, setShowInfoModal } from '../store/tabsAndMenuItemsSlice';

const getEscalFrom = (unit?: string) => {
  let escal = 1.0
  if (unit !== undefined){
    if (unit === "m") escal = 1.0
    if (unit === "dm") escal = 1e1
    if (unit === "cm") escal = 1e2
    if (unit === "mm") escal = 1e3
    if (unit === "microm") escal = 1e6
    if (unit === "nanom") escal = 1e9
  }
  return escal
}
export const callback_mesh_advices = function (message:any, findProject: (projectID: string) => Promise<Project>, execQuery: Function, dispatch: Function) {
  // called when the client receives a STOMP message from the server
  message.ack()
  let res = JSON.parse(message.body)
  findProject(res.id).then(selectedProject => {
    if (message.body) {
      let body = JSON.parse(res.body)
      if(selectedProject.frequencies?.length && selectedProject.frequencies?.length > 0){
        dispatch(setSuggestedQuantum((
          [
            Math.min((3e8/selectedProject.frequencies[selectedProject.frequencies?.length - 1]/40)*getEscalFrom(selectedProject.modelUnit), parseFloat(body[0].toFixed(5))),
            Math.min((3e8/selectedProject.frequencies[selectedProject.frequencies?.length - 1]/40)*getEscalFrom(selectedProject.modelUnit), parseFloat(body[1].toFixed(5))),
            Math.min((3e8/selectedProject.frequencies[selectedProject.frequencies?.length - 1]/40)*getEscalFrom(selectedProject.modelUnit), parseFloat(body[2].toFixed(5))),
          ]
        )));
      }
      execQuery(
        updateProjectInFauna,
        convertInFaunaProjectThis({
          ...selectedProject,
          suggestedQuantum: [parseFloat(body[0].toFixed(5)), parseFloat(body[1].toFixed(5)), parseFloat(body[2].toFixed(5))]
        } as Project)
      ).then();
    } else {
      console.log('got empty message');
    }
  })
};

export const callback_mesher_feedback = (message:any, dispatch: Function) => {
  message.ack()
  if(message.body){
    let body = JSON.parse(message.body)
    if(body["length"]){
      dispatch(setMeshProgressLength({length: body["length"], id: body["id"]}))
    } else if (body["index"]){
      dispatch(setMeshProgress({index: body["index"], id: body["id"]}))
    }
  }
}

export const callback_mesher_results = (message:any, findProject: (projectID: string) => Promise<Project>, execQuery: Function, dispatch: Function) => {
  message.ack()
  let res = JSON.parse(message.body)
  findProject(res.id).then(selectedProject => {
    if(res.isStopped === true){
      dispatch(setMeshGenerated({
        status: selectedProject.meshData.previousMeshStatus as "Not Generated" | "Generated",
        projectToUpdate: selectedProject.faunaDocumentId as string
      }));
    } else if (res.isValid.valid === false) {
      dispatch(setMessageInfoModal('Error! Mesh not valid. Please adjust quantum along ' + res.data.isValid.axis + ' axis.'));
      dispatch(setIsAlertInfoModal(true));
      dispatch(setShowInfoModal(true));
      dispatch(setMeshGenerated({
        status: selectedProject.meshData.previousMeshStatus as "Not Generated" | "Generated",
        projectToUpdate: selectedProject.faunaDocumentId as string
      }));
    } else {
      dispatch(setMeshGenerated({
        status: 'Generated',
        projectToUpdate: selectedProject.faunaDocumentId as string
      }));
      dispatch(setMesh({ mesh: res.mesh, projectToUpdate: selectedProject.faunaDocumentId as string }));
      dispatch(setExternalGrids({
        extGrids: res.grids,
        projectToUpdate: selectedProject.faunaDocumentId as string
      }));
      execQuery(
        updateProjectInFauna,
        convertInFaunaProjectThis({
          ...selectedProject,
          meshData: {
            ...selectedProject.meshData,
            mesh: res.mesh,
            externalGrids: res.grids,
            meshGenerated: 'Generated'
          }
        })
      ).then(() => {
      });
      return '';
    }
  })
  
}
