import { meshFrom } from 'cad-library';
import * as THREE from 'three';
import { Project } from '../../../model/esymiaModels';

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
        selectedProject.model.components.forEach((c) => {
          group.add(meshFrom(c));
        });
      }
    return new THREE.Box3().setFromObject(group)
  }
