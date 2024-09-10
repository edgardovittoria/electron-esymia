import * as THREE from 'three';
import { Project } from '../../../model/esymiaModels';
import { meshFrom } from '../../../../cad_library';

export const exportToJsonFileThis = (data: any, fileName: string) => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(data)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = fileName;

    link.click();
  };


  export const calculateModelBoundingBox = (selectedProject: Project) : THREE.Box3 => {
    const group = new THREE.Group();
      if (selectedProject.model.components) {
        selectedProject.model.components.forEach((c: any) => {
          group.add(meshFrom(c));
        });
      }
    return new THREE.Box3().setFromObject(group)
  }
