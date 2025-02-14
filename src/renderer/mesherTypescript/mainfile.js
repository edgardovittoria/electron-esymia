"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creaBricks = creaBricks;
exports.computeMeshV2 = computeMeshV2;
var crea_regioni_1 = require("./crea_regioni");
var genera_mesh_1 = require("./genera_mesh");
const { workerData, parentPort } = require("worker_threads");
function creaBricks(bricksMatrix, bricksMaterials) {
    var bricks = [];
    var bricks_material = [];
    for (var i = 0; i < bricksMatrix.length; i++) {
        bricks.push(bricksMatrix[i]);
        bricks_material.push(bricksMaterials[i]);
    }
    return { bricks: bricks, bricks_material: bricks_material };
}
// function main() {
//   // DEFINIZIONE INFO ACQUISITE TRAMITE GUI -----------------------------
//   const n_freq = 15;
//   const freq = Array.from({ length: n_freq }, (_, i) =>
//     Math.pow(
//       10,
//       Math.log10(1e2) +
//         (i * (Math.log10(1e9) - Math.log10(1e2))) / (n_freq - 1),
//     ),
//   );
//   const use_escalings = 1;
//   const use_Zs_in = 1;
//   const QS_Rcc_FW = 2;
//   const scalamento = 1e-3;
//   const den = 40;
//   const freq_max = 10e9;
//   // INPUT 1 - ANTENNA
//   const materialsAntenna: MaterialMesher[] = [
//     {
//       name: 'antennaCond',
//       sigmar: 5.8e7,
//       eps_re: 1,
//       tan_D: 0,
//       mur: 1,
//     },
//     {
//       name: 'antennaDiel',
//       sigmar: 0,
//       eps_re: 5,
//       tan_D: 0,
//       mur: 1,
//     },
//   ];
//   const bricksMaterialsAntenna = [0, 0, 1];
//   const bricksMatrixAntenna = [
//     [0, 3, 0, 5, 0, 0.05],
//     [1, 2, 0, 5, 1.05, 1.1],
//     [0, 3, 0, 5, 0.05, 1.05],
//   ];
//   // INPUT 2 - WPT
//   const materialsWpt: MaterialMesher[] = [
//     {
//       name: 'wptCond',
//       sigmar: 5.8e7,
//       eps_re: 1,
//       tan_D: 0,
//       mur: 1,
//     },
//     {
//       name: 'wptDiel',
//       sigmar: 0,
//       eps_re: 4.4,
//       tan_D: 0,
//       mur: 1,
//     },
//   ];
//   const bricksMaterialsWpt = [0, 0, 0, 0, 0, 0, 0, 0, 1];
//   const bricksMatrixWpt = [
//     [1.05, 4, -32.5, -29.55, 121.95, 122],
//     [-4, -1.05, -32.5, -29.55, 121.95, 122],
//     [1.05, 29.55, -29.55, -26.5, 121.95, 122],
//     [-29.55, -1, -29.55, -26.5, 121.95, 122],
//     [26.6, 29.55, -29.55, 29.55, 121.95, 122],
//     [-29.55, -26.6, -29.55, 29.55, 121.95, 122],
//     [1.05, 26.6, 26.6, 29.55, 121.95, 122],
//     [-26.6, -1.05, 26.6, 29.55, 121.95, 122],
//     [-35, 35, -35, 35, 122, 122.05],
//   ];
//   // INPUT 3 - SPIRALE
//   const materialsSpirale: MaterialMesher[] = [
//     {
//       name: 'spiraleCond',
//       sigmar: 5.8e7,
//       eps_re: 1,
//       tan_D: 0,
//       mur: 1,
//     },
//   ];
//   const bricksMatrixSpirale = [
//     [-1.9, -1.3, -0.64, -0.553, 0, 0.05],
//     [-1.45, -1.3, -1.5, -0.64, 0, 0.05],
//     [-1.3, 1.91, -1.5, -1.35, 0, 0.05],
//     [1.76, 1.91, -1.35, 1.56, 0, 0.05],
//     [-1.15, 1.76, 1.41, 1.56, 0, 0.05],
//     [-1.15, -1, -1.2, 1.41, 0, 0.05],
//     [-1, 1.61, -1.2, -1.05, 0, 0.05],
//     [1.46, 1.61, -1.05, 1.26, 0, 0.05],
//     [-0.85, 1.46, 1.11, 1.26, 0, 0.05],
//     [-0.85, -0.7, -0.9, 1.11, 0, 0.05],
//     [-0.7, 1.31, -0.9, -0.75, 0, 0.05],
//     [1.16, 1.31, -0.75, 0.96, 0, 0.05],
//     [-0.55, 1.16, 0.81, 0.96, 0, 0.05],
//     [-0.55, -0.4, -0.6, 0.81, 0, 0.05],
//     [-0.4, 1.01, -0.6, -0.45, 0, 0.05],
//     [1.01, 1.16, -0.45, 0.81, 0, 0.05],
//     [0.86, 1.01, -0.45, 0.66, 0, 0.05],
//     [-0.25, 0.86, 0.51, 0.66, 0, 0.05],
//     [-0.25, -0.1, -0.29, 0.51, 0, 0.05],
//     [-0.25, -0.1, -0.4, -0.29, 0, 0.15],
//     [-1.3, -0.25, -0.4, -0.29, 0.1, 0.15],
//     [-1.2, -0.3, -0.44, -0.4, 0.1, 0.15],
//     [-1.45, -1.3, -0.4, -0.29, 0, 0.15],
//     [-1.9, -1.45, -0.4, -0.29, 0, 0.05],
//   ];
//   const bricksMaterialsSpirale = Array(bricksMatrixSpirale.length).fill(0);
//   // **SCELTA DELL'INPUT DA UTILIZZARE**
//   const { bricks, bricks_material } = creaBricks(
//     bricksMatrixSpirale,
//     bricksMaterialsSpirale,
//   );
//   const materials = materialsSpirale;
//   // Creazione delle regioni
//   const Regioni = crea_regioni(bricks, bricks_material, materials);
//   // Generazione della mesh
//   const { incidence_selection, volumi, superfici, nodi_coord, escalings } =
//     genera_mesh(Regioni, den, freq_max, scalamento, use_escalings, materials);
//   console.log('Fine main.ts');
//   //  incidence_selection.Gamma
//   console.log('incidence_selection.Gammma :');
//   incidence_selection.Gamma.forEach((value: number, index: number[]) => {
//     if (value !== 0) {
//       console.log(`  (${index[0] + 1},${index[1] + 1})       ${value}`);
//     }
//   });
//   // incidence_selection.A
//   console.log('incidence_selection.A :');
//   incidence_selection.A.forEach((value: number, index: number[]) => {
//     if (value !== 0) {
//       console.log(`  (${index[0] + 1},${index[1] + 1})       ${value}`);
//     }
//   });
// }
// export function computeMesh(
//   den: number,
//   freq_max: number,
//   fileName: string,
//   dispatch: Dispatch,
//   projectID: string,
// ) {
//   const use_escalings = 1;
//   const scalamento = 1e-3;
//   const params = {
//     Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
//     Key: fileName,
//   };
//   let materials: Material[] = [];
//   let bricksMaterials: number[] = [];
//   let bricksMatrix: number[][] = [];
//   s3.getObject(params, (err, data) => {
//     if (err) {
//       console.log(err);
//     }
//     const res = JSON.parse(data.Body?.toString() as string);
//     res.bricks.forEach((item: any) => {
//       if (materials.filter((m) => m.name === item.material.name).length === 0) {
//         materials.push(item.material);
//         let index_new_material = materials.length - 1;
//         item.elements.forEach((element: number[]) => {
//           bricksMaterials.push(index_new_material);
//           bricksMatrix.push(element.map((e) => parseFloat(e.toFixed(2))));
//         });
//       }
//     });
//     const { bricks, bricks_material } = creaBricks(
//       bricksMatrix,
//       bricksMaterials,
//     );
//     let materialsMesher: MaterialMesher[] = materials.map((m) => {
//       return {
//         name: m.name,
//         sigmar: m.conductivity,
//         eps_re: m.permittivity,
//         tan_D: m.tangent_delta_conductivity ? m.tangent_delta_conductivity : 0,
//         mur: m.permeability,
//       };
//     });
//     const Regioni = crea_regioni(bricks, bricks_material, materialsMesher);
//     dispatch(
//       setMeshingProgress({
//         meshingStep: 1,
//         id: projectID,
//       }),
//     );
//     // Generazione della mesh
//     const { incidence_selection, volumi, superfici, nodi_coord, escalings } =
//       genera_mesh(
//         Regioni,
//         den,
//         freq_max,
//         scalamento,
//         use_escalings,
//         materialsMesher,
//       );
//     dispatch(
//       setMeshingProgress({
//         meshingStep: 2,
//         id: projectID,
//       }),
//     );
//     const mesh = {
//       incidence_selection: incidence_selection,
//       volumi: volumi,
//       nodi_coord: nodi_coord,
//       escalings: escalings,
//       ASize: incidence_selection.A.size(),
//     };
//     const meshToUploadToS3 = JSON.stringify(mesh);
//     const blobFileMesh = new Blob([meshToUploadToS3]);
//     const meshFile = new File([blobFileMesh], `${projectID}_mesh.json`);
//     const surfacesToUploadToS3 = JSON.stringify(superfici);
//     const blobFileSurfaces = new Blob([surfacesToUploadToS3]);
//     const surfacesFile = new File(
//       [blobFileSurfaces],
//       `${projectID}_surface.json`,
//     );
//     uploadFileS3(meshFile).then((resMesh) => {
//       console.log('mesh uploaded :', resMesh);
//       if (resMesh) {
//         uploadFileS3(surfacesFile).then((resSurface) => {
//           console.log('surfaces uploaded :', resSurface);
//           if (res) {
//             dispatch(
//               setMesherResults({
//                 id: projectID,
//                 gridsPath: '',
//                 meshPath: resMesh.key,
//                 surfacePath: resSurface ? resSurface.key : '',
//                 isStopped: false,
//                 isValid: { valid: true },
//                 validTopology: true,
//                 error: undefined,
//                 ASize: incidence_selection.A.size(),
//               }),
//             );
//             dispatch(
//               setMeshASize({
//                 ASize: incidence_selection.A.size(),
//                 projectToUpdate: projectID,
//               }),
//             );
//           }
//         });
//       }
//     });
//   });
// }
function computeMeshV2(den, freq_max, bricksS3, projectID) {
    var use_escalings = 1;
    var scalamento = 1e-3;
    var materials = [];
    var bricksMaterials = [];
    var bricksMatrix = [];
    bricksS3.forEach(function (item) {
        if (materials.filter(function (m) { return m.name === item.material.name; }).length === 0) {
            materials.push(item.material);
            var index_new_material_1 = materials.length - 1;
            item.elements.forEach(function (element) {
                bricksMaterials.push(index_new_material_1);
                bricksMatrix.push(element.map(function (e) { return parseFloat(e.toFixed(2)); }));
            });
        }
    });
    var _a = creaBricks(bricksMatrix, bricksMaterials), bricks = _a.bricks, bricks_material = _a.bricks_material;
    var materialsMesher = materials.map(function (m) {
        return {
            name: m.name,
            sigmar: m.conductivity,
            eps_re: m.permittivity,
            tan_D: m.tangent_delta_conductivity ? m.tangent_delta_conductivity : 0,
            mur: m.permeability,
        };
    });
    var Regioni = (0, crea_regioni_1.crea_regioni)(bricks, bricks_material, materialsMesher);
    parentPort.postMessage("meshingStep1")
    // dispatch(
    //   setMeshingProgress({
    //     meshingStep: 1,
    //     id: projectID,
    //   }),
    // );
    var _b = (0, genera_mesh_1.genera_mesh)(Regioni, den, freq_max, scalamento, use_escalings, materialsMesher), incidence_selection = _b.incidence_selection, volumi = _b.volumi, superfici = _b.superfici, nodi_coord = _b.nodi_coord, escalings = _b.escalings;
    parentPort.postMessage("meshingStep2")
    // dispatch(
    //   setMeshingProgress({
    //     meshingStep: 2,
    //     id: projectID,
    //   }),
    // );
    var mesh = {
        incidence_selection: incidence_selection,
        volumi: volumi,
        nodi_coord: nodi_coord,
        escalings: escalings,
        ASize: incidence_selection.A.size(),
    };
    // const meshToUploadToS3 = JSON.stringify(mesh);
    // const blobFileMesh = new Blob([meshToUploadToS3]);
    // const meshFile = new File([blobFileMesh], `${projectID}_mesh.json`);
    // const surfacesToUploadToS3 = JSON.stringify(superfici);
    // const blobFileSurfaces = new Blob([surfacesToUploadToS3]);
    // const surfacesFile = new File(
    //   [blobFileSurfaces],
    //   `${projectID}_surface.json`,
    // );
    return { mesh: mesh, superfici: superfici };
}
const [den, freq_max, bricksS3, projectID] = workerData
parentPort.postMessage(computeMeshV2(den, freq_max, bricksS3, projectID))
// self.onmessage = function (ev) {
//     var _a = ev.data, den = _a[0], freq_max = _a[1], bricksS3 = _a[2], projectID = _a[3];
//     self.postMessage(computeMeshV2(den, freq_max, bricksS3, projectID));
// };
