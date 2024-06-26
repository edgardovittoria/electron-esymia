import React, {ReactNode, useEffect, useState} from "react";
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from "three";
import {OrbitControls, GizmoHelper, GizmoViewport, Edges} from "@react-three/drei";
import {GiCubeforce} from "react-icons/gi";
import uniqid from "uniqid"
import {
  CanvasState,
  FactoryShapes,
  ImportActionParamsObject,
  ImportCadProjectButton,
  ImportModelFromDBModal
  ,
} from "cad-library";

import { Vector3 } from 'three';
import { Provider, ReactReduxContext, useDispatch, useSelector } from 'react-redux';
import { importModel, selectedProjectSelector, setModelS3, setModelUnit } from '../../../../store/projectSlice';
import { setModelInfoFromS3 } from '../../../dashboardTabsManagement/tabs/shared/utilFunctions';
import { FocusView } from '../../sharedElements/FocusView';
import { uploadFileS3 } from '../../../../aws/mesherAPIs';
import { s3 } from '../../../../aws/s3Config';


export const CanvasModeler: React.FC = () => {
  const selectedProject = useSelector(selectedProjectSelector);
  const [showModalLoadFromDB, setShowModalLoadFromDB] = useState(false);
  const dispatch = useDispatch()



  useEffect(() => {
    if (!selectedProject?.model.components && selectedProject?.modelS3) {
      setModelInfoFromS3(selectedProject, dispatch)
    }
  }, [])

  return (
    <div className="flex justify-center">
      {selectedProject && selectedProject.model?.components ? (
        <ReactReduxContext.Consumer>
          {({store}) => (
            <div className="flex flex-col">
              <Canvas className="w-[100vw] lg:h-[70vh] xl:h-[82vh]">
                <Provider store={store}>
                  <pointLight position={[100, 100, 100]} intensity={0.8}/>
                  <hemisphereLight
                    color={"#ffffff"}
                    groundColor={new THREE.Color("#b9b9b9")}
                    position={[-7, 25, 13]}
                    intensity={3}
                  />
                  {/* paint models */}
                  {selectedProject.model.components.map((component, index) => {
                    return (
                      <FocusView key={uniqid()}>
                        <mesh
                          userData={{
                            keyComponent: component.keyComponent,
                            isSelected: false,
                          }}
                          position={component.transformationParams.position}
                          scale={component.transformationParams.scale}
                          rotation={component.transformationParams.rotation}
                        >
                          <FactoryShapes entity={component}/>
                          <Edges/>
                        </mesh>
                      </FocusView>
                    )
                  })}
                  {/*<Screenshot selectedProject={selectedProject}/>*/}
                  <OrbitControls makeDefault/>
                  <GizmoHelper alignment="bottom-left" margin={[150, 80]}>
                    <GizmoViewport
                      axisColors={["red", "#40ff00", "blue"]}
                      labelColor="white"
                    />
                  </GizmoHelper>
                  {/*<Screenshot selectedProject={selectedProject} />*/}
                </Provider>
              </Canvas>
            </div>
          )}
        </ReactReduxContext.Consumer>
      ) : (
        <div className="absolute top-1/2 flex justify-center gap-4">
          <ImportCadProjectButton
            className="button buttonPrimary flex items-center"
            importAction={(importActionParamsObject) => {
              dispatch(importModel(importActionParamsObject))
              dispatch(setModelUnit(importActionParamsObject.unit))
              let model = JSON.stringify({
                components: importActionParamsObject.canvas.components,
                unit: importActionParamsObject.unit
              })
              let blobFile = new Blob([model])
              let modelFile = new File([blobFile], `${selectedProject?.faunaDocumentId}.json`, {type: 'application/json'})
              uploadFileS3(modelFile).then(res => {
                if (res) {
                  dispatch(setModelS3(res.key))
                }
              })
            }}
            actionParams={
              {id: selectedProject?.faunaDocumentId, unit: "mm"} as ImportActionParamsObject
            }>
            {/* <GiCubeforce
                            style={{width: "25px", height: "25px", marginRight: "5px"}}
                        />{" "} */}
            {"Import From FS"}
          </ImportCadProjectButton>
          <span className="border-start border-dark"/>
          <button
            className="button buttonPrimary flex items-center"
            onClick={() => setShowModalLoadFromDB(true)}>
            <GiCubeforce
              style={{width: "25px", height: "25px", marginRight: "5px"}}
            />{" "}
            Import From DB
          </button>
        </div>
      )}
      {showModalLoadFromDB && (
        <ImportModelFromDBModal
          s3Config={s3}
          bucket={process.env.REACT_APP_AWS_BUCKET_NAME as string}
          showModalLoad={setShowModalLoadFromDB}
          importAction={(importActionParamsObject) => {
            dispatch(importModel(importActionParamsObject))
            dispatch(setModelUnit(importActionParamsObject.unit))
            dispatch(setModelS3(importActionParamsObject.modelS3 as string))
          }}
          importActionParams={
            {
              canvas: {
                components: [],
                lastActionType: "",
                numberOfGeneratedKey: 0,
                selectedComponentKey: 0,
              } as CanvasState,
              unit: "mm",
              id: selectedProject?.faunaDocumentId,
            } as ImportActionParamsObject
          }
        />
      )}
    </div>
  );
}

