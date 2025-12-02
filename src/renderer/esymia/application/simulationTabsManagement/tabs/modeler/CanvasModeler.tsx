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
                className="w-[100vw] lg:h-[70vh] xl:h-[72vh]"
                camera={{ position: [0, -3, 0], up: [0, 0, 1], fov: 50 }}
              >
                <Provider store={store}>
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
                            key={index}
                          >
                            <FactoryShapesEsymia entity={component} borderVisible />

                          </mesh>
                        );
                      },
                    )}
                  </FocusView>
                  {/*<Screenshot selectedProject={selectedProject}/>*/}
                  <OrbitControls makeDefault zoomToCursor zoomSpeed={0.5} />
                  <GizmoHelper alignment="bottom-left" margin={[150, 80]}>
                    <GizmoViewport
                      axisColors={['red', '#40ff00', 'blue']}
                      labelColor="white"
                    />
                    <group rotation={[-Math.PI / 2, 0, 0]} />
                  </GizmoHelper>
                  {/*<Screenshot selectedProject={selectedProject} />*/}
                </Provider>
              </Canvas>
            </div>
          )}
        </ReactReduxContext.Consumer>
      ) : (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col md:flex-row items-center gap-6 p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl">
          <ImportCadProjectButton
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${theme === 'light'
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-600'
              : 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500'
              }`}
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
            <GiCubeforce size={20} />
            {'Import From FS'}
          </ImportCadProjectButton>

          <div className={`hidden md:block h-12 w-px ${theme === 'light' ? 'bg-gray-300' : 'bg-white/20'}`} />

          <button
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${theme === 'light'
              ? 'bg-white text-gray-700 shadow-lg hover:shadow-xl hover:text-blue-600'
              : 'bg-white/10 text-gray-200 border border-white/10 hover:bg-white/20 hover:text-white'
              }`}
            onClick={() => setShowModalLoadFromDB(true)}
          >
            <GiCubeforce size={20} />
            Import From DB
          </button>
        </div>
      )}
    </div>
  );
};
