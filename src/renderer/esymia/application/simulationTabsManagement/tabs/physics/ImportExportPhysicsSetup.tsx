import {FC, useRef} from "react";
import {useDispatch, useSelector} from "react-redux";
import {
    Port,
    Probe,
    Project,
    TempLumped,
} from "../../../../model/esymiaModels";
import {
    addPorts,
    selectedProjectSelector, setFrequencies,
    setScatteringValue
} from '../../../../store/projectSlice';
import {BiExport, BiImport} from "react-icons/bi";
import { exportToJsonFileThis } from "../../sharedElements/utilityFunctions";
import { generateTerminationName, isTerminationNameValid } from "./portManagement/selectPorts/portLumpedProbeGenerator";
import { useFaunaQuery } from "cad-library";
import { updateProjectInFauna } from "../../../../faunadb/projectsFolderAPIs";
import { convertInFaunaProjectThis } from "../../../../faunadb/apiAuxiliaryFunctions";

export const ImportExportPhysicsSetup: FC<{}> = () => {
    const selectedProject = useSelector(selectedProjectSelector) as Project;
    const dispatch = useDispatch();
    const inputRefPhysics = useRef(null);
    const { execQuery } = useFaunaQuery()

    const onImportPhysicsClick = () => {
        let input = inputRefPhysics.current;
        if (input) {
            (input as HTMLInputElement).click();
        }
    };
    return (
        <>
            <div className="tooltip" data-tip="Import Physics">
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
                                  ).then()
                            });
                        }}
                    />
                </button>
            </div>
            <div className="tooltip" data-tip="Export Physics">
                <button
                    disabled={
                        !(selectedProject &&
                            (selectedProject.ports.length > 0 || selectedProject.frequencies))
                    }
                    className="bg-white rounded p-2"
                    onClick={() => {
                        let physics = {
                            ports: selectedProject.ports,
                            frequencies: selectedProject.frequencies,
                            portScatteringValue: selectedProject.scatteringValue
                        };
                        exportToJsonFileThis(physics, selectedProject.name + "_physics.json");
                    }}>
                    <BiExport className={`h-5 w-5 text-green-300 hover:text-secondaryColor
                    ${!(selectedProject.ports.length > 0 || selectedProject.frequencies) && 'opacity-40'}`}/>
                </button>
            </div>
        </>
    );
};
