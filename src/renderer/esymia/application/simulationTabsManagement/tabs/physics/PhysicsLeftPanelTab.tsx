import React, { useState } from 'react';
import { FaReact } from 'react-icons/fa6';
import { IoTrashOutline } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { BiRename } from 'react-icons/bi';
import {
  deletePort,
  selectedProjectSelector,
  selectPort,
  setPortName,
  unsetScatteringValue,
} from '../../../../store/projectSlice';
import noPhysicsIcon from '../../../../../../../assets/noPhysicsIcon.png';
import { useEffectNotOnMount } from '../../../../hook/useEffectNotOnMount';
import { isTerminationNameValid } from './portManagement/selectPorts/portLumpedProbeGenerator';
import { DebounceInput } from 'react-debounce-input';
import toast from 'react-hot-toast';

interface PhysicsLeftPanelTabProps {}

export const PhysicsLeftPanelTab: React.FC<PhysicsLeftPanelTabProps> = () => {
  const dispatch = useDispatch();
  const selectedProject = useSelector(selectedProjectSelector);
  const [portRename, setPortRename] = useState('');

  useEffectNotOnMount(() => {
    selectedProject?.ports.filter(p => p.category === "port").length === 0 && dispatch(unsetScatteringValue())
  }, [selectedProject?.ports.length])

  return (
    <>
      {selectedProject && selectedProject.ports.length !== 0 ? (
        <div className="text-center lg:max-h-[150px] xl:max-h-[300px] xl:h-[300px] overflow-y-scroll">
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
                        ? 'mt-[5px] rounded bg-gray-200 hover:bg-gray-200 hover:cursor-pointer hover:rounded'
                        : 'mt-[5px] hover:bg-gray-200 hover:cursor-pointer hover:rounded'
                    }
                    onClick={() => {
                      dispatch(selectPort(port.name))
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
                      {port.isSelected && !selectedProject.simulation?.results && (
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
                          <div className="modal">
                            <div className="modal-box">
                              <h3 className="font-bold text-lg">Rename Port</h3>
                              <div className="flex justify-center items-center py-5">
                                <DebounceInput
                                  debounceTimeout={500}
                                  type="text"
                                  placeholder="Type here"
                                  className="input input-bordered w-full max-w-xs"
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
                                  onClick={() =>
                                    isTerminationNameValid(portRename, selectedProject.ports) ? dispatch(setPortName(portRename)) : toast.error('Name already set! Please choose another one')
                                  }
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
        <div className="text-center lg:max-h-[150px] xl:max-h-[300px] xl:h-[300px] lg:overflow-y-scroll xl:overflow-y-hidden">
          <img
            src={noPhysicsIcon}
            className="mx-auto xl:mt-[20px] w-1/2"
            alt="No Physics"
          />
          <h5 className="lg:text-sm xl:text-xl">No Physics applied</h5>
          <p className="mt-[20px] text-sm">
            Select a tool from the Physics Toolbar and apply it to geometry in
            the 3D View.
          </p>
        </div>
      )}
    </>
  );
};
