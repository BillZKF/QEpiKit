// adapted from on Rivers, 2014
/* jshint esversion:6 */

const ranges = [
    [0.1, 0.3], //contactRate
    [0.05, 0.1], //hospitalContactRate
    [0.3, 0.5], //funeralContactRate
    [1 / 2, 1 / 21], // incubationPeriod
    [1 / 2, 1 / 5], // timeUntilHospital
    [1 / 5, 1 / 10], // timeFromHospToDeath
    [1 / 2, 1 / 6], // durationOfFuneral
    [1 / 15, 1 / 21], //durationOfInfection
    [1 / 9, 1 / 14], //timeFromInfToDeath
    [1 / 14, 1 / 16], //timeFromHospToRecovery
    [0.15, 0.2], //probOfHosp
    [0.5, 0.8], //caseFatalityRate
    [0.25, 0.6] //hospitalCaseFatalityRate
];

let paramScoreTest = function(chroma, target) {
    let S = new QEpiKit.Compartment("succeptible", 4502992 / 4503000);
    let E = new QEpiKit.Compartment("exposed", 8 / 4503000);
    let I = new QEpiKit.Compartment("infectious", 0);
    let H = new QEpiKit.Compartment("hospitalized", 0);
    let F = new QEpiKit.Compartment("funeral", 0);
    let R = new QEpiKit.Compartment("removed", 0);

    let ebolaParams = {
        contactRate: mljs.invNorm(chroma.genes[0].code, ranges[0][0], ranges[0][1]),
        hospitalContactRate: mljs.invNorm(chroma.genes[1].code, ranges[1][0], ranges[1][1]),
        funeralContactRate: mljs.invNorm(chroma.genes[2].code, ranges[2][0], ranges[2][1]),
        incubationPeriod: mljs.invNorm(chroma.genes[3].code, ranges[3][0], ranges[3][1]),
        timeUntilHospital: mljs.invNorm(chroma.genes[4].code, ranges[4][0], ranges[4][1]),
        timeFromHospToDeath: mljs.invNorm(chroma.genes[5].code, ranges[5][0], ranges[5][1]),
        durationOfFuneral: mljs.invNorm(chroma.genes[6].code, ranges[6][0], ranges[6][1]),
        durationOfInfection: mljs.invNorm(chroma.genes[7].code, ranges[7][0], ranges[7][1]),
        timeFromInfToDeath: mljs.invNorm(chroma.genes[8].code, ranges[8][0], ranges[8][1]),
        timeFromHospToRecov: mljs.invNorm(chroma.genes[9].code, ranges[9][0], ranges[9][1]),
        probOfHosp: mljs.invNorm(chroma.genes[10].code, ranges[10][0], ranges[10][1]),
        caseFatalityRate: mljs.invNorm(chroma.genes[11].code, ranges[11][0], ranges[11][1]),
        hospitalCaseFatalityRate: mljs.invNorm(chroma.genes[12].code, ranges[12][0], ranges[12][1])
    };


    let basicReproductiveNumber = ebolaParams.contactRate / ebolaParams.durationOfInfection;
    let liberiaPatch = new QEpiKit.Patch('liberia', [S, E, I, H, F, R]);
    let ebola = new QEpiKit.CompartmentModel('ebola-liberia', [liberiaPatch]);
    let vitals = {
        births: function(total) {
            return total * 0.0000002;
        },
        deaths: function(total) {
            return -total * 0.0000001;
        }
    };

    S.operation = function(step) {
        return (ebolaParams.contactRate * S.pop * I.pop * step) + (ebolaParams.hospitalContactRate * S.pop * H.pop * step) + (ebolaParams.funeralContactRate * S.pop * F.pop * step);
    };

    E.operation = function(step) {
        return (ebolaParams.contactRate * S.pop * I.pop * step) + (ebolaParams.hospitalContactRate * S.pop * H.pop * step) + (ebolaParams.funeralContactRate * S.pop * F.pop * step) - (E.pop * ebolaParams.incubationPeriod * step);
    };

    I.operation = function(step) {
        return (E.pop * ebolaParams.incubationPeriod * step) - ((I.pop * ebolaParams.timeUntilHospital * step) + (ebolaParams.durationOfInfection * (1 - ebolaParams.caseFatalityRate) * I.pop * step) + (I.pop * ebolaParams.caseFatalityRate * ebolaParams.timeFromInfToDeath * step));
    };

    H.operation = function(step) {
        return (I.pop * ebolaParams.timeUntilHospital * step) - ((ebolaParams.timeFromHospToDeath * ebolaParams.hospitalCaseFatalityRate * H.pop * step) + (ebolaParams.timeFromHospToRecov * (1 - ebolaParams.hospitalCaseFatalityRate) * H.pop * step));
    };

    F.operation = function(step) {
        return (I.pop * ebolaParams.caseFatalityRate * ebolaParams.timeFromInfToDeath * step) + (ebolaParams.timeFromHospToDeath * ebolaParams.hospitalCaseFatalityRate * H.pop * step) - (F.pop * ebolaParams.durationOfFuneral * step);
    };

    R.operation = function(step) {
        return (I.pop * ebolaParams.durationOfInfection * (1 - ebolaParams.caseFatalityRate) * step) + (ebolaParams.timeFromHospToRecov * (1 - ebolaParams.hospitalCaseFatalityRate) * H.pop * step) + (F.pop * ebolaParams.durationOfFuneral * step);
    };

    let environment = new QEpiKit.Environment();
    environment.add(ebola);
    environment.run(1, 460, 1);
    x = environment.history.map((d) => {
        return d.time;
    });
    y = environment.history.map((d) => {
        return (d.compartments[2].pop + d.compartments[3].pop + d.compartments[4].pop + d.compartments[5].pop) * 4503000;
    });
    incendence = environment.history.map((d) => {
        return d.compartments[2].dpop * 4503000;
    });
    arr = environment.history.map((d) => {
        return [d.compartments[0].pop, d.compartments[1].pop, d.compartments[2].pop, d.compartments[3].pop, d.compartments[4].pop, d.compartments[5].pop];
    });
    let deviance = 0;
    target.realX.forEach((t, i) => {
        for (let j = 0; j < x.length; j++) {
            if (x[j] == t) {
                deviance += (target.realY[i] - y[j]) * (target.realY[i] - y[j]); // Math.abs(target.realY[i] - y[j]);
            }
        }
    });
    return deviance;
};



const numGen = 200;
Plotly.d3.csv("./data/ebola.csv", function(csv) {
    let target = {
        realX: [],
        realY: []
    };

    document.querySelector("body").innerHTML += "<div>Loading...</div>";
    csv.forEach((row) => {
        target.realX.push(row.day);
        target.realY.push(row.total);
    });
    testGenetic = new mljs.Genetic(25, ranges, target, paramScoreTest);
    testGenetic.run(numGen);

    Plotly.plot('display', [{
        x: target.realX,
        y: target.realY,
        mode: 'line',
        type: 'scatter',
        name: "real ebola"
    }]);
    for (let k = 0; k < 5; k++) {
        paramScoreTest(testGenetic.population[k], target);
        Plotly.addTraces('display', [{
            x: x,
            y: y,
            mode: 'line',
            type: 'scatter',
            name: mljs.invNorm(testGenetic.population[k].genes[0].code, ranges[0][0], ranges[0][1])
        }]);
    }
});
