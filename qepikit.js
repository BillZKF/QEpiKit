'use strict';

const SUCCESS = 1;
const FAILED = 2;
const RUNNING = 3;
function createCSVURI(data) {
    var dataString;
    var URI;
    var csvContent = "data:text/csv;charset=utf-8,";
    var csvContentArray = [];
    data.forEach(function (infoArray) {
        dataString = infoArray.join(",");
        csvContentArray.push(dataString);
    });
    csvContent += csvContentArray.join("\n");
    URI = encodeURI(csvContent);
    return URI;
}
function arrayFromRange(start, end, step) {
    var range = [];
    var i = start;
    while (i < end) {
        range.push(i);
        i += step;
    }
    return range;
}
/**
* shuffle - fisher-yates shuffle
*/
function shuffle(array, rng) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(rng.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}
function generateUUID() {
    // http://www.broofa.com/Tools/Math.uuid.htm
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = new Array(36);
    var rnd = 0, r;
    for (var i = 0; i < 36; i++) {
        if (i == 8 || i == 13 || i == 18 || i == 23) {
            uuid[i] = '-';
        }
        else if (i == 14) {
            uuid[i] = '4';
        }
        else {
            if (rnd <= 0x02)
                rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
            r = rnd & 0xf;
            rnd = rnd >> 4;
            uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
    }
    return uuid.join('');
}
function always(a) {
    if (a === SUCCESS) {
        return SUCCESS;
    }
    else {
        return FAILED;
    }
}
function eventually(a) {
    if (a === SUCCESS) {
        return SUCCESS;
    }
    else {
        return RUNNING;
    }
}
function equalTo(a, b) {
    if (a === b) {
        return SUCCESS;
    }
    else {
        return FAILED;
    }
}
function not(result) {
    var newResult;
    if (result === SUCCESS) {
        newResult = FAILED;
    }
    else if (result === FAILED) {
        newResult = SUCCESS;
    }
    return newResult;
}
function notEqualTo(a, b) {
    if (a !== b) {
        return SUCCESS;
    }
    else {
        return FAILED;
    }
}
function gt(a, b) {
    if (a > b) {
        return SUCCESS;
    }
    else {
        return FAILED;
    }
}
function gtEq(a, b) {
    if (a >= b) {
        return SUCCESS;
    }
    else {
        return FAILED;
    }
}
function lt(a, b) {
    if (a < b) {
        return SUCCESS;
    }
    else {
        return FAILED;
    }
}
function ltEq(a, b) {
    if (a <= b) {
        return SUCCESS;
    }
    else {
        return FAILED;
    }
}
function hasProp(a, b) {
    a = a || false;
    if (a === b) {
        return SUCCESS;
    }
    else {
        return FAILED;
    }
}
function inRange(a, b) {
    if (b >= a[0] && b <= a[1]) {
        return SUCCESS;
    }
    else {
        return FAILED;
    }
}
function notInRange(a, b) {
    if (b >= a[0] && b <= a[1]) {
        return FAILED;
    }
    else {
        return SUCCESS;
    }
}
function getMatcherString(check) {
    var string = null;
    switch (check) {
        case equalTo:
            string = "equal to";
            break;
        case notEqualTo:
            string = "not equal to";
            break;
        case gt:
            string = "greater than";
            break;
        case gtEq:
            string = "greater than or equal to";
            break;
        case lt:
            string = "less than";
            break;
        case ltEq:
            string = "less than or equal to";
            break;
        case hasProp:
            string = "has the property";
            break;
        default:
            try {
                string = "not a defined matcher";
            }
            catch (e) {
                console.log(e);
            }
            break;
    }
    return string;
}
function setMin(params, keys) {
    for (var param in params) {
        if (typeof (keys) !== 'undefined' && keys.indexOf(param) !== -1) {
            params[param].current = params[param].value - params[param].error;
        }
        else if (typeof (keys) === 'undefined') {
            params[param].current = params[param].value - params[param].error;
        }
    }
}
function setMax(params, keys) {
    for (var param in params) {
        if (typeof (keys) !== 'undefined' && keys.indexOf(param) !== -1) {
            params[param].current = params[param].value + params[param].error;
        }
        else if (typeof (keys) === 'undefined') {
            params[param].current = params[param].value + params[param].error;
        }
    }
}
function setStandard(params, keys) {
    for (var param in params) {
        if (typeof (keys) !== 'undefined' && keys.indexOf(param) !== -1) {
            params[param].current = params[param].value;
        }
        else if (typeof (keys) === 'undefined') {
            params[param].current = params[param].value;
        }
    }
}
function dataToMatrix(items, stdized = false) {
    let data = [];
    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        if (stdized) {
            item = standardized(item);
        }
        item.forEach((x, ii) => {
            if (typeof data[ii] === 'undefined') {
                data[ii] = [1, x];
            }
            else {
                data[ii].push(x);
            }
        });
    }
    return data;
}
/*
* relative to the mean, how many standard deviations
*/
function standardized(arr) {
    let std = jStat.stdev(arr);
    let mean = jStat.mean(arr);
    let standardized = arr.map((d) => {
        return (d - mean) / std;
    });
    return standardized;
}
/*
* between 0 and 1 when min and max are known
*/
function normalize(x, min, max) {
    let val = x - min;
    return val / (max - min);
}
/*
* give the real unit value
*/
function invNorm(x, min, max) {
    return (x * max - x * min) + min;
}
/*
*
*/
function randRange(min, max) {
    return (max - min) * Math.random() + min;
}
function getRange(data, prop) {
    let range = {
        min: 1e15,
        max: -1e15
    };
    for (let i = 0; i < data.length; i++) {
        if (range.min > data[i][prop]) {
            range.min = data[i][prop];
        }
        if (range.max < data[i][prop]) {
            range.max = data[i][prop];
        }
    }
    return range;
}
class Match {
    static gt(a, b) {
        if (a > b) {
            return true;
        }
        return false;
    }
    static ge(a, b) {
        if (a >= b) {
            return true;
        }
        return false;
    }
    static lt(a, b) {
        if (a < b) {
            return true;
        }
        return false;
    }
    static le(a, b) {
        if (a <= b) {
            return true;
        }
        return false;
    }
}
function generatePop(numAgents, options, type, boundaries, currentAgentId, rng) {
    var pop = [];
    var locs = {
        type: 'FeatureCollection',
        features: []
    };
    options = options || [];
    type = type || 'continuous';
    for (var a = 0; a < numAgents; a++) {
        pop[a] = {
            id: currentAgentId,
            type: type
        };
        //movement params
        pop[a].movePerDay = rng.normal(2500 * 24, 1000); // m/day
        pop[a].prevX = 0;
        pop[a].prevY = 0;
        pop[a].movedTotal = 0;
        if (pop[a].type === 'continuous') {
            pop[a].mesh = new THREE.Mesh(new THREE.TetrahedronGeometry(1, 1), new THREE.MeshBasicMaterial({
                color: 0x00ff00
            }));
            pop[a].mesh.qId = pop[a].id;
            pop[a].mesh.type = 'agent';
            pop[a].position = { x: 0, y: 0, z: 0 };
            pop[a].position.x = rng.randRange(boundaries.left, boundaries.right);
            pop[a].position.y = rng.randRange(boundaries.bottom, boundaries.top);
            pop[a].mesh.position.x = pop[a].position.x;
            pop[a].mesh.position.y = pop[a].position.y;
        }
        if (pop[a].type === 'geospatial') {
            locs.features[a] = turf.point([rng.randRange(-75.1467, -75.1867), rng.randRange(39.9200, 39.9900)]);
            pop[a].location = locs.features[a];
            pop[a].location.properties.agentRefID = pop[a].id;
        }
        for (let key in options) {
            let d = options[key];
            if (typeof d.assign === 'function') {
                pop[a][key] = d.assign(pop[a]);
            }
            else {
                pop[a][key] = d.assign;
            }
        }
        
        currentAgentId++;
    }
    for (var r = 0; r < 3; r++) {
        pop[r].states.illness = 'infectious';
        pop[r].infectious = true;
        pop[r].pathogenLoad = 4e4;
    }
    for (let a = 0; a < pop.length; a++) {
        for (let key in pop[a].states) {
            pop[a][pop[a].states[key]] = true;
        }
    }
    return [pop, locs];
}

/**
*QComponents are the base class for many model components.
*/
class QComponent {
    constructor(name) {
        this.id = generateUUID();
        this.name = name;
        this.time = 0;
        this.history = [];
    }
    /** Take one time step forward (most subclasses override the base method)
    * @param step size of time step (in days by convention)
    */
    update(agent, step) {
        //something super!
    }
}
QComponent.SUCCESS = 1;
QComponent.FAILED = 2;
QComponent.RUNNING = 3;

/**
* Belief Desire Intent agents are simple planning agents with modular plans / deliberation processes.
*/
class BDIAgent extends QComponent {
    constructor(name, goals = [], plans = {}, data = [], policySelector = BDIAgent.stochasticSelection) {
        super(name);
        this.goals = goals;
        this.plans = plans;
        this.data = data;
        this.policySelector = policySelector;
        this.beliefHistory = [];
        this.planHistory = [];
    }
    /** Take one time step forward, take in beliefs, deliberate, implement policy
    * @param step size of time step (in days by convention)
    */
    update(agent, step) {
        var policy, intent, evaluation;
        policy = this.policySelector(this.plans, this.planHistory, agent);
        intent = this.plans[policy];
        intent(agent, step);
        evaluation = this.evaluateGoals(agent);
        this.planHistory.push({ time: this.time, id: agent.id, intention: policy, goals: evaluation.achievements, barriers: evaluation.barriers, r: evaluation.successes / this.goals.length });
    }
    evaluateGoals(agent) {
        let achievements = [], barriers = [], successes = 0, c, matcher;
        for (var i = 0; i < this.goals.length; i++) {
            c = this.goals[i].condition;
            if (typeof c.data === 'undefined' || c.data === "agent") {
                c.data = agent; //if no datasource is set, use the agent
            }
            achievements[i] = this.goals[i].temporal(c.check(c.data[c.key], c.value));
            if (achievements[i] === BDIAgent.SUCCESS) {
                successes += 1;
            }
            else {
                matcher = getMatcherString(c.check);
                barriers.push({
                    label: c.label,
                    key: c.key,
                    check: matcher,
                    actual: c.data[c.key],
                    expected: c.value
                });
            }
        }
        return { successes: successes, barriers: barriers, achievements: achievements };
    }
    //good for training
    static stochasticSelection(plans, planHistory, agent) {
        var policy, score, max = 0;
        for (var plan in plans) {
            score = Math.random();
            if (score >= max) {
                max = score;
                policy = plan;
            }
        }
        return policy;
    }
}
BDIAgent.lazyPolicySelection = function (plans, planHistory, agent) {
    var options, selection;
    if (this.time > 0) {
        options = Object.keys(plans);
        options = options.slice(1, options.length);
        selection = Math.floor(Math.random() * options.length);
    }
    else {
        options = Object.keys(plans);
        selection = 0;
    }
    return options[selection];
};

/**
* Behavior Tree
**/
class BehaviorTree extends QComponent {
    static tick(node, agent) {
        var state = node.operate(agent);
        return state;
    }
    constructor(name, root, data) {
        super(name);
        this.root = root;
        this.data = data;
        this.results = [];
    }
    update(agent, step) {
        var state;
        agent.active = true;
        while (agent.active === true) {
            state = BehaviorTree.tick(this.root, agent);
            agent.time = this.time;
            agent.active = false;
        }
        return state;
    }
}
class BTNode {
    constructor(name) {
        this.id = generateUUID();
        this.name = name;
    }
}
class BTControlNode extends BTNode {
    constructor(name, children) {
        super(name);
        this.children = children;
    }
}
class BTRoot extends BTControlNode {
    constructor(name, children) {
        super(name, children);
        this.type = "root";
        this.operate = function (agent) {
            var state = BehaviorTree.tick(this.children[0], agent);
            return state;
        };
    }
}
class BTSelector extends BTControlNode {
    constructor(name, children) {
        super(name, children);
        this.type = "selector";
        this.operate = function (agent) {
            var childState;
            for (var child in this.children) {
                childState = BehaviorTree.tick(this.children[child], agent);
                if (childState === BehaviorTree.RUNNING) {
                    return BehaviorTree.RUNNING;
                }
                if (childState === BehaviorTree.SUCCESS) {
                    return BehaviorTree.SUCCESS;
                }
            }
            return BehaviorTree.FAILED;
        };
    }
}
class BTSequence extends BTControlNode {
    constructor(name, children) {
        super(name, children);
        this.type = "sequence";
        this.operate = function (agent) {
            var childState;
            for (var child in this.children) {
                childState = BehaviorTree.tick(this.children[child], agent);
                if (childState === BehaviorTree.RUNNING) {
                    return BehaviorTree.RUNNING;
                }
                if (childState === BehaviorTree.FAILED) {
                    return BehaviorTree.FAILED;
                }
            }
            return BehaviorTree.SUCCESS;
        };
    }
}
class BTParallel extends BTControlNode {
    constructor(name, children, successes) {
        super(name, children);
        this.type = "parallel";
        this.successes = successes;
        this.operate = function (agent) {
            var succeeded = [], failures = [], childState, majority;
            for (var child in this.children) {
                childState = BehaviorTree.tick(this.children[child], agent);
                if (childState === BehaviorTree.SUCCESS) {
                    succeeded.push(childState);
                }
                else if (childState === BehaviorTree.FAILED) {
                    failures.push(childState);
                }
                else if (childState === BehaviorTree.RUNNING) {
                    return BehaviorTree.RUNNING;
                }
            }
            if (succeeded.length >= this.successes) {
                return BehaviorTree.SUCCESS;
            }
            else {
                return BehaviorTree.FAILED;
            }
        };
    }
}
class BTCondition extends BTNode {
    constructor(name, condition) {
        super(name);
        this.type = "condition";
        this.condition = condition;
        this.operate = function (agent) {
            var state;
            state = condition.check(agent[condition.key], condition.value);
            return state;
        };
    }
}
class BTAction extends BTNode {
    constructor(name, condition, action) {
        super(name);
        this.type = "action";
        this.condition = condition;
        this.action = action;
        this.operate = function (agent) {
            var state;
            state = condition.check(agent[condition.key], condition.value);
            if (state === BehaviorTree.SUCCESS) {
                this.action(agent);
            }
            return state;
        };
    }
}

class CompartmentModel extends QComponent {
    constructor(name, compartments, data) {
        super(name);
        this.data = data; //an array of Patches. Each patch contains an array of compartments in operational order
        this.totalPop = 0;
        this.compartments = compartments;
        this.history = [];
        for (let d = 0; d < this.data.length; d++) {
            this.totalPop += this.data[d].totalPop;
        }
        this._tolerance = 1e-9; //model err tolerance
    }
    update(patch, step) {
        let temp_pop = {}, temp_d = {}, next_d = {}, lte = {}, err = 1, newStep;
        for (let c in this.compartments) {
            patch.dpops[c] = this.compartments[c].operation(patch.populations, step);
        }
        //first order (Euler)
        for (let c in this.compartments) {
            temp_pop[c] = patch.populations[c];
            temp_d[c] = patch.dpops[c];
            patch.populations[c] = temp_pop[c] + temp_d[c];
        }
        //second order (Heuns)
        patch.totalPop = 0;
        for (let c in this.compartments) {
            next_d[c] = this.compartments[c].operation(patch.populations, step);
            patch.populations[c] = temp_pop[c] + (0.5 * (temp_d[c] + next_d[c]));
            patch.totalPop += patch.populations[c];
        }
    }
}
class Compartment {
    constructor(name, pop, operation) {
        this.name = name;
        this.operation = operation || null;
    }
}
class Patch {
    constructor(name, compartments, populations) {
        this.populations = {};
        this.dpops = {};
        this.initialPop = {};
        this.id = generateUUID();
        this.name = name;
        this.dpops = {};
        this.compartments = compartments;
        this.totalPop = 0;
        for (let c in populations) {
            this.dpops[c] = 0;
            this.initialPop[c] = populations[c];
            this.populations[c] = populations[c];
            this.totalPop += this.populations[c];
        }
    }
}

class ContactPatch {
    constructor(name, capacity) {
        this.id = generateUUID();
        this.name = name;
        this.capacity = capacity;
        this.pop = 0;
        this.members = {};
    }
    static defaultFreqF(a, b) {
        var val = (50 - Math.abs(a.age - b.age)) / 100;
        return val;
    }
    static defaultContactF(a, time) {
        var c = 2 * Math.sin(time) + a;
        if (c >= 1) {
            return true;
        }
        else {
            return false;
        }
    }
    assign(agent, contactValueFunc) {
        var contactValue;
        contactValueFunc = contactValueFunc || ContactPatch.defaultFreqF;
        if (this.pop < this.capacity) {
            this.members[agent.id] = { properties: agent };
            for (let other in this.members) {
                let id = parseInt(other);
                if (other !== agent.id && !isNaN(id)) {
                    contactValue = contactValueFunc(this.members[id].properties, agent);
                    this.members[agent.id][id] = contactValue;
                    this.members[id][agent.id] = contactValue;
                }
            }
            this.pop++;
            return this.id;
        }
        else {
            return null;
        }
    }
    encounters(agent, precondition, contactFunc, resultKey, save = false) {
        contactFunc = contactFunc || ContactPatch.defaultContactF;
        let contactVal;
        for (var contact in this.members) {
            if (precondition.key === 'states') {
                contactVal = JSON.stringify(this.members[contact].properties[precondition.key]);
            }
            else {
                contactVal = this.members[contact].properties[precondition.key];
            }
            if (precondition.check(this.members[contact].properties[precondition.key], precondition.value) && Number(contact) !== agent.id) {
                var oldVal = this.members[contact].properties[resultKey];
                var newVal = contactFunc(this.members[contact], agent);
                if (oldVal !== newVal && save === true) {
                    this.members[contact].properties[resultKey] = newVal;
                    ContactPatch.WIWArray.push({
                        patchID: this.id,
                        name: this.name,
                        infected: contact,
                        infectedAge: this.members[contact].properties.age,
                        result: this.members[contact].properties[resultKey],
                        resultKey: resultKey,
                        by: agent.id,
                        byAge: agent.age,
                        time: agent.time
                    });
                }
            }
        }
    }
}
ContactPatch.WIWArray = [];

/**
*Environments are the executable environment containing the model components,
*shared resources, and scheduler.
*/
class Environment {
    constructor(resources = [], facilities = [], eventsQueue = [], activationType = 'random', rng = Math) {
        this.time = 0;
        this.timeOfDay = 0;
        this.models = [];
        this.history = [];
        this.agents = [];
        this.resources = resources;
        this.facilities = facilities;
        this.eventsQueue = eventsQueue;
        this.activationType = activationType;
        this.rng = rng;
        this._agentIndex = {};
    }
    /** Add a model components from the environment
    * @param component the model component object to be added to the environment.
    */
    add(component) {
        this.models.push(component);
    }
    /** Remove a model components from the environment by id
    * @param id UUID of the component to be removed.
    */
    remove(id) {
        var deleteIndex, L = this.agents.length;
        this.models.forEach(function (c, index) { if (c.id === id) {
            deleteIndex = index;
        } });
        while (L > 0 && this.agents.length >= 0) {
            L--;
            if (this.agents[L].modelIndex === deleteIndex) {
                this.agents.splice(L, 1);
            }
        }
        this.models.splice(deleteIndex, 1);
    }
    /** Run all environment model components from t=0 until t=until using time step = step
    * @param step the step size
    * @param until the end time
    * @param saveInterval save every 'x' steps
    */
    run(step, until, saveInterval) {
        this.init();
        while (this.time <= until) {
            this.update(step);
            let rem = (this.time % saveInterval);
            if (rem < step) {
                let copy = JSON.parse(JSON.stringify(this.agents));
                this.history = this.history.concat(copy);
            }
            this.time += step;
        }
    }
    /** Assign all agents to appropriate models
    */
    init() {
        this._agentIndex = {};
        for (let c = 0; c < this.models.length; c++) {
            let alreadyIn = [];
            //assign each agent model indexes to handle agents assigned to multiple models
            for (let d = 0; d < this.models[c].data.length; d++) {
                let id = this.models[c].data[d].id;
                if (id in this._agentIndex) {
                    //this agent belongs to multiple models.
                    this.models[c].data[d].models.push(this.models[c].name);
                    this.models[c].data[d].modelIndexes.push(c);
                    alreadyIn.push(id);
                }
                else {
                    //this agent belongs to only one model so far.
                    this._agentIndex[id] = 0;
                    this.models[c].data[d].models = [this.models[c].name];
                    this.models[c].data[d].modelIndexes = [c];
                }
            }
            //eliminate any duplicate agents by id
            this.models[c].data = this.models[c].data.filter((d) => {
                if (alreadyIn.indexOf(d.id) !== -1) {
                    return false;
                }
                return true;
            });
            //concat the results
            this.agents = this.agents.concat(this.models[c].data);
        }
    }
    /** Update each model compenent one time step forward
    * @param step the step size
    */
    update(step) {
        var index = 0;
        while (index < this.eventsQueue.length && this.eventsQueue[index].at <= this.time) {
            this.eventsQueue[index].trigger();
            this.eventsQueue[index].triggered = true;
            if (this.eventsQueue[index].until <= this.time) {
                this.eventsQueue.splice(index, 1);
            }
            index++;
        }
        if (this.activationType === "random") {
            shuffle(this.agents, this.rng);
            this.agents.forEach((agent, i) => { this._agentIndex[agent.id] = i; }); // reassign agent
            this.agents.forEach((agent, i) => {
                agent.modelIndexes.forEach((modelIndex) => {
                    this.models[modelIndex].update(agent, step);
                });
                agent.time = agent.time + step || 0;
            });
        }
        if (this.activationType === "parallel") {
            let tempAgents = JSON.parse(JSON.stringify(this.agents));
            tempAgents.forEach((agent) => {
                agent.modelIndexes.forEach((modelIndex) => {
                    this.models[modelIndex].update(agent, step);
                });
            });
            this.agents.forEach((agent, i) => {
                agent.modelIndexes.forEach((modelIndex) => {
                    this.models[modelIndex].apply(agent, tempAgents[i], step);
                });
                agent.time = agent.time + step || 0;
            });
        }
    }
    /** Format a time of day. Current time % 1.
    *
    */
    formatTime() {
        this.timeOfDay = this.time % 1;
    }
    /** Gets agent by id. A utility function that
    *
    */
    getAgentById(id) {
        return this.agents[this._agentIndex[id]];
    }
}

class Epi {
    static prevalence(cases, total) {
        var prev = cases / total;
        return prev;
    }
    static riskDifference(table) {
        var rd = table.a / (table.a + table.b) - table.c / (table.c + table.d);
        return rd;
    }
    static riskRatio(table) {
        var rratio = (table.a / (table.a + table.b)) / (table.c / (table.c + table.d));
        return rratio;
    }
    static oddsRatio(table) {
        var or = (table.a * table.d) / (table.b * table.c);
        return or;
    }
    static IPF2D(rowTotals, colTotals, iterations, seeds) {
        var rT = 0, cT = 0, seedCells = seeds;
        rowTotals.forEach(function (r, i) {
            rT += r;
            seedCells[i] = seedCells[i] || [];
        });
        colTotals.forEach(function (c, j) {
            cT += c;
            seedCells.forEach(function (row, k) {
                seedCells[k][j] = seedCells[k][j] || Math.round(rowTotals[k] / rowTotals.length + (colTotals[j] / colTotals.length) / 2 * Math.random());
            });
        });
        if (rT === cT) {
            for (var iter = 0; iter < iterations; iter++) {
                seedCells.forEach(function (row, ii) {
                    var currentRowTotal = 0;
                    row.forEach(function (cell, j) {
                        currentRowTotal += cell;
                    });
                    row.forEach(function (cell, jj) {
                        seedCells[ii][jj] = cell / currentRowTotal;
                        seedCells[ii][jj] *= rowTotals[ii];
                    });
                });
                for (var col = 0; col < colTotals.length; col++) {
                    var currentColTotal = 0;
                    seedCells.forEach(function (r, k) {
                        currentColTotal += r[col];
                    });
                    seedCells.forEach(function (row, kk) {
                        seedCells[kk][col] = row[col] / currentColTotal;
                        seedCells[kk][col] *= colTotals[col];
                    });
                }
            }
            return seedCells;
        }
    }
}

/** Events class includes methods for organizing events.
*
*/
class Events {
    constructor(events = []) {
        this.queue = [];
        this.schedule(events);
    }
    /**
    * schedule an event with the same trigger multiple times.
    * @param qevent is the event to be scheduled. The at parameter should contain the time at first instance.
    * @param every interval for each occurnce
    * @param end until
    */
    scheduleRecurring(qevent, every, end) {
        var recur = [];
        var duration = end - qevent.at;
        var occurences = Math.floor(duration / every);
        if (!qevent.until) {
            qevent.until = qevent.at;
        }
        for (var i = 0; i <= occurences; i++) {
            recur.push({ name: qevent.name + i, at: qevent.at + (i * every), until: qevent.until + (i * every), trigger: qevent.trigger, triggered: false });
        }
        this.schedule(recur);
    }
    /*
    * schedule a one time events. this arranges the event queue in chronological order.
    * @param qevents an array of events to be schedules.
    */
    schedule(qevents) {
        qevents.forEach(function (d) {
            d.until = d.until || d.at;
        });
        this.queue = this.queue.concat(qevents);
        this.queue = this.organize(this.queue, 0, this.queue.length);
    }
    partition(array, left, right) {
        var cmp = array[right - 1].at, minEnd = left, maxEnd;
        for (maxEnd = left; maxEnd < right - 1; maxEnd += 1) {
            if (array[maxEnd].at <= cmp) {
                this.swap(array, maxEnd, minEnd);
                minEnd += 1;
            }
        }
        this.swap(array, minEnd, right - 1);
        return minEnd;
    }
    swap(array, i, j) {
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
        return array;
    }
    organize(events, left, right) {
        if (left < right) {
            var p = this.partition(events, left, right);
            this.organize(events, left, p);
            this.organize(events, p + 1, right);
        }
        return events;
    }
}

class StateMachine extends QComponent {
    constructor(name, states, transitions, conditions, data) {
        super(name);
        this.states = states;
        this.transitions = this.checkTransitions(transitions);
        this.conditions = conditions;
        this.data = data;
    }
    update(agent, step) {
        for (var s in agent.states) {
            let state = agent.states[s];
            this.states[state](agent, step);
            for (var i = 0; i < this.transitions.length; i++) {
                for (var j = 0; j < this.transitions[i].from.length; j++) {
                    let trans = this.transitions[i].from[j];
                    if (trans === state) {
                        let cond = this.conditions[this.transitions[i].name];
                        let value;
                        if (typeof (cond.value) === 'function') {
                            value = cond.value();
                        }
                        else {
                            value = cond.value;
                        }
                        let r = cond.check(agent[cond.key], value);
                        if (r === StateMachine.SUCCESS) {
                            agent.states[s] = this.transitions[i].to;
                            agent[this.transitions[i].to] = true;
                            agent[this.transitions[i].from] = false; //for easier reporting
                        }
                    }
                }
            }
        }
    }
    checkTransitions(transitions) {
        for (var t = 0; t < transitions.length; t++) {
            if (typeof transitions[t].from === 'string') {
                transitions[t].from = [transitions[t].from];
            }
            else {
                //;
            }
        }
        return transitions;
    }
}

/**
*Batch run environments
*/
class Experiment {
    constructor(environment, setup, target) {
        this.environment = environment;
        this.setup = setup;
        this.rng = setup.experiment.rng;
        this.experimentLog = [];
    }
    start(runs, step, until) {
        var r = 0;
        while (r < runs) {
            this.prep(r, this.setup);
            this.environment.time = 0; //
            this.environment.run(step, until, 0);
            this.experimentLog[r] = this.report(r, this.setup);
            r++;
        }
    }
    prep(r, cfg, agents, visualize) {
        let groups = {};
        let currentAgentId = 0;
        this.environment = new Environment();
        if (typeof cfg.agents !== 'undefined') {
            for (let grName in cfg.agents) {
                let group = cfg.agents[grName];
                groups[grName] = generatePop(group.count, group.params, cfg.environment.spatialType, group.boundaries, currentAgentId, this.rng);
                currentAgentId = groups[grName][groups[grName].length - 1].id;
            }
            
        }
        cfg.components.forEach((cmp) => {
            switch (cmp.type) {
                case 'state-machine':
                    let sm = new StateMachine(cmp.name, cmp.states, cmp.transitions, cmp.conditions, groups[cmp.agents][0]);
                    this.environment.add(sm);
                    break;
                case 'compartmental':
                    let patches = [];
                    cfg.patches.forEach((patch) => {
                        if (cmp.patches.indexOf(patch.name) != -1) {
                            patches.push(new Patch(patch.name, cmp.compartments, patch.populations));
                        }
                    });
                    let cModel = new CompartmentModel('cmp.name', cmp.compartments, patches);
                    this.environment.add(cModel);
                    break;
                case 'every-step':
                    this.environment.add({
                        id: generateUUID(),
                        name: cmp.name,
                        update: cmp.action,
                        data: groups[cmp.agents][0]
                    });
                    break;
                default:
                    break;
            }
        });
        switch (cfg.experiment) {
            default:
                if (r == null) {
                    visualize();
                }
                else {
                    this.environment.rng = this.rng;
                    this.environment.run(cfg.environment.step, cfg.environment.until, 0);
                }
                break;
        }
    }
    report(r, cfg) {
        let sums = {};
        let means = {};
        let freqs = {};
        let model = {};
        let count = this.environment.agents.length;
        //cfg.report.sum = cfg.report.sum.concat(cfg.report.mean);
        for (let i = 0; i < this.environment.agents.length; i++) {
            let d = this.environment.agents[i];
            cfg.report.sums.forEach((s) => {
                sums[s] = sums[s] == undefined ? d[s] : d[s] + sums[s];
            });
            cfg.report.freqs.forEach((f) => {
                if (!isNaN(d[f]) && typeof d[f] != 'undefined') {
                    freqs[f] = freqs[f] == undefined ? d[f] : d[f] + freqs[f];
                }
            });
            if ('compartments' in d) {
                cfg.report.compartments.forEach((cm) => {
                    model[cm] = model[cm] == undefined ? d.populations[cm] : d.populations[cm] + model[cm];
                });
            }
        }
        
        cfg.report.means.forEach((m) => {
            means[m] = sums[m] / count;
        });
        return {
            count: count,
            sums: sums,
            means: means,
            freqs: freqs,
            model: model
        };
    }
    //on each run, change one param, hold others constant
    sweep(params, runsPer, baseline = true) {
        var expPlan = [];
        if (baseline === true) {
            params.baseline = [true];
        }
        for (var prop in params) {
            for (var i = 0; i < params[prop].length; i++) {
                for (var k = 0; k < runsPer; k++) {
                    expPlan.push({
                        param: prop,
                        value: params[prop][i],
                        run: k
                    });
                }
            }
        }
        this.plans = expPlan;
    }
    boot(params) {
        let runs;
        for (let param in params) {
            if (typeof runs === 'undefined') {
                runs = params[param].length;
            }
            if (params[param].length !== runs) {
                throw "length of parameter arrays did not match";
            }
        }
        this.plans = params;
    }
}

class Gene {
    constructor(range, discrete, rng) {
        let val = rng.randRange(range[0], range[1]);
        if (!discrete) {
            this.code = normalize(val, range[0], range[1]);
        }
        else {
            this.code = Math.floor(val);
        }
    }
}
class Chromasome {
    constructor() {
        this.genes = [];
    }
}

