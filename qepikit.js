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
            return SUCCESS;
        }
        return FAILED;
    }
    static ge(a, b) {
        if (a >= b) {
            return SUCCESS;
        }
        return FAILED;
    }
    static lt(a, b) {
        if (a < b) {
            return SUCCESS;
        }
        return FAILED;
    }
    static le(a, b) {
        if (a <= b) {
            return SUCCESS;
        }
        return FAILED;
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
            if (typeof scene !== 'undefined') {
                scene.add(pop[a].mesh);
            }
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
                        let value, r;
                        let cond = this.conditions[this.transitions[i].name];
                        if (typeof (cond.value) === 'function') {
                            value = cond.value();
                        }
                        else {
                            value = cond.value;
                        }
                        r = cond.check(agent[cond.key], value);
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
                    return;
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
        let best = this.population[0].genes;
        if (this.rng.random() > chance) {
            return;
        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicWVwaWtpdC5qcyIsInNvdXJjZXMiOlsiZGlzdC91dGlscy5qcyIsImRpc3QvUUNvbXBvbmVudC5qcyIsImRpc3QvYmRpLmpzIiwiZGlzdC9iZWhhdmlvclRyZWUuanMiLCJkaXN0L2NvbXBhcnRtZW50LmpzIiwiZGlzdC9jb250YWN0UGF0Y2guanMiLCJkaXN0L2Vudmlyb25tZW50LmpzIiwiZGlzdC9lcGkuanMiLCJkaXN0L2V2ZW50cy5qcyIsImRpc3Qvc3RhdGVNYWNoaW5lLmpzIiwiZGlzdC9leHBlcmltZW50LmpzIiwiZGlzdC9nZW5ldGljLmpzIiwiZGlzdC9ldm9sdXRpb25hcnkuanMiLCJkaXN0L2hhLmpzIiwiZGlzdC9odG4uanMiLCJkaXN0L21jLmpzIiwiZGlzdC9rbWVhbi5qcyIsImRpc3Qva25uLmpzIiwiZGlzdC9tYXRoLmpzIiwiZGlzdC9uZXR3b3JrLmpzIiwiZGlzdC9RTGVhcm5lci5qcyIsImRpc3QvcmVncmVzc2lvbi5qcyIsImRpc3QvVVN5cy5qcyIsImRpc3QvcmFuZG9tLmpzIiwiZGlzdC9tYWluLmpzIiwiZGlzdC9RRXBpS2l0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBTVUNDRVNTID0gMTtcbmV4cG9ydCBjb25zdCBGQUlMRUQgPSAyO1xuZXhwb3J0IGNvbnN0IFJVTk5JTkcgPSAzO1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNTVlVSSShkYXRhKSB7XG4gICAgdmFyIGRhdGFTdHJpbmc7XG4gICAgdmFyIFVSSTtcbiAgICB2YXIgY3N2Q29udGVudCA9IFwiZGF0YTp0ZXh0L2NzdjtjaGFyc2V0PXV0Zi04LFwiO1xuICAgIHZhciBjc3ZDb250ZW50QXJyYXkgPSBbXTtcbiAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGluZm9BcnJheSkge1xuICAgICAgICBkYXRhU3RyaW5nID0gaW5mb0FycmF5LmpvaW4oXCIsXCIpO1xuICAgICAgICBjc3ZDb250ZW50QXJyYXkucHVzaChkYXRhU3RyaW5nKTtcbiAgICB9KTtcbiAgICBjc3ZDb250ZW50ICs9IGNzdkNvbnRlbnRBcnJheS5qb2luKFwiXFxuXCIpO1xuICAgIFVSSSA9IGVuY29kZVVSSShjc3ZDb250ZW50KTtcbiAgICByZXR1cm4gVVJJO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGFycmF5RnJvbVJhbmdlKHN0YXJ0LCBlbmQsIHN0ZXApIHtcbiAgICB2YXIgcmFuZ2UgPSBbXTtcbiAgICB2YXIgaSA9IHN0YXJ0O1xuICAgIHdoaWxlIChpIDwgZW5kKSB7XG4gICAgICAgIHJhbmdlLnB1c2goaSk7XG4gICAgICAgIGkgKz0gc3RlcDtcbiAgICB9XG4gICAgcmV0dXJuIHJhbmdlO1xufVxuLyoqXG4qIHNodWZmbGUgLSBmaXNoZXIteWF0ZXMgc2h1ZmZsZVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBzaHVmZmxlKGFycmF5LCBybmcpIHtcbiAgICB2YXIgY3VycmVudEluZGV4ID0gYXJyYXkubGVuZ3RoLCB0ZW1wb3JhcnlWYWx1ZSwgcmFuZG9tSW5kZXg7XG4gICAgLy8gV2hpbGUgdGhlcmUgcmVtYWluIGVsZW1lbnRzIHRvIHNodWZmbGUuLi5cbiAgICB3aGlsZSAoMCAhPT0gY3VycmVudEluZGV4KSB7XG4gICAgICAgIC8vIFBpY2sgYSByZW1haW5pbmcgZWxlbWVudC4uLlxuICAgICAgICByYW5kb21JbmRleCA9IE1hdGguZmxvb3Iocm5nLnJhbmRvbSgpICogY3VycmVudEluZGV4KTtcbiAgICAgICAgY3VycmVudEluZGV4IC09IDE7XG4gICAgICAgIC8vIEFuZCBzd2FwIGl0IHdpdGggdGhlIGN1cnJlbnQgZWxlbWVudC5cbiAgICAgICAgdGVtcG9yYXJ5VmFsdWUgPSBhcnJheVtjdXJyZW50SW5kZXhdO1xuICAgICAgICBhcnJheVtjdXJyZW50SW5kZXhdID0gYXJyYXlbcmFuZG9tSW5kZXhdO1xuICAgICAgICBhcnJheVtyYW5kb21JbmRleF0gPSB0ZW1wb3JhcnlWYWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlVVVJRCgpIHtcbiAgICAvLyBodHRwOi8vd3d3LmJyb29mYS5jb20vVG9vbHMvTWF0aC51dWlkLmh0bVxuICAgIHZhciBjaGFycyA9ICcwMTIzNDU2Nzg5QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eicuc3BsaXQoJycpO1xuICAgIHZhciB1dWlkID0gbmV3IEFycmF5KDM2KTtcbiAgICB2YXIgcm5kID0gMCwgcjtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM2OyBpKyspIHtcbiAgICAgICAgaWYgKGkgPT0gOCB8fCBpID09IDEzIHx8IGkgPT0gMTggfHwgaSA9PSAyMykge1xuICAgICAgICAgICAgdXVpZFtpXSA9ICctJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpID09IDE0KSB7XG4gICAgICAgICAgICB1dWlkW2ldID0gJzQnO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKHJuZCA8PSAweDAyKVxuICAgICAgICAgICAgICAgIHJuZCA9IDB4MjAwMDAwMCArIChNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwKSB8IDA7XG4gICAgICAgICAgICByID0gcm5kICYgMHhmO1xuICAgICAgICAgICAgcm5kID0gcm5kID4+IDQ7XG4gICAgICAgICAgICB1dWlkW2ldID0gY2hhcnNbKGkgPT0gMTkpID8gKHIgJiAweDMpIHwgMHg4IDogcl07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHV1aWQuam9pbignJyk7XG59XG5leHBvcnQgZnVuY3Rpb24gYWx3YXlzKGEpIHtcbiAgICBpZiAoYSA9PT0gU1VDQ0VTUykge1xuICAgICAgICByZXR1cm4gU1VDQ0VTUztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBGQUlMRUQ7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGV2ZW50dWFsbHkoYSkge1xuICAgIGlmIChhID09PSBTVUNDRVNTKSB7XG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFJVTk5JTkc7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFsVG8oYSwgYikge1xuICAgIGlmIChhID09PSBiKSB7XG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gbm90KHJlc3VsdCkge1xuICAgIHZhciBuZXdSZXN1bHQ7XG4gICAgaWYgKHJlc3VsdCA9PT0gU1VDQ0VTUykge1xuICAgICAgICBuZXdSZXN1bHQgPSBGQUlMRUQ7XG4gICAgfVxuICAgIGVsc2UgaWYgKHJlc3VsdCA9PT0gRkFJTEVEKSB7XG4gICAgICAgIG5ld1Jlc3VsdCA9IFNVQ0NFU1M7XG4gICAgfVxuICAgIHJldHVybiBuZXdSZXN1bHQ7XG59XG5leHBvcnQgZnVuY3Rpb24gbm90RXF1YWxUbyhhLCBiKSB7XG4gICAgaWYgKGEgIT09IGIpIHtcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gRkFJTEVEO1xuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBndChhLCBiKSB7XG4gICAgaWYgKGEgPiBiKSB7XG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gZ3RFcShhLCBiKSB7XG4gICAgaWYgKGEgPj0gYikge1xuICAgICAgICByZXR1cm4gU1VDQ0VTUztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBGQUlMRUQ7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGx0KGEsIGIpIHtcbiAgICBpZiAoYSA8IGIpIHtcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gRkFJTEVEO1xuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBsdEVxKGEsIGIpIHtcbiAgICBpZiAoYSA8PSBiKSB7XG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gaGFzUHJvcChhLCBiKSB7XG4gICAgYSA9IGEgfHwgZmFsc2U7XG4gICAgaWYgKGEgPT09IGIpIHtcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gRkFJTEVEO1xuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBpblJhbmdlKGEsIGIpIHtcbiAgICBpZiAoYiA+PSBhWzBdICYmIGIgPD0gYVsxXSkge1xuICAgICAgICByZXR1cm4gU1VDQ0VTUztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBGQUlMRUQ7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIG5vdEluUmFuZ2UoYSwgYikge1xuICAgIGlmIChiID49IGFbMF0gJiYgYiA8PSBhWzFdKSB7XG4gICAgICAgIHJldHVybiBGQUlMRUQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gU1VDQ0VTUztcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0TWF0Y2hlclN0cmluZyhjaGVjaykge1xuICAgIHZhciBzdHJpbmcgPSBudWxsO1xuICAgIHN3aXRjaCAoY2hlY2spIHtcbiAgICAgICAgY2FzZSBlcXVhbFRvOlxuICAgICAgICAgICAgc3RyaW5nID0gXCJlcXVhbCB0b1wiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2Ugbm90RXF1YWxUbzpcbiAgICAgICAgICAgIHN0cmluZyA9IFwibm90IGVxdWFsIHRvXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBndDpcbiAgICAgICAgICAgIHN0cmluZyA9IFwiZ3JlYXRlciB0aGFuXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBndEVxOlxuICAgICAgICAgICAgc3RyaW5nID0gXCJncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG9cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGx0OlxuICAgICAgICAgICAgc3RyaW5nID0gXCJsZXNzIHRoYW5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGx0RXE6XG4gICAgICAgICAgICBzdHJpbmcgPSBcImxlc3MgdGhhbiBvciBlcXVhbCB0b1wiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgaGFzUHJvcDpcbiAgICAgICAgICAgIHN0cmluZyA9IFwiaGFzIHRoZSBwcm9wZXJ0eVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHN0cmluZyA9IFwibm90IGEgZGVmaW5lZCBtYXRjaGVyXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiBzdHJpbmc7XG59XG5leHBvcnQgZnVuY3Rpb24gc2V0TWluKHBhcmFtcywga2V5cykge1xuICAgIGZvciAodmFyIHBhcmFtIGluIHBhcmFtcykge1xuICAgICAgICBpZiAodHlwZW9mIChrZXlzKSAhPT0gJ3VuZGVmaW5lZCcgJiYga2V5cy5pbmRleE9mKHBhcmFtKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHBhcmFtc1twYXJhbV0uY3VycmVudCA9IHBhcmFtc1twYXJhbV0udmFsdWUgLSBwYXJhbXNbcGFyYW1dLmVycm9yO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiAoa2V5cykgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBwYXJhbXNbcGFyYW1dLmN1cnJlbnQgPSBwYXJhbXNbcGFyYW1dLnZhbHVlIC0gcGFyYW1zW3BhcmFtXS5lcnJvcjtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBzZXRNYXgocGFyYW1zLCBrZXlzKSB7XG4gICAgZm9yICh2YXIgcGFyYW0gaW4gcGFyYW1zKSB7XG4gICAgICAgIGlmICh0eXBlb2YgKGtleXMpICE9PSAndW5kZWZpbmVkJyAmJiBrZXlzLmluZGV4T2YocGFyYW0pICE9PSAtMSkge1xuICAgICAgICAgICAgcGFyYW1zW3BhcmFtXS5jdXJyZW50ID0gcGFyYW1zW3BhcmFtXS52YWx1ZSArIHBhcmFtc1twYXJhbV0uZXJyb3I7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIChrZXlzKSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHBhcmFtc1twYXJhbV0uY3VycmVudCA9IHBhcmFtc1twYXJhbV0udmFsdWUgKyBwYXJhbXNbcGFyYW1dLmVycm9yO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIHNldFN0YW5kYXJkKHBhcmFtcywga2V5cykge1xuICAgIGZvciAodmFyIHBhcmFtIGluIHBhcmFtcykge1xuICAgICAgICBpZiAodHlwZW9mIChrZXlzKSAhPT0gJ3VuZGVmaW5lZCcgJiYga2V5cy5pbmRleE9mKHBhcmFtKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHBhcmFtc1twYXJhbV0uY3VycmVudCA9IHBhcmFtc1twYXJhbV0udmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIChrZXlzKSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHBhcmFtc1twYXJhbV0uY3VycmVudCA9IHBhcmFtc1twYXJhbV0udmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gZGF0YVRvTWF0cml4KGl0ZW1zLCBzdGRpemVkID0gZmFsc2UpIHtcbiAgICBsZXQgZGF0YSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IGl0ZW0gPSBpdGVtc1tpXTtcbiAgICAgICAgaWYgKHN0ZGl6ZWQpIHtcbiAgICAgICAgICAgIGl0ZW0gPSBzdGFuZGFyZGl6ZWQoaXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgaXRlbS5mb3JFYWNoKCh4LCBpaSkgPT4ge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBkYXRhW2lpXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBkYXRhW2lpXSA9IFsxLCB4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGRhdGFbaWldLnB1c2goeCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbn1cbi8qXG4qIHJlbGF0aXZlIHRvIHRoZSBtZWFuLCBob3cgbWFueSBzdGFuZGFyZCBkZXZpYXRpb25zXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YW5kYXJkaXplZChhcnIpIHtcbiAgICBsZXQgc3RkID0galN0YXQuc3RkZXYoYXJyKTtcbiAgICBsZXQgbWVhbiA9IGpTdGF0Lm1lYW4oYXJyKTtcbiAgICBsZXQgc3RhbmRhcmRpemVkID0gYXJyLm1hcCgoZCkgPT4ge1xuICAgICAgICByZXR1cm4gKGQgLSBtZWFuKSAvIHN0ZDtcbiAgICB9KTtcbiAgICByZXR1cm4gc3RhbmRhcmRpemVkO1xufVxuLypcbiogYmV0d2VlbiAwIGFuZCAxIHdoZW4gbWluIGFuZCBtYXggYXJlIGtub3duXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZSh4LCBtaW4sIG1heCkge1xuICAgIGxldCB2YWwgPSB4IC0gbWluO1xuICAgIHJldHVybiB2YWwgLyAobWF4IC0gbWluKTtcbn1cbi8qXG4qIGdpdmUgdGhlIHJlYWwgdW5pdCB2YWx1ZVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZOb3JtKHgsIG1pbiwgbWF4KSB7XG4gICAgcmV0dXJuICh4ICogbWF4IC0geCAqIG1pbikgKyBtaW47XG59XG4vKlxuKlxuKi9cbmV4cG9ydCBmdW5jdGlvbiByYW5kUmFuZ2UobWluLCBtYXgpIHtcbiAgICByZXR1cm4gKG1heCAtIG1pbikgKiBNYXRoLnJhbmRvbSgpICsgbWluO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFJhbmdlKGRhdGEsIHByb3ApIHtcbiAgICBsZXQgcmFuZ2UgPSB7XG4gICAgICAgIG1pbjogMWUxNSxcbiAgICAgICAgbWF4OiAtMWUxNVxuICAgIH07XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChyYW5nZS5taW4gPiBkYXRhW2ldW3Byb3BdKSB7XG4gICAgICAgICAgICByYW5nZS5taW4gPSBkYXRhW2ldW3Byb3BdO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyYW5nZS5tYXggPCBkYXRhW2ldW3Byb3BdKSB7XG4gICAgICAgICAgICByYW5nZS5tYXggPSBkYXRhW2ldW3Byb3BdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByYW5nZTtcbn1cbmV4cG9ydCBjbGFzcyBNYXRjaCB7XG4gICAgc3RhdGljIGd0KGEsIGIpIHtcbiAgICAgICAgaWYgKGEgPiBiKSB7XG4gICAgICAgICAgICByZXR1cm4gU1VDQ0VTUztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gRkFJTEVEO1xuICAgIH1cbiAgICBzdGF0aWMgZ2UoYSwgYikge1xuICAgICAgICBpZiAoYSA+PSBiKSB7XG4gICAgICAgICAgICByZXR1cm4gU1VDQ0VTUztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gRkFJTEVEO1xuICAgIH1cbiAgICBzdGF0aWMgbHQoYSwgYikge1xuICAgICAgICBpZiAoYSA8IGIpIHtcbiAgICAgICAgICAgIHJldHVybiBTVUNDRVNTO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBGQUlMRUQ7XG4gICAgfVxuICAgIHN0YXRpYyBsZShhLCBiKSB7XG4gICAgICAgIGlmIChhIDw9IGIpIHtcbiAgICAgICAgICAgIHJldHVybiBTVUNDRVNTO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBGQUlMRUQ7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlUG9wKG51bUFnZW50cywgb3B0aW9ucywgdHlwZSwgYm91bmRhcmllcywgY3VycmVudEFnZW50SWQsIHJuZykge1xuICAgIHZhciBwb3AgPSBbXTtcbiAgICB2YXIgbG9jcyA9IHtcbiAgICAgICAgdHlwZTogJ0ZlYXR1cmVDb2xsZWN0aW9uJyxcbiAgICAgICAgZmVhdHVyZXM6IFtdXG4gICAgfTtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCBbXTtcbiAgICB0eXBlID0gdHlwZSB8fCAnY29udGludW91cyc7XG4gICAgZm9yICh2YXIgYSA9IDA7IGEgPCBudW1BZ2VudHM7IGErKykge1xuICAgICAgICBwb3BbYV0gPSB7XG4gICAgICAgICAgICBpZDogY3VycmVudEFnZW50SWQsXG4gICAgICAgICAgICB0eXBlOiB0eXBlXG4gICAgICAgIH07XG4gICAgICAgIC8vbW92ZW1lbnQgcGFyYW1zXG4gICAgICAgIHBvcFthXS5tb3ZlUGVyRGF5ID0gcm5nLm5vcm1hbCgyNTAwICogMjQsIDEwMDApOyAvLyBtL2RheVxuICAgICAgICBwb3BbYV0ucHJldlggPSAwO1xuICAgICAgICBwb3BbYV0ucHJldlkgPSAwO1xuICAgICAgICBwb3BbYV0ubW92ZWRUb3RhbCA9IDA7XG4gICAgICAgIGlmIChwb3BbYV0udHlwZSA9PT0gJ2NvbnRpbnVvdXMnKSB7XG4gICAgICAgICAgICBwb3BbYV0ubWVzaCA9IG5ldyBUSFJFRS5NZXNoKG5ldyBUSFJFRS5UZXRyYWhlZHJvbkdlb21ldHJ5KDEsIDEpLCBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe1xuICAgICAgICAgICAgICAgIGNvbG9yOiAweDAwZmYwMFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgcG9wW2FdLm1lc2gucUlkID0gcG9wW2FdLmlkO1xuICAgICAgICAgICAgcG9wW2FdLm1lc2gudHlwZSA9ICdhZ2VudCc7XG4gICAgICAgICAgICBwb3BbYV0ucG9zaXRpb24gPSB7IHg6IDAsIHk6IDAsIHo6IDAgfTtcbiAgICAgICAgICAgIHBvcFthXS5wb3NpdGlvbi54ID0gcm5nLnJhbmRSYW5nZShib3VuZGFyaWVzLmxlZnQsIGJvdW5kYXJpZXMucmlnaHQpO1xuICAgICAgICAgICAgcG9wW2FdLnBvc2l0aW9uLnkgPSBybmcucmFuZFJhbmdlKGJvdW5kYXJpZXMuYm90dG9tLCBib3VuZGFyaWVzLnRvcCk7XG4gICAgICAgICAgICBwb3BbYV0ubWVzaC5wb3NpdGlvbi54ID0gcG9wW2FdLnBvc2l0aW9uLng7XG4gICAgICAgICAgICBwb3BbYV0ubWVzaC5wb3NpdGlvbi55ID0gcG9wW2FdLnBvc2l0aW9uLnk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHNjZW5lICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHNjZW5lLmFkZChwb3BbYV0ubWVzaCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBvcFthXS50eXBlID09PSAnZ2Vvc3BhdGlhbCcpIHtcbiAgICAgICAgICAgIGxvY3MuZmVhdHVyZXNbYV0gPSB0dXJmLnBvaW50KFtybmcucmFuZFJhbmdlKC03NS4xNDY3LCAtNzUuMTg2NyksIHJuZy5yYW5kUmFuZ2UoMzkuOTIwMCwgMzkuOTkwMCldKTtcbiAgICAgICAgICAgIHBvcFthXS5sb2NhdGlvbiA9IGxvY3MuZmVhdHVyZXNbYV07XG4gICAgICAgICAgICBwb3BbYV0ubG9jYXRpb24ucHJvcGVydGllcy5hZ2VudFJlZklEID0gcG9wW2FdLmlkO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGtleSBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICBsZXQgZCA9IG9wdGlvbnNba2V5XTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZC5hc3NpZ24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBwb3BbYV1ba2V5XSA9IGQuYXNzaWduKHBvcFthXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBwb3BbYV1ba2V5XSA9IGQuYXNzaWduO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIDtcbiAgICAgICAgY3VycmVudEFnZW50SWQrKztcbiAgICB9XG4gICAgZm9yICh2YXIgciA9IDA7IHIgPCAzOyByKyspIHtcbiAgICAgICAgcG9wW3JdLnN0YXRlcy5pbGxuZXNzID0gJ2luZmVjdGlvdXMnO1xuICAgICAgICBwb3Bbcl0uaW5mZWN0aW91cyA9IHRydWU7XG4gICAgICAgIHBvcFtyXS5wYXRob2dlbkxvYWQgPSA0ZTQ7XG4gICAgfVxuICAgIGZvciAobGV0IGEgPSAwOyBhIDwgcG9wLmxlbmd0aDsgYSsrKSB7XG4gICAgICAgIGZvciAobGV0IGtleSBpbiBwb3BbYV0uc3RhdGVzKSB7XG4gICAgICAgICAgICBwb3BbYV1bcG9wW2FdLnN0YXRlc1trZXldXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFtwb3AsIGxvY3NdO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXRpbHMuanMubWFwIiwiaW1wb3J0IHsgZ2VuZXJhdGVVVUlEIH0gZnJvbSAnLi91dGlscyc7XG4vKipcbipRQ29tcG9uZW50cyBhcmUgdGhlIGJhc2UgY2xhc3MgZm9yIG1hbnkgbW9kZWwgY29tcG9uZW50cy5cbiovXG5leHBvcnQgY2xhc3MgUUNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IobmFtZSkge1xuICAgICAgICB0aGlzLmlkID0gZ2VuZXJhdGVVVUlEKCk7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMudGltZSA9IDA7XG4gICAgICAgIHRoaXMuaGlzdG9yeSA9IFtdO1xuICAgIH1cbiAgICAvKiogVGFrZSBvbmUgdGltZSBzdGVwIGZvcndhcmQgKG1vc3Qgc3ViY2xhc3NlcyBvdmVycmlkZSB0aGUgYmFzZSBtZXRob2QpXG4gICAgKiBAcGFyYW0gc3RlcCBzaXplIG9mIHRpbWUgc3RlcCAoaW4gZGF5cyBieSBjb252ZW50aW9uKVxuICAgICovXG4gICAgdXBkYXRlKGFnZW50LCBzdGVwKSB7XG4gICAgICAgIC8vc29tZXRoaW5nIHN1cGVyIVxuICAgIH1cbn1cblFDb21wb25lbnQuU1VDQ0VTUyA9IDE7XG5RQ29tcG9uZW50LkZBSUxFRCA9IDI7XG5RQ29tcG9uZW50LlJVTk5JTkcgPSAzO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9UUNvbXBvbmVudC5qcy5tYXAiLCJpbXBvcnQgeyBRQ29tcG9uZW50IH0gZnJvbSAnLi9RQ29tcG9uZW50JztcbmltcG9ydCB7IGdldE1hdGNoZXJTdHJpbmcgfSBmcm9tICcuL3V0aWxzJztcbi8qKlxuKiBCZWxpZWYgRGVzaXJlIEludGVudCBhZ2VudHMgYXJlIHNpbXBsZSBwbGFubmluZyBhZ2VudHMgd2l0aCBtb2R1bGFyIHBsYW5zIC8gZGVsaWJlcmF0aW9uIHByb2Nlc3Nlcy5cbiovXG5leHBvcnQgY2xhc3MgQkRJQWdlbnQgZXh0ZW5kcyBRQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBnb2FscyA9IFtdLCBwbGFucyA9IHt9LCBkYXRhID0gW10sIHBvbGljeVNlbGVjdG9yID0gQkRJQWdlbnQuc3RvY2hhc3RpY1NlbGVjdGlvbikge1xuICAgICAgICBzdXBlcihuYW1lKTtcbiAgICAgICAgdGhpcy5nb2FscyA9IGdvYWxzO1xuICAgICAgICB0aGlzLnBsYW5zID0gcGxhbnM7XG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgICAgIHRoaXMucG9saWN5U2VsZWN0b3IgPSBwb2xpY3lTZWxlY3RvcjtcbiAgICAgICAgdGhpcy5iZWxpZWZIaXN0b3J5ID0gW107XG4gICAgICAgIHRoaXMucGxhbkhpc3RvcnkgPSBbXTtcbiAgICB9XG4gICAgLyoqIFRha2Ugb25lIHRpbWUgc3RlcCBmb3J3YXJkLCB0YWtlIGluIGJlbGllZnMsIGRlbGliZXJhdGUsIGltcGxlbWVudCBwb2xpY3lcbiAgICAqIEBwYXJhbSBzdGVwIHNpemUgb2YgdGltZSBzdGVwIChpbiBkYXlzIGJ5IGNvbnZlbnRpb24pXG4gICAgKi9cbiAgICB1cGRhdGUoYWdlbnQsIHN0ZXApIHtcbiAgICAgICAgdmFyIHBvbGljeSwgaW50ZW50LCBldmFsdWF0aW9uO1xuICAgICAgICBwb2xpY3kgPSB0aGlzLnBvbGljeVNlbGVjdG9yKHRoaXMucGxhbnMsIHRoaXMucGxhbkhpc3RvcnksIGFnZW50KTtcbiAgICAgICAgaW50ZW50ID0gdGhpcy5wbGFuc1twb2xpY3ldO1xuICAgICAgICBpbnRlbnQoYWdlbnQsIHN0ZXApO1xuICAgICAgICBldmFsdWF0aW9uID0gdGhpcy5ldmFsdWF0ZUdvYWxzKGFnZW50KTtcbiAgICAgICAgdGhpcy5wbGFuSGlzdG9yeS5wdXNoKHsgdGltZTogdGhpcy50aW1lLCBpZDogYWdlbnQuaWQsIGludGVudGlvbjogcG9saWN5LCBnb2FsczogZXZhbHVhdGlvbi5hY2hpZXZlbWVudHMsIGJhcnJpZXJzOiBldmFsdWF0aW9uLmJhcnJpZXJzLCByOiBldmFsdWF0aW9uLnN1Y2Nlc3NlcyAvIHRoaXMuZ29hbHMubGVuZ3RoIH0pO1xuICAgIH1cbiAgICBldmFsdWF0ZUdvYWxzKGFnZW50KSB7XG4gICAgICAgIGxldCBhY2hpZXZlbWVudHMgPSBbXSwgYmFycmllcnMgPSBbXSwgc3VjY2Vzc2VzID0gMCwgYywgbWF0Y2hlcjtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmdvYWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjID0gdGhpcy5nb2Fsc1tpXS5jb25kaXRpb247XG4gICAgICAgICAgICBpZiAodHlwZW9mIGMuZGF0YSA9PT0gJ3VuZGVmaW5lZCcgfHwgYy5kYXRhID09PSBcImFnZW50XCIpIHtcbiAgICAgICAgICAgICAgICBjLmRhdGEgPSBhZ2VudDsgLy9pZiBubyBkYXRhc291cmNlIGlzIHNldCwgdXNlIHRoZSBhZ2VudFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWNoaWV2ZW1lbnRzW2ldID0gdGhpcy5nb2Fsc1tpXS50ZW1wb3JhbChjLmNoZWNrKGMuZGF0YVtjLmtleV0sIGMudmFsdWUpKTtcbiAgICAgICAgICAgIGlmIChhY2hpZXZlbWVudHNbaV0gPT09IEJESUFnZW50LlNVQ0NFU1MpIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzZXMgKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG1hdGNoZXIgPSBnZXRNYXRjaGVyU3RyaW5nKGMuY2hlY2spO1xuICAgICAgICAgICAgICAgIGJhcnJpZXJzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogYy5sYWJlbCxcbiAgICAgICAgICAgICAgICAgICAga2V5OiBjLmtleSxcbiAgICAgICAgICAgICAgICAgICAgY2hlY2s6IG1hdGNoZXIsXG4gICAgICAgICAgICAgICAgICAgIGFjdHVhbDogYy5kYXRhW2Mua2V5XSxcbiAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IGMudmFsdWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdWNjZXNzZXM6IHN1Y2Nlc3NlcywgYmFycmllcnM6IGJhcnJpZXJzLCBhY2hpZXZlbWVudHM6IGFjaGlldmVtZW50cyB9O1xuICAgIH1cbiAgICAvL2dvb2QgZm9yIHRyYWluaW5nXG4gICAgc3RhdGljIHN0b2NoYXN0aWNTZWxlY3Rpb24ocGxhbnMsIHBsYW5IaXN0b3J5LCBhZ2VudCkge1xuICAgICAgICB2YXIgcG9saWN5LCBzY29yZSwgbWF4ID0gMDtcbiAgICAgICAgZm9yICh2YXIgcGxhbiBpbiBwbGFucykge1xuICAgICAgICAgICAgc2NvcmUgPSBNYXRoLnJhbmRvbSgpO1xuICAgICAgICAgICAgaWYgKHNjb3JlID49IG1heCkge1xuICAgICAgICAgICAgICAgIG1heCA9IHNjb3JlO1xuICAgICAgICAgICAgICAgIHBvbGljeSA9IHBsYW47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBvbGljeTtcbiAgICB9XG59XG5CRElBZ2VudC5sYXp5UG9saWN5U2VsZWN0aW9uID0gZnVuY3Rpb24gKHBsYW5zLCBwbGFuSGlzdG9yeSwgYWdlbnQpIHtcbiAgICB2YXIgb3B0aW9ucywgc2VsZWN0aW9uO1xuICAgIGlmICh0aGlzLnRpbWUgPiAwKSB7XG4gICAgICAgIG9wdGlvbnMgPSBPYmplY3Qua2V5cyhwbGFucyk7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zLnNsaWNlKDEsIG9wdGlvbnMubGVuZ3RoKTtcbiAgICAgICAgc2VsZWN0aW9uID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogb3B0aW9ucy5sZW5ndGgpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgb3B0aW9ucyA9IE9iamVjdC5rZXlzKHBsYW5zKTtcbiAgICAgICAgc2VsZWN0aW9uID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIG9wdGlvbnNbc2VsZWN0aW9uXTtcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1iZGkuanMubWFwIiwiaW1wb3J0IHsgUUNvbXBvbmVudCB9IGZyb20gJy4vUUNvbXBvbmVudCc7XG5pbXBvcnQgeyBnZW5lcmF0ZVVVSUQgfSBmcm9tICcuL3V0aWxzJztcbi8qKlxuKiBCZWhhdmlvciBUcmVlXG4qKi9cbmV4cG9ydCBjbGFzcyBCZWhhdmlvclRyZWUgZXh0ZW5kcyBRQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgdGljayhub2RlLCBhZ2VudCkge1xuICAgICAgICB2YXIgc3RhdGUgPSBub2RlLm9wZXJhdGUoYWdlbnQpO1xuICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHJvb3QsIGRhdGEpIHtcbiAgICAgICAgc3VwZXIobmFtZSk7XG4gICAgICAgIHRoaXMucm9vdCA9IHJvb3Q7XG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgICAgIHRoaXMucmVzdWx0cyA9IFtdO1xuICAgIH1cbiAgICB1cGRhdGUoYWdlbnQsIHN0ZXApIHtcbiAgICAgICAgdmFyIHN0YXRlO1xuICAgICAgICBhZ2VudC5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB3aGlsZSAoYWdlbnQuYWN0aXZlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBzdGF0ZSA9IEJlaGF2aW9yVHJlZS50aWNrKHRoaXMucm9vdCwgYWdlbnQpO1xuICAgICAgICAgICAgYWdlbnQudGltZSA9IHRoaXMudGltZTtcbiAgICAgICAgICAgIGFnZW50LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgQlROb2RlIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lKSB7XG4gICAgICAgIHRoaXMuaWQgPSBnZW5lcmF0ZVVVSUQoKTtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgQlRDb250cm9sTm9kZSBleHRlbmRzIEJUTm9kZSB7XG4gICAgY29uc3RydWN0b3IobmFtZSwgY2hpbGRyZW4pIHtcbiAgICAgICAgc3VwZXIobmFtZSk7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgQlRSb290IGV4dGVuZHMgQlRDb250cm9sTm9kZSB7XG4gICAgY29uc3RydWN0b3IobmFtZSwgY2hpbGRyZW4pIHtcbiAgICAgICAgc3VwZXIobmFtZSwgY2hpbGRyZW4pO1xuICAgICAgICB0aGlzLnR5cGUgPSBcInJvb3RcIjtcbiAgICAgICAgdGhpcy5vcGVyYXRlID0gZnVuY3Rpb24gKGFnZW50KSB7XG4gICAgICAgICAgICB2YXIgc3RhdGUgPSBCZWhhdmlvclRyZWUudGljayh0aGlzLmNoaWxkcmVuWzBdLCBhZ2VudCk7XG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgICAgIH07XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEJUU2VsZWN0b3IgZXh0ZW5kcyBCVENvbnRyb2xOb2RlIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBjaGlsZHJlbikge1xuICAgICAgICBzdXBlcihuYW1lLCBjaGlsZHJlbik7XG4gICAgICAgIHRoaXMudHlwZSA9IFwic2VsZWN0b3JcIjtcbiAgICAgICAgdGhpcy5vcGVyYXRlID0gZnVuY3Rpb24gKGFnZW50KSB7XG4gICAgICAgICAgICB2YXIgY2hpbGRTdGF0ZTtcbiAgICAgICAgICAgIGZvciAodmFyIGNoaWxkIGluIHRoaXMuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBjaGlsZFN0YXRlID0gQmVoYXZpb3JUcmVlLnRpY2sodGhpcy5jaGlsZHJlbltjaGlsZF0sIGFnZW50KTtcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRTdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLlJVTk5JTkcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5SVU5OSU5HO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRTdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLlNVQ0NFU1MpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5TVUNDRVNTO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBCZWhhdmlvclRyZWUuRkFJTEVEO1xuICAgICAgICB9O1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBCVFNlcXVlbmNlIGV4dGVuZHMgQlRDb250cm9sTm9kZSB7XG4gICAgY29uc3RydWN0b3IobmFtZSwgY2hpbGRyZW4pIHtcbiAgICAgICAgc3VwZXIobmFtZSwgY2hpbGRyZW4pO1xuICAgICAgICB0aGlzLnR5cGUgPSBcInNlcXVlbmNlXCI7XG4gICAgICAgIHRoaXMub3BlcmF0ZSA9IGZ1bmN0aW9uIChhZ2VudCkge1xuICAgICAgICAgICAgdmFyIGNoaWxkU3RhdGU7XG4gICAgICAgICAgICBmb3IgKHZhciBjaGlsZCBpbiB0aGlzLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgY2hpbGRTdGF0ZSA9IEJlaGF2aW9yVHJlZS50aWNrKHRoaXMuY2hpbGRyZW5bY2hpbGRdLCBhZ2VudCk7XG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5SVU5OSU5HKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBCZWhhdmlvclRyZWUuUlVOTklORztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5GQUlMRUQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5GQUlMRUQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5TVUNDRVNTO1xuICAgICAgICB9O1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBCVFBhcmFsbGVsIGV4dGVuZHMgQlRDb250cm9sTm9kZSB7XG4gICAgY29uc3RydWN0b3IobmFtZSwgY2hpbGRyZW4sIHN1Y2Nlc3Nlcykge1xuICAgICAgICBzdXBlcihuYW1lLCBjaGlsZHJlbik7XG4gICAgICAgIHRoaXMudHlwZSA9IFwicGFyYWxsZWxcIjtcbiAgICAgICAgdGhpcy5zdWNjZXNzZXMgPSBzdWNjZXNzZXM7XG4gICAgICAgIHRoaXMub3BlcmF0ZSA9IGZ1bmN0aW9uIChhZ2VudCkge1xuICAgICAgICAgICAgdmFyIHN1Y2NlZWRlZCA9IFtdLCBmYWlsdXJlcyA9IFtdLCBjaGlsZFN0YXRlLCBtYWpvcml0eTtcbiAgICAgICAgICAgIGZvciAodmFyIGNoaWxkIGluIHRoaXMuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBjaGlsZFN0YXRlID0gQmVoYXZpb3JUcmVlLnRpY2sodGhpcy5jaGlsZHJlbltjaGlsZF0sIGFnZW50KTtcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRTdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLlNVQ0NFU1MpIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VlZGVkLnB1c2goY2hpbGRTdGF0ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5GQUlMRUQpIHtcbiAgICAgICAgICAgICAgICAgICAgZmFpbHVyZXMucHVzaChjaGlsZFN0YXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY2hpbGRTdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLlJVTk5JTkcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5SVU5OSU5HO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdWNjZWVkZWQubGVuZ3RoID49IHRoaXMuc3VjY2Vzc2VzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5TVUNDRVNTO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5GQUlMRUQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEJUQ29uZGl0aW9uIGV4dGVuZHMgQlROb2RlIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBjb25kaXRpb24pIHtcbiAgICAgICAgc3VwZXIobmFtZSk7XG4gICAgICAgIHRoaXMudHlwZSA9IFwiY29uZGl0aW9uXCI7XG4gICAgICAgIHRoaXMuY29uZGl0aW9uID0gY29uZGl0aW9uO1xuICAgICAgICB0aGlzLm9wZXJhdGUgPSBmdW5jdGlvbiAoYWdlbnQpIHtcbiAgICAgICAgICAgIHZhciBzdGF0ZTtcbiAgICAgICAgICAgIHN0YXRlID0gY29uZGl0aW9uLmNoZWNrKGFnZW50W2NvbmRpdGlvbi5rZXldLCBjb25kaXRpb24udmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xuICAgICAgICB9O1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBCVEFjdGlvbiBleHRlbmRzIEJUTm9kZSB7XG4gICAgY29uc3RydWN0b3IobmFtZSwgY29uZGl0aW9uLCBhY3Rpb24pIHtcbiAgICAgICAgc3VwZXIobmFtZSk7XG4gICAgICAgIHRoaXMudHlwZSA9IFwiYWN0aW9uXCI7XG4gICAgICAgIHRoaXMuY29uZGl0aW9uID0gY29uZGl0aW9uO1xuICAgICAgICB0aGlzLmFjdGlvbiA9IGFjdGlvbjtcbiAgICAgICAgdGhpcy5vcGVyYXRlID0gZnVuY3Rpb24gKGFnZW50KSB7XG4gICAgICAgICAgICB2YXIgc3RhdGU7XG4gICAgICAgICAgICBzdGF0ZSA9IGNvbmRpdGlvbi5jaGVjayhhZ2VudFtjb25kaXRpb24ua2V5XSwgY29uZGl0aW9uLnZhbHVlKTtcbiAgICAgICAgICAgIGlmIChzdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLlNVQ0NFU1MpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGlvbihhZ2VudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgICAgIH07XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YmVoYXZpb3JUcmVlLmpzLm1hcCIsImltcG9ydCB7IGdlbmVyYXRlVVVJRCB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgUUNvbXBvbmVudCB9IGZyb20gJy4vUUNvbXBvbmVudCc7XG5leHBvcnQgY2xhc3MgQ29tcGFydG1lbnRNb2RlbCBleHRlbmRzIFFDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNvbXBhcnRtZW50cywgZGF0YSkge1xuICAgICAgICBzdXBlcihuYW1lKTtcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTsgLy9hbiBhcnJheSBvZiBQYXRjaGVzLiBFYWNoIHBhdGNoIGNvbnRhaW5zIGFuIGFycmF5IG9mIGNvbXBhcnRtZW50cyBpbiBvcGVyYXRpb25hbCBvcmRlclxuICAgICAgICB0aGlzLnRvdGFsUG9wID0gMDtcbiAgICAgICAgdGhpcy5jb21wYXJ0bWVudHMgPSBjb21wYXJ0bWVudHM7XG4gICAgICAgIHRoaXMuaGlzdG9yeSA9IFtdO1xuICAgICAgICBmb3IgKGxldCBkID0gMDsgZCA8IHRoaXMuZGF0YS5sZW5ndGg7IGQrKykge1xuICAgICAgICAgICAgdGhpcy50b3RhbFBvcCArPSB0aGlzLmRhdGFbZF0udG90YWxQb3A7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fdG9sZXJhbmNlID0gMWUtOTsgLy9tb2RlbCBlcnIgdG9sZXJhbmNlXG4gICAgfVxuICAgIHVwZGF0ZShwYXRjaCwgc3RlcCkge1xuICAgICAgICBsZXQgdGVtcF9wb3AgPSB7fSwgdGVtcF9kID0ge30sIG5leHRfZCA9IHt9LCBsdGUgPSB7fSwgZXJyID0gMSwgbmV3U3RlcDtcbiAgICAgICAgZm9yIChsZXQgYyBpbiB0aGlzLmNvbXBhcnRtZW50cykge1xuICAgICAgICAgICAgcGF0Y2guZHBvcHNbY10gPSB0aGlzLmNvbXBhcnRtZW50c1tjXS5vcGVyYXRpb24ocGF0Y2gucG9wdWxhdGlvbnMsIHN0ZXApO1xuICAgICAgICB9XG4gICAgICAgIC8vZmlyc3Qgb3JkZXIgKEV1bGVyKVxuICAgICAgICBmb3IgKGxldCBjIGluIHRoaXMuY29tcGFydG1lbnRzKSB7XG4gICAgICAgICAgICB0ZW1wX3BvcFtjXSA9IHBhdGNoLnBvcHVsYXRpb25zW2NdO1xuICAgICAgICAgICAgdGVtcF9kW2NdID0gcGF0Y2guZHBvcHNbY107XG4gICAgICAgICAgICBwYXRjaC5wb3B1bGF0aW9uc1tjXSA9IHRlbXBfcG9wW2NdICsgdGVtcF9kW2NdO1xuICAgICAgICB9XG4gICAgICAgIC8vc2Vjb25kIG9yZGVyIChIZXVucylcbiAgICAgICAgcGF0Y2gudG90YWxQb3AgPSAwO1xuICAgICAgICBmb3IgKGxldCBjIGluIHRoaXMuY29tcGFydG1lbnRzKSB7XG4gICAgICAgICAgICBuZXh0X2RbY10gPSB0aGlzLmNvbXBhcnRtZW50c1tjXS5vcGVyYXRpb24ocGF0Y2gucG9wdWxhdGlvbnMsIHN0ZXApO1xuICAgICAgICAgICAgcGF0Y2gucG9wdWxhdGlvbnNbY10gPSB0ZW1wX3BvcFtjXSArICgwLjUgKiAodGVtcF9kW2NdICsgbmV4dF9kW2NdKSk7XG4gICAgICAgICAgICBwYXRjaC50b3RhbFBvcCArPSBwYXRjaC5wb3B1bGF0aW9uc1tjXTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBDb21wYXJ0bWVudCB7XG4gICAgY29uc3RydWN0b3IobmFtZSwgcG9wLCBvcGVyYXRpb24pIHtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5vcGVyYXRpb24gPSBvcGVyYXRpb24gfHwgbnVsbDtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgUGF0Y2gge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNvbXBhcnRtZW50cywgcG9wdWxhdGlvbnMpIHtcbiAgICAgICAgdGhpcy5wb3B1bGF0aW9ucyA9IHt9O1xuICAgICAgICB0aGlzLmRwb3BzID0ge307XG4gICAgICAgIHRoaXMuaW5pdGlhbFBvcCA9IHt9O1xuICAgICAgICB0aGlzLmlkID0gZ2VuZXJhdGVVVUlEKCk7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuZHBvcHMgPSB7fTtcbiAgICAgICAgdGhpcy5jb21wYXJ0bWVudHMgPSBjb21wYXJ0bWVudHM7XG4gICAgICAgIHRoaXMudG90YWxQb3AgPSAwO1xuICAgICAgICBmb3IgKGxldCBjIGluIHBvcHVsYXRpb25zKSB7XG4gICAgICAgICAgICB0aGlzLmRwb3BzW2NdID0gMDtcbiAgICAgICAgICAgIHRoaXMuaW5pdGlhbFBvcFtjXSA9IHBvcHVsYXRpb25zW2NdO1xuICAgICAgICAgICAgdGhpcy5wb3B1bGF0aW9uc1tjXSA9IHBvcHVsYXRpb25zW2NdO1xuICAgICAgICAgICAgdGhpcy50b3RhbFBvcCArPSB0aGlzLnBvcHVsYXRpb25zW2NdO1xuICAgICAgICB9XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29tcGFydG1lbnQuanMubWFwIiwiaW1wb3J0IHsgZ2VuZXJhdGVVVUlEIH0gZnJvbSAnLi91dGlscyc7XG5leHBvcnQgY2xhc3MgQ29udGFjdFBhdGNoIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBjYXBhY2l0eSkge1xuICAgICAgICB0aGlzLmlkID0gZ2VuZXJhdGVVVUlEKCk7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuY2FwYWNpdHkgPSBjYXBhY2l0eTtcbiAgICAgICAgdGhpcy5wb3AgPSAwO1xuICAgICAgICB0aGlzLm1lbWJlcnMgPSB7fTtcbiAgICB9XG4gICAgc3RhdGljIGRlZmF1bHRGcmVxRihhLCBiKSB7XG4gICAgICAgIHZhciB2YWwgPSAoNTAgLSBNYXRoLmFicyhhLmFnZSAtIGIuYWdlKSkgLyAxMDA7XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICAgIHN0YXRpYyBkZWZhdWx0Q29udGFjdEYoYSwgdGltZSkge1xuICAgICAgICB2YXIgYyA9IDIgKiBNYXRoLnNpbih0aW1lKSArIGE7XG4gICAgICAgIGlmIChjID49IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGFzc2lnbihhZ2VudCwgY29udGFjdFZhbHVlRnVuYykge1xuICAgICAgICB2YXIgY29udGFjdFZhbHVlO1xuICAgICAgICBjb250YWN0VmFsdWVGdW5jID0gY29udGFjdFZhbHVlRnVuYyB8fCBDb250YWN0UGF0Y2guZGVmYXVsdEZyZXFGO1xuICAgICAgICBpZiAodGhpcy5wb3AgPCB0aGlzLmNhcGFjaXR5KSB7XG4gICAgICAgICAgICB0aGlzLm1lbWJlcnNbYWdlbnQuaWRdID0geyBwcm9wZXJ0aWVzOiBhZ2VudCB9O1xuICAgICAgICAgICAgZm9yIChsZXQgb3RoZXIgaW4gdGhpcy5tZW1iZXJzKSB7XG4gICAgICAgICAgICAgICAgbGV0IGlkID0gcGFyc2VJbnQob3RoZXIpO1xuICAgICAgICAgICAgICAgIGlmIChvdGhlciAhPT0gYWdlbnQuaWQgJiYgIWlzTmFOKGlkKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250YWN0VmFsdWUgPSBjb250YWN0VmFsdWVGdW5jKHRoaXMubWVtYmVyc1tpZF0ucHJvcGVydGllcywgYWdlbnQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbWJlcnNbYWdlbnQuaWRdW2lkXSA9IGNvbnRhY3RWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW1iZXJzW2lkXVthZ2VudC5pZF0gPSBjb250YWN0VmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wb3ArKztcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmlkO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZW5jb3VudGVycyhhZ2VudCwgcHJlY29uZGl0aW9uLCBjb250YWN0RnVuYywgcmVzdWx0S2V5LCBzYXZlID0gZmFsc2UpIHtcbiAgICAgICAgY29udGFjdEZ1bmMgPSBjb250YWN0RnVuYyB8fCBDb250YWN0UGF0Y2guZGVmYXVsdENvbnRhY3RGO1xuICAgICAgICBsZXQgY29udGFjdFZhbDtcbiAgICAgICAgZm9yICh2YXIgY29udGFjdCBpbiB0aGlzLm1lbWJlcnMpIHtcbiAgICAgICAgICAgIGlmIChwcmVjb25kaXRpb24ua2V5ID09PSAnc3RhdGVzJykge1xuICAgICAgICAgICAgICAgIGNvbnRhY3RWYWwgPSBKU09OLnN0cmluZ2lmeSh0aGlzLm1lbWJlcnNbY29udGFjdF0ucHJvcGVydGllc1twcmVjb25kaXRpb24ua2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb250YWN0VmFsID0gdGhpcy5tZW1iZXJzW2NvbnRhY3RdLnByb3BlcnRpZXNbcHJlY29uZGl0aW9uLmtleV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocHJlY29uZGl0aW9uLmNoZWNrKHRoaXMubWVtYmVyc1tjb250YWN0XS5wcm9wZXJ0aWVzW3ByZWNvbmRpdGlvbi5rZXldLCBwcmVjb25kaXRpb24udmFsdWUpICYmIE51bWJlcihjb250YWN0KSAhPT0gYWdlbnQuaWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgb2xkVmFsID0gdGhpcy5tZW1iZXJzW2NvbnRhY3RdLnByb3BlcnRpZXNbcmVzdWx0S2V5XTtcbiAgICAgICAgICAgICAgICB2YXIgbmV3VmFsID0gY29udGFjdEZ1bmModGhpcy5tZW1iZXJzW2NvbnRhY3RdLCBhZ2VudCk7XG4gICAgICAgICAgICAgICAgaWYgKG9sZFZhbCAhPT0gbmV3VmFsICYmIHNhdmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW1iZXJzW2NvbnRhY3RdLnByb3BlcnRpZXNbcmVzdWx0S2V5XSA9IG5ld1ZhbDtcbiAgICAgICAgICAgICAgICAgICAgQ29udGFjdFBhdGNoLldJV0FycmF5LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgcGF0Y2hJRDogdGhpcy5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZmVjdGVkOiBjb250YWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5mZWN0ZWRBZ2U6IHRoaXMubWVtYmVyc1tjb250YWN0XS5wcm9wZXJ0aWVzLmFnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdDogdGhpcy5tZW1iZXJzW2NvbnRhY3RdLnByb3BlcnRpZXNbcmVzdWx0S2V5XSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdEtleTogcmVzdWx0S2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgYnk6IGFnZW50LmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgYnlBZ2U6IGFnZW50LmFnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6IGFnZW50LnRpbWVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuQ29udGFjdFBhdGNoLldJV0FycmF5ID0gW107XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb250YWN0UGF0Y2guanMubWFwIiwiaW1wb3J0IHsgc2h1ZmZsZSB9IGZyb20gJy4vdXRpbHMnO1xuLyoqXG4qRW52aXJvbm1lbnRzIGFyZSB0aGUgZXhlY3V0YWJsZSBlbnZpcm9ubWVudCBjb250YWluaW5nIHRoZSBtb2RlbCBjb21wb25lbnRzLFxuKnNoYXJlZCByZXNvdXJjZXMsIGFuZCBzY2hlZHVsZXIuXG4qL1xuZXhwb3J0IGNsYXNzIEVudmlyb25tZW50IHtcbiAgICBjb25zdHJ1Y3RvcihyZXNvdXJjZXMgPSBbXSwgZmFjaWxpdGllcyA9IFtdLCBldmVudHNRdWV1ZSA9IFtdLCBhY3RpdmF0aW9uVHlwZSA9ICdyYW5kb20nLCBybmcgPSBNYXRoKSB7XG4gICAgICAgIHRoaXMudGltZSA9IDA7XG4gICAgICAgIHRoaXMudGltZU9mRGF5ID0gMDtcbiAgICAgICAgdGhpcy5tb2RlbHMgPSBbXTtcbiAgICAgICAgdGhpcy5oaXN0b3J5ID0gW107XG4gICAgICAgIHRoaXMuYWdlbnRzID0gW107XG4gICAgICAgIHRoaXMucmVzb3VyY2VzID0gcmVzb3VyY2VzO1xuICAgICAgICB0aGlzLmZhY2lsaXRpZXMgPSBmYWNpbGl0aWVzO1xuICAgICAgICB0aGlzLmV2ZW50c1F1ZXVlID0gZXZlbnRzUXVldWU7XG4gICAgICAgIHRoaXMuYWN0aXZhdGlvblR5cGUgPSBhY3RpdmF0aW9uVHlwZTtcbiAgICAgICAgdGhpcy5ybmcgPSBybmc7XG4gICAgICAgIHRoaXMuX2FnZW50SW5kZXggPSB7fTtcbiAgICB9XG4gICAgLyoqIEFkZCBhIG1vZGVsIGNvbXBvbmVudHMgZnJvbSB0aGUgZW52aXJvbm1lbnRcbiAgICAqIEBwYXJhbSBjb21wb25lbnQgdGhlIG1vZGVsIGNvbXBvbmVudCBvYmplY3QgdG8gYmUgYWRkZWQgdG8gdGhlIGVudmlyb25tZW50LlxuICAgICovXG4gICAgYWRkKGNvbXBvbmVudCkge1xuICAgICAgICB0aGlzLm1vZGVscy5wdXNoKGNvbXBvbmVudCk7XG4gICAgfVxuICAgIC8qKiBSZW1vdmUgYSBtb2RlbCBjb21wb25lbnRzIGZyb20gdGhlIGVudmlyb25tZW50IGJ5IGlkXG4gICAgKiBAcGFyYW0gaWQgVVVJRCBvZiB0aGUgY29tcG9uZW50IHRvIGJlIHJlbW92ZWQuXG4gICAgKi9cbiAgICByZW1vdmUoaWQpIHtcbiAgICAgICAgdmFyIGRlbGV0ZUluZGV4LCBMID0gdGhpcy5hZ2VudHMubGVuZ3RoO1xuICAgICAgICB0aGlzLm1vZGVscy5mb3JFYWNoKGZ1bmN0aW9uIChjLCBpbmRleCkgeyBpZiAoYy5pZCA9PT0gaWQpIHtcbiAgICAgICAgICAgIGRlbGV0ZUluZGV4ID0gaW5kZXg7XG4gICAgICAgIH0gfSk7XG4gICAgICAgIHdoaWxlIChMID4gMCAmJiB0aGlzLmFnZW50cy5sZW5ndGggPj0gMCkge1xuICAgICAgICAgICAgTC0tO1xuICAgICAgICAgICAgaWYgKHRoaXMuYWdlbnRzW0xdLm1vZGVsSW5kZXggPT09IGRlbGV0ZUluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZ2VudHMuc3BsaWNlKEwsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMubW9kZWxzLnNwbGljZShkZWxldGVJbmRleCwgMSk7XG4gICAgfVxuICAgIC8qKiBSdW4gYWxsIGVudmlyb25tZW50IG1vZGVsIGNvbXBvbmVudHMgZnJvbSB0PTAgdW50aWwgdD11bnRpbCB1c2luZyB0aW1lIHN0ZXAgPSBzdGVwXG4gICAgKiBAcGFyYW0gc3RlcCB0aGUgc3RlcCBzaXplXG4gICAgKiBAcGFyYW0gdW50aWwgdGhlIGVuZCB0aW1lXG4gICAgKiBAcGFyYW0gc2F2ZUludGVydmFsIHNhdmUgZXZlcnkgJ3gnIHN0ZXBzXG4gICAgKi9cbiAgICBydW4oc3RlcCwgdW50aWwsIHNhdmVJbnRlcnZhbCkge1xuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICAgICAgd2hpbGUgKHRoaXMudGltZSA8PSB1bnRpbCkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGUoc3RlcCk7XG4gICAgICAgICAgICBsZXQgcmVtID0gKHRoaXMudGltZSAlIHNhdmVJbnRlcnZhbCk7XG4gICAgICAgICAgICBpZiAocmVtIDwgc3RlcCkge1xuICAgICAgICAgICAgICAgIGxldCBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmFnZW50cykpO1xuICAgICAgICAgICAgICAgIHRoaXMuaGlzdG9yeSA9IHRoaXMuaGlzdG9yeS5jb25jYXQoY29weSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnRpbWUgKz0gc3RlcDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKiogQXNzaWduIGFsbCBhZ2VudHMgdG8gYXBwcm9wcmlhdGUgbW9kZWxzXG4gICAgKi9cbiAgICBpbml0KCkge1xuICAgICAgICB0aGlzLl9hZ2VudEluZGV4ID0ge307XG4gICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgdGhpcy5tb2RlbHMubGVuZ3RoOyBjKyspIHtcbiAgICAgICAgICAgIGxldCBhbHJlYWR5SW4gPSBbXTtcbiAgICAgICAgICAgIC8vYXNzaWduIGVhY2ggYWdlbnQgbW9kZWwgaW5kZXhlcyB0byBoYW5kbGUgYWdlbnRzIGFzc2lnbmVkIHRvIG11bHRpcGxlIG1vZGVsc1xuICAgICAgICAgICAgZm9yIChsZXQgZCA9IDA7IGQgPCB0aGlzLm1vZGVsc1tjXS5kYXRhLmxlbmd0aDsgZCsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IGlkID0gdGhpcy5tb2RlbHNbY10uZGF0YVtkXS5pZDtcbiAgICAgICAgICAgICAgICBpZiAoaWQgaW4gdGhpcy5fYWdlbnRJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAvL3RoaXMgYWdlbnQgYmVsb25ncyB0byBtdWx0aXBsZSBtb2RlbHMuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZWxzW2NdLmRhdGFbZF0ubW9kZWxzLnB1c2godGhpcy5tb2RlbHNbY10ubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZWxzW2NdLmRhdGFbZF0ubW9kZWxJbmRleGVzLnB1c2goYyk7XG4gICAgICAgICAgICAgICAgICAgIGFscmVhZHlJbi5wdXNoKGlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcyBhZ2VudCBiZWxvbmdzIHRvIG9ubHkgb25lIG1vZGVsIHNvIGZhci5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWdlbnRJbmRleFtpZF0gPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVsc1tjXS5kYXRhW2RdLm1vZGVscyA9IFt0aGlzLm1vZGVsc1tjXS5uYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlbHNbY10uZGF0YVtkXS5tb2RlbEluZGV4ZXMgPSBbY107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9lbGltaW5hdGUgYW55IGR1cGxpY2F0ZSBhZ2VudHMgYnkgaWRcbiAgICAgICAgICAgIHRoaXMubW9kZWxzW2NdLmRhdGEgPSB0aGlzLm1vZGVsc1tjXS5kYXRhLmZpbHRlcigoZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChhbHJlYWR5SW4uaW5kZXhPZihkLmlkKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy9jb25jYXQgdGhlIHJlc3VsdHNcbiAgICAgICAgICAgIHRoaXMuYWdlbnRzID0gdGhpcy5hZ2VudHMuY29uY2F0KHRoaXMubW9kZWxzW2NdLmRhdGEpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKiBVcGRhdGUgZWFjaCBtb2RlbCBjb21wZW5lbnQgb25lIHRpbWUgc3RlcCBmb3J3YXJkXG4gICAgKiBAcGFyYW0gc3RlcCB0aGUgc3RlcCBzaXplXG4gICAgKi9cbiAgICB1cGRhdGUoc3RlcCkge1xuICAgICAgICB2YXIgaW5kZXggPSAwO1xuICAgICAgICB3aGlsZSAoaW5kZXggPCB0aGlzLmV2ZW50c1F1ZXVlLmxlbmd0aCAmJiB0aGlzLmV2ZW50c1F1ZXVlW2luZGV4XS5hdCA8PSB0aGlzLnRpbWUpIHtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzUXVldWVbaW5kZXhdLnRyaWdnZXIoKTtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzUXVldWVbaW5kZXhdLnRyaWdnZXJlZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAodGhpcy5ldmVudHNRdWV1ZVtpbmRleF0udW50aWwgPD0gdGhpcy50aW1lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ldmVudHNRdWV1ZS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5hY3RpdmF0aW9uVHlwZSA9PT0gXCJyYW5kb21cIikge1xuICAgICAgICAgICAgc2h1ZmZsZSh0aGlzLmFnZW50cywgdGhpcy5ybmcpO1xuICAgICAgICAgICAgdGhpcy5hZ2VudHMuZm9yRWFjaCgoYWdlbnQsIGkpID0+IHsgdGhpcy5fYWdlbnRJbmRleFthZ2VudC5pZF0gPSBpOyB9KTsgLy8gcmVhc3NpZ24gYWdlbnRcbiAgICAgICAgICAgIHRoaXMuYWdlbnRzLmZvckVhY2goKGFnZW50LCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgYWdlbnQubW9kZWxJbmRleGVzLmZvckVhY2goKG1vZGVsSW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlbHNbbW9kZWxJbmRleF0udXBkYXRlKGFnZW50LCBzdGVwKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBhZ2VudC50aW1lID0gYWdlbnQudGltZSArIHN0ZXAgfHwgMDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmFjdGl2YXRpb25UeXBlID09PSBcInBhcmFsbGVsXCIpIHtcbiAgICAgICAgICAgIGxldCB0ZW1wQWdlbnRzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmFnZW50cykpO1xuICAgICAgICAgICAgdGVtcEFnZW50cy5mb3JFYWNoKChhZ2VudCkgPT4ge1xuICAgICAgICAgICAgICAgIGFnZW50Lm1vZGVsSW5kZXhlcy5mb3JFYWNoKChtb2RlbEluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZWxzW21vZGVsSW5kZXhdLnVwZGF0ZShhZ2VudCwgc3RlcCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuYWdlbnRzLmZvckVhY2goKGFnZW50LCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgYWdlbnQubW9kZWxJbmRleGVzLmZvckVhY2goKG1vZGVsSW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlbHNbbW9kZWxJbmRleF0uYXBwbHkoYWdlbnQsIHRlbXBBZ2VudHNbaV0sIHN0ZXApO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGFnZW50LnRpbWUgPSBhZ2VudC50aW1lICsgc3RlcCB8fCAwO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqIEZvcm1hdCBhIHRpbWUgb2YgZGF5LiBDdXJyZW50IHRpbWUgJSAxLlxuICAgICpcbiAgICAqL1xuICAgIGZvcm1hdFRpbWUoKSB7XG4gICAgICAgIHRoaXMudGltZU9mRGF5ID0gdGhpcy50aW1lICUgMTtcbiAgICB9XG4gICAgLyoqIEdldHMgYWdlbnQgYnkgaWQuIEEgdXRpbGl0eSBmdW5jdGlvbiB0aGF0XG4gICAgKlxuICAgICovXG4gICAgZ2V0QWdlbnRCeUlkKGlkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFnZW50c1t0aGlzLl9hZ2VudEluZGV4W2lkXV07XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZW52aXJvbm1lbnQuanMubWFwIiwiZXhwb3J0IGNsYXNzIEVwaSB7XG4gICAgc3RhdGljIHByZXZhbGVuY2UoY2FzZXMsIHRvdGFsKSB7XG4gICAgICAgIHZhciBwcmV2ID0gY2FzZXMgLyB0b3RhbDtcbiAgICAgICAgcmV0dXJuIHByZXY7XG4gICAgfVxuICAgIHN0YXRpYyByaXNrRGlmZmVyZW5jZSh0YWJsZSkge1xuICAgICAgICB2YXIgcmQgPSB0YWJsZS5hIC8gKHRhYmxlLmEgKyB0YWJsZS5iKSAtIHRhYmxlLmMgLyAodGFibGUuYyArIHRhYmxlLmQpO1xuICAgICAgICByZXR1cm4gcmQ7XG4gICAgfVxuICAgIHN0YXRpYyByaXNrUmF0aW8odGFibGUpIHtcbiAgICAgICAgdmFyIHJyYXRpbyA9ICh0YWJsZS5hIC8gKHRhYmxlLmEgKyB0YWJsZS5iKSkgLyAodGFibGUuYyAvICh0YWJsZS5jICsgdGFibGUuZCkpO1xuICAgICAgICByZXR1cm4gcnJhdGlvO1xuICAgIH1cbiAgICBzdGF0aWMgb2Rkc1JhdGlvKHRhYmxlKSB7XG4gICAgICAgIHZhciBvciA9ICh0YWJsZS5hICogdGFibGUuZCkgLyAodGFibGUuYiAqIHRhYmxlLmMpO1xuICAgICAgICByZXR1cm4gb3I7XG4gICAgfVxuICAgIHN0YXRpYyBJUEYyRChyb3dUb3RhbHMsIGNvbFRvdGFscywgaXRlcmF0aW9ucywgc2VlZHMpIHtcbiAgICAgICAgdmFyIHJUID0gMCwgY1QgPSAwLCBzZWVkQ2VsbHMgPSBzZWVkcztcbiAgICAgICAgcm93VG90YWxzLmZvckVhY2goZnVuY3Rpb24gKHIsIGkpIHtcbiAgICAgICAgICAgIHJUICs9IHI7XG4gICAgICAgICAgICBzZWVkQ2VsbHNbaV0gPSBzZWVkQ2VsbHNbaV0gfHwgW107XG4gICAgICAgIH0pO1xuICAgICAgICBjb2xUb3RhbHMuZm9yRWFjaChmdW5jdGlvbiAoYywgaikge1xuICAgICAgICAgICAgY1QgKz0gYztcbiAgICAgICAgICAgIHNlZWRDZWxscy5mb3JFYWNoKGZ1bmN0aW9uIChyb3csIGspIHtcbiAgICAgICAgICAgICAgICBzZWVkQ2VsbHNba11bal0gPSBzZWVkQ2VsbHNba11bal0gfHwgTWF0aC5yb3VuZChyb3dUb3RhbHNba10gLyByb3dUb3RhbHMubGVuZ3RoICsgKGNvbFRvdGFsc1tqXSAvIGNvbFRvdGFscy5sZW5ndGgpIC8gMiAqIE1hdGgucmFuZG9tKCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoclQgPT09IGNUKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpdGVyID0gMDsgaXRlciA8IGl0ZXJhdGlvbnM7IGl0ZXIrKykge1xuICAgICAgICAgICAgICAgIHNlZWRDZWxscy5mb3JFYWNoKGZ1bmN0aW9uIChyb3csIGlpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50Um93VG90YWwgPSAwO1xuICAgICAgICAgICAgICAgICAgICByb3cuZm9yRWFjaChmdW5jdGlvbiAoY2VsbCwgaikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFJvd1RvdGFsICs9IGNlbGw7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByb3cuZm9yRWFjaChmdW5jdGlvbiAoY2VsbCwgamopIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZWRDZWxsc1tpaV1bampdID0gY2VsbCAvIGN1cnJlbnRSb3dUb3RhbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZWRDZWxsc1tpaV1bampdICo9IHJvd1RvdGFsc1tpaV07XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IGNvbFRvdGFscy5sZW5ndGg7IGNvbCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50Q29sVG90YWwgPSAwO1xuICAgICAgICAgICAgICAgICAgICBzZWVkQ2VsbHMuZm9yRWFjaChmdW5jdGlvbiAociwgaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudENvbFRvdGFsICs9IHJbY29sXTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHNlZWRDZWxscy5mb3JFYWNoKGZ1bmN0aW9uIChyb3csIGtrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWVkQ2VsbHNba2tdW2NvbF0gPSByb3dbY29sXSAvIGN1cnJlbnRDb2xUb3RhbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZWRDZWxsc1tra11bY29sXSAqPSBjb2xUb3RhbHNbY29sXTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHNlZWRDZWxscztcbiAgICAgICAgfVxuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWVwaS5qcy5tYXAiLCIvKiogRXZlbnRzIGNsYXNzIGluY2x1ZGVzIG1ldGhvZHMgZm9yIG9yZ2FuaXppbmcgZXZlbnRzLlxuKlxuKi9cbmV4cG9ydCBjbGFzcyBFdmVudHMge1xuICAgIGNvbnN0cnVjdG9yKGV2ZW50cyA9IFtdKSB7XG4gICAgICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICAgICAgdGhpcy5zY2hlZHVsZShldmVudHMpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIHNjaGVkdWxlIGFuIGV2ZW50IHdpdGggdGhlIHNhbWUgdHJpZ2dlciBtdWx0aXBsZSB0aW1lcy5cbiAgICAqIEBwYXJhbSBxZXZlbnQgaXMgdGhlIGV2ZW50IHRvIGJlIHNjaGVkdWxlZC4gVGhlIGF0IHBhcmFtZXRlciBzaG91bGQgY29udGFpbiB0aGUgdGltZSBhdCBmaXJzdCBpbnN0YW5jZS5cbiAgICAqIEBwYXJhbSBldmVyeSBpbnRlcnZhbCBmb3IgZWFjaCBvY2N1cm5jZVxuICAgICogQHBhcmFtIGVuZCB1bnRpbFxuICAgICovXG4gICAgc2NoZWR1bGVSZWN1cnJpbmcocWV2ZW50LCBldmVyeSwgZW5kKSB7XG4gICAgICAgIHZhciByZWN1ciA9IFtdO1xuICAgICAgICB2YXIgZHVyYXRpb24gPSBlbmQgLSBxZXZlbnQuYXQ7XG4gICAgICAgIHZhciBvY2N1cmVuY2VzID0gTWF0aC5mbG9vcihkdXJhdGlvbiAvIGV2ZXJ5KTtcbiAgICAgICAgaWYgKCFxZXZlbnQudW50aWwpIHtcbiAgICAgICAgICAgIHFldmVudC51bnRpbCA9IHFldmVudC5hdDtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBvY2N1cmVuY2VzOyBpKyspIHtcbiAgICAgICAgICAgIHJlY3VyLnB1c2goeyBuYW1lOiBxZXZlbnQubmFtZSArIGksIGF0OiBxZXZlbnQuYXQgKyAoaSAqIGV2ZXJ5KSwgdW50aWw6IHFldmVudC51bnRpbCArIChpICogZXZlcnkpLCB0cmlnZ2VyOiBxZXZlbnQudHJpZ2dlciwgdHJpZ2dlcmVkOiBmYWxzZSB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNjaGVkdWxlKHJlY3VyKTtcbiAgICB9XG4gICAgLypcbiAgICAqIHNjaGVkdWxlIGEgb25lIHRpbWUgZXZlbnRzLiB0aGlzIGFycmFuZ2VzIHRoZSBldmVudCBxdWV1ZSBpbiBjaHJvbm9sb2dpY2FsIG9yZGVyLlxuICAgICogQHBhcmFtIHFldmVudHMgYW4gYXJyYXkgb2YgZXZlbnRzIHRvIGJlIHNjaGVkdWxlcy5cbiAgICAqL1xuICAgIHNjaGVkdWxlKHFldmVudHMpIHtcbiAgICAgICAgcWV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICBkLnVudGlsID0gZC51bnRpbCB8fCBkLmF0O1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5xdWV1ZSA9IHRoaXMucXVldWUuY29uY2F0KHFldmVudHMpO1xuICAgICAgICB0aGlzLnF1ZXVlID0gdGhpcy5vcmdhbml6ZSh0aGlzLnF1ZXVlLCAwLCB0aGlzLnF1ZXVlLmxlbmd0aCk7XG4gICAgfVxuICAgIHBhcnRpdGlvbihhcnJheSwgbGVmdCwgcmlnaHQpIHtcbiAgICAgICAgdmFyIGNtcCA9IGFycmF5W3JpZ2h0IC0gMV0uYXQsIG1pbkVuZCA9IGxlZnQsIG1heEVuZDtcbiAgICAgICAgZm9yIChtYXhFbmQgPSBsZWZ0OyBtYXhFbmQgPCByaWdodCAtIDE7IG1heEVuZCArPSAxKSB7XG4gICAgICAgICAgICBpZiAoYXJyYXlbbWF4RW5kXS5hdCA8PSBjbXApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN3YXAoYXJyYXksIG1heEVuZCwgbWluRW5kKTtcbiAgICAgICAgICAgICAgICBtaW5FbmQgKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnN3YXAoYXJyYXksIG1pbkVuZCwgcmlnaHQgLSAxKTtcbiAgICAgICAgcmV0dXJuIG1pbkVuZDtcbiAgICB9XG4gICAgc3dhcChhcnJheSwgaSwgaikge1xuICAgICAgICB2YXIgdGVtcCA9IGFycmF5W2ldO1xuICAgICAgICBhcnJheVtpXSA9IGFycmF5W2pdO1xuICAgICAgICBhcnJheVtqXSA9IHRlbXA7XG4gICAgICAgIHJldHVybiBhcnJheTtcbiAgICB9XG4gICAgb3JnYW5pemUoZXZlbnRzLCBsZWZ0LCByaWdodCkge1xuICAgICAgICBpZiAobGVmdCA8IHJpZ2h0KSB7XG4gICAgICAgICAgICB2YXIgcCA9IHRoaXMucGFydGl0aW9uKGV2ZW50cywgbGVmdCwgcmlnaHQpO1xuICAgICAgICAgICAgdGhpcy5vcmdhbml6ZShldmVudHMsIGxlZnQsIHApO1xuICAgICAgICAgICAgdGhpcy5vcmdhbml6ZShldmVudHMsIHAgKyAxLCByaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV2ZW50cztcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1ldmVudHMuanMubWFwIiwiaW1wb3J0IHsgUUNvbXBvbmVudCB9IGZyb20gJy4vUUNvbXBvbmVudCc7XG5leHBvcnQgY2xhc3MgU3RhdGVNYWNoaW5lIGV4dGVuZHMgUUNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IobmFtZSwgc3RhdGVzLCB0cmFuc2l0aW9ucywgY29uZGl0aW9ucywgZGF0YSkge1xuICAgICAgICBzdXBlcihuYW1lKTtcbiAgICAgICAgdGhpcy5zdGF0ZXMgPSBzdGF0ZXM7XG4gICAgICAgIHRoaXMudHJhbnNpdGlvbnMgPSB0aGlzLmNoZWNrVHJhbnNpdGlvbnModHJhbnNpdGlvbnMpO1xuICAgICAgICB0aGlzLmNvbmRpdGlvbnMgPSBjb25kaXRpb25zO1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgIH1cbiAgICB1cGRhdGUoYWdlbnQsIHN0ZXApIHtcbiAgICAgICAgZm9yICh2YXIgcyBpbiBhZ2VudC5zdGF0ZXMpIHtcbiAgICAgICAgICAgIGxldCBzdGF0ZSA9IGFnZW50LnN0YXRlc1tzXTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGVzW3N0YXRlXShhZ2VudCwgc3RlcCk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudHJhbnNpdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMudHJhbnNpdGlvbnNbaV0uZnJvbS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdHJhbnMgPSB0aGlzLnRyYW5zaXRpb25zW2ldLmZyb21bal07XG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmFucyA9PT0gc3RhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB2YWx1ZSwgcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjb25kID0gdGhpcy5jb25kaXRpb25zW3RoaXMudHJhbnNpdGlvbnNbaV0ubmFtZV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIChjb25kLnZhbHVlKSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gY29uZC52YWx1ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBjb25kLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgciA9IGNvbmQuY2hlY2soYWdlbnRbY29uZC5rZXldLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAociA9PT0gU3RhdGVNYWNoaW5lLlNVQ0NFU1MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZ2VudC5zdGF0ZXNbc10gPSB0aGlzLnRyYW5zaXRpb25zW2ldLnRvO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFnZW50W3RoaXMudHJhbnNpdGlvbnNbaV0udG9dID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZ2VudFt0aGlzLnRyYW5zaXRpb25zW2ldLmZyb21dID0gZmFsc2U7IC8vZm9yIGVhc2llciByZXBvcnRpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjaGVja1RyYW5zaXRpb25zKHRyYW5zaXRpb25zKSB7XG4gICAgICAgIGZvciAodmFyIHQgPSAwOyB0IDwgdHJhbnNpdGlvbnMubGVuZ3RoOyB0KyspIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdHJhbnNpdGlvbnNbdF0uZnJvbSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uc1t0XS5mcm9tID0gW3RyYW5zaXRpb25zW3RdLmZyb21dO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy87XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRyYW5zaXRpb25zO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXN0YXRlTWFjaGluZS5qcy5tYXAiLCJpbXBvcnQgeyBnZW5lcmF0ZVVVSUQgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IFBhdGNoLCBDb21wYXJ0bWVudE1vZGVsIH0gZnJvbSAnLi9jb21wYXJ0bWVudCc7XG5pbXBvcnQgeyBFbnZpcm9ubWVudCB9IGZyb20gJy4vZW52aXJvbm1lbnQnO1xuaW1wb3J0IHsgU3RhdGVNYWNoaW5lIH0gZnJvbSAnLi9zdGF0ZU1hY2hpbmUnO1xuaW1wb3J0IHsgZ2VuZXJhdGVQb3AgfSBmcm9tICcuL3V0aWxzJztcbi8qKlxuKkJhdGNoIHJ1biBlbnZpcm9ubWVudHNcbiovXG5leHBvcnQgY2xhc3MgRXhwZXJpbWVudCB7XG4gICAgY29uc3RydWN0b3IoZW52aXJvbm1lbnQsIHNldHVwLCB0YXJnZXQpIHtcbiAgICAgICAgdGhpcy5lbnZpcm9ubWVudCA9IGVudmlyb25tZW50O1xuICAgICAgICB0aGlzLnNldHVwID0gc2V0dXA7XG4gICAgICAgIHRoaXMucm5nID0gc2V0dXAuZXhwZXJpbWVudC5ybmc7XG4gICAgICAgIHRoaXMuZXhwZXJpbWVudExvZyA9IFtdO1xuICAgIH1cbiAgICBzdGFydChydW5zLCBzdGVwLCB1bnRpbCkge1xuICAgICAgICB2YXIgciA9IDA7XG4gICAgICAgIHdoaWxlIChyIDwgcnVucykge1xuICAgICAgICAgICAgdGhpcy5wcmVwKHIsIHRoaXMuc2V0dXApO1xuICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC50aW1lID0gMDsgLy9cbiAgICAgICAgICAgIHRoaXMuZW52aXJvbm1lbnQucnVuKHN0ZXAsIHVudGlsLCAwKTtcbiAgICAgICAgICAgIHRoaXMuZXhwZXJpbWVudExvZ1tyXSA9IHRoaXMucmVwb3J0KHIsIHRoaXMuc2V0dXApO1xuICAgICAgICAgICAgcisrO1xuICAgICAgICB9XG4gICAgfVxuICAgIHByZXAociwgY2ZnLCBhZ2VudHMsIHZpc3VhbGl6ZSkge1xuICAgICAgICBsZXQgZ3JvdXBzID0ge307XG4gICAgICAgIGxldCBjdXJyZW50QWdlbnRJZCA9IDA7XG4gICAgICAgIHRoaXMuZW52aXJvbm1lbnQgPSBuZXcgRW52aXJvbm1lbnQoKTtcbiAgICAgICAgaWYgKHR5cGVvZiBjZmcuYWdlbnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgZm9yIChsZXQgZ3JOYW1lIGluIGNmZy5hZ2VudHMpIHtcbiAgICAgICAgICAgICAgICBsZXQgZ3JvdXAgPSBjZmcuYWdlbnRzW2dyTmFtZV07XG4gICAgICAgICAgICAgICAgZ3JvdXBzW2dyTmFtZV0gPSBnZW5lcmF0ZVBvcChncm91cC5jb3VudCwgZ3JvdXAucGFyYW1zLCBjZmcuZW52aXJvbm1lbnQuc3BhdGlhbFR5cGUsIGdyb3VwLmJvdW5kYXJpZXMsIGN1cnJlbnRBZ2VudElkLCB0aGlzLnJuZyk7XG4gICAgICAgICAgICAgICAgY3VycmVudEFnZW50SWQgPSBncm91cHNbZ3JOYW1lXVtncm91cHNbZ3JOYW1lXS5sZW5ndGggLSAxXS5pZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDtcbiAgICAgICAgfVxuICAgICAgICBjZmcuY29tcG9uZW50cy5mb3JFYWNoKChjbXApID0+IHtcbiAgICAgICAgICAgIHN3aXRjaCAoY21wLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdzdGF0ZS1tYWNoaW5lJzpcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNtID0gbmV3IFN0YXRlTWFjaGluZShjbXAubmFtZSwgY21wLnN0YXRlcywgY21wLnRyYW5zaXRpb25zLCBjbXAuY29uZGl0aW9ucywgZ3JvdXBzW2NtcC5hZ2VudHNdWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC5hZGQoc20pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdjb21wYXJ0bWVudGFsJzpcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGNoZXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgY2ZnLnBhdGNoZXMuZm9yRWFjaCgocGF0Y2gpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjbXAucGF0Y2hlcy5pbmRleE9mKHBhdGNoLm5hbWUpICE9IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0Y2hlcy5wdXNoKG5ldyBQYXRjaChwYXRjaC5uYW1lLCBjbXAuY29tcGFydG1lbnRzLCBwYXRjaC5wb3B1bGF0aW9ucykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNNb2RlbCA9IG5ldyBDb21wYXJ0bWVudE1vZGVsKCdjbXAubmFtZScsIGNtcC5jb21wYXJ0bWVudHMsIHBhdGNoZXMpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVudmlyb25tZW50LmFkZChjTW9kZWwpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdldmVyeS1zdGVwJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC5hZGQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGdlbmVyYXRlVVVJRCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY21wLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGU6IGNtcC5hY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBncm91cHNbY21wLmFnZW50c11bMF1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgc3dpdGNoIChjZmcuZXhwZXJpbWVudCkge1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBpZiAociA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW52aXJvbm1lbnQucm5nID0gdGhpcy5ybmc7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW52aXJvbm1lbnQucnVuKGNmZy5lbnZpcm9ubWVudC5zdGVwLCBjZmcuZW52aXJvbm1lbnQudW50aWwsIDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXBvcnQociwgY2ZnKSB7XG4gICAgICAgIGxldCBzdW1zID0ge307XG4gICAgICAgIGxldCBtZWFucyA9IHt9O1xuICAgICAgICBsZXQgZnJlcXMgPSB7fTtcbiAgICAgICAgbGV0IG1vZGVsID0ge307XG4gICAgICAgIGxldCBjb3VudCA9IHRoaXMuZW52aXJvbm1lbnQuYWdlbnRzLmxlbmd0aDtcbiAgICAgICAgLy9jZmcucmVwb3J0LnN1bSA9IGNmZy5yZXBvcnQuc3VtLmNvbmNhdChjZmcucmVwb3J0Lm1lYW4pO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZW52aXJvbm1lbnQuYWdlbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgZCA9IHRoaXMuZW52aXJvbm1lbnQuYWdlbnRzW2ldO1xuICAgICAgICAgICAgY2ZnLnJlcG9ydC5zdW1zLmZvckVhY2goKHMpID0+IHtcbiAgICAgICAgICAgICAgICBzdW1zW3NdID0gc3Vtc1tzXSA9PSB1bmRlZmluZWQgPyBkW3NdIDogZFtzXSArIHN1bXNbc107XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNmZy5yZXBvcnQuZnJlcXMuZm9yRWFjaCgoZikgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghaXNOYU4oZFtmXSkgJiYgdHlwZW9mIGRbZl0gIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgZnJlcXNbZl0gPSBmcmVxc1tmXSA9PSB1bmRlZmluZWQgPyBkW2ZdIDogZFtmXSArIGZyZXFzW2ZdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCdjb21wYXJ0bWVudHMnIGluIGQpIHtcbiAgICAgICAgICAgICAgICBjZmcucmVwb3J0LmNvbXBhcnRtZW50cy5mb3JFYWNoKChjbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBtb2RlbFtjbV0gPSBtb2RlbFtjbV0gPT0gdW5kZWZpbmVkID8gZC5wb3B1bGF0aW9uc1tjbV0gOiBkLnBvcHVsYXRpb25zW2NtXSArIG1vZGVsW2NtXTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICA7XG4gICAgICAgIGNmZy5yZXBvcnQubWVhbnMuZm9yRWFjaCgobSkgPT4ge1xuICAgICAgICAgICAgbWVhbnNbbV0gPSBzdW1zW21dIC8gY291bnQ7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY291bnQ6IGNvdW50LFxuICAgICAgICAgICAgc3Vtczogc3VtcyxcbiAgICAgICAgICAgIG1lYW5zOiBtZWFucyxcbiAgICAgICAgICAgIGZyZXFzOiBmcmVxcyxcbiAgICAgICAgICAgIG1vZGVsOiBtb2RlbFxuICAgICAgICB9O1xuICAgIH1cbiAgICAvL29uIGVhY2ggcnVuLCBjaGFuZ2Ugb25lIHBhcmFtLCBob2xkIG90aGVycyBjb25zdGFudFxuICAgIHN3ZWVwKHBhcmFtcywgcnVuc1BlciwgYmFzZWxpbmUgPSB0cnVlKSB7XG4gICAgICAgIHZhciBleHBQbGFuID0gW107XG4gICAgICAgIGlmIChiYXNlbGluZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgcGFyYW1zLmJhc2VsaW5lID0gW3RydWVdO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIHByb3AgaW4gcGFyYW1zKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmFtc1twcm9wXS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgcnVuc1BlcjsgaysrKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4cFBsYW4ucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbTogcHJvcCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBwYXJhbXNbcHJvcF1baV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBydW46IGtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMucGxhbnMgPSBleHBQbGFuO1xuICAgIH1cbiAgICBib290KHBhcmFtcykge1xuICAgICAgICBsZXQgcnVucztcbiAgICAgICAgZm9yIChsZXQgcGFyYW0gaW4gcGFyYW1zKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHJ1bnMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgcnVucyA9IHBhcmFtc1twYXJhbV0ubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBhcmFtc1twYXJhbV0ubGVuZ3RoICE9PSBydW5zKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgXCJsZW5ndGggb2YgcGFyYW1ldGVyIGFycmF5cyBkaWQgbm90IG1hdGNoXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wbGFucyA9IHBhcmFtcztcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1leHBlcmltZW50LmpzLm1hcCIsImltcG9ydCB7IG5vcm1hbGl6ZSB9IGZyb20gJy4vdXRpbHMnO1xuZXhwb3J0IGNsYXNzIEdlbmUge1xuICAgIGNvbnN0cnVjdG9yKHJhbmdlLCBkaXNjcmV0ZSwgcm5nKSB7XG4gICAgICAgIGxldCB2YWwgPSBybmcucmFuZFJhbmdlKHJhbmdlWzBdLCByYW5nZVsxXSk7XG4gICAgICAgIGlmICghZGlzY3JldGUpIHtcbiAgICAgICAgICAgIHRoaXMuY29kZSA9IG5vcm1hbGl6ZSh2YWwsIHJhbmdlWzBdLCByYW5nZVsxXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNvZGUgPSBNYXRoLmZsb29yKHZhbCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnQgY2xhc3MgQ2hyb21hc29tZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZ2VuZXMgPSBbXTtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1nZW5ldGljLmpzLm1hcCIsImltcG9ydCB7IEV4cGVyaW1lbnQgfSBmcm9tICcuL2V4cGVyaW1lbnQnO1xuaW1wb3J0IHsgQ2hyb21hc29tZSwgR2VuZSB9IGZyb20gJy4vZ2VuZXRpYyc7XG5pbXBvcnQgeyBpbnZOb3JtIH0gZnJvbSAnLi91dGlscyc7XG5leHBvcnQgY2xhc3MgRXZvbHV0aW9uYXJ5IGV4dGVuZHMgRXhwZXJpbWVudCB7XG4gICAgY29uc3RydWN0b3IoZW52aXJvbm1lbnQsIHNldHVwLCBkaXNjcmV0ZSA9IGZhbHNlLCBncmFkaWVudCA9IHRydWUsIG1hdGluZyA9IHRydWUpIHtcbiAgICAgICAgc3VwZXIoZW52aXJvbm1lbnQsIHNldHVwKTtcbiAgICAgICAgdGhpcy50YXJnZXQgPSBzZXR1cC5ldm9sdXRpb24udGFyZ2V0O1xuICAgICAgICB0aGlzLnJhbmdlcyA9IHNldHVwLmV2b2x1dGlvbi5wYXJhbXM7XG4gICAgICAgIHRoaXMuc2l6ZSA9IHNldHVwLmV4cGVyaW1lbnQuc2l6ZTtcbiAgICAgICAgdGhpcy5tYXRpbmcgPSBtYXRpbmc7XG4gICAgICAgIGlmICh0aGlzLnNpemUgPCAyKSB7XG4gICAgICAgICAgICB0aGlzLm1hdGluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGlzY3JldGUgPSBkaXNjcmV0ZTtcbiAgICAgICAgdGhpcy5ncmFkaWVudCA9IGdyYWRpZW50O1xuICAgICAgICB0aGlzLnBvcHVsYXRpb24gPSBbXTtcbiAgICAgICAgdGhpcy5tdXRhdGVSYXRlID0gMC4wMztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNpemU7IGkrKykge1xuICAgICAgICAgICAgbGV0IGNocm9tYSA9IG5ldyBDaHJvbWFzb21lKCk7XG4gICAgICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IHRoaXMucmFuZ2VzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICAgICAgY2hyb21hLmdlbmVzLnB1c2gobmV3IEdlbmUodGhpcy5yYW5nZXNba10ucmFuZ2UsIHRoaXMuZGlzY3JldGUsIHRoaXMucm5nKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnBvcHVsYXRpb24ucHVzaChjaHJvbWEpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXJ0KHJ1bnMsIHN0ZXAsIHVudGlsKSB7XG4gICAgICAgIGxldCByID0gMDtcbiAgICAgICAgd2hpbGUgKHIgPCBydW5zKSB7XG4gICAgICAgICAgICB0aGlzLnByZXAociwgdGhpcy5zZXR1cCk7XG4gICAgICAgICAgICB0aGlzLnBvcHVsYXRpb24uc29ydCh0aGlzLmFzY1NvcnQpO1xuICAgICAgICAgICAgdGhpcy5wb3B1bGF0aW9uID0gdGhpcy5wb3B1bGF0aW9uLnNsaWNlKDAsIHRoaXMuc2l6ZSk7XG4gICAgICAgICAgICB0aGlzLmV4cGVyaW1lbnRMb2dbdGhpcy5leHBlcmltZW50TG9nLmxlbmd0aCAtIDFdLmJlc3QgPSB0aGlzLnBvcHVsYXRpb25bMF0uc2NvcmU7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnYmVzdDogJywgdGhpcy5leHBlcmltZW50TG9nW3RoaXMuZXhwZXJpbWVudExvZy5sZW5ndGggLSAxXS5iZXN0KTtcbiAgICAgICAgICAgIHIrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5leHBlcmltZW50TG9nO1xuICAgIH1cbiAgICBnZXRQYXJhbXMoY2hyb21hLCBjZmcpIHtcbiAgICAgICAgbGV0IG91dCA9IHt9O1xuICAgICAgICBmb3IgKGxldCBwbSA9IDA7IHBtIDwgdGhpcy5yYW5nZXMubGVuZ3RoOyBwbSsrKSB7XG4gICAgICAgICAgICBsZXQgY2ZnUG0gPSB0aGlzLnJhbmdlc1twbV07XG4gICAgICAgICAgICBpZiAoY2ZnUG0ubGV2ZWwgPT09ICdhZ2VudHMnIHx8IHR5cGVvZiBjZmdQbS5sZXZlbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBvdXRbY2ZnUG0ubGV2ZWwgKyBcIl9cIiArIGNmZ1BtLm5hbWVdID0gaW52Tm9ybShjaHJvbWEuZ2VuZXNbcG1dLmNvZGUsIGNmZ1BtLnJhbmdlWzBdLCBjZmdQbS5yYW5nZVsxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBvdXRbY2ZnUG0ubGV2ZWwgKyBcIl9cIiArIGNmZ1BtLm5hbWVdID0gaW52Tm9ybShjaHJvbWEuZ2VuZXNbcG1dLmNvZGUsIGNmZ1BtLnJhbmdlWzBdLCBjZmdQbS5yYW5nZVsxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG4gICAgZHNjU29ydChhLCBiKSB7XG4gICAgICAgIGlmIChhLnNjb3JlID4gYi5zY29yZSkge1xuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGEuc2NvcmUgPCBiLnNjb3JlKSB7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgYXNjU29ydChhLCBiKSB7XG4gICAgICAgIGlmIChhLnNjb3JlID4gYi5zY29yZSkge1xuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYS5zY29yZSA8IGIuc2NvcmUpIHtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgcHJlcChyLCBjZmcpIHtcbiAgICAgICAgaWYgKHRoaXMubWF0aW5nKSB7XG4gICAgICAgICAgICBsZXQgdG9wUGVyY2VudCA9IE1hdGgucm91bmQoMC4xICogdGhpcy5zaXplKSArIDI7IC8vdGVuIHBlcmNlbnQgb2Ygb3JpZ2luYWwgc2l6ZSArIDJcbiAgICAgICAgICAgIGxldCBjaGlsZHJlbiA9IHRoaXMubWF0ZSh0b3BQZXJjZW50KTtcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGlvbiA9IHRoaXMucG9wdWxhdGlvbi5jb25jYXQoY2hpbGRyZW4pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgdGhpcy5wb3B1bGF0aW9uLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLm11dGF0ZSh0aGlzLnBvcHVsYXRpb25baV0sIDEpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5wb3B1bGF0aW9uLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBwbSA9IDA7IHBtIDwgdGhpcy5yYW5nZXMubGVuZ3RoOyBwbSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IGNmZ1BtID0gdGhpcy5yYW5nZXNbcG1dO1xuICAgICAgICAgICAgICAgIGxldCBncm91cElkeDtcbiAgICAgICAgICAgICAgICBpZiAoY2ZnUG0ubGV2ZWwgPT09ICdhZ2VudHMnIHx8IHR5cGVvZiBjZmdQbS5sZXZlbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgY2ZnLmFnZW50c1tjZmdQbS5ncm91cF0ucGFyYW1zW2NmZ1BtLm5hbWVdLmFzc2lnbiA9IGludk5vcm0odGhpcy5wb3B1bGF0aW9uW2pdLmdlbmVzW3BtXS5jb2RlLCBjZmdQbS5yYW5nZVswXSwgY2ZnUG0ucmFuZ2VbMV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2ZnW2NmZ1BtLmxldmVsXS5wYXJhbXNbY2ZnUG0uZ3JvdXBdW2NmZ1BtLm5hbWVdID0gaW52Tm9ybSh0aGlzLnBvcHVsYXRpb25bal0uZ2VuZXNbcG1dLmNvZGUsIGNmZ1BtLnJhbmdlWzBdLCBjZmdQbS5yYW5nZVsxXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3VwZXIucHJlcChyLCBjZmcpO1xuICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC50aW1lID0gMDtcbiAgICAgICAgICAgIGxldCBwcmVkaWN0ID0gdGhpcy5yZXBvcnQociwgY2ZnKTtcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGlvbltqXS5zY29yZSA9IHRoaXMuY29zdChwcmVkaWN0LCB0aGlzLnRhcmdldCk7XG4gICAgICAgICAgICB0aGlzLmV4cGVyaW1lbnRMb2cucHVzaChwcmVkaWN0KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb3N0KHByZWRpY3QsIHRhcmdldCkge1xuICAgICAgICBsZXQgZGV2ID0gMDtcbiAgICAgICAgbGV0IGRpbWVuc2lvbnMgPSAwO1xuICAgICAgICBmb3IgKGxldCBrZXkgaW4gdGFyZ2V0Lm1lYW5zKSB7XG4gICAgICAgICAgICBkZXYgKz0gdGFyZ2V0Lm1lYW5zW2tleV0gLSBwcmVkaWN0Lm1lYW5zW2tleV07XG4gICAgICAgICAgICBkaW1lbnNpb25zKys7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQga2V5IGluIHRhcmdldC5mcmVxcykge1xuICAgICAgICAgICAgZGV2ICs9IHRhcmdldC5mcmVxc1trZXldIC0gcHJlZGljdC5mcmVxc1trZXldO1xuICAgICAgICAgICAgZGltZW5zaW9ucysrO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGtleSBpbiB0YXJnZXQubW9kZWwpIHtcbiAgICAgICAgICAgIGRldiArPSB0YXJnZXQubW9kZWxba2V5XSAtIHByZWRpY3QubW9kZWxba2V5XTtcbiAgICAgICAgICAgIGRpbWVuc2lvbnMrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWF0aC5wb3coZGV2LCAyKSAvIGRpbWVuc2lvbnM7XG4gICAgfVxuICAgIHJlcG9ydChyLCBjZmcpIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLnJlcG9ydChyLCBjZmcpO1xuICAgIH1cbiAgICBtYXRlKHBhcmVudHMpIHtcbiAgICAgICAgbGV0IG51bUNoaWxkcmVuID0gMC41ICogdGhpcy5yYW5nZXMubGVuZ3RoICogdGhpcy5yYW5nZXMubGVuZ3RoO1xuICAgICAgICBsZXQgY2hpbGRyZW4gPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1DaGlsZHJlbjsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgY2hpbGQgPSBuZXcgQ2hyb21hc29tZSgpO1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLnJhbmdlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGxldCBnZW5lID0gbmV3IEdlbmUoW3RoaXMucmFuZ2VzW2pdLnJhbmdlWzBdLCB0aGlzLnJhbmdlc1tqXS5yYW5nZVsxXV0sIHRoaXMuZGlzY3JldGUsIHRoaXMucm5nKTtcbiAgICAgICAgICAgICAgICBsZXQgcmFuZCA9IE1hdGguZmxvb3IodGhpcy5ybmcucmFuZG9tKCkgKiBwYXJlbnRzKTtcbiAgICAgICAgICAgICAgICBsZXQgZXhwcmVzc2VkID0gdGhpcy5wb3B1bGF0aW9uW3JhbmRdLmdlbmVzLnNsaWNlKGosIGogKyAxKTtcbiAgICAgICAgICAgICAgICBnZW5lLmNvZGUgPSBleHByZXNzZWRbMF0uY29kZTtcbiAgICAgICAgICAgICAgICBjaGlsZC5nZW5lcy5wdXNoKGdlbmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2hpbGRyZW4ucHVzaChjaGlsZCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNoaWxkcmVuO1xuICAgIH1cbiAgICBtdXRhdGUoY2hyb21hLCBjaGFuY2UpIHtcbiAgICAgICAgbGV0IGJlc3QgPSB0aGlzLnBvcHVsYXRpb25bMF0uZ2VuZXM7XG4gICAgICAgIGlmICh0aGlzLnJuZy5yYW5kb20oKSA+IGNoYW5jZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgY2hyb21hLmdlbmVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBsZXQgZ2VuZSA9IGNocm9tYS5nZW5lc1tqXTtcbiAgICAgICAgICAgIGxldCBkaWZmO1xuICAgICAgICAgICAgaWYgKHRoaXMuZ3JhZGllbnQpIHtcbiAgICAgICAgICAgICAgICBkaWZmID0gYmVzdFtqXS5jb2RlIC0gZ2VuZS5jb2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZGlmZiA9IHRoaXMucm5nLnJhbmRSYW5nZSgtMSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgdXBPckRvd24gPSBkaWZmID4gMCA/IDEgOiAtMTtcbiAgICAgICAgICAgIGlmICghdGhpcy5kaXNjcmV0ZSkge1xuICAgICAgICAgICAgICAgIGlmIChkaWZmID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZ2VuZS5jb2RlICs9IHRoaXMucm5nLm5vcm1hbCgwLCAwLjIpICogdGhpcy5tdXRhdGVSYXRlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZ2VuZS5jb2RlICs9IGRpZmYgKiB0aGlzLm11dGF0ZVJhdGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZ2VuZS5jb2RlICs9IHVwT3JEb3duO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZ2VuZS5jb2RlID0gTWF0aC5taW4oTWF0aC5tYXgoMCwgZ2VuZS5jb2RlKSwgMSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1ldm9sdXRpb25hcnkuanMubWFwIiwiaW1wb3J0IHsgUUNvbXBvbmVudCB9IGZyb20gJy4vUUNvbXBvbmVudCc7XG5pbXBvcnQgeyBTVUNDRVNTIH0gZnJvbSAnLi91dGlscyc7XG5leHBvcnQgY2xhc3MgSHlicmlkQXV0b21hdGEgZXh0ZW5kcyBRQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBkYXRhLCBmbG93U2V0LCBmbG93TWFwLCBqdW1wU2V0LCBqdW1wTWFwKSB7XG4gICAgICAgIHN1cGVyKG5hbWUpO1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgICAgICB0aGlzLmZsb3dTZXQgPSBmbG93U2V0O1xuICAgICAgICB0aGlzLmZsb3dNYXAgPSBmbG93TWFwO1xuICAgICAgICB0aGlzLmp1bXBTZXQgPSBqdW1wU2V0O1xuICAgICAgICB0aGlzLmp1bXBNYXAgPSBqdW1wTWFwO1xuICAgIH1cbiAgICB1cGRhdGUoYWdlbnQsIHN0ZXApIHtcbiAgICAgICAgbGV0IHRlbXAgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGFnZW50KSk7XG4gICAgICAgIGZvciAodmFyIG1vZGUgaW4gdGhpcy5qdW1wU2V0KSB7XG4gICAgICAgICAgICBsZXQgZWRnZSA9IHRoaXMuanVtcFNldFttb2RlXTtcbiAgICAgICAgICAgIGxldCBlZGdlU3RhdGUgPSBlZGdlLmNoZWNrKGFnZW50W2VkZ2Uua2V5XSwgZWRnZS52YWx1ZSk7XG4gICAgICAgICAgICBpZiAoZWRnZVN0YXRlID09PSBTVUNDRVNTICYmIG1vZGUgIT0gYWdlbnQuY3VycmVudE1vZGUpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBhZ2VudFtlZGdlLmtleV0gPSB0aGlzLmp1bXBNYXBbZWRnZS5rZXldW2FnZW50LmN1cnJlbnRNb2RlXVttb2RlXShhZ2VudFtlZGdlLmtleV0pO1xuICAgICAgICAgICAgICAgICAgICBhZ2VudC5jdXJyZW50TW9kZSA9IG1vZGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChFcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9ubyB0cmFuc2l0aW9uIHRoaXMgZGlyZWN0aW9uO1xuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKEVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMuZmxvd01hcCkge1xuICAgICAgICAgICAgICAgIC8vc2Vjb25kIG9yZGVyIGludGVncmF0aW9uXG4gICAgICAgICAgICAgICAgbGV0IHRlbXBEID0gdGhpcy5mbG93TWFwW2tleV1bYWdlbnQuY3VycmVudE1vZGVdKGFnZW50W2tleV0pO1xuICAgICAgICAgICAgICAgIHRlbXBba2V5XSA9IGFnZW50W2tleV0gKyB0ZW1wRDtcbiAgICAgICAgICAgICAgICBhZ2VudFtrZXldICs9IDAuNSAqICh0ZW1wRCArIHRoaXMuZmxvd01hcFtrZXldW2FnZW50LmN1cnJlbnRNb2RlXSh0ZW1wW2tleV0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWhhLmpzLm1hcCIsImltcG9ydCB7IFFDb21wb25lbnQgfSBmcm9tICcuL1FDb21wb25lbnQnO1xuaW1wb3J0IHsgZ2VuZXJhdGVVVUlEIH0gZnJvbSAnLi91dGlscyc7XG4vL0hpZXJhcmNoYWwgVGFzayBOZXR3b3JrXG5leHBvcnQgY2xhc3MgSFROUGxhbm5lciBleHRlbmRzIFFDb21wb25lbnQge1xuICAgIHN0YXRpYyB0aWNrKG5vZGUsIHRhc2ssIGFnZW50KSB7XG4gICAgICAgIGlmIChhZ2VudC5ydW5uaW5nTGlzdCkge1xuICAgICAgICAgICAgYWdlbnQucnVubmluZ0xpc3QucHVzaChub2RlLm5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYWdlbnQucnVubmluZ0xpc3QgPSBbbm9kZS5uYW1lXTtcbiAgICAgICAgICAgIGFnZW50LnN1Y2Nlc3NMaXN0ID0gW107XG4gICAgICAgICAgICBhZ2VudC5iYXJyaWVyTGlzdCA9IFtdO1xuICAgICAgICAgICAgYWdlbnQuYmxhY2tib2FyZCA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzdGF0ZSA9IG5vZGUudmlzaXQoYWdlbnQsIHRhc2spO1xuICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHJvb3QsIHRhc2ssIGRhdGEpIHtcbiAgICAgICAgc3VwZXIobmFtZSk7XG4gICAgICAgIHRoaXMucm9vdCA9IHJvb3Q7XG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgICAgIHRoaXMuc3VtbWFyeSA9IFtdO1xuICAgICAgICB0aGlzLnJlc3VsdHMgPSBbXTtcbiAgICAgICAgdGhpcy50YXNrID0gdGFzaztcbiAgICB9XG4gICAgdXBkYXRlKGFnZW50LCBzdGVwKSB7XG4gICAgICAgIC8vaXRlcmF0ZSBhbiBhZ2VudChkYXRhKSB0aHJvdWdoIHRoZSB0YXNrIG5ldHdvcmtcbiAgICAgICAgYWdlbnQuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgSFROUGxhbm5lci50aWNrKHRoaXMucm9vdCwgdGhpcy50YXNrLCBhZ2VudCk7XG4gICAgICAgIGlmIChhZ2VudC5zdWNjZXNzTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBhZ2VudC5zdWNjZWVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGFnZW50LnN1Y2NlZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBhZ2VudC5hY3RpdmUgPSBmYWxzZTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgSFROUm9vdFRhc2sge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGdvYWxzKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuZ29hbHMgPSBnb2FscztcbiAgICB9XG4gICAgZXZhbHVhdGVHb2FsKGFnZW50KSB7XG4gICAgICAgIHZhciByZXN1bHQsIGc7XG4gICAgICAgIGZvciAodmFyIHAgPSAwOyBwIDwgdGhpcy5nb2Fscy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgZyA9IHRoaXMuZ29hbHNbcF07XG4gICAgICAgICAgICBpZiAoZy5kYXRhKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZy5jaGVjayhnLmRhdGFbZy5rZXldLCBnLnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGcuY2hlY2soYWdlbnRbZy5rZXldLCBnLnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnQgY2xhc3MgSFROTm9kZSB7XG4gICAgY29uc3RydWN0b3IobmFtZSwgcHJlY29uZGl0aW9ucykge1xuICAgICAgICB0aGlzLmlkID0gZ2VuZXJhdGVVVUlEKCk7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMucHJlY29uZGl0aW9ucyA9IHByZWNvbmRpdGlvbnM7XG4gICAgfVxuICAgIGV2YWx1YXRlUHJlQ29uZHMoYWdlbnQpIHtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgaWYgKHRoaXMucHJlY29uZGl0aW9ucyBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICBmb3IgKHZhciBwID0gMDsgcCA8IHRoaXMucHJlY29uZGl0aW9ucy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMucHJlY29uZGl0aW9uc1twXS5jaGVjayhhZ2VudFt0aGlzLnByZWNvbmRpdGlvbnNbcF0ua2V5XSwgdGhpcy5wcmVjb25kaXRpb25zW3BdLnZhbHVlKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ID09PSBIVE5QbGFubmVyLkZBSUxFRCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSFROUGxhbm5lci5GQUlMRUQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBIVE5QbGFubmVyLlNVQ0NFU1M7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEhUTk9wZXJhdG9yIGV4dGVuZHMgSFROTm9kZSB7XG4gICAgY29uc3RydWN0b3IobmFtZSwgcHJlY29uZGl0aW9ucywgZWZmZWN0cykge1xuICAgICAgICBzdXBlcihuYW1lLCBwcmVjb25kaXRpb25zKTtcbiAgICAgICAgdGhpcy50eXBlID0gXCJvcGVyYXRvclwiO1xuICAgICAgICB0aGlzLmVmZmVjdHMgPSBlZmZlY3RzO1xuICAgICAgICB0aGlzLnZpc2l0ID0gZnVuY3Rpb24gKGFnZW50LCB0YXNrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ldmFsdWF0ZVByZUNvbmRzKGFnZW50KSA9PT0gSFROUGxhbm5lci5TVUNDRVNTKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVmZmVjdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lZmZlY3RzW2ldKGFnZW50LmJsYWNrYm9hcmRbMF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGFzay5ldmFsdWF0ZUdvYWwoYWdlbnQuYmxhY2tib2FyZFswXSkgPT09IEhUTlBsYW5uZXIuU1VDQ0VTUykge1xuICAgICAgICAgICAgICAgICAgICBhZ2VudC5zdWNjZXNzTGlzdC51bnNoaWZ0KHRoaXMubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBIVE5QbGFubmVyLlNVQ0NFU1M7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSFROUGxhbm5lci5SVU5OSU5HO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGFnZW50LmJhcnJpZXJMaXN0LnVuc2hpZnQoeyBuYW1lOiB0aGlzLm5hbWUsIGNvbmRpdGlvbnM6IHRoaXMucHJlY29uZGl0aW9ucyB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gSFROUGxhbm5lci5GQUlMRUQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEhUTk1ldGhvZCBleHRlbmRzIEhUTk5vZGUge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHByZWNvbmRpdGlvbnMsIGNoaWxkcmVuKSB7XG4gICAgICAgIHN1cGVyKG5hbWUsIHByZWNvbmRpdGlvbnMpO1xuICAgICAgICB0aGlzLnR5cGUgPSBcIm1ldGhvZFwiO1xuICAgICAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XG4gICAgICAgIHRoaXMudmlzaXQgPSBmdW5jdGlvbiAoYWdlbnQsIHRhc2spIHtcbiAgICAgICAgICAgIHZhciBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShhZ2VudCkpO1xuICAgICAgICAgICAgZGVsZXRlIGNvcHkuYmxhY2tib2FyZDtcbiAgICAgICAgICAgIGFnZW50LmJsYWNrYm9hcmQudW5zaGlmdChjb3B5KTtcbiAgICAgICAgICAgIGlmICh0aGlzLmV2YWx1YXRlUHJlQ29uZHMoYWdlbnQpID09PSBIVE5QbGFubmVyLlNVQ0NFU1MpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gSFROUGxhbm5lci50aWNrKHRoaXMuY2hpbGRyZW5baV0sIHRhc2ssIGFnZW50KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXRlID09PSBIVE5QbGFubmVyLlNVQ0NFU1MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFnZW50LnN1Y2Nlc3NMaXN0LnVuc2hpZnQodGhpcy5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBIVE5QbGFubmVyLlNVQ0NFU1M7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhZ2VudC5iYXJyaWVyTGlzdC51bnNoaWZ0KHsgbmFtZTogdGhpcy5uYW1lLCBjb25kaXRpb25zOiB0aGlzLnByZWNvbmRpdGlvbnMgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gSFROUGxhbm5lci5GQUlMRUQ7XG4gICAgICAgIH07XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aHRuLmpzLm1hcCIsImltcG9ydCB7IFFDb21wb25lbnQgfSBmcm9tICcuL1FDb21wb25lbnQnO1xuZXhwb3J0IGNsYXNzIE1IU2FtcGxlciBleHRlbmRzIFFDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHJuZywgZGF0YSwgdGFyZ2V0LCBzYXZlID0gdHJ1ZSkge1xuICAgICAgICBzdXBlcihuYW1lKTtcbiAgICAgICAgdGhpcy5rZXB0ID0gMDtcbiAgICAgICAgdGhpcy50aW1lID0gMDtcbiAgICAgICAgdGhpcy5ybmcgPSBybmc7XG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgICAgIHRoaXMuY2hhaW4gPSBbXTtcbiAgICAgICAgdGhpcy5zYXZlID0gc2F2ZTtcbiAgICAgICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgfVxuICAgIHVwZGF0ZShhZ2VudCwgc3RlcCkge1xuICAgICAgICBsZXQgbmV3UHJvYiA9IDA7XG4gICAgICAgIGFnZW50LnkgPSBhZ2VudC5wcm9wb3NhbChhZ2VudCwgc3RlcCwgdGhpcy5ybmcpO1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMudGFyZ2V0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhpcy50YXJnZXQuZm9yRWFjaCgoZCkgPT4ge1xuICAgICAgICAgICAgICAgIG5ld1Byb2IgKz0gYWdlbnQubG5Qcm9iRihhZ2VudCwgc3RlcCwgZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG5ld1Byb2IgKj0gMSAvIHRoaXMudGFyZ2V0Lmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG5ld1Byb2IgPSBhZ2VudC5sblByb2JGKGFnZW50LCBzdGVwKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZGlmZiA9IG5ld1Byb2IgLSBhZ2VudC5sblByb2I7XG4gICAgICAgIGxldCB1ID0gdGhpcy5ybmcucmFuZG9tKCk7XG4gICAgICAgIGlmIChNYXRoLmxvZyh1KSA8PSBkaWZmIHx8IGRpZmYgPj0gMCkge1xuICAgICAgICAgICAgYWdlbnQubG5Qcm9iID0gbmV3UHJvYjtcbiAgICAgICAgICAgIGFnZW50LnggPSBhZ2VudC55O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5rZXB0ICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc2F2ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgdGhpcy5jaGFpbi5wdXNoKHsgaWQ6IGFnZW50LmlkLCB0aW1lOiBhZ2VudC50aW1lLCB4OiBhZ2VudC54IH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWMuanMubWFwIiwiZXhwb3J0IGNsYXNzIGtNZWFuIHtcbiAgICBjb25zdHJ1Y3RvcihkYXRhLCBwcm9wcywgaykge1xuICAgICAgICB0aGlzLmNlbnRyb2lkcyA9IFtdO1xuICAgICAgICB0aGlzLmxpbWl0cyA9IHt9O1xuICAgICAgICB0aGlzLml0ZXJhdGlvbnMgPSAwO1xuICAgICAgICAvL2NyZWF0ZSBhIGxpbWl0cyBvYmogZm9yIGVhY2ggcHJvcFxuICAgICAgICBwcm9wcy5mb3JFYWNoKHAgPT4ge1xuICAgICAgICAgICAgdGhpcy5saW1pdHNbcF0gPSB7XG4gICAgICAgICAgICAgICAgbWluOiAxZTE1LFxuICAgICAgICAgICAgICAgIG1heDogLTFlMTVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgICAvL3NldCBsaW1pdHMgZm9yIGVhY2ggcHJvcFxuICAgICAgICBkYXRhLmZvckVhY2goZCA9PiB7XG4gICAgICAgICAgICBwcm9wcy5mb3JFYWNoKHAgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChkW3BdID4gdGhpcy5saW1pdHNbcF0ubWF4KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGltaXRzW3BdLm1heCA9IGRbcF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChkW3BdIDwgdGhpcy5saW1pdHNbcF0ubWluKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGltaXRzW3BdLm1pbiA9IGRbcF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICAvL2NyZWF0ZSBrIHJhbmRvbSBwb2ludHNcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuY2VudHJvaWRzW2ldID0geyBjb3VudDogMCB9O1xuICAgICAgICAgICAgcHJvcHMuZm9yRWFjaChwID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgY2VudHJvaWQgPSBNYXRoLnJhbmRvbSgpICogdGhpcy5saW1pdHNbcF0ubWF4ICsgdGhpcy5saW1pdHNbcF0ubWluO1xuICAgICAgICAgICAgICAgIHRoaXMuY2VudHJvaWRzW2ldW3BdID0gY2VudHJvaWQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgICAgICB0aGlzLnByb3BzID0gcHJvcHM7XG4gICAgfVxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgdGhpcy5fYXNzaWduQ2VudHJvaWQoKTtcbiAgICAgICAgdGhpcy5fbW92ZUNlbnRyb2lkKCk7XG4gICAgfVxuICAgIHJ1bigpIHtcbiAgICAgICAgbGV0IGZpbmlzaGVkID0gZmFsc2U7XG4gICAgICAgIHdoaWxlICghZmluaXNoZWQpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICAgICAgICB0aGlzLmNlbnRyb2lkcy5mb3JFYWNoKGMgPT4ge1xuICAgICAgICAgICAgICAgIGZpbmlzaGVkID0gYy5maW5pc2hlZDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5pdGVyYXRpb25zKys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFt0aGlzLmNlbnRyb2lkcywgdGhpcy5kYXRhXTtcbiAgICB9XG4gICAgX2Fzc2lnbkNlbnRyb2lkKCkge1xuICAgICAgICB0aGlzLmRhdGEuZm9yRWFjaCgoZCwgaikgPT4ge1xuICAgICAgICAgICAgbGV0IGRpc3RhbmNlcyA9IFtdO1xuICAgICAgICAgICAgbGV0IHRvdGFsRGlzdCA9IFtdO1xuICAgICAgICAgICAgbGV0IG1pbkRpc3Q7XG4gICAgICAgICAgICBsZXQgbWluSW5kZXg7XG4gICAgICAgICAgICAvL2ZvcmVhY2ggcG9pbnQsIGdldCB0aGUgcGVyIHByb3AgZGlzdGFuY2UgZnJvbSBlYWNoIGNlbnRyb2lkXG4gICAgICAgICAgICB0aGlzLmNlbnRyb2lkcy5mb3JFYWNoKChjLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgZGlzdGFuY2VzW2ldID0ge307XG4gICAgICAgICAgICAgICAgdG90YWxEaXN0W2ldID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmZvckVhY2gocCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlc1tpXVtwXSA9IE1hdGguc3FydCgoZFtwXSAtIGNbcF0pICogKGRbcF0gLSBjW3BdKSk7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsRGlzdFtpXSArPSBkaXN0YW5jZXNbaV1bcF07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdG90YWxEaXN0W2ldID0gTWF0aC5zcXJ0KHRvdGFsRGlzdFtpXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG1pbkRpc3QgPSBNYXRoLm1pbi5hcHBseShudWxsLCB0b3RhbERpc3QpO1xuICAgICAgICAgICAgbWluSW5kZXggPSB0b3RhbERpc3QuaW5kZXhPZihtaW5EaXN0KTtcbiAgICAgICAgICAgIGQuY2VudHJvaWQgPSBtaW5JbmRleDtcbiAgICAgICAgICAgIGQuZGlzdGFuY2VzID0gZGlzdGFuY2VzO1xuICAgICAgICAgICAgdGhpcy5jZW50cm9pZHNbbWluSW5kZXhdLmNvdW50ICs9IDE7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBfbW92ZUNlbnRyb2lkKCkge1xuICAgICAgICB0aGlzLmNlbnRyb2lkcy5mb3JFYWNoKChjLCBpKSA9PiB7XG4gICAgICAgICAgICBsZXQgZGlzdEZyb21DZW50cm9pZCA9IHt9O1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5mb3JFYWNoKHAgPT4gZGlzdEZyb21DZW50cm9pZFtwXSA9IFtdKTtcbiAgICAgICAgICAgIC8vZ2V0IHRoZSBwZXIgcHJvcCBkaXN0YW5jZXMgZnJvbSB0aGUgY2VudHJvaWQgYW1vbmcgaXRzJyBhc3NpZ25lZCBwb2ludHNcbiAgICAgICAgICAgIHRoaXMuZGF0YS5mb3JFYWNoKGQgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChkLmNlbnRyb2lkID09PSBpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZm9yRWFjaChwID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3RGcm9tQ2VudHJvaWRbcF0ucHVzaChkW3BdKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvL2hhbmRsZSBjZW50cm9pZCB3aXRoIG5vIGFzc2lnbmVkIHBvaW50cyAocmFuZG9tbHkgYXNzaWduIG5ldyk7XG4gICAgICAgICAgICBpZiAoYy5jb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZm9yRWFjaChwID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZGlzdEZyb21DZW50cm9pZFtwXSA9IFtNYXRoLnJhbmRvbSgpICogdGhpcy5saW1pdHNbcF0ubWF4ICsgdGhpcy5saW1pdHNbcF0ubWluXTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vZ2V0IHRoZSBzdW0gYW5kIG1lYW4gcGVyIHByb3BlcnR5IG9mIHRoZSBhc3NpZ25lZCBwb2ludHNcbiAgICAgICAgICAgIHRoaXMucHJvcHMuZm9yRWFjaChwID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgc3VtID0gZGlzdEZyb21DZW50cm9pZFtwXS5yZWR1Y2UoKHByZXYsIG5leHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZXYgKyBuZXh0O1xuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICAgIGxldCBtZWFuID0gc3VtIC8gZGlzdEZyb21DZW50cm9pZFtwXS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhpLCAnXFwncyBhdmVyYWdlIGRpc3Qgd2FzJywgbWVhbiwgJyB0aGUgY3VycmVudCBwb3Mgd2FzICcsIGNbcF0pO1xuICAgICAgICAgICAgICAgIGlmIChjW3BdICE9PSBtZWFuKSB7XG4gICAgICAgICAgICAgICAgICAgIGNbcF0gPSBtZWFuO1xuICAgICAgICAgICAgICAgICAgICBjLmZpbmlzaGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGMuY291bnQgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYy5maW5pc2hlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWttZWFuLmpzLm1hcCIsImV4cG9ydCBjbGFzcyBLTk4ge1xuICAgIHNldE5laWdoYm9ycyhwb2ludCwgZGF0YSwgcGFyYW0sIGNsYXNzaWZpZXIpIHtcbiAgICAgICAgZGF0YS5mb3JFYWNoKChkKSA9PiB7XG4gICAgICAgICAgICBpZiAoZC5pZCAhPT0gcG9pbnQuaWQpIHtcbiAgICAgICAgICAgICAgICBwb2ludC5uZWlnaGJvcnNbZC5pZF0gPSBwb2ludC5uZWlnaGJvcnNbZC5pZF0gfHwge307XG4gICAgICAgICAgICAgICAgcG9pbnQubmVpZ2hib3JzW2QuaWRdW2NsYXNzaWZpZXJdID0gZFtjbGFzc2lmaWVyXTtcbiAgICAgICAgICAgICAgICBwb2ludC5uZWlnaGJvcnNbZC5pZF1bcGFyYW0ucGFyYW1dID0gTWF0aC5hYnMocG9pbnRbcGFyYW0ucGFyYW1dIC0gZFtwYXJhbS5wYXJhbV0pIC8gcGFyYW0ucmFuZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzb3J0KG5laWdoYm9ycywgcGFyYW0pIHtcbiAgICAgICAgdmFyIGxpc3QgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgbmVpZ2ggaW4gbmVpZ2hib3JzKSB7XG4gICAgICAgICAgICBsaXN0LnB1c2gobmVpZ2hib3JzW25laWdoXSk7XG4gICAgICAgIH1cbiAgICAgICAgbGlzdC5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICBpZiAoYVtwYXJhbV0gPj0gYltwYXJhbV0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChiW3BhcmFtXSA+PSBhW3BhcmFtXSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGxpc3Q7XG4gICAgfVxuICAgIHNldERpc3RhbmNlcyhkYXRhLCB0cmFpbmVkLCBrUGFyYW1zT2JqLCBjbGFzc2lmaWVyKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZGF0YVtpXS5uZWlnaGJvcnMgPSB7fTtcbiAgICAgICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwga1BhcmFtc09iai5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZGF0YVtpXVtrUGFyYW1zT2JqW2tdLnBhcmFtXSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXROZWlnaGJvcnMoZGF0YVtpXSwgdHJhaW5lZCwga1BhcmFtc09ialtrXSwgY2xhc3NpZmllcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yICh2YXIgbiBpbiBkYXRhW2ldLm5laWdoYm9ycykge1xuICAgICAgICAgICAgICAgIHZhciBuZWlnaGJvciA9IGRhdGFbaV0ubmVpZ2hib3JzW25dO1xuICAgICAgICAgICAgICAgIHZhciBkaXN0ID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBwID0gMDsgcCA8IGtQYXJhbXNPYmoubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzdCArPSBuZWlnaGJvcltrUGFyYW1zT2JqW3BdLnBhcmFtXSAqIG5laWdoYm9yW2tQYXJhbXNPYmpbcF0ucGFyYW1dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBuZWlnaGJvci5kaXN0YW5jZSA9IE1hdGguc3FydChkaXN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gICAgZ2V0UmFuZ2UoZGF0YSwga1BhcmFtcykge1xuICAgICAgICBsZXQgcmFuZ2VzID0gW10sIG1pbiA9IDFlMjAsIG1heCA9IDA7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwga1BhcmFtcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgZm9yICh2YXIgZCA9IDA7IGQgPCBkYXRhLmxlbmd0aDsgZCsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGFbZF1ba1BhcmFtc1tqXV0gPCBtaW4pIHtcbiAgICAgICAgICAgICAgICAgICAgbWluID0gZGF0YVtkXVtrUGFyYW1zW2pdXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGRhdGFbZF1ba1BhcmFtc1tqXV0gPiBtYXgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gZGF0YVtkXVtrUGFyYW1zW2pdXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByYW5nZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgcGFyYW06IGtQYXJhbXNbal0sXG4gICAgICAgICAgICAgICAgbWluOiBtaW4sXG4gICAgICAgICAgICAgICAgbWF4OiBtYXgsXG4gICAgICAgICAgICAgICAgcmFuZ2U6IG1heCAtIG1pblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgO1xuICAgICAgICByZXR1cm4gcmFuZ2VzO1xuICAgIH1cbiAgICBjbGFzc2lmeShkYXRhLCB0cmFpbmVkRGF0YSwga1BhcmFtcywgY2xhc3NpZmllciwgbmVhcmVzdE4pIHtcbiAgICAgICAgbGV0IGtQYXJhbXNPYmogPSB0aGlzLmdldFJhbmdlKFtdLmNvbmNhdChkYXRhLCB0cmFpbmVkRGF0YSksIGtQYXJhbXMpO1xuICAgICAgICBkYXRhID0gdGhpcy5zZXREaXN0YW5jZXMoZGF0YSwgdHJhaW5lZERhdGEsIGtQYXJhbXNPYmosIGNsYXNzaWZpZXIpO1xuICAgICAgICBsZXQgb3JkZXJlZCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBkID0gMDsgZCA8IGRhdGEubGVuZ3RoOyBkKyspIHtcbiAgICAgICAgICAgIGxldCByZXN1bHRzID0ge307XG4gICAgICAgICAgICBvcmRlcmVkID0gdGhpcy5zb3J0KGRhdGFbZF0ubmVpZ2hib3JzLCAnZGlzdGFuY2UnKTtcbiAgICAgICAgICAgIGxldCBuID0gMDtcbiAgICAgICAgICAgIHdoaWxlIChuIDwgbmVhcmVzdE4pIHtcbiAgICAgICAgICAgICAgICBsZXQgY3VycmVudCA9IG9yZGVyZWRbbl1bY2xhc3NpZmllcl07XG4gICAgICAgICAgICAgICAgcmVzdWx0c1tjdXJyZW50XSA9IHJlc3VsdHNbY3VycmVudF0gfHwgMDtcbiAgICAgICAgICAgICAgICByZXN1bHRzW2N1cnJlbnRdICs9IDE7XG4gICAgICAgICAgICAgICAgbisrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG1heCA9IDAsIGxpa2VsaWVzdCA9ICcnO1xuICAgICAgICAgICAgZm9yIChsZXQgcGFyYW0gaW4gcmVzdWx0cykge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHRzW3BhcmFtXSA+IG1heCkge1xuICAgICAgICAgICAgICAgICAgICBtYXggPSByZXN1bHRzW3BhcmFtXTtcbiAgICAgICAgICAgICAgICAgICAgbGlrZWxpZXN0ID0gcGFyYW07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGF0YVtkXVtjbGFzc2lmaWVyXSA9IGxpa2VsaWVzdDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1rbm4uanMubWFwIiwiZXhwb3J0IGNsYXNzIFZlY3RvciB7XG4gICAgY29uc3RydWN0b3IoYXJyYXksIHNpemUpIHtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgTWF0cml4IHtcbiAgICBjb25zdHJ1Y3RvcihtYXQpIHtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgYWN0aXZhdGlvbk1ldGhvZHMge1xuICAgIHN0YXRpYyBSZUxVKHgpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KHgsIDApO1xuICAgIH1cbiAgICBzdGF0aWMgc2lnbW9pZCh4KSB7XG4gICAgICAgIHJldHVybiAxIC8gKDEgKyBNYXRoLmV4cCgteCkpO1xuICAgIH1cbiAgICBzdGF0aWMgdGFuaCh4KSB7XG4gICAgICAgIGxldCB2YWwgPSAoTWF0aC5leHAoeCkgLSBNYXRoLmV4cCgteCkpIC8gKE1hdGguZXhwKHgpICsgTWF0aC5leHAoLXgpKTtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG59XG47XG5leHBvcnQgY2xhc3MgZGVyaXZpdGVNZXRob2RzIHtcbiAgICBzdGF0aWMgUmVMVSh2YWx1ZSkge1xuICAgICAgICBsZXQgZGVyID0gdmFsdWUgPD0gMCA/IDAgOiAxO1xuICAgICAgICByZXR1cm4gZGVyO1xuICAgIH1cbiAgICBzdGF0aWMgc2lnbW9pZCh2YWx1ZSkge1xuICAgICAgICBsZXQgc2lnID0gYWN0aXZhdGlvbk1ldGhvZHMuc2lnbW9pZDtcbiAgICAgICAgcmV0dXJuIHNpZyh2YWx1ZSkgKiAoMSAtIHNpZyh2YWx1ZSkpO1xuICAgIH1cbiAgICBzdGF0aWMgdGFuaCh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gMSAtIE1hdGgucG93KGFjdGl2YXRpb25NZXRob2RzLnRhbmgodmFsdWUpLCAyKTtcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gbG9naXN0aWMoeCwgbSwgYiwgaykge1xuICAgIHZhciB5ID0gMSAvIChtICsgTWF0aC5leHAoLWsgKiAoeCAtIGIpKSk7XG4gICAgcmV0dXJuIHk7XG59XG5leHBvcnQgZnVuY3Rpb24gbG9naXQoeCwgbSwgYiwgaykge1xuICAgIHZhciB5ID0gMSAvIE1hdGgubG9nKHggLyAoMSAtIHgpKTtcbiAgICByZXR1cm4geTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBsaW5lYXIoeCwgbSwgYiwgaykge1xuICAgIHZhciB5ID0gbSAqIHggKyBiO1xuICAgIHJldHVybiB5O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGV4cG9uZW50aWFsKHgsIG0sIGIsIGspIHtcbiAgICB2YXIgeSA9IDEgLSBNYXRoLnBvdyh4LCBrKSAvIE1hdGgucG93KDEsIGspO1xuICAgIHJldHVybiB5O1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWF0aC5qcy5tYXAiLCJleHBvcnQgY2xhc3MgTmV0d29yayB7XG4gICAgY29uc3RydWN0b3IoZGF0YSwgbGFiZWxzLCBoaWRkZW5OdW0sIGVsLCBhY3RpdmF0aW9uVHlwZSA9IFwidGFuaFwiKSB7XG4gICAgICAgIHRoaXMuZWwgPSBlbDtcbiAgICAgICAgdGhpcy5pdGVyID0gMDtcbiAgICAgICAgdGhpcy5jb3JyZWN0ID0gMDtcbiAgICAgICAgdGhpcy5oaWRkZW5OdW0gPSBoaWRkZW5OdW07XG4gICAgICAgIHRoaXMubGVhcm5SYXRlID0gMC4wMTtcbiAgICAgICAgdGhpcy5hY3RGbiA9IE5ldHdvcmsuYWN0aXZhdGlvbk1ldGhvZHNbYWN0aXZhdGlvblR5cGVdO1xuICAgICAgICB0aGlzLmRlckZuID0gTmV0d29yay5kZXJpdml0ZU1ldGhvZHNbYWN0aXZhdGlvblR5cGVdO1xuICAgICAgICB0aGlzLmluaXQoZGF0YSwgbGFiZWxzKTtcbiAgICB9XG4gICAgbGVhcm4oaXRlcmF0aW9ucywgZGF0YSwgbGFiZWxzLCByZW5kZXIgPSAxMDApIHtcbiAgICAgICAgdGhpcy5jb3JyZWN0ID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVyYXRpb25zOyBpKyspIHtcbiAgICAgICAgICAgIGxldCByYW5kSWR4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogZGF0YS5sZW5ndGgpO1xuICAgICAgICAgICAgdGhpcy5pdGVyKys7XG4gICAgICAgICAgICB0aGlzLmZvcndhcmQoZGF0YVtyYW5kSWR4XSk7XG4gICAgICAgICAgICBsZXQgbWF4ID0gLTE7XG4gICAgICAgICAgICBsZXQgbWF4SWR4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy52YWx1ZXMubGVuZ3RoKTtcbiAgICAgICAgICAgIHRoaXMudmFsdWVzW3RoaXMudmFsdWVzLmxlbmd0aCAtIDFdLmZvckVhY2goKHgsIGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh4ID4gbWF4KSB7XG4gICAgICAgICAgICAgICAgICAgIG1heElkeCA9IGlkeDtcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0geDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxldCBndWVzc2VkID0gdGhpcy52YWx1ZXNbdGhpcy52YWx1ZXMubGVuZ3RoIC0gMV1bbWF4SWR4XSA+PSAwLjUgPyAxIDogMDtcbiAgICAgICAgICAgIGlmIChndWVzc2VkID09PSBsYWJlbHNbcmFuZElkeF1bbWF4SWR4XSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29ycmVjdCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5hY2N1cmFjeSA9IHRoaXMuY29ycmVjdCAvIChpICsgMSk7XG4gICAgICAgICAgICB0aGlzLmJhY2t3YXJkKGxhYmVsc1tyYW5kSWR4XSk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVdlaWdodHMoKTtcbiAgICAgICAgICAgIHRoaXMucmVzZXRUb3RhbHMoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjbGFzc2lmeShkYXRhKSB7XG4gICAgICAgIHRoaXMucmVzZXRUb3RhbHMoKTtcbiAgICAgICAgdGhpcy5mb3J3YXJkKGRhdGEpO1xuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZXNbdGhpcy52YWx1ZXMubGVuZ3RoIC0gMV07XG4gICAgfVxuICAgIGluaXQoZGF0YSwgbGFiZWxzKSB7XG4gICAgICAgIGxldCBpbnB1dHMgPSBbXTtcbiAgICAgICAgdGhpcy5kZXIgPSBbXTtcbiAgICAgICAgdGhpcy52YWx1ZXMgPSBbXTtcbiAgICAgICAgdGhpcy53ZWlnaHRzID0gW107XG4gICAgICAgIHRoaXMud2VpZ2h0Q2hhbmdlcyA9IFtdO1xuICAgICAgICB0aGlzLnRvdGFscyA9IFtdO1xuICAgICAgICB0aGlzLmRlclRvdGFscyA9IFtdO1xuICAgICAgICB0aGlzLmJpYXNlcyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBuID0gMDsgbiA8IGRhdGFbMF0ubGVuZ3RoOyBuKyspIHtcbiAgICAgICAgICAgIGlucHV0cy5wdXNoKDApO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IHRoaXMuaGlkZGVuTnVtLmxlbmd0aDsgY29sKyspIHtcbiAgICAgICAgICAgIHRoaXMuZGVyW2NvbF0gPSBbXTtcbiAgICAgICAgICAgIHRoaXMudmFsdWVzW2NvbF0gPSBbXTtcbiAgICAgICAgICAgIHRoaXMudG90YWxzW2NvbF0gPSBbXTtcbiAgICAgICAgICAgIHRoaXMuZGVyVG90YWxzW2NvbF0gPSBbXTtcbiAgICAgICAgICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IHRoaXMuaGlkZGVuTnVtW2NvbF07IHJvdysrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZXNbY29sXVtyb3ddID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLmRlcltjb2xdW3Jvd10gPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMudG90YWxzW2NvbF1bcm93XSA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5kZXJUb3RhbHNbY29sXVtyb3ddID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZhbHVlcy51bnNoaWZ0KGlucHV0cyk7XG4gICAgICAgIHRoaXMudG90YWxzLnVuc2hpZnQoaW5wdXRzKTtcbiAgICAgICAgdGhpcy5kZXIudW5zaGlmdChpbnB1dHMpO1xuICAgICAgICB0aGlzLmRlclRvdGFscy51bnNoaWZ0KGlucHV0cyk7XG4gICAgICAgIHRoaXMudmFsdWVzW3RoaXMuaGlkZGVuTnVtLmxlbmd0aCArIDFdID0gbGFiZWxzWzBdLm1hcCgobCkgPT4geyByZXR1cm4gMDsgfSk7XG4gICAgICAgIHRoaXMudG90YWxzW3RoaXMuaGlkZGVuTnVtLmxlbmd0aCArIDFdID0gbGFiZWxzWzBdLm1hcCgobCkgPT4geyByZXR1cm4gMDsgfSk7XG4gICAgICAgIHRoaXMuZGVyW3RoaXMuaGlkZGVuTnVtLmxlbmd0aCArIDFdID0gbGFiZWxzWzBdLm1hcCgobCkgPT4geyByZXR1cm4gMDsgfSk7XG4gICAgICAgIHRoaXMuZGVyVG90YWxzW3RoaXMuaGlkZGVuTnVtLmxlbmd0aCArIDFdID0gbGFiZWxzWzBdLm1hcCgobCkgPT4geyByZXR1cm4gMDsgfSk7XG4gICAgICAgIGZvciAobGV0IHdnID0gMDsgd2cgPCB0aGlzLnZhbHVlcy5sZW5ndGggLSAxOyB3ZysrKSB7XG4gICAgICAgICAgICB0aGlzLndlaWdodHNbd2ddID0gW107XG4gICAgICAgICAgICB0aGlzLndlaWdodENoYW5nZXNbd2ddID0gW107XG4gICAgICAgICAgICB0aGlzLmJpYXNlc1t3Z10gPSBbXTtcbiAgICAgICAgICAgIGZvciAobGV0IHNyYyA9IDA7IHNyYyA8IHRoaXMudmFsdWVzW3dnXS5sZW5ndGg7IHNyYysrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy53ZWlnaHRzW3dnXVtzcmNdID0gW107XG4gICAgICAgICAgICAgICAgdGhpcy53ZWlnaHRDaGFuZ2VzW3dnXVtzcmNdID0gW107XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZHN0ID0gMDsgZHN0IDwgdGhpcy52YWx1ZXNbd2cgKyAxXS5sZW5ndGg7IGRzdCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYmlhc2VzW3dnXVtkc3RdID0gTWF0aC5yYW5kb20oKSAtIDAuNTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53ZWlnaHRzW3dnXVtzcmNdW2RzdF0gPSBNYXRoLnJhbmRvbSgpIC0gMC41O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLndlaWdodENoYW5nZXNbd2ddW3NyY11bZHN0XSA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJlc2V0VG90YWxzKCkge1xuICAgICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCB0aGlzLnRvdGFscy5sZW5ndGg7IGNvbCsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCB0aGlzLnRvdGFsc1tjb2xdLmxlbmd0aDsgcm93KyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRvdGFsc1tjb2xdW3Jvd10gPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMuZGVyVG90YWxzW2NvbF1bcm93XSA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yd2FyZChpbnB1dCkge1xuICAgICAgICB0aGlzLnZhbHVlc1swXSA9IGlucHV0O1xuICAgICAgICBmb3IgKGxldCB3ZyA9IDA7IHdnIDwgdGhpcy53ZWlnaHRzLmxlbmd0aDsgd2crKykge1xuICAgICAgICAgICAgbGV0IHNyY1ZhbHMgPSB3ZztcbiAgICAgICAgICAgIGxldCBkc3RWYWxzID0gd2cgKyAxO1xuICAgICAgICAgICAgZm9yIChsZXQgc3JjID0gMDsgc3JjIDwgdGhpcy53ZWlnaHRzW3dnXS5sZW5ndGg7IHNyYysrKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZHN0ID0gMDsgZHN0IDwgdGhpcy53ZWlnaHRzW3dnXVtzcmNdLmxlbmd0aDsgZHN0KyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b3RhbHNbZHN0VmFsc11bZHN0XSArPSB0aGlzLnZhbHVlc1tzcmNWYWxzXVtzcmNdICogdGhpcy53ZWlnaHRzW3dnXVtzcmNdW2RzdF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy52YWx1ZXNbZHN0VmFsc10gPSB0aGlzLnRvdGFsc1tkc3RWYWxzXS5tYXAoKHRvdGFsLCBpZHgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hY3RGbih0b3RhbCArIHRoaXMuYmlhc2VzW3dnXVtpZHhdKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGJhY2t3YXJkKGxhYmVscykge1xuICAgICAgICBmb3IgKGxldCB3ZyA9IHRoaXMud2VpZ2h0cy5sZW5ndGggLSAxOyB3ZyA+PSAwOyB3Zy0tKSB7XG4gICAgICAgICAgICBsZXQgc3JjVmFscyA9IHdnO1xuICAgICAgICAgICAgbGV0IGRzdFZhbHMgPSB3ZyArIDE7XG4gICAgICAgICAgICBmb3IgKGxldCBzcmMgPSAwOyBzcmMgPCB0aGlzLndlaWdodHNbd2ddLmxlbmd0aDsgc3JjKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgZXJyID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBkc3QgPSAwOyBkc3QgPCB0aGlzLndlaWdodHNbd2ddW3NyY10ubGVuZ3RoOyBkc3QrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAod2cgPT09IHRoaXMud2VpZ2h0cy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnIgKz0gbGFiZWxzW2RzdF0gLSB0aGlzLnZhbHVlc1tkc3RWYWxzXVtkc3RdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXJbZHN0VmFsc11bZHN0XSA9IGVycjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVyciArPSB0aGlzLmRlcltkc3RWYWxzXVtkc3RdICogdGhpcy53ZWlnaHRzW3dnXVtzcmNdW2RzdF07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5kZXJUb3RhbHNbc3JjVmFsc11bc3JjXSA9IGVycjtcbiAgICAgICAgICAgICAgICB0aGlzLmRlcltzcmNWYWxzXVtzcmNdID0gZXJyICogdGhpcy5kZXJGbih0aGlzLnZhbHVlc1tzcmNWYWxzXVtzcmNdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICB1cGRhdGVXZWlnaHRzKCkge1xuICAgICAgICBmb3IgKGxldCB3ZyA9IDA7IHdnIDwgdGhpcy53ZWlnaHRzLmxlbmd0aDsgd2crKykge1xuICAgICAgICAgICAgbGV0IHNyY1ZhbHMgPSB3ZztcbiAgICAgICAgICAgIGxldCBkc3RWYWxzID0gd2cgKyAxO1xuICAgICAgICAgICAgZm9yIChsZXQgc3JjID0gMDsgc3JjIDwgdGhpcy53ZWlnaHRzW3dnXS5sZW5ndGg7IHNyYysrKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZHN0ID0gMDsgZHN0IDwgdGhpcy53ZWlnaHRzW3dnXVtzcmNdLmxlbmd0aDsgZHN0KyspIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1vbWVudHVtID0gdGhpcy53ZWlnaHRDaGFuZ2VzW3dnXVtzcmNdW2RzdF0gKiAwLjE7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2VpZ2h0Q2hhbmdlc1t3Z11bc3JjXVtkc3RdID0gKHRoaXMudmFsdWVzW3NyY1ZhbHNdW3NyY10gKiB0aGlzLmRlcltkc3RWYWxzXVtkc3RdICogdGhpcy5sZWFyblJhdGUpICsgbW9tZW50dW07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2VpZ2h0c1t3Z11bc3JjXVtkc3RdICs9IHRoaXMud2VpZ2h0Q2hhbmdlc1t3Z11bc3JjXVtkc3RdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYmlhc2VzW3dnXSA9IHRoaXMuYmlhc2VzW3dnXS5tYXAoKGJpYXMsIGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxlYXJuUmF0ZSAqIHRoaXMuZGVyW2RzdFZhbHNdW2lkeF0gKyBiaWFzO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgbXNlKCkge1xuICAgICAgICBsZXQgZXJyID0gMDtcbiAgICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLmRlclRvdGFscy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgZXJyICs9IHRoaXMuZGVyVG90YWxzW2pdLnJlZHVjZSgobGFzdCwgY3VycmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxhc3QgKyBNYXRoLnBvdyhjdXJyZW50LCAyKTtcbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlcnIgLyBjb3VudDtcbiAgICB9XG59XG5OZXR3b3JrLmFjdGl2YXRpb25NZXRob2RzID0ge1xuICAgIFJlTFU6IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIHJldHVybiBNYXRoLm1heCh4LCAwKTtcbiAgICB9LFxuICAgIHNpZ21vaWQ6IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIHJldHVybiAxIC8gKDEgKyBNYXRoLmV4cCgteCkpO1xuICAgIH0sXG4gICAgdGFuaDogZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgbGV0IHZhbCA9IChNYXRoLmV4cCh4KSAtIE1hdGguZXhwKC14KSkgLyAoTWF0aC5leHAoeCkgKyBNYXRoLmV4cCgteCkpO1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH1cbn07XG5OZXR3b3JrLmRlcml2aXRlTWV0aG9kcyA9IHtcbiAgICBSZUxVOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgbGV0IGRlciA9IHZhbHVlIDw9IDAgPyAwIDogMTtcbiAgICAgICAgcmV0dXJuIGRlcjtcbiAgICB9LFxuICAgIHNpZ21vaWQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBsZXQgc2lnID0gTmV0d29yay5hY3RpdmF0aW9uTWV0aG9kcy5zaWdtb2lkO1xuICAgICAgICByZXR1cm4gc2lnKHZhbHVlKSAqICgxIC0gc2lnKHZhbHVlKSk7XG4gICAgfSxcbiAgICB0YW5oOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIDEgLSBNYXRoLnBvdyhOZXR3b3JrLmFjdGl2YXRpb25NZXRob2RzLnRhbmgodmFsdWUpLCAyKTtcbiAgICB9XG59O1xuTmV0d29yay5jb3N0TWV0aG9kcyA9IHtcbiAgICBzcUVycjogZnVuY3Rpb24gKHRhcmdldCwgZ3Vlc3MpIHtcbiAgICAgICAgcmV0dXJuIGd1ZXNzIC0gdGFyZ2V0O1xuICAgIH0sXG4gICAgYWJzRXJyOiBmdW5jdGlvbiAoKSB7XG4gICAgfVxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW5ldHdvcmsuanMubWFwIiwiZXhwb3J0IGNsYXNzIFFMZWFybmVyIHtcbiAgICAvL1RPRE8gLSBjaGFuZ2UgZXBpc29kZSB0byB1cGRhdGVcbiAgICBjb25zdHJ1Y3RvcihSLCBnYW1tYSwgZ29hbCkge1xuICAgICAgICB0aGlzLnJhd01heCA9IDE7XG4gICAgICAgIHRoaXMuUiA9IFI7XG4gICAgICAgIHRoaXMuZ2FtbWEgPSBnYW1tYTtcbiAgICAgICAgdGhpcy5nb2FsID0gZ29hbDtcbiAgICAgICAgdGhpcy5RID0ge307XG4gICAgICAgIGZvciAodmFyIHN0YXRlIGluIFIpIHtcbiAgICAgICAgICAgIHRoaXMuUVtzdGF0ZV0gPSB7fTtcbiAgICAgICAgICAgIGZvciAodmFyIGFjdGlvbiBpbiBSW3N0YXRlXSkge1xuICAgICAgICAgICAgICAgIHRoaXMuUVtzdGF0ZV1bYWN0aW9uXSA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nYW1tYSA9IGdhbW1hO1xuICAgIH1cbiAgICBncm93KHN0YXRlLCBhY3Rpb25zKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWN0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgLy9yZXdhcmQgaXMgY3VycmVudGx5IHVua25vd25cbiAgICAgICAgICAgIHRoaXMuUltzdGF0ZV1bYWN0aW9uc1tpXV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIGV4cGxvcmUocHJvbSkge1xuICAgIH1cbiAgICB0cmFuc2l0aW9uKHN0YXRlLCBhY3Rpb24pIHtcbiAgICAgICAgLy9pcyB0aGUgc3RhdGUgdW5leGFtaW5lZFxuICAgICAgICBsZXQgZXhhbWluZWQgPSB0cnVlO1xuICAgICAgICBsZXQgYmVzdEFjdGlvbjtcbiAgICAgICAgZm9yIChhY3Rpb24gaW4gdGhpcy5SW3N0YXRlXSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuUltzdGF0ZV1bYWN0aW9uXSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGJlc3RBY3Rpb24gPSBhY3Rpb247XG4gICAgICAgICAgICAgICAgZXhhbWluZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBiZXN0QWN0aW9uID0gdGhpcy5tYXgoYWN0aW9uKTtcbiAgICAgICAgdGhpcy5RW3N0YXRlXVthY3Rpb25dID0gdGhpcy5SW3N0YXRlXVthY3Rpb25dICsgKHRoaXMuZ2FtbWEgKiB0aGlzLlFbYWN0aW9uXVtiZXN0QWN0aW9uXSk7XG4gICAgfVxuICAgIG1heChzdGF0ZSkge1xuICAgICAgICB2YXIgbWF4ID0gMCwgbWF4QWN0aW9uID0gbnVsbDtcbiAgICAgICAgZm9yICh2YXIgYWN0aW9uIGluIHRoaXMuUVtzdGF0ZV0pIHtcbiAgICAgICAgICAgIGlmICghbWF4QWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgbWF4ID0gdGhpcy5RW3N0YXRlXVthY3Rpb25dO1xuICAgICAgICAgICAgICAgIG1heEFjdGlvbiA9IGFjdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuUVtzdGF0ZV1bYWN0aW9uXSA9PT0gbWF4ICYmIChNYXRoLnJhbmRvbSgpID4gMC41KSkge1xuICAgICAgICAgICAgICAgIG1heCA9IHRoaXMuUVtzdGF0ZV1bYWN0aW9uXTtcbiAgICAgICAgICAgICAgICBtYXhBY3Rpb24gPSBhY3Rpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLlFbc3RhdGVdW2FjdGlvbl0gPiBtYXgpIHtcbiAgICAgICAgICAgICAgICBtYXggPSB0aGlzLlFbc3RhdGVdW2FjdGlvbl07XG4gICAgICAgICAgICAgICAgbWF4QWN0aW9uID0gYWN0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXhBY3Rpb247XG4gICAgfVxuICAgIHBvc3NpYmxlKHN0YXRlKSB7XG4gICAgICAgIHZhciBwb3NzaWJsZSA9IFtdO1xuICAgICAgICBmb3IgKHZhciBhY3Rpb24gaW4gdGhpcy5SW3N0YXRlXSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuUltzdGF0ZV1bYWN0aW9uXSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgcG9zc2libGUucHVzaChhY3Rpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwb3NzaWJsZVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwb3NzaWJsZS5sZW5ndGgpXTtcbiAgICB9XG4gICAgZXBpc29kZShzdGF0ZSkge1xuICAgICAgICB0aGlzLnRyYW5zaXRpb24oc3RhdGUsIHRoaXMucG9zc2libGUoc3RhdGUpKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuUTtcbiAgICB9XG4gICAgbm9ybWFsaXplKCkge1xuICAgICAgICBmb3IgKHZhciBzdGF0ZSBpbiB0aGlzLlEpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGFjdGlvbiBpbiB0aGlzLlFbc3RhdGVdKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuUVthY3Rpb25dW3N0YXRlXSA+PSB0aGlzLnJhd01heCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJhd01heCA9IHRoaXMuUVthY3Rpb25dW3N0YXRlXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgc3RhdGUgaW4gdGhpcy5RKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBhY3Rpb24gaW4gdGhpcy5RW3N0YXRlXSkge1xuICAgICAgICAgICAgICAgIHRoaXMuUVthY3Rpb25dW3N0YXRlXSA9IE1hdGgucm91bmQodGhpcy5RW2FjdGlvbl1bc3RhdGVdIC8gdGhpcy5yYXdNYXggKiAxMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9UUxlYXJuZXIuanMubWFwIiwiaW1wb3J0IHsgc3RhbmRhcmRpemVkLCBkYXRhVG9NYXRyaXggfSBmcm9tICcuL3V0aWxzJztcbmV4cG9ydCBmdW5jdGlvbiBvbHMoaXZzLCBkdikge1xuICAgIGxldCBkYXRhID0gZGF0YVRvTWF0cml4KGl2cywgdGhpcy5zdGFuZGFyZGl6ZWQpO1xuICAgIGxldCBkdkRhdGEgPSBkdi5kYXRhO1xuICAgIGxldCBuID0gZHZEYXRhLmxlbmd0aDtcbiAgICBsZXQgbWVhbnMgPSBpdnMubWFwKChhKSA9PiB7IHJldHVybiBhLm1lYW47IH0pO1xuICAgIGxldCBzZHMgPSBpdnMubWFwKChhKSA9PiB7IHJldHVybiBhLnNkOyB9KTtcbiAgICBsZXQgdmFycyA9IGl2cy5tYXAoKGEpID0+IHsgcmV0dXJuIFthLnZhcmlhbmNlXTsgfSk7XG4gICAgbWVhbnMudW5zaGlmdCgxKTtcbiAgICBzZHMudW5zaGlmdCgxKTtcbiAgICB2YXJzLnVuc2hpZnQoWzFdKTtcbiAgICBpZiAodGhpcy5zdGFuZGFyZGl6ZWQpIHtcbiAgICAgICAgZHZEYXRhID0gc3RhbmRhcmRpemVkKGR2LmRhdGEpO1xuICAgIH1cbiAgICBsZXQgWCA9IGRhdGE7XG4gICAgbGV0IFkgPSBkdkRhdGEubWFwKCh5KSA9PiB7IHJldHVybiBbeV07IH0pO1xuICAgIGxldCBYcHJpbWUgPSBqU3RhdC50cmFuc3Bvc2UoWCk7XG4gICAgbGV0IFhwcmltZVggPSBqU3RhdC5tdWx0aXBseShYcHJpbWUsIFgpO1xuICAgIGxldCBYcHJpbWVZID0galN0YXQubXVsdGlwbHkoWHByaW1lLCBZKTtcbiAgICAvL2NvZWZmaWNpZW50c1xuICAgIGxldCBiID0galN0YXQubXVsdGlwbHkoalN0YXQuaW52KFhwcmltZVgpLCBYcHJpbWVZKTtcbiAgICB0aGlzLmJldGFzID0gYi5yZWR1Y2UoKGEsIGIpID0+IHsgcmV0dXJuIGEuY29uY2F0KGIpOyB9KTtcbiAgICAvL3N0YW5kYXJkIGVycm9yIG9mIHRoZSBjb2VmZmljaWVudHNcbiAgICB0aGlzLnN0RXJyQ29lZmYgPSBqU3RhdC5tdWx0aXBseShqU3RhdC5pbnYoWHByaW1lWCksIHZhcnMpXG4gICAgICAgIC5yZWR1Y2UoKGEsIGIpID0+IHsgcmV0dXJuIGEuY29uY2F0KGIpOyB9KTtcbiAgICAvL3Qgc3RhdGlzdGljc1xuICAgIHRoaXMudFN0YXRzID0gdGhpcy5zdEVyckNvZWZmLm1hcCgoc2UsIGkpID0+IHsgcmV0dXJuIHRoaXMuYmV0YXNbaV0gLyBzZTsgfSk7XG4gICAgLy9wIHZhbHVlc1xuICAgIHRoaXMucFZhbHVlcyA9IHRoaXMudFN0YXRzLm1hcCgodCwgaSkgPT4geyByZXR1cm4galN0YXQudHRlc3QodCwgbWVhbnNbaV0sIHNkc1tpXSwgbik7IH0pO1xuICAgIC8vcmVzaWR1YWxzXG4gICAgbGV0IHloYXQgPSBbXTtcbiAgICBsZXQgcmVzID0gZHYuZGF0YS5tYXAoKGQsIGkpID0+IHtcbiAgICAgICAgZGF0YVtpXS5zaGlmdCgpO1xuICAgICAgICBsZXQgcm93ID0gZGF0YVtpXTtcbiAgICAgICAgeWhhdFtpXSA9IHRoaXMucHJlZGljdChyb3cpO1xuICAgICAgICByZXR1cm4gZCAtIHloYXRbaV07XG4gICAgfSk7XG4gICAgbGV0IHJlc2lkdWFsID0geWhhdDtcbiAgICByZXR1cm4gdGhpcy5iZXRhcztcbn1cbmV4cG9ydCBmdW5jdGlvbiBwbHMoeCwgeSkge1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmVncmVzc2lvbi5qcy5tYXAiLCJpbXBvcnQgeyBRQ29tcG9uZW50IH0gZnJvbSAnLi9RQ29tcG9uZW50Jztcbi8qXG4qIFV0aWxpdHkgU3lzdGVtcyBjbGFzc1xuKi9cbmV4cG9ydCBjbGFzcyBVU3lzIGV4dGVuZHMgUUNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IobmFtZSwgb3B0aW9ucywgZGF0YSkge1xuICAgICAgICBzdXBlcihuYW1lKTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgdGhpcy5yZXN1bHRzID0gW107XG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgfVxuICAgIHVwZGF0ZShhZ2VudCwgc3RlcCkge1xuICAgICAgICB2YXIgdG1wID0gW10sIG1heCA9IDAsIGF2ZywgdG9wO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMub3B0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdG1wW2ldID0gMDtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5vcHRpb25zW2ldLmNvbnNpZGVyYXRpb25zLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgbGV0IGMgPSB0aGlzLm9wdGlvbnNbaV0uY29uc2lkZXJhdGlvbnNbal07XG4gICAgICAgICAgICAgICAgbGV0IHggPSBjLngoYWdlbnQsIHRoaXMub3B0aW9uc1tpXS5wYXJhbXMpO1xuICAgICAgICAgICAgICAgIHRtcFtpXSArPSBjLmYoeCwgYy5tLCBjLmIsIGMuayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhdmcgPSB0bXBbaV0gLyB0aGlzLm9wdGlvbnNbaV0uY29uc2lkZXJhdGlvbnMubGVuZ3RoO1xuICAgICAgICAgICAgdGhpcy5yZXN1bHRzLnB1c2goeyBwb2ludDogYWdlbnQuaWQsIG9wdDogdGhpcy5vcHRpb25zW2ldLm5hbWUsIHJlc3VsdDogYXZnIH0pO1xuICAgICAgICAgICAgaWYgKGF2ZyA+IG1heCkge1xuICAgICAgICAgICAgICAgIGFnZW50LnRvcCA9IHsgbmFtZTogdGhpcy5vcHRpb25zW2ldLm5hbWUsIHV0aWw6IGF2ZyB9O1xuICAgICAgICAgICAgICAgIHRvcCA9IGk7XG4gICAgICAgICAgICAgICAgbWF4ID0gYXZnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMub3B0aW9uc1t0b3BdLmFjdGlvbihzdGVwLCBhZ2VudCk7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9VVN5cy5qcy5tYXAiLCJjbGFzcyBSYW5kb20ge1xuICAgIGNvbnN0cnVjdG9yKHNlZWQpIHtcbiAgICAgICAgdGhpcy5zZWVkID0gc2VlZDtcbiAgICAgICAgdGhpcy5jYWxsZWQgPSAwO1xuICAgIH1cbiAgICByYW5kUmFuZ2UobWluLCBtYXgpIHtcbiAgICAgICAgcmV0dXJuIChtYXggLSBtaW4pICogdGhpcy5yYW5kb20oKSArIG1pbjtcbiAgICB9XG4gICAgbWF0KHJvd3MsIGNvbHMsIGRpc3QgPSAncmFuZG9tJykge1xuICAgICAgICBsZXQgcmFuZHMgPSBbXTtcbiAgICAgICAgaWYgKHR5cGVvZiByb3dzID09ICdudW1iZXInICYmIHR5cGVvZiBjb2xzID09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBmb3IgKGxldCByID0gMDsgciA8IHJvd3M7IHIrKykge1xuICAgICAgICAgICAgICAgIHJhbmRzW3JdID0gW107XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgYyA9IDA7IGMgPCBjb2xzOyBjKyspIHtcbiAgICAgICAgICAgICAgICAgICAgcmFuZHNbcl1bY10gPSB0aGlzW2Rpc3RdKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByYW5kcztcbiAgICB9XG4gICAgYXJyYXkobiwgZGlzdCA9ICdyYW5kb20nKSB7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgbGV0IHJhbmRzID0gW107XG4gICAgICAgIHdoaWxlIChpIDwgbikge1xuICAgICAgICAgICAgcmFuZHNbaV0gPSB0aGlzW2Rpc3RdKCk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJhbmRzO1xuICAgIH1cbiAgICBwaWNrKGFycmF5KSB7XG4gICAgICAgIHJldHVybiBhcnJheVtNYXRoLmZsb29yKHRoaXMucmFuZG9tKCkgKiBhcnJheS5sZW5ndGgpXTtcbiAgICB9XG4gICAgLyoqXG4gICAgKkJlbG93IGlzIGFkYXB0ZWQgZnJvbSBqU3RhdDpodHRwczovL2dpdGh1Yi5jb20vanN0YXQvanN0YXQvYmxvYi9tYXN0ZXIvc3JjL3NwZWNpYWwuanNcbiAgICAqKi9cbiAgICByYW5kbigpIHtcbiAgICAgICAgdmFyIHUsIHYsIHgsIHksIHE7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIHUgPSB0aGlzLnJhbmRvbSgpO1xuICAgICAgICAgICAgdiA9IDEuNzE1NiAqICh0aGlzLnJhbmRvbSgpIC0gMC41KTtcbiAgICAgICAgICAgIHggPSB1IC0gMC40NDk4NzE7XG4gICAgICAgICAgICB5ID0gTWF0aC5hYnModikgKyAwLjM4NjU5NTtcbiAgICAgICAgICAgIHEgPSB4ICogeCArIHkgKiAoMC4xOTYwMCAqIHkgLSAwLjI1NDcyICogeCk7XG4gICAgICAgIH0gd2hpbGUgKHEgPiAwLjI3NTk3ICYmIChxID4gMC4yNzg0NiB8fCB2ICogdiA+IC00ICogTWF0aC5sb2codSkgKiB1ICogdSkpO1xuICAgICAgICByZXR1cm4gdiAvIHU7XG4gICAgfVxuICAgIHJhbmRnKHNoYXBlKSB7XG4gICAgICAgIHZhciBvYWxwaCA9IHNoYXBlO1xuICAgICAgICB2YXIgYTEsIGEyLCB1LCB2LCB4O1xuICAgICAgICBpZiAoIXNoYXBlKVxuICAgICAgICAgICAgc2hhcGUgPSAxO1xuICAgICAgICBpZiAoc2hhcGUgPCAxKVxuICAgICAgICAgICAgc2hhcGUgKz0gMTtcbiAgICAgICAgYTEgPSBzaGFwZSAtIDEgLyAzO1xuICAgICAgICBhMiA9IDEgLyBNYXRoLnNxcnQoOSAqIGExKTtcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIHggPSB0aGlzLnJhbmRuKCk7XG4gICAgICAgICAgICAgICAgdiA9IDEgKyBhMiAqIHg7XG4gICAgICAgICAgICB9IHdoaWxlICh2IDw9IDApO1xuICAgICAgICAgICAgdiA9IHYgKiB2ICogdjtcbiAgICAgICAgICAgIHUgPSB0aGlzLnJhbmRvbSgpO1xuICAgICAgICB9IHdoaWxlICh1ID4gMSAtIDAuMzMxICogTWF0aC5wb3coeCwgNCkgJiZcbiAgICAgICAgICAgIE1hdGgubG9nKHUpID4gMC41ICogeCAqIHggKyBhMSAqICgxIC0gdiArIE1hdGgubG9nKHYpKSk7XG4gICAgICAgIC8vIGFscGhhID4gMVxuICAgICAgICBpZiAoc2hhcGUgPT0gb2FscGgpXG4gICAgICAgICAgICByZXR1cm4gYTEgKiB2O1xuICAgICAgICAvLyBhbHBoYSA8IDFcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgdSA9IHRoaXMucmFuZG9tKCk7XG4gICAgICAgIH0gd2hpbGUgKHUgPT09IDApO1xuICAgICAgICByZXR1cm4gTWF0aC5wb3codSwgMSAvIG9hbHBoKSAqIGExICogdjtcbiAgICB9XG4gICAgYmV0YShhbHBoYSwgYmV0YSkge1xuICAgICAgICB2YXIgdSA9IHRoaXMucmFuZGcoYWxwaGEpO1xuICAgICAgICByZXR1cm4gdSAvICh1ICsgdGhpcy5yYW5kZyhiZXRhKSk7XG4gICAgfVxuICAgIGdhbW1hKHNoYXBlLCBzY2FsZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5yYW5kZyhzaGFwZSkgKiBzY2FsZTtcbiAgICB9XG4gICAgbG9nTm9ybWFsKG11LCBzaWdtYSkge1xuICAgICAgICByZXR1cm4gTWF0aC5leHAodGhpcy5yYW5kbigpICogc2lnbWEgKyBtdSk7XG4gICAgfVxuICAgIG5vcm1hbChtZWFuID0gMCwgc3RkID0gMSkge1xuICAgICAgICByZXR1cm4gdGhpcy5yYW5kbigpICogc3RkICsgbWVhbjtcbiAgICB9XG4gICAgcG9pc3NvbihsKSB7XG4gICAgICAgIHZhciBwID0gMSwgayA9IDAsIEwgPSBNYXRoLmV4cCgtbCk7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGsrKztcbiAgICAgICAgICAgIHAgKj0gdGhpcy5yYW5kb20oKTtcbiAgICAgICAgfSB3aGlsZSAocCA+IEwpO1xuICAgICAgICByZXR1cm4gayAtIDE7XG4gICAgfVxuICAgIHQoZG9mKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJhbmRuKCkgKiBNYXRoLnNxcnQoZG9mIC8gKDIgKiB0aGlzLnJhbmRnKGRvZiAvIDIpKSk7XG4gICAgfVxuICAgIHdlaWJ1bGwoc2NhbGUsIHNoYXBlKSB7XG4gICAgICAgIHJldHVybiBzY2FsZSAqIE1hdGgucG93KC1NYXRoLmxvZyh0aGlzLnJhbmRvbSgpKSwgMSAvIHNoYXBlKTtcbiAgICB9XG59XG4vKipcbiogQm9iIEplbmtpbnMnIHNtYWxsIG5vbmNyeXB0b2dyYXBoaWMgUFJORyAocHNldWRvcmFuZG9tIG51bWJlciBnZW5lcmF0b3IpIHBvcnRlZCB0byBKYXZhU2NyaXB0XG4qIGFkYXB0ZWQgZnJvbTpcbiogaHR0cHM6Ly9naXRodWIuY29tL2dyYXVlL2J1cnRsZXBybmdcbiogd2hpY2ggaXMgZnJvbSBodHRwOi8vd3d3LmJ1cnRsZWJ1cnRsZS5uZXQvYm9iL3JhbmQvc21hbGxwcm5nLmh0bWxcbiovXG5leHBvcnQgY2xhc3MgUk5HQnVydGxlIGV4dGVuZHMgUmFuZG9tIHtcbiAgICBjb25zdHJ1Y3RvcihzZWVkKSB7XG4gICAgICAgIHN1cGVyKHNlZWQpO1xuICAgICAgICB0aGlzLnNlZWQgPj4+PSAwO1xuICAgICAgICB0aGlzLmN0eCA9IG5ldyBBcnJheSg0KTtcbiAgICAgICAgdGhpcy5jdHhbMF0gPSAweGYxZWE1ZWVkO1xuICAgICAgICB0aGlzLmN0eFsxXSA9IHRoaXMuY3R4WzJdID0gdGhpcy5jdHhbM10gPSB0aGlzLnNlZWQ7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjA7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5yYW5kb20oKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByb3QoeCwgaykge1xuICAgICAgICByZXR1cm4gKHggPDwgaykgfCAoeCA+PiAoMzIgLSBrKSk7XG4gICAgfVxuICAgIHJhbmRvbSgpIHtcbiAgICAgICAgdmFyIGN0eCA9IHRoaXMuY3R4O1xuICAgICAgICB2YXIgZSA9IChjdHhbMF0gLSB0aGlzLnJvdChjdHhbMV0sIDI3KSkgPj4+IDA7XG4gICAgICAgIGN0eFswXSA9IChjdHhbMV0gXiB0aGlzLnJvdChjdHhbMl0sIDE3KSkgPj4+IDA7XG4gICAgICAgIGN0eFsxXSA9IChjdHhbMl0gKyBjdHhbM10pID4+PiAwO1xuICAgICAgICBjdHhbMl0gPSAoY3R4WzNdICsgZSkgPj4+IDA7XG4gICAgICAgIGN0eFszXSA9IChlICsgY3R4WzBdKSA+Pj4gMDtcbiAgICAgICAgdGhpcy5jYWxsZWQgKz0gMTtcbiAgICAgICAgcmV0dXJuIGN0eFszXSAvIDQyOTQ5NjcyOTYuMDtcbiAgICB9XG59XG4vKlxuKiB4b3JzaGlmdDcqLCBieSBGcmFuw6dvaXMgUGFubmV0b24gYW5kIFBpZXJyZSBMJ2VjdXllcjogMzItYml0IHhvci1zaGlmdCByYW5kb20gbnVtYmVyIGdlbmVyYXRvclxuKiBhZGRzIHJvYnVzdG5lc3MgYnkgYWxsb3dpbmcgbW9yZSBzaGlmdHMgdGhhbiBNYXJzYWdsaWEncyBvcmlnaW5hbCB0aHJlZS4gSXQgaXMgYSA3LXNoaWZ0IGdlbmVyYXRvciB3aXRoIDI1NiBiaXRzLCB0aGF0IHBhc3NlcyBCaWdDcnVzaCB3aXRoIG5vIHN5c3RtYXRpYyBmYWlsdXJlcy5cbiogQWRhcHRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9kYXZpZGJhdS94c3JhbmRcbiovXG5leHBvcnQgY2xhc3MgUk5HeG9yc2hpZnQ3IGV4dGVuZHMgUmFuZG9tIHtcbiAgICBjb25zdHJ1Y3RvcihzZWVkKSB7XG4gICAgICAgIGxldCBqLCB3LCBYID0gW107XG4gICAgICAgIHN1cGVyKHNlZWQpO1xuICAgICAgICAvLyBTZWVkIHN0YXRlIGFycmF5IHVzaW5nIGEgMzItYml0IGludGVnZXIuXG4gICAgICAgIHcgPSBYWzBdID0gdGhpcy5zZWVkO1xuICAgICAgICAvLyBFbmZvcmNlIGFuIGFycmF5IGxlbmd0aCBvZiA4LCBub3QgYWxsIHplcm9lcy5cbiAgICAgICAgd2hpbGUgKFgubGVuZ3RoIDwgOCkge1xuICAgICAgICAgICAgWC5wdXNoKDApO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCA4ICYmIFhbal0gPT09IDA7ICsraikge1xuICAgICAgICAgICAgaWYgKGogPT0gOCkge1xuICAgICAgICAgICAgICAgIHcgPSBYWzddID0gLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB3ID0gWFtqXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnggPSBYO1xuICAgICAgICB0aGlzLmkgPSAwO1xuICAgICAgICAvLyBEaXNjYXJkIGFuIGluaXRpYWwgMjU2IHZhbHVlcy5cbiAgICAgICAgZm9yIChqID0gMjU2OyBqID4gMDsgLS1qKSB7XG4gICAgICAgICAgICB0aGlzLnJhbmRvbSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJhbmRvbSgpIHtcbiAgICAgICAgbGV0IFggPSB0aGlzLngsIGkgPSB0aGlzLmksIHQsIHYsIHcsIHJlcztcbiAgICAgICAgdCA9IFhbaV07XG4gICAgICAgIHQgXj0gKHQgPj4+IDcpO1xuICAgICAgICB2ID0gdCBeICh0IDw8IDI0KTtcbiAgICAgICAgdCA9IFhbKGkgKyAxKSAmIDddO1xuICAgICAgICB2IF49IHQgXiAodCA+Pj4gMTApO1xuICAgICAgICB0ID0gWFsoaSArIDMpICYgN107XG4gICAgICAgIHYgXj0gdCBeICh0ID4+PiAzKTtcbiAgICAgICAgdCA9IFhbKGkgKyA0KSAmIDddO1xuICAgICAgICB2IF49IHQgXiAodCA8PCA3KTtcbiAgICAgICAgdCA9IFhbKGkgKyA3KSAmIDddO1xuICAgICAgICB0ID0gdCBeICh0IDw8IDEzKTtcbiAgICAgICAgdiBePSB0IF4gKHQgPDwgOSk7XG4gICAgICAgIFhbaV0gPSB2O1xuICAgICAgICB0aGlzLmkgPSAoaSArIDEpICYgNztcbiAgICAgICAgcmVzID0gKHYgPj4+IDApIC8gKCgxIDw8IDMwKSAqIDQpO1xuICAgICAgICB0aGlzLmNhbGxlZCArPSAxO1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJhbmRvbS5qcy5tYXAiLCJleHBvcnQgKiBmcm9tICcuL3V0aWxzJztcbmV4cG9ydCB7IFFDb21wb25lbnQgfSBmcm9tICcuL1FDb21wb25lbnQnO1xuZXhwb3J0IHsgQkRJQWdlbnQgfSBmcm9tICcuL2JkaSc7XG5leHBvcnQgKiBmcm9tICcuL2JlaGF2aW9yVHJlZSc7XG5leHBvcnQgKiBmcm9tICcuL2NvbXBhcnRtZW50JztcbmV4cG9ydCB7IENvbnRhY3RQYXRjaCB9IGZyb20gJy4vY29udGFjdFBhdGNoJztcbmV4cG9ydCB7IEVudmlyb25tZW50IH0gZnJvbSAnLi9lbnZpcm9ubWVudCc7XG5leHBvcnQgKiBmcm9tICcuL2VwaSc7XG5leHBvcnQgKiBmcm9tICcuL2V2ZW50cyc7XG5leHBvcnQgeyBFeHBlcmltZW50IH0gZnJvbSAnLi9leHBlcmltZW50JztcbmV4cG9ydCAqIGZyb20gJy4vZ2VuZXRpYyc7XG5leHBvcnQgeyBFdm9sdXRpb25hcnkgfSBmcm9tICcuL2V2b2x1dGlvbmFyeSc7XG5leHBvcnQgeyBIeWJyaWRBdXRvbWF0YSB9IGZyb20gJy4vaGEnO1xuZXhwb3J0ICogZnJvbSAnLi9odG4nO1xuZXhwb3J0ICogZnJvbSAnLi9tYyc7XG5leHBvcnQgeyBrTWVhbiB9IGZyb20gJy4va21lYW4nO1xuZXhwb3J0IHsgS05OIH0gZnJvbSAnLi9rbm4nO1xuZXhwb3J0ICogZnJvbSAnLi9tYXRoJztcbmV4cG9ydCB7IE5ldHdvcmsgfSBmcm9tICcuL25ldHdvcmsnO1xuZXhwb3J0IHsgUUxlYXJuZXIgfSBmcm9tICcuL1FMZWFybmVyJztcbmV4cG9ydCAqIGZyb20gJy4vcmVncmVzc2lvbic7XG5leHBvcnQgeyBTdGF0ZU1hY2hpbmUgfSBmcm9tICcuL3N0YXRlTWFjaGluZSc7XG5leHBvcnQgKiBmcm9tICcuL1VTeXMnO1xuZXhwb3J0ICogZnJvbSAnLi9yYW5kb20nO1xuZXhwb3J0IHZhciB2ZXJzaW9uID0gJzAuMC41Jztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1haW4uanMubWFwIiwiLyoqKlxuKkBtb2R1bGUgUUVwaUtpdFxuKi9cbmltcG9ydCAqIGFzIHFlcGlraXQgZnJvbSAnLi9tYWluJztcbmxldCBRRXBpS2l0ID0gcWVwaWtpdDtcbmZvciAobGV0IGtleSBpbiBRRXBpS2l0KSB7XG4gICAgaWYgKGtleSA9PSAndmVyc2lvbicpIHtcbiAgICAgICAgY29uc29sZS5sb2coUUVwaUtpdFtrZXldKTtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1xZXBpa2l0LmpzLm1hcCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFPLE1BQU0sT0FBTyxHQUFHLENBQUMsQ0FBQztBQUN6QixBQUFPLE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBQztBQUN4QixBQUFPLE1BQU0sT0FBTyxHQUFHLENBQUMsQ0FBQztBQUN6QixBQUFPLFNBQVMsWUFBWSxDQUFDLElBQUksRUFBRTtJQUMvQixJQUFJLFVBQVUsQ0FBQztJQUNmLElBQUksR0FBRyxDQUFDO0lBQ1IsSUFBSSxVQUFVLEdBQUcsOEJBQThCLENBQUM7SUFDaEQsSUFBSSxlQUFlLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxTQUFTLEVBQUU7UUFDOUIsVUFBVSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUNwQyxDQUFDLENBQUM7SUFDSCxVQUFVLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6QyxHQUFHLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzVCLE9BQU8sR0FBRyxDQUFDO0NBQ2Q7QUFDRCxBQUFPLFNBQVMsY0FBYyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO0lBQzdDLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUNmLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUNkLE9BQU8sQ0FBQyxHQUFHLEdBQUcsRUFBRTtRQUNaLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDZCxDQUFDLElBQUksSUFBSSxDQUFDO0tBQ2I7SUFDRCxPQUFPLEtBQUssQ0FBQztDQUNoQjs7OztBQUlELEFBQU8sU0FB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QUMsaUJBQWlCLENBQUM7Z0JBQzFGLEtBQUssRUFBRSxRQUFRO2FBQ2xCLENBQUMsQ0FBQyxDQUFDO1lBQ0osR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUM7WUFDM0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDdkMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3JFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUMzQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDM0MsSUFBSSxPQUFPLEtBQUssS0FBSyxXQUFXLEVBQUU7Z0JBQzlCLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzFCO1NBQ0o7UUFDRCxJQUFJLEdBQUcsQ0FBQyxDQUFDLENB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LFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDdEQ7UUFDRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDN0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ3RDO1FBQ0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzdDLEtBQUssSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRTtnQkFDNUMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxRQUFRLENBQUM7Z0JBQ2IsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLFFBQVEsSUFBSSxPQUFPLEtBQUssQ0FBQyxLQUFLLEtBQUssV0FBVyxFQUFFO29CQUNoRSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNsSTtxQkFDSTtvQkFD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Q0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0lBRXhDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNwRCxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDOztJQUV6RCxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUM7U0FDckQsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7SUFFL0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDOztJQUU3RSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7SUFFMUYsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ2QsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FB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QUksQ0FBQyxDQUFDLENBQUM7UUFDbEIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDbEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNULElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQixHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztRQUNqQixPQUFPLEdBQUcsQ0FBQztLQUNkO0NBQ0osQUFDRDs7QUMvSk8sSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQzdCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN6QkE7OztBQUdBLEFBQ0EsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3RCLEtBQUssSUFBSSxHQUFHLElBQUksT0FBTyxFQUFFO0lBQ3JCLElBQUksR0FBRyxJQUFJLFNBQVMsRUFBRTtRQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQzdCO0NBQ0osQUFDRCJ9
