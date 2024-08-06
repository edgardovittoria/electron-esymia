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
  getDefaultLumped,
  getDefaultPort,
} from './portManagement/selectPorts/portLumpedProbeGenerator';

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
    border: `2px dashed ${GREY}`,
    borderRadius: 20,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
    padding: 20,
  } as CSSProperties,
  file: {
    background: 'linear-gradient(to bottom, #EEE, #DDD)',
    borderRadius: 20,
    display: 'flex',
    height: 120,
    width: 120,
    position: 'relative',
    zIndex: 10,
    flexDirection: 'column',
    justifyContent: 'center',
  } as CSSProperties,
  info: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: 10,
    paddingRight: 10,
  } as CSSProperties,
  size: {
    backgroundColor: GREY_LIGHT,
    borderRadius: 3,
    marginBottom: '0.5em',
    justifyContent: 'center',
    display: 'flex',
  } as CSSProperties,
  name: {
    backgroundColor: GREY_LIGHT,
    borderRadius: 3,
    fontSize: 12,
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

export const LumpedImportFromCSV: FC = () => {
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
    type: string;
    R: string;
    L: string;
    C: string;
  };

  const isValidThis = (dataElement: CSVDataRow) => {
    if (
      dataElement.x1 === '' ||
      dataElement.x2 === '' ||
      dataElement.y1 === '' ||
      dataElement.y2 === '' ||
      dataElement.z1 === '' ||
      dataElement.z2 === '' ||
      dataElement.R === '' ||
      dataElement.L === '' ||
      dataElement.C === '' ||
      dataElement.type === ''
    ) {
      return false;
    }
    return true;
  };

  return (
    <CSVReader
      config={{ header: true }}
      onUploadAccepted={(data: any) => {
        if (selectedProject) {
          data.data.forEach((pdata: CSVDataRow) => {
            if(isValidThis(pdata)){
              let port = getDefaultLumped(
                pdata.name !== undefined
                  ? pdata.name
                  : generateTerminationName(selectedProject.ports, 'lumped'),
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
              port.type = parseInt(pdata.type);
              port.rlcParams.resistance = parseFloat(pdata.R);
              port.rlcParams.inductance = parseFloat(pdata.L);
              port.rlcParams.capacitance = parseFloat(pdata.C);
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
              'Lumped from CSV'
            )}
          </div>
        </>
      )}
    </CSVReader>
  );
};
