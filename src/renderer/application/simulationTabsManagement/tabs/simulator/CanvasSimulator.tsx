import React from "react";
import { Canvas } from '@react-three/fiber';
import * as THREE from "three";
import {OrbitControls, GizmoHelper, GizmoViewport, Edges} from "@react-three/drei";
import { MeshedElement } from './MeshedElement/MeshedElement';
import { ExternalGridsObject } from '../../../../model/esymiaModels';
import { Provider, ReactReduxContext, useDispatch, useSelector } from 'react-redux';
import { selectedProjectSelector } from '../../../../store/projectSlice';
import { FocusView } from '../../sharedElements/FocusView';
import uniqid from 'uniqid';
import { FactoryShapes } from 'cad-library';
import { alertMessageStyle, comeBackToModelerMessage } from '../../../config/textMessages';

interface CanvasSimulatorProps  {
  externalGrids: ExternalGridsObject | undefined,
  selectedMaterials: string[]
}

export const CanvasSimulator: React.FC<CanvasSimulatorProps> = ({externalGrids, selectedMaterials}) => {
  const selectedProject = useSelector(selectedProjectSelector);
  let mesherOutput = selectedProject?.meshData.mesh;

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
                  {!mesherOutput ? selectedProject.model.components.map((component) => {
                    return (
                      <FocusView key={uniqid()}>
                        <mesh
                          userData={{
                            keyComponent: component.keyComponent,
                            isSelected: false,
                          }}
                          key={uniqid()}
                          position={component.transformationParams.position}
                          scale={component.transformationParams.scale}
                          rotation={component.transformationParams.rotation}
                        >
                          <FactoryShapes entity={component}/>
                          <Edges/>
                        </mesh>
                      </FocusView>
                    )
                  }):
                    <>
                      {externalGrids &&
                      <FocusView margin={2}>
                        <MeshedElement
                          externalGrids={externalGrids}
                          selectedProject={selectedProject}
                          selectedMaterials={selectedMaterials}
                        />
                        </FocusView>
                      }
                    </>

                  }

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
        <div className="absolute top-1/2">
          <span className={alertMessageStyle}>{comeBackToModelerMessage}</span>
        </div>
      )}
    </div>
  );
}

