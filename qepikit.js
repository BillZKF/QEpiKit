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
function shuffle(array, randomF) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(randomF() * currentIndex);
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
function generatePop(numAgents, options, type, boundaries, currentAgentId) {
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
        pop[a].movePerDay = jStat.normal.inv(Math.random(), 2500 * 24, 1000); // m/day
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
            pop[a].position.x = randRange(boundaries.left, boundaries.right);
            pop[a].position.y = randRange(boundaries.bottom, boundaries.top);
            pop[a].mesh.position.x = pop[a].position.x;
            pop[a].mesh.position.y = pop[a].position.y;
            //scene.add(pop[a].mesh);
        }
        if (pop[a].type === 'geospatial') {
            locs.features[a] = turf.point([randRange(-75.1467, -75.1867), randRange(39.9200, 39.9900)]);
            pop[a].location = locs.features[a];
            pop[a].location.properties.agentRefID = pop[a].id;
        }
        options.forEach((d) => {
            if (typeof d.assign === 'function') {
                pop[a][d.name] = d.assign(pop[a]);
            }
            else {
                pop[a][d.name] = d.assign;
            }
        });
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
    constructor(name, data) {
        super(name);
        this.data = data; //an array of Patches. Each patch contains an array of compartments in operational order
        this.totalPop = 0;
        this.history = [];
        for (let d = 0; d < this.data.length; d++) {
            this.totalPop += this.data[d].totalPop;
        }
        this._tolerance = 1e-9; //model err tolerance
    }
    update(patch, step) {
        let temp_pop = [], temp_d = [], next_d = [], lte = [], err = 1, newStep;
        let compartments = patch.compartments;
        for (let c = 0; c < compartments.length; c++) {
            compartments[c].dpop = compartments[c].operation(compartments, step);
        }
        //first order (Euler)
        for (let c = 0; c < compartments.length; c++) {
            temp_pop[c] = compartments[c].pop;
            temp_d[c] = compartments[c].dpop;
            compartments[c].pop = temp_pop[c] + temp_d[c];
        }
        //second order (Heuns)
        patch.totalPop = 0;
        for (let c = 0; c < compartments.length; c++) {
            next_d[c] = compartments[c].operation(compartments, step);
            compartments[c].pop = temp_pop[c] + (0.5 * (temp_d[c] + next_d[c]));
            patch.totalPop += compartments[c].pop;
        }
    }
}
class Compartment {
    constructor(name, pop, operation) {
        this.name = name;
        this.pop = pop;
        this.operation = operation || null;
        this.dpop = 0;
    }
}
class Patch {
    constructor(name, compartments) {
        this.id = Patch.newId();
        this.name = name;
        this.compartments = compartments;
        this.totalPop = 0;
        for (var c = 0; c < this.compartments.length; c++) {
            this.totalPop += this.compartments[c].pop;
            this.compartments[c].initialPop = this.compartments[c].pop;
        }
    }
    static newId() {
        Patch.cId++;
        return Patch.cId;
    }
}
Patch.cId = 0;

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
    constructor(resources = [], facilities = [], eventsQueue = [], activationType = 'random', randF = Math.random) {
        this.time = 0;
        this.timeOfDay = 0;
        this.models = [];
        this.history = [];
        this.agents = [];
        this.resources = resources;
        this.facilities = facilities;
        this.eventsQueue = eventsQueue;
        this.activationType = activationType;
        this.randF = randF;
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
            shuffle(this.agents, this.randF);
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
        this.target = setup.target;
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
            cfg.agents.forEach((group) => {
                groups[group.name] = generatePop(group.count, group.params, cfg.environment.spatialType, group.boundaries, currentAgentId);
                currentAgentId = groups[group.name][groups[group.name].length - 1].id;
            });
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
                            patches.push(new Patch(patch.name, cmp.compartments));
                        }
                    });
                    let cModel = new CompartmentModel('cmp.name', patches);
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
                    //agents = this.environment.agents;
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
                    d.compartments.forEach((pcm) => {
                        if (pcm.name === cm) {
                            model[cm] = model[cm] == undefined ? pcm.pop : pcm.pop + model[cm];
                        }
                    });
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
    constructor(range, discrete) {
        let val = randRange(range[0], range[1]);
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
class Genetic {
    constructor(size, ranges, target, cost, discrete = false, gradient = true) {
        this.ranges = ranges;
        this.target = target;
        this.discrete = discrete;
        this.cost = cost;
        this.size = size;
        this.gradient = gradient;
        this.population = [];
        for (let i = 0; i < this.size; i++) {
            let chroma = new Chromasome();
            for (let k = 0; k < ranges.length; k++) {
                chroma.genes.push(new Gene(this.ranges[k], this.discrete));
            }
            this.population.push(chroma);
        }
    }
    run(generations, mating = false) {
        this.mutateRate = 0.01;
        this.mating = mating;
        while (generations--) {
            this.generation();
            this.population.sort(this.ascSort);
        }
        return this.population;
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
    generation() {
        if (this.mating) {
            let topOnePercent = Math.round(0.01 * this.size) + 2; //ten percent of original size + 2
            let children = this.mate(topOnePercent);
            this.population = this.population.concat(children);
        }
        for (let i = 0; i < this.population.length; i++) {
            this.mutate(this.population[i], 1);
        }
        for (let j = 0; j < this.population.length; j++) {
            this.population[j].score = this.cost(this.population[j], this.target);
        }
    }
    mate(parents) {
        let numChildren = 0.5 * this.ranges.length * this.ranges.length;
        let children = [];
        for (let i = 0; i < numChildren; i++) {
            let child = new Chromasome();
            for (let j = 0; j < this.ranges.length; j++) {
                let gene = new Gene([this.ranges[j][0], this.ranges[j][1]], this.discrete);
                let rand = Math.floor(Math.random() * parents);
                let expressed = this.population[rand].genes.slice(j, j + 1);
                gene.code = expressed[0].code;
                child.genes.push(gene);
            }
            children.push(child);
        }
        return children;
    }
    mutate(chroma, chance) {
        if (Math.random() > chance) {
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
                diff = randRange(-1, 1);
            }
            let upOrDown = diff > 0 ? 1 : -1;
            if (!this.discrete) {
                gene.code += upOrDown * this.mutateRate * Math.random();
            }
            else {
                gene.code += upOrDown;
            }
            gene.code = Math.min(Math.max(0, gene.code), 1);
        }
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
                chroma.genes.push(new Gene(this.ranges[k].range, this.discrete));
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
            console.log('best: ', this.population[0].score.toFixed(2));
            r++;
        }
        return this.experimentLog;
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
            console.log(this.mating, children, topPercent);
            this.population = this.population.concat(children);
        }
        for (let i = 0; i < this.population.length; i++) {
            this.mutate(this.population[i], 1);
        }
        for (let j = 0; j < this.population.length; j++) {
            for (let pm = 0; pm < this.ranges.length; pm++) {
                let cfgPm = this.ranges[pm];
                let groupIdx;
                if (cfgPm.level === 'agents' || typeof cfgPm.level === 'undefined') {
                    for (let ii = 0; ii < cfg.agents.length; ii++) {
                        if (cfg.agents[ii].name == cfgPm.group) {
                            groupIdx = ii;
                        }
                    }
                    let paramIdx;
                    for (let jj = 0; jj < cfg.agents[groupIdx].params.length; jj++) {
                        if (cfg.agents[groupIdx].params[jj].name == cfgPm.name) {
                            paramIdx = jj;
                        }
                    }
                    cfg.agents[groupIdx].params[paramIdx].assign = invNorm(this.population[j].genes[pm].code, cfgPm.range[0], cfgPm.range[1]);
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
            console.log(r, j);
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
                let gene = new Gene([this.ranges[j].range[0], this.ranges[j].range[1]], this.discrete);
                let rand = Math.floor(Math.random() * parents);
                let expressed = this.population[rand].genes.slice(j, j + 1);
                gene.code = expressed[0].code;
                child.genes.push(gene);
            }
            children.push(child);
        }
        return children;
    }
    mutate(chroma, chance) {
        if (Math.random() > chance) {
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
                diff = randRange(-1, 1);
            }
            let upOrDown = diff > 0 ? 1 : -1;
            if (!this.discrete) {
                if (diff == 0) {
                    gene.code += Math.random() * this.mutateRate;
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

var version = '0.0.1';


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
	Genetic: Genetic,
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
	USys: USys
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicWVwaWtpdC5qcyIsInNvdXJjZXMiOlsiZGlzdC91dGlscy5qcyIsImRpc3QvUUNvbXBvbmVudC5qcyIsImRpc3QvYmRpLmpzIiwiZGlzdC9iZWhhdmlvclRyZWUuanMiLCJkaXN0L2NvbXBhcnRtZW50LmpzIiwiZGlzdC9jb250YWN0UGF0Y2guanMiLCJkaXN0L2Vudmlyb25tZW50LmpzIiwiZGlzdC9lcGkuanMiLCJkaXN0L2V2ZW50cy5qcyIsImRpc3Qvc3RhdGVNYWNoaW5lLmpzIiwiZGlzdC9leHBlcmltZW50LmpzIiwiZGlzdC9nZW5ldGljLmpzIiwiZGlzdC9ldm9sdXRpb25hcnkuanMiLCJkaXN0L2hhLmpzIiwiZGlzdC9odG4uanMiLCJkaXN0L2ttZWFuLmpzIiwiZGlzdC9rbm4uanMiLCJkaXN0L21hdGguanMiLCJkaXN0L25ldHdvcmsuanMiLCJkaXN0L1FMZWFybmVyLmpzIiwiZGlzdC9yZWdyZXNzaW9uLmpzIiwiZGlzdC9VU3lzLmpzIiwiZGlzdC9tYWluLmpzIiwiZGlzdC9RRXBpS2l0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBTVUNDRVNTID0gMTtcclxuZXhwb3J0IGNvbnN0IEZBSUxFRCA9IDI7XHJcbmV4cG9ydCBjb25zdCBSVU5OSU5HID0gMztcclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNTVlVSSShkYXRhKSB7XHJcbiAgICB2YXIgZGF0YVN0cmluZztcclxuICAgIHZhciBVUkk7XHJcbiAgICB2YXIgY3N2Q29udGVudCA9IFwiZGF0YTp0ZXh0L2NzdjtjaGFyc2V0PXV0Zi04LFwiO1xyXG4gICAgdmFyIGNzdkNvbnRlbnRBcnJheSA9IFtdO1xyXG4gICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpbmZvQXJyYXkpIHtcclxuICAgICAgICBkYXRhU3RyaW5nID0gaW5mb0FycmF5LmpvaW4oXCIsXCIpO1xyXG4gICAgICAgIGNzdkNvbnRlbnRBcnJheS5wdXNoKGRhdGFTdHJpbmcpO1xyXG4gICAgfSk7XHJcbiAgICBjc3ZDb250ZW50ICs9IGNzdkNvbnRlbnRBcnJheS5qb2luKFwiXFxuXCIpO1xyXG4gICAgVVJJID0gZW5jb2RlVVJJKGNzdkNvbnRlbnQpO1xyXG4gICAgcmV0dXJuIFVSSTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gYXJyYXlGcm9tUmFuZ2Uoc3RhcnQsIGVuZCwgc3RlcCkge1xyXG4gICAgdmFyIHJhbmdlID0gW107XHJcbiAgICB2YXIgaSA9IHN0YXJ0O1xyXG4gICAgd2hpbGUgKGkgPCBlbmQpIHtcclxuICAgICAgICByYW5nZS5wdXNoKGkpO1xyXG4gICAgICAgIGkgKz0gc3RlcDtcclxuICAgIH1cclxuICAgIHJldHVybiByYW5nZTtcclxufVxyXG4vKipcclxuKiBzaHVmZmxlIC0gZmlzaGVyLXlhdGVzIHNodWZmbGVcclxuKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNodWZmbGUoYXJyYXksIHJhbmRvbUYpIHtcclxuICAgIHZhciBjdXJyZW50SW5kZXggPSBhcnJheS5sZW5ndGgsIHRlbXBvcmFyeVZhbHVlLCByYW5kb21JbmRleDtcclxuICAgIC8vIFdoaWxlIHRoZXJlIHJlbWFpbiBlbGVtZW50cyB0byBzaHVmZmxlLi4uXHJcbiAgICB3aGlsZSAoMCAhPT0gY3VycmVudEluZGV4KSB7XHJcbiAgICAgICAgLy8gUGljayBhIHJlbWFpbmluZyBlbGVtZW50Li4uXHJcbiAgICAgICAgcmFuZG9tSW5kZXggPSBNYXRoLmZsb29yKHJhbmRvbUYoKSAqIGN1cnJlbnRJbmRleCk7XHJcbiAgICAgICAgY3VycmVudEluZGV4IC09IDE7XHJcbiAgICAgICAgLy8gQW5kIHN3YXAgaXQgd2l0aCB0aGUgY3VycmVudCBlbGVtZW50LlxyXG4gICAgICAgIHRlbXBvcmFyeVZhbHVlID0gYXJyYXlbY3VycmVudEluZGV4XTtcclxuICAgICAgICBhcnJheVtjdXJyZW50SW5kZXhdID0gYXJyYXlbcmFuZG9tSW5kZXhdO1xyXG4gICAgICAgIGFycmF5W3JhbmRvbUluZGV4XSA9IHRlbXBvcmFyeVZhbHVlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFycmF5O1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVVVSUQoKSB7XHJcbiAgICAvLyBodHRwOi8vd3d3LmJyb29mYS5jb20vVG9vbHMvTWF0aC51dWlkLmh0bVxyXG4gICAgdmFyIGNoYXJzID0gJzAxMjM0NTY3ODlBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6Jy5zcGxpdCgnJyk7XHJcbiAgICB2YXIgdXVpZCA9IG5ldyBBcnJheSgzNik7XHJcbiAgICB2YXIgcm5kID0gMCwgcjtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzY7IGkrKykge1xyXG4gICAgICAgIGlmIChpID09IDggfHwgaSA9PSAxMyB8fCBpID09IDE4IHx8IGkgPT0gMjMpIHtcclxuICAgICAgICAgICAgdXVpZFtpXSA9ICctJztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoaSA9PSAxNCkge1xyXG4gICAgICAgICAgICB1dWlkW2ldID0gJzQnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHJuZCA8PSAweDAyKVxyXG4gICAgICAgICAgICAgICAgcm5kID0gMHgyMDAwMDAwICsgKE1hdGgucmFuZG9tKCkgKiAweDEwMDAwMDApIHwgMDtcclxuICAgICAgICAgICAgciA9IHJuZCAmIDB4ZjtcclxuICAgICAgICAgICAgcm5kID0gcm5kID4+IDQ7XHJcbiAgICAgICAgICAgIHV1aWRbaV0gPSBjaGFyc1soaSA9PSAxOSkgPyAociAmIDB4MykgfCAweDggOiByXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdXVpZC5qb2luKCcnKTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gYWx3YXlzKGEpIHtcclxuICAgIGlmIChhID09PSBTVUNDRVNTKSB7XHJcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBldmVudHVhbGx5KGEpIHtcclxuICAgIGlmIChhID09PSBTVUNDRVNTKSB7XHJcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gUlVOTklORztcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxUbyhhLCBiKSB7XHJcbiAgICBpZiAoYSA9PT0gYikge1xyXG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gbm90KHJlc3VsdCkge1xyXG4gICAgdmFyIG5ld1Jlc3VsdDtcclxuICAgIGlmIChyZXN1bHQgPT09IFNVQ0NFU1MpIHtcclxuICAgICAgICBuZXdSZXN1bHQgPSBGQUlMRUQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChyZXN1bHQgPT09IEZBSUxFRCkge1xyXG4gICAgICAgIG5ld1Jlc3VsdCA9IFNVQ0NFU1M7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3UmVzdWx0O1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBub3RFcXVhbFRvKGEsIGIpIHtcclxuICAgIGlmIChhICE9PSBiKSB7XHJcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBndChhLCBiKSB7XHJcbiAgICBpZiAoYSA+IGIpIHtcclxuICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGd0RXEoYSwgYikge1xyXG4gICAgaWYgKGEgPj0gYikge1xyXG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gbHQoYSwgYikge1xyXG4gICAgaWYgKGEgPCBiKSB7XHJcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBsdEVxKGEsIGIpIHtcclxuICAgIGlmIChhIDw9IGIpIHtcclxuICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGhhc1Byb3AoYSwgYikge1xyXG4gICAgYSA9IGEgfHwgZmFsc2U7XHJcbiAgICBpZiAoYSA9PT0gYikge1xyXG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gaW5SYW5nZShhLCBiKSB7XHJcbiAgICBpZiAoYiA+PSBhWzBdICYmIGIgPD0gYVsxXSkge1xyXG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gbm90SW5SYW5nZShhLCBiKSB7XHJcbiAgICBpZiAoYiA+PSBhWzBdICYmIGIgPD0gYVsxXSkge1xyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWF0Y2hlclN0cmluZyhjaGVjaykge1xyXG4gICAgdmFyIHN0cmluZyA9IG51bGw7XHJcbiAgICBzd2l0Y2ggKGNoZWNrKSB7XHJcbiAgICAgICAgY2FzZSBlcXVhbFRvOlxyXG4gICAgICAgICAgICBzdHJpbmcgPSBcImVxdWFsIHRvXCI7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2Ugbm90RXF1YWxUbzpcclxuICAgICAgICAgICAgc3RyaW5nID0gXCJub3QgZXF1YWwgdG9cIjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBndDpcclxuICAgICAgICAgICAgc3RyaW5nID0gXCJncmVhdGVyIHRoYW5cIjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBndEVxOlxyXG4gICAgICAgICAgICBzdHJpbmcgPSBcImdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0b1wiO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIGx0OlxyXG4gICAgICAgICAgICBzdHJpbmcgPSBcImxlc3MgdGhhblwiO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIGx0RXE6XHJcbiAgICAgICAgICAgIHN0cmluZyA9IFwibGVzcyB0aGFuIG9yIGVxdWFsIHRvXCI7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgaGFzUHJvcDpcclxuICAgICAgICAgICAgc3RyaW5nID0gXCJoYXMgdGhlIHByb3BlcnR5XCI7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBzdHJpbmcgPSBcIm5vdCBhIGRlZmluZWQgbWF0Y2hlclwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHJldHVybiBzdHJpbmc7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHNldE1pbihwYXJhbXMsIGtleXMpIHtcclxuICAgIGZvciAodmFyIHBhcmFtIGluIHBhcmFtcykge1xyXG4gICAgICAgIGlmICh0eXBlb2YgKGtleXMpICE9PSAndW5kZWZpbmVkJyAmJiBrZXlzLmluZGV4T2YocGFyYW0pICE9PSAtMSkge1xyXG4gICAgICAgICAgICBwYXJhbXNbcGFyYW1dLmN1cnJlbnQgPSBwYXJhbXNbcGFyYW1dLnZhbHVlIC0gcGFyYW1zW3BhcmFtXS5lcnJvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIChrZXlzKSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgcGFyYW1zW3BhcmFtXS5jdXJyZW50ID0gcGFyYW1zW3BhcmFtXS52YWx1ZSAtIHBhcmFtc1twYXJhbV0uZXJyb3I7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRNYXgocGFyYW1zLCBrZXlzKSB7XHJcbiAgICBmb3IgKHZhciBwYXJhbSBpbiBwYXJhbXMpIHtcclxuICAgICAgICBpZiAodHlwZW9mIChrZXlzKSAhPT0gJ3VuZGVmaW5lZCcgJiYga2V5cy5pbmRleE9mKHBhcmFtKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgcGFyYW1zW3BhcmFtXS5jdXJyZW50ID0gcGFyYW1zW3BhcmFtXS52YWx1ZSArIHBhcmFtc1twYXJhbV0uZXJyb3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiAoa2V5cykgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHBhcmFtc1twYXJhbV0uY3VycmVudCA9IHBhcmFtc1twYXJhbV0udmFsdWUgKyBwYXJhbXNbcGFyYW1dLmVycm9yO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gc2V0U3RhbmRhcmQocGFyYW1zLCBrZXlzKSB7XHJcbiAgICBmb3IgKHZhciBwYXJhbSBpbiBwYXJhbXMpIHtcclxuICAgICAgICBpZiAodHlwZW9mIChrZXlzKSAhPT0gJ3VuZGVmaW5lZCcgJiYga2V5cy5pbmRleE9mKHBhcmFtKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgcGFyYW1zW3BhcmFtXS5jdXJyZW50ID0gcGFyYW1zW3BhcmFtXS52YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIChrZXlzKSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgcGFyYW1zW3BhcmFtXS5jdXJyZW50ID0gcGFyYW1zW3BhcmFtXS52YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGRhdGFUb01hdHJpeChpdGVtcywgc3RkaXplZCA9IGZhbHNlKSB7XHJcbiAgICBsZXQgZGF0YSA9IFtdO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGxldCBpdGVtID0gaXRlbXNbaV07XHJcbiAgICAgICAgaWYgKHN0ZGl6ZWQpIHtcclxuICAgICAgICAgICAgaXRlbSA9IHN0YW5kYXJkaXplZChpdGVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaXRlbS5mb3JFYWNoKCh4LCBpaSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGRhdGFbaWldID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgZGF0YVtpaV0gPSBbMSwgeF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhW2lpXS5wdXNoKHgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZGF0YTtcclxufVxyXG4vKlxyXG4qIHJlbGF0aXZlIHRvIHRoZSBtZWFuLCBob3cgbWFueSBzdGFuZGFyZCBkZXZpYXRpb25zXHJcbiovXHJcbmV4cG9ydCBmdW5jdGlvbiBzdGFuZGFyZGl6ZWQoYXJyKSB7XHJcbiAgICBsZXQgc3RkID0galN0YXQuc3RkZXYoYXJyKTtcclxuICAgIGxldCBtZWFuID0galN0YXQubWVhbihhcnIpO1xyXG4gICAgbGV0IHN0YW5kYXJkaXplZCA9IGFyci5tYXAoKGQpID0+IHtcclxuICAgICAgICByZXR1cm4gKGQgLSBtZWFuKSAvIHN0ZDtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHN0YW5kYXJkaXplZDtcclxufVxyXG4vKlxyXG4qIGJldHdlZW4gMCBhbmQgMSB3aGVuIG1pbiBhbmQgbWF4IGFyZSBrbm93blxyXG4qL1xyXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKHgsIG1pbiwgbWF4KSB7XHJcbiAgICBsZXQgdmFsID0geCAtIG1pbjtcclxuICAgIHJldHVybiB2YWwgLyAobWF4IC0gbWluKTtcclxufVxyXG4vKlxyXG4qIGdpdmUgdGhlIHJlYWwgdW5pdCB2YWx1ZVxyXG4qL1xyXG5leHBvcnQgZnVuY3Rpb24gaW52Tm9ybSh4LCBtaW4sIG1heCkge1xyXG4gICAgcmV0dXJuICh4ICogbWF4IC0geCAqIG1pbikgKyBtaW47XHJcbn1cclxuLypcclxuKlxyXG4qL1xyXG5leHBvcnQgZnVuY3Rpb24gcmFuZFJhbmdlKG1pbiwgbWF4KSB7XHJcbiAgICByZXR1cm4gKG1heCAtIG1pbikgKiBNYXRoLnJhbmRvbSgpICsgbWluO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRSYW5nZShkYXRhLCBwcm9wKSB7XHJcbiAgICBsZXQgcmFuZ2UgPSB7XHJcbiAgICAgICAgbWluOiAxZTE1LFxyXG4gICAgICAgIG1heDogLTFlMTVcclxuICAgIH07XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAocmFuZ2UubWluID4gZGF0YVtpXVtwcm9wXSkge1xyXG4gICAgICAgICAgICByYW5nZS5taW4gPSBkYXRhW2ldW3Byb3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmFuZ2UubWF4IDwgZGF0YVtpXVtwcm9wXSkge1xyXG4gICAgICAgICAgICByYW5nZS5tYXggPSBkYXRhW2ldW3Byb3BdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByYW5nZTtcclxufVxyXG5leHBvcnQgY2xhc3MgTWF0Y2gge1xyXG4gICAgc3RhdGljIGd0KGEsIGIpIHtcclxuICAgICAgICBpZiAoYSA+IGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBnZShhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEgPj0gYikge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGx0KGEsIGIpIHtcclxuICAgICAgICBpZiAoYSA8IGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBsZShhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEgPD0gYikge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVBvcChudW1BZ2VudHMsIG9wdGlvbnMsIHR5cGUsIGJvdW5kYXJpZXMsIGN1cnJlbnRBZ2VudElkKSB7XHJcbiAgICB2YXIgcG9wID0gW107XHJcbiAgICB2YXIgbG9jcyA9IHtcclxuICAgICAgICB0eXBlOiAnRmVhdHVyZUNvbGxlY3Rpb24nLFxyXG4gICAgICAgIGZlYXR1cmVzOiBbXVxyXG4gICAgfTtcclxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IFtdO1xyXG4gICAgdHlwZSA9IHR5cGUgfHwgJ2NvbnRpbnVvdXMnO1xyXG4gICAgZm9yICh2YXIgYSA9IDA7IGEgPCBudW1BZ2VudHM7IGErKykge1xyXG4gICAgICAgIHBvcFthXSA9IHtcclxuICAgICAgICAgICAgaWQ6IGN1cnJlbnRBZ2VudElkLFxyXG4gICAgICAgICAgICB0eXBlOiB0eXBlXHJcbiAgICAgICAgfTtcclxuICAgICAgICAvL21vdmVtZW50IHBhcmFtc1xyXG4gICAgICAgIHBvcFthXS5tb3ZlUGVyRGF5ID0galN0YXQubm9ybWFsLmludihNYXRoLnJhbmRvbSgpLCAyNTAwICogMjQsIDEwMDApOyAvLyBtL2RheVxyXG4gICAgICAgIHBvcFthXS5wcmV2WCA9IDA7XHJcbiAgICAgICAgcG9wW2FdLnByZXZZID0gMDtcclxuICAgICAgICBwb3BbYV0ubW92ZWRUb3RhbCA9IDA7XHJcbiAgICAgICAgaWYgKHBvcFthXS50eXBlID09PSAnY29udGludW91cycpIHtcclxuICAgICAgICAgICAgcG9wW2FdLm1lc2ggPSBuZXcgVEhSRUUuTWVzaChuZXcgVEhSRUUuVGV0cmFoZWRyb25HZW9tZXRyeSgxLCAxKSwgbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtcclxuICAgICAgICAgICAgICAgIGNvbG9yOiAweDAwZmYwMFxyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgIHBvcFthXS5tZXNoLnFJZCA9IHBvcFthXS5pZDtcclxuICAgICAgICAgICAgcG9wW2FdLm1lc2gudHlwZSA9ICdhZ2VudCc7XHJcbiAgICAgICAgICAgIHBvcFthXS5wb3NpdGlvbiA9IHsgeDogMCwgeTogMCwgejogMCB9O1xyXG4gICAgICAgICAgICBwb3BbYV0ucG9zaXRpb24ueCA9IHJhbmRSYW5nZShib3VuZGFyaWVzLmxlZnQsIGJvdW5kYXJpZXMucmlnaHQpO1xyXG4gICAgICAgICAgICBwb3BbYV0ucG9zaXRpb24ueSA9IHJhbmRSYW5nZShib3VuZGFyaWVzLmJvdHRvbSwgYm91bmRhcmllcy50b3ApO1xyXG4gICAgICAgICAgICBwb3BbYV0ubWVzaC5wb3NpdGlvbi54ID0gcG9wW2FdLnBvc2l0aW9uLng7XHJcbiAgICAgICAgICAgIHBvcFthXS5tZXNoLnBvc2l0aW9uLnkgPSBwb3BbYV0ucG9zaXRpb24ueTtcclxuICAgICAgICAgICAgLy9zY2VuZS5hZGQocG9wW2FdLm1lc2gpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocG9wW2FdLnR5cGUgPT09ICdnZW9zcGF0aWFsJykge1xyXG4gICAgICAgICAgICBsb2NzLmZlYXR1cmVzW2FdID0gdHVyZi5wb2ludChbcmFuZFJhbmdlKC03NS4xNDY3LCAtNzUuMTg2NyksIHJhbmRSYW5nZSgzOS45MjAwLCAzOS45OTAwKV0pO1xyXG4gICAgICAgICAgICBwb3BbYV0ubG9jYXRpb24gPSBsb2NzLmZlYXR1cmVzW2FdO1xyXG4gICAgICAgICAgICBwb3BbYV0ubG9jYXRpb24ucHJvcGVydGllcy5hZ2VudFJlZklEID0gcG9wW2FdLmlkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBvcHRpb25zLmZvckVhY2goKGQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBkLmFzc2lnbiA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgcG9wW2FdW2QubmFtZV0gPSBkLmFzc2lnbihwb3BbYV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcG9wW2FdW2QubmFtZV0gPSBkLmFzc2lnbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGN1cnJlbnRBZ2VudElkKys7XHJcbiAgICB9XHJcbiAgICBmb3IgKHZhciByID0gMDsgciA8IDM7IHIrKykge1xyXG4gICAgICAgIHBvcFtyXS5zdGF0ZXMuaWxsbmVzcyA9ICdpbmZlY3Rpb3VzJztcclxuICAgICAgICBwb3Bbcl0uaW5mZWN0aW91cyA9IHRydWU7XHJcbiAgICAgICAgcG9wW3JdLnBhdGhvZ2VuTG9hZCA9IDRlNDtcclxuICAgIH1cclxuICAgIGZvciAobGV0IGEgPSAwOyBhIDwgcG9wLmxlbmd0aDsgYSsrKSB7XHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHBvcFthXS5zdGF0ZXMpIHtcclxuICAgICAgICAgICAgcG9wW2FdW3BvcFthXS5zdGF0ZXNba2V5XV0gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBbcG9wLCBsb2NzXTtcclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD11dGlscy5qcy5tYXAiLCJpbXBvcnQgeyBnZW5lcmF0ZVVVSUQgfSBmcm9tICcuL3V0aWxzJztcclxuLyoqXHJcbipRQ29tcG9uZW50cyBhcmUgdGhlIGJhc2UgY2xhc3MgZm9yIG1hbnkgbW9kZWwgY29tcG9uZW50cy5cclxuKi9cclxuZXhwb3J0IGNsYXNzIFFDb21wb25lbnQge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSkge1xyXG4gICAgICAgIHRoaXMuaWQgPSBnZW5lcmF0ZVVVSUQoKTtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMudGltZSA9IDA7XHJcbiAgICAgICAgdGhpcy5oaXN0b3J5ID0gW107XHJcbiAgICB9XHJcbiAgICAvKiogVGFrZSBvbmUgdGltZSBzdGVwIGZvcndhcmQgKG1vc3Qgc3ViY2xhc3NlcyBvdmVycmlkZSB0aGUgYmFzZSBtZXRob2QpXHJcbiAgICAqIEBwYXJhbSBzdGVwIHNpemUgb2YgdGltZSBzdGVwIChpbiBkYXlzIGJ5IGNvbnZlbnRpb24pXHJcbiAgICAqL1xyXG4gICAgdXBkYXRlKGFnZW50LCBzdGVwKSB7XHJcbiAgICAgICAgLy9zb21ldGhpbmcgc3VwZXIhXHJcbiAgICB9XHJcbn1cclxuUUNvbXBvbmVudC5TVUNDRVNTID0gMTtcclxuUUNvbXBvbmVudC5GQUlMRUQgPSAyO1xyXG5RQ29tcG9uZW50LlJVTk5JTkcgPSAzO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1RQ29tcG9uZW50LmpzLm1hcCIsImltcG9ydCB7IFFDb21wb25lbnQgfSBmcm9tICcuL1FDb21wb25lbnQnO1xyXG5pbXBvcnQgeyBnZXRNYXRjaGVyU3RyaW5nIH0gZnJvbSAnLi91dGlscyc7XHJcbi8qKlxyXG4qIEJlbGllZiBEZXNpcmUgSW50ZW50IGFnZW50cyBhcmUgc2ltcGxlIHBsYW5uaW5nIGFnZW50cyB3aXRoIG1vZHVsYXIgcGxhbnMgLyBkZWxpYmVyYXRpb24gcHJvY2Vzc2VzLlxyXG4qL1xyXG5leHBvcnQgY2xhc3MgQkRJQWdlbnQgZXh0ZW5kcyBRQ29tcG9uZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGdvYWxzID0gW10sIHBsYW5zID0ge30sIGRhdGEgPSBbXSwgcG9saWN5U2VsZWN0b3IgPSBCRElBZ2VudC5zdG9jaGFzdGljU2VsZWN0aW9uKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSk7XHJcbiAgICAgICAgdGhpcy5nb2FscyA9IGdvYWxzO1xyXG4gICAgICAgIHRoaXMucGxhbnMgPSBwbGFucztcclxuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xyXG4gICAgICAgIHRoaXMucG9saWN5U2VsZWN0b3IgPSBwb2xpY3lTZWxlY3RvcjtcclxuICAgICAgICB0aGlzLmJlbGllZkhpc3RvcnkgPSBbXTtcclxuICAgICAgICB0aGlzLnBsYW5IaXN0b3J5ID0gW107XHJcbiAgICB9XHJcbiAgICAvKiogVGFrZSBvbmUgdGltZSBzdGVwIGZvcndhcmQsIHRha2UgaW4gYmVsaWVmcywgZGVsaWJlcmF0ZSwgaW1wbGVtZW50IHBvbGljeVxyXG4gICAgKiBAcGFyYW0gc3RlcCBzaXplIG9mIHRpbWUgc3RlcCAoaW4gZGF5cyBieSBjb252ZW50aW9uKVxyXG4gICAgKi9cclxuICAgIHVwZGF0ZShhZ2VudCwgc3RlcCkge1xyXG4gICAgICAgIHZhciBwb2xpY3ksIGludGVudCwgZXZhbHVhdGlvbjtcclxuICAgICAgICBwb2xpY3kgPSB0aGlzLnBvbGljeVNlbGVjdG9yKHRoaXMucGxhbnMsIHRoaXMucGxhbkhpc3RvcnksIGFnZW50KTtcclxuICAgICAgICBpbnRlbnQgPSB0aGlzLnBsYW5zW3BvbGljeV07XHJcbiAgICAgICAgaW50ZW50KGFnZW50LCBzdGVwKTtcclxuICAgICAgICBldmFsdWF0aW9uID0gdGhpcy5ldmFsdWF0ZUdvYWxzKGFnZW50KTtcclxuICAgICAgICB0aGlzLnBsYW5IaXN0b3J5LnB1c2goeyB0aW1lOiB0aGlzLnRpbWUsIGlkOiBhZ2VudC5pZCwgaW50ZW50aW9uOiBwb2xpY3ksIGdvYWxzOiBldmFsdWF0aW9uLmFjaGlldmVtZW50cywgYmFycmllcnM6IGV2YWx1YXRpb24uYmFycmllcnMsIHI6IGV2YWx1YXRpb24uc3VjY2Vzc2VzIC8gdGhpcy5nb2Fscy5sZW5ndGggfSk7XHJcbiAgICB9XHJcbiAgICBldmFsdWF0ZUdvYWxzKGFnZW50KSB7XHJcbiAgICAgICAgbGV0IGFjaGlldmVtZW50cyA9IFtdLCBiYXJyaWVycyA9IFtdLCBzdWNjZXNzZXMgPSAwLCBjLCBtYXRjaGVyO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5nb2Fscy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjID0gdGhpcy5nb2Fsc1tpXS5jb25kaXRpb247XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYy5kYXRhID09PSAndW5kZWZpbmVkJyB8fCBjLmRhdGEgPT09IFwiYWdlbnRcIikge1xyXG4gICAgICAgICAgICAgICAgYy5kYXRhID0gYWdlbnQ7IC8vaWYgbm8gZGF0YXNvdXJjZSBpcyBzZXQsIHVzZSB0aGUgYWdlbnRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhY2hpZXZlbWVudHNbaV0gPSB0aGlzLmdvYWxzW2ldLnRlbXBvcmFsKGMuY2hlY2soYy5kYXRhW2Mua2V5XSwgYy52YWx1ZSkpO1xyXG4gICAgICAgICAgICBpZiAoYWNoaWV2ZW1lbnRzW2ldID09PSBCRElBZ2VudC5TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzZXMgKz0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG1hdGNoZXIgPSBnZXRNYXRjaGVyU3RyaW5nKGMuY2hlY2spO1xyXG4gICAgICAgICAgICAgICAgYmFycmllcnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGMubGFiZWwsXHJcbiAgICAgICAgICAgICAgICAgICAga2V5OiBjLmtleSxcclxuICAgICAgICAgICAgICAgICAgICBjaGVjazogbWF0Y2hlcixcclxuICAgICAgICAgICAgICAgICAgICBhY3R1YWw6IGMuZGF0YVtjLmtleV0sXHJcbiAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IGMudmFsdWVcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3Nlczogc3VjY2Vzc2VzLCBiYXJyaWVyczogYmFycmllcnMsIGFjaGlldmVtZW50czogYWNoaWV2ZW1lbnRzIH07XHJcbiAgICB9XHJcbiAgICAvL2dvb2QgZm9yIHRyYWluaW5nXHJcbiAgICBzdGF0aWMgc3RvY2hhc3RpY1NlbGVjdGlvbihwbGFucywgcGxhbkhpc3RvcnksIGFnZW50KSB7XHJcbiAgICAgICAgdmFyIHBvbGljeSwgc2NvcmUsIG1heCA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgcGxhbiBpbiBwbGFucykge1xyXG4gICAgICAgICAgICBzY29yZSA9IE1hdGgucmFuZG9tKCk7XHJcbiAgICAgICAgICAgIGlmIChzY29yZSA+PSBtYXgpIHtcclxuICAgICAgICAgICAgICAgIG1heCA9IHNjb3JlO1xyXG4gICAgICAgICAgICAgICAgcG9saWN5ID0gcGxhbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcG9saWN5O1xyXG4gICAgfVxyXG59XHJcbkJESUFnZW50LmxhenlQb2xpY3lTZWxlY3Rpb24gPSBmdW5jdGlvbiAocGxhbnMsIHBsYW5IaXN0b3J5LCBhZ2VudCkge1xyXG4gICAgdmFyIG9wdGlvbnMsIHNlbGVjdGlvbjtcclxuICAgIGlmICh0aGlzLnRpbWUgPiAwKSB7XHJcbiAgICAgICAgb3B0aW9ucyA9IE9iamVjdC5rZXlzKHBsYW5zKTtcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucy5zbGljZSgxLCBvcHRpb25zLmxlbmd0aCk7XHJcbiAgICAgICAgc2VsZWN0aW9uID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogb3B0aW9ucy5sZW5ndGgpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgb3B0aW9ucyA9IE9iamVjdC5rZXlzKHBsYW5zKTtcclxuICAgICAgICBzZWxlY3Rpb24gPSAwO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG9wdGlvbnNbc2VsZWN0aW9uXTtcclxufTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YmRpLmpzLm1hcCIsImltcG9ydCB7IFFDb21wb25lbnQgfSBmcm9tICcuL1FDb21wb25lbnQnO1xyXG5pbXBvcnQgeyBnZW5lcmF0ZVVVSUQgfSBmcm9tICcuL3V0aWxzJztcclxuLyoqXHJcbiogQmVoYXZpb3IgVHJlZVxyXG4qKi9cclxuZXhwb3J0IGNsYXNzIEJlaGF2aW9yVHJlZSBleHRlbmRzIFFDb21wb25lbnQge1xyXG4gICAgc3RhdGljIHRpY2sobm9kZSwgYWdlbnQpIHtcclxuICAgICAgICB2YXIgc3RhdGUgPSBub2RlLm9wZXJhdGUoYWdlbnQpO1xyXG4gICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH1cclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHJvb3QsIGRhdGEpIHtcclxuICAgICAgICBzdXBlcihuYW1lKTtcclxuICAgICAgICB0aGlzLnJvb3QgPSByb290O1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgdGhpcy5yZXN1bHRzID0gW107XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoYWdlbnQsIHN0ZXApIHtcclxuICAgICAgICB2YXIgc3RhdGU7XHJcbiAgICAgICAgYWdlbnQuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB3aGlsZSAoYWdlbnQuYWN0aXZlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHN0YXRlID0gQmVoYXZpb3JUcmVlLnRpY2sodGhpcy5yb290LCBhZ2VudCk7XHJcbiAgICAgICAgICAgIGFnZW50LnRpbWUgPSB0aGlzLnRpbWU7XHJcbiAgICAgICAgICAgIGFnZW50LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEJUTm9kZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lKSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IGdlbmVyYXRlVVVJRCgpO1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEJUQ29udHJvbE5vZGUgZXh0ZW5kcyBCVE5vZGUge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgY2hpbGRyZW4pIHtcclxuICAgICAgICBzdXBlcihuYW1lKTtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEJUUm9vdCBleHRlbmRzIEJUQ29udHJvbE5vZGUge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgY2hpbGRyZW4pIHtcclxuICAgICAgICBzdXBlcihuYW1lLCBjaGlsZHJlbik7XHJcbiAgICAgICAgdGhpcy50eXBlID0gXCJyb290XCI7XHJcbiAgICAgICAgdGhpcy5vcGVyYXRlID0gZnVuY3Rpb24gKGFnZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBzdGF0ZSA9IEJlaGF2aW9yVHJlZS50aWNrKHRoaXMuY2hpbGRyZW5bMF0sIGFnZW50KTtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEJUU2VsZWN0b3IgZXh0ZW5kcyBCVENvbnRyb2xOb2RlIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNoaWxkcmVuKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSwgY2hpbGRyZW4pO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IFwic2VsZWN0b3JcIjtcclxuICAgICAgICB0aGlzLm9wZXJhdGUgPSBmdW5jdGlvbiAoYWdlbnQpIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkU3RhdGU7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGNoaWxkIGluIHRoaXMuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkU3RhdGUgPSBCZWhhdmlvclRyZWUudGljayh0aGlzLmNoaWxkcmVuW2NoaWxkXSwgYWdlbnQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5SVU5OSU5HKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5SVU5OSU5HO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5TVUNDRVNTO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBCZWhhdmlvclRyZWUuRkFJTEVEO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEJUU2VxdWVuY2UgZXh0ZW5kcyBCVENvbnRyb2xOb2RlIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNoaWxkcmVuKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSwgY2hpbGRyZW4pO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IFwic2VxdWVuY2VcIjtcclxuICAgICAgICB0aGlzLm9wZXJhdGUgPSBmdW5jdGlvbiAoYWdlbnQpIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkU3RhdGU7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGNoaWxkIGluIHRoaXMuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkU3RhdGUgPSBCZWhhdmlvclRyZWUudGljayh0aGlzLmNoaWxkcmVuW2NoaWxkXSwgYWdlbnQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5SVU5OSU5HKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5SVU5OSU5HO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5GQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLkZBSUxFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLlNVQ0NFU1M7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgQlRQYXJhbGxlbCBleHRlbmRzIEJUQ29udHJvbE5vZGUge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgY2hpbGRyZW4sIHN1Y2Nlc3Nlcykge1xyXG4gICAgICAgIHN1cGVyKG5hbWUsIGNoaWxkcmVuKTtcclxuICAgICAgICB0aGlzLnR5cGUgPSBcInBhcmFsbGVsXCI7XHJcbiAgICAgICAgdGhpcy5zdWNjZXNzZXMgPSBzdWNjZXNzZXM7XHJcbiAgICAgICAgdGhpcy5vcGVyYXRlID0gZnVuY3Rpb24gKGFnZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBzdWNjZWVkZWQgPSBbXSwgZmFpbHVyZXMgPSBbXSwgY2hpbGRTdGF0ZSwgbWFqb3JpdHk7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGNoaWxkIGluIHRoaXMuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkU3RhdGUgPSBCZWhhdmlvclRyZWUudGljayh0aGlzLmNoaWxkcmVuW2NoaWxkXSwgYWdlbnQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VlZGVkLnB1c2goY2hpbGRTdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaGlsZFN0YXRlID09PSBCZWhhdmlvclRyZWUuRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmFpbHVyZXMucHVzaChjaGlsZFN0YXRlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5SVU5OSU5HKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5SVU5OSU5HO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzdWNjZWVkZWQubGVuZ3RoID49IHRoaXMuc3VjY2Vzc2VzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLlNVQ0NFU1M7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLkZBSUxFRDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEJUQ29uZGl0aW9uIGV4dGVuZHMgQlROb2RlIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNvbmRpdGlvbikge1xyXG4gICAgICAgIHN1cGVyKG5hbWUpO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IFwiY29uZGl0aW9uXCI7XHJcbiAgICAgICAgdGhpcy5jb25kaXRpb24gPSBjb25kaXRpb247XHJcbiAgICAgICAgdGhpcy5vcGVyYXRlID0gZnVuY3Rpb24gKGFnZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBzdGF0ZTtcclxuICAgICAgICAgICAgc3RhdGUgPSBjb25kaXRpb24uY2hlY2soYWdlbnRbY29uZGl0aW9uLmtleV0sIGNvbmRpdGlvbi52YWx1ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBCVEFjdGlvbiBleHRlbmRzIEJUTm9kZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBjb25kaXRpb24sIGFjdGlvbikge1xyXG4gICAgICAgIHN1cGVyKG5hbWUpO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IFwiYWN0aW9uXCI7XHJcbiAgICAgICAgdGhpcy5jb25kaXRpb24gPSBjb25kaXRpb247XHJcbiAgICAgICAgdGhpcy5hY3Rpb24gPSBhY3Rpb247XHJcbiAgICAgICAgdGhpcy5vcGVyYXRlID0gZnVuY3Rpb24gKGFnZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBzdGF0ZTtcclxuICAgICAgICAgICAgc3RhdGUgPSBjb25kaXRpb24uY2hlY2soYWdlbnRbY29uZGl0aW9uLmtleV0sIGNvbmRpdGlvbi52YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmIChzdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLlNVQ0NFU1MpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWN0aW9uKGFnZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1iZWhhdmlvclRyZWUuanMubWFwIiwiaW1wb3J0IHsgUUNvbXBvbmVudCB9IGZyb20gJy4vUUNvbXBvbmVudCc7XHJcbmV4cG9ydCBjbGFzcyBDb21wYXJ0bWVudE1vZGVsIGV4dGVuZHMgUUNvbXBvbmVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBkYXRhKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSk7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTsgLy9hbiBhcnJheSBvZiBQYXRjaGVzLiBFYWNoIHBhdGNoIGNvbnRhaW5zIGFuIGFycmF5IG9mIGNvbXBhcnRtZW50cyBpbiBvcGVyYXRpb25hbCBvcmRlclxyXG4gICAgICAgIHRoaXMudG90YWxQb3AgPSAwO1xyXG4gICAgICAgIHRoaXMuaGlzdG9yeSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGQgPSAwOyBkIDwgdGhpcy5kYXRhLmxlbmd0aDsgZCsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMudG90YWxQb3AgKz0gdGhpcy5kYXRhW2RdLnRvdGFsUG9wO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl90b2xlcmFuY2UgPSAxZS05OyAvL21vZGVsIGVyciB0b2xlcmFuY2VcclxuICAgIH1cclxuICAgIHVwZGF0ZShwYXRjaCwgc3RlcCkge1xyXG4gICAgICAgIGxldCB0ZW1wX3BvcCA9IFtdLCB0ZW1wX2QgPSBbXSwgbmV4dF9kID0gW10sIGx0ZSA9IFtdLCBlcnIgPSAxLCBuZXdTdGVwO1xyXG4gICAgICAgIGxldCBjb21wYXJ0bWVudHMgPSBwYXRjaC5jb21wYXJ0bWVudHM7XHJcbiAgICAgICAgZm9yIChsZXQgYyA9IDA7IGMgPCBjb21wYXJ0bWVudHMubGVuZ3RoOyBjKyspIHtcclxuICAgICAgICAgICAgY29tcGFydG1lbnRzW2NdLmRwb3AgPSBjb21wYXJ0bWVudHNbY10ub3BlcmF0aW9uKGNvbXBhcnRtZW50cywgc3RlcCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vZmlyc3Qgb3JkZXIgKEV1bGVyKVxyXG4gICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgY29tcGFydG1lbnRzLmxlbmd0aDsgYysrKSB7XHJcbiAgICAgICAgICAgIHRlbXBfcG9wW2NdID0gY29tcGFydG1lbnRzW2NdLnBvcDtcclxuICAgICAgICAgICAgdGVtcF9kW2NdID0gY29tcGFydG1lbnRzW2NdLmRwb3A7XHJcbiAgICAgICAgICAgIGNvbXBhcnRtZW50c1tjXS5wb3AgPSB0ZW1wX3BvcFtjXSArIHRlbXBfZFtjXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy9zZWNvbmQgb3JkZXIgKEhldW5zKVxyXG4gICAgICAgIHBhdGNoLnRvdGFsUG9wID0gMDtcclxuICAgICAgICBmb3IgKGxldCBjID0gMDsgYyA8IGNvbXBhcnRtZW50cy5sZW5ndGg7IGMrKykge1xyXG4gICAgICAgICAgICBuZXh0X2RbY10gPSBjb21wYXJ0bWVudHNbY10ub3BlcmF0aW9uKGNvbXBhcnRtZW50cywgc3RlcCk7XHJcbiAgICAgICAgICAgIGNvbXBhcnRtZW50c1tjXS5wb3AgPSB0ZW1wX3BvcFtjXSArICgwLjUgKiAodGVtcF9kW2NdICsgbmV4dF9kW2NdKSk7XHJcbiAgICAgICAgICAgIHBhdGNoLnRvdGFsUG9wICs9IGNvbXBhcnRtZW50c1tjXS5wb3A7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBDb21wYXJ0bWVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBwb3AsIG9wZXJhdGlvbikge1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy5wb3AgPSBwb3A7XHJcbiAgICAgICAgdGhpcy5vcGVyYXRpb24gPSBvcGVyYXRpb24gfHwgbnVsbDtcclxuICAgICAgICB0aGlzLmRwb3AgPSAwO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBQYXRjaCB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBjb21wYXJ0bWVudHMpIHtcclxuICAgICAgICB0aGlzLmlkID0gUGF0Y2gubmV3SWQoKTtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMuY29tcGFydG1lbnRzID0gY29tcGFydG1lbnRzO1xyXG4gICAgICAgIHRoaXMudG90YWxQb3AgPSAwO1xyXG4gICAgICAgIGZvciAodmFyIGMgPSAwOyBjIDwgdGhpcy5jb21wYXJ0bWVudHMubGVuZ3RoOyBjKyspIHtcclxuICAgICAgICAgICAgdGhpcy50b3RhbFBvcCArPSB0aGlzLmNvbXBhcnRtZW50c1tjXS5wb3A7XHJcbiAgICAgICAgICAgIHRoaXMuY29tcGFydG1lbnRzW2NdLmluaXRpYWxQb3AgPSB0aGlzLmNvbXBhcnRtZW50c1tjXS5wb3A7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc3RhdGljIG5ld0lkKCkge1xyXG4gICAgICAgIFBhdGNoLmNJZCsrO1xyXG4gICAgICAgIHJldHVybiBQYXRjaC5jSWQ7XHJcbiAgICB9XHJcbn1cclxuUGF0Y2guY0lkID0gMDtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29tcGFydG1lbnQuanMubWFwIiwiaW1wb3J0IHsgZ2VuZXJhdGVVVUlEIH0gZnJvbSAnLi91dGlscyc7XHJcbmV4cG9ydCBjbGFzcyBDb250YWN0UGF0Y2gge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgY2FwYWNpdHkpIHtcclxuICAgICAgICB0aGlzLmlkID0gZ2VuZXJhdGVVVUlEKCk7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgICB0aGlzLmNhcGFjaXR5ID0gY2FwYWNpdHk7XHJcbiAgICAgICAgdGhpcy5wb3AgPSAwO1xyXG4gICAgICAgIHRoaXMubWVtYmVycyA9IHt9O1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGRlZmF1bHRGcmVxRihhLCBiKSB7XHJcbiAgICAgICAgdmFyIHZhbCA9ICg1MCAtIE1hdGguYWJzKGEuYWdlIC0gYi5hZ2UpKSAvIDEwMDtcclxuICAgICAgICByZXR1cm4gdmFsO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGRlZmF1bHRDb250YWN0RihhLCB0aW1lKSB7XHJcbiAgICAgICAgdmFyIGMgPSAyICogTWF0aC5zaW4odGltZSkgKyBhO1xyXG4gICAgICAgIGlmIChjID49IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgYXNzaWduKGFnZW50LCBjb250YWN0VmFsdWVGdW5jKSB7XHJcbiAgICAgICAgdmFyIGNvbnRhY3RWYWx1ZTtcclxuICAgICAgICBjb250YWN0VmFsdWVGdW5jID0gY29udGFjdFZhbHVlRnVuYyB8fCBDb250YWN0UGF0Y2guZGVmYXVsdEZyZXFGO1xyXG4gICAgICAgIGlmICh0aGlzLnBvcCA8IHRoaXMuY2FwYWNpdHkpIHtcclxuICAgICAgICAgICAgdGhpcy5tZW1iZXJzW2FnZW50LmlkXSA9IHsgcHJvcGVydGllczogYWdlbnQgfTtcclxuICAgICAgICAgICAgZm9yIChsZXQgb3RoZXIgaW4gdGhpcy5tZW1iZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaWQgPSBwYXJzZUludChvdGhlcik7XHJcbiAgICAgICAgICAgICAgICBpZiAob3RoZXIgIT09IGFnZW50LmlkICYmICFpc05hTihpZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250YWN0VmFsdWUgPSBjb250YWN0VmFsdWVGdW5jKHRoaXMubWVtYmVyc1tpZF0ucHJvcGVydGllcywgYWdlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVtYmVyc1thZ2VudC5pZF1baWRdID0gY29udGFjdFZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVtYmVyc1tpZF1bYWdlbnQuaWRdID0gY29udGFjdFZhbHVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucG9wKys7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmlkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZW5jb3VudGVycyhhZ2VudCwgcHJlY29uZGl0aW9uLCBjb250YWN0RnVuYywgcmVzdWx0S2V5LCBzYXZlID0gZmFsc2UpIHtcclxuICAgICAgICBjb250YWN0RnVuYyA9IGNvbnRhY3RGdW5jIHx8IENvbnRhY3RQYXRjaC5kZWZhdWx0Q29udGFjdEY7XHJcbiAgICAgICAgbGV0IGNvbnRhY3RWYWw7XHJcbiAgICAgICAgZm9yICh2YXIgY29udGFjdCBpbiB0aGlzLm1lbWJlcnMpIHtcclxuICAgICAgICAgICAgaWYgKHByZWNvbmRpdGlvbi5rZXkgPT09ICdzdGF0ZXMnKSB7XHJcbiAgICAgICAgICAgICAgICBjb250YWN0VmFsID0gSlNPTi5zdHJpbmdpZnkodGhpcy5tZW1iZXJzW2NvbnRhY3RdLnByb3BlcnRpZXNbcHJlY29uZGl0aW9uLmtleV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29udGFjdFZhbCA9IHRoaXMubWVtYmVyc1tjb250YWN0XS5wcm9wZXJ0aWVzW3ByZWNvbmRpdGlvbi5rZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwcmVjb25kaXRpb24uY2hlY2sodGhpcy5tZW1iZXJzW2NvbnRhY3RdLnByb3BlcnRpZXNbcHJlY29uZGl0aW9uLmtleV0sIHByZWNvbmRpdGlvbi52YWx1ZSkgJiYgTnVtYmVyKGNvbnRhY3QpICE9PSBhZ2VudC5pZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9sZFZhbCA9IHRoaXMubWVtYmVyc1tjb250YWN0XS5wcm9wZXJ0aWVzW3Jlc3VsdEtleV07XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3VmFsID0gY29udGFjdEZ1bmModGhpcy5tZW1iZXJzW2NvbnRhY3RdLCBhZ2VudCk7XHJcbiAgICAgICAgICAgICAgICBpZiAob2xkVmFsICE9PSBuZXdWYWwgJiYgc2F2ZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVtYmVyc1tjb250YWN0XS5wcm9wZXJ0aWVzW3Jlc3VsdEtleV0gPSBuZXdWYWw7XHJcbiAgICAgICAgICAgICAgICAgICAgQ29udGFjdFBhdGNoLldJV0FycmF5LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRjaElEOiB0aGlzLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZmVjdGVkOiBjb250YWN0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZlY3RlZEFnZTogdGhpcy5tZW1iZXJzW2NvbnRhY3RdLnByb3BlcnRpZXMuYWdlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQ6IHRoaXMubWVtYmVyc1tjb250YWN0XS5wcm9wZXJ0aWVzW3Jlc3VsdEtleV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdEtleTogcmVzdWx0S2V5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBieTogYWdlbnQuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ5QWdlOiBhZ2VudC5hZ2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6IGFnZW50LnRpbWVcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5Db250YWN0UGF0Y2guV0lXQXJyYXkgPSBbXTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29udGFjdFBhdGNoLmpzLm1hcCIsImltcG9ydCB7IHNodWZmbGUgfSBmcm9tICcuL3V0aWxzJztcclxuLyoqXHJcbipFbnZpcm9ubWVudHMgYXJlIHRoZSBleGVjdXRhYmxlIGVudmlyb25tZW50IGNvbnRhaW5pbmcgdGhlIG1vZGVsIGNvbXBvbmVudHMsXHJcbipzaGFyZWQgcmVzb3VyY2VzLCBhbmQgc2NoZWR1bGVyLlxyXG4qL1xyXG5leHBvcnQgY2xhc3MgRW52aXJvbm1lbnQge1xyXG4gICAgY29uc3RydWN0b3IocmVzb3VyY2VzID0gW10sIGZhY2lsaXRpZXMgPSBbXSwgZXZlbnRzUXVldWUgPSBbXSwgYWN0aXZhdGlvblR5cGUgPSAncmFuZG9tJywgcmFuZEYgPSBNYXRoLnJhbmRvbSkge1xyXG4gICAgICAgIHRoaXMudGltZSA9IDA7XHJcbiAgICAgICAgdGhpcy50aW1lT2ZEYXkgPSAwO1xyXG4gICAgICAgIHRoaXMubW9kZWxzID0gW107XHJcbiAgICAgICAgdGhpcy5oaXN0b3J5ID0gW107XHJcbiAgICAgICAgdGhpcy5hZ2VudHMgPSBbXTtcclxuICAgICAgICB0aGlzLnJlc291cmNlcyA9IHJlc291cmNlcztcclxuICAgICAgICB0aGlzLmZhY2lsaXRpZXMgPSBmYWNpbGl0aWVzO1xyXG4gICAgICAgIHRoaXMuZXZlbnRzUXVldWUgPSBldmVudHNRdWV1ZTtcclxuICAgICAgICB0aGlzLmFjdGl2YXRpb25UeXBlID0gYWN0aXZhdGlvblR5cGU7XHJcbiAgICAgICAgdGhpcy5yYW5kRiA9IHJhbmRGO1xyXG4gICAgICAgIHRoaXMuX2FnZW50SW5kZXggPSB7fTtcclxuICAgIH1cclxuICAgIC8qKiBBZGQgYSBtb2RlbCBjb21wb25lbnRzIGZyb20gdGhlIGVudmlyb25tZW50XHJcbiAgICAqIEBwYXJhbSBjb21wb25lbnQgdGhlIG1vZGVsIGNvbXBvbmVudCBvYmplY3QgdG8gYmUgYWRkZWQgdG8gdGhlIGVudmlyb25tZW50LlxyXG4gICAgKi9cclxuICAgIGFkZChjb21wb25lbnQpIHtcclxuICAgICAgICB0aGlzLm1vZGVscy5wdXNoKGNvbXBvbmVudCk7XHJcbiAgICB9XHJcbiAgICAvKiogUmVtb3ZlIGEgbW9kZWwgY29tcG9uZW50cyBmcm9tIHRoZSBlbnZpcm9ubWVudCBieSBpZFxyXG4gICAgKiBAcGFyYW0gaWQgVVVJRCBvZiB0aGUgY29tcG9uZW50IHRvIGJlIHJlbW92ZWQuXHJcbiAgICAqL1xyXG4gICAgcmVtb3ZlKGlkKSB7XHJcbiAgICAgICAgdmFyIGRlbGV0ZUluZGV4LCBMID0gdGhpcy5hZ2VudHMubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMubW9kZWxzLmZvckVhY2goZnVuY3Rpb24gKGMsIGluZGV4KSB7IGlmIChjLmlkID09PSBpZCkge1xyXG4gICAgICAgICAgICBkZWxldGVJbmRleCA9IGluZGV4O1xyXG4gICAgICAgIH0gfSk7XHJcbiAgICAgICAgd2hpbGUgKEwgPiAwICYmIHRoaXMuYWdlbnRzLmxlbmd0aCA+PSAwKSB7XHJcbiAgICAgICAgICAgIEwtLTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYWdlbnRzW0xdLm1vZGVsSW5kZXggPT09IGRlbGV0ZUluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFnZW50cy5zcGxpY2UoTCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5tb2RlbHMuc3BsaWNlKGRlbGV0ZUluZGV4LCAxKTtcclxuICAgIH1cclxuICAgIC8qKiBSdW4gYWxsIGVudmlyb25tZW50IG1vZGVsIGNvbXBvbmVudHMgZnJvbSB0PTAgdW50aWwgdD11bnRpbCB1c2luZyB0aW1lIHN0ZXAgPSBzdGVwXHJcbiAgICAqIEBwYXJhbSBzdGVwIHRoZSBzdGVwIHNpemVcclxuICAgICogQHBhcmFtIHVudGlsIHRoZSBlbmQgdGltZVxyXG4gICAgKiBAcGFyYW0gc2F2ZUludGVydmFsIHNhdmUgZXZlcnkgJ3gnIHN0ZXBzXHJcbiAgICAqL1xyXG4gICAgcnVuKHN0ZXAsIHVudGlsLCBzYXZlSW50ZXJ2YWwpIHtcclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgICAgICB3aGlsZSAodGhpcy50aW1lIDw9IHVudGlsKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKHN0ZXApO1xyXG4gICAgICAgICAgICBsZXQgcmVtID0gKHRoaXMudGltZSAlIHNhdmVJbnRlcnZhbCk7XHJcbiAgICAgICAgICAgIGlmIChyZW0gPCBzdGVwKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY29weSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5hZ2VudHMpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGlzdG9yeSA9IHRoaXMuaGlzdG9yeS5jb25jYXQoY29weSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy50aW1lICs9IHN0ZXA7XHJcbiAgICAgICAgICAgIHRoaXMuZm9ybWF0VGltZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKiBBc3NpZ24gYWxsIGFnZW50cyB0byBhcHByb3ByaWF0ZSBtb2RlbHNcclxuICAgICovXHJcbiAgICBpbml0KCkge1xyXG4gICAgICAgIHRoaXMuX2FnZW50SW5kZXggPSB7fTtcclxuICAgICAgICBmb3IgKGxldCBjID0gMDsgYyA8IHRoaXMubW9kZWxzLmxlbmd0aDsgYysrKSB7XHJcbiAgICAgICAgICAgIGxldCBhbHJlYWR5SW4gPSBbXTtcclxuICAgICAgICAgICAgLy9hc3NpZ24gZWFjaCBhZ2VudCBtb2RlbCBpbmRleGVzIHRvIGhhbmRsZSBhZ2VudHMgYXNzaWduZWQgdG8gbXVsdGlwbGUgbW9kZWxzXHJcbiAgICAgICAgICAgIGZvciAobGV0IGQgPSAwOyBkIDwgdGhpcy5tb2RlbHNbY10uZGF0YS5sZW5ndGg7IGQrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGlkID0gdGhpcy5tb2RlbHNbY10uZGF0YVtkXS5pZDtcclxuICAgICAgICAgICAgICAgIGlmIChpZCBpbiB0aGlzLl9hZ2VudEluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy90aGlzIGFnZW50IGJlbG9uZ3MgdG8gbXVsdGlwbGUgbW9kZWxzLlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZWxzW2NdLmRhdGFbZF0ubW9kZWxzLnB1c2godGhpcy5tb2RlbHNbY10ubmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlbHNbY10uZGF0YVtkXS5tb2RlbEluZGV4ZXMucHVzaChjKTtcclxuICAgICAgICAgICAgICAgICAgICBhbHJlYWR5SW4ucHVzaChpZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvL3RoaXMgYWdlbnQgYmVsb25ncyB0byBvbmx5IG9uZSBtb2RlbCBzbyBmYXIuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWdlbnRJbmRleFtpZF0gPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZWxzW2NdLmRhdGFbZF0ubW9kZWxzID0gW3RoaXMubW9kZWxzW2NdLm5hbWVdO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZWxzW2NdLmRhdGFbZF0ubW9kZWxJbmRleGVzID0gW2NdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vZWxpbWluYXRlIGFueSBkdXBsaWNhdGUgYWdlbnRzIGJ5IGlkXHJcbiAgICAgICAgICAgIHRoaXMubW9kZWxzW2NdLmRhdGEgPSB0aGlzLm1vZGVsc1tjXS5kYXRhLmZpbHRlcigoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFscmVhZHlJbi5pbmRleE9mKGQuaWQpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy9jb25jYXQgdGhlIHJlc3VsdHNcclxuICAgICAgICAgICAgdGhpcy5hZ2VudHMgPSB0aGlzLmFnZW50cy5jb25jYXQodGhpcy5tb2RlbHNbY10uZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqIFVwZGF0ZSBlYWNoIG1vZGVsIGNvbXBlbmVudCBvbmUgdGltZSBzdGVwIGZvcndhcmRcclxuICAgICogQHBhcmFtIHN0ZXAgdGhlIHN0ZXAgc2l6ZVxyXG4gICAgKi9cclxuICAgIHVwZGF0ZShzdGVwKSB7XHJcbiAgICAgICAgdmFyIGluZGV4ID0gMDtcclxuICAgICAgICB3aGlsZSAoaW5kZXggPCB0aGlzLmV2ZW50c1F1ZXVlLmxlbmd0aCAmJiB0aGlzLmV2ZW50c1F1ZXVlW2luZGV4XS5hdCA8PSB0aGlzLnRpbWUpIHtcclxuICAgICAgICAgICAgdGhpcy5ldmVudHNRdWV1ZVtpbmRleF0udHJpZ2dlcigpO1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50c1F1ZXVlW2luZGV4XS50cmlnZ2VyZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5ldmVudHNRdWV1ZVtpbmRleF0udW50aWwgPD0gdGhpcy50aW1lKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV2ZW50c1F1ZXVlLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZhdGlvblR5cGUgPT09IFwicmFuZG9tXCIpIHtcclxuICAgICAgICAgICAgc2h1ZmZsZSh0aGlzLmFnZW50cywgdGhpcy5yYW5kRik7XHJcbiAgICAgICAgICAgIHRoaXMuYWdlbnRzLmZvckVhY2goKGFnZW50LCBpKSA9PiB7IHRoaXMuX2FnZW50SW5kZXhbYWdlbnQuaWRdID0gaTsgfSk7IC8vIHJlYXNzaWduIGFnZW50XHJcbiAgICAgICAgICAgIHRoaXMuYWdlbnRzLmZvckVhY2goKGFnZW50LCBpKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBhZ2VudC5tb2RlbEluZGV4ZXMuZm9yRWFjaCgobW9kZWxJbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZWxzW21vZGVsSW5kZXhdLnVwZGF0ZShhZ2VudCwgc3RlcCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGFnZW50LnRpbWUgPSBhZ2VudC50aW1lICsgc3RlcCB8fCAwO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZhdGlvblR5cGUgPT09IFwicGFyYWxsZWxcIikge1xyXG4gICAgICAgICAgICBsZXQgdGVtcEFnZW50cyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5hZ2VudHMpKTtcclxuICAgICAgICAgICAgdGVtcEFnZW50cy5mb3JFYWNoKChhZ2VudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgYWdlbnQubW9kZWxJbmRleGVzLmZvckVhY2goKG1vZGVsSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVsc1ttb2RlbEluZGV4XS51cGRhdGUoYWdlbnQsIHN0ZXApO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLmFnZW50cy5mb3JFYWNoKChhZ2VudCwgaSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgYWdlbnQubW9kZWxJbmRleGVzLmZvckVhY2goKG1vZGVsSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVsc1ttb2RlbEluZGV4XS5hcHBseShhZ2VudCwgdGVtcEFnZW50c1tpXSwgc3RlcCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGFnZW50LnRpbWUgPSBhZ2VudC50aW1lICsgc3RlcCB8fCAwO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKiogRm9ybWF0IGEgdGltZSBvZiBkYXkuIEN1cnJlbnQgdGltZSAlIDEuXHJcbiAgICAqXHJcbiAgICAqL1xyXG4gICAgZm9ybWF0VGltZSgpIHtcclxuICAgICAgICB0aGlzLnRpbWVPZkRheSA9IHRoaXMudGltZSAlIDE7XHJcbiAgICB9XHJcbiAgICAvKiogR2V0cyBhZ2VudCBieSBpZC4gQSB1dGlsaXR5IGZ1bmN0aW9uIHRoYXRcclxuICAgICpcclxuICAgICovXHJcbiAgICBnZXRBZ2VudEJ5SWQoaWQpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hZ2VudHNbdGhpcy5fYWdlbnRJbmRleFtpZF1dO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWVudmlyb25tZW50LmpzLm1hcCIsImV4cG9ydCBjbGFzcyBFcGkge1xyXG4gICAgc3RhdGljIHByZXZhbGVuY2UoY2FzZXMsIHRvdGFsKSB7XHJcbiAgICAgICAgdmFyIHByZXYgPSBjYXNlcyAvIHRvdGFsO1xyXG4gICAgICAgIHJldHVybiBwcmV2O1xyXG4gICAgfVxyXG4gICAgc3RhdGljIHJpc2tEaWZmZXJlbmNlKHRhYmxlKSB7XHJcbiAgICAgICAgdmFyIHJkID0gdGFibGUuYSAvICh0YWJsZS5hICsgdGFibGUuYikgLSB0YWJsZS5jIC8gKHRhYmxlLmMgKyB0YWJsZS5kKTtcclxuICAgICAgICByZXR1cm4gcmQ7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgcmlza1JhdGlvKHRhYmxlKSB7XHJcbiAgICAgICAgdmFyIHJyYXRpbyA9ICh0YWJsZS5hIC8gKHRhYmxlLmEgKyB0YWJsZS5iKSkgLyAodGFibGUuYyAvICh0YWJsZS5jICsgdGFibGUuZCkpO1xyXG4gICAgICAgIHJldHVybiBycmF0aW87XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgb2Rkc1JhdGlvKHRhYmxlKSB7XHJcbiAgICAgICAgdmFyIG9yID0gKHRhYmxlLmEgKiB0YWJsZS5kKSAvICh0YWJsZS5iICogdGFibGUuYyk7XHJcbiAgICAgICAgcmV0dXJuIG9yO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIElQRjJEKHJvd1RvdGFscywgY29sVG90YWxzLCBpdGVyYXRpb25zLCBzZWVkcykge1xyXG4gICAgICAgIHZhciByVCA9IDAsIGNUID0gMCwgc2VlZENlbGxzID0gc2VlZHM7XHJcbiAgICAgICAgcm93VG90YWxzLmZvckVhY2goZnVuY3Rpb24gKHIsIGkpIHtcclxuICAgICAgICAgICAgclQgKz0gcjtcclxuICAgICAgICAgICAgc2VlZENlbGxzW2ldID0gc2VlZENlbGxzW2ldIHx8IFtdO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbFRvdGFscy5mb3JFYWNoKGZ1bmN0aW9uIChjLCBqKSB7XHJcbiAgICAgICAgICAgIGNUICs9IGM7XHJcbiAgICAgICAgICAgIHNlZWRDZWxscy5mb3JFYWNoKGZ1bmN0aW9uIChyb3csIGspIHtcclxuICAgICAgICAgICAgICAgIHNlZWRDZWxsc1trXVtqXSA9IHNlZWRDZWxsc1trXVtqXSB8fCBNYXRoLnJvdW5kKHJvd1RvdGFsc1trXSAvIHJvd1RvdGFscy5sZW5ndGggKyAoY29sVG90YWxzW2pdIC8gY29sVG90YWxzLmxlbmd0aCkgLyAyICogTWF0aC5yYW5kb20oKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChyVCA9PT0gY1QpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaXRlciA9IDA7IGl0ZXIgPCBpdGVyYXRpb25zOyBpdGVyKyspIHtcclxuICAgICAgICAgICAgICAgIHNlZWRDZWxscy5mb3JFYWNoKGZ1bmN0aW9uIChyb3csIGlpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRSb3dUb3RhbCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgcm93LmZvckVhY2goZnVuY3Rpb24gKGNlbGwsIGopIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFJvd1RvdGFsICs9IGNlbGw7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcm93LmZvckVhY2goZnVuY3Rpb24gKGNlbGwsIGpqKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZWRDZWxsc1tpaV1bampdID0gY2VsbCAvIGN1cnJlbnRSb3dUb3RhbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VlZENlbGxzW2lpXVtqal0gKj0gcm93VG90YWxzW2lpXTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgY29sVG90YWxzLmxlbmd0aDsgY29sKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudENvbFRvdGFsID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBzZWVkQ2VsbHMuZm9yRWFjaChmdW5jdGlvbiAociwgaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50Q29sVG90YWwgKz0gcltjb2xdO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlZWRDZWxscy5mb3JFYWNoKGZ1bmN0aW9uIChyb3csIGtrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZWRDZWxsc1tra11bY29sXSA9IHJvd1tjb2xdIC8gY3VycmVudENvbFRvdGFsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWVkQ2VsbHNba2tdW2NvbF0gKj0gY29sVG90YWxzW2NvbF07XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHNlZWRDZWxscztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZXBpLmpzLm1hcCIsIi8qKiBFdmVudHMgY2xhc3MgaW5jbHVkZXMgbWV0aG9kcyBmb3Igb3JnYW5pemluZyBldmVudHMuXHJcbipcclxuKi9cclxuZXhwb3J0IGNsYXNzIEV2ZW50cyB7XHJcbiAgICBjb25zdHJ1Y3RvcihldmVudHMgPSBbXSkge1xyXG4gICAgICAgIHRoaXMucXVldWUgPSBbXTtcclxuICAgICAgICB0aGlzLnNjaGVkdWxlKGV2ZW50cyk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICogc2NoZWR1bGUgYW4gZXZlbnQgd2l0aCB0aGUgc2FtZSB0cmlnZ2VyIG11bHRpcGxlIHRpbWVzLlxyXG4gICAgKiBAcGFyYW0gcWV2ZW50IGlzIHRoZSBldmVudCB0byBiZSBzY2hlZHVsZWQuIFRoZSBhdCBwYXJhbWV0ZXIgc2hvdWxkIGNvbnRhaW4gdGhlIHRpbWUgYXQgZmlyc3QgaW5zdGFuY2UuXHJcbiAgICAqIEBwYXJhbSBldmVyeSBpbnRlcnZhbCBmb3IgZWFjaCBvY2N1cm5jZVxyXG4gICAgKiBAcGFyYW0gZW5kIHVudGlsXHJcbiAgICAqL1xyXG4gICAgc2NoZWR1bGVSZWN1cnJpbmcocWV2ZW50LCBldmVyeSwgZW5kKSB7XHJcbiAgICAgICAgdmFyIHJlY3VyID0gW107XHJcbiAgICAgICAgdmFyIGR1cmF0aW9uID0gZW5kIC0gcWV2ZW50LmF0O1xyXG4gICAgICAgIHZhciBvY2N1cmVuY2VzID0gTWF0aC5mbG9vcihkdXJhdGlvbiAvIGV2ZXJ5KTtcclxuICAgICAgICBpZiAoIXFldmVudC51bnRpbCkge1xyXG4gICAgICAgICAgICBxZXZlbnQudW50aWwgPSBxZXZlbnQuYXQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IG9jY3VyZW5jZXM7IGkrKykge1xyXG4gICAgICAgICAgICByZWN1ci5wdXNoKHsgbmFtZTogcWV2ZW50Lm5hbWUgKyBpLCBhdDogcWV2ZW50LmF0ICsgKGkgKiBldmVyeSksIHVudGlsOiBxZXZlbnQudW50aWwgKyAoaSAqIGV2ZXJ5KSwgdHJpZ2dlcjogcWV2ZW50LnRyaWdnZXIsIHRyaWdnZXJlZDogZmFsc2UgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2NoZWR1bGUocmVjdXIpO1xyXG4gICAgfVxyXG4gICAgLypcclxuICAgICogc2NoZWR1bGUgYSBvbmUgdGltZSBldmVudHMuIHRoaXMgYXJyYW5nZXMgdGhlIGV2ZW50IHF1ZXVlIGluIGNocm9ub2xvZ2ljYWwgb3JkZXIuXHJcbiAgICAqIEBwYXJhbSBxZXZlbnRzIGFuIGFycmF5IG9mIGV2ZW50cyB0byBiZSBzY2hlZHVsZXMuXHJcbiAgICAqL1xyXG4gICAgc2NoZWR1bGUocWV2ZW50cykge1xyXG4gICAgICAgIHFldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICBkLnVudGlsID0gZC51bnRpbCB8fCBkLmF0O1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMucXVldWUgPSB0aGlzLnF1ZXVlLmNvbmNhdChxZXZlbnRzKTtcclxuICAgICAgICB0aGlzLnF1ZXVlID0gdGhpcy5vcmdhbml6ZSh0aGlzLnF1ZXVlLCAwLCB0aGlzLnF1ZXVlLmxlbmd0aCk7XHJcbiAgICB9XHJcbiAgICBwYXJ0aXRpb24oYXJyYXksIGxlZnQsIHJpZ2h0KSB7XHJcbiAgICAgICAgdmFyIGNtcCA9IGFycmF5W3JpZ2h0IC0gMV0uYXQsIG1pbkVuZCA9IGxlZnQsIG1heEVuZDtcclxuICAgICAgICBmb3IgKG1heEVuZCA9IGxlZnQ7IG1heEVuZCA8IHJpZ2h0IC0gMTsgbWF4RW5kICs9IDEpIHtcclxuICAgICAgICAgICAgaWYgKGFycmF5W21heEVuZF0uYXQgPD0gY21wKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN3YXAoYXJyYXksIG1heEVuZCwgbWluRW5kKTtcclxuICAgICAgICAgICAgICAgIG1pbkVuZCArPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc3dhcChhcnJheSwgbWluRW5kLCByaWdodCAtIDEpO1xyXG4gICAgICAgIHJldHVybiBtaW5FbmQ7XHJcbiAgICB9XHJcbiAgICBzd2FwKGFycmF5LCBpLCBqKSB7XHJcbiAgICAgICAgdmFyIHRlbXAgPSBhcnJheVtpXTtcclxuICAgICAgICBhcnJheVtpXSA9IGFycmF5W2pdO1xyXG4gICAgICAgIGFycmF5W2pdID0gdGVtcDtcclxuICAgICAgICByZXR1cm4gYXJyYXk7XHJcbiAgICB9XHJcbiAgICBvcmdhbml6ZShldmVudHMsIGxlZnQsIHJpZ2h0KSB7XHJcbiAgICAgICAgaWYgKGxlZnQgPCByaWdodCkge1xyXG4gICAgICAgICAgICB2YXIgcCA9IHRoaXMucGFydGl0aW9uKGV2ZW50cywgbGVmdCwgcmlnaHQpO1xyXG4gICAgICAgICAgICB0aGlzLm9yZ2FuaXplKGV2ZW50cywgbGVmdCwgcCk7XHJcbiAgICAgICAgICAgIHRoaXMub3JnYW5pemUoZXZlbnRzLCBwICsgMSwgcmlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZXZlbnRzO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWV2ZW50cy5qcy5tYXAiLCJpbXBvcnQgeyBRQ29tcG9uZW50IH0gZnJvbSAnLi9RQ29tcG9uZW50JztcclxuZXhwb3J0IGNsYXNzIFN0YXRlTWFjaGluZSBleHRlbmRzIFFDb21wb25lbnQge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgc3RhdGVzLCB0cmFuc2l0aW9ucywgY29uZGl0aW9ucywgZGF0YSkge1xyXG4gICAgICAgIHN1cGVyKG5hbWUpO1xyXG4gICAgICAgIHRoaXMuc3RhdGVzID0gc3RhdGVzO1xyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbnMgPSB0aGlzLmNoZWNrVHJhbnNpdGlvbnModHJhbnNpdGlvbnMpO1xyXG4gICAgICAgIHRoaXMuY29uZGl0aW9ucyA9IGNvbmRpdGlvbnM7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgIH1cclxuICAgIHVwZGF0ZShhZ2VudCwgc3RlcCkge1xyXG4gICAgICAgIGZvciAodmFyIHMgaW4gYWdlbnQuc3RhdGVzKSB7XHJcbiAgICAgICAgICAgIGxldCBzdGF0ZSA9IGFnZW50LnN0YXRlc1tzXTtcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZXNbc3RhdGVdKGFnZW50LCBzdGVwKTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnRyYW5zaXRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMudHJhbnNpdGlvbnNbaV0uZnJvbS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0cmFucyA9IHRoaXMudHJhbnNpdGlvbnNbaV0uZnJvbVtqXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnMgPT09IHN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjb25kID0gdGhpcy5jb25kaXRpb25zW3RoaXMudHJhbnNpdGlvbnNbaV0ubmFtZV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB2YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAoY29uZC52YWx1ZSkgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gY29uZC52YWx1ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBjb25kLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCByID0gY29uZC5jaGVjayhhZ2VudFtjb25kLmtleV0sIHZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHIgPT09IFN0YXRlTWFjaGluZS5TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZ2VudC5zdGF0ZXNbc10gPSB0aGlzLnRyYW5zaXRpb25zW2ldLnRvO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWdlbnRbdGhpcy50cmFuc2l0aW9uc1tpXS50b10gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWdlbnRbdGhpcy50cmFuc2l0aW9uc1tpXS5mcm9tXSA9IGZhbHNlOyAvL2ZvciBlYXNpZXIgcmVwb3J0aW5nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjaGVja1RyYW5zaXRpb25zKHRyYW5zaXRpb25zKSB7XHJcbiAgICAgICAgZm9yICh2YXIgdCA9IDA7IHQgPCB0cmFuc2l0aW9ucy5sZW5ndGg7IHQrKykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHRyYW5zaXRpb25zW3RdLmZyb20gPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uc1t0XS5mcm9tID0gW3RyYW5zaXRpb25zW3RdLmZyb21dO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy87XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRyYW5zaXRpb25zO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXN0YXRlTWFjaGluZS5qcy5tYXAiLCJpbXBvcnQgeyBnZW5lcmF0ZVVVSUQgfSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IHsgUGF0Y2gsIENvbXBhcnRtZW50TW9kZWwgfSBmcm9tICcuL2NvbXBhcnRtZW50JztcclxuaW1wb3J0IHsgRW52aXJvbm1lbnQgfSBmcm9tICcuL2Vudmlyb25tZW50JztcclxuaW1wb3J0IHsgU3RhdGVNYWNoaW5lIH0gZnJvbSAnLi9zdGF0ZU1hY2hpbmUnO1xyXG5pbXBvcnQgeyBnZW5lcmF0ZVBvcCB9IGZyb20gJy4vdXRpbHMnO1xyXG4vKipcclxuKkJhdGNoIHJ1biBlbnZpcm9ubWVudHNcclxuKi9cclxuZXhwb3J0IGNsYXNzIEV4cGVyaW1lbnQge1xyXG4gICAgY29uc3RydWN0b3IoZW52aXJvbm1lbnQsIHNldHVwLCB0YXJnZXQpIHtcclxuICAgICAgICB0aGlzLmVudmlyb25tZW50ID0gZW52aXJvbm1lbnQ7XHJcbiAgICAgICAgdGhpcy5zZXR1cCA9IHNldHVwO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gc2V0dXAudGFyZ2V0O1xyXG4gICAgICAgIHRoaXMuZXhwZXJpbWVudExvZyA9IFtdO1xyXG4gICAgfVxyXG4gICAgc3RhcnQocnVucywgc3RlcCwgdW50aWwpIHtcclxuICAgICAgICB2YXIgciA9IDA7XHJcbiAgICAgICAgd2hpbGUgKHIgPCBydW5zKSB7XHJcbiAgICAgICAgICAgIHRoaXMucHJlcChyLCB0aGlzLnNldHVwKTtcclxuICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC50aW1lID0gMDsgLy9cclxuICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC5ydW4oc3RlcCwgdW50aWwsIDApO1xyXG4gICAgICAgICAgICB0aGlzLmV4cGVyaW1lbnRMb2dbcl0gPSB0aGlzLnJlcG9ydChyLCB0aGlzLnNldHVwKTtcclxuICAgICAgICAgICAgcisrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHByZXAociwgY2ZnLCBhZ2VudHMsIHZpc3VhbGl6ZSkge1xyXG4gICAgICAgIGxldCBncm91cHMgPSB7fTtcclxuICAgICAgICBsZXQgY3VycmVudEFnZW50SWQgPSAwO1xyXG4gICAgICAgIHRoaXMuZW52aXJvbm1lbnQgPSBuZXcgRW52aXJvbm1lbnQoKTtcclxuICAgICAgICBpZiAodHlwZW9mIGNmZy5hZ2VudHMgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIGNmZy5hZ2VudHMuZm9yRWFjaCgoZ3JvdXApID0+IHtcclxuICAgICAgICAgICAgICAgIGdyb3Vwc1tncm91cC5uYW1lXSA9IGdlbmVyYXRlUG9wKGdyb3VwLmNvdW50LCBncm91cC5wYXJhbXMsIGNmZy5lbnZpcm9ubWVudC5zcGF0aWFsVHlwZSwgZ3JvdXAuYm91bmRhcmllcywgY3VycmVudEFnZW50SWQpO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEFnZW50SWQgPSBncm91cHNbZ3JvdXAubmFtZV1bZ3JvdXBzW2dyb3VwLm5hbWVdLmxlbmd0aCAtIDFdLmlkO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2ZnLmNvbXBvbmVudHMuZm9yRWFjaCgoY21wKSA9PiB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoY21wLnR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3N0YXRlLW1hY2hpbmUnOlxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzbSA9IG5ldyBTdGF0ZU1hY2hpbmUoY21wLm5hbWUsIGNtcC5zdGF0ZXMsIGNtcC50cmFuc2l0aW9ucywgY21wLmNvbmRpdGlvbnMsIGdyb3Vwc1tjbXAuYWdlbnRzXVswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC5hZGQoc20pO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnY29tcGFydG1lbnRhbCc6XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGNoZXMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBjZmcucGF0Y2hlcy5mb3JFYWNoKChwYXRjaCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY21wLnBhdGNoZXMuaW5kZXhPZihwYXRjaC5uYW1lKSAhPSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0Y2hlcy5wdXNoKG5ldyBQYXRjaChwYXRjaC5uYW1lLCBjbXAuY29tcGFydG1lbnRzKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY01vZGVsID0gbmV3IENvbXBhcnRtZW50TW9kZWwoJ2NtcC5uYW1lJywgcGF0Y2hlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC5hZGQoY01vZGVsKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2V2ZXJ5LXN0ZXAnOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW52aXJvbm1lbnQuYWRkKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGdlbmVyYXRlVVVJRCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjbXAubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlOiBjbXAuYWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBncm91cHNbY21wLmFnZW50c11bMF1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBzd2l0Y2ggKGNmZy5leHBlcmltZW50KSB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBpZiAociA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmlzdWFsaXplKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvL2FnZW50cyA9IHRoaXMuZW52aXJvbm1lbnQuYWdlbnRzO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW52aXJvbm1lbnQucnVuKGNmZy5lbnZpcm9ubWVudC5zdGVwLCBjZmcuZW52aXJvbm1lbnQudW50aWwsIDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmVwb3J0KHIsIGNmZykge1xyXG4gICAgICAgIGxldCBzdW1zID0ge307XHJcbiAgICAgICAgbGV0IG1lYW5zID0ge307XHJcbiAgICAgICAgbGV0IGZyZXFzID0ge307XHJcbiAgICAgICAgbGV0IG1vZGVsID0ge307XHJcbiAgICAgICAgbGV0IGNvdW50ID0gdGhpcy5lbnZpcm9ubWVudC5hZ2VudHMubGVuZ3RoO1xyXG4gICAgICAgIC8vY2ZnLnJlcG9ydC5zdW0gPSBjZmcucmVwb3J0LnN1bS5jb25jYXQoY2ZnLnJlcG9ydC5tZWFuKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZW52aXJvbm1lbnQuYWdlbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBkID0gdGhpcy5lbnZpcm9ubWVudC5hZ2VudHNbaV07XHJcbiAgICAgICAgICAgIGNmZy5yZXBvcnQuc3Vtcy5mb3JFYWNoKChzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzdW1zW3NdID0gc3Vtc1tzXSA9PSB1bmRlZmluZWQgPyBkW3NdIDogZFtzXSArIHN1bXNbc107XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjZmcucmVwb3J0LmZyZXFzLmZvckVhY2goKGYpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICghaXNOYU4oZFtmXSkgJiYgdHlwZW9mIGRbZl0gIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBmcmVxc1tmXSA9IGZyZXFzW2ZdID09IHVuZGVmaW5lZCA/IGRbZl0gOiBkW2ZdICsgZnJlcXNbZl07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoJ2NvbXBhcnRtZW50cycgaW4gZCkge1xyXG4gICAgICAgICAgICAgICAgY2ZnLnJlcG9ydC5jb21wYXJ0bWVudHMuZm9yRWFjaCgoY20pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBkLmNvbXBhcnRtZW50cy5mb3JFYWNoKChwY20pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBjbS5uYW1lID09PSBjbSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWxbY21dID0gbW9kZWxbY21dID09IHVuZGVmaW5lZCA/IHBjbS5wb3AgOiBwY20ucG9wICsgbW9kZWxbY21dO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICA7XHJcbiAgICAgICAgY2ZnLnJlcG9ydC5tZWFucy5mb3JFYWNoKChtKSA9PiB7XHJcbiAgICAgICAgICAgIG1lYW5zW21dID0gc3Vtc1ttXSAvIGNvdW50O1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGNvdW50OiBjb3VudCxcclxuICAgICAgICAgICAgc3Vtczogc3VtcyxcclxuICAgICAgICAgICAgbWVhbnM6IG1lYW5zLFxyXG4gICAgICAgICAgICBmcmVxczogZnJlcXMsXHJcbiAgICAgICAgICAgIG1vZGVsOiBtb2RlbFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICAvL29uIGVhY2ggcnVuLCBjaGFuZ2Ugb25lIHBhcmFtLCBob2xkIG90aGVycyBjb25zdGFudFxyXG4gICAgc3dlZXAocGFyYW1zLCBydW5zUGVyLCBiYXNlbGluZSA9IHRydWUpIHtcclxuICAgICAgICB2YXIgZXhwUGxhbiA9IFtdO1xyXG4gICAgICAgIGlmIChiYXNlbGluZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBwYXJhbXMuYmFzZWxpbmUgPSBbdHJ1ZV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAodmFyIHByb3AgaW4gcGFyYW1zKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyYW1zW3Byb3BdLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IHJ1bnNQZXI7IGsrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGV4cFBsYW4ucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtOiBwcm9wLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcGFyYW1zW3Byb3BdW2ldLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBydW46IGtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBsYW5zID0gZXhwUGxhbjtcclxuICAgIH1cclxuICAgIGJvb3QocGFyYW1zKSB7XHJcbiAgICAgICAgbGV0IHJ1bnM7XHJcbiAgICAgICAgZm9yIChsZXQgcGFyYW0gaW4gcGFyYW1zKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcnVucyA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIHJ1bnMgPSBwYXJhbXNbcGFyYW1dLmxlbmd0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocGFyYW1zW3BhcmFtXS5sZW5ndGggIT09IHJ1bnMpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IFwibGVuZ3RoIG9mIHBhcmFtZXRlciBhcnJheXMgZGlkIG5vdCBtYXRjaFwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucGxhbnMgPSBwYXJhbXM7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZXhwZXJpbWVudC5qcy5tYXAiLCJpbXBvcnQgeyByYW5kUmFuZ2UsIG5vcm1hbGl6ZSB9IGZyb20gJy4vdXRpbHMnO1xyXG5leHBvcnQgY2xhc3MgR2VuZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihyYW5nZSwgZGlzY3JldGUpIHtcclxuICAgICAgICBsZXQgdmFsID0gcmFuZFJhbmdlKHJhbmdlWzBdLCByYW5nZVsxXSk7XHJcbiAgICAgICAgaWYgKCFkaXNjcmV0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmNvZGUgPSBub3JtYWxpemUodmFsLCByYW5nZVswXSwgcmFuZ2VbMV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5jb2RlID0gTWF0aC5mbG9vcih2YWwpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgQ2hyb21hc29tZSB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmdlbmVzID0gW107XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEdlbmV0aWMge1xyXG4gICAgY29uc3RydWN0b3Ioc2l6ZSwgcmFuZ2VzLCB0YXJnZXQsIGNvc3QsIGRpc2NyZXRlID0gZmFsc2UsIGdyYWRpZW50ID0gdHJ1ZSkge1xyXG4gICAgICAgIHRoaXMucmFuZ2VzID0gcmFuZ2VzO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xyXG4gICAgICAgIHRoaXMuZGlzY3JldGUgPSBkaXNjcmV0ZTtcclxuICAgICAgICB0aGlzLmNvc3QgPSBjb3N0O1xyXG4gICAgICAgIHRoaXMuc2l6ZSA9IHNpemU7XHJcbiAgICAgICAgdGhpcy5ncmFkaWVudCA9IGdyYWRpZW50O1xyXG4gICAgICAgIHRoaXMucG9wdWxhdGlvbiA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zaXplOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGNocm9tYSA9IG5ldyBDaHJvbWFzb21lKCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgcmFuZ2VzLmxlbmd0aDsgaysrKSB7XHJcbiAgICAgICAgICAgICAgICBjaHJvbWEuZ2VuZXMucHVzaChuZXcgR2VuZSh0aGlzLnJhbmdlc1trXSwgdGhpcy5kaXNjcmV0ZSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGlvbi5wdXNoKGNocm9tYSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcnVuKGdlbmVyYXRpb25zLCBtYXRpbmcgPSBmYWxzZSkge1xyXG4gICAgICAgIHRoaXMubXV0YXRlUmF0ZSA9IDAuMDE7XHJcbiAgICAgICAgdGhpcy5tYXRpbmcgPSBtYXRpbmc7XHJcbiAgICAgICAgd2hpbGUgKGdlbmVyYXRpb25zLS0pIHtcclxuICAgICAgICAgICAgdGhpcy5nZW5lcmF0aW9uKCk7XHJcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGlvbi5zb3J0KHRoaXMuYXNjU29ydCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLnBvcHVsYXRpb247XHJcbiAgICB9XHJcbiAgICBkc2NTb3J0KGEsIGIpIHtcclxuICAgICAgICBpZiAoYS5zY29yZSA+IGIuc2NvcmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChhLnNjb3JlIDwgYi5zY29yZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICBhc2NTb3J0KGEsIGIpIHtcclxuICAgICAgICBpZiAoYS5zY29yZSA+IGIuc2NvcmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGEuc2NvcmUgPCBiLnNjb3JlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICBnZW5lcmF0aW9uKCkge1xyXG4gICAgICAgIGlmICh0aGlzLm1hdGluZykge1xyXG4gICAgICAgICAgICBsZXQgdG9wT25lUGVyY2VudCA9IE1hdGgucm91bmQoMC4wMSAqIHRoaXMuc2l6ZSkgKyAyOyAvL3RlbiBwZXJjZW50IG9mIG9yaWdpbmFsIHNpemUgKyAyXHJcbiAgICAgICAgICAgIGxldCBjaGlsZHJlbiA9IHRoaXMubWF0ZSh0b3BPbmVQZXJjZW50KTtcclxuICAgICAgICAgICAgdGhpcy5wb3B1bGF0aW9uID0gdGhpcy5wb3B1bGF0aW9uLmNvbmNhdChjaGlsZHJlbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wb3B1bGF0aW9uLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMubXV0YXRlKHRoaXMucG9wdWxhdGlvbltpXSwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5wb3B1bGF0aW9uLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGlvbltqXS5zY29yZSA9IHRoaXMuY29zdCh0aGlzLnBvcHVsYXRpb25bal0sIHRoaXMudGFyZ2V0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBtYXRlKHBhcmVudHMpIHtcclxuICAgICAgICBsZXQgbnVtQ2hpbGRyZW4gPSAwLjUgKiB0aGlzLnJhbmdlcy5sZW5ndGggKiB0aGlzLnJhbmdlcy5sZW5ndGg7XHJcbiAgICAgICAgbGV0IGNoaWxkcmVuID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1DaGlsZHJlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjaGlsZCA9IG5ldyBDaHJvbWFzb21lKCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5yYW5nZXMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBnZW5lID0gbmV3IEdlbmUoW3RoaXMucmFuZ2VzW2pdWzBdLCB0aGlzLnJhbmdlc1tqXVsxXV0sIHRoaXMuZGlzY3JldGUpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHJhbmQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwYXJlbnRzKTtcclxuICAgICAgICAgICAgICAgIGxldCBleHByZXNzZWQgPSB0aGlzLnBvcHVsYXRpb25bcmFuZF0uZ2VuZXMuc2xpY2UoaiwgaiArIDEpO1xyXG4gICAgICAgICAgICAgICAgZ2VuZS5jb2RlID0gZXhwcmVzc2VkWzBdLmNvZGU7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5nZW5lcy5wdXNoKGdlbmUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNoaWxkcmVuLnB1c2goY2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2hpbGRyZW47XHJcbiAgICB9XHJcbiAgICBtdXRhdGUoY2hyb21hLCBjaGFuY2UpIHtcclxuICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA+IGNoYW5jZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBiZXN0ID0gdGhpcy5wb3B1bGF0aW9uWzBdLmdlbmVzO1xyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgY2hyb21hLmdlbmVzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGxldCBnZW5lID0gY2hyb21hLmdlbmVzW2pdO1xyXG4gICAgICAgICAgICBsZXQgZGlmZjtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZ3JhZGllbnQpIHtcclxuICAgICAgICAgICAgICAgIGRpZmYgPSBiZXN0W2pdLmNvZGUgLSBnZW5lLmNvZGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkaWZmID0gcmFuZFJhbmdlKC0xLCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgdXBPckRvd24gPSBkaWZmID4gMCA/IDEgOiAtMTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmRpc2NyZXRlKSB7XHJcbiAgICAgICAgICAgICAgICBnZW5lLmNvZGUgKz0gdXBPckRvd24gKiB0aGlzLm11dGF0ZVJhdGUgKiBNYXRoLnJhbmRvbSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZ2VuZS5jb2RlICs9IHVwT3JEb3duO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGdlbmUuY29kZSA9IE1hdGgubWluKE1hdGgubWF4KDAsIGdlbmUuY29kZSksIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1nZW5ldGljLmpzLm1hcCIsImltcG9ydCB7IEV4cGVyaW1lbnQgfSBmcm9tICcuL2V4cGVyaW1lbnQnO1xyXG5pbXBvcnQgeyBDaHJvbWFzb21lLCBHZW5lIH0gZnJvbSAnLi9nZW5ldGljJztcclxuaW1wb3J0IHsgaW52Tm9ybSwgcmFuZFJhbmdlIH0gZnJvbSAnLi91dGlscyc7XHJcbmV4cG9ydCBjbGFzcyBFdm9sdXRpb25hcnkgZXh0ZW5kcyBFeHBlcmltZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKGVudmlyb25tZW50LCBzZXR1cCwgZGlzY3JldGUgPSBmYWxzZSwgZ3JhZGllbnQgPSB0cnVlLCBtYXRpbmcgPSB0cnVlKSB7XHJcbiAgICAgICAgc3VwZXIoZW52aXJvbm1lbnQsIHNldHVwKTtcclxuICAgICAgICB0aGlzLnRhcmdldCA9IHNldHVwLmV2b2x1dGlvbi50YXJnZXQ7XHJcbiAgICAgICAgdGhpcy5yYW5nZXMgPSBzZXR1cC5ldm9sdXRpb24ucGFyYW1zO1xyXG4gICAgICAgIHRoaXMuc2l6ZSA9IHNldHVwLmV4cGVyaW1lbnQuc2l6ZTtcclxuICAgICAgICB0aGlzLm1hdGluZyA9IG1hdGluZztcclxuICAgICAgICBpZiAodGhpcy5zaXplIDwgMikge1xyXG4gICAgICAgICAgICB0aGlzLm1hdGluZyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmRpc2NyZXRlID0gZGlzY3JldGU7XHJcbiAgICAgICAgdGhpcy5ncmFkaWVudCA9IGdyYWRpZW50O1xyXG4gICAgICAgIHRoaXMucG9wdWxhdGlvbiA9IFtdO1xyXG4gICAgICAgIHRoaXMubXV0YXRlUmF0ZSA9IDAuMDM7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNpemU7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgY2hyb21hID0gbmV3IENocm9tYXNvbWUoKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCB0aGlzLnJhbmdlcy5sZW5ndGg7IGsrKykge1xyXG4gICAgICAgICAgICAgICAgY2hyb21hLmdlbmVzLnB1c2gobmV3IEdlbmUodGhpcy5yYW5nZXNba10ucmFuZ2UsIHRoaXMuZGlzY3JldGUpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnBvcHVsYXRpb24ucHVzaChjaHJvbWEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHN0YXJ0KHJ1bnMsIHN0ZXAsIHVudGlsKSB7XHJcbiAgICAgICAgbGV0IHIgPSAwO1xyXG4gICAgICAgIHdoaWxlIChyIDwgcnVucykge1xyXG4gICAgICAgICAgICB0aGlzLnByZXAociwgdGhpcy5zZXR1cCk7XHJcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGlvbi5zb3J0KHRoaXMuYXNjU29ydCk7XHJcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGlvbiA9IHRoaXMucG9wdWxhdGlvbi5zbGljZSgwLCB0aGlzLnNpemUpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnYmVzdDogJywgdGhpcy5wb3B1bGF0aW9uWzBdLnNjb3JlLnRvRml4ZWQoMikpO1xyXG4gICAgICAgICAgICByKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLmV4cGVyaW1lbnRMb2c7XHJcbiAgICB9XHJcbiAgICBkc2NTb3J0KGEsIGIpIHtcclxuICAgICAgICBpZiAoYS5zY29yZSA+IGIuc2NvcmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChhLnNjb3JlIDwgYi5zY29yZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICBhc2NTb3J0KGEsIGIpIHtcclxuICAgICAgICBpZiAoYS5zY29yZSA+IGIuc2NvcmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGEuc2NvcmUgPCBiLnNjb3JlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICBwcmVwKHIsIGNmZykge1xyXG4gICAgICAgIGlmICh0aGlzLm1hdGluZykge1xyXG4gICAgICAgICAgICBsZXQgdG9wUGVyY2VudCA9IE1hdGgucm91bmQoMC4xICogdGhpcy5zaXplKSArIDI7IC8vdGVuIHBlcmNlbnQgb2Ygb3JpZ2luYWwgc2l6ZSArIDJcclxuICAgICAgICAgICAgbGV0IGNoaWxkcmVuID0gdGhpcy5tYXRlKHRvcFBlcmNlbnQpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLm1hdGluZywgY2hpbGRyZW4sIHRvcFBlcmNlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLnBvcHVsYXRpb24gPSB0aGlzLnBvcHVsYXRpb24uY29uY2F0KGNoaWxkcmVuKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnBvcHVsYXRpb24ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5tdXRhdGUodGhpcy5wb3B1bGF0aW9uW2ldLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLnBvcHVsYXRpb24ubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgcG0gPSAwOyBwbSA8IHRoaXMucmFuZ2VzLmxlbmd0aDsgcG0rKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNmZ1BtID0gdGhpcy5yYW5nZXNbcG1dO1xyXG4gICAgICAgICAgICAgICAgbGV0IGdyb3VwSWR4O1xyXG4gICAgICAgICAgICAgICAgaWYgKGNmZ1BtLmxldmVsID09PSAnYWdlbnRzJyB8fCB0eXBlb2YgY2ZnUG0ubGV2ZWwgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaWkgPSAwOyBpaSA8IGNmZy5hZ2VudHMubGVuZ3RoOyBpaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjZmcuYWdlbnRzW2lpXS5uYW1lID09IGNmZ1BtLmdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm91cElkeCA9IGlpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXJhbUlkeDtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBqaiA9IDA7IGpqIDwgY2ZnLmFnZW50c1tncm91cElkeF0ucGFyYW1zLmxlbmd0aDsgamorKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2ZnLmFnZW50c1tncm91cElkeF0ucGFyYW1zW2pqXS5uYW1lID09IGNmZ1BtLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtSWR4ID0gamo7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY2ZnLmFnZW50c1tncm91cElkeF0ucGFyYW1zW3BhcmFtSWR4XS5hc3NpZ24gPSBpbnZOb3JtKHRoaXMucG9wdWxhdGlvbltqXS5nZW5lc1twbV0uY29kZSwgY2ZnUG0ucmFuZ2VbMF0sIGNmZ1BtLnJhbmdlWzFdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNmZ1tjZmdQbS5sZXZlbF0ucGFyYW1zW2NmZ1BtLmdyb3VwXVtjZmdQbS5uYW1lXSA9IGludk5vcm0odGhpcy5wb3B1bGF0aW9uW2pdLmdlbmVzW3BtXS5jb2RlLCBjZmdQbS5yYW5nZVswXSwgY2ZnUG0ucmFuZ2VbMV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN1cGVyLnByZXAociwgY2ZnKTtcclxuICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC50aW1lID0gMDtcclxuICAgICAgICAgICAgbGV0IHByZWRpY3QgPSB0aGlzLnJlcG9ydChyLCBjZmcpO1xyXG4gICAgICAgICAgICB0aGlzLnBvcHVsYXRpb25bal0uc2NvcmUgPSB0aGlzLmNvc3QocHJlZGljdCwgdGhpcy50YXJnZXQpO1xyXG4gICAgICAgICAgICB0aGlzLmV4cGVyaW1lbnRMb2cucHVzaChwcmVkaWN0KTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cociwgaik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29zdChwcmVkaWN0LCB0YXJnZXQpIHtcclxuICAgICAgICBsZXQgZGV2ID0gMDtcclxuICAgICAgICBsZXQgZGltZW5zaW9ucyA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHRhcmdldC5tZWFucykge1xyXG4gICAgICAgICAgICBkZXYgKz0gdGFyZ2V0Lm1lYW5zW2tleV0gLSBwcmVkaWN0Lm1lYW5zW2tleV07XHJcbiAgICAgICAgICAgIGRpbWVuc2lvbnMrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHRhcmdldC5mcmVxcykge1xyXG4gICAgICAgICAgICBkZXYgKz0gdGFyZ2V0LmZyZXFzW2tleV0gLSBwcmVkaWN0LmZyZXFzW2tleV07XHJcbiAgICAgICAgICAgIGRpbWVuc2lvbnMrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHRhcmdldC5tb2RlbCkge1xyXG4gICAgICAgICAgICBkZXYgKz0gdGFyZ2V0Lm1vZGVsW2tleV0gLSBwcmVkaWN0Lm1vZGVsW2tleV07XHJcbiAgICAgICAgICAgIGRpbWVuc2lvbnMrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucG93KGRldiwgMikgLyBkaW1lbnNpb25zO1xyXG4gICAgfVxyXG4gICAgcmVwb3J0KHIsIGNmZykge1xyXG4gICAgICAgIHJldHVybiBzdXBlci5yZXBvcnQociwgY2ZnKTtcclxuICAgIH1cclxuICAgIG1hdGUocGFyZW50cykge1xyXG4gICAgICAgIGxldCBudW1DaGlsZHJlbiA9IDAuNSAqIHRoaXMucmFuZ2VzLmxlbmd0aCAqIHRoaXMucmFuZ2VzLmxlbmd0aDtcclxuICAgICAgICBsZXQgY2hpbGRyZW4gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bUNoaWxkcmVuOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGNoaWxkID0gbmV3IENocm9tYXNvbWUoKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLnJhbmdlcy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGdlbmUgPSBuZXcgR2VuZShbdGhpcy5yYW5nZXNbal0ucmFuZ2VbMF0sIHRoaXMucmFuZ2VzW2pdLnJhbmdlWzFdXSwgdGhpcy5kaXNjcmV0ZSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmFuZCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBhcmVudHMpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGV4cHJlc3NlZCA9IHRoaXMucG9wdWxhdGlvbltyYW5kXS5nZW5lcy5zbGljZShqLCBqICsgMSk7XHJcbiAgICAgICAgICAgICAgICBnZW5lLmNvZGUgPSBleHByZXNzZWRbMF0uY29kZTtcclxuICAgICAgICAgICAgICAgIGNoaWxkLmdlbmVzLnB1c2goZ2VuZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2hpbGRyZW4ucHVzaChjaGlsZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjaGlsZHJlbjtcclxuICAgIH1cclxuICAgIG11dGF0ZShjaHJvbWEsIGNoYW5jZSkge1xyXG4gICAgICAgIGlmIChNYXRoLnJhbmRvbSgpID4gY2hhbmNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGJlc3QgPSB0aGlzLnBvcHVsYXRpb25bMF0uZ2VuZXM7XHJcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBjaHJvbWEuZ2VuZXMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgbGV0IGdlbmUgPSBjaHJvbWEuZ2VuZXNbal07XHJcbiAgICAgICAgICAgIGxldCBkaWZmO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5ncmFkaWVudCkge1xyXG4gICAgICAgICAgICAgICAgZGlmZiA9IGJlc3Rbal0uY29kZSAtIGdlbmUuY29kZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGRpZmYgPSByYW5kUmFuZ2UoLTEsIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCB1cE9yRG93biA9IGRpZmYgPiAwID8gMSA6IC0xO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZGlzY3JldGUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkaWZmID09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBnZW5lLmNvZGUgKz0gTWF0aC5yYW5kb20oKSAqIHRoaXMubXV0YXRlUmF0ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGdlbmUuY29kZSArPSBkaWZmICogdGhpcy5tdXRhdGVSYXRlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZ2VuZS5jb2RlICs9IHVwT3JEb3duO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGdlbmUuY29kZSA9IE1hdGgubWluKE1hdGgubWF4KDAsIGdlbmUuY29kZSksIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1ldm9sdXRpb25hcnkuanMubWFwIiwiaW1wb3J0IHsgUUNvbXBvbmVudCB9IGZyb20gJy4vUUNvbXBvbmVudCc7XHJcbmltcG9ydCB7IFNVQ0NFU1MgfSBmcm9tICcuL3V0aWxzJztcclxuZXhwb3J0IGNsYXNzIEh5YnJpZEF1dG9tYXRhIGV4dGVuZHMgUUNvbXBvbmVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBkYXRhLCBmbG93U2V0LCBmbG93TWFwLCBqdW1wU2V0LCBqdW1wTWFwKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSk7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgICAgICB0aGlzLmZsb3dTZXQgPSBmbG93U2V0O1xyXG4gICAgICAgIHRoaXMuZmxvd01hcCA9IGZsb3dNYXA7XHJcbiAgICAgICAgdGhpcy5qdW1wU2V0ID0ganVtcFNldDtcclxuICAgICAgICB0aGlzLmp1bXBNYXAgPSBqdW1wTWFwO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlKGFnZW50LCBzdGVwKSB7XHJcbiAgICAgICAgbGV0IHRlbXAgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGFnZW50KSk7XHJcbiAgICAgICAgZm9yICh2YXIgbW9kZSBpbiB0aGlzLmp1bXBTZXQpIHtcclxuICAgICAgICAgICAgbGV0IGVkZ2UgPSB0aGlzLmp1bXBTZXRbbW9kZV07XHJcbiAgICAgICAgICAgIGxldCBlZGdlU3RhdGUgPSBlZGdlLmNoZWNrKGFnZW50W2VkZ2Uua2V5XSwgZWRnZS52YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmIChlZGdlU3RhdGUgPT09IFNVQ0NFU1MgJiYgbW9kZSAhPSBhZ2VudC5jdXJyZW50TW9kZSkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBhZ2VudFtlZGdlLmtleV0gPSB0aGlzLmp1bXBNYXBbZWRnZS5rZXldW2FnZW50LmN1cnJlbnRNb2RlXVttb2RlXShhZ2VudFtlZGdlLmtleV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGFnZW50LmN1cnJlbnRNb2RlID0gbW9kZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhdGNoIChFcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL25vIHRyYW5zaXRpb24gdGhpcyBkaXJlY3Rpb247XHJcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhFcnIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLmZsb3dNYXApIHtcclxuICAgICAgICAgICAgICAgIC8vc2Vjb25kIG9yZGVyIGludGVncmF0aW9uXHJcbiAgICAgICAgICAgICAgICBsZXQgdGVtcEQgPSB0aGlzLmZsb3dNYXBba2V5XVthZ2VudC5jdXJyZW50TW9kZV0oYWdlbnRba2V5XSk7XHJcbiAgICAgICAgICAgICAgICB0ZW1wW2tleV0gPSBhZ2VudFtrZXldICsgdGVtcEQ7XHJcbiAgICAgICAgICAgICAgICBhZ2VudFtrZXldICs9IDAuNSAqICh0ZW1wRCArIHRoaXMuZmxvd01hcFtrZXldW2FnZW50LmN1cnJlbnRNb2RlXSh0ZW1wW2tleV0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1oYS5qcy5tYXAiLCJpbXBvcnQgeyBRQ29tcG9uZW50IH0gZnJvbSAnLi9RQ29tcG9uZW50JztcclxuaW1wb3J0IHsgZ2VuZXJhdGVVVUlEIH0gZnJvbSAnLi91dGlscyc7XHJcbi8vSGllcmFyY2hhbCBUYXNrIE5ldHdvcmtcclxuZXhwb3J0IGNsYXNzIEhUTlBsYW5uZXIgZXh0ZW5kcyBRQ29tcG9uZW50IHtcclxuICAgIHN0YXRpYyB0aWNrKG5vZGUsIHRhc2ssIGFnZW50KSB7XHJcbiAgICAgICAgaWYgKGFnZW50LnJ1bm5pbmdMaXN0KSB7XHJcbiAgICAgICAgICAgIGFnZW50LnJ1bm5pbmdMaXN0LnB1c2gobm9kZS5uYW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGFnZW50LnJ1bm5pbmdMaXN0ID0gW25vZGUubmFtZV07XHJcbiAgICAgICAgICAgIGFnZW50LnN1Y2Nlc3NMaXN0ID0gW107XHJcbiAgICAgICAgICAgIGFnZW50LmJhcnJpZXJMaXN0ID0gW107XHJcbiAgICAgICAgICAgIGFnZW50LmJsYWNrYm9hcmQgPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHN0YXRlID0gbm9kZS52aXNpdChhZ2VudCwgdGFzayk7XHJcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG4gICAgY29uc3RydWN0b3IobmFtZSwgcm9vdCwgdGFzaywgZGF0YSkge1xyXG4gICAgICAgIHN1cGVyKG5hbWUpO1xyXG4gICAgICAgIHRoaXMucm9vdCA9IHJvb3Q7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgICAgICB0aGlzLnN1bW1hcnkgPSBbXTtcclxuICAgICAgICB0aGlzLnJlc3VsdHMgPSBbXTtcclxuICAgICAgICB0aGlzLnRhc2sgPSB0YXNrO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlKGFnZW50LCBzdGVwKSB7XHJcbiAgICAgICAgLy9pdGVyYXRlIGFuIGFnZW50KGRhdGEpIHRocm91Z2ggdGhlIHRhc2sgbmV0d29ya1xyXG4gICAgICAgIGFnZW50LmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgSFROUGxhbm5lci50aWNrKHRoaXMucm9vdCwgdGhpcy50YXNrLCBhZ2VudCk7XHJcbiAgICAgICAgaWYgKGFnZW50LnN1Y2Nlc3NMaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgYWdlbnQuc3VjY2VlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBhZ2VudC5zdWNjZWVkID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGFnZW50LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBIVE5Sb290VGFzayB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBnb2Fscykge1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy5nb2FscyA9IGdvYWxzO1xyXG4gICAgfVxyXG4gICAgZXZhbHVhdGVHb2FsKGFnZW50KSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdCwgZztcclxuICAgICAgICBmb3IgKHZhciBwID0gMDsgcCA8IHRoaXMuZ29hbHMubGVuZ3RoOyBwKyspIHtcclxuICAgICAgICAgICAgZyA9IHRoaXMuZ29hbHNbcF07XHJcbiAgICAgICAgICAgIGlmIChnLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGcuY2hlY2soZy5kYXRhW2cua2V5XSwgZy52YWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBnLmNoZWNrKGFnZW50W2cua2V5XSwgZy52YWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEhUTk5vZGUge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgcHJlY29uZGl0aW9ucykge1xyXG4gICAgICAgIHRoaXMuaWQgPSBnZW5lcmF0ZVVVSUQoKTtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMucHJlY29uZGl0aW9ucyA9IHByZWNvbmRpdGlvbnM7XHJcbiAgICB9XHJcbiAgICBldmFsdWF0ZVByZUNvbmRzKGFnZW50KSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdDtcclxuICAgICAgICBpZiAodGhpcy5wcmVjb25kaXRpb25zIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgcCA9IDA7IHAgPCB0aGlzLnByZWNvbmRpdGlvbnMubGVuZ3RoOyBwKyspIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMucHJlY29uZGl0aW9uc1twXS5jaGVjayhhZ2VudFt0aGlzLnByZWNvbmRpdGlvbnNbcF0ua2V5XSwgdGhpcy5wcmVjb25kaXRpb25zW3BdLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IEhUTlBsYW5uZXIuRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEhUTlBsYW5uZXIuRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBIVE5QbGFubmVyLlNVQ0NFU1M7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEhUTk9wZXJhdG9yIGV4dGVuZHMgSFROTm9kZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBwcmVjb25kaXRpb25zLCBlZmZlY3RzKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSwgcHJlY29uZGl0aW9ucyk7XHJcbiAgICAgICAgdGhpcy50eXBlID0gXCJvcGVyYXRvclwiO1xyXG4gICAgICAgIHRoaXMuZWZmZWN0cyA9IGVmZmVjdHM7XHJcbiAgICAgICAgdGhpcy52aXNpdCA9IGZ1bmN0aW9uIChhZ2VudCwgdGFzaykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5ldmFsdWF0ZVByZUNvbmRzKGFnZW50KSA9PT0gSFROUGxhbm5lci5TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWZmZWN0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWZmZWN0c1tpXShhZ2VudC5ibGFja2JvYXJkWzBdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0YXNrLmV2YWx1YXRlR29hbChhZ2VudC5ibGFja2JvYXJkWzBdKSA9PT0gSFROUGxhbm5lci5TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWdlbnQuc3VjY2Vzc0xpc3QudW5zaGlmdCh0aGlzLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBIVE5QbGFubmVyLlNVQ0NFU1M7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSFROUGxhbm5lci5SVU5OSU5HO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYWdlbnQuYmFycmllckxpc3QudW5zaGlmdCh7IG5hbWU6IHRoaXMubmFtZSwgY29uZGl0aW9uczogdGhpcy5wcmVjb25kaXRpb25zIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIEhUTlBsYW5uZXIuRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgSFROTWV0aG9kIGV4dGVuZHMgSFROTm9kZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBwcmVjb25kaXRpb25zLCBjaGlsZHJlbikge1xyXG4gICAgICAgIHN1cGVyKG5hbWUsIHByZWNvbmRpdGlvbnMpO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IFwibWV0aG9kXCI7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xyXG4gICAgICAgIHRoaXMudmlzaXQgPSBmdW5jdGlvbiAoYWdlbnQsIHRhc2spIHtcclxuICAgICAgICAgICAgdmFyIGNvcHkgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGFnZW50KSk7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBjb3B5LmJsYWNrYm9hcmQ7XHJcbiAgICAgICAgICAgIGFnZW50LmJsYWNrYm9hcmQudW5zaGlmdChjb3B5KTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZXZhbHVhdGVQcmVDb25kcyhhZ2VudCkgPT09IEhUTlBsYW5uZXIuU1VDQ0VTUykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gSFROUGxhbm5lci50aWNrKHRoaXMuY2hpbGRyZW5baV0sIHRhc2ssIGFnZW50KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdGUgPT09IEhUTlBsYW5uZXIuU1VDQ0VTUykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhZ2VudC5zdWNjZXNzTGlzdC51bnNoaWZ0KHRoaXMubmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBIVE5QbGFubmVyLlNVQ0NFU1M7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYWdlbnQuYmFycmllckxpc3QudW5zaGlmdCh7IG5hbWU6IHRoaXMubmFtZSwgY29uZGl0aW9uczogdGhpcy5wcmVjb25kaXRpb25zIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBIVE5QbGFubmVyLkZBSUxFRDtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWh0bi5qcy5tYXAiLCJleHBvcnQgY2xhc3Mga01lYW4ge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSwgcHJvcHMsIGspIHtcclxuICAgICAgICB0aGlzLmNlbnRyb2lkcyA9IFtdO1xyXG4gICAgICAgIHRoaXMubGltaXRzID0ge307XHJcbiAgICAgICAgdGhpcy5pdGVyYXRpb25zID0gMDtcclxuICAgICAgICAvL2NyZWF0ZSBhIGxpbWl0cyBvYmogZm9yIGVhY2ggcHJvcFxyXG4gICAgICAgIHByb3BzLmZvckVhY2gocCA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubGltaXRzW3BdID0ge1xyXG4gICAgICAgICAgICAgICAgbWluOiAxZTE1LFxyXG4gICAgICAgICAgICAgICAgbWF4OiAtMWUxNVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vc2V0IGxpbWl0cyBmb3IgZWFjaCBwcm9wXHJcbiAgICAgICAgZGF0YS5mb3JFYWNoKGQgPT4ge1xyXG4gICAgICAgICAgICBwcm9wcy5mb3JFYWNoKHAgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRbcF0gPiB0aGlzLmxpbWl0c1twXS5tYXgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpbWl0c1twXS5tYXggPSBkW3BdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGRbcF0gPCB0aGlzLmxpbWl0c1twXS5taW4pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpbWl0c1twXS5taW4gPSBkW3BdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvL2NyZWF0ZSBrIHJhbmRvbSBwb2ludHNcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGs7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmNlbnRyb2lkc1tpXSA9IHsgY291bnQ6IDAgfTtcclxuICAgICAgICAgICAgcHJvcHMuZm9yRWFjaChwID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBjZW50cm9pZCA9IE1hdGgucmFuZG9tKCkgKiB0aGlzLmxpbWl0c1twXS5tYXggKyB0aGlzLmxpbWl0c1twXS5taW47XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNlbnRyb2lkc1tpXVtwXSA9IGNlbnRyb2lkO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgICAgICB0aGlzLnByb3BzID0gcHJvcHM7XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgdGhpcy5fYXNzaWduQ2VudHJvaWQoKTtcclxuICAgICAgICB0aGlzLl9tb3ZlQ2VudHJvaWQoKTtcclxuICAgIH1cclxuICAgIHJ1bigpIHtcclxuICAgICAgICBsZXQgZmluaXNoZWQgPSBmYWxzZTtcclxuICAgICAgICB3aGlsZSAoIWZpbmlzaGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2VudHJvaWRzLmZvckVhY2goYyA9PiB7XHJcbiAgICAgICAgICAgICAgICBmaW5pc2hlZCA9IGMuZmluaXNoZWQ7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLml0ZXJhdGlvbnMrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFt0aGlzLmNlbnRyb2lkcywgdGhpcy5kYXRhXTtcclxuICAgIH1cclxuICAgIF9hc3NpZ25DZW50cm9pZCgpIHtcclxuICAgICAgICB0aGlzLmRhdGEuZm9yRWFjaCgoZCwgaikgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZGlzdGFuY2VzID0gW107XHJcbiAgICAgICAgICAgIGxldCB0b3RhbERpc3QgPSBbXTtcclxuICAgICAgICAgICAgbGV0IG1pbkRpc3Q7XHJcbiAgICAgICAgICAgIGxldCBtaW5JbmRleDtcclxuICAgICAgICAgICAgLy9mb3JlYWNoIHBvaW50LCBnZXQgdGhlIHBlciBwcm9wIGRpc3RhbmNlIGZyb20gZWFjaCBjZW50cm9pZFxyXG4gICAgICAgICAgICB0aGlzLmNlbnRyb2lkcy5mb3JFYWNoKChjLCBpKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBkaXN0YW5jZXNbaV0gPSB7fTtcclxuICAgICAgICAgICAgICAgIHRvdGFsRGlzdFtpXSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmZvckVhY2gocCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2VzW2ldW3BdID0gTWF0aC5zcXJ0KChkW3BdIC0gY1twXSkgKiAoZFtwXSAtIGNbcF0pKTtcclxuICAgICAgICAgICAgICAgICAgICB0b3RhbERpc3RbaV0gKz0gZGlzdGFuY2VzW2ldW3BdO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0b3RhbERpc3RbaV0gPSBNYXRoLnNxcnQodG90YWxEaXN0W2ldKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIG1pbkRpc3QgPSBNYXRoLm1pbi5hcHBseShudWxsLCB0b3RhbERpc3QpO1xyXG4gICAgICAgICAgICBtaW5JbmRleCA9IHRvdGFsRGlzdC5pbmRleE9mKG1pbkRpc3QpO1xyXG4gICAgICAgICAgICBkLmNlbnRyb2lkID0gbWluSW5kZXg7XHJcbiAgICAgICAgICAgIGQuZGlzdGFuY2VzID0gZGlzdGFuY2VzO1xyXG4gICAgICAgICAgICB0aGlzLmNlbnRyb2lkc1ttaW5JbmRleF0uY291bnQgKz0gMTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIF9tb3ZlQ2VudHJvaWQoKSB7XHJcbiAgICAgICAgdGhpcy5jZW50cm9pZHMuZm9yRWFjaCgoYywgaSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZGlzdEZyb21DZW50cm9pZCA9IHt9O1xyXG4gICAgICAgICAgICB0aGlzLnByb3BzLmZvckVhY2gocCA9PiBkaXN0RnJvbUNlbnRyb2lkW3BdID0gW10pO1xyXG4gICAgICAgICAgICAvL2dldCB0aGUgcGVyIHByb3AgZGlzdGFuY2VzIGZyb20gdGhlIGNlbnRyb2lkIGFtb25nIGl0cycgYXNzaWduZWQgcG9pbnRzXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YS5mb3JFYWNoKGQgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGQuY2VudHJvaWQgPT09IGkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmZvckVhY2gocCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3RGcm9tQ2VudHJvaWRbcF0ucHVzaChkW3BdKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vaGFuZGxlIGNlbnRyb2lkIHdpdGggbm8gYXNzaWduZWQgcG9pbnRzIChyYW5kb21seSBhc3NpZ24gbmV3KTtcclxuICAgICAgICAgICAgaWYgKGMuY291bnQgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZm9yRWFjaChwID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXN0RnJvbUNlbnRyb2lkW3BdID0gW01hdGgucmFuZG9tKCkgKiB0aGlzLmxpbWl0c1twXS5tYXggKyB0aGlzLmxpbWl0c1twXS5taW5dO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9nZXQgdGhlIHN1bSBhbmQgbWVhbiBwZXIgcHJvcGVydHkgb2YgdGhlIGFzc2lnbmVkIHBvaW50c1xyXG4gICAgICAgICAgICB0aGlzLnByb3BzLmZvckVhY2gocCA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc3VtID0gZGlzdEZyb21DZW50cm9pZFtwXS5yZWR1Y2UoKHByZXYsIG5leHQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJldiArIG5leHQ7XHJcbiAgICAgICAgICAgICAgICB9LCAwKTtcclxuICAgICAgICAgICAgICAgIGxldCBtZWFuID0gc3VtIC8gZGlzdEZyb21DZW50cm9pZFtwXS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGksICdcXCdzIGF2ZXJhZ2UgZGlzdCB3YXMnLCBtZWFuLCAnIHRoZSBjdXJyZW50IHBvcyB3YXMgJywgY1twXSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY1twXSAhPT0gbWVhbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNbcF0gPSBtZWFuO1xyXG4gICAgICAgICAgICAgICAgICAgIGMuZmluaXNoZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBjLmNvdW50ID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGMuZmluaXNoZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1rbWVhbi5qcy5tYXAiLCJleHBvcnQgY2xhc3MgS05OIHtcclxuICAgIHNldE5laWdoYm9ycyhwb2ludCwgZGF0YSwgcGFyYW0sIGNsYXNzaWZpZXIpIHtcclxuICAgICAgICBkYXRhLmZvckVhY2goKGQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGQuaWQgIT09IHBvaW50LmlkKSB7XHJcbiAgICAgICAgICAgICAgICBwb2ludC5uZWlnaGJvcnNbZC5pZF0gPSBwb2ludC5uZWlnaGJvcnNbZC5pZF0gfHwge307XHJcbiAgICAgICAgICAgICAgICBwb2ludC5uZWlnaGJvcnNbZC5pZF1bY2xhc3NpZmllcl0gPSBkW2NsYXNzaWZpZXJdO1xyXG4gICAgICAgICAgICAgICAgcG9pbnQubmVpZ2hib3JzW2QuaWRdW3BhcmFtLnBhcmFtXSA9IE1hdGguYWJzKHBvaW50W3BhcmFtLnBhcmFtXSAtIGRbcGFyYW0ucGFyYW1dKSAvIHBhcmFtLnJhbmdlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBzb3J0KG5laWdoYm9ycywgcGFyYW0pIHtcclxuICAgICAgICB2YXIgbGlzdCA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIG5laWdoIGluIG5laWdoYm9ycykge1xyXG4gICAgICAgICAgICBsaXN0LnB1c2gobmVpZ2hib3JzW25laWdoXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxpc3Quc29ydCgoYSwgYikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoYVtwYXJhbV0gPj0gYltwYXJhbV0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChiW3BhcmFtXSA+PSBhW3BhcmFtXSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBsaXN0O1xyXG4gICAgfVxyXG4gICAgc2V0RGlzdGFuY2VzKGRhdGEsIHRyYWluZWQsIGtQYXJhbXNPYmosIGNsYXNzaWZpZXIpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgZGF0YVtpXS5uZWlnaGJvcnMgPSB7fTtcclxuICAgICAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBrUGFyYW1zT2JqLmxlbmd0aDsgaysrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRhdGFbaV1ba1BhcmFtc09ialtrXS5wYXJhbV0gPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXROZWlnaGJvcnMoZGF0YVtpXSwgdHJhaW5lZCwga1BhcmFtc09ialtrXSwgY2xhc3NpZmllcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yICh2YXIgbiBpbiBkYXRhW2ldLm5laWdoYm9ycykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG5laWdoYm9yID0gZGF0YVtpXS5uZWlnaGJvcnNbbl07XHJcbiAgICAgICAgICAgICAgICB2YXIgZGlzdCA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBwID0gMDsgcCA8IGtQYXJhbXNPYmoubGVuZ3RoOyBwKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBkaXN0ICs9IG5laWdoYm9yW2tQYXJhbXNPYmpbcF0ucGFyYW1dICogbmVpZ2hib3Jba1BhcmFtc09ialtwXS5wYXJhbV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBuZWlnaGJvci5kaXN0YW5jZSA9IE1hdGguc3FydChkaXN0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgIH1cclxuICAgIGdldFJhbmdlKGRhdGEsIGtQYXJhbXMpIHtcclxuICAgICAgICBsZXQgcmFuZ2VzID0gW10sIG1pbiA9IDFlMjAsIG1heCA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBrUGFyYW1zLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGQgPSAwOyBkIDwgZGF0YS5sZW5ndGg7IGQrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGFbZF1ba1BhcmFtc1tqXV0gPCBtaW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBtaW4gPSBkYXRhW2RdW2tQYXJhbXNbal1dO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGFbZF1ba1BhcmFtc1tqXV0gPiBtYXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXggPSBkYXRhW2RdW2tQYXJhbXNbal1dO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJhbmdlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIHBhcmFtOiBrUGFyYW1zW2pdLFxyXG4gICAgICAgICAgICAgICAgbWluOiBtaW4sXHJcbiAgICAgICAgICAgICAgICBtYXg6IG1heCxcclxuICAgICAgICAgICAgICAgIHJhbmdlOiBtYXggLSBtaW5cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIDtcclxuICAgICAgICByZXR1cm4gcmFuZ2VzO1xyXG4gICAgfVxyXG4gICAgY2xhc3NpZnkoZGF0YSwgdHJhaW5lZERhdGEsIGtQYXJhbXMsIGNsYXNzaWZpZXIsIG5lYXJlc3ROKSB7XHJcbiAgICAgICAgbGV0IGtQYXJhbXNPYmogPSB0aGlzLmdldFJhbmdlKFtdLmNvbmNhdChkYXRhLCB0cmFpbmVkRGF0YSksIGtQYXJhbXMpO1xyXG4gICAgICAgIGRhdGEgPSB0aGlzLnNldERpc3RhbmNlcyhkYXRhLCB0cmFpbmVkRGF0YSwga1BhcmFtc09iaiwgY2xhc3NpZmllcik7XHJcbiAgICAgICAgbGV0IG9yZGVyZWQgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBkID0gMDsgZCA8IGRhdGEubGVuZ3RoOyBkKyspIHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdHMgPSB7fTtcclxuICAgICAgICAgICAgb3JkZXJlZCA9IHRoaXMuc29ydChkYXRhW2RdLm5laWdoYm9ycywgJ2Rpc3RhbmNlJyk7XHJcbiAgICAgICAgICAgIGxldCBuID0gMDtcclxuICAgICAgICAgICAgd2hpbGUgKG4gPCBuZWFyZXN0Tikge1xyXG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBvcmRlcmVkW25dW2NsYXNzaWZpZXJdO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0c1tjdXJyZW50XSA9IHJlc3VsdHNbY3VycmVudF0gfHwgMDtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHNbY3VycmVudF0gKz0gMTtcclxuICAgICAgICAgICAgICAgIG4rKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgbWF4ID0gMCwgbGlrZWxpZXN0ID0gJyc7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHBhcmFtIGluIHJlc3VsdHMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHRzW3BhcmFtXSA+IG1heCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1heCA9IHJlc3VsdHNbcGFyYW1dO1xyXG4gICAgICAgICAgICAgICAgICAgIGxpa2VsaWVzdCA9IHBhcmFtO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRhdGFbZF1bY2xhc3NpZmllcl0gPSBsaWtlbGllc3Q7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWtubi5qcy5tYXAiLCJleHBvcnQgY2xhc3MgVmVjdG9yIHtcclxuICAgIGNvbnN0cnVjdG9yKGFycmF5LCBzaXplKSB7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIE1hdHJpeCB7XHJcbiAgICBjb25zdHJ1Y3RvcihtYXQpIHtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgYWN0aXZhdGlvbk1ldGhvZHMge1xyXG4gICAgc3RhdGljIFJlTFUoeCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLm1heCh4LCAwKTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBzaWdtb2lkKHgpIHtcclxuICAgICAgICByZXR1cm4gMSAvICgxICsgTWF0aC5leHAoLXgpKTtcclxuICAgIH1cclxuICAgIHN0YXRpYyB0YW5oKHgpIHtcclxuICAgICAgICBsZXQgdmFsID0gKE1hdGguZXhwKHgpIC0gTWF0aC5leHAoLXgpKSAvIChNYXRoLmV4cCh4KSArIE1hdGguZXhwKC14KSk7XHJcbiAgICAgICAgcmV0dXJuIHZhbDtcclxuICAgIH1cclxufVxyXG47XHJcbmV4cG9ydCBjbGFzcyBkZXJpdml0ZU1ldGhvZHMge1xyXG4gICAgc3RhdGljIFJlTFUodmFsdWUpIHtcclxuICAgICAgICBsZXQgZGVyID0gdmFsdWUgPD0gMCA/IDAgOiAxO1xyXG4gICAgICAgIHJldHVybiBkZXI7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgc2lnbW9pZCh2YWx1ZSkge1xyXG4gICAgICAgIGxldCBzaWcgPSBhY3RpdmF0aW9uTWV0aG9kcy5zaWdtb2lkO1xyXG4gICAgICAgIHJldHVybiBzaWcodmFsdWUpICogKDEgLSBzaWcodmFsdWUpKTtcclxuICAgIH1cclxuICAgIHN0YXRpYyB0YW5oKHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIDEgLSBNYXRoLnBvdyhhY3RpdmF0aW9uTWV0aG9kcy50YW5oKHZhbHVlKSwgMik7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGxvZ2lzdGljKHgsIG0sIGIsIGspIHtcclxuICAgIHZhciB5ID0gMSAvIChtICsgTWF0aC5leHAoLWsgKiAoeCAtIGIpKSk7XHJcbiAgICByZXR1cm4geTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gbG9naXQoeCwgbSwgYiwgaykge1xyXG4gICAgdmFyIHkgPSAxIC8gTWF0aC5sb2coeCAvICgxIC0geCkpO1xyXG4gICAgcmV0dXJuIHk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGxpbmVhcih4LCBtLCBiLCBrKSB7XHJcbiAgICB2YXIgeSA9IG0gKiB4ICsgYjtcclxuICAgIHJldHVybiB5O1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBleHBvbmVudGlhbCh4LCBtLCBiLCBrKSB7XHJcbiAgICB2YXIgeSA9IDEgLSBNYXRoLnBvdyh4LCBrKSAvIE1hdGgucG93KDEsIGspO1xyXG4gICAgcmV0dXJuIHk7XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWF0aC5qcy5tYXAiLCJleHBvcnQgY2xhc3MgTmV0d29yayB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhLCBsYWJlbHMsIGhpZGRlbk51bSwgZWwsIGFjdGl2YXRpb25UeXBlID0gXCJ0YW5oXCIpIHtcclxuICAgICAgICB0aGlzLmVsID0gZWw7XHJcbiAgICAgICAgdGhpcy5pdGVyID0gMDtcclxuICAgICAgICB0aGlzLmNvcnJlY3QgPSAwO1xyXG4gICAgICAgIHRoaXMuaGlkZGVuTnVtID0gaGlkZGVuTnVtO1xyXG4gICAgICAgIHRoaXMubGVhcm5SYXRlID0gMC4wMTtcclxuICAgICAgICB0aGlzLmFjdEZuID0gTmV0d29yay5hY3RpdmF0aW9uTWV0aG9kc1thY3RpdmF0aW9uVHlwZV07XHJcbiAgICAgICAgdGhpcy5kZXJGbiA9IE5ldHdvcmsuZGVyaXZpdGVNZXRob2RzW2FjdGl2YXRpb25UeXBlXTtcclxuICAgICAgICB0aGlzLmluaXQoZGF0YSwgbGFiZWxzKTtcclxuICAgIH1cclxuICAgIGxlYXJuKGl0ZXJhdGlvbnMsIGRhdGEsIGxhYmVscywgcmVuZGVyID0gMTAwKSB7XHJcbiAgICAgICAgdGhpcy5jb3JyZWN0ID0gMDtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZXJhdGlvbnM7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgcmFuZElkeCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGRhdGEubGVuZ3RoKTtcclxuICAgICAgICAgICAgdGhpcy5pdGVyKys7XHJcbiAgICAgICAgICAgIHRoaXMuZm9yd2FyZChkYXRhW3JhbmRJZHhdKTtcclxuICAgICAgICAgICAgbGV0IG1heCA9IC0xO1xyXG4gICAgICAgICAgICBsZXQgbWF4SWR4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy52YWx1ZXMubGVuZ3RoKTtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZXNbdGhpcy52YWx1ZXMubGVuZ3RoIC0gMV0uZm9yRWFjaCgoeCwgaWR4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoeCA+IG1heCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1heElkeCA9IGlkeDtcclxuICAgICAgICAgICAgICAgICAgICBtYXggPSB4O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgbGV0IGd1ZXNzZWQgPSB0aGlzLnZhbHVlc1t0aGlzLnZhbHVlcy5sZW5ndGggLSAxXVttYXhJZHhdID49IDAuNSA/IDEgOiAwO1xyXG4gICAgICAgICAgICBpZiAoZ3Vlc3NlZCA9PT0gbGFiZWxzW3JhbmRJZHhdW21heElkeF0pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29ycmVjdCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuYWNjdXJhY3kgPSB0aGlzLmNvcnJlY3QgLyAoaSArIDEpO1xyXG4gICAgICAgICAgICB0aGlzLmJhY2t3YXJkKGxhYmVsc1tyYW5kSWR4XSk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlV2VpZ2h0cygpO1xyXG4gICAgICAgICAgICB0aGlzLnJlc2V0VG90YWxzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY2xhc3NpZnkoZGF0YSkge1xyXG4gICAgICAgIHRoaXMucmVzZXRUb3RhbHMoKTtcclxuICAgICAgICB0aGlzLmZvcndhcmQoZGF0YSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVzW3RoaXMudmFsdWVzLmxlbmd0aCAtIDFdO1xyXG4gICAgfVxyXG4gICAgaW5pdChkYXRhLCBsYWJlbHMpIHtcclxuICAgICAgICBsZXQgaW5wdXRzID0gW107XHJcbiAgICAgICAgdGhpcy5kZXIgPSBbXTtcclxuICAgICAgICB0aGlzLnZhbHVlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMud2VpZ2h0cyA9IFtdO1xyXG4gICAgICAgIHRoaXMud2VpZ2h0Q2hhbmdlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMudG90YWxzID0gW107XHJcbiAgICAgICAgdGhpcy5kZXJUb3RhbHMgPSBbXTtcclxuICAgICAgICB0aGlzLmJpYXNlcyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IG4gPSAwOyBuIDwgZGF0YVswXS5sZW5ndGg7IG4rKykge1xyXG4gICAgICAgICAgICBpbnB1dHMucHVzaCgwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgdGhpcy5oaWRkZW5OdW0ubGVuZ3RoOyBjb2wrKykge1xyXG4gICAgICAgICAgICB0aGlzLmRlcltjb2xdID0gW107XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWVzW2NvbF0gPSBbXTtcclxuICAgICAgICAgICAgdGhpcy50b3RhbHNbY29sXSA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmRlclRvdGFsc1tjb2xdID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IHRoaXMuaGlkZGVuTnVtW2NvbF07IHJvdysrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlc1tjb2xdW3Jvd10gPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXJbY29sXVtyb3ddID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMudG90YWxzW2NvbF1bcm93XSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlclRvdGFsc1tjb2xdW3Jvd10gPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudmFsdWVzLnVuc2hpZnQoaW5wdXRzKTtcclxuICAgICAgICB0aGlzLnRvdGFscy51bnNoaWZ0KGlucHV0cyk7XHJcbiAgICAgICAgdGhpcy5kZXIudW5zaGlmdChpbnB1dHMpO1xyXG4gICAgICAgIHRoaXMuZGVyVG90YWxzLnVuc2hpZnQoaW5wdXRzKTtcclxuICAgICAgICB0aGlzLnZhbHVlc1t0aGlzLmhpZGRlbk51bS5sZW5ndGggKyAxXSA9IGxhYmVsc1swXS5tYXAoKGwpID0+IHsgcmV0dXJuIDA7IH0pO1xyXG4gICAgICAgIHRoaXMudG90YWxzW3RoaXMuaGlkZGVuTnVtLmxlbmd0aCArIDFdID0gbGFiZWxzWzBdLm1hcCgobCkgPT4geyByZXR1cm4gMDsgfSk7XHJcbiAgICAgICAgdGhpcy5kZXJbdGhpcy5oaWRkZW5OdW0ubGVuZ3RoICsgMV0gPSBsYWJlbHNbMF0ubWFwKChsKSA9PiB7IHJldHVybiAwOyB9KTtcclxuICAgICAgICB0aGlzLmRlclRvdGFsc1t0aGlzLmhpZGRlbk51bS5sZW5ndGggKyAxXSA9IGxhYmVsc1swXS5tYXAoKGwpID0+IHsgcmV0dXJuIDA7IH0pO1xyXG4gICAgICAgIGZvciAobGV0IHdnID0gMDsgd2cgPCB0aGlzLnZhbHVlcy5sZW5ndGggLSAxOyB3ZysrKSB7XHJcbiAgICAgICAgICAgIHRoaXMud2VpZ2h0c1t3Z10gPSBbXTtcclxuICAgICAgICAgICAgdGhpcy53ZWlnaHRDaGFuZ2VzW3dnXSA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmJpYXNlc1t3Z10gPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgc3JjID0gMDsgc3JjIDwgdGhpcy52YWx1ZXNbd2ddLmxlbmd0aDsgc3JjKyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMud2VpZ2h0c1t3Z11bc3JjXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy53ZWlnaHRDaGFuZ2VzW3dnXVtzcmNdID0gW107XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBkc3QgPSAwOyBkc3QgPCB0aGlzLnZhbHVlc1t3ZyArIDFdLmxlbmd0aDsgZHN0KyspIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJpYXNlc1t3Z11bZHN0XSA9IE1hdGgucmFuZG9tKCkgLSAwLjU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53ZWlnaHRzW3dnXVtzcmNdW2RzdF0gPSBNYXRoLnJhbmRvbSgpIC0gMC41O1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2VpZ2h0Q2hhbmdlc1t3Z11bc3JjXVtkc3RdID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJlc2V0VG90YWxzKCkge1xyXG4gICAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IHRoaXMudG90YWxzLmxlbmd0aDsgY29sKyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgdGhpcy50b3RhbHNbY29sXS5sZW5ndGg7IHJvdysrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRvdGFsc1tjb2xdW3Jvd10gPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXJUb3RhbHNbY29sXVtyb3ddID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZvcndhcmQoaW5wdXQpIHtcclxuICAgICAgICB0aGlzLnZhbHVlc1swXSA9IGlucHV0O1xyXG4gICAgICAgIGZvciAobGV0IHdnID0gMDsgd2cgPCB0aGlzLndlaWdodHMubGVuZ3RoOyB3ZysrKSB7XHJcbiAgICAgICAgICAgIGxldCBzcmNWYWxzID0gd2c7XHJcbiAgICAgICAgICAgIGxldCBkc3RWYWxzID0gd2cgKyAxO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBzcmMgPSAwOyBzcmMgPCB0aGlzLndlaWdodHNbd2ddLmxlbmd0aDsgc3JjKyspIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGRzdCA9IDA7IGRzdCA8IHRoaXMud2VpZ2h0c1t3Z11bc3JjXS5sZW5ndGg7IGRzdCsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b3RhbHNbZHN0VmFsc11bZHN0XSArPSB0aGlzLnZhbHVlc1tzcmNWYWxzXVtzcmNdICogdGhpcy53ZWlnaHRzW3dnXVtzcmNdW2RzdF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy52YWx1ZXNbZHN0VmFsc10gPSB0aGlzLnRvdGFsc1tkc3RWYWxzXS5tYXAoKHRvdGFsLCBpZHgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmFjdEZuKHRvdGFsICsgdGhpcy5iaWFzZXNbd2ddW2lkeF0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBiYWNrd2FyZChsYWJlbHMpIHtcclxuICAgICAgICBmb3IgKGxldCB3ZyA9IHRoaXMud2VpZ2h0cy5sZW5ndGggLSAxOyB3ZyA+PSAwOyB3Zy0tKSB7XHJcbiAgICAgICAgICAgIGxldCBzcmNWYWxzID0gd2c7XHJcbiAgICAgICAgICAgIGxldCBkc3RWYWxzID0gd2cgKyAxO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBzcmMgPSAwOyBzcmMgPCB0aGlzLndlaWdodHNbd2ddLmxlbmd0aDsgc3JjKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBlcnIgPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZHN0ID0gMDsgZHN0IDwgdGhpcy53ZWlnaHRzW3dnXVtzcmNdLmxlbmd0aDsgZHN0KyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAod2cgPT09IHRoaXMud2VpZ2h0cy5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVyciArPSBsYWJlbHNbZHN0XSAtIHRoaXMudmFsdWVzW2RzdFZhbHNdW2RzdF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVyW2RzdFZhbHNdW2RzdF0gPSBlcnI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnIgKz0gdGhpcy5kZXJbZHN0VmFsc11bZHN0XSAqIHRoaXMud2VpZ2h0c1t3Z11bc3JjXVtkc3RdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGVyVG90YWxzW3NyY1ZhbHNdW3NyY10gPSBlcnI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlcltzcmNWYWxzXVtzcmNdID0gZXJyICogdGhpcy5kZXJGbih0aGlzLnZhbHVlc1tzcmNWYWxzXVtzcmNdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHVwZGF0ZVdlaWdodHMoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgd2cgPSAwOyB3ZyA8IHRoaXMud2VpZ2h0cy5sZW5ndGg7IHdnKyspIHtcclxuICAgICAgICAgICAgbGV0IHNyY1ZhbHMgPSB3ZztcclxuICAgICAgICAgICAgbGV0IGRzdFZhbHMgPSB3ZyArIDE7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHNyYyA9IDA7IHNyYyA8IHRoaXMud2VpZ2h0c1t3Z10ubGVuZ3RoOyBzcmMrKykge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZHN0ID0gMDsgZHN0IDwgdGhpcy53ZWlnaHRzW3dnXVtzcmNdLmxlbmd0aDsgZHN0KyspIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbW9tZW50dW0gPSB0aGlzLndlaWdodENoYW5nZXNbd2ddW3NyY11bZHN0XSAqIDAuMTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLndlaWdodENoYW5nZXNbd2ddW3NyY11bZHN0XSA9ICh0aGlzLnZhbHVlc1tzcmNWYWxzXVtzcmNdICogdGhpcy5kZXJbZHN0VmFsc11bZHN0XSAqIHRoaXMubGVhcm5SYXRlKSArIG1vbWVudHVtO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2VpZ2h0c1t3Z11bc3JjXVtkc3RdICs9IHRoaXMud2VpZ2h0Q2hhbmdlc1t3Z11bc3JjXVtkc3RdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuYmlhc2VzW3dnXSA9IHRoaXMuYmlhc2VzW3dnXS5tYXAoKGJpYXMsIGlkeCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubGVhcm5SYXRlICogdGhpcy5kZXJbZHN0VmFsc11baWR4XSArIGJpYXM7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIG1zZSgpIHtcclxuICAgICAgICBsZXQgZXJyID0gMDtcclxuICAgICAgICBsZXQgY291bnQgPSAwO1xyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5kZXJUb3RhbHMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgZXJyICs9IHRoaXMuZGVyVG90YWxzW2pdLnJlZHVjZSgobGFzdCwgY3VycmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY291bnQrKztcclxuICAgICAgICAgICAgICAgIHJldHVybiBsYXN0ICsgTWF0aC5wb3coY3VycmVudCwgMik7XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZXJyIC8gY291bnQ7XHJcbiAgICB9XHJcbn1cclxuTmV0d29yay5hY3RpdmF0aW9uTWV0aG9kcyA9IHtcclxuICAgIFJlTFU6IGZ1bmN0aW9uICh4KSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KHgsIDApO1xyXG4gICAgfSxcclxuICAgIHNpZ21vaWQ6IGZ1bmN0aW9uICh4KSB7XHJcbiAgICAgICAgcmV0dXJuIDEgLyAoMSArIE1hdGguZXhwKC14KSk7XHJcbiAgICB9LFxyXG4gICAgdGFuaDogZnVuY3Rpb24gKHgpIHtcclxuICAgICAgICBsZXQgdmFsID0gKE1hdGguZXhwKHgpIC0gTWF0aC5leHAoLXgpKSAvIChNYXRoLmV4cCh4KSArIE1hdGguZXhwKC14KSk7XHJcbiAgICAgICAgcmV0dXJuIHZhbDtcclxuICAgIH1cclxufTtcclxuTmV0d29yay5kZXJpdml0ZU1ldGhvZHMgPSB7XHJcbiAgICBSZUxVOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICBsZXQgZGVyID0gdmFsdWUgPD0gMCA/IDAgOiAxO1xyXG4gICAgICAgIHJldHVybiBkZXI7XHJcbiAgICB9LFxyXG4gICAgc2lnbW9pZDogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgbGV0IHNpZyA9IE5ldHdvcmsuYWN0aXZhdGlvbk1ldGhvZHMuc2lnbW9pZDtcclxuICAgICAgICByZXR1cm4gc2lnKHZhbHVlKSAqICgxIC0gc2lnKHZhbHVlKSk7XHJcbiAgICB9LFxyXG4gICAgdGFuaDogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIDEgLSBNYXRoLnBvdyhOZXR3b3JrLmFjdGl2YXRpb25NZXRob2RzLnRhbmgodmFsdWUpLCAyKTtcclxuICAgIH1cclxufTtcclxuTmV0d29yay5jb3N0TWV0aG9kcyA9IHtcclxuICAgIHNxRXJyOiBmdW5jdGlvbiAodGFyZ2V0LCBndWVzcykge1xyXG4gICAgICAgIHJldHVybiBndWVzcyAtIHRhcmdldDtcclxuICAgIH0sXHJcbiAgICBhYnNFcnI6IGZ1bmN0aW9uICgpIHtcclxuICAgIH1cclxufTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bmV0d29yay5qcy5tYXAiLCJleHBvcnQgY2xhc3MgUUxlYXJuZXIge1xyXG4gICAgLy9UT0RPIC0gY2hhbmdlIGVwaXNvZGUgdG8gdXBkYXRlXHJcbiAgICBjb25zdHJ1Y3RvcihSLCBnYW1tYSwgZ29hbCkge1xyXG4gICAgICAgIHRoaXMucmF3TWF4ID0gMTtcclxuICAgICAgICB0aGlzLlIgPSBSO1xyXG4gICAgICAgIHRoaXMuZ2FtbWEgPSBnYW1tYTtcclxuICAgICAgICB0aGlzLmdvYWwgPSBnb2FsO1xyXG4gICAgICAgIHRoaXMuUSA9IHt9O1xyXG4gICAgICAgIGZvciAodmFyIHN0YXRlIGluIFIpIHtcclxuICAgICAgICAgICAgdGhpcy5RW3N0YXRlXSA9IHt9O1xyXG4gICAgICAgICAgICBmb3IgKHZhciBhY3Rpb24gaW4gUltzdGF0ZV0pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuUVtzdGF0ZV1bYWN0aW9uXSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5nYW1tYSA9IGdhbW1hO1xyXG4gICAgfVxyXG4gICAgZ3JvdyhzdGF0ZSwgYWN0aW9ucykge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWN0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAvL3Jld2FyZCBpcyBjdXJyZW50bHkgdW5rbm93blxyXG4gICAgICAgICAgICB0aGlzLlJbc3RhdGVdW2FjdGlvbnNbaV1dID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBleHBsb3JlKHByb20pIHtcclxuICAgIH1cclxuICAgIHRyYW5zaXRpb24oc3RhdGUsIGFjdGlvbikge1xyXG4gICAgICAgIC8vaXMgdGhlIHN0YXRlIHVuZXhhbWluZWRcclxuICAgICAgICBsZXQgZXhhbWluZWQgPSB0cnVlO1xyXG4gICAgICAgIGxldCBiZXN0QWN0aW9uO1xyXG4gICAgICAgIGZvciAoYWN0aW9uIGluIHRoaXMuUltzdGF0ZV0pIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuUltzdGF0ZV1bYWN0aW9uXSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgYmVzdEFjdGlvbiA9IGFjdGlvbjtcclxuICAgICAgICAgICAgICAgIGV4YW1pbmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgYmVzdEFjdGlvbiA9IHRoaXMubWF4KGFjdGlvbik7XHJcbiAgICAgICAgdGhpcy5RW3N0YXRlXVthY3Rpb25dID0gdGhpcy5SW3N0YXRlXVthY3Rpb25dICsgKHRoaXMuZ2FtbWEgKiB0aGlzLlFbYWN0aW9uXVtiZXN0QWN0aW9uXSk7XHJcbiAgICB9XHJcbiAgICBtYXgoc3RhdGUpIHtcclxuICAgICAgICB2YXIgbWF4ID0gMCwgbWF4QWN0aW9uID0gbnVsbDtcclxuICAgICAgICBmb3IgKHZhciBhY3Rpb24gaW4gdGhpcy5RW3N0YXRlXSkge1xyXG4gICAgICAgICAgICBpZiAoIW1heEFjdGlvbikge1xyXG4gICAgICAgICAgICAgICAgbWF4ID0gdGhpcy5RW3N0YXRlXVthY3Rpb25dO1xyXG4gICAgICAgICAgICAgICAgbWF4QWN0aW9uID0gYWN0aW9uO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuUVtzdGF0ZV1bYWN0aW9uXSA9PT0gbWF4ICYmIChNYXRoLnJhbmRvbSgpID4gMC41KSkge1xyXG4gICAgICAgICAgICAgICAgbWF4ID0gdGhpcy5RW3N0YXRlXVthY3Rpb25dO1xyXG4gICAgICAgICAgICAgICAgbWF4QWN0aW9uID0gYWN0aW9uO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuUVtzdGF0ZV1bYWN0aW9uXSA+IG1heCkge1xyXG4gICAgICAgICAgICAgICAgbWF4ID0gdGhpcy5RW3N0YXRlXVthY3Rpb25dO1xyXG4gICAgICAgICAgICAgICAgbWF4QWN0aW9uID0gYWN0aW9uO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBtYXhBY3Rpb247XHJcbiAgICB9XHJcbiAgICBwb3NzaWJsZShzdGF0ZSkge1xyXG4gICAgICAgIHZhciBwb3NzaWJsZSA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIGFjdGlvbiBpbiB0aGlzLlJbc3RhdGVdKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLlJbc3RhdGVdW2FjdGlvbl0gPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgcG9zc2libGUucHVzaChhY3Rpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwb3NzaWJsZVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwb3NzaWJsZS5sZW5ndGgpXTtcclxuICAgIH1cclxuICAgIGVwaXNvZGUoc3RhdGUpIHtcclxuICAgICAgICB0aGlzLnRyYW5zaXRpb24oc3RhdGUsIHRoaXMucG9zc2libGUoc3RhdGUpKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5RO1xyXG4gICAgfVxyXG4gICAgbm9ybWFsaXplKCkge1xyXG4gICAgICAgIGZvciAodmFyIHN0YXRlIGluIHRoaXMuUSkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBhY3Rpb24gaW4gdGhpcy5RW3N0YXRlXSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuUVthY3Rpb25dW3N0YXRlXSA+PSB0aGlzLnJhd01heCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmF3TWF4ID0gdGhpcy5RW2FjdGlvbl1bc3RhdGVdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAodmFyIHN0YXRlIGluIHRoaXMuUSkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBhY3Rpb24gaW4gdGhpcy5RW3N0YXRlXSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5RW2FjdGlvbl1bc3RhdGVdID0gTWF0aC5yb3VuZCh0aGlzLlFbYWN0aW9uXVtzdGF0ZV0gLyB0aGlzLnJhd01heCAqIDEwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9UUxlYXJuZXIuanMubWFwIiwiaW1wb3J0IHsgc3RhbmRhcmRpemVkLCBkYXRhVG9NYXRyaXggfSBmcm9tICcuL3V0aWxzJztcclxuZXhwb3J0IGZ1bmN0aW9uIG9scyhpdnMsIGR2KSB7XHJcbiAgICBsZXQgZGF0YSA9IGRhdGFUb01hdHJpeChpdnMsIHRoaXMuc3RhbmRhcmRpemVkKTtcclxuICAgIGxldCBkdkRhdGEgPSBkdi5kYXRhO1xyXG4gICAgbGV0IG4gPSBkdkRhdGEubGVuZ3RoO1xyXG4gICAgbGV0IG1lYW5zID0gaXZzLm1hcCgoYSkgPT4geyByZXR1cm4gYS5tZWFuOyB9KTtcclxuICAgIGxldCBzZHMgPSBpdnMubWFwKChhKSA9PiB7IHJldHVybiBhLnNkOyB9KTtcclxuICAgIGxldCB2YXJzID0gaXZzLm1hcCgoYSkgPT4geyByZXR1cm4gW2EudmFyaWFuY2VdOyB9KTtcclxuICAgIG1lYW5zLnVuc2hpZnQoMSk7XHJcbiAgICBzZHMudW5zaGlmdCgxKTtcclxuICAgIHZhcnMudW5zaGlmdChbMV0pO1xyXG4gICAgaWYgKHRoaXMuc3RhbmRhcmRpemVkKSB7XHJcbiAgICAgICAgZHZEYXRhID0gc3RhbmRhcmRpemVkKGR2LmRhdGEpO1xyXG4gICAgfVxyXG4gICAgbGV0IFggPSBkYXRhO1xyXG4gICAgbGV0IFkgPSBkdkRhdGEubWFwKCh5KSA9PiB7IHJldHVybiBbeV07IH0pO1xyXG4gICAgbGV0IFhwcmltZSA9IGpTdGF0LnRyYW5zcG9zZShYKTtcclxuICAgIGxldCBYcHJpbWVYID0galN0YXQubXVsdGlwbHkoWHByaW1lLCBYKTtcclxuICAgIGxldCBYcHJpbWVZID0galN0YXQubXVsdGlwbHkoWHByaW1lLCBZKTtcclxuICAgIC8vY29lZmZpY2llbnRzXHJcbiAgICBsZXQgYiA9IGpTdGF0Lm11bHRpcGx5KGpTdGF0LmludihYcHJpbWVYKSwgWHByaW1lWSk7XHJcbiAgICB0aGlzLmJldGFzID0gYi5yZWR1Y2UoKGEsIGIpID0+IHsgcmV0dXJuIGEuY29uY2F0KGIpOyB9KTtcclxuICAgIC8vc3RhbmRhcmQgZXJyb3Igb2YgdGhlIGNvZWZmaWNpZW50c1xyXG4gICAgdGhpcy5zdEVyckNvZWZmID0galN0YXQubXVsdGlwbHkoalN0YXQuaW52KFhwcmltZVgpLCB2YXJzKVxyXG4gICAgICAgIC5yZWR1Y2UoKGEsIGIpID0+IHsgcmV0dXJuIGEuY29uY2F0KGIpOyB9KTtcclxuICAgIC8vdCBzdGF0aXN0aWNzXHJcbiAgICB0aGlzLnRTdGF0cyA9IHRoaXMuc3RFcnJDb2VmZi5tYXAoKHNlLCBpKSA9PiB7IHJldHVybiB0aGlzLmJldGFzW2ldIC8gc2U7IH0pO1xyXG4gICAgLy9wIHZhbHVlc1xyXG4gICAgdGhpcy5wVmFsdWVzID0gdGhpcy50U3RhdHMubWFwKCh0LCBpKSA9PiB7IHJldHVybiBqU3RhdC50dGVzdCh0LCBtZWFuc1tpXSwgc2RzW2ldLCBuKTsgfSk7XHJcbiAgICAvL3Jlc2lkdWFsc1xyXG4gICAgbGV0IHloYXQgPSBbXTtcclxuICAgIGxldCByZXMgPSBkdi5kYXRhLm1hcCgoZCwgaSkgPT4ge1xyXG4gICAgICAgIGRhdGFbaV0uc2hpZnQoKTtcclxuICAgICAgICBsZXQgcm93ID0gZGF0YVtpXTtcclxuICAgICAgICB5aGF0W2ldID0gdGhpcy5wcmVkaWN0KHJvdyk7XHJcbiAgICAgICAgcmV0dXJuIGQgLSB5aGF0W2ldO1xyXG4gICAgfSk7XHJcbiAgICBsZXQgcmVzaWR1YWwgPSB5aGF0O1xyXG4gICAgcmV0dXJuIHRoaXMuYmV0YXM7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHBscyh4LCB5KSB7XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmVncmVzc2lvbi5qcy5tYXAiLCJpbXBvcnQgeyBRQ29tcG9uZW50IH0gZnJvbSAnLi9RQ29tcG9uZW50JztcclxuLypcclxuKiBVdGlsaXR5IFN5c3RlbXMgY2xhc3NcclxuKi9cclxuZXhwb3J0IGNsYXNzIFVTeXMgZXh0ZW5kcyBRQ29tcG9uZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIG9wdGlvbnMsIGRhdGEpIHtcclxuICAgICAgICBzdXBlcihuYW1lKTtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgICAgIHRoaXMucmVzdWx0cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoYWdlbnQsIHN0ZXApIHtcclxuICAgICAgICB2YXIgdG1wID0gW10sIG1heCA9IDAsIGF2ZywgdG9wO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5vcHRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRtcFtpXSA9IDA7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5vcHRpb25zW2ldLmNvbnNpZGVyYXRpb25zLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYyA9IHRoaXMub3B0aW9uc1tpXS5jb25zaWRlcmF0aW9uc1tqXTtcclxuICAgICAgICAgICAgICAgIGxldCB4ID0gYy54KGFnZW50LCB0aGlzLm9wdGlvbnNbaV0ucGFyYW1zKTtcclxuICAgICAgICAgICAgICAgIHRtcFtpXSArPSBjLmYoeCwgYy5tLCBjLmIsIGMuayk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYXZnID0gdG1wW2ldIC8gdGhpcy5vcHRpb25zW2ldLmNvbnNpZGVyYXRpb25zLmxlbmd0aDtcclxuICAgICAgICAgICAgdGhpcy5yZXN1bHRzLnB1c2goeyBwb2ludDogYWdlbnQuaWQsIG9wdDogdGhpcy5vcHRpb25zW2ldLm5hbWUsIHJlc3VsdDogYXZnIH0pO1xyXG4gICAgICAgICAgICBpZiAoYXZnID4gbWF4KSB7XHJcbiAgICAgICAgICAgICAgICBhZ2VudC50b3AgPSB7IG5hbWU6IHRoaXMub3B0aW9uc1tpXS5uYW1lLCB1dGlsOiBhdmcgfTtcclxuICAgICAgICAgICAgICAgIHRvcCA9IGk7XHJcbiAgICAgICAgICAgICAgICBtYXggPSBhdmc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vcHRpb25zW3RvcF0uYWN0aW9uKHN0ZXAsIGFnZW50KTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1VU3lzLmpzLm1hcCIsImV4cG9ydCAqIGZyb20gJy4vdXRpbHMnO1xyXG5leHBvcnQgeyBRQ29tcG9uZW50IH0gZnJvbSAnLi9RQ29tcG9uZW50JztcclxuZXhwb3J0IHsgQkRJQWdlbnQgfSBmcm9tICcuL2JkaSc7XHJcbmV4cG9ydCAqIGZyb20gJy4vYmVoYXZpb3JUcmVlJztcclxuZXhwb3J0ICogZnJvbSAnLi9jb21wYXJ0bWVudCc7XHJcbmV4cG9ydCB7IENvbnRhY3RQYXRjaCB9IGZyb20gJy4vY29udGFjdFBhdGNoJztcclxuZXhwb3J0IHsgRW52aXJvbm1lbnQgfSBmcm9tICcuL2Vudmlyb25tZW50JztcclxuZXhwb3J0ICogZnJvbSAnLi9lcGknO1xyXG5leHBvcnQgKiBmcm9tICcuL2V2ZW50cyc7XHJcbmV4cG9ydCB7IEV4cGVyaW1lbnQgfSBmcm9tICcuL2V4cGVyaW1lbnQnO1xyXG5leHBvcnQgKiBmcm9tICcuL2dlbmV0aWMnO1xyXG5leHBvcnQgeyBFdm9sdXRpb25hcnkgfSBmcm9tICcuL2V2b2x1dGlvbmFyeSc7XHJcbmV4cG9ydCB7IEh5YnJpZEF1dG9tYXRhIH0gZnJvbSAnLi9oYSc7XHJcbmV4cG9ydCAqIGZyb20gJy4vaHRuJztcclxuZXhwb3J0IHsga01lYW4gfSBmcm9tICcuL2ttZWFuJztcclxuZXhwb3J0IHsgS05OIH0gZnJvbSAnLi9rbm4nO1xyXG5leHBvcnQgKiBmcm9tICcuL21hdGgnO1xyXG5leHBvcnQgeyBOZXR3b3JrIH0gZnJvbSAnLi9uZXR3b3JrJztcclxuZXhwb3J0IHsgUUxlYXJuZXIgfSBmcm9tICcuL1FMZWFybmVyJztcclxuZXhwb3J0ICogZnJvbSAnLi9yZWdyZXNzaW9uJztcclxuZXhwb3J0IHsgU3RhdGVNYWNoaW5lIH0gZnJvbSAnLi9zdGF0ZU1hY2hpbmUnO1xyXG5leHBvcnQgKiBmcm9tICcuL1VTeXMnO1xyXG5leHBvcnQgdmFyIHZlcnNpb24gPSAnMC4wLjEnO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYWluLmpzLm1hcCIsIi8qKipcclxuKkBtb2R1bGUgUUVwaUtpdFxyXG4qL1xyXG5pbXBvcnQgKiBhcyBxZXBpa2l0IGZyb20gJy4vbWFpbic7XHJcbmxldCBRRXBpS2l0ID0gcWVwaWtpdDtcclxuZm9yIChsZXQga2V5IGluIFFFcGlLaXQpIHtcclxuICAgIGlmIChrZXkgPT0gJ3ZlcnNpb24nKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coUUVwaUtpdFtrZXldKTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1xZXBpa2l0LmpzLm1hcCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFPLE1BQU0sT0FBTyxHQUFHLENBQUMsQ0FBQztBQUN6QixBQUFPLE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBQztBQUN4QixBQUFPLE1BQU0sT0FBTyxHQUFHLENBQUMsQ0FBQztBQUN6QixBQUFPLFNBQVMsWUFBWSxDQUFDLElBQUksRUFBRTtJQUMvQixJQUFJLFVBQVUsQ0FBQztJQUNmLElBQUksR0FBRyxDQUFDO0lBQ1IsSUFBSSxVQUFVLEdBQUcsOEJBQThCLENBQUM7SUFDaEQsSUFBSSxlQUFlLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxTQUFTLEVBQUU7UUFDOUIsVUFBVSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUNwQyxDQUFDLENBQUM7SUFDSCxVQUFVLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6QyxHQUFHLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzVCLE9BQU8sR0FBRyxDQUFDO0NBQ2Q7QUFDRCxBQUFPLFNBQVMsY0FBYyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO0lBQzdDLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUNmLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUNkLE9BQU8sQ0FBQyxHQUFHLEdBQUcsRUFBRTtRQUNaLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDZCxDQUFDLElBQUksSUFBSSxDQUFDO0tBQ2I7SUFDRCxPQUFPLEtBQUssQ0FBQztDQUNoQjs7OztB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QUMsQ0FBQyxDQUFDO2FBQ2xCO1lBQ0QsTUFBTTtLQUNiO0lBQ0QsT0FBTyxNQUFNLENBQUM7Q0FDakI7QUFDRCxBQUFPLFNBQVMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUU7SUFDakMsS0FBSyxJQUFJLEtBQUssSUFBSSxNQUFNLEVBQUU7UUFDdEIsSUFBSSxRQUFRLElBQUksQ0FBQyxLQUFLLFdBQVcsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQzdELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDO1NBQ3JFO2FBQ0ksSUFBSSxRQUFRLElBQUksQ0FBQyxLQUFLLFdBQVcsRUFBRTtZQUNwQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQztTQUNyRTtLQUNKO0NBQ0o7QUFDRCxBQUFPLFNBQVMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUU7SUFDakMsS0FBSyxJQUFJLEtBQUssSUFBSSxNQUFNLEVBQUU7UUFDdEIsSUFBSSxRQUFRLElBQUksQ0FBQyxLQUFLLFdBQVcsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQzdELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDO1NBQ3JFO2FBQ0ksSUFBSSxRQUFRLElBQUksQ0FBQyxLQUFLLFdBQVcsRUFBRTtZQUNwQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQztTQUNyRTtLQUNKO0NBQ0o7QUFDRCxBQUFPLFNBQVMsV0FBVyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUU7SUFDdEMsS0FBSyxJQUFJLEtBQUssSUFBSSxNQUFNLEVBQUU7UUFDdEIsSUFBSSxRQUFRLElBQUksQ0FBQyxLQUFLLFdBQVcsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQzdELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQztTQUMvQzthQUNJLElBQUksUUFBUSxJQUFJLENBQUMsS0FBSyxXQUFXLEVBQUU7WUFDcEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDO1NBQy9DO0tBQ0o7Q0FDSjtBQUNELEFBQU8sU0FBUyxZQUFZLENBQUMsS0FBSyxFQUFFLE9BQU8sR0FBRyxLQUFLLEVBQUU7SUFDakQsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ2QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDbkMsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLElBQUksT0FBTyxFQUFFO1lBQ1QsSUFBSSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM3QjtRQUNELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxLQUFLO1lBQ3BCLElBQUksT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssV0FBVyxFQUFFO2dCQUNqQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDckI7aUJBQ0k7Z0JBQ0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNwQjtTQUNKLENBQUMsQ0FBQztLQUNOO0lBQ0QsT0FBTyxJQUFJLENBQUM7Q0FDZjs7OztBQUlELEFBQU8sU0FBUyxZQUFZLENBQUMsR0FBRyxFQUFFO0lBQzlCLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0IsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMzQixJQUFJLFlBQVksR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLO1FBQzlCLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxJQUFJLEdBQUcsQ0FBQztLQUMzQixDQUFDLENBQUM7SUFDSCxPQUFPLFlBQVksQ0FBQztDQUN2Qjs7OztBQUlELEFBQU8sU0FBUyxTQUFTLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7SUFDbkMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztJQUNsQixPQUFPLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7Q0FDNUI7Ozs7QUFJRCxBQUFPLFNBQVMsT0FBTyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFO0lBQ2pDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDO0NBQ3BDOzs7O0FBSUQsQUFBTyxTQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFO0lBQ2hDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUM7Q0FDNUM7QUFDRCxBQUFPLFNBQVMsUUFBUSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUU7SUFDakMsSUFBSSxLQUFLLEdBQUc7UUFDUixHQUFHLEVBQUUsSUFBSTtRQUNULEdBQUcsRUFBRSxDQUFDLElBQUk7S0FDYixDQUFDO0lBQ0YsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDbEMsSUFBSSxLQUFLLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUMzQixLQUFLLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM3QjtRQUNELElBQUksS0FBSyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDM0IsS0FBSyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDN0I7S0FDSjtJQUNELE9BQU8sS0FBSyxDQUFDO0NBQ2hCO0FBQ0QsQUFBTyxNQUFNLEtBQUssQ0FBQztJQUNmLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDWixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDUCxPQUFPLElBQUksQ0FBQztTQUNmO1FBQ0QsT0FBTyxLQUFLLENBQUM7S0FDaEI7SUFDRCxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ1osSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUNELE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0lBQ0QsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUNaLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNQLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFDRCxPQUFPLEtBQUssQ0FBQztLQUNoQjtJQUNELE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDWixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO1FBQ0QsT0FBTyxLQUFLLENBQUM7S0FDaEI7Q0FDSjtBQUNELEFBQU8sU0FBUyxXQUFXLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRTtJQUM5RSxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7SUFDYixJQUFJLElBQUksR0FBRztRQUNQLElBQUksRUFBRSxtQkFBbUI7UUFDekIsUUFBUSxFQUFFLEVBQUU7S0FDZixDQUFDO0lBQ0YsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7SUFDeEIsSUFBSSxHQUFHLElBQUksSUFBSSxZQUFZLENBQUM7SUFDNUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNoQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUc7WUFDTCxFQUFFLEVBQUUsY0FBYztZQUNsQixJQUFJLEVBQUUsSUFBSTtTQUNiLENBQUM7O1FBRUYsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsSUFBSSxHQUFHLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztRQUN0QixJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssWUFBWSxFQUFFO1lBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQztnQkFDMUYsS0FBSyxFQUFFLFFBQVE7YUFDbEIsQ0FBQyxDQUFDLENBQUM7WUFDSixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQzVCLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztZQUMzQixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUN2QyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDakUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUMzQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7O1NBRTlDO1FBQ0QsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFlBQVksRUFBRTtZQUM5QixJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxTQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1RixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7U0FDckQ7UUFDRCxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLO1lBQ25CLElBQUksT0FBTyxDQUFDLENBQUMsTUFBTSxLQUFLLFVBQVUsRUFBRTtnQkFDaEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3JDO2lCQUNJO2dCQUNELEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQzthQUM3QjtTQUNKLENBQUMsQ0FBQztRQUNILGNBQWMsRUFBRSxDQUFDO0tBQ3BCO0lBQ0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN4QixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUM7UUFDckMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDekIsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUM7S0FDN0I7SUFDRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNqQyxLQUFLLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUU7WUFDM0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7U0FDckM7S0FDSjtJQUNELE9BQU8sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7Q0FDdEIsQUFDRDs7QUN0WEE7OztBQUdBLEFBQU8sTUFBTSxVQUFVLENBQUM7SUFDcEIsV0FBVyxDQUFDLElBQUksRUFBRTtRQUNkLElBQUksQ0FBQyxFQUFFLEdBQUcsWUFBWSxFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7UUFDZCxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztLQUNyQjs7OztJQUlELE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFOztLQUVuQjtDQUNKO0FBQ0QsVUFBVSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDdkIsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDdEIsVUFBVSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQUFDdkI7O0FDbkJBOzs7QUFHQSxBQUFPLE1BQU0sUUFBUSxTQUFTLFVBQVUsQ0FBQztJQUNyQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssR0FBRyxFQUFFLEVBQUUsS0FBSyxHQUFHLEVBQUUsRUFBRSxJQUFJLEdBQUcsRUFBRSxFQUFFLGNBQWMsR0FBRyxRQUFRLENBQUMsbUJBQW1CLEVBQUU7UUFDaEcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ1osSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7UUFDckMsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7S0FDekI7Ozs7SUFJRCxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRTtRQUNoQixJQUFJLE1BQU0sRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDO1FBQy9CLE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNsRSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1QixNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3BCLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLFlBQVksRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsVUFBVSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7S0FDM0w7SUFDRCxhQUFhLENBQUMsS0FBSyxFQUFFO1FBQ2pCLElBQUksWUFBWSxHQUFHLEVBQUUsRUFBRSxRQUFRLEdBQUcsRUFBRSxFQUFFLFNBQVMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBQztRQUNoRSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDeEMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQzVCLElBQUksT0FBTyxDQUFDLENBQUMsSUFBSSxLQUFLLFdBQVcsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRTtnQkFDckQsQ0FBQyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7YUFDbEI7WUFDRCxZQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUMxRSxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLENBQUMsT0FBTyxFQUFFO2dCQUN0QyxTQUFTLElBQUksQ0FBQyxDQUFDO2FBQ2xCO2lCQUNJO2dCQUNELE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3BDLFFBQVEsQ0FBQyxJQUFJLENBQUM7b0JBQ1YsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLO29CQUNkLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRztvQkFDVixLQUFLLEVBQUUsT0FBTztvQkFDZCxNQUFNLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO29CQUNyQixRQUFRLEVBQUUsQ0FBQyxDQUFDLEtBQUs7aUJBQ3BCLENBQUMsQ0FBQzthQUNOO1NBQ0o7UUFDRCxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsQ0FBQztLQUNuRjs7SUFFRCxPQUFPLG1CQUFtQixDQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFO1FBQ2xELElBQUksTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxFQUFFO1lBQ3BCLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDdEIsSUFBSSxLQUFLLElBQUksR0FBRyxFQUFFO2dCQUNkLEdBQUcsR0FBRyxLQUFLLENBQUM7Z0JBQ1osTUFBTSxHQUFHLElBQUksQ0FBQzthQUNqQjtTQUNKO1FBQ0QsT0FBTyxNQUFNLENBQUM7S0FDakI7Q0FDSjtBQUNELFFBQVEsQ0FBQyxtQkFBbUIsR0FBRyxVQUFVLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFO0lBQ2hFLElBQUksT0FBTyxFQUFFLFNBQVMsQ0FBQztJQUN2QixJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFO1FBQ2YsT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDN0IsT0FBTyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQzFEO1NBQ0k7UUFDRCxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM3QixTQUFTLEdBQUcsQ0FBQyxDQUFDO0tBQ2pCO0lBQ0QsT0FBTyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7Q0FDN0IsQ0FBQyxBQUNGOztBQzFFQTs7O0FBR0EsQUFBTyxNQUFNLFlBQVksU0FBUyxVQUFVLENBQUM7SUFDekMsT0FBTyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRTtRQUNyQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hDLE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0lBQ0QsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFO1FBQzFCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNaLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0tBQ3JCO0lBQ0QsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUU7UUFDaEIsSUFBSSxLQUFLLENBQUM7UUFDVixLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUNwQixPQUFPLEtBQUssQ0FBQyxNQUFNLEtBQUssSUFBSSxFQUFFO1lBQzFCLEtBQUssR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDNUMsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ3ZCLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1NBQ3hCO1FBQ0QsT0FBTyxLQUFLLENBQUM7S0FDaEI7Q0FDSjtBQUNELEFBQU8sTUFBTSxNQUFNLENBQUM7SUFDaEIsV0FBVyxDQUFDLElBQUksRUFBRTtRQUNkLElBQUksQ0FBQyxFQUFFLEdBQUcsWUFBWSxFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7S0FDcEI7Q0FDSjtBQUNELEFBQU8sTUFBTSxhQUFhLFNBQVMsTUFBTSxDQUFDO0lBQ3RDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFO1FBQ3hCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNaLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0tBQzVCO0NBQ0o7QUFDRCxBQUFPLE1BQU0sTUFBTSxTQUFTLGFBQWEsQ0FBQztJQUN0QyxXQUFXLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRTtRQUN4QixLQUFLLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDO1FBQ25CLElBQUksQ0FBQyxPQUFPLEdBQUcsVUFBVSxLQUFLLEVBQUU7WUFDNUIsSUFBSSxLQUFLLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3ZELE9BQU8sS0FBSyxDQUFDO1NBQ2hCLENBQUM7S0FDTDtDQUNKO0FBQ0QsQUFBTyxNQUFNLFVBQVUsU0FBUyxhQUFhLENBQUM7SUFDMUMsV0FBVyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7UUFDeEIsS0FBSyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQztRQUN2QixJQUFJLENBQUMsT0FBTyxHQUFHLFVBQVUsS0FBSyxFQUFFO1lBQzVCLElBQUksVUFBVSxDQUFDO1lBQ2YsS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUM3QixVQUFVLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUM1RCxJQUFJLFVBQVUsS0FBSyxZQUFZLENBQUMsT0FBTyxFQUFFO29CQUNyQyxPQUFPLFlBQVksQ0FBQyxPQUFPLENBQUM7aUJBQy9CO2dCQUNELElBQUksVUFBVSxLQUFLLFlBQVksQ0FBQyxPQUFPLEVBQUU7b0JBQ3JDLE9BQU8sWUFBWSxDQUFDLE9BQU8sQ0FBQztpQkFDL0I7YUFDSjtZQUNELE9BQU8sWUFBWSxDQUFDLE1BQU0sQ0FBQztTQUM5QixDQUFDO0tBQ0w7Q0FDSjtBQUNELEFBQU8sTUFBTSxVQUFVLFNBQVMsYUFBYSxDQUFDO0lBQzFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFO1FBQ3hCLEtBQUssQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDdEIsSUFBSSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxVQUFVLEtBQUssRUFBRTtZQUM1QixJQUFJLFVBQVUsQ0FBQztZQUNmLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDN0IsVUFBVSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDNUQsSUFBSSxVQUFVLEtBQUssWUFBWSxDQUFDLE9BQU8sRUFBRTtvQkFDckMsT0FBTyxZQUFZLENBQUMsT0FBTyxDQUFDO2lCQUMvQjtnQkFDRCxJQUFJLFVBQVUsS0FBSyxZQUFZLENBQUMsTUFBTSxFQUFFO29CQUNwQyxPQUFPLFlBQVksQ0FBQyxNQUFNLENBQUM7aUJBQzlCO2FBQ0o7WUFDRCxPQUFPLFlBQVksQ0FBQyxPQUFPLENBQUM7U0FDL0IsQ0FBQztLQUNMO0NBQ0o7QUFDRCxBQUFPLE1BQU0sVUFBVSxTQUFTLGFBQWEsQ0FBQztJQUMxQyxXQUFXLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUU7UUFDbkMsS0FBSyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQztRQUN2QixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsT0FBTyxHQUFHLFVBQVUsS0FBSyxFQUFFO1lBQzVCLElBQUksU0FBUyxHQUFHLEVBQUUsRUFBRSxRQUFRLEdBQUcsRUFBRSxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUM7WUFDeEQsS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUM3QixVQUFVLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUM1RCxJQUFJLFVBQVUsS0FBSyxZQUFZLENBQUMsT0FBTyxFQUFFO29CQUNyQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUM5QjtxQkFDSSxJQUFJLFVBQVUsS0FBSyxZQUFZLENBQUMsTUFBTSxFQUFFO29CQUN6QyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUM3QjtxQkFDSSxJQUFJLFVBQVUsS0FBSyxZQUFZLENBQUMsT0FBTyxFQUFFO29CQUMxQyxPQUFPLFlBQVksQ0FBQyxPQUFPLENBQUM7aUJBQy9CO2FBQ0o7WUFDRCxJQUFJLFNBQVMsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDcEMsT0FBTyxZQUFZLENBQUMsT0FBTyxDQUFDO2FBQy9CO2lCQUNJO2dCQUNELE9BQU8sWUFBWSxDQUFDLE1BQU0sQ0FBQzthQUM5QjtTQUNKLENBQUM7S0FDTDtDQUNKO0FBQ0QsQUFBTyxNQUFNLFdBQVcsU0FBUyxNQUFNLENBQUM7SUFDcEMsV0FBVyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7UUFDekIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ1osSUFBSSxDQUFDLElBQUksR0FBRyxXQUFXLENBQUM7UUFDeEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxVQUFVLEtBQUssRUFBRTtZQUM1QixJQUFJLEtBQUssQ0FBQztZQUNWLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9ELE9BQU8sS0FBSyxDQUFDO1NBQ2hCLENBQUM7S0FDTDtDQUNKO0FBQ0QsQUFBTyxNQUFNLFFBQVEsU0FBUyxNQUFNLENBQUM7SUFDakMsV0FBVyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFO1FBQ2pDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNaLElBQUksQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxPQUFPLEdBQUcsVUFBVSxLQUFLLEVBQUU7WUFDNUIsSUFBSSxLQUFLLENBQUM7WUFDVixLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvRCxJQUFJLEtBQUssS0FBSyxZQUFZLENBQUMsT0FBTyxFQUFFO2dCQUNoQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3RCO1lBQ0QsT0FBTyxLQUFLLENBQUM7U0FDaEIsQ0FBQztLQUNMO0NBQ0osQUFDRDs7QUM5SU8sTUFBTSxnQkFBZ0IsU0FBUyxVQUFVLENBQUM7SUFDN0MsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUU7UUFDcEIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ1osSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDbEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3ZDLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7U0FDMUM7UUFDRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztLQUMxQjtJQUNELE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFO1FBQ2hCLElBQUksUUFBUSxHQUFHLEVBQUUsRUFBRSxNQUFNLEdBQUcsRUFBRSxFQUFFLE1BQU0sR0FBRyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxFQUFFLE9BQU8sQ0FBQztRQUN4RSxJQUFJLFlBQVksR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFDO1FBQ3RDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDeEU7O1FBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDMUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDbEMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDakMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pEOztRQUVELEtBQUssQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMxRCxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEUsS0FBSyxDQUFDLFFBQVEsSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1NBQ3pDO0tBQ0o7Q0FDSjtBQUNELEFBQU8sTUFBTSxXQUFXLENBQUM7SUFDckIsV0FBVyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFO1FBQzlCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLElBQUksSUFBSSxDQUFDO1FBQ25DLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0tBQ2pCO0NBQ0o7QUFDRCxBQUFPLE1BQU0sS0FBSyxDQUFDO0lBQ2YsV0FBVyxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7UUFDNUIsSUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7UUFDakMsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDbEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQy9DLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDMUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7U0FDOUQ7S0FDSjtJQUNELE9BQU8sS0FBSyxHQUFHO1FBQ1gsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ1osT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDO0tBQ3BCO0NBQ0o7QUFDRCxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxBQUNkOztBQ3pETyxNQUFNLFlBQVksQ0FBQztJQUN0QixXQUFXLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRTtRQUN4QixJQUFJLENBQUMsRUFBRSxHQUFHLFlBQVksRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ2IsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7S0FDckI7SUFDRCxPQUFPLFlBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ3RCLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDO1FBQy9DLE9BQU8sR0FBRyxDQUFDO0tBQ2Q7SUFDRCxPQUFPLGVBQWUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFO1FBQzVCLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO2FBQ0k7WUFDRCxPQUFPLEtBQUssQ0FBQztTQUNoQjtLQUNKO0lBQ0QsTUFBTSxDQUFDLEtBQUssRUFBRSxnQkFBZ0IsRUFBRTtRQUM1QixJQUFJLFlBQVksQ0FBQztRQUNqQixnQkFBZ0IsR0FBRyxnQkFBZ0IsSUFBSSxZQUFZLENBQUMsWUFBWSxDQUFDO1FBQ2pFLElBQUksSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQzFCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDO1lBQy9DLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDNUIsSUFBSSxFQUFFLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN6QixJQUFJLEtBQUssS0FBSyxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFO29CQUNsQyxZQUFZLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQ3BFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFlBQVksQ0FBQztvQkFDMUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxDQUFDO2lCQUM3QzthQUNKO1lBQ0QsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ1gsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDO1NBQ2xCO2FBQ0k7WUFDRCxPQUFPLElBQUksQ0FBQztTQUNmO0tBQ0o7SUFDRCxVQUFVLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLElBQUksR0FBRyxLQUFLLEVBQUU7UUFDbEUsV0FBVyxHQUFHLFdBQVcsSUFBSSxZQUFZLENBQUMsZUFBZSxDQUFDO1FBQzFELElBQUksVUFBVSxDQUFDO1FBQ2YsS0FBSyxJQUFJLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQzlCLElBQUksWUFBWSxDQUFDLEdBQUcsS0FBSyxRQUFRLEVBQUU7Z0JBQy9CLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQ25GO2lCQUNJO2dCQUNELFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDbkU7WUFDRCxJQUFJLFlBQVksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFlBQVksQ0FBQyxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUUsRUFBRTtnQkFDNUgsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3pELElBQUksTUFBTSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUN2RCxJQUFJLE1BQU0sS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtvQkFDcEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsTUFBTSxDQUFDO29CQUNyRCxZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQzt3QkFDdkIsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFO3dCQUNoQixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7d0JBQ2YsUUFBUSxFQUFFLE9BQU87d0JBQ2pCLFdBQVcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHO3dCQUNqRCxNQUFNLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDO3dCQUNuRCxTQUFTLEVBQUUsU0FBUzt3QkFDcEIsRUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFFO3dCQUNaLEtBQUssRUFBRSxLQUFLLENBQUMsR0FBRzt3QkFDaEIsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO3FCQUNuQixDQUFDLENBQUM7aUJBQ047YUFDSjtTQUNKO0tBQ0o7Q0FDSjtBQUNELFlBQVksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDLEFBQzNCOztBQ3pFQTs7OztBQUlBLEFBQU8sTUFBTSxXQUFXLENBQUM7SUFDckIsV0FBVyxDQUFDLFNBQVMsR0FBRyxFQUFFLEVBQUUsVUFBVSxHQUFHLEVBQUUsRUFBRSxXQUFXLEdBQUcsRUFBRSxFQUFFLGNBQWMsR0FBRyxRQUFRLEVBQUUsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDM0csSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7UUFDZCxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUMvQixJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztRQUNyQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztLQUN6Qjs7OztJQUlELEdBQUcsQ0FBQyxTQUFTLEVBQUU7UUFDWCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUMvQjs7OztJQUlELE1BQU0sQ0FBQyxFQUFFLEVBQUU7UUFDUCxJQUFJLFdBQVcsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDeEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUN2RCxXQUFXLEdBQUcsS0FBSyxDQUFDO1NBQ3ZCLEVBQUUsQ0FBQyxDQUFDO1FBQ0wsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtZQUNyQyxDQUFDLEVBQUUsQ0FBQztZQUNKLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEtBQUssV0FBVyxFQUFFO2dCQUMzQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDNUI7U0FDSjtRQUNELElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUN0Qzs7Ozs7O0lBTUQsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFO1FBQzNCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNaLE9BQU8sSUFBSSxDQUFDLElBQUksSUFBSSxLQUFLLEVBQUU7WUFDdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsQixJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLFlBQVksQ0FBQyxDQUFDO1lBQ3JDLElBQUksR0FBRyxHQUFHLElBQUksRUFBRTtnQkFDWixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ25ELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDNUM7WUFDRCxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQztZQUNsQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7U0FDckI7S0FDSjs7O0lBR0QsSUFBSSxHQUFHO1FBQ0gsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFDdEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3pDLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQzs7WUFFbkIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDakQsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUNuQyxJQUFJLEVBQUUsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFOztvQkFFeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN4RCxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM1QyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUN0QjtxQkFDSTs7b0JBRUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3RELElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUM3QzthQUNKOztZQUVELElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSztnQkFDcEQsSUFBSSxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtvQkFDaEMsT0FBTyxLQUFLLENBQUM7aUJBQ2hCO2dCQUNELE9BQU8sSUFBSSxDQUFDO2FBQ2YsQ0FBQyxDQUFDOztZQUVILElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN6RDtLQUNKOzs7O0lBSUQsTUFBTSxDQUFDLElBQUksRUFBRTtRQUNULElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNkLE9BQU8sS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDL0UsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNsQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFDekMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUM1QyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDckM7WUFDRCxLQUFLLEVBQUUsQ0FBQztTQUNYO1FBQ0QsSUFBSSxJQUFJLENBQUMsY0FBYyxLQUFLLFFBQVEsRUFBRTtZQUNsQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSztnQkFDOUIsS0FBSyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLEtBQUs7b0JBQ3ZDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztpQkFDL0MsQ0FBQyxDQUFDO2dCQUNILEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDO2FBQ3ZDLENBQUMsQ0FBQztTQUNOO1FBQ0QsSUFBSSxJQUFJLENBQUMsY0FBYyxLQUFLLFVBQVUsRUFBRTtZQUNwQyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDekQsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssS0FBSztnQkFDMUIsS0FBSyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLEtBQUs7b0JBQ3ZDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztpQkFDL0MsQ0FBQyxDQUFDO2FBQ04sQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLO2dCQUM5QixLQUFLLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsS0FBSztvQkFDdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztpQkFDN0QsQ0FBQyxDQUFDO2dCQUNILEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDO2FBQ3ZDLENBQUMsQ0FBQztTQUNOO0tBQ0o7Ozs7SUFJRCxVQUFVLEdBQUc7UUFDVCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0tBQ2xDOzs7O0lBSUQsWUFBWSxDQUFDLEVBQUUsRUFBRTtRQUNiLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDNUM7Q0FDSixBQUNEOztBQy9JTyxNQUFNLEdBQUcsQ0FBQztJQUNiLE9BQU8sVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUU7UUFDNUIsSUFBSSxJQUFJLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUN6QixPQUFPLElBQUksQ0FBQztLQUNmO0lBQ0QsT0FBTyxjQUFjLENBQUMsS0FBSyxFQUFFO1FBQ3pCLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2RSxPQUFPLEVBQUUsQ0FBQztLQUNiO0lBQ0QsT0FBTyxTQUFTLENBQUMsS0FBSyxFQUFFO1FBQ3BCLElBQUksTUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0UsT0FBTyxNQUFNLENBQUM7S0FDakI7SUFDRCxPQUFPLFNBQVMsQ0FBQyxLQUFLLEVBQUU7UUFDcEIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkQsT0FBTyxFQUFFLENBQUM7S0FDYjtJQUNELE9BQU8sS0FBSyxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRTtRQUNsRCxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ3RDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQzlCLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDUixTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUNyQyxDQUFDLENBQUM7UUFDSCxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUM5QixFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ1IsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDLEVBQUU7Z0JBQ2hDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQzthQUM1SSxDQUFDLENBQUM7U0FDTixDQUFDLENBQUM7UUFDSCxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDWCxLQUFLLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsVUFBVSxFQUFFLElBQUksRUFBRSxFQUFFO2dCQUMxQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQVUsR0FBRyxFQUFFLEVBQUUsRUFBRTtvQkFDakMsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDO29CQUN4QixHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsSUFBSSxFQUFFLENBQUMsRUFBRTt3QkFDM0IsZUFBZSxJQUFJLElBQUksQ0FBQztxQkFDM0IsQ0FBQyxDQUFDO29CQUNILEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJLEVBQUUsRUFBRSxFQUFFO3dCQUM1QixTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxHQUFHLGVBQWUsQ0FBQzt3QkFDM0MsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDdEMsQ0FBQyxDQUFDO2lCQUNOLENBQUMsQ0FBQztnQkFDSCxLQUFLLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsRUFBRTtvQkFDN0MsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDO29CQUN4QixTQUFTLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRTt3QkFDOUIsZUFBZSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDN0IsQ0FBQyxDQUFDO29CQUNILFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLEVBQUUsRUFBRSxFQUFFO3dCQUNqQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLGVBQWUsQ0FBQzt3QkFDaEQsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDeEMsQ0FBQyxDQUFDO2lCQUNOO2FBQ0o7WUFDRCxPQUFPLFNBQVMsQ0FBQztTQUNwQjtLQUNKO0NBQ0osQUFDRDs7QUN4REE7OztBQUdBLEFBQU8sTUFBTSxNQUFNLENBQUM7SUFDaEIsV0FBVyxDQUFDLE1BQU0sR0FBRyxFQUFFLEVBQUU7UUFDckIsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDaEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUN6Qjs7Ozs7OztJQU9ELGlCQUFpQixDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFO1FBQ2xDLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNmLElBQUksUUFBUSxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQy9CLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFO1lBQ2YsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDO1NBQzVCO1FBQ0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLFVBQVUsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNsQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7U0FDcEo7UUFDRCxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3hCOzs7OztJQUtELFFBQVEsQ0FBQyxPQUFPLEVBQUU7UUFDZCxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ3pCLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO1NBQzdCLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDaEU7SUFDRCxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUU7UUFDMUIsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsTUFBTSxHQUFHLElBQUksRUFBRSxNQUFNLENBQUM7UUFDckQsS0FBSyxNQUFNLEdBQUcsSUFBSSxFQUFFLE1BQU0sR0FBRyxLQUFLLEdBQUcsQ0FBQyxFQUFFLE1BQU0sSUFBSSxDQUFDLEVBQUU7WUFDakQsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLEdBQUcsRUFBRTtnQkFDekIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUNqQyxNQUFNLElBQUksQ0FBQyxDQUFDO2FBQ2Y7U0FDSjtRQUNELElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDcEMsT0FBTyxNQUFNLENBQUM7S0FDakI7SUFDRCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDZCxJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEIsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQixLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0lBQ0QsUUFBUSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFO1FBQzFCLElBQUksSUFBSSxHQUFHLEtBQUssRUFBRTtZQUNkLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM1QyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztTQUN2QztRQUNELE9BQU8sTUFBTSxDQUFDO0tBQ2pCO0NBQ0osQUFDRDs7QUM5RE8sTUFBTSxZQUFZLFNBQVMsVUFBVSxDQUFDO0lBQ3pDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFO1FBQ3JELEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNaLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0tBQ3BCO0lBQ0QsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUU7UUFDaEIsS0FBSyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ3hCLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDaEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUM5QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUN0RCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDeEMsSUFBSSxLQUFLLEtBQUssS0FBSyxFQUFFO3dCQUNqQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ3JELElBQUksS0FBSyxDQUFDO3dCQUNWLElBQUksUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssVUFBVSxFQUFFOzRCQUNwQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO3lCQUN4Qjs2QkFDSTs0QkFDRCxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQzt5QkFDdEI7d0JBQ0QsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO3dCQUMzQyxJQUFJLENBQUMsS0FBSyxZQUFZLENBQUMsT0FBTyxFQUFFOzRCQUM1QixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDOzRCQUN6QyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7NEJBQ3JDLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQzt5QkFDM0M7cUJBQ0o7aUJBQ0o7YUFDSjtTQUNKO0tBQ0o7SUFDRCxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUU7UUFDMUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDekMsSUFBSSxPQUFPLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO2dCQUN6QyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQy9DO2lCQUNJOzthQUVKO1NBQ0o7UUFDRCxPQUFPLFdBQVcsQ0FBQztLQUN0QjtDQUNKLEFBQ0Q7O0FDM0NBOzs7QUFHQSxBQUFPLE1BQU0sVUFBVSxDQUFDO0lBQ3BCLFdBQVcsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRTtRQUNwQyxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUMvQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDM0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7S0FDM0I7SUFDRCxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUU7UUFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1YsT0FBTyxDQUFDLEdBQUcsSUFBSSxFQUFFO1lBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25ELENBQUMsRUFBRSxDQUFDO1NBQ1A7S0FDSjtJQUNELElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUU7UUFDNUIsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLElBQUksY0FBYyxHQUFHLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksV0FBVyxFQUFFLENBQUM7UUFDckMsSUFBSSxPQUFPLEdBQUcsQ0FBQyxNQUFNLEtBQUssV0FBVyxFQUFFO1lBQ25DLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLO2dCQUMxQixNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLFVBQVUsRUFBRSxjQUFjLENBQUMsQ0FBQztnQkFDM0gsY0FBYyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2FBQ3pFLENBQUMsQ0FBQztTQUNOO1FBQ0QsR0FBRyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEtBQUs7WUFDNUIsUUFBUSxHQUFHLENBQUMsSUFBSTtnQkFDWixLQUFLLGVBQWU7b0JBQ2hCLElBQUksRUFBRSxHQUFHLElBQUksWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN4RyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDekIsTUFBTTtnQkFDVixLQUFLLGVBQWU7b0JBQ2hCLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztvQkFDakIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUs7d0JBQzNCLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFOzRCQUN2QyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7eUJBQ3pEO3FCQUNKLENBQUMsQ0FBQztvQkFDSCxJQUFJLE1BQU0sR0FBRyxJQUFJLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDdkQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQzdCLE1BQU07Z0JBQ1YsS0FBSyxZQUFZO29CQUNiLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDO3dCQUNqQixFQUFFLEVBQUUsWUFBWSxFQUFFO3dCQUNsQixJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7d0JBQ2QsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNO3dCQUNsQixJQUFJLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQzlCLENBQUMsQ0FBQztvQkFDSCxNQUFNO2dCQUNWO29CQUNJLE1BQU07YUFDYjtTQUNKLENBQUMsQ0FBQztRQUNILFFBQVEsR0FBRyxDQUFDLFVBQVU7WUFDbEI7Z0JBQ0ksSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFO29CQUNYLFNBQVMsRUFBRSxDQUFDO2lCQUNmO3FCQUNJOztvQkFFRCxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDeEU7Z0JBQ0QsTUFBTTtTQUNiO0tBQ0o7SUFDRCxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRTtRQUNYLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNkLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNmLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNmLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNmLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQzs7UUFFM0MsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNyRCxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUs7Z0JBQzNCLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzFELENBQUMsQ0FBQztZQUNILEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSztnQkFDNUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxXQUFXLEVBQUU7b0JBQzVDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUM3RDthQUNKLENBQUMsQ0FBQztZQUNILElBQUksY0FBYyxJQUFJLENBQUMsRUFBRTtnQkFDckIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxLQUFLO29CQUNwQyxDQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsS0FBSzt3QkFDNUIsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLEVBQUUsRUFBRTs0QkFDakIsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxTQUFTLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQzt5QkFDdEU7cUJBQ0osQ0FBQyxDQUFDO2lCQUNOLENBQUMsQ0FBQzthQUNOO1NBQ0o7UUFDRCxBQUFDO1FBQ0QsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLO1lBQzVCLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO1NBQzlCLENBQUMsQ0FBQztRQUNILE9BQU87WUFDSCxLQUFLLEVBQUUsS0FBSztZQUNaLElBQUksRUFBRSxJQUFJO1lBQ1YsS0FBSyxFQUFFLEtBQUs7WUFDWixLQUFLLEVBQUUsS0FBSztZQUNaLEtBQUssRUFBRSxLQUFLO1NBQ2YsQ0FBQztLQUNMOztJQUVELEtBQUssQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsR0FBRyxJQUFJLEVBQUU7UUFDcEMsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLElBQUksUUFBUSxLQUFLLElBQUksRUFBRTtZQUNuQixNQUFNLENBQUMsUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDNUI7UUFDRCxLQUFLLElBQUksSUFBSSxJQUFJLE1BQU0sRUFBRTtZQUNyQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDMUMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDOUIsT0FBTyxDQUFDLElBQUksQ0FBQzt3QkFDVCxLQUFLLEVBQUUsSUFBSTt3QkFDWCxLQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDdEIsR0FBRyxFQUFFLENBQUM7cUJBQ1QsQ0FBQyxDQUFDO2lCQUNOO2FBQ0o7U0FDSjtRQUNELElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO0tBQ3hCO0lBQ0QsSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUNULElBQUksSUFBSSxDQUFDO1FBQ1QsS0FBSyxJQUFJLEtBQUssSUFBSSxNQUFNLEVBQUU7WUFDdEIsSUFBSSxPQUFPLElBQUksS0FBSyxXQUFXLEVBQUU7Z0JBQzdCLElBQUksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDO2FBQy9CO1lBQ0QsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxLQUFLLElBQUksRUFBRTtnQkFDL0IsTUFBTSwwQ0FBMEMsQ0FBQzthQUNwRDtTQUNKO1FBQ0QsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7S0FDdkI7Q0FDSixBQUNEOztBQ2pKTyxNQUFNLElBQUksQ0FBQztJQUNkLFdBQVcsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFO1FBQ3pCLElBQUksR0FBRyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNYLElBQUksQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDbEQ7YUFDSTtZQUNELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUMvQjtLQUNKO0NBQ0o7QUFDRCxBQUFPLE1BQU0sVUFBVSxDQUFDO0lBQ3BCLFdBQVcsR0FBRztRQUNWLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0tBQ25CO0NBQ0o7QUFDRCxBQUFPLE1BQU0sT0FBTyxDQUFDO0lBQ2pCLFdBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxHQUFHLEtBQUssRUFBRSxRQUFRLEdBQUcsSUFBSSxFQUFFO1FBQ3ZFLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ2hDLElBQUksTUFBTSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7WUFDOUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3BDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7YUFDOUQ7WUFDRCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNoQztLQUNKO0lBQ0QsR0FBRyxDQUFDLFdBQVcsRUFBRSxNQUFNLEdBQUcsS0FBSyxFQUFFO1FBQzdCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLE9BQU8sV0FBVyxFQUFFLEVBQUU7WUFDbEIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUN0QztRQUNELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztLQUMxQjtJQUNELE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ1YsSUFBSSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUU7WUFDbkIsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUNiO2FBQ0ksSUFBSSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUU7WUFDeEIsT0FBTyxDQUFDLENBQUM7U0FDWjtRQUNELE9BQU8sQ0FBQyxDQUFDO0tBQ1o7SUFDRCxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUNWLElBQUksQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFO1lBQ25CLE9BQU8sQ0FBQyxDQUFDO1NBQ1o7YUFDSSxJQUFJLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRTtZQUN4QixPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQ2I7UUFDRCxPQUFPLENBQUMsQ0FBQztLQUNaO0lBQ0QsVUFBVSxHQUFHO1FBQ1QsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2IsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNyRCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDdEQ7UUFDRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDN0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ3RDO1FBQ0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzdDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDekU7S0FDSjtJQUNELElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDVixJQUFJLFdBQVcsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDaEUsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxXQUFXLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDbEMsSUFBSSxLQUFLLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztZQUM3QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3pDLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUMzRSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsQ0FBQztnQkFDL0MsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQzVELElBQUksQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDOUIsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDMUI7WUFDRCxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3hCO1FBQ0QsT0FBTyxRQUFRLENBQUM7S0FDbkI7SUFDRCxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRTtRQUNuQixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxNQUFNLEVBQUU7WUFDeEIsT0FBTztTQUNWO1FBQ0QsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDcEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzFDLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxJQUFJLENBQUM7WUFDVCxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2YsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQzthQUNuQztpQkFDSTtnQkFDRCxJQUFJLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQzNCO1lBQ0QsSUFBSSxRQUFRLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2hCLElBQUksQ0FBQyxJQUFJLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQzNEO2lCQUNJO2dCQUNELElBQUksQ0FBQyxJQUFJLElBQUksUUFBUSxDQUFDO2FBQ3pCO1lBQ0QsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUNuRDtLQUNKO0NBQ0osQUFDRDs7QUNoSE8sTUFBTSxZQUFZLFNBQVMsVUFBVSxDQUFDO0lBQ3pDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLFFBQVEsR0FBRyxLQUFLLEVBQUUsUUFBUSxHQUFHLElBQUksRUFBRSxNQUFNLEdBQUcsSUFBSSxFQUFFO1FBQzlFLEtBQUssQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztRQUNyQyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7UUFDbEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRTtZQUNmLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1NBQ3ZCO1FBQ0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDdkIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDaEMsSUFBSSxNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztZQUM5QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3pDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2FBQ3BFO1lBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDaEM7S0FDSjtJQUNELEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRTtRQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVixPQUFPLENBQUMsR0FBRyxJQUFJLEVBQUU7WUFDYixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0RCxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzRCxDQUFDLEVBQUUsQ0FBQztTQUNQO1FBQ0QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO0tBQzdCO0lBQ0QsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDVixJQUFJLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRTtZQUNuQixPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQ2I7YUFDSSxJQUFJLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRTtZQUN4QixPQUFPLENBQUMsQ0FBQztTQUNaO1FBQ0QsT0FBTyxDQUFDLENBQUM7S0FDWjtJQUNELE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ1YsSUFBSSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUU7WUFDbkIsT0FBTyxDQUFDLENBQUM7U0FDWjthQUNJLElBQUksQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFO1lBQ3hCLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDYjtRQUNELE9BQU8sQ0FBQyxDQUFDO0tBQ1o7SUFDRCxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRTtRQUNULElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNiLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDakQsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNyQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQy9DLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDdEQ7UUFDRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDN0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ3RDO1FBQ0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzdDLEtBQUssSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRTtnQkFDNUMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxRQUFRLENBQUM7Z0JBQ2IsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLFFBQVEsSUFBSSxPQUFPLEtBQUssQ0FBQyxLQUFLLEtBQUssV0FBVyxFQUFFO29CQUNoRSxLQUFLLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUU7d0JBQzNDLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRTs0QkFDcEMsUUFBUSxHQUFHLEVBQUUsQ0FBQzt5QkFDakI7cUJBQ0o7b0JBQ0QsSUFBSSxRQUFRLENBQUM7b0JBQ2IsS0FBSyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRTt3QkFDNUQsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksRUFBRTs0QkFDcEQsUUFBUSxHQUFHLEVBQUUsQ0FBQzt5QkFDakI7cUJBQ0o7b0JBQ0QsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQzdIO3FCQUNJO29CQUNELEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMs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LENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzNDLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEMsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDeEMsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0lBRXhDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNwRCxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDOztJQUV6RCxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUM7U0FDckQsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7SUFFL0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDOztJQUU3RSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxD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
