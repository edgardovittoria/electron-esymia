import { Dispatch } from "@reduxjs/toolkit"
import { uploadFileS3 } from "../../../../aws/mesherAPIs"
import { Port, Probe, Project } from "../../../../model/esymiaModels"
import { setPortsS3 } from "../../../../store/projectSlice"
import { updateProjectInFauna } from "../../../../faunadb/projectsFolderAPIs"
import { convertInFaunaProjectThis } from "../../../../faunadb/apiAuxiliaryFunctions"
import { createOrUpdateProjectInDynamoDB } from "../../../dynamoDB/projectsFolderApi"

export const savePortsOnS3 = (ports: (Port | Probe)[], selectedProject: Project, dispatch: Dispatch, execQuery2:Function) => {
  let blobFile = new Blob([JSON.stringify(ports)])
  let modelFile = new File([blobFile], `${selectedProject.id}_ports.json`, {type: 'application/json'})
  uploadFileS3(modelFile).then(res => {
    dispatch(setPortsS3(res?.key as string))
    execQuery2(
      createOrUpdateProjectInDynamoDB,
      {
        ...selectedProject,
        portsS3: res?.key
      },
      dispatch,
    ).then(() => {});
  })
}
