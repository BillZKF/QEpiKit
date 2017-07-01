'use strict';

class Resource {
    constructor(template) {
        this.current = 0;
        this.available = true;
        this.useUpperLimit = false;
        this.useLowerLimit = false;
        this.added = 0;
        this.removed = 0;
        this.incomingTrans = 0;
        this.outgoingTrans = 0;
        this.label = template.label;
        this.units = template.units;
        this.current = template.current || 0;
        this.available = template.available || true;
        this.useUpperLimit = template.useUpperLimit || false;
        this.lowerLimit = template.useLowerLimit || false;
        if (this.useLowerLimit) {
            this.upperLimit = template.upperLimit;
        }
        if (this.useLowerLimit) {
            this.lowerLimit = template.lowerLimit;
        }
    }
    lowerLimitCB(quantity) {
        this.available = false;
    }
    upperLimitCB(quantity) {
        this.available = false;
    }
    remove(quantity) {
        if (this.available) {
            if (this.useLowerLimit || (this.useUpperLimit && this.current >= this.upperLimit)) {
                let gap = this.lowerLimit - (this.current - quantity);
                if (gap > 0) {
                    quantity = quantity - gap;
                    this.lowerLimitCB(quantity);
                }
            }
            this.removed = this.removed || 0;
            this.current -= quantity;
            this.removed += quantity;
            this.outgoingTrans += 1;
            return quantity;
        }
        return 0;
    }
    add(quantity) {
        if (this.available || (this.useLowerLimit && this.current <= this.lowerLimit)) {
            if (this.useUpperLimit) {
                let excess = (this.current + quantity) - this.upperLimit;
                if (excess > 0) {
                    quantity = quantity - excess;
                    this.upperLimitCB(quantity);
                }
            }
            this.added = this.added || 0;
            this.current += quantity;
            this.added += quantity;
            this.incomingTrans += 1;
            return quantity;
        }
        return 0;
    }
    transfer(resourceB, quantity) {
        quantity = this.remove(quantity);
        resourceB.add(quantity);
    }
    give(agent, quantity) {
        quantity = this.remove(quantity);
        agent[this.label] = agent[this.label] || 0;
        agent[this.label] += quantity;
    }
}

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
            item = scale(item);
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
function scale(vals, center, scale) {
    if (typeof vals === 'number') {
        return (vals - center) / scale;
    }
    else {
        center = center || jStat.mean(vals);
        scale = scale || jStat.stdev(vals);
        return vals.map((d) => {
            return (d - center) / scale;
        });
    }
}
function scaleInv(vals, center, scale) {
    if (typeof vals === 'number') {
        return vals * scale + center;
    }
    else {
        return vals.map((d) => {
            return d * scale + center;
        });
    }
}
/*
* relative to the mean, how many sds
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
    static always(a) {
        if (a === SUCCESS) {
            return SUCCESS;
        }
        else {
            return FAILED;
        }
    }
    static eventually(a) {
        if (a === SUCCESS) {
            return SUCCESS;
        }
        else {
            return RUNNING;
        }
    }
    static equalTo(a, b) {
        if (a === b) {
            return SUCCESS;
        }
        else {
            return FAILED;
        }
    }
    static not(result) {
        var newResult;
        if (result === SUCCESS) {
            newResult = FAILED;
        }
        else if (result === FAILED) {
            newResult = SUCCESS;
        }
        return newResult;
    }
    static notEqualTo(a, b) {
        if (a !== b) {
            return SUCCESS;
        }
        else {
            return FAILED;
        }
    }
    static gtEq(a, b) {
        if (a >= b) {
            return SUCCESS;
        }
        else {
            return FAILED;
        }
    }
    static ltEq(a, b) {
        if (a <= b) {
            return SUCCESS;
        }
        else {
            return FAILED;
        }
    }
    static hasProp(a, b) {
        a = a || false;
        if (a === b) {
            return SUCCESS;
        }
        else {
            return FAILED;
        }
    }
    static inRange(a, b) {
        if (b >= a[0] && b <= a[1]) {
            return SUCCESS;
        }
        else {
            return FAILED;
        }
    }
    static notInRange(a, b) {
        if (b >= a[0] && b <= a[1]) {
            return FAILED;
        }
        else {
            return SUCCESS;
        }
    }
}
function addResources(arr, template, number) {
    for (var i = 0; i < number; i++) {
        arr.push(new Resource(template));
    }
    return arr;
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
            type: type,
            states: {}
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
        pop[a] = assignParams(pop[a], options, rng);
        currentAgentId++;
    }
    for (let a = 0; a < pop.length; a++) {
        for (let key in pop[a].states) {
            pop[a][pop[a].states[key]] = true;
        }
    }
    return [pop, locs];
}
function assignParams(targetObj, params, rng) {
    for (let key in params) {
        targetObj[key] = assignParam(targetObj, params[key], key, rng);
    }
    return targetObj;
}
function assignParam(targetObj, param, key, rng) {
    if (typeof param.states !== 'undefined') {
        targetObj.states[key] = rng.pick(param.states.params[0], param.states.params[1]);
        return targetObj.states[key];
    }
    if (typeof param.distribution !== 'undefined') {
        targetObj[key] = rng[param.distribution.name](param.distribution.params[0], param.distribution.params[1]);
    }
    if (typeof param.action !== 'undefined') {
        targetObj[key] = QActions[param.action];
    }
    if (typeof param.assign !== 'undefined') {
        targetObj[key] = param.assign;
    }
    return targetObj[key];
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
    constructor(resources = [], entities = {}, eventsQueue = [], activationType = 'random', rng = Math) {
        /**
        * spatial boundaries
        **/
        this.boundaries = {};
        this.time = 0;
        this.timeOfDay = 0;
        this.models = [];
        this.history = [];
        this.agents = [];
        this.resources = resources;
        this.entities = entities;
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
        this.models.forEach(function (c, index) {
            if (c.id === id) {
                deleteIndex = index;
            }
        });
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
                            agent[this.transitions[i].from[j]] = false; //for easier reporting
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

