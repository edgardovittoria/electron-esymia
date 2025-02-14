export function qrule(n: number, type: number): { rootx: number[]; wex: number[] } {
    if (n === 10 && type === 1) {
        // Esempio di radici e pesi per una regola di quadratura a 10 punti
        return {
            rootx: [-0.9739065285171717, -0.8650633666889845, -0.6794095682990244, -0.4333953941292472, -0.1488743389816312, 0.1488743389816312, 0.4333953941292472, 0.6794095682990244, 0.8650633666889845, 0.9739065285171717],
            wex: [0.0666713443086881, 0.1494513491505806, 0.2190863625159820, 0.2692667193099963, 0.2955242247147529, 0.2955242247147529, 0.2692667193099963, 0.2190863625159820, 0.1494513491505806, 0.0666713443086881],
        };
    } else {
        throw new Error("Regola di quadratura non implementata per questi parametri.");
    }
}