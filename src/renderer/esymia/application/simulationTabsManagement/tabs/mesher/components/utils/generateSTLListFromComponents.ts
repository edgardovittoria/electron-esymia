import { ComponentEntity, exportToSTL, Material } from '../../../../../../../cad_library';

export function generateSTLListFromComponents(
  materialList: Material[],
  components: ComponentEntity[]
) {
  const filteredComponents: ComponentEntity[][] = [];
  materialList.forEach((m) => {
    components &&
      filteredComponents.push(
        components.filter((c) => c.material?.name === m.name)
      );
  });

  const STLList: { material: { name: string, conductivity: number }; STL: string }[] = [];

  filteredComponents.forEach((fc) => {
    const STLToPush = exportToSTL(fc);
    STLList.push({
      material: {
        name: fc[0].material?.name as string,
        conductivity: fc[0].material?.conductivity as number
      },
      STL: STLToPush
    });
  });
  return STLList;
}


