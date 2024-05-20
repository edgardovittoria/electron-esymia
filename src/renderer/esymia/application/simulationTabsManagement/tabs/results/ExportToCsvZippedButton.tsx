import JSZip from 'jszip';
import { FC } from 'react'
import { GraphsData } from './sharedElements';
import saveAs from 'file-saver';

interface ExportToCsvZippedButtonProps {
  graphDataToExport: GraphsData[],
  buttonLabel: string,
  zipFilename: string,
  className?: string
}

export const ExportToCsvZippedButton: FC<ExportToCsvZippedButtonProps> = ({graphDataToExport, buttonLabel, zipFilename, className}) => {
  return (
    <button className={className ? className : "btn btn-sm text-sm bg-white text-black capitalize border-[#0fb25b] hover:bg-[#0fb25b] hover:text-white"} onClick={() =>{
      const zip = new JSZip();
      graphDataToExport.map((chartData) => {
        const folder = zip.folder(chartData.representedFunction);
        chartData.data.datasets.forEach(ds => {
          let results = [["Frequency", chartData.representedFunction], ...chartData.data.labels.map((f, index) => [f, ds.data[index]])].map(e => e.join(",")).join("\n");
          const blob = new Blob([results])
          folder?.file(ds.label+'_'+chartData.representedFunction+'.csv', blob)
        })
      })
      zip.generateAsync({ type: "blob" }).then(function(content) {
        saveAs(content, zipFilename);
      });
      }
      }>{buttonLabel}
    </button>
  )
}
