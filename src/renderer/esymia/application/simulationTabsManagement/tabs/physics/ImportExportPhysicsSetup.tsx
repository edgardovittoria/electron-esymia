import { FC, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Port,
  Probe,
  Project,
  TempLumped,
} from '../../../../model/esymiaModels';
import {
  addPorts,
  selectedProjectSelector,
  setFrequencies,
  setScatteringValue,
} from '../../../../store/projectSlice';
import { BiExport, BiImport } from 'react-icons/bi';
import { exportToJsonFileThis } from '../../sharedElements/utilityFunctions';
import {
  generateTerminationName,
  isTerminationNameValid,
} from './portManagement/selectPorts/portLumpedProbeGenerator';
import { updateProjectInFauna } from '../../../../faunadb/projectsFolderAPIs';
import { convertInFaunaProjectThis } from '../../../../faunadb/apiAuxiliaryFunctions';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import { jsonToCSV } from 'react-papaparse';
import { BsFiletypeCsv } from 'react-icons/bs';
import { useFaunaQuery } from '../../../../faunadb/hook/useFaunaQuery';
import { ThemeSelector } from '../../../../store/tabsAndMenuItemsSlice';

export const ImportExportPhysicsSetup: FC<{}> = () => {
  const selectedProject = useSelector(selectedProjectSelector) as Project;
  const dispatch = useDispatch();
  const inputRefPhysics = useRef(null);
  const { execQuery } = useFaunaQuery();

  const onImportPhysicsClick = () => {
    let input = inputRefPhysics.current;
    if (input) {
      (input as HTMLInputElement).click();
    }
  };
  return (
    <>
      {/* <div className="tooltip" data-tip="Import Physics">
                <button
                    disabled={selectedProject.simulation?.status === "Completed"}
                    className={`bg-white rounded p-2 ${selectedProject.simulation?.status === "Completed" && 'opacity-40'}`}
                    onClick={onImportPhysicsClick}>
                    <BiImport className="h-5 w-5 text-green-300 hover:text-secondaryColor"/>
                    <input
                        type="file"
                        ref={inputRefPhysics}
                        style={{display: "none"}}
                        accept="application/json"
                        onChange={(e) => {
                            let files = e.target.files;
                            files &&
                            files[0].text().then((value) => {
                                let physics: {
                                    ports?: (Port | Probe | TempLumped)[],
                                    frequencies?: number[] | undefined,
                                    portScatteringValue?: number,
                                    portKey?: number
                                } = JSON.parse(value);
                                physics.ports && physics.ports.length > 0 && physics.ports.forEach((p) => {
                                  isTerminationNameValid(p.name, selectedProject.ports) ? dispatch(addPorts(p)) : dispatch(addPorts({...p, name:generateTerminationName(selectedProject.ports, p.category)}))
                                });
                                physics.frequencies && dispatch(setFrequencies(physics.frequencies));
                                physics.portScatteringValue && dispatch(setScatteringValue(physics.portScatteringValue))
                                e.target.value = ""
                                execQuery(
                                    updateProjectInFauna,
                                    convertInFaunaProjectThis({
                                      ...selectedProject,
                                      frequencies: physics.frequencies,
                                      ports: physics.ports,
                                      scatteringValue: physics.portScatteringValue,
                                      portKey: physics.portKey
                                    } as Project),
                                    dispatch
                                  ).then()
                            });
                        }}
                    />
                </button>
            </div> */}
      <div className="tooltip" data-tip="Export Physics">
        {/* <button
          // disabled={
          //     !(selectedProject &&
          //         (selectedProject.ports.length > 0 || selectedProject.frequencies))
          // }
          disabled={true}
          className="bg-white rounded p-2 disabled:opacity-50"
          onClick={() => {
            let physics = {
              ports: selectedProject.ports,
              frequencies: selectedProject.frequencies,
              portScatteringValue: selectedProject.scatteringValue,
            };
            exportToJsonFileThis(
              physics,
              selectedProject.name + '_physics.json',
            );
          }}
        >
          <BiExport
            className={`h-5 w-5 text-green-300 hover:text-secondaryColor
                    ${
                      !(
                        selectedProject.ports.length > 0 ||
                        selectedProject.frequencies
                      ) && 'opacity-40'
                    }`}
          />
        </button> */}
      </div>
    </>
  );
};

interface ExportPhysicsToCSVProps {
  className?: string;
}

export const ExportPhisicsToCSV: FC<ExportPhysicsToCSVProps> = ({
  className
}) => {
  const selectedProject = useSelector(selectedProjectSelector)
  const theme = useSelector(ThemeSelector)
  let ports = selectedProject?.ports.filter(p => p.category === 'port') as Port[]
  let lumped = selectedProject?.ports.filter(p => p.category === 'lumped') as TempLumped[]
  let frequencies = (selectedProject?.frequencies !== undefined) ? selectedProject.frequencies : []
  let scatteringValue = (selectedProject?.scatteringValue !== undefined) ? selectedProject.scatteringValue : 0
  return (
    <button
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 cursor-pointer ${theme === 'light'
        ? 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white hover:border-blue-500 hover:text-blue-600 hover:shadow-md'
        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-blue-400 hover:text-blue-400'
        } ${selectedProject?.ports.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => {
        const zip = new JSZip();
        if (ports.length > 0) {
          let results = [
            ['name', 'x1', 'y1', 'z1', 'x2', 'y2', 'z2', 'scattering'],
            ...ports.map((port) => [
              port.name,
              port.inputElement[0],
              port.inputElement[1],
              port.inputElement[2],
              port.outputElement[0],
              port.outputElement[1],
              port.outputElement[2],
              scatteringValue,
            ]),
          ]
            .map((e) => e.join(','))
            .join('\n');
          const blob = new Blob([results]);
          zip.file('ports.csv', blob);
        }
        if (lumped.length > 0) {
          let results = [
            ['name', 'x1', 'y1', 'z1', 'x2', 'y2', 'z2', 'type', 'R', 'L', 'C'],
            ...lumped.map((lump) => [
              lump.name,
              lump.inputElement[0],
              lump.inputElement[1],
              lump.inputElement[2],
              lump.outputElement[0],
              lump.outputElement[1],
              lump.outputElement[2],
              lump.type,
              (lump.rlcParams.resistance) !== undefined ? lump.rlcParams.resistance : 0,
              (lump.rlcParams.inductance) !== undefined ? lump.rlcParams.inductance : 0,
              (lump.rlcParams.capacitance) !== undefined ? lump.rlcParams.capacitance : 0,
            ])
          ]
            .map((e) => e.join(','))
            .join('\n');
          const blob = new Blob([results]);
          zip.file('lumped.csv', blob);
        }
        if (frequencies.length > 0) {
          let results = [
            ['Frequencies'],
            ...frequencies.map((freq) => [
              freq
            ])
          ]
            .map((e) => e.join(','))
            .join('\n');
          const blob = new Blob([results]);
          zip.file('frequencies.csv', blob);
        }
        zip.generateAsync({ type: 'blob' }).then(function (content) {
          saveAs(content, 'physics');
        });
      }}
    >
      <BsFiletypeCsv style={{ width: '20px', height: '20px' }} />
      <span className='text-sm'>Export Terminations & Freq</span>
    </button>
  );
};
