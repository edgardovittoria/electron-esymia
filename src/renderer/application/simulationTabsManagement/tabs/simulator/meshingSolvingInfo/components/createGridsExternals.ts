export interface Brick {
  x: number;
  y: number;
  z: number;
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


const getBrickInfo = (brick: Brick, totalMatrix: boolean[][][][]) => {
  let brickInfo = {isValid: true, isOnSurface: false}
  let brickX1 = existsThisBrick({x: brick.x - 1, y: brick.y,z: brick.z}as Brick, totalMatrix) ? true : false
  let brickX2 = existsThisBrick({x: brick.x + 1, y: brick.y,z: brick.z}as Brick, totalMatrix) ? true : false
  if (!brickX1 && !brickX2){
    brickInfo.isValid = false
    return brickInfo
  }
  else if(!brickX1 || !brickX2){
    brickInfo.isOnSurface = true
  }
  let brickY1 = existsThisBrick({x: brick.x, y: brick.y - 1,z: brick.z}as Brick, totalMatrix) ? true : false
  let brickY2 = existsThisBrick({x: brick.x, y: brick.y + 1,z: brick.z}as Brick, totalMatrix) ? true : false
  if (!brickY1 && !brickY2){
    brickInfo.isValid = false
    return brickInfo
  }
  else if(!brickY1 || !brickY2){
    brickInfo.isOnSurface = true
  }
  let brickZ1 = existsThisBrick({x: brick.x, y: brick.y,z: brick.z - 1}as Brick, totalMatrix) ? true : false
  let brickZ2 = existsThisBrick({x: brick.x, y: brick.y,z: brick.z + 1}as Brick, totalMatrix) ? true : false
  if (!brickZ1 && !brickZ2){
    brickInfo.isValid = false
    return brickInfo
  }
  else if(!brickZ1 || !brickZ2){
    brickInfo.isOnSurface = true
  }
  return brickInfo
}


export function create_Grids_externals(grids: any[]) {
  const OUTPUTgrids: {data: Brick[][], isValid:boolean}  = {data: [], isValid: true};
  for (let material = 0; material < grids.length; material++) {
    OUTPUTgrids.data.push([]);
    for (let cont1 = 0; cont1 < grids[0].length; cont1++) {
      for (let cont2 = 0; cont2 < grids[0][0].length; cont2++) {
        for (let cont3 = 0; cont3 < grids[0][0][0].length; cont3++) {
          // se il brick esiste e si affaccia su una superficie, lo aggiungiamo alla griglia
          if (grids[material][cont1][cont2][cont3]){
            let brick: Brick = {x: cont1, y: cont2, z: cont3}
            let brickInfo = getBrickInfo(brick, grids)
            if(!brickInfo.isValid){
              OUTPUTgrids.isValid = false
              return OUTPUTgrids
            }
            else{
              if(brickInfo.isOnSurface){
                OUTPUTgrids.data[material].push(brick);
              }
            }
          }
        }
      }
    }
  }
  return OUTPUTgrids;
}
