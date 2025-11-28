import { useState, FC } from 'react';

import {
  useCSVReader,
} from 'react-papaparse';
import { Vector3 } from 'three';
import {
  addPorts,
  selectedProjectSelector,
  setFrequencies,
  setScatteringValue,
} from '../../../../store/projectSlice';
import { useDispatch, useSelector } from 'react-redux';
import {
  generateTerminationName,
  getDefaultLumped,
  getDefaultPort,
} from './portManagement/selectPorts/portLumpedProbeGenerator';
import { BsFiletypeCsv } from 'react-icons/bs';
import { Port, Probe } from '../../../../model/esymiaModels';
import { savePortsOnS3 } from './savePortsOnS3';
import { ThemeSelector } from '../../../../store/tabsAndMenuItemsSlice';
import { useDynamoDBQuery } from '../../../../../dynamoDB/hook/useDynamoDBQuery';
import { createOrUpdateProjectInDynamoDB } from '../../../../../dynamoDB/projectsFolderApi';

export const LumpedImportFromCSV: FC = () => {
  const { CSVReader } = useCSVReader();
  const selectedProject = useSelector(selectedProjectSelector);
  const dispatch = useDispatch();
  const { execQuery2 } = useDynamoDBQuery();
  const theme = useSelector(ThemeSelector);

  type CSVDataRow = {
    name?: string;
    x1: string;
    y1: string;
    z1: string;
    x2: string;
    y2: string;
    z2: string;
    type: string;
    R: string;
    L: string;
    C: string;
  };

  const isValidThis = (dataElement: CSVDataRow) => {
    if (
      (dataElement.x1 === '' || dataElement.x1 === undefined) ||
      (dataElement.x2 === '' || dataElement.x2 === undefined) ||
      (dataElement.y1 === '' || dataElement.y1 === undefined) ||
      (dataElement.y2 === '' || dataElement.y2 === undefined) ||
      (dataElement.z1 === '' || dataElement.z1 === undefined) ||
      (dataElement.z2 === '' || dataElement.z2 === undefined) ||
      (dataElement.R === '' || dataElement.R === undefined) ||
      (dataElement.L === '' || dataElement.L === undefined) ||
      (dataElement.C === '' || dataElement.C === undefined) ||
      (dataElement.type === '' || dataElement.type === undefined)
    ) {
      return false;
    }
    return true;
  };

  return (
    <CSVReader
      config={{ header: true }}
      disabled={selectedProject?.simulation?.resultS3}
      onUploadAccepted={(data: any) => {
        if (selectedProject) {
          let ports: (Port | Probe)[] = [...selectedProject.ports]
          data.data.forEach((pdata: CSVDataRow) => {
            console.log(pdata)
            if (isValidThis(pdata)) {
              let port = getDefaultLumped(
                pdata.name !== undefined
                  ? pdata.name
                  : generateTerminationName(selectedProject.ports, 'lumped'),
                new Vector3(0, 0, 0),
              );
              port.inputElement = [
                parseFloat(pdata.x1),
                parseFloat(pdata.y1),
                parseFloat(pdata.z1),
              ];
              port.outputElement = [
                parseFloat(pdata.x2),
                parseFloat(pdata.y2),
                parseFloat(pdata.z2),
              ];
              port.type = parseInt(pdata.type);
              port.rlcParams.resistance = parseFloat(pdata.R);
              port.rlcParams.inductance = parseFloat(pdata.L);
              port.rlcParams.capacitance = parseFloat(pdata.C);
              dispatch(addPorts(port));
              ports.push(port)
            }
          });
          savePortsOnS3(ports, selectedProject, dispatch, execQuery2)
        }
      }}
      noDrag
    >
      {({
        getRootProps,
        acceptedFile,
      }: any) => (
        <div
          {...getRootProps()}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 cursor-pointer ${theme === 'light'
              ? 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white hover:border-blue-500 hover:text-blue-600 hover:shadow-md'
              : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-blue-400 hover:text-blue-400'
            } ${selectedProject?.simulation?.resultS3 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <BsFiletypeCsv size={20} />
          <span className="text-sm font-medium">
            {acceptedFile ? acceptedFile.name : 'Import Lumped'}
          </span>
        </div>
      )}
    </CSVReader>
  );
};

export const PortImportFromCSV: FC = () => {
  const { CSVReader } = useCSVReader();
  const selectedProject = useSelector(selectedProjectSelector);
  const dispatch = useDispatch();
  const { execQuery2 } = useDynamoDBQuery();
  const theme = useSelector(ThemeSelector);

  type CSVDataRow = {
    name?: string;
    x1: string;
    y1: string;
    z1: string;
    x2: string;
    y2: string;
    z2: string;
    scattering?: string
  };

  const isValidThis = (dataElement: CSVDataRow) => {
    if (
      (dataElement.x1 === '' || dataElement.x1 === undefined) ||
      (dataElement.x2 === '' || dataElement.x2 === undefined) ||
      (dataElement.y1 === '' || dataElement.y1 === undefined) ||
      (dataElement.y2 === '' || dataElement.y2 === undefined) ||
      (dataElement.z1 === '' || dataElement.z1 === undefined) ||
      (dataElement.z2 === '' || dataElement.z2 === undefined)
    ) {
      return false;
    }
    return true;
  };

  return (
    <CSVReader
      config={{ header: true }}
      disabled={selectedProject?.simulation?.resultS3}
      onUploadAccepted={(results: any) => {
        if (selectedProject) {
          let ports: (Port | Probe)[] = [...selectedProject.ports]
          let scatteringNotYetSet = true
          console.log(results.data)
          results.data.forEach((pdata: CSVDataRow) => {
            if (isValidThis(pdata)) {
              let port = getDefaultPort(
                pdata.name !== undefined
                  ? pdata.name
                  : generateTerminationName(selectedProject.ports, 'port'),
                new Vector3(0, 0, 0),
              );
              port.inputElement = [
                parseFloat(pdata.x1),
                parseFloat(pdata.y1),
                parseFloat(pdata.z1),
              ];
              port.outputElement = [
                parseFloat(pdata.x2),
                parseFloat(pdata.y2),
                parseFloat(pdata.z2),
              ];
              dispatch(addPorts(port));
              if (pdata.scattering !== undefined && scatteringNotYetSet) {
                dispatch(setScatteringValue(parseFloat(pdata.scattering)))
                scatteringNotYetSet = false
              }
              ports.push(port)
            }
          });
          savePortsOnS3(ports, selectedProject, dispatch, execQuery2)
        }
      }}
      noDrag
    >
      {({
        getRootProps,
        acceptedFile,
      }: any) => (
        <div
          {...getRootProps()}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 cursor-pointer ${theme === 'light'
              ? 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white hover:border-blue-500 hover:text-blue-600 hover:shadow-md'
              : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-blue-400 hover:text-blue-400'
            } ${selectedProject?.simulation?.resultS3 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <BsFiletypeCsv size={20} />
          <span className="text-sm font-medium">
            {acceptedFile ? acceptedFile.name : 'Import Ports'}
          </span>
        </div>
      )}
    </CSVReader>
  );
};

export const FrequenciesImportFromCSV: FC = () => {
  const { CSVReader } = useCSVReader();
  const selectedProject = useSelector(selectedProjectSelector);
  const dispatch = useDispatch();
  const { execQuery2 } = useDynamoDBQuery();
  const theme = useSelector(ThemeSelector);

  type CSVDataRow = {
    Frequencies: string
  };

  const isValidThis = (dataElement: CSVDataRow) => {
    if (
      (dataElement.Frequencies === "" || dataElement.Frequencies === undefined)
    ) {
      return false;
    }
    return true;
  };

  return (
    <CSVReader
      config={{ header: true }}
      disabled={selectedProject?.simulation?.resultS3}
      onUploadAccepted={(results: any) => {
        if (selectedProject) {
          let frequencies: number[] = []
          results.data.forEach((pdata: CSVDataRow) => {
            if (isValidThis(pdata)) {
              frequencies.push(parseFloat(pdata.Frequencies))
            }
          });
          if (frequencies.length > 0) {
            dispatch(setFrequencies(frequencies))
            execQuery2(
              createOrUpdateProjectInDynamoDB,
              {
                ...selectedProject,
                frequencies: frequencies
              },
              dispatch,
            ).then(() => { });
          }
        }
      }}
      noDrag
    >
      {({
        getRootProps,
        acceptedFile,
      }: any) => (
        <div
          {...getRootProps()}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 cursor-pointer ${theme === 'light'
              ? 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white hover:border-blue-500 hover:text-blue-600 hover:shadow-md'
              : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-blue-400 hover:text-blue-400'
            } ${selectedProject?.simulation?.resultS3 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <BsFiletypeCsv size={20} />
          <span className="text-sm font-medium">
            {acceptedFile ? acceptedFile.name : 'Import Frequencies'}
          </span>
        </div>
      )}
    </CSVReader>
  );
};