class Evolutionary extends Experiment {
    constructor(environment, setup, discrete = false, gradient = true, mating = true) {
        super(environment, setup);
        this.target = setup.evolution.target;
        this.ranges = setup.evolution.params;
        this.size = setup.experiment.size;
        this.mating = mating;
        if (this.size < 2) {
            this.mating = false;
        }
        this.discrete = discrete;
        this.gradient = gradient;
        this.population = [];
        this.mutateRate = 0.03;
        for (let i = 0; i < this.size; i++) {
            let chroma = new Chromasome();
            for (let k = 0; k < this.ranges.length; k++) {
                chroma.genes.push(new Gene(this.ranges[k].range, this.discrete, this.rng));
            }
            this.population.push(chroma);
        }
    }
    start(runs, step, until) {
        let r = 0;
        while (r < runs) {
            this.prep(r, this.setup);
            this.population.sort(this.ascSort);
            this.population = this.population.slice(0, this.size);
            this.experimentLog[this.experimentLog.length - 1].best = this.population[0].score;
            console.log('best: ', this.experimentLog[this.experimentLog.length - 1].best);
            r++;
        }
        return this.experimentLog;
    }
    getParams(chroma, cfg) {
        let out = {};
        for (let pm = 0; pm < this.ranges.length; pm++) {
            let cfgPm = this.ranges[pm];
            if (cfgPm.level === 'agents' || typeof cfgPm.level === 'undefined') {
                out[cfgPm.level + "_" + cfgPm.name] = invNorm(chroma.genes[pm].code, cfgPm.range[0], cfgPm.range[1]);
            }
            else {
                console.log(chroma.genes[pm].code);
                out[cfgPm.level + "_" + cfgPm.name] = invNorm(chroma.genes[pm].code, cfgPm.range[0], cfgPm.range[1]);
            }
        }
        return out;
    }
    dscSort(a, b) {
        if (a.score > b.score) {
            return -1;
        }
        else if (a.score < b.score) {
            return 1;
        }
        return 0;
    }
    ascSort(a, b) {
        if (a.score > b.score) {
            return 1;
        }
        else if (a.score < b.score) {
            return -1;
        }
        return 0;
    }
    prep(r, cfg) {
        if (this.mating) {
            let topPercent = Math.round(0.1 * this.size) + 2; //ten percent of original size + 2
            let children = this.mate(topPercent);
            this.population = this.population.concat(children);
        }
        for (let i = 1; i < this.population.length; i++) {
            this.mutate(this.population[i], 1);
        }
        for (let j = 0; j < this.population.length; j++) {
            for (let pm = 0; pm < this.ranges.length; pm++) {
                let cfgPm = this.ranges[pm];
                let groupIdx;
                if (cfgPm.level === 'agents' || typeof cfgPm.level === 'undefined') {
                    cfg.agents[cfgPm.group].params[cfgPm.name].assign = invNorm(this.population[j].genes[pm].code, cfgPm.range[0], cfgPm.range[1]);
                }
                else {
                    cfg[cfgPm.level].params[cfgPm.group][cfgPm.name] = invNorm(this.population[j].genes[pm].code, cfgPm.range[0], cfgPm.range[1]);
                }
            }
            super.prep(r, cfg);
            this.environment.time = 0;
            let predict = this.report(r, cfg);
            this.population[j].score = this.cost(predict, this.target);
            this.experimentLog.push(predict);
        }
    }
    cost(predict, target) {
        let dev = 0;
        let dimensions = 0;
        for (let key in target.means) {
            dev += target.means[key] - predict.means[key];
            dimensions++;
        }
        for (let key in target.freqs) {
            dev += target.freqs[key] - predict.freqs[key];
            dimensions++;
        }
        for (let key in target.model) {
            dev += target.model[key] - predict.model[key];
            dimensions++;
        }
        return Math.pow(dev, 2) / dimensions;
    }
    report(r, cfg) {
        return super.report(r, cfg);
    }
    mate(parents) {
        let numChildren = 0.5 * this.ranges.length * this.ranges.length;
        let children = [];
        for (let i = 0; i < numChildren; i++) {
            let child = new Chromasome();
            for (let j = 0; j < this.ranges.length; j++) {
                let gene = new Gene([this.ranges[j].range[0], this.ranges[j].range[1]], this.discrete, this.rng);
                let rand = Math.floor(this.rng.random() * parents);
                let expressed = this.population[rand].genes.slice(j, j + 1);
                gene.code = expressed[0].code;
                child.genes.push(gene);
            }
            children.push(child);
        }
        return children;
    }
    mutate(chroma, chance) {
        if (this.rng.random() > chance) {
            return;
        }
        let best = this.population[0].genes;
        for (let j = 0; j < chroma.genes.length; j++) {
            let gene = chroma.genes[j];
            let diff;
            if (this.gradient) {
                diff = best[j].code - gene.code;
            }
            else {
                diff = this.rng.randRange(-1, 1);
            }
            let upOrDown = diff > 0 ? 1 : -1;
            if (!this.discrete) {
                if (diff == 0) {
                    gene.code += this.rng.normal(0, 0.2) * this.mutateRate;
                }
                else {
                    gene.code += diff * this.mutateRate;
                }
            }
            else {
                gene.code += upOrDown;
            }
            gene.code = Math.min(Math.max(0, gene.code), 1);
        }
    }
}

class HybridAutomata extends QComponent {
    constructor(name, data, flowSet, flowMap, jumpSet, jumpMap) {
        super(name);
        this.data = data;
        this.flowSet = flowSet;
        this.flowMap = flowMap;
        this.jumpSet = jumpSet;
        this.jumpMap = jumpMap;
    }
    update(agent, step) {
        let temp = JSON.parse(JSON.stringify(agent));
        for (var mode in this.jumpSet) {
            let edge = this.jumpSet[mode];
            let edgeState = edge.check(agent[edge.key], edge.value);
            if (edgeState === SUCCESS && mode != agent.currentMode) {
                try {
                    agent[edge.key] = this.jumpMap[edge.key][agent.currentMode][mode](agent[edge.key]);
                    agent.currentMode = mode;
                }
                catch (Err) {
                    //no transition this direction;
                    //console.log(Err);
                }
            }
            for (var key in this.flowMap) {
                //second order integration
                let tempD = this.flowMap[key][agent.currentMode](agent[key]);
                temp[key] = agent[key] + tempD;
                agent[key] += 0.5 * (tempD + this.flowMap[key][agent.currentMode](temp[key]));
            }
        }
    }
}

//Hierarchal Task Network
class HTNPlanner extends QComponent {
    static tick(node, task, agent) {
        if (agent.runningList) {
            agent.runningList.push(node.name);
        }
        else {
            agent.runningList = [node.name];
            agent.successList = [];
            agent.barrierList = [];
            agent.blackboard = [];
        }
        var state = node.visit(agent, task);
        return state;
    }
    constructor(name, root, task, data) {
        super(name);
        this.root = root;
        this.data = data;
        this.summary = [];
        this.results = [];
        this.task = task;
    }
    update(agent, step) {
        //iterate an agent(data) through the task network
        agent.active = true;
        HTNPlanner.tick(this.root, this.task, agent);
        if (agent.successList.length > 0) {
            agent.succeed = true;
        }
        else {
            agent.succeed = false;
        }
        agent.active = false;
    }
}
class HTNRootTask {
    constructor(name, goals) {
        this.name = name;
        this.goals = goals;
    }
    evaluateGoal(agent) {
        var result, g;
        for (var p = 0; p < this.goals.length; p++) {
            g = this.goals[p];
            if (g.data) {
                result = g.check(g.data[g.key], g.value);
            }
            else {
                result = g.check(agent[g.key], g.value);
            }
            return result;
        }
    }
}
class HTNNode {
    constructor(name, preconditions) {
        this.id = generateUUID();
        this.name = name;
        this.preconditions = preconditions;
    }
    evaluatePreConds(agent) {
        var result;
        if (this.preconditions instanceof Array) {
            for (var p = 0; p < this.preconditions.length; p++) {
                result = this.preconditions[p].check(agent[this.preconditions[p].key], this.preconditions[p].value);
                if (result === HTNPlanner.FAILED) {
                    return HTNPlanner.FAILED;
                }
            }
        }
        return HTNPlanner.SUCCESS;
    }
}
class HTNOperator extends HTNNode {
    constructor(name, preconditions, effects) {
        super(name, preconditions);
        this.type = "operator";
        this.effects = effects;
        this.visit = function (agent, task) {
            if (this.evaluatePreConds(agent) === HTNPlanner.SUCCESS) {
                for (var i = 0; i < this.effects.length; i++) {
                    this.effects[i](agent.blackboard[0]);
                }
                if (task.evaluateGoal(agent.blackboard[0]) === HTNPlanner.SUCCESS) {
                    agent.successList.unshift(this.name);
                    return HTNPlanner.SUCCESS;
                }
                else {
                    return HTNPlanner.RUNNING;
                }
            }
            else {
                agent.barrierList.unshift({ name: this.name, conditions: this.preconditions });
                return HTNPlanner.FAILED;
            }
        };
    }
}
class HTNMethod extends HTNNode {
    constructor(name, preconditions, children) {
        super(name, preconditions);
        this.type = "method";
        this.children = children;
        this.visit = function (agent, task) {
            var copy = JSON.parse(JSON.stringify(agent));
            delete copy.blackboard;
            agent.blackboard.unshift(copy);
            if (this.evaluatePreConds(agent) === HTNPlanner.SUCCESS) {
                for (var i = 0; i < this.children.length; i++) {
                    var state = HTNPlanner.tick(this.children[i], task, agent);
                    if (state === HTNPlanner.SUCCESS) {
                        agent.successList.unshift(this.name);
                        return HTNPlanner.SUCCESS;
                    }
                }
            }
            else {
                agent.barrierList.unshift({ name: this.name, conditions: this.preconditions });
            }
            return HTNPlanner.FAILED;
        };
    }
}

class MHSampler extends QComponent {
    constructor(name, rng, data, target, save = true) {
        super(name);
        this.kept = 0;
        this.time = 0;
        this.rng = rng;
        this.data = data;
        this.chain = [];
        this.save = save;
        this.target = target;
    }
    update(agent, step) {
        let newProb = 0;
        agent.y = agent.proposal(agent, step, this.rng);
        if (typeof this.target !== 'undefined') {
            this.target.forEach((d) => {
                newProb += agent.lnProbF(agent, step, d);
            });
            newProb *= 1 / this.target.length;
        }
        else {
            newProb = agent.lnProbF(agent, step);
        }
        let diff = newProb - agent.lnProb;
        let u = this.rng.random();
        if (Math.log(u) <= diff || diff >= 0) {
            agent.lnProb = newProb;
            agent.x = agent.y;
        }
        else {
            this.kept += 1;
        }
        if (this.save === true) {
            this.chain.push({ id: agent.id, time: agent.time, x: agent.x });
        }
    }
}

class kMean {
    constructor(data, props, k) {
        this.centroids = [];
        this.limits = {};
        this.iterations = 0;
        //create a limits obj for each prop
        props.forEach(p => {
            this.limits[p] = {
                min: 1e15,
                max: -1e15
            };
        });
        //set limits for each prop
        data.forEach(d => {
            props.forEach(p => {
                if (d[p] > this.limits[p].max) {
                    this.limits[p].max = d[p];
                }
                if (d[p] < this.limits[p].min) {
                    this.limits[p].min = d[p];
                }
            });
        });
        //create k random points
        for (let i = 0; i < k; i++) {
            this.centroids[i] = { count: 0 };
            props.forEach(p => {
                let centroid = Math.random() * this.limits[p].max + this.limits[p].min;
                this.centroids[i][p] = centroid;
            });
        }
        this.data = data;
        this.props = props;
    }
    update() {
        this._assignCentroid();
        this._moveCentroid();
    }
    run() {
        let finished = false;
        while (!finished) {
            this.update();
            this.centroids.forEach(c => {
                finished = c.finished;
            });
            this.iterations++;
        }
        return [this.centroids, this.data];
    }
    _assignCentroid() {
        this.data.forEach((d, j) => {
            let distances = [];
            let totalDist = [];
            let minDist;
            let minIndex;
            //foreach point, get the per prop distance from each centroid
            this.centroids.forEach((c, i) => {
                distances[i] = {};
                totalDist[i] = 0;
                this.props.forEach(p => {
                    distances[i][p] = Math.sqrt((d[p] - c[p]) * (d[p] - c[p]));
                    totalDist[i] += distances[i][p];
                });
                totalDist[i] = Math.sqrt(totalDist[i]);
            });
            minDist = Math.min.apply(null, totalDist);
            minIndex = totalDist.indexOf(minDist);
            d.centroid = minIndex;
            d.distances = distances;
            this.centroids[minIndex].count += 1;
        });
    }
    _moveCentroid() {
        this.centroids.forEach((c, i) => {
            let distFromCentroid = {};
            this.props.forEach(p => distFromCentroid[p] = []);
            //get the per prop distances from the centroid among its' assigned points
            this.data.forEach(d => {
                if (d.centroid === i) {
                    this.props.forEach(p => {
                        distFromCentroid[p].push(d[p]);
                    });
                }
            });
            //handle centroid with no assigned points (randomly assign new);
            if (c.count === 0) {
                this.props.forEach(p => {
                    distFromCentroid[p] = [Math.random() * this.limits[p].max + this.limits[p].min];
                });
            }
            //get the sum and mean per property of the assigned points
            this.props.forEach(p => {
                let sum = distFromCentroid[p].reduce((prev, next) => {
                    return prev + next;
                }, 0);
                let mean = sum / distFromCentroid[p].length;
                //console.log(i, '\'s average dist was', mean, ' the current pos was ', c[p]);
                if (c[p] !== mean) {
                    c[p] = mean;
                    c.finished = false;
                    c.count = 0;
                }
                else {
                    c.finished = true;
                }
            });
        });
    }
}

class KNN {
    setNeighbors(point, data, param, classifier) {
        data.forEach((d) => {
            if (d.id !== point.id) {
                point.neighbors[d.id] = point.neighbors[d.id] || {};
                point.neighbors[d.id][classifier] = d[classifier];
                point.neighbors[d.id][param.param] = Math.abs(point[param.param] - d[param.param]) / param.range;
            }
        });
    }
    sort(neighbors, param) {
        var list = [];
        for (var neigh in neighbors) {
            list.push(neighbors[neigh]);
        }
        list.sort((a, b) => {
            if (a[param] >= b[param]) {
                return 1;
            }
            if (b[param] >= a[param]) {
                return -1;
            }
            return 0;
        });
        return list;
    }
    setDistances(data, trained, kParamsObj, classifier) {
        for (var i = 0; i < data.length; i++) {
            data[i].neighbors = {};
            for (var k = 0; k < kParamsObj.length; k++) {
                if (typeof data[i][kParamsObj[k].param] === 'number') {
                    this.setNeighbors(data[i], trained, kParamsObj[k], classifier);
                }
            }
            for (var n in data[i].neighbors) {
                var neighbor = data[i].neighbors[n];
                var dist = 0;
                for (var p = 0; p < kParamsObj.length; p++) {
                    dist += neighbor[kParamsObj[p].param] * neighbor[kParamsObj[p].param];
                }
                neighbor.distance = Math.sqrt(dist);
            }
        }
        return data;
    }
    getRange(data, kParams) {
        let ranges = [], min = 1e20, max = 0;
        for (var j = 0; j < kParams.length; j++) {
            for (var d = 0; d < data.length; d++) {
                if (data[d][kParams[j]] < min) {
                    min = data[d][kParams[j]];
                }
                if (data[d][kParams[j]] > max) {
                    max = data[d][kParams[j]];
                }
            }
            ranges.push({
                param: kParams[j],
                min: min,
                max: max,
                range: max - min
            });
        }
        
        return ranges;
    }
    classify(data, trainedData, kParams, classifier, nearestN) {
        let kParamsObj = this.getRange([].concat(data, trainedData), kParams);
        data = this.setDistances(data, trainedData, kParamsObj, classifier);
        let ordered = [];
        for (let d = 0; d < data.length; d++) {
            let results = {};
            ordered = this.sort(data[d].neighbors, 'distance');
            let n = 0;
            while (n < nearestN) {
                let current = ordered[n][classifier];
                results[current] = results[current] || 0;
                results[current] += 1;
                n++;
            }
            var max = 0, likeliest = '';
            for (let param in results) {
                if (results[param] > max) {
                    max = results[param];
                    likeliest = param;
                }
            }
            data[d][classifier] = likeliest;
        }
        return data;
    }
}

class Vector {
    constructor(array, size) {
    }
}
class Matrix {
    constructor(mat) {
    }
}
class activationMethods {
    static ReLU(x) {
        return Math.max(x, 0);
    }
    static sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }
    static tanh(x) {
        let val = (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));
        return val;
    }
}

class deriviteMethods {
    static ReLU(value) {
        let der = value <= 0 ? 0 : 1;
        return der;
    }
    static sigmoid(value) {
        let sig = activationMethods.sigmoid;
        return sig(value) * (1 - sig(value));
    }
    static tanh(value) {
        return 1 - Math.pow(activationMethods.tanh(value), 2);
    }
}
function logistic(x, m, b, k) {
    var y = 1 / (m + Math.exp(-k * (x - b)));
    return y;
}
function logit(x, m, b, k) {
    var y = 1 / Math.log(x / (1 - x));
    return y;
}
function linear(x, m, b, k) {
    var y = m * x + b;
    return y;
}
function exponential(x, m, b, k) {
    var y = 1 - Math.pow(x, k) / Math.pow(1, k);
    return y;
}

class Network {
    constructor(data, labels, hiddenNum, el, activationType = "tanh") {
        this.el = el;
        this.iter = 0;
        this.correct = 0;
        this.hiddenNum = hiddenNum;
        this.learnRate = 0.01;
        this.actFn = Network.activationMethods[activationType];
        this.derFn = Network.deriviteMethods[activationType];
        this.init(data, labels);
    }
    learn(iterations, data, labels, render = 100) {
        this.correct = 0;
        for (let i = 0; i < iterations; i++) {
            let randIdx = Math.floor(Math.random() * data.length);
            this.iter++;
            this.forward(data[randIdx]);
            let max = -1;
            let maxIdx = Math.floor(Math.random() * this.values.length);
            this.values[this.values.length - 1].forEach((x, idx) => {
                if (x > max) {
                    maxIdx = idx;
                    max = x;
                }
            });
            let guessed = this.values[this.values.length - 1][maxIdx] >= 0.5 ? 1 : 0;
            if (guessed === labels[randIdx][maxIdx]) {
                this.correct++;
            }
            this.accuracy = this.correct / (i + 1);
            this.backward(labels[randIdx]);
            this.updateWeights();
            this.resetTotals();
        }
    }
    classify(data) {
        this.resetTotals();
        this.forward(data);
        return this.values[this.values.length - 1];
    }
    init(data, labels) {
        let inputs = [];
        this.der = [];
        this.values = [];
        this.weights = [];
        this.weightChanges = [];
        this.totals = [];
        this.derTotals = [];
        this.biases = [];
        for (let n = 0; n < data[0].length; n++) {
            inputs.push(0);
        }
        for (let col = 0; col < this.hiddenNum.length; col++) {
            this.der[col] = [];
            this.values[col] = [];
            this.totals[col] = [];
            this.derTotals[col] = [];
            for (let row = 0; row < this.hiddenNum[col]; row++) {
                this.values[col][row] = 0;
                this.der[col][row] = 0;
                this.totals[col][row] = 0;
                this.derTotals[col][row] = 0;
            }
        }
        this.values.unshift(inputs);
        this.totals.unshift(inputs);
        this.der.unshift(inputs);
        this.derTotals.unshift(inputs);
        this.values[this.hiddenNum.length + 1] = labels[0].map((l) => { return 0; });
        this.totals[this.hiddenNum.length + 1] = labels[0].map((l) => { return 0; });
        this.der[this.hiddenNum.length + 1] = labels[0].map((l) => { return 0; });
        this.derTotals[this.hiddenNum.length + 1] = labels[0].map((l) => { return 0; });
        for (let wg = 0; wg < this.values.length - 1; wg++) {
            this.weights[wg] = [];
            this.weightChanges[wg] = [];
            this.biases[wg] = [];
            for (let src = 0; src < this.values[wg].length; src++) {
                this.weights[wg][src] = [];
                this.weightChanges[wg][src] = [];
                for (let dst = 0; dst < this.values[wg + 1].length; dst++) {
                    this.biases[wg][dst] = Math.random() - 0.5;
                    this.weights[wg][src][dst] = Math.random() - 0.5;
                    this.weightChanges[wg][src][dst] = 0;
                }
            }
        }
    }
    resetTotals() {
        for (let col = 0; col < this.totals.length; col++) {
            for (let row = 0; row < this.totals[col].length; row++) {
                this.totals[col][row] = 0;
                this.derTotals[col][row] = 0;
            }
        }
    }
    forward(input) {
        this.values[0] = input;
        for (let wg = 0; wg < this.weights.length; wg++) {
            let srcVals = wg;
            let dstVals = wg + 1;
            for (let src = 0; src < this.weights[wg].length; src++) {
                for (let dst = 0; dst < this.weights[wg][src].length; dst++) {
                    this.totals[dstVals][dst] += this.values[srcVals][src] * this.weights[wg][src][dst];
                }
            }
            this.values[dstVals] = this.totals[dstVals].map((total, idx) => {
                return this.actFn(total + this.biases[wg][idx]);
            });
        }
    }
    backward(labels) {
        for (let wg = this.weights.length - 1; wg >= 0; wg--) {
            let srcVals = wg;
            let dstVals = wg + 1;
            for (let src = 0; src < this.weights[wg].length; src++) {
                let err = 0;
                for (let dst = 0; dst < this.weights[wg][src].length; dst++) {
                    if (wg === this.weights.length - 1) {
                        err += labels[dst] - this.values[dstVals][dst];
                        this.der[dstVals][dst] = err;
                    }
                    else {
                        err += this.der[dstVals][dst] * this.weights[wg][src][dst];
                    }
                }
                this.derTotals[srcVals][src] = err;
                this.der[srcVals][src] = err * this.derFn(this.values[srcVals][src]);
            }
        }
    }
    updateWeights() {
        for (let wg = 0; wg < this.weights.length; wg++) {
            let srcVals = wg;
            let dstVals = wg + 1;
            for (let src = 0; src < this.weights[wg].length; src++) {
                for (let dst = 0; dst < this.weights[wg][src].length; dst++) {
                    let momentum = this.weightChanges[wg][src][dst] * 0.1;
                    this.weightChanges[wg][src][dst] = (this.values[srcVals][src] * this.der[dstVals][dst] * this.learnRate) + momentum;
                    this.weights[wg][src][dst] += this.weightChanges[wg][src][dst];
                }
            }
            this.biases[wg] = this.biases[wg].map((bias, idx) => {
                return this.learnRate * this.der[dstVals][idx] + bias;
            });
        }
    }
    mse() {
        let err = 0;
        let count = 0;
        for (let j = 0; j < this.derTotals.length; j++) {
            err += this.derTotals[j].reduce((last, current) => {
                count++;
                return last + Math.pow(current, 2);
            }, 0);
        }
        return err / count;
    }
}
Network.activationMethods = {
    ReLU: function (x) {
        return Math.max(x, 0);
    },
    sigmoid: function (x) {
        return 1 / (1 + Math.exp(-x));
    },
    tanh: function (x) {
        let val = (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));
        return val;
    }
};
Network.deriviteMethods = {
    ReLU: function (value) {
        let der = value <= 0 ? 0 : 1;
        return der;
    },
    sigmoid: function (value) {
        let sig = Network.activationMethods.sigmoid;
        return sig(value) * (1 - sig(value));
    },
    tanh: function (value) {
        return 1 - Math.pow(Network.activationMethods.tanh(value), 2);
    }
};
Network.costMethods = {
    sqErr: function (target, guess) {
        return guess - target;
    },
    absErr: function () {
    }
};

class QLearner {
    //TODO - change episode to update
    constructor(R, gamma, goal) {
        this.rawMax = 1;
        this.R = R;
        this.gamma = gamma;
        this.goal = goal;
        this.Q = {};
        for (var state in R) {
            this.Q[state] = {};
            for (var action in R[state]) {
                this.Q[state][action] = 0;
            }
        }
        this.gamma = gamma;
    }
    grow(state, actions) {
        for (let i = 0; i < actions.length; i++) {
            //reward is currently unknown
            this.R[state][actions[i]] = null;
        }
    }
    explore(prom) {
    }
    transition(state, action) {
        //is the state unexamined
        let examined = true;
        let bestAction;
        for (action in this.R[state]) {
            if (this.R[state][action] === null) {
                bestAction = action;
                examined = false;
            }
        }
        bestAction = this.max(action);
        this.Q[state][action] = this.R[state][action] + (this.gamma * this.Q[action][bestAction]);
    }
    max(state) {
        var max = 0, maxAction = null;
        for (var action in this.Q[state]) {
            if (!maxAction) {
                max = this.Q[state][action];
                maxAction = action;
            }
            else if (this.Q[state][action] === max && (Math.random() > 0.5)) {
                max = this.Q[state][action];
                maxAction = action;
            }
            else if (this.Q[state][action] > max) {
                max = this.Q[state][action];
                maxAction = action;
            }
        }
        return maxAction;
    }
    possible(state) {
        var possible = [];
        for (var action in this.R[state]) {
            if (this.R[state][action] > -1) {
                possible.push(action);
            }
        }
        return possible[Math.floor(Math.random() * possible.length)];
    }
    episode(state) {
        this.transition(state, this.possible(state));
        return this.Q;
    }
    normalize() {
        for (var state in this.Q) {
            for (var action in this.Q[state]) {
                if (this.Q[action][state] >= this.rawMax) {
                    this.rawMax = this.Q[action][state];
                }
            }
        }
        for (var state in this.Q) {
            for (var action in this.Q[state]) {
                this.Q[action][state] = Math.round(this.Q[action][state] / this.rawMax * 100);
            }
        }
    }
}

function ols(ivs, dv) {
    let data = dataToMatrix(ivs, this.standardized);
    let dvData = dv.data;
    let n = dvData.length;
    let means = ivs.map((a) => { return a.mean; });
    let sds = ivs.map((a) => { return a.sd; });
    let vars = ivs.map((a) => { return [a.variance]; });
    means.unshift(1);
    sds.unshift(1);
    vars.unshift([1]);
    if (this.standardized) {
        dvData = standardized(dv.data);
    }
    let X = data;
    let Y = dvData.map((y) => { return [y]; });
    let Xprime = jStat.transpose(X);
    let XprimeX = jStat.multiply(Xprime, X);
    let XprimeY = jStat.multiply(Xprime, Y);
    //coefficients
    let b = jStat.multiply(jStat.inv(XprimeX), XprimeY);
    this.betas = b.reduce((a, b) => { return a.concat(b); });
    //standard error of the coefficients
    this.stErrCoeff = jStat.multiply(jStat.inv(XprimeX), vars)
        .reduce((a, b) => { return a.concat(b); });
    //t statistics
    this.tStats = this.stErrCoeff.map((se, i) => { return this.betas[i] / se; });
    //p values
    this.pValues = this.tStats.map((t, i) => { return jStat.ttest(t, means[i], sds[i], n); });
    //residuals
    let yhat = [];
    let res = dv.data.map((d, i) => {
        data[i].shift();
        let row = data[i];
        yhat[i] = this.predict(row);
        return d - yhat[i];
    });
    let residual = yhat;
    return this.betas;
}
function pls(x, y) {
}

/*
* Utility Systems class
*/
class USys extends QComponent {
    constructor(name, options, data) {
        super(name);
        this.options = options;
        this.results = [];
        this.data = data;
    }
    update(agent, step) {
        var tmp = [], max = 0, avg, top;
        for (var i = 0; i < this.options.length; i++) {
            tmp[i] = 0;
            for (var j = 0; j < this.options[i].considerations.length; j++) {
                let c = this.options[i].considerations[j];
                let x = c.x(agent, this.options[i].params);
                tmp[i] += c.f(x, c.m, c.b, c.k);
            }
            avg = tmp[i] / this.options[i].considerations.length;
            this.results.push({ point: agent.id, opt: this.options[i].name, result: avg });
            if (avg > max) {
                agent.top = { name: this.options[i].name, util: avg };
                top = i;
                max = avg;
            }
        }
        this.options[top].action(step, agent);
    }
}

class Random {
    constructor(seed) {
        this.seed = seed;
        this.called = 0;
    }
    randRange(min, max) {
        return (max - min) * this.random() + min;
    }
    mat(rows, cols, dist = 'random') {
        let rands = [];
        if (typeof rows == 'number' && typeof cols == 'number') {
            for (let r = 0; r < rows; r++) {
                rands[r] = [];
                for (let c = 0; c < cols; c++) {
                    rands[r][c] = this[dist]();
                }
            }
        }
        return rands;
    }
    array(n, dist = 'random') {
        let i = 0;
        let rands = [];
        while (i < n) {
            rands[i] = this[dist]();
            i++;
        }
        return rands;
    }
    pick(array) {
        return array[Math.floor(this.random() * array.length)];
    }
    /**
    *Below is adapted from jStat:https://github.com/jstat/jstat/blob/master/src/special.js
    **/
    randn() {
        var u, v, x, y, q;
        do {
            u = this.random();
            v = 1.7156 * (this.random() - 0.5);
            x = u - 0.449871;
            y = Math.abs(v) + 0.386595;
            q = x * x + y * (0.19600 * y - 0.25472 * x);
        } while (q > 0.27597 && (q > 0.27846 || v * v > -4 * Math.log(u) * u * u));
        return v / u;
    }
    randg(shape) {
        var oalph = shape;
        var a1, a2, u, v, x;
        if (!shape)
            shape = 1;
        if (shape < 1)
            shape += 1;
        a1 = shape - 1 / 3;
        a2 = 1 / Math.sqrt(9 * a1);
        do {
            do {
                x = this.randn();
                v = 1 + a2 * x;
            } while (v <= 0);
            v = v * v * v;
            u = this.random();
        } while (u > 1 - 0.331 * Math.pow(x, 4) &&
            Math.log(u) > 0.5 * x * x + a1 * (1 - v + Math.log(v)));
        // alpha > 1
        if (shape == oalph)
            return a1 * v;
        // alpha < 1
        do {
            u = this.random();
        } while (u === 0);
        return Math.pow(u, 1 / oalph) * a1 * v;
    }
    beta(alpha, beta) {
        var u = this.randg(alpha);
        return u / (u + this.randg(beta));
    }
    gamma(shape, scale) {
        return this.randg(shape) * scale;
    }
    logNormal(mu, sigma) {
        return Math.exp(this.randn() * sigma + mu);
    }
    normal(mean = 0, std = 1) {
        return this.randn() * std + mean;
    }
    poisson(l) {
        var p = 1, k = 0, L = Math.exp(-l);
        do {
            k++;
            p *= this.random();
        } while (p > L);
        return k - 1;
    }
    t(dof) {
        return this.randn() * Math.sqrt(dof / (2 * this.randg(dof / 2)));
    }
    weibull(scale, shape) {
        return scale * Math.pow(-Math.log(this.random()), 1 / shape);
    }
}
/**
* Bob Jenkins' small noncryptographic PRNG (pseudorandom number generator) ported to JavaScript
* adapted from:
* https://github.com/graue/burtleprng
* which is from http://www.burtleburtle.net/bob/rand/smallprng.html
*/
class RNGBurtle extends Random {
    constructor(seed) {
        super(seed);
        this.seed >>>= 0;
        this.ctx = new Array(4);
        this.ctx[0] = 0xf1ea5eed;
        this.ctx[1] = this.ctx[2] = this.ctx[3] = this.seed;
        for (var i = 0; i < 20; i++) {
            this.random();
        }
    }
    rot(x, k) {
        return (x << k) | (x >> (32 - k));
    }
    random() {
        var ctx = this.ctx;
        var e = (ctx[0] - this.rot(ctx[1], 27)) >>> 0;
        ctx[0] = (ctx[1] ^ this.rot(ctx[2], 17)) >>> 0;
        ctx[1] = (ctx[2] + ctx[3]) >>> 0;
        ctx[2] = (ctx[3] + e) >>> 0;
        ctx[3] = (e + ctx[0]) >>> 0;
        this.called += 1;
        return ctx[3] / 4294967296.0;
    }
}
/*
* xorshift7*, by François Panneton and Pierre L'ecuyer: 32-bit xor-shift random number generator
* adds robustness by allowing more shifts than Marsaglia's original three. It is a 7-shift generator with 256 bits, that passes BigCrush with no systmatic failures.
* Adapted from https://github.com/davidbau/xsrand
*/
class RNGxorshift7 extends Random {
    constructor(seed) {
        let j, w, X = [];
        super(seed);
        // Seed state array using a 32-bit integer.
        w = X[0] = this.seed;
        // Enforce an array length of 8, not all zeroes.
        while (X.length < 8) {
            X.push(0);
        }
        for (j = 0; j < 8 && X[j] === 0; ++j) {
            if (j == 8) {
                w = X[7] = -1;
            }
            else {
                w = X[j];
            }
        }
        this.x = X;
        this.i = 0;
        // Discard an initial 256 values.
        for (j = 256; j > 0; --j) {
            this.random();
        }
    }
    random() {
        let X = this.x, i = this.i, t, v, w, res;
        t = X[i];
        t ^= (t >>> 7);
        v = t ^ (t << 24);
        t = X[(i + 1) & 7];
        v ^= t ^ (t >>> 10);
        t = X[(i + 3) & 7];
        v ^= t ^ (t >>> 3);
        t = X[(i + 4) & 7];
        v ^= t ^ (t << 7);
        t = X[(i + 7) & 7];
        t = t ^ (t << 13);
        v ^= t ^ (t << 9);
        X[i] = v;
        this.i = (i + 1) & 7;
        res = (v >>> 0) / ((1 << 30) * 4);
        this.called += 1;
        return res;
    }
}

