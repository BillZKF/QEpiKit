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
                color: 0x000000
            }));
            pop[a].mesh.qId = pop[a].id;
            pop[a].mesh.type = 'agent';
            pop[a].position = { x: 0, y: 0, z: 0 };
            pop[a].boundaryGroup = options.groupName;
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
    constructor(name, root, data) {
        super(name);
        this.root = root;
        this.data = data;
        this.results = [];
    }
    static tick(node, agent) {
        var state = node.operate(agent);
        return state;
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
                group.params.groupName = grName;
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
    constructor(name, root, task, data) {
        super(name);
        this.root = root;
        this.data = data;
        this.summary = [];
        this.results = [];
        this.task = task;
    }
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
        this.derFn = Network.derivativeMethods[activationType];
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
Network.derivativeMethods = {
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

let QEpiKit = qepikit;
for (let key in QEpiKit) {
    if (key == 'version') {
        console.log(QEpiKit[key]);
    }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicWVwaWtpdC5qcyIsInNvdXJjZXMiOlsiZGlzdC91dGlscy5qcyIsImRpc3QvUUNvbXBvbmVudC5qcyIsImRpc3QvYmRpLmpzIiwiZGlzdC9iZWhhdmlvclRyZWUuanMiLCJkaXN0L2NvbXBhcnRtZW50LmpzIiwiZGlzdC9jb250YWN0UGF0Y2guanMiLCJkaXN0L2Vudmlyb25tZW50LmpzIiwiZGlzdC9lcGkuanMiLCJkaXN0L2V2ZW50cy5qcyIsImRpc3Qvc3RhdGVNYWNoaW5lLmpzIiwiZGlzdC9leHBlcmltZW50LmpzIiwiZGlzdC9nZW5ldGljLmpzIiwiZGlzdC9ldm9sdXRpb25hcnkuanMiLCJkaXN0L2hhLmpzIiwiZGlzdC9odG4uanMiLCJkaXN0L21jLmpzIiwiZGlzdC9rbWVhbi5qcyIsImRpc3Qva25uLmpzIiwiZGlzdC9tYXRoLmpzIiwiZGlzdC9uZXR3b3JrLmpzIiwiZGlzdC9RTGVhcm5lci5qcyIsImRpc3QvcmVncmVzc2lvbi5qcyIsImRpc3QvVVN5cy5qcyIsImRpc3QvcmFuZG9tLmpzIiwiZGlzdC9tYWluLmpzIiwiZGlzdC9RRXBpS2l0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBTVUNDRVNTID0gMTtcbmV4cG9ydCBjb25zdCBGQUlMRUQgPSAyO1xuZXhwb3J0IGNvbnN0IFJVTk5JTkcgPSAzO1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNTVlVSSShkYXRhKSB7XG4gICAgdmFyIGRhdGFTdHJpbmc7XG4gICAgdmFyIFVSSTtcbiAgICB2YXIgY3N2Q29udGVudCA9IFwiZGF0YTp0ZXh0L2NzdjtjaGFyc2V0PXV0Zi04LFwiO1xuICAgIHZhciBjc3ZDb250ZW50QXJyYXkgPSBbXTtcbiAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGluZm9BcnJheSkge1xuICAgICAgICBkYXRhU3RyaW5nID0gaW5mb0FycmF5LmpvaW4oXCIsXCIpO1xuICAgICAgICBjc3ZDb250ZW50QXJyYXkucHVzaChkYXRhU3RyaW5nKTtcbiAgICB9KTtcbiAgICBjc3ZDb250ZW50ICs9IGNzdkNvbnRlbnRBcnJheS5qb2luKFwiXFxuXCIpO1xuICAgIFVSSSA9IGVuY29kZVVSSShjc3ZDb250ZW50KTtcbiAgICByZXR1cm4gVVJJO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGFycmF5RnJvbVJhbmdlKHN0YXJ0LCBlbmQsIHN0ZXApIHtcbiAgICB2YXIgcmFuZ2UgPSBbXTtcbiAgICB2YXIgaSA9IHN0YXJ0O1xuICAgIHdoaWxlIChpIDwgZW5kKSB7XG4gICAgICAgIHJhbmdlLnB1c2goaSk7XG4gICAgICAgIGkgKz0gc3RlcDtcbiAgICB9XG4gICAgcmV0dXJuIHJhbmdlO1xufVxuLyoqXG4qIHNodWZmbGUgLSBmaXNoZXIteWF0ZXMgc2h1ZmZsZVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBzaHVmZmxlKGFycmF5LCBybmcpIHtcbiAgICB2YXIgY3VycmVudEluZGV4ID0gYXJyYXkubGVuZ3RoLCB0ZW1wb3JhcnlWYWx1ZSwgcmFuZG9tSW5kZXg7XG4gICAgLy8gV2hpbGUgdGhlcmUgcmVtYWluIGVsZW1lbnRzIHRvIHNodWZmbGUuLi5cbiAgICB3aGlsZSAoMCAhPT0gY3VycmVudEluZGV4KSB7XG4gICAgICAgIC8vIFBpY2sgYSByZW1haW5pbmcgZWxlbWVudC4uLlxuICAgICAgICByYW5kb21JbmRleCA9IE1hdGguZmxvb3Iocm5nLnJhbmRvbSgpICogY3VycmVudEluZGV4KTtcbiAgICAgICAgY3VycmVudEluZGV4IC09IDE7XG4gICAgICAgIC8vIEFuZCBzd2FwIGl0IHdpdGggdGhlIGN1cnJlbnQgZWxlbWVudC5cbiAgICAgICAgdGVtcG9yYXJ5VmFsdWUgPSBhcnJheVtjdXJyZW50SW5kZXhdO1xuICAgICAgICBhcnJheVtjdXJyZW50SW5kZXhdID0gYXJyYXlbcmFuZG9tSW5kZXhdO1xuICAgICAgICBhcnJheVtyYW5kb21JbmRleF0gPSB0ZW1wb3JhcnlWYWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlVVVJRCgpIHtcbiAgICAvLyBodHRwOi8vd3d3LmJyb29mYS5jb20vVG9vbHMvTWF0aC51dWlkLmh0bVxuICAgIHZhciBjaGFycyA9ICcwMTIzNDU2Nzg5QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eicuc3BsaXQoJycpO1xuICAgIHZhciB1dWlkID0gbmV3IEFycmF5KDM2KTtcbiAgICB2YXIgcm5kID0gMCwgcjtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM2OyBpKyspIHtcbiAgICAgICAgaWYgKGkgPT0gOCB8fCBpID09IDEzIHx8IGkgPT0gMTggfHwgaSA9PSAyMykge1xuICAgICAgICAgICAgdXVpZFtpXSA9ICctJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpID09IDE0KSB7XG4gICAgICAgICAgICB1dWlkW2ldID0gJzQnO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKHJuZCA8PSAweDAyKVxuICAgICAgICAgICAgICAgIHJuZCA9IDB4MjAwMDAwMCArIChNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwKSB8IDA7XG4gICAgICAgICAgICByID0gcm5kICYgMHhmO1xuICAgICAgICAgICAgcm5kID0gcm5kID4+IDQ7XG4gICAgICAgICAgICB1dWlkW2ldID0gY2hhcnNbKGkgPT0gMTkpID8gKHIgJiAweDMpIHwgMHg4IDogcl07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHV1aWQuam9pbignJyk7XG59XG5leHBvcnQgZnVuY3Rpb24gYWx3YXlzKGEpIHtcbiAgICBpZiAoYSA9PT0gU1VDQ0VTUykge1xuICAgICAgICByZXR1cm4gU1VDQ0VTUztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBGQUlMRUQ7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGV2ZW50dWFsbHkoYSkge1xuICAgIGlmIChhID09PSBTVUNDRVNTKSB7XG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFJVTk5JTkc7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFsVG8oYSwgYikge1xuICAgIGlmIChhID09PSBiKSB7XG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gbm90KHJlc3VsdCkge1xuICAgIHZhciBuZXdSZXN1bHQ7XG4gICAgaWYgKHJlc3VsdCA9PT0gU1VDQ0VTUykge1xuICAgICAgICBuZXdSZXN1bHQgPSBGQUlMRUQ7XG4gICAgfVxuICAgIGVsc2UgaWYgKHJlc3VsdCA9PT0gRkFJTEVEKSB7XG4gICAgICAgIG5ld1Jlc3VsdCA9IFNVQ0NFU1M7XG4gICAgfVxuICAgIHJldHVybiBuZXdSZXN1bHQ7XG59XG5leHBvcnQgZnVuY3Rpb24gbm90RXF1YWxUbyhhLCBiKSB7XG4gICAgaWYgKGEgIT09IGIpIHtcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gRkFJTEVEO1xuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBndChhLCBiKSB7XG4gICAgaWYgKGEgPiBiKSB7XG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gZ3RFcShhLCBiKSB7XG4gICAgaWYgKGEgPj0gYikge1xuICAgICAgICByZXR1cm4gU1VDQ0VTUztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBGQUlMRUQ7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGx0KGEsIGIpIHtcbiAgICBpZiAoYSA8IGIpIHtcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gRkFJTEVEO1xuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBsdEVxKGEsIGIpIHtcbiAgICBpZiAoYSA8PSBiKSB7XG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gaGFzUHJvcChhLCBiKSB7XG4gICAgYSA9IGEgfHwgZmFsc2U7XG4gICAgaWYgKGEgPT09IGIpIHtcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gRkFJTEVEO1xuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBpblJhbmdlKGEsIGIpIHtcbiAgICBpZiAoYiA+PSBhWzBdICYmIGIgPD0gYVsxXSkge1xuICAgICAgICByZXR1cm4gU1VDQ0VTUztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBGQUlMRUQ7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIG5vdEluUmFuZ2UoYSwgYikge1xuICAgIGlmIChiID49IGFbMF0gJiYgYiA8PSBhWzFdKSB7XG4gICAgICAgIHJldHVybiBGQUlMRUQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gU1VDQ0VTUztcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0TWF0Y2hlclN0cmluZyhjaGVjaykge1xuICAgIHZhciBzdHJpbmcgPSBudWxsO1xuICAgIHN3aXRjaCAoY2hlY2spIHtcbiAgICAgICAgY2FzZSBlcXVhbFRvOlxuICAgICAgICAgICAgc3RyaW5nID0gXCJlcXVhbCB0b1wiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2Ugbm90RXF1YWxUbzpcbiAgICAgICAgICAgIHN0cmluZyA9IFwibm90IGVxdWFsIHRvXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBndDpcbiAgICAgICAgICAgIHN0cmluZyA9IFwiZ3JlYXRlciB0aGFuXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBndEVxOlxuICAgICAgICAgICAgc3RyaW5nID0gXCJncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG9cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGx0OlxuICAgICAgICAgICAgc3RyaW5nID0gXCJsZXNzIHRoYW5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGx0RXE6XG4gICAgICAgICAgICBzdHJpbmcgPSBcImxlc3MgdGhhbiBvciBlcXVhbCB0b1wiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgaGFzUHJvcDpcbiAgICAgICAgICAgIHN0cmluZyA9IFwiaGFzIHRoZSBwcm9wZXJ0eVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHN0cmluZyA9IFwibm90IGEgZGVmaW5lZCBtYXRjaGVyXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiBzdHJpbmc7XG59XG5leHBvcnQgZnVuY3Rpb24gc2V0TWluKHBhcmFtcywga2V5cykge1xuICAgIGZvciAodmFyIHBhcmFtIGluIHBhcmFtcykge1xuICAgICAgICBpZiAodHlwZW9mIChrZXlzKSAhPT0gJ3VuZGVmaW5lZCcgJiYga2V5cy5pbmRleE9mKHBhcmFtKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHBhcmFtc1twYXJhbV0uY3VycmVudCA9IHBhcmFtc1twYXJhbV0udmFsdWUgLSBwYXJhbXNbcGFyYW1dLmVycm9yO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiAoa2V5cykgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBwYXJhbXNbcGFyYW1dLmN1cnJlbnQgPSBwYXJhbXNbcGFyYW1dLnZhbHVlIC0gcGFyYW1zW3BhcmFtXS5lcnJvcjtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBzZXRNYXgocGFyYW1zLCBrZXlzKSB7XG4gICAgZm9yICh2YXIgcGFyYW0gaW4gcGFyYW1zKSB7XG4gICAgICAgIGlmICh0eXBlb2YgKGtleXMpICE9PSAndW5kZWZpbmVkJyAmJiBrZXlzLmluZGV4T2YocGFyYW0pICE9PSAtMSkge1xuICAgICAgICAgICAgcGFyYW1zW3BhcmFtXS5jdXJyZW50ID0gcGFyYW1zW3BhcmFtXS52YWx1ZSArIHBhcmFtc1twYXJhbV0uZXJyb3I7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIChrZXlzKSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHBhcmFtc1twYXJhbV0uY3VycmVudCA9IHBhcmFtc1twYXJhbV0udmFsdWUgKyBwYXJhbXNbcGFyYW1dLmVycm9yO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIHNldFN0YW5kYXJkKHBhcmFtcywga2V5cykge1xuICAgIGZvciAodmFyIHBhcmFtIGluIHBhcmFtcykge1xuICAgICAgICBpZiAodHlwZW9mIChrZXlzKSAhPT0gJ3VuZGVmaW5lZCcgJiYga2V5cy5pbmRleE9mKHBhcmFtKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHBhcmFtc1twYXJhbV0uY3VycmVudCA9IHBhcmFtc1twYXJhbV0udmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIChrZXlzKSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHBhcmFtc1twYXJhbV0uY3VycmVudCA9IHBhcmFtc1twYXJhbV0udmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gZGF0YVRvTWF0cml4KGl0ZW1zLCBzdGRpemVkID0gZmFsc2UpIHtcbiAgICBsZXQgZGF0YSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IGl0ZW0gPSBpdGVtc1tpXTtcbiAgICAgICAgaWYgKHN0ZGl6ZWQpIHtcbiAgICAgICAgICAgIGl0ZW0gPSBzdGFuZGFyZGl6ZWQoaXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgaXRlbS5mb3JFYWNoKCh4LCBpaSkgPT4ge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBkYXRhW2lpXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBkYXRhW2lpXSA9IFsxLCB4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGRhdGFbaWldLnB1c2goeCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbn1cbi8qXG4qIHJlbGF0aXZlIHRvIHRoZSBtZWFuLCBob3cgbWFueSBzdGFuZGFyZCBkZXZpYXRpb25zXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YW5kYXJkaXplZChhcnIpIHtcbiAgICBsZXQgc3RkID0galN0YXQuc3RkZXYoYXJyKTtcbiAgICBsZXQgbWVhbiA9IGpTdGF0Lm1lYW4oYXJyKTtcbiAgICBsZXQgc3RhbmRhcmRpemVkID0gYXJyLm1hcCgoZCkgPT4ge1xuICAgICAgICByZXR1cm4gKGQgLSBtZWFuKSAvIHN0ZDtcbiAgICB9KTtcbiAgICByZXR1cm4gc3RhbmRhcmRpemVkO1xufVxuLypcbiogYmV0d2VlbiAwIGFuZCAxIHdoZW4gbWluIGFuZCBtYXggYXJlIGtub3duXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZSh4LCBtaW4sIG1heCkge1xuICAgIGxldCB2YWwgPSB4IC0gbWluO1xuICAgIHJldHVybiB2YWwgLyAobWF4IC0gbWluKTtcbn1cbi8qXG4qIGdpdmUgdGhlIHJlYWwgdW5pdCB2YWx1ZVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZOb3JtKHgsIG1pbiwgbWF4KSB7XG4gICAgcmV0dXJuICh4ICogbWF4IC0geCAqIG1pbikgKyBtaW47XG59XG4vKlxuKlxuKi9cbmV4cG9ydCBmdW5jdGlvbiByYW5kUmFuZ2UobWluLCBtYXgpIHtcbiAgICByZXR1cm4gKG1heCAtIG1pbikgKiBNYXRoLnJhbmRvbSgpICsgbWluO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFJhbmdlKGRhdGEsIHByb3ApIHtcbiAgICBsZXQgcmFuZ2UgPSB7XG4gICAgICAgIG1pbjogMWUxNSxcbiAgICAgICAgbWF4OiAtMWUxNVxuICAgIH07XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChyYW5nZS5taW4gPiBkYXRhW2ldW3Byb3BdKSB7XG4gICAgICAgICAgICByYW5nZS5taW4gPSBkYXRhW2ldW3Byb3BdO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyYW5nZS5tYXggPCBkYXRhW2ldW3Byb3BdKSB7XG4gICAgICAgICAgICByYW5nZS5tYXggPSBkYXRhW2ldW3Byb3BdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByYW5nZTtcbn1cbmV4cG9ydCBjbGFzcyBNYXRjaCB7XG4gICAgc3RhdGljIGd0KGEsIGIpIHtcbiAgICAgICAgaWYgKGEgPiBiKSB7XG4gICAgICAgICAgICByZXR1cm4gU1VDQ0VTUztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gRkFJTEVEO1xuICAgIH1cbiAgICBzdGF0aWMgZ2UoYSwgYikge1xuICAgICAgICBpZiAoYSA+PSBiKSB7XG4gICAgICAgICAgICByZXR1cm4gU1VDQ0VTUztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gRkFJTEVEO1xuICAgIH1cbiAgICBzdGF0aWMgbHQoYSwgYikge1xuICAgICAgICBpZiAoYSA8IGIpIHtcbiAgICAgICAgICAgIHJldHVybiBTVUNDRVNTO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBGQUlMRUQ7XG4gICAgfVxuICAgIHN0YXRpYyBsZShhLCBiKSB7XG4gICAgICAgIGlmIChhIDw9IGIpIHtcbiAgICAgICAgICAgIHJldHVybiBTVUNDRVNTO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBGQUlMRUQ7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlUG9wKG51bUFnZW50cywgb3B0aW9ucywgdHlwZSwgYm91bmRhcmllcywgY3VycmVudEFnZW50SWQsIHJuZykge1xuICAgIHZhciBwb3AgPSBbXTtcbiAgICB2YXIgbG9jcyA9IHtcbiAgICAgICAgdHlwZTogJ0ZlYXR1cmVDb2xsZWN0aW9uJyxcbiAgICAgICAgZmVhdHVyZXM6IFtdXG4gICAgfTtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCBbXTtcbiAgICB0eXBlID0gdHlwZSB8fCAnY29udGludW91cyc7XG4gICAgZm9yICh2YXIgYSA9IDA7IGEgPCBudW1BZ2VudHM7IGErKykge1xuICAgICAgICBwb3BbYV0gPSB7XG4gICAgICAgICAgICBpZDogY3VycmVudEFnZW50SWQsXG4gICAgICAgICAgICB0eXBlOiB0eXBlXG4gICAgICAgIH07XG4gICAgICAgIC8vbW92ZW1lbnQgcGFyYW1zXG4gICAgICAgIHBvcFthXS5tb3ZlUGVyRGF5ID0gcm5nLm5vcm1hbCgyNTAwICogMjQsIDEwMDApOyAvLyBtL2RheVxuICAgICAgICBwb3BbYV0ucHJldlggPSAwO1xuICAgICAgICBwb3BbYV0ucHJldlkgPSAwO1xuICAgICAgICBwb3BbYV0ubW92ZWRUb3RhbCA9IDA7XG4gICAgICAgIGlmIChwb3BbYV0udHlwZSA9PT0gJ2NvbnRpbnVvdXMnKSB7XG4gICAgICAgICAgICBwb3BbYV0ubWVzaCA9IG5ldyBUSFJFRS5NZXNoKG5ldyBUSFJFRS5UZXRyYWhlZHJvbkdlb21ldHJ5KDEsIDEpLCBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe1xuICAgICAgICAgICAgICAgIGNvbG9yOiAweDAwMDAwMFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgcG9wW2FdLm1lc2gucUlkID0gcG9wW2FdLmlkO1xuICAgICAgICAgICAgcG9wW2FdLm1lc2gudHlwZSA9ICdhZ2VudCc7XG4gICAgICAgICAgICBwb3BbYV0ucG9zaXRpb24gPSB7IHg6IDAsIHk6IDAsIHo6IDAgfTtcbiAgICAgICAgICAgIHBvcFthXS5ib3VuZGFyeUdyb3VwID0gb3B0aW9ucy5ncm91cE5hbWU7XG4gICAgICAgICAgICBwb3BbYV0ucG9zaXRpb24ueCA9IHJuZy5yYW5kUmFuZ2UoYm91bmRhcmllcy5sZWZ0LCBib3VuZGFyaWVzLnJpZ2h0KTtcbiAgICAgICAgICAgIHBvcFthXS5wb3NpdGlvbi55ID0gcm5nLnJhbmRSYW5nZShib3VuZGFyaWVzLmJvdHRvbSwgYm91bmRhcmllcy50b3ApO1xuICAgICAgICAgICAgcG9wW2FdLm1lc2gucG9zaXRpb24ueCA9IHBvcFthXS5wb3NpdGlvbi54O1xuICAgICAgICAgICAgcG9wW2FdLm1lc2gucG9zaXRpb24ueSA9IHBvcFthXS5wb3NpdGlvbi55O1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBzY2VuZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBzY2VuZS5hZGQocG9wW2FdLm1lc2gpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChwb3BbYV0udHlwZSA9PT0gJ2dlb3NwYXRpYWwnKSB7XG4gICAgICAgICAgICBsb2NzLmZlYXR1cmVzW2FdID0gdHVyZi5wb2ludChbcm5nLnJhbmRSYW5nZSgtNzUuMTQ2NywgLTc1LjE4NjcpLCBybmcucmFuZFJhbmdlKDM5LjkyMDAsIDM5Ljk5MDApXSk7XG4gICAgICAgICAgICBwb3BbYV0ubG9jYXRpb24gPSBsb2NzLmZlYXR1cmVzW2FdO1xuICAgICAgICAgICAgcG9wW2FdLmxvY2F0aW9uLnByb3BlcnRpZXMuYWdlbnRSZWZJRCA9IHBvcFthXS5pZDtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgbGV0IGQgPSBvcHRpb25zW2tleV07XG4gICAgICAgICAgICBpZiAodHlwZW9mIGQuYXNzaWduID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcG9wW2FdW2tleV0gPSBkLmFzc2lnbihwb3BbYV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcG9wW2FdW2tleV0gPSBkLmFzc2lnbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICA7XG4gICAgICAgIGN1cnJlbnRBZ2VudElkKys7XG4gICAgfVxuICAgIGZvciAobGV0IGEgPSAwOyBhIDwgcG9wLmxlbmd0aDsgYSsrKSB7XG4gICAgICAgIGZvciAobGV0IGtleSBpbiBwb3BbYV0uc3RhdGVzKSB7XG4gICAgICAgICAgICBwb3BbYV1bcG9wW2FdLnN0YXRlc1trZXldXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFtwb3AsIGxvY3NdO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXRpbHMuanMubWFwIiwiaW1wb3J0IHsgZ2VuZXJhdGVVVUlEIH0gZnJvbSAnLi91dGlscyc7XG4vKipcbipRQ29tcG9uZW50cyBhcmUgdGhlIGJhc2UgY2xhc3MgZm9yIG1hbnkgbW9kZWwgY29tcG9uZW50cy5cbiovXG5leHBvcnQgY2xhc3MgUUNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IobmFtZSkge1xuICAgICAgICB0aGlzLmlkID0gZ2VuZXJhdGVVVUlEKCk7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMudGltZSA9IDA7XG4gICAgICAgIHRoaXMuaGlzdG9yeSA9IFtdO1xuICAgIH1cbiAgICAvKiogVGFrZSBvbmUgdGltZSBzdGVwIGZvcndhcmQgKG1vc3Qgc3ViY2xhc3NlcyBvdmVycmlkZSB0aGUgYmFzZSBtZXRob2QpXG4gICAgKiBAcGFyYW0gc3RlcCBzaXplIG9mIHRpbWUgc3RlcCAoaW4gZGF5cyBieSBjb252ZW50aW9uKVxuICAgICovXG4gICAgdXBkYXRlKGFnZW50LCBzdGVwKSB7XG4gICAgICAgIC8vc29tZXRoaW5nIHN1cGVyIVxuICAgIH1cbn1cblFDb21wb25lbnQuU1VDQ0VTUyA9IDE7XG5RQ29tcG9uZW50LkZBSUxFRCA9IDI7XG5RQ29tcG9uZW50LlJVTk5JTkcgPSAzO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9UUNvbXBvbmVudC5qcy5tYXAiLCJpbXBvcnQgeyBRQ29tcG9uZW50IH0gZnJvbSAnLi9RQ29tcG9uZW50JztcbmltcG9ydCB7IGdldE1hdGNoZXJTdHJpbmcgfSBmcm9tICcuL3V0aWxzJztcbi8qKlxuKiBCZWxpZWYgRGVzaXJlIEludGVudCBhZ2VudHMgYXJlIHNpbXBsZSBwbGFubmluZyBhZ2VudHMgd2l0aCBtb2R1bGFyIHBsYW5zIC8gZGVsaWJlcmF0aW9uIHByb2Nlc3Nlcy5cbiovXG5leHBvcnQgY2xhc3MgQkRJQWdlbnQgZXh0ZW5kcyBRQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBnb2FscyA9IFtdLCBwbGFucyA9IHt9LCBkYXRhID0gW10sIHBvbGljeVNlbGVjdG9yID0gQkRJQWdlbnQuc3RvY2hhc3RpY1NlbGVjdGlvbikge1xuICAgICAgICBzdXBlcihuYW1lKTtcbiAgICAgICAgdGhpcy5nb2FscyA9IGdvYWxzO1xuICAgICAgICB0aGlzLnBsYW5zID0gcGxhbnM7XG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgICAgIHRoaXMucG9saWN5U2VsZWN0b3IgPSBwb2xpY3lTZWxlY3RvcjtcbiAgICAgICAgdGhpcy5iZWxpZWZIaXN0b3J5ID0gW107XG4gICAgICAgIHRoaXMucGxhbkhpc3RvcnkgPSBbXTtcbiAgICB9XG4gICAgLyoqIFRha2Ugb25lIHRpbWUgc3RlcCBmb3J3YXJkLCB0YWtlIGluIGJlbGllZnMsIGRlbGliZXJhdGUsIGltcGxlbWVudCBwb2xpY3lcbiAgICAqIEBwYXJhbSBzdGVwIHNpemUgb2YgdGltZSBzdGVwIChpbiBkYXlzIGJ5IGNvbnZlbnRpb24pXG4gICAgKi9cbiAgICB1cGRhdGUoYWdlbnQsIHN0ZXApIHtcbiAgICAgICAgdmFyIHBvbGljeSwgaW50ZW50LCBldmFsdWF0aW9uO1xuICAgICAgICBwb2xpY3kgPSB0aGlzLnBvbGljeVNlbGVjdG9yKHRoaXMucGxhbnMsIHRoaXMucGxhbkhpc3RvcnksIGFnZW50KTtcbiAgICAgICAgaW50ZW50ID0gdGhpcy5wbGFuc1twb2xpY3ldO1xuICAgICAgICBpbnRlbnQoYWdlbnQsIHN0ZXApO1xuICAgICAgICBldmFsdWF0aW9uID0gdGhpcy5ldmFsdWF0ZUdvYWxzKGFnZW50KTtcbiAgICAgICAgdGhpcy5wbGFuSGlzdG9yeS5wdXNoKHsgdGltZTogdGhpcy50aW1lLCBpZDogYWdlbnQuaWQsIGludGVudGlvbjogcG9saWN5LCBnb2FsczogZXZhbHVhdGlvbi5hY2hpZXZlbWVudHMsIGJhcnJpZXJzOiBldmFsdWF0aW9uLmJhcnJpZXJzLCByOiBldmFsdWF0aW9uLnN1Y2Nlc3NlcyAvIHRoaXMuZ29hbHMubGVuZ3RoIH0pO1xuICAgIH1cbiAgICBldmFsdWF0ZUdvYWxzKGFnZW50KSB7XG4gICAgICAgIGxldCBhY2hpZXZlbWVudHMgPSBbXSwgYmFycmllcnMgPSBbXSwgc3VjY2Vzc2VzID0gMCwgYywgbWF0Y2hlcjtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmdvYWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjID0gdGhpcy5nb2Fsc1tpXS5jb25kaXRpb247XG4gICAgICAgICAgICBpZiAodHlwZW9mIGMuZGF0YSA9PT0gJ3VuZGVmaW5lZCcgfHwgYy5kYXRhID09PSBcImFnZW50XCIpIHtcbiAgICAgICAgICAgICAgICBjLmRhdGEgPSBhZ2VudDsgLy9pZiBubyBkYXRhc291cmNlIGlzIHNldCwgdXNlIHRoZSBhZ2VudFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWNoaWV2ZW1lbnRzW2ldID0gdGhpcy5nb2Fsc1tpXS50ZW1wb3JhbChjLmNoZWNrKGMuZGF0YVtjLmtleV0sIGMudmFsdWUpKTtcbiAgICAgICAgICAgIGlmIChhY2hpZXZlbWVudHNbaV0gPT09IEJESUFnZW50LlNVQ0NFU1MpIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzZXMgKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG1hdGNoZXIgPSBnZXRNYXRjaGVyU3RyaW5nKGMuY2hlY2spO1xuICAgICAgICAgICAgICAgIGJhcnJpZXJzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogYy5sYWJlbCxcbiAgICAgICAgICAgICAgICAgICAga2V5OiBjLmtleSxcbiAgICAgICAgICAgICAgICAgICAgY2hlY2s6IG1hdGNoZXIsXG4gICAgICAgICAgICAgICAgICAgIGFjdHVhbDogYy5kYXRhW2Mua2V5XSxcbiAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IGMudmFsdWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdWNjZXNzZXM6IHN1Y2Nlc3NlcywgYmFycmllcnM6IGJhcnJpZXJzLCBhY2hpZXZlbWVudHM6IGFjaGlldmVtZW50cyB9O1xuICAgIH1cbiAgICAvL2dvb2QgZm9yIHRyYWluaW5nXG4gICAgc3RhdGljIHN0b2NoYXN0aWNTZWxlY3Rpb24ocGxhbnMsIHBsYW5IaXN0b3J5LCBhZ2VudCkge1xuICAgICAgICB2YXIgcG9saWN5LCBzY29yZSwgbWF4ID0gMDtcbiAgICAgICAgZm9yICh2YXIgcGxhbiBpbiBwbGFucykge1xuICAgICAgICAgICAgc2NvcmUgPSBNYXRoLnJhbmRvbSgpO1xuICAgICAgICAgICAgaWYgKHNjb3JlID49IG1heCkge1xuICAgICAgICAgICAgICAgIG1heCA9IHNjb3JlO1xuICAgICAgICAgICAgICAgIHBvbGljeSA9IHBsYW47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBvbGljeTtcbiAgICB9XG59XG5CRElBZ2VudC5sYXp5UG9saWN5U2VsZWN0aW9uID0gZnVuY3Rpb24gKHBsYW5zLCBwbGFuSGlzdG9yeSwgYWdlbnQpIHtcbiAgICB2YXIgb3B0aW9ucywgc2VsZWN0aW9uO1xuICAgIGlmICh0aGlzLnRpbWUgPiAwKSB7XG4gICAgICAgIG9wdGlvbnMgPSBPYmplY3Qua2V5cyhwbGFucyk7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zLnNsaWNlKDEsIG9wdGlvbnMubGVuZ3RoKTtcbiAgICAgICAgc2VsZWN0aW9uID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogb3B0aW9ucy5sZW5ndGgpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgb3B0aW9ucyA9IE9iamVjdC5rZXlzKHBsYW5zKTtcbiAgICAgICAgc2VsZWN0aW9uID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIG9wdGlvbnNbc2VsZWN0aW9uXTtcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1iZGkuanMubWFwIiwiaW1wb3J0IHsgUUNvbXBvbmVudCB9IGZyb20gJy4vUUNvbXBvbmVudCc7XG5pbXBvcnQgeyBnZW5lcmF0ZVVVSUQgfSBmcm9tICcuL3V0aWxzJztcbi8qKlxuKiBCZWhhdmlvciBUcmVlXG4qKi9cbmV4cG9ydCBjbGFzcyBCZWhhdmlvclRyZWUgZXh0ZW5kcyBRQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCByb290LCBkYXRhKSB7XG4gICAgICAgIHN1cGVyKG5hbWUpO1xuICAgICAgICB0aGlzLnJvb3QgPSByb290O1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgICAgICB0aGlzLnJlc3VsdHMgPSBbXTtcbiAgICB9XG4gICAgc3RhdGljIHRpY2sobm9kZSwgYWdlbnQpIHtcbiAgICAgICAgdmFyIHN0YXRlID0gbm9kZS5vcGVyYXRlKGFnZW50KTtcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH1cbiAgICB1cGRhdGUoYWdlbnQsIHN0ZXApIHtcbiAgICAgICAgdmFyIHN0YXRlO1xuICAgICAgICBhZ2VudC5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB3aGlsZSAoYWdlbnQuYWN0aXZlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBzdGF0ZSA9IEJlaGF2aW9yVHJlZS50aWNrKHRoaXMucm9vdCwgYWdlbnQpO1xuICAgICAgICAgICAgYWdlbnQudGltZSA9IHRoaXMudGltZTtcbiAgICAgICAgICAgIGFnZW50LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgQlROb2RlIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lKSB7XG4gICAgICAgIHRoaXMuaWQgPSBnZW5lcmF0ZVVVSUQoKTtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgQlRDb250cm9sTm9kZSBleHRlbmRzIEJUTm9kZSB7XG4gICAgY29uc3RydWN0b3IobmFtZSwgY2hpbGRyZW4pIHtcbiAgICAgICAgc3VwZXIobmFtZSk7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgQlRSb290IGV4dGVuZHMgQlRDb250cm9sTm9kZSB7XG4gICAgY29uc3RydWN0b3IobmFtZSwgY2hpbGRyZW4pIHtcbiAgICAgICAgc3VwZXIobmFtZSwgY2hpbGRyZW4pO1xuICAgICAgICB0aGlzLnR5cGUgPSBcInJvb3RcIjtcbiAgICAgICAgdGhpcy5vcGVyYXRlID0gZnVuY3Rpb24gKGFnZW50KSB7XG4gICAgICAgICAgICB2YXIgc3RhdGUgPSBCZWhhdmlvclRyZWUudGljayh0aGlzLmNoaWxkcmVuWzBdLCBhZ2VudCk7XG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgICAgIH07XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEJUU2VsZWN0b3IgZXh0ZW5kcyBCVENvbnRyb2xOb2RlIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBjaGlsZHJlbikge1xuICAgICAgICBzdXBlcihuYW1lLCBjaGlsZHJlbik7XG4gICAgICAgIHRoaXMudHlwZSA9IFwic2VsZWN0b3JcIjtcbiAgICAgICAgdGhpcy5vcGVyYXRlID0gZnVuY3Rpb24gKGFnZW50KSB7XG4gICAgICAgICAgICB2YXIgY2hpbGRTdGF0ZTtcbiAgICAgICAgICAgIGZvciAodmFyIGNoaWxkIGluIHRoaXMuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBjaGlsZFN0YXRlID0gQmVoYXZpb3JUcmVlLnRpY2sodGhpcy5jaGlsZHJlbltjaGlsZF0sIGFnZW50KTtcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRTdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLlJVTk5JTkcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5SVU5OSU5HO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRTdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLlNVQ0NFU1MpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5TVUNDRVNTO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBCZWhhdmlvclRyZWUuRkFJTEVEO1xuICAgICAgICB9O1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBCVFNlcXVlbmNlIGV4dGVuZHMgQlRDb250cm9sTm9kZSB7XG4gICAgY29uc3RydWN0b3IobmFtZSwgY2hpbGRyZW4pIHtcbiAgICAgICAgc3VwZXIobmFtZSwgY2hpbGRyZW4pO1xuICAgICAgICB0aGlzLnR5cGUgPSBcInNlcXVlbmNlXCI7XG4gICAgICAgIHRoaXMub3BlcmF0ZSA9IGZ1bmN0aW9uIChhZ2VudCkge1xuICAgICAgICAgICAgdmFyIGNoaWxkU3RhdGU7XG4gICAgICAgICAgICBmb3IgKHZhciBjaGlsZCBpbiB0aGlzLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgY2hpbGRTdGF0ZSA9IEJlaGF2aW9yVHJlZS50aWNrKHRoaXMuY2hpbGRyZW5bY2hpbGRdLCBhZ2VudCk7XG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5SVU5OSU5HKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBCZWhhdmlvclRyZWUuUlVOTklORztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5GQUlMRUQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5GQUlMRUQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5TVUNDRVNTO1xuICAgICAgICB9O1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBCVFBhcmFsbGVsIGV4dGVuZHMgQlRDb250cm9sTm9kZSB7XG4gICAgY29uc3RydWN0b3IobmFtZSwgY2hpbGRyZW4sIHN1Y2Nlc3Nlcykge1xuICAgICAgICBzdXBlcihuYW1lLCBjaGlsZHJlbik7XG4gICAgICAgIHRoaXMudHlwZSA9IFwicGFyYWxsZWxcIjtcbiAgICAgICAgdGhpcy5zdWNjZXNzZXMgPSBzdWNjZXNzZXM7XG4gICAgICAgIHRoaXMub3BlcmF0ZSA9IGZ1bmN0aW9uIChhZ2VudCkge1xuICAgICAgICAgICAgdmFyIHN1Y2NlZWRlZCA9IFtdLCBmYWlsdXJlcyA9IFtdLCBjaGlsZFN0YXRlLCBtYWpvcml0eTtcbiAgICAgICAgICAgIGZvciAodmFyIGNoaWxkIGluIHRoaXMuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBjaGlsZFN0YXRlID0gQmVoYXZpb3JUcmVlLnRpY2sodGhpcy5jaGlsZHJlbltjaGlsZF0sIGFnZW50KTtcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRTdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLlNVQ0NFU1MpIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VlZGVkLnB1c2goY2hpbGRTdGF0ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5GQUlMRUQpIHtcbiAgICAgICAgICAgICAgICAgICAgZmFpbHVyZXMucHVzaChjaGlsZFN0YXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY2hpbGRTdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLlJVTk5JTkcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5SVU5OSU5HO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdWNjZWVkZWQubGVuZ3RoID49IHRoaXMuc3VjY2Vzc2VzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5TVUNDRVNTO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5GQUlMRUQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEJUQ29uZGl0aW9uIGV4dGVuZHMgQlROb2RlIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBjb25kaXRpb24pIHtcbiAgICAgICAgc3VwZXIobmFtZSk7XG4gICAgICAgIHRoaXMudHlwZSA9IFwiY29uZGl0aW9uXCI7XG4gICAgICAgIHRoaXMuY29uZGl0aW9uID0gY29uZGl0aW9uO1xuICAgICAgICB0aGlzLm9wZXJhdGUgPSBmdW5jdGlvbiAoYWdlbnQpIHtcbiAgICAgICAgICAgIHZhciBzdGF0ZTtcbiAgICAgICAgICAgIHN0YXRlID0gY29uZGl0aW9uLmNoZWNrKGFnZW50W2NvbmRpdGlvbi5rZXldLCBjb25kaXRpb24udmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xuICAgICAgICB9O1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBCVEFjdGlvbiBleHRlbmRzIEJUTm9kZSB7XG4gICAgY29uc3RydWN0b3IobmFtZSwgY29uZGl0aW9uLCBhY3Rpb24pIHtcbiAgICAgICAgc3VwZXIobmFtZSk7XG4gICAgICAgIHRoaXMudHlwZSA9IFwiYWN0aW9uXCI7XG4gICAgICAgIHRoaXMuY29uZGl0aW9uID0gY29uZGl0aW9uO1xuICAgICAgICB0aGlzLmFjdGlvbiA9IGFjdGlvbjtcbiAgICAgICAgdGhpcy5vcGVyYXRlID0gZnVuY3Rpb24gKGFnZW50KSB7XG4gICAgICAgICAgICB2YXIgc3RhdGU7XG4gICAgICAgICAgICBzdGF0ZSA9IGNvbmRpdGlvbi5jaGVjayhhZ2VudFtjb25kaXRpb24ua2V5XSwgY29uZGl0aW9uLnZhbHVlKTtcbiAgICAgICAgICAgIGlmIChzdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLlNVQ0NFU1MpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGlvbihhZ2VudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgICAgIH07XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YmVoYXZpb3JUcmVlLmpzLm1hcCIsImltcG9ydCB7IGdlbmVyYXRlVVVJRCB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgUUNvbXBvbmVudCB9IGZyb20gJy4vUUNvbXBvbmVudCc7XG5leHBvcnQgY2xhc3MgQ29tcGFydG1lbnRNb2RlbCBleHRlbmRzIFFDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNvbXBhcnRtZW50cywgZGF0YSkge1xuICAgICAgICBzdXBlcihuYW1lKTtcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTsgLy9hbiBhcnJheSBvZiBQYXRjaGVzLiBFYWNoIHBhdGNoIGNvbnRhaW5zIGFuIGFycmF5IG9mIGNvbXBhcnRtZW50cyBpbiBvcGVyYXRpb25hbCBvcmRlclxuICAgICAgICB0aGlzLnRvdGFsUG9wID0gMDtcbiAgICAgICAgdGhpcy5jb21wYXJ0bWVudHMgPSBjb21wYXJ0bWVudHM7XG4gICAgICAgIHRoaXMuaGlzdG9yeSA9IFtdO1xuICAgICAgICBmb3IgKGxldCBkID0gMDsgZCA8IHRoaXMuZGF0YS5sZW5ndGg7IGQrKykge1xuICAgICAgICAgICAgdGhpcy50b3RhbFBvcCArPSB0aGlzLmRhdGFbZF0udG90YWxQb3A7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fdG9sZXJhbmNlID0gMWUtOTsgLy9tb2RlbCBlcnIgdG9sZXJhbmNlXG4gICAgfVxuICAgIHVwZGF0ZShwYXRjaCwgc3RlcCkge1xuICAgICAgICBsZXQgdGVtcF9wb3AgPSB7fSwgdGVtcF9kID0ge30sIG5leHRfZCA9IHt9LCBsdGUgPSB7fSwgZXJyID0gMSwgbmV3U3RlcDtcbiAgICAgICAgZm9yIChsZXQgYyBpbiB0aGlzLmNvbXBhcnRtZW50cykge1xuICAgICAgICAgICAgcGF0Y2guZHBvcHNbY10gPSB0aGlzLmNvbXBhcnRtZW50c1tjXS5vcGVyYXRpb24ocGF0Y2gucG9wdWxhdGlvbnMsIHN0ZXApO1xuICAgICAgICB9XG4gICAgICAgIC8vZmlyc3Qgb3JkZXIgKEV1bGVyKVxuICAgICAgICBmb3IgKGxldCBjIGluIHRoaXMuY29tcGFydG1lbnRzKSB7XG4gICAgICAgICAgICB0ZW1wX3BvcFtjXSA9IHBhdGNoLnBvcHVsYXRpb25zW2NdO1xuICAgICAgICAgICAgdGVtcF9kW2NdID0gcGF0Y2guZHBvcHNbY107XG4gICAgICAgICAgICBwYXRjaC5wb3B1bGF0aW9uc1tjXSA9IHRlbXBfcG9wW2NdICsgdGVtcF9kW2NdO1xuICAgICAgICB9XG4gICAgICAgIC8vc2Vjb25kIG9yZGVyIChIZXVucylcbiAgICAgICAgcGF0Y2gudG90YWxQb3AgPSAwO1xuICAgICAgICBmb3IgKGxldCBjIGluIHRoaXMuY29tcGFydG1lbnRzKSB7XG4gICAgICAgICAgICBuZXh0X2RbY10gPSB0aGlzLmNvbXBhcnRtZW50c1tjXS5vcGVyYXRpb24ocGF0Y2gucG9wdWxhdGlvbnMsIHN0ZXApO1xuICAgICAgICAgICAgcGF0Y2gucG9wdWxhdGlvbnNbY10gPSB0ZW1wX3BvcFtjXSArICgwLjUgKiAodGVtcF9kW2NdICsgbmV4dF9kW2NdKSk7XG4gICAgICAgICAgICBwYXRjaC50b3RhbFBvcCArPSBwYXRjaC5wb3B1bGF0aW9uc1tjXTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBDb21wYXJ0bWVudCB7XG4gICAgY29uc3RydWN0b3IobmFtZSwgcG9wLCBvcGVyYXRpb24pIHtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5vcGVyYXRpb24gPSBvcGVyYXRpb24gfHwgbnVsbDtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgUGF0Y2gge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNvbXBhcnRtZW50cywgcG9wdWxhdGlvbnMpIHtcbiAgICAgICAgdGhpcy5wb3B1bGF0aW9ucyA9IHt9O1xuICAgICAgICB0aGlzLmRwb3BzID0ge307XG4gICAgICAgIHRoaXMuaW5pdGlhbFBvcCA9IHt9O1xuICAgICAgICB0aGlzLmlkID0gZ2VuZXJhdGVVVUlEKCk7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuZHBvcHMgPSB7fTtcbiAgICAgICAgdGhpcy5jb21wYXJ0bWVudHMgPSBjb21wYXJ0bWVudHM7XG4gICAgICAgIHRoaXMudG90YWxQb3AgPSAwO1xuICAgICAgICBmb3IgKGxldCBjIGluIHBvcHVsYXRpb25zKSB7XG4gICAgICAgICAgICB0aGlzLmRwb3BzW2NdID0gMDtcbiAgICAgICAgICAgIHRoaXMuaW5pdGlhbFBvcFtjXSA9IHBvcHVsYXRpb25zW2NdO1xuICAgICAgICAgICAgdGhpcy5wb3B1bGF0aW9uc1tjXSA9IHBvcHVsYXRpb25zW2NdO1xuICAgICAgICAgICAgdGhpcy50b3RhbFBvcCArPSB0aGlzLnBvcHVsYXRpb25zW2NdO1xuICAgICAgICB9XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29tcGFydG1lbnQuanMubWFwIiwiaW1wb3J0IHsgZ2VuZXJhdGVVVUlEIH0gZnJvbSAnLi91dGlscyc7XG5leHBvcnQgY2xhc3MgQ29udGFjdFBhdGNoIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBjYXBhY2l0eSkge1xuICAgICAgICB0aGlzLmlkID0gZ2VuZXJhdGVVVUlEKCk7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuY2FwYWNpdHkgPSBjYXBhY2l0eTtcbiAgICAgICAgdGhpcy5wb3AgPSAwO1xuICAgICAgICB0aGlzLm1lbWJlcnMgPSB7fTtcbiAgICB9XG4gICAgc3RhdGljIGRlZmF1bHRGcmVxRihhLCBiKSB7XG4gICAgICAgIHZhciB2YWwgPSAoNTAgLSBNYXRoLmFicyhhLmFnZSAtIGIuYWdlKSkgLyAxMDA7XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICAgIHN0YXRpYyBkZWZhdWx0Q29udGFjdEYoYSwgdGltZSkge1xuICAgICAgICB2YXIgYyA9IDIgKiBNYXRoLnNpbih0aW1lKSArIGE7XG4gICAgICAgIGlmIChjID49IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGFzc2lnbihhZ2VudCwgY29udGFjdFZhbHVlRnVuYykge1xuICAgICAgICB2YXIgY29udGFjdFZhbHVlO1xuICAgICAgICBjb250YWN0VmFsdWVGdW5jID0gY29udGFjdFZhbHVlRnVuYyB8fCBDb250YWN0UGF0Y2guZGVmYXVsdEZyZXFGO1xuICAgICAgICBpZiAodGhpcy5wb3AgPCB0aGlzLmNhcGFjaXR5KSB7XG4gICAgICAgICAgICB0aGlzLm1lbWJlcnNbYWdlbnQuaWRdID0geyBwcm9wZXJ0aWVzOiBhZ2VudCB9O1xuICAgICAgICAgICAgZm9yIChsZXQgb3RoZXIgaW4gdGhpcy5tZW1iZXJzKSB7XG4gICAgICAgICAgICAgICAgbGV0IGlkID0gcGFyc2VJbnQob3RoZXIpO1xuICAgICAgICAgICAgICAgIGlmIChvdGhlciAhPT0gYWdlbnQuaWQgJiYgIWlzTmFOKGlkKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250YWN0VmFsdWUgPSBjb250YWN0VmFsdWVGdW5jKHRoaXMubWVtYmVyc1tpZF0ucHJvcGVydGllcywgYWdlbnQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbWJlcnNbYWdlbnQuaWRdW2lkXSA9IGNvbnRhY3RWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW1iZXJzW2lkXVthZ2VudC5pZF0gPSBjb250YWN0VmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wb3ArKztcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmlkO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZW5jb3VudGVycyhhZ2VudCwgcHJlY29uZGl0aW9uLCBjb250YWN0RnVuYywgcmVzdWx0S2V5LCBzYXZlID0gZmFsc2UpIHtcbiAgICAgICAgY29udGFjdEZ1bmMgPSBjb250YWN0RnVuYyB8fCBDb250YWN0UGF0Y2guZGVmYXVsdENvbnRhY3RGO1xuICAgICAgICBsZXQgY29udGFjdFZhbDtcbiAgICAgICAgZm9yICh2YXIgY29udGFjdCBpbiB0aGlzLm1lbWJlcnMpIHtcbiAgICAgICAgICAgIGlmIChwcmVjb25kaXRpb24ua2V5ID09PSAnc3RhdGVzJykge1xuICAgICAgICAgICAgICAgIGNvbnRhY3RWYWwgPSBKU09OLnN0cmluZ2lmeSh0aGlzLm1lbWJlcnNbY29udGFjdF0ucHJvcGVydGllc1twcmVjb25kaXRpb24ua2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb250YWN0VmFsID0gdGhpcy5tZW1iZXJzW2NvbnRhY3RdLnByb3BlcnRpZXNbcHJlY29uZGl0aW9uLmtleV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocHJlY29uZGl0aW9uLmNoZWNrKHRoaXMubWVtYmVyc1tjb250YWN0XS5wcm9wZXJ0aWVzW3ByZWNvbmRpdGlvbi5rZXldLCBwcmVjb25kaXRpb24udmFsdWUpICYmIE51bWJlcihjb250YWN0KSAhPT0gYWdlbnQuaWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgb2xkVmFsID0gdGhpcy5tZW1iZXJzW2NvbnRhY3RdLnByb3BlcnRpZXNbcmVzdWx0S2V5XTtcbiAgICAgICAgICAgICAgICB2YXIgbmV3VmFsID0gY29udGFjdEZ1bmModGhpcy5tZW1iZXJzW2NvbnRhY3RdLCBhZ2VudCk7XG4gICAgICAgICAgICAgICAgaWYgKG9sZFZhbCAhPT0gbmV3VmFsICYmIHNhdmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW1iZXJzW2NvbnRhY3RdLnByb3BlcnRpZXNbcmVzdWx0S2V5XSA9IG5ld1ZhbDtcbiAgICAgICAgICAgICAgICAgICAgQ29udGFjdFBhdGNoLldJV0FycmF5LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgcGF0Y2hJRDogdGhpcy5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZmVjdGVkOiBjb250YWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5mZWN0ZWRBZ2U6IHRoaXMubWVtYmVyc1tjb250YWN0XS5wcm9wZXJ0aWVzLmFnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdDogdGhpcy5tZW1iZXJzW2NvbnRhY3RdLnByb3BlcnRpZXNbcmVzdWx0S2V5XSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdEtleTogcmVzdWx0S2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgYnk6IGFnZW50LmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgYnlBZ2U6IGFnZW50LmFnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6IGFnZW50LnRpbWVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuQ29udGFjdFBhdGNoLldJV0FycmF5ID0gW107XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb250YWN0UGF0Y2guanMubWFwIiwiaW1wb3J0IHsgc2h1ZmZsZSB9IGZyb20gJy4vdXRpbHMnO1xuLyoqXG4qRW52aXJvbm1lbnRzIGFyZSB0aGUgZXhlY3V0YWJsZSBlbnZpcm9ubWVudCBjb250YWluaW5nIHRoZSBtb2RlbCBjb21wb25lbnRzLFxuKnNoYXJlZCByZXNvdXJjZXMsIGFuZCBzY2hlZHVsZXIuXG4qL1xuZXhwb3J0IGNsYXNzIEVudmlyb25tZW50IHtcbiAgICBjb25zdHJ1Y3RvcihyZXNvdXJjZXMgPSBbXSwgZmFjaWxpdGllcyA9IFtdLCBldmVudHNRdWV1ZSA9IFtdLCBhY3RpdmF0aW9uVHlwZSA9ICdyYW5kb20nLCBybmcgPSBNYXRoKSB7XG4gICAgICAgIHRoaXMudGltZSA9IDA7XG4gICAgICAgIHRoaXMudGltZU9mRGF5ID0gMDtcbiAgICAgICAgdGhpcy5tb2RlbHMgPSBbXTtcbiAgICAgICAgdGhpcy5oaXN0b3J5ID0gW107XG4gICAgICAgIHRoaXMuYWdlbnRzID0gW107XG4gICAgICAgIHRoaXMucmVzb3VyY2VzID0gcmVzb3VyY2VzO1xuICAgICAgICB0aGlzLmZhY2lsaXRpZXMgPSBmYWNpbGl0aWVzO1xuICAgICAgICB0aGlzLmV2ZW50c1F1ZXVlID0gZXZlbnRzUXVldWU7XG4gICAgICAgIHRoaXMuYWN0aXZhdGlvblR5cGUgPSBhY3RpdmF0aW9uVHlwZTtcbiAgICAgICAgdGhpcy5ybmcgPSBybmc7XG4gICAgICAgIHRoaXMuX2FnZW50SW5kZXggPSB7fTtcbiAgICB9XG4gICAgLyoqIEFkZCBhIG1vZGVsIGNvbXBvbmVudHMgZnJvbSB0aGUgZW52aXJvbm1lbnRcbiAgICAqIEBwYXJhbSBjb21wb25lbnQgdGhlIG1vZGVsIGNvbXBvbmVudCBvYmplY3QgdG8gYmUgYWRkZWQgdG8gdGhlIGVudmlyb25tZW50LlxuICAgICovXG4gICAgYWRkKGNvbXBvbmVudCkge1xuICAgICAgICB0aGlzLm1vZGVscy5wdXNoKGNvbXBvbmVudCk7XG4gICAgfVxuICAgIC8qKiBSZW1vdmUgYSBtb2RlbCBjb21wb25lbnRzIGZyb20gdGhlIGVudmlyb25tZW50IGJ5IGlkXG4gICAgKiBAcGFyYW0gaWQgVVVJRCBvZiB0aGUgY29tcG9uZW50IHRvIGJlIHJlbW92ZWQuXG4gICAgKi9cbiAgICByZW1vdmUoaWQpIHtcbiAgICAgICAgdmFyIGRlbGV0ZUluZGV4LCBMID0gdGhpcy5hZ2VudHMubGVuZ3RoO1xuICAgICAgICB0aGlzLm1vZGVscy5mb3JFYWNoKGZ1bmN0aW9uIChjLCBpbmRleCkgeyBpZiAoYy5pZCA9PT0gaWQpIHtcbiAgICAgICAgICAgIGRlbGV0ZUluZGV4ID0gaW5kZXg7XG4gICAgICAgIH0gfSk7XG4gICAgICAgIHdoaWxlIChMID4gMCAmJiB0aGlzLmFnZW50cy5sZW5ndGggPj0gMCkge1xuICAgICAgICAgICAgTC0tO1xuICAgICAgICAgICAgaWYgKHRoaXMuYWdlbnRzW0xdLm1vZGVsSW5kZXggPT09IGRlbGV0ZUluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZ2VudHMuc3BsaWNlKEwsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMubW9kZWxzLnNwbGljZShkZWxldGVJbmRleCwgMSk7XG4gICAgfVxuICAgIC8qKiBSdW4gYWxsIGVudmlyb25tZW50IG1vZGVsIGNvbXBvbmVudHMgZnJvbSB0PTAgdW50aWwgdD11bnRpbCB1c2luZyB0aW1lIHN0ZXAgPSBzdGVwXG4gICAgKiBAcGFyYW0gc3RlcCB0aGUgc3RlcCBzaXplXG4gICAgKiBAcGFyYW0gdW50aWwgdGhlIGVuZCB0aW1lXG4gICAgKiBAcGFyYW0gc2F2ZUludGVydmFsIHNhdmUgZXZlcnkgJ3gnIHN0ZXBzXG4gICAgKi9cbiAgICBydW4oc3RlcCwgdW50aWwsIHNhdmVJbnRlcnZhbCkge1xuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICAgICAgd2hpbGUgKHRoaXMudGltZSA8PSB1bnRpbCkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGUoc3RlcCk7XG4gICAgICAgICAgICBsZXQgcmVtID0gKHRoaXMudGltZSAlIHNhdmVJbnRlcnZhbCk7XG4gICAgICAgICAgICBpZiAocmVtIDwgc3RlcCkge1xuICAgICAgICAgICAgICAgIGxldCBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmFnZW50cykpO1xuICAgICAgICAgICAgICAgIHRoaXMuaGlzdG9yeSA9IHRoaXMuaGlzdG9yeS5jb25jYXQoY29weSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnRpbWUgKz0gc3RlcDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKiogQXNzaWduIGFsbCBhZ2VudHMgdG8gYXBwcm9wcmlhdGUgbW9kZWxzXG4gICAgKi9cbiAgICBpbml0KCkge1xuICAgICAgICB0aGlzLl9hZ2VudEluZGV4ID0ge307XG4gICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgdGhpcy5tb2RlbHMubGVuZ3RoOyBjKyspIHtcbiAgICAgICAgICAgIGxldCBhbHJlYWR5SW4gPSBbXTtcbiAgICAgICAgICAgIC8vYXNzaWduIGVhY2ggYWdlbnQgbW9kZWwgaW5kZXhlcyB0byBoYW5kbGUgYWdlbnRzIGFzc2lnbmVkIHRvIG11bHRpcGxlIG1vZGVsc1xuICAgICAgICAgICAgZm9yIChsZXQgZCA9IDA7IGQgPCB0aGlzLm1vZGVsc1tjXS5kYXRhLmxlbmd0aDsgZCsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IGlkID0gdGhpcy5tb2RlbHNbY10uZGF0YVtkXS5pZDtcbiAgICAgICAgICAgICAgICBpZiAoaWQgaW4gdGhpcy5fYWdlbnRJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAvL3RoaXMgYWdlbnQgYmVsb25ncyB0byBtdWx0aXBsZSBtb2RlbHMuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZWxzW2NdLmRhdGFbZF0ubW9kZWxzLnB1c2godGhpcy5tb2RlbHNbY10ubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZWxzW2NdLmRhdGFbZF0ubW9kZWxJbmRleGVzLnB1c2goYyk7XG4gICAgICAgICAgICAgICAgICAgIGFscmVhZHlJbi5wdXNoKGlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcyBhZ2VudCBiZWxvbmdzIHRvIG9ubHkgb25lIG1vZGVsIHNvIGZhci5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWdlbnRJbmRleFtpZF0gPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVsc1tjXS5kYXRhW2RdLm1vZGVscyA9IFt0aGlzLm1vZGVsc1tjXS5uYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlbHNbY10uZGF0YVtkXS5tb2RlbEluZGV4ZXMgPSBbY107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9lbGltaW5hdGUgYW55IGR1cGxpY2F0ZSBhZ2VudHMgYnkgaWRcbiAgICAgICAgICAgIHRoaXMubW9kZWxzW2NdLmRhdGEgPSB0aGlzLm1vZGVsc1tjXS5kYXRhLmZpbHRlcigoZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChhbHJlYWR5SW4uaW5kZXhPZihkLmlkKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy9jb25jYXQgdGhlIHJlc3VsdHNcbiAgICAgICAgICAgIHRoaXMuYWdlbnRzID0gdGhpcy5hZ2VudHMuY29uY2F0KHRoaXMubW9kZWxzW2NdLmRhdGEpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKiBVcGRhdGUgZWFjaCBtb2RlbCBjb21wZW5lbnQgb25lIHRpbWUgc3RlcCBmb3J3YXJkXG4gICAgKiBAcGFyYW0gc3RlcCB0aGUgc3RlcCBzaXplXG4gICAgKi9cbiAgICB1cGRhdGUoc3RlcCkge1xuICAgICAgICB2YXIgaW5kZXggPSAwO1xuICAgICAgICB3aGlsZSAoaW5kZXggPCB0aGlzLmV2ZW50c1F1ZXVlLmxlbmd0aCAmJiB0aGlzLmV2ZW50c1F1ZXVlW2luZGV4XS5hdCA8PSB0aGlzLnRpbWUpIHtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzUXVldWVbaW5kZXhdLnRyaWdnZXIoKTtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzUXVldWVbaW5kZXhdLnRyaWdnZXJlZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAodGhpcy5ldmVudHNRdWV1ZVtpbmRleF0udW50aWwgPD0gdGhpcy50aW1lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ldmVudHNRdWV1ZS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5hY3RpdmF0aW9uVHlwZSA9PT0gXCJyYW5kb21cIikge1xuICAgICAgICAgICAgc2h1ZmZsZSh0aGlzLmFnZW50cywgdGhpcy5ybmcpO1xuICAgICAgICAgICAgdGhpcy5hZ2VudHMuZm9yRWFjaCgoYWdlbnQsIGkpID0+IHsgdGhpcy5fYWdlbnRJbmRleFthZ2VudC5pZF0gPSBpOyB9KTsgLy8gcmVhc3NpZ24gYWdlbnRcbiAgICAgICAgICAgIHRoaXMuYWdlbnRzLmZvckVhY2goKGFnZW50LCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgYWdlbnQubW9kZWxJbmRleGVzLmZvckVhY2goKG1vZGVsSW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlbHNbbW9kZWxJbmRleF0udXBkYXRlKGFnZW50LCBzdGVwKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBhZ2VudC50aW1lID0gYWdlbnQudGltZSArIHN0ZXAgfHwgMDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmFjdGl2YXRpb25UeXBlID09PSBcInBhcmFsbGVsXCIpIHtcbiAgICAgICAgICAgIGxldCB0ZW1wQWdlbnRzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmFnZW50cykpO1xuICAgICAgICAgICAgdGVtcEFnZW50cy5mb3JFYWNoKChhZ2VudCkgPT4ge1xuICAgICAgICAgICAgICAgIGFnZW50Lm1vZGVsSW5kZXhlcy5mb3JFYWNoKChtb2RlbEluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZWxzW21vZGVsSW5kZXhdLnVwZGF0ZShhZ2VudCwgc3RlcCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuYWdlbnRzLmZvckVhY2goKGFnZW50LCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgYWdlbnQubW9kZWxJbmRleGVzLmZvckVhY2goKG1vZGVsSW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlbHNbbW9kZWxJbmRleF0uYXBwbHkoYWdlbnQsIHRlbXBBZ2VudHNbaV0sIHN0ZXApO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGFnZW50LnRpbWUgPSBhZ2VudC50aW1lICsgc3RlcCB8fCAwO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqIEZvcm1hdCBhIHRpbWUgb2YgZGF5LiBDdXJyZW50IHRpbWUgJSAxLlxuICAgICpcbiAgICAqL1xuICAgIGZvcm1hdFRpbWUoKSB7XG4gICAgICAgIHRoaXMudGltZU9mRGF5ID0gdGhpcy50aW1lICUgMTtcbiAgICB9XG4gICAgLyoqIEdldHMgYWdlbnQgYnkgaWQuIEEgdXRpbGl0eSBmdW5jdGlvbiB0aGF0XG4gICAgKlxuICAgICovXG4gICAgZ2V0QWdlbnRCeUlkKGlkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFnZW50c1t0aGlzLl9hZ2VudEluZGV4W2lkXV07XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZW52aXJvbm1lbnQuanMubWFwIiwiZXhwb3J0IGNsYXNzIEVwaSB7XG4gICAgc3RhdGljIHByZXZhbGVuY2UoY2FzZXMsIHRvdGFsKSB7XG4gICAgICAgIHZhciBwcmV2ID0gY2FzZXMgLyB0b3RhbDtcbiAgICAgICAgcmV0dXJuIHByZXY7XG4gICAgfVxuICAgIHN0YXRpYyByaXNrRGlmZmVyZW5jZSh0YWJsZSkge1xuICAgICAgICB2YXIgcmQgPSB0YWJsZS5hIC8gKHRhYmxlLmEgKyB0YWJsZS5iKSAtIHRhYmxlLmMgLyAodGFibGUuYyArIHRhYmxlLmQpO1xuICAgICAgICByZXR1cm4gcmQ7XG4gICAgfVxuICAgIHN0YXRpYyByaXNrUmF0aW8odGFibGUpIHtcbiAgICAgICAgdmFyIHJyYXRpbyA9ICh0YWJsZS5hIC8gKHRhYmxlLmEgKyB0YWJsZS5iKSkgLyAodGFibGUuYyAvICh0YWJsZS5jICsgdGFibGUuZCkpO1xuICAgICAgICByZXR1cm4gcnJhdGlvO1xuICAgIH1cbiAgICBzdGF0aWMgb2Rkc1JhdGlvKHRhYmxlKSB7XG4gICAgICAgIHZhciBvciA9ICh0YWJsZS5hICogdGFibGUuZCkgLyAodGFibGUuYiAqIHRhYmxlLmMpO1xuICAgICAgICByZXR1cm4gb3I7XG4gICAgfVxuICAgIHN0YXRpYyBJUEYyRChyb3dUb3RhbHMsIGNvbFRvdGFscywgaXRlcmF0aW9ucywgc2VlZHMpIHtcbiAgICAgICAgdmFyIHJUID0gMCwgY1QgPSAwLCBzZWVkQ2VsbHMgPSBzZWVkcztcbiAgICAgICAgcm93VG90YWxzLmZvckVhY2goZnVuY3Rpb24gKHIsIGkpIHtcbiAgICAgICAgICAgIHJUICs9IHI7XG4gICAgICAgICAgICBzZWVkQ2VsbHNbaV0gPSBzZWVkQ2VsbHNbaV0gfHwgW107XG4gICAgICAgIH0pO1xuICAgICAgICBjb2xUb3RhbHMuZm9yRWFjaChmdW5jdGlvbiAoYywgaikge1xuICAgICAgICAgICAgY1QgKz0gYztcbiAgICAgICAgICAgIHNlZWRDZWxscy5mb3JFYWNoKGZ1bmN0aW9uIChyb3csIGspIHtcbiAgICAgICAgICAgICAgICBzZWVkQ2VsbHNba11bal0gPSBzZWVkQ2VsbHNba11bal0gfHwgTWF0aC5yb3VuZChyb3dUb3RhbHNba10gLyByb3dUb3RhbHMubGVuZ3RoICsgKGNvbFRvdGFsc1tqXSAvIGNvbFRvdGFscy5sZW5ndGgpIC8gMiAqIE1hdGgucmFuZG9tKCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoclQgPT09IGNUKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpdGVyID0gMDsgaXRlciA8IGl0ZXJhdGlvbnM7IGl0ZXIrKykge1xuICAgICAgICAgICAgICAgIHNlZWRDZWxscy5mb3JFYWNoKGZ1bmN0aW9uIChyb3csIGlpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50Um93VG90YWwgPSAwO1xuICAgICAgICAgICAgICAgICAgICByb3cuZm9yRWFjaChmdW5jdGlvbiAoY2VsbCwgaikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFJvd1RvdGFsICs9IGNlbGw7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByb3cuZm9yRWFjaChmdW5jdGlvbiAoY2VsbCwgamopIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZWRDZWxsc1tpaV1bampdID0gY2VsbCAvIGN1cnJlbnRSb3dUb3RhbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZWRDZWxsc1tpaV1bampdICo9IHJvd1RvdGFsc1tpaV07XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IGNvbFRvdGFscy5sZW5ndGg7IGNvbCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50Q29sVG90YWwgPSAwO1xuICAgICAgICAgICAgICAgICAgICBzZWVkQ2VsbHMuZm9yRWFjaChmdW5jdGlvbiAociwgaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudENvbFRvdGFsICs9IHJbY29sXTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHNlZWRDZWxscy5mb3JFYWNoKGZ1bmN0aW9uIChyb3csIGtrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWVkQ2VsbHNba2tdW2NvbF0gPSByb3dbY29sXSAvIGN1cnJlbnRDb2xUb3RhbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZWRDZWxsc1tra11bY29sXSAqPSBjb2xUb3RhbHNbY29sXTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHNlZWRDZWxscztcbiAgICAgICAgfVxuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWVwaS5qcy5tYXAiLCIvKiogRXZlbnRzIGNsYXNzIGluY2x1ZGVzIG1ldGhvZHMgZm9yIG9yZ2FuaXppbmcgZXZlbnRzLlxuKlxuKi9cbmV4cG9ydCBjbGFzcyBFdmVudHMge1xuICAgIGNvbnN0cnVjdG9yKGV2ZW50cyA9IFtdKSB7XG4gICAgICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICAgICAgdGhpcy5zY2hlZHVsZShldmVudHMpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIHNjaGVkdWxlIGFuIGV2ZW50IHdpdGggdGhlIHNhbWUgdHJpZ2dlciBtdWx0aXBsZSB0aW1lcy5cbiAgICAqIEBwYXJhbSBxZXZlbnQgaXMgdGhlIGV2ZW50IHRvIGJlIHNjaGVkdWxlZC4gVGhlIGF0IHBhcmFtZXRlciBzaG91bGQgY29udGFpbiB0aGUgdGltZSBhdCBmaXJzdCBpbnN0YW5jZS5cbiAgICAqIEBwYXJhbSBldmVyeSBpbnRlcnZhbCBmb3IgZWFjaCBvY2N1cm5jZVxuICAgICogQHBhcmFtIGVuZCB1bnRpbFxuICAgICovXG4gICAgc2NoZWR1bGVSZWN1cnJpbmcocWV2ZW50LCBldmVyeSwgZW5kKSB7XG4gICAgICAgIHZhciByZWN1ciA9IFtdO1xuICAgICAgICB2YXIgZHVyYXRpb24gPSBlbmQgLSBxZXZlbnQuYXQ7XG4gICAgICAgIHZhciBvY2N1cmVuY2VzID0gTWF0aC5mbG9vcihkdXJhdGlvbiAvIGV2ZXJ5KTtcbiAgICAgICAgaWYgKCFxZXZlbnQudW50aWwpIHtcbiAgICAgICAgICAgIHFldmVudC51bnRpbCA9IHFldmVudC5hdDtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBvY2N1cmVuY2VzOyBpKyspIHtcbiAgICAgICAgICAgIHJlY3VyLnB1c2goeyBuYW1lOiBxZXZlbnQubmFtZSArIGksIGF0OiBxZXZlbnQuYXQgKyAoaSAqIGV2ZXJ5KSwgdW50aWw6IHFldmVudC51bnRpbCArIChpICogZXZlcnkpLCB0cmlnZ2VyOiBxZXZlbnQudHJpZ2dlciwgdHJpZ2dlcmVkOiBmYWxzZSB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNjaGVkdWxlKHJlY3VyKTtcbiAgICB9XG4gICAgLypcbiAgICAqIHNjaGVkdWxlIGEgb25lIHRpbWUgZXZlbnRzLiB0aGlzIGFycmFuZ2VzIHRoZSBldmVudCBxdWV1ZSBpbiBjaHJvbm9sb2dpY2FsIG9yZGVyLlxuICAgICogQHBhcmFtIHFldmVudHMgYW4gYXJyYXkgb2YgZXZlbnRzIHRvIGJlIHNjaGVkdWxlcy5cbiAgICAqL1xuICAgIHNjaGVkdWxlKHFldmVudHMpIHtcbiAgICAgICAgcWV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICBkLnVudGlsID0gZC51bnRpbCB8fCBkLmF0O1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5xdWV1ZSA9IHRoaXMucXVldWUuY29uY2F0KHFldmVudHMpO1xuICAgICAgICB0aGlzLnF1ZXVlID0gdGhpcy5vcmdhbml6ZSh0aGlzLnF1ZXVlLCAwLCB0aGlzLnF1ZXVlLmxlbmd0aCk7XG4gICAgfVxuICAgIHBhcnRpdGlvbihhcnJheSwgbGVmdCwgcmlnaHQpIHtcbiAgICAgICAgdmFyIGNtcCA9IGFycmF5W3JpZ2h0IC0gMV0uYXQsIG1pbkVuZCA9IGxlZnQsIG1heEVuZDtcbiAgICAgICAgZm9yIChtYXhFbmQgPSBsZWZ0OyBtYXhFbmQgPCByaWdodCAtIDE7IG1heEVuZCArPSAxKSB7XG4gICAgICAgICAgICBpZiAoYXJyYXlbbWF4RW5kXS5hdCA8PSBjbXApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN3YXAoYXJyYXksIG1heEVuZCwgbWluRW5kKTtcbiAgICAgICAgICAgICAgICBtaW5FbmQgKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnN3YXAoYXJyYXksIG1pbkVuZCwgcmlnaHQgLSAxKTtcbiAgICAgICAgcmV0dXJuIG1pbkVuZDtcbiAgICB9XG4gICAgc3dhcChhcnJheSwgaSwgaikge1xuICAgICAgICB2YXIgdGVtcCA9IGFycmF5W2ldO1xuICAgICAgICBhcnJheVtpXSA9IGFycmF5W2pdO1xuICAgICAgICBhcnJheVtqXSA9IHRlbXA7XG4gICAgICAgIHJldHVybiBhcnJheTtcbiAgICB9XG4gICAgb3JnYW5pemUoZXZlbnRzLCBsZWZ0LCByaWdodCkge1xuICAgICAgICBpZiAobGVmdCA8IHJpZ2h0KSB7XG4gICAgICAgICAgICB2YXIgcCA9IHRoaXMucGFydGl0aW9uKGV2ZW50cywgbGVmdCwgcmlnaHQpO1xuICAgICAgICAgICAgdGhpcy5vcmdhbml6ZShldmVudHMsIGxlZnQsIHApO1xuICAgICAgICAgICAgdGhpcy5vcmdhbml6ZShldmVudHMsIHAgKyAxLCByaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV2ZW50cztcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1ldmVudHMuanMubWFwIiwiaW1wb3J0IHsgUUNvbXBvbmVudCB9IGZyb20gJy4vUUNvbXBvbmVudCc7XG5leHBvcnQgY2xhc3MgU3RhdGVNYWNoaW5lIGV4dGVuZHMgUUNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IobmFtZSwgc3RhdGVzLCB0cmFuc2l0aW9ucywgY29uZGl0aW9ucywgZGF0YSkge1xuICAgICAgICBzdXBlcihuYW1lKTtcbiAgICAgICAgdGhpcy5zdGF0ZXMgPSBzdGF0ZXM7XG4gICAgICAgIHRoaXMudHJhbnNpdGlvbnMgPSB0aGlzLmNoZWNrVHJhbnNpdGlvbnModHJhbnNpdGlvbnMpO1xuICAgICAgICB0aGlzLmNvbmRpdGlvbnMgPSBjb25kaXRpb25zO1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgIH1cbiAgICB1cGRhdGUoYWdlbnQsIHN0ZXApIHtcbiAgICAgICAgZm9yICh2YXIgcyBpbiBhZ2VudC5zdGF0ZXMpIHtcbiAgICAgICAgICAgIGxldCBzdGF0ZSA9IGFnZW50LnN0YXRlc1tzXTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGVzW3N0YXRlXShhZ2VudCwgc3RlcCk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudHJhbnNpdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMudHJhbnNpdGlvbnNbaV0uZnJvbS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdHJhbnMgPSB0aGlzLnRyYW5zaXRpb25zW2ldLmZyb21bal07XG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmFucyA9PT0gc3RhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB2YWx1ZSwgcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjb25kID0gdGhpcy5jb25kaXRpb25zW3RoaXMudHJhbnNpdGlvbnNbaV0ubmFtZV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIChjb25kLnZhbHVlKSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gY29uZC52YWx1ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBjb25kLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgciA9IGNvbmQuY2hlY2soYWdlbnRbY29uZC5rZXldLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAociA9PT0gU3RhdGVNYWNoaW5lLlNVQ0NFU1MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZ2VudC5zdGF0ZXNbc10gPSB0aGlzLnRyYW5zaXRpb25zW2ldLnRvO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFnZW50W3RoaXMudHJhbnNpdGlvbnNbaV0udG9dID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZ2VudFt0aGlzLnRyYW5zaXRpb25zW2ldLmZyb21dID0gZmFsc2U7IC8vZm9yIGVhc2llciByZXBvcnRpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjaGVja1RyYW5zaXRpb25zKHRyYW5zaXRpb25zKSB7XG4gICAgICAgIGZvciAodmFyIHQgPSAwOyB0IDwgdHJhbnNpdGlvbnMubGVuZ3RoOyB0KyspIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdHJhbnNpdGlvbnNbdF0uZnJvbSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uc1t0XS5mcm9tID0gW3RyYW5zaXRpb25zW3RdLmZyb21dO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRyYW5zaXRpb25zO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXN0YXRlTWFjaGluZS5qcy5tYXAiLCJpbXBvcnQgeyBnZW5lcmF0ZVVVSUQgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IFBhdGNoLCBDb21wYXJ0bWVudE1vZGVsIH0gZnJvbSAnLi9jb21wYXJ0bWVudCc7XG5pbXBvcnQgeyBFbnZpcm9ubWVudCB9IGZyb20gJy4vZW52aXJvbm1lbnQnO1xuaW1wb3J0IHsgU3RhdGVNYWNoaW5lIH0gZnJvbSAnLi9zdGF0ZU1hY2hpbmUnO1xuaW1wb3J0IHsgZ2VuZXJhdGVQb3AgfSBmcm9tICcuL3V0aWxzJztcbi8qKlxuKkJhdGNoIHJ1biBlbnZpcm9ubWVudHNcbiovXG5leHBvcnQgY2xhc3MgRXhwZXJpbWVudCB7XG4gICAgY29uc3RydWN0b3IoZW52aXJvbm1lbnQsIHNldHVwLCB0YXJnZXQpIHtcbiAgICAgICAgdGhpcy5lbnZpcm9ubWVudCA9IGVudmlyb25tZW50O1xuICAgICAgICB0aGlzLnNldHVwID0gc2V0dXA7XG4gICAgICAgIHRoaXMucm5nID0gc2V0dXAuZXhwZXJpbWVudC5ybmc7XG4gICAgICAgIHRoaXMuZXhwZXJpbWVudExvZyA9IFtdO1xuICAgIH1cbiAgICBzdGFydChydW5zLCBzdGVwLCB1bnRpbCkge1xuICAgICAgICB2YXIgciA9IDA7XG4gICAgICAgIHdoaWxlIChyIDwgcnVucykge1xuICAgICAgICAgICAgdGhpcy5wcmVwKHIsIHRoaXMuc2V0dXApO1xuICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC50aW1lID0gMDsgLy9cbiAgICAgICAgICAgIHRoaXMuZW52aXJvbm1lbnQucnVuKHN0ZXAsIHVudGlsLCAwKTtcbiAgICAgICAgICAgIHRoaXMuZXhwZXJpbWVudExvZ1tyXSA9IHRoaXMucmVwb3J0KHIsIHRoaXMuc2V0dXApO1xuICAgICAgICAgICAgcisrO1xuICAgICAgICB9XG4gICAgfVxuICAgIHByZXAociwgY2ZnLCBhZ2VudHMsIHZpc3VhbGl6ZSkge1xuICAgICAgICBsZXQgZ3JvdXBzID0ge307XG4gICAgICAgIGxldCBjdXJyZW50QWdlbnRJZCA9IDA7XG4gICAgICAgIHRoaXMuZW52aXJvbm1lbnQgPSBuZXcgRW52aXJvbm1lbnQoKTtcbiAgICAgICAgaWYgKHR5cGVvZiBjZmcuYWdlbnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgZm9yIChsZXQgZ3JOYW1lIGluIGNmZy5hZ2VudHMpIHtcbiAgICAgICAgICAgICAgICBsZXQgZ3JvdXAgPSBjZmcuYWdlbnRzW2dyTmFtZV07XG4gICAgICAgICAgICAgICAgZ3JvdXAucGFyYW1zLmdyb3VwTmFtZSA9IGdyTmFtZTtcbiAgICAgICAgICAgICAgICBncm91cHNbZ3JOYW1lXSA9IGdlbmVyYXRlUG9wKGdyb3VwLmNvdW50LCBncm91cC5wYXJhbXMsIGNmZy5lbnZpcm9ubWVudC5zcGF0aWFsVHlwZSwgZ3JvdXAuYm91bmRhcmllcywgY3VycmVudEFnZW50SWQsIHRoaXMucm5nKTtcbiAgICAgICAgICAgICAgICBjdXJyZW50QWdlbnRJZCA9IGdyb3Vwc1tnck5hbWVdW2dyb3Vwc1tnck5hbWVdLmxlbmd0aCAtIDFdLmlkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgO1xuICAgICAgICB9XG4gICAgICAgIGNmZy5jb21wb25lbnRzLmZvckVhY2goKGNtcCkgPT4ge1xuICAgICAgICAgICAgc3dpdGNoIChjbXAudHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3N0YXRlLW1hY2hpbmUnOlxuICAgICAgICAgICAgICAgICAgICBsZXQgc20gPSBuZXcgU3RhdGVNYWNoaW5lKGNtcC5uYW1lLCBjbXAuc3RhdGVzLCBjbXAudHJhbnNpdGlvbnMsIGNtcC5jb25kaXRpb25zLCBncm91cHNbY21wLmFnZW50c11bMF0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVudmlyb25tZW50LmFkZChzbSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2NvbXBhcnRtZW50YWwnOlxuICAgICAgICAgICAgICAgICAgICBsZXQgcGF0Y2hlcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBjZmcucGF0Y2hlcy5mb3JFYWNoKChwYXRjaCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNtcC5wYXRjaGVzLmluZGV4T2YocGF0Y2gubmFtZSkgIT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRjaGVzLnB1c2gobmV3IFBhdGNoKHBhdGNoLm5hbWUsIGNtcC5jb21wYXJ0bWVudHMsIHBhdGNoLnBvcHVsYXRpb25zKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBsZXQgY01vZGVsID0gbmV3IENvbXBhcnRtZW50TW9kZWwoJ2NtcC5uYW1lJywgY21wLmNvbXBhcnRtZW50cywgcGF0Y2hlcyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW52aXJvbm1lbnQuYWRkKGNNb2RlbCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2V2ZXJ5LXN0ZXAnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVudmlyb25tZW50LmFkZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogZ2VuZXJhdGVVVUlEKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjbXAubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZTogY21wLmFjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGdyb3Vwc1tjbXAuYWdlbnRzXVswXVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBzd2l0Y2ggKGNmZy5leHBlcmltZW50KSB7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGlmIChyID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC5ybmcgPSB0aGlzLnJuZztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC5ydW4oY2ZnLmVudmlyb25tZW50LnN0ZXAsIGNmZy5lbnZpcm9ubWVudC51bnRpbCwgMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlcG9ydChyLCBjZmcpIHtcbiAgICAgICAgbGV0IHN1bXMgPSB7fTtcbiAgICAgICAgbGV0IG1lYW5zID0ge307XG4gICAgICAgIGxldCBmcmVxcyA9IHt9O1xuICAgICAgICBsZXQgbW9kZWwgPSB7fTtcbiAgICAgICAgbGV0IGNvdW50ID0gdGhpcy5lbnZpcm9ubWVudC5hZ2VudHMubGVuZ3RoO1xuICAgICAgICAvL2NmZy5yZXBvcnQuc3VtID0gY2ZnLnJlcG9ydC5zdW0uY29uY2F0KGNmZy5yZXBvcnQubWVhbik7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5lbnZpcm9ubWVudC5hZ2VudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBkID0gdGhpcy5lbnZpcm9ubWVudC5hZ2VudHNbaV07XG4gICAgICAgICAgICBjZmcucmVwb3J0LnN1bXMuZm9yRWFjaCgocykgPT4ge1xuICAgICAgICAgICAgICAgIHN1bXNbc10gPSBzdW1zW3NdID09IHVuZGVmaW5lZCA/IGRbc10gOiBkW3NdICsgc3Vtc1tzXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2ZnLnJlcG9ydC5mcmVxcy5mb3JFYWNoKChmKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc05hTihkW2ZdKSAmJiB0eXBlb2YgZFtmXSAhPSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICBmcmVxc1tmXSA9IGZyZXFzW2ZdID09IHVuZGVmaW5lZCA/IGRbZl0gOiBkW2ZdICsgZnJlcXNbZl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoJ2NvbXBhcnRtZW50cycgaW4gZCkge1xuICAgICAgICAgICAgICAgIGNmZy5yZXBvcnQuY29tcGFydG1lbnRzLmZvckVhY2goKGNtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVsW2NtXSA9IG1vZGVsW2NtXSA9PSB1bmRlZmluZWQgPyBkLnBvcHVsYXRpb25zW2NtXSA6IGQucG9wdWxhdGlvbnNbY21dICsgbW9kZWxbY21dO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIDtcbiAgICAgICAgY2ZnLnJlcG9ydC5tZWFucy5mb3JFYWNoKChtKSA9PiB7XG4gICAgICAgICAgICBtZWFuc1ttXSA9IHN1bXNbbV0gLyBjb3VudDtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb3VudDogY291bnQsXG4gICAgICAgICAgICBzdW1zOiBzdW1zLFxuICAgICAgICAgICAgbWVhbnM6IG1lYW5zLFxuICAgICAgICAgICAgZnJlcXM6IGZyZXFzLFxuICAgICAgICAgICAgbW9kZWw6IG1vZGVsXG4gICAgICAgIH07XG4gICAgfVxuICAgIC8vb24gZWFjaCBydW4sIGNoYW5nZSBvbmUgcGFyYW0sIGhvbGQgb3RoZXJzIGNvbnN0YW50XG4gICAgc3dlZXAocGFyYW1zLCBydW5zUGVyLCBiYXNlbGluZSA9IHRydWUpIHtcbiAgICAgICAgdmFyIGV4cFBsYW4gPSBbXTtcbiAgICAgICAgaWYgKGJhc2VsaW5lID09PSB0cnVlKSB7XG4gICAgICAgICAgICBwYXJhbXMuYmFzZWxpbmUgPSBbdHJ1ZV07XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBwYXJhbXMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyYW1zW3Byb3BdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBydW5zUGVyOyBrKyspIHtcbiAgICAgICAgICAgICAgICAgICAgZXhwUGxhbi5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtOiBwcm9wLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHBhcmFtc1twcm9wXVtpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bjoga1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wbGFucyA9IGV4cFBsYW47XG4gICAgfVxuICAgIGJvb3QocGFyYW1zKSB7XG4gICAgICAgIGxldCBydW5zO1xuICAgICAgICBmb3IgKGxldCBwYXJhbSBpbiBwYXJhbXMpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcnVucyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBydW5zID0gcGFyYW1zW3BhcmFtXS5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGFyYW1zW3BhcmFtXS5sZW5ndGggIT09IHJ1bnMpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBcImxlbmd0aCBvZiBwYXJhbWV0ZXIgYXJyYXlzIGRpZCBub3QgbWF0Y2hcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBsYW5zID0gcGFyYW1zO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWV4cGVyaW1lbnQuanMubWFwIiwiaW1wb3J0IHsgbm9ybWFsaXplIH0gZnJvbSAnLi91dGlscyc7XG5leHBvcnQgY2xhc3MgR2VuZSB7XG4gICAgY29uc3RydWN0b3IocmFuZ2UsIGRpc2NyZXRlLCBybmcpIHtcbiAgICAgICAgbGV0IHZhbCA9IHJuZy5yYW5kUmFuZ2UocmFuZ2VbMF0sIHJhbmdlWzFdKTtcbiAgICAgICAgaWYgKCFkaXNjcmV0ZSkge1xuICAgICAgICAgICAgdGhpcy5jb2RlID0gbm9ybWFsaXplKHZhbCwgcmFuZ2VbMF0sIHJhbmdlWzFdKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY29kZSA9IE1hdGguZmxvb3IodmFsKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBDaHJvbWFzb21lIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5nZW5lcyA9IFtdO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWdlbmV0aWMuanMubWFwIiwiaW1wb3J0IHsgRXhwZXJpbWVudCB9IGZyb20gJy4vZXhwZXJpbWVudCc7XG5pbXBvcnQgeyBDaHJvbWFzb21lLCBHZW5lIH0gZnJvbSAnLi9nZW5ldGljJztcbmltcG9ydCB7IGludk5vcm0gfSBmcm9tICcuL3V0aWxzJztcbmV4cG9ydCBjbGFzcyBFdm9sdXRpb25hcnkgZXh0ZW5kcyBFeHBlcmltZW50IHtcbiAgICBjb25zdHJ1Y3RvcihlbnZpcm9ubWVudCwgc2V0dXAsIGRpc2NyZXRlID0gZmFsc2UsIGdyYWRpZW50ID0gdHJ1ZSwgbWF0aW5nID0gdHJ1ZSkge1xuICAgICAgICBzdXBlcihlbnZpcm9ubWVudCwgc2V0dXApO1xuICAgICAgICB0aGlzLnRhcmdldCA9IHNldHVwLmV2b2x1dGlvbi50YXJnZXQ7XG4gICAgICAgIHRoaXMucmFuZ2VzID0gc2V0dXAuZXZvbHV0aW9uLnBhcmFtcztcbiAgICAgICAgdGhpcy5zaXplID0gc2V0dXAuZXhwZXJpbWVudC5zaXplO1xuICAgICAgICB0aGlzLm1hdGluZyA9IG1hdGluZztcbiAgICAgICAgaWYgKHRoaXMuc2l6ZSA8IDIpIHtcbiAgICAgICAgICAgIHRoaXMubWF0aW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kaXNjcmV0ZSA9IGRpc2NyZXRlO1xuICAgICAgICB0aGlzLmdyYWRpZW50ID0gZ3JhZGllbnQ7XG4gICAgICAgIHRoaXMucG9wdWxhdGlvbiA9IFtdO1xuICAgICAgICB0aGlzLm11dGF0ZVJhdGUgPSAwLjAzO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc2l6ZTsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgY2hyb21hID0gbmV3IENocm9tYXNvbWUoKTtcbiAgICAgICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgdGhpcy5yYW5nZXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgICBjaHJvbWEuZ2VuZXMucHVzaChuZXcgR2VuZSh0aGlzLnJhbmdlc1trXS5yYW5nZSwgdGhpcy5kaXNjcmV0ZSwgdGhpcy5ybmcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGlvbi5wdXNoKGNocm9tYSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhcnQocnVucywgc3RlcCwgdW50aWwpIHtcbiAgICAgICAgbGV0IHIgPSAwO1xuICAgICAgICB3aGlsZSAociA8IHJ1bnMpIHtcbiAgICAgICAgICAgIHRoaXMucHJlcChyLCB0aGlzLnNldHVwKTtcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGlvbi5zb3J0KHRoaXMuYXNjU29ydCk7XG4gICAgICAgICAgICB0aGlzLnBvcHVsYXRpb24gPSB0aGlzLnBvcHVsYXRpb24uc2xpY2UoMCwgdGhpcy5zaXplKTtcbiAgICAgICAgICAgIHRoaXMuZXhwZXJpbWVudExvZ1t0aGlzLmV4cGVyaW1lbnRMb2cubGVuZ3RoIC0gMV0uYmVzdCA9IHRoaXMucG9wdWxhdGlvblswXS5zY29yZTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdiZXN0OiAnLCB0aGlzLmV4cGVyaW1lbnRMb2dbdGhpcy5leHBlcmltZW50TG9nLmxlbmd0aCAtIDFdLmJlc3QpO1xuICAgICAgICAgICAgcisrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmV4cGVyaW1lbnRMb2c7XG4gICAgfVxuICAgIGdldFBhcmFtcyhjaHJvbWEsIGNmZykge1xuICAgICAgICBsZXQgb3V0ID0ge307XG4gICAgICAgIGZvciAobGV0IHBtID0gMDsgcG0gPCB0aGlzLnJhbmdlcy5sZW5ndGg7IHBtKyspIHtcbiAgICAgICAgICAgIGxldCBjZmdQbSA9IHRoaXMucmFuZ2VzW3BtXTtcbiAgICAgICAgICAgIGlmIChjZmdQbS5sZXZlbCA9PT0gJ2FnZW50cycgfHwgdHlwZW9mIGNmZ1BtLmxldmVsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIG91dFtjZmdQbS5sZXZlbCArIFwiX1wiICsgY2ZnUG0ubmFtZV0gPSBpbnZOb3JtKGNocm9tYS5nZW5lc1twbV0uY29kZSwgY2ZnUG0ucmFuZ2VbMF0sIGNmZ1BtLnJhbmdlWzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG91dFtjZmdQbS5sZXZlbCArIFwiX1wiICsgY2ZnUG0ubmFtZV0gPSBpbnZOb3JtKGNocm9tYS5nZW5lc1twbV0uY29kZSwgY2ZnUG0ucmFuZ2VbMF0sIGNmZ1BtLnJhbmdlWzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH1cbiAgICBkc2NTb3J0KGEsIGIpIHtcbiAgICAgICAgaWYgKGEuc2NvcmUgPiBiLnNjb3JlKSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYS5zY29yZSA8IGIuc2NvcmUpIHtcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICBhc2NTb3J0KGEsIGIpIHtcbiAgICAgICAgaWYgKGEuc2NvcmUgPiBiLnNjb3JlKSB7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhLnNjb3JlIDwgYi5zY29yZSkge1xuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICBwcmVwKHIsIGNmZykge1xuICAgICAgICBpZiAodGhpcy5tYXRpbmcpIHtcbiAgICAgICAgICAgIGxldCB0b3BQZXJjZW50ID0gTWF0aC5yb3VuZCgwLjEgKiB0aGlzLnNpemUpICsgMjsgLy90ZW4gcGVyY2VudCBvZiBvcmlnaW5hbCBzaXplICsgMlxuICAgICAgICAgICAgbGV0IGNoaWxkcmVuID0gdGhpcy5tYXRlKHRvcFBlcmNlbnQpO1xuICAgICAgICAgICAgdGhpcy5wb3B1bGF0aW9uID0gdGhpcy5wb3B1bGF0aW9uLmNvbmNhdChjaGlsZHJlbik7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCB0aGlzLnBvcHVsYXRpb24ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMubXV0YXRlKHRoaXMucG9wdWxhdGlvbltpXSwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLnBvcHVsYXRpb24ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IHBtID0gMDsgcG0gPCB0aGlzLnJhbmdlcy5sZW5ndGg7IHBtKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgY2ZnUG0gPSB0aGlzLnJhbmdlc1twbV07XG4gICAgICAgICAgICAgICAgbGV0IGdyb3VwSWR4O1xuICAgICAgICAgICAgICAgIGlmIChjZmdQbS5sZXZlbCA9PT0gJ2FnZW50cycgfHwgdHlwZW9mIGNmZ1BtLmxldmVsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICBjZmcuYWdlbnRzW2NmZ1BtLmdyb3VwXS5wYXJhbXNbY2ZnUG0ubmFtZV0uYXNzaWduID0gaW52Tm9ybSh0aGlzLnBvcHVsYXRpb25bal0uZ2VuZXNbcG1dLmNvZGUsIGNmZ1BtLnJhbmdlWzBdLCBjZmdQbS5yYW5nZVsxXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjZmdbY2ZnUG0ubGV2ZWxdLnBhcmFtc1tjZmdQbS5ncm91cF1bY2ZnUG0ubmFtZV0gPSBpbnZOb3JtKHRoaXMucG9wdWxhdGlvbltqXS5nZW5lc1twbV0uY29kZSwgY2ZnUG0ucmFuZ2VbMF0sIGNmZ1BtLnJhbmdlWzFdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdXBlci5wcmVwKHIsIGNmZyk7XG4gICAgICAgICAgICB0aGlzLmVudmlyb25tZW50LnRpbWUgPSAwO1xuICAgICAgICAgICAgbGV0IHByZWRpY3QgPSB0aGlzLnJlcG9ydChyLCBjZmcpO1xuICAgICAgICAgICAgdGhpcy5wb3B1bGF0aW9uW2pdLnNjb3JlID0gdGhpcy5jb3N0KHByZWRpY3QsIHRoaXMudGFyZ2V0KTtcbiAgICAgICAgICAgIHRoaXMuZXhwZXJpbWVudExvZy5wdXNoKHByZWRpY3QpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvc3QocHJlZGljdCwgdGFyZ2V0KSB7XG4gICAgICAgIGxldCBkZXYgPSAwO1xuICAgICAgICBsZXQgZGltZW5zaW9ucyA9IDA7XG4gICAgICAgIGZvciAobGV0IGtleSBpbiB0YXJnZXQubWVhbnMpIHtcbiAgICAgICAgICAgIGRldiArPSB0YXJnZXQubWVhbnNba2V5XSAtIHByZWRpY3QubWVhbnNba2V5XTtcbiAgICAgICAgICAgIGRpbWVuc2lvbnMrKztcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gdGFyZ2V0LmZyZXFzKSB7XG4gICAgICAgICAgICBkZXYgKz0gdGFyZ2V0LmZyZXFzW2tleV0gLSBwcmVkaWN0LmZyZXFzW2tleV07XG4gICAgICAgICAgICBkaW1lbnNpb25zKys7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQga2V5IGluIHRhcmdldC5tb2RlbCkge1xuICAgICAgICAgICAgZGV2ICs9IHRhcmdldC5tb2RlbFtrZXldIC0gcHJlZGljdC5tb2RlbFtrZXldO1xuICAgICAgICAgICAgZGltZW5zaW9ucysrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBNYXRoLnBvdyhkZXYsIDIpIC8gZGltZW5zaW9ucztcbiAgICB9XG4gICAgcmVwb3J0KHIsIGNmZykge1xuICAgICAgICByZXR1cm4gc3VwZXIucmVwb3J0KHIsIGNmZyk7XG4gICAgfVxuICAgIG1hdGUocGFyZW50cykge1xuICAgICAgICBsZXQgbnVtQ2hpbGRyZW4gPSAwLjUgKiB0aGlzLnJhbmdlcy5sZW5ndGggKiB0aGlzLnJhbmdlcy5sZW5ndGg7XG4gICAgICAgIGxldCBjaGlsZHJlbiA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bUNoaWxkcmVuOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBjaGlsZCA9IG5ldyBDaHJvbWFzb21lKCk7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMucmFuZ2VzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgbGV0IGdlbmUgPSBuZXcgR2VuZShbdGhpcy5yYW5nZXNbal0ucmFuZ2VbMF0sIHRoaXMucmFuZ2VzW2pdLnJhbmdlWzFdXSwgdGhpcy5kaXNjcmV0ZSwgdGhpcy5ybmcpO1xuICAgICAgICAgICAgICAgIGxldCByYW5kID0gTWF0aC5mbG9vcih0aGlzLnJuZy5yYW5kb20oKSAqIHBhcmVudHMpO1xuICAgICAgICAgICAgICAgIGxldCBleHByZXNzZWQgPSB0aGlzLnBvcHVsYXRpb25bcmFuZF0uZ2VuZXMuc2xpY2UoaiwgaiArIDEpO1xuICAgICAgICAgICAgICAgIGdlbmUuY29kZSA9IGV4cHJlc3NlZFswXS5jb2RlO1xuICAgICAgICAgICAgICAgIGNoaWxkLmdlbmVzLnB1c2goZ2VuZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGlsZHJlbi5wdXNoKGNoaWxkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2hpbGRyZW47XG4gICAgfVxuICAgIG11dGF0ZShjaHJvbWEsIGNoYW5jZSkge1xuICAgICAgICBsZXQgYmVzdCA9IHRoaXMucG9wdWxhdGlvblswXS5nZW5lcztcbiAgICAgICAgaWYgKHRoaXMucm5nLnJhbmRvbSgpID4gY2hhbmNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBjaHJvbWEuZ2VuZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGxldCBnZW5lID0gY2hyb21hLmdlbmVzW2pdO1xuICAgICAgICAgICAgbGV0IGRpZmY7XG4gICAgICAgICAgICBpZiAodGhpcy5ncmFkaWVudCkge1xuICAgICAgICAgICAgICAgIGRpZmYgPSBiZXN0W2pdLmNvZGUgLSBnZW5lLmNvZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBkaWZmID0gdGhpcy5ybmcucmFuZFJhbmdlKC0xLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB1cE9yRG93biA9IGRpZmYgPiAwID8gMSA6IC0xO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmRpc2NyZXRlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRpZmYgPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBnZW5lLmNvZGUgKz0gdGhpcy5ybmcubm9ybWFsKDAsIDAuMikgKiB0aGlzLm11dGF0ZVJhdGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBnZW5lLmNvZGUgKz0gZGlmZiAqIHRoaXMubXV0YXRlUmF0ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBnZW5lLmNvZGUgKz0gdXBPckRvd247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnZW5lLmNvZGUgPSBNYXRoLm1pbihNYXRoLm1heCgwLCBnZW5lLmNvZGUpLCAxKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWV2b2x1dGlvbmFyeS5qcy5tYXAiLCJpbXBvcnQgeyBRQ29tcG9uZW50IH0gZnJvbSAnLi9RQ29tcG9uZW50JztcbmltcG9ydCB7IFNVQ0NFU1MgfSBmcm9tICcuL3V0aWxzJztcbmV4cG9ydCBjbGFzcyBIeWJyaWRBdXRvbWF0YSBleHRlbmRzIFFDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGRhdGEsIGZsb3dTZXQsIGZsb3dNYXAsIGp1bXBTZXQsIGp1bXBNYXApIHtcbiAgICAgICAgc3VwZXIobmFtZSk7XG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgICAgIHRoaXMuZmxvd1NldCA9IGZsb3dTZXQ7XG4gICAgICAgIHRoaXMuZmxvd01hcCA9IGZsb3dNYXA7XG4gICAgICAgIHRoaXMuanVtcFNldCA9IGp1bXBTZXQ7XG4gICAgICAgIHRoaXMuanVtcE1hcCA9IGp1bXBNYXA7XG4gICAgfVxuICAgIHVwZGF0ZShhZ2VudCwgc3RlcCkge1xuICAgICAgICBsZXQgdGVtcCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoYWdlbnQpKTtcbiAgICAgICAgZm9yICh2YXIgbW9kZSBpbiB0aGlzLmp1bXBTZXQpIHtcbiAgICAgICAgICAgIGxldCBlZGdlID0gdGhpcy5qdW1wU2V0W21vZGVdO1xuICAgICAgICAgICAgbGV0IGVkZ2VTdGF0ZSA9IGVkZ2UuY2hlY2soYWdlbnRbZWRnZS5rZXldLCBlZGdlLnZhbHVlKTtcbiAgICAgICAgICAgIGlmIChlZGdlU3RhdGUgPT09IFNVQ0NFU1MgJiYgbW9kZSAhPSBhZ2VudC5jdXJyZW50TW9kZSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGFnZW50W2VkZ2Uua2V5XSA9IHRoaXMuanVtcE1hcFtlZGdlLmtleV1bYWdlbnQuY3VycmVudE1vZGVdW21vZGVdKGFnZW50W2VkZ2Uua2V5XSk7XG4gICAgICAgICAgICAgICAgICAgIGFnZW50LmN1cnJlbnRNb2RlID0gbW9kZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKEVycikge1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLmZsb3dNYXApIHtcbiAgICAgICAgICAgICAgICAvL3NlY29uZCBvcmRlciBpbnRlZ3JhdGlvblxuICAgICAgICAgICAgICAgIGxldCB0ZW1wRCA9IHRoaXMuZmxvd01hcFtrZXldW2FnZW50LmN1cnJlbnRNb2RlXShhZ2VudFtrZXldKTtcbiAgICAgICAgICAgICAgICB0ZW1wW2tleV0gPSBhZ2VudFtrZXldICsgdGVtcEQ7XG4gICAgICAgICAgICAgICAgYWdlbnRba2V5XSArPSAwLjUgKiAodGVtcEQgKyB0aGlzLmZsb3dNYXBba2V5XVthZ2VudC5jdXJyZW50TW9kZV0odGVtcFtrZXldKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1oYS5qcy5tYXAiLCJpbXBvcnQgeyBRQ29tcG9uZW50IH0gZnJvbSAnLi9RQ29tcG9uZW50JztcbmltcG9ydCB7IGdlbmVyYXRlVVVJRCB9IGZyb20gJy4vdXRpbHMnO1xuLy9IaWVyYXJjaGFsIFRhc2sgTmV0d29ya1xuZXhwb3J0IGNsYXNzIEhUTlBsYW5uZXIgZXh0ZW5kcyBRQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCByb290LCB0YXNrLCBkYXRhKSB7XG4gICAgICAgIHN1cGVyKG5hbWUpO1xuICAgICAgICB0aGlzLnJvb3QgPSByb290O1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgICAgICB0aGlzLnN1bW1hcnkgPSBbXTtcbiAgICAgICAgdGhpcy5yZXN1bHRzID0gW107XG4gICAgICAgIHRoaXMudGFzayA9IHRhc2s7XG4gICAgfVxuICAgIHN0YXRpYyB0aWNrKG5vZGUsIHRhc2ssIGFnZW50KSB7XG4gICAgICAgIGlmIChhZ2VudC5ydW5uaW5nTGlzdCkge1xuICAgICAgICAgICAgYWdlbnQucnVubmluZ0xpc3QucHVzaChub2RlLm5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYWdlbnQucnVubmluZ0xpc3QgPSBbbm9kZS5uYW1lXTtcbiAgICAgICAgICAgIGFnZW50LnN1Y2Nlc3NMaXN0ID0gW107XG4gICAgICAgICAgICBhZ2VudC5iYXJyaWVyTGlzdCA9IFtdO1xuICAgICAgICAgICAgYWdlbnQuYmxhY2tib2FyZCA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzdGF0ZSA9IG5vZGUudmlzaXQoYWdlbnQsIHRhc2spO1xuICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgfVxuICAgIHVwZGF0ZShhZ2VudCwgc3RlcCkge1xuICAgICAgICAvL2l0ZXJhdGUgYW4gYWdlbnQoZGF0YSkgdGhyb3VnaCB0aGUgdGFzayBuZXR3b3JrXG4gICAgICAgIGFnZW50LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIEhUTlBsYW5uZXIudGljayh0aGlzLnJvb3QsIHRoaXMudGFzaywgYWdlbnQpO1xuICAgICAgICBpZiAoYWdlbnQuc3VjY2Vzc0xpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgYWdlbnQuc3VjY2VlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBhZ2VudC5zdWNjZWVkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgYWdlbnQuYWN0aXZlID0gZmFsc2U7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEhUTlJvb3RUYXNrIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBnb2Fscykge1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLmdvYWxzID0gZ29hbHM7XG4gICAgfVxuICAgIGV2YWx1YXRlR29hbChhZ2VudCkge1xuICAgICAgICB2YXIgcmVzdWx0LCBnO1xuICAgICAgICBmb3IgKHZhciBwID0gMDsgcCA8IHRoaXMuZ29hbHMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgIGcgPSB0aGlzLmdvYWxzW3BdO1xuICAgICAgICAgICAgaWYgKGcuZGF0YSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGcuY2hlY2soZy5kYXRhW2cua2V5XSwgZy52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBnLmNoZWNrKGFnZW50W2cua2V5XSwgZy52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEhUTk5vZGUge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHByZWNvbmRpdGlvbnMpIHtcbiAgICAgICAgdGhpcy5pZCA9IGdlbmVyYXRlVVVJRCgpO1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLnByZWNvbmRpdGlvbnMgPSBwcmVjb25kaXRpb25zO1xuICAgIH1cbiAgICBldmFsdWF0ZVByZUNvbmRzKGFnZW50KSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmICh0aGlzLnByZWNvbmRpdGlvbnMgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgZm9yICh2YXIgcCA9IDA7IHAgPCB0aGlzLnByZWNvbmRpdGlvbnMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0aGlzLnByZWNvbmRpdGlvbnNbcF0uY2hlY2soYWdlbnRbdGhpcy5wcmVjb25kaXRpb25zW3BdLmtleV0sIHRoaXMucHJlY29uZGl0aW9uc1twXS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gSFROUGxhbm5lci5GQUlMRUQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEhUTlBsYW5uZXIuRkFJTEVEO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gSFROUGxhbm5lci5TVUNDRVNTO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBIVE5PcGVyYXRvciBleHRlbmRzIEhUTk5vZGUge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHByZWNvbmRpdGlvbnMsIGVmZmVjdHMpIHtcbiAgICAgICAgc3VwZXIobmFtZSwgcHJlY29uZGl0aW9ucyk7XG4gICAgICAgIHRoaXMudHlwZSA9IFwib3BlcmF0b3JcIjtcbiAgICAgICAgdGhpcy5lZmZlY3RzID0gZWZmZWN0cztcbiAgICAgICAgdGhpcy52aXNpdCA9IGZ1bmN0aW9uIChhZ2VudCwgdGFzaykge1xuICAgICAgICAgICAgaWYgKHRoaXMuZXZhbHVhdGVQcmVDb25kcyhhZ2VudCkgPT09IEhUTlBsYW5uZXIuU1VDQ0VTUykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lZmZlY3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWZmZWN0c1tpXShhZ2VudC5ibGFja2JvYXJkWzBdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRhc2suZXZhbHVhdGVHb2FsKGFnZW50LmJsYWNrYm9hcmRbMF0pID09PSBIVE5QbGFubmVyLlNVQ0NFU1MpIHtcbiAgICAgICAgICAgICAgICAgICAgYWdlbnQuc3VjY2Vzc0xpc3QudW5zaGlmdCh0aGlzLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSFROUGxhbm5lci5TVUNDRVNTO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEhUTlBsYW5uZXIuUlVOTklORztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhZ2VudC5iYXJyaWVyTGlzdC51bnNoaWZ0KHsgbmFtZTogdGhpcy5uYW1lLCBjb25kaXRpb25zOiB0aGlzLnByZWNvbmRpdGlvbnMgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEhUTlBsYW5uZXIuRkFJTEVEO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBIVE5NZXRob2QgZXh0ZW5kcyBIVE5Ob2RlIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBwcmVjb25kaXRpb25zLCBjaGlsZHJlbikge1xuICAgICAgICBzdXBlcihuYW1lLCBwcmVjb25kaXRpb25zKTtcbiAgICAgICAgdGhpcy50eXBlID0gXCJtZXRob2RcIjtcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgICAgICB0aGlzLnZpc2l0ID0gZnVuY3Rpb24gKGFnZW50LCB0YXNrKSB7XG4gICAgICAgICAgICB2YXIgY29weSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoYWdlbnQpKTtcbiAgICAgICAgICAgIGRlbGV0ZSBjb3B5LmJsYWNrYm9hcmQ7XG4gICAgICAgICAgICBhZ2VudC5ibGFja2JvYXJkLnVuc2hpZnQoY29weSk7XG4gICAgICAgICAgICBpZiAodGhpcy5ldmFsdWF0ZVByZUNvbmRzKGFnZW50KSA9PT0gSFROUGxhbm5lci5TVUNDRVNTKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0ZSA9IEhUTlBsYW5uZXIudGljayh0aGlzLmNoaWxkcmVuW2ldLCB0YXNrLCBhZ2VudCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0ZSA9PT0gSFROUGxhbm5lci5TVUNDRVNTKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhZ2VudC5zdWNjZXNzTGlzdC51bnNoaWZ0KHRoaXMubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gSFROUGxhbm5lci5TVUNDRVNTO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYWdlbnQuYmFycmllckxpc3QudW5zaGlmdCh7IG5hbWU6IHRoaXMubmFtZSwgY29uZGl0aW9uczogdGhpcy5wcmVjb25kaXRpb25zIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIEhUTlBsYW5uZXIuRkFJTEVEO1xuICAgICAgICB9O1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWh0bi5qcy5tYXAiLCJpbXBvcnQgeyBRQ29tcG9uZW50IH0gZnJvbSAnLi9RQ29tcG9uZW50JztcbmV4cG9ydCBjbGFzcyBNSFNhbXBsZXIgZXh0ZW5kcyBRQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBybmcsIGRhdGEsIHRhcmdldCwgc2F2ZSA9IHRydWUpIHtcbiAgICAgICAgc3VwZXIobmFtZSk7XG4gICAgICAgIHRoaXMua2VwdCA9IDA7XG4gICAgICAgIHRoaXMudGltZSA9IDA7XG4gICAgICAgIHRoaXMucm5nID0gcm5nO1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgICAgICB0aGlzLmNoYWluID0gW107XG4gICAgICAgIHRoaXMuc2F2ZSA9IHNhdmU7XG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIH1cbiAgICB1cGRhdGUoYWdlbnQsIHN0ZXApIHtcbiAgICAgICAgbGV0IG5ld1Byb2IgPSAwO1xuICAgICAgICBhZ2VudC55ID0gYWdlbnQucHJvcG9zYWwoYWdlbnQsIHN0ZXAsIHRoaXMucm5nKTtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnRhcmdldCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LmZvckVhY2goKGQpID0+IHtcbiAgICAgICAgICAgICAgICBuZXdQcm9iICs9IGFnZW50LmxuUHJvYkYoYWdlbnQsIHN0ZXAsIGQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBuZXdQcm9iICo9IDEgLyB0aGlzLnRhcmdldC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBuZXdQcm9iID0gYWdlbnQubG5Qcm9iRihhZ2VudCwgc3RlcCk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGRpZmYgPSBuZXdQcm9iIC0gYWdlbnQubG5Qcm9iO1xuICAgICAgICBsZXQgdSA9IHRoaXMucm5nLnJhbmRvbSgpO1xuICAgICAgICBpZiAoTWF0aC5sb2codSkgPD0gZGlmZiB8fCBkaWZmID49IDApIHtcbiAgICAgICAgICAgIGFnZW50LmxuUHJvYiA9IG5ld1Byb2I7XG4gICAgICAgICAgICBhZ2VudC54ID0gYWdlbnQueTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMua2VwdCArPSAxO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnNhdmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHRoaXMuY2hhaW4ucHVzaCh7IGlkOiBhZ2VudC5pZCwgdGltZTogYWdlbnQudGltZSwgeDogYWdlbnQueCB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1jLmpzLm1hcCIsImV4cG9ydCBjbGFzcyBrTWVhbiB7XG4gICAgY29uc3RydWN0b3IoZGF0YSwgcHJvcHMsIGspIHtcbiAgICAgICAgdGhpcy5jZW50cm9pZHMgPSBbXTtcbiAgICAgICAgdGhpcy5saW1pdHMgPSB7fTtcbiAgICAgICAgdGhpcy5pdGVyYXRpb25zID0gMDtcbiAgICAgICAgLy9jcmVhdGUgYSBsaW1pdHMgb2JqIGZvciBlYWNoIHByb3BcbiAgICAgICAgcHJvcHMuZm9yRWFjaChwID0+IHtcbiAgICAgICAgICAgIHRoaXMubGltaXRzW3BdID0ge1xuICAgICAgICAgICAgICAgIG1pbjogMWUxNSxcbiAgICAgICAgICAgICAgICBtYXg6IC0xZTE1XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgICAgLy9zZXQgbGltaXRzIGZvciBlYWNoIHByb3BcbiAgICAgICAgZGF0YS5mb3JFYWNoKGQgPT4ge1xuICAgICAgICAgICAgcHJvcHMuZm9yRWFjaChwID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZFtwXSA+IHRoaXMubGltaXRzW3BdLm1heCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpbWl0c1twXS5tYXggPSBkW3BdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZFtwXSA8IHRoaXMubGltaXRzW3BdLm1pbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpbWl0c1twXS5taW4gPSBkW3BdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgLy9jcmVhdGUgayByYW5kb20gcG9pbnRzXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgazsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmNlbnRyb2lkc1tpXSA9IHsgY291bnQ6IDAgfTtcbiAgICAgICAgICAgIHByb3BzLmZvckVhY2gocCA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGNlbnRyb2lkID0gTWF0aC5yYW5kb20oKSAqIHRoaXMubGltaXRzW3BdLm1heCArIHRoaXMubGltaXRzW3BdLm1pbjtcbiAgICAgICAgICAgICAgICB0aGlzLmNlbnRyb2lkc1tpXVtwXSA9IGNlbnRyb2lkO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICAgICAgdGhpcy5wcm9wcyA9IHByb3BzO1xuICAgIH1cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIHRoaXMuX2Fzc2lnbkNlbnRyb2lkKCk7XG4gICAgICAgIHRoaXMuX21vdmVDZW50cm9pZCgpO1xuICAgIH1cbiAgICBydW4oKSB7XG4gICAgICAgIGxldCBmaW5pc2hlZCA9IGZhbHNlO1xuICAgICAgICB3aGlsZSAoIWZpbmlzaGVkKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5jZW50cm9pZHMuZm9yRWFjaChjID0+IHtcbiAgICAgICAgICAgICAgICBmaW5pc2hlZCA9IGMuZmluaXNoZWQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuaXRlcmF0aW9ucysrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbdGhpcy5jZW50cm9pZHMsIHRoaXMuZGF0YV07XG4gICAgfVxuICAgIF9hc3NpZ25DZW50cm9pZCgpIHtcbiAgICAgICAgdGhpcy5kYXRhLmZvckVhY2goKGQsIGopID0+IHtcbiAgICAgICAgICAgIGxldCBkaXN0YW5jZXMgPSBbXTtcbiAgICAgICAgICAgIGxldCB0b3RhbERpc3QgPSBbXTtcbiAgICAgICAgICAgIGxldCBtaW5EaXN0O1xuICAgICAgICAgICAgbGV0IG1pbkluZGV4O1xuICAgICAgICAgICAgLy9mb3JlYWNoIHBvaW50LCBnZXQgdGhlIHBlciBwcm9wIGRpc3RhbmNlIGZyb20gZWFjaCBjZW50cm9pZFxuICAgICAgICAgICAgdGhpcy5jZW50cm9pZHMuZm9yRWFjaCgoYywgaSkgPT4ge1xuICAgICAgICAgICAgICAgIGRpc3RhbmNlc1tpXSA9IHt9O1xuICAgICAgICAgICAgICAgIHRvdGFsRGlzdFtpXSA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5mb3JFYWNoKHAgPT4ge1xuICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZXNbaV1bcF0gPSBNYXRoLnNxcnQoKGRbcF0gLSBjW3BdKSAqIChkW3BdIC0gY1twXSkpO1xuICAgICAgICAgICAgICAgICAgICB0b3RhbERpc3RbaV0gKz0gZGlzdGFuY2VzW2ldW3BdO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRvdGFsRGlzdFtpXSA9IE1hdGguc3FydCh0b3RhbERpc3RbaV0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBtaW5EaXN0ID0gTWF0aC5taW4uYXBwbHkobnVsbCwgdG90YWxEaXN0KTtcbiAgICAgICAgICAgIG1pbkluZGV4ID0gdG90YWxEaXN0LmluZGV4T2YobWluRGlzdCk7XG4gICAgICAgICAgICBkLmNlbnRyb2lkID0gbWluSW5kZXg7XG4gICAgICAgICAgICBkLmRpc3RhbmNlcyA9IGRpc3RhbmNlcztcbiAgICAgICAgICAgIHRoaXMuY2VudHJvaWRzW21pbkluZGV4XS5jb3VudCArPSAxO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgX21vdmVDZW50cm9pZCgpIHtcbiAgICAgICAgdGhpcy5jZW50cm9pZHMuZm9yRWFjaCgoYywgaSkgPT4ge1xuICAgICAgICAgICAgbGV0IGRpc3RGcm9tQ2VudHJvaWQgPSB7fTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMuZm9yRWFjaChwID0+IGRpc3RGcm9tQ2VudHJvaWRbcF0gPSBbXSk7XG4gICAgICAgICAgICAvL2dldCB0aGUgcGVyIHByb3AgZGlzdGFuY2VzIGZyb20gdGhlIGNlbnRyb2lkIGFtb25nIGl0cycgYXNzaWduZWQgcG9pbnRzXG4gICAgICAgICAgICB0aGlzLmRhdGEuZm9yRWFjaChkID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZC5jZW50cm9pZCA9PT0gaSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmZvckVhY2gocCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXN0RnJvbUNlbnRyb2lkW3BdLnB1c2goZFtwXSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy9oYW5kbGUgY2VudHJvaWQgd2l0aCBubyBhc3NpZ25lZCBwb2ludHMgKHJhbmRvbWx5IGFzc2lnbiBuZXcpO1xuICAgICAgICAgICAgaWYgKGMuY291bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmZvckVhY2gocCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3RGcm9tQ2VudHJvaWRbcF0gPSBbTWF0aC5yYW5kb20oKSAqIHRoaXMubGltaXRzW3BdLm1heCArIHRoaXMubGltaXRzW3BdLm1pbl07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2dldCB0aGUgc3VtIGFuZCBtZWFuIHBlciBwcm9wZXJ0eSBvZiB0aGUgYXNzaWduZWQgcG9pbnRzXG4gICAgICAgICAgICB0aGlzLnByb3BzLmZvckVhY2gocCA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHN1bSA9IGRpc3RGcm9tQ2VudHJvaWRbcF0ucmVkdWNlKChwcmV2LCBuZXh0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmV2ICsgbmV4dDtcbiAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgICBsZXQgbWVhbiA9IHN1bSAvIGRpc3RGcm9tQ2VudHJvaWRbcF0ubGVuZ3RoO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coaSwgJ1xcJ3MgYXZlcmFnZSBkaXN0IHdhcycsIG1lYW4sICcgdGhlIGN1cnJlbnQgcG9zIHdhcyAnLCBjW3BdKTtcbiAgICAgICAgICAgICAgICBpZiAoY1twXSAhPT0gbWVhbikge1xuICAgICAgICAgICAgICAgICAgICBjW3BdID0gbWVhbjtcbiAgICAgICAgICAgICAgICAgICAgYy5maW5pc2hlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBjLmNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGMuZmluaXNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1rbWVhbi5qcy5tYXAiLCJleHBvcnQgY2xhc3MgS05OIHtcbiAgICBzZXROZWlnaGJvcnMocG9pbnQsIGRhdGEsIHBhcmFtLCBjbGFzc2lmaWVyKSB7XG4gICAgICAgIGRhdGEuZm9yRWFjaCgoZCkgPT4ge1xuICAgICAgICAgICAgaWYgKGQuaWQgIT09IHBvaW50LmlkKSB7XG4gICAgICAgICAgICAgICAgcG9pbnQubmVpZ2hib3JzW2QuaWRdID0gcG9pbnQubmVpZ2hib3JzW2QuaWRdIHx8IHt9O1xuICAgICAgICAgICAgICAgIHBvaW50Lm5laWdoYm9yc1tkLmlkXVtjbGFzc2lmaWVyXSA9IGRbY2xhc3NpZmllcl07XG4gICAgICAgICAgICAgICAgcG9pbnQubmVpZ2hib3JzW2QuaWRdW3BhcmFtLnBhcmFtXSA9IE1hdGguYWJzKHBvaW50W3BhcmFtLnBhcmFtXSAtIGRbcGFyYW0ucGFyYW1dKSAvIHBhcmFtLnJhbmdlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgc29ydChuZWlnaGJvcnMsIHBhcmFtKSB7XG4gICAgICAgIHZhciBsaXN0ID0gW107XG4gICAgICAgIGZvciAodmFyIG5laWdoIGluIG5laWdoYm9ycykge1xuICAgICAgICAgICAgbGlzdC5wdXNoKG5laWdoYm9yc1tuZWlnaF0pO1xuICAgICAgICB9XG4gICAgICAgIGxpc3Quc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgaWYgKGFbcGFyYW1dID49IGJbcGFyYW1dKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYltwYXJhbV0gPj0gYVtwYXJhbV0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBsaXN0O1xuICAgIH1cbiAgICBzZXREaXN0YW5jZXMoZGF0YSwgdHJhaW5lZCwga1BhcmFtc09iaiwgY2xhc3NpZmllcikge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGRhdGFbaV0ubmVpZ2hib3JzID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IGtQYXJhbXNPYmoubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRhdGFbaV1ba1BhcmFtc09ialtrXS5wYXJhbV0gPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0TmVpZ2hib3JzKGRhdGFbaV0sIHRyYWluZWQsIGtQYXJhbXNPYmpba10sIGNsYXNzaWZpZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAodmFyIG4gaW4gZGF0YVtpXS5uZWlnaGJvcnMpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmVpZ2hib3IgPSBkYXRhW2ldLm5laWdoYm9yc1tuXTtcbiAgICAgICAgICAgICAgICB2YXIgZGlzdCA9IDA7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgcCA9IDA7IHAgPCBrUGFyYW1zT2JqLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3QgKz0gbmVpZ2hib3Jba1BhcmFtc09ialtwXS5wYXJhbV0gKiBuZWlnaGJvcltrUGFyYW1zT2JqW3BdLnBhcmFtXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmVpZ2hib3IuZGlzdGFuY2UgPSBNYXRoLnNxcnQoZGlzdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGdldFJhbmdlKGRhdGEsIGtQYXJhbXMpIHtcbiAgICAgICAgbGV0IHJhbmdlcyA9IFtdLCBtaW4gPSAxZTIwLCBtYXggPSAwO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGtQYXJhbXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIGQgPSAwOyBkIDwgZGF0YS5sZW5ndGg7IGQrKykge1xuICAgICAgICAgICAgICAgIGlmIChkYXRhW2RdW2tQYXJhbXNbal1dIDwgbWluKSB7XG4gICAgICAgICAgICAgICAgICAgIG1pbiA9IGRhdGFbZF1ba1BhcmFtc1tqXV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChkYXRhW2RdW2tQYXJhbXNbal1dID4gbWF4KSB7XG4gICAgICAgICAgICAgICAgICAgIG1heCA9IGRhdGFbZF1ba1BhcmFtc1tqXV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmFuZ2VzLnB1c2goe1xuICAgICAgICAgICAgICAgIHBhcmFtOiBrUGFyYW1zW2pdLFxuICAgICAgICAgICAgICAgIG1pbjogbWluLFxuICAgICAgICAgICAgICAgIG1heDogbWF4LFxuICAgICAgICAgICAgICAgIHJhbmdlOiBtYXggLSBtaW5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIDtcbiAgICAgICAgcmV0dXJuIHJhbmdlcztcbiAgICB9XG4gICAgY2xhc3NpZnkoZGF0YSwgdHJhaW5lZERhdGEsIGtQYXJhbXMsIGNsYXNzaWZpZXIsIG5lYXJlc3ROKSB7XG4gICAgICAgIGxldCBrUGFyYW1zT2JqID0gdGhpcy5nZXRSYW5nZShbXS5jb25jYXQoZGF0YSwgdHJhaW5lZERhdGEpLCBrUGFyYW1zKTtcbiAgICAgICAgZGF0YSA9IHRoaXMuc2V0RGlzdGFuY2VzKGRhdGEsIHRyYWluZWREYXRhLCBrUGFyYW1zT2JqLCBjbGFzc2lmaWVyKTtcbiAgICAgICAgbGV0IG9yZGVyZWQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgZCA9IDA7IGQgPCBkYXRhLmxlbmd0aDsgZCsrKSB7XG4gICAgICAgICAgICBsZXQgcmVzdWx0cyA9IHt9O1xuICAgICAgICAgICAgb3JkZXJlZCA9IHRoaXMuc29ydChkYXRhW2RdLm5laWdoYm9ycywgJ2Rpc3RhbmNlJyk7XG4gICAgICAgICAgICBsZXQgbiA9IDA7XG4gICAgICAgICAgICB3aGlsZSAobiA8IG5lYXJlc3ROKSB7XG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBvcmRlcmVkW25dW2NsYXNzaWZpZXJdO1xuICAgICAgICAgICAgICAgIHJlc3VsdHNbY3VycmVudF0gPSByZXN1bHRzW2N1cnJlbnRdIHx8IDA7XG4gICAgICAgICAgICAgICAgcmVzdWx0c1tjdXJyZW50XSArPSAxO1xuICAgICAgICAgICAgICAgIG4rKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBtYXggPSAwLCBsaWtlbGllc3QgPSAnJztcbiAgICAgICAgICAgIGZvciAobGV0IHBhcmFtIGluIHJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0c1twYXJhbV0gPiBtYXgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gcmVzdWx0c1twYXJhbV07XG4gICAgICAgICAgICAgICAgICAgIGxpa2VsaWVzdCA9IHBhcmFtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRhdGFbZF1bY2xhc3NpZmllcl0gPSBsaWtlbGllc3Q7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9a25uLmpzLm1hcCIsImV4cG9ydCBjbGFzcyBWZWN0b3Ige1xuICAgIGNvbnN0cnVjdG9yKGFycmF5LCBzaXplKSB7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIE1hdHJpeCB7XG4gICAgY29uc3RydWN0b3IobWF0KSB7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIGFjdGl2YXRpb25NZXRob2RzIHtcbiAgICBzdGF0aWMgUmVMVSh4KSB7XG4gICAgICAgIHJldHVybiBNYXRoLm1heCh4LCAwKTtcbiAgICB9XG4gICAgc3RhdGljIHNpZ21vaWQoeCkge1xuICAgICAgICByZXR1cm4gMSAvICgxICsgTWF0aC5leHAoLXgpKTtcbiAgICB9XG4gICAgc3RhdGljIHRhbmgoeCkge1xuICAgICAgICBsZXQgdmFsID0gKE1hdGguZXhwKHgpIC0gTWF0aC5leHAoLXgpKSAvIChNYXRoLmV4cCh4KSArIE1hdGguZXhwKC14KSk7XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfVxufVxuO1xuZXhwb3J0IGNsYXNzIGRlcml2aXRlTWV0aG9kcyB7XG4gICAgc3RhdGljIFJlTFUodmFsdWUpIHtcbiAgICAgICAgbGV0IGRlciA9IHZhbHVlIDw9IDAgPyAwIDogMTtcbiAgICAgICAgcmV0dXJuIGRlcjtcbiAgICB9XG4gICAgc3RhdGljIHNpZ21vaWQodmFsdWUpIHtcbiAgICAgICAgbGV0IHNpZyA9IGFjdGl2YXRpb25NZXRob2RzLnNpZ21vaWQ7XG4gICAgICAgIHJldHVybiBzaWcodmFsdWUpICogKDEgLSBzaWcodmFsdWUpKTtcbiAgICB9XG4gICAgc3RhdGljIHRhbmgodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIDEgLSBNYXRoLnBvdyhhY3RpdmF0aW9uTWV0aG9kcy50YW5oKHZhbHVlKSwgMik7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGxvZ2lzdGljKHgsIG0sIGIsIGspIHtcbiAgICB2YXIgeSA9IDEgLyAobSArIE1hdGguZXhwKC1rICogKHggLSBiKSkpO1xuICAgIHJldHVybiB5O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGxvZ2l0KHgsIG0sIGIsIGspIHtcbiAgICB2YXIgeSA9IDEgLyBNYXRoLmxvZyh4IC8gKDEgLSB4KSk7XG4gICAgcmV0dXJuIHk7XG59XG5leHBvcnQgZnVuY3Rpb24gbGluZWFyKHgsIG0sIGIsIGspIHtcbiAgICB2YXIgeSA9IG0gKiB4ICsgYjtcbiAgICByZXR1cm4geTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBleHBvbmVudGlhbCh4LCBtLCBiLCBrKSB7XG4gICAgdmFyIHkgPSAxIC0gTWF0aC5wb3coeCwgaykgLyBNYXRoLnBvdygxLCBrKTtcbiAgICByZXR1cm4geTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hdGguanMubWFwIiwiZXhwb3J0IGNsYXNzIE5ldHdvcmsge1xuICAgIGNvbnN0cnVjdG9yKGRhdGEsIGxhYmVscywgaGlkZGVuTnVtLCBlbCwgYWN0aXZhdGlvblR5cGUgPSBcInRhbmhcIikge1xuICAgICAgICB0aGlzLmVsID0gZWw7XG4gICAgICAgIHRoaXMuaXRlciA9IDA7XG4gICAgICAgIHRoaXMuY29ycmVjdCA9IDA7XG4gICAgICAgIHRoaXMuaGlkZGVuTnVtID0gaGlkZGVuTnVtO1xuICAgICAgICB0aGlzLmxlYXJuUmF0ZSA9IDAuMDE7XG4gICAgICAgIHRoaXMuYWN0Rm4gPSBOZXR3b3JrLmFjdGl2YXRpb25NZXRob2RzW2FjdGl2YXRpb25UeXBlXTtcbiAgICAgICAgdGhpcy5kZXJGbiA9IE5ldHdvcmsuZGVyaXZhdGl2ZU1ldGhvZHNbYWN0aXZhdGlvblR5cGVdO1xuICAgICAgICB0aGlzLmluaXQoZGF0YSwgbGFiZWxzKTtcbiAgICB9XG4gICAgbGVhcm4oaXRlcmF0aW9ucywgZGF0YSwgbGFiZWxzLCByZW5kZXIgPSAxMDApIHtcbiAgICAgICAgdGhpcy5jb3JyZWN0ID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVyYXRpb25zOyBpKyspIHtcbiAgICAgICAgICAgIGxldCByYW5kSWR4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogZGF0YS5sZW5ndGgpO1xuICAgICAgICAgICAgdGhpcy5pdGVyKys7XG4gICAgICAgICAgICB0aGlzLmZvcndhcmQoZGF0YVtyYW5kSWR4XSk7XG4gICAgICAgICAgICBsZXQgbWF4ID0gLTE7XG4gICAgICAgICAgICBsZXQgbWF4SWR4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy52YWx1ZXMubGVuZ3RoKTtcbiAgICAgICAgICAgIHRoaXMudmFsdWVzW3RoaXMudmFsdWVzLmxlbmd0aCAtIDFdLmZvckVhY2goKHgsIGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh4ID4gbWF4KSB7XG4gICAgICAgICAgICAgICAgICAgIG1heElkeCA9IGlkeDtcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0geDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxldCBndWVzc2VkID0gdGhpcy52YWx1ZXNbdGhpcy52YWx1ZXMubGVuZ3RoIC0gMV1bbWF4SWR4XSA+PSAwLjUgPyAxIDogMDtcbiAgICAgICAgICAgIGlmIChndWVzc2VkID09PSBsYWJlbHNbcmFuZElkeF1bbWF4SWR4XSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29ycmVjdCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5hY2N1cmFjeSA9IHRoaXMuY29ycmVjdCAvIChpICsgMSk7XG4gICAgICAgICAgICB0aGlzLmJhY2t3YXJkKGxhYmVsc1tyYW5kSWR4XSk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVdlaWdodHMoKTtcbiAgICAgICAgICAgIHRoaXMucmVzZXRUb3RhbHMoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjbGFzc2lmeShkYXRhKSB7XG4gICAgICAgIHRoaXMucmVzZXRUb3RhbHMoKTtcbiAgICAgICAgdGhpcy5mb3J3YXJkKGRhdGEpO1xuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZXNbdGhpcy52YWx1ZXMubGVuZ3RoIC0gMV07XG4gICAgfVxuICAgIGluaXQoZGF0YSwgbGFiZWxzKSB7XG4gICAgICAgIGxldCBpbnB1dHMgPSBbXTtcbiAgICAgICAgdGhpcy5kZXIgPSBbXTtcbiAgICAgICAgdGhpcy52YWx1ZXMgPSBbXTtcbiAgICAgICAgdGhpcy53ZWlnaHRzID0gW107XG4gICAgICAgIHRoaXMud2VpZ2h0Q2hhbmdlcyA9IFtdO1xuICAgICAgICB0aGlzLnRvdGFscyA9IFtdO1xuICAgICAgICB0aGlzLmRlclRvdGFscyA9IFtdO1xuICAgICAgICB0aGlzLmJpYXNlcyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBuID0gMDsgbiA8IGRhdGFbMF0ubGVuZ3RoOyBuKyspIHtcbiAgICAgICAgICAgIGlucHV0cy5wdXNoKDApO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IHRoaXMuaGlkZGVuTnVtLmxlbmd0aDsgY29sKyspIHtcbiAgICAgICAgICAgIHRoaXMuZGVyW2NvbF0gPSBbXTtcbiAgICAgICAgICAgIHRoaXMudmFsdWVzW2NvbF0gPSBbXTtcbiAgICAgICAgICAgIHRoaXMudG90YWxzW2NvbF0gPSBbXTtcbiAgICAgICAgICAgIHRoaXMuZGVyVG90YWxzW2NvbF0gPSBbXTtcbiAgICAgICAgICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IHRoaXMuaGlkZGVuTnVtW2NvbF07IHJvdysrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZXNbY29sXVtyb3ddID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLmRlcltjb2xdW3Jvd10gPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMudG90YWxzW2NvbF1bcm93XSA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5kZXJUb3RhbHNbY29sXVtyb3ddID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZhbHVlcy51bnNoaWZ0KGlucHV0cyk7XG4gICAgICAgIHRoaXMudG90YWxzLnVuc2hpZnQoaW5wdXRzKTtcbiAgICAgICAgdGhpcy5kZXIudW5zaGlmdChpbnB1dHMpO1xuICAgICAgICB0aGlzLmRlclRvdGFscy51bnNoaWZ0KGlucHV0cyk7XG4gICAgICAgIHRoaXMudmFsdWVzW3RoaXMuaGlkZGVuTnVtLmxlbmd0aCArIDFdID0gbGFiZWxzWzBdLm1hcCgobCkgPT4geyByZXR1cm4gMDsgfSk7XG4gICAgICAgIHRoaXMudG90YWxzW3RoaXMuaGlkZGVuTnVtLmxlbmd0aCArIDFdID0gbGFiZWxzWzBdLm1hcCgobCkgPT4geyByZXR1cm4gMDsgfSk7XG4gICAgICAgIHRoaXMuZGVyW3RoaXMuaGlkZGVuTnVtLmxlbmd0aCArIDFdID0gbGFiZWxzWzBdLm1hcCgobCkgPT4geyByZXR1cm4gMDsgfSk7XG4gICAgICAgIHRoaXMuZGVyVG90YWxzW3RoaXMuaGlkZGVuTnVtLmxlbmd0aCArIDFdID0gbGFiZWxzWzBdLm1hcCgobCkgPT4geyByZXR1cm4gMDsgfSk7XG4gICAgICAgIGZvciAobGV0IHdnID0gMDsgd2cgPCB0aGlzLnZhbHVlcy5sZW5ndGggLSAxOyB3ZysrKSB7XG4gICAgICAgICAgICB0aGlzLndlaWdodHNbd2ddID0gW107XG4gICAgICAgICAgICB0aGlzLndlaWdodENoYW5nZXNbd2ddID0gW107XG4gICAgICAgICAgICB0aGlzLmJpYXNlc1t3Z10gPSBbXTtcbiAgICAgICAgICAgIGZvciAobGV0IHNyYyA9IDA7IHNyYyA8IHRoaXMudmFsdWVzW3dnXS5sZW5ndGg7IHNyYysrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy53ZWlnaHRzW3dnXVtzcmNdID0gW107XG4gICAgICAgICAgICAgICAgdGhpcy53ZWlnaHRDaGFuZ2VzW3dnXVtzcmNdID0gW107XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZHN0ID0gMDsgZHN0IDwgdGhpcy52YWx1ZXNbd2cgKyAxXS5sZW5ndGg7IGRzdCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYmlhc2VzW3dnXVtkc3RdID0gTWF0aC5yYW5kb20oKSAtIDAuNTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53ZWlnaHRzW3dnXVtzcmNdW2RzdF0gPSBNYXRoLnJhbmRvbSgpIC0gMC41O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLndlaWdodENoYW5nZXNbd2ddW3NyY11bZHN0XSA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJlc2V0VG90YWxzKCkge1xuICAgICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCB0aGlzLnRvdGFscy5sZW5ndGg7IGNvbCsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCB0aGlzLnRvdGFsc1tjb2xdLmxlbmd0aDsgcm93KyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRvdGFsc1tjb2xdW3Jvd10gPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMuZGVyVG90YWxzW2NvbF1bcm93XSA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yd2FyZChpbnB1dCkge1xuICAgICAgICB0aGlzLnZhbHVlc1swXSA9IGlucHV0O1xuICAgICAgICBmb3IgKGxldCB3ZyA9IDA7IHdnIDwgdGhpcy53ZWlnaHRzLmxlbmd0aDsgd2crKykge1xuICAgICAgICAgICAgbGV0IHNyY1ZhbHMgPSB3ZztcbiAgICAgICAgICAgIGxldCBkc3RWYWxzID0gd2cgKyAxO1xuICAgICAgICAgICAgZm9yIChsZXQgc3JjID0gMDsgc3JjIDwgdGhpcy53ZWlnaHRzW3dnXS5sZW5ndGg7IHNyYysrKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZHN0ID0gMDsgZHN0IDwgdGhpcy53ZWlnaHRzW3dnXVtzcmNdLmxlbmd0aDsgZHN0KyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b3RhbHNbZHN0VmFsc11bZHN0XSArPSB0aGlzLnZhbHVlc1tzcmNWYWxzXVtzcmNdICogdGhpcy53ZWlnaHRzW3dnXVtzcmNdW2RzdF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy52YWx1ZXNbZHN0VmFsc10gPSB0aGlzLnRvdGFsc1tkc3RWYWxzXS5tYXAoKHRvdGFsLCBpZHgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hY3RGbih0b3RhbCArIHRoaXMuYmlhc2VzW3dnXVtpZHhdKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGJhY2t3YXJkKGxhYmVscykge1xuICAgICAgICBmb3IgKGxldCB3ZyA9IHRoaXMud2VpZ2h0cy5sZW5ndGggLSAxOyB3ZyA+PSAwOyB3Zy0tKSB7XG4gICAgICAgICAgICBsZXQgc3JjVmFscyA9IHdnO1xuICAgICAgICAgICAgbGV0IGRzdFZhbHMgPSB3ZyArIDE7XG4gICAgICAgICAgICBmb3IgKGxldCBzcmMgPSAwOyBzcmMgPCB0aGlzLndlaWdodHNbd2ddLmxlbmd0aDsgc3JjKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgZXJyID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBkc3QgPSAwOyBkc3QgPCB0aGlzLndlaWdodHNbd2ddW3NyY10ubGVuZ3RoOyBkc3QrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAod2cgPT09IHRoaXMud2VpZ2h0cy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnIgKz0gbGFiZWxzW2RzdF0gLSB0aGlzLnZhbHVlc1tkc3RWYWxzXVtkc3RdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXJbZHN0VmFsc11bZHN0XSA9IGVycjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVyciArPSB0aGlzLmRlcltkc3RWYWxzXVtkc3RdICogdGhpcy53ZWlnaHRzW3dnXVtzcmNdW2RzdF07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5kZXJUb3RhbHNbc3JjVmFsc11bc3JjXSA9IGVycjtcbiAgICAgICAgICAgICAgICB0aGlzLmRlcltzcmNWYWxzXVtzcmNdID0gZXJyICogdGhpcy5kZXJGbih0aGlzLnZhbHVlc1tzcmNWYWxzXVtzcmNdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICB1cGRhdGVXZWlnaHRzKCkge1xuICAgICAgICBmb3IgKGxldCB3ZyA9IDA7IHdnIDwgdGhpcy53ZWlnaHRzLmxlbmd0aDsgd2crKykge1xuICAgICAgICAgICAgbGV0IHNyY1ZhbHMgPSB3ZztcbiAgICAgICAgICAgIGxldCBkc3RWYWxzID0gd2cgKyAxO1xuICAgICAgICAgICAgZm9yIChsZXQgc3JjID0gMDsgc3JjIDwgdGhpcy53ZWlnaHRzW3dnXS5sZW5ndGg7IHNyYysrKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZHN0ID0gMDsgZHN0IDwgdGhpcy53ZWlnaHRzW3dnXVtzcmNdLmxlbmd0aDsgZHN0KyspIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1vbWVudHVtID0gdGhpcy53ZWlnaHRDaGFuZ2VzW3dnXVtzcmNdW2RzdF0gKiAwLjE7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2VpZ2h0Q2hhbmdlc1t3Z11bc3JjXVtkc3RdID0gKHRoaXMudmFsdWVzW3NyY1ZhbHNdW3NyY10gKiB0aGlzLmRlcltkc3RWYWxzXVtkc3RdICogdGhpcy5sZWFyblJhdGUpICsgbW9tZW50dW07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2VpZ2h0c1t3Z11bc3JjXVtkc3RdICs9IHRoaXMud2VpZ2h0Q2hhbmdlc1t3Z11bc3JjXVtkc3RdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYmlhc2VzW3dnXSA9IHRoaXMuYmlhc2VzW3dnXS5tYXAoKGJpYXMsIGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxlYXJuUmF0ZSAqIHRoaXMuZGVyW2RzdFZhbHNdW2lkeF0gKyBiaWFzO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgbXNlKCkge1xuICAgICAgICBsZXQgZXJyID0gMDtcbiAgICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLmRlclRvdGFscy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgZXJyICs9IHRoaXMuZGVyVG90YWxzW2pdLnJlZHVjZSgobGFzdCwgY3VycmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxhc3QgKyBNYXRoLnBvdyhjdXJyZW50LCAyKTtcbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlcnIgLyBjb3VudDtcbiAgICB9XG59XG5OZXR3b3JrLmFjdGl2YXRpb25NZXRob2RzID0ge1xuICAgIFJlTFU6IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIHJldHVybiBNYXRoLm1heCh4LCAwKTtcbiAgICB9LFxuICAgIHNpZ21vaWQ6IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIHJldHVybiAxIC8gKDEgKyBNYXRoLmV4cCgteCkpO1xuICAgIH0sXG4gICAgdGFuaDogZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgbGV0IHZhbCA9IChNYXRoLmV4cCh4KSAtIE1hdGguZXhwKC14KSkgLyAoTWF0aC5leHAoeCkgKyBNYXRoLmV4cCgteCkpO1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH1cbn07XG5OZXR3b3JrLmRlcml2YXRpdmVNZXRob2RzID0ge1xuICAgIFJlTFU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBsZXQgZGVyID0gdmFsdWUgPD0gMCA/IDAgOiAxO1xuICAgICAgICByZXR1cm4gZGVyO1xuICAgIH0sXG4gICAgc2lnbW9pZDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGxldCBzaWcgPSBOZXR3b3JrLmFjdGl2YXRpb25NZXRob2RzLnNpZ21vaWQ7XG4gICAgICAgIHJldHVybiBzaWcodmFsdWUpICogKDEgLSBzaWcodmFsdWUpKTtcbiAgICB9LFxuICAgIHRhbmg6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gMSAtIE1hdGgucG93KE5ldHdvcmsuYWN0aXZhdGlvbk1ldGhvZHMudGFuaCh2YWx1ZSksIDIpO1xuICAgIH1cbn07XG5OZXR3b3JrLmNvc3RNZXRob2RzID0ge1xuICAgIHNxRXJyOiBmdW5jdGlvbiAodGFyZ2V0LCBndWVzcykge1xuICAgICAgICByZXR1cm4gZ3Vlc3MgLSB0YXJnZXQ7XG4gICAgfSxcbiAgICBhYnNFcnI6IGZ1bmN0aW9uICgpIHtcbiAgICB9XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bmV0d29yay5qcy5tYXAiLCJleHBvcnQgY2xhc3MgUUxlYXJuZXIge1xuICAgIC8vVE9ETyAtIGNoYW5nZSBlcGlzb2RlIHRvIHVwZGF0ZVxuICAgIGNvbnN0cnVjdG9yKFIsIGdhbW1hLCBnb2FsKSB7XG4gICAgICAgIHRoaXMucmF3TWF4ID0gMTtcbiAgICAgICAgdGhpcy5SID0gUjtcbiAgICAgICAgdGhpcy5nYW1tYSA9IGdhbW1hO1xuICAgICAgICB0aGlzLmdvYWwgPSBnb2FsO1xuICAgICAgICB0aGlzLlEgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgc3RhdGUgaW4gUikge1xuICAgICAgICAgICAgdGhpcy5RW3N0YXRlXSA9IHt9O1xuICAgICAgICAgICAgZm9yICh2YXIgYWN0aW9uIGluIFJbc3RhdGVdKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5RW3N0YXRlXVthY3Rpb25dID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdhbW1hID0gZ2FtbWE7XG4gICAgfVxuICAgIGdyb3coc3RhdGUsIGFjdGlvbnMpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhY3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAvL3Jld2FyZCBpcyBjdXJyZW50bHkgdW5rbm93blxuICAgICAgICAgICAgdGhpcy5SW3N0YXRlXVthY3Rpb25zW2ldXSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZXhwbG9yZShwcm9tKSB7XG4gICAgfVxuICAgIHRyYW5zaXRpb24oc3RhdGUsIGFjdGlvbikge1xuICAgICAgICAvL2lzIHRoZSBzdGF0ZSB1bmV4YW1pbmVkXG4gICAgICAgIGxldCBleGFtaW5lZCA9IHRydWU7XG4gICAgICAgIGxldCBiZXN0QWN0aW9uO1xuICAgICAgICBmb3IgKGFjdGlvbiBpbiB0aGlzLlJbc3RhdGVdKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5SW3N0YXRlXVthY3Rpb25dID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgYmVzdEFjdGlvbiA9IGFjdGlvbjtcbiAgICAgICAgICAgICAgICBleGFtaW5lZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJlc3RBY3Rpb24gPSB0aGlzLm1heChhY3Rpb24pO1xuICAgICAgICB0aGlzLlFbc3RhdGVdW2FjdGlvbl0gPSB0aGlzLlJbc3RhdGVdW2FjdGlvbl0gKyAodGhpcy5nYW1tYSAqIHRoaXMuUVthY3Rpb25dW2Jlc3RBY3Rpb25dKTtcbiAgICB9XG4gICAgbWF4KHN0YXRlKSB7XG4gICAgICAgIHZhciBtYXggPSAwLCBtYXhBY3Rpb24gPSBudWxsO1xuICAgICAgICBmb3IgKHZhciBhY3Rpb24gaW4gdGhpcy5RW3N0YXRlXSkge1xuICAgICAgICAgICAgaWYgKCFtYXhBY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBtYXggPSB0aGlzLlFbc3RhdGVdW2FjdGlvbl07XG4gICAgICAgICAgICAgICAgbWF4QWN0aW9uID0gYWN0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5RW3N0YXRlXVthY3Rpb25dID09PSBtYXggJiYgKE1hdGgucmFuZG9tKCkgPiAwLjUpKSB7XG4gICAgICAgICAgICAgICAgbWF4ID0gdGhpcy5RW3N0YXRlXVthY3Rpb25dO1xuICAgICAgICAgICAgICAgIG1heEFjdGlvbiA9IGFjdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuUVtzdGF0ZV1bYWN0aW9uXSA+IG1heCkge1xuICAgICAgICAgICAgICAgIG1heCA9IHRoaXMuUVtzdGF0ZV1bYWN0aW9uXTtcbiAgICAgICAgICAgICAgICBtYXhBY3Rpb24gPSBhY3Rpb247XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1heEFjdGlvbjtcbiAgICB9XG4gICAgcG9zc2libGUoc3RhdGUpIHtcbiAgICAgICAgdmFyIHBvc3NpYmxlID0gW107XG4gICAgICAgIGZvciAodmFyIGFjdGlvbiBpbiB0aGlzLlJbc3RhdGVdKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5SW3N0YXRlXVthY3Rpb25dID4gLTEpIHtcbiAgICAgICAgICAgICAgICBwb3NzaWJsZS5wdXNoKGFjdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBvc3NpYmxlW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBvc3NpYmxlLmxlbmd0aCldO1xuICAgIH1cbiAgICBlcGlzb2RlKHN0YXRlKSB7XG4gICAgICAgIHRoaXMudHJhbnNpdGlvbihzdGF0ZSwgdGhpcy5wb3NzaWJsZShzdGF0ZSkpO1xuICAgICAgICByZXR1cm4gdGhpcy5RO1xuICAgIH1cbiAgICBub3JtYWxpemUoKSB7XG4gICAgICAgIGZvciAodmFyIHN0YXRlIGluIHRoaXMuUSkge1xuICAgICAgICAgICAgZm9yICh2YXIgYWN0aW9uIGluIHRoaXMuUVtzdGF0ZV0pIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5RW2FjdGlvbl1bc3RhdGVdID49IHRoaXMucmF3TWF4KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmF3TWF4ID0gdGhpcy5RW2FjdGlvbl1bc3RhdGVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBzdGF0ZSBpbiB0aGlzLlEpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGFjdGlvbiBpbiB0aGlzLlFbc3RhdGVdKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5RW2FjdGlvbl1bc3RhdGVdID0gTWF0aC5yb3VuZCh0aGlzLlFbYWN0aW9uXVtzdGF0ZV0gLyB0aGlzLnJhd01heCAqIDEwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1RTGVhcm5lci5qcy5tYXAiLCJpbXBvcnQgeyBzdGFuZGFyZGl6ZWQsIGRhdGFUb01hdHJpeCB9IGZyb20gJy4vdXRpbHMnO1xuZXhwb3J0IGZ1bmN0aW9uIG9scyhpdnMsIGR2KSB7XG4gICAgbGV0IGRhdGEgPSBkYXRhVG9NYXRyaXgoaXZzLCB0aGlzLnN0YW5kYXJkaXplZCk7XG4gICAgbGV0IGR2RGF0YSA9IGR2LmRhdGE7XG4gICAgbGV0IG4gPSBkdkRhdGEubGVuZ3RoO1xuICAgIGxldCBtZWFucyA9IGl2cy5tYXAoKGEpID0+IHsgcmV0dXJuIGEubWVhbjsgfSk7XG4gICAgbGV0IHNkcyA9IGl2cy5tYXAoKGEpID0+IHsgcmV0dXJuIGEuc2Q7IH0pO1xuICAgIGxldCB2YXJzID0gaXZzLm1hcCgoYSkgPT4geyByZXR1cm4gW2EudmFyaWFuY2VdOyB9KTtcbiAgICBtZWFucy51bnNoaWZ0KDEpO1xuICAgIHNkcy51bnNoaWZ0KDEpO1xuICAgIHZhcnMudW5zaGlmdChbMV0pO1xuICAgIGlmICh0aGlzLnN0YW5kYXJkaXplZCkge1xuICAgICAgICBkdkRhdGEgPSBzdGFuZGFyZGl6ZWQoZHYuZGF0YSk7XG4gICAgfVxuICAgIGxldCBYID0gZGF0YTtcbiAgICBsZXQgWSA9IGR2RGF0YS5tYXAoKHkpID0+IHsgcmV0dXJuIFt5XTsgfSk7XG4gICAgbGV0IFhwcmltZSA9IGpTdGF0LnRyYW5zcG9zZShYKTtcbiAgICBsZXQgWHByaW1lWCA9IGpTdGF0Lm11bHRpcGx5KFhwcmltZSwgWCk7XG4gICAgbGV0IFhwcmltZVkgPSBqU3RhdC5tdWx0aXBseShYcHJpbWUsIFkpO1xuICAgIC8vY29lZmZpY2llbnRzXG4gICAgbGV0IGIgPSBqU3RhdC5tdWx0aXBseShqU3RhdC5pbnYoWHByaW1lWCksIFhwcmltZVkpO1xuICAgIHRoaXMuYmV0YXMgPSBiLnJlZHVjZSgoYSwgYikgPT4geyByZXR1cm4gYS5jb25jYXQoYik7IH0pO1xuICAgIC8vc3RhbmRhcmQgZXJyb3Igb2YgdGhlIGNvZWZmaWNpZW50c1xuICAgIHRoaXMuc3RFcnJDb2VmZiA9IGpTdGF0Lm11bHRpcGx5KGpTdGF0LmludihYcHJpbWVYKSwgdmFycylcbiAgICAgICAgLnJlZHVjZSgoYSwgYikgPT4geyByZXR1cm4gYS5jb25jYXQoYik7IH0pO1xuICAgIC8vdCBzdGF0aXN0aWNzXG4gICAgdGhpcy50U3RhdHMgPSB0aGlzLnN0RXJyQ29lZmYubWFwKChzZSwgaSkgPT4geyByZXR1cm4gdGhpcy5iZXRhc1tpXSAvIHNlOyB9KTtcbiAgICAvL3AgdmFsdWVzXG4gICAgdGhpcy5wVmFsdWVzID0gdGhpcy50U3RhdHMubWFwKCh0LCBpKSA9PiB7IHJldHVybiBqU3RhdC50dGVzdCh0LCBtZWFuc1tpXSwgc2RzW2ldLCBuKTsgfSk7XG4gICAgLy9yZXNpZHVhbHNcbiAgICBsZXQgeWhhdCA9IFtdO1xuICAgIGxldCByZXMgPSBkdi5kYXRhLm1hcCgoZCwgaSkgPT4ge1xuICAgICAgICBkYXRhW2ldLnNoaWZ0KCk7XG4gICAgICAgIGxldCByb3cgPSBkYXRhW2ldO1xuICAgICAgICB5aGF0W2ldID0gdGhpcy5wcmVkaWN0KHJvdyk7XG4gICAgICAgIHJldHVybiBkIC0geWhhdFtpXTtcbiAgICB9KTtcbiAgICBsZXQgcmVzaWR1YWwgPSB5aGF0O1xuICAgIHJldHVybiB0aGlzLmJldGFzO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHBscyh4LCB5KSB7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZWdyZXNzaW9uLmpzLm1hcCIsImltcG9ydCB7IFFDb21wb25lbnQgfSBmcm9tICcuL1FDb21wb25lbnQnO1xuLypcbiogVXRpbGl0eSBTeXN0ZW1zIGNsYXNzXG4qL1xuZXhwb3J0IGNsYXNzIFVTeXMgZXh0ZW5kcyBRQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBvcHRpb25zLCBkYXRhKSB7XG4gICAgICAgIHN1cGVyKG5hbWUpO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICB0aGlzLnJlc3VsdHMgPSBbXTtcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICB9XG4gICAgdXBkYXRlKGFnZW50LCBzdGVwKSB7XG4gICAgICAgIHZhciB0bXAgPSBbXSwgbWF4ID0gMCwgYXZnLCB0b3A7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5vcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0bXBbaV0gPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLm9wdGlvbnNbaV0uY29uc2lkZXJhdGlvbnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgYyA9IHRoaXMub3B0aW9uc1tpXS5jb25zaWRlcmF0aW9uc1tqXTtcbiAgICAgICAgICAgICAgICBsZXQgeCA9IGMueChhZ2VudCwgdGhpcy5vcHRpb25zW2ldLnBhcmFtcyk7XG4gICAgICAgICAgICAgICAgdG1wW2ldICs9IGMuZih4LCBjLm0sIGMuYiwgYy5rKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF2ZyA9IHRtcFtpXSAvIHRoaXMub3B0aW9uc1tpXS5jb25zaWRlcmF0aW9ucy5sZW5ndGg7XG4gICAgICAgICAgICB0aGlzLnJlc3VsdHMucHVzaCh7IHBvaW50OiBhZ2VudC5pZCwgb3B0OiB0aGlzLm9wdGlvbnNbaV0ubmFtZSwgcmVzdWx0OiBhdmcgfSk7XG4gICAgICAgICAgICBpZiAoYXZnID4gbWF4KSB7XG4gICAgICAgICAgICAgICAgYWdlbnQudG9wID0geyBuYW1lOiB0aGlzLm9wdGlvbnNbaV0ubmFtZSwgdXRpbDogYXZnIH07XG4gICAgICAgICAgICAgICAgdG9wID0gaTtcbiAgICAgICAgICAgICAgICBtYXggPSBhdmc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vcHRpb25zW3RvcF0uYWN0aW9uKHN0ZXAsIGFnZW50KTtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1VU3lzLmpzLm1hcCIsImNsYXNzIFJhbmRvbSB7XG4gICAgY29uc3RydWN0b3Ioc2VlZCkge1xuICAgICAgICB0aGlzLnNlZWQgPSBzZWVkO1xuICAgICAgICB0aGlzLmNhbGxlZCA9IDA7XG4gICAgfVxuICAgIHJhbmRSYW5nZShtaW4sIG1heCkge1xuICAgICAgICByZXR1cm4gKG1heCAtIG1pbikgKiB0aGlzLnJhbmRvbSgpICsgbWluO1xuICAgIH1cbiAgICBtYXQocm93cywgY29scywgZGlzdCA9ICdyYW5kb20nKSB7XG4gICAgICAgIGxldCByYW5kcyA9IFtdO1xuICAgICAgICBpZiAodHlwZW9mIHJvd3MgPT0gJ251bWJlcicgJiYgdHlwZW9mIGNvbHMgPT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgcm93czsgcisrKSB7XG4gICAgICAgICAgICAgICAgcmFuZHNbcl0gPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjID0gMDsgYyA8IGNvbHM7IGMrKykge1xuICAgICAgICAgICAgICAgICAgICByYW5kc1tyXVtjXSA9IHRoaXNbZGlzdF0oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJhbmRzO1xuICAgIH1cbiAgICBhcnJheShuLCBkaXN0ID0gJ3JhbmRvbScpIHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBsZXQgcmFuZHMgPSBbXTtcbiAgICAgICAgd2hpbGUgKGkgPCBuKSB7XG4gICAgICAgICAgICByYW5kc1tpXSA9IHRoaXNbZGlzdF0oKTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmFuZHM7XG4gICAgfVxuICAgIHBpY2soYXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIGFycmF5W01hdGguZmxvb3IodGhpcy5yYW5kb20oKSAqIGFycmF5Lmxlbmd0aCldO1xuICAgIH1cbiAgICAvKipcbiAgICAqQmVsb3cgaXMgYWRhcHRlZCBmcm9tIGpTdGF0Omh0dHBzOi8vZ2l0aHViLmNvbS9qc3RhdC9qc3RhdC9ibG9iL21hc3Rlci9zcmMvc3BlY2lhbC5qc1xuICAgICoqL1xuICAgIHJhbmRuKCkge1xuICAgICAgICB2YXIgdSwgdiwgeCwgeSwgcTtcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgdSA9IHRoaXMucmFuZG9tKCk7XG4gICAgICAgICAgICB2ID0gMS43MTU2ICogKHRoaXMucmFuZG9tKCkgLSAwLjUpO1xuICAgICAgICAgICAgeCA9IHUgLSAwLjQ0OTg3MTtcbiAgICAgICAgICAgIHkgPSBNYXRoLmFicyh2KSArIDAuMzg2NTk1O1xuICAgICAgICAgICAgcSA9IHggKiB4ICsgeSAqICgwLjE5NjAwICogeSAtIDAuMjU0NzIgKiB4KTtcbiAgICAgICAgfSB3aGlsZSAocSA+IDAuMjc1OTcgJiYgKHEgPiAwLjI3ODQ2IHx8IHYgKiB2ID4gLTQgKiBNYXRoLmxvZyh1KSAqIHUgKiB1KSk7XG4gICAgICAgIHJldHVybiB2IC8gdTtcbiAgICB9XG4gICAgcmFuZGcoc2hhcGUpIHtcbiAgICAgICAgdmFyIG9hbHBoID0gc2hhcGU7XG4gICAgICAgIHZhciBhMSwgYTIsIHUsIHYsIHg7XG4gICAgICAgIGlmICghc2hhcGUpXG4gICAgICAgICAgICBzaGFwZSA9IDE7XG4gICAgICAgIGlmIChzaGFwZSA8IDEpXG4gICAgICAgICAgICBzaGFwZSArPSAxO1xuICAgICAgICBhMSA9IHNoYXBlIC0gMSAvIDM7XG4gICAgICAgIGEyID0gMSAvIE1hdGguc3FydCg5ICogYTEpO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgeCA9IHRoaXMucmFuZG4oKTtcbiAgICAgICAgICAgICAgICB2ID0gMSArIGEyICogeDtcbiAgICAgICAgICAgIH0gd2hpbGUgKHYgPD0gMCk7XG4gICAgICAgICAgICB2ID0gdiAqIHYgKiB2O1xuICAgICAgICAgICAgdSA9IHRoaXMucmFuZG9tKCk7XG4gICAgICAgIH0gd2hpbGUgKHUgPiAxIC0gMC4zMzEgKiBNYXRoLnBvdyh4LCA0KSAmJlxuICAgICAgICAgICAgTWF0aC5sb2codSkgPiAwLjUgKiB4ICogeCArIGExICogKDEgLSB2ICsgTWF0aC5sb2codikpKTtcbiAgICAgICAgLy8gYWxwaGEgPiAxXG4gICAgICAgIGlmIChzaGFwZSA9PSBvYWxwaClcbiAgICAgICAgICAgIHJldHVybiBhMSAqIHY7XG4gICAgICAgIC8vIGFscGhhIDwgMVxuICAgICAgICBkbyB7XG4gICAgICAgICAgICB1ID0gdGhpcy5yYW5kb20oKTtcbiAgICAgICAgfSB3aGlsZSAodSA9PT0gMCk7XG4gICAgICAgIHJldHVybiBNYXRoLnBvdyh1LCAxIC8gb2FscGgpICogYTEgKiB2O1xuICAgIH1cbiAgICBiZXRhKGFscGhhLCBiZXRhKSB7XG4gICAgICAgIHZhciB1ID0gdGhpcy5yYW5kZyhhbHBoYSk7XG4gICAgICAgIHJldHVybiB1IC8gKHUgKyB0aGlzLnJhbmRnKGJldGEpKTtcbiAgICB9XG4gICAgZ2FtbWEoc2hhcGUsIHNjYWxlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJhbmRnKHNoYXBlKSAqIHNjYWxlO1xuICAgIH1cbiAgICBsb2dOb3JtYWwobXUsIHNpZ21hKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmV4cCh0aGlzLnJhbmRuKCkgKiBzaWdtYSArIG11KTtcbiAgICB9XG4gICAgbm9ybWFsKG1lYW4gPSAwLCBzdGQgPSAxKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJhbmRuKCkgKiBzdGQgKyBtZWFuO1xuICAgIH1cbiAgICBwb2lzc29uKGwpIHtcbiAgICAgICAgdmFyIHAgPSAxLCBrID0gMCwgTCA9IE1hdGguZXhwKC1sKTtcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgaysrO1xuICAgICAgICAgICAgcCAqPSB0aGlzLnJhbmRvbSgpO1xuICAgICAgICB9IHdoaWxlIChwID4gTCk7XG4gICAgICAgIHJldHVybiBrIC0gMTtcbiAgICB9XG4gICAgdChkb2YpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmFuZG4oKSAqIE1hdGguc3FydChkb2YgLyAoMiAqIHRoaXMucmFuZGcoZG9mIC8gMikpKTtcbiAgICB9XG4gICAgd2VpYnVsbChzY2FsZSwgc2hhcGUpIHtcbiAgICAgICAgcmV0dXJuIHNjYWxlICogTWF0aC5wb3coLU1hdGgubG9nKHRoaXMucmFuZG9tKCkpLCAxIC8gc2hhcGUpO1xuICAgIH1cbn1cbi8qKlxuKiBCb2IgSmVua2lucycgc21hbGwgbm9uY3J5cHRvZ3JhcGhpYyBQUk5HIChwc2V1ZG9yYW5kb20gbnVtYmVyIGdlbmVyYXRvcikgcG9ydGVkIHRvIEphdmFTY3JpcHRcbiogYWRhcHRlZCBmcm9tOlxuKiBodHRwczovL2dpdGh1Yi5jb20vZ3JhdWUvYnVydGxlcHJuZ1xuKiB3aGljaCBpcyBmcm9tIGh0dHA6Ly93d3cuYnVydGxlYnVydGxlLm5ldC9ib2IvcmFuZC9zbWFsbHBybmcuaHRtbFxuKi9cbmV4cG9ydCBjbGFzcyBSTkdCdXJ0bGUgZXh0ZW5kcyBSYW5kb20ge1xuICAgIGNvbnN0cnVjdG9yKHNlZWQpIHtcbiAgICAgICAgc3VwZXIoc2VlZCk7XG4gICAgICAgIHRoaXMuc2VlZCA+Pj49IDA7XG4gICAgICAgIHRoaXMuY3R4ID0gbmV3IEFycmF5KDQpO1xuICAgICAgICB0aGlzLmN0eFswXSA9IDB4ZjFlYTVlZWQ7XG4gICAgICAgIHRoaXMuY3R4WzFdID0gdGhpcy5jdHhbMl0gPSB0aGlzLmN0eFszXSA9IHRoaXMuc2VlZDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyMDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnJhbmRvbSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJvdCh4LCBrKSB7XG4gICAgICAgIHJldHVybiAoeCA8PCBrKSB8ICh4ID4+ICgzMiAtIGspKTtcbiAgICB9XG4gICAgcmFuZG9tKCkge1xuICAgICAgICB2YXIgY3R4ID0gdGhpcy5jdHg7XG4gICAgICAgIHZhciBlID0gKGN0eFswXSAtIHRoaXMucm90KGN0eFsxXSwgMjcpKSA+Pj4gMDtcbiAgICAgICAgY3R4WzBdID0gKGN0eFsxXSBeIHRoaXMucm90KGN0eFsyXSwgMTcpKSA+Pj4gMDtcbiAgICAgICAgY3R4WzFdID0gKGN0eFsyXSArIGN0eFszXSkgPj4+IDA7XG4gICAgICAgIGN0eFsyXSA9IChjdHhbM10gKyBlKSA+Pj4gMDtcbiAgICAgICAgY3R4WzNdID0gKGUgKyBjdHhbMF0pID4+PiAwO1xuICAgICAgICB0aGlzLmNhbGxlZCArPSAxO1xuICAgICAgICByZXR1cm4gY3R4WzNdIC8gNDI5NDk2NzI5Ni4wO1xuICAgIH1cbn1cbi8qXG4qIHhvcnNoaWZ0NyosIGJ5IEZyYW7Dp29pcyBQYW5uZXRvbiBhbmQgUGllcnJlIEwnZWN1eWVyOiAzMi1iaXQgeG9yLXNoaWZ0IHJhbmRvbSBudW1iZXIgZ2VuZXJhdG9yXG4qIGFkZHMgcm9idXN0bmVzcyBieSBhbGxvd2luZyBtb3JlIHNoaWZ0cyB0aGFuIE1hcnNhZ2xpYSdzIG9yaWdpbmFsIHRocmVlLiBJdCBpcyBhIDctc2hpZnQgZ2VuZXJhdG9yIHdpdGggMjU2IGJpdHMsIHRoYXQgcGFzc2VzIEJpZ0NydXNoIHdpdGggbm8gc3lzdG1hdGljIGZhaWx1cmVzLlxuKiBBZGFwdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2RhdmlkYmF1L3hzcmFuZFxuKi9cbmV4cG9ydCBjbGFzcyBSTkd4b3JzaGlmdDcgZXh0ZW5kcyBSYW5kb20ge1xuICAgIGNvbnN0cnVjdG9yKHNlZWQpIHtcbiAgICAgICAgbGV0IGosIHcsIFggPSBbXTtcbiAgICAgICAgc3VwZXIoc2VlZCk7XG4gICAgICAgIC8vIFNlZWQgc3RhdGUgYXJyYXkgdXNpbmcgYSAzMi1iaXQgaW50ZWdlci5cbiAgICAgICAgdyA9IFhbMF0gPSB0aGlzLnNlZWQ7XG4gICAgICAgIC8vIEVuZm9yY2UgYW4gYXJyYXkgbGVuZ3RoIG9mIDgsIG5vdCBhbGwgemVyb2VzLlxuICAgICAgICB3aGlsZSAoWC5sZW5ndGggPCA4KSB7XG4gICAgICAgICAgICBYLnB1c2goMCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChqID0gMDsgaiA8IDggJiYgWFtqXSA9PT0gMDsgKytqKSB7XG4gICAgICAgICAgICBpZiAoaiA9PSA4KSB7XG4gICAgICAgICAgICAgICAgdyA9IFhbN10gPSAtMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHcgPSBYW2pdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMueCA9IFg7XG4gICAgICAgIHRoaXMuaSA9IDA7XG4gICAgICAgIC8vIERpc2NhcmQgYW4gaW5pdGlhbCAyNTYgdmFsdWVzLlxuICAgICAgICBmb3IgKGogPSAyNTY7IGogPiAwOyAtLWopIHtcbiAgICAgICAgICAgIHRoaXMucmFuZG9tKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmFuZG9tKCkge1xuICAgICAgICBsZXQgWCA9IHRoaXMueCwgaSA9IHRoaXMuaSwgdCwgdiwgdywgcmVzO1xuICAgICAgICB0ID0gWFtpXTtcbiAgICAgICAgdCBePSAodCA+Pj4gNyk7XG4gICAgICAgIHYgPSB0IF4gKHQgPDwgMjQpO1xuICAgICAgICB0ID0gWFsoaSArIDEpICYgN107XG4gICAgICAgIHYgXj0gdCBeICh0ID4+PiAxMCk7XG4gICAgICAgIHQgPSBYWyhpICsgMykgJiA3XTtcbiAgICAgICAgdiBePSB0IF4gKHQgPj4+IDMpO1xuICAgICAgICB0ID0gWFsoaSArIDQpICYgN107XG4gICAgICAgIHYgXj0gdCBeICh0IDw8IDcpO1xuICAgICAgICB0ID0gWFsoaSArIDcpICYgN107XG4gICAgICAgIHQgPSB0IF4gKHQgPDwgMTMpO1xuICAgICAgICB2IF49IHQgXiAodCA8PCA5KTtcbiAgICAgICAgWFtpXSA9IHY7XG4gICAgICAgIHRoaXMuaSA9IChpICsgMSkgJiA3O1xuICAgICAgICByZXMgPSAodiA+Pj4gMCkgLyAoKDEgPDwgMzApICogNCk7XG4gICAgICAgIHRoaXMuY2FsbGVkICs9IDE7XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmFuZG9tLmpzLm1hcCIsImV4cG9ydCAqIGZyb20gJy4vdXRpbHMnO1xuZXhwb3J0IHsgUUNvbXBvbmVudCB9IGZyb20gJy4vUUNvbXBvbmVudCc7XG5leHBvcnQgeyBCRElBZ2VudCB9IGZyb20gJy4vYmRpJztcbmV4cG9ydCAqIGZyb20gJy4vYmVoYXZpb3JUcmVlJztcbmV4cG9ydCAqIGZyb20gJy4vY29tcGFydG1lbnQnO1xuZXhwb3J0IHsgQ29udGFjdFBhdGNoIH0gZnJvbSAnLi9jb250YWN0UGF0Y2gnO1xuZXhwb3J0IHsgRW52aXJvbm1lbnQgfSBmcm9tICcuL2Vudmlyb25tZW50JztcbmV4cG9ydCAqIGZyb20gJy4vZXBpJztcbmV4cG9ydCAqIGZyb20gJy4vZXZlbnRzJztcbmV4cG9ydCB7IEV4cGVyaW1lbnQgfSBmcm9tICcuL2V4cGVyaW1lbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9nZW5ldGljJztcbmV4cG9ydCB7IEV2b2x1dGlvbmFyeSB9IGZyb20gJy4vZXZvbHV0aW9uYXJ5JztcbmV4cG9ydCB7IEh5YnJpZEF1dG9tYXRhIH0gZnJvbSAnLi9oYSc7XG5leHBvcnQgKiBmcm9tICcuL2h0bic7XG5leHBvcnQgKiBmcm9tICcuL2ludGVyZmFjZXMnO1xuZXhwb3J0ICogZnJvbSAnLi9tYyc7XG5leHBvcnQgeyBrTWVhbiB9IGZyb20gJy4va21lYW4nO1xuZXhwb3J0IHsgS05OIH0gZnJvbSAnLi9rbm4nO1xuZXhwb3J0ICogZnJvbSAnLi9tYXRoJztcbmV4cG9ydCB7IE5ldHdvcmsgfSBmcm9tICcuL25ldHdvcmsnO1xuZXhwb3J0IHsgUUxlYXJuZXIgfSBmcm9tICcuL1FMZWFybmVyJztcbmV4cG9ydCAqIGZyb20gJy4vcmVncmVzc2lvbic7XG5leHBvcnQgeyBTdGF0ZU1hY2hpbmUgfSBmcm9tICcuL3N0YXRlTWFjaGluZSc7XG5leHBvcnQgKiBmcm9tICcuL1VTeXMnO1xuZXhwb3J0ICogZnJvbSAnLi9yYW5kb20nO1xuZXhwb3J0IHZhciB2ZXJzaW9uID0gJzAuMC41Jztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1haW4uanMubWFwIiwiaW1wb3J0ICogYXMgcWVwaWtpdCBmcm9tICcuL21haW4nO1xubGV0IFFFcGlLaXQgPSBxZXBpa2l0O1xuZm9yIChsZXQga2V5IGluIFFFcGlLaXQpIHtcbiAgICBpZiAoa2V5ID09ICd2ZXJzaW9uJykge1xuICAgICAgICBjb25zb2xlLmxvZyhRRXBpS2l0W2tleV0pO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXFlcGlraXQuanMubWFwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQU8sTUFBTSxPQUFPLEdBQUcsQ0FBQyxDQUFD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QyxLQUFLLFdBQVcsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQzdELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDO1NBQ3JFO2FBQ0ksSUFBSSxRQUFRLElBQUksQ0FBQyxLQUFLLFdBQVcsRUFBRTtZQUNwQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQztTQUNyRTtLQUNKO0NBQ0o7QUFDRCxBQUFPLFNBQVMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUU7SUFDakMsS0FBSyxJQUFJLEtBQUssSUFBSSxNQUFNLEVBQUU7UUFDdEIsSUFBSSxRQUFRLElBQUksQ0FBQyxLQUFLLFdBQVcsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQzdELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDO1NBQ3JFO2FBQ0ksSUFBSSxRQUFRLElBQUksQ0FBQyxLQUFLLFdBQVcsRUFBRTtZQUNwQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQztTQUNyRTtLQUNKO0NBQ0o7QUFDRCxBQUFPLFNBQVMsV0FBVyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUU7SUFDdEMsS0FBSyxJQUFJLEtBQUssSUFBSSxNQUFNLEVBQUU7UUFDdEIsSUFBSSxR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L0IsTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2xFLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzVCLE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDcEIsVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsWUFBWSxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxVQUFVLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztLQUMzTDtJQUNELGFBQWEsQ0FBQyxLQUFLLEVBQUU7UUFDakIsSUFBSSxZQUFZLEdBQUcsRUFBRSxFQUFFLFFBQVEsR0FBRyxFQUFFLEVBQUUsU0FBUyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDO1FBQ2hFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN4QyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDNUIsSUFBSSxPQUFPLENBQUMsQ0FBQyxJQUFJLEtBQUssV0FBVyxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFO2dCQUNyRCxDQUFDLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQzthQUNsQjtZQUNELFlBQVksQ0FBQyxDQUFDLENBQUMs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LENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDN0UsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDN0UsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDaEYsS0FBSyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRTtZQUNoRCxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUN0QixJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZ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USxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDO1NBQ3JELE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7O0lBRS9DLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7SUFFN0UsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7O0lBRTFGLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNkLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSztRQUM1QixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDaEIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xCLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzVCLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN0QixDQUFDLENBQUM7SUFDSCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUM7SUFDcEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0NBQ3JC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
