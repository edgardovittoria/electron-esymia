import JSZip from 'jszip';
import { FC } from 'react'
import { GraphsData } from './sharedElements';
import saveAs from 'file-saver';
import { Project } from '../../../../model/esymiaModels';
import toast, { ToastOptions } from 'react-hot-toast';

interface ExportTouchstoneButtonProps {
  selectedProject: Project
}

export const ExportTouchstoneButton: FC<ExportTouchstoneButtonProps> = ({selectedProject}) => {
  return (
    <button
    className="btn btn-sm text-sm bg-white text-black capitalize border-[#0fb25b] hover:bg-[#0fb25b] hover:text-white"
    onClick={() => {
      window.electron.ipcRenderer.sendMessage('exportTouchstone', [
        selectedProject.frequencies,
        JSON.parse(selectedProject?.simulation?.results.matrix_S as string),
        selectedProject.scatteringValue,
        selectedProject.ports.filter(p => p.category === "port").length,
        selectedProject.name,
      ]);
      toast.success(`file ${selectedProject?.name}.s${selectedProject.ports.filter(p => p.category === "port").length}p saved on Downloads folder!`, { duration: 10000 } as ToastOptions)
    }}
  >
    Export Touchstone
  </button>
  )
}
