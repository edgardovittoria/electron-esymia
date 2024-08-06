import React, { useState, CSSProperties, FC } from 'react';

import {
  useCSVReader,
  lightenDarkenColor,
  formatFileSize,
} from 'react-papaparse';
import { Vector3 } from 'three';
import {
  addPorts,
  boundingBoxDimensionSelector,
  selectedProjectSelector,
} from '../../../../store/projectSlice';
import { useDispatch, useSelector } from 'react-redux';
import {
  generateTerminationName,
  getDefaultPort,
} from './portManagement/selectPorts/portLumpedProbeGenerator';
import { BsFiletypeCsv } from 'react-icons/bs';

const GREY = '#CCC';
const GREY_LIGHT = 'rgba(255, 255, 255, 0.4)';
const DEFAULT_REMOVE_HOVER_COLOR = '#A01919';
const REMOVE_HOVER_COLOR_LIGHT = lightenDarkenColor(
  DEFAULT_REMOVE_HOVER_COLOR,
  40,
);
const GREY_DIM = '#686868';

const styles = {
  zone: {
    alignItems: 'center',
    borderRadius: 5,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 6,
    paddingBottom: 6,
    background: 'white'
  } as CSSProperties,
  file: {
    background: 'linear-gradient(to bottom, #EEE, #DDD)',
    borderRadius: 10,
    display: 'flex',
    height: 100,
    width: '100%',
    position: 'relative',
    zIndex: 10,
    flexDirection: 'column',
    justifyContent: 'center',
  } as CSSProperties,
  info: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 10,
    marginRight: 10,
  } as CSSProperties,
  size: {
    marginBottom: '0.5em',
    justifyContent: 'center',
    display: 'flex',
    fontSize: 12,
  } as CSSProperties,
  name: {
    backgroundColor: GREY_LIGHT,
    borderRadius: 3,
    padding: 9,
    fontSize: 10,
    marginBottom: '0.5em',
  } as CSSProperties,
  progressBar: {
    bottom: 14,
    position: 'absolute',
    width: '100%',
    paddingLeft: 10,
    paddingRight: 10,
  } as CSSProperties,
  zoneHover: {
    borderColor: GREY_DIM,
  } as CSSProperties,
  default: {
    borderColor: GREY,
  } as CSSProperties,
  remove: {
    height: 23,
    position: 'absolute',
    right: 6,
    top: 6,
    width: 23,
  } as CSSProperties,
};

export const PortImportFromCSV:FC = () => {
  const { CSVReader } = useCSVReader();
  const [zoneHover, setZoneHover] = useState(false);
  const [removeHoverColor, setRemoveHoverColor] = useState(
    DEFAULT_REMOVE_HOVER_COLOR,
  );
  const size = useSelector(boundingBoxDimensionSelector);
  const selectedProject = useSelector(selectedProjectSelector);
  const dispatch = useDispatch();

  type CSVDataRow = {
    name?: string;
    x1: string;
    y1: string;
    z1: string;
    x2: string;
    y2: string;
    z2: string;
  };

  const isValidThis = (dataElement: CSVDataRow) => {
    if (
      dataElement.x1 === '' ||
      dataElement.x2 === '' ||
      dataElement.y1 === '' ||
      dataElement.y2 === '' ||
      dataElement.z1 === '' ||
      dataElement.z2 === ''
    ) {
      return false;
    }
    return true;
  };

  return (
    <CSVReader
      config={{ header: true }}
      onUploadAccepted={(results: any) => {
        if (selectedProject) {
          results.data.forEach((pdata: CSVDataRow) => {
            if (isValidThis(pdata)) {
              let port = getDefaultPort(
                pdata.name !== undefined
                  ? pdata.name
                  : generateTerminationName(selectedProject.ports, 'port'),
                size as number,
                new Vector3(0, 0, 0),
              );
              port.inputElement.transformationParams.position = [
                parseFloat(pdata.x1),
                parseFloat(pdata.y1),
                parseFloat(pdata.z1),
              ];
              port.inputElement.previousTransformationParams.position = [
                parseFloat(pdata.x1),
                parseFloat(pdata.y1),
                parseFloat(pdata.z1),
              ];
              port.outputElement.transformationParams.position = [
                parseFloat(pdata.x2),
                parseFloat(pdata.y2),
                parseFloat(pdata.z2),
              ];
              port.outputElement.previousTransformationParams.position = [
                parseFloat(pdata.x2),
                parseFloat(pdata.y2),
                parseFloat(pdata.z2),
              ];
              dispatch(addPorts(port));
            }
          });
        }
        setZoneHover(false);
      }}
      onDragOver={(event: DragEvent) => {
        event.preventDefault();
        setZoneHover(true);
      }}
      onDragLeave={(event: DragEvent) => {
        event.preventDefault();
        setZoneHover(false);
      }}
      noDrag
    >
      {({
        getRootProps,
        acceptedFile,
        ProgressBar,
        getRemoveFileProps,
        Remove,
      }: any) => (
        <>
          <div
            {...getRootProps()}
            className='hover:cursor-pointer'
            style={Object.assign(
              {},
              styles.zone,
              zoneHover && styles.zoneHover,
            )}
          >
            {acceptedFile ? (
              <>
                <div style={styles.file}>
                  <div style={styles.info}>
                    <span style={styles.size}>
                      {formatFileSize(acceptedFile.size)}
                    </span>
                    <span style={styles.name}>{acceptedFile.name}</span>
                  </div>
                  <div style={styles.progressBar}>
                    <ProgressBar />
                  </div>
                  <div
                    {...getRemoveFileProps()}
                    style={styles.remove}
                    onMouseOver={(event: Event) => {
                      event.preventDefault();
                      setRemoveHoverColor(REMOVE_HOVER_COLOR_LIGHT);
                    }}
                    onMouseOut={(event: Event) => {
                      event.preventDefault();
                      setRemoveHoverColor(DEFAULT_REMOVE_HOVER_COLOR);
                    }}
                  >
                    <Remove color={removeHoverColor} />
                  </div>
                </div>
              </>
            ) : (
              <div className='flex flex-row gap-2 items-center'>
              <BsFiletypeCsv style={{ width: '20px', height: '20px' }} />
              <span >Import Ports</span>
            </div>
            )}
          </div>
        </>
      )}
    </CSVReader>
  );
};
