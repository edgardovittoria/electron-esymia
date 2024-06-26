import {Materials} from "./Materials";
import {MyPanel} from "../../sharedElements/MyPanel";
import {Models} from "../../sharedElements/Models";
import {ModelOutliner} from "../../sharedElements/ModelOutliner";
import StatusBar from "../../sharedElements/StatusBar";
import { CanvasModeler } from './CanvasModeler';
import { modelerLeftPanelTitle } from '../../../config/panelTitles';

interface ModelerProps {
    selectedTabLeftPanel: string;
    setSelectedTabLeftPanel: Function;
}

export const Modeler: React.FC<ModelerProps> = (
    {selectedTabLeftPanel, setSelectedTabLeftPanel}
) => {


    return (
        <div>
            <CanvasModeler/>
            <StatusBar/>
            <MyPanel
                tabs={[modelerLeftPanelTitle.first, modelerLeftPanelTitle.second]}
                selectedTab={selectedTabLeftPanel}
                setSelectedTab={setSelectedTabLeftPanel}
                className="absolute left-[2%] top-[180px] md:w-1/4 xl:w-1/5"
            >
                {selectedTabLeftPanel === "Materials" ? (
                    <Materials/>
                ) : (
                    <Models>
                        <ModelOutliner/>
                    </Models>
                )}
            </MyPanel>

        </div>
    );
};
