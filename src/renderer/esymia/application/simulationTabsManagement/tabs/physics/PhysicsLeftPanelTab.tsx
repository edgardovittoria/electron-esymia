import React, { useEffect, useState } from 'react';
import { FaReact } from 'react-icons/fa6';
import { IoTrashOutline } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { BiRename } from 'react-icons/bi';
import {
  deleteAllLumped,
  deleteAllPorts,
  deletePort,
  selectedProjectSelector,
  selectPort,
  setPortName,
  setPortsS3,
  unsetScatteringValue,
} from '../../../../store/projectSlice';
import noPhysicsIcon from '../../../../../../../assets/noPhysicsIcon.png';
import noPhysicsIconDark from '../../../../../../../assets/noPhysicsIconDark.png';
import { useEffectNotOnMount } from '../../../../hook/useEffectNotOnMount';
import { isTerminationNameValid } from './portManagement/selectPorts/portLumpedProbeGenerator';
import { DebounceInput } from 'react-debounce-input';
import toast from 'react-hot-toast';
import { MdDeleteSweep } from 'react-icons/md';
import { deleteFileS3 } from '../../../../aws/mesherAPIs';
import { savePortsOnS3 } from './savePortsOnS3';
import { isConfirmedInfoModalSelector, setIsAlertInfoModal, setMessageInfoModal, setShowInfoModal, ThemeSelector } from '../../../../store/tabsAndMenuItemsSlice';
import { useDynamoDBQuery } from '../../../../../dynamoDB/hook/useDynamoDBQuery';
import { createOrUpdateProjectInDynamoDB } from '../../../../../dynamoDB/projectsFolderApi';

interface PhysicsLeftPanelTabProps {}

