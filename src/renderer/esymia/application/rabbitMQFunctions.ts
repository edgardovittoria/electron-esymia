import { Folder, Project } from '../model/esymiaModels';
import { findProjectByFaunaID, setSuggestedQuantum } from '../store/projectSlice';
import { takeAllProjectsInArrayOf } from '../store/auxiliaryFunctions/managementProjectsAndFoldersFunction';
import { updateProjectInFauna } from '../faunadb/projectsFolderAPIs';
import { convertInFaunaProjectThis } from '../faunadb/apiAuxiliaryFunctions';
import { client } from '../Esymia';

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
export const callback_mesher_results = function (message:any, findProject: Function, execQuery: Function, dispatch: Function) {
  // called when the client receives a STOMP message from the server
  console.log(message)
  message.ack()
  let res = JSON.parse(message.body)
  let selectedProject = findProject(res.id)
  console.log(selectedProject)
  if (message.body) {
    console.log('got message with body ' + message.body);
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
};
