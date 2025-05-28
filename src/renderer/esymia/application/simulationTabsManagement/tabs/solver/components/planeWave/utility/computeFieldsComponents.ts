import * as THREE from 'three'

export function computeFieldsComponents(phi: number, theta: number, E_theta: number, E_phi: number) {
    // Creazione della matrice di trasformazione T
    let T = [
        [Math.sin(theta) * Math.cos(phi), Math.cos(theta) * Math.cos(phi), -Math.sin(phi)],
        [Math.sin(theta) * Math.sin(phi), Math.cos(theta) * Math.sin(phi), Math.cos(phi)],
        [Math.cos(theta), -Math.sin(theta), 0]
    ];

    // Creazione dei vettori
    let K = matrixVectorMultiply(T, [1, 0, 0]);
    let E = matrixVectorMultiply(T, [0, E_theta, E_phi]);
    let E_theta_v = matrixVectorMultiply(T, [0, E_theta, 0]);
    let E_phi_v = matrixVectorMultiply(T, [0, 0, E_phi]);

    // Calcolo del modulo di E e del campo magnetico
    let E_norm = vectorNorm([E.x, E.y, E.z]);
    let Hm = E_norm / (120 * Math.PI);

    // Normalizzazione di E
    let E_hat = E_norm !== 0 ? vectorScale([E.x, E.y, E.z], 1 / E_norm) : vectorScale([E.x, E.y, E.z], 0)

    // Prodotto vettoriale tra E_hat e K
    let H_hat = crossProduct([E_hat.x, E_hat.y, E_hat.z], [K.x, K.y, K.z]);

    // Calcolo del campo magnetico H
    let H = vectorScale(H_hat, Hm);

    return { E, K, H, E_theta_v, E_phi_v };
}

// Funzione per il prodotto matrice-vettore
function matrixVectorMultiply(matrix: number[][], vector: number[]) {
    let res = matrix.map(row => row.reduce((sum, value, index) => sum + value * vector[index], 0));
    return new THREE.Vector3(res[0], res[1], res[2])
}

// Funzione per calcolare la norma di un vettore
function vectorNorm(vector: number[]) {
    return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
}

// Funzione per scalare un vettore
function vectorScale(vector:number[], scalar:number) {
    let res = vector.map(val => val * scalar);
    return new THREE.Vector3(res[0], res[1], res[2])
}

// Funzione per il prodotto vettoriale tra due vettori 3D
function crossProduct(v1:number[], v2:number[]) {
    return [
        v1[1] * v2[2] - v1[2] * v2[1],
        v1[2] * v2[0] - v1[0] * v2[2],
        v1[0] * v2[1] - v1[1] * v2[0]
    ];
}