var version = '0.0.5';


var qepikit = Object.freeze({
	version: version,
	QComponent: QComponent,
	BDIAgent: BDIAgent,
	ContactPatch: ContactPatch,
	Environment: Environment,
	Experiment: Experiment,
	Evolutionary: Evolutionary,
	HybridAutomata: HybridAutomata,
	kMean: kMean,
	KNN: KNN,
	Network: Network,
	QLearner: QLearner,
	StateMachine: StateMachine,
	SUCCESS: SUCCESS,
	FAILED: FAILED,
	RUNNING: RUNNING,
	createCSVURI: createCSVURI,
	arrayFromRange: arrayFromRange,
	shuffle: shuffle,
	generateUUID: generateUUID,
	always: always,
	eventually: eventually,
	equalTo: equalTo,
	not: not,
	notEqualTo: notEqualTo,
	gt: gt,
	gtEq: gtEq,
	lt: lt,
	ltEq: ltEq,
	hasProp: hasProp,
	inRange: inRange,
	notInRange: notInRange,
	getMatcherString: getMatcherString,
	setMin: setMin,
	setMax: setMax,
	setStandard: setStandard,
	dataToMatrix: dataToMatrix,
	standardized: standardized,
	normalize: normalize,
	invNorm: invNorm,
	randRange: randRange,
	getRange: getRange,
	Match: Match,
	generatePop: generatePop,
	BehaviorTree: BehaviorTree,
	BTNode: BTNode,
	BTControlNode: BTControlNode,
	BTRoot: BTRoot,
	BTSelector: BTSelector,
	BTSequence: BTSequence,
	BTParallel: BTParallel,
	BTCondition: BTCondition,
	BTAction: BTAction,
	CompartmentModel: CompartmentModel,
	Compartment: Compartment,
	Patch: Patch,
	Epi: Epi,
	Events: Events,
	Gene: Gene,
	Chromasome: Chromasome,
	HTNPlanner: HTNPlanner,
	HTNRootTask: HTNRootTask,
	HTNNode: HTNNode,
	HTNOperator: HTNOperator,
	HTNMethod: HTNMethod,
	MHSampler: MHSampler,
	Vector: Vector,
	Matrix: Matrix,
	activationMethods: activationMethods,
	deriviteMethods: deriviteMethods,
	logistic: logistic,
	logit: logit,
	linear: linear,
	exponential: exponential,
	ols: ols,
	pls: pls,
	USys: USys,
	RNGBurtle: RNGBurtle,
	RNGxorshift7: RNGxorshift7
});

