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
} from '../../../../store/projectSlice';
import { isTerminationNameValid } from './portManagement/selectPorts/portLumpedProbeGenerator';
import toast from 'react-hot-toast';
import { MdDeleteSweep } from 'react-icons/md';
import { deleteFileS3 } from '../../../../aws/mesherAPIs';
import { savePortsOnS3 } from './savePortsOnS3';
import { isConfirmedInfoModalSelector, setIsAlertInfoModal, setMessageInfoModal, setShowInfoModal, ThemeSelector } from '../../../../store/tabsAndMenuItemsSlice';
import { useDynamoDBQuery } from '../../../../../dynamoDB/hook/useDynamoDBQuery';
import { createOrUpdateProjectInDynamoDB } from '../../../../../dynamoDB/projectsFolderApi';

interface PhysicsLeftPanelTabProps { }

export const PhysicsLeftPanelTab: React.FC<PhysicsLeftPanelTabProps> = () => {
  const dispatch = useDispatch();
  const selectedProject = useSelector(selectedProjectSelector);
  const [portRename, setPortRename] = useState('');
  const { execQuery2 } = useDynamoDBQuery();
  const isConfirmedInfoModal = useSelector(isConfirmedInfoModalSelector)
  const [deleteAllType, setDeleteAllType] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (isConfirmedInfoModal && selectedProject && deleteAllType === "port") {
      dispatch(deleteAllPorts());
      let ports = selectedProject.ports.filter(
        (p) => p.category !== 'port',
      );
      if (ports.length > 0) {
        savePortsOnS3(ports, selectedProject, dispatch, execQuery2);
      } else {
        if (selectedProject.portsS3) {
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
        ).then(() => { });
      }
    } else if (isConfirmedInfoModal && selectedProject && deleteAllType === "lumped") {
      dispatch(deleteAllLumped());
      let ports = selectedProject.ports.filter(
        (p) => p.category !== 'lumped',
      );
      if (ports.length > 0) {
        savePortsOnS3(ports, selectedProject, dispatch, execQuery2);
      } else {
        if (selectedProject.portsS3) {
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
        ).then(() => { });
      }
    }
  }, [isConfirmedInfoModal, deleteAllType])

  const theme = useSelector(ThemeSelector)


  return (
    <>
      {selectedProject && selectedProject.ports.length !== 0 ? (
        <div className={`mt-4 rounded-xl border ${theme === 'light' ? 'bg-white/50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
          <div className="p-4 border-b border-gray-200/50 dark:border-white/10 flex flex-row items-center justify-between">
            <span className={`text-sm font-bold ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>Terminations</span>
            <div className="flex flex-row items-center gap-2">
              <button
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
                disabled={selectedProject.simulation?.status === "Completed"}
                title="Delete all ports"
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
                  className="w-5 h-5 text-red-500 group-hover:text-red-600 transition-colors"
                />
              </button>
              <button
                className="p-1.5 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
                disabled={selectedProject.simulation?.status === "Completed"}
                title="Delete all lumped"
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
                  className="w-5 h-5 text-violet-500 group-hover:text-violet-600 transition-colors"
                />
              </button>
            </div>
          </div>

          <div className="max-h-[200px] overflow-y-auto custom-scrollbar p-2">
            <ul className="space-y-1">
              {selectedProject.ports &&
                selectedProject.ports.map((port) => {
                  let portColor = 'text-orange-500';
                  if (port.category === 'lumped') {
                    portColor = 'text-violet-500';
                  } else if (port.category === 'port') {
                    portColor = 'text-red-500';
                  }
                  return (
                    <li
                      key={port.name}
                      className={`
                        group flex items-center justify-between p-2 rounded-lg transition-all duration-200 cursor-pointer
                        ${port.isSelected
                          ? (theme === 'light' ? 'bg-blue-50 border-blue-100' : 'bg-blue-500/20 border-blue-500/30')
                          : (theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-white/5')
                        }
                        border border-transparent
                      `}
                      onClick={() => {
                        dispatch(selectPort(port.name));
                      }}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FaReact className={`w-4 h-4 flex-shrink-0 ${portColor}`} />
                        <span className={`text-sm truncate ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>
                          {port.name}
                        </span>
                      </div>

                      {port.isSelected && !selectedProject.simulation?.results && (
                        <div className="flex items-center gap-1 opacity-100 transition-opacity">
                          <label
                            htmlFor="modalRename"
                            className={`p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-white/10 cursor-pointer transition-colors`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setPortRename(port.name);
                            }}
                            title="Rename"
                          >
                            <BiRename className={`w-4 h-4 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`} />
                          </label>

                          <button
                            className={`p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer transition-colors`}
                            onClick={(e) => {
                              e.stopPropagation();
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
                                if (selectedProject.portsS3) {
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
                                ).then(() => { });
                              }
                            }}
                            title="Delete"
                          >
                            <IoTrashOutline className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
            </ul>
          </div>

          {/* Rename Modal */}
          <input type="checkbox" id="modalRename" className="modal-toggle" />
          <div className="modal backdrop-blur-sm">
            <div className={`modal-box p-6 rounded-2xl shadow-2xl border ${theme === 'light' ? 'bg-white border-gray-100' : 'bg-gray-900 border-gray-700'}`}>
              <h3 className={`font-bold text-lg mb-6 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                Rename Port
              </h3>

              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Enter new name"
                  className={`w-full p-3 rounded-xl outline-none border transition-all ${theme === 'light'
                      ? 'bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800'
                      : 'bg-black/20 border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white'
                    }`}
                  value={portRename}
                  onChange={(e) => setPortRename(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3">
                <label
                  htmlFor="modalRename"
                  className={`px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-colors ${theme === 'light'
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                >
                  Cancel
                </label>
                <label
                  htmlFor="modalRename"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30 cursor-pointer transition-all"
                  onClick={() => {
                    if (isTerminationNameValid(portRename, selectedProject.ports)) {
                      dispatch(setPortName(portRename));
                      let ports = selectedProject.ports.map((p) => {
                        if (p.isSelected) {
                          return { ...p, name: portRename };
                        } else {
                          return p;
                        }
                      });
                      savePortsOnS3(ports, selectedProject, dispatch, execQuery2);
                    } else {
                      toast.error('Name already set! Please choose another one');
                    }
                  }}
                >
                  Rename
                </label>
              </div>
            </div>
            <label className="modal-backdrop" htmlFor="modalRename">Close</label>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