class Random {
    constructor(seed) {
        this.uniform = this.randRange;
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
    pick(array, probabilities) {
        if (typeof probabilities === 'undefined') {
            return array[Math.floor(this.random() * array.length)];
        }
        else {
            if (jStat.sum(probabilities) == 1.0) {
                while (array.length > 0) {
                    let idx = Math.floor(this.random() * array.length);
                    if (this.random() < probabilities[idx]) {
                        return array[idx];
                    }
                    //array.splice(idx, 1);
                    //probabilities.splice(idx, 1);
                }
            }
            else {
                throw new RangeError('sum of probabilities array did not equal 1');
            }
        }
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

/**
*Batch run environments
*/
class Experiment {
    constructor(environment, setup, target) {
        this.type = 'sweep';
        this.environment = environment;
        this.setup = setup;
        this.rng = setup.experiment.rng === 'xorshift7' ? new RNGxorshift7(setup.experiment.seed) : new RNGBurtle(setup.experiment.seed);
        this.experimentLog = [];
        this.currentCFG = {};
        this.genLog = [];
    }
    start(runs, step, until, prepCB) {
        var r = 0;
        runs = runs * this.setup.experiment.size;
        while (r < runs) {
            this.prep(r, this.setup, prepCB);
            this.environment.time = 0; //
            this.environment.run(step, until, 0);
            this.experimentLog[r] = this.report(r, this.setup);
            this.after(r, this.setup);
            if (r % this.setup.experiment.size === 0 && r !== 0) {
                this.endGen(r, this.setup);
            }
            r++;
        }
    }
    prep(r, cfg, cb) {
        this.parseCFG(cfg);
        if (cb !== undefined) {
            cb();
        }
    }
    endGen(run, cfg) {
        let prevStart = Math.min(0, run - cfg.experiment.size);
        this.genLog.push(this.genAvg(this.experimentLog.slice(prevStart, run), cfg));
        this.updateAssignment(cfg, cfg.experiment.params);
    }
    parseCFG(cfg) {
        let groups = {};
        let currentAgentId = 0;
        cfg = JSON.parse(JSON.stringify(cfg));
        cfg.boundaries = {};
        this.environment = new Environment();
        this.environment.rng = this.rng;
        if ('agents' in cfg) {
            for (let grName in cfg.agents) {
                let group = cfg.agents[grName];
                group.params.groupName = grName;
                this.environment.boundaries[grName] = group.boundaries;
                groups[grName] = generatePop(group.count, group.params, cfg.environment.spatialType, group.boundaries, currentAgentId, this.rng);
                currentAgentId = groups[grName][groups[grName].length - 1].id;
            }
        }
        if ('patches' in cfg) {
            cfg.patches.forEach((patch) => {
                this.environment.boundaries[patch.name] = patch.boundaries;
                patch.params.groupName = patch.name;
                groups[patch.name] = generatePop(1, patch.params, cfg.environment.spatialType, patch.boundaries, currentAgentId, this.rng);
            });
        }
        if ('resources' in cfg) {
            let resources = [];
            for (let rsc in cfg.resources) {
                resources = addResources(resources, cfg.resources[rsc], cfg.resources[rsc].quantity);
            }
            this.environment.resources = resources;
        }
        if ('entities' in cfg) {
            for (let entity in cfg.entities) {
                for (let method in cfg.entities[entity].methods) {
                    cfg.entities[entity].methods[method] = QActions[method];
                }
                this.environment.entities[entity] = cfg.entities[entity];
            }
        }
        cfg.components.forEach((cmp) => {
            switch (cmp.type) {
                case 'state-machine':
                    for (let state in cmp.states) {
                        cmp.states[state] = QActions[cmp.states[state]];
                    }
                    for (let cond in cmp.conditions) {
                        cmp.conditions[cond].check = Match[cmp.conditions[cond].check];
                    }
                    let sm = new StateMachine(cmp.name, cmp.states, cmp.transitions, cmp.conditions, groups[cmp.agents][0]);
                    this.environment.add(sm);
                    break;
                case 'compartmental':
                    let patches = [];
                    cfg.patches.forEach((patch) => {
                        if (cmp.patches.indexOf(patch.name) != -1) {
                            for (let compartment in cmp.compartments) {
                                cmp.compartments[compartment].operation = QActions[cmp.compartments[compartment].operation];
                            }
                            let p = new Patch(patch.name, cmp.compartments, patch.populations);
                            groups[patch.name][0][0] = Object.assign(groups[patch.name][0][0], p);
                            patches.push(groups[patch.name][0][0]);
                        }
                    });
                    let cModel = new CompartmentModel(cmp.name, cmp.compartments, patches);
                    this.environment.add(cModel);
                    break;
                case 'every-step':
                    cmp.action = QActions[cmp.action];
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
                if (typeof d[f] === 'number' || typeof d[f] === 'boolean' && !isNaN(d[f])) {
                    freqs[f] = freqs[f] == undefined ? 1 : d[f] + freqs[f];
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
            cfg: this.currentCFG,
            count: count,
            sums: sums,
            means: means,
            freqs: freqs,
            model: model
        };
    }
    //on each run, change one param, hold others constant
    after(run, cfg) {
    }
    genAvg(logs, cfg) {
        let sums = {};
        let freqs = {};
        let sumMeans = {};
        let means = {};
        logs.forEach((log) => {
            cfg.report.sums.forEach((s) => {
                sums[s] = sums[s] == undefined ? log.sums[s] : log.sums[s] + sums[s];
            });
            cfg.report.freqs.forEach((f) => {
                freqs[f] = freqs[f] == undefined ? log.freqs[f] : log.freqs[f] + freqs[f];
            });
            cfg.report.means.forEach((m) => {
                sumMeans[m] = sumMeans[m] == undefined ? log.means[m] : log.means[m] + sumMeans[m];
            });
        });
        cfg.report.means.forEach((m) => {
            means[m] = sumMeans[m] / logs.length;
        });
        cfg.report.freqs.forEach((f) => {
            means[f] = freqs[f] / logs.length;
        });
        return {
            means: means,
            sums: sums,
            freqs: freqs
        };
    }
    /*
    * Assign new environmental parameters from experimental parameters.
    */
    updateAssignment(cfg, parameters) {
        for (let pm = 0; pm < parameters.length; pm++) {
            let param = parameters[pm];
            let val = assignParam({}, param, param.name, this.rng);
            this.currentCFG[param.level] = this.currentCFG[param.level] || {};
            this.currentCFG[param.level][param.group] = this.currentCFG[param.level][param.group] || {};
            this.currentCFG[param.level][param.group][param.name] = val;
            switch (param.level) {
                case 'agents':
                    if (param.group === 'boundaries') {
                        cfg.agents.boundaries[param.name].assign = val;
                    }
                    else {
                        cfg.agents[param.group].params[param.name].assign = val;
                    }
                    break;
                case 'entities':
                    cfg.entities[param.group][param.name] = val;
                    break;
                default:
                    cfg[param.level].params[param.group][param.name] = val;
                    break;
            }
        }
    }
}

class Gene {
    constructor(params, type, rng) {
        switch (type) {
            case 'normal':
                this.code = rng.normal(params[0], params[1]);
                break;
            default:
                this.code = rng.random();
                break;
        }
    }
}
class Chromasome {
    constructor() {
        this.genes = [];
    }
}

class Evolutionary extends Experiment {
    constructor(environment, setup, discrete = false, mating = true) {
        super(environment, setup);
        this.method = "normal";
        this.target = setup.evolution.target;
        this.method = setup.evolution.method || "normal";
        this.params = setup.experiment.params;
        this.size = setup.experiment.size;
        this.mating = mating;
        if (this.size < 2) {
            this.mating = false;
        }
        this.population = [];
        this.mutateRate = 0.5;
        for (let i = 0; i < this.size; i++) {
            let chroma = new Chromasome();
            for (let k = 0; k < this.params.length; k++) {
                //new Gene(this.ranges[k].range, this.method, this.rng)
                chroma.genes.push();
            }
            this.population.push(chroma);
        }
    }
    start(runs, step, until, prepCB) {
        let r = 0;
        while (r < runs) {
            this.prep(r, this.setup, prepCB);
            this.population.sort(this.ascSort);
            this.population = this.population.slice(0, this.size);
            this.experimentLog[this.experimentLog.length - 1].best = true;
            console.log("run " + r + " score :  mean = " + this.scoreMean(this.population) + '  sd = ' + this.scoreSD(this.population));
            r++;
        }
        this.improvement = this.improvementScore(this.experimentLog);
        return this.experimentLog;
    }
    getParams(chroma, cfg) {
        let out = {};
        for (let pm = 0; pm < this.params.length; pm++) {
            let cfgPm = this.params[pm];
            if (cfgPm.level === 'agents' || typeof cfgPm.level === 'undefined') {
                out[cfgPm.level + "_" + cfgPm.name] = scaleInv(chroma.genes[pm].code, cfgPm.range[0], cfgPm.range[1] - cfgPm.range[0]);
            }
            else {
                out[cfgPm.level + "_" + cfgPm.name] = scaleInv(chroma.genes[pm].code, cfgPm.range[0], cfgPm.range[1] - cfgPm.range[0]);
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
    prep(r, cfg, cb) {
        let report;
        if (this.mating) {
            let topPercent = Math.round(0.1 * this.size) + 2; //ten percent of original size + 2
            let children = this.mate(topPercent);
            this.population = this.population.concat(children);
        }
        for (let i = 0; i < this.population.length; i++) {
            this.mutate(this.population[i], 1);
        }
        for (let j = 0; j < this.population.length; j++) {
            this.updateAssignment(cfg, this.population[j], this.params);
            super.prep(r, cfg, cb);
            this.environment.time = 0;
            report = this.report(r, cfg);
            this.population[j].score = this.cost(report, this.target);
            report.score = this.population[j].score;
            this.experimentLog.push(report);
        }
    }
    updateAssignment(cfg, chroma, parameters) {
        for (let pm = 0; pm < parameters.length; pm++) {
            let param = parameters[pm];
            switch (param.level) {
                case 'agents':
                    cfg.agents[param.group].params[param.name].assign = scaleInv(chroma.genes[pm].code, param.range[0], param.range[1] - param.range[0]);
                    break;
                case 'entities':
                    cfg.entities[param.group][param.name] = scaleInv(chroma.genes[pm].code, param.range[0], param.range[1] - param.range[0]);
                    break;
                default:
                    cfg[param.level].params[param.group][param.name] = scaleInv(chroma.genes[pm].code, param.range[0], param.range[1] - param.range[0]);
                    break;
            }
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
            ranked = this.genAvg(log, this.setup);
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
    genAvg(log, cfg) {
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
    centroid(pop) {
        let centroid = [];
        for (let i = 0; i < this.params.length; i++) {
            centroid[i] = jStat.mean(this.population.map((d) => { return d.genes[i].code; }));
        }
        return centroid;
    }
    vectorScores(pop) {
        let vec = [];
        for (let i = 0; i < pop.length; i++) {
            vec[i] = pop[i].score;
        }
        return vec;
    }
    scoreMean(pop) {
        let vals = this.vectorScores(pop);
        return jStat.mean(vals);
    }
    scoreSD(pop) {
        let vals = this.vectorScores(pop);
        return jStat.stdev(vals);
    }
    weightedSum() {
        //must be sorted already
        let mean = this.scoreMean(this.population);
        let sd = this.scoreSD(this.population);
        let weights = this.population.map((p, idx) => {
            return (p.score - mean) / sd;
        });
        let sum = this.params.map((param, idx) => {
            return this.population.reduce((acc, current, currentIdx) => {
                return current.genes[idx].code * weights[currentIdx] + acc;
            }, 0);
        });
        return sum;
    }
    mate(parents) {
        let numChildren = Math.min(2, Math.max(10, this.params.length));
        let children = [];
        for (let i = 0; i < numChildren; i++) {
            let child = new Chromasome();
            for (let j = 0; j < this.params.length; j++) {
                let gene = new Gene([this.params[j].range[0], this.params[j].range[1]], this.method, this.rng);
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
        let centroid = this.centroid([this.population[0], this.population[1]]);
        if (this.rng.random() > chance) {
            return;
        }
        for (let j = 0; j < chroma.genes.length; j++) {
            let gene = chroma.genes[j];
            let diff = best[j].code - gene.code;
            if (diff == 0 || this.method === 'normal') {
                gene.code += this.rng.normal(0, 1) * this.mutateRate;
            }
            else {
                gene.code += diff * this.mutateRate;
            }
            gene.code = Math.min(Math.max(0, gene.code), 1);
        }
    }
}

class Evolve extends Experiment {
    constructor(environment, setup) {
        super(environment, setup);
        this.type = 'evolve';
        this.population = [];
        this.mutateRate = 0.5;
        this.target = setup.evolution.target;
        for (let i = 0; i < this.setup.experiment.size; i++) {
            this.population[i] = { score: 1e6, params: [] };
            for (let p = 0; p < this.setup.experiment.params.length; p++) {
                let setParam = this.setup.experiment.params[p];
                this.population[i].params.push({
                    level: setParam.level,
                    group: setParam.group,
                    name: setParam.name,
                    assign: assignParam({}, setParam, setParam.name, this.rng)
                });
            }
        }
    }
    start(runs, step, until, prepCB) {
        var r = 0;
        runs = runs * this.setup.experiment.size;
        while (r < runs) {
            this.prep(r, this.setup, prepCB);
            this.environment.time = 0;
            this.environment.run(step, until, 0);
            this.experimentLog[r] = this.report(r, this.setup);
            this.after(r, this.setup);
            if (r % this.setup.experiment.size === 0 && r !== 0) {
                this.endGen(r, this.setup);
            }
            r++;
        }
        this.improvement = this.overall(this.genLog);
    }
    overall(genLog) {
        let N = genLog.length;
        let sum = 0;
        let ranked = genLog;
        ranked.sort(this.dscSort);
        ranked.map((d, i) => { d.rank = i; return d; });
        for (let i = 0; i < ranked.length; i++) {
            sum += Math.abs(ranked[i].order / N - ranked[i].rank / N);
        }
        return 1 - 2 * sum / N;
    }
    prep(run, setup, prepCB) {
        setup.experiment.params = this.population[run % setup.experiment.size].params;
        super.updateAssignment(setup, setup.experiment.params);
        super.prep(run, setup, prepCB);
    }
    endGen(run, cfg) {
        let prevStart = Math.min(0, run - cfg.experiment.size);
        this.population.sort(this.ascSort);
        this.population = this.population.slice(0, cfg.experiment.size);
        this.mutate(this.population, 1);
        this.genLog.push(this.genAvg(this.experimentLog.slice(prevStart, run), cfg));
        this.genLog[this.genLog.length - 1].order = this.genLog.length - 1;
        this.genLog[this.genLog.length - 1].score = this.scoreMean(this.population);
        this.genLog[this.genLog.length - 1].scoreSD = this.scoreSD(this.population);
        this.population = this.population.concat(this.mate(Math.min(4, this.population.length)));
    }
    vectorScores(pop) {
        let vec = [];
        for (let i = 0; i < pop.length; i++) {
            vec[i] = pop[i].score;
        }
        return vec;
    }
    scoreMean(pop) {
        let vals = this.vectorScores(pop);
        return jStat.mean(vals);
    }
    scoreSD(pop) {
        let vals = this.vectorScores(pop);
        return jStat.stdev(vals);
    }
    after(run, cfg) {
        this.population[run % cfg.experiment.size].score = this.cost(this.experimentLog[run], this.target);
        this.experimentLog[run].score = this.population[run % cfg.experiment.size].score;
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
    mutate(population, chance) {
        for (let i = 0; i < population.length; i++) {
            if (this.rng.random() > chance) {
                continue;
            }
            let best = population[0].params;
            let current = population[i].params;
            for (let p = 0; p < current.length; p++) {
                let diff = best[p].assign - current[p].assign;
                if (diff < 1e-15) {
                    current[p].assign += this.rng.normal(0, 1) * this.mutateRate;
                }
                else {
                    current[p].assign += diff * this.mutateRate;
                }
            }
        }
    }
    mate(parents) {
        let numChildren = Math.min(2, Math.max(10, this.population.length));
        let numParams = this.population[0].params.length;
        let children = [];
        for (let i = 0; i < numChildren; i++) {
            let child = { params: [], score: 0 };
            let p1 = Math.floor(this.rng.random() * parents);
            let p2 = Math.floor(this.rng.random() * parents);
            let split = Math.floor(this.rng.random() * numParams);
            child.params = [].concat(this.population[p1].params.slice(0, split), this.population[p2].params.slice(split, numParams));
            children.push(child);
        }
        console.log(children);
        return children;
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
    constructor(name, trainedData, kParams, classifier, nearestN) {
        this.name = name;
        this.trainedData = trainedData;
        this.kParams = kParams;
        this.classifier = classifier;
        this.nearestN = nearestN;
    }
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
        for (let d = 0; d < data.length; d++) {
            let results = {};
            let n = 0;
            let max = 0;
            let likeliest = '';
            let ordered = this.sort(data[d].neighbors, 'distance');
            while (n < nearestN) {
                let current = ordered[n][classifier];
                results[current] = results[current] || 0;
                results[current] += 1;
                n++;
            }
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

var version = '0.0.5';


var qepikit = Object.freeze({
	version: version,
	QComponent: QComponent,
	BDIAgent: BDIAgent,
	ContactPatch: ContactPatch,
	Environment: Environment,
	Experiment: Experiment,
	Evolutionary: Evolutionary,
	Evolve: Evolve,
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
	scale: scale,
	scaleInv: scaleInv,
	standardized: standardized,
	normalize: normalize,
	invNorm: invNorm,
	randRange: randRange,
	getRange: getRange,
	Match: Match,
	addResources: addResources,
	generatePop: generatePop,
	assignParams: assignParams,
	assignParam: assignParam,
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
	RNGxorshift7: RNGxorshift7,
	Resource: Resource
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicWVwaWtpdC5qcyIsInNvdXJjZXMiOlsiZGlzdC9yZXNvdXJjZS5qcyIsImRpc3QvdXRpbHMuanMiLCJkaXN0L1FDb21wb25lbnQuanMiLCJkaXN0L2JkaS5qcyIsImRpc3QvYmVoYXZpb3JUcmVlLmpzIiwiZGlzdC9jb21wYXJ0bWVudC5qcyIsImRpc3QvY29udGFjdFBhdGNoLmpzIiwiZGlzdC9lbnZpcm9ubWVudC5qcyIsImRpc3QvZXBpLmpzIiwiZGlzdC9ldmVudHMuanMiLCJkaXN0L3N0YXRlTWFjaGluZS5qcyIsImRpc3QvcmFuZG9tLmpzIiwiZGlzdC9leHBlcmltZW50LmpzIiwiZGlzdC9nZW5ldGljLmpzIiwiZGlzdC9ldm9sdXRpb25hcnkuanMiLCJkaXN0L2V2b2x2ZS5qcyIsImRpc3QvaGEuanMiLCJkaXN0L2h0bi5qcyIsImRpc3QvbWMuanMiLCJkaXN0L2ttZWFuLmpzIiwiZGlzdC9rbm4uanMiLCJkaXN0L21hdGguanMiLCJkaXN0L25ldHdvcmsuanMiLCJkaXN0L1FMZWFybmVyLmpzIiwiZGlzdC9yZWdyZXNzaW9uLmpzIiwiZGlzdC9VU3lzLmpzIiwiZGlzdC9tYWluLmpzIiwiZGlzdC9RRXBpS2l0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBSZXNvdXJjZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZSkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IDA7XHJcbiAgICAgICAgdGhpcy5hdmFpbGFibGUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMudXNlVXBwZXJMaW1pdCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMudXNlTG93ZXJMaW1pdCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYWRkZWQgPSAwO1xyXG4gICAgICAgIHRoaXMucmVtb3ZlZCA9IDA7XHJcbiAgICAgICAgdGhpcy5pbmNvbWluZ1RyYW5zID0gMDtcclxuICAgICAgICB0aGlzLm91dGdvaW5nVHJhbnMgPSAwO1xyXG4gICAgICAgIHRoaXMubGFiZWwgPSB0ZW1wbGF0ZS5sYWJlbDtcclxuICAgICAgICB0aGlzLnVuaXRzID0gdGVtcGxhdGUudW5pdHM7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gdGVtcGxhdGUuY3VycmVudCB8fCAwO1xyXG4gICAgICAgIHRoaXMuYXZhaWxhYmxlID0gdGVtcGxhdGUuYXZhaWxhYmxlIHx8IHRydWU7XHJcbiAgICAgICAgdGhpcy51c2VVcHBlckxpbWl0ID0gdGVtcGxhdGUudXNlVXBwZXJMaW1pdCB8fCBmYWxzZTtcclxuICAgICAgICB0aGlzLmxvd2VyTGltaXQgPSB0ZW1wbGF0ZS51c2VMb3dlckxpbWl0IHx8IGZhbHNlO1xyXG4gICAgICAgIGlmICh0aGlzLnVzZUxvd2VyTGltaXQpIHtcclxuICAgICAgICAgICAgdGhpcy51cHBlckxpbWl0ID0gdGVtcGxhdGUudXBwZXJMaW1pdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMudXNlTG93ZXJMaW1pdCkge1xyXG4gICAgICAgICAgICB0aGlzLmxvd2VyTGltaXQgPSB0ZW1wbGF0ZS5sb3dlckxpbWl0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGxvd2VyTGltaXRDQihxdWFudGl0eSkge1xyXG4gICAgICAgIHRoaXMuYXZhaWxhYmxlID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB1cHBlckxpbWl0Q0IocXVhbnRpdHkpIHtcclxuICAgICAgICB0aGlzLmF2YWlsYWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmVtb3ZlKHF1YW50aXR5KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYXZhaWxhYmxlKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnVzZUxvd2VyTGltaXQgfHwgKHRoaXMudXNlVXBwZXJMaW1pdCAmJiB0aGlzLmN1cnJlbnQgPj0gdGhpcy51cHBlckxpbWl0KSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGdhcCA9IHRoaXMubG93ZXJMaW1pdCAtICh0aGlzLmN1cnJlbnQgLSBxdWFudGl0eSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZ2FwID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHF1YW50aXR5ID0gcXVhbnRpdHkgLSBnYXA7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb3dlckxpbWl0Q0IocXVhbnRpdHkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlZCA9IHRoaXMucmVtb3ZlZCB8fCAwO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQgLT0gcXVhbnRpdHk7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlZCArPSBxdWFudGl0eTtcclxuICAgICAgICAgICAgdGhpcy5vdXRnb2luZ1RyYW5zICs9IDE7XHJcbiAgICAgICAgICAgIHJldHVybiBxdWFudGl0eTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICBhZGQocXVhbnRpdHkpIHtcclxuICAgICAgICBpZiAodGhpcy5hdmFpbGFibGUgfHwgKHRoaXMudXNlTG93ZXJMaW1pdCAmJiB0aGlzLmN1cnJlbnQgPD0gdGhpcy5sb3dlckxpbWl0KSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy51c2VVcHBlckxpbWl0KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZXhjZXNzID0gKHRoaXMuY3VycmVudCArIHF1YW50aXR5KSAtIHRoaXMudXBwZXJMaW1pdDtcclxuICAgICAgICAgICAgICAgIGlmIChleGNlc3MgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcXVhbnRpdHkgPSBxdWFudGl0eSAtIGV4Y2VzcztcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwcGVyTGltaXRDQihxdWFudGl0eSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5hZGRlZCA9IHRoaXMuYWRkZWQgfHwgMDtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50ICs9IHF1YW50aXR5O1xyXG4gICAgICAgICAgICB0aGlzLmFkZGVkICs9IHF1YW50aXR5O1xyXG4gICAgICAgICAgICB0aGlzLmluY29taW5nVHJhbnMgKz0gMTtcclxuICAgICAgICAgICAgcmV0dXJuIHF1YW50aXR5O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICAgIHRyYW5zZmVyKHJlc291cmNlQiwgcXVhbnRpdHkpIHtcclxuICAgICAgICBxdWFudGl0eSA9IHRoaXMucmVtb3ZlKHF1YW50aXR5KTtcclxuICAgICAgICByZXNvdXJjZUIuYWRkKHF1YW50aXR5KTtcclxuICAgIH1cclxuICAgIGdpdmUoYWdlbnQsIHF1YW50aXR5KSB7XHJcbiAgICAgICAgcXVhbnRpdHkgPSB0aGlzLnJlbW92ZShxdWFudGl0eSk7XHJcbiAgICAgICAgYWdlbnRbdGhpcy5sYWJlbF0gPSBhZ2VudFt0aGlzLmxhYmVsXSB8fCAwO1xyXG4gICAgICAgIGFnZW50W3RoaXMubGFiZWxdICs9IHF1YW50aXR5O1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlc291cmNlLmpzLm1hcCIsImltcG9ydCB7IFJlc291cmNlIH0gZnJvbSAnLi9yZXNvdXJjZSc7XHJcbmV4cG9ydCBjb25zdCBTVUNDRVNTID0gMTtcclxuZXhwb3J0IGNvbnN0IEZBSUxFRCA9IDI7XHJcbmV4cG9ydCBjb25zdCBSVU5OSU5HID0gMztcclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNTVlVSSShkYXRhKSB7XHJcbiAgICB2YXIgZGF0YVN0cmluZztcclxuICAgIHZhciBVUkk7XHJcbiAgICB2YXIgY3N2Q29udGVudCA9IFwiZGF0YTp0ZXh0L2NzdjtjaGFyc2V0PXV0Zi04LFwiO1xyXG4gICAgdmFyIGNzdkNvbnRlbnRBcnJheSA9IFtdO1xyXG4gICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpbmZvQXJyYXkpIHtcclxuICAgICAgICBkYXRhU3RyaW5nID0gaW5mb0FycmF5LmpvaW4oXCIsXCIpO1xyXG4gICAgICAgIGNzdkNvbnRlbnRBcnJheS5wdXNoKGRhdGFTdHJpbmcpO1xyXG4gICAgfSk7XHJcbiAgICBjc3ZDb250ZW50ICs9IGNzdkNvbnRlbnRBcnJheS5qb2luKFwiXFxuXCIpO1xyXG4gICAgVVJJID0gZW5jb2RlVVJJKGNzdkNvbnRlbnQpO1xyXG4gICAgcmV0dXJuIFVSSTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gYXJyYXlGcm9tUmFuZ2Uoc3RhcnQsIGVuZCwgc3RlcCkge1xyXG4gICAgdmFyIHJhbmdlID0gW107XHJcbiAgICB2YXIgaSA9IHN0YXJ0O1xyXG4gICAgd2hpbGUgKGkgPCBlbmQpIHtcclxuICAgICAgICByYW5nZS5wdXNoKGkpO1xyXG4gICAgICAgIGkgKz0gc3RlcDtcclxuICAgIH1cclxuICAgIHJldHVybiByYW5nZTtcclxufVxyXG4vKipcclxuKiBzaHVmZmxlIC0gZmlzaGVyLXlhdGVzIHNodWZmbGVcclxuKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNodWZmbGUoYXJyYXksIHJuZykge1xyXG4gICAgdmFyIGN1cnJlbnRJbmRleCA9IGFycmF5Lmxlbmd0aCwgdGVtcG9yYXJ5VmFsdWUsIHJhbmRvbUluZGV4O1xyXG4gICAgLy8gV2hpbGUgdGhlcmUgcmVtYWluIGVsZW1lbnRzIHRvIHNodWZmbGUuLi5cclxuICAgIHdoaWxlICgwICE9PSBjdXJyZW50SW5kZXgpIHtcclxuICAgICAgICAvLyBQaWNrIGEgcmVtYWluaW5nIGVsZW1lbnQuLi5cclxuICAgICAgICByYW5kb21JbmRleCA9IE1hdGguZmxvb3Iocm5nLnJhbmRvbSgpICogY3VycmVudEluZGV4KTtcclxuICAgICAgICBjdXJyZW50SW5kZXggLT0gMTtcclxuICAgICAgICAvLyBBbmQgc3dhcCBpdCB3aXRoIHRoZSBjdXJyZW50IGVsZW1lbnQuXHJcbiAgICAgICAgdGVtcG9yYXJ5VmFsdWUgPSBhcnJheVtjdXJyZW50SW5kZXhdO1xyXG4gICAgICAgIGFycmF5W2N1cnJlbnRJbmRleF0gPSBhcnJheVtyYW5kb21JbmRleF07XHJcbiAgICAgICAgYXJyYXlbcmFuZG9tSW5kZXhdID0gdGVtcG9yYXJ5VmFsdWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXJyYXk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlVVVJRCgpIHtcclxuICAgIC8vIGh0dHA6Ly93d3cuYnJvb2ZhLmNvbS9Ub29scy9NYXRoLnV1aWQuaHRtXHJcbiAgICB2YXIgY2hhcnMgPSAnMDEyMzQ1Njc4OUFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXonLnNwbGl0KCcnKTtcclxuICAgIHZhciB1dWlkID0gbmV3IEFycmF5KDM2KTtcclxuICAgIHZhciBybmQgPSAwLCByO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzNjsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGkgPT0gOCB8fCBpID09IDEzIHx8IGkgPT0gMTggfHwgaSA9PSAyMykge1xyXG4gICAgICAgICAgICB1dWlkW2ldID0gJy0nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChpID09IDE0KSB7XHJcbiAgICAgICAgICAgIHV1aWRbaV0gPSAnNCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAocm5kIDw9IDB4MDIpXHJcbiAgICAgICAgICAgICAgICBybmQgPSAweDIwMDAwMDAgKyAoTWF0aC5yYW5kb20oKSAqIDB4MTAwMDAwMCkgfCAwO1xyXG4gICAgICAgICAgICByID0gcm5kICYgMHhmO1xyXG4gICAgICAgICAgICBybmQgPSBybmQgPj4gNDtcclxuICAgICAgICAgICAgdXVpZFtpXSA9IGNoYXJzWyhpID09IDE5KSA/IChyICYgMHgzKSB8IDB4OCA6IHJdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB1dWlkLmpvaW4oJycpO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBhbHdheXMoYSkge1xyXG4gICAgaWYgKGEgPT09IFNVQ0NFU1MpIHtcclxuICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGV2ZW50dWFsbHkoYSkge1xyXG4gICAgaWYgKGEgPT09IFNVQ0NFU1MpIHtcclxuICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBSVU5OSU5HO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBlcXVhbFRvKGEsIGIpIHtcclxuICAgIGlmIChhID09PSBiKSB7XHJcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBub3QocmVzdWx0KSB7XHJcbiAgICB2YXIgbmV3UmVzdWx0O1xyXG4gICAgaWYgKHJlc3VsdCA9PT0gU1VDQ0VTUykge1xyXG4gICAgICAgIG5ld1Jlc3VsdCA9IEZBSUxFRDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHJlc3VsdCA9PT0gRkFJTEVEKSB7XHJcbiAgICAgICAgbmV3UmVzdWx0ID0gU1VDQ0VTUztcclxuICAgIH1cclxuICAgIHJldHVybiBuZXdSZXN1bHQ7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIG5vdEVxdWFsVG8oYSwgYikge1xyXG4gICAgaWYgKGEgIT09IGIpIHtcclxuICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGd0KGEsIGIpIHtcclxuICAgIGlmIChhID4gYikge1xyXG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZ3RFcShhLCBiKSB7XHJcbiAgICBpZiAoYSA+PSBiKSB7XHJcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBsdChhLCBiKSB7XHJcbiAgICBpZiAoYSA8IGIpIHtcclxuICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGx0RXEoYSwgYikge1xyXG4gICAgaWYgKGEgPD0gYikge1xyXG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gaGFzUHJvcChhLCBiKSB7XHJcbiAgICBhID0gYSB8fCBmYWxzZTtcclxuICAgIGlmIChhID09PSBiKSB7XHJcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBpblJhbmdlKGEsIGIpIHtcclxuICAgIGlmIChiID49IGFbMF0gJiYgYiA8PSBhWzFdKSB7XHJcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBub3RJblJhbmdlKGEsIGIpIHtcclxuICAgIGlmIChiID49IGFbMF0gJiYgYiA8PSBhWzFdKSB7XHJcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRNYXRjaGVyU3RyaW5nKGNoZWNrKSB7XHJcbiAgICB2YXIgc3RyaW5nID0gbnVsbDtcclxuICAgIHN3aXRjaCAoY2hlY2spIHtcclxuICAgICAgICBjYXNlIGVxdWFsVG86XHJcbiAgICAgICAgICAgIHN0cmluZyA9IFwiZXF1YWwgdG9cIjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBub3RFcXVhbFRvOlxyXG4gICAgICAgICAgICBzdHJpbmcgPSBcIm5vdCBlcXVhbCB0b1wiO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIGd0OlxyXG4gICAgICAgICAgICBzdHJpbmcgPSBcImdyZWF0ZXIgdGhhblwiO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIGd0RXE6XHJcbiAgICAgICAgICAgIHN0cmluZyA9IFwiZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvXCI7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgbHQ6XHJcbiAgICAgICAgICAgIHN0cmluZyA9IFwibGVzcyB0aGFuXCI7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgbHRFcTpcclxuICAgICAgICAgICAgc3RyaW5nID0gXCJsZXNzIHRoYW4gb3IgZXF1YWwgdG9cIjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBoYXNQcm9wOlxyXG4gICAgICAgICAgICBzdHJpbmcgPSBcImhhcyB0aGUgcHJvcGVydHlcIjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHN0cmluZyA9IFwibm90IGEgZGVmaW5lZCBtYXRjaGVyXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHN0cmluZztcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gc2V0TWluKHBhcmFtcywga2V5cykge1xyXG4gICAgZm9yICh2YXIgcGFyYW0gaW4gcGFyYW1zKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiAoa2V5cykgIT09ICd1bmRlZmluZWQnICYmIGtleXMuaW5kZXhPZihwYXJhbSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHBhcmFtc1twYXJhbV0uY3VycmVudCA9IHBhcmFtc1twYXJhbV0udmFsdWUgLSBwYXJhbXNbcGFyYW1dLmVycm9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgKGtleXMpID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBwYXJhbXNbcGFyYW1dLmN1cnJlbnQgPSBwYXJhbXNbcGFyYW1dLnZhbHVlIC0gcGFyYW1zW3BhcmFtXS5lcnJvcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHNldE1heChwYXJhbXMsIGtleXMpIHtcclxuICAgIGZvciAodmFyIHBhcmFtIGluIHBhcmFtcykge1xyXG4gICAgICAgIGlmICh0eXBlb2YgKGtleXMpICE9PSAndW5kZWZpbmVkJyAmJiBrZXlzLmluZGV4T2YocGFyYW0pICE9PSAtMSkge1xyXG4gICAgICAgICAgICBwYXJhbXNbcGFyYW1dLmN1cnJlbnQgPSBwYXJhbXNbcGFyYW1dLnZhbHVlICsgcGFyYW1zW3BhcmFtXS5lcnJvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIChrZXlzKSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgcGFyYW1zW3BhcmFtXS5jdXJyZW50ID0gcGFyYW1zW3BhcmFtXS52YWx1ZSArIHBhcmFtc1twYXJhbV0uZXJyb3I7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRTdGFuZGFyZChwYXJhbXMsIGtleXMpIHtcclxuICAgIGZvciAodmFyIHBhcmFtIGluIHBhcmFtcykge1xyXG4gICAgICAgIGlmICh0eXBlb2YgKGtleXMpICE9PSAndW5kZWZpbmVkJyAmJiBrZXlzLmluZGV4T2YocGFyYW0pICE9PSAtMSkge1xyXG4gICAgICAgICAgICBwYXJhbXNbcGFyYW1dLmN1cnJlbnQgPSBwYXJhbXNbcGFyYW1dLnZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgKGtleXMpID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBwYXJhbXNbcGFyYW1dLmN1cnJlbnQgPSBwYXJhbXNbcGFyYW1dLnZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZGF0YVRvTWF0cml4KGl0ZW1zLCBzdGRpemVkID0gZmFsc2UpIHtcclxuICAgIGxldCBkYXRhID0gW107XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgbGV0IGl0ZW0gPSBpdGVtc1tpXTtcclxuICAgICAgICBpZiAoc3RkaXplZCkge1xyXG4gICAgICAgICAgICBpdGVtID0gc2NhbGUoaXRlbSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGl0ZW0uZm9yRWFjaCgoeCwgaWkpID0+IHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBkYXRhW2lpXSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIGRhdGFbaWldID0gWzEsIHhdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZGF0YVtpaV0ucHVzaCh4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGRhdGE7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKHZhbHMsIGNlbnRlciwgc2NhbGUpIHtcclxuICAgIGlmICh0eXBlb2YgdmFscyA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICByZXR1cm4gKHZhbHMgLSBjZW50ZXIpIC8gc2NhbGU7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBjZW50ZXIgPSBjZW50ZXIgfHwgalN0YXQubWVhbih2YWxzKTtcclxuICAgICAgICBzY2FsZSA9IHNjYWxlIHx8IGpTdGF0LnN0ZGV2KHZhbHMpO1xyXG4gICAgICAgIHJldHVybiB2YWxzLm1hcCgoZCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKGQgLSBjZW50ZXIpIC8gc2NhbGU7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlSW52KHZhbHMsIGNlbnRlciwgc2NhbGUpIHtcclxuICAgIGlmICh0eXBlb2YgdmFscyA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICByZXR1cm4gdmFscyAqIHNjYWxlICsgY2VudGVyO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHZhbHMubWFwKChkKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBkICogc2NhbGUgKyBjZW50ZXI7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuLypcclxuKiByZWxhdGl2ZSB0byB0aGUgbWVhbiwgaG93IG1hbnkgc2RzXHJcbiovXHJcbmV4cG9ydCBmdW5jdGlvbiBzdGFuZGFyZGl6ZWQoYXJyKSB7XHJcbiAgICBsZXQgc3RkID0galN0YXQuc3RkZXYoYXJyKTtcclxuICAgIGxldCBtZWFuID0galN0YXQubWVhbihhcnIpO1xyXG4gICAgbGV0IHN0YW5kYXJkaXplZCA9IGFyci5tYXAoKGQpID0+IHtcclxuICAgICAgICByZXR1cm4gKGQgLSBtZWFuKSAvIHN0ZDtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHN0YW5kYXJkaXplZDtcclxufVxyXG4vKlxyXG4qIGJldHdlZW4gMCBhbmQgMSB3aGVuIG1pbiBhbmQgbWF4IGFyZSBrbm93blxyXG4qL1xyXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKHgsIG1pbiwgbWF4KSB7XHJcbiAgICBsZXQgdmFsID0geCAtIG1pbjtcclxuICAgIHJldHVybiB2YWwgLyAobWF4IC0gbWluKTtcclxufVxyXG4vKlxyXG4qIGdpdmUgdGhlIHJlYWwgdW5pdCB2YWx1ZVxyXG4qL1xyXG5leHBvcnQgZnVuY3Rpb24gaW52Tm9ybSh4LCBtaW4sIG1heCkge1xyXG4gICAgcmV0dXJuICh4ICogbWF4IC0geCAqIG1pbikgKyBtaW47XHJcbn1cclxuLypcclxuKlxyXG4qL1xyXG5leHBvcnQgZnVuY3Rpb24gcmFuZFJhbmdlKG1pbiwgbWF4KSB7XHJcbiAgICByZXR1cm4gKG1heCAtIG1pbikgKiBNYXRoLnJhbmRvbSgpICsgbWluO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRSYW5nZShkYXRhLCBwcm9wKSB7XHJcbiAgICBsZXQgcmFuZ2UgPSB7XHJcbiAgICAgICAgbWluOiAxZTE1LFxyXG4gICAgICAgIG1heDogLTFlMTVcclxuICAgIH07XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAocmFuZ2UubWluID4gZGF0YVtpXVtwcm9wXSkge1xyXG4gICAgICAgICAgICByYW5nZS5taW4gPSBkYXRhW2ldW3Byb3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmFuZ2UubWF4IDwgZGF0YVtpXVtwcm9wXSkge1xyXG4gICAgICAgICAgICByYW5nZS5tYXggPSBkYXRhW2ldW3Byb3BdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByYW5nZTtcclxufVxyXG5leHBvcnQgY2xhc3MgTWF0Y2gge1xyXG4gICAgc3RhdGljIGd0KGEsIGIpIHtcclxuICAgICAgICBpZiAoYSA+IGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZ2UoYSwgYikge1xyXG4gICAgICAgIGlmIChhID49IGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgbHQoYSwgYikge1xyXG4gICAgICAgIGlmIChhIDwgYikge1xyXG4gICAgICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgIH1cclxuICAgIHN0YXRpYyBsZShhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEgPD0gYikge1xyXG4gICAgICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgIH1cclxuICAgIHN0YXRpYyBhbHdheXMoYSkge1xyXG4gICAgICAgIGlmIChhID09PSBTVUNDRVNTKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZXZlbnR1YWxseShhKSB7XHJcbiAgICAgICAgaWYgKGEgPT09IFNVQ0NFU1MpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gUlVOTklORztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZXF1YWxUbyhhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEgPT09IGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHN0YXRpYyBub3QocmVzdWx0KSB7XHJcbiAgICAgICAgdmFyIG5ld1Jlc3VsdDtcclxuICAgICAgICBpZiAocmVzdWx0ID09PSBTVUNDRVNTKSB7XHJcbiAgICAgICAgICAgIG5ld1Jlc3VsdCA9IEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAocmVzdWx0ID09PSBGQUlMRUQpIHtcclxuICAgICAgICAgICAgbmV3UmVzdWx0ID0gU1VDQ0VTUztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ld1Jlc3VsdDtcclxuICAgIH1cclxuICAgIHN0YXRpYyBub3RFcXVhbFRvKGEsIGIpIHtcclxuICAgICAgICBpZiAoYSAhPT0gYikge1xyXG4gICAgICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc3RhdGljIGd0RXEoYSwgYikge1xyXG4gICAgICAgIGlmIChhID49IGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHN0YXRpYyBsdEVxKGEsIGIpIHtcclxuICAgICAgICBpZiAoYSA8PSBiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgaGFzUHJvcChhLCBiKSB7XHJcbiAgICAgICAgYSA9IGEgfHwgZmFsc2U7XHJcbiAgICAgICAgaWYgKGEgPT09IGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHN0YXRpYyBpblJhbmdlKGEsIGIpIHtcclxuICAgICAgICBpZiAoYiA+PSBhWzBdICYmIGIgPD0gYVsxXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc3RhdGljIG5vdEluUmFuZ2UoYSwgYikge1xyXG4gICAgICAgIGlmIChiID49IGFbMF0gJiYgYiA8PSBhWzFdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGFkZFJlc291cmNlcyhhcnIsIHRlbXBsYXRlLCBudW1iZXIpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtYmVyOyBpKyspIHtcclxuICAgICAgICBhcnIucHVzaChuZXcgUmVzb3VyY2UodGVtcGxhdGUpKTtcclxuICAgIH1cclxuICAgIHJldHVybiBhcnI7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlUG9wKG51bUFnZW50cywgb3B0aW9ucywgdHlwZSwgYm91bmRhcmllcywgY3VycmVudEFnZW50SWQsIHJuZykge1xyXG4gICAgdmFyIHBvcCA9IFtdO1xyXG4gICAgdmFyIGxvY3MgPSB7XHJcbiAgICAgICAgdHlwZTogJ0ZlYXR1cmVDb2xsZWN0aW9uJyxcclxuICAgICAgICBmZWF0dXJlczogW11cclxuICAgIH07XHJcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCBbXTtcclxuICAgIHR5cGUgPSB0eXBlIHx8ICdjb250aW51b3VzJztcclxuICAgIGZvciAodmFyIGEgPSAwOyBhIDwgbnVtQWdlbnRzOyBhKyspIHtcclxuICAgICAgICBwb3BbYV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBjdXJyZW50QWdlbnRJZCxcclxuICAgICAgICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgICAgICAgc3RhdGVzOiB7fVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgLy9tb3ZlbWVudCBwYXJhbXNcclxuICAgICAgICBwb3BbYV0ubW92ZVBlckRheSA9IHJuZy5ub3JtYWwoMjUwMCAqIDI0LCAxMDAwKTsgLy8gbS9kYXlcclxuICAgICAgICBwb3BbYV0ucHJldlggPSAwO1xyXG4gICAgICAgIHBvcFthXS5wcmV2WSA9IDA7XHJcbiAgICAgICAgcG9wW2FdLm1vdmVkVG90YWwgPSAwO1xyXG4gICAgICAgIGlmIChwb3BbYV0udHlwZSA9PT0gJ2NvbnRpbnVvdXMnKSB7XHJcbiAgICAgICAgICAgIHBvcFthXS5tZXNoID0gbmV3IFRIUkVFLk1lc2gobmV3IFRIUkVFLlRldHJhaGVkcm9uR2VvbWV0cnkoMSwgMSksIG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7XHJcbiAgICAgICAgICAgICAgICBjb2xvcjogMHgwMDAwMDBcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICBwb3BbYV0ubWVzaC5xSWQgPSBwb3BbYV0uaWQ7XHJcbiAgICAgICAgICAgIHBvcFthXS5tZXNoLnR5cGUgPSAnYWdlbnQnO1xyXG4gICAgICAgICAgICBwb3BbYV0ucG9zaXRpb24gPSB7IHg6IDAsIHk6IDAsIHo6IDAgfTtcclxuICAgICAgICAgICAgcG9wW2FdLmJvdW5kYXJ5R3JvdXAgPSBvcHRpb25zLmdyb3VwTmFtZTtcclxuICAgICAgICAgICAgcG9wW2FdLnBvc2l0aW9uLnggPSBybmcucmFuZFJhbmdlKGJvdW5kYXJpZXMubGVmdCwgYm91bmRhcmllcy5yaWdodCk7XHJcbiAgICAgICAgICAgIHBvcFthXS5wb3NpdGlvbi55ID0gcm5nLnJhbmRSYW5nZShib3VuZGFyaWVzLmJvdHRvbSwgYm91bmRhcmllcy50b3ApO1xyXG4gICAgICAgICAgICBwb3BbYV0ubWVzaC5wb3NpdGlvbi54ID0gcG9wW2FdLnBvc2l0aW9uLng7XHJcbiAgICAgICAgICAgIHBvcFthXS5tZXNoLnBvc2l0aW9uLnkgPSBwb3BbYV0ucG9zaXRpb24ueTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzY2VuZSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIHNjZW5lLmFkZChwb3BbYV0ubWVzaCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHBvcFthXS50eXBlID09PSAnZ2Vvc3BhdGlhbCcpIHtcclxuICAgICAgICAgICAgbG9jcy5mZWF0dXJlc1thXSA9IHR1cmYucG9pbnQoW3JuZy5yYW5kUmFuZ2UoLTc1LjE0NjcsIC03NS4xODY3KSwgcm5nLnJhbmRSYW5nZSgzOS45MjAwLCAzOS45OTAwKV0pO1xyXG4gICAgICAgICAgICBwb3BbYV0ubG9jYXRpb24gPSBsb2NzLmZlYXR1cmVzW2FdO1xyXG4gICAgICAgICAgICBwb3BbYV0ubG9jYXRpb24ucHJvcGVydGllcy5hZ2VudFJlZklEID0gcG9wW2FdLmlkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwb3BbYV0gPSBhc3NpZ25QYXJhbXMocG9wW2FdLCBvcHRpb25zLCBybmcpO1xyXG4gICAgICAgIGN1cnJlbnRBZ2VudElkKys7XHJcbiAgICB9XHJcbiAgICBmb3IgKGxldCBhID0gMDsgYSA8IHBvcC5sZW5ndGg7IGErKykge1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBwb3BbYV0uc3RhdGVzKSB7XHJcbiAgICAgICAgICAgIHBvcFthXVtwb3BbYV0uc3RhdGVzW2tleV1dID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gW3BvcCwgbG9jc107XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGFzc2lnblBhcmFtcyh0YXJnZXRPYmosIHBhcmFtcywgcm5nKSB7XHJcbiAgICBmb3IgKGxldCBrZXkgaW4gcGFyYW1zKSB7XHJcbiAgICAgICAgdGFyZ2V0T2JqW2tleV0gPSBhc3NpZ25QYXJhbSh0YXJnZXRPYmosIHBhcmFtc1trZXldLCBrZXksIHJuZyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGFyZ2V0T2JqO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBhc3NpZ25QYXJhbSh0YXJnZXRPYmosIHBhcmFtLCBrZXksIHJuZykge1xyXG4gICAgaWYgKHR5cGVvZiBwYXJhbS5zdGF0ZXMgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgdGFyZ2V0T2JqLnN0YXRlc1trZXldID0gcm5nLnBpY2socGFyYW0uc3RhdGVzLnBhcmFtc1swXSwgcGFyYW0uc3RhdGVzLnBhcmFtc1sxXSk7XHJcbiAgICAgICAgcmV0dXJuIHRhcmdldE9iai5zdGF0ZXNba2V5XTtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgcGFyYW0uZGlzdHJpYnV0aW9uICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIHRhcmdldE9ialtrZXldID0gcm5nW3BhcmFtLmRpc3RyaWJ1dGlvbi5uYW1lXShwYXJhbS5kaXN0cmlidXRpb24ucGFyYW1zWzBdLCBwYXJhbS5kaXN0cmlidXRpb24ucGFyYW1zWzFdKTtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgcGFyYW0uYWN0aW9uICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIHRhcmdldE9ialtrZXldID0gUUFjdGlvbnNbcGFyYW0uYWN0aW9uXTtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgcGFyYW0uYXNzaWduICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIHRhcmdldE9ialtrZXldID0gcGFyYW0uYXNzaWduO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRhcmdldE9ialtrZXldO1xyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXV0aWxzLmpzLm1hcCIsImltcG9ydCB7IGdlbmVyYXRlVVVJRCB9IGZyb20gJy4vdXRpbHMnO1xyXG4vKipcclxuKlFDb21wb25lbnRzIGFyZSB0aGUgYmFzZSBjbGFzcyBmb3IgbWFueSBtb2RlbCBjb21wb25lbnRzLlxyXG4qL1xyXG5leHBvcnQgY2xhc3MgUUNvbXBvbmVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lKSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IGdlbmVyYXRlVVVJRCgpO1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy50aW1lID0gMDtcclxuICAgICAgICB0aGlzLmhpc3RvcnkgPSBbXTtcclxuICAgIH1cclxuICAgIC8qKiBUYWtlIG9uZSB0aW1lIHN0ZXAgZm9yd2FyZCAobW9zdCBzdWJjbGFzc2VzIG92ZXJyaWRlIHRoZSBiYXNlIG1ldGhvZClcclxuICAgICogQHBhcmFtIHN0ZXAgc2l6ZSBvZiB0aW1lIHN0ZXAgKGluIGRheXMgYnkgY29udmVudGlvbilcclxuICAgICovXHJcbiAgICB1cGRhdGUoYWdlbnQsIHN0ZXApIHtcclxuICAgICAgICAvL3NvbWV0aGluZyBzdXBlciFcclxuICAgIH1cclxufVxyXG5RQ29tcG9uZW50LlNVQ0NFU1MgPSAxO1xyXG5RQ29tcG9uZW50LkZBSUxFRCA9IDI7XHJcblFDb21wb25lbnQuUlVOTklORyA9IDM7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVFDb21wb25lbnQuanMubWFwIiwiaW1wb3J0IHsgUUNvbXBvbmVudCB9IGZyb20gJy4vUUNvbXBvbmVudCc7XHJcbmltcG9ydCB7IGdldE1hdGNoZXJTdHJpbmcgfSBmcm9tICcuL3V0aWxzJztcclxuLyoqXHJcbiogQmVsaWVmIERlc2lyZSBJbnRlbnQgYWdlbnRzIGFyZSBzaW1wbGUgcGxhbm5pbmcgYWdlbnRzIHdpdGggbW9kdWxhciBwbGFucyAvIGRlbGliZXJhdGlvbiBwcm9jZXNzZXMuXHJcbiovXHJcbmV4cG9ydCBjbGFzcyBCRElBZ2VudCBleHRlbmRzIFFDb21wb25lbnQge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgZ29hbHMgPSBbXSwgcGxhbnMgPSB7fSwgZGF0YSA9IFtdLCBwb2xpY3lTZWxlY3RvciA9IEJESUFnZW50LnN0b2NoYXN0aWNTZWxlY3Rpb24pIHtcclxuICAgICAgICBzdXBlcihuYW1lKTtcclxuICAgICAgICB0aGlzLmdvYWxzID0gZ29hbHM7XHJcbiAgICAgICAgdGhpcy5wbGFucyA9IHBsYW5zO1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgdGhpcy5wb2xpY3lTZWxlY3RvciA9IHBvbGljeVNlbGVjdG9yO1xyXG4gICAgICAgIHRoaXMuYmVsaWVmSGlzdG9yeSA9IFtdO1xyXG4gICAgICAgIHRoaXMucGxhbkhpc3RvcnkgPSBbXTtcclxuICAgIH1cclxuICAgIC8qKiBUYWtlIG9uZSB0aW1lIHN0ZXAgZm9yd2FyZCwgdGFrZSBpbiBiZWxpZWZzLCBkZWxpYmVyYXRlLCBpbXBsZW1lbnQgcG9saWN5XHJcbiAgICAqIEBwYXJhbSBzdGVwIHNpemUgb2YgdGltZSBzdGVwIChpbiBkYXlzIGJ5IGNvbnZlbnRpb24pXHJcbiAgICAqL1xyXG4gICAgdXBkYXRlKGFnZW50LCBzdGVwKSB7XHJcbiAgICAgICAgdmFyIHBvbGljeSwgaW50ZW50LCBldmFsdWF0aW9uO1xyXG4gICAgICAgIHBvbGljeSA9IHRoaXMucG9saWN5U2VsZWN0b3IodGhpcy5wbGFucywgdGhpcy5wbGFuSGlzdG9yeSwgYWdlbnQpO1xyXG4gICAgICAgIGludGVudCA9IHRoaXMucGxhbnNbcG9saWN5XTtcclxuICAgICAgICBpbnRlbnQoYWdlbnQsIHN0ZXApO1xyXG4gICAgICAgIGV2YWx1YXRpb24gPSB0aGlzLmV2YWx1YXRlR29hbHMoYWdlbnQpO1xyXG4gICAgICAgIHRoaXMucGxhbkhpc3RvcnkucHVzaCh7IHRpbWU6IHRoaXMudGltZSwgaWQ6IGFnZW50LmlkLCBpbnRlbnRpb246IHBvbGljeSwgZ29hbHM6IGV2YWx1YXRpb24uYWNoaWV2ZW1lbnRzLCBiYXJyaWVyczogZXZhbHVhdGlvbi5iYXJyaWVycywgcjogZXZhbHVhdGlvbi5zdWNjZXNzZXMgLyB0aGlzLmdvYWxzLmxlbmd0aCB9KTtcclxuICAgIH1cclxuICAgIGV2YWx1YXRlR29hbHMoYWdlbnQpIHtcclxuICAgICAgICBsZXQgYWNoaWV2ZW1lbnRzID0gW10sIGJhcnJpZXJzID0gW10sIHN1Y2Nlc3NlcyA9IDAsIGMsIG1hdGNoZXI7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmdvYWxzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGMgPSB0aGlzLmdvYWxzW2ldLmNvbmRpdGlvbjtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjLmRhdGEgPT09ICd1bmRlZmluZWQnIHx8IGMuZGF0YSA9PT0gXCJhZ2VudFwiKSB7XHJcbiAgICAgICAgICAgICAgICBjLmRhdGEgPSBhZ2VudDsgLy9pZiBubyBkYXRhc291cmNlIGlzIHNldCwgdXNlIHRoZSBhZ2VudFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGFjaGlldmVtZW50c1tpXSA9IHRoaXMuZ29hbHNbaV0udGVtcG9yYWwoYy5jaGVjayhjLmRhdGFbYy5rZXldLCBjLnZhbHVlKSk7XHJcbiAgICAgICAgICAgIGlmIChhY2hpZXZlbWVudHNbaV0gPT09IEJESUFnZW50LlNVQ0NFU1MpIHtcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3NlcyArPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbWF0Y2hlciA9IGdldE1hdGNoZXJTdHJpbmcoYy5jaGVjayk7XHJcbiAgICAgICAgICAgICAgICBiYXJyaWVycy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogYy5sYWJlbCxcclxuICAgICAgICAgICAgICAgICAgICBrZXk6IGMua2V5LFxyXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrOiBtYXRjaGVyLFxyXG4gICAgICAgICAgICAgICAgICAgIGFjdHVhbDogYy5kYXRhW2Mua2V5XSxcclxuICAgICAgICAgICAgICAgICAgICBleHBlY3RlZDogYy52YWx1ZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHsgc3VjY2Vzc2VzOiBzdWNjZXNzZXMsIGJhcnJpZXJzOiBiYXJyaWVycywgYWNoaWV2ZW1lbnRzOiBhY2hpZXZlbWVudHMgfTtcclxuICAgIH1cclxuICAgIC8vZ29vZCBmb3IgdHJhaW5pbmdcclxuICAgIHN0YXRpYyBzdG9jaGFzdGljU2VsZWN0aW9uKHBsYW5zLCBwbGFuSGlzdG9yeSwgYWdlbnQpIHtcclxuICAgICAgICB2YXIgcG9saWN5LCBzY29yZSwgbWF4ID0gMDtcclxuICAgICAgICBmb3IgKHZhciBwbGFuIGluIHBsYW5zKSB7XHJcbiAgICAgICAgICAgIHNjb3JlID0gTWF0aC5yYW5kb20oKTtcclxuICAgICAgICAgICAgaWYgKHNjb3JlID49IG1heCkge1xyXG4gICAgICAgICAgICAgICAgbWF4ID0gc2NvcmU7XHJcbiAgICAgICAgICAgICAgICBwb2xpY3kgPSBwbGFuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwb2xpY3k7XHJcbiAgICB9XHJcbn1cclxuQkRJQWdlbnQubGF6eVBvbGljeVNlbGVjdGlvbiA9IGZ1bmN0aW9uIChwbGFucywgcGxhbkhpc3RvcnksIGFnZW50KSB7XHJcbiAgICB2YXIgb3B0aW9ucywgc2VsZWN0aW9uO1xyXG4gICAgaWYgKHRoaXMudGltZSA+IDApIHtcclxuICAgICAgICBvcHRpb25zID0gT2JqZWN0LmtleXMocGxhbnMpO1xyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zLnNsaWNlKDEsIG9wdGlvbnMubGVuZ3RoKTtcclxuICAgICAgICBzZWxlY3Rpb24gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBvcHRpb25zLmxlbmd0aCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBvcHRpb25zID0gT2JqZWN0LmtleXMocGxhbnMpO1xyXG4gICAgICAgIHNlbGVjdGlvbiA9IDA7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gb3B0aW9uc1tzZWxlY3Rpb25dO1xyXG59O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1iZGkuanMubWFwIiwiaW1wb3J0IHsgUUNvbXBvbmVudCB9IGZyb20gJy4vUUNvbXBvbmVudCc7XHJcbmltcG9ydCB7IGdlbmVyYXRlVVVJRCB9IGZyb20gJy4vdXRpbHMnO1xyXG4vKipcclxuKiBCZWhhdmlvciBUcmVlXHJcbioqL1xyXG5leHBvcnQgY2xhc3MgQmVoYXZpb3JUcmVlIGV4dGVuZHMgUUNvbXBvbmVudCB7XHJcbiAgICBzdGF0aWMgdGljayhub2RlLCBhZ2VudCkge1xyXG4gICAgICAgIHZhciBzdGF0ZSA9IG5vZGUub3BlcmF0ZShhZ2VudCk7XHJcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG4gICAgY29uc3RydWN0b3IobmFtZSwgcm9vdCwgZGF0YSkge1xyXG4gICAgICAgIHN1cGVyKG5hbWUpO1xyXG4gICAgICAgIHRoaXMucm9vdCA9IHJvb3Q7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgICAgICB0aGlzLnJlc3VsdHMgPSBbXTtcclxuICAgIH1cclxuICAgIHVwZGF0ZShhZ2VudCwgc3RlcCkge1xyXG4gICAgICAgIHZhciBzdGF0ZTtcclxuICAgICAgICBhZ2VudC5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIHdoaWxlIChhZ2VudC5hY3RpdmUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgc3RhdGUgPSBCZWhhdmlvclRyZWUudGljayh0aGlzLnJvb3QsIGFnZW50KTtcclxuICAgICAgICAgICAgYWdlbnQudGltZSA9IHRoaXMudGltZTtcclxuICAgICAgICAgICAgYWdlbnQuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgQlROb2RlIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUpIHtcclxuICAgICAgICB0aGlzLmlkID0gZ2VuZXJhdGVVVUlEKCk7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgQlRDb250cm9sTm9kZSBleHRlbmRzIEJUTm9kZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBjaGlsZHJlbikge1xyXG4gICAgICAgIHN1cGVyKG5hbWUpO1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgQlRSb290IGV4dGVuZHMgQlRDb250cm9sTm9kZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBjaGlsZHJlbikge1xyXG4gICAgICAgIHN1cGVyKG5hbWUsIGNoaWxkcmVuKTtcclxuICAgICAgICB0aGlzLnR5cGUgPSBcInJvb3RcIjtcclxuICAgICAgICB0aGlzLm9wZXJhdGUgPSBmdW5jdGlvbiAoYWdlbnQpIHtcclxuICAgICAgICAgICAgdmFyIHN0YXRlID0gQmVoYXZpb3JUcmVlLnRpY2sodGhpcy5jaGlsZHJlblswXSwgYWdlbnQpO1xyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgQlRTZWxlY3RvciBleHRlbmRzIEJUQ29udHJvbE5vZGUge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgY2hpbGRyZW4pIHtcclxuICAgICAgICBzdXBlcihuYW1lLCBjaGlsZHJlbik7XHJcbiAgICAgICAgdGhpcy50eXBlID0gXCJzZWxlY3RvclwiO1xyXG4gICAgICAgIHRoaXMub3BlcmF0ZSA9IGZ1bmN0aW9uIChhZ2VudCkge1xyXG4gICAgICAgICAgICB2YXIgY2hpbGRTdGF0ZTtcclxuICAgICAgICAgICAgZm9yICh2YXIgY2hpbGQgaW4gdGhpcy5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgY2hpbGRTdGF0ZSA9IEJlaGF2aW9yVHJlZS50aWNrKHRoaXMuY2hpbGRyZW5bY2hpbGRdLCBhZ2VudCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRTdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLlJVTk5JTkcpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLlJVTk5JTkc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRTdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLlNVQ0NFU1MpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLlNVQ0NFU1M7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5GQUlMRUQ7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgQlRTZXF1ZW5jZSBleHRlbmRzIEJUQ29udHJvbE5vZGUge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgY2hpbGRyZW4pIHtcclxuICAgICAgICBzdXBlcihuYW1lLCBjaGlsZHJlbik7XHJcbiAgICAgICAgdGhpcy50eXBlID0gXCJzZXF1ZW5jZVwiO1xyXG4gICAgICAgIHRoaXMub3BlcmF0ZSA9IGZ1bmN0aW9uIChhZ2VudCkge1xyXG4gICAgICAgICAgICB2YXIgY2hpbGRTdGF0ZTtcclxuICAgICAgICAgICAgZm9yICh2YXIgY2hpbGQgaW4gdGhpcy5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgY2hpbGRTdGF0ZSA9IEJlaGF2aW9yVHJlZS50aWNrKHRoaXMuY2hpbGRyZW5bY2hpbGRdLCBhZ2VudCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRTdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLlJVTk5JTkcpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLlJVTk5JTkc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRTdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLkZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBCZWhhdmlvclRyZWUuRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBCZWhhdmlvclRyZWUuU1VDQ0VTUztcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBCVFBhcmFsbGVsIGV4dGVuZHMgQlRDb250cm9sTm9kZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBjaGlsZHJlbiwgc3VjY2Vzc2VzKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSwgY2hpbGRyZW4pO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IFwicGFyYWxsZWxcIjtcclxuICAgICAgICB0aGlzLnN1Y2Nlc3NlcyA9IHN1Y2Nlc3NlcztcclxuICAgICAgICB0aGlzLm9wZXJhdGUgPSBmdW5jdGlvbiAoYWdlbnQpIHtcclxuICAgICAgICAgICAgdmFyIHN1Y2NlZWRlZCA9IFtdLCBmYWlsdXJlcyA9IFtdLCBjaGlsZFN0YXRlLCBtYWpvcml0eTtcclxuICAgICAgICAgICAgZm9yICh2YXIgY2hpbGQgaW4gdGhpcy5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgY2hpbGRTdGF0ZSA9IEJlaGF2aW9yVHJlZS50aWNrKHRoaXMuY2hpbGRyZW5bY2hpbGRdLCBhZ2VudCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRTdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLlNVQ0NFU1MpIHtcclxuICAgICAgICAgICAgICAgICAgICBzdWNjZWVkZWQucHVzaChjaGlsZFN0YXRlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5GQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgICAgICBmYWlsdXJlcy5wdXNoKGNoaWxkU3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY2hpbGRTdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLlJVTk5JTkcpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLlJVTk5JTkc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHN1Y2NlZWRlZC5sZW5ndGggPj0gdGhpcy5zdWNjZXNzZXMpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBCZWhhdmlvclRyZWUuU1VDQ0VTUztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBCZWhhdmlvclRyZWUuRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgQlRDb25kaXRpb24gZXh0ZW5kcyBCVE5vZGUge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgY29uZGl0aW9uKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSk7XHJcbiAgICAgICAgdGhpcy50eXBlID0gXCJjb25kaXRpb25cIjtcclxuICAgICAgICB0aGlzLmNvbmRpdGlvbiA9IGNvbmRpdGlvbjtcclxuICAgICAgICB0aGlzLm9wZXJhdGUgPSBmdW5jdGlvbiAoYWdlbnQpIHtcclxuICAgICAgICAgICAgdmFyIHN0YXRlO1xyXG4gICAgICAgICAgICBzdGF0ZSA9IGNvbmRpdGlvbi5jaGVjayhhZ2VudFtjb25kaXRpb24ua2V5XSwgY29uZGl0aW9uLnZhbHVlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEJUQWN0aW9uIGV4dGVuZHMgQlROb2RlIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNvbmRpdGlvbiwgYWN0aW9uKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSk7XHJcbiAgICAgICAgdGhpcy50eXBlID0gXCJhY3Rpb25cIjtcclxuICAgICAgICB0aGlzLmNvbmRpdGlvbiA9IGNvbmRpdGlvbjtcclxuICAgICAgICB0aGlzLmFjdGlvbiA9IGFjdGlvbjtcclxuICAgICAgICB0aGlzLm9wZXJhdGUgPSBmdW5jdGlvbiAoYWdlbnQpIHtcclxuICAgICAgICAgICAgdmFyIHN0YXRlO1xyXG4gICAgICAgICAgICBzdGF0ZSA9IGNvbmRpdGlvbi5jaGVjayhhZ2VudFtjb25kaXRpb24ua2V5XSwgY29uZGl0aW9uLnZhbHVlKTtcclxuICAgICAgICAgICAgaWYgKHN0YXRlID09PSBCZWhhdmlvclRyZWUuU1VDQ0VTUykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hY3Rpb24oYWdlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWJlaGF2aW9yVHJlZS5qcy5tYXAiLCJpbXBvcnQgeyBnZW5lcmF0ZVVVSUQgfSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IHsgUUNvbXBvbmVudCB9IGZyb20gJy4vUUNvbXBvbmVudCc7XHJcbmV4cG9ydCBjbGFzcyBDb21wYXJ0bWVudE1vZGVsIGV4dGVuZHMgUUNvbXBvbmVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBjb21wYXJ0bWVudHMsIGRhdGEpIHtcclxuICAgICAgICBzdXBlcihuYW1lKTtcclxuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhOyAvL2FuIGFycmF5IG9mIFBhdGNoZXMuIEVhY2ggcGF0Y2ggY29udGFpbnMgYW4gYXJyYXkgb2YgY29tcGFydG1lbnRzIGluIG9wZXJhdGlvbmFsIG9yZGVyXHJcbiAgICAgICAgdGhpcy50b3RhbFBvcCA9IDA7XHJcbiAgICAgICAgdGhpcy5jb21wYXJ0bWVudHMgPSBjb21wYXJ0bWVudHM7XHJcbiAgICAgICAgdGhpcy5oaXN0b3J5ID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgZCA9IDA7IGQgPCB0aGlzLmRhdGEubGVuZ3RoOyBkKyspIHtcclxuICAgICAgICAgICAgdGhpcy50b3RhbFBvcCArPSB0aGlzLmRhdGFbZF0udG90YWxQb3A7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3RvbGVyYW5jZSA9IDFlLTk7IC8vbW9kZWwgZXJyIHRvbGVyYW5jZVxyXG4gICAgfVxyXG4gICAgdXBkYXRlKHBhdGNoLCBzdGVwKSB7XHJcbiAgICAgICAgbGV0IHRlbXBfcG9wID0ge30sIHRlbXBfZCA9IHt9LCBuZXh0X2QgPSB7fSwgbHRlID0ge30sIGVyciA9IDEsIG5ld1N0ZXA7XHJcbiAgICAgICAgZm9yIChsZXQgYyBpbiB0aGlzLmNvbXBhcnRtZW50cykge1xyXG4gICAgICAgICAgICBwYXRjaC5kcG9wc1tjXSA9IHRoaXMuY29tcGFydG1lbnRzW2NdLm9wZXJhdGlvbihwYXRjaC5wb3B1bGF0aW9ucywgc3RlcCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vZmlyc3Qgb3JkZXIgKEV1bGVyKVxyXG4gICAgICAgIGZvciAobGV0IGMgaW4gdGhpcy5jb21wYXJ0bWVudHMpIHtcclxuICAgICAgICAgICAgdGVtcF9wb3BbY10gPSBwYXRjaC5wb3B1bGF0aW9uc1tjXTtcclxuICAgICAgICAgICAgdGVtcF9kW2NdID0gcGF0Y2guZHBvcHNbY107XHJcbiAgICAgICAgICAgIHBhdGNoLnBvcHVsYXRpb25zW2NdID0gdGVtcF9wb3BbY10gKyB0ZW1wX2RbY107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vc2Vjb25kIG9yZGVyIChIZXVucylcclxuICAgICAgICBwYXRjaC50b3RhbFBvcCA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQgYyBpbiB0aGlzLmNvbXBhcnRtZW50cykge1xyXG4gICAgICAgICAgICBuZXh0X2RbY10gPSB0aGlzLmNvbXBhcnRtZW50c1tjXS5vcGVyYXRpb24ocGF0Y2gucG9wdWxhdGlvbnMsIHN0ZXApO1xyXG4gICAgICAgICAgICBwYXRjaC5wb3B1bGF0aW9uc1tjXSA9IHRlbXBfcG9wW2NdICsgKDAuNSAqICh0ZW1wX2RbY10gKyBuZXh0X2RbY10pKTtcclxuICAgICAgICAgICAgcGF0Y2gudG90YWxQb3AgKz0gcGF0Y2gucG9wdWxhdGlvbnNbY107XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBDb21wYXJ0bWVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBwb3AsIG9wZXJhdGlvbikge1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy5vcGVyYXRpb24gPSBvcGVyYXRpb24gfHwgbnVsbDtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgUGF0Y2gge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgY29tcGFydG1lbnRzLCBwb3B1bGF0aW9ucykge1xyXG4gICAgICAgIHRoaXMucG9wdWxhdGlvbnMgPSB7fTtcclxuICAgICAgICB0aGlzLmRwb3BzID0ge307XHJcbiAgICAgICAgdGhpcy5pbml0aWFsUG9wID0ge307XHJcbiAgICAgICAgdGhpcy5pZCA9IGdlbmVyYXRlVVVJRCgpO1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy5kcG9wcyA9IHt9O1xyXG4gICAgICAgIHRoaXMuY29tcGFydG1lbnRzID0gY29tcGFydG1lbnRzO1xyXG4gICAgICAgIHRoaXMudG90YWxQb3AgPSAwO1xyXG4gICAgICAgIGZvciAobGV0IGMgaW4gcG9wdWxhdGlvbnMpIHtcclxuICAgICAgICAgICAgdGhpcy5kcG9wc1tjXSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdGlhbFBvcFtjXSA9IHBvcHVsYXRpb25zW2NdO1xyXG4gICAgICAgICAgICB0aGlzLnBvcHVsYXRpb25zW2NdID0gcG9wdWxhdGlvbnNbY107XHJcbiAgICAgICAgICAgIHRoaXMudG90YWxQb3AgKz0gdGhpcy5wb3B1bGF0aW9uc1tjXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29tcGFydG1lbnQuanMubWFwIiwiaW1wb3J0IHsgZ2VuZXJhdGVVVUlEIH0gZnJvbSAnLi91dGlscyc7XHJcbmV4cG9ydCBjbGFzcyBDb250YWN0UGF0Y2gge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgY2FwYWNpdHkpIHtcclxuICAgICAgICB0aGlzLmlkID0gZ2VuZXJhdGVVVUlEKCk7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgICB0aGlzLmNhcGFjaXR5ID0gY2FwYWNpdHk7XHJcbiAgICAgICAgdGhpcy5wb3AgPSAwO1xyXG4gICAgICAgIHRoaXMubWVtYmVycyA9IHt9O1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGRlZmF1bHRGcmVxRihhLCBiKSB7XHJcbiAgICAgICAgdmFyIHZhbCA9ICg1MCAtIE1hdGguYWJzKGEuYWdlIC0gYi5hZ2UpKSAvIDEwMDtcclxuICAgICAgICByZXR1cm4gdmFsO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGRlZmF1bHRDb250YWN0RihhLCB0aW1lKSB7XHJcbiAgICAgICAgdmFyIGMgPSAyICogTWF0aC5zaW4odGltZSkgKyBhO1xyXG4gICAgICAgIGlmIChjID49IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgYXNzaWduKGFnZW50LCBjb250YWN0VmFsdWVGdW5jKSB7XHJcbiAgICAgICAgdmFyIGNvbnRhY3RWYWx1ZTtcclxuICAgICAgICBjb250YWN0VmFsdWVGdW5jID0gY29udGFjdFZhbHVlRnVuYyB8fCBDb250YWN0UGF0Y2guZGVmYXVsdEZyZXFGO1xyXG4gICAgICAgIGlmICh0aGlzLnBvcCA8IHRoaXMuY2FwYWNpdHkpIHtcclxuICAgICAgICAgICAgdGhpcy5tZW1iZXJzW2FnZW50LmlkXSA9IHsgcHJvcGVydGllczogYWdlbnQgfTtcclxuICAgICAgICAgICAgZm9yIChsZXQgb3RoZXIgaW4gdGhpcy5tZW1iZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaWQgPSBwYXJzZUludChvdGhlcik7XHJcbiAgICAgICAgICAgICAgICBpZiAob3RoZXIgIT09IGFnZW50LmlkICYmICFpc05hTihpZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250YWN0VmFsdWUgPSBjb250YWN0VmFsdWVGdW5jKHRoaXMubWVtYmVyc1tpZF0ucHJvcGVydGllcywgYWdlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVtYmVyc1thZ2VudC5pZF1baWRdID0gY29udGFjdFZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVtYmVyc1tpZF1bYWdlbnQuaWRdID0gY29udGFjdFZhbHVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucG9wKys7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmlkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZW5jb3VudGVycyhhZ2VudCwgcHJlY29uZGl0aW9uLCBjb250YWN0RnVuYywgcmVzdWx0S2V5LCBzYXZlID0gZmFsc2UpIHtcclxuICAgICAgICBjb250YWN0RnVuYyA9IGNvbnRhY3RGdW5jIHx8IENvbnRhY3RQYXRjaC5kZWZhdWx0Q29udGFjdEY7XHJcbiAgICAgICAgbGV0IGNvbnRhY3RWYWw7XHJcbiAgICAgICAgZm9yICh2YXIgY29udGFjdCBpbiB0aGlzLm1lbWJlcnMpIHtcclxuICAgICAgICAgICAgaWYgKHByZWNvbmRpdGlvbi5rZXkgPT09ICdzdGF0ZXMnKSB7XHJcbiAgICAgICAgICAgICAgICBjb250YWN0VmFsID0gSlNPTi5zdHJpbmdpZnkodGhpcy5tZW1iZXJzW2NvbnRhY3RdLnByb3BlcnRpZXNbcHJlY29uZGl0aW9uLmtleV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29udGFjdFZhbCA9IHRoaXMubWVtYmVyc1tjb250YWN0XS5wcm9wZXJ0aWVzW3ByZWNvbmRpdGlvbi5rZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwcmVjb25kaXRpb24uY2hlY2sodGhpcy5tZW1iZXJzW2NvbnRhY3RdLnByb3BlcnRpZXNbcHJlY29uZGl0aW9uLmtleV0sIHByZWNvbmRpdGlvbi52YWx1ZSkgJiYgTnVtYmVyKGNvbnRhY3QpICE9PSBhZ2VudC5pZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9sZFZhbCA9IHRoaXMubWVtYmVyc1tjb250YWN0XS5wcm9wZXJ0aWVzW3Jlc3VsdEtleV07XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3VmFsID0gY29udGFjdEZ1bmModGhpcy5tZW1iZXJzW2NvbnRhY3RdLCBhZ2VudCk7XHJcbiAgICAgICAgICAgICAgICBpZiAob2xkVmFsICE9PSBuZXdWYWwgJiYgc2F2ZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVtYmVyc1tjb250YWN0XS5wcm9wZXJ0aWVzW3Jlc3VsdEtleV0gPSBuZXdWYWw7XHJcbiAgICAgICAgICAgICAgICAgICAgQ29udGFjdFBhdGNoLldJV0FycmF5LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRjaElEOiB0aGlzLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZmVjdGVkOiBjb250YWN0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZlY3RlZEFnZTogdGhpcy5tZW1iZXJzW2NvbnRhY3RdLnByb3BlcnRpZXMuYWdlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQ6IHRoaXMubWVtYmVyc1tjb250YWN0XS5wcm9wZXJ0aWVzW3Jlc3VsdEtleV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdEtleTogcmVzdWx0S2V5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBieTogYWdlbnQuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ5QWdlOiBhZ2VudC5hZ2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6IGFnZW50LnRpbWVcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5Db250YWN0UGF0Y2guV0lXQXJyYXkgPSBbXTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29udGFjdFBhdGNoLmpzLm1hcCIsImltcG9ydCB7IHNodWZmbGUgfSBmcm9tICcuL3V0aWxzJztcclxuLyoqXHJcbipFbnZpcm9ubWVudHMgYXJlIHRoZSBleGVjdXRhYmxlIGVudmlyb25tZW50IGNvbnRhaW5pbmcgdGhlIG1vZGVsIGNvbXBvbmVudHMsXHJcbipzaGFyZWQgcmVzb3VyY2VzLCBhbmQgc2NoZWR1bGVyLlxyXG4qL1xyXG5leHBvcnQgY2xhc3MgRW52aXJvbm1lbnQge1xyXG4gICAgY29uc3RydWN0b3IocmVzb3VyY2VzID0gW10sIGVudGl0aWVzID0ge30sIGV2ZW50c1F1ZXVlID0gW10sIGFjdGl2YXRpb25UeXBlID0gJ3JhbmRvbScsIHJuZyA9IE1hdGgpIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAqIHNwYXRpYWwgYm91bmRhcmllc1xyXG4gICAgICAgICoqL1xyXG4gICAgICAgIHRoaXMuYm91bmRhcmllcyA9IHt9O1xyXG4gICAgICAgIHRoaXMudGltZSA9IDA7XHJcbiAgICAgICAgdGhpcy50aW1lT2ZEYXkgPSAwO1xyXG4gICAgICAgIHRoaXMubW9kZWxzID0gW107XHJcbiAgICAgICAgdGhpcy5oaXN0b3J5ID0gW107XHJcbiAgICAgICAgdGhpcy5hZ2VudHMgPSBbXTtcclxuICAgICAgICB0aGlzLnJlc291cmNlcyA9IHJlc291cmNlcztcclxuICAgICAgICB0aGlzLmVudGl0aWVzID0gZW50aXRpZXM7XHJcbiAgICAgICAgdGhpcy5ldmVudHNRdWV1ZSA9IGV2ZW50c1F1ZXVlO1xyXG4gICAgICAgIHRoaXMuYWN0aXZhdGlvblR5cGUgPSBhY3RpdmF0aW9uVHlwZTtcclxuICAgICAgICB0aGlzLnJuZyA9IHJuZztcclxuICAgICAgICB0aGlzLl9hZ2VudEluZGV4ID0ge307XHJcbiAgICB9XHJcbiAgICAvKiogQWRkIGEgbW9kZWwgY29tcG9uZW50cyBmcm9tIHRoZSBlbnZpcm9ubWVudFxyXG4gICAgKiBAcGFyYW0gY29tcG9uZW50IHRoZSBtb2RlbCBjb21wb25lbnQgb2JqZWN0IHRvIGJlIGFkZGVkIHRvIHRoZSBlbnZpcm9ubWVudC5cclxuICAgICovXHJcbiAgICBhZGQoY29tcG9uZW50KSB7XHJcbiAgICAgICAgdGhpcy5tb2RlbHMucHVzaChjb21wb25lbnQpO1xyXG4gICAgfVxyXG4gICAgLyoqIFJlbW92ZSBhIG1vZGVsIGNvbXBvbmVudHMgZnJvbSB0aGUgZW52aXJvbm1lbnQgYnkgaWRcclxuICAgICogQHBhcmFtIGlkIFVVSUQgb2YgdGhlIGNvbXBvbmVudCB0byBiZSByZW1vdmVkLlxyXG4gICAgKi9cclxuICAgIHJlbW92ZShpZCkge1xyXG4gICAgICAgIHZhciBkZWxldGVJbmRleCwgTCA9IHRoaXMuYWdlbnRzLmxlbmd0aDtcclxuICAgICAgICB0aGlzLm1vZGVscy5mb3JFYWNoKGZ1bmN0aW9uIChjLCBpbmRleCkge1xyXG4gICAgICAgICAgICBpZiAoYy5pZCA9PT0gaWQpIHtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZUluZGV4ID0gaW5kZXg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB3aGlsZSAoTCA+IDAgJiYgdGhpcy5hZ2VudHMubGVuZ3RoID49IDApIHtcclxuICAgICAgICAgICAgTC0tO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5hZ2VudHNbTF0ubW9kZWxJbmRleCA9PT0gZGVsZXRlSW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWdlbnRzLnNwbGljZShMLCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm1vZGVscy5zcGxpY2UoZGVsZXRlSW5kZXgsIDEpO1xyXG4gICAgfVxyXG4gICAgLyoqIFJ1biBhbGwgZW52aXJvbm1lbnQgbW9kZWwgY29tcG9uZW50cyBmcm9tIHQ9MCB1bnRpbCB0PXVudGlsIHVzaW5nIHRpbWUgc3RlcCA9IHN0ZXBcclxuICAgICogQHBhcmFtIHN0ZXAgdGhlIHN0ZXAgc2l6ZVxyXG4gICAgKiBAcGFyYW0gdW50aWwgdGhlIGVuZCB0aW1lXHJcbiAgICAqIEBwYXJhbSBzYXZlSW50ZXJ2YWwgc2F2ZSBldmVyeSAneCcgc3RlcHNcclxuICAgICovXHJcbiAgICBydW4oc3RlcCwgdW50aWwsIHNhdmVJbnRlcnZhbCkge1xyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgICAgIHdoaWxlICh0aGlzLnRpbWUgPD0gdW50aWwpIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGUoc3RlcCk7XHJcbiAgICAgICAgICAgIGxldCByZW0gPSAodGhpcy50aW1lICUgc2F2ZUludGVydmFsKTtcclxuICAgICAgICAgICAgaWYgKHJlbSA8IHN0ZXApIHtcclxuICAgICAgICAgICAgICAgIGxldCBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmFnZW50cykpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oaXN0b3J5ID0gdGhpcy5oaXN0b3J5LmNvbmNhdChjb3B5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnRpbWUgKz0gc3RlcDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKiogQXNzaWduIGFsbCBhZ2VudHMgdG8gYXBwcm9wcmlhdGUgbW9kZWxzXHJcbiAgICAqL1xyXG4gICAgaW5pdCgpIHtcclxuICAgICAgICB0aGlzLl9hZ2VudEluZGV4ID0ge307XHJcbiAgICAgICAgZm9yIChsZXQgYyA9IDA7IGMgPCB0aGlzLm1vZGVscy5sZW5ndGg7IGMrKykge1xyXG4gICAgICAgICAgICBsZXQgYWxyZWFkeUluID0gW107XHJcbiAgICAgICAgICAgIC8vYXNzaWduIGVhY2ggYWdlbnQgbW9kZWwgaW5kZXhlcyB0byBoYW5kbGUgYWdlbnRzIGFzc2lnbmVkIHRvIG11bHRpcGxlIG1vZGVsc1xyXG4gICAgICAgICAgICBmb3IgKGxldCBkID0gMDsgZCA8IHRoaXMubW9kZWxzW2NdLmRhdGEubGVuZ3RoOyBkKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBpZCA9IHRoaXMubW9kZWxzW2NdLmRhdGFbZF0uaWQ7XHJcbiAgICAgICAgICAgICAgICBpZiAoaWQgaW4gdGhpcy5fYWdlbnRJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcyBhZ2VudCBiZWxvbmdzIHRvIG11bHRpcGxlIG1vZGVscy5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVsc1tjXS5kYXRhW2RdLm1vZGVscy5wdXNoKHRoaXMubW9kZWxzW2NdLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZWxzW2NdLmRhdGFbZF0ubW9kZWxJbmRleGVzLnB1c2goYyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxyZWFkeUluLnB1c2goaWQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy90aGlzIGFnZW50IGJlbG9uZ3MgdG8gb25seSBvbmUgbW9kZWwgc28gZmFyLlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FnZW50SW5kZXhbaWRdID0gMDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVsc1tjXS5kYXRhW2RdLm1vZGVscyA9IFt0aGlzLm1vZGVsc1tjXS5uYW1lXTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVsc1tjXS5kYXRhW2RdLm1vZGVsSW5kZXhlcyA9IFtjXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL2VsaW1pbmF0ZSBhbnkgZHVwbGljYXRlIGFnZW50cyBieSBpZFxyXG4gICAgICAgICAgICB0aGlzLm1vZGVsc1tjXS5kYXRhID0gdGhpcy5tb2RlbHNbY10uZGF0YS5maWx0ZXIoKGQpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChhbHJlYWR5SW4uaW5kZXhPZihkLmlkKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vY29uY2F0IHRoZSByZXN1bHRzXHJcbiAgICAgICAgICAgIHRoaXMuYWdlbnRzID0gdGhpcy5hZ2VudHMuY29uY2F0KHRoaXMubW9kZWxzW2NdLmRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKiBVcGRhdGUgZWFjaCBtb2RlbCBjb21wZW5lbnQgb25lIHRpbWUgc3RlcCBmb3J3YXJkXHJcbiAgICAqIEBwYXJhbSBzdGVwIHRoZSBzdGVwIHNpemVcclxuICAgICovXHJcbiAgICB1cGRhdGUoc3RlcCkge1xyXG4gICAgICAgIHZhciBpbmRleCA9IDA7XHJcbiAgICAgICAgd2hpbGUgKGluZGV4IDwgdGhpcy5ldmVudHNRdWV1ZS5sZW5ndGggJiYgdGhpcy5ldmVudHNRdWV1ZVtpbmRleF0uYXQgPD0gdGhpcy50aW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzUXVldWVbaW5kZXhdLnRyaWdnZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5ldmVudHNRdWV1ZVtpbmRleF0udHJpZ2dlcmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZXZlbnRzUXVldWVbaW5kZXhdLnVudGlsIDw9IHRoaXMudGltZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ldmVudHNRdWV1ZS5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmFjdGl2YXRpb25UeXBlID09PSBcInJhbmRvbVwiKSB7XHJcbiAgICAgICAgICAgIHNodWZmbGUodGhpcy5hZ2VudHMsIHRoaXMucm5nKTtcclxuICAgICAgICAgICAgdGhpcy5hZ2VudHMuZm9yRWFjaCgoYWdlbnQsIGkpID0+IHsgdGhpcy5fYWdlbnRJbmRleFthZ2VudC5pZF0gPSBpOyB9KTsgLy8gcmVhc3NpZ24gYWdlbnRcclxuICAgICAgICAgICAgdGhpcy5hZ2VudHMuZm9yRWFjaCgoYWdlbnQsIGkpID0+IHtcclxuICAgICAgICAgICAgICAgIGFnZW50Lm1vZGVsSW5kZXhlcy5mb3JFYWNoKChtb2RlbEluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlbHNbbW9kZWxJbmRleF0udXBkYXRlKGFnZW50LCBzdGVwKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgYWdlbnQudGltZSA9IGFnZW50LnRpbWUgKyBzdGVwIHx8IDA7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5hY3RpdmF0aW9uVHlwZSA9PT0gXCJwYXJhbGxlbFwiKSB7XHJcbiAgICAgICAgICAgIGxldCB0ZW1wQWdlbnRzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmFnZW50cykpO1xyXG4gICAgICAgICAgICB0ZW1wQWdlbnRzLmZvckVhY2goKGFnZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBhZ2VudC5tb2RlbEluZGV4ZXMuZm9yRWFjaCgobW9kZWxJbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZWxzW21vZGVsSW5kZXhdLnVwZGF0ZShhZ2VudCwgc3RlcCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuYWdlbnRzLmZvckVhY2goKGFnZW50LCBpKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBhZ2VudC5tb2RlbEluZGV4ZXMuZm9yRWFjaCgobW9kZWxJbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZWxzW21vZGVsSW5kZXhdLmFwcGx5KGFnZW50LCB0ZW1wQWdlbnRzW2ldLCBzdGVwKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgYWdlbnQudGltZSA9IGFnZW50LnRpbWUgKyBzdGVwIHx8IDA7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKiBGb3JtYXQgYSB0aW1lIG9mIGRheS4gQ3VycmVudCB0aW1lICUgMS5cclxuICAgICpcclxuICAgICovXHJcbiAgICBmb3JtYXRUaW1lKCkge1xyXG4gICAgICAgIHRoaXMudGltZU9mRGF5ID0gdGhpcy50aW1lICUgMTtcclxuICAgIH1cclxuICAgIC8qKiBHZXRzIGFnZW50IGJ5IGlkLiBBIHV0aWxpdHkgZnVuY3Rpb24gdGhhdFxyXG4gICAgKlxyXG4gICAgKi9cclxuICAgIGdldEFnZW50QnlJZChpZCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFnZW50c1t0aGlzLl9hZ2VudEluZGV4W2lkXV07XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZW52aXJvbm1lbnQuanMubWFwIiwiZXhwb3J0IGNsYXNzIEVwaSB7XHJcbiAgICBzdGF0aWMgcHJldmFsZW5jZShjYXNlcywgdG90YWwpIHtcclxuICAgICAgICB2YXIgcHJldiA9IGNhc2VzIC8gdG90YWw7XHJcbiAgICAgICAgcmV0dXJuIHByZXY7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgcmlza0RpZmZlcmVuY2UodGFibGUpIHtcclxuICAgICAgICB2YXIgcmQgPSB0YWJsZS5hIC8gKHRhYmxlLmEgKyB0YWJsZS5iKSAtIHRhYmxlLmMgLyAodGFibGUuYyArIHRhYmxlLmQpO1xyXG4gICAgICAgIHJldHVybiByZDtcclxuICAgIH1cclxuICAgIHN0YXRpYyByaXNrUmF0aW8odGFibGUpIHtcclxuICAgICAgICB2YXIgcnJhdGlvID0gKHRhYmxlLmEgLyAodGFibGUuYSArIHRhYmxlLmIpKSAvICh0YWJsZS5jIC8gKHRhYmxlLmMgKyB0YWJsZS5kKSk7XHJcbiAgICAgICAgcmV0dXJuIHJyYXRpbztcclxuICAgIH1cclxuICAgIHN0YXRpYyBvZGRzUmF0aW8odGFibGUpIHtcclxuICAgICAgICB2YXIgb3IgPSAodGFibGUuYSAqIHRhYmxlLmQpIC8gKHRhYmxlLmIgKiB0YWJsZS5jKTtcclxuICAgICAgICByZXR1cm4gb3I7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgSVBGMkQocm93VG90YWxzLCBjb2xUb3RhbHMsIGl0ZXJhdGlvbnMsIHNlZWRzKSB7XHJcbiAgICAgICAgdmFyIHJUID0gMCwgY1QgPSAwLCBzZWVkQ2VsbHMgPSBzZWVkcztcclxuICAgICAgICByb3dUb3RhbHMuZm9yRWFjaChmdW5jdGlvbiAociwgaSkge1xyXG4gICAgICAgICAgICByVCArPSByO1xyXG4gICAgICAgICAgICBzZWVkQ2VsbHNbaV0gPSBzZWVkQ2VsbHNbaV0gfHwgW107XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29sVG90YWxzLmZvckVhY2goZnVuY3Rpb24gKGMsIGopIHtcclxuICAgICAgICAgICAgY1QgKz0gYztcclxuICAgICAgICAgICAgc2VlZENlbGxzLmZvckVhY2goZnVuY3Rpb24gKHJvdywgaykge1xyXG4gICAgICAgICAgICAgICAgc2VlZENlbGxzW2tdW2pdID0gc2VlZENlbGxzW2tdW2pdIHx8IE1hdGgucm91bmQocm93VG90YWxzW2tdIC8gcm93VG90YWxzLmxlbmd0aCArIChjb2xUb3RhbHNbal0gLyBjb2xUb3RhbHMubGVuZ3RoKSAvIDIgKiBNYXRoLnJhbmRvbSgpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKHJUID09PSBjVCkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVyID0gMDsgaXRlciA8IGl0ZXJhdGlvbnM7IGl0ZXIrKykge1xyXG4gICAgICAgICAgICAgICAgc2VlZENlbGxzLmZvckVhY2goZnVuY3Rpb24gKHJvdywgaWkpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudFJvd1RvdGFsID0gMDtcclxuICAgICAgICAgICAgICAgICAgICByb3cuZm9yRWFjaChmdW5jdGlvbiAoY2VsbCwgaikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50Um93VG90YWwgKz0gY2VsbDtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICByb3cuZm9yRWFjaChmdW5jdGlvbiAoY2VsbCwgamopIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VlZENlbGxzW2lpXVtqal0gPSBjZWxsIC8gY3VycmVudFJvd1RvdGFsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWVkQ2VsbHNbaWldW2pqXSAqPSByb3dUb3RhbHNbaWldO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBjb2xUb3RhbHMubGVuZ3RoOyBjb2wrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50Q29sVG90YWwgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlZWRDZWxscy5mb3JFYWNoKGZ1bmN0aW9uIChyLCBrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRDb2xUb3RhbCArPSByW2NvbF07XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VlZENlbGxzLmZvckVhY2goZnVuY3Rpb24gKHJvdywga2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VlZENlbGxzW2trXVtjb2xdID0gcm93W2NvbF0gLyBjdXJyZW50Q29sVG90YWw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZWRDZWxsc1tra11bY29sXSAqPSBjb2xUb3RhbHNbY29sXTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc2VlZENlbGxzO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1lcGkuanMubWFwIiwiLyoqIEV2ZW50cyBjbGFzcyBpbmNsdWRlcyBtZXRob2RzIGZvciBvcmdhbml6aW5nIGV2ZW50cy5cclxuKlxyXG4qL1xyXG5leHBvcnQgY2xhc3MgRXZlbnRzIHtcclxuICAgIGNvbnN0cnVjdG9yKGV2ZW50cyA9IFtdKSB7XHJcbiAgICAgICAgdGhpcy5xdWV1ZSA9IFtdO1xyXG4gICAgICAgIHRoaXMuc2NoZWR1bGUoZXZlbnRzKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgKiBzY2hlZHVsZSBhbiBldmVudCB3aXRoIHRoZSBzYW1lIHRyaWdnZXIgbXVsdGlwbGUgdGltZXMuXHJcbiAgICAqIEBwYXJhbSBxZXZlbnQgaXMgdGhlIGV2ZW50IHRvIGJlIHNjaGVkdWxlZC4gVGhlIGF0IHBhcmFtZXRlciBzaG91bGQgY29udGFpbiB0aGUgdGltZSBhdCBmaXJzdCBpbnN0YW5jZS5cclxuICAgICogQHBhcmFtIGV2ZXJ5IGludGVydmFsIGZvciBlYWNoIG9jY3VybmNlXHJcbiAgICAqIEBwYXJhbSBlbmQgdW50aWxcclxuICAgICovXHJcbiAgICBzY2hlZHVsZVJlY3VycmluZyhxZXZlbnQsIGV2ZXJ5LCBlbmQpIHtcclxuICAgICAgICB2YXIgcmVjdXIgPSBbXTtcclxuICAgICAgICB2YXIgZHVyYXRpb24gPSBlbmQgLSBxZXZlbnQuYXQ7XHJcbiAgICAgICAgdmFyIG9jY3VyZW5jZXMgPSBNYXRoLmZsb29yKGR1cmF0aW9uIC8gZXZlcnkpO1xyXG4gICAgICAgIGlmICghcWV2ZW50LnVudGlsKSB7XHJcbiAgICAgICAgICAgIHFldmVudC51bnRpbCA9IHFldmVudC5hdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gb2NjdXJlbmNlczsgaSsrKSB7XHJcbiAgICAgICAgICAgIHJlY3VyLnB1c2goeyBuYW1lOiBxZXZlbnQubmFtZSArIGksIGF0OiBxZXZlbnQuYXQgKyAoaSAqIGV2ZXJ5KSwgdW50aWw6IHFldmVudC51bnRpbCArIChpICogZXZlcnkpLCB0cmlnZ2VyOiBxZXZlbnQudHJpZ2dlciwgdHJpZ2dlcmVkOiBmYWxzZSB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zY2hlZHVsZShyZWN1cik7XHJcbiAgICB9XHJcbiAgICAvKlxyXG4gICAgKiBzY2hlZHVsZSBhIG9uZSB0aW1lIGV2ZW50cy4gdGhpcyBhcnJhbmdlcyB0aGUgZXZlbnQgcXVldWUgaW4gY2hyb25vbG9naWNhbCBvcmRlci5cclxuICAgICogQHBhcmFtIHFldmVudHMgYW4gYXJyYXkgb2YgZXZlbnRzIHRvIGJlIHNjaGVkdWxlcy5cclxuICAgICovXHJcbiAgICBzY2hlZHVsZShxZXZlbnRzKSB7XHJcbiAgICAgICAgcWV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgIGQudW50aWwgPSBkLnVudGlsIHx8IGQuYXQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5xdWV1ZSA9IHRoaXMucXVldWUuY29uY2F0KHFldmVudHMpO1xyXG4gICAgICAgIHRoaXMucXVldWUgPSB0aGlzLm9yZ2FuaXplKHRoaXMucXVldWUsIDAsIHRoaXMucXVldWUubGVuZ3RoKTtcclxuICAgIH1cclxuICAgIHBhcnRpdGlvbihhcnJheSwgbGVmdCwgcmlnaHQpIHtcclxuICAgICAgICB2YXIgY21wID0gYXJyYXlbcmlnaHQgLSAxXS5hdCwgbWluRW5kID0gbGVmdCwgbWF4RW5kO1xyXG4gICAgICAgIGZvciAobWF4RW5kID0gbGVmdDsgbWF4RW5kIDwgcmlnaHQgLSAxOyBtYXhFbmQgKz0gMSkge1xyXG4gICAgICAgICAgICBpZiAoYXJyYXlbbWF4RW5kXS5hdCA8PSBjbXApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3dhcChhcnJheSwgbWF4RW5kLCBtaW5FbmQpO1xyXG4gICAgICAgICAgICAgICAgbWluRW5kICs9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zd2FwKGFycmF5LCBtaW5FbmQsIHJpZ2h0IC0gMSk7XHJcbiAgICAgICAgcmV0dXJuIG1pbkVuZDtcclxuICAgIH1cclxuICAgIHN3YXAoYXJyYXksIGksIGopIHtcclxuICAgICAgICB2YXIgdGVtcCA9IGFycmF5W2ldO1xyXG4gICAgICAgIGFycmF5W2ldID0gYXJyYXlbal07XHJcbiAgICAgICAgYXJyYXlbal0gPSB0ZW1wO1xyXG4gICAgICAgIHJldHVybiBhcnJheTtcclxuICAgIH1cclxuICAgIG9yZ2FuaXplKGV2ZW50cywgbGVmdCwgcmlnaHQpIHtcclxuICAgICAgICBpZiAobGVmdCA8IHJpZ2h0KSB7XHJcbiAgICAgICAgICAgIHZhciBwID0gdGhpcy5wYXJ0aXRpb24oZXZlbnRzLCBsZWZ0LCByaWdodCk7XHJcbiAgICAgICAgICAgIHRoaXMub3JnYW5pemUoZXZlbnRzLCBsZWZ0LCBwKTtcclxuICAgICAgICAgICAgdGhpcy5vcmdhbml6ZShldmVudHMsIHAgKyAxLCByaWdodCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBldmVudHM7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZXZlbnRzLmpzLm1hcCIsImltcG9ydCB7IFFDb21wb25lbnQgfSBmcm9tICcuL1FDb21wb25lbnQnO1xyXG5leHBvcnQgY2xhc3MgU3RhdGVNYWNoaW5lIGV4dGVuZHMgUUNvbXBvbmVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBzdGF0ZXMsIHRyYW5zaXRpb25zLCBjb25kaXRpb25zLCBkYXRhKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSk7XHJcbiAgICAgICAgdGhpcy5zdGF0ZXMgPSBzdGF0ZXM7XHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9ucyA9IHRoaXMuY2hlY2tUcmFuc2l0aW9ucyh0cmFuc2l0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5jb25kaXRpb25zID0gY29uZGl0aW9ucztcclxuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlKGFnZW50LCBzdGVwKSB7XHJcbiAgICAgICAgZm9yICh2YXIgcyBpbiBhZ2VudC5zdGF0ZXMpIHtcclxuICAgICAgICAgICAgbGV0IHN0YXRlID0gYWdlbnQuc3RhdGVzW3NdO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXRlc1tzdGF0ZV0oYWdlbnQsIHN0ZXApO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudHJhbnNpdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy50cmFuc2l0aW9uc1tpXS5mcm9tLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRyYW5zID0gdGhpcy50cmFuc2l0aW9uc1tpXS5mcm9tW2pdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmFucyA9PT0gc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHZhbHVlLCByO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY29uZCA9IHRoaXMuY29uZGl0aW9uc1t0aGlzLnRyYW5zaXRpb25zW2ldLm5hbWVdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIChjb25kLnZhbHVlKSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBjb25kLnZhbHVlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGNvbmQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgciA9IGNvbmQuY2hlY2soYWdlbnRbY29uZC5rZXldLCB2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyID09PSBTdGF0ZU1hY2hpbmUuU1VDQ0VTUykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWdlbnQuc3RhdGVzW3NdID0gdGhpcy50cmFuc2l0aW9uc1tpXS50bztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFnZW50W3RoaXMudHJhbnNpdGlvbnNbaV0udG9dID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFnZW50W3RoaXMudHJhbnNpdGlvbnNbaV0uZnJvbVtqXV0gPSBmYWxzZTsgLy9mb3IgZWFzaWVyIHJlcG9ydGluZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY2hlY2tUcmFuc2l0aW9ucyh0cmFuc2l0aW9ucykge1xyXG4gICAgICAgIGZvciAodmFyIHQgPSAwOyB0IDwgdHJhbnNpdGlvbnMubGVuZ3RoOyB0KyspIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0cmFuc2l0aW9uc1t0XS5mcm9tID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbnNbdF0uZnJvbSA9IFt0cmFuc2l0aW9uc1t0XS5mcm9tXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cmFuc2l0aW9ucztcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1zdGF0ZU1hY2hpbmUuanMubWFwIiwiY2xhc3MgUmFuZG9tIHtcclxuICAgIGNvbnN0cnVjdG9yKHNlZWQpIHtcclxuICAgICAgICB0aGlzLnVuaWZvcm0gPSB0aGlzLnJhbmRSYW5nZTtcclxuICAgICAgICB0aGlzLnNlZWQgPSBzZWVkO1xyXG4gICAgICAgIHRoaXMuY2FsbGVkID0gMDtcclxuICAgIH1cclxuICAgIHJhbmRSYW5nZShtaW4sIG1heCkge1xyXG4gICAgICAgIHJldHVybiAobWF4IC0gbWluKSAqIHRoaXMucmFuZG9tKCkgKyBtaW47XHJcbiAgICB9XHJcbiAgICBtYXQocm93cywgY29scywgZGlzdCA9ICdyYW5kb20nKSB7XHJcbiAgICAgICAgbGV0IHJhbmRzID0gW107XHJcbiAgICAgICAgaWYgKHR5cGVvZiByb3dzID09ICdudW1iZXInICYmIHR5cGVvZiBjb2xzID09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgcm93czsgcisrKSB7XHJcbiAgICAgICAgICAgICAgICByYW5kc1tyXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgYyA9IDA7IGMgPCBjb2xzOyBjKyspIHtcclxuICAgICAgICAgICAgICAgICAgICByYW5kc1tyXVtjXSA9IHRoaXNbZGlzdF0oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmFuZHM7XHJcbiAgICB9XHJcbiAgICBhcnJheShuLCBkaXN0ID0gJ3JhbmRvbScpIHtcclxuICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgbGV0IHJhbmRzID0gW107XHJcbiAgICAgICAgd2hpbGUgKGkgPCBuKSB7XHJcbiAgICAgICAgICAgIHJhbmRzW2ldID0gdGhpc1tkaXN0XSgpO1xyXG4gICAgICAgICAgICBpKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByYW5kcztcclxuICAgIH1cclxuICAgIHBpY2soYXJyYXksIHByb2JhYmlsaXRpZXMpIHtcclxuICAgICAgICBpZiAodHlwZW9mIHByb2JhYmlsaXRpZXMgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhcnJheVtNYXRoLmZsb29yKHRoaXMucmFuZG9tKCkgKiBhcnJheS5sZW5ndGgpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChqU3RhdC5zdW0ocHJvYmFiaWxpdGllcykgPT0gMS4wKSB7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoYXJyYXkubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBpZHggPSBNYXRoLmZsb29yKHRoaXMucmFuZG9tKCkgKiBhcnJheS5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnJhbmRvbSgpIDwgcHJvYmFiaWxpdGllc1tpZHhdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhcnJheVtpZHhdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvL2FycmF5LnNwbGljZShpZHgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vcHJvYmFiaWxpdGllcy5zcGxpY2UoaWR4LCAxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdzdW0gb2YgcHJvYmFiaWxpdGllcyBhcnJheSBkaWQgbm90IGVxdWFsIDEnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgKkJlbG93IGlzIGFkYXB0ZWQgZnJvbSBqU3RhdDpodHRwczovL2dpdGh1Yi5jb20vanN0YXQvanN0YXQvYmxvYi9tYXN0ZXIvc3JjL3NwZWNpYWwuanNcclxuICAgICoqL1xyXG4gICAgcmFuZG4oKSB7XHJcbiAgICAgICAgdmFyIHUsIHYsIHgsIHksIHE7XHJcbiAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICB1ID0gdGhpcy5yYW5kb20oKTtcclxuICAgICAgICAgICAgdiA9IDEuNzE1NiAqICh0aGlzLnJhbmRvbSgpIC0gMC41KTtcclxuICAgICAgICAgICAgeCA9IHUgLSAwLjQ0OTg3MTtcclxuICAgICAgICAgICAgeSA9IE1hdGguYWJzKHYpICsgMC4zODY1OTU7XHJcbiAgICAgICAgICAgIHEgPSB4ICogeCArIHkgKiAoMC4xOTYwMCAqIHkgLSAwLjI1NDcyICogeCk7XHJcbiAgICAgICAgfSB3aGlsZSAocSA+IDAuMjc1OTcgJiYgKHEgPiAwLjI3ODQ2IHx8IHYgKiB2ID4gLTQgKiBNYXRoLmxvZyh1KSAqIHUgKiB1KSk7XHJcbiAgICAgICAgcmV0dXJuIHYgLyB1O1xyXG4gICAgfVxyXG4gICAgcmFuZGcoc2hhcGUpIHtcclxuICAgICAgICB2YXIgb2FscGggPSBzaGFwZTtcclxuICAgICAgICB2YXIgYTEsIGEyLCB1LCB2LCB4O1xyXG4gICAgICAgIGlmICghc2hhcGUpXHJcbiAgICAgICAgICAgIHNoYXBlID0gMTtcclxuICAgICAgICBpZiAoc2hhcGUgPCAxKVxyXG4gICAgICAgICAgICBzaGFwZSArPSAxO1xyXG4gICAgICAgIGExID0gc2hhcGUgLSAxIC8gMztcclxuICAgICAgICBhMiA9IDEgLyBNYXRoLnNxcnQoOSAqIGExKTtcclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIHggPSB0aGlzLnJhbmRuKCk7XHJcbiAgICAgICAgICAgICAgICB2ID0gMSArIGEyICogeDtcclxuICAgICAgICAgICAgfSB3aGlsZSAodiA8PSAwKTtcclxuICAgICAgICAgICAgdiA9IHYgKiB2ICogdjtcclxuICAgICAgICAgICAgdSA9IHRoaXMucmFuZG9tKCk7XHJcbiAgICAgICAgfSB3aGlsZSAodSA+IDEgLSAwLjMzMSAqIE1hdGgucG93KHgsIDQpICYmXHJcbiAgICAgICAgICAgIE1hdGgubG9nKHUpID4gMC41ICogeCAqIHggKyBhMSAqICgxIC0gdiArIE1hdGgubG9nKHYpKSk7XHJcbiAgICAgICAgLy8gYWxwaGEgPiAxXHJcbiAgICAgICAgaWYgKHNoYXBlID09IG9hbHBoKVxyXG4gICAgICAgICAgICByZXR1cm4gYTEgKiB2O1xyXG4gICAgICAgIC8vIGFscGhhIDwgMVxyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgdSA9IHRoaXMucmFuZG9tKCk7XHJcbiAgICAgICAgfSB3aGlsZSAodSA9PT0gMCk7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucG93KHUsIDEgLyBvYWxwaCkgKiBhMSAqIHY7XHJcbiAgICB9XHJcbiAgICBiZXRhKGFscGhhLCBiZXRhKSB7XHJcbiAgICAgICAgdmFyIHUgPSB0aGlzLnJhbmRnKGFscGhhKTtcclxuICAgICAgICByZXR1cm4gdSAvICh1ICsgdGhpcy5yYW5kZyhiZXRhKSk7XHJcbiAgICB9XHJcbiAgICBnYW1tYShzaGFwZSwgc2NhbGUpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yYW5kZyhzaGFwZSkgKiBzY2FsZTtcclxuICAgIH1cclxuICAgIGxvZ05vcm1hbChtdSwgc2lnbWEpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5leHAodGhpcy5yYW5kbigpICogc2lnbWEgKyBtdSk7XHJcbiAgICB9XHJcbiAgICBub3JtYWwobWVhbiA9IDAsIHN0ZCA9IDEpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yYW5kbigpICogc3RkICsgbWVhbjtcclxuICAgIH1cclxuICAgIHBvaXNzb24obCkge1xyXG4gICAgICAgIHZhciBwID0gMSwgayA9IDAsIEwgPSBNYXRoLmV4cCgtbCk7XHJcbiAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICBrKys7XHJcbiAgICAgICAgICAgIHAgKj0gdGhpcy5yYW5kb20oKTtcclxuICAgICAgICB9IHdoaWxlIChwID4gTCk7XHJcbiAgICAgICAgcmV0dXJuIGsgLSAxO1xyXG4gICAgfVxyXG4gICAgdChkb2YpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yYW5kbigpICogTWF0aC5zcXJ0KGRvZiAvICgyICogdGhpcy5yYW5kZyhkb2YgLyAyKSkpO1xyXG4gICAgfVxyXG4gICAgd2VpYnVsbChzY2FsZSwgc2hhcGUpIHtcclxuICAgICAgICByZXR1cm4gc2NhbGUgKiBNYXRoLnBvdygtTWF0aC5sb2codGhpcy5yYW5kb20oKSksIDEgLyBzaGFwZSk7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiogQm9iIEplbmtpbnMnIHNtYWxsIG5vbmNyeXB0b2dyYXBoaWMgUFJORyAocHNldWRvcmFuZG9tIG51bWJlciBnZW5lcmF0b3IpIHBvcnRlZCB0byBKYXZhU2NyaXB0XHJcbiogYWRhcHRlZCBmcm9tOlxyXG4qIGh0dHBzOi8vZ2l0aHViLmNvbS9ncmF1ZS9idXJ0bGVwcm5nXHJcbiogd2hpY2ggaXMgZnJvbSBodHRwOi8vd3d3LmJ1cnRsZWJ1cnRsZS5uZXQvYm9iL3JhbmQvc21hbGxwcm5nLmh0bWxcclxuKi9cclxuZXhwb3J0IGNsYXNzIFJOR0J1cnRsZSBleHRlbmRzIFJhbmRvbSB7XHJcbiAgICBjb25zdHJ1Y3RvcihzZWVkKSB7XHJcbiAgICAgICAgc3VwZXIoc2VlZCk7XHJcbiAgICAgICAgdGhpcy5zZWVkID4+Pj0gMDtcclxuICAgICAgICB0aGlzLmN0eCA9IG5ldyBBcnJheSg0KTtcclxuICAgICAgICB0aGlzLmN0eFswXSA9IDB4ZjFlYTVlZWQ7XHJcbiAgICAgICAgdGhpcy5jdHhbMV0gPSB0aGlzLmN0eFsyXSA9IHRoaXMuY3R4WzNdID0gdGhpcy5zZWVkO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjA7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLnJhbmRvbSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJvdCh4LCBrKSB7XHJcbiAgICAgICAgcmV0dXJuICh4IDw8IGspIHwgKHggPj4gKDMyIC0gaykpO1xyXG4gICAgfVxyXG4gICAgcmFuZG9tKCkge1xyXG4gICAgICAgIHZhciBjdHggPSB0aGlzLmN0eDtcclxuICAgICAgICB2YXIgZSA9IChjdHhbMF0gLSB0aGlzLnJvdChjdHhbMV0sIDI3KSkgPj4+IDA7XHJcbiAgICAgICAgY3R4WzBdID0gKGN0eFsxXSBeIHRoaXMucm90KGN0eFsyXSwgMTcpKSA+Pj4gMDtcclxuICAgICAgICBjdHhbMV0gPSAoY3R4WzJdICsgY3R4WzNdKSA+Pj4gMDtcclxuICAgICAgICBjdHhbMl0gPSAoY3R4WzNdICsgZSkgPj4+IDA7XHJcbiAgICAgICAgY3R4WzNdID0gKGUgKyBjdHhbMF0pID4+PiAwO1xyXG4gICAgICAgIHRoaXMuY2FsbGVkICs9IDE7XHJcbiAgICAgICAgcmV0dXJuIGN0eFszXSAvIDQyOTQ5NjcyOTYuMDtcclxuICAgIH1cclxufVxyXG4vKlxyXG4qIHhvcnNoaWZ0NyosIGJ5IEZyYW7Dp29pcyBQYW5uZXRvbiBhbmQgUGllcnJlIEwnZWN1eWVyOiAzMi1iaXQgeG9yLXNoaWZ0IHJhbmRvbSBudW1iZXIgZ2VuZXJhdG9yXHJcbiogYWRkcyByb2J1c3RuZXNzIGJ5IGFsbG93aW5nIG1vcmUgc2hpZnRzIHRoYW4gTWFyc2FnbGlhJ3Mgb3JpZ2luYWwgdGhyZWUuIEl0IGlzIGEgNy1zaGlmdCBnZW5lcmF0b3Igd2l0aCAyNTYgYml0cywgdGhhdCBwYXNzZXMgQmlnQ3J1c2ggd2l0aCBubyBzeXN0bWF0aWMgZmFpbHVyZXMuXHJcbiogQWRhcHRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9kYXZpZGJhdS94c3JhbmRcclxuKi9cclxuZXhwb3J0IGNsYXNzIFJOR3hvcnNoaWZ0NyBleHRlbmRzIFJhbmRvbSB7XHJcbiAgICBjb25zdHJ1Y3RvcihzZWVkKSB7XHJcbiAgICAgICAgbGV0IGosIHcsIFggPSBbXTtcclxuICAgICAgICBzdXBlcihzZWVkKTtcclxuICAgICAgICAvLyBTZWVkIHN0YXRlIGFycmF5IHVzaW5nIGEgMzItYml0IGludGVnZXIuXHJcbiAgICAgICAgdyA9IFhbMF0gPSB0aGlzLnNlZWQ7XHJcbiAgICAgICAgLy8gRW5mb3JjZSBhbiBhcnJheSBsZW5ndGggb2YgOCwgbm90IGFsbCB6ZXJvZXMuXHJcbiAgICAgICAgd2hpbGUgKFgubGVuZ3RoIDwgOCkge1xyXG4gICAgICAgICAgICBYLnB1c2goMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAoaiA9IDA7IGogPCA4ICYmIFhbal0gPT09IDA7ICsraikge1xyXG4gICAgICAgICAgICBpZiAoaiA9PSA4KSB7XHJcbiAgICAgICAgICAgICAgICB3ID0gWFs3XSA9IC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdyA9IFhbal07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy54ID0gWDtcclxuICAgICAgICB0aGlzLmkgPSAwO1xyXG4gICAgICAgIC8vIERpc2NhcmQgYW4gaW5pdGlhbCAyNTYgdmFsdWVzLlxyXG4gICAgICAgIGZvciAoaiA9IDI1NjsgaiA+IDA7IC0taikge1xyXG4gICAgICAgICAgICB0aGlzLnJhbmRvbSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJhbmRvbSgpIHtcclxuICAgICAgICBsZXQgWCA9IHRoaXMueCwgaSA9IHRoaXMuaSwgdCwgdiwgdywgcmVzO1xyXG4gICAgICAgIHQgPSBYW2ldO1xyXG4gICAgICAgIHQgXj0gKHQgPj4+IDcpO1xyXG4gICAgICAgIHYgPSB0IF4gKHQgPDwgMjQpO1xyXG4gICAgICAgIHQgPSBYWyhpICsgMSkgJiA3XTtcclxuICAgICAgICB2IF49IHQgXiAodCA+Pj4gMTApO1xyXG4gICAgICAgIHQgPSBYWyhpICsgMykgJiA3XTtcclxuICAgICAgICB2IF49IHQgXiAodCA+Pj4gMyk7XHJcbiAgICAgICAgdCA9IFhbKGkgKyA0KSAmIDddO1xyXG4gICAgICAgIHYgXj0gdCBeICh0IDw8IDcpO1xyXG4gICAgICAgIHQgPSBYWyhpICsgNykgJiA3XTtcclxuICAgICAgICB0ID0gdCBeICh0IDw8IDEzKTtcclxuICAgICAgICB2IF49IHQgXiAodCA8PCA5KTtcclxuICAgICAgICBYW2ldID0gdjtcclxuICAgICAgICB0aGlzLmkgPSAoaSArIDEpICYgNztcclxuICAgICAgICByZXMgPSAodiA+Pj4gMCkgLyAoKDEgPDwgMzApICogNCk7XHJcbiAgICAgICAgdGhpcy5jYWxsZWQgKz0gMTtcclxuICAgICAgICByZXR1cm4gcmVzO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJhbmRvbS5qcy5tYXAiLCJpbXBvcnQgeyBnZW5lcmF0ZVVVSUQsIGdlbmVyYXRlUG9wLCBhZGRSZXNvdXJjZXMsIGFzc2lnblBhcmFtLCBNYXRjaCB9IGZyb20gJy4vdXRpbHMnO1xyXG5pbXBvcnQgeyBQYXRjaCwgQ29tcGFydG1lbnRNb2RlbCB9IGZyb20gJy4vY29tcGFydG1lbnQnO1xyXG5pbXBvcnQgeyBFbnZpcm9ubWVudCB9IGZyb20gJy4vZW52aXJvbm1lbnQnO1xyXG5pbXBvcnQgeyBTdGF0ZU1hY2hpbmUgfSBmcm9tICcuL3N0YXRlTWFjaGluZSc7XHJcbmltcG9ydCB7IFJOR0J1cnRsZSwgUk5HeG9yc2hpZnQ3IH0gZnJvbSAnLi9yYW5kb20nO1xyXG4vKipcclxuKkJhdGNoIHJ1biBlbnZpcm9ubWVudHNcclxuKi9cclxuZXhwb3J0IGNsYXNzIEV4cGVyaW1lbnQge1xyXG4gICAgY29uc3RydWN0b3IoZW52aXJvbm1lbnQsIHNldHVwLCB0YXJnZXQpIHtcclxuICAgICAgICB0aGlzLnR5cGUgPSAnc3dlZXAnO1xyXG4gICAgICAgIHRoaXMuZW52aXJvbm1lbnQgPSBlbnZpcm9ubWVudDtcclxuICAgICAgICB0aGlzLnNldHVwID0gc2V0dXA7XHJcbiAgICAgICAgdGhpcy5ybmcgPSBzZXR1cC5leHBlcmltZW50LnJuZyA9PT0gJ3hvcnNoaWZ0NycgPyBuZXcgUk5HeG9yc2hpZnQ3KHNldHVwLmV4cGVyaW1lbnQuc2VlZCkgOiBuZXcgUk5HQnVydGxlKHNldHVwLmV4cGVyaW1lbnQuc2VlZCk7XHJcbiAgICAgICAgdGhpcy5leHBlcmltZW50TG9nID0gW107XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Q0ZHID0ge307XHJcbiAgICAgICAgdGhpcy5nZW5Mb2cgPSBbXTtcclxuICAgIH1cclxuICAgIHN0YXJ0KHJ1bnMsIHN0ZXAsIHVudGlsLCBwcmVwQ0IpIHtcclxuICAgICAgICB2YXIgciA9IDA7XHJcbiAgICAgICAgcnVucyA9IHJ1bnMgKiB0aGlzLnNldHVwLmV4cGVyaW1lbnQuc2l6ZTtcclxuICAgICAgICB3aGlsZSAociA8IHJ1bnMpIHtcclxuICAgICAgICAgICAgdGhpcy5wcmVwKHIsIHRoaXMuc2V0dXAsIHByZXBDQik7XHJcbiAgICAgICAgICAgIHRoaXMuZW52aXJvbm1lbnQudGltZSA9IDA7IC8vXHJcbiAgICAgICAgICAgIHRoaXMuZW52aXJvbm1lbnQucnVuKHN0ZXAsIHVudGlsLCAwKTtcclxuICAgICAgICAgICAgdGhpcy5leHBlcmltZW50TG9nW3JdID0gdGhpcy5yZXBvcnQociwgdGhpcy5zZXR1cCk7XHJcbiAgICAgICAgICAgIHRoaXMuYWZ0ZXIociwgdGhpcy5zZXR1cCk7XHJcbiAgICAgICAgICAgIGlmIChyICUgdGhpcy5zZXR1cC5leHBlcmltZW50LnNpemUgPT09IDAgJiYgciAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbmRHZW4ociwgdGhpcy5zZXR1cCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcisrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHByZXAociwgY2ZnLCBjYikge1xyXG4gICAgICAgIHRoaXMucGFyc2VDRkcoY2ZnKTtcclxuICAgICAgICBpZiAoY2IgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBjYigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVuZEdlbihydW4sIGNmZykge1xyXG4gICAgICAgIGxldCBwcmV2U3RhcnQgPSBNYXRoLm1pbigwLCBydW4gLSBjZmcuZXhwZXJpbWVudC5zaXplKTtcclxuICAgICAgICB0aGlzLmdlbkxvZy5wdXNoKHRoaXMuZ2VuQXZnKHRoaXMuZXhwZXJpbWVudExvZy5zbGljZShwcmV2U3RhcnQsIHJ1biksIGNmZykpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlQXNzaWdubWVudChjZmcsIGNmZy5leHBlcmltZW50LnBhcmFtcyk7XHJcbiAgICB9XHJcbiAgICBwYXJzZUNGRyhjZmcpIHtcclxuICAgICAgICBsZXQgZ3JvdXBzID0ge307XHJcbiAgICAgICAgbGV0IGN1cnJlbnRBZ2VudElkID0gMDtcclxuICAgICAgICBjZmcgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGNmZykpO1xyXG4gICAgICAgIGNmZy5ib3VuZGFyaWVzID0ge307XHJcbiAgICAgICAgdGhpcy5lbnZpcm9ubWVudCA9IG5ldyBFbnZpcm9ubWVudCgpO1xyXG4gICAgICAgIHRoaXMuZW52aXJvbm1lbnQucm5nID0gdGhpcy5ybmc7XHJcbiAgICAgICAgaWYgKCdhZ2VudHMnIGluIGNmZykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBnck5hbWUgaW4gY2ZnLmFnZW50cykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGdyb3VwID0gY2ZnLmFnZW50c1tnck5hbWVdO1xyXG4gICAgICAgICAgICAgICAgZ3JvdXAucGFyYW1zLmdyb3VwTmFtZSA9IGdyTmFtZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW52aXJvbm1lbnQuYm91bmRhcmllc1tnck5hbWVdID0gZ3JvdXAuYm91bmRhcmllcztcclxuICAgICAgICAgICAgICAgIGdyb3Vwc1tnck5hbWVdID0gZ2VuZXJhdGVQb3AoZ3JvdXAuY291bnQsIGdyb3VwLnBhcmFtcywgY2ZnLmVudmlyb25tZW50LnNwYXRpYWxUeXBlLCBncm91cC5ib3VuZGFyaWVzLCBjdXJyZW50QWdlbnRJZCwgdGhpcy5ybmcpO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEFnZW50SWQgPSBncm91cHNbZ3JOYW1lXVtncm91cHNbZ3JOYW1lXS5sZW5ndGggLSAxXS5pZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoJ3BhdGNoZXMnIGluIGNmZykge1xyXG4gICAgICAgICAgICBjZmcucGF0Y2hlcy5mb3JFYWNoKChwYXRjaCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC5ib3VuZGFyaWVzW3BhdGNoLm5hbWVdID0gcGF0Y2guYm91bmRhcmllcztcclxuICAgICAgICAgICAgICAgIHBhdGNoLnBhcmFtcy5ncm91cE5hbWUgPSBwYXRjaC5uYW1lO1xyXG4gICAgICAgICAgICAgICAgZ3JvdXBzW3BhdGNoLm5hbWVdID0gZ2VuZXJhdGVQb3AoMSwgcGF0Y2gucGFyYW1zLCBjZmcuZW52aXJvbm1lbnQuc3BhdGlhbFR5cGUsIHBhdGNoLmJvdW5kYXJpZXMsIGN1cnJlbnRBZ2VudElkLCB0aGlzLnJuZyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoJ3Jlc291cmNlcycgaW4gY2ZnKSB7XHJcbiAgICAgICAgICAgIGxldCByZXNvdXJjZXMgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgcnNjIGluIGNmZy5yZXNvdXJjZXMpIHtcclxuICAgICAgICAgICAgICAgIHJlc291cmNlcyA9IGFkZFJlc291cmNlcyhyZXNvdXJjZXMsIGNmZy5yZXNvdXJjZXNbcnNjXSwgY2ZnLnJlc291cmNlc1tyc2NdLnF1YW50aXR5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmVudmlyb25tZW50LnJlc291cmNlcyA9IHJlc291cmNlcztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCdlbnRpdGllcycgaW4gY2ZnKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGVudGl0eSBpbiBjZmcuZW50aXRpZXMpIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IG1ldGhvZCBpbiBjZmcuZW50aXRpZXNbZW50aXR5XS5tZXRob2RzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2ZnLmVudGl0aWVzW2VudGl0eV0ubWV0aG9kc1ttZXRob2RdID0gUUFjdGlvbnNbbWV0aG9kXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuZW52aXJvbm1lbnQuZW50aXRpZXNbZW50aXR5XSA9IGNmZy5lbnRpdGllc1tlbnRpdHldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNmZy5jb21wb25lbnRzLmZvckVhY2goKGNtcCkgPT4ge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGNtcC50eXBlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdzdGF0ZS1tYWNoaW5lJzpcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBzdGF0ZSBpbiBjbXAuc3RhdGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNtcC5zdGF0ZXNbc3RhdGVdID0gUUFjdGlvbnNbY21wLnN0YXRlc1tzdGF0ZV1dO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBjb25kIGluIGNtcC5jb25kaXRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNtcC5jb25kaXRpb25zW2NvbmRdLmNoZWNrID0gTWF0Y2hbY21wLmNvbmRpdGlvbnNbY29uZF0uY2hlY2tdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBsZXQgc20gPSBuZXcgU3RhdGVNYWNoaW5lKGNtcC5uYW1lLCBjbXAuc3RhdGVzLCBjbXAudHJhbnNpdGlvbnMsIGNtcC5jb25kaXRpb25zLCBncm91cHNbY21wLmFnZW50c11bMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW52aXJvbm1lbnQuYWRkKHNtKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2NvbXBhcnRtZW50YWwnOlxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXRjaGVzID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgY2ZnLnBhdGNoZXMuZm9yRWFjaCgocGF0Y2gpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNtcC5wYXRjaGVzLmluZGV4T2YocGF0Y2gubmFtZSkgIT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGNvbXBhcnRtZW50IGluIGNtcC5jb21wYXJ0bWVudHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbXAuY29tcGFydG1lbnRzW2NvbXBhcnRtZW50XS5vcGVyYXRpb24gPSBRQWN0aW9uc1tjbXAuY29tcGFydG1lbnRzW2NvbXBhcnRtZW50XS5vcGVyYXRpb25dO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHAgPSBuZXcgUGF0Y2gocGF0Y2gubmFtZSwgY21wLmNvbXBhcnRtZW50cywgcGF0Y2gucG9wdWxhdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JvdXBzW3BhdGNoLm5hbWVdWzBdWzBdID0gT2JqZWN0LmFzc2lnbihncm91cHNbcGF0Y2gubmFtZV1bMF1bMF0sIHApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0Y2hlcy5wdXNoKGdyb3Vwc1twYXRjaC5uYW1lXVswXVswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY01vZGVsID0gbmV3IENvbXBhcnRtZW50TW9kZWwoY21wLm5hbWUsIGNtcC5jb21wYXJ0bWVudHMsIHBhdGNoZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW52aXJvbm1lbnQuYWRkKGNNb2RlbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdldmVyeS1zdGVwJzpcclxuICAgICAgICAgICAgICAgICAgICBjbXAuYWN0aW9uID0gUUFjdGlvbnNbY21wLmFjdGlvbl07XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC5hZGQoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogZ2VuZXJhdGVVVUlEKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNtcC5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGU6IGNtcC5hY3Rpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGdyb3Vwc1tjbXAuYWdlbnRzXVswXVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmVwb3J0KHIsIGNmZykge1xyXG4gICAgICAgIGxldCBzdW1zID0ge307XHJcbiAgICAgICAgbGV0IG1lYW5zID0ge307XHJcbiAgICAgICAgbGV0IGZyZXFzID0ge307XHJcbiAgICAgICAgbGV0IG1vZGVsID0ge307XHJcbiAgICAgICAgbGV0IGNvdW50ID0gdGhpcy5lbnZpcm9ubWVudC5hZ2VudHMubGVuZ3RoO1xyXG4gICAgICAgIC8vY2ZnLnJlcG9ydC5zdW0gPSBjZmcucmVwb3J0LnN1bS5jb25jYXQoY2ZnLnJlcG9ydC5tZWFuKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZW52aXJvbm1lbnQuYWdlbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBkID0gdGhpcy5lbnZpcm9ubWVudC5hZ2VudHNbaV07XHJcbiAgICAgICAgICAgIGNmZy5yZXBvcnQuc3Vtcy5mb3JFYWNoKChzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzdW1zW3NdID0gc3Vtc1tzXSA9PSB1bmRlZmluZWQgPyBkW3NdIDogZFtzXSArIHN1bXNbc107XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjZmcucmVwb3J0LmZyZXFzLmZvckVhY2goKGYpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZFtmXSA9PT0gJ251bWJlcicgfHwgdHlwZW9mIGRbZl0gPT09ICdib29sZWFuJyAmJiAhaXNOYU4oZFtmXSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBmcmVxc1tmXSA9IGZyZXFzW2ZdID09IHVuZGVmaW5lZCA/IDEgOiBkW2ZdICsgZnJlcXNbZl07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoJ2NvbXBhcnRtZW50cycgaW4gZCkge1xyXG4gICAgICAgICAgICAgICAgY2ZnLnJlcG9ydC5jb21wYXJ0bWVudHMuZm9yRWFjaCgoY20pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RlbFtjbV0gPSBtb2RlbFtjbV0gPT0gdW5kZWZpbmVkID8gZC5wb3B1bGF0aW9uc1tjbV0gOiBkLnBvcHVsYXRpb25zW2NtXSArIG1vZGVsW2NtXTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIDtcclxuICAgICAgICBjZmcucmVwb3J0Lm1lYW5zLmZvckVhY2goKG0pID0+IHtcclxuICAgICAgICAgICAgbWVhbnNbbV0gPSBzdW1zW21dIC8gY291bnQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcnVuOiByLFxyXG4gICAgICAgICAgICBjZmc6IHRoaXMuY3VycmVudENGRyxcclxuICAgICAgICAgICAgY291bnQ6IGNvdW50LFxyXG4gICAgICAgICAgICBzdW1zOiBzdW1zLFxyXG4gICAgICAgICAgICBtZWFuczogbWVhbnMsXHJcbiAgICAgICAgICAgIGZyZXFzOiBmcmVxcyxcclxuICAgICAgICAgICAgbW9kZWw6IG1vZGVsXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIC8vb24gZWFjaCBydW4sIGNoYW5nZSBvbmUgcGFyYW0sIGhvbGQgb3RoZXJzIGNvbnN0YW50XHJcbiAgICBhZnRlcihydW4sIGNmZykge1xyXG4gICAgfVxyXG4gICAgZ2VuQXZnKGxvZ3MsIGNmZykge1xyXG4gICAgICAgIGxldCBzdW1zID0ge307XHJcbiAgICAgICAgbGV0IGZyZXFzID0ge307XHJcbiAgICAgICAgbGV0IHN1bU1lYW5zID0ge307XHJcbiAgICAgICAgbGV0IG1lYW5zID0ge307XHJcbiAgICAgICAgbG9ncy5mb3JFYWNoKChsb2cpID0+IHtcclxuICAgICAgICAgICAgY2ZnLnJlcG9ydC5zdW1zLmZvckVhY2goKHMpID0+IHtcclxuICAgICAgICAgICAgICAgIHN1bXNbc10gPSBzdW1zW3NdID09IHVuZGVmaW5lZCA/IGxvZy5zdW1zW3NdIDogbG9nLnN1bXNbc10gKyBzdW1zW3NdO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY2ZnLnJlcG9ydC5mcmVxcy5mb3JFYWNoKChmKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBmcmVxc1tmXSA9IGZyZXFzW2ZdID09IHVuZGVmaW5lZCA/IGxvZy5mcmVxc1tmXSA6IGxvZy5mcmVxc1tmXSArIGZyZXFzW2ZdO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY2ZnLnJlcG9ydC5tZWFucy5mb3JFYWNoKChtKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzdW1NZWFuc1ttXSA9IHN1bU1lYW5zW21dID09IHVuZGVmaW5lZCA/IGxvZy5tZWFuc1ttXSA6IGxvZy5tZWFuc1ttXSArIHN1bU1lYW5zW21dO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBjZmcucmVwb3J0Lm1lYW5zLmZvckVhY2goKG0pID0+IHtcclxuICAgICAgICAgICAgbWVhbnNbbV0gPSBzdW1NZWFuc1ttXSAvIGxvZ3MubGVuZ3RoO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNmZy5yZXBvcnQuZnJlcXMuZm9yRWFjaCgoZikgPT4ge1xyXG4gICAgICAgICAgICBtZWFuc1tmXSA9IGZyZXFzW2ZdIC8gbG9ncy5sZW5ndGg7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbWVhbnM6IG1lYW5zLFxyXG4gICAgICAgICAgICBzdW1zOiBzdW1zLFxyXG4gICAgICAgICAgICBmcmVxczogZnJlcXNcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgLypcclxuICAgICogQXNzaWduIG5ldyBlbnZpcm9ubWVudGFsIHBhcmFtZXRlcnMgZnJvbSBleHBlcmltZW50YWwgcGFyYW1ldGVycy5cclxuICAgICovXHJcbiAgICB1cGRhdGVBc3NpZ25tZW50KGNmZywgcGFyYW1ldGVycykge1xyXG4gICAgICAgIGZvciAobGV0IHBtID0gMDsgcG0gPCBwYXJhbWV0ZXJzLmxlbmd0aDsgcG0rKykge1xyXG4gICAgICAgICAgICBsZXQgcGFyYW0gPSBwYXJhbWV0ZXJzW3BtXTtcclxuICAgICAgICAgICAgbGV0IHZhbCA9IGFzc2lnblBhcmFtKHt9LCBwYXJhbSwgcGFyYW0ubmFtZSwgdGhpcy5ybmcpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDRkdbcGFyYW0ubGV2ZWxdID0gdGhpcy5jdXJyZW50Q0ZHW3BhcmFtLmxldmVsXSB8fCB7fTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Q0ZHW3BhcmFtLmxldmVsXVtwYXJhbS5ncm91cF0gPSB0aGlzLmN1cnJlbnRDRkdbcGFyYW0ubGV2ZWxdW3BhcmFtLmdyb3VwXSB8fCB7fTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Q0ZHW3BhcmFtLmxldmVsXVtwYXJhbS5ncm91cF1bcGFyYW0ubmFtZV0gPSB2YWw7XHJcbiAgICAgICAgICAgIHN3aXRjaCAocGFyYW0ubGV2ZWwpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2FnZW50cyc6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmFtLmdyb3VwID09PSAnYm91bmRhcmllcycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2ZnLmFnZW50cy5ib3VuZGFyaWVzW3BhcmFtLm5hbWVdLmFzc2lnbiA9IHZhbDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNmZy5hZ2VudHNbcGFyYW0uZ3JvdXBdLnBhcmFtc1twYXJhbS5uYW1lXS5hc3NpZ24gPSB2YWw7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZW50aXRpZXMnOlxyXG4gICAgICAgICAgICAgICAgICAgIGNmZy5lbnRpdGllc1twYXJhbS5ncm91cF1bcGFyYW0ubmFtZV0gPSB2YWw7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGNmZ1twYXJhbS5sZXZlbF0ucGFyYW1zW3BhcmFtLmdyb3VwXVtwYXJhbS5uYW1lXSA9IHZhbDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1leHBlcmltZW50LmpzLm1hcCIsImV4cG9ydCBjbGFzcyBHZW5lIHtcclxuICAgIGNvbnN0cnVjdG9yKHBhcmFtcywgdHlwZSwgcm5nKSB7XHJcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ25vcm1hbCc6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvZGUgPSBybmcubm9ybWFsKHBhcmFtc1swXSwgcGFyYW1zWzFdKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb2RlID0gcm5nLnJhbmRvbSgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBDaHJvbWFzb21lIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ2VuZXMgPSBbXTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1nZW5ldGljLmpzLm1hcCIsImltcG9ydCB7IEV4cGVyaW1lbnQgfSBmcm9tICcuL2V4cGVyaW1lbnQnO1xyXG5pbXBvcnQgeyBDaHJvbWFzb21lLCBHZW5lIH0gZnJvbSAnLi9nZW5ldGljJztcclxuaW1wb3J0IHsgc2NhbGVJbnYgfSBmcm9tICcuL3V0aWxzJztcclxuZXhwb3J0IGNsYXNzIEV2b2x1dGlvbmFyeSBleHRlbmRzIEV4cGVyaW1lbnQge1xyXG4gICAgY29uc3RydWN0b3IoZW52aXJvbm1lbnQsIHNldHVwLCBkaXNjcmV0ZSA9IGZhbHNlLCBtYXRpbmcgPSB0cnVlKSB7XHJcbiAgICAgICAgc3VwZXIoZW52aXJvbm1lbnQsIHNldHVwKTtcclxuICAgICAgICB0aGlzLm1ldGhvZCA9IFwibm9ybWFsXCI7XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSBzZXR1cC5ldm9sdXRpb24udGFyZ2V0O1xyXG4gICAgICAgIHRoaXMubWV0aG9kID0gc2V0dXAuZXZvbHV0aW9uLm1ldGhvZCB8fCBcIm5vcm1hbFwiO1xyXG4gICAgICAgIHRoaXMucGFyYW1zID0gc2V0dXAuZXhwZXJpbWVudC5wYXJhbXM7XHJcbiAgICAgICAgdGhpcy5zaXplID0gc2V0dXAuZXhwZXJpbWVudC5zaXplO1xyXG4gICAgICAgIHRoaXMubWF0aW5nID0gbWF0aW5nO1xyXG4gICAgICAgIGlmICh0aGlzLnNpemUgPCAyKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWF0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucG9wdWxhdGlvbiA9IFtdO1xyXG4gICAgICAgIHRoaXMubXV0YXRlUmF0ZSA9IDAuNTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc2l6ZTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjaHJvbWEgPSBuZXcgQ2hyb21hc29tZSgpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IHRoaXMucGFyYW1zLmxlbmd0aDsgaysrKSB7XHJcbiAgICAgICAgICAgICAgICAvL25ldyBHZW5lKHRoaXMucmFuZ2VzW2tdLnJhbmdlLCB0aGlzLm1ldGhvZCwgdGhpcy5ybmcpXHJcbiAgICAgICAgICAgICAgICBjaHJvbWEuZ2VuZXMucHVzaCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGlvbi5wdXNoKGNocm9tYSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc3RhcnQocnVucywgc3RlcCwgdW50aWwsIHByZXBDQikge1xyXG4gICAgICAgIGxldCByID0gMDtcclxuICAgICAgICB3aGlsZSAociA8IHJ1bnMpIHtcclxuICAgICAgICAgICAgdGhpcy5wcmVwKHIsIHRoaXMuc2V0dXAsIHByZXBDQik7XHJcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGlvbi5zb3J0KHRoaXMuYXNjU29ydCk7XHJcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGlvbiA9IHRoaXMucG9wdWxhdGlvbi5zbGljZSgwLCB0aGlzLnNpemUpO1xyXG4gICAgICAgICAgICB0aGlzLmV4cGVyaW1lbnRMb2dbdGhpcy5leHBlcmltZW50TG9nLmxlbmd0aCAtIDFdLmJlc3QgPSB0cnVlO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInJ1biBcIiArIHIgKyBcIiBzY29yZSA6ICBtZWFuID0gXCIgKyB0aGlzLnNjb3JlTWVhbih0aGlzLnBvcHVsYXRpb24pICsgJyAgc2QgPSAnICsgdGhpcy5zY29yZVNEKHRoaXMucG9wdWxhdGlvbikpO1xyXG4gICAgICAgICAgICByKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaW1wcm92ZW1lbnQgPSB0aGlzLmltcHJvdmVtZW50U2NvcmUodGhpcy5leHBlcmltZW50TG9nKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5leHBlcmltZW50TG9nO1xyXG4gICAgfVxyXG4gICAgZ2V0UGFyYW1zKGNocm9tYSwgY2ZnKSB7XHJcbiAgICAgICAgbGV0IG91dCA9IHt9O1xyXG4gICAgICAgIGZvciAobGV0IHBtID0gMDsgcG0gPCB0aGlzLnBhcmFtcy5sZW5ndGg7IHBtKyspIHtcclxuICAgICAgICAgICAgbGV0IGNmZ1BtID0gdGhpcy5wYXJhbXNbcG1dO1xyXG4gICAgICAgICAgICBpZiAoY2ZnUG0ubGV2ZWwgPT09ICdhZ2VudHMnIHx8IHR5cGVvZiBjZmdQbS5sZXZlbCA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIG91dFtjZmdQbS5sZXZlbCArIFwiX1wiICsgY2ZnUG0ubmFtZV0gPSBzY2FsZUludihjaHJvbWEuZ2VuZXNbcG1dLmNvZGUsIGNmZ1BtLnJhbmdlWzBdLCBjZmdQbS5yYW5nZVsxXSAtIGNmZ1BtLnJhbmdlWzBdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG91dFtjZmdQbS5sZXZlbCArIFwiX1wiICsgY2ZnUG0ubmFtZV0gPSBzY2FsZUludihjaHJvbWEuZ2VuZXNbcG1dLmNvZGUsIGNmZ1BtLnJhbmdlWzBdLCBjZmdQbS5yYW5nZVsxXSAtIGNmZ1BtLnJhbmdlWzBdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3V0O1xyXG4gICAgfVxyXG4gICAgZHNjU29ydChhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEuc2NvcmUgPiBiLnNjb3JlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoYS5zY29yZSA8IGIuc2NvcmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgYXNjU29ydChhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEuc2NvcmUgPiBiLnNjb3JlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChhLnNjb3JlIDwgYi5zY29yZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgcHJlcChyLCBjZmcsIGNiKSB7XHJcbiAgICAgICAgbGV0IHJlcG9ydDtcclxuICAgICAgICBpZiAodGhpcy5tYXRpbmcpIHtcclxuICAgICAgICAgICAgbGV0IHRvcFBlcmNlbnQgPSBNYXRoLnJvdW5kKDAuMSAqIHRoaXMuc2l6ZSkgKyAyOyAvL3RlbiBwZXJjZW50IG9mIG9yaWdpbmFsIHNpemUgKyAyXHJcbiAgICAgICAgICAgIGxldCBjaGlsZHJlbiA9IHRoaXMubWF0ZSh0b3BQZXJjZW50KTtcclxuICAgICAgICAgICAgdGhpcy5wb3B1bGF0aW9uID0gdGhpcy5wb3B1bGF0aW9uLmNvbmNhdChjaGlsZHJlbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wb3B1bGF0aW9uLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMubXV0YXRlKHRoaXMucG9wdWxhdGlvbltpXSwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5wb3B1bGF0aW9uLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQXNzaWdubWVudChjZmcsIHRoaXMucG9wdWxhdGlvbltqXSwgdGhpcy5wYXJhbXMpO1xyXG4gICAgICAgICAgICBzdXBlci5wcmVwKHIsIGNmZywgY2IpO1xyXG4gICAgICAgICAgICB0aGlzLmVudmlyb25tZW50LnRpbWUgPSAwO1xyXG4gICAgICAgICAgICByZXBvcnQgPSB0aGlzLnJlcG9ydChyLCBjZmcpO1xyXG4gICAgICAgICAgICB0aGlzLnBvcHVsYXRpb25bal0uc2NvcmUgPSB0aGlzLmNvc3QocmVwb3J0LCB0aGlzLnRhcmdldCk7XHJcbiAgICAgICAgICAgIHJlcG9ydC5zY29yZSA9IHRoaXMucG9wdWxhdGlvbltqXS5zY29yZTtcclxuICAgICAgICAgICAgdGhpcy5leHBlcmltZW50TG9nLnB1c2gocmVwb3J0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICB1cGRhdGVBc3NpZ25tZW50KGNmZywgY2hyb21hLCBwYXJhbWV0ZXJzKSB7XHJcbiAgICAgICAgZm9yIChsZXQgcG0gPSAwOyBwbSA8IHBhcmFtZXRlcnMubGVuZ3RoOyBwbSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBwYXJhbSA9IHBhcmFtZXRlcnNbcG1dO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKHBhcmFtLmxldmVsKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdhZ2VudHMnOlxyXG4gICAgICAgICAgICAgICAgICAgIGNmZy5hZ2VudHNbcGFyYW0uZ3JvdXBdLnBhcmFtc1twYXJhbS5uYW1lXS5hc3NpZ24gPSBzY2FsZUludihjaHJvbWEuZ2VuZXNbcG1dLmNvZGUsIHBhcmFtLnJhbmdlWzBdLCBwYXJhbS5yYW5nZVsxXSAtIHBhcmFtLnJhbmdlWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2VudGl0aWVzJzpcclxuICAgICAgICAgICAgICAgICAgICBjZmcuZW50aXRpZXNbcGFyYW0uZ3JvdXBdW3BhcmFtLm5hbWVdID0gc2NhbGVJbnYoY2hyb21hLmdlbmVzW3BtXS5jb2RlLCBwYXJhbS5yYW5nZVswXSwgcGFyYW0ucmFuZ2VbMV0gLSBwYXJhbS5yYW5nZVswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGNmZ1twYXJhbS5sZXZlbF0ucGFyYW1zW3BhcmFtLmdyb3VwXVtwYXJhbS5uYW1lXSA9IHNjYWxlSW52KGNocm9tYS5nZW5lc1twbV0uY29kZSwgcGFyYW0ucmFuZ2VbMF0sIHBhcmFtLnJhbmdlWzFdIC0gcGFyYW0ucmFuZ2VbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29zdChwcmVkaWN0LCB0YXJnZXQpIHtcclxuICAgICAgICBsZXQgZGV2ID0gMDtcclxuICAgICAgICBsZXQgZGltZW5zaW9ucyA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHRhcmdldC5tZWFucykge1xyXG4gICAgICAgICAgICBkZXYgKz0gTWF0aC5hYnModGFyZ2V0Lm1lYW5zW2tleV0gLSBwcmVkaWN0Lm1lYW5zW2tleV0pO1xyXG4gICAgICAgICAgICBkaW1lbnNpb25zKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiB0YXJnZXQuZnJlcXMpIHtcclxuICAgICAgICAgICAgZGV2ICs9IE1hdGguYWJzKHRhcmdldC5mcmVxc1trZXldIC0gcHJlZGljdC5mcmVxc1trZXldKTtcclxuICAgICAgICAgICAgZGltZW5zaW9ucysrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gdGFyZ2V0Lm1vZGVsKSB7XHJcbiAgICAgICAgICAgIGRldiArPSBNYXRoLmFicyh0YXJnZXQubW9kZWxba2V5XSAtIHByZWRpY3QubW9kZWxba2V5XSk7XHJcbiAgICAgICAgICAgIGRpbWVuc2lvbnMrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRldiAvIGRpbWVuc2lvbnM7XHJcbiAgICB9XHJcbiAgICByZXBvcnQociwgY2ZnKSB7XHJcbiAgICAgICAgbGV0IHJlcG9ydCA9IHN1cGVyLnJlcG9ydChyLCBjZmcpO1xyXG4gICAgICAgIHJldHVybiByZXBvcnQ7XHJcbiAgICB9XHJcbiAgICBpbXByb3ZlbWVudFNjb3JlKGxvZywgYXZnR2VuZXJhdGlvbiA9IHRydWUpIHtcclxuICAgICAgICBsZXQgTiA9IGxvZy5sZW5ndGg7XHJcbiAgICAgICAgbGV0IHN1bSA9IDA7XHJcbiAgICAgICAgbGV0IHJhbmtlZDtcclxuICAgICAgICBpZiAoYXZnR2VuZXJhdGlvbikge1xyXG4gICAgICAgICAgICByYW5rZWQgPSB0aGlzLmdlbkF2Zyhsb2csIHRoaXMuc2V0dXApO1xyXG4gICAgICAgICAgICBOID0gcmFua2VkLmxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJhbmtlZCA9IGxvZy5tYXAoKGQsIGkpID0+IHsgZC5vcmRlciA9IGk7IHJldHVybiBkOyB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmFua2VkLnNvcnQodGhpcy5kc2NTb3J0KTtcclxuICAgICAgICByYW5rZWQubWFwKChkLCBpKSA9PiB7IGQucmFuayA9IGk7IHJldHVybiBkOyB9KTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJhbmtlZC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBzdW0gKz0gTWF0aC5hYnMocmFua2VkW2ldLm9yZGVyIC8gTiAtIHJhbmtlZFtpXS5yYW5rIC8gTik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAxIC0gMiAqIHN1bSAvIE47XHJcbiAgICB9XHJcbiAgICBnZW5BdmcobG9nLCBjZmcpIHtcclxuICAgICAgICBsZXQgc3VtcyA9IHt9O1xyXG4gICAgICAgIGxldCBwb3BzID0ge307XHJcbiAgICAgICAgbGV0IGF2Z3MgPSBbXTtcclxuICAgICAgICBsb2cuZm9yRWFjaCgoZCkgPT4ge1xyXG4gICAgICAgICAgICBzdW1zW2QucnVuXSA9IHN1bXNbZC5ydW5dICsgZC5zY29yZSB8fCBkLnNjb3JlO1xyXG4gICAgICAgICAgICBwb3BzW2QucnVuXSA9IHBvcHNbZC5ydW5dICsgMSB8fCAxO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGZvciAobGV0IHJ1biBpbiBzdW1zKSB7XHJcbiAgICAgICAgICAgIGF2Z3NbcnVuXSA9IHsgb3JkZXI6IHJ1biwgc2NvcmU6IHN1bXNbcnVuXSAvIHBvcHNbcnVuXSB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYXZncztcclxuICAgIH1cclxuICAgIGNlbnRyb2lkKHBvcCkge1xyXG4gICAgICAgIGxldCBjZW50cm9pZCA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wYXJhbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY2VudHJvaWRbaV0gPSBqU3RhdC5tZWFuKHRoaXMucG9wdWxhdGlvbi5tYXAoKGQpID0+IHsgcmV0dXJuIGQuZ2VuZXNbaV0uY29kZTsgfSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2VudHJvaWQ7XHJcbiAgICB9XHJcbiAgICB2ZWN0b3JTY29yZXMocG9wKSB7XHJcbiAgICAgICAgbGV0IHZlYyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcG9wLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZlY1tpXSA9IHBvcFtpXS5zY29yZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZlYztcclxuICAgIH1cclxuICAgIHNjb3JlTWVhbihwb3ApIHtcclxuICAgICAgICBsZXQgdmFscyA9IHRoaXMudmVjdG9yU2NvcmVzKHBvcCk7XHJcbiAgICAgICAgcmV0dXJuIGpTdGF0Lm1lYW4odmFscyk7XHJcbiAgICB9XHJcbiAgICBzY29yZVNEKHBvcCkge1xyXG4gICAgICAgIGxldCB2YWxzID0gdGhpcy52ZWN0b3JTY29yZXMocG9wKTtcclxuICAgICAgICByZXR1cm4galN0YXQuc3RkZXYodmFscyk7XHJcbiAgICB9XHJcbiAgICB3ZWlnaHRlZFN1bSgpIHtcclxuICAgICAgICAvL211c3QgYmUgc29ydGVkIGFscmVhZHlcclxuICAgICAgICBsZXQgbWVhbiA9IHRoaXMuc2NvcmVNZWFuKHRoaXMucG9wdWxhdGlvbik7XHJcbiAgICAgICAgbGV0IHNkID0gdGhpcy5zY29yZVNEKHRoaXMucG9wdWxhdGlvbik7XHJcbiAgICAgICAgbGV0IHdlaWdodHMgPSB0aGlzLnBvcHVsYXRpb24ubWFwKChwLCBpZHgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIChwLnNjb3JlIC0gbWVhbikgLyBzZDtcclxuICAgICAgICB9KTtcclxuICAgICAgICBsZXQgc3VtID0gdGhpcy5wYXJhbXMubWFwKChwYXJhbSwgaWR4KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBvcHVsYXRpb24ucmVkdWNlKChhY2MsIGN1cnJlbnQsIGN1cnJlbnRJZHgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50LmdlbmVzW2lkeF0uY29kZSAqIHdlaWdodHNbY3VycmVudElkeF0gKyBhY2M7XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBzdW07XHJcbiAgICB9XHJcbiAgICBtYXRlKHBhcmVudHMpIHtcclxuICAgICAgICBsZXQgbnVtQ2hpbGRyZW4gPSBNYXRoLm1pbigyLCBNYXRoLm1heCgxMCwgdGhpcy5wYXJhbXMubGVuZ3RoKSk7XHJcbiAgICAgICAgbGV0IGNoaWxkcmVuID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1DaGlsZHJlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjaGlsZCA9IG5ldyBDaHJvbWFzb21lKCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5wYXJhbXMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBnZW5lID0gbmV3IEdlbmUoW3RoaXMucGFyYW1zW2pdLnJhbmdlWzBdLCB0aGlzLnBhcmFtc1tqXS5yYW5nZVsxXV0sIHRoaXMubWV0aG9kLCB0aGlzLnJuZyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmFuZCA9IE1hdGguZmxvb3IodGhpcy5ybmcucmFuZG9tKCkgKiBwYXJlbnRzKTtcclxuICAgICAgICAgICAgICAgIGxldCBleHByZXNzZWQgPSB0aGlzLnBvcHVsYXRpb25bcmFuZF0uZ2VuZXMuc2xpY2UoaiwgaiArIDEpO1xyXG4gICAgICAgICAgICAgICAgZ2VuZS5jb2RlID0gZXhwcmVzc2VkWzBdLmNvZGU7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5nZW5lcy5wdXNoKGdlbmUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNoaWxkcmVuLnB1c2goY2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2hpbGRyZW47XHJcbiAgICB9XHJcbiAgICBtdXRhdGUoY2hyb21hLCBjaGFuY2UpIHtcclxuICAgICAgICBsZXQgYmVzdCA9IHRoaXMucG9wdWxhdGlvblswXS5nZW5lcztcclxuICAgICAgICBsZXQgY2VudHJvaWQgPSB0aGlzLmNlbnRyb2lkKFt0aGlzLnBvcHVsYXRpb25bMF0sIHRoaXMucG9wdWxhdGlvblsxXV0pO1xyXG4gICAgICAgIGlmICh0aGlzLnJuZy5yYW5kb20oKSA+IGNoYW5jZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgY2hyb21hLmdlbmVzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGxldCBnZW5lID0gY2hyb21hLmdlbmVzW2pdO1xyXG4gICAgICAgICAgICBsZXQgZGlmZiA9IGJlc3Rbal0uY29kZSAtIGdlbmUuY29kZTtcclxuICAgICAgICAgICAgaWYgKGRpZmYgPT0gMCB8fCB0aGlzLm1ldGhvZCA9PT0gJ25vcm1hbCcpIHtcclxuICAgICAgICAgICAgICAgIGdlbmUuY29kZSArPSB0aGlzLnJuZy5ub3JtYWwoMCwgMSkgKiB0aGlzLm11dGF0ZVJhdGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBnZW5lLmNvZGUgKz0gZGlmZiAqIHRoaXMubXV0YXRlUmF0ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBnZW5lLmNvZGUgPSBNYXRoLm1pbihNYXRoLm1heCgwLCBnZW5lLmNvZGUpLCAxKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZXZvbHV0aW9uYXJ5LmpzLm1hcCIsImltcG9ydCB7IEV4cGVyaW1lbnQgfSBmcm9tICcuL2V4cGVyaW1lbnQnO1xyXG5pbXBvcnQgeyBhc3NpZ25QYXJhbSB9IGZyb20gJy4vdXRpbHMnO1xyXG5leHBvcnQgY2xhc3MgRXZvbHZlIGV4dGVuZHMgRXhwZXJpbWVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbnZpcm9ubWVudCwgc2V0dXApIHtcclxuICAgICAgICBzdXBlcihlbnZpcm9ubWVudCwgc2V0dXApO1xyXG4gICAgICAgIHRoaXMudHlwZSA9ICdldm9sdmUnO1xyXG4gICAgICAgIHRoaXMucG9wdWxhdGlvbiA9IFtdO1xyXG4gICAgICAgIHRoaXMubXV0YXRlUmF0ZSA9IDAuNTtcclxuICAgICAgICB0aGlzLnRhcmdldCA9IHNldHVwLmV2b2x1dGlvbi50YXJnZXQ7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNldHVwLmV4cGVyaW1lbnQuc2l6ZTsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGlvbltpXSA9IHsgc2NvcmU6IDFlNiwgcGFyYW1zOiBbXSB9O1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHRoaXMuc2V0dXAuZXhwZXJpbWVudC5wYXJhbXMubGVuZ3RoOyBwKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBzZXRQYXJhbSA9IHRoaXMuc2V0dXAuZXhwZXJpbWVudC5wYXJhbXNbcF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRpb25baV0ucGFyYW1zLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldmVsOiBzZXRQYXJhbS5sZXZlbCxcclxuICAgICAgICAgICAgICAgICAgICBncm91cDogc2V0UGFyYW0uZ3JvdXAsXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogc2V0UGFyYW0ubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBhc3NpZ246IGFzc2lnblBhcmFtKHt9LCBzZXRQYXJhbSwgc2V0UGFyYW0ubmFtZSwgdGhpcy5ybmcpXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHN0YXJ0KHJ1bnMsIHN0ZXAsIHVudGlsLCBwcmVwQ0IpIHtcclxuICAgICAgICB2YXIgciA9IDA7XHJcbiAgICAgICAgcnVucyA9IHJ1bnMgKiB0aGlzLnNldHVwLmV4cGVyaW1lbnQuc2l6ZTtcclxuICAgICAgICB3aGlsZSAociA8IHJ1bnMpIHtcclxuICAgICAgICAgICAgdGhpcy5wcmVwKHIsIHRoaXMuc2V0dXAsIHByZXBDQik7XHJcbiAgICAgICAgICAgIHRoaXMuZW52aXJvbm1lbnQudGltZSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuZW52aXJvbm1lbnQucnVuKHN0ZXAsIHVudGlsLCAwKTtcclxuICAgICAgICAgICAgdGhpcy5leHBlcmltZW50TG9nW3JdID0gdGhpcy5yZXBvcnQociwgdGhpcy5zZXR1cCk7XHJcbiAgICAgICAgICAgIHRoaXMuYWZ0ZXIociwgdGhpcy5zZXR1cCk7XHJcbiAgICAgICAgICAgIGlmIChyICUgdGhpcy5zZXR1cC5leHBlcmltZW50LnNpemUgPT09IDAgJiYgciAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbmRHZW4ociwgdGhpcy5zZXR1cCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcisrO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmltcHJvdmVtZW50ID0gdGhpcy5vdmVyYWxsKHRoaXMuZ2VuTG9nKTtcclxuICAgIH1cclxuICAgIG92ZXJhbGwoZ2VuTG9nKSB7XHJcbiAgICAgICAgbGV0IE4gPSBnZW5Mb2cubGVuZ3RoO1xyXG4gICAgICAgIGxldCBzdW0gPSAwO1xyXG4gICAgICAgIGxldCByYW5rZWQgPSBnZW5Mb2c7XHJcbiAgICAgICAgcmFua2VkLnNvcnQodGhpcy5kc2NTb3J0KTtcclxuICAgICAgICByYW5rZWQubWFwKChkLCBpKSA9PiB7IGQucmFuayA9IGk7IHJldHVybiBkOyB9KTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJhbmtlZC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBzdW0gKz0gTWF0aC5hYnMocmFua2VkW2ldLm9yZGVyIC8gTiAtIHJhbmtlZFtpXS5yYW5rIC8gTik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAxIC0gMiAqIHN1bSAvIE47XHJcbiAgICB9XHJcbiAgICBwcmVwKHJ1biwgc2V0dXAsIHByZXBDQikge1xyXG4gICAgICAgIHNldHVwLmV4cGVyaW1lbnQucGFyYW1zID0gdGhpcy5wb3B1bGF0aW9uW3J1biAlIHNldHVwLmV4cGVyaW1lbnQuc2l6ZV0ucGFyYW1zO1xyXG4gICAgICAgIHN1cGVyLnVwZGF0ZUFzc2lnbm1lbnQoc2V0dXAsIHNldHVwLmV4cGVyaW1lbnQucGFyYW1zKTtcclxuICAgICAgICBzdXBlci5wcmVwKHJ1biwgc2V0dXAsIHByZXBDQik7XHJcbiAgICB9XHJcbiAgICBlbmRHZW4ocnVuLCBjZmcpIHtcclxuICAgICAgICBsZXQgcHJldlN0YXJ0ID0gTWF0aC5taW4oMCwgcnVuIC0gY2ZnLmV4cGVyaW1lbnQuc2l6ZSk7XHJcbiAgICAgICAgdGhpcy5wb3B1bGF0aW9uLnNvcnQodGhpcy5hc2NTb3J0KTtcclxuICAgICAgICB0aGlzLnBvcHVsYXRpb24gPSB0aGlzLnBvcHVsYXRpb24uc2xpY2UoMCwgY2ZnLmV4cGVyaW1lbnQuc2l6ZSk7XHJcbiAgICAgICAgdGhpcy5tdXRhdGUodGhpcy5wb3B1bGF0aW9uLCAxKTtcclxuICAgICAgICB0aGlzLmdlbkxvZy5wdXNoKHRoaXMuZ2VuQXZnKHRoaXMuZXhwZXJpbWVudExvZy5zbGljZShwcmV2U3RhcnQsIHJ1biksIGNmZykpO1xyXG4gICAgICAgIHRoaXMuZ2VuTG9nW3RoaXMuZ2VuTG9nLmxlbmd0aCAtIDFdLm9yZGVyID0gdGhpcy5nZW5Mb2cubGVuZ3RoIC0gMTtcclxuICAgICAgICB0aGlzLmdlbkxvZ1t0aGlzLmdlbkxvZy5sZW5ndGggLSAxXS5zY29yZSA9IHRoaXMuc2NvcmVNZWFuKHRoaXMucG9wdWxhdGlvbik7XHJcbiAgICAgICAgdGhpcy5nZW5Mb2dbdGhpcy5nZW5Mb2cubGVuZ3RoIC0gMV0uc2NvcmVTRCA9IHRoaXMuc2NvcmVTRCh0aGlzLnBvcHVsYXRpb24pO1xyXG4gICAgICAgIHRoaXMucG9wdWxhdGlvbiA9IHRoaXMucG9wdWxhdGlvbi5jb25jYXQodGhpcy5tYXRlKE1hdGgubWluKDQsIHRoaXMucG9wdWxhdGlvbi5sZW5ndGgpKSk7XHJcbiAgICB9XHJcbiAgICB2ZWN0b3JTY29yZXMocG9wKSB7XHJcbiAgICAgICAgbGV0IHZlYyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcG9wLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZlY1tpXSA9IHBvcFtpXS5zY29yZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZlYztcclxuICAgIH1cclxuICAgIHNjb3JlTWVhbihwb3ApIHtcclxuICAgICAgICBsZXQgdmFscyA9IHRoaXMudmVjdG9yU2NvcmVzKHBvcCk7XHJcbiAgICAgICAgcmV0dXJuIGpTdGF0Lm1lYW4odmFscyk7XHJcbiAgICB9XHJcbiAgICBzY29yZVNEKHBvcCkge1xyXG4gICAgICAgIGxldCB2YWxzID0gdGhpcy52ZWN0b3JTY29yZXMocG9wKTtcclxuICAgICAgICByZXR1cm4galN0YXQuc3RkZXYodmFscyk7XHJcbiAgICB9XHJcbiAgICBhZnRlcihydW4sIGNmZykge1xyXG4gICAgICAgIHRoaXMucG9wdWxhdGlvbltydW4gJSBjZmcuZXhwZXJpbWVudC5zaXplXS5zY29yZSA9IHRoaXMuY29zdCh0aGlzLmV4cGVyaW1lbnRMb2dbcnVuXSwgdGhpcy50YXJnZXQpO1xyXG4gICAgICAgIHRoaXMuZXhwZXJpbWVudExvZ1tydW5dLnNjb3JlID0gdGhpcy5wb3B1bGF0aW9uW3J1biAlIGNmZy5leHBlcmltZW50LnNpemVdLnNjb3JlO1xyXG4gICAgfVxyXG4gICAgY29zdChwcmVkaWN0LCB0YXJnZXQpIHtcclxuICAgICAgICBsZXQgZGV2ID0gMDtcclxuICAgICAgICBsZXQgZGltZW5zaW9ucyA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHRhcmdldC5tZWFucykge1xyXG4gICAgICAgICAgICBkZXYgKz0gTWF0aC5hYnModGFyZ2V0Lm1lYW5zW2tleV0gLSBwcmVkaWN0Lm1lYW5zW2tleV0pO1xyXG4gICAgICAgICAgICBkaW1lbnNpb25zKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiB0YXJnZXQuZnJlcXMpIHtcclxuICAgICAgICAgICAgZGV2ICs9IE1hdGguYWJzKHRhcmdldC5mcmVxc1trZXldIC0gcHJlZGljdC5mcmVxc1trZXldKTtcclxuICAgICAgICAgICAgZGltZW5zaW9ucysrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gdGFyZ2V0Lm1vZGVsKSB7XHJcbiAgICAgICAgICAgIGRldiArPSBNYXRoLmFicyh0YXJnZXQubW9kZWxba2V5XSAtIHByZWRpY3QubW9kZWxba2V5XSk7XHJcbiAgICAgICAgICAgIGRpbWVuc2lvbnMrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRldiAvIGRpbWVuc2lvbnM7XHJcbiAgICB9XHJcbiAgICBtdXRhdGUocG9wdWxhdGlvbiwgY2hhbmNlKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb3B1bGF0aW9uLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJuZy5yYW5kb20oKSA+IGNoYW5jZSkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IGJlc3QgPSBwb3B1bGF0aW9uWzBdLnBhcmFtcztcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBwb3B1bGF0aW9uW2ldLnBhcmFtcztcclxuICAgICAgICAgICAgZm9yIChsZXQgcCA9IDA7IHAgPCBjdXJyZW50Lmxlbmd0aDsgcCsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGlmZiA9IGJlc3RbcF0uYXNzaWduIC0gY3VycmVudFtwXS5hc3NpZ247XHJcbiAgICAgICAgICAgICAgICBpZiAoZGlmZiA8IDFlLTE1KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFtwXS5hc3NpZ24gKz0gdGhpcy5ybmcubm9ybWFsKDAsIDEpICogdGhpcy5tdXRhdGVSYXRlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFtwXS5hc3NpZ24gKz0gZGlmZiAqIHRoaXMubXV0YXRlUmF0ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIG1hdGUocGFyZW50cykge1xyXG4gICAgICAgIGxldCBudW1DaGlsZHJlbiA9IE1hdGgubWluKDIsIE1hdGgubWF4KDEwLCB0aGlzLnBvcHVsYXRpb24ubGVuZ3RoKSk7XHJcbiAgICAgICAgbGV0IG51bVBhcmFtcyA9IHRoaXMucG9wdWxhdGlvblswXS5wYXJhbXMubGVuZ3RoO1xyXG4gICAgICAgIGxldCBjaGlsZHJlbiA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtQ2hpbGRyZW47IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgY2hpbGQgPSB7IHBhcmFtczogW10sIHNjb3JlOiAwIH07XHJcbiAgICAgICAgICAgIGxldCBwMSA9IE1hdGguZmxvb3IodGhpcy5ybmcucmFuZG9tKCkgKiBwYXJlbnRzKTtcclxuICAgICAgICAgICAgbGV0IHAyID0gTWF0aC5mbG9vcih0aGlzLnJuZy5yYW5kb20oKSAqIHBhcmVudHMpO1xyXG4gICAgICAgICAgICBsZXQgc3BsaXQgPSBNYXRoLmZsb29yKHRoaXMucm5nLnJhbmRvbSgpICogbnVtUGFyYW1zKTtcclxuICAgICAgICAgICAgY2hpbGQucGFyYW1zID0gW10uY29uY2F0KHRoaXMucG9wdWxhdGlvbltwMV0ucGFyYW1zLnNsaWNlKDAsIHNwbGl0KSwgdGhpcy5wb3B1bGF0aW9uW3AyXS5wYXJhbXMuc2xpY2Uoc3BsaXQsIG51bVBhcmFtcykpO1xyXG4gICAgICAgICAgICBjaGlsZHJlbi5wdXNoKGNoaWxkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS5sb2coY2hpbGRyZW4pO1xyXG4gICAgICAgIHJldHVybiBjaGlsZHJlbjtcclxuICAgIH1cclxuICAgIGRzY1NvcnQoYSwgYikge1xyXG4gICAgICAgIGlmIChhLnNjb3JlID4gYi5zY29yZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGEuc2NvcmUgPCBiLnNjb3JlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICAgIGFzY1NvcnQoYSwgYikge1xyXG4gICAgICAgIGlmIChhLnNjb3JlID4gYi5zY29yZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoYS5zY29yZSA8IGIuc2NvcmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1ldm9sdmUuanMubWFwIiwiaW1wb3J0IHsgUUNvbXBvbmVudCB9IGZyb20gJy4vUUNvbXBvbmVudCc7XHJcbmltcG9ydCB7IFNVQ0NFU1MgfSBmcm9tICcuL3V0aWxzJztcclxuZXhwb3J0IGNsYXNzIEh5YnJpZEF1dG9tYXRhIGV4dGVuZHMgUUNvbXBvbmVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBkYXRhLCBmbG93U2V0LCBmbG93TWFwLCBqdW1wU2V0LCBqdW1wTWFwKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSk7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgICAgICB0aGlzLmZsb3dTZXQgPSBmbG93U2V0O1xyXG4gICAgICAgIHRoaXMuZmxvd01hcCA9IGZsb3dNYXA7XHJcbiAgICAgICAgdGhpcy5qdW1wU2V0ID0ganVtcFNldDtcclxuICAgICAgICB0aGlzLmp1bXBNYXAgPSBqdW1wTWFwO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlKGFnZW50LCBzdGVwKSB7XHJcbiAgICAgICAgbGV0IHRlbXAgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGFnZW50KSk7XHJcbiAgICAgICAgZm9yICh2YXIgbW9kZSBpbiB0aGlzLmp1bXBTZXQpIHtcclxuICAgICAgICAgICAgbGV0IGVkZ2UgPSB0aGlzLmp1bXBTZXRbbW9kZV07XHJcbiAgICAgICAgICAgIGxldCBlZGdlU3RhdGUgPSBlZGdlLmNoZWNrKGFnZW50W2VkZ2Uua2V5XSwgZWRnZS52YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmIChlZGdlU3RhdGUgPT09IFNVQ0NFU1MgJiYgbW9kZSAhPSBhZ2VudC5jdXJyZW50TW9kZSkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBhZ2VudFtlZGdlLmtleV0gPSB0aGlzLmp1bXBNYXBbZWRnZS5rZXldW2FnZW50LmN1cnJlbnRNb2RlXVttb2RlXShhZ2VudFtlZGdlLmtleV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGFnZW50LmN1cnJlbnRNb2RlID0gbW9kZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhdGNoIChFcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL25vIHRyYW5zaXRpb24gdGhpcyBkaXJlY3Rpb247XHJcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhFcnIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLmZsb3dNYXApIHtcclxuICAgICAgICAgICAgICAgIC8vc2Vjb25kIG9yZGVyIGludGVncmF0aW9uXHJcbiAgICAgICAgICAgICAgICBsZXQgdGVtcEQgPSB0aGlzLmZsb3dNYXBba2V5XVthZ2VudC5jdXJyZW50TW9kZV0oYWdlbnRba2V5XSk7XHJcbiAgICAgICAgICAgICAgICB0ZW1wW2tleV0gPSBhZ2VudFtrZXldICsgdGVtcEQ7XHJcbiAgICAgICAgICAgICAgICBhZ2VudFtrZXldICs9IDAuNSAqICh0ZW1wRCArIHRoaXMuZmxvd01hcFtrZXldW2FnZW50LmN1cnJlbnRNb2RlXSh0ZW1wW2tleV0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1oYS5qcy5tYXAiLCJpbXBvcnQgeyBRQ29tcG9uZW50IH0gZnJvbSAnLi9RQ29tcG9uZW50JztcclxuaW1wb3J0IHsgZ2VuZXJhdGVVVUlEIH0gZnJvbSAnLi91dGlscyc7XHJcbi8vSGllcmFyY2hhbCBUYXNrIE5ldHdvcmtcclxuZXhwb3J0IGNsYXNzIEhUTlBsYW5uZXIgZXh0ZW5kcyBRQ29tcG9uZW50IHtcclxuICAgIHN0YXRpYyB0aWNrKG5vZGUsIHRhc2ssIGFnZW50KSB7XHJcbiAgICAgICAgaWYgKGFnZW50LnJ1bm5pbmdMaXN0KSB7XHJcbiAgICAgICAgICAgIGFnZW50LnJ1bm5pbmdMaXN0LnB1c2gobm9kZS5uYW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGFnZW50LnJ1bm5pbmdMaXN0ID0gW25vZGUubmFtZV07XHJcbiAgICAgICAgICAgIGFnZW50LnN1Y2Nlc3NMaXN0ID0gW107XHJcbiAgICAgICAgICAgIGFnZW50LmJhcnJpZXJMaXN0ID0gW107XHJcbiAgICAgICAgICAgIGFnZW50LmJsYWNrYm9hcmQgPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHN0YXRlID0gbm9kZS52aXNpdChhZ2VudCwgdGFzayk7XHJcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG4gICAgY29uc3RydWN0b3IobmFtZSwgcm9vdCwgdGFzaywgZGF0YSkge1xyXG4gICAgICAgIHN1cGVyKG5hbWUpO1xyXG4gICAgICAgIHRoaXMucm9vdCA9IHJvb3Q7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgICAgICB0aGlzLnN1bW1hcnkgPSBbXTtcclxuICAgICAgICB0aGlzLnJlc3VsdHMgPSBbXTtcclxuICAgICAgICB0aGlzLnRhc2sgPSB0YXNrO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlKGFnZW50LCBzdGVwKSB7XHJcbiAgICAgICAgLy9pdGVyYXRlIGFuIGFnZW50KGRhdGEpIHRocm91Z2ggdGhlIHRhc2sgbmV0d29ya1xyXG4gICAgICAgIGFnZW50LmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgSFROUGxhbm5lci50aWNrKHRoaXMucm9vdCwgdGhpcy50YXNrLCBhZ2VudCk7XHJcbiAgICAgICAgaWYgKGFnZW50LnN1Y2Nlc3NMaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgYWdlbnQuc3VjY2VlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBhZ2VudC5zdWNjZWVkID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGFnZW50LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBIVE5Sb290VGFzayB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBnb2Fscykge1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy5nb2FscyA9IGdvYWxzO1xyXG4gICAgfVxyXG4gICAgZXZhbHVhdGVHb2FsKGFnZW50KSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdCwgZztcclxuICAgICAgICBmb3IgKHZhciBwID0gMDsgcCA8IHRoaXMuZ29hbHMubGVuZ3RoOyBwKyspIHtcclxuICAgICAgICAgICAgZyA9IHRoaXMuZ29hbHNbcF07XHJcbiAgICAgICAgICAgIGlmIChnLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGcuY2hlY2soZy5kYXRhW2cua2V5XSwgZy52YWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBnLmNoZWNrKGFnZW50W2cua2V5XSwgZy52YWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEhUTk5vZGUge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgcHJlY29uZGl0aW9ucykge1xyXG4gICAgICAgIHRoaXMuaWQgPSBnZW5lcmF0ZVVVSUQoKTtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMucHJlY29uZGl0aW9ucyA9IHByZWNvbmRpdGlvbnM7XHJcbiAgICB9XHJcbiAgICBldmFsdWF0ZVByZUNvbmRzKGFnZW50KSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdDtcclxuICAgICAgICBpZiAodGhpcy5wcmVjb25kaXRpb25zIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgcCA9IDA7IHAgPCB0aGlzLnByZWNvbmRpdGlvbnMubGVuZ3RoOyBwKyspIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMucHJlY29uZGl0aW9uc1twXS5jaGVjayhhZ2VudFt0aGlzLnByZWNvbmRpdGlvbnNbcF0ua2V5XSwgdGhpcy5wcmVjb25kaXRpb25zW3BdLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IEhUTlBsYW5uZXIuRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEhUTlBsYW5uZXIuRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBIVE5QbGFubmVyLlNVQ0NFU1M7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEhUTk9wZXJhdG9yIGV4dGVuZHMgSFROTm9kZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBwcmVjb25kaXRpb25zLCBlZmZlY3RzKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSwgcHJlY29uZGl0aW9ucyk7XHJcbiAgICAgICAgdGhpcy50eXBlID0gXCJvcGVyYXRvclwiO1xyXG4gICAgICAgIHRoaXMuZWZmZWN0cyA9IGVmZmVjdHM7XHJcbiAgICAgICAgdGhpcy52aXNpdCA9IGZ1bmN0aW9uIChhZ2VudCwgdGFzaykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5ldmFsdWF0ZVByZUNvbmRzKGFnZW50KSA9PT0gSFROUGxhbm5lci5TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWZmZWN0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWZmZWN0c1tpXShhZ2VudC5ibGFja2JvYXJkWzBdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0YXNrLmV2YWx1YXRlR29hbChhZ2VudC5ibGFja2JvYXJkWzBdKSA9PT0gSFROUGxhbm5lci5TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWdlbnQuc3VjY2Vzc0xpc3QudW5zaGlmdCh0aGlzLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBIVE5QbGFubmVyLlNVQ0NFU1M7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSFROUGxhbm5lci5SVU5OSU5HO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYWdlbnQuYmFycmllckxpc3QudW5zaGlmdCh7IG5hbWU6IHRoaXMubmFtZSwgY29uZGl0aW9uczogdGhpcy5wcmVjb25kaXRpb25zIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIEhUTlBsYW5uZXIuRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgSFROTWV0aG9kIGV4dGVuZHMgSFROTm9kZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBwcmVjb25kaXRpb25zLCBjaGlsZHJlbikge1xyXG4gICAgICAgIHN1cGVyKG5hbWUsIHByZWNvbmRpdGlvbnMpO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IFwibWV0aG9kXCI7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xyXG4gICAgICAgIHRoaXMudmlzaXQgPSBmdW5jdGlvbiAoYWdlbnQsIHRhc2spIHtcclxuICAgICAgICAgICAgdmFyIGNvcHkgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGFnZW50KSk7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBjb3B5LmJsYWNrYm9hcmQ7XHJcbiAgICAgICAgICAgIGFnZW50LmJsYWNrYm9hcmQudW5zaGlmdChjb3B5KTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZXZhbHVhdGVQcmVDb25kcyhhZ2VudCkgPT09IEhUTlBsYW5uZXIuU1VDQ0VTUykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gSFROUGxhbm5lci50aWNrKHRoaXMuY2hpbGRyZW5baV0sIHRhc2ssIGFnZW50KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdGUgPT09IEhUTlBsYW5uZXIuU1VDQ0VTUykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhZ2VudC5zdWNjZXNzTGlzdC51bnNoaWZ0KHRoaXMubmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBIVE5QbGFubmVyLlNVQ0NFU1M7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYWdlbnQuYmFycmllckxpc3QudW5zaGlmdCh7IG5hbWU6IHRoaXMubmFtZSwgY29uZGl0aW9uczogdGhpcy5wcmVjb25kaXRpb25zIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBIVE5QbGFubmVyLkZBSUxFRDtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWh0bi5qcy5tYXAiLCJpbXBvcnQgeyBRQ29tcG9uZW50IH0gZnJvbSAnLi9RQ29tcG9uZW50JztcclxuZXhwb3J0IGNsYXNzIE1IU2FtcGxlciBleHRlbmRzIFFDb21wb25lbnQge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgcm5nLCBkYXRhLCB0YXJnZXQsIHNhdmUgPSB0cnVlKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSk7XHJcbiAgICAgICAgdGhpcy5rZXB0ID0gMDtcclxuICAgICAgICB0aGlzLnRpbWUgPSAwO1xyXG4gICAgICAgIHRoaXMucm5nID0gcm5nO1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgdGhpcy5jaGFpbiA9IFtdO1xyXG4gICAgICAgIHRoaXMuc2F2ZSA9IHNhdmU7XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoYWdlbnQsIHN0ZXApIHtcclxuICAgICAgICBsZXQgbmV3UHJvYiA9IDA7XHJcbiAgICAgICAgYWdlbnQueSA9IGFnZW50LnByb3Bvc2FsKGFnZW50LCBzdGVwLCB0aGlzLnJuZyk7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnRhcmdldCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQuZm9yRWFjaCgoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbmV3UHJvYiArPSBhZ2VudC5sblByb2JGKGFnZW50LCBzdGVwLCBkKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIG5ld1Byb2IgKj0gMSAvIHRoaXMudGFyZ2V0Lmxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIG5ld1Byb2IgPSBhZ2VudC5sblByb2JGKGFnZW50LCBzdGVwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGRpZmYgPSBuZXdQcm9iIC0gYWdlbnQubG5Qcm9iO1xyXG4gICAgICAgIGxldCB1ID0gdGhpcy5ybmcucmFuZG9tKCk7XHJcbiAgICAgICAgaWYgKE1hdGgubG9nKHUpIDw9IGRpZmYgfHwgZGlmZiA+PSAwKSB7XHJcbiAgICAgICAgICAgIGFnZW50LmxuUHJvYiA9IG5ld1Byb2I7XHJcbiAgICAgICAgICAgIGFnZW50LnggPSBhZ2VudC55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5rZXB0ICs9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnNhdmUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGFpbi5wdXNoKHsgaWQ6IGFnZW50LmlkLCB0aW1lOiBhZ2VudC50aW1lLCB4OiBhZ2VudC54IH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYy5qcy5tYXAiLCJleHBvcnQgY2xhc3Mga01lYW4ge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSwgcHJvcHMsIGspIHtcclxuICAgICAgICB0aGlzLmNlbnRyb2lkcyA9IFtdO1xyXG4gICAgICAgIHRoaXMubGltaXRzID0ge307XHJcbiAgICAgICAgdGhpcy5pdGVyYXRpb25zID0gMDtcclxuICAgICAgICAvL2NyZWF0ZSBhIGxpbWl0cyBvYmogZm9yIGVhY2ggcHJvcFxyXG4gICAgICAgIHByb3BzLmZvckVhY2gocCA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubGltaXRzW3BdID0ge1xyXG4gICAgICAgICAgICAgICAgbWluOiAxZTE1LFxyXG4gICAgICAgICAgICAgICAgbWF4OiAtMWUxNVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vc2V0IGxpbWl0cyBmb3IgZWFjaCBwcm9wXHJcbiAgICAgICAgZGF0YS5mb3JFYWNoKGQgPT4ge1xyXG4gICAgICAgICAgICBwcm9wcy5mb3JFYWNoKHAgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRbcF0gPiB0aGlzLmxpbWl0c1twXS5tYXgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpbWl0c1twXS5tYXggPSBkW3BdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGRbcF0gPCB0aGlzLmxpbWl0c1twXS5taW4pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpbWl0c1twXS5taW4gPSBkW3BdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvL2NyZWF0ZSBrIHJhbmRvbSBwb2ludHNcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGs7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmNlbnRyb2lkc1tpXSA9IHsgY291bnQ6IDAgfTtcclxuICAgICAgICAgICAgcHJvcHMuZm9yRWFjaChwID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBjZW50cm9pZCA9IE1hdGgucmFuZG9tKCkgKiB0aGlzLmxpbWl0c1twXS5tYXggKyB0aGlzLmxpbWl0c1twXS5taW47XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNlbnRyb2lkc1tpXVtwXSA9IGNlbnRyb2lkO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgICAgICB0aGlzLnByb3BzID0gcHJvcHM7XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgdGhpcy5fYXNzaWduQ2VudHJvaWQoKTtcclxuICAgICAgICB0aGlzLl9tb3ZlQ2VudHJvaWQoKTtcclxuICAgIH1cclxuICAgIHJ1bigpIHtcclxuICAgICAgICBsZXQgZmluaXNoZWQgPSBmYWxzZTtcclxuICAgICAgICB3aGlsZSAoIWZpbmlzaGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2VudHJvaWRzLmZvckVhY2goYyA9PiB7XHJcbiAgICAgICAgICAgICAgICBmaW5pc2hlZCA9IGMuZmluaXNoZWQ7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLml0ZXJhdGlvbnMrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFt0aGlzLmNlbnRyb2lkcywgdGhpcy5kYXRhXTtcclxuICAgIH1cclxuICAgIF9hc3NpZ25DZW50cm9pZCgpIHtcclxuICAgICAgICB0aGlzLmRhdGEuZm9yRWFjaCgoZCwgaikgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZGlzdGFuY2VzID0gW107XHJcbiAgICAgICAgICAgIGxldCB0b3RhbERpc3QgPSBbXTtcclxuICAgICAgICAgICAgbGV0IG1pbkRpc3Q7XHJcbiAgICAgICAgICAgIGxldCBtaW5JbmRleDtcclxuICAgICAgICAgICAgLy9mb3JlYWNoIHBvaW50LCBnZXQgdGhlIHBlciBwcm9wIGRpc3RhbmNlIGZyb20gZWFjaCBjZW50cm9pZFxyXG4gICAgICAgICAgICB0aGlzLmNlbnRyb2lkcy5mb3JFYWNoKChjLCBpKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBkaXN0YW5jZXNbaV0gPSB7fTtcclxuICAgICAgICAgICAgICAgIHRvdGFsRGlzdFtpXSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmZvckVhY2gocCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2VzW2ldW3BdID0gTWF0aC5zcXJ0KChkW3BdIC0gY1twXSkgKiAoZFtwXSAtIGNbcF0pKTtcclxuICAgICAgICAgICAgICAgICAgICB0b3RhbERpc3RbaV0gKz0gZGlzdGFuY2VzW2ldW3BdO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0b3RhbERpc3RbaV0gPSBNYXRoLnNxcnQodG90YWxEaXN0W2ldKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIG1pbkRpc3QgPSBNYXRoLm1pbi5hcHBseShudWxsLCB0b3RhbERpc3QpO1xyXG4gICAgICAgICAgICBtaW5JbmRleCA9IHRvdGFsRGlzdC5pbmRleE9mKG1pbkRpc3QpO1xyXG4gICAgICAgICAgICBkLmNlbnRyb2lkID0gbWluSW5kZXg7XHJcbiAgICAgICAgICAgIGQuZGlzdGFuY2VzID0gZGlzdGFuY2VzO1xyXG4gICAgICAgICAgICB0aGlzLmNlbnRyb2lkc1ttaW5JbmRleF0uY291bnQgKz0gMTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIF9tb3ZlQ2VudHJvaWQoKSB7XHJcbiAgICAgICAgdGhpcy5jZW50cm9pZHMuZm9yRWFjaCgoYywgaSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZGlzdEZyb21DZW50cm9pZCA9IHt9O1xyXG4gICAgICAgICAgICB0aGlzLnByb3BzLmZvckVhY2gocCA9PiBkaXN0RnJvbUNlbnRyb2lkW3BdID0gW10pO1xyXG4gICAgICAgICAgICAvL2dldCB0aGUgcGVyIHByb3AgZGlzdGFuY2VzIGZyb20gdGhlIGNlbnRyb2lkIGFtb25nIGl0cycgYXNzaWduZWQgcG9pbnRzXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YS5mb3JFYWNoKGQgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGQuY2VudHJvaWQgPT09IGkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmZvckVhY2gocCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3RGcm9tQ2VudHJvaWRbcF0ucHVzaChkW3BdKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vaGFuZGxlIGNlbnRyb2lkIHdpdGggbm8gYXNzaWduZWQgcG9pbnRzIChyYW5kb21seSBhc3NpZ24gbmV3KTtcclxuICAgICAgICAgICAgaWYgKGMuY291bnQgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZm9yRWFjaChwID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXN0RnJvbUNlbnRyb2lkW3BdID0gW01hdGgucmFuZG9tKCkgKiB0aGlzLmxpbWl0c1twXS5tYXggKyB0aGlzLmxpbWl0c1twXS5taW5dO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9nZXQgdGhlIHN1bSBhbmQgbWVhbiBwZXIgcHJvcGVydHkgb2YgdGhlIGFzc2lnbmVkIHBvaW50c1xyXG4gICAgICAgICAgICB0aGlzLnByb3BzLmZvckVhY2gocCA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc3VtID0gZGlzdEZyb21DZW50cm9pZFtwXS5yZWR1Y2UoKHByZXYsIG5leHQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJldiArIG5leHQ7XHJcbiAgICAgICAgICAgICAgICB9LCAwKTtcclxuICAgICAgICAgICAgICAgIGxldCBtZWFuID0gc3VtIC8gZGlzdEZyb21DZW50cm9pZFtwXS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGksICdcXCdzIGF2ZXJhZ2UgZGlzdCB3YXMnLCBtZWFuLCAnIHRoZSBjdXJyZW50IHBvcyB3YXMgJywgY1twXSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY1twXSAhPT0gbWVhbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNbcF0gPSBtZWFuO1xyXG4gICAgICAgICAgICAgICAgICAgIGMuZmluaXNoZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBjLmNvdW50ID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGMuZmluaXNoZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1rbWVhbi5qcy5tYXAiLCJleHBvcnQgY2xhc3MgS05OIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHRyYWluZWREYXRhLCBrUGFyYW1zLCBjbGFzc2lmaWVyLCBuZWFyZXN0Tikge1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy50cmFpbmVkRGF0YSA9IHRyYWluZWREYXRhO1xyXG4gICAgICAgIHRoaXMua1BhcmFtcyA9IGtQYXJhbXM7XHJcbiAgICAgICAgdGhpcy5jbGFzc2lmaWVyID0gY2xhc3NpZmllcjtcclxuICAgICAgICB0aGlzLm5lYXJlc3ROID0gbmVhcmVzdE47XHJcbiAgICB9XHJcbiAgICBzZXROZWlnaGJvcnMocG9pbnQsIGRhdGEsIHBhcmFtLCBjbGFzc2lmaWVyKSB7XHJcbiAgICAgICAgZGF0YS5mb3JFYWNoKChkKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChkLmlkICE9PSBwb2ludC5pZCkge1xyXG4gICAgICAgICAgICAgICAgcG9pbnQubmVpZ2hib3JzW2QuaWRdID0gcG9pbnQubmVpZ2hib3JzW2QuaWRdIHx8IHt9O1xyXG4gICAgICAgICAgICAgICAgcG9pbnQubmVpZ2hib3JzW2QuaWRdW2NsYXNzaWZpZXJdID0gZFtjbGFzc2lmaWVyXTtcclxuICAgICAgICAgICAgICAgIHBvaW50Lm5laWdoYm9yc1tkLmlkXVtwYXJhbS5wYXJhbV0gPSBNYXRoLmFicyhwb2ludFtwYXJhbS5wYXJhbV0gLSBkW3BhcmFtLnBhcmFtXSkgLyBwYXJhbS5yYW5nZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgc29ydChuZWlnaGJvcnMsIHBhcmFtKSB7XHJcbiAgICAgICAgdmFyIGxpc3QgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBuZWlnaCBpbiBuZWlnaGJvcnMpIHtcclxuICAgICAgICAgICAgbGlzdC5wdXNoKG5laWdoYm9yc1tuZWlnaF0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsaXN0LnNvcnQoKGEsIGIpID0+IHtcclxuICAgICAgICAgICAgaWYgKGFbcGFyYW1dID49IGJbcGFyYW1dKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoYltwYXJhbV0gPj0gYVtwYXJhbV0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gbGlzdDtcclxuICAgIH1cclxuICAgIHNldERpc3RhbmNlcyhkYXRhLCB0cmFpbmVkLCBrUGFyYW1zT2JqLCBjbGFzc2lmaWVyKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGRhdGFbaV0ubmVpZ2hib3JzID0ge307XHJcbiAgICAgICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwga1BhcmFtc09iai5sZW5ndGg7IGsrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBkYXRhW2ldW2tQYXJhbXNPYmpba10ucGFyYW1dID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0TmVpZ2hib3JzKGRhdGFbaV0sIHRyYWluZWQsIGtQYXJhbXNPYmpba10sIGNsYXNzaWZpZXIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAodmFyIG4gaW4gZGF0YVtpXS5uZWlnaGJvcnMpIHtcclxuICAgICAgICAgICAgICAgIHZhciBuZWlnaGJvciA9IGRhdGFbaV0ubmVpZ2hib3JzW25dO1xyXG4gICAgICAgICAgICAgICAgdmFyIGRpc3QgPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgcCA9IDA7IHAgPCBrUGFyYW1zT2JqLmxlbmd0aDsgcCsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzdCArPSBuZWlnaGJvcltrUGFyYW1zT2JqW3BdLnBhcmFtXSAqIG5laWdoYm9yW2tQYXJhbXNPYmpbcF0ucGFyYW1dO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbmVpZ2hib3IuZGlzdGFuY2UgPSBNYXRoLnNxcnQoZGlzdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICB9XHJcbiAgICBnZXRSYW5nZShkYXRhLCBrUGFyYW1zKSB7XHJcbiAgICAgICAgbGV0IHJhbmdlcyA9IFtdLCBtaW4gPSAxZTIwLCBtYXggPSAwO1xyXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwga1BhcmFtcy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBkID0gMDsgZCA8IGRhdGEubGVuZ3RoOyBkKyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhW2RdW2tQYXJhbXNbal1dIDwgbWluKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWluID0gZGF0YVtkXVtrUGFyYW1zW2pdXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChkYXRhW2RdW2tQYXJhbXNbal1dID4gbWF4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gZGF0YVtkXVtrUGFyYW1zW2pdXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByYW5nZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBwYXJhbToga1BhcmFtc1tqXSxcclxuICAgICAgICAgICAgICAgIG1pbjogbWluLFxyXG4gICAgICAgICAgICAgICAgbWF4OiBtYXgsXHJcbiAgICAgICAgICAgICAgICByYW5nZTogbWF4IC0gbWluXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICA7XHJcbiAgICAgICAgcmV0dXJuIHJhbmdlcztcclxuICAgIH1cclxuICAgIGNsYXNzaWZ5KGRhdGEsIHRyYWluZWREYXRhLCBrUGFyYW1zLCBjbGFzc2lmaWVyLCBuZWFyZXN0Tikge1xyXG4gICAgICAgIGxldCBrUGFyYW1zT2JqID0gdGhpcy5nZXRSYW5nZShbXS5jb25jYXQoZGF0YSwgdHJhaW5lZERhdGEpLCBrUGFyYW1zKTtcclxuICAgICAgICBkYXRhID0gdGhpcy5zZXREaXN0YW5jZXMoZGF0YSwgdHJhaW5lZERhdGEsIGtQYXJhbXNPYmosIGNsYXNzaWZpZXIpO1xyXG4gICAgICAgIGZvciAobGV0IGQgPSAwOyBkIDwgZGF0YS5sZW5ndGg7IGQrKykge1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0cyA9IHt9O1xyXG4gICAgICAgICAgICBsZXQgbiA9IDA7XHJcbiAgICAgICAgICAgIGxldCBtYXggPSAwO1xyXG4gICAgICAgICAgICBsZXQgbGlrZWxpZXN0ID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBvcmRlcmVkID0gdGhpcy5zb3J0KGRhdGFbZF0ubmVpZ2hib3JzLCAnZGlzdGFuY2UnKTtcclxuICAgICAgICAgICAgd2hpbGUgKG4gPCBuZWFyZXN0Tikge1xyXG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBvcmRlcmVkW25dW2NsYXNzaWZpZXJdO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0c1tjdXJyZW50XSA9IHJlc3VsdHNbY3VycmVudF0gfHwgMDtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHNbY3VycmVudF0gKz0gMTtcclxuICAgICAgICAgICAgICAgIG4rKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGxldCBwYXJhbSBpbiByZXN1bHRzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0c1twYXJhbV0gPiBtYXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXggPSByZXN1bHRzW3BhcmFtXTtcclxuICAgICAgICAgICAgICAgICAgICBsaWtlbGllc3QgPSBwYXJhbTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkYXRhW2RdW2NsYXNzaWZpZXJdID0gbGlrZWxpZXN0O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1rbm4uanMubWFwIiwiZXhwb3J0IGNsYXNzIFZlY3RvciB7XHJcbiAgICBjb25zdHJ1Y3RvcihhcnJheSwgc2l6ZSkge1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBNYXRyaXgge1xyXG4gICAgY29uc3RydWN0b3IobWF0KSB7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIGFjdGl2YXRpb25NZXRob2RzIHtcclxuICAgIHN0YXRpYyBSZUxVKHgpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5tYXgoeCwgMCk7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgc2lnbW9pZCh4KSB7XHJcbiAgICAgICAgcmV0dXJuIDEgLyAoMSArIE1hdGguZXhwKC14KSk7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgdGFuaCh4KSB7XHJcbiAgICAgICAgbGV0IHZhbCA9IChNYXRoLmV4cCh4KSAtIE1hdGguZXhwKC14KSkgLyAoTWF0aC5leHAoeCkgKyBNYXRoLmV4cCgteCkpO1xyXG4gICAgICAgIHJldHVybiB2YWw7XHJcbiAgICB9XHJcbn1cclxuO1xyXG5leHBvcnQgY2xhc3MgZGVyaXZpdGVNZXRob2RzIHtcclxuICAgIHN0YXRpYyBSZUxVKHZhbHVlKSB7XHJcbiAgICAgICAgbGV0IGRlciA9IHZhbHVlIDw9IDAgPyAwIDogMTtcclxuICAgICAgICByZXR1cm4gZGVyO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIHNpZ21vaWQodmFsdWUpIHtcclxuICAgICAgICBsZXQgc2lnID0gYWN0aXZhdGlvbk1ldGhvZHMuc2lnbW9pZDtcclxuICAgICAgICByZXR1cm4gc2lnKHZhbHVlKSAqICgxIC0gc2lnKHZhbHVlKSk7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgdGFuaCh2YWx1ZSkge1xyXG4gICAgICAgIHJldHVybiAxIC0gTWF0aC5wb3coYWN0aXZhdGlvbk1ldGhvZHMudGFuaCh2YWx1ZSksIDIpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBsb2dpc3RpYyh4LCBtLCBiLCBrKSB7XHJcbiAgICB2YXIgeSA9IDEgLyAobSArIE1hdGguZXhwKC1rICogKHggLSBiKSkpO1xyXG4gICAgcmV0dXJuIHk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGxvZ2l0KHgsIG0sIGIsIGspIHtcclxuICAgIHZhciB5ID0gMSAvIE1hdGgubG9nKHggLyAoMSAtIHgpKTtcclxuICAgIHJldHVybiB5O1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBsaW5lYXIoeCwgbSwgYiwgaykge1xyXG4gICAgdmFyIHkgPSBtICogeCArIGI7XHJcbiAgICByZXR1cm4geTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZXhwb25lbnRpYWwoeCwgbSwgYiwgaykge1xyXG4gICAgdmFyIHkgPSAxIC0gTWF0aC5wb3coeCwgaykgLyBNYXRoLnBvdygxLCBrKTtcclxuICAgIHJldHVybiB5O1xyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hdGguanMubWFwIiwiZXhwb3J0IGNsYXNzIE5ldHdvcmsge1xyXG4gICAgY29uc3RydWN0b3IoZGF0YSwgbGFiZWxzLCBoaWRkZW5OdW0sIGVsLCBhY3RpdmF0aW9uVHlwZSA9IFwidGFuaFwiKSB7XHJcbiAgICAgICAgdGhpcy5lbCA9IGVsO1xyXG4gICAgICAgIHRoaXMuaXRlciA9IDA7XHJcbiAgICAgICAgdGhpcy5jb3JyZWN0ID0gMDtcclxuICAgICAgICB0aGlzLmhpZGRlbk51bSA9IGhpZGRlbk51bTtcclxuICAgICAgICB0aGlzLmxlYXJuUmF0ZSA9IDAuMDE7XHJcbiAgICAgICAgdGhpcy5hY3RGbiA9IE5ldHdvcmsuYWN0aXZhdGlvbk1ldGhvZHNbYWN0aXZhdGlvblR5cGVdO1xyXG4gICAgICAgIHRoaXMuZGVyRm4gPSBOZXR3b3JrLmRlcml2YXRpdmVNZXRob2RzW2FjdGl2YXRpb25UeXBlXTtcclxuICAgICAgICB0aGlzLmluaXQoZGF0YSwgbGFiZWxzKTtcclxuICAgIH1cclxuICAgIGxlYXJuKGl0ZXJhdGlvbnMsIGRhdGEsIGxhYmVscywgcmVuZGVyID0gMTAwKSB7XHJcbiAgICAgICAgdGhpcy5jb3JyZWN0ID0gMDtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZXJhdGlvbnM7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgcmFuZElkeCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGRhdGEubGVuZ3RoKTtcclxuICAgICAgICAgICAgdGhpcy5pdGVyKys7XHJcbiAgICAgICAgICAgIHRoaXMuZm9yd2FyZChkYXRhW3JhbmRJZHhdKTtcclxuICAgICAgICAgICAgbGV0IG1heCA9IC0xO1xyXG4gICAgICAgICAgICBsZXQgbWF4SWR4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy52YWx1ZXMubGVuZ3RoKTtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZXNbdGhpcy52YWx1ZXMubGVuZ3RoIC0gMV0uZm9yRWFjaCgoeCwgaWR4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoeCA+IG1heCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1heElkeCA9IGlkeDtcclxuICAgICAgICAgICAgICAgICAgICBtYXggPSB4O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgbGV0IGd1ZXNzZWQgPSB0aGlzLnZhbHVlc1t0aGlzLnZhbHVlcy5sZW5ndGggLSAxXVttYXhJZHhdID49IDAuNSA/IDEgOiAwO1xyXG4gICAgICAgICAgICBpZiAoZ3Vlc3NlZCA9PT0gbGFiZWxzW3JhbmRJZHhdW21heElkeF0pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29ycmVjdCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuYWNjdXJhY3kgPSB0aGlzLmNvcnJlY3QgLyAoaSArIDEpO1xyXG4gICAgICAgICAgICB0aGlzLmJhY2t3YXJkKGxhYmVsc1tyYW5kSWR4XSk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlV2VpZ2h0cygpO1xyXG4gICAgICAgICAgICB0aGlzLnJlc2V0VG90YWxzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY2xhc3NpZnkoZGF0YSkge1xyXG4gICAgICAgIHRoaXMucmVzZXRUb3RhbHMoKTtcclxuICAgICAgICB0aGlzLmZvcndhcmQoZGF0YSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVzW3RoaXMudmFsdWVzLmxlbmd0aCAtIDFdO1xyXG4gICAgfVxyXG4gICAgaW5pdChkYXRhLCBsYWJlbHMpIHtcclxuICAgICAgICBsZXQgaW5wdXRzID0gW107XHJcbiAgICAgICAgdGhpcy5kZXIgPSBbXTtcclxuICAgICAgICB0aGlzLnZhbHVlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMud2VpZ2h0cyA9IFtdO1xyXG4gICAgICAgIHRoaXMud2VpZ2h0Q2hhbmdlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMudG90YWxzID0gW107XHJcbiAgICAgICAgdGhpcy5kZXJUb3RhbHMgPSBbXTtcclxuICAgICAgICB0aGlzLmJpYXNlcyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IG4gPSAwOyBuIDwgZGF0YVswXS5sZW5ndGg7IG4rKykge1xyXG4gICAgICAgICAgICBpbnB1dHMucHVzaCgwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgdGhpcy5oaWRkZW5OdW0ubGVuZ3RoOyBjb2wrKykge1xyXG4gICAgICAgICAgICB0aGlzLmRlcltjb2xdID0gW107XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWVzW2NvbF0gPSBbXTtcclxuICAgICAgICAgICAgdGhpcy50b3RhbHNbY29sXSA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmRlclRvdGFsc1tjb2xdID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IHRoaXMuaGlkZGVuTnVtW2NvbF07IHJvdysrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlc1tjb2xdW3Jvd10gPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXJbY29sXVtyb3ddID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMudG90YWxzW2NvbF1bcm93XSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlclRvdGFsc1tjb2xdW3Jvd10gPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudmFsdWVzLnVuc2hpZnQoaW5wdXRzKTtcclxuICAgICAgICB0aGlzLnRvdGFscy51bnNoaWZ0KGlucHV0cyk7XHJcbiAgICAgICAgdGhpcy5kZXIudW5zaGlmdChpbnB1dHMpO1xyXG4gICAgICAgIHRoaXMuZGVyVG90YWxzLnVuc2hpZnQoaW5wdXRzKTtcclxuICAgICAgICB0aGlzLnZhbHVlc1t0aGlzLmhpZGRlbk51bS5sZW5ndGggKyAxXSA9IGxhYmVsc1swXS5tYXAoKGwpID0+IHsgcmV0dXJuIDA7IH0pO1xyXG4gICAgICAgIHRoaXMudG90YWxzW3RoaXMuaGlkZGVuTnVtLmxlbmd0aCArIDFdID0gbGFiZWxzWzBdLm1hcCgobCkgPT4geyByZXR1cm4gMDsgfSk7XHJcbiAgICAgICAgdGhpcy5kZXJbdGhpcy5oaWRkZW5OdW0ubGVuZ3RoICsgMV0gPSBsYWJlbHNbMF0ubWFwKChsKSA9PiB7IHJldHVybiAwOyB9KTtcclxuICAgICAgICB0aGlzLmRlclRvdGFsc1t0aGlzLmhpZGRlbk51bS5sZW5ndGggKyAxXSA9IGxhYmVsc1swXS5tYXAoKGwpID0+IHsgcmV0dXJuIDA7IH0pO1xyXG4gICAgICAgIGZvciAobGV0IHdnID0gMDsgd2cgPCB0aGlzLnZhbHVlcy5sZW5ndGggLSAxOyB3ZysrKSB7XHJcbiAgICAgICAgICAgIHRoaXMud2VpZ2h0c1t3Z10gPSBbXTtcclxuICAgICAgICAgICAgdGhpcy53ZWlnaHRDaGFuZ2VzW3dnXSA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmJpYXNlc1t3Z10gPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgc3JjID0gMDsgc3JjIDwgdGhpcy52YWx1ZXNbd2ddLmxlbmd0aDsgc3JjKyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMud2VpZ2h0c1t3Z11bc3JjXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy53ZWlnaHRDaGFuZ2VzW3dnXVtzcmNdID0gW107XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBkc3QgPSAwOyBkc3QgPCB0aGlzLnZhbHVlc1t3ZyArIDFdLmxlbmd0aDsgZHN0KyspIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJpYXNlc1t3Z11bZHN0XSA9IE1hdGgucmFuZG9tKCkgLSAwLjU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53ZWlnaHRzW3dnXVtzcmNdW2RzdF0gPSBNYXRoLnJhbmRvbSgpIC0gMC41O1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2VpZ2h0Q2hhbmdlc1t3Z11bc3JjXVtkc3RdID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJlc2V0VG90YWxzKCkge1xyXG4gICAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IHRoaXMudG90YWxzLmxlbmd0aDsgY29sKyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgdGhpcy50b3RhbHNbY29sXS5sZW5ndGg7IHJvdysrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRvdGFsc1tjb2xdW3Jvd10gPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXJUb3RhbHNbY29sXVtyb3ddID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZvcndhcmQoaW5wdXQpIHtcclxuICAgICAgICB0aGlzLnZhbHVlc1swXSA9IGlucHV0O1xyXG4gICAgICAgIGZvciAobGV0IHdnID0gMDsgd2cgPCB0aGlzLndlaWdodHMubGVuZ3RoOyB3ZysrKSB7XHJcbiAgICAgICAgICAgIGxldCBzcmNWYWxzID0gd2c7XHJcbiAgICAgICAgICAgIGxldCBkc3RWYWxzID0gd2cgKyAxO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBzcmMgPSAwOyBzcmMgPCB0aGlzLndlaWdodHNbd2ddLmxlbmd0aDsgc3JjKyspIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGRzdCA9IDA7IGRzdCA8IHRoaXMud2VpZ2h0c1t3Z11bc3JjXS5sZW5ndGg7IGRzdCsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b3RhbHNbZHN0VmFsc11bZHN0XSArPSB0aGlzLnZhbHVlc1tzcmNWYWxzXVtzcmNdICogdGhpcy53ZWlnaHRzW3dnXVtzcmNdW2RzdF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy52YWx1ZXNbZHN0VmFsc10gPSB0aGlzLnRvdGFsc1tkc3RWYWxzXS5tYXAoKHRvdGFsLCBpZHgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmFjdEZuKHRvdGFsICsgdGhpcy5iaWFzZXNbd2ddW2lkeF0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBiYWNrd2FyZChsYWJlbHMpIHtcclxuICAgICAgICBmb3IgKGxldCB3ZyA9IHRoaXMud2VpZ2h0cy5sZW5ndGggLSAxOyB3ZyA+PSAwOyB3Zy0tKSB7XHJcbiAgICAgICAgICAgIGxldCBzcmNWYWxzID0gd2c7XHJcbiAgICAgICAgICAgIGxldCBkc3RWYWxzID0gd2cgKyAxO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBzcmMgPSAwOyBzcmMgPCB0aGlzLndlaWdodHNbd2ddLmxlbmd0aDsgc3JjKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBlcnIgPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZHN0ID0gMDsgZHN0IDwgdGhpcy53ZWlnaHRzW3dnXVtzcmNdLmxlbmd0aDsgZHN0KyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAod2cgPT09IHRoaXMud2VpZ2h0cy5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVyciArPSBsYWJlbHNbZHN0XSAtIHRoaXMudmFsdWVzW2RzdFZhbHNdW2RzdF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVyW2RzdFZhbHNdW2RzdF0gPSBlcnI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnIgKz0gdGhpcy5kZXJbZHN0VmFsc11bZHN0XSAqIHRoaXMud2VpZ2h0c1t3Z11bc3JjXVtkc3RdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGVyVG90YWxzW3NyY1ZhbHNdW3NyY10gPSBlcnI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlcltzcmNWYWxzXVtzcmNdID0gZXJyICogdGhpcy5kZXJGbih0aGlzLnZhbHVlc1tzcmNWYWxzXVtzcmNdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHVwZGF0ZVdlaWdodHMoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgd2cgPSAwOyB3ZyA8IHRoaXMud2VpZ2h0cy5sZW5ndGg7IHdnKyspIHtcclxuICAgICAgICAgICAgbGV0IHNyY1ZhbHMgPSB3ZztcclxuICAgICAgICAgICAgbGV0IGRzdFZhbHMgPSB3ZyArIDE7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHNyYyA9IDA7IHNyYyA8IHRoaXMud2VpZ2h0c1t3Z10ubGVuZ3RoOyBzcmMrKykge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZHN0ID0gMDsgZHN0IDwgdGhpcy53ZWlnaHRzW3dnXVtzcmNdLmxlbmd0aDsgZHN0KyspIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbW9tZW50dW0gPSB0aGlzLndlaWdodENoYW5nZXNbd2ddW3NyY11bZHN0XSAqIDAuMTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLndlaWdodENoYW5nZXNbd2ddW3NyY11bZHN0XSA9ICh0aGlzLnZhbHVlc1tzcmNWYWxzXVtzcmNdICogdGhpcy5kZXJbZHN0VmFsc11bZHN0XSAqIHRoaXMubGVhcm5SYXRlKSArIG1vbWVudHVtO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2VpZ2h0c1t3Z11bc3JjXVtkc3RdICs9IHRoaXMud2VpZ2h0Q2hhbmdlc1t3Z11bc3JjXVtkc3RdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuYmlhc2VzW3dnXSA9IHRoaXMuYmlhc2VzW3dnXS5tYXAoKGJpYXMsIGlkeCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubGVhcm5SYXRlICogdGhpcy5kZXJbZHN0VmFsc11baWR4XSArIGJpYXM7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIG1zZSgpIHtcclxuICAgICAgICBsZXQgZXJyID0gMDtcclxuICAgICAgICBsZXQgY291bnQgPSAwO1xyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5kZXJUb3RhbHMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgZXJyICs9IHRoaXMuZGVyVG90YWxzW2pdLnJlZHVjZSgobGFzdCwgY3VycmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY291bnQrKztcclxuICAgICAgICAgICAgICAgIHJldHVybiBsYXN0ICsgTWF0aC5wb3coY3VycmVudCwgMik7XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZXJyIC8gY291bnQ7XHJcbiAgICB9XHJcbn1cclxuTmV0d29yay5hY3RpdmF0aW9uTWV0aG9kcyA9IHtcclxuICAgIFJlTFU6IGZ1bmN0aW9uICh4KSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KHgsIDApO1xyXG4gICAgfSxcclxuICAgIHNpZ21vaWQ6IGZ1bmN0aW9uICh4KSB7XHJcbiAgICAgICAgcmV0dXJuIDEgLyAoMSArIE1hdGguZXhwKC14KSk7XHJcbiAgICB9LFxyXG4gICAgdGFuaDogZnVuY3Rpb24gKHgpIHtcclxuICAgICAgICBsZXQgdmFsID0gKE1hdGguZXhwKHgpIC0gTWF0aC5leHAoLXgpKSAvIChNYXRoLmV4cCh4KSArIE1hdGguZXhwKC14KSk7XHJcbiAgICAgICAgcmV0dXJuIHZhbDtcclxuICAgIH1cclxufTtcclxuTmV0d29yay5kZXJpdmF0aXZlTWV0aG9kcyA9IHtcclxuICAgIFJlTFU6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIGxldCBkZXIgPSB2YWx1ZSA8PSAwID8gMCA6IDE7XHJcbiAgICAgICAgcmV0dXJuIGRlcjtcclxuICAgIH0sXHJcbiAgICBzaWdtb2lkOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICBsZXQgc2lnID0gTmV0d29yay5hY3RpdmF0aW9uTWV0aG9kcy5zaWdtb2lkO1xyXG4gICAgICAgIHJldHVybiBzaWcodmFsdWUpICogKDEgLSBzaWcodmFsdWUpKTtcclxuICAgIH0sXHJcbiAgICB0YW5oOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gMSAtIE1hdGgucG93KE5ldHdvcmsuYWN0aXZhdGlvbk1ldGhvZHMudGFuaCh2YWx1ZSksIDIpO1xyXG4gICAgfVxyXG59O1xyXG5OZXR3b3JrLmNvc3RNZXRob2RzID0ge1xyXG4gICAgc3FFcnI6IGZ1bmN0aW9uICh0YXJnZXQsIGd1ZXNzKSB7XHJcbiAgICAgICAgcmV0dXJuIGd1ZXNzIC0gdGFyZ2V0O1xyXG4gICAgfSxcclxuICAgIGFic0VycjogZnVuY3Rpb24gKCkge1xyXG4gICAgfVxyXG59O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1uZXR3b3JrLmpzLm1hcCIsImV4cG9ydCBjbGFzcyBRTGVhcm5lciB7XHJcbiAgICAvL1RPRE8gLSBjaGFuZ2UgZXBpc29kZSB0byB1cGRhdGVcclxuICAgIGNvbnN0cnVjdG9yKFIsIGdhbW1hLCBnb2FsKSB7XHJcbiAgICAgICAgdGhpcy5yYXdNYXggPSAxO1xyXG4gICAgICAgIHRoaXMuUiA9IFI7XHJcbiAgICAgICAgdGhpcy5nYW1tYSA9IGdhbW1hO1xyXG4gICAgICAgIHRoaXMuZ29hbCA9IGdvYWw7XHJcbiAgICAgICAgdGhpcy5RID0ge307XHJcbiAgICAgICAgZm9yICh2YXIgc3RhdGUgaW4gUikge1xyXG4gICAgICAgICAgICB0aGlzLlFbc3RhdGVdID0ge307XHJcbiAgICAgICAgICAgIGZvciAodmFyIGFjdGlvbiBpbiBSW3N0YXRlXSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5RW3N0YXRlXVthY3Rpb25dID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmdhbW1hID0gZ2FtbWE7XHJcbiAgICB9XHJcbiAgICBncm93KHN0YXRlLCBhY3Rpb25zKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhY3Rpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIC8vcmV3YXJkIGlzIGN1cnJlbnRseSB1bmtub3duXHJcbiAgICAgICAgICAgIHRoaXMuUltzdGF0ZV1bYWN0aW9uc1tpXV0gPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGV4cGxvcmUocHJvbSkge1xyXG4gICAgfVxyXG4gICAgdHJhbnNpdGlvbihzdGF0ZSwgYWN0aW9uKSB7XHJcbiAgICAgICAgLy9pcyB0aGUgc3RhdGUgdW5leGFtaW5lZFxyXG4gICAgICAgIGxldCBleGFtaW5lZCA9IHRydWU7XHJcbiAgICAgICAgbGV0IGJlc3RBY3Rpb247XHJcbiAgICAgICAgZm9yIChhY3Rpb24gaW4gdGhpcy5SW3N0YXRlXSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5SW3N0YXRlXVthY3Rpb25dID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBiZXN0QWN0aW9uID0gYWN0aW9uO1xyXG4gICAgICAgICAgICAgICAgZXhhbWluZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBiZXN0QWN0aW9uID0gdGhpcy5tYXgoYWN0aW9uKTtcclxuICAgICAgICB0aGlzLlFbc3RhdGVdW2FjdGlvbl0gPSB0aGlzLlJbc3RhdGVdW2FjdGlvbl0gKyAodGhpcy5nYW1tYSAqIHRoaXMuUVthY3Rpb25dW2Jlc3RBY3Rpb25dKTtcclxuICAgIH1cclxuICAgIG1heChzdGF0ZSkge1xyXG4gICAgICAgIHZhciBtYXggPSAwLCBtYXhBY3Rpb24gPSBudWxsO1xyXG4gICAgICAgIGZvciAodmFyIGFjdGlvbiBpbiB0aGlzLlFbc3RhdGVdKSB7XHJcbiAgICAgICAgICAgIGlmICghbWF4QWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBtYXggPSB0aGlzLlFbc3RhdGVdW2FjdGlvbl07XHJcbiAgICAgICAgICAgICAgICBtYXhBY3Rpb24gPSBhY3Rpb247XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5RW3N0YXRlXVthY3Rpb25dID09PSBtYXggJiYgKE1hdGgucmFuZG9tKCkgPiAwLjUpKSB7XHJcbiAgICAgICAgICAgICAgICBtYXggPSB0aGlzLlFbc3RhdGVdW2FjdGlvbl07XHJcbiAgICAgICAgICAgICAgICBtYXhBY3Rpb24gPSBhY3Rpb247XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5RW3N0YXRlXVthY3Rpb25dID4gbWF4KSB7XHJcbiAgICAgICAgICAgICAgICBtYXggPSB0aGlzLlFbc3RhdGVdW2FjdGlvbl07XHJcbiAgICAgICAgICAgICAgICBtYXhBY3Rpb24gPSBhY3Rpb247XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG1heEFjdGlvbjtcclxuICAgIH1cclxuICAgIHBvc3NpYmxlKHN0YXRlKSB7XHJcbiAgICAgICAgdmFyIHBvc3NpYmxlID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgYWN0aW9uIGluIHRoaXMuUltzdGF0ZV0pIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuUltzdGF0ZV1bYWN0aW9uXSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBwb3NzaWJsZS5wdXNoKGFjdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBvc3NpYmxlW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBvc3NpYmxlLmxlbmd0aCldO1xyXG4gICAgfVxyXG4gICAgZXBpc29kZShzdGF0ZSkge1xyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbihzdGF0ZSwgdGhpcy5wb3NzaWJsZShzdGF0ZSkpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLlE7XHJcbiAgICB9XHJcbiAgICBub3JtYWxpemUoKSB7XHJcbiAgICAgICAgZm9yICh2YXIgc3RhdGUgaW4gdGhpcy5RKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGFjdGlvbiBpbiB0aGlzLlFbc3RhdGVdKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5RW2FjdGlvbl1bc3RhdGVdID49IHRoaXMucmF3TWF4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yYXdNYXggPSB0aGlzLlFbYWN0aW9uXVtzdGF0ZV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yICh2YXIgc3RhdGUgaW4gdGhpcy5RKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGFjdGlvbiBpbiB0aGlzLlFbc3RhdGVdKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLlFbYWN0aW9uXVtzdGF0ZV0gPSBNYXRoLnJvdW5kKHRoaXMuUVthY3Rpb25dW3N0YXRlXSAvIHRoaXMucmF3TWF4ICogMTAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1RTGVhcm5lci5qcy5tYXAiLCJpbXBvcnQgeyBzdGFuZGFyZGl6ZWQsIGRhdGFUb01hdHJpeCB9IGZyb20gJy4vdXRpbHMnO1xyXG5leHBvcnQgZnVuY3Rpb24gb2xzKGl2cywgZHYpIHtcclxuICAgIGxldCBkYXRhID0gZGF0YVRvTWF0cml4KGl2cywgdGhpcy5zdGFuZGFyZGl6ZWQpO1xyXG4gICAgbGV0IGR2RGF0YSA9IGR2LmRhdGE7XHJcbiAgICBsZXQgbiA9IGR2RGF0YS5sZW5ndGg7XHJcbiAgICBsZXQgbWVhbnMgPSBpdnMubWFwKChhKSA9PiB7IHJldHVybiBhLm1lYW47IH0pO1xyXG4gICAgbGV0IHNkcyA9IGl2cy5tYXAoKGEpID0+IHsgcmV0dXJuIGEuc2Q7IH0pO1xyXG4gICAgbGV0IHZhcnMgPSBpdnMubWFwKChhKSA9PiB7IHJldHVybiBbYS52YXJpYW5jZV07IH0pO1xyXG4gICAgbWVhbnMudW5zaGlmdCgxKTtcclxuICAgIHNkcy51bnNoaWZ0KDEpO1xyXG4gICAgdmFycy51bnNoaWZ0KFsxXSk7XHJcbiAgICBpZiAodGhpcy5zdGFuZGFyZGl6ZWQpIHtcclxuICAgICAgICBkdkRhdGEgPSBzdGFuZGFyZGl6ZWQoZHYuZGF0YSk7XHJcbiAgICB9XHJcbiAgICBsZXQgWCA9IGRhdGE7XHJcbiAgICBsZXQgWSA9IGR2RGF0YS5tYXAoKHkpID0+IHsgcmV0dXJuIFt5XTsgfSk7XHJcbiAgICBsZXQgWHByaW1lID0galN0YXQudHJhbnNwb3NlKFgpO1xyXG4gICAgbGV0IFhwcmltZVggPSBqU3RhdC5tdWx0aXBseShYcHJpbWUsIFgpO1xyXG4gICAgbGV0IFhwcmltZVkgPSBqU3RhdC5tdWx0aXBseShYcHJpbWUsIFkpO1xyXG4gICAgLy9jb2VmZmljaWVudHNcclxuICAgIGxldCBiID0galN0YXQubXVsdGlwbHkoalN0YXQuaW52KFhwcmltZVgpLCBYcHJpbWVZKTtcclxuICAgIHRoaXMuYmV0YXMgPSBiLnJlZHVjZSgoYSwgYikgPT4geyByZXR1cm4gYS5jb25jYXQoYik7IH0pO1xyXG4gICAgLy9zdGFuZGFyZCBlcnJvciBvZiB0aGUgY29lZmZpY2llbnRzXHJcbiAgICB0aGlzLnN0RXJyQ29lZmYgPSBqU3RhdC5tdWx0aXBseShqU3RhdC5pbnYoWHByaW1lWCksIHZhcnMpXHJcbiAgICAgICAgLnJlZHVjZSgoYSwgYikgPT4geyByZXR1cm4gYS5jb25jYXQoYik7IH0pO1xyXG4gICAgLy90IHN0YXRpc3RpY3NcclxuICAgIHRoaXMudFN0YXRzID0gdGhpcy5zdEVyckNvZWZmLm1hcCgoc2UsIGkpID0+IHsgcmV0dXJuIHRoaXMuYmV0YXNbaV0gLyBzZTsgfSk7XHJcbiAgICAvL3AgdmFsdWVzXHJcbiAgICB0aGlzLnBWYWx1ZXMgPSB0aGlzLnRTdGF0cy5tYXAoKHQsIGkpID0+IHsgcmV0dXJuIGpTdGF0LnR0ZXN0KHQsIG1lYW5zW2ldLCBzZHNbaV0sIG4pOyB9KTtcclxuICAgIC8vcmVzaWR1YWxzXHJcbiAgICBsZXQgeWhhdCA9IFtdO1xyXG4gICAgbGV0IHJlcyA9IGR2LmRhdGEubWFwKChkLCBpKSA9PiB7XHJcbiAgICAgICAgZGF0YVtpXS5zaGlmdCgpO1xyXG4gICAgICAgIGxldCByb3cgPSBkYXRhW2ldO1xyXG4gICAgICAgIHloYXRbaV0gPSB0aGlzLnByZWRpY3Qocm93KTtcclxuICAgICAgICByZXR1cm4gZCAtIHloYXRbaV07XHJcbiAgICB9KTtcclxuICAgIGxldCByZXNpZHVhbCA9IHloYXQ7XHJcbiAgICByZXR1cm4gdGhpcy5iZXRhcztcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gcGxzKHgsIHkpIHtcclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZWdyZXNzaW9uLmpzLm1hcCIsImltcG9ydCB7IFFDb21wb25lbnQgfSBmcm9tICcuL1FDb21wb25lbnQnO1xyXG4vKlxyXG4qIFV0aWxpdHkgU3lzdGVtcyBjbGFzc1xyXG4qL1xyXG5leHBvcnQgY2xhc3MgVVN5cyBleHRlbmRzIFFDb21wb25lbnQge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgb3B0aW9ucywgZGF0YSkge1xyXG4gICAgICAgIHN1cGVyKG5hbWUpO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICAgICAgdGhpcy5yZXN1bHRzID0gW107XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgIH1cclxuICAgIHVwZGF0ZShhZ2VudCwgc3RlcCkge1xyXG4gICAgICAgIHZhciB0bXAgPSBbXSwgbWF4ID0gMCwgYXZnLCB0b3A7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm9wdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdG1wW2ldID0gMDtcclxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLm9wdGlvbnNbaV0uY29uc2lkZXJhdGlvbnMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBjID0gdGhpcy5vcHRpb25zW2ldLmNvbnNpZGVyYXRpb25zW2pdO1xyXG4gICAgICAgICAgICAgICAgbGV0IHggPSBjLngoYWdlbnQsIHRoaXMub3B0aW9uc1tpXS5wYXJhbXMpO1xyXG4gICAgICAgICAgICAgICAgdG1wW2ldICs9IGMuZih4LCBjLm0sIGMuYiwgYy5rKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhdmcgPSB0bXBbaV0gLyB0aGlzLm9wdGlvbnNbaV0uY29uc2lkZXJhdGlvbnMubGVuZ3RoO1xyXG4gICAgICAgICAgICB0aGlzLnJlc3VsdHMucHVzaCh7IHBvaW50OiBhZ2VudC5pZCwgb3B0OiB0aGlzLm9wdGlvbnNbaV0ubmFtZSwgcmVzdWx0OiBhdmcgfSk7XHJcbiAgICAgICAgICAgIGlmIChhdmcgPiBtYXgpIHtcclxuICAgICAgICAgICAgICAgIGFnZW50LnRvcCA9IHsgbmFtZTogdGhpcy5vcHRpb25zW2ldLm5hbWUsIHV0aWw6IGF2ZyB9O1xyXG4gICAgICAgICAgICAgICAgdG9wID0gaTtcclxuICAgICAgICAgICAgICAgIG1heCA9IGF2ZztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm9wdGlvbnNbdG9wXS5hY3Rpb24oc3RlcCwgYWdlbnQpO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVVTeXMuanMubWFwIiwiZXhwb3J0ICogZnJvbSAnLi91dGlscyc7XHJcbmV4cG9ydCB7IFFDb21wb25lbnQgfSBmcm9tICcuL1FDb21wb25lbnQnO1xyXG5leHBvcnQgeyBCRElBZ2VudCB9IGZyb20gJy4vYmRpJztcclxuZXhwb3J0ICogZnJvbSAnLi9iZWhhdmlvclRyZWUnO1xyXG5leHBvcnQgKiBmcm9tICcuL2NvbXBhcnRtZW50JztcclxuZXhwb3J0IHsgQ29udGFjdFBhdGNoIH0gZnJvbSAnLi9jb250YWN0UGF0Y2gnO1xyXG5leHBvcnQgeyBFbnZpcm9ubWVudCB9IGZyb20gJy4vZW52aXJvbm1lbnQnO1xyXG5leHBvcnQgKiBmcm9tICcuL2VwaSc7XHJcbmV4cG9ydCAqIGZyb20gJy4vZXZlbnRzJztcclxuZXhwb3J0IHsgRXhwZXJpbWVudCB9IGZyb20gJy4vZXhwZXJpbWVudCc7XHJcbmV4cG9ydCAqIGZyb20gJy4vZ2VuZXRpYyc7XHJcbmV4cG9ydCB7IEV2b2x1dGlvbmFyeSB9IGZyb20gJy4vZXZvbHV0aW9uYXJ5JztcclxuZXhwb3J0IHsgRXZvbHZlIH0gZnJvbSAnLi9ldm9sdmUnO1xyXG5leHBvcnQgeyBIeWJyaWRBdXRvbWF0YSB9IGZyb20gJy4vaGEnO1xyXG5leHBvcnQgKiBmcm9tICcuL2h0bic7XHJcbmV4cG9ydCAqIGZyb20gJy4vbWMnO1xyXG5leHBvcnQgeyBrTWVhbiB9IGZyb20gJy4va21lYW4nO1xyXG5leHBvcnQgeyBLTk4gfSBmcm9tICcuL2tubic7XHJcbmV4cG9ydCAqIGZyb20gJy4vbWF0aCc7XHJcbmV4cG9ydCB7IE5ldHdvcmsgfSBmcm9tICcuL25ldHdvcmsnO1xyXG5leHBvcnQgeyBRTGVhcm5lciB9IGZyb20gJy4vUUxlYXJuZXInO1xyXG5leHBvcnQgKiBmcm9tICcuL3JlZ3Jlc3Npb24nO1xyXG5leHBvcnQgeyBTdGF0ZU1hY2hpbmUgfSBmcm9tICcuL3N0YXRlTWFjaGluZSc7XHJcbmV4cG9ydCAqIGZyb20gJy4vVVN5cyc7XHJcbmV4cG9ydCAqIGZyb20gJy4vcmFuZG9tJztcclxuZXhwb3J0ICogZnJvbSAnLi9yZXNvdXJjZSc7XHJcbmV4cG9ydCB2YXIgdmVyc2lvbiA9ICcwLjAuNSc7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1haW4uanMubWFwIiwiLyoqKlxyXG4qQG1vZHVsZSBRRXBpS2l0XHJcbiovXHJcbmltcG9ydCAqIGFzIHFlcGlraXQgZnJvbSAnLi9tYWluJztcclxubGV0IFFFcGlLaXQgPSBxZXBpa2l0O1xyXG5mb3IgKGxldCBrZXkgaW4gUUVwaUtpdCkge1xyXG4gICAgaWYgKGtleSA9PSAndmVyc2lvbicpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhRRXBpS2l0W2tleV0pO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXFlcGlraXQuanMubWFwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQU8sTUFBTSxRQUFRLENBQUM7SUFDbEIsV0FBVyxDQUFDLFFBQVEsRUFBRTtRQUNsQixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztRQUNqQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUN0QixJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztRQUMzQixJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztRQUMzQixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNmLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFD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QUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ3ZDO1FBQ0QsT0FBTyxNQUFNLENBQUM7S0FDakI7Q0FDSixBQUNEOztBQzlETyxNQUFNLFlBQVksU0FBUyxVQUFVLENBQUM7SUFDekMsV0FBVyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUU7UUFDckQsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ1osSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7S0FDcEI7SUFDRCxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRTtRQUNoQixLQUFLLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDeEIsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNoQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzlDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3RELElBQUksS0FBSyxH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LEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtZQUN0QixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDakI7S0FDSjtJQUNELE1BQU0sR0FBRztRQUNMLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDO1FBQ3pDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDVCxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2YsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDbEIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDcEIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDbkIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbEIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDbEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztR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LENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2RCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDbkUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDNUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDNUUsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzVGO0lBQ0QsWUFBWSxDQUFDLEdBQUcsRUFBRTtRQUNkLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUNiLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ2pDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1NBQ3pCO1FBQ0QsT0FBTyxHQUFHLENBQUM7S0FDZDtJQUNELFNBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDWCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUMzQjtJQUNELE9BQU8sQ0FBQyxHQUFHLEVBQUU7UUFDVCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUM1QjtJQUNELEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFO1FBQ1osSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQztLQUNwRjtJQUNELElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFO1FBQ2xCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztRQUNaLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztRQUNuQixLQUFLLElBQUksR0FBRyxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUU7WUFDMUIsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDeEQsVUFBVSxFQUFFLENBQUM7U0FDaEI7UUFDRCxLQUFLLElBQUksR0FBRyxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUU7WUFDMUIsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDeEQsVUFBVSxFQUFFLENBQUM7U0FDaEI7UUFDRCxLQUFLLElBQUksR0FBRyxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUU7WUFDMUIsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDeEQsVUFBVSxFQUFFLENBQUM7U0FDaEI7UUFDRCxPQUFPLEdBQUcsR0FBRyxVQUFVLENBQUM7S0FDM0I7SUFDRCxNQUFNLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRTtRQUN2QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN4QyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEdBQUcsTUFBTSxFQUFFO2dCQUM1QixTQUFTO2FBQ1o7WUFDRCxJQUFJLElBQUksR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1lBQ2hDLElBQUksT0FBTyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFDbkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3JDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztnQkFDOUMsSUFBSSxJQUFJLEdBQUcsS0FBSyxFQUFFO29CQUNkLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7aUJBQ2hFO3FCQUNJO29CQUNELE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7aUJBQy9DO2FBQ0o7U0FDSjtLQUNKO0lBQ0QsSUFBSSxDQUFDLE9BQU8sRUFBRTtRQUNWLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNwRSxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDakQsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxXQUFXLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDbEMsSUFBSSxLQUFLLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUNyQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLENBQUM7WUFDakQsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxDQUFDO1lBQ2pELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQztZQUN0RCxLQUFLLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDekgsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN4QjtRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdEIsT0FBTyxRQUFRLENBQUM7S0FDbkI7SUFDRCxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUNWLElBQUksQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFO1lBQ25CLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDYjthQUNJLElBQUksQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFO1lBQ3hCLE9BQU8sQ0FBQyxDQUFDO1NBQ1o7UUFDRCxPQUFPLENBQUMsQ0FBQztLQUNaO0lBQ0QsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDVixJQUFJLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRTtZQUNuQixPQUFPLENBQUMsQ0FBQztTQUNaO2FBQ0ksSUFBSSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUU7WUFDeEIsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUNiO1FBQ0QsT0FBTyxDQUFDLENBQUM7S0FDWjtDQUNKLEFBQ0Q7O0FDdkpPLE1BQU0sY0FBYyxTQUFTLFVBQVUsQ0FBQztJQUMzQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUU7UUFDeEQsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ1osSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7S0FDMUI7SUFDRCxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRTtRQUNoQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUM3QyxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDM0IsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5QixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hELElBQUksU0FBUyxLQUFLLE9BQU8sSUFBSSxJQUFJLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRTtnQkFDcEQsSUFBSTtvQkFDQSxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ25GLEtBQUssQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO2lCQUM1QjtnQkFDRCxPQUFPLEdBQUcsRUFBRTs7O2lCQUdYO2FBQ0o7WUFDRCxLQUFLLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7O2dCQUUxQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDN0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7Z0JBQy9CLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDakY7U0FDSjtLQUNKO0NBQ0osQUFDRDs7QUNqQ0E7QUFDQSxBQUFPLE1BQU0sVUFBVSxTQUFTLFVBQVUsQ0FBQztJQUN2QyxPQUFPLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRTtRQUMzQixJQUFJLEtBQUssQ0FBQyxXQUFXLEVBQUU7WUFDbkIsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3JDO2FBQ0k7WUFDRCxLQUFLLENBQUMsV0FBVyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hDLEtBQUssQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1lBQ3ZCLEtBQUssQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1lBQ3ZCLEtBQUssQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDcEMsT0FBTyxLQUFLLENBQUM7S0FDaEI7SUFDRCxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFO1FBQ2hDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNaLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0tBQ3BCO0lBQ0QsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUU7O1FBRWhCLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzdDLElBQUksS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzlCLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1NBQ3hCO2FBQ0k7WUFDRCxLQUFLLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztTQUN6QjtRQUNELEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0tBQ3hCO0NBQ0o7QUFDRCxBQUFPLE1BQU0sV0FBVyxDQUFDO0lBQ3JCLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFO1FBQ3JCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0tBQ3RCO0lBQ0QsWUFBWSxDQUFDLEtBQUssRUFBRTtRQUNoQixJQUFJLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDZCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDeEMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEIsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFO2dCQUNSLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM1QztpQkFDSTtnQkFDRCxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUMzQztZQUNELE9BQU8sTUFBTSxDQUFDO1NBQ2pCO0tBQ0o7Q0FDSjtBQUNELEFBQU8sTUFBTSxPQUFPLENBQUM7SUFDakIsV0FBVyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7UUFDN0IsSUFBSSxDQUFDLEVBQUUsR0FBRyxZQUFZLEVBQUUsQ0FBQztRQUN6QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztLQUN0QztJQUNELGdCQUFnQixDQUFDLEtBQUssRUFBRTtRQUNwQixJQUFJLE1BQU0sQ0FBQztRQUNYLElBQUksSUFBSSxDQUFDLGFBQWEsWUFBWSxLQUFLLEVBQUU7WUFDckMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNoRCxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDcEcsSUFBSSxNQUFNLEtBQUssVUFBVSxDQUFDLE1BQU0sRUFBRTtvQkFDOUIsT0FBTyxVQUFVLENBQUMsTUFBTSxDQUFDO2lCQUM1QjthQUNKO1NBQ0o7UUFDRCxPQUFPLFVBQVUsQ0FBQyxPQUFPLENBQUM7S0FDN0I7Q0FDSjtBQUNELEFBQU8sTUFBTSxXQUFXLFNBQVMsT0FBTyxDQUFDO0lBQ3JDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRTtRQUN0QyxLQUFLLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxLQUFLLEdBQUcsVUFBVSxLQUFLLEVBQUUsSUFBSSxFQUFFO1lBQ2hDLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxLQUFLLFVBQVUsQ0FBQyxPQUFPLEVBQUU7Z0JBQ3JELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDMUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ3hDO2dCQUNELElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssVUFBVSxDQUFDLE9BQU8sRUFBRTtvQkFDL0QsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNyQyxPQUFPLFVBQVUsQ0FBQyxPQUFPLENBQUM7aUJBQzdCO3FCQUNJO29CQUNELE9BQU8sVUFBVSxDQUFDLE9BQU8sQ0FBQztpQkFDN0I7YUFDSjtpQkFDSTtnQkFDRCxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztnQkFDL0UsT0FBTyxVQUFVLENBQUMsTUFBTSxDQUFDO2FBQzVCO1NBQ0osQ0FBQztLQUNMO0NBQ0o7QUFDRCxBQUFPLE1BQU0sU0FBUyxTQUFTLE9BQU8sQ0FBQztJQUNuQyxXQUFXLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUU7UUFDdkMsS0FBSyxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztRQUNyQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsS0FBSyxHQUFHLFVBQVUsS0FBSyxFQUFFLElBQUksRUFBRTtZQUNoQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUM3QyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDdkIsS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDL0IsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEtBQUssVUFBVSxDQUFDLE9BQU8sRUFBRTtnQkFDckQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUMzQyxJQUFJLEtBQUssR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUMzRCxJQUFJLEtBQUssS0FBSyxVQUFVLENBQUMsT0FBTyxFQUFFO3dCQUM5QixLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ3JDLE9BQU8sVUFBVSxDQUFDLE9BQU8sQ0FBQztxQkFDN0I7aUJBQ0o7YUFDSjtpQkFDSTtnQkFDRCxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQzthQUNsRjtZQUNELE9BQU8sVUFBVSxDQUFDLE1BQU0sQ0FBQztTQUM1QixDQUFDO0tBQ0w7Q0FDSixBQUNEOztBQzdITyxNQUFNLFNBQVMsU0FBUyxVQUFVLENBQUM7SUFDdEMsV0FBVyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEdBQUcsSUFBSSxFQUFFO1FBQzlDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNaLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7UUFDZCxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0tBQ3hCO0lBQ0QsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUU7UUFDaEIsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNoRCxJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sS0FBSyxXQUFXLEVBQUU7WUFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUs7Z0JBQ3ZCLE9BQU8sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDNUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztTQUNyQzthQUNJO1lBQ0QsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3hDO1FBQ0QsSUFBSSxJQUFJLEdBQUcsT0FBTyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDbEMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUMxQixJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLEVBQUU7WUFDbEMsS0FBSyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUM7WUFDdkIsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1NBQ3JCO2FBQ0k7WUFDRCxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztTQUNsQjtRQUNELElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7WUFDcEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDbkU7S0FDSjtDQUNKLEFBQ0Q7O0FDdENPLE1BQU0sS0FBSyxDQUFDO0lBQ2YsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFO1FBQ3hCLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDOztRQUVwQixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSTtZQUNmLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUc7Z0JBQ2IsR0FBRyxFQUFFLElBQUk7Z0JBQ1QsR0FBRyxFQUFFLENBQUMsSUFBSTthQUNiLENBQUM7U0FDTCxDQUFDLENBQUM7O1FBRUgsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUk7WUFDZCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSTtnQkFDZixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRTtvQkFDM0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUM3QjtnQkFDRCxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRTtvQkFDM0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUM3QjthQUNKLENBQUMsQ0FBQztTQUNOLENBQUMsQ0FBQzs7UUFFSCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3hCLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDakMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUk7Z0JBQ2YsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO2dCQUN2RSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQzthQUNuQyxDQUFDLENBQUM7U0FDTjtRQUNELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0tBQ3RCO0lBQ0QsTUFBTSxHQUFHO1FBQ0wsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztLQUN4QjtJQUNELEdBQUcsR0FBRztRQUNGLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztRQUNyQixPQUFPLENBQUMsUUFBUSxFQUFFO1lBQ2QsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJO2dCQUN4QixRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQzthQUN6QixDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7U0FDckI7UUFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDdEM7SUFDRCxlQUFlLEdBQUc7UUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUs7WUFDeEIsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBQ25CLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUNuQixJQUFJLE9BQU8sQ0FBQztZQUNaLElBQUksUUFBUSxDQUFDOztZQUViLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSztnQkFDN0IsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDbEIsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDakIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJO29CQUNwQixTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzNELFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ25DLENBQUMsQ0FBQztnQkFDSCxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMxQyxDQUFDLENBQUM7WUFDSCxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQzFDLFFBQVEsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3RDLENBQUMsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1lBQ3RCLENBQUMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQztTQUN2QyxDQUFDLENBQUM7S0FDTjtJQUNELGFBQWEsR0FBRztRQUNaLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSztZQUM3QixJQUFJLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7O1lBRWxELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSTtnQkFDbkIsSUFBSSxDQUFDLENBQUMsUUFBUSxLQUFLLENBQUMsRUFBRTtvQkFDbEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJO3dCQUNwQixnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ2xDLENBQUMsQ0FBQztpQkFDTjthQUNKLENBQUMsQ0FBQzs7WUFFSCxJQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFO2dCQUNmLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSTtvQkFDcEIsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDbkYsQ0FBQyxDQUFDO2FBQ047O1lBRUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJO2dCQUNwQixJQUFJLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxLQUFLO29CQUNqRCxPQUFPLElBQUksR0FBRyxJQUFJLENBQUM7aUJBQ3RCLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ04sSUFBSSxJQUFJLEdBQUcsR0FBRyxHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQzs7Z0JBRTVDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRTtvQkFDZixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO29CQUNaLENBQUMsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO29CQUNuQixDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztpQkFDZjtxQkFDSTtvQkFDRCxDQUFDLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztpQkFDckI7YUFDSixDQUFDLENBQUM7U0FDTixDQUFDLENBQUM7S0FDTjtDQUNKLEFBQ0Q7O0FDN0dPLE1BQU0sR0FBRyxDQUFDO0lBQ2IsV0FBVyxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUU7UUFDMUQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7S0FDNUI7SUFDRCxZQUFZLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFO1FBQ3pDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUs7WUFDaEIsSUFBSSxDQUFDLENBQUMsRUFBRSxLQUFLLEtBQUssQ0FBQyxFQUFFLEVBQUU7Z0JBQ25CLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDcEQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNsRCxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO2FBQ3BHO1NBQ0osQ0FBQyxDQUFDO0tBQ047SUFDRCxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRTtRQUNuQixJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7UUFDZCxLQUFLLElBQUksS0FBSyxJQUFJLFNBQVMsRUFBRTtZQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1NBQy9CO1FBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUs7WUFDaEIsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUN0QixPQUFPLENBQUMsQ0FBQzthQUNaO1lBQ0QsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUN0QixPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQ2I7WUFDRCxPQUFPLENBQUMsQ0FBQztTQUNaLENBQUMsQ0FBQztRQUNILE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFDRCxZQUFZLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFO1FBQ2hELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ2xDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBQ3ZCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN4QyxJQUFJLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxRQUFRLEVBQUU7b0JBQ2xELElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7aUJBQ2xFO2FBQ0o7WUFDRCxLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUU7Z0JBQzdCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQztnQkFDYixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDeEMsSUFBSSxJQUFJLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDekU7Z0JBQ0QsUUFBUSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3ZDO1NBQ0o7UUFDRCxPQUFPLElBQUksQ0FBQztLQUNmO0lBQ0QsUUFBUSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUU7UUFDcEIsSUFBSSxNQUFNLEdBQUcsRUFBRSxFQUFFLEdBQUcsR0FBRyxJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQztRQUNyQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNyQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDbEMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFO29CQUMzQixHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUM3QjtnQkFDRCxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUU7b0JBQzNCLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQzdCO2FBQ0o7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUNSLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixHQUFHLEVBQUUsR0FBRztnQkFDUixHQUFHLEVBQUUsR0FBRztnQkFDUixLQUFLLEVBQUUsR0FBRyxHQUFHLEdBQUc7YUFDbkIsQ0FBQyxDQUFDO1NBQ047UUFDRCxBQUFDO1FBQ0QsT0FBTyxNQUFNLENBQUM7S0FDakI7SUFDRCxRQUFRLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRTtRQUN2RCxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RFLElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3BFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ2xDLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDVixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDWixJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7WUFDbkIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ3ZELE9BQU8sQ0FBQyxHQUFHLFFBQVEsRUFBRTtnQkFDakIsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNyQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDekMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdEIsQ0FBQyxFQUFFLENBQUM7YUFDUDtZQUNELEtBQUssSUFBSSxLQUFLLElBQUksT0FBTyxFQUFFO2dCQUN2QixJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEVBQUU7b0JBQ3RCLEdBQUcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3JCLFNBQVMsR0FBRyxLQUFLLENBQUM7aUJBQ3JCO2FBQ0o7WUFDRCxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsU0FBUyxDQUFDO1NBQ25DO1FBQ0QsT0FBTyxJQUFJLENBQUM7S0FDZjtDQUNKLEFBQ0Q7O0FDbkdPLE1BQU0sTUFBTSxDQUFDO0lBQ2hCLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFO0tBQ3hCO0NBQ0o7QUFDRCxBQUFPLE1BQU0sTUFBTSxDQUFDO0lBQ2hCLFdBQVcsQ0FBQyxHQUFHLEVBQUU7S0FDaEI7Q0FDSjtBQUNELEFBQU8sTUFBTSxpQkFBaUIsQ0FBQztJQUMzQixPQUFPLElBQUksQ0FBQyxDQUFDLEVBQUU7UUFDWCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ3pCO0lBQ0QsT0FBTyxPQUFPLENBQUMsQ0FBQyxFQUFFO1FBQ2QsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pDO0lBQ0QsT0FBTyxJQUFJLENBQUMsQ0FBQyxFQUFFO1FBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLE9BQU8sR0FBRyxDQUFDO0tBQ2Q7Q0FDSjtBQUNELEFBQUM7QUFDRCxBQUFPLE1BQU0sZUFBZSxDQUFDO0lBQ3pCLE9BQU8sSUFBSSxDQUFDLEtBQUssRUFBRTtRQUNmLElBQUksR0FBRyxHQUFHLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3QixPQUFPLEdBQUcsQ0FBQztLQUNkO0lBQ0QsT0FBTyxPQUFPLENBQUMsS0FBSyxFQUFFO1FBQ2xCLElBQUksR0FBRyxHQUFHLGlCQUFpQixDQUFDLE9BQU8sQ0FBQztRQUNwQyxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDeEM7SUFDRCxPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUU7UUFDZixPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUN6RDtDQUNKO0FBQ0QsQUFBTyxTQUFTLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7SUFDakMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDekMsT0FBTyxDQUFDLENBQUM7Q0FDWjtBQUNELEFBQU8sU0FBUyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0lBQzlCLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsQyxPQUFPLENBQUMsQ0FBQztDQUNaO0FBQ0QsQUFBTyxTQUFTLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7SUFDL0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbEIsT0FBTyxDQUFDLENBQUM7Q0FDWjtBQUNELEFBQU8sU0FBUyxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0lBQ3BDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM1QyxPQUFPLENBQUMsQ0FBQztDQUNaLEFBQ0Q7O0FDbERPLE1BQU0sT0FBTyxDQUFDO0lBQ2pCLFdBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsY0FBYyxHQUFHLE1BQU0sRUFBRTtRQUM5RCxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFDakIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDM0I7SUFDRCxLQUFLLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxHQUFHLEdBQUcsRUFBRTtRQUMxQyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztRQUNqQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ2pDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN0RCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDWixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQzVCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2IsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM1RCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEtBQUs7Z0JBQ3BELElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRTtvQkFDVCxNQUFNLEdBQUcsR0FBRyxDQUFDO29CQUNiLEdBQUcsR0FBRyxDQUFDLENBQUM7aUJBQ1g7YUFDSixDQUFDLENBQUM7WUFDSCxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3pFLElBQUksT0FBTyxLQUFLLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDckMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ2xCO1lBQ0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN2QyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQy9CLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNyQixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7U0FDdEI7S0FDSjtJQUNELFFBQVEsQ0FBQyxJQUFJLEVBQUU7UUFDWCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDOUM7SUFDRCxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtRQUNmLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNoQixJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUNkLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3JDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDbEI7UUFDRCxLQUFLLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDbEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDbkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDdEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDekIsS0FBSyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUU7Z0JBQ2hELElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMxQixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2hDO1NBQ0o7UUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN6QixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMxRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNoRixLQUFLLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFO1lBQ2hELElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFD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
