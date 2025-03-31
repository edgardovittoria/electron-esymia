import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import {
  OrbitControls,
  GizmoHelper,
  GizmoViewport,
  Edges,
} from '@react-three/drei';
import { GiCubeforce } from 'react-icons/gi';
import uniqid from 'uniqid';
import {
  Provider,
  ReactReduxContext,
  useDispatch,
  useSelector,
} from 'react-redux';
import {
  importModel,
  selectedProjectSelector,
  setModelS3,
  setModelUnit,
} from '../../../../store/projectSlice';
import { setModelInfoFromS3 } from '../../../dashboardTabsManagement/tabs/shared/utilFunctions';
import { FocusView } from '../../sharedElements/FocusView';
import { uploadFileS3 } from '../../../../aws/mesherAPIs';
import {
  ImportActionParamsObject,
  ImportCadProjectButton,
  ComponentEntity,
} from '../../../../../cad_library';
import { setPortsFromS3 } from '../physics/Physics';
import { ThemeSelector } from '../../../../store/tabsAndMenuItemsSlice';
import { FactoryShapesEsymia } from '../../../../../cad_library/components/baseShapes/factoryShapes';

interface CanvasModelerProps {
  setShowModalLoadFromDB: (v: boolean) => void;
  resetFocus: boolean;
}

export const CanvasModeler: React.FC<CanvasModelerProps> = ({
  setShowModalLoadFromDB,
  resetFocus,
}) => {
  const selectedProject = useSelector(selectedProjectSelector);
  const theme = useSelector(ThemeSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!selectedProject?.model.components && selectedProject?.modelS3) {
      setModelInfoFromS3(selectedProject, dispatch);
    }
    if (selectedProject?.portsS3 && selectedProject.ports.length === 0) {
      setPortsFromS3(selectedProject, dispatch);
    }
    // if(selectedProject && selectedProject.simulation && selectedProject.simulation.resultS3 && selectedProject.simulation.status === "Completed" && !selectedProject.simulation.results.matrix_S){
    //   setResultsFromS3(selectedProject, dispatch)
    // }
  }, []);

  return (
    <div className="flex justify-center">
      {selectedProject && selectedProject.model?.components ? (
        <ReactReduxContext.Consumer>
          {({ store }) => (
            <div className="flex flex-col">
              <Canvas
                className="w-[100vw] lg:h-[70vh] xl:h-[82vh]"
                camera={{ position: [0, -3, 0], up: [0, 0, 1], fov: 50 }}
              >
                <Provider store={store}>
                  <group rotation={[-Math.PI / 2, 0, 0]}>
                    <pointLight position={[100, 100, 100]} intensity={0.8} />
                    <hemisphereLight
                      color={'#ffffff'}
                      groundColor={new THREE.Color('#b9b9b9')}
                      position={[-7, 25, 13]}
                      intensity={3}
                    />
                    {/* paint models */}
                    <FocusView key={uniqid()} resetFocus={resetFocus}>
                      {selectedProject.model.components.map(
                        (component: ComponentEntity, index: number) => {
                          return (
                            <mesh
                              userData={{
                                keyComponent: component.keyComponent,
                                isSelected: false,
                              }}
                              position={component.transformationParams.position}
                              scale={component.transformationParams.scale}
                              rotation={component.transformationParams.rotation}
                            >
                              <FactoryShapesEsymia entity={component} />
                              <Edges />
                            </mesh>
                          );
                        },
                      )}
                    </FocusView>
                    {/*<Screenshot selectedProject={selectedProject}/>*/}
                    <OrbitControls makeDefault />
                    <GizmoHelper alignment="bottom-left" margin={[150, 80]}>
                      <GizmoViewport
                        axisColors={['red', '#40ff00', 'blue']}
                        labelColor="white"
                      />
                      <group rotation={[-Math.PI / 2, 0, 0]} />
                    </GizmoHelper>
                    {/*<Screenshot selectedProject={selectedProject} />*/}
                  </group>
                </Provider>
              </Canvas>
            </div>
          )}
        </ReactReduxContext.Consumer>
      ) : (
        <div className="absolute top-1/2 flex justify-center gap-4">
          <ImportCadProjectButton
            className={`button buttonPrimary ${
              theme === 'light' ? '' : 'bg-secondaryColorDark text-textColor'
            } flex items-center`}
            importAction={(importActionParamsObject) => {
              dispatch(importModel(importActionParamsObject));
              dispatch(setModelUnit(importActionParamsObject.unit));
              let model = JSON.stringify({
                components: importActionParamsObject.canvas.components,
                unit: importActionParamsObject.unit,
              });
              let blobFile = new Blob([model]);
              let modelFile = new File(
                [blobFile],
                `${selectedProject?.id}_model_esymia.json`,
                { type: 'application/json' },
              );
              uploadFileS3(modelFile).then((res) => {
                if (res) {
                  dispatch(setModelS3(res.key));
                }
              });
            }}
            actionParams={
              {
                id: selectedProject?.id,
                unit: 'mm',
              } as ImportActionParamsObject
            }
          >
            {/* <GiCubeforce
                            style={{width: "25px", height: "25px", marginRight: "5px"}}
                        />{" "} */}
            {'Import From FS'}
          </ImportCadProjectButton>
          <span className="border-start border-dark" />
          <button
            className={`button buttonPrimary ${
              theme === 'light' ? '' : 'bg-secondaryColorDark text-textColor'
            } flex items-center`}
            onClick={() => setShowModalLoadFromDB(true)}
          >
            <GiCubeforce
              style={{ width: '25px', height: '25px', marginRight: '5px' }}
            />{' '}
            Import From DB
          </button>
        </div>
      )}
    </div>
  );
};