export const PhysicsLeftPanelTab: React.FC<PhysicsLeftPanelTabProps> = () => {
  const dispatch = useDispatch();
  const selectedProject = useSelector(selectedProjectSelector);
  const [portRename, setPortRename] = useState('');
  const { execQuery2 } = useDynamoDBQuery();
  const isConfirmedInfoModal = useSelector(isConfirmedInfoModalSelector)
  const [deleteAllType, setDeleteAllType] = useState<string | undefined>(undefined)

  // useEffectNotOnMount(() => {
  //   selectedProject?.ports.filter((p) => p.category === 'port').length === 0 &&
  //     dispatch(unsetScatteringValue());
  // }, [selectedProject?.ports.length]);

  useEffect(() => {
    if(isConfirmedInfoModal && selectedProject && deleteAllType === "port"){
      dispatch(deleteAllPorts());
      let ports = selectedProject.ports.filter(
        (p) => p.category !== 'port',
      );
      if (ports.length > 0) {
        savePortsOnS3(ports, selectedProject, dispatch, execQuery2);
      } else {
        if(selectedProject.portsS3){
          deleteFileS3(selectedProject.portsS3 as string);
        }
        dispatch(setPortsS3(undefined));
        execQuery2(
          createOrUpdateProjectInDynamoDB,
          {
            ...selectedProject,
            portsS3: null,
          },
          dispatch,
        ).then(() => {});
      }
    } else if(isConfirmedInfoModal && selectedProject && deleteAllType === "lumped"){
      dispatch(deleteAllLumped());
      let ports = selectedProject.ports.filter(
        (p) => p.category !== 'lumped',
      );
      if (ports.length > 0) {
        savePortsOnS3(ports, selectedProject, dispatch, execQuery2);
      } else {
        if(selectedProject.portsS3){
          deleteFileS3(selectedProject.portsS3 as string);
        }
        dispatch(setPortsS3(undefined));
        execQuery2(
          createOrUpdateProjectInDynamoDB,
          {
            ...selectedProject,
            portsS3: null,
          },
          dispatch,
        ).then(() => {});
      }
    }
  }, [isConfirmedInfoModal, deleteAllType])

  const theme = useSelector(ThemeSelector)


  return (
    <>
      {selectedProject && selectedProject.ports.length !== 0 ? (
        <div className={`lg:max-h-[150px] overflow-y-scroll bg-white border ${theme === 'light' ? 'border-secondaryColor bg-[#f6f6f6]' : 'border-white bg-bgColorDark'} mt-3 rounded px-5 py-5`}>
          <div className="flex flex-row items-center justify-between">
            <span className="font-bold">Terminations</span>
            <div className="flex flex-row items-center gap-8">
              <div
                className="w-[15%] tooltip tooltip-left hover:cursor-pointer"
                data-tip="Delete all ports"
                onClick={() => {
                  setDeleteAllType("port")
                  dispatch(
                    setMessageInfoModal(
                      'Are you sure to delete all ports?',
                    ),
                  );
                  dispatch(setIsAlertInfoModal(false));
                  dispatch(setShowInfoModal(true));
                }}
              >
                <MdDeleteSweep
                  color="#d80233"
                  style={{ width: '20px', height: '20px' }}
                  className="hover:opacity-50"
                />
              </div>
              <div
                className="w-[15%] tooltip tooltip-left hover:cursor-pointer"
                data-tip="Delete all lumped"
                onClick={() => {
                  setDeleteAllType("lumped")
                  dispatch(
                    setMessageInfoModal(
                      'Are you sure to delete all lumped?',
                    ),
                  );
                  dispatch(setIsAlertInfoModal(false));
                  dispatch(setShowInfoModal(true));
                }}
              >
                <MdDeleteSweep
                  color="violet"
                  style={{ width: '20px', height: '20px' }}
                  className="hover:opacity-50"
                />
              </div>
            </div>
          </div>
          <hr className="border-[1px] border-gray-300 w-full mb-2 mt-1" />
          <ul className="list-none pl-3 mb-0">
            {selectedProject.ports &&
              selectedProject.ports.map((port) => {
                let portColor = 'orange';
                if (port.category === 'lumped') {
                  portColor = 'violet';
                } else if (port.category === 'port') {
                  portColor = 'red';
                }
                return (
                  <li
                    key={port.name}
                    className={
                      port.isSelected
                        ? `mt-[5px] rounded ${theme === 'light' ? 'bg-gray-200 hover:bg-gray-200' : 'bg-bgColorDark hover:bg-bgColorDark'} hover:cursor-pointer hover:rounded`
                        : `mt-[5px] ${theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-bgColorDark'} hover:cursor-pointer hover:rounded`
                    }
                    onClick={() => {
                      dispatch(selectPort(port.name));
                    }}
                  >
                    <div className="flex items-center">
                      <div className="w-[10%]">
                        <FaReact
                          color={portColor}
                          style={{ width: '20px', height: '20px' }}
                        />
                      </div>
                      <div className="w-[75%] text-start">
                        <h5 className="text-[15px] font-normal">{port.name}</h5>
                      </div>
                      {port.isSelected &&
                        !selectedProject.simulation?.results && (
                          <div className="flex">
                            <div
                              className="w-[15%] tooltip mr-5"
                              data-tip="Rename"
                            >
                              <label
                                htmlFor="modalRename"
                                onClick={() => setPortRename(port.name)}
                              >
                                <BiRename
                                  color="#464847"
                                  style={{ width: '20px', height: '20px' }}
                                />
                              </label>
                            </div>
                            <input
                              type="checkbox"
                              id="modalRename"
                              className="modal-toggle"
                            />
                            <div className={`modal`}>
                              <div className={`modal-box ${theme === 'light' ? '' : 'bg-bgColorDark2 text-textColorDark'}`}>
                                <h3 className="font-bold text-lg">
                                  Rename Port
                                </h3>
                                <div className="flex justify-center items-center py-5">
                                  <DebounceInput
                                    debounceTimeout={500}
                                    type="text"
                                    placeholder="Type here"
                                    className={`input input-bordered w-full max-w-xs ${theme === 'light' ? 'bg-white text-textColor' : 'bg-bgColorDark text-textColorDark'}`}
                                    value={portRename}
                                    onChange={(e) =>
                                      setPortRename(e.target.value)
                                    }
                                  />
                                </div>
                                <div className="modal-action flex justify-between">
                                  <label
                                    htmlFor="modalRename"
                                    className="btn h-[2rem] min-h-[2rem] bg-red-500 border-red-500"
                                  >
                                    Cancel
                                  </label>
                                  <label
                                    htmlFor="modalRename"
                                    className="btn h-[2rem] min-h-[2rem]"
                                    onClick={() => {
                                      if (
                                        isTerminationNameValid(
                                          portRename,
                                          selectedProject.ports,
                                        )
                                      ) {
                                        dispatch(setPortName(portRename));
                                        let ports = selectedProject.ports.map(
                                          (p) => {
                                            if (p.isSelected) {
                                              return { ...p, name: portRename };
                                            } else {
                                              return p;
                                            }
                                          },
                                        );
                                        savePortsOnS3(
                                          ports,
                                          selectedProject,
                                          dispatch,
                                          execQuery2,
                                        );
                                      } else {
                                        toast.error(
                                          'Name already set! Please choose another one',
                                        );
                                      }
                                    }}
                                  >
                                    Rename
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div
                              className="w-[15%] tooltip"
                              data-tip="Delete"
                              onClick={() => {
                                dispatch(deletePort(port.name));
                                let ports = selectedProject.ports.filter(
                                  (p) => p.name !== port.name,
                                );
                                if (ports.length > 0) {
                                  savePortsOnS3(
                                    ports,
                                    selectedProject,
                                    dispatch,
                                    execQuery2,
                                  );
                                } else {
                                  if(selectedProject.portsS3){
                                    deleteFileS3(
                                      selectedProject.portsS3 as string,
                                    );
                                  }
                                  dispatch(setPortsS3(undefined));
                                  execQuery2(
                                    createOrUpdateProjectInDynamoDB,
                                    {
                                      ...selectedProject,
                                      portsS3: null,
                                    },
                                    dispatch,
                                  ).then(() => {});
                                }
                              }}
                            >
                              <IoTrashOutline
                                color="#d80233"
                                style={{ width: '20px', height: '20px' }}
                              />
                            </div>
                          </div>
                        )}
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
      ) : (
        // <div className="text-center">
        //   <img
        //     src={theme === 'light' ? noPhysicsIcon : noPhysicsIconDark}
        //     className="mx-auto xl:mt-[20px] w-1/4"
        //     alt="No Physics"
        //   />
        //   <h5 className="lg:text-sm xl:text-xl">No Physics applied</h5>
        //   <p className="mt-[20px] text-sm">
        //     Add ports or lumpeds and apply them to geometry in the 3D View.
        //   </p>
        // </div>
        <></>
      )}
    </>
  );
};
