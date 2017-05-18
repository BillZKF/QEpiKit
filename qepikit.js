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
/*export function partition(array, left, right) {
    var cmp = array[right - 1],
        minEnd = left,
        maxEnd;
    for (maxEnd = left; maxEnd < right - 1; maxEnd += 1) {
        if (array[maxEnd] <= cmp) {
            swap(array, maxEnd, minEnd);
            minEnd += 1;
        }
    }
    swap(array, minEnd, right - 1);
    return minEnd;
}

export function swap(array, i, j) {
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
    return array;
}

export function quicksort(array:number[], left: number, right: number) {
    if (left < right) {
        var p = partition(array, left, right);
        quicksort(array, left, p);
        quicksort(array, p + 1, right);
    }
    return array;
}*/
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
            run: r,
            count: count,
            sums: sums,
            means: means,
            freqs: freqs,
            model: model,
            score: 0
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
            this.experimentLog[this.experimentLog.length - 1].best = true;
            console.log('best: ', this.experimentLog[this.experimentLog.length - 1]);
            r++;
        }
        this.improvement = this.improvementScore(this.experimentLog);
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
        let report;
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
            report = this.report(r, cfg);
            this.population[j].score = this.cost(report, this.target);
            report.score = this.population[j].score;
            this.experimentLog.push(report);
        }
    }
    cost(predict, target) {
        let dev = 0;
        let dimensions = 0;
        for (let key in target.means) {
            dev += Math.abs(target.means[key] - predict.means[key]);
            dimensions++;
        }
        for (let key in target.freqs) {
            dev += Math.abs(target.freqs[key] - predict.freqs[key]);
            dimensions++;
        }
        for (let key in target.model) {
            dev += Math.abs(target.model[key] - predict.model[key]);
            dimensions++;
        }
        return dev / dimensions;
    }
    report(r, cfg) {
        let report = super.report(r, cfg);
        return report;
    }
    improvementScore(log, avgGeneration = true) {
        let N = log.length;
        let sum = 0;
        let ranked;
        if (avgGeneration) {
            ranked = this.genAvg(log);
            N = ranked.length;
        }
        else {
            ranked = log.map((d, i) => { d.order = i; return d; });
        }
        ranked.sort(this.dscSort);
        ranked.map((d, i) => { d.rank = i; return d; });
        for (let i = 0; i < ranked.length; i++) {
            sum += Math.abs(ranked[i].order / N - ranked[i].rank / N);
        }
        return 1 - 2 * sum / N;
    }
    genAvg(log) {
        let sums = {};
        let pops = {};
        let avgs = [];
        log.forEach((d) => {
            sums[d.run] = sums[d.run] + d.score || d.score;
            pops[d.run] = pops[d.run] + 1 || 1;
        });
        for (let run in sums) {
            avgs[run] = { order: run, score: sums[run] / pops[run] };
        }
        return avgs;
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
            let diff = best[j].code - gene.code;
            if (!this.discrete) {
                if (diff == 0 || !this.gradient) {
                    gene.code += this.rng.normal(0, 1) * this.mutateRate;
                }
                else {
                    gene.code += diff * this.mutateRate;
                }
            }
            else {
                let upOrDown = diff > 0 ? 1 : -1;
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

/***
*@module QEpiKit
*/
let QEpiKit = qepikit;
for (let key in QEpiKit) {
    if (key == 'version') {
        console.log(QEpiKit[key]);
    }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicWVwaWtpdC5qcyIsInNvdXJjZXMiOlsiZGlzdC91dGlscy5qcyIsImRpc3QvUUNvbXBvbmVudC5qcyIsImRpc3QvYmRpLmpzIiwiZGlzdC9iZWhhdmlvclRyZWUuanMiLCJkaXN0L2NvbXBhcnRtZW50LmpzIiwiZGlzdC9jb250YWN0UGF0Y2guanMiLCJkaXN0L2Vudmlyb25tZW50LmpzIiwiZGlzdC9lcGkuanMiLCJkaXN0L2V2ZW50cy5qcyIsImRpc3Qvc3RhdGVNYWNoaW5lLmpzIiwiZGlzdC9leHBlcmltZW50LmpzIiwiZGlzdC9nZW5ldGljLmpzIiwiZGlzdC9ldm9sdXRpb25hcnkuanMiLCJkaXN0L2hhLmpzIiwiZGlzdC9odG4uanMiLCJkaXN0L21jLmpzIiwiZGlzdC9rbWVhbi5qcyIsImRpc3Qva25uLmpzIiwiZGlzdC9tYXRoLmpzIiwiZGlzdC9uZXR3b3JrLmpzIiwiZGlzdC9RTGVhcm5lci5qcyIsImRpc3QvcmVncmVzc2lvbi5qcyIsImRpc3QvVVN5cy5qcyIsImRpc3QvcmFuZG9tLmpzIiwiZGlzdC9tYWluLmpzIiwiZGlzdC9RRXBpS2l0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBTVUNDRVNTID0gMTtcclxuZXhwb3J0IGNvbnN0IEZBSUxFRCA9IDI7XHJcbmV4cG9ydCBjb25zdCBSVU5OSU5HID0gMztcclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNTVlVSSShkYXRhKSB7XHJcbiAgICB2YXIgZGF0YVN0cmluZztcclxuICAgIHZhciBVUkk7XHJcbiAgICB2YXIgY3N2Q29udGVudCA9IFwiZGF0YTp0ZXh0L2NzdjtjaGFyc2V0PXV0Zi04LFwiO1xyXG4gICAgdmFyIGNzdkNvbnRlbnRBcnJheSA9IFtdO1xyXG4gICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpbmZvQXJyYXkpIHtcclxuICAgICAgICBkYXRhU3RyaW5nID0gaW5mb0FycmF5LmpvaW4oXCIsXCIpO1xyXG4gICAgICAgIGNzdkNvbnRlbnRBcnJheS5wdXNoKGRhdGFTdHJpbmcpO1xyXG4gICAgfSk7XHJcbiAgICBjc3ZDb250ZW50ICs9IGNzdkNvbnRlbnRBcnJheS5qb2luKFwiXFxuXCIpO1xyXG4gICAgVVJJID0gZW5jb2RlVVJJKGNzdkNvbnRlbnQpO1xyXG4gICAgcmV0dXJuIFVSSTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gYXJyYXlGcm9tUmFuZ2Uoc3RhcnQsIGVuZCwgc3RlcCkge1xyXG4gICAgdmFyIHJhbmdlID0gW107XHJcbiAgICB2YXIgaSA9IHN0YXJ0O1xyXG4gICAgd2hpbGUgKGkgPCBlbmQpIHtcclxuICAgICAgICByYW5nZS5wdXNoKGkpO1xyXG4gICAgICAgIGkgKz0gc3RlcDtcclxuICAgIH1cclxuICAgIHJldHVybiByYW5nZTtcclxufVxyXG4vKmV4cG9ydCBmdW5jdGlvbiBwYXJ0aXRpb24oYXJyYXksIGxlZnQsIHJpZ2h0KSB7XHJcbiAgICB2YXIgY21wID0gYXJyYXlbcmlnaHQgLSAxXSxcclxuICAgICAgICBtaW5FbmQgPSBsZWZ0LFxyXG4gICAgICAgIG1heEVuZDtcclxuICAgIGZvciAobWF4RW5kID0gbGVmdDsgbWF4RW5kIDwgcmlnaHQgLSAxOyBtYXhFbmQgKz0gMSkge1xyXG4gICAgICAgIGlmIChhcnJheVttYXhFbmRdIDw9IGNtcCkge1xyXG4gICAgICAgICAgICBzd2FwKGFycmF5LCBtYXhFbmQsIG1pbkVuZCk7XHJcbiAgICAgICAgICAgIG1pbkVuZCArPSAxO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHN3YXAoYXJyYXksIG1pbkVuZCwgcmlnaHQgLSAxKTtcclxuICAgIHJldHVybiBtaW5FbmQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzd2FwKGFycmF5LCBpLCBqKSB7XHJcbiAgICB2YXIgdGVtcCA9IGFycmF5W2ldO1xyXG4gICAgYXJyYXlbaV0gPSBhcnJheVtqXTtcclxuICAgIGFycmF5W2pdID0gdGVtcDtcclxuICAgIHJldHVybiBhcnJheTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHF1aWNrc29ydChhcnJheTpudW1iZXJbXSwgbGVmdDogbnVtYmVyLCByaWdodDogbnVtYmVyKSB7XHJcbiAgICBpZiAobGVmdCA8IHJpZ2h0KSB7XHJcbiAgICAgICAgdmFyIHAgPSBwYXJ0aXRpb24oYXJyYXksIGxlZnQsIHJpZ2h0KTtcclxuICAgICAgICBxdWlja3NvcnQoYXJyYXksIGxlZnQsIHApO1xyXG4gICAgICAgIHF1aWNrc29ydChhcnJheSwgcCArIDEsIHJpZ2h0KTtcclxuICAgIH1cclxuICAgIHJldHVybiBhcnJheTtcclxufSovXHJcbi8qKlxyXG4qIHNodWZmbGUgLSBmaXNoZXIteWF0ZXMgc2h1ZmZsZVxyXG4qL1xyXG5leHBvcnQgZnVuY3Rpb24gc2h1ZmZsZShhcnJheSwgcm5nKSB7XHJcbiAgICB2YXIgY3VycmVudEluZGV4ID0gYXJyYXkubGVuZ3RoLCB0ZW1wb3JhcnlWYWx1ZSwgcmFuZG9tSW5kZXg7XHJcbiAgICAvLyBXaGlsZSB0aGVyZSByZW1haW4gZWxlbWVudHMgdG8gc2h1ZmZsZS4uLlxyXG4gICAgd2hpbGUgKDAgIT09IGN1cnJlbnRJbmRleCkge1xyXG4gICAgICAgIC8vIFBpY2sgYSByZW1haW5pbmcgZWxlbWVudC4uLlxyXG4gICAgICAgIHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vcihybmcucmFuZG9tKCkgKiBjdXJyZW50SW5kZXgpO1xyXG4gICAgICAgIGN1cnJlbnRJbmRleCAtPSAxO1xyXG4gICAgICAgIC8vIEFuZCBzd2FwIGl0IHdpdGggdGhlIGN1cnJlbnQgZWxlbWVudC5cclxuICAgICAgICB0ZW1wb3JhcnlWYWx1ZSA9IGFycmF5W2N1cnJlbnRJbmRleF07XHJcbiAgICAgICAgYXJyYXlbY3VycmVudEluZGV4XSA9IGFycmF5W3JhbmRvbUluZGV4XTtcclxuICAgICAgICBhcnJheVtyYW5kb21JbmRleF0gPSB0ZW1wb3JhcnlWYWx1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBhcnJheTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVVVUlEKCkge1xyXG4gICAgLy8gaHR0cDovL3d3dy5icm9vZmEuY29tL1Rvb2xzL01hdGgudXVpZC5odG1cclxuICAgIHZhciBjaGFycyA9ICcwMTIzNDU2Nzg5QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eicuc3BsaXQoJycpO1xyXG4gICAgdmFyIHV1aWQgPSBuZXcgQXJyYXkoMzYpO1xyXG4gICAgdmFyIHJuZCA9IDAsIHI7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM2OyBpKyspIHtcclxuICAgICAgICBpZiAoaSA9PSA4IHx8IGkgPT0gMTMgfHwgaSA9PSAxOCB8fCBpID09IDIzKSB7XHJcbiAgICAgICAgICAgIHV1aWRbaV0gPSAnLSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGkgPT0gMTQpIHtcclxuICAgICAgICAgICAgdXVpZFtpXSA9ICc0JztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChybmQgPD0gMHgwMilcclxuICAgICAgICAgICAgICAgIHJuZCA9IDB4MjAwMDAwMCArIChNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwKSB8IDA7XHJcbiAgICAgICAgICAgIHIgPSBybmQgJiAweGY7XHJcbiAgICAgICAgICAgIHJuZCA9IHJuZCA+PiA0O1xyXG4gICAgICAgICAgICB1dWlkW2ldID0gY2hhcnNbKGkgPT0gMTkpID8gKHIgJiAweDMpIHwgMHg4IDogcl07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHV1aWQuam9pbignJyk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGFsd2F5cyhhKSB7XHJcbiAgICBpZiAoYSA9PT0gU1VDQ0VTUykge1xyXG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZXZlbnR1YWxseShhKSB7XHJcbiAgICBpZiAoYSA9PT0gU1VDQ0VTUykge1xyXG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIFJVTk5JTkc7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFsVG8oYSwgYikge1xyXG4gICAgaWYgKGEgPT09IGIpIHtcclxuICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIG5vdChyZXN1bHQpIHtcclxuICAgIHZhciBuZXdSZXN1bHQ7XHJcbiAgICBpZiAocmVzdWx0ID09PSBTVUNDRVNTKSB7XHJcbiAgICAgICAgbmV3UmVzdWx0ID0gRkFJTEVEO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAocmVzdWx0ID09PSBGQUlMRUQpIHtcclxuICAgICAgICBuZXdSZXN1bHQgPSBTVUNDRVNTO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ld1Jlc3VsdDtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gbm90RXF1YWxUbyhhLCBiKSB7XHJcbiAgICBpZiAoYSAhPT0gYikge1xyXG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZ3QoYSwgYikge1xyXG4gICAgaWYgKGEgPiBiKSB7XHJcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBndEVxKGEsIGIpIHtcclxuICAgIGlmIChhID49IGIpIHtcclxuICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGx0KGEsIGIpIHtcclxuICAgIGlmIChhIDwgYikge1xyXG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gbHRFcShhLCBiKSB7XHJcbiAgICBpZiAoYSA8PSBiKSB7XHJcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBoYXNQcm9wKGEsIGIpIHtcclxuICAgIGEgPSBhIHx8IGZhbHNlO1xyXG4gICAgaWYgKGEgPT09IGIpIHtcclxuICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGluUmFuZ2UoYSwgYikge1xyXG4gICAgaWYgKGIgPj0gYVswXSAmJiBiIDw9IGFbMV0pIHtcclxuICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIG5vdEluUmFuZ2UoYSwgYikge1xyXG4gICAgaWYgKGIgPj0gYVswXSAmJiBiIDw9IGFbMV0pIHtcclxuICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGdldE1hdGNoZXJTdHJpbmcoY2hlY2spIHtcclxuICAgIHZhciBzdHJpbmcgPSBudWxsO1xyXG4gICAgc3dpdGNoIChjaGVjaykge1xyXG4gICAgICAgIGNhc2UgZXF1YWxUbzpcclxuICAgICAgICAgICAgc3RyaW5nID0gXCJlcXVhbCB0b1wiO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIG5vdEVxdWFsVG86XHJcbiAgICAgICAgICAgIHN0cmluZyA9IFwibm90IGVxdWFsIHRvXCI7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgZ3Q6XHJcbiAgICAgICAgICAgIHN0cmluZyA9IFwiZ3JlYXRlciB0aGFuXCI7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgZ3RFcTpcclxuICAgICAgICAgICAgc3RyaW5nID0gXCJncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG9cIjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBsdDpcclxuICAgICAgICAgICAgc3RyaW5nID0gXCJsZXNzIHRoYW5cIjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBsdEVxOlxyXG4gICAgICAgICAgICBzdHJpbmcgPSBcImxlc3MgdGhhbiBvciBlcXVhbCB0b1wiO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIGhhc1Byb3A6XHJcbiAgICAgICAgICAgIHN0cmluZyA9IFwiaGFzIHRoZSBwcm9wZXJ0eVwiO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgc3RyaW5nID0gXCJub3QgYSBkZWZpbmVkIG1hdGNoZXJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc3RyaW5nO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRNaW4ocGFyYW1zLCBrZXlzKSB7XHJcbiAgICBmb3IgKHZhciBwYXJhbSBpbiBwYXJhbXMpIHtcclxuICAgICAgICBpZiAodHlwZW9mIChrZXlzKSAhPT0gJ3VuZGVmaW5lZCcgJiYga2V5cy5pbmRleE9mKHBhcmFtKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgcGFyYW1zW3BhcmFtXS5jdXJyZW50ID0gcGFyYW1zW3BhcmFtXS52YWx1ZSAtIHBhcmFtc1twYXJhbV0uZXJyb3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiAoa2V5cykgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHBhcmFtc1twYXJhbV0uY3VycmVudCA9IHBhcmFtc1twYXJhbV0udmFsdWUgLSBwYXJhbXNbcGFyYW1dLmVycm9yO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gc2V0TWF4KHBhcmFtcywga2V5cykge1xyXG4gICAgZm9yICh2YXIgcGFyYW0gaW4gcGFyYW1zKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiAoa2V5cykgIT09ICd1bmRlZmluZWQnICYmIGtleXMuaW5kZXhPZihwYXJhbSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHBhcmFtc1twYXJhbV0uY3VycmVudCA9IHBhcmFtc1twYXJhbV0udmFsdWUgKyBwYXJhbXNbcGFyYW1dLmVycm9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgKGtleXMpID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBwYXJhbXNbcGFyYW1dLmN1cnJlbnQgPSBwYXJhbXNbcGFyYW1dLnZhbHVlICsgcGFyYW1zW3BhcmFtXS5lcnJvcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFN0YW5kYXJkKHBhcmFtcywga2V5cykge1xyXG4gICAgZm9yICh2YXIgcGFyYW0gaW4gcGFyYW1zKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiAoa2V5cykgIT09ICd1bmRlZmluZWQnICYmIGtleXMuaW5kZXhPZihwYXJhbSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHBhcmFtc1twYXJhbV0uY3VycmVudCA9IHBhcmFtc1twYXJhbV0udmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiAoa2V5cykgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHBhcmFtc1twYXJhbV0uY3VycmVudCA9IHBhcmFtc1twYXJhbV0udmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBkYXRhVG9NYXRyaXgoaXRlbXMsIHN0ZGl6ZWQgPSBmYWxzZSkge1xyXG4gICAgbGV0IGRhdGEgPSBbXTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBsZXQgaXRlbSA9IGl0ZW1zW2ldO1xyXG4gICAgICAgIGlmIChzdGRpemVkKSB7XHJcbiAgICAgICAgICAgIGl0ZW0gPSBzdGFuZGFyZGl6ZWQoaXRlbSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGl0ZW0uZm9yRWFjaCgoeCwgaWkpID0+IHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBkYXRhW2lpXSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIGRhdGFbaWldID0gWzEsIHhdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZGF0YVtpaV0ucHVzaCh4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGRhdGE7XHJcbn1cclxuLypcclxuKiByZWxhdGl2ZSB0byB0aGUgbWVhbiwgaG93IG1hbnkgc3RhbmRhcmQgZGV2aWF0aW9uc1xyXG4qL1xyXG5leHBvcnQgZnVuY3Rpb24gc3RhbmRhcmRpemVkKGFycikge1xyXG4gICAgbGV0IHN0ZCA9IGpTdGF0LnN0ZGV2KGFycik7XHJcbiAgICBsZXQgbWVhbiA9IGpTdGF0Lm1lYW4oYXJyKTtcclxuICAgIGxldCBzdGFuZGFyZGl6ZWQgPSBhcnIubWFwKChkKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIChkIC0gbWVhbikgLyBzdGQ7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBzdGFuZGFyZGl6ZWQ7XHJcbn1cclxuLypcclxuKiBiZXR3ZWVuIDAgYW5kIDEgd2hlbiBtaW4gYW5kIG1heCBhcmUga25vd25cclxuKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZSh4LCBtaW4sIG1heCkge1xyXG4gICAgbGV0IHZhbCA9IHggLSBtaW47XHJcbiAgICByZXR1cm4gdmFsIC8gKG1heCAtIG1pbik7XHJcbn1cclxuLypcclxuKiBnaXZlIHRoZSByZWFsIHVuaXQgdmFsdWVcclxuKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGludk5vcm0oeCwgbWluLCBtYXgpIHtcclxuICAgIHJldHVybiAoeCAqIG1heCAtIHggKiBtaW4pICsgbWluO1xyXG59XHJcbi8qXHJcbipcclxuKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJhbmRSYW5nZShtaW4sIG1heCkge1xyXG4gICAgcmV0dXJuIChtYXggLSBtaW4pICogTWF0aC5yYW5kb20oKSArIG1pbjtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmFuZ2UoZGF0YSwgcHJvcCkge1xyXG4gICAgbGV0IHJhbmdlID0ge1xyXG4gICAgICAgIG1pbjogMWUxNSxcclxuICAgICAgICBtYXg6IC0xZTE1XHJcbiAgICB9O1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKHJhbmdlLm1pbiA+IGRhdGFbaV1bcHJvcF0pIHtcclxuICAgICAgICAgICAgcmFuZ2UubWluID0gZGF0YVtpXVtwcm9wXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJhbmdlLm1heCA8IGRhdGFbaV1bcHJvcF0pIHtcclxuICAgICAgICAgICAgcmFuZ2UubWF4ID0gZGF0YVtpXVtwcm9wXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmFuZ2U7XHJcbn1cclxuZXhwb3J0IGNsYXNzIE1hdGNoIHtcclxuICAgIHN0YXRpYyBndChhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEgPiBiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdlKGEsIGIpIHtcclxuICAgICAgICBpZiAoYSA+PSBiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGx0KGEsIGIpIHtcclxuICAgICAgICBpZiAoYSA8IGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgbGUoYSwgYikge1xyXG4gICAgICAgIGlmIChhIDw9IGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlUG9wKG51bUFnZW50cywgb3B0aW9ucywgdHlwZSwgYm91bmRhcmllcywgY3VycmVudEFnZW50SWQsIHJuZykge1xyXG4gICAgdmFyIHBvcCA9IFtdO1xyXG4gICAgdmFyIGxvY3MgPSB7XHJcbiAgICAgICAgdHlwZTogJ0ZlYXR1cmVDb2xsZWN0aW9uJyxcclxuICAgICAgICBmZWF0dXJlczogW11cclxuICAgIH07XHJcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCBbXTtcclxuICAgIHR5cGUgPSB0eXBlIHx8ICdjb250aW51b3VzJztcclxuICAgIGZvciAodmFyIGEgPSAwOyBhIDwgbnVtQWdlbnRzOyBhKyspIHtcclxuICAgICAgICBwb3BbYV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBjdXJyZW50QWdlbnRJZCxcclxuICAgICAgICAgICAgdHlwZTogdHlwZVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgLy9tb3ZlbWVudCBwYXJhbXNcclxuICAgICAgICBwb3BbYV0ubW92ZVBlckRheSA9IHJuZy5ub3JtYWwoMjUwMCAqIDI0LCAxMDAwKTsgLy8gbS9kYXlcclxuICAgICAgICBwb3BbYV0ucHJldlggPSAwO1xyXG4gICAgICAgIHBvcFthXS5wcmV2WSA9IDA7XHJcbiAgICAgICAgcG9wW2FdLm1vdmVkVG90YWwgPSAwO1xyXG4gICAgICAgIGlmIChwb3BbYV0udHlwZSA9PT0gJ2NvbnRpbnVvdXMnKSB7XHJcbiAgICAgICAgICAgIHBvcFthXS5tZXNoID0gbmV3IFRIUkVFLk1lc2gobmV3IFRIUkVFLlRldHJhaGVkcm9uR2VvbWV0cnkoMSwgMSksIG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7XHJcbiAgICAgICAgICAgICAgICBjb2xvcjogMHgwMDAwMDBcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICBwb3BbYV0ubWVzaC5xSWQgPSBwb3BbYV0uaWQ7XHJcbiAgICAgICAgICAgIHBvcFthXS5tZXNoLnR5cGUgPSAnYWdlbnQnO1xyXG4gICAgICAgICAgICBwb3BbYV0ucG9zaXRpb24gPSB7IHg6IDAsIHk6IDAsIHo6IDAgfTtcclxuICAgICAgICAgICAgcG9wW2FdLmJvdW5kYXJ5R3JvdXAgPSBvcHRpb25zLmdyb3VwTmFtZTtcclxuICAgICAgICAgICAgcG9wW2FdLnBvc2l0aW9uLnggPSBybmcucmFuZFJhbmdlKGJvdW5kYXJpZXMubGVmdCwgYm91bmRhcmllcy5yaWdodCk7XHJcbiAgICAgICAgICAgIHBvcFthXS5wb3NpdGlvbi55ID0gcm5nLnJhbmRSYW5nZShib3VuZGFyaWVzLmJvdHRvbSwgYm91bmRhcmllcy50b3ApO1xyXG4gICAgICAgICAgICBwb3BbYV0ubWVzaC5wb3NpdGlvbi54ID0gcG9wW2FdLnBvc2l0aW9uLng7XHJcbiAgICAgICAgICAgIHBvcFthXS5tZXNoLnBvc2l0aW9uLnkgPSBwb3BbYV0ucG9zaXRpb24ueTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzY2VuZSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIHNjZW5lLmFkZChwb3BbYV0ubWVzaCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHBvcFthXS50eXBlID09PSAnZ2Vvc3BhdGlhbCcpIHtcclxuICAgICAgICAgICAgbG9jcy5mZWF0dXJlc1thXSA9IHR1cmYucG9pbnQoW3JuZy5yYW5kUmFuZ2UoLTc1LjE0NjcsIC03NS4xODY3KSwgcm5nLnJhbmRSYW5nZSgzOS45MjAwLCAzOS45OTAwKV0pO1xyXG4gICAgICAgICAgICBwb3BbYV0ubG9jYXRpb24gPSBsb2NzLmZlYXR1cmVzW2FdO1xyXG4gICAgICAgICAgICBwb3BbYV0ubG9jYXRpb24ucHJvcGVydGllcy5hZ2VudFJlZklEID0gcG9wW2FdLmlkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gb3B0aW9ucykge1xyXG4gICAgICAgICAgICBsZXQgZCA9IG9wdGlvbnNba2V5XTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBkLmFzc2lnbiA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgcG9wW2FdW2tleV0gPSBkLmFzc2lnbihwb3BbYV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcG9wW2FdW2tleV0gPSBkLmFzc2lnbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICA7XHJcbiAgICAgICAgY3VycmVudEFnZW50SWQrKztcclxuICAgIH1cclxuICAgIGZvciAobGV0IGEgPSAwOyBhIDwgcG9wLmxlbmd0aDsgYSsrKSB7XHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHBvcFthXS5zdGF0ZXMpIHtcclxuICAgICAgICAgICAgcG9wW2FdW3BvcFthXS5zdGF0ZXNba2V5XV0gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBbcG9wLCBsb2NzXTtcclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD11dGlscy5qcy5tYXAiLCJpbXBvcnQgeyBnZW5lcmF0ZVVVSUQgfSBmcm9tICcuL3V0aWxzJztcclxuLyoqXHJcbipRQ29tcG9uZW50cyBhcmUgdGhlIGJhc2UgY2xhc3MgZm9yIG1hbnkgbW9kZWwgY29tcG9uZW50cy5cclxuKi9cclxuZXhwb3J0IGNsYXNzIFFDb21wb25lbnQge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSkge1xyXG4gICAgICAgIHRoaXMuaWQgPSBnZW5lcmF0ZVVVSUQoKTtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMudGltZSA9IDA7XHJcbiAgICAgICAgdGhpcy5oaXN0b3J5ID0gW107XHJcbiAgICB9XHJcbiAgICAvKiogVGFrZSBvbmUgdGltZSBzdGVwIGZvcndhcmQgKG1vc3Qgc3ViY2xhc3NlcyBvdmVycmlkZSB0aGUgYmFzZSBtZXRob2QpXHJcbiAgICAqIEBwYXJhbSBzdGVwIHNpemUgb2YgdGltZSBzdGVwIChpbiBkYXlzIGJ5IGNvbnZlbnRpb24pXHJcbiAgICAqL1xyXG4gICAgdXBkYXRlKGFnZW50LCBzdGVwKSB7XHJcbiAgICAgICAgLy9zb21ldGhpbmcgc3VwZXIhXHJcbiAgICB9XHJcbn1cclxuUUNvbXBvbmVudC5TVUNDRVNTID0gMTtcclxuUUNvbXBvbmVudC5GQUlMRUQgPSAyO1xyXG5RQ29tcG9uZW50LlJVTk5JTkcgPSAzO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1RQ29tcG9uZW50LmpzLm1hcCIsImltcG9ydCB7IFFDb21wb25lbnQgfSBmcm9tICcuL1FDb21wb25lbnQnO1xyXG5pbXBvcnQgeyBnZXRNYXRjaGVyU3RyaW5nIH0gZnJvbSAnLi91dGlscyc7XHJcbi8qKlxyXG4qIEJlbGllZiBEZXNpcmUgSW50ZW50IGFnZW50cyBhcmUgc2ltcGxlIHBsYW5uaW5nIGFnZW50cyB3aXRoIG1vZHVsYXIgcGxhbnMgLyBkZWxpYmVyYXRpb24gcHJvY2Vzc2VzLlxyXG4qL1xyXG5leHBvcnQgY2xhc3MgQkRJQWdlbnQgZXh0ZW5kcyBRQ29tcG9uZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGdvYWxzID0gW10sIHBsYW5zID0ge30sIGRhdGEgPSBbXSwgcG9saWN5U2VsZWN0b3IgPSBCRElBZ2VudC5zdG9jaGFzdGljU2VsZWN0aW9uKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSk7XHJcbiAgICAgICAgdGhpcy5nb2FscyA9IGdvYWxzO1xyXG4gICAgICAgIHRoaXMucGxhbnMgPSBwbGFucztcclxuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xyXG4gICAgICAgIHRoaXMucG9saWN5U2VsZWN0b3IgPSBwb2xpY3lTZWxlY3RvcjtcclxuICAgICAgICB0aGlzLmJlbGllZkhpc3RvcnkgPSBbXTtcclxuICAgICAgICB0aGlzLnBsYW5IaXN0b3J5ID0gW107XHJcbiAgICB9XHJcbiAgICAvKiogVGFrZSBvbmUgdGltZSBzdGVwIGZvcndhcmQsIHRha2UgaW4gYmVsaWVmcywgZGVsaWJlcmF0ZSwgaW1wbGVtZW50IHBvbGljeVxyXG4gICAgKiBAcGFyYW0gc3RlcCBzaXplIG9mIHRpbWUgc3RlcCAoaW4gZGF5cyBieSBjb252ZW50aW9uKVxyXG4gICAgKi9cclxuICAgIHVwZGF0ZShhZ2VudCwgc3RlcCkge1xyXG4gICAgICAgIHZhciBwb2xpY3ksIGludGVudCwgZXZhbHVhdGlvbjtcclxuICAgICAgICBwb2xpY3kgPSB0aGlzLnBvbGljeVNlbGVjdG9yKHRoaXMucGxhbnMsIHRoaXMucGxhbkhpc3RvcnksIGFnZW50KTtcclxuICAgICAgICBpbnRlbnQgPSB0aGlzLnBsYW5zW3BvbGljeV07XHJcbiAgICAgICAgaW50ZW50KGFnZW50LCBzdGVwKTtcclxuICAgICAgICBldmFsdWF0aW9uID0gdGhpcy5ldmFsdWF0ZUdvYWxzKGFnZW50KTtcclxuICAgICAgICB0aGlzLnBsYW5IaXN0b3J5LnB1c2goeyB0aW1lOiB0aGlzLnRpbWUsIGlkOiBhZ2VudC5pZCwgaW50ZW50aW9uOiBwb2xpY3ksIGdvYWxzOiBldmFsdWF0aW9uLmFjaGlldmVtZW50cywgYmFycmllcnM6IGV2YWx1YXRpb24uYmFycmllcnMsIHI6IGV2YWx1YXRpb24uc3VjY2Vzc2VzIC8gdGhpcy5nb2Fscy5sZW5ndGggfSk7XHJcbiAgICB9XHJcbiAgICBldmFsdWF0ZUdvYWxzKGFnZW50KSB7XHJcbiAgICAgICAgbGV0IGFjaGlldmVtZW50cyA9IFtdLCBiYXJyaWVycyA9IFtdLCBzdWNjZXNzZXMgPSAwLCBjLCBtYXRjaGVyO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5nb2Fscy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjID0gdGhpcy5nb2Fsc1tpXS5jb25kaXRpb247XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYy5kYXRhID09PSAndW5kZWZpbmVkJyB8fCBjLmRhdGEgPT09IFwiYWdlbnRcIikge1xyXG4gICAgICAgICAgICAgICAgYy5kYXRhID0gYWdlbnQ7IC8vaWYgbm8gZGF0YXNvdXJjZSBpcyBzZXQsIHVzZSB0aGUgYWdlbnRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhY2hpZXZlbWVudHNbaV0gPSB0aGlzLmdvYWxzW2ldLnRlbXBvcmFsKGMuY2hlY2soYy5kYXRhW2Mua2V5XSwgYy52YWx1ZSkpO1xyXG4gICAgICAgICAgICBpZiAoYWNoaWV2ZW1lbnRzW2ldID09PSBCRElBZ2VudC5TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzZXMgKz0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG1hdGNoZXIgPSBnZXRNYXRjaGVyU3RyaW5nKGMuY2hlY2spO1xyXG4gICAgICAgICAgICAgICAgYmFycmllcnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGMubGFiZWwsXHJcbiAgICAgICAgICAgICAgICAgICAga2V5OiBjLmtleSxcclxuICAgICAgICAgICAgICAgICAgICBjaGVjazogbWF0Y2hlcixcclxuICAgICAgICAgICAgICAgICAgICBhY3R1YWw6IGMuZGF0YVtjLmtleV0sXHJcbiAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IGMudmFsdWVcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3Nlczogc3VjY2Vzc2VzLCBiYXJyaWVyczogYmFycmllcnMsIGFjaGlldmVtZW50czogYWNoaWV2ZW1lbnRzIH07XHJcbiAgICB9XHJcbiAgICAvL2dvb2QgZm9yIHRyYWluaW5nXHJcbiAgICBzdGF0aWMgc3RvY2hhc3RpY1NlbGVjdGlvbihwbGFucywgcGxhbkhpc3RvcnksIGFnZW50KSB7XHJcbiAgICAgICAgdmFyIHBvbGljeSwgc2NvcmUsIG1heCA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgcGxhbiBpbiBwbGFucykge1xyXG4gICAgICAgICAgICBzY29yZSA9IE1hdGgucmFuZG9tKCk7XHJcbiAgICAgICAgICAgIGlmIChzY29yZSA+PSBtYXgpIHtcclxuICAgICAgICAgICAgICAgIG1heCA9IHNjb3JlO1xyXG4gICAgICAgICAgICAgICAgcG9saWN5ID0gcGxhbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcG9saWN5O1xyXG4gICAgfVxyXG59XHJcbkJESUFnZW50LmxhenlQb2xpY3lTZWxlY3Rpb24gPSBmdW5jdGlvbiAocGxhbnMsIHBsYW5IaXN0b3J5LCBhZ2VudCkge1xyXG4gICAgdmFyIG9wdGlvbnMsIHNlbGVjdGlvbjtcclxuICAgIGlmICh0aGlzLnRpbWUgPiAwKSB7XHJcbiAgICAgICAgb3B0aW9ucyA9IE9iamVjdC5rZXlzKHBsYW5zKTtcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucy5zbGljZSgxLCBvcHRpb25zLmxlbmd0aCk7XHJcbiAgICAgICAgc2VsZWN0aW9uID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogb3B0aW9ucy5sZW5ndGgpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgb3B0aW9ucyA9IE9iamVjdC5rZXlzKHBsYW5zKTtcclxuICAgICAgICBzZWxlY3Rpb24gPSAwO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG9wdGlvbnNbc2VsZWN0aW9uXTtcclxufTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YmRpLmpzLm1hcCIsImltcG9ydCB7IFFDb21wb25lbnQgfSBmcm9tICcuL1FDb21wb25lbnQnO1xyXG5pbXBvcnQgeyBnZW5lcmF0ZVVVSUQgfSBmcm9tICcuL3V0aWxzJztcclxuLyoqXHJcbiogQmVoYXZpb3IgVHJlZVxyXG4qKi9cclxuZXhwb3J0IGNsYXNzIEJlaGF2aW9yVHJlZSBleHRlbmRzIFFDb21wb25lbnQge1xyXG4gICAgc3RhdGljIHRpY2sobm9kZSwgYWdlbnQpIHtcclxuICAgICAgICB2YXIgc3RhdGUgPSBub2RlLm9wZXJhdGUoYWdlbnQpO1xyXG4gICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH1cclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHJvb3QsIGRhdGEpIHtcclxuICAgICAgICBzdXBlcihuYW1lKTtcclxuICAgICAgICB0aGlzLnJvb3QgPSByb290O1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgdGhpcy5yZXN1bHRzID0gW107XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoYWdlbnQsIHN0ZXApIHtcclxuICAgICAgICB2YXIgc3RhdGU7XHJcbiAgICAgICAgYWdlbnQuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB3aGlsZSAoYWdlbnQuYWN0aXZlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHN0YXRlID0gQmVoYXZpb3JUcmVlLnRpY2sodGhpcy5yb290LCBhZ2VudCk7XHJcbiAgICAgICAgICAgIGFnZW50LnRpbWUgPSB0aGlzLnRpbWU7XHJcbiAgICAgICAgICAgIGFnZW50LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEJUTm9kZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lKSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IGdlbmVyYXRlVVVJRCgpO1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEJUQ29udHJvbE5vZGUgZXh0ZW5kcyBCVE5vZGUge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgY2hpbGRyZW4pIHtcclxuICAgICAgICBzdXBlcihuYW1lKTtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEJUUm9vdCBleHRlbmRzIEJUQ29udHJvbE5vZGUge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgY2hpbGRyZW4pIHtcclxuICAgICAgICBzdXBlcihuYW1lLCBjaGlsZHJlbik7XHJcbiAgICAgICAgdGhpcy50eXBlID0gXCJyb290XCI7XHJcbiAgICAgICAgdGhpcy5vcGVyYXRlID0gZnVuY3Rpb24gKGFnZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBzdGF0ZSA9IEJlaGF2aW9yVHJlZS50aWNrKHRoaXMuY2hpbGRyZW5bMF0sIGFnZW50KTtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEJUU2VsZWN0b3IgZXh0ZW5kcyBCVENvbnRyb2xOb2RlIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNoaWxkcmVuKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSwgY2hpbGRyZW4pO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IFwic2VsZWN0b3JcIjtcclxuICAgICAgICB0aGlzLm9wZXJhdGUgPSBmdW5jdGlvbiAoYWdlbnQpIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkU3RhdGU7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGNoaWxkIGluIHRoaXMuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkU3RhdGUgPSBCZWhhdmlvclRyZWUudGljayh0aGlzLmNoaWxkcmVuW2NoaWxkXSwgYWdlbnQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5SVU5OSU5HKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5SVU5OSU5HO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5TVUNDRVNTO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBCZWhhdmlvclRyZWUuRkFJTEVEO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEJUU2VxdWVuY2UgZXh0ZW5kcyBCVENvbnRyb2xOb2RlIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNoaWxkcmVuKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSwgY2hpbGRyZW4pO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IFwic2VxdWVuY2VcIjtcclxuICAgICAgICB0aGlzLm9wZXJhdGUgPSBmdW5jdGlvbiAoYWdlbnQpIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkU3RhdGU7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGNoaWxkIGluIHRoaXMuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkU3RhdGUgPSBCZWhhdmlvclRyZWUudGljayh0aGlzLmNoaWxkcmVuW2NoaWxkXSwgYWdlbnQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5SVU5OSU5HKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5SVU5OSU5HO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5GQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLkZBSUxFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLlNVQ0NFU1M7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgQlRQYXJhbGxlbCBleHRlbmRzIEJUQ29udHJvbE5vZGUge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgY2hpbGRyZW4sIHN1Y2Nlc3Nlcykge1xyXG4gICAgICAgIHN1cGVyKG5hbWUsIGNoaWxkcmVuKTtcclxuICAgICAgICB0aGlzLnR5cGUgPSBcInBhcmFsbGVsXCI7XHJcbiAgICAgICAgdGhpcy5zdWNjZXNzZXMgPSBzdWNjZXNzZXM7XHJcbiAgICAgICAgdGhpcy5vcGVyYXRlID0gZnVuY3Rpb24gKGFnZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBzdWNjZWVkZWQgPSBbXSwgZmFpbHVyZXMgPSBbXSwgY2hpbGRTdGF0ZSwgbWFqb3JpdHk7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGNoaWxkIGluIHRoaXMuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkU3RhdGUgPSBCZWhhdmlvclRyZWUudGljayh0aGlzLmNoaWxkcmVuW2NoaWxkXSwgYWdlbnQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VlZGVkLnB1c2goY2hpbGRTdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaGlsZFN0YXRlID09PSBCZWhhdmlvclRyZWUuRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmFpbHVyZXMucHVzaChjaGlsZFN0YXRlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5SVU5OSU5HKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5SVU5OSU5HO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzdWNjZWVkZWQubGVuZ3RoID49IHRoaXMuc3VjY2Vzc2VzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLlNVQ0NFU1M7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLkZBSUxFRDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEJUQ29uZGl0aW9uIGV4dGVuZHMgQlROb2RlIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNvbmRpdGlvbikge1xyXG4gICAgICAgIHN1cGVyKG5hbWUpO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IFwiY29uZGl0aW9uXCI7XHJcbiAgICAgICAgdGhpcy5jb25kaXRpb24gPSBjb25kaXRpb247XHJcbiAgICAgICAgdGhpcy5vcGVyYXRlID0gZnVuY3Rpb24gKGFnZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBzdGF0ZTtcclxuICAgICAgICAgICAgc3RhdGUgPSBjb25kaXRpb24uY2hlY2soYWdlbnRbY29uZGl0aW9uLmtleV0sIGNvbmRpdGlvbi52YWx1ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBCVEFjdGlvbiBleHRlbmRzIEJUTm9kZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBjb25kaXRpb24sIGFjdGlvbikge1xyXG4gICAgICAgIHN1cGVyKG5hbWUpO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IFwiYWN0aW9uXCI7XHJcbiAgICAgICAgdGhpcy5jb25kaXRpb24gPSBjb25kaXRpb247XHJcbiAgICAgICAgdGhpcy5hY3Rpb24gPSBhY3Rpb247XHJcbiAgICAgICAgdGhpcy5vcGVyYXRlID0gZnVuY3Rpb24gKGFnZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBzdGF0ZTtcclxuICAgICAgICAgICAgc3RhdGUgPSBjb25kaXRpb24uY2hlY2soYWdlbnRbY29uZGl0aW9uLmtleV0sIGNvbmRpdGlvbi52YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmIChzdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLlNVQ0NFU1MpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWN0aW9uKGFnZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1iZWhhdmlvclRyZWUuanMubWFwIiwiaW1wb3J0IHsgZ2VuZXJhdGVVVUlEIH0gZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCB7IFFDb21wb25lbnQgfSBmcm9tICcuL1FDb21wb25lbnQnO1xyXG5leHBvcnQgY2xhc3MgQ29tcGFydG1lbnRNb2RlbCBleHRlbmRzIFFDb21wb25lbnQge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgY29tcGFydG1lbnRzLCBkYXRhKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSk7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTsgLy9hbiBhcnJheSBvZiBQYXRjaGVzLiBFYWNoIHBhdGNoIGNvbnRhaW5zIGFuIGFycmF5IG9mIGNvbXBhcnRtZW50cyBpbiBvcGVyYXRpb25hbCBvcmRlclxyXG4gICAgICAgIHRoaXMudG90YWxQb3AgPSAwO1xyXG4gICAgICAgIHRoaXMuY29tcGFydG1lbnRzID0gY29tcGFydG1lbnRzO1xyXG4gICAgICAgIHRoaXMuaGlzdG9yeSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGQgPSAwOyBkIDwgdGhpcy5kYXRhLmxlbmd0aDsgZCsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMudG90YWxQb3AgKz0gdGhpcy5kYXRhW2RdLnRvdGFsUG9wO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl90b2xlcmFuY2UgPSAxZS05OyAvL21vZGVsIGVyciB0b2xlcmFuY2VcclxuICAgIH1cclxuICAgIHVwZGF0ZShwYXRjaCwgc3RlcCkge1xyXG4gICAgICAgIGxldCB0ZW1wX3BvcCA9IHt9LCB0ZW1wX2QgPSB7fSwgbmV4dF9kID0ge30sIGx0ZSA9IHt9LCBlcnIgPSAxLCBuZXdTdGVwO1xyXG4gICAgICAgIGZvciAobGV0IGMgaW4gdGhpcy5jb21wYXJ0bWVudHMpIHtcclxuICAgICAgICAgICAgcGF0Y2guZHBvcHNbY10gPSB0aGlzLmNvbXBhcnRtZW50c1tjXS5vcGVyYXRpb24ocGF0Y2gucG9wdWxhdGlvbnMsIHN0ZXApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL2ZpcnN0IG9yZGVyIChFdWxlcilcclxuICAgICAgICBmb3IgKGxldCBjIGluIHRoaXMuY29tcGFydG1lbnRzKSB7XHJcbiAgICAgICAgICAgIHRlbXBfcG9wW2NdID0gcGF0Y2gucG9wdWxhdGlvbnNbY107XHJcbiAgICAgICAgICAgIHRlbXBfZFtjXSA9IHBhdGNoLmRwb3BzW2NdO1xyXG4gICAgICAgICAgICBwYXRjaC5wb3B1bGF0aW9uc1tjXSA9IHRlbXBfcG9wW2NdICsgdGVtcF9kW2NdO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL3NlY29uZCBvcmRlciAoSGV1bnMpXHJcbiAgICAgICAgcGF0Y2gudG90YWxQb3AgPSAwO1xyXG4gICAgICAgIGZvciAobGV0IGMgaW4gdGhpcy5jb21wYXJ0bWVudHMpIHtcclxuICAgICAgICAgICAgbmV4dF9kW2NdID0gdGhpcy5jb21wYXJ0bWVudHNbY10ub3BlcmF0aW9uKHBhdGNoLnBvcHVsYXRpb25zLCBzdGVwKTtcclxuICAgICAgICAgICAgcGF0Y2gucG9wdWxhdGlvbnNbY10gPSB0ZW1wX3BvcFtjXSArICgwLjUgKiAodGVtcF9kW2NdICsgbmV4dF9kW2NdKSk7XHJcbiAgICAgICAgICAgIHBhdGNoLnRvdGFsUG9wICs9IHBhdGNoLnBvcHVsYXRpb25zW2NdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgQ29tcGFydG1lbnQge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgcG9wLCBvcGVyYXRpb24pIHtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMub3BlcmF0aW9uID0gb3BlcmF0aW9uIHx8IG51bGw7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIFBhdGNoIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNvbXBhcnRtZW50cywgcG9wdWxhdGlvbnMpIHtcclxuICAgICAgICB0aGlzLnBvcHVsYXRpb25zID0ge307XHJcbiAgICAgICAgdGhpcy5kcG9wcyA9IHt9O1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbFBvcCA9IHt9O1xyXG4gICAgICAgIHRoaXMuaWQgPSBnZW5lcmF0ZVVVSUQoKTtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMuZHBvcHMgPSB7fTtcclxuICAgICAgICB0aGlzLmNvbXBhcnRtZW50cyA9IGNvbXBhcnRtZW50cztcclxuICAgICAgICB0aGlzLnRvdGFsUG9wID0gMDtcclxuICAgICAgICBmb3IgKGxldCBjIGluIHBvcHVsYXRpb25zKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZHBvcHNbY10gPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmluaXRpYWxQb3BbY10gPSBwb3B1bGF0aW9uc1tjXTtcclxuICAgICAgICAgICAgdGhpcy5wb3B1bGF0aW9uc1tjXSA9IHBvcHVsYXRpb25zW2NdO1xyXG4gICAgICAgICAgICB0aGlzLnRvdGFsUG9wICs9IHRoaXMucG9wdWxhdGlvbnNbY107XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbXBhcnRtZW50LmpzLm1hcCIsImltcG9ydCB7IGdlbmVyYXRlVVVJRCB9IGZyb20gJy4vdXRpbHMnO1xyXG5leHBvcnQgY2xhc3MgQ29udGFjdFBhdGNoIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNhcGFjaXR5KSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IGdlbmVyYXRlVVVJRCgpO1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy5jYXBhY2l0eSA9IGNhcGFjaXR5O1xyXG4gICAgICAgIHRoaXMucG9wID0gMDtcclxuICAgICAgICB0aGlzLm1lbWJlcnMgPSB7fTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBkZWZhdWx0RnJlcUYoYSwgYikge1xyXG4gICAgICAgIHZhciB2YWwgPSAoNTAgLSBNYXRoLmFicyhhLmFnZSAtIGIuYWdlKSkgLyAxMDA7XHJcbiAgICAgICAgcmV0dXJuIHZhbDtcclxuICAgIH1cclxuICAgIHN0YXRpYyBkZWZhdWx0Q29udGFjdEYoYSwgdGltZSkge1xyXG4gICAgICAgIHZhciBjID0gMiAqIE1hdGguc2luKHRpbWUpICsgYTtcclxuICAgICAgICBpZiAoYyA+PSAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGFzc2lnbihhZ2VudCwgY29udGFjdFZhbHVlRnVuYykge1xyXG4gICAgICAgIHZhciBjb250YWN0VmFsdWU7XHJcbiAgICAgICAgY29udGFjdFZhbHVlRnVuYyA9IGNvbnRhY3RWYWx1ZUZ1bmMgfHwgQ29udGFjdFBhdGNoLmRlZmF1bHRGcmVxRjtcclxuICAgICAgICBpZiAodGhpcy5wb3AgPCB0aGlzLmNhcGFjaXR5KSB7XHJcbiAgICAgICAgICAgIHRoaXMubWVtYmVyc1thZ2VudC5pZF0gPSB7IHByb3BlcnRpZXM6IGFnZW50IH07XHJcbiAgICAgICAgICAgIGZvciAobGV0IG90aGVyIGluIHRoaXMubWVtYmVycykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGlkID0gcGFyc2VJbnQob3RoZXIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG90aGVyICE9PSBhZ2VudC5pZCAmJiAhaXNOYU4oaWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGFjdFZhbHVlID0gY29udGFjdFZhbHVlRnVuYyh0aGlzLm1lbWJlcnNbaWRdLnByb3BlcnRpZXMsIGFnZW50KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbWJlcnNbYWdlbnQuaWRdW2lkXSA9IGNvbnRhY3RWYWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbWJlcnNbaWRdW2FnZW50LmlkXSA9IGNvbnRhY3RWYWx1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnBvcCsrO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVuY291bnRlcnMoYWdlbnQsIHByZWNvbmRpdGlvbiwgY29udGFjdEZ1bmMsIHJlc3VsdEtleSwgc2F2ZSA9IGZhbHNlKSB7XHJcbiAgICAgICAgY29udGFjdEZ1bmMgPSBjb250YWN0RnVuYyB8fCBDb250YWN0UGF0Y2guZGVmYXVsdENvbnRhY3RGO1xyXG4gICAgICAgIGxldCBjb250YWN0VmFsO1xyXG4gICAgICAgIGZvciAodmFyIGNvbnRhY3QgaW4gdGhpcy5tZW1iZXJzKSB7XHJcbiAgICAgICAgICAgIGlmIChwcmVjb25kaXRpb24ua2V5ID09PSAnc3RhdGVzJykge1xyXG4gICAgICAgICAgICAgICAgY29udGFjdFZhbCA9IEpTT04uc3RyaW5naWZ5KHRoaXMubWVtYmVyc1tjb250YWN0XS5wcm9wZXJ0aWVzW3ByZWNvbmRpdGlvbi5rZXldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnRhY3RWYWwgPSB0aGlzLm1lbWJlcnNbY29udGFjdF0ucHJvcGVydGllc1twcmVjb25kaXRpb24ua2V5XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocHJlY29uZGl0aW9uLmNoZWNrKHRoaXMubWVtYmVyc1tjb250YWN0XS5wcm9wZXJ0aWVzW3ByZWNvbmRpdGlvbi5rZXldLCBwcmVjb25kaXRpb24udmFsdWUpICYmIE51bWJlcihjb250YWN0KSAhPT0gYWdlbnQuaWQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBvbGRWYWwgPSB0aGlzLm1lbWJlcnNbY29udGFjdF0ucHJvcGVydGllc1tyZXN1bHRLZXldO1xyXG4gICAgICAgICAgICAgICAgdmFyIG5ld1ZhbCA9IGNvbnRhY3RGdW5jKHRoaXMubWVtYmVyc1tjb250YWN0XSwgYWdlbnQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG9sZFZhbCAhPT0gbmV3VmFsICYmIHNhdmUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbWJlcnNbY29udGFjdF0ucHJvcGVydGllc1tyZXN1bHRLZXldID0gbmV3VmFsO1xyXG4gICAgICAgICAgICAgICAgICAgIENvbnRhY3RQYXRjaC5XSVdBcnJheS5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0Y2hJRDogdGhpcy5pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZlY3RlZDogY29udGFjdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5mZWN0ZWRBZ2U6IHRoaXMubWVtYmVyc1tjb250YWN0XS5wcm9wZXJ0aWVzLmFnZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiB0aGlzLm1lbWJlcnNbY29udGFjdF0ucHJvcGVydGllc1tyZXN1bHRLZXldLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRLZXk6IHJlc3VsdEtleSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnk6IGFnZW50LmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBieUFnZTogYWdlbnQuYWdlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lOiBhZ2VudC50aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuQ29udGFjdFBhdGNoLldJV0FycmF5ID0gW107XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbnRhY3RQYXRjaC5qcy5tYXAiLCJpbXBvcnQgeyBzaHVmZmxlIH0gZnJvbSAnLi91dGlscyc7XHJcbi8qKlxyXG4qRW52aXJvbm1lbnRzIGFyZSB0aGUgZXhlY3V0YWJsZSBlbnZpcm9ubWVudCBjb250YWluaW5nIHRoZSBtb2RlbCBjb21wb25lbnRzLFxyXG4qc2hhcmVkIHJlc291cmNlcywgYW5kIHNjaGVkdWxlci5cclxuKi9cclxuZXhwb3J0IGNsYXNzIEVudmlyb25tZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKHJlc291cmNlcyA9IFtdLCBmYWNpbGl0aWVzID0gW10sIGV2ZW50c1F1ZXVlID0gW10sIGFjdGl2YXRpb25UeXBlID0gJ3JhbmRvbScsIHJuZyA9IE1hdGgpIHtcclxuICAgICAgICB0aGlzLnRpbWUgPSAwO1xyXG4gICAgICAgIHRoaXMudGltZU9mRGF5ID0gMDtcclxuICAgICAgICB0aGlzLm1vZGVscyA9IFtdO1xyXG4gICAgICAgIHRoaXMuaGlzdG9yeSA9IFtdO1xyXG4gICAgICAgIHRoaXMuYWdlbnRzID0gW107XHJcbiAgICAgICAgdGhpcy5yZXNvdXJjZXMgPSByZXNvdXJjZXM7XHJcbiAgICAgICAgdGhpcy5mYWNpbGl0aWVzID0gZmFjaWxpdGllcztcclxuICAgICAgICB0aGlzLmV2ZW50c1F1ZXVlID0gZXZlbnRzUXVldWU7XHJcbiAgICAgICAgdGhpcy5hY3RpdmF0aW9uVHlwZSA9IGFjdGl2YXRpb25UeXBlO1xyXG4gICAgICAgIHRoaXMucm5nID0gcm5nO1xyXG4gICAgICAgIHRoaXMuX2FnZW50SW5kZXggPSB7fTtcclxuICAgIH1cclxuICAgIC8qKiBBZGQgYSBtb2RlbCBjb21wb25lbnRzIGZyb20gdGhlIGVudmlyb25tZW50XHJcbiAgICAqIEBwYXJhbSBjb21wb25lbnQgdGhlIG1vZGVsIGNvbXBvbmVudCBvYmplY3QgdG8gYmUgYWRkZWQgdG8gdGhlIGVudmlyb25tZW50LlxyXG4gICAgKi9cclxuICAgIGFkZChjb21wb25lbnQpIHtcclxuICAgICAgICB0aGlzLm1vZGVscy5wdXNoKGNvbXBvbmVudCk7XHJcbiAgICB9XHJcbiAgICAvKiogUmVtb3ZlIGEgbW9kZWwgY29tcG9uZW50cyBmcm9tIHRoZSBlbnZpcm9ubWVudCBieSBpZFxyXG4gICAgKiBAcGFyYW0gaWQgVVVJRCBvZiB0aGUgY29tcG9uZW50IHRvIGJlIHJlbW92ZWQuXHJcbiAgICAqL1xyXG4gICAgcmVtb3ZlKGlkKSB7XHJcbiAgICAgICAgdmFyIGRlbGV0ZUluZGV4LCBMID0gdGhpcy5hZ2VudHMubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMubW9kZWxzLmZvckVhY2goZnVuY3Rpb24gKGMsIGluZGV4KSB7IGlmIChjLmlkID09PSBpZCkge1xyXG4gICAgICAgICAgICBkZWxldGVJbmRleCA9IGluZGV4O1xyXG4gICAgICAgIH0gfSk7XHJcbiAgICAgICAgd2hpbGUgKEwgPiAwICYmIHRoaXMuYWdlbnRzLmxlbmd0aCA+PSAwKSB7XHJcbiAgICAgICAgICAgIEwtLTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYWdlbnRzW0xdLm1vZGVsSW5kZXggPT09IGRlbGV0ZUluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFnZW50cy5zcGxpY2UoTCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5tb2RlbHMuc3BsaWNlKGRlbGV0ZUluZGV4LCAxKTtcclxuICAgIH1cclxuICAgIC8qKiBSdW4gYWxsIGVudmlyb25tZW50IG1vZGVsIGNvbXBvbmVudHMgZnJvbSB0PTAgdW50aWwgdD11bnRpbCB1c2luZyB0aW1lIHN0ZXAgPSBzdGVwXHJcbiAgICAqIEBwYXJhbSBzdGVwIHRoZSBzdGVwIHNpemVcclxuICAgICogQHBhcmFtIHVudGlsIHRoZSBlbmQgdGltZVxyXG4gICAgKiBAcGFyYW0gc2F2ZUludGVydmFsIHNhdmUgZXZlcnkgJ3gnIHN0ZXBzXHJcbiAgICAqL1xyXG4gICAgcnVuKHN0ZXAsIHVudGlsLCBzYXZlSW50ZXJ2YWwpIHtcclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgICAgICB3aGlsZSAodGhpcy50aW1lIDw9IHVudGlsKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKHN0ZXApO1xyXG4gICAgICAgICAgICBsZXQgcmVtID0gKHRoaXMudGltZSAlIHNhdmVJbnRlcnZhbCk7XHJcbiAgICAgICAgICAgIGlmIChyZW0gPCBzdGVwKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY29weSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5hZ2VudHMpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGlzdG9yeSA9IHRoaXMuaGlzdG9yeS5jb25jYXQoY29weSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy50aW1lICs9IHN0ZXA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqIEFzc2lnbiBhbGwgYWdlbnRzIHRvIGFwcHJvcHJpYXRlIG1vZGVsc1xyXG4gICAgKi9cclxuICAgIGluaXQoKSB7XHJcbiAgICAgICAgdGhpcy5fYWdlbnRJbmRleCA9IHt9O1xyXG4gICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgdGhpcy5tb2RlbHMubGVuZ3RoOyBjKyspIHtcclxuICAgICAgICAgICAgbGV0IGFscmVhZHlJbiA9IFtdO1xyXG4gICAgICAgICAgICAvL2Fzc2lnbiBlYWNoIGFnZW50IG1vZGVsIGluZGV4ZXMgdG8gaGFuZGxlIGFnZW50cyBhc3NpZ25lZCB0byBtdWx0aXBsZSBtb2RlbHNcclxuICAgICAgICAgICAgZm9yIChsZXQgZCA9IDA7IGQgPCB0aGlzLm1vZGVsc1tjXS5kYXRhLmxlbmd0aDsgZCsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaWQgPSB0aGlzLm1vZGVsc1tjXS5kYXRhW2RdLmlkO1xyXG4gICAgICAgICAgICAgICAgaWYgKGlkIGluIHRoaXMuX2FnZW50SW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL3RoaXMgYWdlbnQgYmVsb25ncyB0byBtdWx0aXBsZSBtb2RlbHMuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlbHNbY10uZGF0YVtkXS5tb2RlbHMucHVzaCh0aGlzLm1vZGVsc1tjXS5uYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVsc1tjXS5kYXRhW2RdLm1vZGVsSW5kZXhlcy5wdXNoKGMpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFscmVhZHlJbi5wdXNoKGlkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcyBhZ2VudCBiZWxvbmdzIHRvIG9ubHkgb25lIG1vZGVsIHNvIGZhci5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZ2VudEluZGV4W2lkXSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlbHNbY10uZGF0YVtkXS5tb2RlbHMgPSBbdGhpcy5tb2RlbHNbY10ubmFtZV07XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlbHNbY10uZGF0YVtkXS5tb2RlbEluZGV4ZXMgPSBbY107XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9lbGltaW5hdGUgYW55IGR1cGxpY2F0ZSBhZ2VudHMgYnkgaWRcclxuICAgICAgICAgICAgdGhpcy5tb2RlbHNbY10uZGF0YSA9IHRoaXMubW9kZWxzW2NdLmRhdGEuZmlsdGVyKChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYWxyZWFkeUluLmluZGV4T2YoZC5pZCkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvL2NvbmNhdCB0aGUgcmVzdWx0c1xyXG4gICAgICAgICAgICB0aGlzLmFnZW50cyA9IHRoaXMuYWdlbnRzLmNvbmNhdCh0aGlzLm1vZGVsc1tjXS5kYXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKiogVXBkYXRlIGVhY2ggbW9kZWwgY29tcGVuZW50IG9uZSB0aW1lIHN0ZXAgZm9yd2FyZFxyXG4gICAgKiBAcGFyYW0gc3RlcCB0aGUgc3RlcCBzaXplXHJcbiAgICAqL1xyXG4gICAgdXBkYXRlKHN0ZXApIHtcclxuICAgICAgICB2YXIgaW5kZXggPSAwO1xyXG4gICAgICAgIHdoaWxlIChpbmRleCA8IHRoaXMuZXZlbnRzUXVldWUubGVuZ3RoICYmIHRoaXMuZXZlbnRzUXVldWVbaW5kZXhdLmF0IDw9IHRoaXMudGltZSkge1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50c1F1ZXVlW2luZGV4XS50cmlnZ2VyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzUXVldWVbaW5kZXhdLnRyaWdnZXJlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmV2ZW50c1F1ZXVlW2luZGV4XS51bnRpbCA8PSB0aGlzLnRpbWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRzUXVldWUuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5hY3RpdmF0aW9uVHlwZSA9PT0gXCJyYW5kb21cIikge1xyXG4gICAgICAgICAgICBzaHVmZmxlKHRoaXMuYWdlbnRzLCB0aGlzLnJuZyk7XHJcbiAgICAgICAgICAgIHRoaXMuYWdlbnRzLmZvckVhY2goKGFnZW50LCBpKSA9PiB7IHRoaXMuX2FnZW50SW5kZXhbYWdlbnQuaWRdID0gaTsgfSk7IC8vIHJlYXNzaWduIGFnZW50XHJcbiAgICAgICAgICAgIHRoaXMuYWdlbnRzLmZvckVhY2goKGFnZW50LCBpKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBhZ2VudC5tb2RlbEluZGV4ZXMuZm9yRWFjaCgobW9kZWxJbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZWxzW21vZGVsSW5kZXhdLnVwZGF0ZShhZ2VudCwgc3RlcCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGFnZW50LnRpbWUgPSBhZ2VudC50aW1lICsgc3RlcCB8fCAwO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZhdGlvblR5cGUgPT09IFwicGFyYWxsZWxcIikge1xyXG4gICAgICAgICAgICBsZXQgdGVtcEFnZW50cyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5hZ2VudHMpKTtcclxuICAgICAgICAgICAgdGVtcEFnZW50cy5mb3JFYWNoKChhZ2VudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgYWdlbnQubW9kZWxJbmRleGVzLmZvckVhY2goKG1vZGVsSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVsc1ttb2RlbEluZGV4XS51cGRhdGUoYWdlbnQsIHN0ZXApO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLmFnZW50cy5mb3JFYWNoKChhZ2VudCwgaSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgYWdlbnQubW9kZWxJbmRleGVzLmZvckVhY2goKG1vZGVsSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVsc1ttb2RlbEluZGV4XS5hcHBseShhZ2VudCwgdGVtcEFnZW50c1tpXSwgc3RlcCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGFnZW50LnRpbWUgPSBhZ2VudC50aW1lICsgc3RlcCB8fCAwO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKiogRm9ybWF0IGEgdGltZSBvZiBkYXkuIEN1cnJlbnQgdGltZSAlIDEuXHJcbiAgICAqXHJcbiAgICAqL1xyXG4gICAgZm9ybWF0VGltZSgpIHtcclxuICAgICAgICB0aGlzLnRpbWVPZkRheSA9IHRoaXMudGltZSAlIDE7XHJcbiAgICB9XHJcbiAgICAvKiogR2V0cyBhZ2VudCBieSBpZC4gQSB1dGlsaXR5IGZ1bmN0aW9uIHRoYXRcclxuICAgICpcclxuICAgICovXHJcbiAgICBnZXRBZ2VudEJ5SWQoaWQpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hZ2VudHNbdGhpcy5fYWdlbnRJbmRleFtpZF1dO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWVudmlyb25tZW50LmpzLm1hcCIsImV4cG9ydCBjbGFzcyBFcGkge1xyXG4gICAgc3RhdGljIHByZXZhbGVuY2UoY2FzZXMsIHRvdGFsKSB7XHJcbiAgICAgICAgdmFyIHByZXYgPSBjYXNlcyAvIHRvdGFsO1xyXG4gICAgICAgIHJldHVybiBwcmV2O1xyXG4gICAgfVxyXG4gICAgc3RhdGljIHJpc2tEaWZmZXJlbmNlKHRhYmxlKSB7XHJcbiAgICAgICAgdmFyIHJkID0gdGFibGUuYSAvICh0YWJsZS5hICsgdGFibGUuYikgLSB0YWJsZS5jIC8gKHRhYmxlLmMgKyB0YWJsZS5kKTtcclxuICAgICAgICByZXR1cm4gcmQ7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgcmlza1JhdGlvKHRhYmxlKSB7XHJcbiAgICAgICAgdmFyIHJyYXRpbyA9ICh0YWJsZS5hIC8gKHRhYmxlLmEgKyB0YWJsZS5iKSkgLyAodGFibGUuYyAvICh0YWJsZS5jICsgdGFibGUuZCkpO1xyXG4gICAgICAgIHJldHVybiBycmF0aW87XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgb2Rkc1JhdGlvKHRhYmxlKSB7XHJcbiAgICAgICAgdmFyIG9yID0gKHRhYmxlLmEgKiB0YWJsZS5kKSAvICh0YWJsZS5iICogdGFibGUuYyk7XHJcbiAgICAgICAgcmV0dXJuIG9yO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIElQRjJEKHJvd1RvdGFscywgY29sVG90YWxzLCBpdGVyYXRpb25zLCBzZWVkcykge1xyXG4gICAgICAgIHZhciByVCA9IDAsIGNUID0gMCwgc2VlZENlbGxzID0gc2VlZHM7XHJcbiAgICAgICAgcm93VG90YWxzLmZvckVhY2goZnVuY3Rpb24gKHIsIGkpIHtcclxuICAgICAgICAgICAgclQgKz0gcjtcclxuICAgICAgICAgICAgc2VlZENlbGxzW2ldID0gc2VlZENlbGxzW2ldIHx8IFtdO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbFRvdGFscy5mb3JFYWNoKGZ1bmN0aW9uIChjLCBqKSB7XHJcbiAgICAgICAgICAgIGNUICs9IGM7XHJcbiAgICAgICAgICAgIHNlZWRDZWxscy5mb3JFYWNoKGZ1bmN0aW9uIChyb3csIGspIHtcclxuICAgICAgICAgICAgICAgIHNlZWRDZWxsc1trXVtqXSA9IHNlZWRDZWxsc1trXVtqXSB8fCBNYXRoLnJvdW5kKHJvd1RvdGFsc1trXSAvIHJvd1RvdGFscy5sZW5ndGggKyAoY29sVG90YWxzW2pdIC8gY29sVG90YWxzLmxlbmd0aCkgLyAyICogTWF0aC5yYW5kb20oKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChyVCA9PT0gY1QpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaXRlciA9IDA7IGl0ZXIgPCBpdGVyYXRpb25zOyBpdGVyKyspIHtcclxuICAgICAgICAgICAgICAgIHNlZWRDZWxscy5mb3JFYWNoKGZ1bmN0aW9uIChyb3csIGlpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRSb3dUb3RhbCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgcm93LmZvckVhY2goZnVuY3Rpb24gKGNlbGwsIGopIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFJvd1RvdGFsICs9IGNlbGw7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcm93LmZvckVhY2goZnVuY3Rpb24gKGNlbGwsIGpqKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZWRDZWxsc1tpaV1bampdID0gY2VsbCAvIGN1cnJlbnRSb3dUb3RhbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VlZENlbGxzW2lpXVtqal0gKj0gcm93VG90YWxzW2lpXTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgY29sVG90YWxzLmxlbmd0aDsgY29sKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudENvbFRvdGFsID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBzZWVkQ2VsbHMuZm9yRWFjaChmdW5jdGlvbiAociwgaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50Q29sVG90YWwgKz0gcltjb2xdO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlZWRDZWxscy5mb3JFYWNoKGZ1bmN0aW9uIChyb3csIGtrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZWRDZWxsc1tra11bY29sXSA9IHJvd1tjb2xdIC8gY3VycmVudENvbFRvdGFsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWVkQ2VsbHNba2tdW2NvbF0gKj0gY29sVG90YWxzW2NvbF07XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHNlZWRDZWxscztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZXBpLmpzLm1hcCIsIi8qKiBFdmVudHMgY2xhc3MgaW5jbHVkZXMgbWV0aG9kcyBmb3Igb3JnYW5pemluZyBldmVudHMuXHJcbipcclxuKi9cclxuZXhwb3J0IGNsYXNzIEV2ZW50cyB7XHJcbiAgICBjb25zdHJ1Y3RvcihldmVudHMgPSBbXSkge1xyXG4gICAgICAgIHRoaXMucXVldWUgPSBbXTtcclxuICAgICAgICB0aGlzLnNjaGVkdWxlKGV2ZW50cyk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICogc2NoZWR1bGUgYW4gZXZlbnQgd2l0aCB0aGUgc2FtZSB0cmlnZ2VyIG11bHRpcGxlIHRpbWVzLlxyXG4gICAgKiBAcGFyYW0gcWV2ZW50IGlzIHRoZSBldmVudCB0byBiZSBzY2hlZHVsZWQuIFRoZSBhdCBwYXJhbWV0ZXIgc2hvdWxkIGNvbnRhaW4gdGhlIHRpbWUgYXQgZmlyc3QgaW5zdGFuY2UuXHJcbiAgICAqIEBwYXJhbSBldmVyeSBpbnRlcnZhbCBmb3IgZWFjaCBvY2N1cm5jZVxyXG4gICAgKiBAcGFyYW0gZW5kIHVudGlsXHJcbiAgICAqL1xyXG4gICAgc2NoZWR1bGVSZWN1cnJpbmcocWV2ZW50LCBldmVyeSwgZW5kKSB7XHJcbiAgICAgICAgdmFyIHJlY3VyID0gW107XHJcbiAgICAgICAgdmFyIGR1cmF0aW9uID0gZW5kIC0gcWV2ZW50LmF0O1xyXG4gICAgICAgIHZhciBvY2N1cmVuY2VzID0gTWF0aC5mbG9vcihkdXJhdGlvbiAvIGV2ZXJ5KTtcclxuICAgICAgICBpZiAoIXFldmVudC51bnRpbCkge1xyXG4gICAgICAgICAgICBxZXZlbnQudW50aWwgPSBxZXZlbnQuYXQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IG9jY3VyZW5jZXM7IGkrKykge1xyXG4gICAgICAgICAgICByZWN1ci5wdXNoKHsgbmFtZTogcWV2ZW50Lm5hbWUgKyBpLCBhdDogcWV2ZW50LmF0ICsgKGkgKiBldmVyeSksIHVudGlsOiBxZXZlbnQudW50aWwgKyAoaSAqIGV2ZXJ5KSwgdHJpZ2dlcjogcWV2ZW50LnRyaWdnZXIsIHRyaWdnZXJlZDogZmFsc2UgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2NoZWR1bGUocmVjdXIpO1xyXG4gICAgfVxyXG4gICAgLypcclxuICAgICogc2NoZWR1bGUgYSBvbmUgdGltZSBldmVudHMuIHRoaXMgYXJyYW5nZXMgdGhlIGV2ZW50IHF1ZXVlIGluIGNocm9ub2xvZ2ljYWwgb3JkZXIuXHJcbiAgICAqIEBwYXJhbSBxZXZlbnRzIGFuIGFycmF5IG9mIGV2ZW50cyB0byBiZSBzY2hlZHVsZXMuXHJcbiAgICAqL1xyXG4gICAgc2NoZWR1bGUocWV2ZW50cykge1xyXG4gICAgICAgIHFldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICBkLnVudGlsID0gZC51bnRpbCB8fCBkLmF0O1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMucXVldWUgPSB0aGlzLnF1ZXVlLmNvbmNhdChxZXZlbnRzKTtcclxuICAgICAgICB0aGlzLnF1ZXVlID0gdGhpcy5vcmdhbml6ZSh0aGlzLnF1ZXVlLCAwLCB0aGlzLnF1ZXVlLmxlbmd0aCk7XHJcbiAgICB9XHJcbiAgICBwYXJ0aXRpb24oYXJyYXksIGxlZnQsIHJpZ2h0KSB7XHJcbiAgICAgICAgdmFyIGNtcCA9IGFycmF5W3JpZ2h0IC0gMV0uYXQsIG1pbkVuZCA9IGxlZnQsIG1heEVuZDtcclxuICAgICAgICBmb3IgKG1heEVuZCA9IGxlZnQ7IG1heEVuZCA8IHJpZ2h0IC0gMTsgbWF4RW5kICs9IDEpIHtcclxuICAgICAgICAgICAgaWYgKGFycmF5W21heEVuZF0uYXQgPD0gY21wKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN3YXAoYXJyYXksIG1heEVuZCwgbWluRW5kKTtcclxuICAgICAgICAgICAgICAgIG1pbkVuZCArPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc3dhcChhcnJheSwgbWluRW5kLCByaWdodCAtIDEpO1xyXG4gICAgICAgIHJldHVybiBtaW5FbmQ7XHJcbiAgICB9XHJcbiAgICBzd2FwKGFycmF5LCBpLCBqKSB7XHJcbiAgICAgICAgdmFyIHRlbXAgPSBhcnJheVtpXTtcclxuICAgICAgICBhcnJheVtpXSA9IGFycmF5W2pdO1xyXG4gICAgICAgIGFycmF5W2pdID0gdGVtcDtcclxuICAgICAgICByZXR1cm4gYXJyYXk7XHJcbiAgICB9XHJcbiAgICBvcmdhbml6ZShldmVudHMsIGxlZnQsIHJpZ2h0KSB7XHJcbiAgICAgICAgaWYgKGxlZnQgPCByaWdodCkge1xyXG4gICAgICAgICAgICB2YXIgcCA9IHRoaXMucGFydGl0aW9uKGV2ZW50cywgbGVmdCwgcmlnaHQpO1xyXG4gICAgICAgICAgICB0aGlzLm9yZ2FuaXplKGV2ZW50cywgbGVmdCwgcCk7XHJcbiAgICAgICAgICAgIHRoaXMub3JnYW5pemUoZXZlbnRzLCBwICsgMSwgcmlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZXZlbnRzO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWV2ZW50cy5qcy5tYXAiLCJpbXBvcnQgeyBRQ29tcG9uZW50IH0gZnJvbSAnLi9RQ29tcG9uZW50JztcclxuZXhwb3J0IGNsYXNzIFN0YXRlTWFjaGluZSBleHRlbmRzIFFDb21wb25lbnQge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgc3RhdGVzLCB0cmFuc2l0aW9ucywgY29uZGl0aW9ucywgZGF0YSkge1xyXG4gICAgICAgIHN1cGVyKG5hbWUpO1xyXG4gICAgICAgIHRoaXMuc3RhdGVzID0gc3RhdGVzO1xyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbnMgPSB0aGlzLmNoZWNrVHJhbnNpdGlvbnModHJhbnNpdGlvbnMpO1xyXG4gICAgICAgIHRoaXMuY29uZGl0aW9ucyA9IGNvbmRpdGlvbnM7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgIH1cclxuICAgIHVwZGF0ZShhZ2VudCwgc3RlcCkge1xyXG4gICAgICAgIGZvciAodmFyIHMgaW4gYWdlbnQuc3RhdGVzKSB7XHJcbiAgICAgICAgICAgIGxldCBzdGF0ZSA9IGFnZW50LnN0YXRlc1tzXTtcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZXNbc3RhdGVdKGFnZW50LCBzdGVwKTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnRyYW5zaXRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMudHJhbnNpdGlvbnNbaV0uZnJvbS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0cmFucyA9IHRoaXMudHJhbnNpdGlvbnNbaV0uZnJvbVtqXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnMgPT09IHN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB2YWx1ZSwgcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNvbmQgPSB0aGlzLmNvbmRpdGlvbnNbdGhpcy50cmFuc2l0aW9uc1tpXS5uYW1lXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAoY29uZC52YWx1ZSkgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gY29uZC52YWx1ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBjb25kLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHIgPSBjb25kLmNoZWNrKGFnZW50W2NvbmQua2V5XSwgdmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAociA9PT0gU3RhdGVNYWNoaW5lLlNVQ0NFU1MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFnZW50LnN0YXRlc1tzXSA9IHRoaXMudHJhbnNpdGlvbnNbaV0udG87XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZ2VudFt0aGlzLnRyYW5zaXRpb25zW2ldLnRvXSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZ2VudFt0aGlzLnRyYW5zaXRpb25zW2ldLmZyb21dID0gZmFsc2U7IC8vZm9yIGVhc2llciByZXBvcnRpbmdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGNoZWNrVHJhbnNpdGlvbnModHJhbnNpdGlvbnMpIHtcclxuICAgICAgICBmb3IgKHZhciB0ID0gMDsgdCA8IHRyYW5zaXRpb25zLmxlbmd0aDsgdCsrKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdHJhbnNpdGlvbnNbdF0uZnJvbSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIHRyYW5zaXRpb25zW3RdLmZyb20gPSBbdHJhbnNpdGlvbnNbdF0uZnJvbV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJhbnNpdGlvbnM7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c3RhdGVNYWNoaW5lLmpzLm1hcCIsImltcG9ydCB7IGdlbmVyYXRlVVVJRCB9IGZyb20gJy4vdXRpbHMnO1xyXG5pbXBvcnQgeyBQYXRjaCwgQ29tcGFydG1lbnRNb2RlbCB9IGZyb20gJy4vY29tcGFydG1lbnQnO1xyXG5pbXBvcnQgeyBFbnZpcm9ubWVudCB9IGZyb20gJy4vZW52aXJvbm1lbnQnO1xyXG5pbXBvcnQgeyBTdGF0ZU1hY2hpbmUgfSBmcm9tICcuL3N0YXRlTWFjaGluZSc7XHJcbmltcG9ydCB7IGdlbmVyYXRlUG9wIH0gZnJvbSAnLi91dGlscyc7XHJcbi8qKlxyXG4qQmF0Y2ggcnVuIGVudmlyb25tZW50c1xyXG4qL1xyXG5leHBvcnQgY2xhc3MgRXhwZXJpbWVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbnZpcm9ubWVudCwgc2V0dXAsIHRhcmdldCkge1xyXG4gICAgICAgIHRoaXMuZW52aXJvbm1lbnQgPSBlbnZpcm9ubWVudDtcclxuICAgICAgICB0aGlzLnNldHVwID0gc2V0dXA7XHJcbiAgICAgICAgdGhpcy5ybmcgPSBzZXR1cC5leHBlcmltZW50LnJuZztcclxuICAgICAgICB0aGlzLmV4cGVyaW1lbnRMb2cgPSBbXTtcclxuICAgIH1cclxuICAgIHN0YXJ0KHJ1bnMsIHN0ZXAsIHVudGlsKSB7XHJcbiAgICAgICAgdmFyIHIgPSAwO1xyXG4gICAgICAgIHdoaWxlIChyIDwgcnVucykge1xyXG4gICAgICAgICAgICB0aGlzLnByZXAociwgdGhpcy5zZXR1cCk7XHJcbiAgICAgICAgICAgIHRoaXMuZW52aXJvbm1lbnQudGltZSA9IDA7IC8vXHJcbiAgICAgICAgICAgIHRoaXMuZW52aXJvbm1lbnQucnVuKHN0ZXAsIHVudGlsLCAwKTtcclxuICAgICAgICAgICAgdGhpcy5leHBlcmltZW50TG9nW3JdID0gdGhpcy5yZXBvcnQociwgdGhpcy5zZXR1cCk7XHJcbiAgICAgICAgICAgIHIrKztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcmVwKHIsIGNmZywgYWdlbnRzLCB2aXN1YWxpemUpIHtcclxuICAgICAgICBsZXQgZ3JvdXBzID0ge307XHJcbiAgICAgICAgbGV0IGN1cnJlbnRBZ2VudElkID0gMDtcclxuICAgICAgICB0aGlzLmVudmlyb25tZW50ID0gbmV3IEVudmlyb25tZW50KCk7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjZmcuYWdlbnRzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBnck5hbWUgaW4gY2ZnLmFnZW50cykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGdyb3VwID0gY2ZnLmFnZW50c1tnck5hbWVdO1xyXG4gICAgICAgICAgICAgICAgZ3JvdXAucGFyYW1zLmdyb3VwTmFtZSA9IGdyTmFtZTtcclxuICAgICAgICAgICAgICAgIGdyb3Vwc1tnck5hbWVdID0gZ2VuZXJhdGVQb3AoZ3JvdXAuY291bnQsIGdyb3VwLnBhcmFtcywgY2ZnLmVudmlyb25tZW50LnNwYXRpYWxUeXBlLCBncm91cC5ib3VuZGFyaWVzLCBjdXJyZW50QWdlbnRJZCwgdGhpcy5ybmcpO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEFnZW50SWQgPSBncm91cHNbZ3JOYW1lXVtncm91cHNbZ3JOYW1lXS5sZW5ndGggLSAxXS5pZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNmZy5jb21wb25lbnRzLmZvckVhY2goKGNtcCkgPT4ge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGNtcC50eXBlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdzdGF0ZS1tYWNoaW5lJzpcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc20gPSBuZXcgU3RhdGVNYWNoaW5lKGNtcC5uYW1lLCBjbXAuc3RhdGVzLCBjbXAudHJhbnNpdGlvbnMsIGNtcC5jb25kaXRpb25zLCBncm91cHNbY21wLmFnZW50c11bMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW52aXJvbm1lbnQuYWRkKHNtKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2NvbXBhcnRtZW50YWwnOlxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXRjaGVzID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgY2ZnLnBhdGNoZXMuZm9yRWFjaCgocGF0Y2gpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNtcC5wYXRjaGVzLmluZGV4T2YocGF0Y2gubmFtZSkgIT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGNoZXMucHVzaChuZXcgUGF0Y2gocGF0Y2gubmFtZSwgY21wLmNvbXBhcnRtZW50cywgcGF0Y2gucG9wdWxhdGlvbnMpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjTW9kZWwgPSBuZXcgQ29tcGFydG1lbnRNb2RlbCgnY21wLm5hbWUnLCBjbXAuY29tcGFydG1lbnRzLCBwYXRjaGVzKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVudmlyb25tZW50LmFkZChjTW9kZWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZXZlcnktc3RlcCc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC5hZGQoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogZ2VuZXJhdGVVVUlEKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNtcC5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGU6IGNtcC5hY3Rpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGdyb3Vwc1tjbXAuYWdlbnRzXVswXVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHN3aXRjaCAoY2ZnLmV4cGVyaW1lbnQpIHtcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGlmIChyID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVudmlyb25tZW50LnJuZyA9IHRoaXMucm5nO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW52aXJvbm1lbnQucnVuKGNmZy5lbnZpcm9ubWVudC5zdGVwLCBjZmcuZW52aXJvbm1lbnQudW50aWwsIDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmVwb3J0KHIsIGNmZykge1xyXG4gICAgICAgIGxldCBzdW1zID0ge307XHJcbiAgICAgICAgbGV0IG1lYW5zID0ge307XHJcbiAgICAgICAgbGV0IGZyZXFzID0ge307XHJcbiAgICAgICAgbGV0IG1vZGVsID0ge307XHJcbiAgICAgICAgbGV0IGNvdW50ID0gdGhpcy5lbnZpcm9ubWVudC5hZ2VudHMubGVuZ3RoO1xyXG4gICAgICAgIC8vY2ZnLnJlcG9ydC5zdW0gPSBjZmcucmVwb3J0LnN1bS5jb25jYXQoY2ZnLnJlcG9ydC5tZWFuKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZW52aXJvbm1lbnQuYWdlbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBkID0gdGhpcy5lbnZpcm9ubWVudC5hZ2VudHNbaV07XHJcbiAgICAgICAgICAgIGNmZy5yZXBvcnQuc3Vtcy5mb3JFYWNoKChzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzdW1zW3NdID0gc3Vtc1tzXSA9PSB1bmRlZmluZWQgPyBkW3NdIDogZFtzXSArIHN1bXNbc107XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjZmcucmVwb3J0LmZyZXFzLmZvckVhY2goKGYpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICghaXNOYU4oZFtmXSkgJiYgdHlwZW9mIGRbZl0gIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBmcmVxc1tmXSA9IGZyZXFzW2ZdID09IHVuZGVmaW5lZCA/IGRbZl0gOiBkW2ZdICsgZnJlcXNbZl07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoJ2NvbXBhcnRtZW50cycgaW4gZCkge1xyXG4gICAgICAgICAgICAgICAgY2ZnLnJlcG9ydC5jb21wYXJ0bWVudHMuZm9yRWFjaCgoY20pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RlbFtjbV0gPSBtb2RlbFtjbV0gPT0gdW5kZWZpbmVkID8gZC5wb3B1bGF0aW9uc1tjbV0gOiBkLnBvcHVsYXRpb25zW2NtXSArIG1vZGVsW2NtXTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIDtcclxuICAgICAgICBjZmcucmVwb3J0Lm1lYW5zLmZvckVhY2goKG0pID0+IHtcclxuICAgICAgICAgICAgbWVhbnNbbV0gPSBzdW1zW21dIC8gY291bnQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcnVuOiByLFxyXG4gICAgICAgICAgICBjb3VudDogY291bnQsXHJcbiAgICAgICAgICAgIHN1bXM6IHN1bXMsXHJcbiAgICAgICAgICAgIG1lYW5zOiBtZWFucyxcclxuICAgICAgICAgICAgZnJlcXM6IGZyZXFzLFxyXG4gICAgICAgICAgICBtb2RlbDogbW9kZWwsXHJcbiAgICAgICAgICAgIHNjb3JlOiAwXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIC8vb24gZWFjaCBydW4sIGNoYW5nZSBvbmUgcGFyYW0sIGhvbGQgb3RoZXJzIGNvbnN0YW50XHJcbiAgICBzd2VlcChwYXJhbXMsIHJ1bnNQZXIsIGJhc2VsaW5lID0gdHJ1ZSkge1xyXG4gICAgICAgIHZhciBleHBQbGFuID0gW107XHJcbiAgICAgICAgaWYgKGJhc2VsaW5lID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHBhcmFtcy5iYXNlbGluZSA9IFt0cnVlXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBwYXJhbXMpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJhbXNbcHJvcF0ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgcnVuc1BlcjsgaysrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXhwUGxhbi5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW06IHByb3AsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBwYXJhbXNbcHJvcF1baV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bjoga1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucGxhbnMgPSBleHBQbGFuO1xyXG4gICAgfVxyXG4gICAgYm9vdChwYXJhbXMpIHtcclxuICAgICAgICBsZXQgcnVucztcclxuICAgICAgICBmb3IgKGxldCBwYXJhbSBpbiBwYXJhbXMpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBydW5zID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgcnVucyA9IHBhcmFtc1twYXJhbV0ubGVuZ3RoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwYXJhbXNbcGFyYW1dLmxlbmd0aCAhPT0gcnVucykge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgXCJsZW5ndGggb2YgcGFyYW1ldGVyIGFycmF5cyBkaWQgbm90IG1hdGNoXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wbGFucyA9IHBhcmFtcztcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1leHBlcmltZW50LmpzLm1hcCIsImltcG9ydCB7IG5vcm1hbGl6ZSB9IGZyb20gJy4vdXRpbHMnO1xyXG5leHBvcnQgY2xhc3MgR2VuZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihyYW5nZSwgZGlzY3JldGUsIHJuZykge1xyXG4gICAgICAgIGxldCB2YWwgPSBybmcucmFuZFJhbmdlKHJhbmdlWzBdLCByYW5nZVsxXSk7XHJcbiAgICAgICAgaWYgKCFkaXNjcmV0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmNvZGUgPSBub3JtYWxpemUodmFsLCByYW5nZVswXSwgcmFuZ2VbMV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5jb2RlID0gTWF0aC5mbG9vcih2YWwpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgQ2hyb21hc29tZSB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmdlbmVzID0gW107XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Z2VuZXRpYy5qcy5tYXAiLCJpbXBvcnQgeyBFeHBlcmltZW50IH0gZnJvbSAnLi9leHBlcmltZW50JztcclxuaW1wb3J0IHsgQ2hyb21hc29tZSwgR2VuZSB9IGZyb20gJy4vZ2VuZXRpYyc7XHJcbmltcG9ydCB7IGludk5vcm0gfSBmcm9tICcuL3V0aWxzJztcclxuZXhwb3J0IGNsYXNzIEV2b2x1dGlvbmFyeSBleHRlbmRzIEV4cGVyaW1lbnQge1xyXG4gICAgY29uc3RydWN0b3IoZW52aXJvbm1lbnQsIHNldHVwLCBkaXNjcmV0ZSA9IGZhbHNlLCBncmFkaWVudCA9IHRydWUsIG1hdGluZyA9IHRydWUpIHtcclxuICAgICAgICBzdXBlcihlbnZpcm9ubWVudCwgc2V0dXApO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gc2V0dXAuZXZvbHV0aW9uLnRhcmdldDtcclxuICAgICAgICB0aGlzLnJhbmdlcyA9IHNldHVwLmV2b2x1dGlvbi5wYXJhbXM7XHJcbiAgICAgICAgdGhpcy5zaXplID0gc2V0dXAuZXhwZXJpbWVudC5zaXplO1xyXG4gICAgICAgIHRoaXMubWF0aW5nID0gbWF0aW5nO1xyXG4gICAgICAgIGlmICh0aGlzLnNpemUgPCAyKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWF0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZGlzY3JldGUgPSBkaXNjcmV0ZTtcclxuICAgICAgICB0aGlzLmdyYWRpZW50ID0gZ3JhZGllbnQ7XHJcbiAgICAgICAgdGhpcy5wb3B1bGF0aW9uID0gW107XHJcbiAgICAgICAgdGhpcy5tdXRhdGVSYXRlID0gMC4wMztcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc2l6ZTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjaHJvbWEgPSBuZXcgQ2hyb21hc29tZSgpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IHRoaXMucmFuZ2VzLmxlbmd0aDsgaysrKSB7XHJcbiAgICAgICAgICAgICAgICBjaHJvbWEuZ2VuZXMucHVzaChuZXcgR2VuZSh0aGlzLnJhbmdlc1trXS5yYW5nZSwgdGhpcy5kaXNjcmV0ZSwgdGhpcy5ybmcpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnBvcHVsYXRpb24ucHVzaChjaHJvbWEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHN0YXJ0KHJ1bnMsIHN0ZXAsIHVudGlsKSB7XHJcbiAgICAgICAgbGV0IHIgPSAwO1xyXG4gICAgICAgIHdoaWxlIChyIDwgcnVucykge1xyXG4gICAgICAgICAgICB0aGlzLnByZXAociwgdGhpcy5zZXR1cCk7XHJcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGlvbi5zb3J0KHRoaXMuYXNjU29ydCk7XHJcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGlvbiA9IHRoaXMucG9wdWxhdGlvbi5zbGljZSgwLCB0aGlzLnNpemUpO1xyXG4gICAgICAgICAgICB0aGlzLmV4cGVyaW1lbnRMb2dbdGhpcy5leHBlcmltZW50TG9nLmxlbmd0aCAtIDFdLmJlc3QgPSB0cnVlO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnYmVzdDogJywgdGhpcy5leHBlcmltZW50TG9nW3RoaXMuZXhwZXJpbWVudExvZy5sZW5ndGggLSAxXSk7XHJcbiAgICAgICAgICAgIHIrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5pbXByb3ZlbWVudCA9IHRoaXMuaW1wcm92ZW1lbnRTY29yZSh0aGlzLmV4cGVyaW1lbnRMb2cpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmV4cGVyaW1lbnRMb2c7XHJcbiAgICB9XHJcbiAgICBnZXRQYXJhbXMoY2hyb21hLCBjZmcpIHtcclxuICAgICAgICBsZXQgb3V0ID0ge307XHJcbiAgICAgICAgZm9yIChsZXQgcG0gPSAwOyBwbSA8IHRoaXMucmFuZ2VzLmxlbmd0aDsgcG0rKykge1xyXG4gICAgICAgICAgICBsZXQgY2ZnUG0gPSB0aGlzLnJhbmdlc1twbV07XHJcbiAgICAgICAgICAgIGlmIChjZmdQbS5sZXZlbCA9PT0gJ2FnZW50cycgfHwgdHlwZW9mIGNmZ1BtLmxldmVsID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgb3V0W2NmZ1BtLmxldmVsICsgXCJfXCIgKyBjZmdQbS5uYW1lXSA9IGludk5vcm0oY2hyb21hLmdlbmVzW3BtXS5jb2RlLCBjZmdQbS5yYW5nZVswXSwgY2ZnUG0ucmFuZ2VbMV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgb3V0W2NmZ1BtLmxldmVsICsgXCJfXCIgKyBjZmdQbS5uYW1lXSA9IGludk5vcm0oY2hyb21hLmdlbmVzW3BtXS5jb2RlLCBjZmdQbS5yYW5nZVswXSwgY2ZnUG0ucmFuZ2VbMV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvdXQ7XHJcbiAgICB9XHJcbiAgICBkc2NTb3J0KGEsIGIpIHtcclxuICAgICAgICBpZiAoYS5zY29yZSA+IGIuc2NvcmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChhLnNjb3JlIDwgYi5zY29yZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICBhc2NTb3J0KGEsIGIpIHtcclxuICAgICAgICBpZiAoYS5zY29yZSA+IGIuc2NvcmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGEuc2NvcmUgPCBiLnNjb3JlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICBwcmVwKHIsIGNmZykge1xyXG4gICAgICAgIGxldCByZXBvcnQ7XHJcbiAgICAgICAgaWYgKHRoaXMubWF0aW5nKSB7XHJcbiAgICAgICAgICAgIGxldCB0b3BQZXJjZW50ID0gTWF0aC5yb3VuZCgwLjEgKiB0aGlzLnNpemUpICsgMjsgLy90ZW4gcGVyY2VudCBvZiBvcmlnaW5hbCBzaXplICsgMlxyXG4gICAgICAgICAgICBsZXQgY2hpbGRyZW4gPSB0aGlzLm1hdGUodG9wUGVyY2VudCk7XHJcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGlvbiA9IHRoaXMucG9wdWxhdGlvbi5jb25jYXQoY2hpbGRyZW4pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IHRoaXMucG9wdWxhdGlvbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLm11dGF0ZSh0aGlzLnBvcHVsYXRpb25baV0sIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMucG9wdWxhdGlvbi5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwbSA9IDA7IHBtIDwgdGhpcy5yYW5nZXMubGVuZ3RoOyBwbSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2ZnUG0gPSB0aGlzLnJhbmdlc1twbV07XHJcbiAgICAgICAgICAgICAgICBsZXQgZ3JvdXBJZHg7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2ZnUG0ubGV2ZWwgPT09ICdhZ2VudHMnIHx8IHR5cGVvZiBjZmdQbS5sZXZlbCA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBjZmcuYWdlbnRzW2NmZ1BtLmdyb3VwXS5wYXJhbXNbY2ZnUG0ubmFtZV0uYXNzaWduID0gaW52Tm9ybSh0aGlzLnBvcHVsYXRpb25bal0uZ2VuZXNbcG1dLmNvZGUsIGNmZ1BtLnJhbmdlWzBdLCBjZmdQbS5yYW5nZVsxXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjZmdbY2ZnUG0ubGV2ZWxdLnBhcmFtc1tjZmdQbS5ncm91cF1bY2ZnUG0ubmFtZV0gPSBpbnZOb3JtKHRoaXMucG9wdWxhdGlvbltqXS5nZW5lc1twbV0uY29kZSwgY2ZnUG0ucmFuZ2VbMF0sIGNmZ1BtLnJhbmdlWzFdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzdXBlci5wcmVwKHIsIGNmZyk7XHJcbiAgICAgICAgICAgIHRoaXMuZW52aXJvbm1lbnQudGltZSA9IDA7XHJcbiAgICAgICAgICAgIHJlcG9ydCA9IHRoaXMucmVwb3J0KHIsIGNmZyk7XHJcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGlvbltqXS5zY29yZSA9IHRoaXMuY29zdChyZXBvcnQsIHRoaXMudGFyZ2V0KTtcclxuICAgICAgICAgICAgcmVwb3J0LnNjb3JlID0gdGhpcy5wb3B1bGF0aW9uW2pdLnNjb3JlO1xyXG4gICAgICAgICAgICB0aGlzLmV4cGVyaW1lbnRMb2cucHVzaChyZXBvcnQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGNvc3QocHJlZGljdCwgdGFyZ2V0KSB7XHJcbiAgICAgICAgbGV0IGRldiA9IDA7XHJcbiAgICAgICAgbGV0IGRpbWVuc2lvbnMgPSAwO1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiB0YXJnZXQubWVhbnMpIHtcclxuICAgICAgICAgICAgZGV2ICs9IE1hdGguYWJzKHRhcmdldC5tZWFuc1trZXldIC0gcHJlZGljdC5tZWFuc1trZXldKTtcclxuICAgICAgICAgICAgZGltZW5zaW9ucysrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gdGFyZ2V0LmZyZXFzKSB7XHJcbiAgICAgICAgICAgIGRldiArPSBNYXRoLmFicyh0YXJnZXQuZnJlcXNba2V5XSAtIHByZWRpY3QuZnJlcXNba2V5XSk7XHJcbiAgICAgICAgICAgIGRpbWVuc2lvbnMrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHRhcmdldC5tb2RlbCkge1xyXG4gICAgICAgICAgICBkZXYgKz0gTWF0aC5hYnModGFyZ2V0Lm1vZGVsW2tleV0gLSBwcmVkaWN0Lm1vZGVsW2tleV0pO1xyXG4gICAgICAgICAgICBkaW1lbnNpb25zKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkZXYgLyBkaW1lbnNpb25zO1xyXG4gICAgfVxyXG4gICAgcmVwb3J0KHIsIGNmZykge1xyXG4gICAgICAgIGxldCByZXBvcnQgPSBzdXBlci5yZXBvcnQociwgY2ZnKTtcclxuICAgICAgICByZXR1cm4gcmVwb3J0O1xyXG4gICAgfVxyXG4gICAgaW1wcm92ZW1lbnRTY29yZShsb2csIGF2Z0dlbmVyYXRpb24gPSB0cnVlKSB7XHJcbiAgICAgICAgbGV0IE4gPSBsb2cubGVuZ3RoO1xyXG4gICAgICAgIGxldCBzdW0gPSAwO1xyXG4gICAgICAgIGxldCByYW5rZWQ7XHJcbiAgICAgICAgaWYgKGF2Z0dlbmVyYXRpb24pIHtcclxuICAgICAgICAgICAgcmFua2VkID0gdGhpcy5nZW5BdmcobG9nKTtcclxuICAgICAgICAgICAgTiA9IHJhbmtlZC5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByYW5rZWQgPSBsb2cubWFwKChkLCBpKSA9PiB7IGQub3JkZXIgPSBpOyByZXR1cm4gZDsgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJhbmtlZC5zb3J0KHRoaXMuZHNjU29ydCk7XHJcbiAgICAgICAgcmFua2VkLm1hcCgoZCwgaSkgPT4geyBkLnJhbmsgPSBpOyByZXR1cm4gZDsgfSk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByYW5rZWQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgc3VtICs9IE1hdGguYWJzKHJhbmtlZFtpXS5vcmRlciAvIE4gLSByYW5rZWRbaV0ucmFuayAvIE4pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gMSAtIDIgKiBzdW0gLyBOO1xyXG4gICAgfVxyXG4gICAgZ2VuQXZnKGxvZykge1xyXG4gICAgICAgIGxldCBzdW1zID0ge307XHJcbiAgICAgICAgbGV0IHBvcHMgPSB7fTtcclxuICAgICAgICBsZXQgYXZncyA9IFtdO1xyXG4gICAgICAgIGxvZy5mb3JFYWNoKChkKSA9PiB7XHJcbiAgICAgICAgICAgIHN1bXNbZC5ydW5dID0gc3Vtc1tkLnJ1bl0gKyBkLnNjb3JlIHx8IGQuc2NvcmU7XHJcbiAgICAgICAgICAgIHBvcHNbZC5ydW5dID0gcG9wc1tkLnJ1bl0gKyAxIHx8IDE7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZm9yIChsZXQgcnVuIGluIHN1bXMpIHtcclxuICAgICAgICAgICAgYXZnc1tydW5dID0geyBvcmRlcjogcnVuLCBzY29yZTogc3Vtc1tydW5dIC8gcG9wc1tydW5dIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBhdmdzO1xyXG4gICAgfVxyXG4gICAgbWF0ZShwYXJlbnRzKSB7XHJcbiAgICAgICAgbGV0IG51bUNoaWxkcmVuID0gMC41ICogdGhpcy5yYW5nZXMubGVuZ3RoICogdGhpcy5yYW5nZXMubGVuZ3RoO1xyXG4gICAgICAgIGxldCBjaGlsZHJlbiA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtQ2hpbGRyZW47IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgY2hpbGQgPSBuZXcgQ2hyb21hc29tZSgpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMucmFuZ2VzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZ2VuZSA9IG5ldyBHZW5lKFt0aGlzLnJhbmdlc1tqXS5yYW5nZVswXSwgdGhpcy5yYW5nZXNbal0ucmFuZ2VbMV1dLCB0aGlzLmRpc2NyZXRlLCB0aGlzLnJuZyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmFuZCA9IE1hdGguZmxvb3IodGhpcy5ybmcucmFuZG9tKCkgKiBwYXJlbnRzKTtcclxuICAgICAgICAgICAgICAgIGxldCBleHByZXNzZWQgPSB0aGlzLnBvcHVsYXRpb25bcmFuZF0uZ2VuZXMuc2xpY2UoaiwgaiArIDEpO1xyXG4gICAgICAgICAgICAgICAgZ2VuZS5jb2RlID0gZXhwcmVzc2VkWzBdLmNvZGU7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5nZW5lcy5wdXNoKGdlbmUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNoaWxkcmVuLnB1c2goY2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2hpbGRyZW47XHJcbiAgICB9XHJcbiAgICBtdXRhdGUoY2hyb21hLCBjaGFuY2UpIHtcclxuICAgICAgICBsZXQgYmVzdCA9IHRoaXMucG9wdWxhdGlvblswXS5nZW5lcztcclxuICAgICAgICBpZiAodGhpcy5ybmcucmFuZG9tKCkgPiBjaGFuY2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGNocm9tYS5nZW5lcy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBsZXQgZ2VuZSA9IGNocm9tYS5nZW5lc1tqXTtcclxuICAgICAgICAgICAgbGV0IGRpZmYgPSBiZXN0W2pdLmNvZGUgLSBnZW5lLmNvZGU7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5kaXNjcmV0ZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRpZmYgPT0gMCB8fCAhdGhpcy5ncmFkaWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGdlbmUuY29kZSArPSB0aGlzLnJuZy5ub3JtYWwoMCwgMSkgKiB0aGlzLm11dGF0ZVJhdGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBnZW5lLmNvZGUgKz0gZGlmZiAqIHRoaXMubXV0YXRlUmF0ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCB1cE9yRG93biA9IGRpZmYgPiAwID8gMSA6IC0xO1xyXG4gICAgICAgICAgICAgICAgZ2VuZS5jb2RlICs9IHVwT3JEb3duO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGdlbmUuY29kZSA9IE1hdGgubWluKE1hdGgubWF4KDAsIGdlbmUuY29kZSksIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1ldm9sdXRpb25hcnkuanMubWFwIiwiaW1wb3J0IHsgUUNvbXBvbmVudCB9IGZyb20gJy4vUUNvbXBvbmVudCc7XHJcbmltcG9ydCB7IFNVQ0NFU1MgfSBmcm9tICcuL3V0aWxzJztcclxuZXhwb3J0IGNsYXNzIEh5YnJpZEF1dG9tYXRhIGV4dGVuZHMgUUNvbXBvbmVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBkYXRhLCBmbG93U2V0LCBmbG93TWFwLCBqdW1wU2V0LCBqdW1wTWFwKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSk7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgICAgICB0aGlzLmZsb3dTZXQgPSBmbG93U2V0O1xyXG4gICAgICAgIHRoaXMuZmxvd01hcCA9IGZsb3dNYXA7XHJcbiAgICAgICAgdGhpcy5qdW1wU2V0ID0ganVtcFNldDtcclxuICAgICAgICB0aGlzLmp1bXBNYXAgPSBqdW1wTWFwO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlKGFnZW50LCBzdGVwKSB7XHJcbiAgICAgICAgbGV0IHRlbXAgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGFnZW50KSk7XHJcbiAgICAgICAgZm9yICh2YXIgbW9kZSBpbiB0aGlzLmp1bXBTZXQpIHtcclxuICAgICAgICAgICAgbGV0IGVkZ2UgPSB0aGlzLmp1bXBTZXRbbW9kZV07XHJcbiAgICAgICAgICAgIGxldCBlZGdlU3RhdGUgPSBlZGdlLmNoZWNrKGFnZW50W2VkZ2Uua2V5XSwgZWRnZS52YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmIChlZGdlU3RhdGUgPT09IFNVQ0NFU1MgJiYgbW9kZSAhPSBhZ2VudC5jdXJyZW50TW9kZSkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBhZ2VudFtlZGdlLmtleV0gPSB0aGlzLmp1bXBNYXBbZWRnZS5rZXldW2FnZW50LmN1cnJlbnRNb2RlXVttb2RlXShhZ2VudFtlZGdlLmtleV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGFnZW50LmN1cnJlbnRNb2RlID0gbW9kZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhdGNoIChFcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL25vIHRyYW5zaXRpb24gdGhpcyBkaXJlY3Rpb247XHJcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhFcnIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLmZsb3dNYXApIHtcclxuICAgICAgICAgICAgICAgIC8vc2Vjb25kIG9yZGVyIGludGVncmF0aW9uXHJcbiAgICAgICAgICAgICAgICBsZXQgdGVtcEQgPSB0aGlzLmZsb3dNYXBba2V5XVthZ2VudC5jdXJyZW50TW9kZV0oYWdlbnRba2V5XSk7XHJcbiAgICAgICAgICAgICAgICB0ZW1wW2tleV0gPSBhZ2VudFtrZXldICsgdGVtcEQ7XHJcbiAgICAgICAgICAgICAgICBhZ2VudFtrZXldICs9IDAuNSAqICh0ZW1wRCArIHRoaXMuZmxvd01hcFtrZXldW2FnZW50LmN1cnJlbnRNb2RlXSh0ZW1wW2tleV0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1oYS5qcy5tYXAiLCJpbXBvcnQgeyBRQ29tcG9uZW50IH0gZnJvbSAnLi9RQ29tcG9uZW50JztcclxuaW1wb3J0IHsgZ2VuZXJhdGVVVUlEIH0gZnJvbSAnLi91dGlscyc7XHJcbi8vSGllcmFyY2hhbCBUYXNrIE5ldHdvcmtcclxuZXhwb3J0IGNsYXNzIEhUTlBsYW5uZXIgZXh0ZW5kcyBRQ29tcG9uZW50IHtcclxuICAgIHN0YXRpYyB0aWNrKG5vZGUsIHRhc2ssIGFnZW50KSB7XHJcbiAgICAgICAgaWYgKGFnZW50LnJ1bm5pbmdMaXN0KSB7XHJcbiAgICAgICAgICAgIGFnZW50LnJ1bm5pbmdMaXN0LnB1c2gobm9kZS5uYW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGFnZW50LnJ1bm5pbmdMaXN0ID0gW25vZGUubmFtZV07XHJcbiAgICAgICAgICAgIGFnZW50LnN1Y2Nlc3NMaXN0ID0gW107XHJcbiAgICAgICAgICAgIGFnZW50LmJhcnJpZXJMaXN0ID0gW107XHJcbiAgICAgICAgICAgIGFnZW50LmJsYWNrYm9hcmQgPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHN0YXRlID0gbm9kZS52aXNpdChhZ2VudCwgdGFzayk7XHJcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG4gICAgY29uc3RydWN0b3IobmFtZSwgcm9vdCwgdGFzaywgZGF0YSkge1xyXG4gICAgICAgIHN1cGVyKG5hbWUpO1xyXG4gICAgICAgIHRoaXMucm9vdCA9IHJvb3Q7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgICAgICB0aGlzLnN1bW1hcnkgPSBbXTtcclxuICAgICAgICB0aGlzLnJlc3VsdHMgPSBbXTtcclxuICAgICAgICB0aGlzLnRhc2sgPSB0YXNrO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlKGFnZW50LCBzdGVwKSB7XHJcbiAgICAgICAgLy9pdGVyYXRlIGFuIGFnZW50KGRhdGEpIHRocm91Z2ggdGhlIHRhc2sgbmV0d29ya1xyXG4gICAgICAgIGFnZW50LmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgSFROUGxhbm5lci50aWNrKHRoaXMucm9vdCwgdGhpcy50YXNrLCBhZ2VudCk7XHJcbiAgICAgICAgaWYgKGFnZW50LnN1Y2Nlc3NMaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgYWdlbnQuc3VjY2VlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBhZ2VudC5zdWNjZWVkID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGFnZW50LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBIVE5Sb290VGFzayB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBnb2Fscykge1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy5nb2FscyA9IGdvYWxzO1xyXG4gICAgfVxyXG4gICAgZXZhbHVhdGVHb2FsKGFnZW50KSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdCwgZztcclxuICAgICAgICBmb3IgKHZhciBwID0gMDsgcCA8IHRoaXMuZ29hbHMubGVuZ3RoOyBwKyspIHtcclxuICAgICAgICAgICAgZyA9IHRoaXMuZ29hbHNbcF07XHJcbiAgICAgICAgICAgIGlmIChnLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGcuY2hlY2soZy5kYXRhW2cua2V5XSwgZy52YWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBnLmNoZWNrKGFnZW50W2cua2V5XSwgZy52YWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEhUTk5vZGUge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgcHJlY29uZGl0aW9ucykge1xyXG4gICAgICAgIHRoaXMuaWQgPSBnZW5lcmF0ZVVVSUQoKTtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMucHJlY29uZGl0aW9ucyA9IHByZWNvbmRpdGlvbnM7XHJcbiAgICB9XHJcbiAgICBldmFsdWF0ZVByZUNvbmRzKGFnZW50KSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdDtcclxuICAgICAgICBpZiAodGhpcy5wcmVjb25kaXRpb25zIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgcCA9IDA7IHAgPCB0aGlzLnByZWNvbmRpdGlvbnMubGVuZ3RoOyBwKyspIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMucHJlY29uZGl0aW9uc1twXS5jaGVjayhhZ2VudFt0aGlzLnByZWNvbmRpdGlvbnNbcF0ua2V5XSwgdGhpcy5wcmVjb25kaXRpb25zW3BdLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IEhUTlBsYW5uZXIuRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEhUTlBsYW5uZXIuRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBIVE5QbGFubmVyLlNVQ0NFU1M7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEhUTk9wZXJhdG9yIGV4dGVuZHMgSFROTm9kZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBwcmVjb25kaXRpb25zLCBlZmZlY3RzKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSwgcHJlY29uZGl0aW9ucyk7XHJcbiAgICAgICAgdGhpcy50eXBlID0gXCJvcGVyYXRvclwiO1xyXG4gICAgICAgIHRoaXMuZWZmZWN0cyA9IGVmZmVjdHM7XHJcbiAgICAgICAgdGhpcy52aXNpdCA9IGZ1bmN0aW9uIChhZ2VudCwgdGFzaykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5ldmFsdWF0ZVByZUNvbmRzKGFnZW50KSA9PT0gSFROUGxhbm5lci5TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWZmZWN0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWZmZWN0c1tpXShhZ2VudC5ibGFja2JvYXJkWzBdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0YXNrLmV2YWx1YXRlR29hbChhZ2VudC5ibGFja2JvYXJkWzBdKSA9PT0gSFROUGxhbm5lci5TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWdlbnQuc3VjY2Vzc0xpc3QudW5zaGlmdCh0aGlzLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBIVE5QbGFubmVyLlNVQ0NFU1M7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSFROUGxhbm5lci5SVU5OSU5HO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYWdlbnQuYmFycmllckxpc3QudW5zaGlmdCh7IG5hbWU6IHRoaXMubmFtZSwgY29uZGl0aW9uczogdGhpcy5wcmVjb25kaXRpb25zIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIEhUTlBsYW5uZXIuRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgSFROTWV0aG9kIGV4dGVuZHMgSFROTm9kZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBwcmVjb25kaXRpb25zLCBjaGlsZHJlbikge1xyXG4gICAgICAgIHN1cGVyKG5hbWUsIHByZWNvbmRpdGlvbnMpO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IFwibWV0aG9kXCI7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xyXG4gICAgICAgIHRoaXMudmlzaXQgPSBmdW5jdGlvbiAoYWdlbnQsIHRhc2spIHtcclxuICAgICAgICAgICAgdmFyIGNvcHkgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGFnZW50KSk7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBjb3B5LmJsYWNrYm9hcmQ7XHJcbiAgICAgICAgICAgIGFnZW50LmJsYWNrYm9hcmQudW5zaGlmdChjb3B5KTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZXZhbHVhdGVQcmVDb25kcyhhZ2VudCkgPT09IEhUTlBsYW5uZXIuU1VDQ0VTUykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gSFROUGxhbm5lci50aWNrKHRoaXMuY2hpbGRyZW5baV0sIHRhc2ssIGFnZW50KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdGUgPT09IEhUTlBsYW5uZXIuU1VDQ0VTUykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhZ2VudC5zdWNjZXNzTGlzdC51bnNoaWZ0KHRoaXMubmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBIVE5QbGFubmVyLlNVQ0NFU1M7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYWdlbnQuYmFycmllckxpc3QudW5zaGlmdCh7IG5hbWU6IHRoaXMubmFtZSwgY29uZGl0aW9uczogdGhpcy5wcmVjb25kaXRpb25zIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBIVE5QbGFubmVyLkZBSUxFRDtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWh0bi5qcy5tYXAiLCJpbXBvcnQgeyBRQ29tcG9uZW50IH0gZnJvbSAnLi9RQ29tcG9uZW50JztcclxuZXhwb3J0IGNsYXNzIE1IU2FtcGxlciBleHRlbmRzIFFDb21wb25lbnQge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgcm5nLCBkYXRhLCB0YXJnZXQsIHNhdmUgPSB0cnVlKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSk7XHJcbiAgICAgICAgdGhpcy5rZXB0ID0gMDtcclxuICAgICAgICB0aGlzLnRpbWUgPSAwO1xyXG4gICAgICAgIHRoaXMucm5nID0gcm5nO1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgdGhpcy5jaGFpbiA9IFtdO1xyXG4gICAgICAgIHRoaXMuc2F2ZSA9IHNhdmU7XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoYWdlbnQsIHN0ZXApIHtcclxuICAgICAgICBsZXQgbmV3UHJvYiA9IDA7XHJcbiAgICAgICAgYWdlbnQueSA9IGFnZW50LnByb3Bvc2FsKGFnZW50LCBzdGVwLCB0aGlzLnJuZyk7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnRhcmdldCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQuZm9yRWFjaCgoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbmV3UHJvYiArPSBhZ2VudC5sblByb2JGKGFnZW50LCBzdGVwLCBkKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIG5ld1Byb2IgKj0gMSAvIHRoaXMudGFyZ2V0Lmxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIG5ld1Byb2IgPSBhZ2VudC5sblByb2JGKGFnZW50LCBzdGVwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGRpZmYgPSBuZXdQcm9iIC0gYWdlbnQubG5Qcm9iO1xyXG4gICAgICAgIGxldCB1ID0gdGhpcy5ybmcucmFuZG9tKCk7XHJcbiAgICAgICAgaWYgKE1hdGgubG9nKHUpIDw9IGRpZmYgfHwgZGlmZiA+PSAwKSB7XHJcbiAgICAgICAgICAgIGFnZW50LmxuUHJvYiA9IG5ld1Byb2I7XHJcbiAgICAgICAgICAgIGFnZW50LnggPSBhZ2VudC55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5rZXB0ICs9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnNhdmUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGFpbi5wdXNoKHsgaWQ6IGFnZW50LmlkLCB0aW1lOiBhZ2VudC50aW1lLCB4OiBhZ2VudC54IH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYy5qcy5tYXAiLCJleHBvcnQgY2xhc3Mga01lYW4ge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSwgcHJvcHMsIGspIHtcclxuICAgICAgICB0aGlzLmNlbnRyb2lkcyA9IFtdO1xyXG4gICAgICAgIHRoaXMubGltaXRzID0ge307XHJcbiAgICAgICAgdGhpcy5pdGVyYXRpb25zID0gMDtcclxuICAgICAgICAvL2NyZWF0ZSBhIGxpbWl0cyBvYmogZm9yIGVhY2ggcHJvcFxyXG4gICAgICAgIHByb3BzLmZvckVhY2gocCA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubGltaXRzW3BdID0ge1xyXG4gICAgICAgICAgICAgICAgbWluOiAxZTE1LFxyXG4gICAgICAgICAgICAgICAgbWF4OiAtMWUxNVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vc2V0IGxpbWl0cyBmb3IgZWFjaCBwcm9wXHJcbiAgICAgICAgZGF0YS5mb3JFYWNoKGQgPT4ge1xyXG4gICAgICAgICAgICBwcm9wcy5mb3JFYWNoKHAgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRbcF0gPiB0aGlzLmxpbWl0c1twXS5tYXgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpbWl0c1twXS5tYXggPSBkW3BdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGRbcF0gPCB0aGlzLmxpbWl0c1twXS5taW4pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpbWl0c1twXS5taW4gPSBkW3BdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvL2NyZWF0ZSBrIHJhbmRvbSBwb2ludHNcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGs7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmNlbnRyb2lkc1tpXSA9IHsgY291bnQ6IDAgfTtcclxuICAgICAgICAgICAgcHJvcHMuZm9yRWFjaChwID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBjZW50cm9pZCA9IE1hdGgucmFuZG9tKCkgKiB0aGlzLmxpbWl0c1twXS5tYXggKyB0aGlzLmxpbWl0c1twXS5taW47XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNlbnRyb2lkc1tpXVtwXSA9IGNlbnRyb2lkO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgICAgICB0aGlzLnByb3BzID0gcHJvcHM7XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgdGhpcy5fYXNzaWduQ2VudHJvaWQoKTtcclxuICAgICAgICB0aGlzLl9tb3ZlQ2VudHJvaWQoKTtcclxuICAgIH1cclxuICAgIHJ1bigpIHtcclxuICAgICAgICBsZXQgZmluaXNoZWQgPSBmYWxzZTtcclxuICAgICAgICB3aGlsZSAoIWZpbmlzaGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2VudHJvaWRzLmZvckVhY2goYyA9PiB7XHJcbiAgICAgICAgICAgICAgICBmaW5pc2hlZCA9IGMuZmluaXNoZWQ7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLml0ZXJhdGlvbnMrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFt0aGlzLmNlbnRyb2lkcywgdGhpcy5kYXRhXTtcclxuICAgIH1cclxuICAgIF9hc3NpZ25DZW50cm9pZCgpIHtcclxuICAgICAgICB0aGlzLmRhdGEuZm9yRWFjaCgoZCwgaikgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZGlzdGFuY2VzID0gW107XHJcbiAgICAgICAgICAgIGxldCB0b3RhbERpc3QgPSBbXTtcclxuICAgICAgICAgICAgbGV0IG1pbkRpc3Q7XHJcbiAgICAgICAgICAgIGxldCBtaW5JbmRleDtcclxuICAgICAgICAgICAgLy9mb3JlYWNoIHBvaW50LCBnZXQgdGhlIHBlciBwcm9wIGRpc3RhbmNlIGZyb20gZWFjaCBjZW50cm9pZFxyXG4gICAgICAgICAgICB0aGlzLmNlbnRyb2lkcy5mb3JFYWNoKChjLCBpKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBkaXN0YW5jZXNbaV0gPSB7fTtcclxuICAgICAgICAgICAgICAgIHRvdGFsRGlzdFtpXSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmZvckVhY2gocCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2VzW2ldW3BdID0gTWF0aC5zcXJ0KChkW3BdIC0gY1twXSkgKiAoZFtwXSAtIGNbcF0pKTtcclxuICAgICAgICAgICAgICAgICAgICB0b3RhbERpc3RbaV0gKz0gZGlzdGFuY2VzW2ldW3BdO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0b3RhbERpc3RbaV0gPSBNYXRoLnNxcnQodG90YWxEaXN0W2ldKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIG1pbkRpc3QgPSBNYXRoLm1pbi5hcHBseShudWxsLCB0b3RhbERpc3QpO1xyXG4gICAgICAgICAgICBtaW5JbmRleCA9IHRvdGFsRGlzdC5pbmRleE9mKG1pbkRpc3QpO1xyXG4gICAgICAgICAgICBkLmNlbnRyb2lkID0gbWluSW5kZXg7XHJcbiAgICAgICAgICAgIGQuZGlzdGFuY2VzID0gZGlzdGFuY2VzO1xyXG4gICAgICAgICAgICB0aGlzLmNlbnRyb2lkc1ttaW5JbmRleF0uY291bnQgKz0gMTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIF9tb3ZlQ2VudHJvaWQoKSB7XHJcbiAgICAgICAgdGhpcy5jZW50cm9pZHMuZm9yRWFjaCgoYywgaSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZGlzdEZyb21DZW50cm9pZCA9IHt9O1xyXG4gICAgICAgICAgICB0aGlzLnByb3BzLmZvckVhY2gocCA9PiBkaXN0RnJvbUNlbnRyb2lkW3BdID0gW10pO1xyXG4gICAgICAgICAgICAvL2dldCB0aGUgcGVyIHByb3AgZGlzdGFuY2VzIGZyb20gdGhlIGNlbnRyb2lkIGFtb25nIGl0cycgYXNzaWduZWQgcG9pbnRzXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YS5mb3JFYWNoKGQgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGQuY2VudHJvaWQgPT09IGkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmZvckVhY2gocCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3RGcm9tQ2VudHJvaWRbcF0ucHVzaChkW3BdKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vaGFuZGxlIGNlbnRyb2lkIHdpdGggbm8gYXNzaWduZWQgcG9pbnRzIChyYW5kb21seSBhc3NpZ24gbmV3KTtcclxuICAgICAgICAgICAgaWYgKGMuY291bnQgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZm9yRWFjaChwID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXN0RnJvbUNlbnRyb2lkW3BdID0gW01hdGgucmFuZG9tKCkgKiB0aGlzLmxpbWl0c1twXS5tYXggKyB0aGlzLmxpbWl0c1twXS5taW5dO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9nZXQgdGhlIHN1bSBhbmQgbWVhbiBwZXIgcHJvcGVydHkgb2YgdGhlIGFzc2lnbmVkIHBvaW50c1xyXG4gICAgICAgICAgICB0aGlzLnByb3BzLmZvckVhY2gocCA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc3VtID0gZGlzdEZyb21DZW50cm9pZFtwXS5yZWR1Y2UoKHByZXYsIG5leHQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJldiArIG5leHQ7XHJcbiAgICAgICAgICAgICAgICB9LCAwKTtcclxuICAgICAgICAgICAgICAgIGxldCBtZWFuID0gc3VtIC8gZGlzdEZyb21DZW50cm9pZFtwXS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGksICdcXCdzIGF2ZXJhZ2UgZGlzdCB3YXMnLCBtZWFuLCAnIHRoZSBjdXJyZW50IHBvcyB3YXMgJywgY1twXSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY1twXSAhPT0gbWVhbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNbcF0gPSBtZWFuO1xyXG4gICAgICAgICAgICAgICAgICAgIGMuZmluaXNoZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBjLmNvdW50ID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGMuZmluaXNoZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1rbWVhbi5qcy5tYXAiLCJleHBvcnQgY2xhc3MgS05OIHtcclxuICAgIHNldE5laWdoYm9ycyhwb2ludCwgZGF0YSwgcGFyYW0sIGNsYXNzaWZpZXIpIHtcclxuICAgICAgICBkYXRhLmZvckVhY2goKGQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGQuaWQgIT09IHBvaW50LmlkKSB7XHJcbiAgICAgICAgICAgICAgICBwb2ludC5uZWlnaGJvcnNbZC5pZF0gPSBwb2ludC5uZWlnaGJvcnNbZC5pZF0gfHwge307XHJcbiAgICAgICAgICAgICAgICBwb2ludC5uZWlnaGJvcnNbZC5pZF1bY2xhc3NpZmllcl0gPSBkW2NsYXNzaWZpZXJdO1xyXG4gICAgICAgICAgICAgICAgcG9pbnQubmVpZ2hib3JzW2QuaWRdW3BhcmFtLnBhcmFtXSA9IE1hdGguYWJzKHBvaW50W3BhcmFtLnBhcmFtXSAtIGRbcGFyYW0ucGFyYW1dKSAvIHBhcmFtLnJhbmdlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBzb3J0KG5laWdoYm9ycywgcGFyYW0pIHtcclxuICAgICAgICB2YXIgbGlzdCA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIG5laWdoIGluIG5laWdoYm9ycykge1xyXG4gICAgICAgICAgICBsaXN0LnB1c2gobmVpZ2hib3JzW25laWdoXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxpc3Quc29ydCgoYSwgYikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoYVtwYXJhbV0gPj0gYltwYXJhbV0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChiW3BhcmFtXSA+PSBhW3BhcmFtXSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBsaXN0O1xyXG4gICAgfVxyXG4gICAgc2V0RGlzdGFuY2VzKGRhdGEsIHRyYWluZWQsIGtQYXJhbXNPYmosIGNsYXNzaWZpZXIpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgZGF0YVtpXS5uZWlnaGJvcnMgPSB7fTtcclxuICAgICAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBrUGFyYW1zT2JqLmxlbmd0aDsgaysrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRhdGFbaV1ba1BhcmFtc09ialtrXS5wYXJhbV0gPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXROZWlnaGJvcnMoZGF0YVtpXSwgdHJhaW5lZCwga1BhcmFtc09ialtrXSwgY2xhc3NpZmllcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yICh2YXIgbiBpbiBkYXRhW2ldLm5laWdoYm9ycykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG5laWdoYm9yID0gZGF0YVtpXS5uZWlnaGJvcnNbbl07XHJcbiAgICAgICAgICAgICAgICB2YXIgZGlzdCA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBwID0gMDsgcCA8IGtQYXJhbXNPYmoubGVuZ3RoOyBwKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBkaXN0ICs9IG5laWdoYm9yW2tQYXJhbXNPYmpbcF0ucGFyYW1dICogbmVpZ2hib3Jba1BhcmFtc09ialtwXS5wYXJhbV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBuZWlnaGJvci5kaXN0YW5jZSA9IE1hdGguc3FydChkaXN0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgIH1cclxuICAgIGdldFJhbmdlKGRhdGEsIGtQYXJhbXMpIHtcclxuICAgICAgICBsZXQgcmFuZ2VzID0gW10sIG1pbiA9IDFlMjAsIG1heCA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBrUGFyYW1zLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGQgPSAwOyBkIDwgZGF0YS5sZW5ndGg7IGQrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGFbZF1ba1BhcmFtc1tqXV0gPCBtaW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBtaW4gPSBkYXRhW2RdW2tQYXJhbXNbal1dO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGFbZF1ba1BhcmFtc1tqXV0gPiBtYXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXggPSBkYXRhW2RdW2tQYXJhbXNbal1dO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJhbmdlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIHBhcmFtOiBrUGFyYW1zW2pdLFxyXG4gICAgICAgICAgICAgICAgbWluOiBtaW4sXHJcbiAgICAgICAgICAgICAgICBtYXg6IG1heCxcclxuICAgICAgICAgICAgICAgIHJhbmdlOiBtYXggLSBtaW5cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIDtcclxuICAgICAgICByZXR1cm4gcmFuZ2VzO1xyXG4gICAgfVxyXG4gICAgY2xhc3NpZnkoZGF0YSwgdHJhaW5lZERhdGEsIGtQYXJhbXMsIGNsYXNzaWZpZXIsIG5lYXJlc3ROKSB7XHJcbiAgICAgICAgbGV0IGtQYXJhbXNPYmogPSB0aGlzLmdldFJhbmdlKFtdLmNvbmNhdChkYXRhLCB0cmFpbmVkRGF0YSksIGtQYXJhbXMpO1xyXG4gICAgICAgIGRhdGEgPSB0aGlzLnNldERpc3RhbmNlcyhkYXRhLCB0cmFpbmVkRGF0YSwga1BhcmFtc09iaiwgY2xhc3NpZmllcik7XHJcbiAgICAgICAgbGV0IG9yZGVyZWQgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBkID0gMDsgZCA8IGRhdGEubGVuZ3RoOyBkKyspIHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdHMgPSB7fTtcclxuICAgICAgICAgICAgb3JkZXJlZCA9IHRoaXMuc29ydChkYXRhW2RdLm5laWdoYm9ycywgJ2Rpc3RhbmNlJyk7XHJcbiAgICAgICAgICAgIGxldCBuID0gMDtcclxuICAgICAgICAgICAgd2hpbGUgKG4gPCBuZWFyZXN0Tikge1xyXG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBvcmRlcmVkW25dW2NsYXNzaWZpZXJdO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0c1tjdXJyZW50XSA9IHJlc3VsdHNbY3VycmVudF0gfHwgMDtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHNbY3VycmVudF0gKz0gMTtcclxuICAgICAgICAgICAgICAgIG4rKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgbWF4ID0gMCwgbGlrZWxpZXN0ID0gJyc7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHBhcmFtIGluIHJlc3VsdHMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHRzW3BhcmFtXSA+IG1heCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1heCA9IHJlc3VsdHNbcGFyYW1dO1xyXG4gICAgICAgICAgICAgICAgICAgIGxpa2VsaWVzdCA9IHBhcmFtO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRhdGFbZF1bY2xhc3NpZmllcl0gPSBsaWtlbGllc3Q7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWtubi5qcy5tYXAiLCJleHBvcnQgY2xhc3MgVmVjdG9yIHtcclxuICAgIGNvbnN0cnVjdG9yKGFycmF5LCBzaXplKSB7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIE1hdHJpeCB7XHJcbiAgICBjb25zdHJ1Y3RvcihtYXQpIHtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgYWN0aXZhdGlvbk1ldGhvZHMge1xyXG4gICAgc3RhdGljIFJlTFUoeCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLm1heCh4LCAwKTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBzaWdtb2lkKHgpIHtcclxuICAgICAgICByZXR1cm4gMSAvICgxICsgTWF0aC5leHAoLXgpKTtcclxuICAgIH1cclxuICAgIHN0YXRpYyB0YW5oKHgpIHtcclxuICAgICAgICBsZXQgdmFsID0gKE1hdGguZXhwKHgpIC0gTWF0aC5leHAoLXgpKSAvIChNYXRoLmV4cCh4KSArIE1hdGguZXhwKC14KSk7XHJcbiAgICAgICAgcmV0dXJuIHZhbDtcclxuICAgIH1cclxufVxyXG47XHJcbmV4cG9ydCBjbGFzcyBkZXJpdml0ZU1ldGhvZHMge1xyXG4gICAgc3RhdGljIFJlTFUodmFsdWUpIHtcclxuICAgICAgICBsZXQgZGVyID0gdmFsdWUgPD0gMCA/IDAgOiAxO1xyXG4gICAgICAgIHJldHVybiBkZXI7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgc2lnbW9pZCh2YWx1ZSkge1xyXG4gICAgICAgIGxldCBzaWcgPSBhY3RpdmF0aW9uTWV0aG9kcy5zaWdtb2lkO1xyXG4gICAgICAgIHJldHVybiBzaWcodmFsdWUpICogKDEgLSBzaWcodmFsdWUpKTtcclxuICAgIH1cclxuICAgIHN0YXRpYyB0YW5oKHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIDEgLSBNYXRoLnBvdyhhY3RpdmF0aW9uTWV0aG9kcy50YW5oKHZhbHVlKSwgMik7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGxvZ2lzdGljKHgsIG0sIGIsIGspIHtcclxuICAgIHZhciB5ID0gMSAvIChtICsgTWF0aC5leHAoLWsgKiAoeCAtIGIpKSk7XHJcbiAgICByZXR1cm4geTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gbG9naXQoeCwgbSwgYiwgaykge1xyXG4gICAgdmFyIHkgPSAxIC8gTWF0aC5sb2coeCAvICgxIC0geCkpO1xyXG4gICAgcmV0dXJuIHk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGxpbmVhcih4LCBtLCBiLCBrKSB7XHJcbiAgICB2YXIgeSA9IG0gKiB4ICsgYjtcclxuICAgIHJldHVybiB5O1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBleHBvbmVudGlhbCh4LCBtLCBiLCBrKSB7XHJcbiAgICB2YXIgeSA9IDEgLSBNYXRoLnBvdyh4LCBrKSAvIE1hdGgucG93KDEsIGspO1xyXG4gICAgcmV0dXJuIHk7XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWF0aC5qcy5tYXAiLCJleHBvcnQgY2xhc3MgTmV0d29yayB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhLCBsYWJlbHMsIGhpZGRlbk51bSwgZWwsIGFjdGl2YXRpb25UeXBlID0gXCJ0YW5oXCIpIHtcclxuICAgICAgICB0aGlzLmVsID0gZWw7XHJcbiAgICAgICAgdGhpcy5pdGVyID0gMDtcclxuICAgICAgICB0aGlzLmNvcnJlY3QgPSAwO1xyXG4gICAgICAgIHRoaXMuaGlkZGVuTnVtID0gaGlkZGVuTnVtO1xyXG4gICAgICAgIHRoaXMubGVhcm5SYXRlID0gMC4wMTtcclxuICAgICAgICB0aGlzLmFjdEZuID0gTmV0d29yay5hY3RpdmF0aW9uTWV0aG9kc1thY3RpdmF0aW9uVHlwZV07XHJcbiAgICAgICAgdGhpcy5kZXJGbiA9IE5ldHdvcmsuZGVyaXZhdGl2ZU1ldGhvZHNbYWN0aXZhdGlvblR5cGVdO1xyXG4gICAgICAgIHRoaXMuaW5pdChkYXRhLCBsYWJlbHMpO1xyXG4gICAgfVxyXG4gICAgbGVhcm4oaXRlcmF0aW9ucywgZGF0YSwgbGFiZWxzLCByZW5kZXIgPSAxMDApIHtcclxuICAgICAgICB0aGlzLmNvcnJlY3QgPSAwO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlcmF0aW9uczsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCByYW5kSWR4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogZGF0YS5sZW5ndGgpO1xyXG4gICAgICAgICAgICB0aGlzLml0ZXIrKztcclxuICAgICAgICAgICAgdGhpcy5mb3J3YXJkKGRhdGFbcmFuZElkeF0pO1xyXG4gICAgICAgICAgICBsZXQgbWF4ID0gLTE7XHJcbiAgICAgICAgICAgIGxldCBtYXhJZHggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aGlzLnZhbHVlcy5sZW5ndGgpO1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlc1t0aGlzLnZhbHVlcy5sZW5ndGggLSAxXS5mb3JFYWNoKCh4LCBpZHgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh4ID4gbWF4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF4SWR4ID0gaWR4O1xyXG4gICAgICAgICAgICAgICAgICAgIG1heCA9IHg7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBsZXQgZ3Vlc3NlZCA9IHRoaXMudmFsdWVzW3RoaXMudmFsdWVzLmxlbmd0aCAtIDFdW21heElkeF0gPj0gMC41ID8gMSA6IDA7XHJcbiAgICAgICAgICAgIGlmIChndWVzc2VkID09PSBsYWJlbHNbcmFuZElkeF1bbWF4SWR4XSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb3JyZWN0Kys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5hY2N1cmFjeSA9IHRoaXMuY29ycmVjdCAvIChpICsgMSk7XHJcbiAgICAgICAgICAgIHRoaXMuYmFja3dhcmQobGFiZWxzW3JhbmRJZHhdKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVXZWlnaHRzKCk7XHJcbiAgICAgICAgICAgIHRoaXMucmVzZXRUb3RhbHMoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjbGFzc2lmeShkYXRhKSB7XHJcbiAgICAgICAgdGhpcy5yZXNldFRvdGFscygpO1xyXG4gICAgICAgIHRoaXMuZm9yd2FyZChkYXRhKTtcclxuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZXNbdGhpcy52YWx1ZXMubGVuZ3RoIC0gMV07XHJcbiAgICB9XHJcbiAgICBpbml0KGRhdGEsIGxhYmVscykge1xyXG4gICAgICAgIGxldCBpbnB1dHMgPSBbXTtcclxuICAgICAgICB0aGlzLmRlciA9IFtdO1xyXG4gICAgICAgIHRoaXMudmFsdWVzID0gW107XHJcbiAgICAgICAgdGhpcy53ZWlnaHRzID0gW107XHJcbiAgICAgICAgdGhpcy53ZWlnaHRDaGFuZ2VzID0gW107XHJcbiAgICAgICAgdGhpcy50b3RhbHMgPSBbXTtcclxuICAgICAgICB0aGlzLmRlclRvdGFscyA9IFtdO1xyXG4gICAgICAgIHRoaXMuYmlhc2VzID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgbiA9IDA7IG4gPCBkYXRhWzBdLmxlbmd0aDsgbisrKSB7XHJcbiAgICAgICAgICAgIGlucHV0cy5wdXNoKDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCB0aGlzLmhpZGRlbk51bS5sZW5ndGg7IGNvbCsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVyW2NvbF0gPSBbXTtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZXNbY29sXSA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLnRvdGFsc1tjb2xdID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuZGVyVG90YWxzW2NvbF0gPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgdGhpcy5oaWRkZW5OdW1bY29sXTsgcm93KyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudmFsdWVzW2NvbF1bcm93XSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlcltjb2xdW3Jvd10gPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy50b3RhbHNbY29sXVtyb3ddID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVyVG90YWxzW2NvbF1bcm93XSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy52YWx1ZXMudW5zaGlmdChpbnB1dHMpO1xyXG4gICAgICAgIHRoaXMudG90YWxzLnVuc2hpZnQoaW5wdXRzKTtcclxuICAgICAgICB0aGlzLmRlci51bnNoaWZ0KGlucHV0cyk7XHJcbiAgICAgICAgdGhpcy5kZXJUb3RhbHMudW5zaGlmdChpbnB1dHMpO1xyXG4gICAgICAgIHRoaXMudmFsdWVzW3RoaXMuaGlkZGVuTnVtLmxlbmd0aCArIDFdID0gbGFiZWxzWzBdLm1hcCgobCkgPT4geyByZXR1cm4gMDsgfSk7XHJcbiAgICAgICAgdGhpcy50b3RhbHNbdGhpcy5oaWRkZW5OdW0ubGVuZ3RoICsgMV0gPSBsYWJlbHNbMF0ubWFwKChsKSA9PiB7IHJldHVybiAwOyB9KTtcclxuICAgICAgICB0aGlzLmRlclt0aGlzLmhpZGRlbk51bS5sZW5ndGggKyAxXSA9IGxhYmVsc1swXS5tYXAoKGwpID0+IHsgcmV0dXJuIDA7IH0pO1xyXG4gICAgICAgIHRoaXMuZGVyVG90YWxzW3RoaXMuaGlkZGVuTnVtLmxlbmd0aCArIDFdID0gbGFiZWxzWzBdLm1hcCgobCkgPT4geyByZXR1cm4gMDsgfSk7XHJcbiAgICAgICAgZm9yIChsZXQgd2cgPSAwOyB3ZyA8IHRoaXMudmFsdWVzLmxlbmd0aCAtIDE7IHdnKyspIHtcclxuICAgICAgICAgICAgdGhpcy53ZWlnaHRzW3dnXSA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLndlaWdodENoYW5nZXNbd2ddID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuYmlhc2VzW3dnXSA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBzcmMgPSAwOyBzcmMgPCB0aGlzLnZhbHVlc1t3Z10ubGVuZ3RoOyBzcmMrKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy53ZWlnaHRzW3dnXVtzcmNdID0gW107XHJcbiAgICAgICAgICAgICAgICB0aGlzLndlaWdodENoYW5nZXNbd2ddW3NyY10gPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGRzdCA9IDA7IGRzdCA8IHRoaXMudmFsdWVzW3dnICsgMV0ubGVuZ3RoOyBkc3QrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYmlhc2VzW3dnXVtkc3RdID0gTWF0aC5yYW5kb20oKSAtIDAuNTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLndlaWdodHNbd2ddW3NyY11bZHN0XSA9IE1hdGgucmFuZG9tKCkgLSAwLjU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53ZWlnaHRDaGFuZ2VzW3dnXVtzcmNdW2RzdF0gPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmVzZXRUb3RhbHMoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgdGhpcy50b3RhbHMubGVuZ3RoOyBjb2wrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCB0aGlzLnRvdGFsc1tjb2xdLmxlbmd0aDsgcm93KyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudG90YWxzW2NvbF1bcm93XSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlclRvdGFsc1tjb2xdW3Jvd10gPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZm9yd2FyZChpbnB1dCkge1xyXG4gICAgICAgIHRoaXMudmFsdWVzWzBdID0gaW5wdXQ7XHJcbiAgICAgICAgZm9yIChsZXQgd2cgPSAwOyB3ZyA8IHRoaXMud2VpZ2h0cy5sZW5ndGg7IHdnKyspIHtcclxuICAgICAgICAgICAgbGV0IHNyY1ZhbHMgPSB3ZztcclxuICAgICAgICAgICAgbGV0IGRzdFZhbHMgPSB3ZyArIDE7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHNyYyA9IDA7IHNyYyA8IHRoaXMud2VpZ2h0c1t3Z10ubGVuZ3RoOyBzcmMrKykge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZHN0ID0gMDsgZHN0IDwgdGhpcy53ZWlnaHRzW3dnXVtzcmNdLmxlbmd0aDsgZHN0KyspIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRvdGFsc1tkc3RWYWxzXVtkc3RdICs9IHRoaXMudmFsdWVzW3NyY1ZhbHNdW3NyY10gKiB0aGlzLndlaWdodHNbd2ddW3NyY11bZHN0XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnZhbHVlc1tkc3RWYWxzXSA9IHRoaXMudG90YWxzW2RzdFZhbHNdLm1hcCgodG90YWwsIGlkeCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWN0Rm4odG90YWwgKyB0aGlzLmJpYXNlc1t3Z11baWR4XSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGJhY2t3YXJkKGxhYmVscykge1xyXG4gICAgICAgIGZvciAobGV0IHdnID0gdGhpcy53ZWlnaHRzLmxlbmd0aCAtIDE7IHdnID49IDA7IHdnLS0pIHtcclxuICAgICAgICAgICAgbGV0IHNyY1ZhbHMgPSB3ZztcclxuICAgICAgICAgICAgbGV0IGRzdFZhbHMgPSB3ZyArIDE7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHNyYyA9IDA7IHNyYyA8IHRoaXMud2VpZ2h0c1t3Z10ubGVuZ3RoOyBzcmMrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGVyciA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBkc3QgPSAwOyBkc3QgPCB0aGlzLndlaWdodHNbd2ddW3NyY10ubGVuZ3RoOyBkc3QrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh3ZyA9PT0gdGhpcy53ZWlnaHRzLmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyICs9IGxhYmVsc1tkc3RdIC0gdGhpcy52YWx1ZXNbZHN0VmFsc11bZHN0XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXJbZHN0VmFsc11bZHN0XSA9IGVycjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVyciArPSB0aGlzLmRlcltkc3RWYWxzXVtkc3RdICogdGhpcy53ZWlnaHRzW3dnXVtzcmNdW2RzdF07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXJUb3RhbHNbc3JjVmFsc11bc3JjXSA9IGVycjtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVyW3NyY1ZhbHNdW3NyY10gPSBlcnIgKiB0aGlzLmRlckZuKHRoaXMudmFsdWVzW3NyY1ZhbHNdW3NyY10pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgdXBkYXRlV2VpZ2h0cygpIHtcclxuICAgICAgICBmb3IgKGxldCB3ZyA9IDA7IHdnIDwgdGhpcy53ZWlnaHRzLmxlbmd0aDsgd2crKykge1xyXG4gICAgICAgICAgICBsZXQgc3JjVmFscyA9IHdnO1xyXG4gICAgICAgICAgICBsZXQgZHN0VmFscyA9IHdnICsgMTtcclxuICAgICAgICAgICAgZm9yIChsZXQgc3JjID0gMDsgc3JjIDwgdGhpcy53ZWlnaHRzW3dnXS5sZW5ndGg7IHNyYysrKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBkc3QgPSAwOyBkc3QgPCB0aGlzLndlaWdodHNbd2ddW3NyY10ubGVuZ3RoOyBkc3QrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBtb21lbnR1bSA9IHRoaXMud2VpZ2h0Q2hhbmdlc1t3Z11bc3JjXVtkc3RdICogMC4xO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2VpZ2h0Q2hhbmdlc1t3Z11bc3JjXVtkc3RdID0gKHRoaXMudmFsdWVzW3NyY1ZhbHNdW3NyY10gKiB0aGlzLmRlcltkc3RWYWxzXVtkc3RdICogdGhpcy5sZWFyblJhdGUpICsgbW9tZW50dW07XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53ZWlnaHRzW3dnXVtzcmNdW2RzdF0gKz0gdGhpcy53ZWlnaHRDaGFuZ2VzW3dnXVtzcmNdW2RzdF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5iaWFzZXNbd2ddID0gdGhpcy5iaWFzZXNbd2ddLm1hcCgoYmlhcywgaWR4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sZWFyblJhdGUgKiB0aGlzLmRlcltkc3RWYWxzXVtpZHhdICsgYmlhcztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgbXNlKCkge1xyXG4gICAgICAgIGxldCBlcnIgPSAwO1xyXG4gICAgICAgIGxldCBjb3VudCA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLmRlclRvdGFscy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBlcnIgKz0gdGhpcy5kZXJUb3RhbHNbal0ucmVkdWNlKChsYXN0LCBjdXJyZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxhc3QgKyBNYXRoLnBvdyhjdXJyZW50LCAyKTtcclxuICAgICAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBlcnIgLyBjb3VudDtcclxuICAgIH1cclxufVxyXG5OZXR3b3JrLmFjdGl2YXRpb25NZXRob2RzID0ge1xyXG4gICAgUmVMVTogZnVuY3Rpb24gKHgpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5tYXgoeCwgMCk7XHJcbiAgICB9LFxyXG4gICAgc2lnbW9pZDogZnVuY3Rpb24gKHgpIHtcclxuICAgICAgICByZXR1cm4gMSAvICgxICsgTWF0aC5leHAoLXgpKTtcclxuICAgIH0sXHJcbiAgICB0YW5oOiBmdW5jdGlvbiAoeCkge1xyXG4gICAgICAgIGxldCB2YWwgPSAoTWF0aC5leHAoeCkgLSBNYXRoLmV4cCgteCkpIC8gKE1hdGguZXhwKHgpICsgTWF0aC5leHAoLXgpKTtcclxuICAgICAgICByZXR1cm4gdmFsO1xyXG4gICAgfVxyXG59O1xyXG5OZXR3b3JrLmRlcml2YXRpdmVNZXRob2RzID0ge1xyXG4gICAgUmVMVTogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgbGV0IGRlciA9IHZhbHVlIDw9IDAgPyAwIDogMTtcclxuICAgICAgICByZXR1cm4gZGVyO1xyXG4gICAgfSxcclxuICAgIHNpZ21vaWQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIGxldCBzaWcgPSBOZXR3b3JrLmFjdGl2YXRpb25NZXRob2RzLnNpZ21vaWQ7XHJcbiAgICAgICAgcmV0dXJuIHNpZyh2YWx1ZSkgKiAoMSAtIHNpZyh2YWx1ZSkpO1xyXG4gICAgfSxcclxuICAgIHRhbmg6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIHJldHVybiAxIC0gTWF0aC5wb3coTmV0d29yay5hY3RpdmF0aW9uTWV0aG9kcy50YW5oKHZhbHVlKSwgMik7XHJcbiAgICB9XHJcbn07XHJcbk5ldHdvcmsuY29zdE1ldGhvZHMgPSB7XHJcbiAgICBzcUVycjogZnVuY3Rpb24gKHRhcmdldCwgZ3Vlc3MpIHtcclxuICAgICAgICByZXR1cm4gZ3Vlc3MgLSB0YXJnZXQ7XHJcbiAgICB9LFxyXG4gICAgYWJzRXJyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB9XHJcbn07XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW5ldHdvcmsuanMubWFwIiwiZXhwb3J0IGNsYXNzIFFMZWFybmVyIHtcclxuICAgIC8vVE9ETyAtIGNoYW5nZSBlcGlzb2RlIHRvIHVwZGF0ZVxyXG4gICAgY29uc3RydWN0b3IoUiwgZ2FtbWEsIGdvYWwpIHtcclxuICAgICAgICB0aGlzLnJhd01heCA9IDE7XHJcbiAgICAgICAgdGhpcy5SID0gUjtcclxuICAgICAgICB0aGlzLmdhbW1hID0gZ2FtbWE7XHJcbiAgICAgICAgdGhpcy5nb2FsID0gZ29hbDtcclxuICAgICAgICB0aGlzLlEgPSB7fTtcclxuICAgICAgICBmb3IgKHZhciBzdGF0ZSBpbiBSKSB7XHJcbiAgICAgICAgICAgIHRoaXMuUVtzdGF0ZV0gPSB7fTtcclxuICAgICAgICAgICAgZm9yICh2YXIgYWN0aW9uIGluIFJbc3RhdGVdKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLlFbc3RhdGVdW2FjdGlvbl0gPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZ2FtbWEgPSBnYW1tYTtcclxuICAgIH1cclxuICAgIGdyb3coc3RhdGUsIGFjdGlvbnMpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFjdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgLy9yZXdhcmQgaXMgY3VycmVudGx5IHVua25vd25cclxuICAgICAgICAgICAgdGhpcy5SW3N0YXRlXVthY3Rpb25zW2ldXSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZXhwbG9yZShwcm9tKSB7XHJcbiAgICB9XHJcbiAgICB0cmFuc2l0aW9uKHN0YXRlLCBhY3Rpb24pIHtcclxuICAgICAgICAvL2lzIHRoZSBzdGF0ZSB1bmV4YW1pbmVkXHJcbiAgICAgICAgbGV0IGV4YW1pbmVkID0gdHJ1ZTtcclxuICAgICAgICBsZXQgYmVzdEFjdGlvbjtcclxuICAgICAgICBmb3IgKGFjdGlvbiBpbiB0aGlzLlJbc3RhdGVdKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLlJbc3RhdGVdW2FjdGlvbl0gPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGJlc3RBY3Rpb24gPSBhY3Rpb247XHJcbiAgICAgICAgICAgICAgICBleGFtaW5lZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJlc3RBY3Rpb24gPSB0aGlzLm1heChhY3Rpb24pO1xyXG4gICAgICAgIHRoaXMuUVtzdGF0ZV1bYWN0aW9uXSA9IHRoaXMuUltzdGF0ZV1bYWN0aW9uXSArICh0aGlzLmdhbW1hICogdGhpcy5RW2FjdGlvbl1bYmVzdEFjdGlvbl0pO1xyXG4gICAgfVxyXG4gICAgbWF4KHN0YXRlKSB7XHJcbiAgICAgICAgdmFyIG1heCA9IDAsIG1heEFjdGlvbiA9IG51bGw7XHJcbiAgICAgICAgZm9yICh2YXIgYWN0aW9uIGluIHRoaXMuUVtzdGF0ZV0pIHtcclxuICAgICAgICAgICAgaWYgKCFtYXhBY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIG1heCA9IHRoaXMuUVtzdGF0ZV1bYWN0aW9uXTtcclxuICAgICAgICAgICAgICAgIG1heEFjdGlvbiA9IGFjdGlvbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLlFbc3RhdGVdW2FjdGlvbl0gPT09IG1heCAmJiAoTWF0aC5yYW5kb20oKSA+IDAuNSkpIHtcclxuICAgICAgICAgICAgICAgIG1heCA9IHRoaXMuUVtzdGF0ZV1bYWN0aW9uXTtcclxuICAgICAgICAgICAgICAgIG1heEFjdGlvbiA9IGFjdGlvbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLlFbc3RhdGVdW2FjdGlvbl0gPiBtYXgpIHtcclxuICAgICAgICAgICAgICAgIG1heCA9IHRoaXMuUVtzdGF0ZV1bYWN0aW9uXTtcclxuICAgICAgICAgICAgICAgIG1heEFjdGlvbiA9IGFjdGlvbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbWF4QWN0aW9uO1xyXG4gICAgfVxyXG4gICAgcG9zc2libGUoc3RhdGUpIHtcclxuICAgICAgICB2YXIgcG9zc2libGUgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBhY3Rpb24gaW4gdGhpcy5SW3N0YXRlXSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5SW3N0YXRlXVthY3Rpb25dID4gLTEpIHtcclxuICAgICAgICAgICAgICAgIHBvc3NpYmxlLnB1c2goYWN0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcG9zc2libGVbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcG9zc2libGUubGVuZ3RoKV07XHJcbiAgICB9XHJcbiAgICBlcGlzb2RlKHN0YXRlKSB7XHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uKHN0YXRlLCB0aGlzLnBvc3NpYmxlKHN0YXRlKSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuUTtcclxuICAgIH1cclxuICAgIG5vcm1hbGl6ZSgpIHtcclxuICAgICAgICBmb3IgKHZhciBzdGF0ZSBpbiB0aGlzLlEpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgYWN0aW9uIGluIHRoaXMuUVtzdGF0ZV0pIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLlFbYWN0aW9uXVtzdGF0ZV0gPj0gdGhpcy5yYXdNYXgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJhd01heCA9IHRoaXMuUVthY3Rpb25dW3N0YXRlXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKHZhciBzdGF0ZSBpbiB0aGlzLlEpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgYWN0aW9uIGluIHRoaXMuUVtzdGF0ZV0pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuUVthY3Rpb25dW3N0YXRlXSA9IE1hdGgucm91bmQodGhpcy5RW2FjdGlvbl1bc3RhdGVdIC8gdGhpcy5yYXdNYXggKiAxMDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVFMZWFybmVyLmpzLm1hcCIsImltcG9ydCB7IHN0YW5kYXJkaXplZCwgZGF0YVRvTWF0cml4IH0gZnJvbSAnLi91dGlscyc7XHJcbmV4cG9ydCBmdW5jdGlvbiBvbHMoaXZzLCBkdikge1xyXG4gICAgbGV0IGRhdGEgPSBkYXRhVG9NYXRyaXgoaXZzLCB0aGlzLnN0YW5kYXJkaXplZCk7XHJcbiAgICBsZXQgZHZEYXRhID0gZHYuZGF0YTtcclxuICAgIGxldCBuID0gZHZEYXRhLmxlbmd0aDtcclxuICAgIGxldCBtZWFucyA9IGl2cy5tYXAoKGEpID0+IHsgcmV0dXJuIGEubWVhbjsgfSk7XHJcbiAgICBsZXQgc2RzID0gaXZzLm1hcCgoYSkgPT4geyByZXR1cm4gYS5zZDsgfSk7XHJcbiAgICBsZXQgdmFycyA9IGl2cy5tYXAoKGEpID0+IHsgcmV0dXJuIFthLnZhcmlhbmNlXTsgfSk7XHJcbiAgICBtZWFucy51bnNoaWZ0KDEpO1xyXG4gICAgc2RzLnVuc2hpZnQoMSk7XHJcbiAgICB2YXJzLnVuc2hpZnQoWzFdKTtcclxuICAgIGlmICh0aGlzLnN0YW5kYXJkaXplZCkge1xyXG4gICAgICAgIGR2RGF0YSA9IHN0YW5kYXJkaXplZChkdi5kYXRhKTtcclxuICAgIH1cclxuICAgIGxldCBYID0gZGF0YTtcclxuICAgIGxldCBZID0gZHZEYXRhLm1hcCgoeSkgPT4geyByZXR1cm4gW3ldOyB9KTtcclxuICAgIGxldCBYcHJpbWUgPSBqU3RhdC50cmFuc3Bvc2UoWCk7XHJcbiAgICBsZXQgWHByaW1lWCA9IGpTdGF0Lm11bHRpcGx5KFhwcmltZSwgWCk7XHJcbiAgICBsZXQgWHByaW1lWSA9IGpTdGF0Lm11bHRpcGx5KFhwcmltZSwgWSk7XHJcbiAgICAvL2NvZWZmaWNpZW50c1xyXG4gICAgbGV0IGIgPSBqU3RhdC5tdWx0aXBseShqU3RhdC5pbnYoWHByaW1lWCksIFhwcmltZVkpO1xyXG4gICAgdGhpcy5iZXRhcyA9IGIucmVkdWNlKChhLCBiKSA9PiB7IHJldHVybiBhLmNvbmNhdChiKTsgfSk7XHJcbiAgICAvL3N0YW5kYXJkIGVycm9yIG9mIHRoZSBjb2VmZmljaWVudHNcclxuICAgIHRoaXMuc3RFcnJDb2VmZiA9IGpTdGF0Lm11bHRpcGx5KGpTdGF0LmludihYcHJpbWVYKSwgdmFycylcclxuICAgICAgICAucmVkdWNlKChhLCBiKSA9PiB7IHJldHVybiBhLmNvbmNhdChiKTsgfSk7XHJcbiAgICAvL3Qgc3RhdGlzdGljc1xyXG4gICAgdGhpcy50U3RhdHMgPSB0aGlzLnN0RXJyQ29lZmYubWFwKChzZSwgaSkgPT4geyByZXR1cm4gdGhpcy5iZXRhc1tpXSAvIHNlOyB9KTtcclxuICAgIC8vcCB2YWx1ZXNcclxuICAgIHRoaXMucFZhbHVlcyA9IHRoaXMudFN0YXRzLm1hcCgodCwgaSkgPT4geyByZXR1cm4galN0YXQudHRlc3QodCwgbWVhbnNbaV0sIHNkc1tpXSwgbik7IH0pO1xyXG4gICAgLy9yZXNpZHVhbHNcclxuICAgIGxldCB5aGF0ID0gW107XHJcbiAgICBsZXQgcmVzID0gZHYuZGF0YS5tYXAoKGQsIGkpID0+IHtcclxuICAgICAgICBkYXRhW2ldLnNoaWZ0KCk7XHJcbiAgICAgICAgbGV0IHJvdyA9IGRhdGFbaV07XHJcbiAgICAgICAgeWhhdFtpXSA9IHRoaXMucHJlZGljdChyb3cpO1xyXG4gICAgICAgIHJldHVybiBkIC0geWhhdFtpXTtcclxuICAgIH0pO1xyXG4gICAgbGV0IHJlc2lkdWFsID0geWhhdDtcclxuICAgIHJldHVybiB0aGlzLmJldGFzO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBwbHMoeCwgeSkge1xyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlZ3Jlc3Npb24uanMubWFwIiwiaW1wb3J0IHsgUUNvbXBvbmVudCB9IGZyb20gJy4vUUNvbXBvbmVudCc7XHJcbi8qXHJcbiogVXRpbGl0eSBTeXN0ZW1zIGNsYXNzXHJcbiovXHJcbmV4cG9ydCBjbGFzcyBVU3lzIGV4dGVuZHMgUUNvbXBvbmVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBvcHRpb25zLCBkYXRhKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSk7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICB0aGlzLnJlc3VsdHMgPSBbXTtcclxuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlKGFnZW50LCBzdGVwKSB7XHJcbiAgICAgICAgdmFyIHRtcCA9IFtdLCBtYXggPSAwLCBhdmcsIHRvcDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMub3B0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0bXBbaV0gPSAwO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMub3B0aW9uc1tpXS5jb25zaWRlcmF0aW9ucy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGMgPSB0aGlzLm9wdGlvbnNbaV0uY29uc2lkZXJhdGlvbnNbal07XHJcbiAgICAgICAgICAgICAgICBsZXQgeCA9IGMueChhZ2VudCwgdGhpcy5vcHRpb25zW2ldLnBhcmFtcyk7XHJcbiAgICAgICAgICAgICAgICB0bXBbaV0gKz0gYy5mKHgsIGMubSwgYy5iLCBjLmspO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGF2ZyA9IHRtcFtpXSAvIHRoaXMub3B0aW9uc1tpXS5jb25zaWRlcmF0aW9ucy5sZW5ndGg7XHJcbiAgICAgICAgICAgIHRoaXMucmVzdWx0cy5wdXNoKHsgcG9pbnQ6IGFnZW50LmlkLCBvcHQ6IHRoaXMub3B0aW9uc1tpXS5uYW1lLCByZXN1bHQ6IGF2ZyB9KTtcclxuICAgICAgICAgICAgaWYgKGF2ZyA+IG1heCkge1xyXG4gICAgICAgICAgICAgICAgYWdlbnQudG9wID0geyBuYW1lOiB0aGlzLm9wdGlvbnNbaV0ubmFtZSwgdXRpbDogYXZnIH07XHJcbiAgICAgICAgICAgICAgICB0b3AgPSBpO1xyXG4gICAgICAgICAgICAgICAgbWF4ID0gYXZnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMub3B0aW9uc1t0b3BdLmFjdGlvbihzdGVwLCBhZ2VudCk7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9VVN5cy5qcy5tYXAiLCJjbGFzcyBSYW5kb20ge1xyXG4gICAgY29uc3RydWN0b3Ioc2VlZCkge1xyXG4gICAgICAgIHRoaXMuc2VlZCA9IHNlZWQ7XHJcbiAgICAgICAgdGhpcy5jYWxsZWQgPSAwO1xyXG4gICAgfVxyXG4gICAgcmFuZFJhbmdlKG1pbiwgbWF4KSB7XHJcbiAgICAgICAgcmV0dXJuIChtYXggLSBtaW4pICogdGhpcy5yYW5kb20oKSArIG1pbjtcclxuICAgIH1cclxuICAgIG1hdChyb3dzLCBjb2xzLCBkaXN0ID0gJ3JhbmRvbScpIHtcclxuICAgICAgICBsZXQgcmFuZHMgPSBbXTtcclxuICAgICAgICBpZiAodHlwZW9mIHJvd3MgPT0gJ251bWJlcicgJiYgdHlwZW9mIGNvbHMgPT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgciA9IDA7IHIgPCByb3dzOyByKyspIHtcclxuICAgICAgICAgICAgICAgIHJhbmRzW3JdID0gW107XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjID0gMDsgYyA8IGNvbHM7IGMrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJhbmRzW3JdW2NdID0gdGhpc1tkaXN0XSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByYW5kcztcclxuICAgIH1cclxuICAgIGFycmF5KG4sIGRpc3QgPSAncmFuZG9tJykge1xyXG4gICAgICAgIGxldCBpID0gMDtcclxuICAgICAgICBsZXQgcmFuZHMgPSBbXTtcclxuICAgICAgICB3aGlsZSAoaSA8IG4pIHtcclxuICAgICAgICAgICAgcmFuZHNbaV0gPSB0aGlzW2Rpc3RdKCk7XHJcbiAgICAgICAgICAgIGkrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJhbmRzO1xyXG4gICAgfVxyXG4gICAgcGljayhhcnJheSkge1xyXG4gICAgICAgIHJldHVybiBhcnJheVtNYXRoLmZsb29yKHRoaXMucmFuZG9tKCkgKiBhcnJheS5sZW5ndGgpXTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgKkJlbG93IGlzIGFkYXB0ZWQgZnJvbSBqU3RhdDpodHRwczovL2dpdGh1Yi5jb20vanN0YXQvanN0YXQvYmxvYi9tYXN0ZXIvc3JjL3NwZWNpYWwuanNcclxuICAgICoqL1xyXG4gICAgcmFuZG4oKSB7XHJcbiAgICAgICAgdmFyIHUsIHYsIHgsIHksIHE7XHJcbiAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICB1ID0gdGhpcy5yYW5kb20oKTtcclxuICAgICAgICAgICAgdiA9IDEuNzE1NiAqICh0aGlzLnJhbmRvbSgpIC0gMC41KTtcclxuICAgICAgICAgICAgeCA9IHUgLSAwLjQ0OTg3MTtcclxuICAgICAgICAgICAgeSA9IE1hdGguYWJzKHYpICsgMC4zODY1OTU7XHJcbiAgICAgICAgICAgIHEgPSB4ICogeCArIHkgKiAoMC4xOTYwMCAqIHkgLSAwLjI1NDcyICogeCk7XHJcbiAgICAgICAgfSB3aGlsZSAocSA+IDAuMjc1OTcgJiYgKHEgPiAwLjI3ODQ2IHx8IHYgKiB2ID4gLTQgKiBNYXRoLmxvZyh1KSAqIHUgKiB1KSk7XHJcbiAgICAgICAgcmV0dXJuIHYgLyB1O1xyXG4gICAgfVxyXG4gICAgcmFuZGcoc2hhcGUpIHtcclxuICAgICAgICB2YXIgb2FscGggPSBzaGFwZTtcclxuICAgICAgICB2YXIgYTEsIGEyLCB1LCB2LCB4O1xyXG4gICAgICAgIGlmICghc2hhcGUpXHJcbiAgICAgICAgICAgIHNoYXBlID0gMTtcclxuICAgICAgICBpZiAoc2hhcGUgPCAxKVxyXG4gICAgICAgICAgICBzaGFwZSArPSAxO1xyXG4gICAgICAgIGExID0gc2hhcGUgLSAxIC8gMztcclxuICAgICAgICBhMiA9IDEgLyBNYXRoLnNxcnQoOSAqIGExKTtcclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIHggPSB0aGlzLnJhbmRuKCk7XHJcbiAgICAgICAgICAgICAgICB2ID0gMSArIGEyICogeDtcclxuICAgICAgICAgICAgfSB3aGlsZSAodiA8PSAwKTtcclxuICAgICAgICAgICAgdiA9IHYgKiB2ICogdjtcclxuICAgICAgICAgICAgdSA9IHRoaXMucmFuZG9tKCk7XHJcbiAgICAgICAgfSB3aGlsZSAodSA+IDEgLSAwLjMzMSAqIE1hdGgucG93KHgsIDQpICYmXHJcbiAgICAgICAgICAgIE1hdGgubG9nKHUpID4gMC41ICogeCAqIHggKyBhMSAqICgxIC0gdiArIE1hdGgubG9nKHYpKSk7XHJcbiAgICAgICAgLy8gYWxwaGEgPiAxXHJcbiAgICAgICAgaWYgKHNoYXBlID09IG9hbHBoKVxyXG4gICAgICAgICAgICByZXR1cm4gYTEgKiB2O1xyXG4gICAgICAgIC8vIGFscGhhIDwgMVxyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgdSA9IHRoaXMucmFuZG9tKCk7XHJcbiAgICAgICAgfSB3aGlsZSAodSA9PT0gMCk7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucG93KHUsIDEgLyBvYWxwaCkgKiBhMSAqIHY7XHJcbiAgICB9XHJcbiAgICBiZXRhKGFscGhhLCBiZXRhKSB7XHJcbiAgICAgICAgdmFyIHUgPSB0aGlzLnJhbmRnKGFscGhhKTtcclxuICAgICAgICByZXR1cm4gdSAvICh1ICsgdGhpcy5yYW5kZyhiZXRhKSk7XHJcbiAgICB9XHJcbiAgICBnYW1tYShzaGFwZSwgc2NhbGUpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yYW5kZyhzaGFwZSkgKiBzY2FsZTtcclxuICAgIH1cclxuICAgIGxvZ05vcm1hbChtdSwgc2lnbWEpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5leHAodGhpcy5yYW5kbigpICogc2lnbWEgKyBtdSk7XHJcbiAgICB9XHJcbiAgICBub3JtYWwobWVhbiA9IDAsIHN0ZCA9IDEpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yYW5kbigpICogc3RkICsgbWVhbjtcclxuICAgIH1cclxuICAgIHBvaXNzb24obCkge1xyXG4gICAgICAgIHZhciBwID0gMSwgayA9IDAsIEwgPSBNYXRoLmV4cCgtbCk7XHJcbiAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICBrKys7XHJcbiAgICAgICAgICAgIHAgKj0gdGhpcy5yYW5kb20oKTtcclxuICAgICAgICB9IHdoaWxlIChwID4gTCk7XHJcbiAgICAgICAgcmV0dXJuIGsgLSAxO1xyXG4gICAgfVxyXG4gICAgdChkb2YpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yYW5kbigpICogTWF0aC5zcXJ0KGRvZiAvICgyICogdGhpcy5yYW5kZyhkb2YgLyAyKSkpO1xyXG4gICAgfVxyXG4gICAgd2VpYnVsbChzY2FsZSwgc2hhcGUpIHtcclxuICAgICAgICByZXR1cm4gc2NhbGUgKiBNYXRoLnBvdygtTWF0aC5sb2codGhpcy5yYW5kb20oKSksIDEgLyBzaGFwZSk7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiogQm9iIEplbmtpbnMnIHNtYWxsIG5vbmNyeXB0b2dyYXBoaWMgUFJORyAocHNldWRvcmFuZG9tIG51bWJlciBnZW5lcmF0b3IpIHBvcnRlZCB0byBKYXZhU2NyaXB0XHJcbiogYWRhcHRlZCBmcm9tOlxyXG4qIGh0dHBzOi8vZ2l0aHViLmNvbS9ncmF1ZS9idXJ0bGVwcm5nXHJcbiogd2hpY2ggaXMgZnJvbSBodHRwOi8vd3d3LmJ1cnRsZWJ1cnRsZS5uZXQvYm9iL3JhbmQvc21hbGxwcm5nLmh0bWxcclxuKi9cclxuZXhwb3J0IGNsYXNzIFJOR0J1cnRsZSBleHRlbmRzIFJhbmRvbSB7XHJcbiAgICBjb25zdHJ1Y3RvcihzZWVkKSB7XHJcbiAgICAgICAgc3VwZXIoc2VlZCk7XHJcbiAgICAgICAgdGhpcy5zZWVkID4+Pj0gMDtcclxuICAgICAgICB0aGlzLmN0eCA9IG5ldyBBcnJheSg0KTtcclxuICAgICAgICB0aGlzLmN0eFswXSA9IDB4ZjFlYTVlZWQ7XHJcbiAgICAgICAgdGhpcy5jdHhbMV0gPSB0aGlzLmN0eFsyXSA9IHRoaXMuY3R4WzNdID0gdGhpcy5zZWVkO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjA7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLnJhbmRvbSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJvdCh4LCBrKSB7XHJcbiAgICAgICAgcmV0dXJuICh4IDw8IGspIHwgKHggPj4gKDMyIC0gaykpO1xyXG4gICAgfVxyXG4gICAgcmFuZG9tKCkge1xyXG4gICAgICAgIHZhciBjdHggPSB0aGlzLmN0eDtcclxuICAgICAgICB2YXIgZSA9IChjdHhbMF0gLSB0aGlzLnJvdChjdHhbMV0sIDI3KSkgPj4+IDA7XHJcbiAgICAgICAgY3R4WzBdID0gKGN0eFsxXSBeIHRoaXMucm90KGN0eFsyXSwgMTcpKSA+Pj4gMDtcclxuICAgICAgICBjdHhbMV0gPSAoY3R4WzJdICsgY3R4WzNdKSA+Pj4gMDtcclxuICAgICAgICBjdHhbMl0gPSAoY3R4WzNdICsgZSkgPj4+IDA7XHJcbiAgICAgICAgY3R4WzNdID0gKGUgKyBjdHhbMF0pID4+PiAwO1xyXG4gICAgICAgIHRoaXMuY2FsbGVkICs9IDE7XHJcbiAgICAgICAgcmV0dXJuIGN0eFszXSAvIDQyOTQ5NjcyOTYuMDtcclxuICAgIH1cclxufVxyXG4vKlxyXG4qIHhvcnNoaWZ0NyosIGJ5IEZyYW7Dp29pcyBQYW5uZXRvbiBhbmQgUGllcnJlIEwnZWN1eWVyOiAzMi1iaXQgeG9yLXNoaWZ0IHJhbmRvbSBudW1iZXIgZ2VuZXJhdG9yXHJcbiogYWRkcyByb2J1c3RuZXNzIGJ5IGFsbG93aW5nIG1vcmUgc2hpZnRzIHRoYW4gTWFyc2FnbGlhJ3Mgb3JpZ2luYWwgdGhyZWUuIEl0IGlzIGEgNy1zaGlmdCBnZW5lcmF0b3Igd2l0aCAyNTYgYml0cywgdGhhdCBwYXNzZXMgQmlnQ3J1c2ggd2l0aCBubyBzeXN0bWF0aWMgZmFpbHVyZXMuXHJcbiogQWRhcHRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9kYXZpZGJhdS94c3JhbmRcclxuKi9cclxuZXhwb3J0IGNsYXNzIFJOR3hvcnNoaWZ0NyBleHRlbmRzIFJhbmRvbSB7XHJcbiAgICBjb25zdHJ1Y3RvcihzZWVkKSB7XHJcbiAgICAgICAgbGV0IGosIHcsIFggPSBbXTtcclxuICAgICAgICBzdXBlcihzZWVkKTtcclxuICAgICAgICAvLyBTZWVkIHN0YXRlIGFycmF5IHVzaW5nIGEgMzItYml0IGludGVnZXIuXHJcbiAgICAgICAgdyA9IFhbMF0gPSB0aGlzLnNlZWQ7XHJcbiAgICAgICAgLy8gRW5mb3JjZSBhbiBhcnJheSBsZW5ndGggb2YgOCwgbm90IGFsbCB6ZXJvZXMuXHJcbiAgICAgICAgd2hpbGUgKFgubGVuZ3RoIDwgOCkge1xyXG4gICAgICAgICAgICBYLnB1c2goMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAoaiA9IDA7IGogPCA4ICYmIFhbal0gPT09IDA7ICsraikge1xyXG4gICAgICAgICAgICBpZiAoaiA9PSA4KSB7XHJcbiAgICAgICAgICAgICAgICB3ID0gWFs3XSA9IC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdyA9IFhbal07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy54ID0gWDtcclxuICAgICAgICB0aGlzLmkgPSAwO1xyXG4gICAgICAgIC8vIERpc2NhcmQgYW4gaW5pdGlhbCAyNTYgdmFsdWVzLlxyXG4gICAgICAgIGZvciAoaiA9IDI1NjsgaiA+IDA7IC0taikge1xyXG4gICAgICAgICAgICB0aGlzLnJhbmRvbSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJhbmRvbSgpIHtcclxuICAgICAgICBsZXQgWCA9IHRoaXMueCwgaSA9IHRoaXMuaSwgdCwgdiwgdywgcmVzO1xyXG4gICAgICAgIHQgPSBYW2ldO1xyXG4gICAgICAgIHQgXj0gKHQgPj4+IDcpO1xyXG4gICAgICAgIHYgPSB0IF4gKHQgPDwgMjQpO1xyXG4gICAgICAgIHQgPSBYWyhpICsgMSkgJiA3XTtcclxuICAgICAgICB2IF49IHQgXiAodCA+Pj4gMTApO1xyXG4gICAgICAgIHQgPSBYWyhpICsgMykgJiA3XTtcclxuICAgICAgICB2IF49IHQgXiAodCA+Pj4gMyk7XHJcbiAgICAgICAgdCA9IFhbKGkgKyA0KSAmIDddO1xyXG4gICAgICAgIHYgXj0gdCBeICh0IDw8IDcpO1xyXG4gICAgICAgIHQgPSBYWyhpICsgNykgJiA3XTtcclxuICAgICAgICB0ID0gdCBeICh0IDw8IDEzKTtcclxuICAgICAgICB2IF49IHQgXiAodCA8PCA5KTtcclxuICAgICAgICBYW2ldID0gdjtcclxuICAgICAgICB0aGlzLmkgPSAoaSArIDEpICYgNztcclxuICAgICAgICByZXMgPSAodiA+Pj4gMCkgLyAoKDEgPDwgMzApICogNCk7XHJcbiAgICAgICAgdGhpcy5jYWxsZWQgKz0gMTtcclxuICAgICAgICByZXR1cm4gcmVzO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJhbmRvbS5qcy5tYXAiLCJleHBvcnQgKiBmcm9tICcuL3V0aWxzJztcclxuZXhwb3J0IHsgUUNvbXBvbmVudCB9IGZyb20gJy4vUUNvbXBvbmVudCc7XHJcbmV4cG9ydCB7IEJESUFnZW50IH0gZnJvbSAnLi9iZGknO1xyXG5leHBvcnQgKiBmcm9tICcuL2JlaGF2aW9yVHJlZSc7XHJcbmV4cG9ydCAqIGZyb20gJy4vY29tcGFydG1lbnQnO1xyXG5leHBvcnQgeyBDb250YWN0UGF0Y2ggfSBmcm9tICcuL2NvbnRhY3RQYXRjaCc7XHJcbmV4cG9ydCB7IEVudmlyb25tZW50IH0gZnJvbSAnLi9lbnZpcm9ubWVudCc7XHJcbmV4cG9ydCAqIGZyb20gJy4vZXBpJztcclxuZXhwb3J0ICogZnJvbSAnLi9ldmVudHMnO1xyXG5leHBvcnQgeyBFeHBlcmltZW50IH0gZnJvbSAnLi9leHBlcmltZW50JztcclxuZXhwb3J0ICogZnJvbSAnLi9nZW5ldGljJztcclxuZXhwb3J0IHsgRXZvbHV0aW9uYXJ5IH0gZnJvbSAnLi9ldm9sdXRpb25hcnknO1xyXG5leHBvcnQgeyBIeWJyaWRBdXRvbWF0YSB9IGZyb20gJy4vaGEnO1xyXG5leHBvcnQgKiBmcm9tICcuL2h0bic7XHJcbmV4cG9ydCAqIGZyb20gJy4vbWMnO1xyXG5leHBvcnQgeyBrTWVhbiB9IGZyb20gJy4va21lYW4nO1xyXG5leHBvcnQgeyBLTk4gfSBmcm9tICcuL2tubic7XHJcbmV4cG9ydCAqIGZyb20gJy4vbWF0aCc7XHJcbmV4cG9ydCB7IE5ldHdvcmsgfSBmcm9tICcuL25ldHdvcmsnO1xyXG5leHBvcnQgeyBRTGVhcm5lciB9IGZyb20gJy4vUUxlYXJuZXInO1xyXG5leHBvcnQgKiBmcm9tICcuL3JlZ3Jlc3Npb24nO1xyXG5leHBvcnQgeyBTdGF0ZU1hY2hpbmUgfSBmcm9tICcuL3N0YXRlTWFjaGluZSc7XHJcbmV4cG9ydCAqIGZyb20gJy4vVVN5cyc7XHJcbmV4cG9ydCAqIGZyb20gJy4vcmFuZG9tJztcclxuZXhwb3J0IHZhciB2ZXJzaW9uID0gJzAuMC41JztcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFpbi5qcy5tYXAiLCIvKioqXHJcbipAbW9kdWxlIFFFcGlLaXRcclxuKi9cclxuaW1wb3J0ICogYXMgcWVwaWtpdCBmcm9tICcuL21haW4nO1xyXG5sZXQgUUVwaUtpdCA9IHFlcGlraXQ7XHJcbmZvciAobGV0IGtleSBpbiBRRXBpS2l0KSB7XHJcbiAgICBpZiAoa2V5ID09ICd2ZXJzaW9uJykge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFFFcGlLaXRba2V5XSk7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cWVwaWtpdC5qcy5tYXAiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBTyxNQUFNLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDekIsQUFBTyxNQUFNLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDeEIsQUFBTyxNQUFNLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDekIsQUFBTyxTQUFTLFlBQVksQ0FBQyxJQUFJLEVBQUU7SUFDL0IsSUFBSSxVQUFVLENBQUM7SUFDZixJQUFJLEdBQUcsQ0FBQztJQUNSLElBQUksVUFBVSxHQUFHLDhCQUE4QixDQUFDO0lBQ2hELElBQUksZUFBZSxHQUFHLEVBQUUsQ0FBQztJQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsU0FBUyxFQUFFO1FBQzlCLFVBQVUsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pDLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDcEMsQ0FBQyxDQUFDO0lBQ0gs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S0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ25DO0tBQ0o7SUFDRCxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRTtRQUNsQixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDWixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDbkIsS0FBSyxJQUFJLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFO1lBQzFCLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3hELFVBQVUsRUFBRSxDQUFDO1NBQ2hCO1FBQ0QsS0FBSyxJQUFJLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFO1lBQzFCLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3hELFVBQVUsRUFBRSxDQUFDO1NBQ2hCO1FBQ0QsS0FBSyxJQUFJLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFO1lBQzFCLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3hELFVBQVUsRUFBRSxDQUFDO1NBQ2hCO1FBQ0QsT0FBTyxHQUFHLEdBQUcsVUFBVSxDQUFDO0tBQzNCO0lBQ0QsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUU7UUFDWCxJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztR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QUFDLENBQUM7Z0JBQ3ZCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMxQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNoQztTQUNKO1FBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDN0UsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDN0UsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFN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TSxFQUFFLENBQUMsQ0FBQyxDQUFDOztJQUV4QyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDcEQsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7SUFFekQsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDO1NBQ3JELE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7O0lBRS9DLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7SUFFN0UsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7O0lBRTFGLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNkLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSztRQUM1QixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDaEIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xCLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzVCLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN0QixDQUFDLENBQUM7SUFDSCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUM7SUFDcEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0NBQ3JCO0FBQ0QsQUFBTyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0NBQ3pCLEFBQ0Q7O0FDekNBOzs7QUFHQSxBQUFPLE1BQU0sSUFBSSxTQUFTLFVBQVUsQ0FBQztJQUNqQyxXQUFXLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7UUFDN0IsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ1osSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7S0FDcEI7SUFDRCxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRTtRQUNoQixJQUFJLEdBQUcsR0FBRyxFQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO1FBQ2hDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMxQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1gsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDNUQsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzNDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ25DO1lBQ0QsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUM7WUFDckQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDL0UsSUFBSSxHQUFHLEdBQUcsR0FBRyxFQUFFO2dCQUNYLEtBQUssQ0FBQyxHQUFHLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDO2dCQUN0RCxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUNSLEdBQUcsR0FBRyxHQUFHLENBQUM7YUFDYjtTQUNKO1FBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQ3pDO0NBQ0osQUFDRDs7QUMvQkEsTUFBTSxNQUFNLENBQUM7SUFDVCxXQUFXLENBQUMsSUFBSSxFQUFFO1FBQ2QsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7S0FDbkI7SUFDRCxTQUFTLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRTtRQUNoQixPQUFPLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDO0tBQzVDO0lBQ0QsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxHQUFHLFFBQVEsRUFBRTtRQUM3QixJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDZixJQUFJLE9BQU8sSUFBSSxJQUFJLFFBQVEsSUFBSSxPQUFPLElBQUksSUFBSSxRQUFRLEVBQUU7WUFDcEQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDM0IsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDZCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUMzQixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7aUJBQzlCO2FBQ0o7U0FDSjtRQUNELE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0lBQ0QsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLEdBQUcsUUFBUSxFQUFFO1FBQ3RCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNWLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUN4QixDQUFDLEVBQUUsQ0FBQztTQUNQO1FBQ0QsT0FBTyxLQUFLLENBQUM7S0FDaEI7SUFDRCxJQUFJLENBQUMsS0FBSyxFQUFFO1FBQ1IsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7S0FDMUQ7Ozs7SUFJRCxLQUFLLEdBQUc7UUFDSixJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbEIsR0FBRztZQUNDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbEIsQ0FBQyxHQUFHLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDbkMsQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUM7WUFDakIsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDO1lBQzNCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxPQUFPLEdBQUcsQ0FBQyxHQUFHLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztTQUMvQyxRQUFRLENBQUMsR0FBRyxPQUFPLEtBQUssQ0FBQyxHQUFHLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO1FBQzNFLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNoQjtJQUNELEtBQUssQ0FBQyxLQUFLLEVBQUU7UUFDVCxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbEIsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxLQUFLO1lBQ04sS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNkLElBQUksS0FBSyxHQUFHLENBQUM7WUFDVCxLQUFLLElBQUksQ0FBQyxDQUFDO1FBQ2YsRUFBRSxHQUFHLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLEVBQUUsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDM0IsR0FBRztZQUNDLEdBQUc7Z0JBQ0MsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDakIsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ2xCLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNqQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDZCxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ3JCLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFOztRQUU1RCxJQUFJLEtBQUssSUFBSSxLQUFLO1lBQ2QsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDOztRQUVsQixHQUFHO1lBQ0MsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUNyQixRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDbEIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztLQUMxQztJQUNELElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFO1FBQ2QsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ3JDO0lBQ0QsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUU7UUFDaEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQztLQUNwQztJQUNELFNBQVMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0tBQzlDO0lBQ0QsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBRTtRQUN0QixPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDO0tBQ3BDO0lBQ0QsT0FBTyxDQUFDLENBQUMsRUFBRTtRQUNQLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkMsR0FBRztZQUNDLENBQUMsRUFBRSxDQUFDO1lBQ0osQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUN0QixRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDaEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2hCO0lBQ0QsQ0FBQyxDQUFDLEdBQUcsRUFBRTtRQUNILE9BQU8sSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDcEU7SUFDRCxPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRTtRQUNsQixPQUFPLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7S0FDaEU7Q0FDSjs7Ozs7OztBQU9ELEFBQU8sTUFBTSxTQUFTLFNBQVMsTUFBTSxDQUFDO0lBQ2xDLFdBQVcsQ0FBQyxJQUFJLEVBQUU7UUFDZCxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDWixJQUFJLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQztRQUNqQixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDcEQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN6QixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDakI7S0FDSjtJQUNELEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ04sT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3JDO0lBQ0QsTUFBTSxHQUFHO1FBQ0wsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNuQixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDOUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMvQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztRQUNqQixPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUM7S0FDaEM7Q0FDSjs7Ozs7O0FBTUQsQUFBTyxNQUFNLFlBQVksU0FBUyxNQUFNLENBQUM7SUFDckMsV0FBVyxDQUFDLElBQUksRUFBRTtRQUNkLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQzs7UUFFWixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7O1FBRXJCLE9BQU8sQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDakIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNiO1FBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtZQUNsQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ1IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzthQUNqQjtpQkFDSTtnQkFDRCxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ1o7U0FDSjtRQUNELElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7O1FBRVgsS0FBSyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7WUFDdEIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ2pCO0tBQ0o7SUFDRCxNQUFNLEdBQUc7UUFDTCxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQztRQUN6QyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1QsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNmLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ2xCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3BCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ25CLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2xCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25CLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ2xCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2xCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckIsR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7UUFDakIsT0FBTyxHQUFHLENBQUM7S0FDZDtDQUNKLEFBQ0Q7O0FDL0pPLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUM3Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDekJBOzs7QUFHQSxBQUNBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUN0QixLQUFLLElBQUksR0FBRyxJQUFJLE9BQU8sRUFBRTtJQUNyQixJQUFJLEdBQUcsSUFBSSxTQUFTLEVBQUU7UUFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztLQUM3QjtDQUNKLEFBQ0QifQ==
