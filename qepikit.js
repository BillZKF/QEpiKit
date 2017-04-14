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
            //scene.add(pop[a].mesh);
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
            this.formatTime();
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
    normal(mean, std) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicWVwaWtpdC5qcyIsInNvdXJjZXMiOlsiZGlzdC91dGlscy5qcyIsImRpc3QvUUNvbXBvbmVudC5qcyIsImRpc3QvYmRpLmpzIiwiZGlzdC9iZWhhdmlvclRyZWUuanMiLCJkaXN0L2NvbXBhcnRtZW50LmpzIiwiZGlzdC9jb250YWN0UGF0Y2guanMiLCJkaXN0L2Vudmlyb25tZW50LmpzIiwiZGlzdC9lcGkuanMiLCJkaXN0L2V2ZW50cy5qcyIsImRpc3Qvc3RhdGVNYWNoaW5lLmpzIiwiZGlzdC9leHBlcmltZW50LmpzIiwiZGlzdC9nZW5ldGljLmpzIiwiZGlzdC9ldm9sdXRpb25hcnkuanMiLCJkaXN0L2hhLmpzIiwiZGlzdC9odG4uanMiLCJkaXN0L2ttZWFuLmpzIiwiZGlzdC9rbm4uanMiLCJkaXN0L21hdGguanMiLCJkaXN0L25ldHdvcmsuanMiLCJkaXN0L1FMZWFybmVyLmpzIiwiZGlzdC9yZWdyZXNzaW9uLmpzIiwiZGlzdC9VU3lzLmpzIiwiZGlzdC9yYW5kb20uanMiLCJkaXN0L21haW4uanMiLCJkaXN0L1FFcGlLaXQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IFNVQ0NFU1MgPSAxO1xyXG5leHBvcnQgY29uc3QgRkFJTEVEID0gMjtcclxuZXhwb3J0IGNvbnN0IFJVTk5JTkcgPSAzO1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ1NWVVJJKGRhdGEpIHtcclxuICAgIHZhciBkYXRhU3RyaW5nO1xyXG4gICAgdmFyIFVSSTtcclxuICAgIHZhciBjc3ZDb250ZW50ID0gXCJkYXRhOnRleHQvY3N2O2NoYXJzZXQ9dXRmLTgsXCI7XHJcbiAgICB2YXIgY3N2Q29udGVudEFycmF5ID0gW107XHJcbiAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGluZm9BcnJheSkge1xyXG4gICAgICAgIGRhdGFTdHJpbmcgPSBpbmZvQXJyYXkuam9pbihcIixcIik7XHJcbiAgICAgICAgY3N2Q29udGVudEFycmF5LnB1c2goZGF0YVN0cmluZyk7XHJcbiAgICB9KTtcclxuICAgIGNzdkNvbnRlbnQgKz0gY3N2Q29udGVudEFycmF5LmpvaW4oXCJcXG5cIik7XHJcbiAgICBVUkkgPSBlbmNvZGVVUkkoY3N2Q29udGVudCk7XHJcbiAgICByZXR1cm4gVVJJO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBhcnJheUZyb21SYW5nZShzdGFydCwgZW5kLCBzdGVwKSB7XHJcbiAgICB2YXIgcmFuZ2UgPSBbXTtcclxuICAgIHZhciBpID0gc3RhcnQ7XHJcbiAgICB3aGlsZSAoaSA8IGVuZCkge1xyXG4gICAgICAgIHJhbmdlLnB1c2goaSk7XHJcbiAgICAgICAgaSArPSBzdGVwO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJhbmdlO1xyXG59XHJcbi8qKlxyXG4qIHNodWZmbGUgLSBmaXNoZXIteWF0ZXMgc2h1ZmZsZVxyXG4qL1xyXG5leHBvcnQgZnVuY3Rpb24gc2h1ZmZsZShhcnJheSwgcm5nKSB7XHJcbiAgICB2YXIgY3VycmVudEluZGV4ID0gYXJyYXkubGVuZ3RoLCB0ZW1wb3JhcnlWYWx1ZSwgcmFuZG9tSW5kZXg7XHJcbiAgICAvLyBXaGlsZSB0aGVyZSByZW1haW4gZWxlbWVudHMgdG8gc2h1ZmZsZS4uLlxyXG4gICAgd2hpbGUgKDAgIT09IGN1cnJlbnRJbmRleCkge1xyXG4gICAgICAgIC8vIFBpY2sgYSByZW1haW5pbmcgZWxlbWVudC4uLlxyXG4gICAgICAgIHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vcihybmcucmFuZG9tKCkgKiBjdXJyZW50SW5kZXgpO1xyXG4gICAgICAgIGN1cnJlbnRJbmRleCAtPSAxO1xyXG4gICAgICAgIC8vIEFuZCBzd2FwIGl0IHdpdGggdGhlIGN1cnJlbnQgZWxlbWVudC5cclxuICAgICAgICB0ZW1wb3JhcnlWYWx1ZSA9IGFycmF5W2N1cnJlbnRJbmRleF07XHJcbiAgICAgICAgYXJyYXlbY3VycmVudEluZGV4XSA9IGFycmF5W3JhbmRvbUluZGV4XTtcclxuICAgICAgICBhcnJheVtyYW5kb21JbmRleF0gPSB0ZW1wb3JhcnlWYWx1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBhcnJheTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVVVUlEKCkge1xyXG4gICAgLy8gaHR0cDovL3d3dy5icm9vZmEuY29tL1Rvb2xzL01hdGgudXVpZC5odG1cclxuICAgIHZhciBjaGFycyA9ICcwMTIzNDU2Nzg5QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eicuc3BsaXQoJycpO1xyXG4gICAgdmFyIHV1aWQgPSBuZXcgQXJyYXkoMzYpO1xyXG4gICAgdmFyIHJuZCA9IDAsIHI7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM2OyBpKyspIHtcclxuICAgICAgICBpZiAoaSA9PSA4IHx8IGkgPT0gMTMgfHwgaSA9PSAxOCB8fCBpID09IDIzKSB7XHJcbiAgICAgICAgICAgIHV1aWRbaV0gPSAnLSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGkgPT0gMTQpIHtcclxuICAgICAgICAgICAgdXVpZFtpXSA9ICc0JztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChybmQgPD0gMHgwMilcclxuICAgICAgICAgICAgICAgIHJuZCA9IDB4MjAwMDAwMCArIChNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwKSB8IDA7XHJcbiAgICAgICAgICAgIHIgPSBybmQgJiAweGY7XHJcbiAgICAgICAgICAgIHJuZCA9IHJuZCA+PiA0O1xyXG4gICAgICAgICAgICB1dWlkW2ldID0gY2hhcnNbKGkgPT0gMTkpID8gKHIgJiAweDMpIHwgMHg4IDogcl07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHV1aWQuam9pbignJyk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGFsd2F5cyhhKSB7XHJcbiAgICBpZiAoYSA9PT0gU1VDQ0VTUykge1xyXG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZXZlbnR1YWxseShhKSB7XHJcbiAgICBpZiAoYSA9PT0gU1VDQ0VTUykge1xyXG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIFJVTk5JTkc7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFsVG8oYSwgYikge1xyXG4gICAgaWYgKGEgPT09IGIpIHtcclxuICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIG5vdChyZXN1bHQpIHtcclxuICAgIHZhciBuZXdSZXN1bHQ7XHJcbiAgICBpZiAocmVzdWx0ID09PSBTVUNDRVNTKSB7XHJcbiAgICAgICAgbmV3UmVzdWx0ID0gRkFJTEVEO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAocmVzdWx0ID09PSBGQUlMRUQpIHtcclxuICAgICAgICBuZXdSZXN1bHQgPSBTVUNDRVNTO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ld1Jlc3VsdDtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gbm90RXF1YWxUbyhhLCBiKSB7XHJcbiAgICBpZiAoYSAhPT0gYikge1xyXG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZ3QoYSwgYikge1xyXG4gICAgaWYgKGEgPiBiKSB7XHJcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBndEVxKGEsIGIpIHtcclxuICAgIGlmIChhID49IGIpIHtcclxuICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGx0KGEsIGIpIHtcclxuICAgIGlmIChhIDwgYikge1xyXG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gbHRFcShhLCBiKSB7XHJcbiAgICBpZiAoYSA8PSBiKSB7XHJcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBoYXNQcm9wKGEsIGIpIHtcclxuICAgIGEgPSBhIHx8IGZhbHNlO1xyXG4gICAgaWYgKGEgPT09IGIpIHtcclxuICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGluUmFuZ2UoYSwgYikge1xyXG4gICAgaWYgKGIgPj0gYVswXSAmJiBiIDw9IGFbMV0pIHtcclxuICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIG5vdEluUmFuZ2UoYSwgYikge1xyXG4gICAgaWYgKGIgPj0gYVswXSAmJiBiIDw9IGFbMV0pIHtcclxuICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGdldE1hdGNoZXJTdHJpbmcoY2hlY2spIHtcclxuICAgIHZhciBzdHJpbmcgPSBudWxsO1xyXG4gICAgc3dpdGNoIChjaGVjaykge1xyXG4gICAgICAgIGNhc2UgZXF1YWxUbzpcclxuICAgICAgICAgICAgc3RyaW5nID0gXCJlcXVhbCB0b1wiO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIG5vdEVxdWFsVG86XHJcbiAgICAgICAgICAgIHN0cmluZyA9IFwibm90IGVxdWFsIHRvXCI7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgZ3Q6XHJcbiAgICAgICAgICAgIHN0cmluZyA9IFwiZ3JlYXRlciB0aGFuXCI7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgZ3RFcTpcclxuICAgICAgICAgICAgc3RyaW5nID0gXCJncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG9cIjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBsdDpcclxuICAgICAgICAgICAgc3RyaW5nID0gXCJsZXNzIHRoYW5cIjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBsdEVxOlxyXG4gICAgICAgICAgICBzdHJpbmcgPSBcImxlc3MgdGhhbiBvciBlcXVhbCB0b1wiO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIGhhc1Byb3A6XHJcbiAgICAgICAgICAgIHN0cmluZyA9IFwiaGFzIHRoZSBwcm9wZXJ0eVwiO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgc3RyaW5nID0gXCJub3QgYSBkZWZpbmVkIG1hdGNoZXJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc3RyaW5nO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRNaW4ocGFyYW1zLCBrZXlzKSB7XHJcbiAgICBmb3IgKHZhciBwYXJhbSBpbiBwYXJhbXMpIHtcclxuICAgICAgICBpZiAodHlwZW9mIChrZXlzKSAhPT0gJ3VuZGVmaW5lZCcgJiYga2V5cy5pbmRleE9mKHBhcmFtKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgcGFyYW1zW3BhcmFtXS5jdXJyZW50ID0gcGFyYW1zW3BhcmFtXS52YWx1ZSAtIHBhcmFtc1twYXJhbV0uZXJyb3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiAoa2V5cykgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHBhcmFtc1twYXJhbV0uY3VycmVudCA9IHBhcmFtc1twYXJhbV0udmFsdWUgLSBwYXJhbXNbcGFyYW1dLmVycm9yO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gc2V0TWF4KHBhcmFtcywga2V5cykge1xyXG4gICAgZm9yICh2YXIgcGFyYW0gaW4gcGFyYW1zKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiAoa2V5cykgIT09ICd1bmRlZmluZWQnICYmIGtleXMuaW5kZXhPZihwYXJhbSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHBhcmFtc1twYXJhbV0uY3VycmVudCA9IHBhcmFtc1twYXJhbV0udmFsdWUgKyBwYXJhbXNbcGFyYW1dLmVycm9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgKGtleXMpID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBwYXJhbXNbcGFyYW1dLmN1cnJlbnQgPSBwYXJhbXNbcGFyYW1dLnZhbHVlICsgcGFyYW1zW3BhcmFtXS5lcnJvcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFN0YW5kYXJkKHBhcmFtcywga2V5cykge1xyXG4gICAgZm9yICh2YXIgcGFyYW0gaW4gcGFyYW1zKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiAoa2V5cykgIT09ICd1bmRlZmluZWQnICYmIGtleXMuaW5kZXhPZihwYXJhbSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHBhcmFtc1twYXJhbV0uY3VycmVudCA9IHBhcmFtc1twYXJhbV0udmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiAoa2V5cykgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHBhcmFtc1twYXJhbV0uY3VycmVudCA9IHBhcmFtc1twYXJhbV0udmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBkYXRhVG9NYXRyaXgoaXRlbXMsIHN0ZGl6ZWQgPSBmYWxzZSkge1xyXG4gICAgbGV0IGRhdGEgPSBbXTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBsZXQgaXRlbSA9IGl0ZW1zW2ldO1xyXG4gICAgICAgIGlmIChzdGRpemVkKSB7XHJcbiAgICAgICAgICAgIGl0ZW0gPSBzdGFuZGFyZGl6ZWQoaXRlbSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGl0ZW0uZm9yRWFjaCgoeCwgaWkpID0+IHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBkYXRhW2lpXSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIGRhdGFbaWldID0gWzEsIHhdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZGF0YVtpaV0ucHVzaCh4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGRhdGE7XHJcbn1cclxuLypcclxuKiByZWxhdGl2ZSB0byB0aGUgbWVhbiwgaG93IG1hbnkgc3RhbmRhcmQgZGV2aWF0aW9uc1xyXG4qL1xyXG5leHBvcnQgZnVuY3Rpb24gc3RhbmRhcmRpemVkKGFycikge1xyXG4gICAgbGV0IHN0ZCA9IGpTdGF0LnN0ZGV2KGFycik7XHJcbiAgICBsZXQgbWVhbiA9IGpTdGF0Lm1lYW4oYXJyKTtcclxuICAgIGxldCBzdGFuZGFyZGl6ZWQgPSBhcnIubWFwKChkKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIChkIC0gbWVhbikgLyBzdGQ7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBzdGFuZGFyZGl6ZWQ7XHJcbn1cclxuLypcclxuKiBiZXR3ZWVuIDAgYW5kIDEgd2hlbiBtaW4gYW5kIG1heCBhcmUga25vd25cclxuKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZSh4LCBtaW4sIG1heCkge1xyXG4gICAgbGV0IHZhbCA9IHggLSBtaW47XHJcbiAgICByZXR1cm4gdmFsIC8gKG1heCAtIG1pbik7XHJcbn1cclxuLypcclxuKiBnaXZlIHRoZSByZWFsIHVuaXQgdmFsdWVcclxuKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGludk5vcm0oeCwgbWluLCBtYXgpIHtcclxuICAgIHJldHVybiAoeCAqIG1heCAtIHggKiBtaW4pICsgbWluO1xyXG59XHJcbi8qXHJcbipcclxuKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJhbmRSYW5nZShtaW4sIG1heCkge1xyXG4gICAgcmV0dXJuIChtYXggLSBtaW4pICogTWF0aC5yYW5kb20oKSArIG1pbjtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmFuZ2UoZGF0YSwgcHJvcCkge1xyXG4gICAgbGV0IHJhbmdlID0ge1xyXG4gICAgICAgIG1pbjogMWUxNSxcclxuICAgICAgICBtYXg6IC0xZTE1XHJcbiAgICB9O1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKHJhbmdlLm1pbiA+IGRhdGFbaV1bcHJvcF0pIHtcclxuICAgICAgICAgICAgcmFuZ2UubWluID0gZGF0YVtpXVtwcm9wXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJhbmdlLm1heCA8IGRhdGFbaV1bcHJvcF0pIHtcclxuICAgICAgICAgICAgcmFuZ2UubWF4ID0gZGF0YVtpXVtwcm9wXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmFuZ2U7XHJcbn1cclxuZXhwb3J0IGNsYXNzIE1hdGNoIHtcclxuICAgIHN0YXRpYyBndChhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEgPiBiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZ2UoYSwgYikge1xyXG4gICAgICAgIGlmIChhID49IGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBsdChhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEgPCBiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgbGUoYSwgYikge1xyXG4gICAgICAgIGlmIChhIDw9IGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVQb3AobnVtQWdlbnRzLCBvcHRpb25zLCB0eXBlLCBib3VuZGFyaWVzLCBjdXJyZW50QWdlbnRJZCwgcm5nKSB7XHJcbiAgICB2YXIgcG9wID0gW107XHJcbiAgICB2YXIgbG9jcyA9IHtcclxuICAgICAgICB0eXBlOiAnRmVhdHVyZUNvbGxlY3Rpb24nLFxyXG4gICAgICAgIGZlYXR1cmVzOiBbXVxyXG4gICAgfTtcclxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IFtdO1xyXG4gICAgdHlwZSA9IHR5cGUgfHwgJ2NvbnRpbnVvdXMnO1xyXG4gICAgZm9yICh2YXIgYSA9IDA7IGEgPCBudW1BZ2VudHM7IGErKykge1xyXG4gICAgICAgIHBvcFthXSA9IHtcclxuICAgICAgICAgICAgaWQ6IGN1cnJlbnRBZ2VudElkLFxyXG4gICAgICAgICAgICB0eXBlOiB0eXBlXHJcbiAgICAgICAgfTtcclxuICAgICAgICAvL21vdmVtZW50IHBhcmFtc1xyXG4gICAgICAgIHBvcFthXS5tb3ZlUGVyRGF5ID0gcm5nLm5vcm1hbCgyNTAwICogMjQsIDEwMDApOyAvLyBtL2RheVxyXG4gICAgICAgIHBvcFthXS5wcmV2WCA9IDA7XHJcbiAgICAgICAgcG9wW2FdLnByZXZZID0gMDtcclxuICAgICAgICBwb3BbYV0ubW92ZWRUb3RhbCA9IDA7XHJcbiAgICAgICAgaWYgKHBvcFthXS50eXBlID09PSAnY29udGludW91cycpIHtcclxuICAgICAgICAgICAgcG9wW2FdLm1lc2ggPSBuZXcgVEhSRUUuTWVzaChuZXcgVEhSRUUuVGV0cmFoZWRyb25HZW9tZXRyeSgxLCAxKSwgbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtcclxuICAgICAgICAgICAgICAgIGNvbG9yOiAweDAwZmYwMFxyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgIHBvcFthXS5tZXNoLnFJZCA9IHBvcFthXS5pZDtcclxuICAgICAgICAgICAgcG9wW2FdLm1lc2gudHlwZSA9ICdhZ2VudCc7XHJcbiAgICAgICAgICAgIHBvcFthXS5wb3NpdGlvbiA9IHsgeDogMCwgeTogMCwgejogMCB9O1xyXG4gICAgICAgICAgICBwb3BbYV0ucG9zaXRpb24ueCA9IHJuZy5yYW5kUmFuZ2UoYm91bmRhcmllcy5sZWZ0LCBib3VuZGFyaWVzLnJpZ2h0KTtcclxuICAgICAgICAgICAgcG9wW2FdLnBvc2l0aW9uLnkgPSBybmcucmFuZFJhbmdlKGJvdW5kYXJpZXMuYm90dG9tLCBib3VuZGFyaWVzLnRvcCk7XHJcbiAgICAgICAgICAgIHBvcFthXS5tZXNoLnBvc2l0aW9uLnggPSBwb3BbYV0ucG9zaXRpb24ueDtcclxuICAgICAgICAgICAgcG9wW2FdLm1lc2gucG9zaXRpb24ueSA9IHBvcFthXS5wb3NpdGlvbi55O1xyXG4gICAgICAgICAgICAvL3NjZW5lLmFkZChwb3BbYV0ubWVzaCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwb3BbYV0udHlwZSA9PT0gJ2dlb3NwYXRpYWwnKSB7XHJcbiAgICAgICAgICAgIGxvY3MuZmVhdHVyZXNbYV0gPSB0dXJmLnBvaW50KFtybmcucmFuZFJhbmdlKC03NS4xNDY3LCAtNzUuMTg2NyksIHJuZy5yYW5kUmFuZ2UoMzkuOTIwMCwgMzkuOTkwMCldKTtcclxuICAgICAgICAgICAgcG9wW2FdLmxvY2F0aW9uID0gbG9jcy5mZWF0dXJlc1thXTtcclxuICAgICAgICAgICAgcG9wW2FdLmxvY2F0aW9uLnByb3BlcnRpZXMuYWdlbnRSZWZJRCA9IHBvcFthXS5pZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgbGV0IGQgPSBvcHRpb25zW2tleV07XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZC5hc3NpZ24gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgIHBvcFthXVtrZXldID0gZC5hc3NpZ24ocG9wW2FdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBvcFthXVtrZXldID0gZC5hc3NpZ247XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgO1xyXG4gICAgICAgIGN1cnJlbnRBZ2VudElkKys7XHJcbiAgICB9XHJcbiAgICBmb3IgKHZhciByID0gMDsgciA8IDM7IHIrKykge1xyXG4gICAgICAgIHBvcFtyXS5zdGF0ZXMuaWxsbmVzcyA9ICdpbmZlY3Rpb3VzJztcclxuICAgICAgICBwb3Bbcl0uaW5mZWN0aW91cyA9IHRydWU7XHJcbiAgICAgICAgcG9wW3JdLnBhdGhvZ2VuTG9hZCA9IDRlNDtcclxuICAgIH1cclxuICAgIGZvciAobGV0IGEgPSAwOyBhIDwgcG9wLmxlbmd0aDsgYSsrKSB7XHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHBvcFthXS5zdGF0ZXMpIHtcclxuICAgICAgICAgICAgcG9wW2FdW3BvcFthXS5zdGF0ZXNba2V5XV0gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBbcG9wLCBsb2NzXTtcclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD11dGlscy5qcy5tYXAiLCJpbXBvcnQgeyBnZW5lcmF0ZVVVSUQgfSBmcm9tICcuL3V0aWxzJztcclxuLyoqXHJcbipRQ29tcG9uZW50cyBhcmUgdGhlIGJhc2UgY2xhc3MgZm9yIG1hbnkgbW9kZWwgY29tcG9uZW50cy5cclxuKi9cclxuZXhwb3J0IGNsYXNzIFFDb21wb25lbnQge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSkge1xyXG4gICAgICAgIHRoaXMuaWQgPSBnZW5lcmF0ZVVVSUQoKTtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMudGltZSA9IDA7XHJcbiAgICAgICAgdGhpcy5oaXN0b3J5ID0gW107XHJcbiAgICB9XHJcbiAgICAvKiogVGFrZSBvbmUgdGltZSBzdGVwIGZvcndhcmQgKG1vc3Qgc3ViY2xhc3NlcyBvdmVycmlkZSB0aGUgYmFzZSBtZXRob2QpXHJcbiAgICAqIEBwYXJhbSBzdGVwIHNpemUgb2YgdGltZSBzdGVwIChpbiBkYXlzIGJ5IGNvbnZlbnRpb24pXHJcbiAgICAqL1xyXG4gICAgdXBkYXRlKGFnZW50LCBzdGVwKSB7XHJcbiAgICAgICAgLy9zb21ldGhpbmcgc3VwZXIhXHJcbiAgICB9XHJcbn1cclxuUUNvbXBvbmVudC5TVUNDRVNTID0gMTtcclxuUUNvbXBvbmVudC5GQUlMRUQgPSAyO1xyXG5RQ29tcG9uZW50LlJVTk5JTkcgPSAzO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1RQ29tcG9uZW50LmpzLm1hcCIsImltcG9ydCB7IFFDb21wb25lbnQgfSBmcm9tICcuL1FDb21wb25lbnQnO1xyXG5pbXBvcnQgeyBnZXRNYXRjaGVyU3RyaW5nIH0gZnJvbSAnLi91dGlscyc7XHJcbi8qKlxyXG4qIEJlbGllZiBEZXNpcmUgSW50ZW50IGFnZW50cyBhcmUgc2ltcGxlIHBsYW5uaW5nIGFnZW50cyB3aXRoIG1vZHVsYXIgcGxhbnMgLyBkZWxpYmVyYXRpb24gcHJvY2Vzc2VzLlxyXG4qL1xyXG5leHBvcnQgY2xhc3MgQkRJQWdlbnQgZXh0ZW5kcyBRQ29tcG9uZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGdvYWxzID0gW10sIHBsYW5zID0ge30sIGRhdGEgPSBbXSwgcG9saWN5U2VsZWN0b3IgPSBCRElBZ2VudC5zdG9jaGFzdGljU2VsZWN0aW9uKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSk7XHJcbiAgICAgICAgdGhpcy5nb2FscyA9IGdvYWxzO1xyXG4gICAgICAgIHRoaXMucGxhbnMgPSBwbGFucztcclxuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xyXG4gICAgICAgIHRoaXMucG9saWN5U2VsZWN0b3IgPSBwb2xpY3lTZWxlY3RvcjtcclxuICAgICAgICB0aGlzLmJlbGllZkhpc3RvcnkgPSBbXTtcclxuICAgICAgICB0aGlzLnBsYW5IaXN0b3J5ID0gW107XHJcbiAgICB9XHJcbiAgICAvKiogVGFrZSBvbmUgdGltZSBzdGVwIGZvcndhcmQsIHRha2UgaW4gYmVsaWVmcywgZGVsaWJlcmF0ZSwgaW1wbGVtZW50IHBvbGljeVxyXG4gICAgKiBAcGFyYW0gc3RlcCBzaXplIG9mIHRpbWUgc3RlcCAoaW4gZGF5cyBieSBjb252ZW50aW9uKVxyXG4gICAgKi9cclxuICAgIHVwZGF0ZShhZ2VudCwgc3RlcCkge1xyXG4gICAgICAgIHZhciBwb2xpY3ksIGludGVudCwgZXZhbHVhdGlvbjtcclxuICAgICAgICBwb2xpY3kgPSB0aGlzLnBvbGljeVNlbGVjdG9yKHRoaXMucGxhbnMsIHRoaXMucGxhbkhpc3RvcnksIGFnZW50KTtcclxuICAgICAgICBpbnRlbnQgPSB0aGlzLnBsYW5zW3BvbGljeV07XHJcbiAgICAgICAgaW50ZW50KGFnZW50LCBzdGVwKTtcclxuICAgICAgICBldmFsdWF0aW9uID0gdGhpcy5ldmFsdWF0ZUdvYWxzKGFnZW50KTtcclxuICAgICAgICB0aGlzLnBsYW5IaXN0b3J5LnB1c2goeyB0aW1lOiB0aGlzLnRpbWUsIGlkOiBhZ2VudC5pZCwgaW50ZW50aW9uOiBwb2xpY3ksIGdvYWxzOiBldmFsdWF0aW9uLmFjaGlldmVtZW50cywgYmFycmllcnM6IGV2YWx1YXRpb24uYmFycmllcnMsIHI6IGV2YWx1YXRpb24uc3VjY2Vzc2VzIC8gdGhpcy5nb2Fscy5sZW5ndGggfSk7XHJcbiAgICB9XHJcbiAgICBldmFsdWF0ZUdvYWxzKGFnZW50KSB7XHJcbiAgICAgICAgbGV0IGFjaGlldmVtZW50cyA9IFtdLCBiYXJyaWVycyA9IFtdLCBzdWNjZXNzZXMgPSAwLCBjLCBtYXRjaGVyO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5nb2Fscy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjID0gdGhpcy5nb2Fsc1tpXS5jb25kaXRpb247XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYy5kYXRhID09PSAndW5kZWZpbmVkJyB8fCBjLmRhdGEgPT09IFwiYWdlbnRcIikge1xyXG4gICAgICAgICAgICAgICAgYy5kYXRhID0gYWdlbnQ7IC8vaWYgbm8gZGF0YXNvdXJjZSBpcyBzZXQsIHVzZSB0aGUgYWdlbnRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhY2hpZXZlbWVudHNbaV0gPSB0aGlzLmdvYWxzW2ldLnRlbXBvcmFsKGMuY2hlY2soYy5kYXRhW2Mua2V5XSwgYy52YWx1ZSkpO1xyXG4gICAgICAgICAgICBpZiAoYWNoaWV2ZW1lbnRzW2ldID09PSBCRElBZ2VudC5TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzZXMgKz0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG1hdGNoZXIgPSBnZXRNYXRjaGVyU3RyaW5nKGMuY2hlY2spO1xyXG4gICAgICAgICAgICAgICAgYmFycmllcnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGMubGFiZWwsXHJcbiAgICAgICAgICAgICAgICAgICAga2V5OiBjLmtleSxcclxuICAgICAgICAgICAgICAgICAgICBjaGVjazogbWF0Y2hlcixcclxuICAgICAgICAgICAgICAgICAgICBhY3R1YWw6IGMuZGF0YVtjLmtleV0sXHJcbiAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IGMudmFsdWVcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3Nlczogc3VjY2Vzc2VzLCBiYXJyaWVyczogYmFycmllcnMsIGFjaGlldmVtZW50czogYWNoaWV2ZW1lbnRzIH07XHJcbiAgICB9XHJcbiAgICAvL2dvb2QgZm9yIHRyYWluaW5nXHJcbiAgICBzdGF0aWMgc3RvY2hhc3RpY1NlbGVjdGlvbihwbGFucywgcGxhbkhpc3RvcnksIGFnZW50KSB7XHJcbiAgICAgICAgdmFyIHBvbGljeSwgc2NvcmUsIG1heCA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgcGxhbiBpbiBwbGFucykge1xyXG4gICAgICAgICAgICBzY29yZSA9IE1hdGgucmFuZG9tKCk7XHJcbiAgICAgICAgICAgIGlmIChzY29yZSA+PSBtYXgpIHtcclxuICAgICAgICAgICAgICAgIG1heCA9IHNjb3JlO1xyXG4gICAgICAgICAgICAgICAgcG9saWN5ID0gcGxhbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcG9saWN5O1xyXG4gICAgfVxyXG59XHJcbkJESUFnZW50LmxhenlQb2xpY3lTZWxlY3Rpb24gPSBmdW5jdGlvbiAocGxhbnMsIHBsYW5IaXN0b3J5LCBhZ2VudCkge1xyXG4gICAgdmFyIG9wdGlvbnMsIHNlbGVjdGlvbjtcclxuICAgIGlmICh0aGlzLnRpbWUgPiAwKSB7XHJcbiAgICAgICAgb3B0aW9ucyA9IE9iamVjdC5rZXlzKHBsYW5zKTtcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucy5zbGljZSgxLCBvcHRpb25zLmxlbmd0aCk7XHJcbiAgICAgICAgc2VsZWN0aW9uID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogb3B0aW9ucy5sZW5ndGgpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgb3B0aW9ucyA9IE9iamVjdC5rZXlzKHBsYW5zKTtcclxuICAgICAgICBzZWxlY3Rpb24gPSAwO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG9wdGlvbnNbc2VsZWN0aW9uXTtcclxufTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YmRpLmpzLm1hcCIsImltcG9ydCB7IFFDb21wb25lbnQgfSBmcm9tICcuL1FDb21wb25lbnQnO1xyXG5pbXBvcnQgeyBnZW5lcmF0ZVVVSUQgfSBmcm9tICcuL3V0aWxzJztcclxuLyoqXHJcbiogQmVoYXZpb3IgVHJlZVxyXG4qKi9cclxuZXhwb3J0IGNsYXNzIEJlaGF2aW9yVHJlZSBleHRlbmRzIFFDb21wb25lbnQge1xyXG4gICAgc3RhdGljIHRpY2sobm9kZSwgYWdlbnQpIHtcclxuICAgICAgICB2YXIgc3RhdGUgPSBub2RlLm9wZXJhdGUoYWdlbnQpO1xyXG4gICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH1cclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHJvb3QsIGRhdGEpIHtcclxuICAgICAgICBzdXBlcihuYW1lKTtcclxuICAgICAgICB0aGlzLnJvb3QgPSByb290O1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgdGhpcy5yZXN1bHRzID0gW107XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoYWdlbnQsIHN0ZXApIHtcclxuICAgICAgICB2YXIgc3RhdGU7XHJcbiAgICAgICAgYWdlbnQuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB3aGlsZSAoYWdlbnQuYWN0aXZlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHN0YXRlID0gQmVoYXZpb3JUcmVlLnRpY2sodGhpcy5yb290LCBhZ2VudCk7XHJcbiAgICAgICAgICAgIGFnZW50LnRpbWUgPSB0aGlzLnRpbWU7XHJcbiAgICAgICAgICAgIGFnZW50LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEJUTm9kZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lKSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IGdlbmVyYXRlVVVJRCgpO1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEJUQ29udHJvbE5vZGUgZXh0ZW5kcyBCVE5vZGUge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgY2hpbGRyZW4pIHtcclxuICAgICAgICBzdXBlcihuYW1lKTtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEJUUm9vdCBleHRlbmRzIEJUQ29udHJvbE5vZGUge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgY2hpbGRyZW4pIHtcclxuICAgICAgICBzdXBlcihuYW1lLCBjaGlsZHJlbik7XHJcbiAgICAgICAgdGhpcy50eXBlID0gXCJyb290XCI7XHJcbiAgICAgICAgdGhpcy5vcGVyYXRlID0gZnVuY3Rpb24gKGFnZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBzdGF0ZSA9IEJlaGF2aW9yVHJlZS50aWNrKHRoaXMuY2hpbGRyZW5bMF0sIGFnZW50KTtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEJUU2VsZWN0b3IgZXh0ZW5kcyBCVENvbnRyb2xOb2RlIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNoaWxkcmVuKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSwgY2hpbGRyZW4pO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IFwic2VsZWN0b3JcIjtcclxuICAgICAgICB0aGlzLm9wZXJhdGUgPSBmdW5jdGlvbiAoYWdlbnQpIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkU3RhdGU7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGNoaWxkIGluIHRoaXMuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkU3RhdGUgPSBCZWhhdmlvclRyZWUudGljayh0aGlzLmNoaWxkcmVuW2NoaWxkXSwgYWdlbnQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5SVU5OSU5HKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5SVU5OSU5HO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5TVUNDRVNTO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBCZWhhdmlvclRyZWUuRkFJTEVEO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEJUU2VxdWVuY2UgZXh0ZW5kcyBCVENvbnRyb2xOb2RlIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNoaWxkcmVuKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSwgY2hpbGRyZW4pO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IFwic2VxdWVuY2VcIjtcclxuICAgICAgICB0aGlzLm9wZXJhdGUgPSBmdW5jdGlvbiAoYWdlbnQpIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkU3RhdGU7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGNoaWxkIGluIHRoaXMuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkU3RhdGUgPSBCZWhhdmlvclRyZWUudGljayh0aGlzLmNoaWxkcmVuW2NoaWxkXSwgYWdlbnQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5SVU5OSU5HKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5SVU5OSU5HO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5GQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLkZBSUxFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLlNVQ0NFU1M7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgQlRQYXJhbGxlbCBleHRlbmRzIEJUQ29udHJvbE5vZGUge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgY2hpbGRyZW4sIHN1Y2Nlc3Nlcykge1xyXG4gICAgICAgIHN1cGVyKG5hbWUsIGNoaWxkcmVuKTtcclxuICAgICAgICB0aGlzLnR5cGUgPSBcInBhcmFsbGVsXCI7XHJcbiAgICAgICAgdGhpcy5zdWNjZXNzZXMgPSBzdWNjZXNzZXM7XHJcbiAgICAgICAgdGhpcy5vcGVyYXRlID0gZnVuY3Rpb24gKGFnZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBzdWNjZWVkZWQgPSBbXSwgZmFpbHVyZXMgPSBbXSwgY2hpbGRTdGF0ZSwgbWFqb3JpdHk7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGNoaWxkIGluIHRoaXMuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkU3RhdGUgPSBCZWhhdmlvclRyZWUudGljayh0aGlzLmNoaWxkcmVuW2NoaWxkXSwgYWdlbnQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VlZGVkLnB1c2goY2hpbGRTdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaGlsZFN0YXRlID09PSBCZWhhdmlvclRyZWUuRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmFpbHVyZXMucHVzaChjaGlsZFN0YXRlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5SVU5OSU5HKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5SVU5OSU5HO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzdWNjZWVkZWQubGVuZ3RoID49IHRoaXMuc3VjY2Vzc2VzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLlNVQ0NFU1M7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLkZBSUxFRDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEJUQ29uZGl0aW9uIGV4dGVuZHMgQlROb2RlIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNvbmRpdGlvbikge1xyXG4gICAgICAgIHN1cGVyKG5hbWUpO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IFwiY29uZGl0aW9uXCI7XHJcbiAgICAgICAgdGhpcy5jb25kaXRpb24gPSBjb25kaXRpb247XHJcbiAgICAgICAgdGhpcy5vcGVyYXRlID0gZnVuY3Rpb24gKGFnZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBzdGF0ZTtcclxuICAgICAgICAgICAgc3RhdGUgPSBjb25kaXRpb24uY2hlY2soYWdlbnRbY29uZGl0aW9uLmtleV0sIGNvbmRpdGlvbi52YWx1ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBCVEFjdGlvbiBleHRlbmRzIEJUTm9kZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBjb25kaXRpb24sIGFjdGlvbikge1xyXG4gICAgICAgIHN1cGVyKG5hbWUpO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IFwiYWN0aW9uXCI7XHJcbiAgICAgICAgdGhpcy5jb25kaXRpb24gPSBjb25kaXRpb247XHJcbiAgICAgICAgdGhpcy5hY3Rpb24gPSBhY3Rpb247XHJcbiAgICAgICAgdGhpcy5vcGVyYXRlID0gZnVuY3Rpb24gKGFnZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBzdGF0ZTtcclxuICAgICAgICAgICAgc3RhdGUgPSBjb25kaXRpb24uY2hlY2soYWdlbnRbY29uZGl0aW9uLmtleV0sIGNvbmRpdGlvbi52YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmIChzdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLlNVQ0NFU1MpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWN0aW9uKGFnZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1iZWhhdmlvclRyZWUuanMubWFwIiwiaW1wb3J0IHsgZ2VuZXJhdGVVVUlEIH0gZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCB7IFFDb21wb25lbnQgfSBmcm9tICcuL1FDb21wb25lbnQnO1xyXG5leHBvcnQgY2xhc3MgQ29tcGFydG1lbnRNb2RlbCBleHRlbmRzIFFDb21wb25lbnQge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgY29tcGFydG1lbnRzLCBkYXRhKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSk7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTsgLy9hbiBhcnJheSBvZiBQYXRjaGVzLiBFYWNoIHBhdGNoIGNvbnRhaW5zIGFuIGFycmF5IG9mIGNvbXBhcnRtZW50cyBpbiBvcGVyYXRpb25hbCBvcmRlclxyXG4gICAgICAgIHRoaXMudG90YWxQb3AgPSAwO1xyXG4gICAgICAgIHRoaXMuY29tcGFydG1lbnRzID0gY29tcGFydG1lbnRzO1xyXG4gICAgICAgIHRoaXMuaGlzdG9yeSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGQgPSAwOyBkIDwgdGhpcy5kYXRhLmxlbmd0aDsgZCsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMudG90YWxQb3AgKz0gdGhpcy5kYXRhW2RdLnRvdGFsUG9wO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl90b2xlcmFuY2UgPSAxZS05OyAvL21vZGVsIGVyciB0b2xlcmFuY2VcclxuICAgIH1cclxuICAgIHVwZGF0ZShwYXRjaCwgc3RlcCkge1xyXG4gICAgICAgIGxldCB0ZW1wX3BvcCA9IHt9LCB0ZW1wX2QgPSB7fSwgbmV4dF9kID0ge30sIGx0ZSA9IHt9LCBlcnIgPSAxLCBuZXdTdGVwO1xyXG4gICAgICAgIGZvciAobGV0IGMgaW4gdGhpcy5jb21wYXJ0bWVudHMpIHtcclxuICAgICAgICAgICAgcGF0Y2guZHBvcHNbY10gPSB0aGlzLmNvbXBhcnRtZW50c1tjXS5vcGVyYXRpb24ocGF0Y2gucG9wdWxhdGlvbnMsIHN0ZXApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL2ZpcnN0IG9yZGVyIChFdWxlcilcclxuICAgICAgICBmb3IgKGxldCBjIGluIHRoaXMuY29tcGFydG1lbnRzKSB7XHJcbiAgICAgICAgICAgIHRlbXBfcG9wW2NdID0gcGF0Y2gucG9wdWxhdGlvbnNbY107XHJcbiAgICAgICAgICAgIHRlbXBfZFtjXSA9IHBhdGNoLmRwb3BzW2NdO1xyXG4gICAgICAgICAgICBwYXRjaC5wb3B1bGF0aW9uc1tjXSA9IHRlbXBfcG9wW2NdICsgdGVtcF9kW2NdO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL3NlY29uZCBvcmRlciAoSGV1bnMpXHJcbiAgICAgICAgcGF0Y2gudG90YWxQb3AgPSAwO1xyXG4gICAgICAgIGZvciAobGV0IGMgaW4gdGhpcy5jb21wYXJ0bWVudHMpIHtcclxuICAgICAgICAgICAgbmV4dF9kW2NdID0gdGhpcy5jb21wYXJ0bWVudHNbY10ub3BlcmF0aW9uKHBhdGNoLnBvcHVsYXRpb25zLCBzdGVwKTtcclxuICAgICAgICAgICAgcGF0Y2gucG9wdWxhdGlvbnNbY10gPSB0ZW1wX3BvcFtjXSArICgwLjUgKiAodGVtcF9kW2NdICsgbmV4dF9kW2NdKSk7XHJcbiAgICAgICAgICAgIHBhdGNoLnRvdGFsUG9wICs9IHBhdGNoLnBvcHVsYXRpb25zW2NdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgQ29tcGFydG1lbnQge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgcG9wLCBvcGVyYXRpb24pIHtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMub3BlcmF0aW9uID0gb3BlcmF0aW9uIHx8IG51bGw7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIFBhdGNoIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNvbXBhcnRtZW50cywgcG9wdWxhdGlvbnMpIHtcclxuICAgICAgICB0aGlzLnBvcHVsYXRpb25zID0ge307XHJcbiAgICAgICAgdGhpcy5kcG9wcyA9IHt9O1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbFBvcCA9IHt9O1xyXG4gICAgICAgIHRoaXMuaWQgPSBnZW5lcmF0ZVVVSUQoKTtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMuZHBvcHMgPSB7fTtcclxuICAgICAgICB0aGlzLmNvbXBhcnRtZW50cyA9IGNvbXBhcnRtZW50cztcclxuICAgICAgICB0aGlzLnRvdGFsUG9wID0gMDtcclxuICAgICAgICBmb3IgKGxldCBjIGluIHBvcHVsYXRpb25zKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZHBvcHNbY10gPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmluaXRpYWxQb3BbY10gPSBwb3B1bGF0aW9uc1tjXTtcclxuICAgICAgICAgICAgdGhpcy5wb3B1bGF0aW9uc1tjXSA9IHBvcHVsYXRpb25zW2NdO1xyXG4gICAgICAgICAgICB0aGlzLnRvdGFsUG9wICs9IHRoaXMucG9wdWxhdGlvbnNbY107XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbXBhcnRtZW50LmpzLm1hcCIsImltcG9ydCB7IGdlbmVyYXRlVVVJRCB9IGZyb20gJy4vdXRpbHMnO1xyXG5leHBvcnQgY2xhc3MgQ29udGFjdFBhdGNoIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNhcGFjaXR5KSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IGdlbmVyYXRlVVVJRCgpO1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy5jYXBhY2l0eSA9IGNhcGFjaXR5O1xyXG4gICAgICAgIHRoaXMucG9wID0gMDtcclxuICAgICAgICB0aGlzLm1lbWJlcnMgPSB7fTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBkZWZhdWx0RnJlcUYoYSwgYikge1xyXG4gICAgICAgIHZhciB2YWwgPSAoNTAgLSBNYXRoLmFicyhhLmFnZSAtIGIuYWdlKSkgLyAxMDA7XHJcbiAgICAgICAgcmV0dXJuIHZhbDtcclxuICAgIH1cclxuICAgIHN0YXRpYyBkZWZhdWx0Q29udGFjdEYoYSwgdGltZSkge1xyXG4gICAgICAgIHZhciBjID0gMiAqIE1hdGguc2luKHRpbWUpICsgYTtcclxuICAgICAgICBpZiAoYyA+PSAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGFzc2lnbihhZ2VudCwgY29udGFjdFZhbHVlRnVuYykge1xyXG4gICAgICAgIHZhciBjb250YWN0VmFsdWU7XHJcbiAgICAgICAgY29udGFjdFZhbHVlRnVuYyA9IGNvbnRhY3RWYWx1ZUZ1bmMgfHwgQ29udGFjdFBhdGNoLmRlZmF1bHRGcmVxRjtcclxuICAgICAgICBpZiAodGhpcy5wb3AgPCB0aGlzLmNhcGFjaXR5KSB7XHJcbiAgICAgICAgICAgIHRoaXMubWVtYmVyc1thZ2VudC5pZF0gPSB7IHByb3BlcnRpZXM6IGFnZW50IH07XHJcbiAgICAgICAgICAgIGZvciAobGV0IG90aGVyIGluIHRoaXMubWVtYmVycykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGlkID0gcGFyc2VJbnQob3RoZXIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG90aGVyICE9PSBhZ2VudC5pZCAmJiAhaXNOYU4oaWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGFjdFZhbHVlID0gY29udGFjdFZhbHVlRnVuYyh0aGlzLm1lbWJlcnNbaWRdLnByb3BlcnRpZXMsIGFnZW50KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbWJlcnNbYWdlbnQuaWRdW2lkXSA9IGNvbnRhY3RWYWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbWJlcnNbaWRdW2FnZW50LmlkXSA9IGNvbnRhY3RWYWx1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnBvcCsrO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVuY291bnRlcnMoYWdlbnQsIHByZWNvbmRpdGlvbiwgY29udGFjdEZ1bmMsIHJlc3VsdEtleSwgc2F2ZSA9IGZhbHNlKSB7XHJcbiAgICAgICAgY29udGFjdEZ1bmMgPSBjb250YWN0RnVuYyB8fCBDb250YWN0UGF0Y2guZGVmYXVsdENvbnRhY3RGO1xyXG4gICAgICAgIGxldCBjb250YWN0VmFsO1xyXG4gICAgICAgIGZvciAodmFyIGNvbnRhY3QgaW4gdGhpcy5tZW1iZXJzKSB7XHJcbiAgICAgICAgICAgIGlmIChwcmVjb25kaXRpb24ua2V5ID09PSAnc3RhdGVzJykge1xyXG4gICAgICAgICAgICAgICAgY29udGFjdFZhbCA9IEpTT04uc3RyaW5naWZ5KHRoaXMubWVtYmVyc1tjb250YWN0XS5wcm9wZXJ0aWVzW3ByZWNvbmRpdGlvbi5rZXldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnRhY3RWYWwgPSB0aGlzLm1lbWJlcnNbY29udGFjdF0ucHJvcGVydGllc1twcmVjb25kaXRpb24ua2V5XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocHJlY29uZGl0aW9uLmNoZWNrKHRoaXMubWVtYmVyc1tjb250YWN0XS5wcm9wZXJ0aWVzW3ByZWNvbmRpdGlvbi5rZXldLCBwcmVjb25kaXRpb24udmFsdWUpICYmIE51bWJlcihjb250YWN0KSAhPT0gYWdlbnQuaWQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBvbGRWYWwgPSB0aGlzLm1lbWJlcnNbY29udGFjdF0ucHJvcGVydGllc1tyZXN1bHRLZXldO1xyXG4gICAgICAgICAgICAgICAgdmFyIG5ld1ZhbCA9IGNvbnRhY3RGdW5jKHRoaXMubWVtYmVyc1tjb250YWN0XSwgYWdlbnQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG9sZFZhbCAhPT0gbmV3VmFsICYmIHNhdmUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbWJlcnNbY29udGFjdF0ucHJvcGVydGllc1tyZXN1bHRLZXldID0gbmV3VmFsO1xyXG4gICAgICAgICAgICAgICAgICAgIENvbnRhY3RQYXRjaC5XSVdBcnJheS5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0Y2hJRDogdGhpcy5pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZlY3RlZDogY29udGFjdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5mZWN0ZWRBZ2U6IHRoaXMubWVtYmVyc1tjb250YWN0XS5wcm9wZXJ0aWVzLmFnZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiB0aGlzLm1lbWJlcnNbY29udGFjdF0ucHJvcGVydGllc1tyZXN1bHRLZXldLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRLZXk6IHJlc3VsdEtleSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnk6IGFnZW50LmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBieUFnZTogYWdlbnQuYWdlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lOiBhZ2VudC50aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuQ29udGFjdFBhdGNoLldJV0FycmF5ID0gW107XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbnRhY3RQYXRjaC5qcy5tYXAiLCJpbXBvcnQgeyBzaHVmZmxlIH0gZnJvbSAnLi91dGlscyc7XHJcbi8qKlxyXG4qRW52aXJvbm1lbnRzIGFyZSB0aGUgZXhlY3V0YWJsZSBlbnZpcm9ubWVudCBjb250YWluaW5nIHRoZSBtb2RlbCBjb21wb25lbnRzLFxyXG4qc2hhcmVkIHJlc291cmNlcywgYW5kIHNjaGVkdWxlci5cclxuKi9cclxuZXhwb3J0IGNsYXNzIEVudmlyb25tZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKHJlc291cmNlcyA9IFtdLCBmYWNpbGl0aWVzID0gW10sIGV2ZW50c1F1ZXVlID0gW10sIGFjdGl2YXRpb25UeXBlID0gJ3JhbmRvbScsIHJuZyA9IE1hdGgpIHtcclxuICAgICAgICB0aGlzLnRpbWUgPSAwO1xyXG4gICAgICAgIHRoaXMudGltZU9mRGF5ID0gMDtcclxuICAgICAgICB0aGlzLm1vZGVscyA9IFtdO1xyXG4gICAgICAgIHRoaXMuaGlzdG9yeSA9IFtdO1xyXG4gICAgICAgIHRoaXMuYWdlbnRzID0gW107XHJcbiAgICAgICAgdGhpcy5yZXNvdXJjZXMgPSByZXNvdXJjZXM7XHJcbiAgICAgICAgdGhpcy5mYWNpbGl0aWVzID0gZmFjaWxpdGllcztcclxuICAgICAgICB0aGlzLmV2ZW50c1F1ZXVlID0gZXZlbnRzUXVldWU7XHJcbiAgICAgICAgdGhpcy5hY3RpdmF0aW9uVHlwZSA9IGFjdGl2YXRpb25UeXBlO1xyXG4gICAgICAgIHRoaXMucm5nID0gcm5nO1xyXG4gICAgICAgIHRoaXMuX2FnZW50SW5kZXggPSB7fTtcclxuICAgIH1cclxuICAgIC8qKiBBZGQgYSBtb2RlbCBjb21wb25lbnRzIGZyb20gdGhlIGVudmlyb25tZW50XHJcbiAgICAqIEBwYXJhbSBjb21wb25lbnQgdGhlIG1vZGVsIGNvbXBvbmVudCBvYmplY3QgdG8gYmUgYWRkZWQgdG8gdGhlIGVudmlyb25tZW50LlxyXG4gICAgKi9cclxuICAgIGFkZChjb21wb25lbnQpIHtcclxuICAgICAgICB0aGlzLm1vZGVscy5wdXNoKGNvbXBvbmVudCk7XHJcbiAgICB9XHJcbiAgICAvKiogUmVtb3ZlIGEgbW9kZWwgY29tcG9uZW50cyBmcm9tIHRoZSBlbnZpcm9ubWVudCBieSBpZFxyXG4gICAgKiBAcGFyYW0gaWQgVVVJRCBvZiB0aGUgY29tcG9uZW50IHRvIGJlIHJlbW92ZWQuXHJcbiAgICAqL1xyXG4gICAgcmVtb3ZlKGlkKSB7XHJcbiAgICAgICAgdmFyIGRlbGV0ZUluZGV4LCBMID0gdGhpcy5hZ2VudHMubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMubW9kZWxzLmZvckVhY2goZnVuY3Rpb24gKGMsIGluZGV4KSB7IGlmIChjLmlkID09PSBpZCkge1xyXG4gICAgICAgICAgICBkZWxldGVJbmRleCA9IGluZGV4O1xyXG4gICAgICAgIH0gfSk7XHJcbiAgICAgICAgd2hpbGUgKEwgPiAwICYmIHRoaXMuYWdlbnRzLmxlbmd0aCA+PSAwKSB7XHJcbiAgICAgICAgICAgIEwtLTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYWdlbnRzW0xdLm1vZGVsSW5kZXggPT09IGRlbGV0ZUluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFnZW50cy5zcGxpY2UoTCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5tb2RlbHMuc3BsaWNlKGRlbGV0ZUluZGV4LCAxKTtcclxuICAgIH1cclxuICAgIC8qKiBSdW4gYWxsIGVudmlyb25tZW50IG1vZGVsIGNvbXBvbmVudHMgZnJvbSB0PTAgdW50aWwgdD11bnRpbCB1c2luZyB0aW1lIHN0ZXAgPSBzdGVwXHJcbiAgICAqIEBwYXJhbSBzdGVwIHRoZSBzdGVwIHNpemVcclxuICAgICogQHBhcmFtIHVudGlsIHRoZSBlbmQgdGltZVxyXG4gICAgKiBAcGFyYW0gc2F2ZUludGVydmFsIHNhdmUgZXZlcnkgJ3gnIHN0ZXBzXHJcbiAgICAqL1xyXG4gICAgcnVuKHN0ZXAsIHVudGlsLCBzYXZlSW50ZXJ2YWwpIHtcclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgICAgICB3aGlsZSAodGhpcy50aW1lIDw9IHVudGlsKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKHN0ZXApO1xyXG4gICAgICAgICAgICBsZXQgcmVtID0gKHRoaXMudGltZSAlIHNhdmVJbnRlcnZhbCk7XHJcbiAgICAgICAgICAgIGlmIChyZW0gPCBzdGVwKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY29weSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5hZ2VudHMpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGlzdG9yeSA9IHRoaXMuaGlzdG9yeS5jb25jYXQoY29weSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy50aW1lICs9IHN0ZXA7XHJcbiAgICAgICAgICAgIHRoaXMuZm9ybWF0VGltZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKiBBc3NpZ24gYWxsIGFnZW50cyB0byBhcHByb3ByaWF0ZSBtb2RlbHNcclxuICAgICovXHJcbiAgICBpbml0KCkge1xyXG4gICAgICAgIHRoaXMuX2FnZW50SW5kZXggPSB7fTtcclxuICAgICAgICBmb3IgKGxldCBjID0gMDsgYyA8IHRoaXMubW9kZWxzLmxlbmd0aDsgYysrKSB7XHJcbiAgICAgICAgICAgIGxldCBhbHJlYWR5SW4gPSBbXTtcclxuICAgICAgICAgICAgLy9hc3NpZ24gZWFjaCBhZ2VudCBtb2RlbCBpbmRleGVzIHRvIGhhbmRsZSBhZ2VudHMgYXNzaWduZWQgdG8gbXVsdGlwbGUgbW9kZWxzXHJcbiAgICAgICAgICAgIGZvciAobGV0IGQgPSAwOyBkIDwgdGhpcy5tb2RlbHNbY10uZGF0YS5sZW5ndGg7IGQrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGlkID0gdGhpcy5tb2RlbHNbY10uZGF0YVtkXS5pZDtcclxuICAgICAgICAgICAgICAgIGlmIChpZCBpbiB0aGlzLl9hZ2VudEluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy90aGlzIGFnZW50IGJlbG9uZ3MgdG8gbXVsdGlwbGUgbW9kZWxzLlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZWxzW2NdLmRhdGFbZF0ubW9kZWxzLnB1c2godGhpcy5tb2RlbHNbY10ubmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlbHNbY10uZGF0YVtkXS5tb2RlbEluZGV4ZXMucHVzaChjKTtcclxuICAgICAgICAgICAgICAgICAgICBhbHJlYWR5SW4ucHVzaChpZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvL3RoaXMgYWdlbnQgYmVsb25ncyB0byBvbmx5IG9uZSBtb2RlbCBzbyBmYXIuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWdlbnRJbmRleFtpZF0gPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZWxzW2NdLmRhdGFbZF0ubW9kZWxzID0gW3RoaXMubW9kZWxzW2NdLm5hbWVdO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZWxzW2NdLmRhdGFbZF0ubW9kZWxJbmRleGVzID0gW2NdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vZWxpbWluYXRlIGFueSBkdXBsaWNhdGUgYWdlbnRzIGJ5IGlkXHJcbiAgICAgICAgICAgIHRoaXMubW9kZWxzW2NdLmRhdGEgPSB0aGlzLm1vZGVsc1tjXS5kYXRhLmZpbHRlcigoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFscmVhZHlJbi5pbmRleE9mKGQuaWQpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy9jb25jYXQgdGhlIHJlc3VsdHNcclxuICAgICAgICAgICAgdGhpcy5hZ2VudHMgPSB0aGlzLmFnZW50cy5jb25jYXQodGhpcy5tb2RlbHNbY10uZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqIFVwZGF0ZSBlYWNoIG1vZGVsIGNvbXBlbmVudCBvbmUgdGltZSBzdGVwIGZvcndhcmRcclxuICAgICogQHBhcmFtIHN0ZXAgdGhlIHN0ZXAgc2l6ZVxyXG4gICAgKi9cclxuICAgIHVwZGF0ZShzdGVwKSB7XHJcbiAgICAgICAgdmFyIGluZGV4ID0gMDtcclxuICAgICAgICB3aGlsZSAoaW5kZXggPCB0aGlzLmV2ZW50c1F1ZXVlLmxlbmd0aCAmJiB0aGlzLmV2ZW50c1F1ZXVlW2luZGV4XS5hdCA8PSB0aGlzLnRpbWUpIHtcclxuICAgICAgICAgICAgdGhpcy5ldmVudHNRdWV1ZVtpbmRleF0udHJpZ2dlcigpO1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50c1F1ZXVlW2luZGV4XS50cmlnZ2VyZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5ldmVudHNRdWV1ZVtpbmRleF0udW50aWwgPD0gdGhpcy50aW1lKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV2ZW50c1F1ZXVlLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZhdGlvblR5cGUgPT09IFwicmFuZG9tXCIpIHtcclxuICAgICAgICAgICAgc2h1ZmZsZSh0aGlzLmFnZW50cywgdGhpcy5ybmcpO1xyXG4gICAgICAgICAgICB0aGlzLmFnZW50cy5mb3JFYWNoKChhZ2VudCwgaSkgPT4geyB0aGlzLl9hZ2VudEluZGV4W2FnZW50LmlkXSA9IGk7IH0pOyAvLyByZWFzc2lnbiBhZ2VudFxyXG4gICAgICAgICAgICB0aGlzLmFnZW50cy5mb3JFYWNoKChhZ2VudCwgaSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgYWdlbnQubW9kZWxJbmRleGVzLmZvckVhY2goKG1vZGVsSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVsc1ttb2RlbEluZGV4XS51cGRhdGUoYWdlbnQsIHN0ZXApO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBhZ2VudC50aW1lID0gYWdlbnQudGltZSArIHN0ZXAgfHwgMDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmFjdGl2YXRpb25UeXBlID09PSBcInBhcmFsbGVsXCIpIHtcclxuICAgICAgICAgICAgbGV0IHRlbXBBZ2VudHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuYWdlbnRzKSk7XHJcbiAgICAgICAgICAgIHRlbXBBZ2VudHMuZm9yRWFjaCgoYWdlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGFnZW50Lm1vZGVsSW5kZXhlcy5mb3JFYWNoKChtb2RlbEluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlbHNbbW9kZWxJbmRleF0udXBkYXRlKGFnZW50LCBzdGVwKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5hZ2VudHMuZm9yRWFjaCgoYWdlbnQsIGkpID0+IHtcclxuICAgICAgICAgICAgICAgIGFnZW50Lm1vZGVsSW5kZXhlcy5mb3JFYWNoKChtb2RlbEluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlbHNbbW9kZWxJbmRleF0uYXBwbHkoYWdlbnQsIHRlbXBBZ2VudHNbaV0sIHN0ZXApO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBhZ2VudC50aW1lID0gYWdlbnQudGltZSArIHN0ZXAgfHwgMDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqIEZvcm1hdCBhIHRpbWUgb2YgZGF5LiBDdXJyZW50IHRpbWUgJSAxLlxyXG4gICAgKlxyXG4gICAgKi9cclxuICAgIGZvcm1hdFRpbWUoKSB7XHJcbiAgICAgICAgdGhpcy50aW1lT2ZEYXkgPSB0aGlzLnRpbWUgJSAxO1xyXG4gICAgfVxyXG4gICAgLyoqIEdldHMgYWdlbnQgYnkgaWQuIEEgdXRpbGl0eSBmdW5jdGlvbiB0aGF0XHJcbiAgICAqXHJcbiAgICAqL1xyXG4gICAgZ2V0QWdlbnRCeUlkKGlkKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYWdlbnRzW3RoaXMuX2FnZW50SW5kZXhbaWRdXTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1lbnZpcm9ubWVudC5qcy5tYXAiLCJleHBvcnQgY2xhc3MgRXBpIHtcclxuICAgIHN0YXRpYyBwcmV2YWxlbmNlKGNhc2VzLCB0b3RhbCkge1xyXG4gICAgICAgIHZhciBwcmV2ID0gY2FzZXMgLyB0b3RhbDtcclxuICAgICAgICByZXR1cm4gcHJldjtcclxuICAgIH1cclxuICAgIHN0YXRpYyByaXNrRGlmZmVyZW5jZSh0YWJsZSkge1xyXG4gICAgICAgIHZhciByZCA9IHRhYmxlLmEgLyAodGFibGUuYSArIHRhYmxlLmIpIC0gdGFibGUuYyAvICh0YWJsZS5jICsgdGFibGUuZCk7XHJcbiAgICAgICAgcmV0dXJuIHJkO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIHJpc2tSYXRpbyh0YWJsZSkge1xyXG4gICAgICAgIHZhciBycmF0aW8gPSAodGFibGUuYSAvICh0YWJsZS5hICsgdGFibGUuYikpIC8gKHRhYmxlLmMgLyAodGFibGUuYyArIHRhYmxlLmQpKTtcclxuICAgICAgICByZXR1cm4gcnJhdGlvO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIG9kZHNSYXRpbyh0YWJsZSkge1xyXG4gICAgICAgIHZhciBvciA9ICh0YWJsZS5hICogdGFibGUuZCkgLyAodGFibGUuYiAqIHRhYmxlLmMpO1xyXG4gICAgICAgIHJldHVybiBvcjtcclxuICAgIH1cclxuICAgIHN0YXRpYyBJUEYyRChyb3dUb3RhbHMsIGNvbFRvdGFscywgaXRlcmF0aW9ucywgc2VlZHMpIHtcclxuICAgICAgICB2YXIgclQgPSAwLCBjVCA9IDAsIHNlZWRDZWxscyA9IHNlZWRzO1xyXG4gICAgICAgIHJvd1RvdGFscy5mb3JFYWNoKGZ1bmN0aW9uIChyLCBpKSB7XHJcbiAgICAgICAgICAgIHJUICs9IHI7XHJcbiAgICAgICAgICAgIHNlZWRDZWxsc1tpXSA9IHNlZWRDZWxsc1tpXSB8fCBbXTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBjb2xUb3RhbHMuZm9yRWFjaChmdW5jdGlvbiAoYywgaikge1xyXG4gICAgICAgICAgICBjVCArPSBjO1xyXG4gICAgICAgICAgICBzZWVkQ2VsbHMuZm9yRWFjaChmdW5jdGlvbiAocm93LCBrKSB7XHJcbiAgICAgICAgICAgICAgICBzZWVkQ2VsbHNba11bal0gPSBzZWVkQ2VsbHNba11bal0gfHwgTWF0aC5yb3VuZChyb3dUb3RhbHNba10gLyByb3dUb3RhbHMubGVuZ3RoICsgKGNvbFRvdGFsc1tqXSAvIGNvbFRvdGFscy5sZW5ndGgpIC8gMiAqIE1hdGgucmFuZG9tKCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoclQgPT09IGNUKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGl0ZXIgPSAwOyBpdGVyIDwgaXRlcmF0aW9uczsgaXRlcisrKSB7XHJcbiAgICAgICAgICAgICAgICBzZWVkQ2VsbHMuZm9yRWFjaChmdW5jdGlvbiAocm93LCBpaSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50Um93VG90YWwgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIHJvdy5mb3JFYWNoKGZ1bmN0aW9uIChjZWxsLCBqKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRSb3dUb3RhbCArPSBjZWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJvdy5mb3JFYWNoKGZ1bmN0aW9uIChjZWxsLCBqaikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWVkQ2VsbHNbaWldW2pqXSA9IGNlbGwgLyBjdXJyZW50Um93VG90YWw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZWRDZWxsc1tpaV1bampdICo9IHJvd1RvdGFsc1tpaV07XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IGNvbFRvdGFscy5sZW5ndGg7IGNvbCsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRDb2xUb3RhbCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VlZENlbGxzLmZvckVhY2goZnVuY3Rpb24gKHIsIGspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudENvbFRvdGFsICs9IHJbY29sXTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBzZWVkQ2VsbHMuZm9yRWFjaChmdW5jdGlvbiAocm93LCBraykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWVkQ2VsbHNba2tdW2NvbF0gPSByb3dbY29sXSAvIGN1cnJlbnRDb2xUb3RhbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VlZENlbGxzW2trXVtjb2xdICo9IGNvbFRvdGFsc1tjb2xdO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzZWVkQ2VsbHM7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWVwaS5qcy5tYXAiLCIvKiogRXZlbnRzIGNsYXNzIGluY2x1ZGVzIG1ldGhvZHMgZm9yIG9yZ2FuaXppbmcgZXZlbnRzLlxyXG4qXHJcbiovXHJcbmV4cG9ydCBjbGFzcyBFdmVudHMge1xyXG4gICAgY29uc3RydWN0b3IoZXZlbnRzID0gW10pIHtcclxuICAgICAgICB0aGlzLnF1ZXVlID0gW107XHJcbiAgICAgICAgdGhpcy5zY2hlZHVsZShldmVudHMpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAqIHNjaGVkdWxlIGFuIGV2ZW50IHdpdGggdGhlIHNhbWUgdHJpZ2dlciBtdWx0aXBsZSB0aW1lcy5cclxuICAgICogQHBhcmFtIHFldmVudCBpcyB0aGUgZXZlbnQgdG8gYmUgc2NoZWR1bGVkLiBUaGUgYXQgcGFyYW1ldGVyIHNob3VsZCBjb250YWluIHRoZSB0aW1lIGF0IGZpcnN0IGluc3RhbmNlLlxyXG4gICAgKiBAcGFyYW0gZXZlcnkgaW50ZXJ2YWwgZm9yIGVhY2ggb2NjdXJuY2VcclxuICAgICogQHBhcmFtIGVuZCB1bnRpbFxyXG4gICAgKi9cclxuICAgIHNjaGVkdWxlUmVjdXJyaW5nKHFldmVudCwgZXZlcnksIGVuZCkge1xyXG4gICAgICAgIHZhciByZWN1ciA9IFtdO1xyXG4gICAgICAgIHZhciBkdXJhdGlvbiA9IGVuZCAtIHFldmVudC5hdDtcclxuICAgICAgICB2YXIgb2NjdXJlbmNlcyA9IE1hdGguZmxvb3IoZHVyYXRpb24gLyBldmVyeSk7XHJcbiAgICAgICAgaWYgKCFxZXZlbnQudW50aWwpIHtcclxuICAgICAgICAgICAgcWV2ZW50LnVudGlsID0gcWV2ZW50LmF0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBvY2N1cmVuY2VzOyBpKyspIHtcclxuICAgICAgICAgICAgcmVjdXIucHVzaCh7IG5hbWU6IHFldmVudC5uYW1lICsgaSwgYXQ6IHFldmVudC5hdCArIChpICogZXZlcnkpLCB1bnRpbDogcWV2ZW50LnVudGlsICsgKGkgKiBldmVyeSksIHRyaWdnZXI6IHFldmVudC50cmlnZ2VyLCB0cmlnZ2VyZWQ6IGZhbHNlIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNjaGVkdWxlKHJlY3VyKTtcclxuICAgIH1cclxuICAgIC8qXHJcbiAgICAqIHNjaGVkdWxlIGEgb25lIHRpbWUgZXZlbnRzLiB0aGlzIGFycmFuZ2VzIHRoZSBldmVudCBxdWV1ZSBpbiBjaHJvbm9sb2dpY2FsIG9yZGVyLlxyXG4gICAgKiBAcGFyYW0gcWV2ZW50cyBhbiBhcnJheSBvZiBldmVudHMgdG8gYmUgc2NoZWR1bGVzLlxyXG4gICAgKi9cclxuICAgIHNjaGVkdWxlKHFldmVudHMpIHtcclxuICAgICAgICBxZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICAgICAgZC51bnRpbCA9IGQudW50aWwgfHwgZC5hdDtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnF1ZXVlID0gdGhpcy5xdWV1ZS5jb25jYXQocWV2ZW50cyk7XHJcbiAgICAgICAgdGhpcy5xdWV1ZSA9IHRoaXMub3JnYW5pemUodGhpcy5xdWV1ZSwgMCwgdGhpcy5xdWV1ZS5sZW5ndGgpO1xyXG4gICAgfVxyXG4gICAgcGFydGl0aW9uKGFycmF5LCBsZWZ0LCByaWdodCkge1xyXG4gICAgICAgIHZhciBjbXAgPSBhcnJheVtyaWdodCAtIDFdLmF0LCBtaW5FbmQgPSBsZWZ0LCBtYXhFbmQ7XHJcbiAgICAgICAgZm9yIChtYXhFbmQgPSBsZWZ0OyBtYXhFbmQgPCByaWdodCAtIDE7IG1heEVuZCArPSAxKSB7XHJcbiAgICAgICAgICAgIGlmIChhcnJheVttYXhFbmRdLmF0IDw9IGNtcCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zd2FwKGFycmF5LCBtYXhFbmQsIG1pbkVuZCk7XHJcbiAgICAgICAgICAgICAgICBtaW5FbmQgKz0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnN3YXAoYXJyYXksIG1pbkVuZCwgcmlnaHQgLSAxKTtcclxuICAgICAgICByZXR1cm4gbWluRW5kO1xyXG4gICAgfVxyXG4gICAgc3dhcChhcnJheSwgaSwgaikge1xyXG4gICAgICAgIHZhciB0ZW1wID0gYXJyYXlbaV07XHJcbiAgICAgICAgYXJyYXlbaV0gPSBhcnJheVtqXTtcclxuICAgICAgICBhcnJheVtqXSA9IHRlbXA7XHJcbiAgICAgICAgcmV0dXJuIGFycmF5O1xyXG4gICAgfVxyXG4gICAgb3JnYW5pemUoZXZlbnRzLCBsZWZ0LCByaWdodCkge1xyXG4gICAgICAgIGlmIChsZWZ0IDwgcmlnaHQpIHtcclxuICAgICAgICAgICAgdmFyIHAgPSB0aGlzLnBhcnRpdGlvbihldmVudHMsIGxlZnQsIHJpZ2h0KTtcclxuICAgICAgICAgICAgdGhpcy5vcmdhbml6ZShldmVudHMsIGxlZnQsIHApO1xyXG4gICAgICAgICAgICB0aGlzLm9yZ2FuaXplKGV2ZW50cywgcCArIDEsIHJpZ2h0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGV2ZW50cztcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1ldmVudHMuanMubWFwIiwiaW1wb3J0IHsgUUNvbXBvbmVudCB9IGZyb20gJy4vUUNvbXBvbmVudCc7XHJcbmV4cG9ydCBjbGFzcyBTdGF0ZU1hY2hpbmUgZXh0ZW5kcyBRQ29tcG9uZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHN0YXRlcywgdHJhbnNpdGlvbnMsIGNvbmRpdGlvbnMsIGRhdGEpIHtcclxuICAgICAgICBzdXBlcihuYW1lKTtcclxuICAgICAgICB0aGlzLnN0YXRlcyA9IHN0YXRlcztcclxuICAgICAgICB0aGlzLnRyYW5zaXRpb25zID0gdGhpcy5jaGVja1RyYW5zaXRpb25zKHRyYW5zaXRpb25zKTtcclxuICAgICAgICB0aGlzLmNvbmRpdGlvbnMgPSBjb25kaXRpb25zO1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoYWdlbnQsIHN0ZXApIHtcclxuICAgICAgICBmb3IgKHZhciBzIGluIGFnZW50LnN0YXRlcykge1xyXG4gICAgICAgICAgICBsZXQgc3RhdGUgPSBhZ2VudC5zdGF0ZXNbc107XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGVzW3N0YXRlXShhZ2VudCwgc3RlcCk7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy50cmFuc2l0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLnRyYW5zaXRpb25zW2ldLmZyb20ubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdHJhbnMgPSB0aGlzLnRyYW5zaXRpb25zW2ldLmZyb21bal07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zID09PSBzdGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY29uZCA9IHRoaXMuY29uZGl0aW9uc1t0aGlzLnRyYW5zaXRpb25zW2ldLm5hbWVdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgKGNvbmQudmFsdWUpID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGNvbmQudmFsdWUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gY29uZC52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgciA9IGNvbmQuY2hlY2soYWdlbnRbY29uZC5rZXldLCB2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyID09PSBTdGF0ZU1hY2hpbmUuU1VDQ0VTUykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWdlbnQuc3RhdGVzW3NdID0gdGhpcy50cmFuc2l0aW9uc1tpXS50bztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFnZW50W3RoaXMudHJhbnNpdGlvbnNbaV0udG9dID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFnZW50W3RoaXMudHJhbnNpdGlvbnNbaV0uZnJvbV0gPSBmYWxzZTsgLy9mb3IgZWFzaWVyIHJlcG9ydGluZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY2hlY2tUcmFuc2l0aW9ucyh0cmFuc2l0aW9ucykge1xyXG4gICAgICAgIGZvciAodmFyIHQgPSAwOyB0IDwgdHJhbnNpdGlvbnMubGVuZ3RoOyB0KyspIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0cmFuc2l0aW9uc1t0XS5mcm9tID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbnNbdF0uZnJvbSA9IFt0cmFuc2l0aW9uc1t0XS5mcm9tXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cmFuc2l0aW9ucztcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1zdGF0ZU1hY2hpbmUuanMubWFwIiwiaW1wb3J0IHsgZ2VuZXJhdGVVVUlEIH0gZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCB7IFBhdGNoLCBDb21wYXJ0bWVudE1vZGVsIH0gZnJvbSAnLi9jb21wYXJ0bWVudCc7XHJcbmltcG9ydCB7IEVudmlyb25tZW50IH0gZnJvbSAnLi9lbnZpcm9ubWVudCc7XHJcbmltcG9ydCB7IFN0YXRlTWFjaGluZSB9IGZyb20gJy4vc3RhdGVNYWNoaW5lJztcclxuaW1wb3J0IHsgZ2VuZXJhdGVQb3AgfSBmcm9tICcuL3V0aWxzJztcclxuLyoqXHJcbipCYXRjaCBydW4gZW52aXJvbm1lbnRzXHJcbiovXHJcbmV4cG9ydCBjbGFzcyBFeHBlcmltZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKGVudmlyb25tZW50LCBzZXR1cCwgdGFyZ2V0KSB7XHJcbiAgICAgICAgdGhpcy5lbnZpcm9ubWVudCA9IGVudmlyb25tZW50O1xyXG4gICAgICAgIHRoaXMuc2V0dXAgPSBzZXR1cDtcclxuICAgICAgICB0aGlzLnJuZyA9IHNldHVwLmV4cGVyaW1lbnQucm5nO1xyXG4gICAgICAgIHRoaXMuZXhwZXJpbWVudExvZyA9IFtdO1xyXG4gICAgfVxyXG4gICAgc3RhcnQocnVucywgc3RlcCwgdW50aWwpIHtcclxuICAgICAgICB2YXIgciA9IDA7XHJcbiAgICAgICAgd2hpbGUgKHIgPCBydW5zKSB7XHJcbiAgICAgICAgICAgIHRoaXMucHJlcChyLCB0aGlzLnNldHVwKTtcclxuICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC50aW1lID0gMDsgLy9cclxuICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC5ydW4oc3RlcCwgdW50aWwsIDApO1xyXG4gICAgICAgICAgICB0aGlzLmV4cGVyaW1lbnRMb2dbcl0gPSB0aGlzLnJlcG9ydChyLCB0aGlzLnNldHVwKTtcclxuICAgICAgICAgICAgcisrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHByZXAociwgY2ZnLCBhZ2VudHMsIHZpc3VhbGl6ZSkge1xyXG4gICAgICAgIGxldCBncm91cHMgPSB7fTtcclxuICAgICAgICBsZXQgY3VycmVudEFnZW50SWQgPSAwO1xyXG4gICAgICAgIHRoaXMuZW52aXJvbm1lbnQgPSBuZXcgRW52aXJvbm1lbnQoKTtcclxuICAgICAgICBpZiAodHlwZW9mIGNmZy5hZ2VudHMgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGdyTmFtZSBpbiBjZmcuYWdlbnRzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZ3JvdXAgPSBjZmcuYWdlbnRzW2dyTmFtZV07XHJcbiAgICAgICAgICAgICAgICBncm91cHNbZ3JOYW1lXSA9IGdlbmVyYXRlUG9wKGdyb3VwLmNvdW50LCBncm91cC5wYXJhbXMsIGNmZy5lbnZpcm9ubWVudC5zcGF0aWFsVHlwZSwgZ3JvdXAuYm91bmRhcmllcywgY3VycmVudEFnZW50SWQsIHRoaXMucm5nKTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRBZ2VudElkID0gZ3JvdXBzW2dyTmFtZV1bZ3JvdXBzW2dyTmFtZV0ubGVuZ3RoIC0gMV0uaWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjZmcuY29tcG9uZW50cy5mb3JFYWNoKChjbXApID0+IHtcclxuICAgICAgICAgICAgc3dpdGNoIChjbXAudHlwZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnc3RhdGUtbWFjaGluZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNtID0gbmV3IFN0YXRlTWFjaGluZShjbXAubmFtZSwgY21wLnN0YXRlcywgY21wLnRyYW5zaXRpb25zLCBjbXAuY29uZGl0aW9ucywgZ3JvdXBzW2NtcC5hZ2VudHNdWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVudmlyb25tZW50LmFkZChzbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdjb21wYXJ0bWVudGFsJzpcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGF0Y2hlcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGNmZy5wYXRjaGVzLmZvckVhY2goKHBhdGNoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjbXAucGF0Y2hlcy5pbmRleE9mKHBhdGNoLm5hbWUpICE9IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRjaGVzLnB1c2gobmV3IFBhdGNoKHBhdGNoLm5hbWUsIGNtcC5jb21wYXJ0bWVudHMsIHBhdGNoLnBvcHVsYXRpb25zKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY01vZGVsID0gbmV3IENvbXBhcnRtZW50TW9kZWwoJ2NtcC5uYW1lJywgY21wLmNvbXBhcnRtZW50cywgcGF0Y2hlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC5hZGQoY01vZGVsKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2V2ZXJ5LXN0ZXAnOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW52aXJvbm1lbnQuYWRkKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGdlbmVyYXRlVVVJRCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjbXAubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlOiBjbXAuYWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBncm91cHNbY21wLmFnZW50c11bMF1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBzd2l0Y2ggKGNmZy5leHBlcmltZW50KSB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBpZiAociA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmlzdWFsaXplKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVudmlyb25tZW50LnJuZyA9IHRoaXMucm5nO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW52aXJvbm1lbnQucnVuKGNmZy5lbnZpcm9ubWVudC5zdGVwLCBjZmcuZW52aXJvbm1lbnQudW50aWwsIDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmVwb3J0KHIsIGNmZykge1xyXG4gICAgICAgIGxldCBzdW1zID0ge307XHJcbiAgICAgICAgbGV0IG1lYW5zID0ge307XHJcbiAgICAgICAgbGV0IGZyZXFzID0ge307XHJcbiAgICAgICAgbGV0IG1vZGVsID0ge307XHJcbiAgICAgICAgbGV0IGNvdW50ID0gdGhpcy5lbnZpcm9ubWVudC5hZ2VudHMubGVuZ3RoO1xyXG4gICAgICAgIC8vY2ZnLnJlcG9ydC5zdW0gPSBjZmcucmVwb3J0LnN1bS5jb25jYXQoY2ZnLnJlcG9ydC5tZWFuKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZW52aXJvbm1lbnQuYWdlbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBkID0gdGhpcy5lbnZpcm9ubWVudC5hZ2VudHNbaV07XHJcbiAgICAgICAgICAgIGNmZy5yZXBvcnQuc3Vtcy5mb3JFYWNoKChzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzdW1zW3NdID0gc3Vtc1tzXSA9PSB1bmRlZmluZWQgPyBkW3NdIDogZFtzXSArIHN1bXNbc107XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjZmcucmVwb3J0LmZyZXFzLmZvckVhY2goKGYpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICghaXNOYU4oZFtmXSkgJiYgdHlwZW9mIGRbZl0gIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBmcmVxc1tmXSA9IGZyZXFzW2ZdID09IHVuZGVmaW5lZCA/IGRbZl0gOiBkW2ZdICsgZnJlcXNbZl07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoJ2NvbXBhcnRtZW50cycgaW4gZCkge1xyXG4gICAgICAgICAgICAgICAgY2ZnLnJlcG9ydC5jb21wYXJ0bWVudHMuZm9yRWFjaCgoY20pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RlbFtjbV0gPSBtb2RlbFtjbV0gPT0gdW5kZWZpbmVkID8gZC5wb3B1bGF0aW9uc1tjbV0gOiBkLnBvcHVsYXRpb25zW2NtXSArIG1vZGVsW2NtXTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIDtcclxuICAgICAgICBjZmcucmVwb3J0Lm1lYW5zLmZvckVhY2goKG0pID0+IHtcclxuICAgICAgICAgICAgbWVhbnNbbV0gPSBzdW1zW21dIC8gY291bnQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgY291bnQ6IGNvdW50LFxyXG4gICAgICAgICAgICBzdW1zOiBzdW1zLFxyXG4gICAgICAgICAgICBtZWFuczogbWVhbnMsXHJcbiAgICAgICAgICAgIGZyZXFzOiBmcmVxcyxcclxuICAgICAgICAgICAgbW9kZWw6IG1vZGVsXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIC8vb24gZWFjaCBydW4sIGNoYW5nZSBvbmUgcGFyYW0sIGhvbGQgb3RoZXJzIGNvbnN0YW50XHJcbiAgICBzd2VlcChwYXJhbXMsIHJ1bnNQZXIsIGJhc2VsaW5lID0gdHJ1ZSkge1xyXG4gICAgICAgIHZhciBleHBQbGFuID0gW107XHJcbiAgICAgICAgaWYgKGJhc2VsaW5lID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHBhcmFtcy5iYXNlbGluZSA9IFt0cnVlXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBwYXJhbXMpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJhbXNbcHJvcF0ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgcnVuc1BlcjsgaysrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXhwUGxhbi5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW06IHByb3AsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBwYXJhbXNbcHJvcF1baV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bjoga1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucGxhbnMgPSBleHBQbGFuO1xyXG4gICAgfVxyXG4gICAgYm9vdChwYXJhbXMpIHtcclxuICAgICAgICBsZXQgcnVucztcclxuICAgICAgICBmb3IgKGxldCBwYXJhbSBpbiBwYXJhbXMpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBydW5zID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgcnVucyA9IHBhcmFtc1twYXJhbV0ubGVuZ3RoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwYXJhbXNbcGFyYW1dLmxlbmd0aCAhPT0gcnVucykge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgXCJsZW5ndGggb2YgcGFyYW1ldGVyIGFycmF5cyBkaWQgbm90IG1hdGNoXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wbGFucyA9IHBhcmFtcztcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1leHBlcmltZW50LmpzLm1hcCIsImltcG9ydCB7IG5vcm1hbGl6ZSB9IGZyb20gJy4vdXRpbHMnO1xyXG5leHBvcnQgY2xhc3MgR2VuZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihyYW5nZSwgZGlzY3JldGUsIHJuZykge1xyXG4gICAgICAgIGxldCB2YWwgPSBybmcucmFuZFJhbmdlKHJhbmdlWzBdLCByYW5nZVsxXSk7XHJcbiAgICAgICAgaWYgKCFkaXNjcmV0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmNvZGUgPSBub3JtYWxpemUodmFsLCByYW5nZVswXSwgcmFuZ2VbMV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5jb2RlID0gTWF0aC5mbG9vcih2YWwpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgQ2hyb21hc29tZSB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmdlbmVzID0gW107XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Z2VuZXRpYy5qcy5tYXAiLCJpbXBvcnQgeyBFeHBlcmltZW50IH0gZnJvbSAnLi9leHBlcmltZW50JztcclxuaW1wb3J0IHsgQ2hyb21hc29tZSwgR2VuZSB9IGZyb20gJy4vZ2VuZXRpYyc7XHJcbmltcG9ydCB7IGludk5vcm0gfSBmcm9tICcuL3V0aWxzJztcclxuZXhwb3J0IGNsYXNzIEV2b2x1dGlvbmFyeSBleHRlbmRzIEV4cGVyaW1lbnQge1xyXG4gICAgY29uc3RydWN0b3IoZW52aXJvbm1lbnQsIHNldHVwLCBkaXNjcmV0ZSA9IGZhbHNlLCBncmFkaWVudCA9IHRydWUsIG1hdGluZyA9IHRydWUpIHtcclxuICAgICAgICBzdXBlcihlbnZpcm9ubWVudCwgc2V0dXApO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gc2V0dXAuZXZvbHV0aW9uLnRhcmdldDtcclxuICAgICAgICB0aGlzLnJhbmdlcyA9IHNldHVwLmV2b2x1dGlvbi5wYXJhbXM7XHJcbiAgICAgICAgdGhpcy5zaXplID0gc2V0dXAuZXhwZXJpbWVudC5zaXplO1xyXG4gICAgICAgIHRoaXMubWF0aW5nID0gbWF0aW5nO1xyXG4gICAgICAgIGlmICh0aGlzLnNpemUgPCAyKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWF0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZGlzY3JldGUgPSBkaXNjcmV0ZTtcclxuICAgICAgICB0aGlzLmdyYWRpZW50ID0gZ3JhZGllbnQ7XHJcbiAgICAgICAgdGhpcy5wb3B1bGF0aW9uID0gW107XHJcbiAgICAgICAgdGhpcy5tdXRhdGVSYXRlID0gMC4wMztcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc2l6ZTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjaHJvbWEgPSBuZXcgQ2hyb21hc29tZSgpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IHRoaXMucmFuZ2VzLmxlbmd0aDsgaysrKSB7XHJcbiAgICAgICAgICAgICAgICBjaHJvbWEuZ2VuZXMucHVzaChuZXcgR2VuZSh0aGlzLnJhbmdlc1trXS5yYW5nZSwgdGhpcy5kaXNjcmV0ZSwgdGhpcy5ybmcpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnBvcHVsYXRpb24ucHVzaChjaHJvbWEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHN0YXJ0KHJ1bnMsIHN0ZXAsIHVudGlsKSB7XHJcbiAgICAgICAgbGV0IHIgPSAwO1xyXG4gICAgICAgIHdoaWxlIChyIDwgcnVucykge1xyXG4gICAgICAgICAgICB0aGlzLnByZXAociwgdGhpcy5zZXR1cCk7XHJcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGlvbi5zb3J0KHRoaXMuYXNjU29ydCk7XHJcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGlvbiA9IHRoaXMucG9wdWxhdGlvbi5zbGljZSgwLCB0aGlzLnNpemUpO1xyXG4gICAgICAgICAgICB0aGlzLmV4cGVyaW1lbnRMb2dbdGhpcy5leHBlcmltZW50TG9nLmxlbmd0aCAtIDFdLmJlc3QgPSB0aGlzLnBvcHVsYXRpb25bMF0uc2NvcmU7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdiZXN0OiAnLCB0aGlzLmV4cGVyaW1lbnRMb2dbdGhpcy5leHBlcmltZW50TG9nLmxlbmd0aCAtIDFdLmJlc3QpO1xyXG4gICAgICAgICAgICByKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLmV4cGVyaW1lbnRMb2c7XHJcbiAgICB9XHJcbiAgICBnZXRQYXJhbXMoY2hyb21hLCBjZmcpIHtcclxuICAgICAgICBsZXQgb3V0ID0ge307XHJcbiAgICAgICAgZm9yIChsZXQgcG0gPSAwOyBwbSA8IHRoaXMucmFuZ2VzLmxlbmd0aDsgcG0rKykge1xyXG4gICAgICAgICAgICBsZXQgY2ZnUG0gPSB0aGlzLnJhbmdlc1twbV07XHJcbiAgICAgICAgICAgIGlmIChjZmdQbS5sZXZlbCA9PT0gJ2FnZW50cycgfHwgdHlwZW9mIGNmZ1BtLmxldmVsID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgb3V0W2NmZ1BtLmxldmVsICsgXCJfXCIgKyBjZmdQbS5uYW1lXSA9IGludk5vcm0oY2hyb21hLmdlbmVzW3BtXS5jb2RlLCBjZmdQbS5yYW5nZVswXSwgY2ZnUG0ucmFuZ2VbMV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coY2hyb21hLmdlbmVzW3BtXS5jb2RlKTtcclxuICAgICAgICAgICAgICAgIG91dFtjZmdQbS5sZXZlbCArIFwiX1wiICsgY2ZnUG0ubmFtZV0gPSBpbnZOb3JtKGNocm9tYS5nZW5lc1twbV0uY29kZSwgY2ZnUG0ucmFuZ2VbMF0sIGNmZ1BtLnJhbmdlWzFdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3V0O1xyXG4gICAgfVxyXG4gICAgZHNjU29ydChhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEuc2NvcmUgPiBiLnNjb3JlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoYS5zY29yZSA8IGIuc2NvcmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgYXNjU29ydChhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEuc2NvcmUgPiBiLnNjb3JlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChhLnNjb3JlIDwgYi5zY29yZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgcHJlcChyLCBjZmcpIHtcclxuICAgICAgICBpZiAodGhpcy5tYXRpbmcpIHtcclxuICAgICAgICAgICAgbGV0IHRvcFBlcmNlbnQgPSBNYXRoLnJvdW5kKDAuMSAqIHRoaXMuc2l6ZSkgKyAyOyAvL3RlbiBwZXJjZW50IG9mIG9yaWdpbmFsIHNpemUgKyAyXHJcbiAgICAgICAgICAgIGxldCBjaGlsZHJlbiA9IHRoaXMubWF0ZSh0b3BQZXJjZW50KTtcclxuICAgICAgICAgICAgdGhpcy5wb3B1bGF0aW9uID0gdGhpcy5wb3B1bGF0aW9uLmNvbmNhdChjaGlsZHJlbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgdGhpcy5wb3B1bGF0aW9uLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMubXV0YXRlKHRoaXMucG9wdWxhdGlvbltpXSwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5wb3B1bGF0aW9uLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHBtID0gMDsgcG0gPCB0aGlzLnJhbmdlcy5sZW5ndGg7IHBtKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBjZmdQbSA9IHRoaXMucmFuZ2VzW3BtXTtcclxuICAgICAgICAgICAgICAgIGxldCBncm91cElkeDtcclxuICAgICAgICAgICAgICAgIGlmIChjZmdQbS5sZXZlbCA9PT0gJ2FnZW50cycgfHwgdHlwZW9mIGNmZ1BtLmxldmVsID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNmZy5hZ2VudHNbY2ZnUG0uZ3JvdXBdLnBhcmFtc1tjZmdQbS5uYW1lXS5hc3NpZ24gPSBpbnZOb3JtKHRoaXMucG9wdWxhdGlvbltqXS5nZW5lc1twbV0uY29kZSwgY2ZnUG0ucmFuZ2VbMF0sIGNmZ1BtLnJhbmdlWzFdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNmZ1tjZmdQbS5sZXZlbF0ucGFyYW1zW2NmZ1BtLmdyb3VwXVtjZmdQbS5uYW1lXSA9IGludk5vcm0odGhpcy5wb3B1bGF0aW9uW2pdLmdlbmVzW3BtXS5jb2RlLCBjZmdQbS5yYW5nZVswXSwgY2ZnUG0ucmFuZ2VbMV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN1cGVyLnByZXAociwgY2ZnKTtcclxuICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC50aW1lID0gMDtcclxuICAgICAgICAgICAgbGV0IHByZWRpY3QgPSB0aGlzLnJlcG9ydChyLCBjZmcpO1xyXG4gICAgICAgICAgICB0aGlzLnBvcHVsYXRpb25bal0uc2NvcmUgPSB0aGlzLmNvc3QocHJlZGljdCwgdGhpcy50YXJnZXQpO1xyXG4gICAgICAgICAgICB0aGlzLmV4cGVyaW1lbnRMb2cucHVzaChwcmVkaWN0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjb3N0KHByZWRpY3QsIHRhcmdldCkge1xyXG4gICAgICAgIGxldCBkZXYgPSAwO1xyXG4gICAgICAgIGxldCBkaW1lbnNpb25zID0gMDtcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gdGFyZ2V0Lm1lYW5zKSB7XHJcbiAgICAgICAgICAgIGRldiArPSB0YXJnZXQubWVhbnNba2V5XSAtIHByZWRpY3QubWVhbnNba2V5XTtcclxuICAgICAgICAgICAgZGltZW5zaW9ucysrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gdGFyZ2V0LmZyZXFzKSB7XHJcbiAgICAgICAgICAgIGRldiArPSB0YXJnZXQuZnJlcXNba2V5XSAtIHByZWRpY3QuZnJlcXNba2V5XTtcclxuICAgICAgICAgICAgZGltZW5zaW9ucysrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gdGFyZ2V0Lm1vZGVsKSB7XHJcbiAgICAgICAgICAgIGRldiArPSB0YXJnZXQubW9kZWxba2V5XSAtIHByZWRpY3QubW9kZWxba2V5XTtcclxuICAgICAgICAgICAgZGltZW5zaW9ucysrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gTWF0aC5wb3coZGV2LCAyKSAvIGRpbWVuc2lvbnM7XHJcbiAgICB9XHJcbiAgICByZXBvcnQociwgY2ZnKSB7XHJcbiAgICAgICAgcmV0dXJuIHN1cGVyLnJlcG9ydChyLCBjZmcpO1xyXG4gICAgfVxyXG4gICAgbWF0ZShwYXJlbnRzKSB7XHJcbiAgICAgICAgbGV0IG51bUNoaWxkcmVuID0gMC41ICogdGhpcy5yYW5nZXMubGVuZ3RoICogdGhpcy5yYW5nZXMubGVuZ3RoO1xyXG4gICAgICAgIGxldCBjaGlsZHJlbiA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtQ2hpbGRyZW47IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgY2hpbGQgPSBuZXcgQ2hyb21hc29tZSgpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMucmFuZ2VzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZ2VuZSA9IG5ldyBHZW5lKFt0aGlzLnJhbmdlc1tqXS5yYW5nZVswXSwgdGhpcy5yYW5nZXNbal0ucmFuZ2VbMV1dLCB0aGlzLmRpc2NyZXRlLCB0aGlzLnJuZyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmFuZCA9IE1hdGguZmxvb3IodGhpcy5ybmcucmFuZG9tKCkgKiBwYXJlbnRzKTtcclxuICAgICAgICAgICAgICAgIGxldCBleHByZXNzZWQgPSB0aGlzLnBvcHVsYXRpb25bcmFuZF0uZ2VuZXMuc2xpY2UoaiwgaiArIDEpO1xyXG4gICAgICAgICAgICAgICAgZ2VuZS5jb2RlID0gZXhwcmVzc2VkWzBdLmNvZGU7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5nZW5lcy5wdXNoKGdlbmUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNoaWxkcmVuLnB1c2goY2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2hpbGRyZW47XHJcbiAgICB9XHJcbiAgICBtdXRhdGUoY2hyb21hLCBjaGFuY2UpIHtcclxuICAgICAgICBpZiAodGhpcy5ybmcucmFuZG9tKCkgPiBjaGFuY2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgYmVzdCA9IHRoaXMucG9wdWxhdGlvblswXS5nZW5lcztcclxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGNocm9tYS5nZW5lcy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBsZXQgZ2VuZSA9IGNocm9tYS5nZW5lc1tqXTtcclxuICAgICAgICAgICAgbGV0IGRpZmY7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmdyYWRpZW50KSB7XHJcbiAgICAgICAgICAgICAgICBkaWZmID0gYmVzdFtqXS5jb2RlIC0gZ2VuZS5jb2RlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZGlmZiA9IHRoaXMucm5nLnJhbmRSYW5nZSgtMSwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IHVwT3JEb3duID0gZGlmZiA+IDAgPyAxIDogLTE7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5kaXNjcmV0ZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRpZmYgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGdlbmUuY29kZSArPSB0aGlzLnJuZy5ub3JtYWwoMCwgMC4yKSAqIHRoaXMubXV0YXRlUmF0ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGdlbmUuY29kZSArPSBkaWZmICogdGhpcy5tdXRhdGVSYXRlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZ2VuZS5jb2RlICs9IHVwT3JEb3duO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGdlbmUuY29kZSA9IE1hdGgubWluKE1hdGgubWF4KDAsIGdlbmUuY29kZSksIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1ldm9sdXRpb25hcnkuanMubWFwIiwiaW1wb3J0IHsgUUNvbXBvbmVudCB9IGZyb20gJy4vUUNvbXBvbmVudCc7XHJcbmltcG9ydCB7IFNVQ0NFU1MgfSBmcm9tICcuL3V0aWxzJztcclxuZXhwb3J0IGNsYXNzIEh5YnJpZEF1dG9tYXRhIGV4dGVuZHMgUUNvbXBvbmVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBkYXRhLCBmbG93U2V0LCBmbG93TWFwLCBqdW1wU2V0LCBqdW1wTWFwKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSk7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgICAgICB0aGlzLmZsb3dTZXQgPSBmbG93U2V0O1xyXG4gICAgICAgIHRoaXMuZmxvd01hcCA9IGZsb3dNYXA7XHJcbiAgICAgICAgdGhpcy5qdW1wU2V0ID0ganVtcFNldDtcclxuICAgICAgICB0aGlzLmp1bXBNYXAgPSBqdW1wTWFwO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlKGFnZW50LCBzdGVwKSB7XHJcbiAgICAgICAgbGV0IHRlbXAgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGFnZW50KSk7XHJcbiAgICAgICAgZm9yICh2YXIgbW9kZSBpbiB0aGlzLmp1bXBTZXQpIHtcclxuICAgICAgICAgICAgbGV0IGVkZ2UgPSB0aGlzLmp1bXBTZXRbbW9kZV07XHJcbiAgICAgICAgICAgIGxldCBlZGdlU3RhdGUgPSBlZGdlLmNoZWNrKGFnZW50W2VkZ2Uua2V5XSwgZWRnZS52YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmIChlZGdlU3RhdGUgPT09IFNVQ0NFU1MgJiYgbW9kZSAhPSBhZ2VudC5jdXJyZW50TW9kZSkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBhZ2VudFtlZGdlLmtleV0gPSB0aGlzLmp1bXBNYXBbZWRnZS5rZXldW2FnZW50LmN1cnJlbnRNb2RlXVttb2RlXShhZ2VudFtlZGdlLmtleV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGFnZW50LmN1cnJlbnRNb2RlID0gbW9kZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhdGNoIChFcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL25vIHRyYW5zaXRpb24gdGhpcyBkaXJlY3Rpb247XHJcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhFcnIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLmZsb3dNYXApIHtcclxuICAgICAgICAgICAgICAgIC8vc2Vjb25kIG9yZGVyIGludGVncmF0aW9uXHJcbiAgICAgICAgICAgICAgICBsZXQgdGVtcEQgPSB0aGlzLmZsb3dNYXBba2V5XVthZ2VudC5jdXJyZW50TW9kZV0oYWdlbnRba2V5XSk7XHJcbiAgICAgICAgICAgICAgICB0ZW1wW2tleV0gPSBhZ2VudFtrZXldICsgdGVtcEQ7XHJcbiAgICAgICAgICAgICAgICBhZ2VudFtrZXldICs9IDAuNSAqICh0ZW1wRCArIHRoaXMuZmxvd01hcFtrZXldW2FnZW50LmN1cnJlbnRNb2RlXSh0ZW1wW2tleV0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1oYS5qcy5tYXAiLCJpbXBvcnQgeyBRQ29tcG9uZW50IH0gZnJvbSAnLi9RQ29tcG9uZW50JztcclxuaW1wb3J0IHsgZ2VuZXJhdGVVVUlEIH0gZnJvbSAnLi91dGlscyc7XHJcbi8vSGllcmFyY2hhbCBUYXNrIE5ldHdvcmtcclxuZXhwb3J0IGNsYXNzIEhUTlBsYW5uZXIgZXh0ZW5kcyBRQ29tcG9uZW50IHtcclxuICAgIHN0YXRpYyB0aWNrKG5vZGUsIHRhc2ssIGFnZW50KSB7XHJcbiAgICAgICAgaWYgKGFnZW50LnJ1bm5pbmdMaXN0KSB7XHJcbiAgICAgICAgICAgIGFnZW50LnJ1bm5pbmdMaXN0LnB1c2gobm9kZS5uYW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGFnZW50LnJ1bm5pbmdMaXN0ID0gW25vZGUubmFtZV07XHJcbiAgICAgICAgICAgIGFnZW50LnN1Y2Nlc3NMaXN0ID0gW107XHJcbiAgICAgICAgICAgIGFnZW50LmJhcnJpZXJMaXN0ID0gW107XHJcbiAgICAgICAgICAgIGFnZW50LmJsYWNrYm9hcmQgPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHN0YXRlID0gbm9kZS52aXNpdChhZ2VudCwgdGFzayk7XHJcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG4gICAgY29uc3RydWN0b3IobmFtZSwgcm9vdCwgdGFzaywgZGF0YSkge1xyXG4gICAgICAgIHN1cGVyKG5hbWUpO1xyXG4gICAgICAgIHRoaXMucm9vdCA9IHJvb3Q7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgICAgICB0aGlzLnN1bW1hcnkgPSBbXTtcclxuICAgICAgICB0aGlzLnJlc3VsdHMgPSBbXTtcclxuICAgICAgICB0aGlzLnRhc2sgPSB0YXNrO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlKGFnZW50LCBzdGVwKSB7XHJcbiAgICAgICAgLy9pdGVyYXRlIGFuIGFnZW50KGRhdGEpIHRocm91Z2ggdGhlIHRhc2sgbmV0d29ya1xyXG4gICAgICAgIGFnZW50LmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgSFROUGxhbm5lci50aWNrKHRoaXMucm9vdCwgdGhpcy50YXNrLCBhZ2VudCk7XHJcbiAgICAgICAgaWYgKGFnZW50LnN1Y2Nlc3NMaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgYWdlbnQuc3VjY2VlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBhZ2VudC5zdWNjZWVkID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGFnZW50LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBIVE5Sb290VGFzayB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBnb2Fscykge1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy5nb2FscyA9IGdvYWxzO1xyXG4gICAgfVxyXG4gICAgZXZhbHVhdGVHb2FsKGFnZW50KSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdCwgZztcclxuICAgICAgICBmb3IgKHZhciBwID0gMDsgcCA8IHRoaXMuZ29hbHMubGVuZ3RoOyBwKyspIHtcclxuICAgICAgICAgICAgZyA9IHRoaXMuZ29hbHNbcF07XHJcbiAgICAgICAgICAgIGlmIChnLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGcuY2hlY2soZy5kYXRhW2cua2V5XSwgZy52YWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBnLmNoZWNrKGFnZW50W2cua2V5XSwgZy52YWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEhUTk5vZGUge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgcHJlY29uZGl0aW9ucykge1xyXG4gICAgICAgIHRoaXMuaWQgPSBnZW5lcmF0ZVVVSUQoKTtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMucHJlY29uZGl0aW9ucyA9IHByZWNvbmRpdGlvbnM7XHJcbiAgICB9XHJcbiAgICBldmFsdWF0ZVByZUNvbmRzKGFnZW50KSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdDtcclxuICAgICAgICBpZiAodGhpcy5wcmVjb25kaXRpb25zIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgcCA9IDA7IHAgPCB0aGlzLnByZWNvbmRpdGlvbnMubGVuZ3RoOyBwKyspIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMucHJlY29uZGl0aW9uc1twXS5jaGVjayhhZ2VudFt0aGlzLnByZWNvbmRpdGlvbnNbcF0ua2V5XSwgdGhpcy5wcmVjb25kaXRpb25zW3BdLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IEhUTlBsYW5uZXIuRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEhUTlBsYW5uZXIuRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBIVE5QbGFubmVyLlNVQ0NFU1M7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEhUTk9wZXJhdG9yIGV4dGVuZHMgSFROTm9kZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBwcmVjb25kaXRpb25zLCBlZmZlY3RzKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSwgcHJlY29uZGl0aW9ucyk7XHJcbiAgICAgICAgdGhpcy50eXBlID0gXCJvcGVyYXRvclwiO1xyXG4gICAgICAgIHRoaXMuZWZmZWN0cyA9IGVmZmVjdHM7XHJcbiAgICAgICAgdGhpcy52aXNpdCA9IGZ1bmN0aW9uIChhZ2VudCwgdGFzaykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5ldmFsdWF0ZVByZUNvbmRzKGFnZW50KSA9PT0gSFROUGxhbm5lci5TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWZmZWN0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWZmZWN0c1tpXShhZ2VudC5ibGFja2JvYXJkWzBdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0YXNrLmV2YWx1YXRlR29hbChhZ2VudC5ibGFja2JvYXJkWzBdKSA9PT0gSFROUGxhbm5lci5TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWdlbnQuc3VjY2Vzc0xpc3QudW5zaGlmdCh0aGlzLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBIVE5QbGFubmVyLlNVQ0NFU1M7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSFROUGxhbm5lci5SVU5OSU5HO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYWdlbnQuYmFycmllckxpc3QudW5zaGlmdCh7IG5hbWU6IHRoaXMubmFtZSwgY29uZGl0aW9uczogdGhpcy5wcmVjb25kaXRpb25zIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIEhUTlBsYW5uZXIuRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgSFROTWV0aG9kIGV4dGVuZHMgSFROTm9kZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBwcmVjb25kaXRpb25zLCBjaGlsZHJlbikge1xyXG4gICAgICAgIHN1cGVyKG5hbWUsIHByZWNvbmRpdGlvbnMpO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IFwibWV0aG9kXCI7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xyXG4gICAgICAgIHRoaXMudmlzaXQgPSBmdW5jdGlvbiAoYWdlbnQsIHRhc2spIHtcclxuICAgICAgICAgICAgdmFyIGNvcHkgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGFnZW50KSk7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBjb3B5LmJsYWNrYm9hcmQ7XHJcbiAgICAgICAgICAgIGFnZW50LmJsYWNrYm9hcmQudW5zaGlmdChjb3B5KTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZXZhbHVhdGVQcmVDb25kcyhhZ2VudCkgPT09IEhUTlBsYW5uZXIuU1VDQ0VTUykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gSFROUGxhbm5lci50aWNrKHRoaXMuY2hpbGRyZW5baV0sIHRhc2ssIGFnZW50KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdGUgPT09IEhUTlBsYW5uZXIuU1VDQ0VTUykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhZ2VudC5zdWNjZXNzTGlzdC51bnNoaWZ0KHRoaXMubmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBIVE5QbGFubmVyLlNVQ0NFU1M7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYWdlbnQuYmFycmllckxpc3QudW5zaGlmdCh7IG5hbWU6IHRoaXMubmFtZSwgY29uZGl0aW9uczogdGhpcy5wcmVjb25kaXRpb25zIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBIVE5QbGFubmVyLkZBSUxFRDtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWh0bi5qcy5tYXAiLCJleHBvcnQgY2xhc3Mga01lYW4ge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSwgcHJvcHMsIGspIHtcclxuICAgICAgICB0aGlzLmNlbnRyb2lkcyA9IFtdO1xyXG4gICAgICAgIHRoaXMubGltaXRzID0ge307XHJcbiAgICAgICAgdGhpcy5pdGVyYXRpb25zID0gMDtcclxuICAgICAgICAvL2NyZWF0ZSBhIGxpbWl0cyBvYmogZm9yIGVhY2ggcHJvcFxyXG4gICAgICAgIHByb3BzLmZvckVhY2gocCA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubGltaXRzW3BdID0ge1xyXG4gICAgICAgICAgICAgICAgbWluOiAxZTE1LFxyXG4gICAgICAgICAgICAgICAgbWF4OiAtMWUxNVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vc2V0IGxpbWl0cyBmb3IgZWFjaCBwcm9wXHJcbiAgICAgICAgZGF0YS5mb3JFYWNoKGQgPT4ge1xyXG4gICAgICAgICAgICBwcm9wcy5mb3JFYWNoKHAgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRbcF0gPiB0aGlzLmxpbWl0c1twXS5tYXgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpbWl0c1twXS5tYXggPSBkW3BdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGRbcF0gPCB0aGlzLmxpbWl0c1twXS5taW4pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpbWl0c1twXS5taW4gPSBkW3BdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvL2NyZWF0ZSBrIHJhbmRvbSBwb2ludHNcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGs7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmNlbnRyb2lkc1tpXSA9IHsgY291bnQ6IDAgfTtcclxuICAgICAgICAgICAgcHJvcHMuZm9yRWFjaChwID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBjZW50cm9pZCA9IE1hdGgucmFuZG9tKCkgKiB0aGlzLmxpbWl0c1twXS5tYXggKyB0aGlzLmxpbWl0c1twXS5taW47XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNlbnRyb2lkc1tpXVtwXSA9IGNlbnRyb2lkO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgICAgICB0aGlzLnByb3BzID0gcHJvcHM7XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgdGhpcy5fYXNzaWduQ2VudHJvaWQoKTtcclxuICAgICAgICB0aGlzLl9tb3ZlQ2VudHJvaWQoKTtcclxuICAgIH1cclxuICAgIHJ1bigpIHtcclxuICAgICAgICBsZXQgZmluaXNoZWQgPSBmYWxzZTtcclxuICAgICAgICB3aGlsZSAoIWZpbmlzaGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2VudHJvaWRzLmZvckVhY2goYyA9PiB7XHJcbiAgICAgICAgICAgICAgICBmaW5pc2hlZCA9IGMuZmluaXNoZWQ7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLml0ZXJhdGlvbnMrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFt0aGlzLmNlbnRyb2lkcywgdGhpcy5kYXRhXTtcclxuICAgIH1cclxuICAgIF9hc3NpZ25DZW50cm9pZCgpIHtcclxuICAgICAgICB0aGlzLmRhdGEuZm9yRWFjaCgoZCwgaikgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZGlzdGFuY2VzID0gW107XHJcbiAgICAgICAgICAgIGxldCB0b3RhbERpc3QgPSBbXTtcclxuICAgICAgICAgICAgbGV0IG1pbkRpc3Q7XHJcbiAgICAgICAgICAgIGxldCBtaW5JbmRleDtcclxuICAgICAgICAgICAgLy9mb3JlYWNoIHBvaW50LCBnZXQgdGhlIHBlciBwcm9wIGRpc3RhbmNlIGZyb20gZWFjaCBjZW50cm9pZFxyXG4gICAgICAgICAgICB0aGlzLmNlbnRyb2lkcy5mb3JFYWNoKChjLCBpKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBkaXN0YW5jZXNbaV0gPSB7fTtcclxuICAgICAgICAgICAgICAgIHRvdGFsRGlzdFtpXSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmZvckVhY2gocCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2VzW2ldW3BdID0gTWF0aC5zcXJ0KChkW3BdIC0gY1twXSkgKiAoZFtwXSAtIGNbcF0pKTtcclxuICAgICAgICAgICAgICAgICAgICB0b3RhbERpc3RbaV0gKz0gZGlzdGFuY2VzW2ldW3BdO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0b3RhbERpc3RbaV0gPSBNYXRoLnNxcnQodG90YWxEaXN0W2ldKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIG1pbkRpc3QgPSBNYXRoLm1pbi5hcHBseShudWxsLCB0b3RhbERpc3QpO1xyXG4gICAgICAgICAgICBtaW5JbmRleCA9IHRvdGFsRGlzdC5pbmRleE9mKG1pbkRpc3QpO1xyXG4gICAgICAgICAgICBkLmNlbnRyb2lkID0gbWluSW5kZXg7XHJcbiAgICAgICAgICAgIGQuZGlzdGFuY2VzID0gZGlzdGFuY2VzO1xyXG4gICAgICAgICAgICB0aGlzLmNlbnRyb2lkc1ttaW5JbmRleF0uY291bnQgKz0gMTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIF9tb3ZlQ2VudHJvaWQoKSB7XHJcbiAgICAgICAgdGhpcy5jZW50cm9pZHMuZm9yRWFjaCgoYywgaSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZGlzdEZyb21DZW50cm9pZCA9IHt9O1xyXG4gICAgICAgICAgICB0aGlzLnByb3BzLmZvckVhY2gocCA9PiBkaXN0RnJvbUNlbnRyb2lkW3BdID0gW10pO1xyXG4gICAgICAgICAgICAvL2dldCB0aGUgcGVyIHByb3AgZGlzdGFuY2VzIGZyb20gdGhlIGNlbnRyb2lkIGFtb25nIGl0cycgYXNzaWduZWQgcG9pbnRzXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YS5mb3JFYWNoKGQgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGQuY2VudHJvaWQgPT09IGkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmZvckVhY2gocCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3RGcm9tQ2VudHJvaWRbcF0ucHVzaChkW3BdKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vaGFuZGxlIGNlbnRyb2lkIHdpdGggbm8gYXNzaWduZWQgcG9pbnRzIChyYW5kb21seSBhc3NpZ24gbmV3KTtcclxuICAgICAgICAgICAgaWYgKGMuY291bnQgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZm9yRWFjaChwID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXN0RnJvbUNlbnRyb2lkW3BdID0gW01hdGgucmFuZG9tKCkgKiB0aGlzLmxpbWl0c1twXS5tYXggKyB0aGlzLmxpbWl0c1twXS5taW5dO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9nZXQgdGhlIHN1bSBhbmQgbWVhbiBwZXIgcHJvcGVydHkgb2YgdGhlIGFzc2lnbmVkIHBvaW50c1xyXG4gICAgICAgICAgICB0aGlzLnByb3BzLmZvckVhY2gocCA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc3VtID0gZGlzdEZyb21DZW50cm9pZFtwXS5yZWR1Y2UoKHByZXYsIG5leHQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJldiArIG5leHQ7XHJcbiAgICAgICAgICAgICAgICB9LCAwKTtcclxuICAgICAgICAgICAgICAgIGxldCBtZWFuID0gc3VtIC8gZGlzdEZyb21DZW50cm9pZFtwXS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGksICdcXCdzIGF2ZXJhZ2UgZGlzdCB3YXMnLCBtZWFuLCAnIHRoZSBjdXJyZW50IHBvcyB3YXMgJywgY1twXSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY1twXSAhPT0gbWVhbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNbcF0gPSBtZWFuO1xyXG4gICAgICAgICAgICAgICAgICAgIGMuZmluaXNoZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBjLmNvdW50ID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGMuZmluaXNoZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1rbWVhbi5qcy5tYXAiLCJleHBvcnQgY2xhc3MgS05OIHtcclxuICAgIHNldE5laWdoYm9ycyhwb2ludCwgZGF0YSwgcGFyYW0sIGNsYXNzaWZpZXIpIHtcclxuICAgICAgICBkYXRhLmZvckVhY2goKGQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGQuaWQgIT09IHBvaW50LmlkKSB7XHJcbiAgICAgICAgICAgICAgICBwb2ludC5uZWlnaGJvcnNbZC5pZF0gPSBwb2ludC5uZWlnaGJvcnNbZC5pZF0gfHwge307XHJcbiAgICAgICAgICAgICAgICBwb2ludC5uZWlnaGJvcnNbZC5pZF1bY2xhc3NpZmllcl0gPSBkW2NsYXNzaWZpZXJdO1xyXG4gICAgICAgICAgICAgICAgcG9pbnQubmVpZ2hib3JzW2QuaWRdW3BhcmFtLnBhcmFtXSA9IE1hdGguYWJzKHBvaW50W3BhcmFtLnBhcmFtXSAtIGRbcGFyYW0ucGFyYW1dKSAvIHBhcmFtLnJhbmdlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBzb3J0KG5laWdoYm9ycywgcGFyYW0pIHtcclxuICAgICAgICB2YXIgbGlzdCA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIG5laWdoIGluIG5laWdoYm9ycykge1xyXG4gICAgICAgICAgICBsaXN0LnB1c2gobmVpZ2hib3JzW25laWdoXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxpc3Quc29ydCgoYSwgYikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoYVtwYXJhbV0gPj0gYltwYXJhbV0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChiW3BhcmFtXSA+PSBhW3BhcmFtXSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBsaXN0O1xyXG4gICAgfVxyXG4gICAgc2V0RGlzdGFuY2VzKGRhdGEsIHRyYWluZWQsIGtQYXJhbXNPYmosIGNsYXNzaWZpZXIpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgZGF0YVtpXS5uZWlnaGJvcnMgPSB7fTtcclxuICAgICAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBrUGFyYW1zT2JqLmxlbmd0aDsgaysrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRhdGFbaV1ba1BhcmFtc09ialtrXS5wYXJhbV0gPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXROZWlnaGJvcnMoZGF0YVtpXSwgdHJhaW5lZCwga1BhcmFtc09ialtrXSwgY2xhc3NpZmllcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yICh2YXIgbiBpbiBkYXRhW2ldLm5laWdoYm9ycykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG5laWdoYm9yID0gZGF0YVtpXS5uZWlnaGJvcnNbbl07XHJcbiAgICAgICAgICAgICAgICB2YXIgZGlzdCA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBwID0gMDsgcCA8IGtQYXJhbXNPYmoubGVuZ3RoOyBwKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBkaXN0ICs9IG5laWdoYm9yW2tQYXJhbXNPYmpbcF0ucGFyYW1dICogbmVpZ2hib3Jba1BhcmFtc09ialtwXS5wYXJhbV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBuZWlnaGJvci5kaXN0YW5jZSA9IE1hdGguc3FydChkaXN0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgIH1cclxuICAgIGdldFJhbmdlKGRhdGEsIGtQYXJhbXMpIHtcclxuICAgICAgICBsZXQgcmFuZ2VzID0gW10sIG1pbiA9IDFlMjAsIG1heCA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBrUGFyYW1zLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGQgPSAwOyBkIDwgZGF0YS5sZW5ndGg7IGQrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGFbZF1ba1BhcmFtc1tqXV0gPCBtaW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBtaW4gPSBkYXRhW2RdW2tQYXJhbXNbal1dO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGFbZF1ba1BhcmFtc1tqXV0gPiBtYXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXggPSBkYXRhW2RdW2tQYXJhbXNbal1dO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJhbmdlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIHBhcmFtOiBrUGFyYW1zW2pdLFxyXG4gICAgICAgICAgICAgICAgbWluOiBtaW4sXHJcbiAgICAgICAgICAgICAgICBtYXg6IG1heCxcclxuICAgICAgICAgICAgICAgIHJhbmdlOiBtYXggLSBtaW5cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIDtcclxuICAgICAgICByZXR1cm4gcmFuZ2VzO1xyXG4gICAgfVxyXG4gICAgY2xhc3NpZnkoZGF0YSwgdHJhaW5lZERhdGEsIGtQYXJhbXMsIGNsYXNzaWZpZXIsIG5lYXJlc3ROKSB7XHJcbiAgICAgICAgbGV0IGtQYXJhbXNPYmogPSB0aGlzLmdldFJhbmdlKFtdLmNvbmNhdChkYXRhLCB0cmFpbmVkRGF0YSksIGtQYXJhbXMpO1xyXG4gICAgICAgIGRhdGEgPSB0aGlzLnNldERpc3RhbmNlcyhkYXRhLCB0cmFpbmVkRGF0YSwga1BhcmFtc09iaiwgY2xhc3NpZmllcik7XHJcbiAgICAgICAgbGV0IG9yZGVyZWQgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBkID0gMDsgZCA8IGRhdGEubGVuZ3RoOyBkKyspIHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdHMgPSB7fTtcclxuICAgICAgICAgICAgb3JkZXJlZCA9IHRoaXMuc29ydChkYXRhW2RdLm5laWdoYm9ycywgJ2Rpc3RhbmNlJyk7XHJcbiAgICAgICAgICAgIGxldCBuID0gMDtcclxuICAgICAgICAgICAgd2hpbGUgKG4gPCBuZWFyZXN0Tikge1xyXG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBvcmRlcmVkW25dW2NsYXNzaWZpZXJdO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0c1tjdXJyZW50XSA9IHJlc3VsdHNbY3VycmVudF0gfHwgMDtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHNbY3VycmVudF0gKz0gMTtcclxuICAgICAgICAgICAgICAgIG4rKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgbWF4ID0gMCwgbGlrZWxpZXN0ID0gJyc7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHBhcmFtIGluIHJlc3VsdHMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHRzW3BhcmFtXSA+IG1heCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1heCA9IHJlc3VsdHNbcGFyYW1dO1xyXG4gICAgICAgICAgICAgICAgICAgIGxpa2VsaWVzdCA9IHBhcmFtO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRhdGFbZF1bY2xhc3NpZmllcl0gPSBsaWtlbGllc3Q7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWtubi5qcy5tYXAiLCJleHBvcnQgY2xhc3MgVmVjdG9yIHtcclxuICAgIGNvbnN0cnVjdG9yKGFycmF5LCBzaXplKSB7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIE1hdHJpeCB7XHJcbiAgICBjb25zdHJ1Y3RvcihtYXQpIHtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgYWN0aXZhdGlvbk1ldGhvZHMge1xyXG4gICAgc3RhdGljIFJlTFUoeCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLm1heCh4LCAwKTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBzaWdtb2lkKHgpIHtcclxuICAgICAgICByZXR1cm4gMSAvICgxICsgTWF0aC5leHAoLXgpKTtcclxuICAgIH1cclxuICAgIHN0YXRpYyB0YW5oKHgpIHtcclxuICAgICAgICBsZXQgdmFsID0gKE1hdGguZXhwKHgpIC0gTWF0aC5leHAoLXgpKSAvIChNYXRoLmV4cCh4KSArIE1hdGguZXhwKC14KSk7XHJcbiAgICAgICAgcmV0dXJuIHZhbDtcclxuICAgIH1cclxufVxyXG47XHJcbmV4cG9ydCBjbGFzcyBkZXJpdml0ZU1ldGhvZHMge1xyXG4gICAgc3RhdGljIFJlTFUodmFsdWUpIHtcclxuICAgICAgICBsZXQgZGVyID0gdmFsdWUgPD0gMCA/IDAgOiAxO1xyXG4gICAgICAgIHJldHVybiBkZXI7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgc2lnbW9pZCh2YWx1ZSkge1xyXG4gICAgICAgIGxldCBzaWcgPSBhY3RpdmF0aW9uTWV0aG9kcy5zaWdtb2lkO1xyXG4gICAgICAgIHJldHVybiBzaWcodmFsdWUpICogKDEgLSBzaWcodmFsdWUpKTtcclxuICAgIH1cclxuICAgIHN0YXRpYyB0YW5oKHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIDEgLSBNYXRoLnBvdyhhY3RpdmF0aW9uTWV0aG9kcy50YW5oKHZhbHVlKSwgMik7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGxvZ2lzdGljKHgsIG0sIGIsIGspIHtcclxuICAgIHZhciB5ID0gMSAvIChtICsgTWF0aC5leHAoLWsgKiAoeCAtIGIpKSk7XHJcbiAgICByZXR1cm4geTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gbG9naXQoeCwgbSwgYiwgaykge1xyXG4gICAgdmFyIHkgPSAxIC8gTWF0aC5sb2coeCAvICgxIC0geCkpO1xyXG4gICAgcmV0dXJuIHk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGxpbmVhcih4LCBtLCBiLCBrKSB7XHJcbiAgICB2YXIgeSA9IG0gKiB4ICsgYjtcclxuICAgIHJldHVybiB5O1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBleHBvbmVudGlhbCh4LCBtLCBiLCBrKSB7XHJcbiAgICB2YXIgeSA9IDEgLSBNYXRoLnBvdyh4LCBrKSAvIE1hdGgucG93KDEsIGspO1xyXG4gICAgcmV0dXJuIHk7XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWF0aC5qcy5tYXAiLCJleHBvcnQgY2xhc3MgTmV0d29yayB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhLCBsYWJlbHMsIGhpZGRlbk51bSwgZWwsIGFjdGl2YXRpb25UeXBlID0gXCJ0YW5oXCIpIHtcclxuICAgICAgICB0aGlzLmVsID0gZWw7XHJcbiAgICAgICAgdGhpcy5pdGVyID0gMDtcclxuICAgICAgICB0aGlzLmNvcnJlY3QgPSAwO1xyXG4gICAgICAgIHRoaXMuaGlkZGVuTnVtID0gaGlkZGVuTnVtO1xyXG4gICAgICAgIHRoaXMubGVhcm5SYXRlID0gMC4wMTtcclxuICAgICAgICB0aGlzLmFjdEZuID0gTmV0d29yay5hY3RpdmF0aW9uTWV0aG9kc1thY3RpdmF0aW9uVHlwZV07XHJcbiAgICAgICAgdGhpcy5kZXJGbiA9IE5ldHdvcmsuZGVyaXZpdGVNZXRob2RzW2FjdGl2YXRpb25UeXBlXTtcclxuICAgICAgICB0aGlzLmluaXQoZGF0YSwgbGFiZWxzKTtcclxuICAgIH1cclxuICAgIGxlYXJuKGl0ZXJhdGlvbnMsIGRhdGEsIGxhYmVscywgcmVuZGVyID0gMTAwKSB7XHJcbiAgICAgICAgdGhpcy5jb3JyZWN0ID0gMDtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZXJhdGlvbnM7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgcmFuZElkeCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGRhdGEubGVuZ3RoKTtcclxuICAgICAgICAgICAgdGhpcy5pdGVyKys7XHJcbiAgICAgICAgICAgIHRoaXMuZm9yd2FyZChkYXRhW3JhbmRJZHhdKTtcclxuICAgICAgICAgICAgbGV0IG1heCA9IC0xO1xyXG4gICAgICAgICAgICBsZXQgbWF4SWR4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy52YWx1ZXMubGVuZ3RoKTtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZXNbdGhpcy52YWx1ZXMubGVuZ3RoIC0gMV0uZm9yRWFjaCgoeCwgaWR4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoeCA+IG1heCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1heElkeCA9IGlkeDtcclxuICAgICAgICAgICAgICAgICAgICBtYXggPSB4O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgbGV0IGd1ZXNzZWQgPSB0aGlzLnZhbHVlc1t0aGlzLnZhbHVlcy5sZW5ndGggLSAxXVttYXhJZHhdID49IDAuNSA/IDEgOiAwO1xyXG4gICAgICAgICAgICBpZiAoZ3Vlc3NlZCA9PT0gbGFiZWxzW3JhbmRJZHhdW21heElkeF0pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29ycmVjdCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuYWNjdXJhY3kgPSB0aGlzLmNvcnJlY3QgLyAoaSArIDEpO1xyXG4gICAgICAgICAgICB0aGlzLmJhY2t3YXJkKGxhYmVsc1tyYW5kSWR4XSk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlV2VpZ2h0cygpO1xyXG4gICAgICAgICAgICB0aGlzLnJlc2V0VG90YWxzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY2xhc3NpZnkoZGF0YSkge1xyXG4gICAgICAgIHRoaXMucmVzZXRUb3RhbHMoKTtcclxuICAgICAgICB0aGlzLmZvcndhcmQoZGF0YSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVzW3RoaXMudmFsdWVzLmxlbmd0aCAtIDFdO1xyXG4gICAgfVxyXG4gICAgaW5pdChkYXRhLCBsYWJlbHMpIHtcclxuICAgICAgICBsZXQgaW5wdXRzID0gW107XHJcbiAgICAgICAgdGhpcy5kZXIgPSBbXTtcclxuICAgICAgICB0aGlzLnZhbHVlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMud2VpZ2h0cyA9IFtdO1xyXG4gICAgICAgIHRoaXMud2VpZ2h0Q2hhbmdlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMudG90YWxzID0gW107XHJcbiAgICAgICAgdGhpcy5kZXJUb3RhbHMgPSBbXTtcclxuICAgICAgICB0aGlzLmJpYXNlcyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IG4gPSAwOyBuIDwgZGF0YVswXS5sZW5ndGg7IG4rKykge1xyXG4gICAgICAgICAgICBpbnB1dHMucHVzaCgwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgdGhpcy5oaWRkZW5OdW0ubGVuZ3RoOyBjb2wrKykge1xyXG4gICAgICAgICAgICB0aGlzLmRlcltjb2xdID0gW107XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWVzW2NvbF0gPSBbXTtcclxuICAgICAgICAgICAgdGhpcy50b3RhbHNbY29sXSA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmRlclRvdGFsc1tjb2xdID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IHRoaXMuaGlkZGVuTnVtW2NvbF07IHJvdysrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlc1tjb2xdW3Jvd10gPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXJbY29sXVtyb3ddID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMudG90YWxzW2NvbF1bcm93XSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlclRvdGFsc1tjb2xdW3Jvd10gPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudmFsdWVzLnVuc2hpZnQoaW5wdXRzKTtcclxuICAgICAgICB0aGlzLnRvdGFscy51bnNoaWZ0KGlucHV0cyk7XHJcbiAgICAgICAgdGhpcy5kZXIudW5zaGlmdChpbnB1dHMpO1xyXG4gICAgICAgIHRoaXMuZGVyVG90YWxzLnVuc2hpZnQoaW5wdXRzKTtcclxuICAgICAgICB0aGlzLnZhbHVlc1t0aGlzLmhpZGRlbk51bS5sZW5ndGggKyAxXSA9IGxhYmVsc1swXS5tYXAoKGwpID0+IHsgcmV0dXJuIDA7IH0pO1xyXG4gICAgICAgIHRoaXMudG90YWxzW3RoaXMuaGlkZGVuTnVtLmxlbmd0aCArIDFdID0gbGFiZWxzWzBdLm1hcCgobCkgPT4geyByZXR1cm4gMDsgfSk7XHJcbiAgICAgICAgdGhpcy5kZXJbdGhpcy5oaWRkZW5OdW0ubGVuZ3RoICsgMV0gPSBsYWJlbHNbMF0ubWFwKChsKSA9PiB7IHJldHVybiAwOyB9KTtcclxuICAgICAgICB0aGlzLmRlclRvdGFsc1t0aGlzLmhpZGRlbk51bS5sZW5ndGggKyAxXSA9IGxhYmVsc1swXS5tYXAoKGwpID0+IHsgcmV0dXJuIDA7IH0pO1xyXG4gICAgICAgIGZvciAobGV0IHdnID0gMDsgd2cgPCB0aGlzLnZhbHVlcy5sZW5ndGggLSAxOyB3ZysrKSB7XHJcbiAgICAgICAgICAgIHRoaXMud2VpZ2h0c1t3Z10gPSBbXTtcclxuICAgICAgICAgICAgdGhpcy53ZWlnaHRDaGFuZ2VzW3dnXSA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmJpYXNlc1t3Z10gPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgc3JjID0gMDsgc3JjIDwgdGhpcy52YWx1ZXNbd2ddLmxlbmd0aDsgc3JjKyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMud2VpZ2h0c1t3Z11bc3JjXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy53ZWlnaHRDaGFuZ2VzW3dnXVtzcmNdID0gW107XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBkc3QgPSAwOyBkc3QgPCB0aGlzLnZhbHVlc1t3ZyArIDFdLmxlbmd0aDsgZHN0KyspIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJpYXNlc1t3Z11bZHN0XSA9IE1hdGgucmFuZG9tKCkgLSAwLjU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53ZWlnaHRzW3dnXVtzcmNdW2RzdF0gPSBNYXRoLnJhbmRvbSgpIC0gMC41O1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2VpZ2h0Q2hhbmdlc1t3Z11bc3JjXVtkc3RdID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJlc2V0VG90YWxzKCkge1xyXG4gICAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IHRoaXMudG90YWxzLmxlbmd0aDsgY29sKyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgdGhpcy50b3RhbHNbY29sXS5sZW5ndGg7IHJvdysrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRvdGFsc1tjb2xdW3Jvd10gPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXJUb3RhbHNbY29sXVtyb3ddID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZvcndhcmQoaW5wdXQpIHtcclxuICAgICAgICB0aGlzLnZhbHVlc1swXSA9IGlucHV0O1xyXG4gICAgICAgIGZvciAobGV0IHdnID0gMDsgd2cgPCB0aGlzLndlaWdodHMubGVuZ3RoOyB3ZysrKSB7XHJcbiAgICAgICAgICAgIGxldCBzcmNWYWxzID0gd2c7XHJcbiAgICAgICAgICAgIGxldCBkc3RWYWxzID0gd2cgKyAxO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBzcmMgPSAwOyBzcmMgPCB0aGlzLndlaWdodHNbd2ddLmxlbmd0aDsgc3JjKyspIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGRzdCA9IDA7IGRzdCA8IHRoaXMud2VpZ2h0c1t3Z11bc3JjXS5sZW5ndGg7IGRzdCsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b3RhbHNbZHN0VmFsc11bZHN0XSArPSB0aGlzLnZhbHVlc1tzcmNWYWxzXVtzcmNdICogdGhpcy53ZWlnaHRzW3dnXVtzcmNdW2RzdF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy52YWx1ZXNbZHN0VmFsc10gPSB0aGlzLnRvdGFsc1tkc3RWYWxzXS5tYXAoKHRvdGFsLCBpZHgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmFjdEZuKHRvdGFsICsgdGhpcy5iaWFzZXNbd2ddW2lkeF0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBiYWNrd2FyZChsYWJlbHMpIHtcclxuICAgICAgICBmb3IgKGxldCB3ZyA9IHRoaXMud2VpZ2h0cy5sZW5ndGggLSAxOyB3ZyA+PSAwOyB3Zy0tKSB7XHJcbiAgICAgICAgICAgIGxldCBzcmNWYWxzID0gd2c7XHJcbiAgICAgICAgICAgIGxldCBkc3RWYWxzID0gd2cgKyAxO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBzcmMgPSAwOyBzcmMgPCB0aGlzLndlaWdodHNbd2ddLmxlbmd0aDsgc3JjKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBlcnIgPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZHN0ID0gMDsgZHN0IDwgdGhpcy53ZWlnaHRzW3dnXVtzcmNdLmxlbmd0aDsgZHN0KyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAod2cgPT09IHRoaXMud2VpZ2h0cy5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVyciArPSBsYWJlbHNbZHN0XSAtIHRoaXMudmFsdWVzW2RzdFZhbHNdW2RzdF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVyW2RzdFZhbHNdW2RzdF0gPSBlcnI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnIgKz0gdGhpcy5kZXJbZHN0VmFsc11bZHN0XSAqIHRoaXMud2VpZ2h0c1t3Z11bc3JjXVtkc3RdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGVyVG90YWxzW3NyY1ZhbHNdW3NyY10gPSBlcnI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlcltzcmNWYWxzXVtzcmNdID0gZXJyICogdGhpcy5kZXJGbih0aGlzLnZhbHVlc1tzcmNWYWxzXVtzcmNdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHVwZGF0ZVdlaWdodHMoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgd2cgPSAwOyB3ZyA8IHRoaXMud2VpZ2h0cy5sZW5ndGg7IHdnKyspIHtcclxuICAgICAgICAgICAgbGV0IHNyY1ZhbHMgPSB3ZztcclxuICAgICAgICAgICAgbGV0IGRzdFZhbHMgPSB3ZyArIDE7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHNyYyA9IDA7IHNyYyA8IHRoaXMud2VpZ2h0c1t3Z10ubGVuZ3RoOyBzcmMrKykge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZHN0ID0gMDsgZHN0IDwgdGhpcy53ZWlnaHRzW3dnXVtzcmNdLmxlbmd0aDsgZHN0KyspIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbW9tZW50dW0gPSB0aGlzLndlaWdodENoYW5nZXNbd2ddW3NyY11bZHN0XSAqIDAuMTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLndlaWdodENoYW5nZXNbd2ddW3NyY11bZHN0XSA9ICh0aGlzLnZhbHVlc1tzcmNWYWxzXVtzcmNdICogdGhpcy5kZXJbZHN0VmFsc11bZHN0XSAqIHRoaXMubGVhcm5SYXRlKSArIG1vbWVudHVtO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2VpZ2h0c1t3Z11bc3JjXVtkc3RdICs9IHRoaXMud2VpZ2h0Q2hhbmdlc1t3Z11bc3JjXVtkc3RdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuYmlhc2VzW3dnXSA9IHRoaXMuYmlhc2VzW3dnXS5tYXAoKGJpYXMsIGlkeCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubGVhcm5SYXRlICogdGhpcy5kZXJbZHN0VmFsc11baWR4XSArIGJpYXM7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIG1zZSgpIHtcclxuICAgICAgICBsZXQgZXJyID0gMDtcclxuICAgICAgICBsZXQgY291bnQgPSAwO1xyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5kZXJUb3RhbHMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgZXJyICs9IHRoaXMuZGVyVG90YWxzW2pdLnJlZHVjZSgobGFzdCwgY3VycmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY291bnQrKztcclxuICAgICAgICAgICAgICAgIHJldHVybiBsYXN0ICsgTWF0aC5wb3coY3VycmVudCwgMik7XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZXJyIC8gY291bnQ7XHJcbiAgICB9XHJcbn1cclxuTmV0d29yay5hY3RpdmF0aW9uTWV0aG9kcyA9IHtcclxuICAgIFJlTFU6IGZ1bmN0aW9uICh4KSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KHgsIDApO1xyXG4gICAgfSxcclxuICAgIHNpZ21vaWQ6IGZ1bmN0aW9uICh4KSB7XHJcbiAgICAgICAgcmV0dXJuIDEgLyAoMSArIE1hdGguZXhwKC14KSk7XHJcbiAgICB9LFxyXG4gICAgdGFuaDogZnVuY3Rpb24gKHgpIHtcclxuICAgICAgICBsZXQgdmFsID0gKE1hdGguZXhwKHgpIC0gTWF0aC5leHAoLXgpKSAvIChNYXRoLmV4cCh4KSArIE1hdGguZXhwKC14KSk7XHJcbiAgICAgICAgcmV0dXJuIHZhbDtcclxuICAgIH1cclxufTtcclxuTmV0d29yay5kZXJpdml0ZU1ldGhvZHMgPSB7XHJcbiAgICBSZUxVOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICBsZXQgZGVyID0gdmFsdWUgPD0gMCA/IDAgOiAxO1xyXG4gICAgICAgIHJldHVybiBkZXI7XHJcbiAgICB9LFxyXG4gICAgc2lnbW9pZDogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgbGV0IHNpZyA9IE5ldHdvcmsuYWN0aXZhdGlvbk1ldGhvZHMuc2lnbW9pZDtcclxuICAgICAgICByZXR1cm4gc2lnKHZhbHVlKSAqICgxIC0gc2lnKHZhbHVlKSk7XHJcbiAgICB9LFxyXG4gICAgdGFuaDogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIDEgLSBNYXRoLnBvdyhOZXR3b3JrLmFjdGl2YXRpb25NZXRob2RzLnRhbmgodmFsdWUpLCAyKTtcclxuICAgIH1cclxufTtcclxuTmV0d29yay5jb3N0TWV0aG9kcyA9IHtcclxuICAgIHNxRXJyOiBmdW5jdGlvbiAodGFyZ2V0LCBndWVzcykge1xyXG4gICAgICAgIHJldHVybiBndWVzcyAtIHRhcmdldDtcclxuICAgIH0sXHJcbiAgICBhYnNFcnI6IGZ1bmN0aW9uICgpIHtcclxuICAgIH1cclxufTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bmV0d29yay5qcy5tYXAiLCJleHBvcnQgY2xhc3MgUUxlYXJuZXIge1xyXG4gICAgLy9UT0RPIC0gY2hhbmdlIGVwaXNvZGUgdG8gdXBkYXRlXHJcbiAgICBjb25zdHJ1Y3RvcihSLCBnYW1tYSwgZ29hbCkge1xyXG4gICAgICAgIHRoaXMucmF3TWF4ID0gMTtcclxuICAgICAgICB0aGlzLlIgPSBSO1xyXG4gICAgICAgIHRoaXMuZ2FtbWEgPSBnYW1tYTtcclxuICAgICAgICB0aGlzLmdvYWwgPSBnb2FsO1xyXG4gICAgICAgIHRoaXMuUSA9IHt9O1xyXG4gICAgICAgIGZvciAodmFyIHN0YXRlIGluIFIpIHtcclxuICAgICAgICAgICAgdGhpcy5RW3N0YXRlXSA9IHt9O1xyXG4gICAgICAgICAgICBmb3IgKHZhciBhY3Rpb24gaW4gUltzdGF0ZV0pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuUVtzdGF0ZV1bYWN0aW9uXSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5nYW1tYSA9IGdhbW1hO1xyXG4gICAgfVxyXG4gICAgZ3JvdyhzdGF0ZSwgYWN0aW9ucykge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWN0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAvL3Jld2FyZCBpcyBjdXJyZW50bHkgdW5rbm93blxyXG4gICAgICAgICAgICB0aGlzLlJbc3RhdGVdW2FjdGlvbnNbaV1dID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBleHBsb3JlKHByb20pIHtcclxuICAgIH1cclxuICAgIHRyYW5zaXRpb24oc3RhdGUsIGFjdGlvbikge1xyXG4gICAgICAgIC8vaXMgdGhlIHN0YXRlIHVuZXhhbWluZWRcclxuICAgICAgICBsZXQgZXhhbWluZWQgPSB0cnVlO1xyXG4gICAgICAgIGxldCBiZXN0QWN0aW9uO1xyXG4gICAgICAgIGZvciAoYWN0aW9uIGluIHRoaXMuUltzdGF0ZV0pIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuUltzdGF0ZV1bYWN0aW9uXSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgYmVzdEFjdGlvbiA9IGFjdGlvbjtcclxuICAgICAgICAgICAgICAgIGV4YW1pbmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgYmVzdEFjdGlvbiA9IHRoaXMubWF4KGFjdGlvbik7XHJcbiAgICAgICAgdGhpcy5RW3N0YXRlXVthY3Rpb25dID0gdGhpcy5SW3N0YXRlXVthY3Rpb25dICsgKHRoaXMuZ2FtbWEgKiB0aGlzLlFbYWN0aW9uXVtiZXN0QWN0aW9uXSk7XHJcbiAgICB9XHJcbiAgICBtYXgoc3RhdGUpIHtcclxuICAgICAgICB2YXIgbWF4ID0gMCwgbWF4QWN0aW9uID0gbnVsbDtcclxuICAgICAgICBmb3IgKHZhciBhY3Rpb24gaW4gdGhpcy5RW3N0YXRlXSkge1xyXG4gICAgICAgICAgICBpZiAoIW1heEFjdGlvbikge1xyXG4gICAgICAgICAgICAgICAgbWF4ID0gdGhpcy5RW3N0YXRlXVthY3Rpb25dO1xyXG4gICAgICAgICAgICAgICAgbWF4QWN0aW9uID0gYWN0aW9uO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuUVtzdGF0ZV1bYWN0aW9uXSA9PT0gbWF4ICYmIChNYXRoLnJhbmRvbSgpID4gMC41KSkge1xyXG4gICAgICAgICAgICAgICAgbWF4ID0gdGhpcy5RW3N0YXRlXVthY3Rpb25dO1xyXG4gICAgICAgICAgICAgICAgbWF4QWN0aW9uID0gYWN0aW9uO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuUVtzdGF0ZV1bYWN0aW9uXSA+IG1heCkge1xyXG4gICAgICAgICAgICAgICAgbWF4ID0gdGhpcy5RW3N0YXRlXVthY3Rpb25dO1xyXG4gICAgICAgICAgICAgICAgbWF4QWN0aW9uID0gYWN0aW9uO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBtYXhBY3Rpb247XHJcbiAgICB9XHJcbiAgICBwb3NzaWJsZShzdGF0ZSkge1xyXG4gICAgICAgIHZhciBwb3NzaWJsZSA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIGFjdGlvbiBpbiB0aGlzLlJbc3RhdGVdKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLlJbc3RhdGVdW2FjdGlvbl0gPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgcG9zc2libGUucHVzaChhY3Rpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwb3NzaWJsZVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwb3NzaWJsZS5sZW5ndGgpXTtcclxuICAgIH1cclxuICAgIGVwaXNvZGUoc3RhdGUpIHtcclxuICAgICAgICB0aGlzLnRyYW5zaXRpb24oc3RhdGUsIHRoaXMucG9zc2libGUoc3RhdGUpKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5RO1xyXG4gICAgfVxyXG4gICAgbm9ybWFsaXplKCkge1xyXG4gICAgICAgIGZvciAodmFyIHN0YXRlIGluIHRoaXMuUSkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBhY3Rpb24gaW4gdGhpcy5RW3N0YXRlXSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuUVthY3Rpb25dW3N0YXRlXSA+PSB0aGlzLnJhd01heCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmF3TWF4ID0gdGhpcy5RW2FjdGlvbl1bc3RhdGVdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAodmFyIHN0YXRlIGluIHRoaXMuUSkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBhY3Rpb24gaW4gdGhpcy5RW3N0YXRlXSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5RW2FjdGlvbl1bc3RhdGVdID0gTWF0aC5yb3VuZCh0aGlzLlFbYWN0aW9uXVtzdGF0ZV0gLyB0aGlzLnJhd01heCAqIDEwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9UUxlYXJuZXIuanMubWFwIiwiaW1wb3J0IHsgc3RhbmRhcmRpemVkLCBkYXRhVG9NYXRyaXggfSBmcm9tICcuL3V0aWxzJztcclxuZXhwb3J0IGZ1bmN0aW9uIG9scyhpdnMsIGR2KSB7XHJcbiAgICBsZXQgZGF0YSA9IGRhdGFUb01hdHJpeChpdnMsIHRoaXMuc3RhbmRhcmRpemVkKTtcclxuICAgIGxldCBkdkRhdGEgPSBkdi5kYXRhO1xyXG4gICAgbGV0IG4gPSBkdkRhdGEubGVuZ3RoO1xyXG4gICAgbGV0IG1lYW5zID0gaXZzLm1hcCgoYSkgPT4geyByZXR1cm4gYS5tZWFuOyB9KTtcclxuICAgIGxldCBzZHMgPSBpdnMubWFwKChhKSA9PiB7IHJldHVybiBhLnNkOyB9KTtcclxuICAgIGxldCB2YXJzID0gaXZzLm1hcCgoYSkgPT4geyByZXR1cm4gW2EudmFyaWFuY2VdOyB9KTtcclxuICAgIG1lYW5zLnVuc2hpZnQoMSk7XHJcbiAgICBzZHMudW5zaGlmdCgxKTtcclxuICAgIHZhcnMudW5zaGlmdChbMV0pO1xyXG4gICAgaWYgKHRoaXMuc3RhbmRhcmRpemVkKSB7XHJcbiAgICAgICAgZHZEYXRhID0gc3RhbmRhcmRpemVkKGR2LmRhdGEpO1xyXG4gICAgfVxyXG4gICAgbGV0IFggPSBkYXRhO1xyXG4gICAgbGV0IFkgPSBkdkRhdGEubWFwKCh5KSA9PiB7IHJldHVybiBbeV07IH0pO1xyXG4gICAgbGV0IFhwcmltZSA9IGpTdGF0LnRyYW5zcG9zZShYKTtcclxuICAgIGxldCBYcHJpbWVYID0galN0YXQubXVsdGlwbHkoWHByaW1lLCBYKTtcclxuICAgIGxldCBYcHJpbWVZID0galN0YXQubXVsdGlwbHkoWHByaW1lLCBZKTtcclxuICAgIC8vY29lZmZpY2llbnRzXHJcbiAgICBsZXQgYiA9IGpTdGF0Lm11bHRpcGx5KGpTdGF0LmludihYcHJpbWVYKSwgWHByaW1lWSk7XHJcbiAgICB0aGlzLmJldGFzID0gYi5yZWR1Y2UoKGEsIGIpID0+IHsgcmV0dXJuIGEuY29uY2F0KGIpOyB9KTtcclxuICAgIC8vc3RhbmRhcmQgZXJyb3Igb2YgdGhlIGNvZWZmaWNpZW50c1xyXG4gICAgdGhpcy5zdEVyckNvZWZmID0galN0YXQubXVsdGlwbHkoalN0YXQuaW52KFhwcmltZVgpLCB2YXJzKVxyXG4gICAgICAgIC5yZWR1Y2UoKGEsIGIpID0+IHsgcmV0dXJuIGEuY29uY2F0KGIpOyB9KTtcclxuICAgIC8vdCBzdGF0aXN0aWNzXHJcbiAgICB0aGlzLnRTdGF0cyA9IHRoaXMuc3RFcnJDb2VmZi5tYXAoKHNlLCBpKSA9PiB7IHJldHVybiB0aGlzLmJldGFzW2ldIC8gc2U7IH0pO1xyXG4gICAgLy9wIHZhbHVlc1xyXG4gICAgdGhpcy5wVmFsdWVzID0gdGhpcy50U3RhdHMubWFwKCh0LCBpKSA9PiB7IHJldHVybiBqU3RhdC50dGVzdCh0LCBtZWFuc1tpXSwgc2RzW2ldLCBuKTsgfSk7XHJcbiAgICAvL3Jlc2lkdWFsc1xyXG4gICAgbGV0IHloYXQgPSBbXTtcclxuICAgIGxldCByZXMgPSBkdi5kYXRhLm1hcCgoZCwgaSkgPT4ge1xyXG4gICAgICAgIGRhdGFbaV0uc2hpZnQoKTtcclxuICAgICAgICBsZXQgcm93ID0gZGF0YVtpXTtcclxuICAgICAgICB5aGF0W2ldID0gdGhpcy5wcmVkaWN0KHJvdyk7XHJcbiAgICAgICAgcmV0dXJuIGQgLSB5aGF0W2ldO1xyXG4gICAgfSk7XHJcbiAgICBsZXQgcmVzaWR1YWwgPSB5aGF0O1xyXG4gICAgcmV0dXJuIHRoaXMuYmV0YXM7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHBscyh4LCB5KSB7XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmVncmVzc2lvbi5qcy5tYXAiLCJpbXBvcnQgeyBRQ29tcG9uZW50IH0gZnJvbSAnLi9RQ29tcG9uZW50JztcclxuLypcclxuKiBVdGlsaXR5IFN5c3RlbXMgY2xhc3NcclxuKi9cclxuZXhwb3J0IGNsYXNzIFVTeXMgZXh0ZW5kcyBRQ29tcG9uZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIG9wdGlvbnMsIGRhdGEpIHtcclxuICAgICAgICBzdXBlcihuYW1lKTtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgICAgIHRoaXMucmVzdWx0cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoYWdlbnQsIHN0ZXApIHtcclxuICAgICAgICB2YXIgdG1wID0gW10sIG1heCA9IDAsIGF2ZywgdG9wO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5vcHRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRtcFtpXSA9IDA7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5vcHRpb25zW2ldLmNvbnNpZGVyYXRpb25zLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYyA9IHRoaXMub3B0aW9uc1tpXS5jb25zaWRlcmF0aW9uc1tqXTtcclxuICAgICAgICAgICAgICAgIGxldCB4ID0gYy54KGFnZW50LCB0aGlzLm9wdGlvbnNbaV0ucGFyYW1zKTtcclxuICAgICAgICAgICAgICAgIHRtcFtpXSArPSBjLmYoeCwgYy5tLCBjLmIsIGMuayk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYXZnID0gdG1wW2ldIC8gdGhpcy5vcHRpb25zW2ldLmNvbnNpZGVyYXRpb25zLmxlbmd0aDtcclxuICAgICAgICAgICAgdGhpcy5yZXN1bHRzLnB1c2goeyBwb2ludDogYWdlbnQuaWQsIG9wdDogdGhpcy5vcHRpb25zW2ldLm5hbWUsIHJlc3VsdDogYXZnIH0pO1xyXG4gICAgICAgICAgICBpZiAoYXZnID4gbWF4KSB7XHJcbiAgICAgICAgICAgICAgICBhZ2VudC50b3AgPSB7IG5hbWU6IHRoaXMub3B0aW9uc1tpXS5uYW1lLCB1dGlsOiBhdmcgfTtcclxuICAgICAgICAgICAgICAgIHRvcCA9IGk7XHJcbiAgICAgICAgICAgICAgICBtYXggPSBhdmc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vcHRpb25zW3RvcF0uYWN0aW9uKHN0ZXAsIGFnZW50KTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1VU3lzLmpzLm1hcCIsImNsYXNzIFJhbmRvbSB7XHJcbiAgICBjb25zdHJ1Y3RvcihzZWVkKSB7XHJcbiAgICAgICAgdGhpcy5zZWVkID0gc2VlZDtcclxuICAgICAgICB0aGlzLmNhbGxlZCA9IDA7XHJcbiAgICB9XHJcbiAgICByYW5kUmFuZ2UobWluLCBtYXgpIHtcclxuICAgICAgICByZXR1cm4gKG1heCAtIG1pbikgKiB0aGlzLnJhbmRvbSgpICsgbWluO1xyXG4gICAgfVxyXG4gICAgcGljayhhcnJheSkge1xyXG4gICAgICAgIHJldHVybiBhcnJheVtNYXRoLmZsb29yKHRoaXMucmFuZG9tKCkgKiBhcnJheS5sZW5ndGgpXTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgKkJlbG93IGlzIGFkYXB0ZWQgZnJvbSBqU3RhdDpodHRwczovL2dpdGh1Yi5jb20vanN0YXQvanN0YXQvYmxvYi9tYXN0ZXIvc3JjL3NwZWNpYWwuanNcclxuICAgICoqL1xyXG4gICAgcmFuZG4oKSB7XHJcbiAgICAgICAgdmFyIHUsIHYsIHgsIHksIHE7XHJcbiAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICB1ID0gdGhpcy5yYW5kb20oKTtcclxuICAgICAgICAgICAgdiA9IDEuNzE1NiAqICh0aGlzLnJhbmRvbSgpIC0gMC41KTtcclxuICAgICAgICAgICAgeCA9IHUgLSAwLjQ0OTg3MTtcclxuICAgICAgICAgICAgeSA9IE1hdGguYWJzKHYpICsgMC4zODY1OTU7XHJcbiAgICAgICAgICAgIHEgPSB4ICogeCArIHkgKiAoMC4xOTYwMCAqIHkgLSAwLjI1NDcyICogeCk7XHJcbiAgICAgICAgfSB3aGlsZSAocSA+IDAuMjc1OTcgJiYgKHEgPiAwLjI3ODQ2IHx8IHYgKiB2ID4gLTQgKiBNYXRoLmxvZyh1KSAqIHUgKiB1KSk7XHJcbiAgICAgICAgcmV0dXJuIHYgLyB1O1xyXG4gICAgfVxyXG4gICAgcmFuZGcoc2hhcGUpIHtcclxuICAgICAgICB2YXIgb2FscGggPSBzaGFwZTtcclxuICAgICAgICB2YXIgYTEsIGEyLCB1LCB2LCB4O1xyXG4gICAgICAgIGlmICghc2hhcGUpXHJcbiAgICAgICAgICAgIHNoYXBlID0gMTtcclxuICAgICAgICBpZiAoc2hhcGUgPCAxKVxyXG4gICAgICAgICAgICBzaGFwZSArPSAxO1xyXG4gICAgICAgIGExID0gc2hhcGUgLSAxIC8gMztcclxuICAgICAgICBhMiA9IDEgLyBNYXRoLnNxcnQoOSAqIGExKTtcclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIHggPSB0aGlzLnJhbmRuKCk7XHJcbiAgICAgICAgICAgICAgICB2ID0gMSArIGEyICogeDtcclxuICAgICAgICAgICAgfSB3aGlsZSAodiA8PSAwKTtcclxuICAgICAgICAgICAgdiA9IHYgKiB2ICogdjtcclxuICAgICAgICAgICAgdSA9IHRoaXMucmFuZG9tKCk7XHJcbiAgICAgICAgfSB3aGlsZSAodSA+IDEgLSAwLjMzMSAqIE1hdGgucG93KHgsIDQpICYmXHJcbiAgICAgICAgICAgIE1hdGgubG9nKHUpID4gMC41ICogeCAqIHggKyBhMSAqICgxIC0gdiArIE1hdGgubG9nKHYpKSk7XHJcbiAgICAgICAgLy8gYWxwaGEgPiAxXHJcbiAgICAgICAgaWYgKHNoYXBlID09IG9hbHBoKVxyXG4gICAgICAgICAgICByZXR1cm4gYTEgKiB2O1xyXG4gICAgICAgIC8vIGFscGhhIDwgMVxyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgdSA9IHRoaXMucmFuZG9tKCk7XHJcbiAgICAgICAgfSB3aGlsZSAodSA9PT0gMCk7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucG93KHUsIDEgLyBvYWxwaCkgKiBhMSAqIHY7XHJcbiAgICB9XHJcbiAgICBiZXRhKGFscGhhLCBiZXRhKSB7XHJcbiAgICAgICAgdmFyIHUgPSB0aGlzLnJhbmRnKGFscGhhKTtcclxuICAgICAgICByZXR1cm4gdSAvICh1ICsgdGhpcy5yYW5kZyhiZXRhKSk7XHJcbiAgICB9XHJcbiAgICBnYW1tYShzaGFwZSwgc2NhbGUpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yYW5kZyhzaGFwZSkgKiBzY2FsZTtcclxuICAgIH1cclxuICAgIGxvZ05vcm1hbChtdSwgc2lnbWEpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5leHAodGhpcy5yYW5kbigpICogc2lnbWEgKyBtdSk7XHJcbiAgICB9XHJcbiAgICBub3JtYWwobWVhbiwgc3RkKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmFuZG4oKSAqIHN0ZCArIG1lYW47XHJcbiAgICB9XHJcbiAgICBwb2lzc29uKGwpIHtcclxuICAgICAgICB2YXIgcCA9IDEsIGsgPSAwLCBMID0gTWF0aC5leHAoLWwpO1xyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgaysrO1xyXG4gICAgICAgICAgICBwICo9IHRoaXMucmFuZG9tKCk7XHJcbiAgICAgICAgfSB3aGlsZSAocCA+IEwpO1xyXG4gICAgICAgIHJldHVybiBrIC0gMTtcclxuICAgIH1cclxuICAgIHdlaWJ1bGwoc2NhbGUsIHNoYXBlKSB7XHJcbiAgICAgICAgcmV0dXJuIHNjYWxlICogTWF0aC5wb3coLU1hdGgubG9nKHRoaXMucmFuZG9tKCkpLCAxIC8gc2hhcGUpO1xyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4qIEJvYiBKZW5raW5zJyBzbWFsbCBub25jcnlwdG9ncmFwaGljIFBSTkcgKHBzZXVkb3JhbmRvbSBudW1iZXIgZ2VuZXJhdG9yKSBwb3J0ZWQgdG8gSmF2YVNjcmlwdFxyXG4qIGFkYXB0ZWQgZnJvbTpcclxuKiBodHRwczovL2dpdGh1Yi5jb20vZ3JhdWUvYnVydGxlcHJuZ1xyXG4qIHdoaWNoIGlzIGZyb20gaHR0cDovL3d3dy5idXJ0bGVidXJ0bGUubmV0L2JvYi9yYW5kL3NtYWxscHJuZy5odG1sXHJcbiovXHJcbmV4cG9ydCBjbGFzcyBSTkdCdXJ0bGUgZXh0ZW5kcyBSYW5kb20ge1xyXG4gICAgY29uc3RydWN0b3Ioc2VlZCkge1xyXG4gICAgICAgIHN1cGVyKHNlZWQpO1xyXG4gICAgICAgIHRoaXMuc2VlZCA+Pj49IDA7XHJcbiAgICAgICAgdGhpcy5jdHggPSBuZXcgQXJyYXkoNCk7XHJcbiAgICAgICAgdGhpcy5jdHhbMF0gPSAweGYxZWE1ZWVkO1xyXG4gICAgICAgIHRoaXMuY3R4WzFdID0gdGhpcy5jdHhbMl0gPSB0aGlzLmN0eFszXSA9IHRoaXMuc2VlZDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDIwOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5yYW5kb20oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByb3QoeCwgaykge1xyXG4gICAgICAgIHJldHVybiAoeCA8PCBrKSB8ICh4ID4+ICgzMiAtIGspKTtcclxuICAgIH1cclxuICAgIHJhbmRvbSgpIHtcclxuICAgICAgICB2YXIgY3R4ID0gdGhpcy5jdHg7XHJcbiAgICAgICAgdmFyIGUgPSAoY3R4WzBdIC0gdGhpcy5yb3QoY3R4WzFdLCAyNykpID4+PiAwO1xyXG4gICAgICAgIGN0eFswXSA9IChjdHhbMV0gXiB0aGlzLnJvdChjdHhbMl0sIDE3KSkgPj4+IDA7XHJcbiAgICAgICAgY3R4WzFdID0gKGN0eFsyXSArIGN0eFszXSkgPj4+IDA7XHJcbiAgICAgICAgY3R4WzJdID0gKGN0eFszXSArIGUpID4+PiAwO1xyXG4gICAgICAgIGN0eFszXSA9IChlICsgY3R4WzBdKSA+Pj4gMDtcclxuICAgICAgICB0aGlzLmNhbGxlZCArPSAxO1xyXG4gICAgICAgIHJldHVybiBjdHhbM10gLyA0Mjk0OTY3Mjk2LjA7XHJcbiAgICB9XHJcbn1cclxuLypcclxuKiB4b3JzaGlmdDcqLCBieSBGcmFuw6dvaXMgUGFubmV0b24gYW5kIFBpZXJyZSBMJ2VjdXllcjogMzItYml0IHhvci1zaGlmdCByYW5kb20gbnVtYmVyIGdlbmVyYXRvclxyXG4qIGFkZHMgcm9idXN0bmVzcyBieSBhbGxvd2luZyBtb3JlIHNoaWZ0cyB0aGFuIE1hcnNhZ2xpYSdzIG9yaWdpbmFsIHRocmVlLiBJdCBpcyBhIDctc2hpZnQgZ2VuZXJhdG9yIHdpdGggMjU2IGJpdHMsIHRoYXQgcGFzc2VzIEJpZ0NydXNoIHdpdGggbm8gc3lzdG1hdGljIGZhaWx1cmVzLlxyXG4qIEFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vZGF2aWRiYXUveHNyYW5kXHJcbiovXHJcbmV4cG9ydCBjbGFzcyBSTkd4b3JzaGlmdDcgZXh0ZW5kcyBSYW5kb20ge1xyXG4gICAgY29uc3RydWN0b3Ioc2VlZCkge1xyXG4gICAgICAgIGxldCBqLCB3LCBYID0gW107XHJcbiAgICAgICAgc3VwZXIoc2VlZCk7XHJcbiAgICAgICAgLy8gU2VlZCBzdGF0ZSBhcnJheSB1c2luZyBhIDMyLWJpdCBpbnRlZ2VyLlxyXG4gICAgICAgIHcgPSBYWzBdID0gdGhpcy5zZWVkO1xyXG4gICAgICAgIC8vIEVuZm9yY2UgYW4gYXJyYXkgbGVuZ3RoIG9mIDgsIG5vdCBhbGwgemVyb2VzLlxyXG4gICAgICAgIHdoaWxlIChYLmxlbmd0aCA8IDgpIHtcclxuICAgICAgICAgICAgWC5wdXNoKDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGogPSAwOyBqIDwgOCAmJiBYW2pdID09PSAwOyArK2opIHtcclxuICAgICAgICAgICAgaWYgKGogPT0gOCkge1xyXG4gICAgICAgICAgICAgICAgdyA9IFhbN10gPSAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHcgPSBYW2pdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMueCA9IFg7XHJcbiAgICAgICAgdGhpcy5pID0gMDtcclxuICAgICAgICAvLyBEaXNjYXJkIGFuIGluaXRpYWwgMjU2IHZhbHVlcy5cclxuICAgICAgICBmb3IgKGogPSAyNTY7IGogPiAwOyAtLWopIHtcclxuICAgICAgICAgICAgdGhpcy5yYW5kb20oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByYW5kb20oKSB7XHJcbiAgICAgICAgbGV0IFggPSB0aGlzLngsIGkgPSB0aGlzLmksIHQsIHYsIHcsIHJlcztcclxuICAgICAgICB0ID0gWFtpXTtcclxuICAgICAgICB0IF49ICh0ID4+PiA3KTtcclxuICAgICAgICB2ID0gdCBeICh0IDw8IDI0KTtcclxuICAgICAgICB0ID0gWFsoaSArIDEpICYgN107XHJcbiAgICAgICAgdiBePSB0IF4gKHQgPj4+IDEwKTtcclxuICAgICAgICB0ID0gWFsoaSArIDMpICYgN107XHJcbiAgICAgICAgdiBePSB0IF4gKHQgPj4+IDMpO1xyXG4gICAgICAgIHQgPSBYWyhpICsgNCkgJiA3XTtcclxuICAgICAgICB2IF49IHQgXiAodCA8PCA3KTtcclxuICAgICAgICB0ID0gWFsoaSArIDcpICYgN107XHJcbiAgICAgICAgdCA9IHQgXiAodCA8PCAxMyk7XHJcbiAgICAgICAgdiBePSB0IF4gKHQgPDwgOSk7XHJcbiAgICAgICAgWFtpXSA9IHY7XHJcbiAgICAgICAgdGhpcy5pID0gKGkgKyAxKSAmIDc7XHJcbiAgICAgICAgcmVzID0gKHYgPj4+IDApIC8gKCgxIDw8IDMwKSAqIDQpO1xyXG4gICAgICAgIHRoaXMuY2FsbGVkICs9IDE7XHJcbiAgICAgICAgcmV0dXJuIHJlcztcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1yYW5kb20uanMubWFwIiwiZXhwb3J0ICogZnJvbSAnLi91dGlscyc7XHJcbmV4cG9ydCB7IFFDb21wb25lbnQgfSBmcm9tICcuL1FDb21wb25lbnQnO1xyXG5leHBvcnQgeyBCRElBZ2VudCB9IGZyb20gJy4vYmRpJztcclxuZXhwb3J0ICogZnJvbSAnLi9iZWhhdmlvclRyZWUnO1xyXG5leHBvcnQgKiBmcm9tICcuL2NvbXBhcnRtZW50JztcclxuZXhwb3J0IHsgQ29udGFjdFBhdGNoIH0gZnJvbSAnLi9jb250YWN0UGF0Y2gnO1xyXG5leHBvcnQgeyBFbnZpcm9ubWVudCB9IGZyb20gJy4vZW52aXJvbm1lbnQnO1xyXG5leHBvcnQgKiBmcm9tICcuL2VwaSc7XHJcbmV4cG9ydCAqIGZyb20gJy4vZXZlbnRzJztcclxuZXhwb3J0IHsgRXhwZXJpbWVudCB9IGZyb20gJy4vZXhwZXJpbWVudCc7XHJcbmV4cG9ydCAqIGZyb20gJy4vZ2VuZXRpYyc7XHJcbmV4cG9ydCB7IEV2b2x1dGlvbmFyeSB9IGZyb20gJy4vZXZvbHV0aW9uYXJ5JztcclxuZXhwb3J0IHsgSHlicmlkQXV0b21hdGEgfSBmcm9tICcuL2hhJztcclxuZXhwb3J0ICogZnJvbSAnLi9odG4nO1xyXG5leHBvcnQgeyBrTWVhbiB9IGZyb20gJy4va21lYW4nO1xyXG5leHBvcnQgeyBLTk4gfSBmcm9tICcuL2tubic7XHJcbmV4cG9ydCAqIGZyb20gJy4vbWF0aCc7XHJcbmV4cG9ydCB7IE5ldHdvcmsgfSBmcm9tICcuL25ldHdvcmsnO1xyXG5leHBvcnQgeyBRTGVhcm5lciB9IGZyb20gJy4vUUxlYXJuZXInO1xyXG5leHBvcnQgKiBmcm9tICcuL3JlZ3Jlc3Npb24nO1xyXG5leHBvcnQgeyBTdGF0ZU1hY2hpbmUgfSBmcm9tICcuL3N0YXRlTWFjaGluZSc7XHJcbmV4cG9ydCAqIGZyb20gJy4vVVN5cyc7XHJcbmV4cG9ydCAqIGZyb20gJy4vcmFuZG9tJztcclxuZXhwb3J0IHZhciB2ZXJzaW9uID0gJzAuMC41JztcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFpbi5qcy5tYXAiLCIvKioqXHJcbipAbW9kdWxlIFFFcGlLaXRcclxuKi9cclxuaW1wb3J0ICogYXMgcWVwaWtpdCBmcm9tICcuL21haW4nO1xyXG5sZXQgUUVwaUtpdCA9IHFlcGlraXQ7XHJcbmZvciAobGV0IGtleSBpbiBRRXBpS2l0KSB7XHJcbiAgICBpZiAoa2V5ID09ICd2ZXJzaW9uJykge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFFFcGlLaXRba2V5XSk7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cWVwaWtpdC5qcy5tYXAiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBTyxNQUFNLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDekIsQUFBTyxNQUFNLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDeEIsQUFBTyxNQUFNLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDekIsQUFBTyxTQUFTLFlBQVksQ0FBQyxJQUFJLEVBQUU7SUFDL0IsSUFBSSxVQUFVLENBQUM7SUFDZixJQUFJLEdBQUcsQ0FBQztJQUNSLElBQUksVUFBVSxHQUFHLDhCQUE4QixDQUFDO0lBQ2hELElBQUksZUFBZSxHQUFHLEVBQUUsQ0FBQztJQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsU0FBUyxFQUFFO1FBQzlCLFVBQVUsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pDLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDcEMsQ0FBQyxDQUFDO0lBQ0gsVUFBVSxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDekMsR0FBRyxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM1QixPQUFPLEdBQUcsQ0FBQztDQUNkO0FBQ0QsQUFBTyxTQUFTLGNBQWMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtJQUM3QyxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDZixJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDZCxPQUFPLENBQUMsR0FBRyxHQUFHLEVBQUU7UUFDWixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2QsQ0FBQyxJQUFJLElBQUksQ0FBQztLQUNi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SUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNqRCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDdEQ7UUFDRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDN0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ3RDO1FBQ0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzdDLEtBQUssSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRTtnQkFDNUMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxRQUFRLENBQUM7Z0JBQ2IsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLFFBQVEsSUFBSSxPQUFPLEtBQUssQ0FBQyxLQUFLLEtBQUssV0FBVyxFQUFFO29CQUNoRSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLEtB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QU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMxRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNoRixLQUFLLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFO1lBQ2hELElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ3JCLEtBQUssSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxHQUFH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