/***
*@module QEpiKit
*/
let QEpiKit = qepikit;
for (let key in QEpiKit) {
    if (key == 'version') {
        console.log(QEpiKit[key]);
    }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicWVwaWtpdC5qcyIsInNvdXJjZXMiOlsiZGlzdC91dGlscy5qcyIsImRpc3QvUUNvbXBvbmVudC5qcyIsImRpc3QvYmRpLmpzIiwiZGlzdC9iZWhhdmlvclRyZWUuanMiLCJkaXN0L2NvbXBhcnRtZW50LmpzIiwiZGlzdC9jb250YWN0UGF0Y2guanMiLCJkaXN0L2Vudmlyb25tZW50LmpzIiwiZGlzdC9lcGkuanMiLCJkaXN0L2V2ZW50cy5qcyIsImRpc3Qvc3RhdGVNYWNoaW5lLmpzIiwiZGlzdC9leHBlcmltZW50LmpzIiwiZGlzdC9nZW5ldGljLmpzIiwiZGlzdC9ldm9sdXRpb25hcnkuanMiLCJkaXN0L2hhLmpzIiwiZGlzdC9odG4uanMiLCJkaXN0L21jLmpzIiwiZGlzdC9rbWVhbi5qcyIsImRpc3Qva25uLmpzIiwiZGlzdC9tYXRoLmpzIiwiZGlzdC9uZXR3b3JrLmpzIiwiZGlzdC9RTGVhcm5lci5qcyIsImRpc3QvcmVncmVzc2lvbi5qcyIsImRpc3QvVVN5cy5qcyIsImRpc3QvcmFuZG9tLmpzIiwiZGlzdC9tYWluLmpzIiwiZGlzdC9RRXBpS2l0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBTVUNDRVNTID0gMTtcbmV4cG9ydCBjb25zdCBGQUlMRUQgPSAyO1xuZXhwb3J0IGNvbnN0IFJVTk5JTkcgPSAzO1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNTVlVSSShkYXRhKSB7XG4gICAgdmFyIGRhdGFTdHJpbmc7XG4gICAgdmFyIFVSSTtcbiAgICB2YXIgY3N2Q29udGVudCA9IFwiZGF0YTp0ZXh0L2NzdjtjaGFyc2V0PXV0Zi04LFwiO1xuICAgIHZhciBjc3ZDb250ZW50QXJyYXkgPSBbXTtcbiAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGluZm9BcnJheSkge1xuICAgICAgICBkYXRhU3RyaW5nID0gaW5mb0FycmF5LmpvaW4oXCIsXCIpO1xuICAgICAgICBjc3ZDb250ZW50QXJyYXkucHVzaChkYXRhU3RyaW5nKTtcbiAgICB9KTtcbiAgICBjc3ZDb250ZW50ICs9IGNzdkNvbnRlbnRBcnJheS5qb2luKFwiXFxuXCIpO1xuICAgIFVSSSA9IGVuY29kZVVSSShjc3ZDb250ZW50KTtcbiAgICByZXR1cm4gVVJJO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGFycmF5RnJvbVJhbmdlKHN0YXJ0LCBlbmQsIHN0ZXApIHtcbiAgICB2YXIgcmFuZ2UgPSBbXTtcbiAgICB2YXIgaSA9IHN0YXJ0O1xuICAgIHdoaWxlIChpIDwgZW5kKSB7XG4gICAgICAgIHJhbmdlLnB1c2goaSk7XG4gICAgICAgIGkgKz0gc3RlcDtcbiAgICB9XG4gICAgcmV0dXJuIHJhbmdlO1xufVxuLyoqXG4qIHNodWZmbGUgLSBmaXNoZXIteWF0ZXMgc2h1ZmZsZVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBzaHVmZmxlKGFycmF5LCBybmcpIHtcbiAgICB2YXIgY3VycmVudEluZGV4ID0gYXJyYXkubGVuZ3RoLCB0ZW1wb3JhcnlWYWx1ZSwgcmFuZG9tSW5kZXg7XG4gICAgLy8gV2hpbGUgdGhlcmUgcmVtYWluIGVsZW1lbnRzIHRvIHNodWZmbGUuLi5cbiAgICB3aGlsZSAoMCAhPT0gY3VycmVudEluZGV4KSB7XG4gICAgICAgIC8vIFBpY2sgYSByZW1haW5pbmcgZWxlbWVudC4uLlxuICAgICAgICByYW5kb21JbmRleCA9IE1hdGguZmxvb3Iocm5nLnJhbmRvbSgpICogY3VycmVudEluZGV4KTtcbiAgICAgICAgY3VycmVudEluZGV4IC09IDE7XG4gICAgICAgIC8vIEFuZCBzd2FwIGl0IHdpdGggdGhlIGN1cnJlbnQgZWxlbWVudC5cbiAgICAgICAgdGVtcG9yYXJ5VmFsdWUgPSBhcnJheVtjdXJyZW50SW5kZXhdO1xuICAgICAgICBhcnJheVtjdXJyZW50SW5kZXhdID0gYXJyYXlbcmFuZG9tSW5kZXhdO1xuICAgICAgICBhcnJheVtyYW5kb21JbmRleF0gPSB0ZW1wb3JhcnlWYWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlVVVJRCgpIHtcbiAgICAvLyBodHRwOi8vd3d3LmJyb29mYS5jb20vVG9vbHMvTWF0aC51dWlkLmh0bVxuICAgIHZhciBjaGFycyA9ICcwMTIzNDU2Nzg5QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eicuc3BsaXQoJycpO1xuICAgIHZhciB1dWlkID0gbmV3IEFycmF5KDM2KTtcbiAgICB2YXIgcm5kID0gMCwgcjtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM2OyBpKyspIHtcbiAgICAgICAgaWYgKGkgPT0gOCB8fCBpID09IDEzIHx8IGkgPT0gMTggfHwgaSA9PSAyMykge1xuICAgICAgICAgICAgdXVpZFtpXSA9ICctJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpID09IDE0KSB7XG4gICAgICAgICAgICB1dWlkW2ldID0gJzQnO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKHJuZCA8PSAweDAyKVxuICAgICAgICAgICAgICAgIHJuZCA9IDB4MjAwMDAwMCArIChNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwKSB8IDA7XG4gICAgICAgICAgICByID0gcm5kICYgMHhmO1xuICAgICAgICAgICAgcm5kID0gcm5kID4+IDQ7XG4gICAgICAgICAgICB1dWlkW2ldID0gY2hhcnNbKGkgPT0gMTkpID8gKHIgJiAweDMpIHwgMHg4IDogcl07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHV1aWQuam9pbignJyk7XG59XG5leHBvcnQgZnVuY3Rpb24gYWx3YXlzKGEpIHtcbiAgICBpZiAoYSA9PT0gU1VDQ0VTUykge1xuICAgICAgICByZXR1cm4gU1VDQ0VTUztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBGQUlMRUQ7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGV2ZW50dWFsbHkoYSkge1xuICAgIGlmIChhID09PSBTVUNDRVNTKSB7XG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFJVTk5JTkc7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFsVG8oYSwgYikge1xuICAgIGlmIChhID09PSBiKSB7XG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gbm90KHJlc3VsdCkge1xuICAgIHZhciBuZXdSZXN1bHQ7XG4gICAgaWYgKHJlc3VsdCA9PT0gU1VDQ0VTUykge1xuICAgICAgICBuZXdSZXN1bHQgPSBGQUlMRUQ7XG4gICAgfVxuICAgIGVsc2UgaWYgKHJlc3VsdCA9PT0gRkFJTEVEKSB7XG4gICAgICAgIG5ld1Jlc3VsdCA9IFNVQ0NFU1M7XG4gICAgfVxuICAgIHJldHVybiBuZXdSZXN1bHQ7XG59XG5leHBvcnQgZnVuY3Rpb24gbm90RXF1YWxUbyhhLCBiKSB7XG4gICAgaWYgKGEgIT09IGIpIHtcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gRkFJTEVEO1xuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBndChhLCBiKSB7XG4gICAgaWYgKGEgPiBiKSB7XG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gZ3RFcShhLCBiKSB7XG4gICAgaWYgKGEgPj0gYikge1xuICAgICAgICByZXR1cm4gU1VDQ0VTUztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBGQUlMRUQ7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGx0KGEsIGIpIHtcbiAgICBpZiAoYSA8IGIpIHtcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gRkFJTEVEO1xuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBsdEVxKGEsIGIpIHtcbiAgICBpZiAoYSA8PSBiKSB7XG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gaGFzUHJvcChhLCBiKSB7XG4gICAgYSA9IGEgfHwgZmFsc2U7XG4gICAgaWYgKGEgPT09IGIpIHtcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gRkFJTEVEO1xuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBpblJhbmdlKGEsIGIpIHtcbiAgICBpZiAoYiA+PSBhWzBdICYmIGIgPD0gYVsxXSkge1xuICAgICAgICByZXR1cm4gU1VDQ0VTUztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBGQUlMRUQ7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIG5vdEluUmFuZ2UoYSwgYikge1xuICAgIGlmIChiID49IGFbMF0gJiYgYiA8PSBhWzFdKSB7XG4gICAgICAgIHJldHVybiBGQUlMRUQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gU1VDQ0VTUztcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0TWF0Y2hlclN0cmluZyhjaGVjaykge1xuICAgIHZhciBzdHJpbmcgPSBudWxsO1xuICAgIHN3aXRjaCAoY2hlY2spIHtcbiAgICAgICAgY2FzZSBlcXVhbFRvOlxuICAgICAgICAgICAgc3RyaW5nID0gXCJlcXVhbCB0b1wiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2Ugbm90RXF1YWxUbzpcbiAgICAgICAgICAgIHN0cmluZyA9IFwibm90IGVxdWFsIHRvXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBndDpcbiAgICAgICAgICAgIHN0cmluZyA9IFwiZ3JlYXRlciB0aGFuXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBndEVxOlxuICAgICAgICAgICAgc3RyaW5nID0gXCJncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG9cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGx0OlxuICAgICAgICAgICAgc3RyaW5nID0gXCJsZXNzIHRoYW5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGx0RXE6XG4gICAgICAgICAgICBzdHJpbmcgPSBcImxlc3MgdGhhbiBvciBlcXVhbCB0b1wiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgaGFzUHJvcDpcbiAgICAgICAgICAgIHN0cmluZyA9IFwiaGFzIHRoZSBwcm9wZXJ0eVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHN0cmluZyA9IFwibm90IGEgZGVmaW5lZCBtYXRjaGVyXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiBzdHJpbmc7XG59XG5leHBvcnQgZnVuY3Rpb24gc2V0TWluKHBhcmFtcywga2V5cykge1xuICAgIGZvciAodmFyIHBhcmFtIGluIHBhcmFtcykge1xuICAgICAgICBpZiAodHlwZW9mIChrZXlzKSAhPT0gJ3VuZGVmaW5lZCcgJiYga2V5cy5pbmRleE9mKHBhcmFtKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHBhcmFtc1twYXJhbV0uY3VycmVudCA9IHBhcmFtc1twYXJhbV0udmFsdWUgLSBwYXJhbXNbcGFyYW1dLmVycm9yO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiAoa2V5cykgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBwYXJhbXNbcGFyYW1dLmN1cnJlbnQgPSBwYXJhbXNbcGFyYW1dLnZhbHVlIC0gcGFyYW1zW3BhcmFtXS5lcnJvcjtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBzZXRNYXgocGFyYW1zLCBrZXlzKSB7XG4gICAgZm9yICh2YXIgcGFyYW0gaW4gcGFyYW1zKSB7XG4gICAgICAgIGlmICh0eXBlb2YgKGtleXMpICE9PSAndW5kZWZpbmVkJyAmJiBrZXlzLmluZGV4T2YocGFyYW0pICE9PSAtMSkge1xuICAgICAgICAgICAgcGFyYW1zW3BhcmFtXS5jdXJyZW50ID0gcGFyYW1zW3BhcmFtXS52YWx1ZSArIHBhcmFtc1twYXJhbV0uZXJyb3I7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIChrZXlzKSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHBhcmFtc1twYXJhbV0uY3VycmVudCA9IHBhcmFtc1twYXJhbV0udmFsdWUgKyBwYXJhbXNbcGFyYW1dLmVycm9yO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIHNldFN0YW5kYXJkKHBhcmFtcywga2V5cykge1xuICAgIGZvciAodmFyIHBhcmFtIGluIHBhcmFtcykge1xuICAgICAgICBpZiAodHlwZW9mIChrZXlzKSAhPT0gJ3VuZGVmaW5lZCcgJiYga2V5cy5pbmRleE9mKHBhcmFtKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHBhcmFtc1twYXJhbV0uY3VycmVudCA9IHBhcmFtc1twYXJhbV0udmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIChrZXlzKSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHBhcmFtc1twYXJhbV0uY3VycmVudCA9IHBhcmFtc1twYXJhbV0udmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gZGF0YVRvTWF0cml4KGl0ZW1zLCBzdGRpemVkID0gZmFsc2UpIHtcbiAgICBsZXQgZGF0YSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IGl0ZW0gPSBpdGVtc1tpXTtcbiAgICAgICAgaWYgKHN0ZGl6ZWQpIHtcbiAgICAgICAgICAgIGl0ZW0gPSBzdGFuZGFyZGl6ZWQoaXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgaXRlbS5mb3JFYWNoKCh4LCBpaSkgPT4ge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBkYXRhW2lpXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBkYXRhW2lpXSA9IFsxLCB4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGRhdGFbaWldLnB1c2goeCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbn1cbi8qXG4qIHJlbGF0aXZlIHRvIHRoZSBtZWFuLCBob3cgbWFueSBzdGFuZGFyZCBkZXZpYXRpb25zXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YW5kYXJkaXplZChhcnIpIHtcbiAgICBsZXQgc3RkID0galN0YXQuc3RkZXYoYXJyKTtcbiAgICBsZXQgbWVhbiA9IGpTdGF0Lm1lYW4oYXJyKTtcbiAgICBsZXQgc3RhbmRhcmRpemVkID0gYXJyLm1hcCgoZCkgPT4ge1xuICAgICAgICByZXR1cm4gKGQgLSBtZWFuKSAvIHN0ZDtcbiAgICB9KTtcbiAgICByZXR1cm4gc3RhbmRhcmRpemVkO1xufVxuLypcbiogYmV0d2VlbiAwIGFuZCAxIHdoZW4gbWluIGFuZCBtYXggYXJlIGtub3duXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZSh4LCBtaW4sIG1heCkge1xuICAgIGxldCB2YWwgPSB4IC0gbWluO1xuICAgIHJldHVybiB2YWwgLyAobWF4IC0gbWluKTtcbn1cbi8qXG4qIGdpdmUgdGhlIHJlYWwgdW5pdCB2YWx1ZVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZOb3JtKHgsIG1pbiwgbWF4KSB7XG4gICAgcmV0dXJuICh4ICogbWF4IC0geCAqIG1pbikgKyBtaW47XG59XG4vKlxuKlxuKi9cbmV4cG9ydCBmdW5jdGlvbiByYW5kUmFuZ2UobWluLCBtYXgpIHtcbiAgICByZXR1cm4gKG1heCAtIG1pbikgKiBNYXRoLnJhbmRvbSgpICsgbWluO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFJhbmdlKGRhdGEsIHByb3ApIHtcbiAgICBsZXQgcmFuZ2UgPSB7XG4gICAgICAgIG1pbjogMWUxNSxcbiAgICAgICAgbWF4OiAtMWUxNVxuICAgIH07XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChyYW5nZS5taW4gPiBkYXRhW2ldW3Byb3BdKSB7XG4gICAgICAgICAgICByYW5nZS5taW4gPSBkYXRhW2ldW3Byb3BdO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyYW5nZS5tYXggPCBkYXRhW2ldW3Byb3BdKSB7XG4gICAgICAgICAgICByYW5nZS5tYXggPSBkYXRhW2ldW3Byb3BdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByYW5nZTtcbn1cbmV4cG9ydCBjbGFzcyBNYXRjaCB7XG4gICAgc3RhdGljIGd0KGEsIGIpIHtcbiAgICAgICAgaWYgKGEgPiBiKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHN0YXRpYyBnZShhLCBiKSB7XG4gICAgICAgIGlmIChhID49IGIpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgc3RhdGljIGx0KGEsIGIpIHtcbiAgICAgICAgaWYgKGEgPCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHN0YXRpYyBsZShhLCBiKSB7XG4gICAgICAgIGlmIChhIDw9IGIpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVQb3AobnVtQWdlbnRzLCBvcHRpb25zLCB0eXBlLCBib3VuZGFyaWVzLCBjdXJyZW50QWdlbnRJZCwgcm5nKSB7XG4gICAgdmFyIHBvcCA9IFtdO1xuICAgIHZhciBsb2NzID0ge1xuICAgICAgICB0eXBlOiAnRmVhdHVyZUNvbGxlY3Rpb24nLFxuICAgICAgICBmZWF0dXJlczogW11cbiAgICB9O1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IFtdO1xuICAgIHR5cGUgPSB0eXBlIHx8ICdjb250aW51b3VzJztcbiAgICBmb3IgKHZhciBhID0gMDsgYSA8IG51bUFnZW50czsgYSsrKSB7XG4gICAgICAgIHBvcFthXSA9IHtcbiAgICAgICAgICAgIGlkOiBjdXJyZW50QWdlbnRJZCxcbiAgICAgICAgICAgIHR5cGU6IHR5cGVcbiAgICAgICAgfTtcbiAgICAgICAgLy9tb3ZlbWVudCBwYXJhbXNcbiAgICAgICAgcG9wW2FdLm1vdmVQZXJEYXkgPSBybmcubm9ybWFsKDI1MDAgKiAyNCwgMTAwMCk7IC8vIG0vZGF5XG4gICAgICAgIHBvcFthXS5wcmV2WCA9IDA7XG4gICAgICAgIHBvcFthXS5wcmV2WSA9IDA7XG4gICAgICAgIHBvcFthXS5tb3ZlZFRvdGFsID0gMDtcbiAgICAgICAgaWYgKHBvcFthXS50eXBlID09PSAnY29udGludW91cycpIHtcbiAgICAgICAgICAgIHBvcFthXS5tZXNoID0gbmV3IFRIUkVFLk1lc2gobmV3IFRIUkVFLlRldHJhaGVkcm9uR2VvbWV0cnkoMSwgMSksIG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7XG4gICAgICAgICAgICAgICAgY29sb3I6IDB4MDBmZjAwXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBwb3BbYV0ubWVzaC5xSWQgPSBwb3BbYV0uaWQ7XG4gICAgICAgICAgICBwb3BbYV0ubWVzaC50eXBlID0gJ2FnZW50JztcbiAgICAgICAgICAgIHBvcFthXS5wb3NpdGlvbiA9IHsgeDogMCwgeTogMCwgejogMCB9O1xuICAgICAgICAgICAgcG9wW2FdLnBvc2l0aW9uLnggPSBybmcucmFuZFJhbmdlKGJvdW5kYXJpZXMubGVmdCwgYm91bmRhcmllcy5yaWdodCk7XG4gICAgICAgICAgICBwb3BbYV0ucG9zaXRpb24ueSA9IHJuZy5yYW5kUmFuZ2UoYm91bmRhcmllcy5ib3R0b20sIGJvdW5kYXJpZXMudG9wKTtcbiAgICAgICAgICAgIHBvcFthXS5tZXNoLnBvc2l0aW9uLnggPSBwb3BbYV0ucG9zaXRpb24ueDtcbiAgICAgICAgICAgIHBvcFthXS5tZXNoLnBvc2l0aW9uLnkgPSBwb3BbYV0ucG9zaXRpb24ueTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocG9wW2FdLnR5cGUgPT09ICdnZW9zcGF0aWFsJykge1xuICAgICAgICAgICAgbG9jcy5mZWF0dXJlc1thXSA9IHR1cmYucG9pbnQoW3JuZy5yYW5kUmFuZ2UoLTc1LjE0NjcsIC03NS4xODY3KSwgcm5nLnJhbmRSYW5nZSgzOS45MjAwLCAzOS45OTAwKV0pO1xuICAgICAgICAgICAgcG9wW2FdLmxvY2F0aW9uID0gbG9jcy5mZWF0dXJlc1thXTtcbiAgICAgICAgICAgIHBvcFthXS5sb2NhdGlvbi5wcm9wZXJ0aWVzLmFnZW50UmVmSUQgPSBwb3BbYV0uaWQ7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQga2V5IGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGxldCBkID0gb3B0aW9uc1trZXldO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBkLmFzc2lnbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHBvcFthXVtrZXldID0gZC5hc3NpZ24ocG9wW2FdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHBvcFthXVtrZXldID0gZC5hc3NpZ247XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgO1xuICAgICAgICBjdXJyZW50QWdlbnRJZCsrO1xuICAgIH1cbiAgICBmb3IgKHZhciByID0gMDsgciA8IDM7IHIrKykge1xuICAgICAgICBwb3Bbcl0uc3RhdGVzLmlsbG5lc3MgPSAnaW5mZWN0aW91cyc7XG4gICAgICAgIHBvcFtyXS5pbmZlY3Rpb3VzID0gdHJ1ZTtcbiAgICAgICAgcG9wW3JdLnBhdGhvZ2VuTG9hZCA9IDRlNDtcbiAgICB9XG4gICAgZm9yIChsZXQgYSA9IDA7IGEgPCBwb3AubGVuZ3RoOyBhKyspIHtcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHBvcFthXS5zdGF0ZXMpIHtcbiAgICAgICAgICAgIHBvcFthXVtwb3BbYV0uc3RhdGVzW2tleV1dID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gW3BvcCwgbG9jc107XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD11dGlscy5qcy5tYXAiLCJpbXBvcnQgeyBnZW5lcmF0ZVVVSUQgfSBmcm9tICcuL3V0aWxzJztcbi8qKlxuKlFDb21wb25lbnRzIGFyZSB0aGUgYmFzZSBjbGFzcyBmb3IgbWFueSBtb2RlbCBjb21wb25lbnRzLlxuKi9cbmV4cG9ydCBjbGFzcyBRQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lKSB7XG4gICAgICAgIHRoaXMuaWQgPSBnZW5lcmF0ZVVVSUQoKTtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy50aW1lID0gMDtcbiAgICAgICAgdGhpcy5oaXN0b3J5ID0gW107XG4gICAgfVxuICAgIC8qKiBUYWtlIG9uZSB0aW1lIHN0ZXAgZm9yd2FyZCAobW9zdCBzdWJjbGFzc2VzIG92ZXJyaWRlIHRoZSBiYXNlIG1ldGhvZClcbiAgICAqIEBwYXJhbSBzdGVwIHNpemUgb2YgdGltZSBzdGVwIChpbiBkYXlzIGJ5IGNvbnZlbnRpb24pXG4gICAgKi9cbiAgICB1cGRhdGUoYWdlbnQsIHN0ZXApIHtcbiAgICAgICAgLy9zb21ldGhpbmcgc3VwZXIhXG4gICAgfVxufVxuUUNvbXBvbmVudC5TVUNDRVNTID0gMTtcblFDb21wb25lbnQuRkFJTEVEID0gMjtcblFDb21wb25lbnQuUlVOTklORyA9IDM7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1RQ29tcG9uZW50LmpzLm1hcCIsImltcG9ydCB7IFFDb21wb25lbnQgfSBmcm9tICcuL1FDb21wb25lbnQnO1xuaW1wb3J0IHsgZ2V0TWF0Y2hlclN0cmluZyB9IGZyb20gJy4vdXRpbHMnO1xuLyoqXG4qIEJlbGllZiBEZXNpcmUgSW50ZW50IGFnZW50cyBhcmUgc2ltcGxlIHBsYW5uaW5nIGFnZW50cyB3aXRoIG1vZHVsYXIgcGxhbnMgLyBkZWxpYmVyYXRpb24gcHJvY2Vzc2VzLlxuKi9cbmV4cG9ydCBjbGFzcyBCRElBZ2VudCBleHRlbmRzIFFDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGdvYWxzID0gW10sIHBsYW5zID0ge30sIGRhdGEgPSBbXSwgcG9saWN5U2VsZWN0b3IgPSBCRElBZ2VudC5zdG9jaGFzdGljU2VsZWN0aW9uKSB7XG4gICAgICAgIHN1cGVyKG5hbWUpO1xuICAgICAgICB0aGlzLmdvYWxzID0gZ29hbHM7XG4gICAgICAgIHRoaXMucGxhbnMgPSBwbGFucztcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICAgICAgdGhpcy5wb2xpY3lTZWxlY3RvciA9IHBvbGljeVNlbGVjdG9yO1xuICAgICAgICB0aGlzLmJlbGllZkhpc3RvcnkgPSBbXTtcbiAgICAgICAgdGhpcy5wbGFuSGlzdG9yeSA9IFtdO1xuICAgIH1cbiAgICAvKiogVGFrZSBvbmUgdGltZSBzdGVwIGZvcndhcmQsIHRha2UgaW4gYmVsaWVmcywgZGVsaWJlcmF0ZSwgaW1wbGVtZW50IHBvbGljeVxuICAgICogQHBhcmFtIHN0ZXAgc2l6ZSBvZiB0aW1lIHN0ZXAgKGluIGRheXMgYnkgY29udmVudGlvbilcbiAgICAqL1xuICAgIHVwZGF0ZShhZ2VudCwgc3RlcCkge1xuICAgICAgICB2YXIgcG9saWN5LCBpbnRlbnQsIGV2YWx1YXRpb247XG4gICAgICAgIHBvbGljeSA9IHRoaXMucG9saWN5U2VsZWN0b3IodGhpcy5wbGFucywgdGhpcy5wbGFuSGlzdG9yeSwgYWdlbnQpO1xuICAgICAgICBpbnRlbnQgPSB0aGlzLnBsYW5zW3BvbGljeV07XG4gICAgICAgIGludGVudChhZ2VudCwgc3RlcCk7XG4gICAgICAgIGV2YWx1YXRpb24gPSB0aGlzLmV2YWx1YXRlR29hbHMoYWdlbnQpO1xuICAgICAgICB0aGlzLnBsYW5IaXN0b3J5LnB1c2goeyB0aW1lOiB0aGlzLnRpbWUsIGlkOiBhZ2VudC5pZCwgaW50ZW50aW9uOiBwb2xpY3ksIGdvYWxzOiBldmFsdWF0aW9uLmFjaGlldmVtZW50cywgYmFycmllcnM6IGV2YWx1YXRpb24uYmFycmllcnMsIHI6IGV2YWx1YXRpb24uc3VjY2Vzc2VzIC8gdGhpcy5nb2Fscy5sZW5ndGggfSk7XG4gICAgfVxuICAgIGV2YWx1YXRlR29hbHMoYWdlbnQpIHtcbiAgICAgICAgbGV0IGFjaGlldmVtZW50cyA9IFtdLCBiYXJyaWVycyA9IFtdLCBzdWNjZXNzZXMgPSAwLCBjLCBtYXRjaGVyO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZ29hbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGMgPSB0aGlzLmdvYWxzW2ldLmNvbmRpdGlvbjtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYy5kYXRhID09PSAndW5kZWZpbmVkJyB8fCBjLmRhdGEgPT09IFwiYWdlbnRcIikge1xuICAgICAgICAgICAgICAgIGMuZGF0YSA9IGFnZW50OyAvL2lmIG5vIGRhdGFzb3VyY2UgaXMgc2V0LCB1c2UgdGhlIGFnZW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhY2hpZXZlbWVudHNbaV0gPSB0aGlzLmdvYWxzW2ldLnRlbXBvcmFsKGMuY2hlY2soYy5kYXRhW2Mua2V5XSwgYy52YWx1ZSkpO1xuICAgICAgICAgICAgaWYgKGFjaGlldmVtZW50c1tpXSA9PT0gQkRJQWdlbnQuU1VDQ0VTUykge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3NlcyArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbWF0Y2hlciA9IGdldE1hdGNoZXJTdHJpbmcoYy5jaGVjayk7XG4gICAgICAgICAgICAgICAgYmFycmllcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBjLmxhYmVsLFxuICAgICAgICAgICAgICAgICAgICBrZXk6IGMua2V5LFxuICAgICAgICAgICAgICAgICAgICBjaGVjazogbWF0Y2hlcixcbiAgICAgICAgICAgICAgICAgICAgYWN0dWFsOiBjLmRhdGFbYy5rZXldLFxuICAgICAgICAgICAgICAgICAgICBleHBlY3RlZDogYy52YWx1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3Nlczogc3VjY2Vzc2VzLCBiYXJyaWVyczogYmFycmllcnMsIGFjaGlldmVtZW50czogYWNoaWV2ZW1lbnRzIH07XG4gICAgfVxuICAgIC8vZ29vZCBmb3IgdHJhaW5pbmdcbiAgICBzdGF0aWMgc3RvY2hhc3RpY1NlbGVjdGlvbihwbGFucywgcGxhbkhpc3RvcnksIGFnZW50KSB7XG4gICAgICAgIHZhciBwb2xpY3ksIHNjb3JlLCBtYXggPSAwO1xuICAgICAgICBmb3IgKHZhciBwbGFuIGluIHBsYW5zKSB7XG4gICAgICAgICAgICBzY29yZSA9IE1hdGgucmFuZG9tKCk7XG4gICAgICAgICAgICBpZiAoc2NvcmUgPj0gbWF4KSB7XG4gICAgICAgICAgICAgICAgbWF4ID0gc2NvcmU7XG4gICAgICAgICAgICAgICAgcG9saWN5ID0gcGxhbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcG9saWN5O1xuICAgIH1cbn1cbkJESUFnZW50LmxhenlQb2xpY3lTZWxlY3Rpb24gPSBmdW5jdGlvbiAocGxhbnMsIHBsYW5IaXN0b3J5LCBhZ2VudCkge1xuICAgIHZhciBvcHRpb25zLCBzZWxlY3Rpb247XG4gICAgaWYgKHRoaXMudGltZSA+IDApIHtcbiAgICAgICAgb3B0aW9ucyA9IE9iamVjdC5rZXlzKHBsYW5zKTtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMuc2xpY2UoMSwgb3B0aW9ucy5sZW5ndGgpO1xuICAgICAgICBzZWxlY3Rpb24gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBvcHRpb25zLmxlbmd0aCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBvcHRpb25zID0gT2JqZWN0LmtleXMocGxhbnMpO1xuICAgICAgICBzZWxlY3Rpb24gPSAwO1xuICAgIH1cbiAgICByZXR1cm4gb3B0aW9uc1tzZWxlY3Rpb25dO1xufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWJkaS5qcy5tYXAiLCJpbXBvcnQgeyBRQ29tcG9uZW50IH0gZnJvbSAnLi9RQ29tcG9uZW50JztcbmltcG9ydCB7IGdlbmVyYXRlVVVJRCB9IGZyb20gJy4vdXRpbHMnO1xuLyoqXG4qIEJlaGF2aW9yIFRyZWVcbioqL1xuZXhwb3J0IGNsYXNzIEJlaGF2aW9yVHJlZSBleHRlbmRzIFFDb21wb25lbnQge1xuICAgIHN0YXRpYyB0aWNrKG5vZGUsIGFnZW50KSB7XG4gICAgICAgIHZhciBzdGF0ZSA9IG5vZGUub3BlcmF0ZShhZ2VudCk7XG4gICAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9XG4gICAgY29uc3RydWN0b3IobmFtZSwgcm9vdCwgZGF0YSkge1xuICAgICAgICBzdXBlcihuYW1lKTtcbiAgICAgICAgdGhpcy5yb290ID0gcm9vdDtcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICAgICAgdGhpcy5yZXN1bHRzID0gW107XG4gICAgfVxuICAgIHVwZGF0ZShhZ2VudCwgc3RlcCkge1xuICAgICAgICB2YXIgc3RhdGU7XG4gICAgICAgIGFnZW50LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIHdoaWxlIChhZ2VudC5hY3RpdmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHN0YXRlID0gQmVoYXZpb3JUcmVlLnRpY2sodGhpcy5yb290LCBhZ2VudCk7XG4gICAgICAgICAgICBhZ2VudC50aW1lID0gdGhpcy50aW1lO1xuICAgICAgICAgICAgYWdlbnQuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBCVE5vZGUge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUpIHtcbiAgICAgICAgdGhpcy5pZCA9IGdlbmVyYXRlVVVJRCgpO1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBCVENvbnRyb2xOb2RlIGV4dGVuZHMgQlROb2RlIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBjaGlsZHJlbikge1xuICAgICAgICBzdXBlcihuYW1lKTtcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBCVFJvb3QgZXh0ZW5kcyBCVENvbnRyb2xOb2RlIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBjaGlsZHJlbikge1xuICAgICAgICBzdXBlcihuYW1lLCBjaGlsZHJlbik7XG4gICAgICAgIHRoaXMudHlwZSA9IFwicm9vdFwiO1xuICAgICAgICB0aGlzLm9wZXJhdGUgPSBmdW5jdGlvbiAoYWdlbnQpIHtcbiAgICAgICAgICAgIHZhciBzdGF0ZSA9IEJlaGF2aW9yVHJlZS50aWNrKHRoaXMuY2hpbGRyZW5bMF0sIGFnZW50KTtcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcbiAgICAgICAgfTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgQlRTZWxlY3RvciBleHRlbmRzIEJUQ29udHJvbE5vZGUge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNoaWxkcmVuKSB7XG4gICAgICAgIHN1cGVyKG5hbWUsIGNoaWxkcmVuKTtcbiAgICAgICAgdGhpcy50eXBlID0gXCJzZWxlY3RvclwiO1xuICAgICAgICB0aGlzLm9wZXJhdGUgPSBmdW5jdGlvbiAoYWdlbnQpIHtcbiAgICAgICAgICAgIHZhciBjaGlsZFN0YXRlO1xuICAgICAgICAgICAgZm9yICh2YXIgY2hpbGQgaW4gdGhpcy5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgIGNoaWxkU3RhdGUgPSBCZWhhdmlvclRyZWUudGljayh0aGlzLmNoaWxkcmVuW2NoaWxkXSwgYWdlbnQpO1xuICAgICAgICAgICAgICAgIGlmIChjaGlsZFN0YXRlID09PSBCZWhhdmlvclRyZWUuUlVOTklORykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLlJVTk5JTkc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjaGlsZFN0YXRlID09PSBCZWhhdmlvclRyZWUuU1VDQ0VTUykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLlNVQ0NFU1M7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5GQUlMRUQ7XG4gICAgICAgIH07XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEJUU2VxdWVuY2UgZXh0ZW5kcyBCVENvbnRyb2xOb2RlIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBjaGlsZHJlbikge1xuICAgICAgICBzdXBlcihuYW1lLCBjaGlsZHJlbik7XG4gICAgICAgIHRoaXMudHlwZSA9IFwic2VxdWVuY2VcIjtcbiAgICAgICAgdGhpcy5vcGVyYXRlID0gZnVuY3Rpb24gKGFnZW50KSB7XG4gICAgICAgICAgICB2YXIgY2hpbGRTdGF0ZTtcbiAgICAgICAgICAgIGZvciAodmFyIGNoaWxkIGluIHRoaXMuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBjaGlsZFN0YXRlID0gQmVoYXZpb3JUcmVlLnRpY2sodGhpcy5jaGlsZHJlbltjaGlsZF0sIGFnZW50KTtcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRTdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLlJVTk5JTkcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5SVU5OSU5HO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRTdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLkZBSUxFRCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLkZBSUxFRDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLlNVQ0NFU1M7XG4gICAgICAgIH07XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEJUUGFyYWxsZWwgZXh0ZW5kcyBCVENvbnRyb2xOb2RlIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBjaGlsZHJlbiwgc3VjY2Vzc2VzKSB7XG4gICAgICAgIHN1cGVyKG5hbWUsIGNoaWxkcmVuKTtcbiAgICAgICAgdGhpcy50eXBlID0gXCJwYXJhbGxlbFwiO1xuICAgICAgICB0aGlzLnN1Y2Nlc3NlcyA9IHN1Y2Nlc3NlcztcbiAgICAgICAgdGhpcy5vcGVyYXRlID0gZnVuY3Rpb24gKGFnZW50KSB7XG4gICAgICAgICAgICB2YXIgc3VjY2VlZGVkID0gW10sIGZhaWx1cmVzID0gW10sIGNoaWxkU3RhdGUsIG1ham9yaXR5O1xuICAgICAgICAgICAgZm9yICh2YXIgY2hpbGQgaW4gdGhpcy5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgIGNoaWxkU3RhdGUgPSBCZWhhdmlvclRyZWUudGljayh0aGlzLmNoaWxkcmVuW2NoaWxkXSwgYWdlbnQpO1xuICAgICAgICAgICAgICAgIGlmIChjaGlsZFN0YXRlID09PSBCZWhhdmlvclRyZWUuU1VDQ0VTUykge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZWVkZWQucHVzaChjaGlsZFN0YXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY2hpbGRTdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLkZBSUxFRCkge1xuICAgICAgICAgICAgICAgICAgICBmYWlsdXJlcy5wdXNoKGNoaWxkU3RhdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaGlsZFN0YXRlID09PSBCZWhhdmlvclRyZWUuUlVOTklORykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLlJVTk5JTkc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHN1Y2NlZWRlZC5sZW5ndGggPj0gdGhpcy5zdWNjZXNzZXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLlNVQ0NFU1M7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLkZBSUxFRDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgQlRDb25kaXRpb24gZXh0ZW5kcyBCVE5vZGUge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNvbmRpdGlvbikge1xuICAgICAgICBzdXBlcihuYW1lKTtcbiAgICAgICAgdGhpcy50eXBlID0gXCJjb25kaXRpb25cIjtcbiAgICAgICAgdGhpcy5jb25kaXRpb24gPSBjb25kaXRpb247XG4gICAgICAgIHRoaXMub3BlcmF0ZSA9IGZ1bmN0aW9uIChhZ2VudCkge1xuICAgICAgICAgICAgdmFyIHN0YXRlO1xuICAgICAgICAgICAgc3RhdGUgPSBjb25kaXRpb24uY2hlY2soYWdlbnRbY29uZGl0aW9uLmtleV0sIGNvbmRpdGlvbi52YWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgICAgIH07XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEJUQWN0aW9uIGV4dGVuZHMgQlROb2RlIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBjb25kaXRpb24sIGFjdGlvbikge1xuICAgICAgICBzdXBlcihuYW1lKTtcbiAgICAgICAgdGhpcy50eXBlID0gXCJhY3Rpb25cIjtcbiAgICAgICAgdGhpcy5jb25kaXRpb24gPSBjb25kaXRpb247XG4gICAgICAgIHRoaXMuYWN0aW9uID0gYWN0aW9uO1xuICAgICAgICB0aGlzLm9wZXJhdGUgPSBmdW5jdGlvbiAoYWdlbnQpIHtcbiAgICAgICAgICAgIHZhciBzdGF0ZTtcbiAgICAgICAgICAgIHN0YXRlID0gY29uZGl0aW9uLmNoZWNrKGFnZW50W2NvbmRpdGlvbi5rZXldLCBjb25kaXRpb24udmFsdWUpO1xuICAgICAgICAgICAgaWYgKHN0YXRlID09PSBCZWhhdmlvclRyZWUuU1VDQ0VTUykge1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aW9uKGFnZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcbiAgICAgICAgfTtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1iZWhhdmlvclRyZWUuanMubWFwIiwiaW1wb3J0IHsgZ2VuZXJhdGVVVUlEIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgeyBRQ29tcG9uZW50IH0gZnJvbSAnLi9RQ29tcG9uZW50JztcbmV4cG9ydCBjbGFzcyBDb21wYXJ0bWVudE1vZGVsIGV4dGVuZHMgUUNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IobmFtZSwgY29tcGFydG1lbnRzLCBkYXRhKSB7XG4gICAgICAgIHN1cGVyKG5hbWUpO1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhOyAvL2FuIGFycmF5IG9mIFBhdGNoZXMuIEVhY2ggcGF0Y2ggY29udGFpbnMgYW4gYXJyYXkgb2YgY29tcGFydG1lbnRzIGluIG9wZXJhdGlvbmFsIG9yZGVyXG4gICAgICAgIHRoaXMudG90YWxQb3AgPSAwO1xuICAgICAgICB0aGlzLmNvbXBhcnRtZW50cyA9IGNvbXBhcnRtZW50cztcbiAgICAgICAgdGhpcy5oaXN0b3J5ID0gW107XG4gICAgICAgIGZvciAobGV0IGQgPSAwOyBkIDwgdGhpcy5kYXRhLmxlbmd0aDsgZCsrKSB7XG4gICAgICAgICAgICB0aGlzLnRvdGFsUG9wICs9IHRoaXMuZGF0YVtkXS50b3RhbFBvcDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl90b2xlcmFuY2UgPSAxZS05OyAvL21vZGVsIGVyciB0b2xlcmFuY2VcbiAgICB9XG4gICAgdXBkYXRlKHBhdGNoLCBzdGVwKSB7XG4gICAgICAgIGxldCB0ZW1wX3BvcCA9IHt9LCB0ZW1wX2QgPSB7fSwgbmV4dF9kID0ge30sIGx0ZSA9IHt9LCBlcnIgPSAxLCBuZXdTdGVwO1xuICAgICAgICBmb3IgKGxldCBjIGluIHRoaXMuY29tcGFydG1lbnRzKSB7XG4gICAgICAgICAgICBwYXRjaC5kcG9wc1tjXSA9IHRoaXMuY29tcGFydG1lbnRzW2NdLm9wZXJhdGlvbihwYXRjaC5wb3B1bGF0aW9ucywgc3RlcCk7XG4gICAgICAgIH1cbiAgICAgICAgLy9maXJzdCBvcmRlciAoRXVsZXIpXG4gICAgICAgIGZvciAobGV0IGMgaW4gdGhpcy5jb21wYXJ0bWVudHMpIHtcbiAgICAgICAgICAgIHRlbXBfcG9wW2NdID0gcGF0Y2gucG9wdWxhdGlvbnNbY107XG4gICAgICAgICAgICB0ZW1wX2RbY10gPSBwYXRjaC5kcG9wc1tjXTtcbiAgICAgICAgICAgIHBhdGNoLnBvcHVsYXRpb25zW2NdID0gdGVtcF9wb3BbY10gKyB0ZW1wX2RbY107XG4gICAgICAgIH1cbiAgICAgICAgLy9zZWNvbmQgb3JkZXIgKEhldW5zKVxuICAgICAgICBwYXRjaC50b3RhbFBvcCA9IDA7XG4gICAgICAgIGZvciAobGV0IGMgaW4gdGhpcy5jb21wYXJ0bWVudHMpIHtcbiAgICAgICAgICAgIG5leHRfZFtjXSA9IHRoaXMuY29tcGFydG1lbnRzW2NdLm9wZXJhdGlvbihwYXRjaC5wb3B1bGF0aW9ucywgc3RlcCk7XG4gICAgICAgICAgICBwYXRjaC5wb3B1bGF0aW9uc1tjXSA9IHRlbXBfcG9wW2NdICsgKDAuNSAqICh0ZW1wX2RbY10gKyBuZXh0X2RbY10pKTtcbiAgICAgICAgICAgIHBhdGNoLnRvdGFsUG9wICs9IHBhdGNoLnBvcHVsYXRpb25zW2NdO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIENvbXBhcnRtZW50IHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBwb3AsIG9wZXJhdGlvbikge1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLm9wZXJhdGlvbiA9IG9wZXJhdGlvbiB8fCBudWxsO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBQYXRjaCB7XG4gICAgY29uc3RydWN0b3IobmFtZSwgY29tcGFydG1lbnRzLCBwb3B1bGF0aW9ucykge1xuICAgICAgICB0aGlzLnBvcHVsYXRpb25zID0ge307XG4gICAgICAgIHRoaXMuZHBvcHMgPSB7fTtcbiAgICAgICAgdGhpcy5pbml0aWFsUG9wID0ge307XG4gICAgICAgIHRoaXMuaWQgPSBnZW5lcmF0ZVVVSUQoKTtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5kcG9wcyA9IHt9O1xuICAgICAgICB0aGlzLmNvbXBhcnRtZW50cyA9IGNvbXBhcnRtZW50cztcbiAgICAgICAgdGhpcy50b3RhbFBvcCA9IDA7XG4gICAgICAgIGZvciAobGV0IGMgaW4gcG9wdWxhdGlvbnMpIHtcbiAgICAgICAgICAgIHRoaXMuZHBvcHNbY10gPSAwO1xuICAgICAgICAgICAgdGhpcy5pbml0aWFsUG9wW2NdID0gcG9wdWxhdGlvbnNbY107XG4gICAgICAgICAgICB0aGlzLnBvcHVsYXRpb25zW2NdID0gcG9wdWxhdGlvbnNbY107XG4gICAgICAgICAgICB0aGlzLnRvdGFsUG9wICs9IHRoaXMucG9wdWxhdGlvbnNbY107XG4gICAgICAgIH1cbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb21wYXJ0bWVudC5qcy5tYXAiLCJpbXBvcnQgeyBnZW5lcmF0ZVVVSUQgfSBmcm9tICcuL3V0aWxzJztcbmV4cG9ydCBjbGFzcyBDb250YWN0UGF0Y2gge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNhcGFjaXR5KSB7XG4gICAgICAgIHRoaXMuaWQgPSBnZW5lcmF0ZVVVSUQoKTtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5jYXBhY2l0eSA9IGNhcGFjaXR5O1xuICAgICAgICB0aGlzLnBvcCA9IDA7XG4gICAgICAgIHRoaXMubWVtYmVycyA9IHt9O1xuICAgIH1cbiAgICBzdGF0aWMgZGVmYXVsdEZyZXFGKGEsIGIpIHtcbiAgICAgICAgdmFyIHZhbCA9ICg1MCAtIE1hdGguYWJzKGEuYWdlIC0gYi5hZ2UpKSAvIDEwMDtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG4gICAgc3RhdGljIGRlZmF1bHRDb250YWN0RihhLCB0aW1lKSB7XG4gICAgICAgIHZhciBjID0gMiAqIE1hdGguc2luKHRpbWUpICsgYTtcbiAgICAgICAgaWYgKGMgPj0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXNzaWduKGFnZW50LCBjb250YWN0VmFsdWVGdW5jKSB7XG4gICAgICAgIHZhciBjb250YWN0VmFsdWU7XG4gICAgICAgIGNvbnRhY3RWYWx1ZUZ1bmMgPSBjb250YWN0VmFsdWVGdW5jIHx8IENvbnRhY3RQYXRjaC5kZWZhdWx0RnJlcUY7XG4gICAgICAgIGlmICh0aGlzLnBvcCA8IHRoaXMuY2FwYWNpdHkpIHtcbiAgICAgICAgICAgIHRoaXMubWVtYmVyc1thZ2VudC5pZF0gPSB7IHByb3BlcnRpZXM6IGFnZW50IH07XG4gICAgICAgICAgICBmb3IgKGxldCBvdGhlciBpbiB0aGlzLm1lbWJlcnMpIHtcbiAgICAgICAgICAgICAgICBsZXQgaWQgPSBwYXJzZUludChvdGhlcik7XG4gICAgICAgICAgICAgICAgaWYgKG90aGVyICE9PSBhZ2VudC5pZCAmJiAhaXNOYU4oaWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRhY3RWYWx1ZSA9IGNvbnRhY3RWYWx1ZUZ1bmModGhpcy5tZW1iZXJzW2lkXS5wcm9wZXJ0aWVzLCBhZ2VudCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVtYmVyc1thZ2VudC5pZF1baWRdID0gY29udGFjdFZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbWJlcnNbaWRdW2FnZW50LmlkXSA9IGNvbnRhY3RWYWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnBvcCsrO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaWQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbmNvdW50ZXJzKGFnZW50LCBwcmVjb25kaXRpb24sIGNvbnRhY3RGdW5jLCByZXN1bHRLZXksIHNhdmUgPSBmYWxzZSkge1xuICAgICAgICBjb250YWN0RnVuYyA9IGNvbnRhY3RGdW5jIHx8IENvbnRhY3RQYXRjaC5kZWZhdWx0Q29udGFjdEY7XG4gICAgICAgIGxldCBjb250YWN0VmFsO1xuICAgICAgICBmb3IgKHZhciBjb250YWN0IGluIHRoaXMubWVtYmVycykge1xuICAgICAgICAgICAgaWYgKHByZWNvbmRpdGlvbi5rZXkgPT09ICdzdGF0ZXMnKSB7XG4gICAgICAgICAgICAgICAgY29udGFjdFZhbCA9IEpTT04uc3RyaW5naWZ5KHRoaXMubWVtYmVyc1tjb250YWN0XS5wcm9wZXJ0aWVzW3ByZWNvbmRpdGlvbi5rZXldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnRhY3RWYWwgPSB0aGlzLm1lbWJlcnNbY29udGFjdF0ucHJvcGVydGllc1twcmVjb25kaXRpb24ua2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwcmVjb25kaXRpb24uY2hlY2sodGhpcy5tZW1iZXJzW2NvbnRhY3RdLnByb3BlcnRpZXNbcHJlY29uZGl0aW9uLmtleV0sIHByZWNvbmRpdGlvbi52YWx1ZSkgJiYgTnVtYmVyKGNvbnRhY3QpICE9PSBhZ2VudC5pZCkge1xuICAgICAgICAgICAgICAgIHZhciBvbGRWYWwgPSB0aGlzLm1lbWJlcnNbY29udGFjdF0ucHJvcGVydGllc1tyZXN1bHRLZXldO1xuICAgICAgICAgICAgICAgIHZhciBuZXdWYWwgPSBjb250YWN0RnVuYyh0aGlzLm1lbWJlcnNbY29udGFjdF0sIGFnZW50KTtcbiAgICAgICAgICAgICAgICBpZiAob2xkVmFsICE9PSBuZXdWYWwgJiYgc2F2ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbWJlcnNbY29udGFjdF0ucHJvcGVydGllc1tyZXN1bHRLZXldID0gbmV3VmFsO1xuICAgICAgICAgICAgICAgICAgICBDb250YWN0UGF0Y2guV0lXQXJyYXkucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRjaElEOiB0aGlzLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5mZWN0ZWQ6IGNvbnRhY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZlY3RlZEFnZTogdGhpcy5tZW1iZXJzW2NvbnRhY3RdLnByb3BlcnRpZXMuYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiB0aGlzLm1lbWJlcnNbY29udGFjdF0ucHJvcGVydGllc1tyZXN1bHRLZXldLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0S2V5OiByZXN1bHRLZXksXG4gICAgICAgICAgICAgICAgICAgICAgICBieTogYWdlbnQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBieUFnZTogYWdlbnQuYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZTogYWdlbnQudGltZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5Db250YWN0UGF0Y2guV0lXQXJyYXkgPSBbXTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbnRhY3RQYXRjaC5qcy5tYXAiLCJpbXBvcnQgeyBzaHVmZmxlIH0gZnJvbSAnLi91dGlscyc7XG4vKipcbipFbnZpcm9ubWVudHMgYXJlIHRoZSBleGVjdXRhYmxlIGVudmlyb25tZW50IGNvbnRhaW5pbmcgdGhlIG1vZGVsIGNvbXBvbmVudHMsXG4qc2hhcmVkIHJlc291cmNlcywgYW5kIHNjaGVkdWxlci5cbiovXG5leHBvcnQgY2xhc3MgRW52aXJvbm1lbnQge1xuICAgIGNvbnN0cnVjdG9yKHJlc291cmNlcyA9IFtdLCBmYWNpbGl0aWVzID0gW10sIGV2ZW50c1F1ZXVlID0gW10sIGFjdGl2YXRpb25UeXBlID0gJ3JhbmRvbScsIHJuZyA9IE1hdGgpIHtcbiAgICAgICAgdGhpcy50aW1lID0gMDtcbiAgICAgICAgdGhpcy50aW1lT2ZEYXkgPSAwO1xuICAgICAgICB0aGlzLm1vZGVscyA9IFtdO1xuICAgICAgICB0aGlzLmhpc3RvcnkgPSBbXTtcbiAgICAgICAgdGhpcy5hZ2VudHMgPSBbXTtcbiAgICAgICAgdGhpcy5yZXNvdXJjZXMgPSByZXNvdXJjZXM7XG4gICAgICAgIHRoaXMuZmFjaWxpdGllcyA9IGZhY2lsaXRpZXM7XG4gICAgICAgIHRoaXMuZXZlbnRzUXVldWUgPSBldmVudHNRdWV1ZTtcbiAgICAgICAgdGhpcy5hY3RpdmF0aW9uVHlwZSA9IGFjdGl2YXRpb25UeXBlO1xuICAgICAgICB0aGlzLnJuZyA9IHJuZztcbiAgICAgICAgdGhpcy5fYWdlbnRJbmRleCA9IHt9O1xuICAgIH1cbiAgICAvKiogQWRkIGEgbW9kZWwgY29tcG9uZW50cyBmcm9tIHRoZSBlbnZpcm9ubWVudFxuICAgICogQHBhcmFtIGNvbXBvbmVudCB0aGUgbW9kZWwgY29tcG9uZW50IG9iamVjdCB0byBiZSBhZGRlZCB0byB0aGUgZW52aXJvbm1lbnQuXG4gICAgKi9cbiAgICBhZGQoY29tcG9uZW50KSB7XG4gICAgICAgIHRoaXMubW9kZWxzLnB1c2goY29tcG9uZW50KTtcbiAgICB9XG4gICAgLyoqIFJlbW92ZSBhIG1vZGVsIGNvbXBvbmVudHMgZnJvbSB0aGUgZW52aXJvbm1lbnQgYnkgaWRcbiAgICAqIEBwYXJhbSBpZCBVVUlEIG9mIHRoZSBjb21wb25lbnQgdG8gYmUgcmVtb3ZlZC5cbiAgICAqL1xuICAgIHJlbW92ZShpZCkge1xuICAgICAgICB2YXIgZGVsZXRlSW5kZXgsIEwgPSB0aGlzLmFnZW50cy5sZW5ndGg7XG4gICAgICAgIHRoaXMubW9kZWxzLmZvckVhY2goZnVuY3Rpb24gKGMsIGluZGV4KSB7IGlmIChjLmlkID09PSBpZCkge1xuICAgICAgICAgICAgZGVsZXRlSW5kZXggPSBpbmRleDtcbiAgICAgICAgfSB9KTtcbiAgICAgICAgd2hpbGUgKEwgPiAwICYmIHRoaXMuYWdlbnRzLmxlbmd0aCA+PSAwKSB7XG4gICAgICAgICAgICBMLS07XG4gICAgICAgICAgICBpZiAodGhpcy5hZ2VudHNbTF0ubW9kZWxJbmRleCA9PT0gZGVsZXRlSW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFnZW50cy5zcGxpY2UoTCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tb2RlbHMuc3BsaWNlKGRlbGV0ZUluZGV4LCAxKTtcbiAgICB9XG4gICAgLyoqIFJ1biBhbGwgZW52aXJvbm1lbnQgbW9kZWwgY29tcG9uZW50cyBmcm9tIHQ9MCB1bnRpbCB0PXVudGlsIHVzaW5nIHRpbWUgc3RlcCA9IHN0ZXBcbiAgICAqIEBwYXJhbSBzdGVwIHRoZSBzdGVwIHNpemVcbiAgICAqIEBwYXJhbSB1bnRpbCB0aGUgZW5kIHRpbWVcbiAgICAqIEBwYXJhbSBzYXZlSW50ZXJ2YWwgc2F2ZSBldmVyeSAneCcgc3RlcHNcbiAgICAqL1xuICAgIHJ1bihzdGVwLCB1bnRpbCwgc2F2ZUludGVydmFsKSB7XG4gICAgICAgIHRoaXMuaW5pdCgpO1xuICAgICAgICB3aGlsZSAodGhpcy50aW1lIDw9IHVudGlsKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZShzdGVwKTtcbiAgICAgICAgICAgIGxldCByZW0gPSAodGhpcy50aW1lICUgc2F2ZUludGVydmFsKTtcbiAgICAgICAgICAgIGlmIChyZW0gPCBzdGVwKSB7XG4gICAgICAgICAgICAgICAgbGV0IGNvcHkgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuYWdlbnRzKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5oaXN0b3J5ID0gdGhpcy5oaXN0b3J5LmNvbmNhdChjb3B5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudGltZSArPSBzdGVwO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKiBBc3NpZ24gYWxsIGFnZW50cyB0byBhcHByb3ByaWF0ZSBtb2RlbHNcbiAgICAqL1xuICAgIGluaXQoKSB7XG4gICAgICAgIHRoaXMuX2FnZW50SW5kZXggPSB7fTtcbiAgICAgICAgZm9yIChsZXQgYyA9IDA7IGMgPCB0aGlzLm1vZGVscy5sZW5ndGg7IGMrKykge1xuICAgICAgICAgICAgbGV0IGFscmVhZHlJbiA9IFtdO1xuICAgICAgICAgICAgLy9hc3NpZ24gZWFjaCBhZ2VudCBtb2RlbCBpbmRleGVzIHRvIGhhbmRsZSBhZ2VudHMgYXNzaWduZWQgdG8gbXVsdGlwbGUgbW9kZWxzXG4gICAgICAgICAgICBmb3IgKGxldCBkID0gMDsgZCA8IHRoaXMubW9kZWxzW2NdLmRhdGEubGVuZ3RoOyBkKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgaWQgPSB0aGlzLm1vZGVsc1tjXS5kYXRhW2RdLmlkO1xuICAgICAgICAgICAgICAgIGlmIChpZCBpbiB0aGlzLl9hZ2VudEluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcyBhZ2VudCBiZWxvbmdzIHRvIG11bHRpcGxlIG1vZGVscy5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlbHNbY10uZGF0YVtkXS5tb2RlbHMucHVzaCh0aGlzLm1vZGVsc1tjXS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlbHNbY10uZGF0YVtkXS5tb2RlbEluZGV4ZXMucHVzaChjKTtcbiAgICAgICAgICAgICAgICAgICAgYWxyZWFkeUluLnB1c2goaWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy90aGlzIGFnZW50IGJlbG9uZ3MgdG8gb25seSBvbmUgbW9kZWwgc28gZmFyLlxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZ2VudEluZGV4W2lkXSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZWxzW2NdLmRhdGFbZF0ubW9kZWxzID0gW3RoaXMubW9kZWxzW2NdLm5hbWVdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVsc1tjXS5kYXRhW2RdLm1vZGVsSW5kZXhlcyA9IFtjXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2VsaW1pbmF0ZSBhbnkgZHVwbGljYXRlIGFnZW50cyBieSBpZFxuICAgICAgICAgICAgdGhpcy5tb2RlbHNbY10uZGF0YSA9IHRoaXMubW9kZWxzW2NdLmRhdGEuZmlsdGVyKChkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGFscmVhZHlJbi5pbmRleE9mKGQuaWQpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvL2NvbmNhdCB0aGUgcmVzdWx0c1xuICAgICAgICAgICAgdGhpcy5hZ2VudHMgPSB0aGlzLmFnZW50cy5jb25jYXQodGhpcy5tb2RlbHNbY10uZGF0YSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqIFVwZGF0ZSBlYWNoIG1vZGVsIGNvbXBlbmVudCBvbmUgdGltZSBzdGVwIGZvcndhcmRcbiAgICAqIEBwYXJhbSBzdGVwIHRoZSBzdGVwIHNpemVcbiAgICAqL1xuICAgIHVwZGF0ZShzdGVwKSB7XG4gICAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICAgIHdoaWxlIChpbmRleCA8IHRoaXMuZXZlbnRzUXVldWUubGVuZ3RoICYmIHRoaXMuZXZlbnRzUXVldWVbaW5kZXhdLmF0IDw9IHRoaXMudGltZSkge1xuICAgICAgICAgICAgdGhpcy5ldmVudHNRdWV1ZVtpbmRleF0udHJpZ2dlcigpO1xuICAgICAgICAgICAgdGhpcy5ldmVudHNRdWV1ZVtpbmRleF0udHJpZ2dlcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICh0aGlzLmV2ZW50c1F1ZXVlW2luZGV4XS51bnRpbCA8PSB0aGlzLnRpbWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmV2ZW50c1F1ZXVlLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmFjdGl2YXRpb25UeXBlID09PSBcInJhbmRvbVwiKSB7XG4gICAgICAgICAgICBzaHVmZmxlKHRoaXMuYWdlbnRzLCB0aGlzLnJuZyk7XG4gICAgICAgICAgICB0aGlzLmFnZW50cy5mb3JFYWNoKChhZ2VudCwgaSkgPT4geyB0aGlzLl9hZ2VudEluZGV4W2FnZW50LmlkXSA9IGk7IH0pOyAvLyByZWFzc2lnbiBhZ2VudFxuICAgICAgICAgICAgdGhpcy5hZ2VudHMuZm9yRWFjaCgoYWdlbnQsIGkpID0+IHtcbiAgICAgICAgICAgICAgICBhZ2VudC5tb2RlbEluZGV4ZXMuZm9yRWFjaCgobW9kZWxJbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVsc1ttb2RlbEluZGV4XS51cGRhdGUoYWdlbnQsIHN0ZXApO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGFnZW50LnRpbWUgPSBhZ2VudC50aW1lICsgc3RlcCB8fCAwO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuYWN0aXZhdGlvblR5cGUgPT09IFwicGFyYWxsZWxcIikge1xuICAgICAgICAgICAgbGV0IHRlbXBBZ2VudHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuYWdlbnRzKSk7XG4gICAgICAgICAgICB0ZW1wQWdlbnRzLmZvckVhY2goKGFnZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgYWdlbnQubW9kZWxJbmRleGVzLmZvckVhY2goKG1vZGVsSW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlbHNbbW9kZWxJbmRleF0udXBkYXRlKGFnZW50LCBzdGVwKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5hZ2VudHMuZm9yRWFjaCgoYWdlbnQsIGkpID0+IHtcbiAgICAgICAgICAgICAgICBhZ2VudC5tb2RlbEluZGV4ZXMuZm9yRWFjaCgobW9kZWxJbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVsc1ttb2RlbEluZGV4XS5hcHBseShhZ2VudCwgdGVtcEFnZW50c1tpXSwgc3RlcCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYWdlbnQudGltZSA9IGFnZW50LnRpbWUgKyBzdGVwIHx8IDA7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKiogRm9ybWF0IGEgdGltZSBvZiBkYXkuIEN1cnJlbnQgdGltZSAlIDEuXG4gICAgKlxuICAgICovXG4gICAgZm9ybWF0VGltZSgpIHtcbiAgICAgICAgdGhpcy50aW1lT2ZEYXkgPSB0aGlzLnRpbWUgJSAxO1xuICAgIH1cbiAgICAvKiogR2V0cyBhZ2VudCBieSBpZC4gQSB1dGlsaXR5IGZ1bmN0aW9uIHRoYXRcbiAgICAqXG4gICAgKi9cbiAgICBnZXRBZ2VudEJ5SWQoaWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWdlbnRzW3RoaXMuX2FnZW50SW5kZXhbaWRdXTtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1lbnZpcm9ubWVudC5qcy5tYXAiLCJleHBvcnQgY2xhc3MgRXBpIHtcbiAgICBzdGF0aWMgcHJldmFsZW5jZShjYXNlcywgdG90YWwpIHtcbiAgICAgICAgdmFyIHByZXYgPSBjYXNlcyAvIHRvdGFsO1xuICAgICAgICByZXR1cm4gcHJldjtcbiAgICB9XG4gICAgc3RhdGljIHJpc2tEaWZmZXJlbmNlKHRhYmxlKSB7XG4gICAgICAgIHZhciByZCA9IHRhYmxlLmEgLyAodGFibGUuYSArIHRhYmxlLmIpIC0gdGFibGUuYyAvICh0YWJsZS5jICsgdGFibGUuZCk7XG4gICAgICAgIHJldHVybiByZDtcbiAgICB9XG4gICAgc3RhdGljIHJpc2tSYXRpbyh0YWJsZSkge1xuICAgICAgICB2YXIgcnJhdGlvID0gKHRhYmxlLmEgLyAodGFibGUuYSArIHRhYmxlLmIpKSAvICh0YWJsZS5jIC8gKHRhYmxlLmMgKyB0YWJsZS5kKSk7XG4gICAgICAgIHJldHVybiBycmF0aW87XG4gICAgfVxuICAgIHN0YXRpYyBvZGRzUmF0aW8odGFibGUpIHtcbiAgICAgICAgdmFyIG9yID0gKHRhYmxlLmEgKiB0YWJsZS5kKSAvICh0YWJsZS5iICogdGFibGUuYyk7XG4gICAgICAgIHJldHVybiBvcjtcbiAgICB9XG4gICAgc3RhdGljIElQRjJEKHJvd1RvdGFscywgY29sVG90YWxzLCBpdGVyYXRpb25zLCBzZWVkcykge1xuICAgICAgICB2YXIgclQgPSAwLCBjVCA9IDAsIHNlZWRDZWxscyA9IHNlZWRzO1xuICAgICAgICByb3dUb3RhbHMuZm9yRWFjaChmdW5jdGlvbiAociwgaSkge1xuICAgICAgICAgICAgclQgKz0gcjtcbiAgICAgICAgICAgIHNlZWRDZWxsc1tpXSA9IHNlZWRDZWxsc1tpXSB8fCBbXTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbFRvdGFscy5mb3JFYWNoKGZ1bmN0aW9uIChjLCBqKSB7XG4gICAgICAgICAgICBjVCArPSBjO1xuICAgICAgICAgICAgc2VlZENlbGxzLmZvckVhY2goZnVuY3Rpb24gKHJvdywgaykge1xuICAgICAgICAgICAgICAgIHNlZWRDZWxsc1trXVtqXSA9IHNlZWRDZWxsc1trXVtqXSB8fCBNYXRoLnJvdW5kKHJvd1RvdGFsc1trXSAvIHJvd1RvdGFscy5sZW5ndGggKyAoY29sVG90YWxzW2pdIC8gY29sVG90YWxzLmxlbmd0aCkgLyAyICogTWF0aC5yYW5kb20oKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyVCA9PT0gY1QpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGl0ZXIgPSAwOyBpdGVyIDwgaXRlcmF0aW9uczsgaXRlcisrKSB7XG4gICAgICAgICAgICAgICAgc2VlZENlbGxzLmZvckVhY2goZnVuY3Rpb24gKHJvdywgaWkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRSb3dUb3RhbCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHJvdy5mb3JFYWNoKGZ1bmN0aW9uIChjZWxsLCBqKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50Um93VG90YWwgKz0gY2VsbDtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJvdy5mb3JFYWNoKGZ1bmN0aW9uIChjZWxsLCBqaikge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VlZENlbGxzW2lpXVtqal0gPSBjZWxsIC8gY3VycmVudFJvd1RvdGFsO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VlZENlbGxzW2lpXVtqal0gKj0gcm93VG90YWxzW2lpXTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgY29sVG90YWxzLmxlbmd0aDsgY29sKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRDb2xUb3RhbCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHNlZWRDZWxscy5mb3JFYWNoKGZ1bmN0aW9uIChyLCBrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50Q29sVG90YWwgKz0gcltjb2xdO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc2VlZENlbGxzLmZvckVhY2goZnVuY3Rpb24gKHJvdywga2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZWRDZWxsc1tra11bY29sXSA9IHJvd1tjb2xdIC8gY3VycmVudENvbFRvdGFsO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VlZENlbGxzW2trXVtjb2xdICo9IGNvbFRvdGFsc1tjb2xdO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc2VlZENlbGxzO1xuICAgICAgICB9XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZXBpLmpzLm1hcCIsIi8qKiBFdmVudHMgY2xhc3MgaW5jbHVkZXMgbWV0aG9kcyBmb3Igb3JnYW5pemluZyBldmVudHMuXG4qXG4qL1xuZXhwb3J0IGNsYXNzIEV2ZW50cyB7XG4gICAgY29uc3RydWN0b3IoZXZlbnRzID0gW10pIHtcbiAgICAgICAgdGhpcy5xdWV1ZSA9IFtdO1xuICAgICAgICB0aGlzLnNjaGVkdWxlKGV2ZW50cyk7XG4gICAgfVxuICAgIC8qKlxuICAgICogc2NoZWR1bGUgYW4gZXZlbnQgd2l0aCB0aGUgc2FtZSB0cmlnZ2VyIG11bHRpcGxlIHRpbWVzLlxuICAgICogQHBhcmFtIHFldmVudCBpcyB0aGUgZXZlbnQgdG8gYmUgc2NoZWR1bGVkLiBUaGUgYXQgcGFyYW1ldGVyIHNob3VsZCBjb250YWluIHRoZSB0aW1lIGF0IGZpcnN0IGluc3RhbmNlLlxuICAgICogQHBhcmFtIGV2ZXJ5IGludGVydmFsIGZvciBlYWNoIG9jY3VybmNlXG4gICAgKiBAcGFyYW0gZW5kIHVudGlsXG4gICAgKi9cbiAgICBzY2hlZHVsZVJlY3VycmluZyhxZXZlbnQsIGV2ZXJ5LCBlbmQpIHtcbiAgICAgICAgdmFyIHJlY3VyID0gW107XG4gICAgICAgIHZhciBkdXJhdGlvbiA9IGVuZCAtIHFldmVudC5hdDtcbiAgICAgICAgdmFyIG9jY3VyZW5jZXMgPSBNYXRoLmZsb29yKGR1cmF0aW9uIC8gZXZlcnkpO1xuICAgICAgICBpZiAoIXFldmVudC51bnRpbCkge1xuICAgICAgICAgICAgcWV2ZW50LnVudGlsID0gcWV2ZW50LmF0O1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IG9jY3VyZW5jZXM7IGkrKykge1xuICAgICAgICAgICAgcmVjdXIucHVzaCh7IG5hbWU6IHFldmVudC5uYW1lICsgaSwgYXQ6IHFldmVudC5hdCArIChpICogZXZlcnkpLCB1bnRpbDogcWV2ZW50LnVudGlsICsgKGkgKiBldmVyeSksIHRyaWdnZXI6IHFldmVudC50cmlnZ2VyLCB0cmlnZ2VyZWQ6IGZhbHNlIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2NoZWR1bGUocmVjdXIpO1xuICAgIH1cbiAgICAvKlxuICAgICogc2NoZWR1bGUgYSBvbmUgdGltZSBldmVudHMuIHRoaXMgYXJyYW5nZXMgdGhlIGV2ZW50IHF1ZXVlIGluIGNocm9ub2xvZ2ljYWwgb3JkZXIuXG4gICAgKiBAcGFyYW0gcWV2ZW50cyBhbiBhcnJheSBvZiBldmVudHMgdG8gYmUgc2NoZWR1bGVzLlxuICAgICovXG4gICAgc2NoZWR1bGUocWV2ZW50cykge1xuICAgICAgICBxZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgIGQudW50aWwgPSBkLnVudGlsIHx8IGQuYXQ7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnF1ZXVlID0gdGhpcy5xdWV1ZS5jb25jYXQocWV2ZW50cyk7XG4gICAgICAgIHRoaXMucXVldWUgPSB0aGlzLm9yZ2FuaXplKHRoaXMucXVldWUsIDAsIHRoaXMucXVldWUubGVuZ3RoKTtcbiAgICB9XG4gICAgcGFydGl0aW9uKGFycmF5LCBsZWZ0LCByaWdodCkge1xuICAgICAgICB2YXIgY21wID0gYXJyYXlbcmlnaHQgLSAxXS5hdCwgbWluRW5kID0gbGVmdCwgbWF4RW5kO1xuICAgICAgICBmb3IgKG1heEVuZCA9IGxlZnQ7IG1heEVuZCA8IHJpZ2h0IC0gMTsgbWF4RW5kICs9IDEpIHtcbiAgICAgICAgICAgIGlmIChhcnJheVttYXhFbmRdLmF0IDw9IGNtcCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3dhcChhcnJheSwgbWF4RW5kLCBtaW5FbmQpO1xuICAgICAgICAgICAgICAgIG1pbkVuZCArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3dhcChhcnJheSwgbWluRW5kLCByaWdodCAtIDEpO1xuICAgICAgICByZXR1cm4gbWluRW5kO1xuICAgIH1cbiAgICBzd2FwKGFycmF5LCBpLCBqKSB7XG4gICAgICAgIHZhciB0ZW1wID0gYXJyYXlbaV07XG4gICAgICAgIGFycmF5W2ldID0gYXJyYXlbal07XG4gICAgICAgIGFycmF5W2pdID0gdGVtcDtcbiAgICAgICAgcmV0dXJuIGFycmF5O1xuICAgIH1cbiAgICBvcmdhbml6ZShldmVudHMsIGxlZnQsIHJpZ2h0KSB7XG4gICAgICAgIGlmIChsZWZ0IDwgcmlnaHQpIHtcbiAgICAgICAgICAgIHZhciBwID0gdGhpcy5wYXJ0aXRpb24oZXZlbnRzLCBsZWZ0LCByaWdodCk7XG4gICAgICAgICAgICB0aGlzLm9yZ2FuaXplKGV2ZW50cywgbGVmdCwgcCk7XG4gICAgICAgICAgICB0aGlzLm9yZ2FuaXplKGV2ZW50cywgcCArIDEsIHJpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZXZlbnRzO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWV2ZW50cy5qcy5tYXAiLCJpbXBvcnQgeyBRQ29tcG9uZW50IH0gZnJvbSAnLi9RQ29tcG9uZW50JztcbmV4cG9ydCBjbGFzcyBTdGF0ZU1hY2hpbmUgZXh0ZW5kcyBRQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBzdGF0ZXMsIHRyYW5zaXRpb25zLCBjb25kaXRpb25zLCBkYXRhKSB7XG4gICAgICAgIHN1cGVyKG5hbWUpO1xuICAgICAgICB0aGlzLnN0YXRlcyA9IHN0YXRlcztcbiAgICAgICAgdGhpcy50cmFuc2l0aW9ucyA9IHRoaXMuY2hlY2tUcmFuc2l0aW9ucyh0cmFuc2l0aW9ucyk7XG4gICAgICAgIHRoaXMuY29uZGl0aW9ucyA9IGNvbmRpdGlvbnM7XG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgfVxuICAgIHVwZGF0ZShhZ2VudCwgc3RlcCkge1xuICAgICAgICBmb3IgKHZhciBzIGluIGFnZW50LnN0YXRlcykge1xuICAgICAgICAgICAgbGV0IHN0YXRlID0gYWdlbnQuc3RhdGVzW3NdO1xuICAgICAgICAgICAgdGhpcy5zdGF0ZXNbc3RhdGVdKGFnZW50LCBzdGVwKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy50cmFuc2l0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy50cmFuc2l0aW9uc1tpXS5mcm9tLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB0cmFucyA9IHRoaXMudHJhbnNpdGlvbnNbaV0uZnJvbVtqXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zID09PSBzdGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNvbmQgPSB0aGlzLmNvbmRpdGlvbnNbdGhpcy50cmFuc2l0aW9uc1tpXS5uYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgKGNvbmQudmFsdWUpID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBjb25kLnZhbHVlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGNvbmQudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgciA9IGNvbmQuY2hlY2soYWdlbnRbY29uZC5rZXldLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAociA9PT0gU3RhdGVNYWNoaW5lLlNVQ0NFU1MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZ2VudC5zdGF0ZXNbc10gPSB0aGlzLnRyYW5zaXRpb25zW2ldLnRvO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFnZW50W3RoaXMudHJhbnNpdGlvbnNbaV0udG9dID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZ2VudFt0aGlzLnRyYW5zaXRpb25zW2ldLmZyb21dID0gZmFsc2U7IC8vZm9yIGVhc2llciByZXBvcnRpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjaGVja1RyYW5zaXRpb25zKHRyYW5zaXRpb25zKSB7XG4gICAgICAgIGZvciAodmFyIHQgPSAwOyB0IDwgdHJhbnNpdGlvbnMubGVuZ3RoOyB0KyspIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdHJhbnNpdGlvbnNbdF0uZnJvbSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uc1t0XS5mcm9tID0gW3RyYW5zaXRpb25zW3RdLmZyb21dO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy87XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRyYW5zaXRpb25zO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXN0YXRlTWFjaGluZS5qcy5tYXAiLCJpbXBvcnQgeyBnZW5lcmF0ZVVVSUQgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IFBhdGNoLCBDb21wYXJ0bWVudE1vZGVsIH0gZnJvbSAnLi9jb21wYXJ0bWVudCc7XG5pbXBvcnQgeyBFbnZpcm9ubWVudCB9IGZyb20gJy4vZW52aXJvbm1lbnQnO1xuaW1wb3J0IHsgU3RhdGVNYWNoaW5lIH0gZnJvbSAnLi9zdGF0ZU1hY2hpbmUnO1xuaW1wb3J0IHsgZ2VuZXJhdGVQb3AgfSBmcm9tICcuL3V0aWxzJztcbi8qKlxuKkJhdGNoIHJ1biBlbnZpcm9ubWVudHNcbiovXG5leHBvcnQgY2xhc3MgRXhwZXJpbWVudCB7XG4gICAgY29uc3RydWN0b3IoZW52aXJvbm1lbnQsIHNldHVwLCB0YXJnZXQpIHtcbiAgICAgICAgdGhpcy5lbnZpcm9ubWVudCA9IGVudmlyb25tZW50O1xuICAgICAgICB0aGlzLnNldHVwID0gc2V0dXA7XG4gICAgICAgIHRoaXMucm5nID0gc2V0dXAuZXhwZXJpbWVudC5ybmc7XG4gICAgICAgIHRoaXMuZXhwZXJpbWVudExvZyA9IFtdO1xuICAgIH1cbiAgICBzdGFydChydW5zLCBzdGVwLCB1bnRpbCkge1xuICAgICAgICB2YXIgciA9IDA7XG4gICAgICAgIHdoaWxlIChyIDwgcnVucykge1xuICAgICAgICAgICAgdGhpcy5wcmVwKHIsIHRoaXMuc2V0dXApO1xuICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC50aW1lID0gMDsgLy9cbiAgICAgICAgICAgIHRoaXMuZW52aXJvbm1lbnQucnVuKHN0ZXAsIHVudGlsLCAwKTtcbiAgICAgICAgICAgIHRoaXMuZXhwZXJpbWVudExvZ1tyXSA9IHRoaXMucmVwb3J0KHIsIHRoaXMuc2V0dXApO1xuICAgICAgICAgICAgcisrO1xuICAgICAgICB9XG4gICAgfVxuICAgIHByZXAociwgY2ZnLCBhZ2VudHMsIHZpc3VhbGl6ZSkge1xuICAgICAgICBsZXQgZ3JvdXBzID0ge307XG4gICAgICAgIGxldCBjdXJyZW50QWdlbnRJZCA9IDA7XG4gICAgICAgIHRoaXMuZW52aXJvbm1lbnQgPSBuZXcgRW52aXJvbm1lbnQoKTtcbiAgICAgICAgaWYgKHR5cGVvZiBjZmcuYWdlbnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgZm9yIChsZXQgZ3JOYW1lIGluIGNmZy5hZ2VudHMpIHtcbiAgICAgICAgICAgICAgICBsZXQgZ3JvdXAgPSBjZmcuYWdlbnRzW2dyTmFtZV07XG4gICAgICAgICAgICAgICAgZ3JvdXBzW2dyTmFtZV0gPSBnZW5lcmF0ZVBvcChncm91cC5jb3VudCwgZ3JvdXAucGFyYW1zLCBjZmcuZW52aXJvbm1lbnQuc3BhdGlhbFR5cGUsIGdyb3VwLmJvdW5kYXJpZXMsIGN1cnJlbnRBZ2VudElkLCB0aGlzLnJuZyk7XG4gICAgICAgICAgICAgICAgY3VycmVudEFnZW50SWQgPSBncm91cHNbZ3JOYW1lXVtncm91cHNbZ3JOYW1lXS5sZW5ndGggLSAxXS5pZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDtcbiAgICAgICAgfVxuICAgICAgICBjZmcuY29tcG9uZW50cy5mb3JFYWNoKChjbXApID0+IHtcbiAgICAgICAgICAgIHN3aXRjaCAoY21wLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdzdGF0ZS1tYWNoaW5lJzpcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNtID0gbmV3IFN0YXRlTWFjaGluZShjbXAubmFtZSwgY21wLnN0YXRlcywgY21wLnRyYW5zaXRpb25zLCBjbXAuY29uZGl0aW9ucywgZ3JvdXBzW2NtcC5hZ2VudHNdWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC5hZGQoc20pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdjb21wYXJ0bWVudGFsJzpcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGNoZXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgY2ZnLnBhdGNoZXMuZm9yRWFjaCgocGF0Y2gpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjbXAucGF0Y2hlcy5pbmRleE9mKHBhdGNoLm5hbWUpICE9IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0Y2hlcy5wdXNoKG5ldyBQYXRjaChwYXRjaC5uYW1lLCBjbXAuY29tcGFydG1lbnRzLCBwYXRjaC5wb3B1bGF0aW9ucykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNNb2RlbCA9IG5ldyBDb21wYXJ0bWVudE1vZGVsKCdjbXAubmFtZScsIGNtcC5jb21wYXJ0bWVudHMsIHBhdGNoZXMpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVudmlyb25tZW50LmFkZChjTW9kZWwpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdldmVyeS1zdGVwJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC5hZGQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGdlbmVyYXRlVVVJRCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY21wLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGU6IGNtcC5hY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBncm91cHNbY21wLmFnZW50c11bMF1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgc3dpdGNoIChjZmcuZXhwZXJpbWVudCkge1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBpZiAociA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZpc3VhbGl6ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC5ybmcgPSB0aGlzLnJuZztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC5ydW4oY2ZnLmVudmlyb25tZW50LnN0ZXAsIGNmZy5lbnZpcm9ubWVudC51bnRpbCwgMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlcG9ydChyLCBjZmcpIHtcbiAgICAgICAgbGV0IHN1bXMgPSB7fTtcbiAgICAgICAgbGV0IG1lYW5zID0ge307XG4gICAgICAgIGxldCBmcmVxcyA9IHt9O1xuICAgICAgICBsZXQgbW9kZWwgPSB7fTtcbiAgICAgICAgbGV0IGNvdW50ID0gdGhpcy5lbnZpcm9ubWVudC5hZ2VudHMubGVuZ3RoO1xuICAgICAgICAvL2NmZy5yZXBvcnQuc3VtID0gY2ZnLnJlcG9ydC5zdW0uY29uY2F0KGNmZy5yZXBvcnQubWVhbik7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5lbnZpcm9ubWVudC5hZ2VudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBkID0gdGhpcy5lbnZpcm9ubWVudC5hZ2VudHNbaV07XG4gICAgICAgICAgICBjZmcucmVwb3J0LnN1bXMuZm9yRWFjaCgocykgPT4ge1xuICAgICAgICAgICAgICAgIHN1bXNbc10gPSBzdW1zW3NdID09IHVuZGVmaW5lZCA/IGRbc10gOiBkW3NdICsgc3Vtc1tzXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2ZnLnJlcG9ydC5mcmVxcy5mb3JFYWNoKChmKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc05hTihkW2ZdKSAmJiB0eXBlb2YgZFtmXSAhPSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICBmcmVxc1tmXSA9IGZyZXFzW2ZdID09IHVuZGVmaW5lZCA/IGRbZl0gOiBkW2ZdICsgZnJlcXNbZl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoJ2NvbXBhcnRtZW50cycgaW4gZCkge1xuICAgICAgICAgICAgICAgIGNmZy5yZXBvcnQuY29tcGFydG1lbnRzLmZvckVhY2goKGNtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVsW2NtXSA9IG1vZGVsW2NtXSA9PSB1bmRlZmluZWQgPyBkLnBvcHVsYXRpb25zW2NtXSA6IGQucG9wdWxhdGlvbnNbY21dICsgbW9kZWxbY21dO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIDtcbiAgICAgICAgY2ZnLnJlcG9ydC5tZWFucy5mb3JFYWNoKChtKSA9PiB7XG4gICAgICAgICAgICBtZWFuc1ttXSA9IHN1bXNbbV0gLyBjb3VudDtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb3VudDogY291bnQsXG4gICAgICAgICAgICBzdW1zOiBzdW1zLFxuICAgICAgICAgICAgbWVhbnM6IG1lYW5zLFxuICAgICAgICAgICAgZnJlcXM6IGZyZXFzLFxuICAgICAgICAgICAgbW9kZWw6IG1vZGVsXG4gICAgICAgIH07XG4gICAgfVxuICAgIC8vb24gZWFjaCBydW4sIGNoYW5nZSBvbmUgcGFyYW0sIGhvbGQgb3RoZXJzIGNvbnN0YW50XG4gICAgc3dlZXAocGFyYW1zLCBydW5zUGVyLCBiYXNlbGluZSA9IHRydWUpIHtcbiAgICAgICAgdmFyIGV4cFBsYW4gPSBbXTtcbiAgICAgICAgaWYgKGJhc2VsaW5lID09PSB0cnVlKSB7XG4gICAgICAgICAgICBwYXJhbXMuYmFzZWxpbmUgPSBbdHJ1ZV07XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBwYXJhbXMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyYW1zW3Byb3BdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBydW5zUGVyOyBrKyspIHtcbiAgICAgICAgICAgICAgICAgICAgZXhwUGxhbi5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtOiBwcm9wLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHBhcmFtc1twcm9wXVtpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bjoga1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wbGFucyA9IGV4cFBsYW47XG4gICAgfVxuICAgIGJvb3QocGFyYW1zKSB7XG4gICAgICAgIGxldCBydW5zO1xuICAgICAgICBmb3IgKGxldCBwYXJhbSBpbiBwYXJhbXMpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcnVucyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBydW5zID0gcGFyYW1zW3BhcmFtXS5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGFyYW1zW3BhcmFtXS5sZW5ndGggIT09IHJ1bnMpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBcImxlbmd0aCBvZiBwYXJhbWV0ZXIgYXJyYXlzIGRpZCBub3QgbWF0Y2hcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBsYW5zID0gcGFyYW1zO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWV4cGVyaW1lbnQuanMubWFwIiwiaW1wb3J0IHsgbm9ybWFsaXplIH0gZnJvbSAnLi91dGlscyc7XG5leHBvcnQgY2xhc3MgR2VuZSB7XG4gICAgY29uc3RydWN0b3IocmFuZ2UsIGRpc2NyZXRlLCBybmcpIHtcbiAgICAgICAgbGV0IHZhbCA9IHJuZy5yYW5kUmFuZ2UocmFuZ2VbMF0sIHJhbmdlWzFdKTtcbiAgICAgICAgaWYgKCFkaXNjcmV0ZSkge1xuICAgICAgICAgICAgdGhpcy5jb2RlID0gbm9ybWFsaXplKHZhbCwgcmFuZ2VbMF0sIHJhbmdlWzFdKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY29kZSA9IE1hdGguZmxvb3IodmFsKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBDaHJvbWFzb21lIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5nZW5lcyA9IFtdO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWdlbmV0aWMuanMubWFwIiwiaW1wb3J0IHsgRXhwZXJpbWVudCB9IGZyb20gJy4vZXhwZXJpbWVudCc7XG5pbXBvcnQgeyBDaHJvbWFzb21lLCBHZW5lIH0gZnJvbSAnLi9nZW5ldGljJztcbmltcG9ydCB7IGludk5vcm0gfSBmcm9tICcuL3V0aWxzJztcbmV4cG9ydCBjbGFzcyBFdm9sdXRpb25hcnkgZXh0ZW5kcyBFeHBlcmltZW50IHtcbiAgICBjb25zdHJ1Y3RvcihlbnZpcm9ubWVudCwgc2V0dXAsIGRpc2NyZXRlID0gZmFsc2UsIGdyYWRpZW50ID0gdHJ1ZSwgbWF0aW5nID0gdHJ1ZSkge1xuICAgICAgICBzdXBlcihlbnZpcm9ubWVudCwgc2V0dXApO1xuICAgICAgICB0aGlzLnRhcmdldCA9IHNldHVwLmV2b2x1dGlvbi50YXJnZXQ7XG4gICAgICAgIHRoaXMucmFuZ2VzID0gc2V0dXAuZXZvbHV0aW9uLnBhcmFtcztcbiAgICAgICAgdGhpcy5zaXplID0gc2V0dXAuZXhwZXJpbWVudC5zaXplO1xuICAgICAgICB0aGlzLm1hdGluZyA9IG1hdGluZztcbiAgICAgICAgaWYgKHRoaXMuc2l6ZSA8IDIpIHtcbiAgICAgICAgICAgIHRoaXMubWF0aW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kaXNjcmV0ZSA9IGRpc2NyZXRlO1xuICAgICAgICB0aGlzLmdyYWRpZW50ID0gZ3JhZGllbnQ7XG4gICAgICAgIHRoaXMucG9wdWxhdGlvbiA9IFtdO1xuICAgICAgICB0aGlzLm11dGF0ZVJhdGUgPSAwLjAzO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc2l6ZTsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgY2hyb21hID0gbmV3IENocm9tYXNvbWUoKTtcbiAgICAgICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgdGhpcy5yYW5nZXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgICBjaHJvbWEuZ2VuZXMucHVzaChuZXcgR2VuZSh0aGlzLnJhbmdlc1trXS5yYW5nZSwgdGhpcy5kaXNjcmV0ZSwgdGhpcy5ybmcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGlvbi5wdXNoKGNocm9tYSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhcnQocnVucywgc3RlcCwgdW50aWwpIHtcbiAgICAgICAgbGV0IHIgPSAwO1xuICAgICAgICB3aGlsZSAociA8IHJ1bnMpIHtcbiAgICAgICAgICAgIHRoaXMucHJlcChyLCB0aGlzLnNldHVwKTtcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGlvbi5zb3J0KHRoaXMuYXNjU29ydCk7XG4gICAgICAgICAgICB0aGlzLnBvcHVsYXRpb24gPSB0aGlzLnBvcHVsYXRpb24uc2xpY2UoMCwgdGhpcy5zaXplKTtcbiAgICAgICAgICAgIHRoaXMuZXhwZXJpbWVudExvZ1t0aGlzLmV4cGVyaW1lbnRMb2cubGVuZ3RoIC0gMV0uYmVzdCA9IHRoaXMucG9wdWxhdGlvblswXS5zY29yZTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdiZXN0OiAnLCB0aGlzLmV4cGVyaW1lbnRMb2dbdGhpcy5leHBlcmltZW50TG9nLmxlbmd0aCAtIDFdLmJlc3QpO1xuICAgICAgICAgICAgcisrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmV4cGVyaW1lbnRMb2c7XG4gICAgfVxuICAgIGdldFBhcmFtcyhjaHJvbWEsIGNmZykge1xuICAgICAgICBsZXQgb3V0ID0ge307XG4gICAgICAgIGZvciAobGV0IHBtID0gMDsgcG0gPCB0aGlzLnJhbmdlcy5sZW5ndGg7IHBtKyspIHtcbiAgICAgICAgICAgIGxldCBjZmdQbSA9IHRoaXMucmFuZ2VzW3BtXTtcbiAgICAgICAgICAgIGlmIChjZmdQbS5sZXZlbCA9PT0gJ2FnZW50cycgfHwgdHlwZW9mIGNmZ1BtLmxldmVsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIG91dFtjZmdQbS5sZXZlbCArIFwiX1wiICsgY2ZnUG0ubmFtZV0gPSBpbnZOb3JtKGNocm9tYS5nZW5lc1twbV0uY29kZSwgY2ZnUG0ucmFuZ2VbMF0sIGNmZ1BtLnJhbmdlWzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGNocm9tYS5nZW5lc1twbV0uY29kZSk7XG4gICAgICAgICAgICAgICAgb3V0W2NmZ1BtLmxldmVsICsgXCJfXCIgKyBjZmdQbS5uYW1lXSA9IGludk5vcm0oY2hyb21hLmdlbmVzW3BtXS5jb2RlLCBjZmdQbS5yYW5nZVswXSwgY2ZnUG0ucmFuZ2VbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfVxuICAgIGRzY1NvcnQoYSwgYikge1xuICAgICAgICBpZiAoYS5zY29yZSA+IGIuc2NvcmUpIHtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhLnNjb3JlIDwgYi5zY29yZSkge1xuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIGFzY1NvcnQoYSwgYikge1xuICAgICAgICBpZiAoYS5zY29yZSA+IGIuc2NvcmUpIHtcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGEuc2NvcmUgPCBiLnNjb3JlKSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIHByZXAociwgY2ZnKSB7XG4gICAgICAgIGlmICh0aGlzLm1hdGluZykge1xuICAgICAgICAgICAgbGV0IHRvcFBlcmNlbnQgPSBNYXRoLnJvdW5kKDAuMSAqIHRoaXMuc2l6ZSkgKyAyOyAvL3RlbiBwZXJjZW50IG9mIG9yaWdpbmFsIHNpemUgKyAyXG4gICAgICAgICAgICBsZXQgY2hpbGRyZW4gPSB0aGlzLm1hdGUodG9wUGVyY2VudCk7XG4gICAgICAgICAgICB0aGlzLnBvcHVsYXRpb24gPSB0aGlzLnBvcHVsYXRpb24uY29uY2F0KGNoaWxkcmVuKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IHRoaXMucG9wdWxhdGlvbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5tdXRhdGUodGhpcy5wb3B1bGF0aW9uW2ldLCAxKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMucG9wdWxhdGlvbi5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgZm9yIChsZXQgcG0gPSAwOyBwbSA8IHRoaXMucmFuZ2VzLmxlbmd0aDsgcG0rKykge1xuICAgICAgICAgICAgICAgIGxldCBjZmdQbSA9IHRoaXMucmFuZ2VzW3BtXTtcbiAgICAgICAgICAgICAgICBsZXQgZ3JvdXBJZHg7XG4gICAgICAgICAgICAgICAgaWYgKGNmZ1BtLmxldmVsID09PSAnYWdlbnRzJyB8fCB0eXBlb2YgY2ZnUG0ubGV2ZWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNmZy5hZ2VudHNbY2ZnUG0uZ3JvdXBdLnBhcmFtc1tjZmdQbS5uYW1lXS5hc3NpZ24gPSBpbnZOb3JtKHRoaXMucG9wdWxhdGlvbltqXS5nZW5lc1twbV0uY29kZSwgY2ZnUG0ucmFuZ2VbMF0sIGNmZ1BtLnJhbmdlWzFdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNmZ1tjZmdQbS5sZXZlbF0ucGFyYW1zW2NmZ1BtLmdyb3VwXVtjZmdQbS5uYW1lXSA9IGludk5vcm0odGhpcy5wb3B1bGF0aW9uW2pdLmdlbmVzW3BtXS5jb2RlLCBjZmdQbS5yYW5nZVswXSwgY2ZnUG0ucmFuZ2VbMV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN1cGVyLnByZXAociwgY2ZnKTtcbiAgICAgICAgICAgIHRoaXMuZW52aXJvbm1lbnQudGltZSA9IDA7XG4gICAgICAgICAgICBsZXQgcHJlZGljdCA9IHRoaXMucmVwb3J0KHIsIGNmZyk7XG4gICAgICAgICAgICB0aGlzLnBvcHVsYXRpb25bal0uc2NvcmUgPSB0aGlzLmNvc3QocHJlZGljdCwgdGhpcy50YXJnZXQpO1xuICAgICAgICAgICAgdGhpcy5leHBlcmltZW50TG9nLnB1c2gocHJlZGljdCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29zdChwcmVkaWN0LCB0YXJnZXQpIHtcbiAgICAgICAgbGV0IGRldiA9IDA7XG4gICAgICAgIGxldCBkaW1lbnNpb25zID0gMDtcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHRhcmdldC5tZWFucykge1xuICAgICAgICAgICAgZGV2ICs9IHRhcmdldC5tZWFuc1trZXldIC0gcHJlZGljdC5tZWFuc1trZXldO1xuICAgICAgICAgICAgZGltZW5zaW9ucysrO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGtleSBpbiB0YXJnZXQuZnJlcXMpIHtcbiAgICAgICAgICAgIGRldiArPSB0YXJnZXQuZnJlcXNba2V5XSAtIHByZWRpY3QuZnJlcXNba2V5XTtcbiAgICAgICAgICAgIGRpbWVuc2lvbnMrKztcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gdGFyZ2V0Lm1vZGVsKSB7XG4gICAgICAgICAgICBkZXYgKz0gdGFyZ2V0Lm1vZGVsW2tleV0gLSBwcmVkaWN0Lm1vZGVsW2tleV07XG4gICAgICAgICAgICBkaW1lbnNpb25zKys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE1hdGgucG93KGRldiwgMikgLyBkaW1lbnNpb25zO1xuICAgIH1cbiAgICByZXBvcnQociwgY2ZnKSB7XG4gICAgICAgIHJldHVybiBzdXBlci5yZXBvcnQociwgY2ZnKTtcbiAgICB9XG4gICAgbWF0ZShwYXJlbnRzKSB7XG4gICAgICAgIGxldCBudW1DaGlsZHJlbiA9IDAuNSAqIHRoaXMucmFuZ2VzLmxlbmd0aCAqIHRoaXMucmFuZ2VzLmxlbmd0aDtcbiAgICAgICAgbGV0IGNoaWxkcmVuID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtQ2hpbGRyZW47IGkrKykge1xuICAgICAgICAgICAgbGV0IGNoaWxkID0gbmV3IENocm9tYXNvbWUoKTtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5yYW5nZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgZ2VuZSA9IG5ldyBHZW5lKFt0aGlzLnJhbmdlc1tqXS5yYW5nZVswXSwgdGhpcy5yYW5nZXNbal0ucmFuZ2VbMV1dLCB0aGlzLmRpc2NyZXRlLCB0aGlzLnJuZyk7XG4gICAgICAgICAgICAgICAgbGV0IHJhbmQgPSBNYXRoLmZsb29yKHRoaXMucm5nLnJhbmRvbSgpICogcGFyZW50cyk7XG4gICAgICAgICAgICAgICAgbGV0IGV4cHJlc3NlZCA9IHRoaXMucG9wdWxhdGlvbltyYW5kXS5nZW5lcy5zbGljZShqLCBqICsgMSk7XG4gICAgICAgICAgICAgICAgZ2VuZS5jb2RlID0gZXhwcmVzc2VkWzBdLmNvZGU7XG4gICAgICAgICAgICAgICAgY2hpbGQuZ2VuZXMucHVzaChnZW5lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjaGlsZHJlbjtcbiAgICB9XG4gICAgbXV0YXRlKGNocm9tYSwgY2hhbmNlKSB7XG4gICAgICAgIGlmICh0aGlzLnJuZy5yYW5kb20oKSA+IGNoYW5jZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBiZXN0ID0gdGhpcy5wb3B1bGF0aW9uWzBdLmdlbmVzO1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGNocm9tYS5nZW5lcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgbGV0IGdlbmUgPSBjaHJvbWEuZ2VuZXNbal07XG4gICAgICAgICAgICBsZXQgZGlmZjtcbiAgICAgICAgICAgIGlmICh0aGlzLmdyYWRpZW50KSB7XG4gICAgICAgICAgICAgICAgZGlmZiA9IGJlc3Rbal0uY29kZSAtIGdlbmUuY29kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGRpZmYgPSB0aGlzLnJuZy5yYW5kUmFuZ2UoLTEsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHVwT3JEb3duID0gZGlmZiA+IDAgPyAxIDogLTE7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZGlzY3JldGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGlmZiA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGdlbmUuY29kZSArPSB0aGlzLnJuZy5ub3JtYWwoMCwgMC4yKSAqIHRoaXMubXV0YXRlUmF0ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGdlbmUuY29kZSArPSBkaWZmICogdGhpcy5tdXRhdGVSYXRlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGdlbmUuY29kZSArPSB1cE9yRG93bjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGdlbmUuY29kZSA9IE1hdGgubWluKE1hdGgubWF4KDAsIGdlbmUuY29kZSksIDEpO1xuICAgICAgICB9XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZXZvbHV0aW9uYXJ5LmpzLm1hcCIsImltcG9ydCB7IFFDb21wb25lbnQgfSBmcm9tICcuL1FDb21wb25lbnQnO1xuaW1wb3J0IHsgU1VDQ0VTUyB9IGZyb20gJy4vdXRpbHMnO1xuZXhwb3J0IGNsYXNzIEh5YnJpZEF1dG9tYXRhIGV4dGVuZHMgUUNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IobmFtZSwgZGF0YSwgZmxvd1NldCwgZmxvd01hcCwganVtcFNldCwganVtcE1hcCkge1xuICAgICAgICBzdXBlcihuYW1lKTtcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICAgICAgdGhpcy5mbG93U2V0ID0gZmxvd1NldDtcbiAgICAgICAgdGhpcy5mbG93TWFwID0gZmxvd01hcDtcbiAgICAgICAgdGhpcy5qdW1wU2V0ID0ganVtcFNldDtcbiAgICAgICAgdGhpcy5qdW1wTWFwID0ganVtcE1hcDtcbiAgICB9XG4gICAgdXBkYXRlKGFnZW50LCBzdGVwKSB7XG4gICAgICAgIGxldCB0ZW1wID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShhZ2VudCkpO1xuICAgICAgICBmb3IgKHZhciBtb2RlIGluIHRoaXMuanVtcFNldCkge1xuICAgICAgICAgICAgbGV0IGVkZ2UgPSB0aGlzLmp1bXBTZXRbbW9kZV07XG4gICAgICAgICAgICBsZXQgZWRnZVN0YXRlID0gZWRnZS5jaGVjayhhZ2VudFtlZGdlLmtleV0sIGVkZ2UudmFsdWUpO1xuICAgICAgICAgICAgaWYgKGVkZ2VTdGF0ZSA9PT0gU1VDQ0VTUyAmJiBtb2RlICE9IGFnZW50LmN1cnJlbnRNb2RlKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgYWdlbnRbZWRnZS5rZXldID0gdGhpcy5qdW1wTWFwW2VkZ2Uua2V5XVthZ2VudC5jdXJyZW50TW9kZV1bbW9kZV0oYWdlbnRbZWRnZS5rZXldKTtcbiAgICAgICAgICAgICAgICAgICAgYWdlbnQuY3VycmVudE1vZGUgPSBtb2RlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoRXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vbm8gdHJhbnNpdGlvbiB0aGlzIGRpcmVjdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhFcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLmZsb3dNYXApIHtcbiAgICAgICAgICAgICAgICAvL3NlY29uZCBvcmRlciBpbnRlZ3JhdGlvblxuICAgICAgICAgICAgICAgIGxldCB0ZW1wRCA9IHRoaXMuZmxvd01hcFtrZXldW2FnZW50LmN1cnJlbnRNb2RlXShhZ2VudFtrZXldKTtcbiAgICAgICAgICAgICAgICB0ZW1wW2tleV0gPSBhZ2VudFtrZXldICsgdGVtcEQ7XG4gICAgICAgICAgICAgICAgYWdlbnRba2V5XSArPSAwLjUgKiAodGVtcEQgKyB0aGlzLmZsb3dNYXBba2V5XVthZ2VudC5jdXJyZW50TW9kZV0odGVtcFtrZXldKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1oYS5qcy5tYXAiLCJpbXBvcnQgeyBRQ29tcG9uZW50IH0gZnJvbSAnLi9RQ29tcG9uZW50JztcbmltcG9ydCB7IGdlbmVyYXRlVVVJRCB9IGZyb20gJy4vdXRpbHMnO1xuLy9IaWVyYXJjaGFsIFRhc2sgTmV0d29ya1xuZXhwb3J0IGNsYXNzIEhUTlBsYW5uZXIgZXh0ZW5kcyBRQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgdGljayhub2RlLCB0YXNrLCBhZ2VudCkge1xuICAgICAgICBpZiAoYWdlbnQucnVubmluZ0xpc3QpIHtcbiAgICAgICAgICAgIGFnZW50LnJ1bm5pbmdMaXN0LnB1c2gobm9kZS5uYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGFnZW50LnJ1bm5pbmdMaXN0ID0gW25vZGUubmFtZV07XG4gICAgICAgICAgICBhZ2VudC5zdWNjZXNzTGlzdCA9IFtdO1xuICAgICAgICAgICAgYWdlbnQuYmFycmllckxpc3QgPSBbXTtcbiAgICAgICAgICAgIGFnZW50LmJsYWNrYm9hcmQgPSBbXTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc3RhdGUgPSBub2RlLnZpc2l0KGFnZW50LCB0YXNrKTtcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvcihuYW1lLCByb290LCB0YXNrLCBkYXRhKSB7XG4gICAgICAgIHN1cGVyKG5hbWUpO1xuICAgICAgICB0aGlzLnJvb3QgPSByb290O1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgICAgICB0aGlzLnN1bW1hcnkgPSBbXTtcbiAgICAgICAgdGhpcy5yZXN1bHRzID0gW107XG4gICAgICAgIHRoaXMudGFzayA9IHRhc2s7XG4gICAgfVxuICAgIHVwZGF0ZShhZ2VudCwgc3RlcCkge1xuICAgICAgICAvL2l0ZXJhdGUgYW4gYWdlbnQoZGF0YSkgdGhyb3VnaCB0aGUgdGFzayBuZXR3b3JrXG4gICAgICAgIGFnZW50LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIEhUTlBsYW5uZXIudGljayh0aGlzLnJvb3QsIHRoaXMudGFzaywgYWdlbnQpO1xuICAgICAgICBpZiAoYWdlbnQuc3VjY2Vzc0xpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgYWdlbnQuc3VjY2VlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBhZ2VudC5zdWNjZWVkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgYWdlbnQuYWN0aXZlID0gZmFsc2U7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEhUTlJvb3RUYXNrIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBnb2Fscykge1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLmdvYWxzID0gZ29hbHM7XG4gICAgfVxuICAgIGV2YWx1YXRlR29hbChhZ2VudCkge1xuICAgICAgICB2YXIgcmVzdWx0LCBnO1xuICAgICAgICBmb3IgKHZhciBwID0gMDsgcCA8IHRoaXMuZ29hbHMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGcgPSB0aGlzLmdvYWxzW3BdO1xuICAgICAgICAgICAgaWYgKGcuZGF0YSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGcuY2hlY2soZy5kYXRhW2cua2V5XSwgZy52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBnLmNoZWNrKGFnZW50W2cua2V5XSwgZy52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEhUTk5vZGUge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHByZWNvbmRpdGlvbnMpIHtcbiAgICAgICAgdGhpcy5pZCA9IGdlbmVyYXRlVVVJRCgpO1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLnByZWNvbmRpdGlvbnMgPSBwcmVjb25kaXRpb25zO1xuICAgIH1cbiAgICBldmFsdWF0ZVByZUNvbmRzKGFnZW50KSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmICh0aGlzLnByZWNvbmRpdGlvbnMgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgZm9yICh2YXIgcCA9IDA7IHAgPCB0aGlzLnByZWNvbmRpdGlvbnMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0aGlzLnByZWNvbmRpdGlvbnNbcF0uY2hlY2soYWdlbnRbdGhpcy5wcmVjb25kaXRpb25zW3BdLmtleV0sIHRoaXMucHJlY29uZGl0aW9uc1twXS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gSFROUGxhbm5lci5GQUlMRUQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEhUTlBsYW5uZXIuRkFJTEVEO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gSFROUGxhbm5lci5TVUNDRVNTO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBIVE5PcGVyYXRvciBleHRlbmRzIEhUTk5vZGUge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHByZWNvbmRpdGlvbnMsIGVmZmVjdHMpIHtcbiAgICAgICAgc3VwZXIobmFtZSwgcHJlY29uZGl0aW9ucyk7XG4gICAgICAgIHRoaXMudHlwZSA9IFwib3BlcmF0b3JcIjtcbiAgICAgICAgdGhpcy5lZmZlY3RzID0gZWZmZWN0cztcbiAgICAgICAgdGhpcy52aXNpdCA9IGZ1bmN0aW9uIChhZ2VudCwgdGFzaykge1xuICAgICAgICAgICAgaWYgKHRoaXMuZXZhbHVhdGVQcmVDb25kcyhhZ2VudCkgPT09IEhUTlBsYW5uZXIuU1VDQ0VTUykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lZmZlY3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWZmZWN0c1tpXShhZ2VudC5ibGFja2JvYXJkWzBdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRhc2suZXZhbHVhdGVHb2FsKGFnZW50LmJsYWNrYm9hcmRbMF0pID09PSBIVE5QbGFubmVyLlNVQ0NFU1MpIHtcbiAgICAgICAgICAgICAgICAgICAgYWdlbnQuc3VjY2Vzc0xpc3QudW5zaGlmdCh0aGlzLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSFROUGxhbm5lci5TVUNDRVNTO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEhUTlBsYW5uZXIuUlVOTklORztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhZ2VudC5iYXJyaWVyTGlzdC51bnNoaWZ0KHsgbmFtZTogdGhpcy5uYW1lLCBjb25kaXRpb25zOiB0aGlzLnByZWNvbmRpdGlvbnMgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEhUTlBsYW5uZXIuRkFJTEVEO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBIVE5NZXRob2QgZXh0ZW5kcyBIVE5Ob2RlIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBwcmVjb25kaXRpb25zLCBjaGlsZHJlbikge1xuICAgICAgICBzdXBlcihuYW1lLCBwcmVjb25kaXRpb25zKTtcbiAgICAgICAgdGhpcy50eXBlID0gXCJtZXRob2RcIjtcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgICAgICB0aGlzLnZpc2l0ID0gZnVuY3Rpb24gKGFnZW50LCB0YXNrKSB7XG4gICAgICAgICAgICB2YXIgY29weSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoYWdlbnQpKTtcbiAgICAgICAgICAgIGRlbGV0ZSBjb3B5LmJsYWNrYm9hcmQ7XG4gICAgICAgICAgICBhZ2VudC5ibGFja2JvYXJkLnVuc2hpZnQoY29weSk7XG4gICAgICAgICAgICBpZiAodGhpcy5ldmFsdWF0ZVByZUNvbmRzKGFnZW50KSA9PT0gSFROUGxhbm5lci5TVUNDRVNTKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0ZSA9IEhUTlBsYW5uZXIudGljayh0aGlzLmNoaWxkcmVuW2ldLCB0YXNrLCBhZ2VudCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0ZSA9PT0gSFROUGxhbm5lci5TVUNDRVNTKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhZ2VudC5zdWNjZXNzTGlzdC51bnNoaWZ0KHRoaXMubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gSFROUGxhbm5lci5TVUNDRVNTO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYWdlbnQuYmFycmllckxpc3QudW5zaGlmdCh7IG5hbWU6IHRoaXMubmFtZSwgY29uZGl0aW9uczogdGhpcy5wcmVjb25kaXRpb25zIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIEhUTlBsYW5uZXIuRkFJTEVEO1xuICAgICAgICB9O1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWh0bi5qcy5tYXAiLCJpbXBvcnQgeyBRQ29tcG9uZW50IH0gZnJvbSAnLi9RQ29tcG9uZW50JztcbmV4cG9ydCBjbGFzcyBNSFNhbXBsZXIgZXh0ZW5kcyBRQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBybmcsIGRhdGEsIHRhcmdldCwgc2F2ZSA9IHRydWUpIHtcbiAgICAgICAgc3VwZXIobmFtZSk7XG4gICAgICAgIHRoaXMua2VwdCA9IDA7XG4gICAgICAgIHRoaXMudGltZSA9IDA7XG4gICAgICAgIHRoaXMucm5nID0gcm5nO1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgICAgICB0aGlzLmNoYWluID0gW107XG4gICAgICAgIHRoaXMuc2F2ZSA9IHNhdmU7XG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIH1cbiAgICB1cGRhdGUoYWdlbnQsIHN0ZXApIHtcbiAgICAgICAgbGV0IG5ld1Byb2IgPSAwO1xuICAgICAgICBhZ2VudC55ID0gYWdlbnQucHJvcG9zYWwoYWdlbnQsIHN0ZXAsIHRoaXMucm5nKTtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnRhcmdldCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LmZvckVhY2goKGQpID0+IHtcbiAgICAgICAgICAgICAgICBuZXdQcm9iICs9IGFnZW50LmxuUHJvYkYoYWdlbnQsIHN0ZXAsIGQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBuZXdQcm9iICo9IDEgLyB0aGlzLnRhcmdldC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBuZXdQcm9iID0gYWdlbnQubG5Qcm9iRihhZ2VudCwgc3RlcCk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGRpZmYgPSBuZXdQcm9iIC0gYWdlbnQubG5Qcm9iO1xuICAgICAgICBsZXQgdSA9IHRoaXMucm5nLnJhbmRvbSgpO1xuICAgICAgICBpZiAoTWF0aC5sb2codSkgPD0gZGlmZiB8fCBkaWZmID49IDApIHtcbiAgICAgICAgICAgIGFnZW50LmxuUHJvYiA9IG5ld1Byb2I7XG4gICAgICAgICAgICBhZ2VudC54ID0gYWdlbnQueTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMua2VwdCArPSAxO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnNhdmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHRoaXMuY2hhaW4ucHVzaCh7IGlkOiBhZ2VudC5pZCwgdGltZTogYWdlbnQudGltZSwgeDogYWdlbnQueCB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1jLmpzLm1hcCIsImV4cG9ydCBjbGFzcyBrTWVhbiB7XG4gICAgY29uc3RydWN0b3IoZGF0YSwgcHJvcHMsIGspIHtcbiAgICAgICAgdGhpcy5jZW50cm9pZHMgPSBbXTtcbiAgICAgICAgdGhpcy5saW1pdHMgPSB7fTtcbiAgICAgICAgdGhpcy5pdGVyYXRpb25zID0gMDtcbiAgICAgICAgLy9jcmVhdGUgYSBsaW1pdHMgb2JqIGZvciBlYWNoIHByb3BcbiAgICAgICAgcHJvcHMuZm9yRWFjaChwID0+IHtcbiAgICAgICAgICAgIHRoaXMubGltaXRzW3BdID0ge1xuICAgICAgICAgICAgICAgIG1pbjogMWUxNSxcbiAgICAgICAgICAgICAgICBtYXg6IC0xZTE1XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgICAgLy9zZXQgbGltaXRzIGZvciBlYWNoIHByb3BcbiAgICAgICAgZGF0YS5mb3JFYWNoKGQgPT4ge1xuICAgICAgICAgICAgcHJvcHMuZm9yRWFjaChwID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZFtwXSA+IHRoaXMubGltaXRzW3BdLm1heCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpbWl0c1twXS5tYXggPSBkW3BdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZFtwXSA8IHRoaXMubGltaXRzW3BdLm1pbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpbWl0c1twXS5taW4gPSBkW3BdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgLy9jcmVhdGUgayByYW5kb20gcG9pbnRzXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgazsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmNlbnRyb2lkc1tpXSA9IHsgY291bnQ6IDAgfTtcbiAgICAgICAgICAgIHByb3BzLmZvckVhY2gocCA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGNlbnRyb2lkID0gTWF0aC5yYW5kb20oKSAqIHRoaXMubGltaXRzW3BdLm1heCArIHRoaXMubGltaXRzW3BdLm1pbjtcbiAgICAgICAgICAgICAgICB0aGlzLmNlbnRyb2lkc1tpXVtwXSA9IGNlbnRyb2lkO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICAgICAgdGhpcy5wcm9wcyA9IHByb3BzO1xuICAgIH1cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIHRoaXMuX2Fzc2lnbkNlbnRyb2lkKCk7XG4gICAgICAgIHRoaXMuX21vdmVDZW50cm9pZCgpO1xuICAgIH1cbiAgICBydW4oKSB7XG4gICAgICAgIGxldCBmaW5pc2hlZCA9IGZhbHNlO1xuICAgICAgICB3aGlsZSAoIWZpbmlzaGVkKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5jZW50cm9pZHMuZm9yRWFjaChjID0+IHtcbiAgICAgICAgICAgICAgICBmaW5pc2hlZCA9IGMuZmluaXNoZWQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuaXRlcmF0aW9ucysrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbdGhpcy5jZW50cm9pZHMsIHRoaXMuZGF0YV07XG4gICAgfVxuICAgIF9hc3NpZ25DZW50cm9pZCgpIHtcbiAgICAgICAgdGhpcy5kYXRhLmZvckVhY2goKGQsIGopID0+IHtcbiAgICAgICAgICAgIGxldCBkaXN0YW5jZXMgPSBbXTtcbiAgICAgICAgICAgIGxldCB0b3RhbERpc3QgPSBbXTtcbiAgICAgICAgICAgIGxldCBtaW5EaXN0O1xuICAgICAgICAgICAgbGV0IG1pbkluZGV4O1xuICAgICAgICAgICAgLy9mb3JlYWNoIHBvaW50LCBnZXQgdGhlIHBlciBwcm9wIGRpc3RhbmNlIGZyb20gZWFjaCBjZW50cm9pZFxuICAgICAgICAgICAgdGhpcy5jZW50cm9pZHMuZm9yRWFjaCgoYywgaSkgPT4ge1xuICAgICAgICAgICAgICAgIGRpc3RhbmNlc1tpXSA9IHt9O1xuICAgICAgICAgICAgICAgIHRvdGFsRGlzdFtpXSA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5mb3JFYWNoKHAgPT4ge1xuICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZXNbaV1bcF0gPSBNYXRoLnNxcnQoKGRbcF0gLSBjW3BdKSAqIChkW3BdIC0gY1twXSkpO1xuICAgICAgICAgICAgICAgICAgICB0b3RhbERpc3RbaV0gKz0gZGlzdGFuY2VzW2ldW3BdO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRvdGFsRGlzdFtpXSA9IE1hdGguc3FydCh0b3RhbERpc3RbaV0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBtaW5EaXN0ID0gTWF0aC5taW4uYXBwbHkobnVsbCwgdG90YWxEaXN0KTtcbiAgICAgICAgICAgIG1pbkluZGV4ID0gdG90YWxEaXN0LmluZGV4T2YobWluRGlzdCk7XG4gICAgICAgICAgICBkLmNlbnRyb2lkID0gbWluSW5kZXg7XG4gICAgICAgICAgICBkLmRpc3RhbmNlcyA9IGRpc3RhbmNlcztcbiAgICAgICAgICAgIHRoaXMuY2VudHJvaWRzW21pbkluZGV4XS5jb3VudCArPSAxO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgX21vdmVDZW50cm9pZCgpIHtcbiAgICAgICAgdGhpcy5jZW50cm9pZHMuZm9yRWFjaCgoYywgaSkgPT4ge1xuICAgICAgICAgICAgbGV0IGRpc3RGcm9tQ2VudHJvaWQgPSB7fTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMuZm9yRWFjaChwID0+IGRpc3RGcm9tQ2VudHJvaWRbcF0gPSBbXSk7XG4gICAgICAgICAgICAvL2dldCB0aGUgcGVyIHByb3AgZGlzdGFuY2VzIGZyb20gdGhlIGNlbnRyb2lkIGFtb25nIGl0cycgYXNzaWduZWQgcG9pbnRzXG4gICAgICAgICAgICB0aGlzLmRhdGEuZm9yRWFjaChkID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZC5jZW50cm9pZCA9PT0gaSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmZvckVhY2gocCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXN0RnJvbUNlbnRyb2lkW3BdLnB1c2goZFtwXSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy9oYW5kbGUgY2VudHJvaWQgd2l0aCBubyBhc3NpZ25lZCBwb2ludHMgKHJhbmRvbWx5IGFzc2lnbiBuZXcpO1xuICAgICAgICAgICAgaWYgKGMuY291bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmZvckVhY2gocCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3RGcm9tQ2VudHJvaWRbcF0gPSBbTWF0aC5yYW5kb20oKSAqIHRoaXMubGltaXRzW3BdLm1heCArIHRoaXMubGltaXRzW3BdLm1pbl07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2dldCB0aGUgc3VtIGFuZCBtZWFuIHBlciBwcm9wZXJ0eSBvZiB0aGUgYXNzaWduZWQgcG9pbnRzXG4gICAgICAgICAgICB0aGlzLnByb3BzLmZvckVhY2gocCA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHN1bSA9IGRpc3RGcm9tQ2VudHJvaWRbcF0ucmVkdWNlKChwcmV2LCBuZXh0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmV2ICsgbmV4dDtcbiAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgICBsZXQgbWVhbiA9IHN1bSAvIGRpc3RGcm9tQ2VudHJvaWRbcF0ubGVuZ3RoO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coaSwgJ1xcJ3MgYXZlcmFnZSBkaXN0IHdhcycsIG1lYW4sICcgdGhlIGN1cnJlbnQgcG9zIHdhcyAnLCBjW3BdKTtcbiAgICAgICAgICAgICAgICBpZiAoY1twXSAhPT0gbWVhbikge1xuICAgICAgICAgICAgICAgICAgICBjW3BdID0gbWVhbjtcbiAgICAgICAgICAgICAgICAgICAgYy5maW5pc2hlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBjLmNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGMuZmluaXNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1rbWVhbi5qcy5tYXAiLCJleHBvcnQgY2xhc3MgS05OIHtcbiAgICBzZXROZWlnaGJvcnMocG9pbnQsIGRhdGEsIHBhcmFtLCBjbGFzc2lmaWVyKSB7XG4gICAgICAgIGRhdGEuZm9yRWFjaCgoZCkgPT4ge1xuICAgICAgICAgICAgaWYgKGQuaWQgIT09IHBvaW50LmlkKSB7XG4gICAgICAgICAgICAgICAgcG9pbnQubmVpZ2hib3JzW2QuaWRdID0gcG9pbnQubmVpZ2hib3JzW2QuaWRdIHx8IHt9O1xuICAgICAgICAgICAgICAgIHBvaW50Lm5laWdoYm9yc1tkLmlkXVtjbGFzc2lmaWVyXSA9IGRbY2xhc3NpZmllcl07XG4gICAgICAgICAgICAgICAgcG9pbnQubmVpZ2hib3JzW2QuaWRdW3BhcmFtLnBhcmFtXSA9IE1hdGguYWJzKHBvaW50W3BhcmFtLnBhcmFtXSAtIGRbcGFyYW0ucGFyYW1dKSAvIHBhcmFtLnJhbmdlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgc29ydChuZWlnaGJvcnMsIHBhcmFtKSB7XG4gICAgICAgIHZhciBsaXN0ID0gW107XG4gICAgICAgIGZvciAodmFyIG5laWdoIGluIG5laWdoYm9ycykge1xuICAgICAgICAgICAgbGlzdC5wdXNoKG5laWdoYm9yc1tuZWlnaF0pO1xuICAgICAgICB9XG4gICAgICAgIGxpc3Quc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgaWYgKGFbcGFyYW1dID49IGJbcGFyYW1dKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYltwYXJhbV0gPj0gYVtwYXJhbV0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBsaXN0O1xuICAgIH1cbiAgICBzZXREaXN0YW5jZXMoZGF0YSwgdHJhaW5lZCwga1BhcmFtc09iaiwgY2xhc3NpZmllcikge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGRhdGFbaV0ubmVpZ2hib3JzID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IGtQYXJhbXNPYmoubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRhdGFbaV1ba1BhcmFtc09ialtrXS5wYXJhbV0gPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0TmVpZ2hib3JzKGRhdGFbaV0sIHRyYWluZWQsIGtQYXJhbXNPYmpba10sIGNsYXNzaWZpZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAodmFyIG4gaW4gZGF0YVtpXS5uZWlnaGJvcnMpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmVpZ2hib3IgPSBkYXRhW2ldLm5laWdoYm9yc1tuXTtcbiAgICAgICAgICAgICAgICB2YXIgZGlzdCA9IDA7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgcCA9IDA7IHAgPCBrUGFyYW1zT2JqLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3QgKz0gbmVpZ2hib3Jba1BhcmFtc09ialtwXS5wYXJhbV0gKiBuZWlnaGJvcltrUGFyYW1zT2JqW3BdLnBhcmFtXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmVpZ2hib3IuZGlzdGFuY2UgPSBNYXRoLnNxcnQoZGlzdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGdldFJhbmdlKGRhdGEsIGtQYXJhbXMpIHtcbiAgICAgICAgbGV0IHJhbmdlcyA9IFtdLCBtaW4gPSAxZTIwLCBtYXggPSAwO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGtQYXJhbXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIGQgPSAwOyBkIDwgZGF0YS5sZW5ndGg7IGQrKykge1xuICAgICAgICAgICAgICAgIGlmIChkYXRhW2RdW2tQYXJhbXNbal1dIDwgbWluKSB7XG4gICAgICAgICAgICAgICAgICAgIG1pbiA9IGRhdGFbZF1ba1BhcmFtc1tqXV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChkYXRhW2RdW2tQYXJhbXNbal1dID4gbWF4KSB7XG4gICAgICAgICAgICAgICAgICAgIG1heCA9IGRhdGFbZF1ba1BhcmFtc1tqXV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmFuZ2VzLnB1c2goe1xuICAgICAgICAgICAgICAgIHBhcmFtOiBrUGFyYW1zW2pdLFxuICAgICAgICAgICAgICAgIG1pbjogbWluLFxuICAgICAgICAgICAgICAgIG1heDogbWF4LFxuICAgICAgICAgICAgICAgIHJhbmdlOiBtYXggLSBtaW5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIDtcbiAgICAgICAgcmV0dXJuIHJhbmdlcztcbiAgICB9XG4gICAgY2xhc3NpZnkoZGF0YSwgdHJhaW5lZERhdGEsIGtQYXJhbXMsIGNsYXNzaWZpZXIsIG5lYXJlc3ROKSB7XG4gICAgICAgIGxldCBrUGFyYW1zT2JqID0gdGhpcy5nZXRSYW5nZShbXS5jb25jYXQoZGF0YSwgdHJhaW5lZERhdGEpLCBrUGFyYW1zKTtcbiAgICAgICAgZGF0YSA9IHRoaXMuc2V0RGlzdGFuY2VzKGRhdGEsIHRyYWluZWREYXRhLCBrUGFyYW1zT2JqLCBjbGFzc2lmaWVyKTtcbiAgICAgICAgbGV0IG9yZGVyZWQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgZCA9IDA7IGQgPCBkYXRhLmxlbmd0aDsgZCsrKSB7XG4gICAgICAgICAgICBsZXQgcmVzdWx0cyA9IHt9O1xuICAgICAgICAgICAgb3JkZXJlZCA9IHRoaXMuc29ydChkYXRhW2RdLm5laWdoYm9ycywgJ2Rpc3RhbmNlJyk7XG4gICAgICAgICAgICBsZXQgbiA9IDA7XG4gICAgICAgICAgICB3aGlsZSAobiA8IG5lYXJlc3ROKSB7XG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBvcmRlcmVkW25dW2NsYXNzaWZpZXJdO1xuICAgICAgICAgICAgICAgIHJlc3VsdHNbY3VycmVudF0gPSByZXN1bHRzW2N1cnJlbnRdIHx8IDA7XG4gICAgICAgICAgICAgICAgcmVzdWx0c1tjdXJyZW50XSArPSAxO1xuICAgICAgICAgICAgICAgIG4rKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBtYXggPSAwLCBsaWtlbGllc3QgPSAnJztcbiAgICAgICAgICAgIGZvciAobGV0IHBhcmFtIGluIHJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0c1twYXJhbV0gPiBtYXgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gcmVzdWx0c1twYXJhbV07XG4gICAgICAgICAgICAgICAgICAgIGxpa2VsaWVzdCA9IHBhcmFtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRhdGFbZF1bY2xhc3NpZmllcl0gPSBsaWtlbGllc3Q7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9a25uLmpzLm1hcCIsImV4cG9ydCBjbGFzcyBWZWN0b3Ige1xuICAgIGNvbnN0cnVjdG9yKGFycmF5LCBzaXplKSB7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIE1hdHJpeCB7XG4gICAgY29uc3RydWN0b3IobWF0KSB7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIGFjdGl2YXRpb25NZXRob2RzIHtcbiAgICBzdGF0aWMgUmVMVSh4KSB7XG4gICAgICAgIHJldHVybiBNYXRoLm1heCh4LCAwKTtcbiAgICB9XG4gICAgc3RhdGljIHNpZ21vaWQoeCkge1xuICAgICAgICByZXR1cm4gMSAvICgxICsgTWF0aC5leHAoLXgpKTtcbiAgICB9XG4gICAgc3RhdGljIHRhbmgoeCkge1xuICAgICAgICBsZXQgdmFsID0gKE1hdGguZXhwKHgpIC0gTWF0aC5leHAoLXgpKSAvIChNYXRoLmV4cCh4KSArIE1hdGguZXhwKC14KSk7XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfVxufVxuO1xuZXhwb3J0IGNsYXNzIGRlcml2aXRlTWV0aG9kcyB7XG4gICAgc3RhdGljIFJlTFUodmFsdWUpIHtcbiAgICAgICAgbGV0IGRlciA9IHZhbHVlIDw9IDAgPyAwIDogMTtcbiAgICAgICAgcmV0dXJuIGRlcjtcbiAgICB9XG4gICAgc3RhdGljIHNpZ21vaWQodmFsdWUpIHtcbiAgICAgICAgbGV0IHNpZyA9IGFjdGl2YXRpb25NZXRob2RzLnNpZ21vaWQ7XG4gICAgICAgIHJldHVybiBzaWcodmFsdWUpICogKDEgLSBzaWcodmFsdWUpKTtcbiAgICB9XG4gICAgc3RhdGljIHRhbmgodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIDEgLSBNYXRoLnBvdyhhY3RpdmF0aW9uTWV0aG9kcy50YW5oKHZhbHVlKSwgMik7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGxvZ2lzdGljKHgsIG0sIGIsIGspIHtcbiAgICB2YXIgeSA9IDEgLyAobSArIE1hdGguZXhwKC1rICogKHggLSBiKSkpO1xuICAgIHJldHVybiB5O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGxvZ2l0KHgsIG0sIGIsIGspIHtcbiAgICB2YXIgeSA9IDEgLyBNYXRoLmxvZyh4IC8gKDEgLSB4KSk7XG4gICAgcmV0dXJuIHk7XG59XG5leHBvcnQgZnVuY3Rpb24gbGluZWFyKHgsIG0sIGIsIGspIHtcbiAgICB2YXIgeSA9IG0gKiB4ICsgYjtcbiAgICByZXR1cm4geTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBleHBvbmVudGlhbCh4LCBtLCBiLCBrKSB7XG4gICAgdmFyIHkgPSAxIC0gTWF0aC5wb3coeCwgaykgLyBNYXRoLnBvdygxLCBrKTtcbiAgICByZXR1cm4geTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hdGguanMubWFwIiwiZXhwb3J0IGNsYXNzIE5ldHdvcmsge1xuICAgIGNvbnN0cnVjdG9yKGRhdGEsIGxhYmVscywgaGlkZGVuTnVtLCBlbCwgYWN0aXZhdGlvblR5cGUgPSBcInRhbmhcIikge1xuICAgICAgICB0aGlzLmVsID0gZWw7XG4gICAgICAgIHRoaXMuaXRlciA9IDA7XG4gICAgICAgIHRoaXMuY29ycmVjdCA9IDA7XG4gICAgICAgIHRoaXMuaGlkZGVuTnVtID0gaGlkZGVuTnVtO1xuICAgICAgICB0aGlzLmxlYXJuUmF0ZSA9IDAuMDE7XG4gICAgICAgIHRoaXMuYWN0Rm4gPSBOZXR3b3JrLmFjdGl2YXRpb25NZXRob2RzW2FjdGl2YXRpb25UeXBlXTtcbiAgICAgICAgdGhpcy5kZXJGbiA9IE5ldHdvcmsuZGVyaXZpdGVNZXRob2RzW2FjdGl2YXRpb25UeXBlXTtcbiAgICAgICAgdGhpcy5pbml0KGRhdGEsIGxhYmVscyk7XG4gICAgfVxuICAgIGxlYXJuKGl0ZXJhdGlvbnMsIGRhdGEsIGxhYmVscywgcmVuZGVyID0gMTAwKSB7XG4gICAgICAgIHRoaXMuY29ycmVjdCA9IDA7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlcmF0aW9uczsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgcmFuZElkeCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGRhdGEubGVuZ3RoKTtcbiAgICAgICAgICAgIHRoaXMuaXRlcisrO1xuICAgICAgICAgICAgdGhpcy5mb3J3YXJkKGRhdGFbcmFuZElkeF0pO1xuICAgICAgICAgICAgbGV0IG1heCA9IC0xO1xuICAgICAgICAgICAgbGV0IG1heElkeCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMudmFsdWVzLmxlbmd0aCk7XG4gICAgICAgICAgICB0aGlzLnZhbHVlc1t0aGlzLnZhbHVlcy5sZW5ndGggLSAxXS5mb3JFYWNoKCh4LCBpZHgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoeCA+IG1heCkge1xuICAgICAgICAgICAgICAgICAgICBtYXhJZHggPSBpZHg7XG4gICAgICAgICAgICAgICAgICAgIG1heCA9IHg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsZXQgZ3Vlc3NlZCA9IHRoaXMudmFsdWVzW3RoaXMudmFsdWVzLmxlbmd0aCAtIDFdW21heElkeF0gPj0gMC41ID8gMSA6IDA7XG4gICAgICAgICAgICBpZiAoZ3Vlc3NlZCA9PT0gbGFiZWxzW3JhbmRJZHhdW21heElkeF0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvcnJlY3QrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYWNjdXJhY3kgPSB0aGlzLmNvcnJlY3QgLyAoaSArIDEpO1xuICAgICAgICAgICAgdGhpcy5iYWNrd2FyZChsYWJlbHNbcmFuZElkeF0pO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVXZWlnaHRzKCk7XG4gICAgICAgICAgICB0aGlzLnJlc2V0VG90YWxzKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2xhc3NpZnkoZGF0YSkge1xuICAgICAgICB0aGlzLnJlc2V0VG90YWxzKCk7XG4gICAgICAgIHRoaXMuZm9yd2FyZChkYXRhKTtcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVzW3RoaXMudmFsdWVzLmxlbmd0aCAtIDFdO1xuICAgIH1cbiAgICBpbml0KGRhdGEsIGxhYmVscykge1xuICAgICAgICBsZXQgaW5wdXRzID0gW107XG4gICAgICAgIHRoaXMuZGVyID0gW107XG4gICAgICAgIHRoaXMudmFsdWVzID0gW107XG4gICAgICAgIHRoaXMud2VpZ2h0cyA9IFtdO1xuICAgICAgICB0aGlzLndlaWdodENoYW5nZXMgPSBbXTtcbiAgICAgICAgdGhpcy50b3RhbHMgPSBbXTtcbiAgICAgICAgdGhpcy5kZXJUb3RhbHMgPSBbXTtcbiAgICAgICAgdGhpcy5iaWFzZXMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgbiA9IDA7IG4gPCBkYXRhWzBdLmxlbmd0aDsgbisrKSB7XG4gICAgICAgICAgICBpbnB1dHMucHVzaCgwKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCB0aGlzLmhpZGRlbk51bS5sZW5ndGg7IGNvbCsrKSB7XG4gICAgICAgICAgICB0aGlzLmRlcltjb2xdID0gW107XG4gICAgICAgICAgICB0aGlzLnZhbHVlc1tjb2xdID0gW107XG4gICAgICAgICAgICB0aGlzLnRvdGFsc1tjb2xdID0gW107XG4gICAgICAgICAgICB0aGlzLmRlclRvdGFsc1tjb2xdID0gW107XG4gICAgICAgICAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCB0aGlzLmhpZGRlbk51bVtjb2xdOyByb3crKykge1xuICAgICAgICAgICAgICAgIHRoaXMudmFsdWVzW2NvbF1bcm93XSA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5kZXJbY29sXVtyb3ddID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLnRvdGFsc1tjb2xdW3Jvd10gPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMuZGVyVG90YWxzW2NvbF1bcm93XSA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52YWx1ZXMudW5zaGlmdChpbnB1dHMpO1xuICAgICAgICB0aGlzLnRvdGFscy51bnNoaWZ0KGlucHV0cyk7XG4gICAgICAgIHRoaXMuZGVyLnVuc2hpZnQoaW5wdXRzKTtcbiAgICAgICAgdGhpcy5kZXJUb3RhbHMudW5zaGlmdChpbnB1dHMpO1xuICAgICAgICB0aGlzLnZhbHVlc1t0aGlzLmhpZGRlbk51bS5sZW5ndGggKyAxXSA9IGxhYmVsc1swXS5tYXAoKGwpID0+IHsgcmV0dXJuIDA7IH0pO1xuICAgICAgICB0aGlzLnRvdGFsc1t0aGlzLmhpZGRlbk51bS5sZW5ndGggKyAxXSA9IGxhYmVsc1swXS5tYXAoKGwpID0+IHsgcmV0dXJuIDA7IH0pO1xuICAgICAgICB0aGlzLmRlclt0aGlzLmhpZGRlbk51bS5sZW5ndGggKyAxXSA9IGxhYmVsc1swXS5tYXAoKGwpID0+IHsgcmV0dXJuIDA7IH0pO1xuICAgICAgICB0aGlzLmRlclRvdGFsc1t0aGlzLmhpZGRlbk51bS5sZW5ndGggKyAxXSA9IGxhYmVsc1swXS5tYXAoKGwpID0+IHsgcmV0dXJuIDA7IH0pO1xuICAgICAgICBmb3IgKGxldCB3ZyA9IDA7IHdnIDwgdGhpcy52YWx1ZXMubGVuZ3RoIC0gMTsgd2crKykge1xuICAgICAgICAgICAgdGhpcy53ZWlnaHRzW3dnXSA9IFtdO1xuICAgICAgICAgICAgdGhpcy53ZWlnaHRDaGFuZ2VzW3dnXSA9IFtdO1xuICAgICAgICAgICAgdGhpcy5iaWFzZXNbd2ddID0gW107XG4gICAgICAgICAgICBmb3IgKGxldCBzcmMgPSAwOyBzcmMgPCB0aGlzLnZhbHVlc1t3Z10ubGVuZ3RoOyBzcmMrKykge1xuICAgICAgICAgICAgICAgIHRoaXMud2VpZ2h0c1t3Z11bc3JjXSA9IFtdO1xuICAgICAgICAgICAgICAgIHRoaXMud2VpZ2h0Q2hhbmdlc1t3Z11bc3JjXSA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGRzdCA9IDA7IGRzdCA8IHRoaXMudmFsdWVzW3dnICsgMV0ubGVuZ3RoOyBkc3QrKykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmJpYXNlc1t3Z11bZHN0XSA9IE1hdGgucmFuZG9tKCkgLSAwLjU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2VpZ2h0c1t3Z11bc3JjXVtkc3RdID0gTWF0aC5yYW5kb20oKSAtIDAuNTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53ZWlnaHRDaGFuZ2VzW3dnXVtzcmNdW2RzdF0gPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXNldFRvdGFscygpIHtcbiAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgdGhpcy50b3RhbHMubGVuZ3RoOyBjb2wrKykge1xuICAgICAgICAgICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgdGhpcy50b3RhbHNbY29sXS5sZW5ndGg7IHJvdysrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50b3RhbHNbY29sXVtyb3ddID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLmRlclRvdGFsc1tjb2xdW3Jvd10gPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZvcndhcmQoaW5wdXQpIHtcbiAgICAgICAgdGhpcy52YWx1ZXNbMF0gPSBpbnB1dDtcbiAgICAgICAgZm9yIChsZXQgd2cgPSAwOyB3ZyA8IHRoaXMud2VpZ2h0cy5sZW5ndGg7IHdnKyspIHtcbiAgICAgICAgICAgIGxldCBzcmNWYWxzID0gd2c7XG4gICAgICAgICAgICBsZXQgZHN0VmFscyA9IHdnICsgMTtcbiAgICAgICAgICAgIGZvciAobGV0IHNyYyA9IDA7IHNyYyA8IHRoaXMud2VpZ2h0c1t3Z10ubGVuZ3RoOyBzcmMrKykge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGRzdCA9IDA7IGRzdCA8IHRoaXMud2VpZ2h0c1t3Z11bc3JjXS5sZW5ndGg7IGRzdCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG90YWxzW2RzdFZhbHNdW2RzdF0gKz0gdGhpcy52YWx1ZXNbc3JjVmFsc11bc3JjXSAqIHRoaXMud2VpZ2h0c1t3Z11bc3JjXVtkc3RdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudmFsdWVzW2RzdFZhbHNdID0gdGhpcy50b3RhbHNbZHN0VmFsc10ubWFwKCh0b3RhbCwgaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWN0Rm4odG90YWwgKyB0aGlzLmJpYXNlc1t3Z11baWR4XSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBiYWNrd2FyZChsYWJlbHMpIHtcbiAgICAgICAgZm9yIChsZXQgd2cgPSB0aGlzLndlaWdodHMubGVuZ3RoIC0gMTsgd2cgPj0gMDsgd2ctLSkge1xuICAgICAgICAgICAgbGV0IHNyY1ZhbHMgPSB3ZztcbiAgICAgICAgICAgIGxldCBkc3RWYWxzID0gd2cgKyAxO1xuICAgICAgICAgICAgZm9yIChsZXQgc3JjID0gMDsgc3JjIDwgdGhpcy53ZWlnaHRzW3dnXS5sZW5ndGg7IHNyYysrKSB7XG4gICAgICAgICAgICAgICAgbGV0IGVyciA9IDA7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZHN0ID0gMDsgZHN0IDwgdGhpcy53ZWlnaHRzW3dnXVtzcmNdLmxlbmd0aDsgZHN0KyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdnID09PSB0aGlzLndlaWdodHMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyICs9IGxhYmVsc1tkc3RdIC0gdGhpcy52YWx1ZXNbZHN0VmFsc11bZHN0XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVyW2RzdFZhbHNdW2RzdF0gPSBlcnI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnIgKz0gdGhpcy5kZXJbZHN0VmFsc11bZHN0XSAqIHRoaXMud2VpZ2h0c1t3Z11bc3JjXVtkc3RdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuZGVyVG90YWxzW3NyY1ZhbHNdW3NyY10gPSBlcnI7XG4gICAgICAgICAgICAgICAgdGhpcy5kZXJbc3JjVmFsc11bc3JjXSA9IGVyciAqIHRoaXMuZGVyRm4odGhpcy52YWx1ZXNbc3JjVmFsc11bc3JjXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgdXBkYXRlV2VpZ2h0cygpIHtcbiAgICAgICAgZm9yIChsZXQgd2cgPSAwOyB3ZyA8IHRoaXMud2VpZ2h0cy5sZW5ndGg7IHdnKyspIHtcbiAgICAgICAgICAgIGxldCBzcmNWYWxzID0gd2c7XG4gICAgICAgICAgICBsZXQgZHN0VmFscyA9IHdnICsgMTtcbiAgICAgICAgICAgIGZvciAobGV0IHNyYyA9IDA7IHNyYyA8IHRoaXMud2VpZ2h0c1t3Z10ubGVuZ3RoOyBzcmMrKykge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGRzdCA9IDA7IGRzdCA8IHRoaXMud2VpZ2h0c1t3Z11bc3JjXS5sZW5ndGg7IGRzdCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBtb21lbnR1bSA9IHRoaXMud2VpZ2h0Q2hhbmdlc1t3Z11bc3JjXVtkc3RdICogMC4xO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLndlaWdodENoYW5nZXNbd2ddW3NyY11bZHN0XSA9ICh0aGlzLnZhbHVlc1tzcmNWYWxzXVtzcmNdICogdGhpcy5kZXJbZHN0VmFsc11bZHN0XSAqIHRoaXMubGVhcm5SYXRlKSArIG1vbWVudHVtO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLndlaWdodHNbd2ddW3NyY11bZHN0XSArPSB0aGlzLndlaWdodENoYW5nZXNbd2ddW3NyY11bZHN0XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmJpYXNlc1t3Z10gPSB0aGlzLmJpYXNlc1t3Z10ubWFwKChiaWFzLCBpZHgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sZWFyblJhdGUgKiB0aGlzLmRlcltkc3RWYWxzXVtpZHhdICsgYmlhcztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIG1zZSgpIHtcbiAgICAgICAgbGV0IGVyciA9IDA7XG4gICAgICAgIGxldCBjb3VudCA9IDA7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5kZXJUb3RhbHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGVyciArPSB0aGlzLmRlclRvdGFsc1tqXS5yZWR1Y2UoKGxhc3QsIGN1cnJlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgICAgIHJldHVybiBsYXN0ICsgTWF0aC5wb3coY3VycmVudCwgMik7XG4gICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZXJyIC8gY291bnQ7XG4gICAgfVxufVxuTmV0d29yay5hY3RpdmF0aW9uTWV0aG9kcyA9IHtcbiAgICBSZUxVOiBmdW5jdGlvbiAoeCkge1xuICAgICAgICByZXR1cm4gTWF0aC5tYXgoeCwgMCk7XG4gICAgfSxcbiAgICBzaWdtb2lkOiBmdW5jdGlvbiAoeCkge1xuICAgICAgICByZXR1cm4gMSAvICgxICsgTWF0aC5leHAoLXgpKTtcbiAgICB9LFxuICAgIHRhbmg6IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIGxldCB2YWwgPSAoTWF0aC5leHAoeCkgLSBNYXRoLmV4cCgteCkpIC8gKE1hdGguZXhwKHgpICsgTWF0aC5leHAoLXgpKTtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG59O1xuTmV0d29yay5kZXJpdml0ZU1ldGhvZHMgPSB7XG4gICAgUmVMVTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGxldCBkZXIgPSB2YWx1ZSA8PSAwID8gMCA6IDE7XG4gICAgICAgIHJldHVybiBkZXI7XG4gICAgfSxcbiAgICBzaWdtb2lkOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgbGV0IHNpZyA9IE5ldHdvcmsuYWN0aXZhdGlvbk1ldGhvZHMuc2lnbW9pZDtcbiAgICAgICAgcmV0dXJuIHNpZyh2YWx1ZSkgKiAoMSAtIHNpZyh2YWx1ZSkpO1xuICAgIH0sXG4gICAgdGFuaDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiAxIC0gTWF0aC5wb3coTmV0d29yay5hY3RpdmF0aW9uTWV0aG9kcy50YW5oKHZhbHVlKSwgMik7XG4gICAgfVxufTtcbk5ldHdvcmsuY29zdE1ldGhvZHMgPSB7XG4gICAgc3FFcnI6IGZ1bmN0aW9uICh0YXJnZXQsIGd1ZXNzKSB7XG4gICAgICAgIHJldHVybiBndWVzcyAtIHRhcmdldDtcbiAgICB9LFxuICAgIGFic0VycjogZnVuY3Rpb24gKCkge1xuICAgIH1cbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1uZXR3b3JrLmpzLm1hcCIsImV4cG9ydCBjbGFzcyBRTGVhcm5lciB7XG4gICAgLy9UT0RPIC0gY2hhbmdlIGVwaXNvZGUgdG8gdXBkYXRlXG4gICAgY29uc3RydWN0b3IoUiwgZ2FtbWEsIGdvYWwpIHtcbiAgICAgICAgdGhpcy5yYXdNYXggPSAxO1xuICAgICAgICB0aGlzLlIgPSBSO1xuICAgICAgICB0aGlzLmdhbW1hID0gZ2FtbWE7XG4gICAgICAgIHRoaXMuZ29hbCA9IGdvYWw7XG4gICAgICAgIHRoaXMuUSA9IHt9O1xuICAgICAgICBmb3IgKHZhciBzdGF0ZSBpbiBSKSB7XG4gICAgICAgICAgICB0aGlzLlFbc3RhdGVdID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBhY3Rpb24gaW4gUltzdGF0ZV0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLlFbc3RhdGVdW2FjdGlvbl0gPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ2FtbWEgPSBnYW1tYTtcbiAgICB9XG4gICAgZ3JvdyhzdGF0ZSwgYWN0aW9ucykge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFjdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIC8vcmV3YXJkIGlzIGN1cnJlbnRseSB1bmtub3duXG4gICAgICAgICAgICB0aGlzLlJbc3RhdGVdW2FjdGlvbnNbaV1dID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBleHBsb3JlKHByb20pIHtcbiAgICB9XG4gICAgdHJhbnNpdGlvbihzdGF0ZSwgYWN0aW9uKSB7XG4gICAgICAgIC8vaXMgdGhlIHN0YXRlIHVuZXhhbWluZWRcbiAgICAgICAgbGV0IGV4YW1pbmVkID0gdHJ1ZTtcbiAgICAgICAgbGV0IGJlc3RBY3Rpb247XG4gICAgICAgIGZvciAoYWN0aW9uIGluIHRoaXMuUltzdGF0ZV0pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLlJbc3RhdGVdW2FjdGlvbl0gPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBiZXN0QWN0aW9uID0gYWN0aW9uO1xuICAgICAgICAgICAgICAgIGV4YW1pbmVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYmVzdEFjdGlvbiA9IHRoaXMubWF4KGFjdGlvbik7XG4gICAgICAgIHRoaXMuUVtzdGF0ZV1bYWN0aW9uXSA9IHRoaXMuUltzdGF0ZV1bYWN0aW9uXSArICh0aGlzLmdhbW1hICogdGhpcy5RW2FjdGlvbl1bYmVzdEFjdGlvbl0pO1xuICAgIH1cbiAgICBtYXgoc3RhdGUpIHtcbiAgICAgICAgdmFyIG1heCA9IDAsIG1heEFjdGlvbiA9IG51bGw7XG4gICAgICAgIGZvciAodmFyIGFjdGlvbiBpbiB0aGlzLlFbc3RhdGVdKSB7XG4gICAgICAgICAgICBpZiAoIW1heEFjdGlvbikge1xuICAgICAgICAgICAgICAgIG1heCA9IHRoaXMuUVtzdGF0ZV1bYWN0aW9uXTtcbiAgICAgICAgICAgICAgICBtYXhBY3Rpb24gPSBhY3Rpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLlFbc3RhdGVdW2FjdGlvbl0gPT09IG1heCAmJiAoTWF0aC5yYW5kb20oKSA+IDAuNSkpIHtcbiAgICAgICAgICAgICAgICBtYXggPSB0aGlzLlFbc3RhdGVdW2FjdGlvbl07XG4gICAgICAgICAgICAgICAgbWF4QWN0aW9uID0gYWN0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5RW3N0YXRlXVthY3Rpb25dID4gbWF4KSB7XG4gICAgICAgICAgICAgICAgbWF4ID0gdGhpcy5RW3N0YXRlXVthY3Rpb25dO1xuICAgICAgICAgICAgICAgIG1heEFjdGlvbiA9IGFjdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWF4QWN0aW9uO1xuICAgIH1cbiAgICBwb3NzaWJsZShzdGF0ZSkge1xuICAgICAgICB2YXIgcG9zc2libGUgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgYWN0aW9uIGluIHRoaXMuUltzdGF0ZV0pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLlJbc3RhdGVdW2FjdGlvbl0gPiAtMSkge1xuICAgICAgICAgICAgICAgIHBvc3NpYmxlLnB1c2goYWN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcG9zc2libGVbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcG9zc2libGUubGVuZ3RoKV07XG4gICAgfVxuICAgIGVwaXNvZGUoc3RhdGUpIHtcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uKHN0YXRlLCB0aGlzLnBvc3NpYmxlKHN0YXRlKSk7XG4gICAgICAgIHJldHVybiB0aGlzLlE7XG4gICAgfVxuICAgIG5vcm1hbGl6ZSgpIHtcbiAgICAgICAgZm9yICh2YXIgc3RhdGUgaW4gdGhpcy5RKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBhY3Rpb24gaW4gdGhpcy5RW3N0YXRlXSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLlFbYWN0aW9uXVtzdGF0ZV0gPj0gdGhpcy5yYXdNYXgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yYXdNYXggPSB0aGlzLlFbYWN0aW9uXVtzdGF0ZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIHN0YXRlIGluIHRoaXMuUSkge1xuICAgICAgICAgICAgZm9yICh2YXIgYWN0aW9uIGluIHRoaXMuUVtzdGF0ZV0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLlFbYWN0aW9uXVtzdGF0ZV0gPSBNYXRoLnJvdW5kKHRoaXMuUVthY3Rpb25dW3N0YXRlXSAvIHRoaXMucmF3TWF4ICogMTAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVFMZWFybmVyLmpzLm1hcCIsImltcG9ydCB7IHN0YW5kYXJkaXplZCwgZGF0YVRvTWF0cml4IH0gZnJvbSAnLi91dGlscyc7XG5leHBvcnQgZnVuY3Rpb24gb2xzKGl2cywgZHYpIHtcbiAgICBsZXQgZGF0YSA9IGRhdGFUb01hdHJpeChpdnMsIHRoaXMuc3RhbmRhcmRpemVkKTtcbiAgICBsZXQgZHZEYXRhID0gZHYuZGF0YTtcbiAgICBsZXQgbiA9IGR2RGF0YS5sZW5ndGg7XG4gICAgbGV0IG1lYW5zID0gaXZzLm1hcCgoYSkgPT4geyByZXR1cm4gYS5tZWFuOyB9KTtcbiAgICBsZXQgc2RzID0gaXZzLm1hcCgoYSkgPT4geyByZXR1cm4gYS5zZDsgfSk7XG4gICAgbGV0IHZhcnMgPSBpdnMubWFwKChhKSA9PiB7IHJldHVybiBbYS52YXJpYW5jZV07IH0pO1xuICAgIG1lYW5zLnVuc2hpZnQoMSk7XG4gICAgc2RzLnVuc2hpZnQoMSk7XG4gICAgdmFycy51bnNoaWZ0KFsxXSk7XG4gICAgaWYgKHRoaXMuc3RhbmRhcmRpemVkKSB7XG4gICAgICAgIGR2RGF0YSA9IHN0YW5kYXJkaXplZChkdi5kYXRhKTtcbiAgICB9XG4gICAgbGV0IFggPSBkYXRhO1xuICAgIGxldCBZID0gZHZEYXRhLm1hcCgoeSkgPT4geyByZXR1cm4gW3ldOyB9KTtcbiAgICBsZXQgWHByaW1lID0galN0YXQudHJhbnNwb3NlKFgpO1xuICAgIGxldCBYcHJpbWVYID0galN0YXQubXVsdGlwbHkoWHByaW1lLCBYKTtcbiAgICBsZXQgWHByaW1lWSA9IGpTdGF0Lm11bHRpcGx5KFhwcmltZSwgWSk7XG4gICAgLy9jb2VmZmljaWVudHNcbiAgICBsZXQgYiA9IGpTdGF0Lm11bHRpcGx5KGpTdGF0LmludihYcHJpbWVYKSwgWHByaW1lWSk7XG4gICAgdGhpcy5iZXRhcyA9IGIucmVkdWNlKChhLCBiKSA9PiB7IHJldHVybiBhLmNvbmNhdChiKTsgfSk7XG4gICAgLy9zdGFuZGFyZCBlcnJvciBvZiB0aGUgY29lZmZpY2llbnRzXG4gICAgdGhpcy5zdEVyckNvZWZmID0galN0YXQubXVsdGlwbHkoalN0YXQuaW52KFhwcmltZVgpLCB2YXJzKVxuICAgICAgICAucmVkdWNlKChhLCBiKSA9PiB7IHJldHVybiBhLmNvbmNhdChiKTsgfSk7XG4gICAgLy90IHN0YXRpc3RpY3NcbiAgICB0aGlzLnRTdGF0cyA9IHRoaXMuc3RFcnJDb2VmZi5tYXAoKHNlLCBpKSA9PiB7IHJldHVybiB0aGlzLmJldGFzW2ldIC8gc2U7IH0pO1xuICAgIC8vcCB2YWx1ZXNcbiAgICB0aGlzLnBWYWx1ZXMgPSB0aGlzLnRTdGF0cy5tYXAoKHQsIGkpID0+IHsgcmV0dXJuIGpTdGF0LnR0ZXN0KHQsIG1lYW5zW2ldLCBzZHNbaV0sIG4pOyB9KTtcbiAgICAvL3Jlc2lkdWFsc1xuICAgIGxldCB5aGF0ID0gW107XG4gICAgbGV0IHJlcyA9IGR2LmRhdGEubWFwKChkLCBpKSA9PiB7XG4gICAgICAgIGRhdGFbaV0uc2hpZnQoKTtcbiAgICAgICAgbGV0IHJvdyA9IGRhdGFbaV07XG4gICAgICAgIHloYXRbaV0gPSB0aGlzLnByZWRpY3Qocm93KTtcbiAgICAgICAgcmV0dXJuIGQgLSB5aGF0W2ldO1xuICAgIH0pO1xuICAgIGxldCByZXNpZHVhbCA9IHloYXQ7XG4gICAgcmV0dXJuIHRoaXMuYmV0YXM7XG59XG5leHBvcnQgZnVuY3Rpb24gcGxzKHgsIHkpIHtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlZ3Jlc3Npb24uanMubWFwIiwiaW1wb3J0IHsgUUNvbXBvbmVudCB9IGZyb20gJy4vUUNvbXBvbmVudCc7XG4vKlxuKiBVdGlsaXR5IFN5c3RlbXMgY2xhc3NcbiovXG5leHBvcnQgY2xhc3MgVVN5cyBleHRlbmRzIFFDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIG9wdGlvbnMsIGRhdGEpIHtcbiAgICAgICAgc3VwZXIobmFtZSk7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgIHRoaXMucmVzdWx0cyA9IFtdO1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgIH1cbiAgICB1cGRhdGUoYWdlbnQsIHN0ZXApIHtcbiAgICAgICAgdmFyIHRtcCA9IFtdLCBtYXggPSAwLCBhdmcsIHRvcDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm9wdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRtcFtpXSA9IDA7XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMub3B0aW9uc1tpXS5jb25zaWRlcmF0aW9ucy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGxldCBjID0gdGhpcy5vcHRpb25zW2ldLmNvbnNpZGVyYXRpb25zW2pdO1xuICAgICAgICAgICAgICAgIGxldCB4ID0gYy54KGFnZW50LCB0aGlzLm9wdGlvbnNbaV0ucGFyYW1zKTtcbiAgICAgICAgICAgICAgICB0bXBbaV0gKz0gYy5mKHgsIGMubSwgYy5iLCBjLmspO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXZnID0gdG1wW2ldIC8gdGhpcy5vcHRpb25zW2ldLmNvbnNpZGVyYXRpb25zLmxlbmd0aDtcbiAgICAgICAgICAgIHRoaXMucmVzdWx0cy5wdXNoKHsgcG9pbnQ6IGFnZW50LmlkLCBvcHQ6IHRoaXMub3B0aW9uc1tpXS5uYW1lLCByZXN1bHQ6IGF2ZyB9KTtcbiAgICAgICAgICAgIGlmIChhdmcgPiBtYXgpIHtcbiAgICAgICAgICAgICAgICBhZ2VudC50b3AgPSB7IG5hbWU6IHRoaXMub3B0aW9uc1tpXS5uYW1lLCB1dGlsOiBhdmcgfTtcbiAgICAgICAgICAgICAgICB0b3AgPSBpO1xuICAgICAgICAgICAgICAgIG1heCA9IGF2ZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9wdGlvbnNbdG9wXS5hY3Rpb24oc3RlcCwgYWdlbnQpO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVVTeXMuanMubWFwIiwiY2xhc3MgUmFuZG9tIHtcbiAgICBjb25zdHJ1Y3RvcihzZWVkKSB7XG4gICAgICAgIHRoaXMuc2VlZCA9IHNlZWQ7XG4gICAgICAgIHRoaXMuY2FsbGVkID0gMDtcbiAgICB9XG4gICAgcmFuZFJhbmdlKG1pbiwgbWF4KSB7XG4gICAgICAgIHJldHVybiAobWF4IC0gbWluKSAqIHRoaXMucmFuZG9tKCkgKyBtaW47XG4gICAgfVxuICAgIG1hdChyb3dzLCBjb2xzLCBkaXN0ID0gJ3JhbmRvbScpIHtcbiAgICAgICAgbGV0IHJhbmRzID0gW107XG4gICAgICAgIGlmICh0eXBlb2Ygcm93cyA9PSAnbnVtYmVyJyAmJiB0eXBlb2YgY29scyA9PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgZm9yIChsZXQgciA9IDA7IHIgPCByb3dzOyByKyspIHtcbiAgICAgICAgICAgICAgICByYW5kc1tyXSA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgY29sczsgYysrKSB7XG4gICAgICAgICAgICAgICAgICAgIHJhbmRzW3JdW2NdID0gdGhpc1tkaXN0XSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmFuZHM7XG4gICAgfVxuICAgIGFycmF5KG4sIGRpc3QgPSAncmFuZG9tJykge1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGxldCByYW5kcyA9IFtdO1xuICAgICAgICB3aGlsZSAoaSA8IG4pIHtcbiAgICAgICAgICAgIHJhbmRzW2ldID0gdGhpc1tkaXN0XSgpO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByYW5kcztcbiAgICB9XG4gICAgcGljayhhcnJheSkge1xuICAgICAgICByZXR1cm4gYXJyYXlbTWF0aC5mbG9vcih0aGlzLnJhbmRvbSgpICogYXJyYXkubGVuZ3RoKV07XG4gICAgfVxuICAgIC8qKlxuICAgICpCZWxvdyBpcyBhZGFwdGVkIGZyb20galN0YXQ6aHR0cHM6Ly9naXRodWIuY29tL2pzdGF0L2pzdGF0L2Jsb2IvbWFzdGVyL3NyYy9zcGVjaWFsLmpzXG4gICAgKiovXG4gICAgcmFuZG4oKSB7XG4gICAgICAgIHZhciB1LCB2LCB4LCB5LCBxO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICB1ID0gdGhpcy5yYW5kb20oKTtcbiAgICAgICAgICAgIHYgPSAxLjcxNTYgKiAodGhpcy5yYW5kb20oKSAtIDAuNSk7XG4gICAgICAgICAgICB4ID0gdSAtIDAuNDQ5ODcxO1xuICAgICAgICAgICAgeSA9IE1hdGguYWJzKHYpICsgMC4zODY1OTU7XG4gICAgICAgICAgICBxID0geCAqIHggKyB5ICogKDAuMTk2MDAgKiB5IC0gMC4yNTQ3MiAqIHgpO1xuICAgICAgICB9IHdoaWxlIChxID4gMC4yNzU5NyAmJiAocSA+IDAuMjc4NDYgfHwgdiAqIHYgPiAtNCAqIE1hdGgubG9nKHUpICogdSAqIHUpKTtcbiAgICAgICAgcmV0dXJuIHYgLyB1O1xuICAgIH1cbiAgICByYW5kZyhzaGFwZSkge1xuICAgICAgICB2YXIgb2FscGggPSBzaGFwZTtcbiAgICAgICAgdmFyIGExLCBhMiwgdSwgdiwgeDtcbiAgICAgICAgaWYgKCFzaGFwZSlcbiAgICAgICAgICAgIHNoYXBlID0gMTtcbiAgICAgICAgaWYgKHNoYXBlIDwgMSlcbiAgICAgICAgICAgIHNoYXBlICs9IDE7XG4gICAgICAgIGExID0gc2hhcGUgLSAxIC8gMztcbiAgICAgICAgYTIgPSAxIC8gTWF0aC5zcXJ0KDkgKiBhMSk7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICB4ID0gdGhpcy5yYW5kbigpO1xuICAgICAgICAgICAgICAgIHYgPSAxICsgYTIgKiB4O1xuICAgICAgICAgICAgfSB3aGlsZSAodiA8PSAwKTtcbiAgICAgICAgICAgIHYgPSB2ICogdiAqIHY7XG4gICAgICAgICAgICB1ID0gdGhpcy5yYW5kb20oKTtcbiAgICAgICAgfSB3aGlsZSAodSA+IDEgLSAwLjMzMSAqIE1hdGgucG93KHgsIDQpICYmXG4gICAgICAgICAgICBNYXRoLmxvZyh1KSA+IDAuNSAqIHggKiB4ICsgYTEgKiAoMSAtIHYgKyBNYXRoLmxvZyh2KSkpO1xuICAgICAgICAvLyBhbHBoYSA+IDFcbiAgICAgICAgaWYgKHNoYXBlID09IG9hbHBoKVxuICAgICAgICAgICAgcmV0dXJuIGExICogdjtcbiAgICAgICAgLy8gYWxwaGEgPCAxXG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIHUgPSB0aGlzLnJhbmRvbSgpO1xuICAgICAgICB9IHdoaWxlICh1ID09PSAwKTtcbiAgICAgICAgcmV0dXJuIE1hdGgucG93KHUsIDEgLyBvYWxwaCkgKiBhMSAqIHY7XG4gICAgfVxuICAgIGJldGEoYWxwaGEsIGJldGEpIHtcbiAgICAgICAgdmFyIHUgPSB0aGlzLnJhbmRnKGFscGhhKTtcbiAgICAgICAgcmV0dXJuIHUgLyAodSArIHRoaXMucmFuZGcoYmV0YSkpO1xuICAgIH1cbiAgICBnYW1tYShzaGFwZSwgc2NhbGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmFuZGcoc2hhcGUpICogc2NhbGU7XG4gICAgfVxuICAgIGxvZ05vcm1hbChtdSwgc2lnbWEpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguZXhwKHRoaXMucmFuZG4oKSAqIHNpZ21hICsgbXUpO1xuICAgIH1cbiAgICBub3JtYWwobWVhbiA9IDAsIHN0ZCA9IDEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmFuZG4oKSAqIHN0ZCArIG1lYW47XG4gICAgfVxuICAgIHBvaXNzb24obCkge1xuICAgICAgICB2YXIgcCA9IDEsIGsgPSAwLCBMID0gTWF0aC5leHAoLWwpO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICBrKys7XG4gICAgICAgICAgICBwICo9IHRoaXMucmFuZG9tKCk7XG4gICAgICAgIH0gd2hpbGUgKHAgPiBMKTtcbiAgICAgICAgcmV0dXJuIGsgLSAxO1xuICAgIH1cbiAgICB0KGRvZikge1xuICAgICAgICByZXR1cm4gdGhpcy5yYW5kbigpICogTWF0aC5zcXJ0KGRvZiAvICgyICogdGhpcy5yYW5kZyhkb2YgLyAyKSkpO1xuICAgIH1cbiAgICB3ZWlidWxsKHNjYWxlLCBzaGFwZSkge1xuICAgICAgICByZXR1cm4gc2NhbGUgKiBNYXRoLnBvdygtTWF0aC5sb2codGhpcy5yYW5kb20oKSksIDEgLyBzaGFwZSk7XG4gICAgfVxufVxuLyoqXG4qIEJvYiBKZW5raW5zJyBzbWFsbCBub25jcnlwdG9ncmFwaGljIFBSTkcgKHBzZXVkb3JhbmRvbSBudW1iZXIgZ2VuZXJhdG9yKSBwb3J0ZWQgdG8gSmF2YVNjcmlwdFxuKiBhZGFwdGVkIGZyb206XG4qIGh0dHBzOi8vZ2l0aHViLmNvbS9ncmF1ZS9idXJ0bGVwcm5nXG4qIHdoaWNoIGlzIGZyb20gaHR0cDovL3d3dy5idXJ0bGVidXJ0bGUubmV0L2JvYi9yYW5kL3NtYWxscHJuZy5odG1sXG4qL1xuZXhwb3J0IGNsYXNzIFJOR0J1cnRsZSBleHRlbmRzIFJhbmRvbSB7XG4gICAgY29uc3RydWN0b3Ioc2VlZCkge1xuICAgICAgICBzdXBlcihzZWVkKTtcbiAgICAgICAgdGhpcy5zZWVkID4+Pj0gMDtcbiAgICAgICAgdGhpcy5jdHggPSBuZXcgQXJyYXkoNCk7XG4gICAgICAgIHRoaXMuY3R4WzBdID0gMHhmMWVhNWVlZDtcbiAgICAgICAgdGhpcy5jdHhbMV0gPSB0aGlzLmN0eFsyXSA9IHRoaXMuY3R4WzNdID0gdGhpcy5zZWVkO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDIwOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMucmFuZG9tKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcm90KHgsIGspIHtcbiAgICAgICAgcmV0dXJuICh4IDw8IGspIHwgKHggPj4gKDMyIC0gaykpO1xuICAgIH1cbiAgICByYW5kb20oKSB7XG4gICAgICAgIHZhciBjdHggPSB0aGlzLmN0eDtcbiAgICAgICAgdmFyIGUgPSAoY3R4WzBdIC0gdGhpcy5yb3QoY3R4WzFdLCAyNykpID4+PiAwO1xuICAgICAgICBjdHhbMF0gPSAoY3R4WzFdIF4gdGhpcy5yb3QoY3R4WzJdLCAxNykpID4+PiAwO1xuICAgICAgICBjdHhbMV0gPSAoY3R4WzJdICsgY3R4WzNdKSA+Pj4gMDtcbiAgICAgICAgY3R4WzJdID0gKGN0eFszXSArIGUpID4+PiAwO1xuICAgICAgICBjdHhbM10gPSAoZSArIGN0eFswXSkgPj4+IDA7XG4gICAgICAgIHRoaXMuY2FsbGVkICs9IDE7XG4gICAgICAgIHJldHVybiBjdHhbM10gLyA0Mjk0OTY3Mjk2LjA7XG4gICAgfVxufVxuLypcbiogeG9yc2hpZnQ3KiwgYnkgRnJhbsOnb2lzIFBhbm5ldG9uIGFuZCBQaWVycmUgTCdlY3V5ZXI6IDMyLWJpdCB4b3Itc2hpZnQgcmFuZG9tIG51bWJlciBnZW5lcmF0b3JcbiogYWRkcyByb2J1c3RuZXNzIGJ5IGFsbG93aW5nIG1vcmUgc2hpZnRzIHRoYW4gTWFyc2FnbGlhJ3Mgb3JpZ2luYWwgdGhyZWUuIEl0IGlzIGEgNy1zaGlmdCBnZW5lcmF0b3Igd2l0aCAyNTYgYml0cywgdGhhdCBwYXNzZXMgQmlnQ3J1c2ggd2l0aCBubyBzeXN0bWF0aWMgZmFpbHVyZXMuXG4qIEFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vZGF2aWRiYXUveHNyYW5kXG4qL1xuZXhwb3J0IGNsYXNzIFJOR3hvcnNoaWZ0NyBleHRlbmRzIFJhbmRvbSB7XG4gICAgY29uc3RydWN0b3Ioc2VlZCkge1xuICAgICAgICBsZXQgaiwgdywgWCA9IFtdO1xuICAgICAgICBzdXBlcihzZWVkKTtcbiAgICAgICAgLy8gU2VlZCBzdGF0ZSBhcnJheSB1c2luZyBhIDMyLWJpdCBpbnRlZ2VyLlxuICAgICAgICB3ID0gWFswXSA9IHRoaXMuc2VlZDtcbiAgICAgICAgLy8gRW5mb3JjZSBhbiBhcnJheSBsZW5ndGggb2YgOCwgbm90IGFsbCB6ZXJvZXMuXG4gICAgICAgIHdoaWxlIChYLmxlbmd0aCA8IDgpIHtcbiAgICAgICAgICAgIFgucHVzaCgwKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGogPSAwOyBqIDwgOCAmJiBYW2pdID09PSAwOyArK2opIHtcbiAgICAgICAgICAgIGlmIChqID09IDgpIHtcbiAgICAgICAgICAgICAgICB3ID0gWFs3XSA9IC0xO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdyA9IFhbal07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy54ID0gWDtcbiAgICAgICAgdGhpcy5pID0gMDtcbiAgICAgICAgLy8gRGlzY2FyZCBhbiBpbml0aWFsIDI1NiB2YWx1ZXMuXG4gICAgICAgIGZvciAoaiA9IDI1NjsgaiA+IDA7IC0taikge1xuICAgICAgICAgICAgdGhpcy5yYW5kb20oKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByYW5kb20oKSB7XG4gICAgICAgIGxldCBYID0gdGhpcy54LCBpID0gdGhpcy5pLCB0LCB2LCB3LCByZXM7XG4gICAgICAgIHQgPSBYW2ldO1xuICAgICAgICB0IF49ICh0ID4+PiA3KTtcbiAgICAgICAgdiA9IHQgXiAodCA8PCAyNCk7XG4gICAgICAgIHQgPSBYWyhpICsgMSkgJiA3XTtcbiAgICAgICAgdiBePSB0IF4gKHQgPj4+IDEwKTtcbiAgICAgICAgdCA9IFhbKGkgKyAzKSAmIDddO1xuICAgICAgICB2IF49IHQgXiAodCA+Pj4gMyk7XG4gICAgICAgIHQgPSBYWyhpICsgNCkgJiA3XTtcbiAgICAgICAgdiBePSB0IF4gKHQgPDwgNyk7XG4gICAgICAgIHQgPSBYWyhpICsgNykgJiA3XTtcbiAgICAgICAgdCA9IHQgXiAodCA8PCAxMyk7XG4gICAgICAgIHYgXj0gdCBeICh0IDw8IDkpO1xuICAgICAgICBYW2ldID0gdjtcbiAgICAgICAgdGhpcy5pID0gKGkgKyAxKSAmIDc7XG4gICAgICAgIHJlcyA9ICh2ID4+PiAwKSAvICgoMSA8PCAzMCkgKiA0KTtcbiAgICAgICAgdGhpcy5jYWxsZWQgKz0gMTtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yYW5kb20uanMubWFwIiwiZXhwb3J0ICogZnJvbSAnLi91dGlscyc7XG5leHBvcnQgeyBRQ29tcG9uZW50IH0gZnJvbSAnLi9RQ29tcG9uZW50JztcbmV4cG9ydCB7IEJESUFnZW50IH0gZnJvbSAnLi9iZGknO1xuZXhwb3J0ICogZnJvbSAnLi9iZWhhdmlvclRyZWUnO1xuZXhwb3J0ICogZnJvbSAnLi9jb21wYXJ0bWVudCc7XG5leHBvcnQgeyBDb250YWN0UGF0Y2ggfSBmcm9tICcuL2NvbnRhY3RQYXRjaCc7XG5leHBvcnQgeyBFbnZpcm9ubWVudCB9IGZyb20gJy4vZW52aXJvbm1lbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9lcGknO1xuZXhwb3J0ICogZnJvbSAnLi9ldmVudHMnO1xuZXhwb3J0IHsgRXhwZXJpbWVudCB9IGZyb20gJy4vZXhwZXJpbWVudCc7XG5leHBvcnQgKiBmcm9tICcuL2dlbmV0aWMnO1xuZXhwb3J0IHsgRXZvbHV0aW9uYXJ5IH0gZnJvbSAnLi9ldm9sdXRpb25hcnknO1xuZXhwb3J0IHsgSHlicmlkQXV0b21hdGEgfSBmcm9tICcuL2hhJztcbmV4cG9ydCAqIGZyb20gJy4vaHRuJztcbmV4cG9ydCAqIGZyb20gJy4vbWMnO1xuZXhwb3J0IHsga01lYW4gfSBmcm9tICcuL2ttZWFuJztcbmV4cG9ydCB7IEtOTiB9IGZyb20gJy4va25uJztcbmV4cG9ydCAqIGZyb20gJy4vbWF0aCc7XG5leHBvcnQgeyBOZXR3b3JrIH0gZnJvbSAnLi9uZXR3b3JrJztcbmV4cG9ydCB7IFFMZWFybmVyIH0gZnJvbSAnLi9RTGVhcm5lcic7XG5leHBvcnQgKiBmcm9tICcuL3JlZ3Jlc3Npb24nO1xuZXhwb3J0IHsgU3RhdGVNYWNoaW5lIH0gZnJvbSAnLi9zdGF0ZU1hY2hpbmUnO1xuZXhwb3J0ICogZnJvbSAnLi9VU3lzJztcbmV4cG9ydCAqIGZyb20gJy4vcmFuZG9tJztcbmV4cG9ydCB2YXIgdmVyc2lvbiA9ICcwLjAuNSc7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYWluLmpzLm1hcCIsIi8qKipcbipAbW9kdWxlIFFFcGlLaXRcbiovXG5pbXBvcnQgKiBhcyBxZXBpa2l0IGZyb20gJy4vbWFpbic7XG5sZXQgUUVwaUtpdCA9IHFlcGlraXQ7XG5mb3IgKGxldCBrZXkgaW4gUUVwaUtpdCkge1xuICAgIGlmIChrZXkgPT0gJ3ZlcnNpb24nKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFFFcGlLaXRba2V5XSk7XG4g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QixJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDVCxPQUFPLE9BQU8sQ0FBQztLQUNsQjtTQUNJO1FBQ0QsT0FBTyxNQUFNLENBQUM7S0FDakI7Q0FDSjtBQUNELEFBQU8sU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtJQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDUCxPQUFPLE9BQU8sQ0FBQztLQUNsQjtTQUNJO1FBQ0QsT0FBTyxNQUFNLENBQUM7S0FDakI7Q0FDSjtBQUNELEFBQU8sU0FBUyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtJQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDUixPQUFPLE9BQU8sQ0FBQztLQUNsQjtTQUNJO1FBQ0QsT0FBTyxNQUFNLENBQUM7S0FDakI7Q0FDSjtBQUNELEFBQU8sU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtJQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDUCxPQUFPLE9BQU8sQ0FBQztLQUNsQjtTQUNJO1FBQ0QsT0FBTyxNQUFNLENBQUM7S0FDakI7Q0FDSjtBQUNELEFBQU8sU0FBUyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtJQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDUixPQUFPLE9BQU8sQ0FBQztLQUNsQjtTQUNJO1FBQ0QsT0FBTyxNQUFNLENBQUM7S0FDakI7Q0FDSjtBQUNELEFBQU8sU0FBUyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtJQUMxQixDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQztJQUNmLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNULE9BQU8sT0FBTyxDQUFDO0tBQ2xCO1NBQ0k7UUFDRCxPQUFPLE1BQU0sQ0FBQztLQUNqQjtDQUNKO0FBQ0QsQUFBTyxTQUFTLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0lBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQ3hCLE9BQU8sT0FBTyxDQUFDO0tBQ2xCO1NBQ0k7UUFDRCxPQUFPLE1BQU0sQ0FBQztLQUNqQjtDQUNKO0FBQ0QsQUFBTyxTQUFTLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0lBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQ3hCLE9BQU8sTUFBTSxDQUFDO0tBQ2pCO1NBQ0k7UUFDRCxPQUFPLE9BQU8sQ0FBQztLQUNsQjtDQUNKO0FBQ0QsQUFBTyxTQUFTLGdCQUFnQixDQUFDLEtBQUssRUFBRTtJQUNwQyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7SUFDbEIsUUFBUSxLQUFLO1FBQ1QsS0FBSyxPQUFPO1lBQ1IsTUFBTSxHQUFHLFVBQVUsQ0FBQztZQUNwQixNQUFNO1FBQ1YsS0FBSyxVQUFVO1lBQ1gsTUFBTSxHQUFHLGNBQWMsQ0FBQztZQUN4QixNQUFNO1FBQ1YsS0FBSyxFQUFFO1lBQ0gsTUFBTSxHQUFHLGNBQWMsQ0FBQztZQUN4QixNQUFNO1FBQ1YsS0FBSyxJQUFJO1lBQ0wsTUFBTSxHQUFHLDBCQUEwQixDQUFDO1lBQ3BDLE1BQU07UUFDVixLQUFLLEVBQUU7WUFDSCxNQUFNLEdBQUcsV0FBVyxDQUFDO1lBQ3JCLE1BQU07UUFDVixLQUFLLElBQUk7WUFDTCxNQUFNLEdBQUcsdUJBQXVCLENBQUM7WUFDakMsTUFBTTtRQUNWLEtBQUssT0FBTztZQUNSLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQztZQUM1QixNQUFNO1FBQ1Y7WUFDSSxJQUFJO2dCQUNBLE1BQU0sR0FBRyx1QkFBdUIsQ0FBQzthQUNwQztZQUNELE9BQU8sQ0FBQyxFQUFFO2dCQUNOLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDbEI7WUFDRCxNQUFNO0tBQ2I7SUFDRCxPQUFPLE1BQU0sQ0FBQztDQUNqQjtBQUNELEFBQU8sU0FBUyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRTtJQUNqQyxLQUFLLElBQUksS0FBSyxJQUFJLE1BQU0sRUFBRTtRQUN0QixJQUFJLFFBQVEsSUFBSSxDQUFDLEtBQUssV0FBVyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDN0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUM7U0FDckU7YUFDSSxJQUFJLFFBQVEsSUFBSSxDQUFDLEtBQUssV0FBVyxFQUFFO1lBQ3BDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDO1NBQ3JFO0tBQ0o7Q0FDSjtBQUNELEFBQU8sU0FBUyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRTtJQUNqQyxLQUFLLElBQUksS0FBSyxJQUFJLE1BQU0sRUFBRTtRQUN0QixJQUFJLFFBQVEsSUFBSSxDQUFDLEtBQUssV0FBVyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDN0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUM7U0FDckU7YUFDSSxJQUFJLFFBQVEsSUFBSSxDQUFDLEtBQUssV0FBVyxFQUFFO1lBQ3BDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDO1NBQ3JFO0tB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RyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUM7WUFDM0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDdkMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3JFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUMzQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7U0FDOUM7UUFDRCxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssWUFBWSxFQUFFO1lBQzlCLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLE9BQU8s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Q3BCLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDaEIsT0FBTyxLQUFLLENBQUM7S0FDaEI7SUFDRCxRQUFRLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUU7UUFDMUIsSUFBSSxJQUFJLEdBQUcsS0FBSyxFQUFFO1lBQ2QsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzVDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ3ZDO1FBQ0QsT0FBTyxNQUFNLENBQUM7S0FDakI7Q0FDSixBQUNEOztBQzlETyxNQUFNLFlBQVksU0FBUyxVQUFVLENBQUM7SUFDekMsV0FBVyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUU7UUFDckQsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ1osSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7S0FDcEI7SUFDRCxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRTtRQUNoQixLQUFLLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDeEIsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztZ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TUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3REO1FBQ0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzdDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUN0QztRQUNELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM3QyxLQUFLLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUU7Z0JBQzVDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzVCLElBQUksUUFBUSxDQUFDO2dCQUNiLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxRQUFRLElBQUksT0FBTyxLQUFLLENBQUMsS0FBSyxLQUFLLFdBQVcsRUFBRTtvQkFDaEUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDbEk7cUJBQ0k7b0JBQ0QsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMs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LElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2hDO1NBQ0o7UUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN6QixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMxRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztR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T0FBTyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDcEQsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7SUFFekQsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDO1NBQ3JELE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7O0lBRS9DLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7SUFFN0UsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7O0lBRTFGLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNkLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSztRQUM1QixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDaEIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FB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LEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ1o7U0FDSjtRQUNELElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7O1FBRVgsS0FBSyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7WUFDdEIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ2pCO0tBQ0o7SUFDRCxNQUFNLEdBQUc7UUFDTCxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQztRQUN6QyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1QsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNmLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ2xCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3BCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ25CLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2xCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25CLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ2xCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2xCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckIsR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7UUFDakIsT0FBTyxHQUFHLENBQUM7S0FDZDtDQUNKLEFBQ0Q7O0FDL0pPLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUM3Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDekJBOzs7QUFHQSxBQUNBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUN0QixLQUFLLElBQUksR0FBRyxJQUFJLE9BQU8sRUFBRTtJQUNyQixJQUFJLEdBQUcsSUFBSSxTQUFTLEVBQUU7UUFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztLQUM3QjtDQUNKLEFBQ0QifQ==
