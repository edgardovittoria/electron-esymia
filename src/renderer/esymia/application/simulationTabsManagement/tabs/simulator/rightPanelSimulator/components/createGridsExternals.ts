export interface Brick {
  x: number;
  y: number;
  z: number;
}

const brickTouchesTheMainBoundingBox = (totalMatrix: boolean[][][][], brick:Brick): boolean => {
  const Nx = totalMatrix[0].length;
  const Ny = totalMatrix[0][0].length;
  const Nz = totalMatrix[0][0][0].length;
  if (
    brick.x === 0 ||
    brick.x === Nx - 1 ||
    brick.y === 0 ||
    brick.y === Ny - 1 ||
    brick.z === 0 ||
    brick.z === Nz - 1
  ) {
    return true;
  }
  return false;
}

const existsThisBrick = (brick: Brick, totalMatrix: boolean[][][][]): boolean => {
  for (let material = 0; material < totalMatrix.length; material++) {
    if (totalMatrix[material][brick.x]) {
      if(totalMatrix[material][brick.x][brick.y]){
        if(totalMatrix[material][brick.x][brick.y][brick.z]){
          return true;
        }
      }
    }
  }
  return false;
};

const brickIsOnSurface = (brick: Brick, totalMatrix: boolean[][][][]) : boolean => {
  if (brickTouchesTheMainBoundingBox(totalMatrix, brick)){
    return true
  }
  if (!existsThisBrick({x: brick.x - 1, y: brick.y, z: brick.z} as Brick, totalMatrix))
    return true;
  if (!existsThisBrick({x: brick.x + 1, y: brick.y, z: brick.z} as Brick, totalMatrix))
    return true;
  if (!existsThisBrick({x: brick.x, y: brick.y - 1, z: brick.z }as Brick, totalMatrix))
    return true;
  if (!existsThisBrick({x: brick.x, y: brick.y + 1, z: brick.z} as Brick, totalMatrix))
    return true;
  if (!existsThisBrick({x: brick.x, y: brick.y, z: brick.z - 1} as Brick, totalMatrix))
    return true;
  if (!existsThisBrick({x: brick.x, y: brick.y, z: brick.z + 1} as Brick, totalMatrix))
    return true;
  return false
}


export function create_Grids_externals(grids: any[]) {
  const OUTPUTgrids: {data: Brick[][], isValid:boolean}  = {data: [], isValid: true};
  for (let material = 0; material < grids.length; material++) {
    OUTPUTgrids.data.push([]);
    for (let cont1 = 0; cont1 < grids[material].length; cont1++) {
      for (let cont2 = 0; cont2 < grids[material][0].length; cont2++) {
        for (let cont3 = 0; cont3 < grids[material][0][0].length; cont3++) {
          // se il brick esiste e si affaccia su una superficie, lo aggiungiamo alla griglia
          if (grids[material][cont1][cont2][cont3]){
            let brick: Brick = {x: cont1, y: cont2, z: cont3}
            if (brickIsOnSurface(brick, grids)){
              OUTPUTgrids.data[material].push(brick);
            }
          }
        }
      }
    }
  }
  return OUTPUTgrids;
}
