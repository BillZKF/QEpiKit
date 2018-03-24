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
function categoriesToVector(data) {
    let values = [];
    let keys = {};
    let matrix;
    let idx = 0;
    data.forEach((x) => {
        let key = x + '';
        if (!(key in keys)) {
            values.push(key);
            keys[key] = values.length - 1;
        }
    });
    matrix = data.map((y) => {
        let z = values.map((v) => { return 0; });
        let idx = keys[y + ''];
        z[idx] = 1;
        return z;
    });
    return { labels: keys, data: matrix };
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
                patch.params = { groupName: patch.name };
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
                    for (let p in cfg.entities[entity].params) {
                        //copy to outside for external references
                        cfg.entities[entity][p] = cfg.entities[entity].params[p].assign;
                    }
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
                    cfg.entities[param.group].params[param.name].assign = val;
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

class Evolve extends Experiment {
    constructor(environment, setup) {
        super(environment, setup);
        this.type = 'evolve';
        this.population = [];
        this.mutateRate = 0.5;
        this.target = setup.evolution.target;
        for (let i = 0; i < this.setup.experiment.size; i++) {
            this.population[i] = { score: 1e16, params: [] };
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
        this.ranges = this.setup.experiment.params.map((d) => { return d.distribution.params; });
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
        let children;
        let prevStart = Math.min(0, run - cfg.experiment.size);
        this.population.sort(this.ascSort);
        this.population = this.population.slice(0, cfg.experiment.size);
        children = this.mate(Math.min(5, Math.max(2, Math.floor(this.population.length * 0.333))));
        this.mutate(this.population, 1);
        this.genLog.push(this.genAvg(this.experimentLog.slice(prevStart, run), cfg));
        this.genLog[this.genLog.length - 1].order = this.genLog.length - 1;
        this.genLog[this.genLog.length - 1].score = this.scoreMean(this.population);
        this.genLog[this.genLog.length - 1].scoreSD = this.scoreSD(this.population);
        this.population.splice(this.population.length - children.length - 1, children.length);
        this.population = this.population.concat(children);
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
        for (let i = 1; i < population.length; i++) {
            if (this.rng.random() > chance) {
                continue;
            }
            let best = population[0].params;
            let current = population[i].params;
            for (let p = 0; p < current.length; p++) {
                let scaledB = scale(best[p].assign, this.ranges[p][0], this.ranges[p][1] - this.ranges[p][0]);
                let scaledC = scale(current[p].assign, this.ranges[p][0], this.ranges[p][1] - this.ranges[p][0]);
                let diff = scaledB - scaledC;
                if (diff === 0) {
                    scaledC += this.rng.normal(0, 1e-8) * this.mutateRate;
                }
                else {
                    scaledC += diff * this.mutateRate;
                }
                //clamp to uniform min and max.
                current[p].assign = scaleInv(Math.max(this.ranges[p][0], Math.min(scaledC, this.ranges[p][1])), this.ranges[p][0], this.ranges[p][1] - this.ranges[p][0]);
            }
        }
    }
    mate(parents) {
        let numParams = this.population[0].params.length;
        let numChildren = Math.max(Math.min(10, Math.max(2, Math.floor(this.population.length * 0.333))));
        let children = [];
        for (let i = 0; i < numChildren; i++) {
            let child = { params: [], score: 0 };
            let p1 = Math.floor(this.rng.random() * parents);
            let p2 = Math.floor(this.rng.random() * parents);
            if (p1 === p2) {
                p2 = p2 === 0 ? parents - 1 : p2 - 1;
            }
            let split = Math.floor(this.rng.random() * numParams);
            child.params = [].concat(this.population[p1].params.slice(0, split), this.population[p2].params.slice(split, numParams));
            children.push(child);
        }
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
    constructor(data, labels, hiddenNum, activationType = 'tanh', costType = 'mse') {
        this.iter = 0;
        this.correct = 0;
        this.hiddenNum = hiddenNum;
        this.learnRate = 0.01;
        this.actFn = Network.activationMethods[activationType];
        this.derFn = Network.derivativeMethods[activationType];
        this.costFn = Network.costMethods[costType];
        this.init(data, labels);
    }
    learn(iterations, data, labels) {
        for (let i = 0; i < iterations; i++) {
            let randIdx = Math.floor(Math.random() * data.length);
            this.iter++;
            this.forward(data[randIdx]);
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
    evaluate(data, labels) {
        let correct = 0;
        let loss = 0;
        let accuracy = 0;
        for (let i = 0; i < data.length; i++) {
            let y = this.classify(data[i]);
            let correctIdx = -1;
            let maxGuessIdx = -1;
            let maxGuess = -100;
            let guess;
            labels[i].forEach((x, idx) => {
                if (x > 0) {
                    correctIdx = idx;
                }
                if (y[idx] >= maxGuess) {
                    maxGuessIdx = idx;
                    maxGuess = y[idx];
                }
            });
            if (correctIdx === maxGuessIdx) {
                correct++;
            }
            guess = y[correctIdx]; //isNaN(y[correctIdx]) ? Math.random() : y[correctIdx];
            loss += Math.abs(this.costFn(labels[i][correctIdx], guess)); // how far off?  
        }
        accuracy = correct / data.length;
        return { loss: loss, correct: correct, examples: data.length, accuracy: accuracy };
    }
    copyNetwork(other) {
        this.der = JSON.parse(JSON.stringify(other.der));
        this.values = JSON.parse(JSON.stringify(other.values));
        this.weights = JSON.parse(JSON.stringify(other.weights));
        this.weightChanges = JSON.parse(JSON.stringify(other.weightChanges));
        this.totals = JSON.parse(JSON.stringify(other.totals));
        this.derTotals = JSON.parse(JSON.stringify(other.derTotals));
        this.biases = JSON.parse(JSON.stringify(other.biases));
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
    update(input, step) {
        this.forward(input);
    }
    backward(labels) {
        for (let wg = this.weights.length - 1; wg >= 0; wg--) {
            let srcVals = wg;
            let dstVals = wg + 1;
            for (let src = 0; src < this.weights[wg].length; src++) {
                let err = 0;
                for (let dst = 0; dst < this.weights[wg][src].length; dst++) {
                    if (wg === this.weights.length - 1) {
                        err += this.costFn(labels[dst], this.values[dstVals][dst]);
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
    SeLU: function (x) {
        let alpha = 1.6732632423543772848170429916717;
        let scale = 1.0507009873554804934193349852946;
        let step = x >= 0 ? x : (alpha * Math.exp(x) - 1);
        return scale * x;
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
    SeLU: function (value) {
        let alpha = 1.6732632423543772848170429916717;
        let scale = 1.0507009873554804934193349852946;
        return value >= 0 ? value : Network.activationMethods.SeLU(value) + alpha;
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
    mse: function (target, guess) {
        return target - guess;
    },
    abs: function () {
    },
    crossEntropy: function (target, guess) {
        if (target === 1) {
            return -Math.log(guess);
        }
        else {
            return -Math.log(1 - guess);
        }
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

class TaskDecomposer {
    constructor(exampleInputs, exampleTasks, taskLibrary, networkParams, rng = new RNGBurtle(Math.random())) {
        this.trainingSummary = [];
        this.training = exampleInputs;
        this.labels = exampleTasks;
        this.taskLibrary = taskLibrary;
        this.networkParams = networkParams;
        this.rng = rng;
    }
    train(samples = 50, batches = 25, popSize = 25) {
        let costFns = Object.keys(Network.costMethods);
        let actFns = Object.keys(Network.activationMethods);
        let topNet;
        let networks = [];
        let testResults = [];
        let summary = [];
        for (let i = 0; i < batches; i++) {
            let topAccuracy = -100;
            let bottomAccuracy = 100;
            let sumAcc = 0;
            let lowestLoss = 1e9;
            for (let j = 0; j < popSize; j++) {
                let act = actFns[Math.floor(this.rng.randRange(0, actFns.length))];
                let cost = costFns[Math.floor(this.rng.randRange(0, costFns.length))];
                let hidden = this.networkParams.hidden.map((layer) => {
                    return Math.floor(this.rng.randRange(layer[0], layer[1]));
                });
                if (i === 0) {
                    networks[j] = new Network(this.training, this.labels, hidden, act, cost);
                }
                else {
                    networks[j] = new Network(this.training, this.labels, hidden, act, cost);
                    if (Math.random() < 0.75) {
                        networks[j].copyNetwork(topNet);
                        networks[j].actFn = topNet.actFn;
                        networks[j].derFn = topNet.derFn;
                        networks[j].costFn = topNet.costFn;
                        networks[j].iter = topNet.iter;
                    }
                }
                networks[j].learn(samples, this.training, this.labels);
                testResults[j] = networks[j].evaluate(this.training, this.labels);
                if (testResults[j].accuracy > topAccuracy) {
                    topAccuracy = testResults[j].accuracy;
                    topNet = networks[j];
                }
                if (testResults[j].loss < lowestLoss) {
                    lowestLoss = testResults[j].loss;
                }
                if (testResults[j].accuracy < bottomAccuracy) {
                    bottomAccuracy = testResults[j].accuracy;
                }
                sumAcc += testResults[j].accuracy;
            }
            summary[i] = { lowestLoss: lowestLoss, meanAccuracy: sumAcc / popSize, mostAcc: topAccuracy, leastAcc: bottomAccuracy };
        }
        this.trainingSummary = summary;
        this.bestNet = topNet;
    }
    liveTrain(input, labels, callback) {
        //console.log(input, labels)
        let result = this.bestNet.classify(input);
        let max = jStat.max(result);
        let labelIdx = result.indexOf(max);
        let label = '';
        for (let key in labels) {
            if (labels[key] === labelIdx) {
                label = key;
            }
        }
        callback(label); //.then((trueResult) => {
        //this.bestNet.backward(trueResult);
        //this.bestNet.updateWeights();
        //this.bestNet.resetTotals();
        //this.training.push(input);
        //this.labels.push(trueResult);
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
	Evolve: Evolve,
	HybridAutomata: HybridAutomata,
	kMean: kMean,
	KNN: KNN,
	Network: Network,
	QLearner: QLearner,
	TaskDecomposer: TaskDecomposer,
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
	categoriesToVector: categoriesToVector,
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

let QEpiKit = qepikit;
for (let key in QEpiKit) {
    if (key == 'version') {
        console.log(QEpiKit[key]);
    }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicWVwaWtpdC5qcyIsInNvdXJjZXMiOlsiZGlzdC9yZXNvdXJjZS5qcyIsImRpc3QvdXRpbHMuanMiLCJkaXN0L1FDb21wb25lbnQuanMiLCJkaXN0L2JkaS5qcyIsImRpc3QvYmVoYXZpb3JUcmVlLmpzIiwiZGlzdC9jb21wYXJ0bWVudC5qcyIsImRpc3QvY29udGFjdFBhdGNoLmpzIiwiZGlzdC9lbnZpcm9ubWVudC5qcyIsImRpc3QvZXBpLmpzIiwiZGlzdC9ldmVudHMuanMiLCJkaXN0L3N0YXRlTWFjaGluZS5qcyIsImRpc3QvcmFuZG9tLmpzIiwiZGlzdC9leHBlcmltZW50LmpzIiwiZGlzdC9nZW5ldGljLmpzIiwiZGlzdC9ldm9sdmUuanMiLCJkaXN0L2hhLmpzIiwiZGlzdC9odG4uanMiLCJkaXN0L21jLmpzIiwiZGlzdC9rbWVhbi5qcyIsImRpc3Qva25uLmpzIiwiZGlzdC9tYXRoLmpzIiwiZGlzdC9uZXR3b3JrLmpzIiwiZGlzdC9RTGVhcm5lci5qcyIsImRpc3QvdGFza0RlY29tcG9zZXIuanMiLCJkaXN0L3JlZ3Jlc3Npb24uanMiLCJkaXN0L1VTeXMuanMiLCJkaXN0L21haW4uanMiLCJkaXN0L1FFcGlLaXQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIFJlc291cmNlIHtcclxuICAgIGNvbnN0cnVjdG9yKHRlbXBsYXRlKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gMDtcclxuICAgICAgICB0aGlzLmF2YWlsYWJsZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy51c2VVcHBlckxpbWl0ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy51c2VMb3dlckxpbWl0ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5hZGRlZCA9IDA7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVkID0gMDtcclxuICAgICAgICB0aGlzLmluY29taW5nVHJhbnMgPSAwO1xyXG4gICAgICAgIHRoaXMub3V0Z29pbmdUcmFucyA9IDA7XHJcbiAgICAgICAgdGhpcy5sYWJlbCA9IHRlbXBsYXRlLmxhYmVsO1xyXG4gICAgICAgIHRoaXMudW5pdHMgPSB0ZW1wbGF0ZS51bml0cztcclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSB0ZW1wbGF0ZS5jdXJyZW50IHx8IDA7XHJcbiAgICAgICAgdGhpcy5hdmFpbGFibGUgPSB0ZW1wbGF0ZS5hdmFpbGFibGUgfHwgdHJ1ZTtcclxuICAgICAgICB0aGlzLnVzZVVwcGVyTGltaXQgPSB0ZW1wbGF0ZS51c2VVcHBlckxpbWl0IHx8IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubG93ZXJMaW1pdCA9IHRlbXBsYXRlLnVzZUxvd2VyTGltaXQgfHwgZmFsc2U7XHJcbiAgICAgICAgaWYgKHRoaXMudXNlTG93ZXJMaW1pdCkge1xyXG4gICAgICAgICAgICB0aGlzLnVwcGVyTGltaXQgPSB0ZW1wbGF0ZS51cHBlckxpbWl0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy51c2VMb3dlckxpbWl0KSB7XHJcbiAgICAgICAgICAgIHRoaXMubG93ZXJMaW1pdCA9IHRlbXBsYXRlLmxvd2VyTGltaXQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgbG93ZXJMaW1pdENCKHF1YW50aXR5KSB7XHJcbiAgICAgICAgdGhpcy5hdmFpbGFibGUgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIHVwcGVyTGltaXRDQihxdWFudGl0eSkge1xyXG4gICAgICAgIHRoaXMuYXZhaWxhYmxlID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZW1vdmUocXVhbnRpdHkpIHtcclxuICAgICAgICBpZiAodGhpcy5hdmFpbGFibGUpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMudXNlTG93ZXJMaW1pdCB8fCAodGhpcy51c2VVcHBlckxpbWl0ICYmIHRoaXMuY3VycmVudCA+PSB0aGlzLnVwcGVyTGltaXQpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZ2FwID0gdGhpcy5sb3dlckxpbWl0IC0gKHRoaXMuY3VycmVudCAtIHF1YW50aXR5KTtcclxuICAgICAgICAgICAgICAgIGlmIChnYXAgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcXVhbnRpdHkgPSBxdWFudGl0eSAtIGdhcDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvd2VyTGltaXRDQihxdWFudGl0eSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVkID0gdGhpcy5yZW1vdmVkIHx8IDA7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCAtPSBxdWFudGl0eTtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVkICs9IHF1YW50aXR5O1xyXG4gICAgICAgICAgICB0aGlzLm91dGdvaW5nVHJhbnMgKz0gMTtcclxuICAgICAgICAgICAgcmV0dXJuIHF1YW50aXR5O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICAgIGFkZChxdWFudGl0eSkge1xyXG4gICAgICAgIGlmICh0aGlzLmF2YWlsYWJsZSB8fCAodGhpcy51c2VMb3dlckxpbWl0ICYmIHRoaXMuY3VycmVudCA8PSB0aGlzLmxvd2VyTGltaXQpKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnVzZVVwcGVyTGltaXQpIHtcclxuICAgICAgICAgICAgICAgIGxldCBleGNlc3MgPSAodGhpcy5jdXJyZW50ICsgcXVhbnRpdHkpIC0gdGhpcy51cHBlckxpbWl0O1xyXG4gICAgICAgICAgICAgICAgaWYgKGV4Y2VzcyA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBxdWFudGl0eSA9IHF1YW50aXR5IC0gZXhjZXNzO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBwZXJMaW1pdENCKHF1YW50aXR5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmFkZGVkID0gdGhpcy5hZGRlZCB8fCAwO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQgKz0gcXVhbnRpdHk7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkZWQgKz0gcXVhbnRpdHk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5jb21pbmdUcmFucyArPSAxO1xyXG4gICAgICAgICAgICByZXR1cm4gcXVhbnRpdHk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgdHJhbnNmZXIocmVzb3VyY2VCLCBxdWFudGl0eSkge1xyXG4gICAgICAgIHF1YW50aXR5ID0gdGhpcy5yZW1vdmUocXVhbnRpdHkpO1xyXG4gICAgICAgIHJlc291cmNlQi5hZGQocXVhbnRpdHkpO1xyXG4gICAgfVxyXG4gICAgZ2l2ZShhZ2VudCwgcXVhbnRpdHkpIHtcclxuICAgICAgICBxdWFudGl0eSA9IHRoaXMucmVtb3ZlKHF1YW50aXR5KTtcclxuICAgICAgICBhZ2VudFt0aGlzLmxhYmVsXSA9IGFnZW50W3RoaXMubGFiZWxdIHx8IDA7XHJcbiAgICAgICAgYWdlbnRbdGhpcy5sYWJlbF0gKz0gcXVhbnRpdHk7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmVzb3VyY2UuanMubWFwIiwiaW1wb3J0IHsgUmVzb3VyY2UgfSBmcm9tICcuL3Jlc291cmNlJztcclxuZXhwb3J0IGNvbnN0IFNVQ0NFU1MgPSAxO1xyXG5leHBvcnQgY29uc3QgRkFJTEVEID0gMjtcclxuZXhwb3J0IGNvbnN0IFJVTk5JTkcgPSAzO1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ1NWVVJJKGRhdGEpIHtcclxuICAgIHZhciBkYXRhU3RyaW5nO1xyXG4gICAgdmFyIFVSSTtcclxuICAgIHZhciBjc3ZDb250ZW50ID0gXCJkYXRhOnRleHQvY3N2O2NoYXJzZXQ9dXRmLTgsXCI7XHJcbiAgICB2YXIgY3N2Q29udGVudEFycmF5ID0gW107XHJcbiAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGluZm9BcnJheSkge1xyXG4gICAgICAgIGRhdGFTdHJpbmcgPSBpbmZvQXJyYXkuam9pbihcIixcIik7XHJcbiAgICAgICAgY3N2Q29udGVudEFycmF5LnB1c2goZGF0YVN0cmluZyk7XHJcbiAgICB9KTtcclxuICAgIGNzdkNvbnRlbnQgKz0gY3N2Q29udGVudEFycmF5LmpvaW4oXCJcXG5cIik7XHJcbiAgICBVUkkgPSBlbmNvZGVVUkkoY3N2Q29udGVudCk7XHJcbiAgICByZXR1cm4gVVJJO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBhcnJheUZyb21SYW5nZShzdGFydCwgZW5kLCBzdGVwKSB7XHJcbiAgICB2YXIgcmFuZ2UgPSBbXTtcclxuICAgIHZhciBpID0gc3RhcnQ7XHJcbiAgICB3aGlsZSAoaSA8IGVuZCkge1xyXG4gICAgICAgIHJhbmdlLnB1c2goaSk7XHJcbiAgICAgICAgaSArPSBzdGVwO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJhbmdlO1xyXG59XHJcbi8qKlxyXG4qIHNodWZmbGUgLSBmaXNoZXIteWF0ZXMgc2h1ZmZsZVxyXG4qL1xyXG5leHBvcnQgZnVuY3Rpb24gc2h1ZmZsZShhcnJheSwgcm5nKSB7XHJcbiAgICB2YXIgY3VycmVudEluZGV4ID0gYXJyYXkubGVuZ3RoLCB0ZW1wb3JhcnlWYWx1ZSwgcmFuZG9tSW5kZXg7XHJcbiAgICAvLyBXaGlsZSB0aGVyZSByZW1haW4gZWxlbWVudHMgdG8gc2h1ZmZsZS4uLlxyXG4gICAgd2hpbGUgKDAgIT09IGN1cnJlbnRJbmRleCkge1xyXG4gICAgICAgIC8vIFBpY2sgYSByZW1haW5pbmcgZWxlbWVudC4uLlxyXG4gICAgICAgIHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vcihybmcucmFuZG9tKCkgKiBjdXJyZW50SW5kZXgpO1xyXG4gICAgICAgIGN1cnJlbnRJbmRleCAtPSAxO1xyXG4gICAgICAgIC8vIEFuZCBzd2FwIGl0IHdpdGggdGhlIGN1cnJlbnQgZWxlbWVudC5cclxuICAgICAgICB0ZW1wb3JhcnlWYWx1ZSA9IGFycmF5W2N1cnJlbnRJbmRleF07XHJcbiAgICAgICAgYXJyYXlbY3VycmVudEluZGV4XSA9IGFycmF5W3JhbmRvbUluZGV4XTtcclxuICAgICAgICBhcnJheVtyYW5kb21JbmRleF0gPSB0ZW1wb3JhcnlWYWx1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBhcnJheTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVVVUlEKCkge1xyXG4gICAgLy8gaHR0cDovL3d3dy5icm9vZmEuY29tL1Rvb2xzL01hdGgudXVpZC5odG1cclxuICAgIHZhciBjaGFycyA9ICcwMTIzNDU2Nzg5QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eicuc3BsaXQoJycpO1xyXG4gICAgdmFyIHV1aWQgPSBuZXcgQXJyYXkoMzYpO1xyXG4gICAgdmFyIHJuZCA9IDAsIHI7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM2OyBpKyspIHtcclxuICAgICAgICBpZiAoaSA9PSA4IHx8IGkgPT0gMTMgfHwgaSA9PSAxOCB8fCBpID09IDIzKSB7XHJcbiAgICAgICAgICAgIHV1aWRbaV0gPSAnLSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGkgPT0gMTQpIHtcclxuICAgICAgICAgICAgdXVpZFtpXSA9ICc0JztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChybmQgPD0gMHgwMilcclxuICAgICAgICAgICAgICAgIHJuZCA9IDB4MjAwMDAwMCArIChNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwKSB8IDA7XHJcbiAgICAgICAgICAgIHIgPSBybmQgJiAweGY7XHJcbiAgICAgICAgICAgIHJuZCA9IHJuZCA+PiA0O1xyXG4gICAgICAgICAgICB1dWlkW2ldID0gY2hhcnNbKGkgPT0gMTkpID8gKHIgJiAweDMpIHwgMHg4IDogcl07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHV1aWQuam9pbignJyk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGFsd2F5cyhhKSB7XHJcbiAgICBpZiAoYSA9PT0gU1VDQ0VTUykge1xyXG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZXZlbnR1YWxseShhKSB7XHJcbiAgICBpZiAoYSA9PT0gU1VDQ0VTUykge1xyXG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIFJVTk5JTkc7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFsVG8oYSwgYikge1xyXG4gICAgaWYgKGEgPT09IGIpIHtcclxuICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIG5vdChyZXN1bHQpIHtcclxuICAgIHZhciBuZXdSZXN1bHQ7XHJcbiAgICBpZiAocmVzdWx0ID09PSBTVUNDRVNTKSB7XHJcbiAgICAgICAgbmV3UmVzdWx0ID0gRkFJTEVEO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAocmVzdWx0ID09PSBGQUlMRUQpIHtcclxuICAgICAgICBuZXdSZXN1bHQgPSBTVUNDRVNTO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ld1Jlc3VsdDtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gbm90RXF1YWxUbyhhLCBiKSB7XHJcbiAgICBpZiAoYSAhPT0gYikge1xyXG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZ3QoYSwgYikge1xyXG4gICAgaWYgKGEgPiBiKSB7XHJcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBndEVxKGEsIGIpIHtcclxuICAgIGlmIChhID49IGIpIHtcclxuICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGx0KGEsIGIpIHtcclxuICAgIGlmIChhIDwgYikge1xyXG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gbHRFcShhLCBiKSB7XHJcbiAgICBpZiAoYSA8PSBiKSB7XHJcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBoYXNQcm9wKGEsIGIpIHtcclxuICAgIGEgPSBhIHx8IGZhbHNlO1xyXG4gICAgaWYgKGEgPT09IGIpIHtcclxuICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGluUmFuZ2UoYSwgYikge1xyXG4gICAgaWYgKGIgPj0gYVswXSAmJiBiIDw9IGFbMV0pIHtcclxuICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIG5vdEluUmFuZ2UoYSwgYikge1xyXG4gICAgaWYgKGIgPj0gYVswXSAmJiBiIDw9IGFbMV0pIHtcclxuICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGdldE1hdGNoZXJTdHJpbmcoY2hlY2spIHtcclxuICAgIHZhciBzdHJpbmcgPSBudWxsO1xyXG4gICAgc3dpdGNoIChjaGVjaykge1xyXG4gICAgICAgIGNhc2UgZXF1YWxUbzpcclxuICAgICAgICAgICAgc3RyaW5nID0gXCJlcXVhbCB0b1wiO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIG5vdEVxdWFsVG86XHJcbiAgICAgICAgICAgIHN0cmluZyA9IFwibm90IGVxdWFsIHRvXCI7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgZ3Q6XHJcbiAgICAgICAgICAgIHN0cmluZyA9IFwiZ3JlYXRlciB0aGFuXCI7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgZ3RFcTpcclxuICAgICAgICAgICAgc3RyaW5nID0gXCJncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG9cIjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBsdDpcclxuICAgICAgICAgICAgc3RyaW5nID0gXCJsZXNzIHRoYW5cIjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBsdEVxOlxyXG4gICAgICAgICAgICBzdHJpbmcgPSBcImxlc3MgdGhhbiBvciBlcXVhbCB0b1wiO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIGhhc1Byb3A6XHJcbiAgICAgICAgICAgIHN0cmluZyA9IFwiaGFzIHRoZSBwcm9wZXJ0eVwiO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgc3RyaW5nID0gXCJub3QgYSBkZWZpbmVkIG1hdGNoZXJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc3RyaW5nO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRNaW4ocGFyYW1zLCBrZXlzKSB7XHJcbiAgICBmb3IgKHZhciBwYXJhbSBpbiBwYXJhbXMpIHtcclxuICAgICAgICBpZiAodHlwZW9mIChrZXlzKSAhPT0gJ3VuZGVmaW5lZCcgJiYga2V5cy5pbmRleE9mKHBhcmFtKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgcGFyYW1zW3BhcmFtXS5jdXJyZW50ID0gcGFyYW1zW3BhcmFtXS52YWx1ZSAtIHBhcmFtc1twYXJhbV0uZXJyb3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiAoa2V5cykgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHBhcmFtc1twYXJhbV0uY3VycmVudCA9IHBhcmFtc1twYXJhbV0udmFsdWUgLSBwYXJhbXNbcGFyYW1dLmVycm9yO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gc2V0TWF4KHBhcmFtcywga2V5cykge1xyXG4gICAgZm9yICh2YXIgcGFyYW0gaW4gcGFyYW1zKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiAoa2V5cykgIT09ICd1bmRlZmluZWQnICYmIGtleXMuaW5kZXhPZihwYXJhbSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHBhcmFtc1twYXJhbV0uY3VycmVudCA9IHBhcmFtc1twYXJhbV0udmFsdWUgKyBwYXJhbXNbcGFyYW1dLmVycm9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgKGtleXMpID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBwYXJhbXNbcGFyYW1dLmN1cnJlbnQgPSBwYXJhbXNbcGFyYW1dLnZhbHVlICsgcGFyYW1zW3BhcmFtXS5lcnJvcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFN0YW5kYXJkKHBhcmFtcywga2V5cykge1xyXG4gICAgZm9yICh2YXIgcGFyYW0gaW4gcGFyYW1zKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiAoa2V5cykgIT09ICd1bmRlZmluZWQnICYmIGtleXMuaW5kZXhPZihwYXJhbSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHBhcmFtc1twYXJhbV0uY3VycmVudCA9IHBhcmFtc1twYXJhbV0udmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiAoa2V5cykgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHBhcmFtc1twYXJhbV0uY3VycmVudCA9IHBhcmFtc1twYXJhbV0udmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBkYXRhVG9NYXRyaXgoaXRlbXMsIHN0ZGl6ZWQgPSBmYWxzZSkge1xyXG4gICAgbGV0IGRhdGEgPSBbXTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBsZXQgaXRlbSA9IGl0ZW1zW2ldO1xyXG4gICAgICAgIGlmIChzdGRpemVkKSB7XHJcbiAgICAgICAgICAgIGl0ZW0gPSBzY2FsZShpdGVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaXRlbS5mb3JFYWNoKCh4LCBpaSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGRhdGFbaWldID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgZGF0YVtpaV0gPSBbMSwgeF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhW2lpXS5wdXNoKHgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZGF0YTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gY2F0ZWdvcmllc1RvVmVjdG9yKGRhdGEpIHtcclxuICAgIGxldCB2YWx1ZXMgPSBbXTtcclxuICAgIGxldCBrZXlzID0ge307XHJcbiAgICBsZXQgbWF0cml4O1xyXG4gICAgbGV0IGlkeCA9IDA7XHJcbiAgICBkYXRhLmZvckVhY2goKHgpID0+IHtcclxuICAgICAgICBsZXQga2V5ID0geCArICcnO1xyXG4gICAgICAgIGlmICghKGtleSBpbiBrZXlzKSkge1xyXG4gICAgICAgICAgICB2YWx1ZXMucHVzaChrZXkpO1xyXG4gICAgICAgICAgICBrZXlzW2tleV0gPSB2YWx1ZXMubGVuZ3RoIC0gMTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIG1hdHJpeCA9IGRhdGEubWFwKCh5KSA9PiB7XHJcbiAgICAgICAgbGV0IHogPSB2YWx1ZXMubWFwKCh2KSA9PiB7IHJldHVybiAwOyB9KTtcclxuICAgICAgICBsZXQgaWR4ID0ga2V5c1t5ICsgJyddO1xyXG4gICAgICAgIHpbaWR4XSA9IDE7XHJcbiAgICAgICAgcmV0dXJuIHo7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiB7IGxhYmVsczoga2V5cywgZGF0YTogbWF0cml4IH07XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKHZhbHMsIGNlbnRlciwgc2NhbGUpIHtcclxuICAgIGlmICh0eXBlb2YgdmFscyA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICByZXR1cm4gKHZhbHMgLSBjZW50ZXIpIC8gc2NhbGU7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBjZW50ZXIgPSBjZW50ZXIgfHwgalN0YXQubWVhbih2YWxzKTtcclxuICAgICAgICBzY2FsZSA9IHNjYWxlIHx8IGpTdGF0LnN0ZGV2KHZhbHMpO1xyXG4gICAgICAgIHJldHVybiB2YWxzLm1hcCgoZCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKGQgLSBjZW50ZXIpIC8gc2NhbGU7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlSW52KHZhbHMsIGNlbnRlciwgc2NhbGUpIHtcclxuICAgIGlmICh0eXBlb2YgdmFscyA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICByZXR1cm4gdmFscyAqIHNjYWxlICsgY2VudGVyO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHZhbHMubWFwKChkKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBkICogc2NhbGUgKyBjZW50ZXI7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuLypcclxuKiByZWxhdGl2ZSB0byB0aGUgbWVhbiwgaG93IG1hbnkgc2RzXHJcbiovXHJcbmV4cG9ydCBmdW5jdGlvbiBzdGFuZGFyZGl6ZWQoYXJyKSB7XHJcbiAgICBsZXQgc3RkID0galN0YXQuc3RkZXYoYXJyKTtcclxuICAgIGxldCBtZWFuID0galN0YXQubWVhbihhcnIpO1xyXG4gICAgbGV0IHN0YW5kYXJkaXplZCA9IGFyci5tYXAoKGQpID0+IHtcclxuICAgICAgICByZXR1cm4gKGQgLSBtZWFuKSAvIHN0ZDtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHN0YW5kYXJkaXplZDtcclxufVxyXG4vKlxyXG4qIGJldHdlZW4gMCBhbmQgMSB3aGVuIG1pbiBhbmQgbWF4IGFyZSBrbm93blxyXG4qL1xyXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKHgsIG1pbiwgbWF4KSB7XHJcbiAgICBsZXQgdmFsID0geCAtIG1pbjtcclxuICAgIHJldHVybiB2YWwgLyAobWF4IC0gbWluKTtcclxufVxyXG4vKlxyXG4qIGdpdmUgdGhlIHJlYWwgdW5pdCB2YWx1ZVxyXG4qL1xyXG5leHBvcnQgZnVuY3Rpb24gaW52Tm9ybSh4LCBtaW4sIG1heCkge1xyXG4gICAgcmV0dXJuICh4ICogbWF4IC0geCAqIG1pbikgKyBtaW47XHJcbn1cclxuLypcclxuKlxyXG4qL1xyXG5leHBvcnQgZnVuY3Rpb24gcmFuZFJhbmdlKG1pbiwgbWF4KSB7XHJcbiAgICByZXR1cm4gKG1heCAtIG1pbikgKiBNYXRoLnJhbmRvbSgpICsgbWluO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRSYW5nZShkYXRhLCBwcm9wKSB7XHJcbiAgICBsZXQgcmFuZ2UgPSB7XHJcbiAgICAgICAgbWluOiAxZTE1LFxyXG4gICAgICAgIG1heDogLTFlMTVcclxuICAgIH07XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAocmFuZ2UubWluID4gZGF0YVtpXVtwcm9wXSkge1xyXG4gICAgICAgICAgICByYW5nZS5taW4gPSBkYXRhW2ldW3Byb3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmFuZ2UubWF4IDwgZGF0YVtpXVtwcm9wXSkge1xyXG4gICAgICAgICAgICByYW5nZS5tYXggPSBkYXRhW2ldW3Byb3BdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByYW5nZTtcclxufVxyXG5leHBvcnQgY2xhc3MgTWF0Y2gge1xyXG4gICAgc3RhdGljIGd0KGEsIGIpIHtcclxuICAgICAgICBpZiAoYSA+IGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZ2UoYSwgYikge1xyXG4gICAgICAgIGlmIChhID49IGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgbHQoYSwgYikge1xyXG4gICAgICAgIGlmIChhIDwgYikge1xyXG4gICAgICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgIH1cclxuICAgIHN0YXRpYyBsZShhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEgPD0gYikge1xyXG4gICAgICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgIH1cclxuICAgIHN0YXRpYyBhbHdheXMoYSkge1xyXG4gICAgICAgIGlmIChhID09PSBTVUNDRVNTKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZXZlbnR1YWxseShhKSB7XHJcbiAgICAgICAgaWYgKGEgPT09IFNVQ0NFU1MpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gUlVOTklORztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZXF1YWxUbyhhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEgPT09IGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHN0YXRpYyBub3QocmVzdWx0KSB7XHJcbiAgICAgICAgdmFyIG5ld1Jlc3VsdDtcclxuICAgICAgICBpZiAocmVzdWx0ID09PSBTVUNDRVNTKSB7XHJcbiAgICAgICAgICAgIG5ld1Jlc3VsdCA9IEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAocmVzdWx0ID09PSBGQUlMRUQpIHtcclxuICAgICAgICAgICAgbmV3UmVzdWx0ID0gU1VDQ0VTUztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ld1Jlc3VsdDtcclxuICAgIH1cclxuICAgIHN0YXRpYyBub3RFcXVhbFRvKGEsIGIpIHtcclxuICAgICAgICBpZiAoYSAhPT0gYikge1xyXG4gICAgICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc3RhdGljIGd0RXEoYSwgYikge1xyXG4gICAgICAgIGlmIChhID49IGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHN0YXRpYyBsdEVxKGEsIGIpIHtcclxuICAgICAgICBpZiAoYSA8PSBiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgaGFzUHJvcChhLCBiKSB7XHJcbiAgICAgICAgYSA9IGEgfHwgZmFsc2U7XHJcbiAgICAgICAgaWYgKGEgPT09IGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHN0YXRpYyBpblJhbmdlKGEsIGIpIHtcclxuICAgICAgICBpZiAoYiA+PSBhWzBdICYmIGIgPD0gYVsxXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc3RhdGljIG5vdEluUmFuZ2UoYSwgYikge1xyXG4gICAgICAgIGlmIChiID49IGFbMF0gJiYgYiA8PSBhWzFdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGFkZFJlc291cmNlcyhhcnIsIHRlbXBsYXRlLCBudW1iZXIpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtYmVyOyBpKyspIHtcclxuICAgICAgICBhcnIucHVzaChuZXcgUmVzb3VyY2UodGVtcGxhdGUpKTtcclxuICAgIH1cclxuICAgIHJldHVybiBhcnI7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlUG9wKG51bUFnZW50cywgb3B0aW9ucywgdHlwZSwgYm91bmRhcmllcywgY3VycmVudEFnZW50SWQsIHJuZykge1xyXG4gICAgdmFyIHBvcCA9IFtdO1xyXG4gICAgdmFyIGxvY3MgPSB7XHJcbiAgICAgICAgdHlwZTogJ0ZlYXR1cmVDb2xsZWN0aW9uJyxcclxuICAgICAgICBmZWF0dXJlczogW11cclxuICAgIH07XHJcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCBbXTtcclxuICAgIHR5cGUgPSB0eXBlIHx8ICdjb250aW51b3VzJztcclxuICAgIGZvciAodmFyIGEgPSAwOyBhIDwgbnVtQWdlbnRzOyBhKyspIHtcclxuICAgICAgICBwb3BbYV0gPSB7XHJcbiAgICAgICAgICAgIGlkOiBjdXJyZW50QWdlbnRJZCxcclxuICAgICAgICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgICAgICAgc3RhdGVzOiB7fVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgLy9tb3ZlbWVudCBwYXJhbXNcclxuICAgICAgICBwb3BbYV0ubW92ZVBlckRheSA9IHJuZy5ub3JtYWwoMjUwMCAqIDI0LCAxMDAwKTsgLy8gbS9kYXlcclxuICAgICAgICBwb3BbYV0ucHJldlggPSAwO1xyXG4gICAgICAgIHBvcFthXS5wcmV2WSA9IDA7XHJcbiAgICAgICAgcG9wW2FdLm1vdmVkVG90YWwgPSAwO1xyXG4gICAgICAgIGlmIChwb3BbYV0udHlwZSA9PT0gJ2NvbnRpbnVvdXMnKSB7XHJcbiAgICAgICAgICAgIHBvcFthXS5tZXNoID0gbmV3IFRIUkVFLk1lc2gobmV3IFRIUkVFLlRldHJhaGVkcm9uR2VvbWV0cnkoMSwgMSksIG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7XHJcbiAgICAgICAgICAgICAgICBjb2xvcjogMHgwMDAwMDBcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICBwb3BbYV0ubWVzaC5xSWQgPSBwb3BbYV0uaWQ7XHJcbiAgICAgICAgICAgIHBvcFthXS5tZXNoLnR5cGUgPSAnYWdlbnQnO1xyXG4gICAgICAgICAgICBwb3BbYV0ucG9zaXRpb24gPSB7IHg6IDAsIHk6IDAsIHo6IDAgfTtcclxuICAgICAgICAgICAgcG9wW2FdLmJvdW5kYXJ5R3JvdXAgPSBvcHRpb25zLmdyb3VwTmFtZTtcclxuICAgICAgICAgICAgcG9wW2FdLnBvc2l0aW9uLnggPSBybmcucmFuZFJhbmdlKGJvdW5kYXJpZXMubGVmdCwgYm91bmRhcmllcy5yaWdodCk7XHJcbiAgICAgICAgICAgIHBvcFthXS5wb3NpdGlvbi55ID0gcm5nLnJhbmRSYW5nZShib3VuZGFyaWVzLmJvdHRvbSwgYm91bmRhcmllcy50b3ApO1xyXG4gICAgICAgICAgICBwb3BbYV0ubWVzaC5wb3NpdGlvbi54ID0gcG9wW2FdLnBvc2l0aW9uLng7XHJcbiAgICAgICAgICAgIHBvcFthXS5tZXNoLnBvc2l0aW9uLnkgPSBwb3BbYV0ucG9zaXRpb24ueTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzY2VuZSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIHNjZW5lLmFkZChwb3BbYV0ubWVzaCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHBvcFthXS50eXBlID09PSAnZ2Vvc3BhdGlhbCcpIHtcclxuICAgICAgICAgICAgbG9jcy5mZWF0dXJlc1thXSA9IHR1cmYucG9pbnQoW3JuZy5yYW5kUmFuZ2UoLTc1LjE0NjcsIC03NS4xODY3KSwgcm5nLnJhbmRSYW5nZSgzOS45MjAwLCAzOS45OTAwKV0pO1xyXG4gICAgICAgICAgICBwb3BbYV0ubG9jYXRpb24gPSBsb2NzLmZlYXR1cmVzW2FdO1xyXG4gICAgICAgICAgICBwb3BbYV0ubG9jYXRpb24ucHJvcGVydGllcy5hZ2VudFJlZklEID0gcG9wW2FdLmlkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwb3BbYV0gPSBhc3NpZ25QYXJhbXMocG9wW2FdLCBvcHRpb25zLCBybmcpO1xyXG4gICAgICAgIGN1cnJlbnRBZ2VudElkKys7XHJcbiAgICB9XHJcbiAgICBmb3IgKGxldCBhID0gMDsgYSA8IHBvcC5sZW5ndGg7IGErKykge1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBwb3BbYV0uc3RhdGVzKSB7XHJcbiAgICAgICAgICAgIHBvcFthXVtwb3BbYV0uc3RhdGVzW2tleV1dID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gW3BvcCwgbG9jc107XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGFzc2lnblBhcmFtcyh0YXJnZXRPYmosIHBhcmFtcywgcm5nKSB7XHJcbiAgICBmb3IgKGxldCBrZXkgaW4gcGFyYW1zKSB7XHJcbiAgICAgICAgdGFyZ2V0T2JqW2tleV0gPSBhc3NpZ25QYXJhbSh0YXJnZXRPYmosIHBhcmFtc1trZXldLCBrZXksIHJuZyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGFyZ2V0T2JqO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBhc3NpZ25QYXJhbSh0YXJnZXRPYmosIHBhcmFtLCBrZXksIHJuZykge1xyXG4gICAgaWYgKHR5cGVvZiBwYXJhbS5zdGF0ZXMgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgdGFyZ2V0T2JqLnN0YXRlc1trZXldID0gcm5nLnBpY2socGFyYW0uc3RhdGVzLnBhcmFtc1swXSwgcGFyYW0uc3RhdGVzLnBhcmFtc1sxXSk7XHJcbiAgICAgICAgcmV0dXJuIHRhcmdldE9iai5zdGF0ZXNba2V5XTtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgcGFyYW0uZGlzdHJpYnV0aW9uICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIHRhcmdldE9ialtrZXldID0gcm5nW3BhcmFtLmRpc3RyaWJ1dGlvbi5uYW1lXShwYXJhbS5kaXN0cmlidXRpb24ucGFyYW1zWzBdLCBwYXJhbS5kaXN0cmlidXRpb24ucGFyYW1zWzFdKTtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgcGFyYW0uYWN0aW9uICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIHRhcmdldE9ialtrZXldID0gUUFjdGlvbnNbcGFyYW0uYWN0aW9uXTtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgcGFyYW0uYXNzaWduICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIHRhcmdldE9ialtrZXldID0gcGFyYW0uYXNzaWduO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRhcmdldE9ialtrZXldO1xyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXV0aWxzLmpzLm1hcCIsImltcG9ydCB7IGdlbmVyYXRlVVVJRCB9IGZyb20gJy4vdXRpbHMnO1xyXG4vKipcclxuKlFDb21wb25lbnRzIGFyZSB0aGUgYmFzZSBjbGFzcyBmb3IgbWFueSBtb2RlbCBjb21wb25lbnRzLlxyXG4qL1xyXG5leHBvcnQgY2xhc3MgUUNvbXBvbmVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lKSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IGdlbmVyYXRlVVVJRCgpO1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy50aW1lID0gMDtcclxuICAgICAgICB0aGlzLmhpc3RvcnkgPSBbXTtcclxuICAgIH1cclxuICAgIC8qKiBUYWtlIG9uZSB0aW1lIHN0ZXAgZm9yd2FyZCAobW9zdCBzdWJjbGFzc2VzIG92ZXJyaWRlIHRoZSBiYXNlIG1ldGhvZClcclxuICAgICogQHBhcmFtIHN0ZXAgc2l6ZSBvZiB0aW1lIHN0ZXAgKGluIGRheXMgYnkgY29udmVudGlvbilcclxuICAgICovXHJcbiAgICB1cGRhdGUoYWdlbnQsIHN0ZXApIHtcclxuICAgICAgICAvL3NvbWV0aGluZyBzdXBlciFcclxuICAgIH1cclxufVxyXG5RQ29tcG9uZW50LlNVQ0NFU1MgPSAxO1xyXG5RQ29tcG9uZW50LkZBSUxFRCA9IDI7XHJcblFDb21wb25lbnQuUlVOTklORyA9IDM7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVFDb21wb25lbnQuanMubWFwIiwiaW1wb3J0IHsgUUNvbXBvbmVudCB9IGZyb20gJy4vUUNvbXBvbmVudCc7XHJcbmltcG9ydCB7IGdldE1hdGNoZXJTdHJpbmcgfSBmcm9tICcuL3V0aWxzJztcclxuLyoqXHJcbiogQmVsaWVmIERlc2lyZSBJbnRlbnQgYWdlbnRzIGFyZSBzaW1wbGUgcGxhbm5pbmcgYWdlbnRzIHdpdGggbW9kdWxhciBwbGFucyAvIGRlbGliZXJhdGlvbiBwcm9jZXNzZXMuXHJcbiovXHJcbmV4cG9ydCBjbGFzcyBCRElBZ2VudCBleHRlbmRzIFFDb21wb25lbnQge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgZ29hbHMgPSBbXSwgcGxhbnMgPSB7fSwgZGF0YSA9IFtdLCBwb2xpY3lTZWxlY3RvciA9IEJESUFnZW50LnN0b2NoYXN0aWNTZWxlY3Rpb24pIHtcclxuICAgICAgICBzdXBlcihuYW1lKTtcclxuICAgICAgICB0aGlzLmdvYWxzID0gZ29hbHM7XHJcbiAgICAgICAgdGhpcy5wbGFucyA9IHBsYW5zO1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgdGhpcy5wb2xpY3lTZWxlY3RvciA9IHBvbGljeVNlbGVjdG9yO1xyXG4gICAgICAgIHRoaXMuYmVsaWVmSGlzdG9yeSA9IFtdO1xyXG4gICAgICAgIHRoaXMucGxhbkhpc3RvcnkgPSBbXTtcclxuICAgIH1cclxuICAgIC8qKiBUYWtlIG9uZSB0aW1lIHN0ZXAgZm9yd2FyZCwgdGFrZSBpbiBiZWxpZWZzLCBkZWxpYmVyYXRlLCBpbXBsZW1lbnQgcG9saWN5XHJcbiAgICAqIEBwYXJhbSBzdGVwIHNpemUgb2YgdGltZSBzdGVwIChpbiBkYXlzIGJ5IGNvbnZlbnRpb24pXHJcbiAgICAqL1xyXG4gICAgdXBkYXRlKGFnZW50LCBzdGVwKSB7XHJcbiAgICAgICAgdmFyIHBvbGljeSwgaW50ZW50LCBldmFsdWF0aW9uO1xyXG4gICAgICAgIHBvbGljeSA9IHRoaXMucG9saWN5U2VsZWN0b3IodGhpcy5wbGFucywgdGhpcy5wbGFuSGlzdG9yeSwgYWdlbnQpO1xyXG4gICAgICAgIGludGVudCA9IHRoaXMucGxhbnNbcG9saWN5XTtcclxuICAgICAgICBpbnRlbnQoYWdlbnQsIHN0ZXApO1xyXG4gICAgICAgIGV2YWx1YXRpb24gPSB0aGlzLmV2YWx1YXRlR29hbHMoYWdlbnQpO1xyXG4gICAgICAgIHRoaXMucGxhbkhpc3RvcnkucHVzaCh7IHRpbWU6IHRoaXMudGltZSwgaWQ6IGFnZW50LmlkLCBpbnRlbnRpb246IHBvbGljeSwgZ29hbHM6IGV2YWx1YXRpb24uYWNoaWV2ZW1lbnRzLCBiYXJyaWVyczogZXZhbHVhdGlvbi5iYXJyaWVycywgcjogZXZhbHVhdGlvbi5zdWNjZXNzZXMgLyB0aGlzLmdvYWxzLmxlbmd0aCB9KTtcclxuICAgIH1cclxuICAgIGV2YWx1YXRlR29hbHMoYWdlbnQpIHtcclxuICAgICAgICBsZXQgYWNoaWV2ZW1lbnRzID0gW10sIGJhcnJpZXJzID0gW10sIHN1Y2Nlc3NlcyA9IDAsIGMsIG1hdGNoZXI7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmdvYWxzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGMgPSB0aGlzLmdvYWxzW2ldLmNvbmRpdGlvbjtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjLmRhdGEgPT09ICd1bmRlZmluZWQnIHx8IGMuZGF0YSA9PT0gXCJhZ2VudFwiKSB7XHJcbiAgICAgICAgICAgICAgICBjLmRhdGEgPSBhZ2VudDsgLy9pZiBubyBkYXRhc291cmNlIGlzIHNldCwgdXNlIHRoZSBhZ2VudFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGFjaGlldmVtZW50c1tpXSA9IHRoaXMuZ29hbHNbaV0udGVtcG9yYWwoYy5jaGVjayhjLmRhdGFbYy5rZXldLCBjLnZhbHVlKSk7XHJcbiAgICAgICAgICAgIGlmIChhY2hpZXZlbWVudHNbaV0gPT09IEJESUFnZW50LlNVQ0NFU1MpIHtcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3NlcyArPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbWF0Y2hlciA9IGdldE1hdGNoZXJTdHJpbmcoYy5jaGVjayk7XHJcbiAgICAgICAgICAgICAgICBiYXJyaWVycy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogYy5sYWJlbCxcclxuICAgICAgICAgICAgICAgICAgICBrZXk6IGMua2V5LFxyXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrOiBtYXRjaGVyLFxyXG4gICAgICAgICAgICAgICAgICAgIGFjdHVhbDogYy5kYXRhW2Mua2V5XSxcclxuICAgICAgICAgICAgICAgICAgICBleHBlY3RlZDogYy52YWx1ZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHsgc3VjY2Vzc2VzOiBzdWNjZXNzZXMsIGJhcnJpZXJzOiBiYXJyaWVycywgYWNoaWV2ZW1lbnRzOiBhY2hpZXZlbWVudHMgfTtcclxuICAgIH1cclxuICAgIC8vZ29vZCBmb3IgdHJhaW5pbmdcclxuICAgIHN0YXRpYyBzdG9jaGFzdGljU2VsZWN0aW9uKHBsYW5zLCBwbGFuSGlzdG9yeSwgYWdlbnQpIHtcclxuICAgICAgICB2YXIgcG9saWN5LCBzY29yZSwgbWF4ID0gMDtcclxuICAgICAgICBmb3IgKHZhciBwbGFuIGluIHBsYW5zKSB7XHJcbiAgICAgICAgICAgIHNjb3JlID0gTWF0aC5yYW5kb20oKTtcclxuICAgICAgICAgICAgaWYgKHNjb3JlID49IG1heCkge1xyXG4gICAgICAgICAgICAgICAgbWF4ID0gc2NvcmU7XHJcbiAgICAgICAgICAgICAgICBwb2xpY3kgPSBwbGFuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwb2xpY3k7XHJcbiAgICB9XHJcbn1cclxuQkRJQWdlbnQubGF6eVBvbGljeVNlbGVjdGlvbiA9IGZ1bmN0aW9uIChwbGFucywgcGxhbkhpc3RvcnksIGFnZW50KSB7XHJcbiAgICB2YXIgb3B0aW9ucywgc2VsZWN0aW9uO1xyXG4gICAgaWYgKHRoaXMudGltZSA+IDApIHtcclxuICAgICAgICBvcHRpb25zID0gT2JqZWN0LmtleXMocGxhbnMpO1xyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zLnNsaWNlKDEsIG9wdGlvbnMubGVuZ3RoKTtcclxuICAgICAgICBzZWxlY3Rpb24gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBvcHRpb25zLmxlbmd0aCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBvcHRpb25zID0gT2JqZWN0LmtleXMocGxhbnMpO1xyXG4gICAgICAgIHNlbGVjdGlvbiA9IDA7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gb3B0aW9uc1tzZWxlY3Rpb25dO1xyXG59O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1iZGkuanMubWFwIiwiaW1wb3J0IHsgUUNvbXBvbmVudCB9IGZyb20gJy4vUUNvbXBvbmVudCc7XHJcbmltcG9ydCB7IGdlbmVyYXRlVVVJRCB9IGZyb20gJy4vdXRpbHMnO1xyXG4vKipcclxuKiBCZWhhdmlvciBUcmVlXHJcbioqL1xyXG5leHBvcnQgY2xhc3MgQmVoYXZpb3JUcmVlIGV4dGVuZHMgUUNvbXBvbmVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCByb290LCBkYXRhKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSk7XHJcbiAgICAgICAgdGhpcy5yb290ID0gcm9vdDtcclxuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xyXG4gICAgICAgIHRoaXMucmVzdWx0cyA9IFtdO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIHRpY2sobm9kZSwgYWdlbnQpIHtcclxuICAgICAgICB2YXIgc3RhdGUgPSBub2RlLm9wZXJhdGUoYWdlbnQpO1xyXG4gICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH1cclxuICAgIHVwZGF0ZShhZ2VudCwgc3RlcCkge1xyXG4gICAgICAgIHZhciBzdGF0ZTtcclxuICAgICAgICBhZ2VudC5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIHdoaWxlIChhZ2VudC5hY3RpdmUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgc3RhdGUgPSBCZWhhdmlvclRyZWUudGljayh0aGlzLnJvb3QsIGFnZW50KTtcclxuICAgICAgICAgICAgYWdlbnQudGltZSA9IHRoaXMudGltZTtcclxuICAgICAgICAgICAgYWdlbnQuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgQlROb2RlIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUpIHtcclxuICAgICAgICB0aGlzLmlkID0gZ2VuZXJhdGVVVUlEKCk7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgQlRDb250cm9sTm9kZSBleHRlbmRzIEJUTm9kZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBjaGlsZHJlbikge1xyXG4gICAgICAgIHN1cGVyKG5hbWUpO1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgQlRSb290IGV4dGVuZHMgQlRDb250cm9sTm9kZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBjaGlsZHJlbikge1xyXG4gICAgICAgIHN1cGVyKG5hbWUsIGNoaWxkcmVuKTtcclxuICAgICAgICB0aGlzLnR5cGUgPSBcInJvb3RcIjtcclxuICAgICAgICB0aGlzLm9wZXJhdGUgPSBmdW5jdGlvbiAoYWdlbnQpIHtcclxuICAgICAgICAgICAgdmFyIHN0YXRlID0gQmVoYXZpb3JUcmVlLnRpY2sodGhpcy5jaGlsZHJlblswXSwgYWdlbnQpO1xyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgQlRTZWxlY3RvciBleHRlbmRzIEJUQ29udHJvbE5vZGUge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgY2hpbGRyZW4pIHtcclxuICAgICAgICBzdXBlcihuYW1lLCBjaGlsZHJlbik7XHJcbiAgICAgICAgdGhpcy50eXBlID0gXCJzZWxlY3RvclwiO1xyXG4gICAgICAgIHRoaXMub3BlcmF0ZSA9IGZ1bmN0aW9uIChhZ2VudCkge1xyXG4gICAgICAgICAgICB2YXIgY2hpbGRTdGF0ZTtcclxuICAgICAgICAgICAgZm9yICh2YXIgY2hpbGQgaW4gdGhpcy5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgY2hpbGRTdGF0ZSA9IEJlaGF2aW9yVHJlZS50aWNrKHRoaXMuY2hpbGRyZW5bY2hpbGRdLCBhZ2VudCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRTdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLlJVTk5JTkcpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLlJVTk5JTkc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRTdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLlNVQ0NFU1MpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLlNVQ0NFU1M7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5GQUlMRUQ7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgQlRTZXF1ZW5jZSBleHRlbmRzIEJUQ29udHJvbE5vZGUge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgY2hpbGRyZW4pIHtcclxuICAgICAgICBzdXBlcihuYW1lLCBjaGlsZHJlbik7XHJcbiAgICAgICAgdGhpcy50eXBlID0gXCJzZXF1ZW5jZVwiO1xyXG4gICAgICAgIHRoaXMub3BlcmF0ZSA9IGZ1bmN0aW9uIChhZ2VudCkge1xyXG4gICAgICAgICAgICB2YXIgY2hpbGRTdGF0ZTtcclxuICAgICAgICAgICAgZm9yICh2YXIgY2hpbGQgaW4gdGhpcy5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgY2hpbGRTdGF0ZSA9IEJlaGF2aW9yVHJlZS50aWNrKHRoaXMuY2hpbGRyZW5bY2hpbGRdLCBhZ2VudCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRTdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLlJVTk5JTkcpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLlJVTk5JTkc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRTdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLkZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBCZWhhdmlvclRyZWUuRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBCZWhhdmlvclRyZWUuU1VDQ0VTUztcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBCVFBhcmFsbGVsIGV4dGVuZHMgQlRDb250cm9sTm9kZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBjaGlsZHJlbiwgc3VjY2Vzc2VzKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSwgY2hpbGRyZW4pO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IFwicGFyYWxsZWxcIjtcclxuICAgICAgICB0aGlzLnN1Y2Nlc3NlcyA9IHN1Y2Nlc3NlcztcclxuICAgICAgICB0aGlzLm9wZXJhdGUgPSBmdW5jdGlvbiAoYWdlbnQpIHtcclxuICAgICAgICAgICAgdmFyIHN1Y2NlZWRlZCA9IFtdLCBmYWlsdXJlcyA9IFtdLCBjaGlsZFN0YXRlLCBtYWpvcml0eTtcclxuICAgICAgICAgICAgZm9yICh2YXIgY2hpbGQgaW4gdGhpcy5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgY2hpbGRTdGF0ZSA9IEJlaGF2aW9yVHJlZS50aWNrKHRoaXMuY2hpbGRyZW5bY2hpbGRdLCBhZ2VudCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRTdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLlNVQ0NFU1MpIHtcclxuICAgICAgICAgICAgICAgICAgICBzdWNjZWVkZWQucHVzaChjaGlsZFN0YXRlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5GQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgICAgICBmYWlsdXJlcy5wdXNoKGNoaWxkU3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY2hpbGRTdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLlJVTk5JTkcpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLlJVTk5JTkc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHN1Y2NlZWRlZC5sZW5ndGggPj0gdGhpcy5zdWNjZXNzZXMpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBCZWhhdmlvclRyZWUuU1VDQ0VTUztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBCZWhhdmlvclRyZWUuRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgQlRDb25kaXRpb24gZXh0ZW5kcyBCVE5vZGUge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgY29uZGl0aW9uKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSk7XHJcbiAgICAgICAgdGhpcy50eXBlID0gXCJjb25kaXRpb25cIjtcclxuICAgICAgICB0aGlzLmNvbmRpdGlvbiA9IGNvbmRpdGlvbjtcclxuICAgICAgICB0aGlzLm9wZXJhdGUgPSBmdW5jdGlvbiAoYWdlbnQpIHtcclxuICAgICAgICAgICAgdmFyIHN0YXRlO1xyXG4gICAgICAgICAgICBzdGF0ZSA9IGNvbmRpdGlvbi5jaGVjayhhZ2VudFtjb25kaXRpb24ua2V5XSwgY29uZGl0aW9uLnZhbHVlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEJUQWN0aW9uIGV4dGVuZHMgQlROb2RlIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNvbmRpdGlvbiwgYWN0aW9uKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSk7XHJcbiAgICAgICAgdGhpcy50eXBlID0gXCJhY3Rpb25cIjtcclxuICAgICAgICB0aGlzLmNvbmRpdGlvbiA9IGNvbmRpdGlvbjtcclxuICAgICAgICB0aGlzLmFjdGlvbiA9IGFjdGlvbjtcclxuICAgICAgICB0aGlzLm9wZXJhdGUgPSBmdW5jdGlvbiAoYWdlbnQpIHtcclxuICAgICAgICAgICAgdmFyIHN0YXRlO1xyXG4gICAgICAgICAgICBzdGF0ZSA9IGNvbmRpdGlvbi5jaGVjayhhZ2VudFtjb25kaXRpb24ua2V5XSwgY29uZGl0aW9uLnZhbHVlKTtcclxuICAgICAgICAgICAgaWYgKHN0YXRlID09PSBCZWhhdmlvclRyZWUuU1VDQ0VTUykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hY3Rpb24oYWdlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWJlaGF2aW9yVHJlZS5qcy5tYXAiLCJpbXBvcnQgeyBnZW5lcmF0ZVVVSUQgfSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IHsgUUNvbXBvbmVudCB9IGZyb20gJy4vUUNvbXBvbmVudCc7XHJcbmV4cG9ydCBjbGFzcyBDb21wYXJ0bWVudE1vZGVsIGV4dGVuZHMgUUNvbXBvbmVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBjb21wYXJ0bWVudHMsIGRhdGEpIHtcclxuICAgICAgICBzdXBlcihuYW1lKTtcclxuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhOyAvL2FuIGFycmF5IG9mIFBhdGNoZXMuIEVhY2ggcGF0Y2ggY29udGFpbnMgYW4gYXJyYXkgb2YgY29tcGFydG1lbnRzIGluIG9wZXJhdGlvbmFsIG9yZGVyXHJcbiAgICAgICAgdGhpcy50b3RhbFBvcCA9IDA7XHJcbiAgICAgICAgdGhpcy5jb21wYXJ0bWVudHMgPSBjb21wYXJ0bWVudHM7XHJcbiAgICAgICAgdGhpcy5oaXN0b3J5ID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgZCA9IDA7IGQgPCB0aGlzLmRhdGEubGVuZ3RoOyBkKyspIHtcclxuICAgICAgICAgICAgdGhpcy50b3RhbFBvcCArPSB0aGlzLmRhdGFbZF0udG90YWxQb3A7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3RvbGVyYW5jZSA9IDFlLTk7IC8vbW9kZWwgZXJyIHRvbGVyYW5jZVxyXG4gICAgfVxyXG4gICAgdXBkYXRlKHBhdGNoLCBzdGVwKSB7XHJcbiAgICAgICAgbGV0IHRlbXBfcG9wID0ge30sIHRlbXBfZCA9IHt9LCBuZXh0X2QgPSB7fSwgbHRlID0ge30sIGVyciA9IDEsIG5ld1N0ZXA7XHJcbiAgICAgICAgZm9yIChsZXQgYyBpbiB0aGlzLmNvbXBhcnRtZW50cykge1xyXG4gICAgICAgICAgICBwYXRjaC5kcG9wc1tjXSA9IHRoaXMuY29tcGFydG1lbnRzW2NdLm9wZXJhdGlvbihwYXRjaC5wb3B1bGF0aW9ucywgc3RlcCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vZmlyc3Qgb3JkZXIgKEV1bGVyKVxyXG4gICAgICAgIGZvciAobGV0IGMgaW4gdGhpcy5jb21wYXJ0bWVudHMpIHtcclxuICAgICAgICAgICAgdGVtcF9wb3BbY10gPSBwYXRjaC5wb3B1bGF0aW9uc1tjXTtcclxuICAgICAgICAgICAgdGVtcF9kW2NdID0gcGF0Y2guZHBvcHNbY107XHJcbiAgICAgICAgICAgIHBhdGNoLnBvcHVsYXRpb25zW2NdID0gdGVtcF9wb3BbY10gKyB0ZW1wX2RbY107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vc2Vjb25kIG9yZGVyIChIZXVucylcclxuICAgICAgICBwYXRjaC50b3RhbFBvcCA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQgYyBpbiB0aGlzLmNvbXBhcnRtZW50cykge1xyXG4gICAgICAgICAgICBuZXh0X2RbY10gPSB0aGlzLmNvbXBhcnRtZW50c1tjXS5vcGVyYXRpb24ocGF0Y2gucG9wdWxhdGlvbnMsIHN0ZXApO1xyXG4gICAgICAgICAgICBwYXRjaC5wb3B1bGF0aW9uc1tjXSA9IHRlbXBfcG9wW2NdICsgKDAuNSAqICh0ZW1wX2RbY10gKyBuZXh0X2RbY10pKTtcclxuICAgICAgICAgICAgcGF0Y2gudG90YWxQb3AgKz0gcGF0Y2gucG9wdWxhdGlvbnNbY107XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBDb21wYXJ0bWVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBwb3AsIG9wZXJhdGlvbikge1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy5vcGVyYXRpb24gPSBvcGVyYXRpb24gfHwgbnVsbDtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgUGF0Y2gge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgY29tcGFydG1lbnRzLCBwb3B1bGF0aW9ucykge1xyXG4gICAgICAgIHRoaXMucG9wdWxhdGlvbnMgPSB7fTtcclxuICAgICAgICB0aGlzLmRwb3BzID0ge307XHJcbiAgICAgICAgdGhpcy5pbml0aWFsUG9wID0ge307XHJcbiAgICAgICAgdGhpcy5pZCA9IGdlbmVyYXRlVVVJRCgpO1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy5kcG9wcyA9IHt9O1xyXG4gICAgICAgIHRoaXMuY29tcGFydG1lbnRzID0gY29tcGFydG1lbnRzO1xyXG4gICAgICAgIHRoaXMudG90YWxQb3AgPSAwO1xyXG4gICAgICAgIGZvciAobGV0IGMgaW4gcG9wdWxhdGlvbnMpIHtcclxuICAgICAgICAgICAgdGhpcy5kcG9wc1tjXSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdGlhbFBvcFtjXSA9IHBvcHVsYXRpb25zW2NdO1xyXG4gICAgICAgICAgICB0aGlzLnBvcHVsYXRpb25zW2NdID0gcG9wdWxhdGlvbnNbY107XHJcbiAgICAgICAgICAgIHRoaXMudG90YWxQb3AgKz0gdGhpcy5wb3B1bGF0aW9uc1tjXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29tcGFydG1lbnQuanMubWFwIiwiaW1wb3J0IHsgZ2VuZXJhdGVVVUlEIH0gZnJvbSAnLi91dGlscyc7XHJcbmV4cG9ydCBjbGFzcyBDb250YWN0UGF0Y2gge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgY2FwYWNpdHkpIHtcclxuICAgICAgICB0aGlzLmlkID0gZ2VuZXJhdGVVVUlEKCk7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgICB0aGlzLmNhcGFjaXR5ID0gY2FwYWNpdHk7XHJcbiAgICAgICAgdGhpcy5wb3AgPSAwO1xyXG4gICAgICAgIHRoaXMubWVtYmVycyA9IHt9O1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGRlZmF1bHRGcmVxRihhLCBiKSB7XHJcbiAgICAgICAgdmFyIHZhbCA9ICg1MCAtIE1hdGguYWJzKGEuYWdlIC0gYi5hZ2UpKSAvIDEwMDtcclxuICAgICAgICByZXR1cm4gdmFsO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGRlZmF1bHRDb250YWN0RihhLCB0aW1lKSB7XHJcbiAgICAgICAgdmFyIGMgPSAyICogTWF0aC5zaW4odGltZSkgKyBhO1xyXG4gICAgICAgIGlmIChjID49IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgYXNzaWduKGFnZW50LCBjb250YWN0VmFsdWVGdW5jKSB7XHJcbiAgICAgICAgdmFyIGNvbnRhY3RWYWx1ZTtcclxuICAgICAgICBjb250YWN0VmFsdWVGdW5jID0gY29udGFjdFZhbHVlRnVuYyB8fCBDb250YWN0UGF0Y2guZGVmYXVsdEZyZXFGO1xyXG4gICAgICAgIGlmICh0aGlzLnBvcCA8IHRoaXMuY2FwYWNpdHkpIHtcclxuICAgICAgICAgICAgdGhpcy5tZW1iZXJzW2FnZW50LmlkXSA9IHsgcHJvcGVydGllczogYWdlbnQgfTtcclxuICAgICAgICAgICAgZm9yIChsZXQgb3RoZXIgaW4gdGhpcy5tZW1iZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaWQgPSBwYXJzZUludChvdGhlcik7XHJcbiAgICAgICAgICAgICAgICBpZiAob3RoZXIgIT09IGFnZW50LmlkICYmICFpc05hTihpZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250YWN0VmFsdWUgPSBjb250YWN0VmFsdWVGdW5jKHRoaXMubWVtYmVyc1tpZF0ucHJvcGVydGllcywgYWdlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVtYmVyc1thZ2VudC5pZF1baWRdID0gY29udGFjdFZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVtYmVyc1tpZF1bYWdlbnQuaWRdID0gY29udGFjdFZhbHVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucG9wKys7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmlkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZW5jb3VudGVycyhhZ2VudCwgcHJlY29uZGl0aW9uLCBjb250YWN0RnVuYywgcmVzdWx0S2V5LCBzYXZlID0gZmFsc2UpIHtcclxuICAgICAgICBjb250YWN0RnVuYyA9IGNvbnRhY3RGdW5jIHx8IENvbnRhY3RQYXRjaC5kZWZhdWx0Q29udGFjdEY7XHJcbiAgICAgICAgbGV0IGNvbnRhY3RWYWw7XHJcbiAgICAgICAgZm9yICh2YXIgY29udGFjdCBpbiB0aGlzLm1lbWJlcnMpIHtcclxuICAgICAgICAgICAgaWYgKHByZWNvbmRpdGlvbi5rZXkgPT09ICdzdGF0ZXMnKSB7XHJcbiAgICAgICAgICAgICAgICBjb250YWN0VmFsID0gSlNPTi5zdHJpbmdpZnkodGhpcy5tZW1iZXJzW2NvbnRhY3RdLnByb3BlcnRpZXNbcHJlY29uZGl0aW9uLmtleV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29udGFjdFZhbCA9IHRoaXMubWVtYmVyc1tjb250YWN0XS5wcm9wZXJ0aWVzW3ByZWNvbmRpdGlvbi5rZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwcmVjb25kaXRpb24uY2hlY2sodGhpcy5tZW1iZXJzW2NvbnRhY3RdLnByb3BlcnRpZXNbcHJlY29uZGl0aW9uLmtleV0sIHByZWNvbmRpdGlvbi52YWx1ZSkgJiYgTnVtYmVyKGNvbnRhY3QpICE9PSBhZ2VudC5pZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9sZFZhbCA9IHRoaXMubWVtYmVyc1tjb250YWN0XS5wcm9wZXJ0aWVzW3Jlc3VsdEtleV07XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3VmFsID0gY29udGFjdEZ1bmModGhpcy5tZW1iZXJzW2NvbnRhY3RdLCBhZ2VudCk7XHJcbiAgICAgICAgICAgICAgICBpZiAob2xkVmFsICE9PSBuZXdWYWwgJiYgc2F2ZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVtYmVyc1tjb250YWN0XS5wcm9wZXJ0aWVzW3Jlc3VsdEtleV0gPSBuZXdWYWw7XHJcbiAgICAgICAgICAgICAgICAgICAgQ29udGFjdFBhdGNoLldJV0FycmF5LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRjaElEOiB0aGlzLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZmVjdGVkOiBjb250YWN0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZlY3RlZEFnZTogdGhpcy5tZW1iZXJzW2NvbnRhY3RdLnByb3BlcnRpZXMuYWdlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQ6IHRoaXMubWVtYmVyc1tjb250YWN0XS5wcm9wZXJ0aWVzW3Jlc3VsdEtleV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdEtleTogcmVzdWx0S2V5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBieTogYWdlbnQuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ5QWdlOiBhZ2VudC5hZ2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6IGFnZW50LnRpbWVcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5Db250YWN0UGF0Y2guV0lXQXJyYXkgPSBbXTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29udGFjdFBhdGNoLmpzLm1hcCIsImltcG9ydCB7IHNodWZmbGUgfSBmcm9tICcuL3V0aWxzJztcclxuLyoqXHJcbipFbnZpcm9ubWVudHMgYXJlIHRoZSBleGVjdXRhYmxlIGVudmlyb25tZW50IGNvbnRhaW5pbmcgdGhlIG1vZGVsIGNvbXBvbmVudHMsXHJcbipzaGFyZWQgcmVzb3VyY2VzLCBhbmQgc2NoZWR1bGVyLlxyXG4qL1xyXG5leHBvcnQgY2xhc3MgRW52aXJvbm1lbnQge1xyXG4gICAgY29uc3RydWN0b3IocmVzb3VyY2VzID0gW10sIGVudGl0aWVzID0ge30sIGV2ZW50c1F1ZXVlID0gW10sIGFjdGl2YXRpb25UeXBlID0gJ3JhbmRvbScsIHJuZyA9IE1hdGgpIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAqIHNwYXRpYWwgYm91bmRhcmllc1xyXG4gICAgICAgICoqL1xyXG4gICAgICAgIHRoaXMuYm91bmRhcmllcyA9IHt9O1xyXG4gICAgICAgIHRoaXMudGltZSA9IDA7XHJcbiAgICAgICAgdGhpcy50aW1lT2ZEYXkgPSAwO1xyXG4gICAgICAgIHRoaXMubW9kZWxzID0gW107XHJcbiAgICAgICAgdGhpcy5oaXN0b3J5ID0gW107XHJcbiAgICAgICAgdGhpcy5hZ2VudHMgPSBbXTtcclxuICAgICAgICB0aGlzLnJlc291cmNlcyA9IHJlc291cmNlcztcclxuICAgICAgICB0aGlzLmVudGl0aWVzID0gZW50aXRpZXM7XHJcbiAgICAgICAgdGhpcy5ldmVudHNRdWV1ZSA9IGV2ZW50c1F1ZXVlO1xyXG4gICAgICAgIHRoaXMuYWN0aXZhdGlvblR5cGUgPSBhY3RpdmF0aW9uVHlwZTtcclxuICAgICAgICB0aGlzLnJuZyA9IHJuZztcclxuICAgICAgICB0aGlzLl9hZ2VudEluZGV4ID0ge307XHJcbiAgICB9XHJcbiAgICAvKiogQWRkIGEgbW9kZWwgY29tcG9uZW50cyBmcm9tIHRoZSBlbnZpcm9ubWVudFxyXG4gICAgKiBAcGFyYW0gY29tcG9uZW50IHRoZSBtb2RlbCBjb21wb25lbnQgb2JqZWN0IHRvIGJlIGFkZGVkIHRvIHRoZSBlbnZpcm9ubWVudC5cclxuICAgICovXHJcbiAgICBhZGQoY29tcG9uZW50KSB7XHJcbiAgICAgICAgdGhpcy5tb2RlbHMucHVzaChjb21wb25lbnQpO1xyXG4gICAgfVxyXG4gICAgLyoqIFJlbW92ZSBhIG1vZGVsIGNvbXBvbmVudHMgZnJvbSB0aGUgZW52aXJvbm1lbnQgYnkgaWRcclxuICAgICogQHBhcmFtIGlkIFVVSUQgb2YgdGhlIGNvbXBvbmVudCB0byBiZSByZW1vdmVkLlxyXG4gICAgKi9cclxuICAgIHJlbW92ZShpZCkge1xyXG4gICAgICAgIHZhciBkZWxldGVJbmRleCwgTCA9IHRoaXMuYWdlbnRzLmxlbmd0aDtcclxuICAgICAgICB0aGlzLm1vZGVscy5mb3JFYWNoKGZ1bmN0aW9uIChjLCBpbmRleCkge1xyXG4gICAgICAgICAgICBpZiAoYy5pZCA9PT0gaWQpIHtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZUluZGV4ID0gaW5kZXg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB3aGlsZSAoTCA+IDAgJiYgdGhpcy5hZ2VudHMubGVuZ3RoID49IDApIHtcclxuICAgICAgICAgICAgTC0tO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5hZ2VudHNbTF0ubW9kZWxJbmRleCA9PT0gZGVsZXRlSW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWdlbnRzLnNwbGljZShMLCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm1vZGVscy5zcGxpY2UoZGVsZXRlSW5kZXgsIDEpO1xyXG4gICAgfVxyXG4gICAgLyoqIFJ1biBhbGwgZW52aXJvbm1lbnQgbW9kZWwgY29tcG9uZW50cyBmcm9tIHQ9MCB1bnRpbCB0PXVudGlsIHVzaW5nIHRpbWUgc3RlcCA9IHN0ZXBcclxuICAgICogQHBhcmFtIHN0ZXAgdGhlIHN0ZXAgc2l6ZVxyXG4gICAgKiBAcGFyYW0gdW50aWwgdGhlIGVuZCB0aW1lXHJcbiAgICAqIEBwYXJhbSBzYXZlSW50ZXJ2YWwgc2F2ZSBldmVyeSAneCcgc3RlcHNcclxuICAgICovXHJcbiAgICBydW4oc3RlcCwgdW50aWwsIHNhdmVJbnRlcnZhbCkge1xyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgICAgIHdoaWxlICh0aGlzLnRpbWUgPD0gdW50aWwpIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGUoc3RlcCk7XHJcbiAgICAgICAgICAgIGxldCByZW0gPSAodGhpcy50aW1lICUgc2F2ZUludGVydmFsKTtcclxuICAgICAgICAgICAgaWYgKHJlbSA8IHN0ZXApIHtcclxuICAgICAgICAgICAgICAgIGxldCBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmFnZW50cykpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oaXN0b3J5ID0gdGhpcy5oaXN0b3J5LmNvbmNhdChjb3B5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnRpbWUgKz0gc3RlcDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKiogQXNzaWduIGFsbCBhZ2VudHMgdG8gYXBwcm9wcmlhdGUgbW9kZWxzXHJcbiAgICAqL1xyXG4gICAgaW5pdCgpIHtcclxuICAgICAgICB0aGlzLl9hZ2VudEluZGV4ID0ge307XHJcbiAgICAgICAgZm9yIChsZXQgYyA9IDA7IGMgPCB0aGlzLm1vZGVscy5sZW5ndGg7IGMrKykge1xyXG4gICAgICAgICAgICBsZXQgYWxyZWFkeUluID0gW107XHJcbiAgICAgICAgICAgIC8vYXNzaWduIGVhY2ggYWdlbnQgbW9kZWwgaW5kZXhlcyB0byBoYW5kbGUgYWdlbnRzIGFzc2lnbmVkIHRvIG11bHRpcGxlIG1vZGVsc1xyXG4gICAgICAgICAgICBmb3IgKGxldCBkID0gMDsgZCA8IHRoaXMubW9kZWxzW2NdLmRhdGEubGVuZ3RoOyBkKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBpZCA9IHRoaXMubW9kZWxzW2NdLmRhdGFbZF0uaWQ7XHJcbiAgICAgICAgICAgICAgICBpZiAoaWQgaW4gdGhpcy5fYWdlbnRJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcyBhZ2VudCBiZWxvbmdzIHRvIG11bHRpcGxlIG1vZGVscy5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVsc1tjXS5kYXRhW2RdLm1vZGVscy5wdXNoKHRoaXMubW9kZWxzW2NdLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZWxzW2NdLmRhdGFbZF0ubW9kZWxJbmRleGVzLnB1c2goYyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxyZWFkeUluLnB1c2goaWQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy90aGlzIGFnZW50IGJlbG9uZ3MgdG8gb25seSBvbmUgbW9kZWwgc28gZmFyLlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FnZW50SW5kZXhbaWRdID0gMDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVsc1tjXS5kYXRhW2RdLm1vZGVscyA9IFt0aGlzLm1vZGVsc1tjXS5uYW1lXTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVsc1tjXS5kYXRhW2RdLm1vZGVsSW5kZXhlcyA9IFtjXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL2VsaW1pbmF0ZSBhbnkgZHVwbGljYXRlIGFnZW50cyBieSBpZFxyXG4gICAgICAgICAgICB0aGlzLm1vZGVsc1tjXS5kYXRhID0gdGhpcy5tb2RlbHNbY10uZGF0YS5maWx0ZXIoKGQpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChhbHJlYWR5SW4uaW5kZXhPZihkLmlkKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vY29uY2F0IHRoZSByZXN1bHRzXHJcbiAgICAgICAgICAgIHRoaXMuYWdlbnRzID0gdGhpcy5hZ2VudHMuY29uY2F0KHRoaXMubW9kZWxzW2NdLmRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKiBVcGRhdGUgZWFjaCBtb2RlbCBjb21wZW5lbnQgb25lIHRpbWUgc3RlcCBmb3J3YXJkXHJcbiAgICAqIEBwYXJhbSBzdGVwIHRoZSBzdGVwIHNpemVcclxuICAgICovXHJcbiAgICB1cGRhdGUoc3RlcCkge1xyXG4gICAgICAgIHZhciBpbmRleCA9IDA7XHJcbiAgICAgICAgd2hpbGUgKGluZGV4IDwgdGhpcy5ldmVudHNRdWV1ZS5sZW5ndGggJiYgdGhpcy5ldmVudHNRdWV1ZVtpbmRleF0uYXQgPD0gdGhpcy50aW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzUXVldWVbaW5kZXhdLnRyaWdnZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5ldmVudHNRdWV1ZVtpbmRleF0udHJpZ2dlcmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZXZlbnRzUXVldWVbaW5kZXhdLnVudGlsIDw9IHRoaXMudGltZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ldmVudHNRdWV1ZS5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmFjdGl2YXRpb25UeXBlID09PSBcInJhbmRvbVwiKSB7XHJcbiAgICAgICAgICAgIHNodWZmbGUodGhpcy5hZ2VudHMsIHRoaXMucm5nKTtcclxuICAgICAgICAgICAgdGhpcy5hZ2VudHMuZm9yRWFjaCgoYWdlbnQsIGkpID0+IHsgdGhpcy5fYWdlbnRJbmRleFthZ2VudC5pZF0gPSBpOyB9KTsgLy8gcmVhc3NpZ24gYWdlbnRcclxuICAgICAgICAgICAgdGhpcy5hZ2VudHMuZm9yRWFjaCgoYWdlbnQsIGkpID0+IHtcclxuICAgICAgICAgICAgICAgIGFnZW50Lm1vZGVsSW5kZXhlcy5mb3JFYWNoKChtb2RlbEluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlbHNbbW9kZWxJbmRleF0udXBkYXRlKGFnZW50LCBzdGVwKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgYWdlbnQudGltZSA9IGFnZW50LnRpbWUgKyBzdGVwIHx8IDA7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5hY3RpdmF0aW9uVHlwZSA9PT0gXCJwYXJhbGxlbFwiKSB7XHJcbiAgICAgICAgICAgIGxldCB0ZW1wQWdlbnRzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmFnZW50cykpO1xyXG4gICAgICAgICAgICB0ZW1wQWdlbnRzLmZvckVhY2goKGFnZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBhZ2VudC5tb2RlbEluZGV4ZXMuZm9yRWFjaCgobW9kZWxJbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZWxzW21vZGVsSW5kZXhdLnVwZGF0ZShhZ2VudCwgc3RlcCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuYWdlbnRzLmZvckVhY2goKGFnZW50LCBpKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBhZ2VudC5tb2RlbEluZGV4ZXMuZm9yRWFjaCgobW9kZWxJbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZWxzW21vZGVsSW5kZXhdLmFwcGx5KGFnZW50LCB0ZW1wQWdlbnRzW2ldLCBzdGVwKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgYWdlbnQudGltZSA9IGFnZW50LnRpbWUgKyBzdGVwIHx8IDA7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKiBGb3JtYXQgYSB0aW1lIG9mIGRheS4gQ3VycmVudCB0aW1lICUgMS5cclxuICAgICpcclxuICAgICovXHJcbiAgICBmb3JtYXRUaW1lKCkge1xyXG4gICAgICAgIHRoaXMudGltZU9mRGF5ID0gdGhpcy50aW1lICUgMTtcclxuICAgIH1cclxuICAgIC8qKiBHZXRzIGFnZW50IGJ5IGlkLiBBIHV0aWxpdHkgZnVuY3Rpb24gdGhhdFxyXG4gICAgKlxyXG4gICAgKi9cclxuICAgIGdldEFnZW50QnlJZChpZCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFnZW50c1t0aGlzLl9hZ2VudEluZGV4W2lkXV07XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZW52aXJvbm1lbnQuanMubWFwIiwiZXhwb3J0IGNsYXNzIEVwaSB7XHJcbiAgICBzdGF0aWMgcHJldmFsZW5jZShjYXNlcywgdG90YWwpIHtcclxuICAgICAgICB2YXIgcHJldiA9IGNhc2VzIC8gdG90YWw7XHJcbiAgICAgICAgcmV0dXJuIHByZXY7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgcmlza0RpZmZlcmVuY2UodGFibGUpIHtcclxuICAgICAgICB2YXIgcmQgPSB0YWJsZS5hIC8gKHRhYmxlLmEgKyB0YWJsZS5iKSAtIHRhYmxlLmMgLyAodGFibGUuYyArIHRhYmxlLmQpO1xyXG4gICAgICAgIHJldHVybiByZDtcclxuICAgIH1cclxuICAgIHN0YXRpYyByaXNrUmF0aW8odGFibGUpIHtcclxuICAgICAgICB2YXIgcnJhdGlvID0gKHRhYmxlLmEgLyAodGFibGUuYSArIHRhYmxlLmIpKSAvICh0YWJsZS5jIC8gKHRhYmxlLmMgKyB0YWJsZS5kKSk7XHJcbiAgICAgICAgcmV0dXJuIHJyYXRpbztcclxuICAgIH1cclxuICAgIHN0YXRpYyBvZGRzUmF0aW8odGFibGUpIHtcclxuICAgICAgICB2YXIgb3IgPSAodGFibGUuYSAqIHRhYmxlLmQpIC8gKHRhYmxlLmIgKiB0YWJsZS5jKTtcclxuICAgICAgICByZXR1cm4gb3I7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgSVBGMkQocm93VG90YWxzLCBjb2xUb3RhbHMsIGl0ZXJhdGlvbnMsIHNlZWRzKSB7XHJcbiAgICAgICAgdmFyIHJUID0gMCwgY1QgPSAwLCBzZWVkQ2VsbHMgPSBzZWVkcztcclxuICAgICAgICByb3dUb3RhbHMuZm9yRWFjaChmdW5jdGlvbiAociwgaSkge1xyXG4gICAgICAgICAgICByVCArPSByO1xyXG4gICAgICAgICAgICBzZWVkQ2VsbHNbaV0gPSBzZWVkQ2VsbHNbaV0gfHwgW107XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29sVG90YWxzLmZvckVhY2goZnVuY3Rpb24gKGMsIGopIHtcclxuICAgICAgICAgICAgY1QgKz0gYztcclxuICAgICAgICAgICAgc2VlZENlbGxzLmZvckVhY2goZnVuY3Rpb24gKHJvdywgaykge1xyXG4gICAgICAgICAgICAgICAgc2VlZENlbGxzW2tdW2pdID0gc2VlZENlbGxzW2tdW2pdIHx8IE1hdGgucm91bmQocm93VG90YWxzW2tdIC8gcm93VG90YWxzLmxlbmd0aCArIChjb2xUb3RhbHNbal0gLyBjb2xUb3RhbHMubGVuZ3RoKSAvIDIgKiBNYXRoLnJhbmRvbSgpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKHJUID09PSBjVCkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpdGVyID0gMDsgaXRlciA8IGl0ZXJhdGlvbnM7IGl0ZXIrKykge1xyXG4gICAgICAgICAgICAgICAgc2VlZENlbGxzLmZvckVhY2goZnVuY3Rpb24gKHJvdywgaWkpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudFJvd1RvdGFsID0gMDtcclxuICAgICAgICAgICAgICAgICAgICByb3cuZm9yRWFjaChmdW5jdGlvbiAoY2VsbCwgaikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50Um93VG90YWwgKz0gY2VsbDtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICByb3cuZm9yRWFjaChmdW5jdGlvbiAoY2VsbCwgamopIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VlZENlbGxzW2lpXVtqal0gPSBjZWxsIC8gY3VycmVudFJvd1RvdGFsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWVkQ2VsbHNbaWldW2pqXSAqPSByb3dUb3RhbHNbaWldO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBjb2xUb3RhbHMubGVuZ3RoOyBjb2wrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50Q29sVG90YWwgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlZWRDZWxscy5mb3JFYWNoKGZ1bmN0aW9uIChyLCBrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRDb2xUb3RhbCArPSByW2NvbF07XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VlZENlbGxzLmZvckVhY2goZnVuY3Rpb24gKHJvdywga2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VlZENlbGxzW2trXVtjb2xdID0gcm93W2NvbF0gLyBjdXJyZW50Q29sVG90YWw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZWRDZWxsc1tra11bY29sXSAqPSBjb2xUb3RhbHNbY29sXTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc2VlZENlbGxzO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1lcGkuanMubWFwIiwiLyoqIEV2ZW50cyBjbGFzcyBpbmNsdWRlcyBtZXRob2RzIGZvciBvcmdhbml6aW5nIGV2ZW50cy5cclxuKlxyXG4qL1xyXG5leHBvcnQgY2xhc3MgRXZlbnRzIHtcclxuICAgIGNvbnN0cnVjdG9yKGV2ZW50cyA9IFtdKSB7XHJcbiAgICAgICAgdGhpcy5xdWV1ZSA9IFtdO1xyXG4gICAgICAgIHRoaXMuc2NoZWR1bGUoZXZlbnRzKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgKiBzY2hlZHVsZSBhbiBldmVudCB3aXRoIHRoZSBzYW1lIHRyaWdnZXIgbXVsdGlwbGUgdGltZXMuXHJcbiAgICAqIEBwYXJhbSBxZXZlbnQgaXMgdGhlIGV2ZW50IHRvIGJlIHNjaGVkdWxlZC4gVGhlIGF0IHBhcmFtZXRlciBzaG91bGQgY29udGFpbiB0aGUgdGltZSBhdCBmaXJzdCBpbnN0YW5jZS5cclxuICAgICogQHBhcmFtIGV2ZXJ5IGludGVydmFsIGZvciBlYWNoIG9jY3VybmNlXHJcbiAgICAqIEBwYXJhbSBlbmQgdW50aWxcclxuICAgICovXHJcbiAgICBzY2hlZHVsZVJlY3VycmluZyhxZXZlbnQsIGV2ZXJ5LCBlbmQpIHtcclxuICAgICAgICB2YXIgcmVjdXIgPSBbXTtcclxuICAgICAgICB2YXIgZHVyYXRpb24gPSBlbmQgLSBxZXZlbnQuYXQ7XHJcbiAgICAgICAgdmFyIG9jY3VyZW5jZXMgPSBNYXRoLmZsb29yKGR1cmF0aW9uIC8gZXZlcnkpO1xyXG4gICAgICAgIGlmICghcWV2ZW50LnVudGlsKSB7XHJcbiAgICAgICAgICAgIHFldmVudC51bnRpbCA9IHFldmVudC5hdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gb2NjdXJlbmNlczsgaSsrKSB7XHJcbiAgICAgICAgICAgIHJlY3VyLnB1c2goeyBuYW1lOiBxZXZlbnQubmFtZSArIGksIGF0OiBxZXZlbnQuYXQgKyAoaSAqIGV2ZXJ5KSwgdW50aWw6IHFldmVudC51bnRpbCArIChpICogZXZlcnkpLCB0cmlnZ2VyOiBxZXZlbnQudHJpZ2dlciwgdHJpZ2dlcmVkOiBmYWxzZSB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zY2hlZHVsZShyZWN1cik7XHJcbiAgICB9XHJcbiAgICAvKlxyXG4gICAgKiBzY2hlZHVsZSBhIG9uZSB0aW1lIGV2ZW50cy4gdGhpcyBhcnJhbmdlcyB0aGUgZXZlbnQgcXVldWUgaW4gY2hyb25vbG9naWNhbCBvcmRlci5cclxuICAgICogQHBhcmFtIHFldmVudHMgYW4gYXJyYXkgb2YgZXZlbnRzIHRvIGJlIHNjaGVkdWxlcy5cclxuICAgICovXHJcbiAgICBzY2hlZHVsZShxZXZlbnRzKSB7XHJcbiAgICAgICAgcWV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgIGQudW50aWwgPSBkLnVudGlsIHx8IGQuYXQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5xdWV1ZSA9IHRoaXMucXVldWUuY29uY2F0KHFldmVudHMpO1xyXG4gICAgICAgIHRoaXMucXVldWUgPSB0aGlzLm9yZ2FuaXplKHRoaXMucXVldWUsIDAsIHRoaXMucXVldWUubGVuZ3RoKTtcclxuICAgIH1cclxuICAgIHBhcnRpdGlvbihhcnJheSwgbGVmdCwgcmlnaHQpIHtcclxuICAgICAgICB2YXIgY21wID0gYXJyYXlbcmlnaHQgLSAxXS5hdCwgbWluRW5kID0gbGVmdCwgbWF4RW5kO1xyXG4gICAgICAgIGZvciAobWF4RW5kID0gbGVmdDsgbWF4RW5kIDwgcmlnaHQgLSAxOyBtYXhFbmQgKz0gMSkge1xyXG4gICAgICAgICAgICBpZiAoYXJyYXlbbWF4RW5kXS5hdCA8PSBjbXApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3dhcChhcnJheSwgbWF4RW5kLCBtaW5FbmQpO1xyXG4gICAgICAgICAgICAgICAgbWluRW5kICs9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zd2FwKGFycmF5LCBtaW5FbmQsIHJpZ2h0IC0gMSk7XHJcbiAgICAgICAgcmV0dXJuIG1pbkVuZDtcclxuICAgIH1cclxuICAgIHN3YXAoYXJyYXksIGksIGopIHtcclxuICAgICAgICB2YXIgdGVtcCA9IGFycmF5W2ldO1xyXG4gICAgICAgIGFycmF5W2ldID0gYXJyYXlbal07XHJcbiAgICAgICAgYXJyYXlbal0gPSB0ZW1wO1xyXG4gICAgICAgIHJldHVybiBhcnJheTtcclxuICAgIH1cclxuICAgIG9yZ2FuaXplKGV2ZW50cywgbGVmdCwgcmlnaHQpIHtcclxuICAgICAgICBpZiAobGVmdCA8IHJpZ2h0KSB7XHJcbiAgICAgICAgICAgIHZhciBwID0gdGhpcy5wYXJ0aXRpb24oZXZlbnRzLCBsZWZ0LCByaWdodCk7XHJcbiAgICAgICAgICAgIHRoaXMub3JnYW5pemUoZXZlbnRzLCBsZWZ0LCBwKTtcclxuICAgICAgICAgICAgdGhpcy5vcmdhbml6ZShldmVudHMsIHAgKyAxLCByaWdodCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBldmVudHM7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZXZlbnRzLmpzLm1hcCIsImltcG9ydCB7IFFDb21wb25lbnQgfSBmcm9tICcuL1FDb21wb25lbnQnO1xyXG5leHBvcnQgY2xhc3MgU3RhdGVNYWNoaW5lIGV4dGVuZHMgUUNvbXBvbmVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBzdGF0ZXMsIHRyYW5zaXRpb25zLCBjb25kaXRpb25zLCBkYXRhKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSk7XHJcbiAgICAgICAgdGhpcy5zdGF0ZXMgPSBzdGF0ZXM7XHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9ucyA9IHRoaXMuY2hlY2tUcmFuc2l0aW9ucyh0cmFuc2l0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5jb25kaXRpb25zID0gY29uZGl0aW9ucztcclxuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlKGFnZW50LCBzdGVwKSB7XHJcbiAgICAgICAgZm9yICh2YXIgcyBpbiBhZ2VudC5zdGF0ZXMpIHtcclxuICAgICAgICAgICAgbGV0IHN0YXRlID0gYWdlbnQuc3RhdGVzW3NdO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXRlc1tzdGF0ZV0oYWdlbnQsIHN0ZXApO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudHJhbnNpdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy50cmFuc2l0aW9uc1tpXS5mcm9tLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRyYW5zID0gdGhpcy50cmFuc2l0aW9uc1tpXS5mcm9tW2pdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmFucyA9PT0gc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHZhbHVlLCByO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY29uZCA9IHRoaXMuY29uZGl0aW9uc1t0aGlzLnRyYW5zaXRpb25zW2ldLm5hbWVdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIChjb25kLnZhbHVlKSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBjb25kLnZhbHVlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGNvbmQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgciA9IGNvbmQuY2hlY2soYWdlbnRbY29uZC5rZXldLCB2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyID09PSBTdGF0ZU1hY2hpbmUuU1VDQ0VTUykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWdlbnQuc3RhdGVzW3NdID0gdGhpcy50cmFuc2l0aW9uc1tpXS50bztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFnZW50W3RoaXMudHJhbnNpdGlvbnNbaV0udG9dID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFnZW50W3RoaXMudHJhbnNpdGlvbnNbaV0uZnJvbVtqXV0gPSBmYWxzZTsgLy9mb3IgZWFzaWVyIHJlcG9ydGluZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY2hlY2tUcmFuc2l0aW9ucyh0cmFuc2l0aW9ucykge1xyXG4gICAgICAgIGZvciAodmFyIHQgPSAwOyB0IDwgdHJhbnNpdGlvbnMubGVuZ3RoOyB0KyspIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0cmFuc2l0aW9uc1t0XS5mcm9tID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbnNbdF0uZnJvbSA9IFt0cmFuc2l0aW9uc1t0XS5mcm9tXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJhbnNpdGlvbnM7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c3RhdGVNYWNoaW5lLmpzLm1hcCIsImNsYXNzIFJhbmRvbSB7XHJcbiAgICBjb25zdHJ1Y3RvcihzZWVkKSB7XHJcbiAgICAgICAgdGhpcy51bmlmb3JtID0gdGhpcy5yYW5kUmFuZ2U7XHJcbiAgICAgICAgdGhpcy5zZWVkID0gc2VlZDtcclxuICAgICAgICB0aGlzLmNhbGxlZCA9IDA7XHJcbiAgICB9XHJcbiAgICByYW5kUmFuZ2UobWluLCBtYXgpIHtcclxuICAgICAgICByZXR1cm4gKG1heCAtIG1pbikgKiB0aGlzLnJhbmRvbSgpICsgbWluO1xyXG4gICAgfVxyXG4gICAgbWF0KHJvd3MsIGNvbHMsIGRpc3QgPSAncmFuZG9tJykge1xyXG4gICAgICAgIGxldCByYW5kcyA9IFtdO1xyXG4gICAgICAgIGlmICh0eXBlb2Ygcm93cyA9PSAnbnVtYmVyJyAmJiB0eXBlb2YgY29scyA9PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCByID0gMDsgciA8IHJvd3M7IHIrKykge1xyXG4gICAgICAgICAgICAgICAgcmFuZHNbcl0gPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgY29sczsgYysrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmFuZHNbcl1bY10gPSB0aGlzW2Rpc3RdKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJhbmRzO1xyXG4gICAgfVxyXG4gICAgYXJyYXkobiwgZGlzdCA9ICdyYW5kb20nKSB7XHJcbiAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgIGxldCByYW5kcyA9IFtdO1xyXG4gICAgICAgIHdoaWxlIChpIDwgbikge1xyXG4gICAgICAgICAgICByYW5kc1tpXSA9IHRoaXNbZGlzdF0oKTtcclxuICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmFuZHM7XHJcbiAgICB9XHJcbiAgICBwaWNrKGFycmF5LCBwcm9iYWJpbGl0aWVzKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBwcm9iYWJpbGl0aWVzID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICByZXR1cm4gYXJyYXlbTWF0aC5mbG9vcih0aGlzLnJhbmRvbSgpICogYXJyYXkubGVuZ3RoKV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoalN0YXQuc3VtKHByb2JhYmlsaXRpZXMpID09IDEuMCkge1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGFycmF5Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgaWR4ID0gTWF0aC5mbG9vcih0aGlzLnJhbmRvbSgpICogYXJyYXkubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5yYW5kb20oKSA8IHByb2JhYmlsaXRpZXNbaWR4XSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXJyYXlbaWR4XTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignc3VtIG9mIHByb2JhYmlsaXRpZXMgYXJyYXkgZGlkIG5vdCBlcXVhbCAxJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICpCZWxvdyBpcyBhZGFwdGVkIGZyb20galN0YXQ6aHR0cHM6Ly9naXRodWIuY29tL2pzdGF0L2pzdGF0L2Jsb2IvbWFzdGVyL3NyYy9zcGVjaWFsLmpzXHJcbiAgICAqKi9cclxuICAgIHJhbmRuKCkge1xyXG4gICAgICAgIHZhciB1LCB2LCB4LCB5LCBxO1xyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgdSA9IHRoaXMucmFuZG9tKCk7XHJcbiAgICAgICAgICAgIHYgPSAxLjcxNTYgKiAodGhpcy5yYW5kb20oKSAtIDAuNSk7XHJcbiAgICAgICAgICAgIHggPSB1IC0gMC40NDk4NzE7XHJcbiAgICAgICAgICAgIHkgPSBNYXRoLmFicyh2KSArIDAuMzg2NTk1O1xyXG4gICAgICAgICAgICBxID0geCAqIHggKyB5ICogKDAuMTk2MDAgKiB5IC0gMC4yNTQ3MiAqIHgpO1xyXG4gICAgICAgIH0gd2hpbGUgKHEgPiAwLjI3NTk3ICYmIChxID4gMC4yNzg0NiB8fCB2ICogdiA+IC00ICogTWF0aC5sb2codSkgKiB1ICogdSkpO1xyXG4gICAgICAgIHJldHVybiB2IC8gdTtcclxuICAgIH1cclxuICAgIHJhbmRnKHNoYXBlKSB7XHJcbiAgICAgICAgdmFyIG9hbHBoID0gc2hhcGU7XHJcbiAgICAgICAgdmFyIGExLCBhMiwgdSwgdiwgeDtcclxuICAgICAgICBpZiAoIXNoYXBlKVxyXG4gICAgICAgICAgICBzaGFwZSA9IDE7XHJcbiAgICAgICAgaWYgKHNoYXBlIDwgMSlcclxuICAgICAgICAgICAgc2hhcGUgKz0gMTtcclxuICAgICAgICBhMSA9IHNoYXBlIC0gMSAvIDM7XHJcbiAgICAgICAgYTIgPSAxIC8gTWF0aC5zcXJ0KDkgKiBhMSk7XHJcbiAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICB4ID0gdGhpcy5yYW5kbigpO1xyXG4gICAgICAgICAgICAgICAgdiA9IDEgKyBhMiAqIHg7XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKHYgPD0gMCk7XHJcbiAgICAgICAgICAgIHYgPSB2ICogdiAqIHY7XHJcbiAgICAgICAgICAgIHUgPSB0aGlzLnJhbmRvbSgpO1xyXG4gICAgICAgIH0gd2hpbGUgKHUgPiAxIC0gMC4zMzEgKiBNYXRoLnBvdyh4LCA0KSAmJlxyXG4gICAgICAgICAgICBNYXRoLmxvZyh1KSA+IDAuNSAqIHggKiB4ICsgYTEgKiAoMSAtIHYgKyBNYXRoLmxvZyh2KSkpO1xyXG4gICAgICAgIC8vIGFscGhhID4gMVxyXG4gICAgICAgIGlmIChzaGFwZSA9PSBvYWxwaClcclxuICAgICAgICAgICAgcmV0dXJuIGExICogdjtcclxuICAgICAgICAvLyBhbHBoYSA8IDFcclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIHUgPSB0aGlzLnJhbmRvbSgpO1xyXG4gICAgICAgIH0gd2hpbGUgKHUgPT09IDApO1xyXG4gICAgICAgIHJldHVybiBNYXRoLnBvdyh1LCAxIC8gb2FscGgpICogYTEgKiB2O1xyXG4gICAgfVxyXG4gICAgYmV0YShhbHBoYSwgYmV0YSkge1xyXG4gICAgICAgIHZhciB1ID0gdGhpcy5yYW5kZyhhbHBoYSk7XHJcbiAgICAgICAgcmV0dXJuIHUgLyAodSArIHRoaXMucmFuZGcoYmV0YSkpO1xyXG4gICAgfVxyXG4gICAgZ2FtbWEoc2hhcGUsIHNjYWxlKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmFuZGcoc2hhcGUpICogc2NhbGU7XHJcbiAgICB9XHJcbiAgICBsb2dOb3JtYWwobXUsIHNpZ21hKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguZXhwKHRoaXMucmFuZG4oKSAqIHNpZ21hICsgbXUpO1xyXG4gICAgfVxyXG4gICAgbm9ybWFsKG1lYW4gPSAwLCBzdGQgPSAxKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmFuZG4oKSAqIHN0ZCArIG1lYW47XHJcbiAgICB9XHJcbiAgICBwb2lzc29uKGwpIHtcclxuICAgICAgICB2YXIgcCA9IDEsIGsgPSAwLCBMID0gTWF0aC5leHAoLWwpO1xyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgaysrO1xyXG4gICAgICAgICAgICBwICo9IHRoaXMucmFuZG9tKCk7XHJcbiAgICAgICAgfSB3aGlsZSAocCA+IEwpO1xyXG4gICAgICAgIHJldHVybiBrIC0gMTtcclxuICAgIH1cclxuICAgIHQoZG9mKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmFuZG4oKSAqIE1hdGguc3FydChkb2YgLyAoMiAqIHRoaXMucmFuZGcoZG9mIC8gMikpKTtcclxuICAgIH1cclxuICAgIHdlaWJ1bGwoc2NhbGUsIHNoYXBlKSB7XHJcbiAgICAgICAgcmV0dXJuIHNjYWxlICogTWF0aC5wb3coLU1hdGgubG9nKHRoaXMucmFuZG9tKCkpLCAxIC8gc2hhcGUpO1xyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4qIEJvYiBKZW5raW5zJyBzbWFsbCBub25jcnlwdG9ncmFwaGljIFBSTkcgKHBzZXVkb3JhbmRvbSBudW1iZXIgZ2VuZXJhdG9yKSBwb3J0ZWQgdG8gSmF2YVNjcmlwdFxyXG4qIGFkYXB0ZWQgZnJvbTpcclxuKiBodHRwczovL2dpdGh1Yi5jb20vZ3JhdWUvYnVydGxlcHJuZ1xyXG4qIHdoaWNoIGlzIGZyb20gaHR0cDovL3d3dy5idXJ0bGVidXJ0bGUubmV0L2JvYi9yYW5kL3NtYWxscHJuZy5odG1sXHJcbiovXHJcbmV4cG9ydCBjbGFzcyBSTkdCdXJ0bGUgZXh0ZW5kcyBSYW5kb20ge1xyXG4gICAgY29uc3RydWN0b3Ioc2VlZCkge1xyXG4gICAgICAgIHN1cGVyKHNlZWQpO1xyXG4gICAgICAgIHRoaXMuc2VlZCA+Pj49IDA7XHJcbiAgICAgICAgdGhpcy5jdHggPSBuZXcgQXJyYXkoNCk7XHJcbiAgICAgICAgdGhpcy5jdHhbMF0gPSAweGYxZWE1ZWVkO1xyXG4gICAgICAgIHRoaXMuY3R4WzFdID0gdGhpcy5jdHhbMl0gPSB0aGlzLmN0eFszXSA9IHRoaXMuc2VlZDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDIwOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5yYW5kb20oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByb3QoeCwgaykge1xyXG4gICAgICAgIHJldHVybiAoeCA8PCBrKSB8ICh4ID4+ICgzMiAtIGspKTtcclxuICAgIH1cclxuICAgIHJhbmRvbSgpIHtcclxuICAgICAgICB2YXIgY3R4ID0gdGhpcy5jdHg7XHJcbiAgICAgICAgdmFyIGUgPSAoY3R4WzBdIC0gdGhpcy5yb3QoY3R4WzFdLCAyNykpID4+PiAwO1xyXG4gICAgICAgIGN0eFswXSA9IChjdHhbMV0gXiB0aGlzLnJvdChjdHhbMl0sIDE3KSkgPj4+IDA7XHJcbiAgICAgICAgY3R4WzFdID0gKGN0eFsyXSArIGN0eFszXSkgPj4+IDA7XHJcbiAgICAgICAgY3R4WzJdID0gKGN0eFszXSArIGUpID4+PiAwO1xyXG4gICAgICAgIGN0eFszXSA9IChlICsgY3R4WzBdKSA+Pj4gMDtcclxuICAgICAgICB0aGlzLmNhbGxlZCArPSAxO1xyXG4gICAgICAgIHJldHVybiBjdHhbM10gLyA0Mjk0OTY3Mjk2LjA7XHJcbiAgICB9XHJcbn1cclxuLypcclxuKiB4b3JzaGlmdDcqLCBieSBGcmFuw6dvaXMgUGFubmV0b24gYW5kIFBpZXJyZSBMJ2VjdXllcjogMzItYml0IHhvci1zaGlmdCByYW5kb20gbnVtYmVyIGdlbmVyYXRvclxyXG4qIGFkZHMgcm9idXN0bmVzcyBieSBhbGxvd2luZyBtb3JlIHNoaWZ0cyB0aGFuIE1hcnNhZ2xpYSdzIG9yaWdpbmFsIHRocmVlLiBJdCBpcyBhIDctc2hpZnQgZ2VuZXJhdG9yIHdpdGggMjU2IGJpdHMsIHRoYXQgcGFzc2VzIEJpZ0NydXNoIHdpdGggbm8gc3lzdG1hdGljIGZhaWx1cmVzLlxyXG4qIEFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vZGF2aWRiYXUveHNyYW5kXHJcbiovXHJcbmV4cG9ydCBjbGFzcyBSTkd4b3JzaGlmdDcgZXh0ZW5kcyBSYW5kb20ge1xyXG4gICAgY29uc3RydWN0b3Ioc2VlZCkge1xyXG4gICAgICAgIGxldCBqLCB3LCBYID0gW107XHJcbiAgICAgICAgc3VwZXIoc2VlZCk7XHJcbiAgICAgICAgLy8gU2VlZCBzdGF0ZSBhcnJheSB1c2luZyBhIDMyLWJpdCBpbnRlZ2VyLlxyXG4gICAgICAgIHcgPSBYWzBdID0gdGhpcy5zZWVkO1xyXG4gICAgICAgIC8vIEVuZm9yY2UgYW4gYXJyYXkgbGVuZ3RoIG9mIDgsIG5vdCBhbGwgemVyb2VzLlxyXG4gICAgICAgIHdoaWxlIChYLmxlbmd0aCA8IDgpIHtcclxuICAgICAgICAgICAgWC5wdXNoKDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGogPSAwOyBqIDwgOCAmJiBYW2pdID09PSAwOyArK2opIHtcclxuICAgICAgICAgICAgaWYgKGogPT0gOCkge1xyXG4gICAgICAgICAgICAgICAgdyA9IFhbN10gPSAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHcgPSBYW2pdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMueCA9IFg7XHJcbiAgICAgICAgdGhpcy5pID0gMDtcclxuICAgICAgICAvLyBEaXNjYXJkIGFuIGluaXRpYWwgMjU2IHZhbHVlcy5cclxuICAgICAgICBmb3IgKGogPSAyNTY7IGogPiAwOyAtLWopIHtcclxuICAgICAgICAgICAgdGhpcy5yYW5kb20oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByYW5kb20oKSB7XHJcbiAgICAgICAgbGV0IFggPSB0aGlzLngsIGkgPSB0aGlzLmksIHQsIHYsIHcsIHJlcztcclxuICAgICAgICB0ID0gWFtpXTtcclxuICAgICAgICB0IF49ICh0ID4+PiA3KTtcclxuICAgICAgICB2ID0gdCBeICh0IDw8IDI0KTtcclxuICAgICAgICB0ID0gWFsoaSArIDEpICYgN107XHJcbiAgICAgICAgdiBePSB0IF4gKHQgPj4+IDEwKTtcclxuICAgICAgICB0ID0gWFsoaSArIDMpICYgN107XHJcbiAgICAgICAgdiBePSB0IF4gKHQgPj4+IDMpO1xyXG4gICAgICAgIHQgPSBYWyhpICsgNCkgJiA3XTtcclxuICAgICAgICB2IF49IHQgXiAodCA8PCA3KTtcclxuICAgICAgICB0ID0gWFsoaSArIDcpICYgN107XHJcbiAgICAgICAgdCA9IHQgXiAodCA8PCAxMyk7XHJcbiAgICAgICAgdiBePSB0IF4gKHQgPDwgOSk7XHJcbiAgICAgICAgWFtpXSA9IHY7XHJcbiAgICAgICAgdGhpcy5pID0gKGkgKyAxKSAmIDc7XHJcbiAgICAgICAgcmVzID0gKHYgPj4+IDApIC8gKCgxIDw8IDMwKSAqIDQpO1xyXG4gICAgICAgIHRoaXMuY2FsbGVkICs9IDE7XHJcbiAgICAgICAgcmV0dXJuIHJlcztcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1yYW5kb20uanMubWFwIiwiaW1wb3J0IHsgZ2VuZXJhdGVVVUlELCBnZW5lcmF0ZVBvcCwgYWRkUmVzb3VyY2VzLCBhc3NpZ25QYXJhbSwgTWF0Y2ggfSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IHsgUGF0Y2gsIENvbXBhcnRtZW50TW9kZWwgfSBmcm9tICcuL2NvbXBhcnRtZW50JztcclxuaW1wb3J0IHsgRW52aXJvbm1lbnQgfSBmcm9tICcuL2Vudmlyb25tZW50JztcclxuaW1wb3J0IHsgU3RhdGVNYWNoaW5lIH0gZnJvbSAnLi9zdGF0ZU1hY2hpbmUnO1xyXG5pbXBvcnQgeyBSTkdCdXJ0bGUsIFJOR3hvcnNoaWZ0NyB9IGZyb20gJy4vcmFuZG9tJztcclxuLyoqXHJcbipCYXRjaCBydW4gZW52aXJvbm1lbnRzXHJcbiovXHJcbmV4cG9ydCBjbGFzcyBFeHBlcmltZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKGVudmlyb25tZW50LCBzZXR1cCwgdGFyZ2V0KSB7XHJcbiAgICAgICAgdGhpcy50eXBlID0gJ3N3ZWVwJztcclxuICAgICAgICB0aGlzLmVudmlyb25tZW50ID0gZW52aXJvbm1lbnQ7XHJcbiAgICAgICAgdGhpcy5zZXR1cCA9IHNldHVwO1xyXG4gICAgICAgIHRoaXMucm5nID0gc2V0dXAuZXhwZXJpbWVudC5ybmcgPT09ICd4b3JzaGlmdDcnID8gbmV3IFJOR3hvcnNoaWZ0NyhzZXR1cC5leHBlcmltZW50LnNlZWQpIDogbmV3IFJOR0J1cnRsZShzZXR1cC5leHBlcmltZW50LnNlZWQpO1xyXG4gICAgICAgIHRoaXMuZXhwZXJpbWVudExvZyA9IFtdO1xyXG4gICAgICAgIHRoaXMuY3VycmVudENGRyA9IHt9O1xyXG4gICAgICAgIHRoaXMuZ2VuTG9nID0gW107XHJcbiAgICB9XHJcbiAgICBzdGFydChydW5zLCBzdGVwLCB1bnRpbCwgcHJlcENCKSB7XHJcbiAgICAgICAgdmFyIHIgPSAwO1xyXG4gICAgICAgIHJ1bnMgPSBydW5zICogdGhpcy5zZXR1cC5leHBlcmltZW50LnNpemU7XHJcbiAgICAgICAgd2hpbGUgKHIgPCBydW5zKSB7XHJcbiAgICAgICAgICAgIHRoaXMucHJlcChyLCB0aGlzLnNldHVwLCBwcmVwQ0IpO1xyXG4gICAgICAgICAgICB0aGlzLmVudmlyb25tZW50LnRpbWUgPSAwOyAvL1xyXG4gICAgICAgICAgICB0aGlzLmVudmlyb25tZW50LnJ1bihzdGVwLCB1bnRpbCwgMCk7XHJcbiAgICAgICAgICAgIHRoaXMuZXhwZXJpbWVudExvZ1tyXSA9IHRoaXMucmVwb3J0KHIsIHRoaXMuc2V0dXApO1xyXG4gICAgICAgICAgICB0aGlzLmFmdGVyKHIsIHRoaXMuc2V0dXApO1xyXG4gICAgICAgICAgICBpZiAociAlIHRoaXMuc2V0dXAuZXhwZXJpbWVudC5zaXplID09PSAwICYmIHIgIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW5kR2VuKHIsIHRoaXMuc2V0dXApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHIrKztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcmVwKHIsIGNmZywgY2IpIHtcclxuICAgICAgICB0aGlzLnBhcnNlQ0ZHKGNmZyk7XHJcbiAgICAgICAgaWYgKGNiICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgY2IoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbmRHZW4ocnVuLCBjZmcpIHtcclxuICAgICAgICBsZXQgcHJldlN0YXJ0ID0gTWF0aC5taW4oMCwgcnVuIC0gY2ZnLmV4cGVyaW1lbnQuc2l6ZSk7XHJcbiAgICAgICAgdGhpcy5nZW5Mb2cucHVzaCh0aGlzLmdlbkF2Zyh0aGlzLmV4cGVyaW1lbnRMb2cuc2xpY2UocHJldlN0YXJ0LCBydW4pLCBjZmcpKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZUFzc2lnbm1lbnQoY2ZnLCBjZmcuZXhwZXJpbWVudC5wYXJhbXMpO1xyXG4gICAgfVxyXG4gICAgcGFyc2VDRkcoY2ZnKSB7XHJcbiAgICAgICAgbGV0IGdyb3VwcyA9IHt9O1xyXG4gICAgICAgIGxldCBjdXJyZW50QWdlbnRJZCA9IDA7XHJcbiAgICAgICAgY2ZnID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjZmcpKTtcclxuICAgICAgICBjZmcuYm91bmRhcmllcyA9IHt9O1xyXG4gICAgICAgIHRoaXMuZW52aXJvbm1lbnQgPSBuZXcgRW52aXJvbm1lbnQoKTtcclxuICAgICAgICB0aGlzLmVudmlyb25tZW50LnJuZyA9IHRoaXMucm5nO1xyXG4gICAgICAgIGlmICgnYWdlbnRzJyBpbiBjZmcpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgZ3JOYW1lIGluIGNmZy5hZ2VudHMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBncm91cCA9IGNmZy5hZ2VudHNbZ3JOYW1lXTtcclxuICAgICAgICAgICAgICAgIGdyb3VwLnBhcmFtcy5ncm91cE5hbWUgPSBnck5hbWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVudmlyb25tZW50LmJvdW5kYXJpZXNbZ3JOYW1lXSA9IGdyb3VwLmJvdW5kYXJpZXM7XHJcbiAgICAgICAgICAgICAgICBncm91cHNbZ3JOYW1lXSA9IGdlbmVyYXRlUG9wKGdyb3VwLmNvdW50LCBncm91cC5wYXJhbXMsIGNmZy5lbnZpcm9ubWVudC5zcGF0aWFsVHlwZSwgZ3JvdXAuYm91bmRhcmllcywgY3VycmVudEFnZW50SWQsIHRoaXMucm5nKTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRBZ2VudElkID0gZ3JvdXBzW2dyTmFtZV1bZ3JvdXBzW2dyTmFtZV0ubGVuZ3RoIC0gMV0uaWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCdwYXRjaGVzJyBpbiBjZmcpIHtcclxuICAgICAgICAgICAgY2ZnLnBhdGNoZXMuZm9yRWFjaCgocGF0Y2gpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW52aXJvbm1lbnQuYm91bmRhcmllc1twYXRjaC5uYW1lXSA9IHBhdGNoLmJvdW5kYXJpZXM7XHJcbiAgICAgICAgICAgICAgICBwYXRjaC5wYXJhbXMgPSB7IGdyb3VwTmFtZTogcGF0Y2gubmFtZSB9O1xyXG4gICAgICAgICAgICAgICAgZ3JvdXBzW3BhdGNoLm5hbWVdID0gZ2VuZXJhdGVQb3AoMSwgcGF0Y2gucGFyYW1zLCBjZmcuZW52aXJvbm1lbnQuc3BhdGlhbFR5cGUsIHBhdGNoLmJvdW5kYXJpZXMsIGN1cnJlbnRBZ2VudElkLCB0aGlzLnJuZyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoJ3Jlc291cmNlcycgaW4gY2ZnKSB7XHJcbiAgICAgICAgICAgIGxldCByZXNvdXJjZXMgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgcnNjIGluIGNmZy5yZXNvdXJjZXMpIHtcclxuICAgICAgICAgICAgICAgIHJlc291cmNlcyA9IGFkZFJlc291cmNlcyhyZXNvdXJjZXMsIGNmZy5yZXNvdXJjZXNbcnNjXSwgY2ZnLnJlc291cmNlc1tyc2NdLnF1YW50aXR5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmVudmlyb25tZW50LnJlc291cmNlcyA9IHJlc291cmNlcztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCdlbnRpdGllcycgaW4gY2ZnKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGVudGl0eSBpbiBjZmcuZW50aXRpZXMpIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IG1ldGhvZCBpbiBjZmcuZW50aXRpZXNbZW50aXR5XS5tZXRob2RzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgcCBpbiBjZmcuZW50aXRpZXNbZW50aXR5XS5wYXJhbXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9jb3B5IHRvIG91dHNpZGUgZm9yIGV4dGVybmFsIHJlZmVyZW5jZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2ZnLmVudGl0aWVzW2VudGl0eV1bcF0gPSBjZmcuZW50aXRpZXNbZW50aXR5XS5wYXJhbXNbcF0uYXNzaWduO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjZmcuZW50aXRpZXNbZW50aXR5XS5tZXRob2RzW21ldGhvZF0gPSBRQWN0aW9uc1ttZXRob2RdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC5lbnRpdGllc1tlbnRpdHldID0gY2ZnLmVudGl0aWVzW2VudGl0eV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY2ZnLmNvbXBvbmVudHMuZm9yRWFjaCgoY21wKSA9PiB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoY21wLnR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3N0YXRlLW1hY2hpbmUnOlxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHN0YXRlIGluIGNtcC5zdGF0ZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY21wLnN0YXRlc1tzdGF0ZV0gPSBRQWN0aW9uc1tjbXAuc3RhdGVzW3N0YXRlXV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGNvbmQgaW4gY21wLmNvbmRpdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY21wLmNvbmRpdGlvbnNbY29uZF0uY2hlY2sgPSBNYXRjaFtjbXAuY29uZGl0aW9uc1tjb25kXS5jaGVja107XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzbSA9IG5ldyBTdGF0ZU1hY2hpbmUoY21wLm5hbWUsIGNtcC5zdGF0ZXMsIGNtcC50cmFuc2l0aW9ucywgY21wLmNvbmRpdGlvbnMsIGdyb3Vwc1tjbXAuYWdlbnRzXVswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC5hZGQoc20pO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnY29tcGFydG1lbnRhbCc6XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGNoZXMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBjZmcucGF0Y2hlcy5mb3JFYWNoKChwYXRjaCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY21wLnBhdGNoZXMuaW5kZXhPZihwYXRjaC5uYW1lKSAhPSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgY29tcGFydG1lbnQgaW4gY21wLmNvbXBhcnRtZW50cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNtcC5jb21wYXJ0bWVudHNbY29tcGFydG1lbnRdLm9wZXJhdGlvbiA9IFFBY3Rpb25zW2NtcC5jb21wYXJ0bWVudHNbY29tcGFydG1lbnRdLm9wZXJhdGlvbl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcCA9IG5ldyBQYXRjaChwYXRjaC5uYW1lLCBjbXAuY29tcGFydG1lbnRzLCBwYXRjaC5wb3B1bGF0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm91cHNbcGF0Y2gubmFtZV1bMF1bMF0gPSBPYmplY3QuYXNzaWduKGdyb3Vwc1twYXRjaC5uYW1lXVswXVswXSwgcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRjaGVzLnB1c2goZ3JvdXBzW3BhdGNoLm5hbWVdWzBdWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjTW9kZWwgPSBuZXcgQ29tcGFydG1lbnRNb2RlbChjbXAubmFtZSwgY21wLmNvbXBhcnRtZW50cywgcGF0Y2hlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC5hZGQoY01vZGVsKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2V2ZXJ5LXN0ZXAnOlxyXG4gICAgICAgICAgICAgICAgICAgIGNtcC5hY3Rpb24gPSBRQWN0aW9uc1tjbXAuYWN0aW9uXTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVudmlyb25tZW50LmFkZCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBnZW5lcmF0ZVVVSUQoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY21wLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZTogY21wLmFjdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZ3JvdXBzW2NtcC5hZ2VudHNdWzBdXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICByZXBvcnQociwgY2ZnKSB7XHJcbiAgICAgICAgbGV0IHN1bXMgPSB7fTtcclxuICAgICAgICBsZXQgbWVhbnMgPSB7fTtcclxuICAgICAgICBsZXQgZnJlcXMgPSB7fTtcclxuICAgICAgICBsZXQgbW9kZWwgPSB7fTtcclxuICAgICAgICBsZXQgY291bnQgPSB0aGlzLmVudmlyb25tZW50LmFnZW50cy5sZW5ndGg7XHJcbiAgICAgICAgLy9jZmcucmVwb3J0LnN1bSA9IGNmZy5yZXBvcnQuc3VtLmNvbmNhdChjZmcucmVwb3J0Lm1lYW4pO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5lbnZpcm9ubWVudC5hZ2VudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGQgPSB0aGlzLmVudmlyb25tZW50LmFnZW50c1tpXTtcclxuICAgICAgICAgICAgY2ZnLnJlcG9ydC5zdW1zLmZvckVhY2goKHMpID0+IHtcclxuICAgICAgICAgICAgICAgIHN1bXNbc10gPSBzdW1zW3NdID09IHVuZGVmaW5lZCA/IGRbc10gOiBkW3NdICsgc3Vtc1tzXTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNmZy5yZXBvcnQuZnJlcXMuZm9yRWFjaCgoZikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBkW2ZdID09PSAnbnVtYmVyJyB8fCB0eXBlb2YgZFtmXSA9PT0gJ2Jvb2xlYW4nICYmICFpc05hTihkW2ZdKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZyZXFzW2ZdID0gZnJlcXNbZl0gPT0gdW5kZWZpbmVkID8gMSA6IGRbZl0gKyBmcmVxc1tmXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmICgnY29tcGFydG1lbnRzJyBpbiBkKSB7XHJcbiAgICAgICAgICAgICAgICBjZmcucmVwb3J0LmNvbXBhcnRtZW50cy5mb3JFYWNoKChjbSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsW2NtXSA9IG1vZGVsW2NtXSA9PSB1bmRlZmluZWQgPyBkLnBvcHVsYXRpb25zW2NtXSA6IGQucG9wdWxhdGlvbnNbY21dICsgbW9kZWxbY21dO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgO1xyXG4gICAgICAgIGNmZy5yZXBvcnQubWVhbnMuZm9yRWFjaCgobSkgPT4ge1xyXG4gICAgICAgICAgICBtZWFuc1ttXSA9IHN1bXNbbV0gLyBjb3VudDtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBydW46IHIsXHJcbiAgICAgICAgICAgIGNmZzogdGhpcy5jdXJyZW50Q0ZHLFxyXG4gICAgICAgICAgICBjb3VudDogY291bnQsXHJcbiAgICAgICAgICAgIHN1bXM6IHN1bXMsXHJcbiAgICAgICAgICAgIG1lYW5zOiBtZWFucyxcclxuICAgICAgICAgICAgZnJlcXM6IGZyZXFzLFxyXG4gICAgICAgICAgICBtb2RlbDogbW9kZWxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgLy9vbiBlYWNoIHJ1biwgY2hhbmdlIG9uZSBwYXJhbSwgaG9sZCBvdGhlcnMgY29uc3RhbnRcclxuICAgIGFmdGVyKHJ1biwgY2ZnKSB7XHJcbiAgICB9XHJcbiAgICBnZW5BdmcobG9ncywgY2ZnKSB7XHJcbiAgICAgICAgbGV0IHN1bXMgPSB7fTtcclxuICAgICAgICBsZXQgZnJlcXMgPSB7fTtcclxuICAgICAgICBsZXQgc3VtTWVhbnMgPSB7fTtcclxuICAgICAgICBsZXQgbWVhbnMgPSB7fTtcclxuICAgICAgICBsb2dzLmZvckVhY2goKGxvZykgPT4ge1xyXG4gICAgICAgICAgICBjZmcucmVwb3J0LnN1bXMuZm9yRWFjaCgocykgPT4ge1xyXG4gICAgICAgICAgICAgICAgc3Vtc1tzXSA9IHN1bXNbc10gPT0gdW5kZWZpbmVkID8gbG9nLnN1bXNbc10gOiBsb2cuc3Vtc1tzXSArIHN1bXNbc107XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjZmcucmVwb3J0LmZyZXFzLmZvckVhY2goKGYpID0+IHtcclxuICAgICAgICAgICAgICAgIGZyZXFzW2ZdID0gZnJlcXNbZl0gPT0gdW5kZWZpbmVkID8gbG9nLmZyZXFzW2ZdIDogbG9nLmZyZXFzW2ZdICsgZnJlcXNbZl07XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjZmcucmVwb3J0Lm1lYW5zLmZvckVhY2goKG0pID0+IHtcclxuICAgICAgICAgICAgICAgIHN1bU1lYW5zW21dID0gc3VtTWVhbnNbbV0gPT0gdW5kZWZpbmVkID8gbG9nLm1lYW5zW21dIDogbG9nLm1lYW5zW21dICsgc3VtTWVhbnNbbV07XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNmZy5yZXBvcnQubWVhbnMuZm9yRWFjaCgobSkgPT4ge1xyXG4gICAgICAgICAgICBtZWFuc1ttXSA9IHN1bU1lYW5zW21dIC8gbG9ncy5sZW5ndGg7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY2ZnLnJlcG9ydC5mcmVxcy5mb3JFYWNoKChmKSA9PiB7XHJcbiAgICAgICAgICAgIG1lYW5zW2ZdID0gZnJlcXNbZl0gLyBsb2dzLmxlbmd0aDtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBtZWFuczogbWVhbnMsXHJcbiAgICAgICAgICAgIHN1bXM6IHN1bXMsXHJcbiAgICAgICAgICAgIGZyZXFzOiBmcmVxc1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICAvKlxyXG4gICAgKiBBc3NpZ24gbmV3IGVudmlyb25tZW50YWwgcGFyYW1ldGVycyBmcm9tIGV4cGVyaW1lbnRhbCBwYXJhbWV0ZXJzLlxyXG4gICAgKi9cclxuICAgIHVwZGF0ZUFzc2lnbm1lbnQoY2ZnLCBwYXJhbWV0ZXJzKSB7XHJcbiAgICAgICAgZm9yIChsZXQgcG0gPSAwOyBwbSA8IHBhcmFtZXRlcnMubGVuZ3RoOyBwbSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBwYXJhbSA9IHBhcmFtZXRlcnNbcG1dO1xyXG4gICAgICAgICAgICBsZXQgdmFsID0gYXNzaWduUGFyYW0oe30sIHBhcmFtLCBwYXJhbS5uYW1lLCB0aGlzLnJuZyk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudENGR1twYXJhbS5sZXZlbF0gPSB0aGlzLmN1cnJlbnRDRkdbcGFyYW0ubGV2ZWxdIHx8IHt9O1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDRkdbcGFyYW0ubGV2ZWxdW3BhcmFtLmdyb3VwXSA9IHRoaXMuY3VycmVudENGR1twYXJhbS5sZXZlbF1bcGFyYW0uZ3JvdXBdIHx8IHt9O1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDRkdbcGFyYW0ubGV2ZWxdW3BhcmFtLmdyb3VwXVtwYXJhbS5uYW1lXSA9IHZhbDtcclxuICAgICAgICAgICAgc3dpdGNoIChwYXJhbS5sZXZlbCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnYWdlbnRzJzpcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyYW0uZ3JvdXAgPT09ICdib3VuZGFyaWVzJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZmcuYWdlbnRzLmJvdW5kYXJpZXNbcGFyYW0ubmFtZV0uYXNzaWduID0gdmFsO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2ZnLmFnZW50c1twYXJhbS5ncm91cF0ucGFyYW1zW3BhcmFtLm5hbWVdLmFzc2lnbiA9IHZhbDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdlbnRpdGllcyc6XHJcbiAgICAgICAgICAgICAgICAgICAgY2ZnLmVudGl0aWVzW3BhcmFtLmdyb3VwXS5wYXJhbXNbcGFyYW0ubmFtZV0uYXNzaWduID0gdmFsO1xyXG4gICAgICAgICAgICAgICAgICAgIGNmZy5lbnRpdGllc1twYXJhbS5ncm91cF1bcGFyYW0ubmFtZV0gPSB2YWw7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGNmZ1twYXJhbS5sZXZlbF0ucGFyYW1zW3BhcmFtLmdyb3VwXVtwYXJhbS5uYW1lXSA9IHZhbDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1leHBlcmltZW50LmpzLm1hcCIsImV4cG9ydCBjbGFzcyBHZW5lIHtcclxuICAgIGNvbnN0cnVjdG9yKHBhcmFtcywgdHlwZSwgcm5nKSB7XHJcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ25vcm1hbCc6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvZGUgPSBybmcubm9ybWFsKHBhcmFtc1swXSwgcGFyYW1zWzFdKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb2RlID0gcm5nLnJhbmRvbSgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBDaHJvbWFzb21lIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ2VuZXMgPSBbXTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1nZW5ldGljLmpzLm1hcCIsImltcG9ydCB7IEV4cGVyaW1lbnQgfSBmcm9tICcuL2V4cGVyaW1lbnQnO1xyXG5pbXBvcnQgeyBhc3NpZ25QYXJhbSwgc2NhbGUsIHNjYWxlSW52IH0gZnJvbSAnLi91dGlscyc7XHJcbmV4cG9ydCBjbGFzcyBFdm9sdmUgZXh0ZW5kcyBFeHBlcmltZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKGVudmlyb25tZW50LCBzZXR1cCkge1xyXG4gICAgICAgIHN1cGVyKGVudmlyb25tZW50LCBzZXR1cCk7XHJcbiAgICAgICAgdGhpcy50eXBlID0gJ2V2b2x2ZSc7XHJcbiAgICAgICAgdGhpcy5wb3B1bGF0aW9uID0gW107XHJcbiAgICAgICAgdGhpcy5tdXRhdGVSYXRlID0gMC41O1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gc2V0dXAuZXZvbHV0aW9uLnRhcmdldDtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc2V0dXAuZXhwZXJpbWVudC5zaXplOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5wb3B1bGF0aW9uW2ldID0geyBzY29yZTogMWUxNiwgcGFyYW1zOiBbXSB9O1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHRoaXMuc2V0dXAuZXhwZXJpbWVudC5wYXJhbXMubGVuZ3RoOyBwKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBzZXRQYXJhbSA9IHRoaXMuc2V0dXAuZXhwZXJpbWVudC5wYXJhbXNbcF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRpb25baV0ucGFyYW1zLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldmVsOiBzZXRQYXJhbS5sZXZlbCxcclxuICAgICAgICAgICAgICAgICAgICBncm91cDogc2V0UGFyYW0uZ3JvdXAsXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogc2V0UGFyYW0ubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBhc3NpZ246IGFzc2lnblBhcmFtKHt9LCBzZXRQYXJhbSwgc2V0UGFyYW0ubmFtZSwgdGhpcy5ybmcpXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnJhbmdlcyA9IHRoaXMuc2V0dXAuZXhwZXJpbWVudC5wYXJhbXMubWFwKChkKSA9PiB7IHJldHVybiBkLmRpc3RyaWJ1dGlvbi5wYXJhbXM7IH0pO1xyXG4gICAgfVxyXG4gICAgc3RhcnQocnVucywgc3RlcCwgdW50aWwsIHByZXBDQikge1xyXG4gICAgICAgIHZhciByID0gMDtcclxuICAgICAgICBydW5zID0gcnVucyAqIHRoaXMuc2V0dXAuZXhwZXJpbWVudC5zaXplO1xyXG4gICAgICAgIHdoaWxlIChyIDwgcnVucykge1xyXG4gICAgICAgICAgICB0aGlzLnByZXAociwgdGhpcy5zZXR1cCwgcHJlcENCKTtcclxuICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC50aW1lID0gMDtcclxuICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC5ydW4oc3RlcCwgdW50aWwsIDApO1xyXG4gICAgICAgICAgICB0aGlzLmV4cGVyaW1lbnRMb2dbcl0gPSB0aGlzLnJlcG9ydChyLCB0aGlzLnNldHVwKTtcclxuICAgICAgICAgICAgdGhpcy5hZnRlcihyLCB0aGlzLnNldHVwKTtcclxuICAgICAgICAgICAgaWYgKHIgJSB0aGlzLnNldHVwLmV4cGVyaW1lbnQuc2l6ZSA9PT0gMCAmJiByICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVuZEdlbihyLCB0aGlzLnNldHVwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaW1wcm92ZW1lbnQgPSB0aGlzLm92ZXJhbGwodGhpcy5nZW5Mb2cpO1xyXG4gICAgfVxyXG4gICAgb3ZlcmFsbChnZW5Mb2cpIHtcclxuICAgICAgICBsZXQgTiA9IGdlbkxvZy5sZW5ndGg7XHJcbiAgICAgICAgbGV0IHN1bSA9IDA7XHJcbiAgICAgICAgbGV0IHJhbmtlZCA9IGdlbkxvZztcclxuICAgICAgICByYW5rZWQuc29ydCh0aGlzLmRzY1NvcnQpO1xyXG4gICAgICAgIHJhbmtlZC5tYXAoKGQsIGkpID0+IHsgZC5yYW5rID0gaTsgcmV0dXJuIGQ7IH0pO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmFua2VkLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHN1bSArPSBNYXRoLmFicyhyYW5rZWRbaV0ub3JkZXIgLyBOIC0gcmFua2VkW2ldLnJhbmsgLyBOKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDEgLSAyICogc3VtIC8gTjtcclxuICAgIH1cclxuICAgIHByZXAocnVuLCBzZXR1cCwgcHJlcENCKSB7XHJcbiAgICAgICAgc2V0dXAuZXhwZXJpbWVudC5wYXJhbXMgPSB0aGlzLnBvcHVsYXRpb25bcnVuICUgc2V0dXAuZXhwZXJpbWVudC5zaXplXS5wYXJhbXM7XHJcbiAgICAgICAgc3VwZXIudXBkYXRlQXNzaWdubWVudChzZXR1cCwgc2V0dXAuZXhwZXJpbWVudC5wYXJhbXMpO1xyXG4gICAgICAgIHN1cGVyLnByZXAocnVuLCBzZXR1cCwgcHJlcENCKTtcclxuICAgIH1cclxuICAgIGVuZEdlbihydW4sIGNmZykge1xyXG4gICAgICAgIGxldCBjaGlsZHJlbjtcclxuICAgICAgICBsZXQgcHJldlN0YXJ0ID0gTWF0aC5taW4oMCwgcnVuIC0gY2ZnLmV4cGVyaW1lbnQuc2l6ZSk7XHJcbiAgICAgICAgdGhpcy5wb3B1bGF0aW9uLnNvcnQodGhpcy5hc2NTb3J0KTtcclxuICAgICAgICB0aGlzLnBvcHVsYXRpb24gPSB0aGlzLnBvcHVsYXRpb24uc2xpY2UoMCwgY2ZnLmV4cGVyaW1lbnQuc2l6ZSk7XHJcbiAgICAgICAgY2hpbGRyZW4gPSB0aGlzLm1hdGUoTWF0aC5taW4oNSwgTWF0aC5tYXgoMiwgTWF0aC5mbG9vcih0aGlzLnBvcHVsYXRpb24ubGVuZ3RoICogMC4zMzMpKSkpO1xyXG4gICAgICAgIHRoaXMubXV0YXRlKHRoaXMucG9wdWxhdGlvbiwgMSk7XHJcbiAgICAgICAgdGhpcy5nZW5Mb2cucHVzaCh0aGlzLmdlbkF2Zyh0aGlzLmV4cGVyaW1lbnRMb2cuc2xpY2UocHJldlN0YXJ0LCBydW4pLCBjZmcpKTtcclxuICAgICAgICB0aGlzLmdlbkxvZ1t0aGlzLmdlbkxvZy5sZW5ndGggLSAxXS5vcmRlciA9IHRoaXMuZ2VuTG9nLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgdGhpcy5nZW5Mb2dbdGhpcy5nZW5Mb2cubGVuZ3RoIC0gMV0uc2NvcmUgPSB0aGlzLnNjb3JlTWVhbih0aGlzLnBvcHVsYXRpb24pO1xyXG4gICAgICAgIHRoaXMuZ2VuTG9nW3RoaXMuZ2VuTG9nLmxlbmd0aCAtIDFdLnNjb3JlU0QgPSB0aGlzLnNjb3JlU0QodGhpcy5wb3B1bGF0aW9uKTtcclxuICAgICAgICB0aGlzLnBvcHVsYXRpb24uc3BsaWNlKHRoaXMucG9wdWxhdGlvbi5sZW5ndGggLSBjaGlsZHJlbi5sZW5ndGggLSAxLCBjaGlsZHJlbi5sZW5ndGgpO1xyXG4gICAgICAgIHRoaXMucG9wdWxhdGlvbiA9IHRoaXMucG9wdWxhdGlvbi5jb25jYXQoY2hpbGRyZW4pO1xyXG4gICAgfVxyXG4gICAgdmVjdG9yU2NvcmVzKHBvcCkge1xyXG4gICAgICAgIGxldCB2ZWMgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBvcC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2ZWNbaV0gPSBwb3BbaV0uc2NvcmU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2ZWM7XHJcbiAgICB9XHJcbiAgICBzY29yZU1lYW4ocG9wKSB7XHJcbiAgICAgICAgbGV0IHZhbHMgPSB0aGlzLnZlY3RvclNjb3Jlcyhwb3ApO1xyXG4gICAgICAgIHJldHVybiBqU3RhdC5tZWFuKHZhbHMpO1xyXG4gICAgfVxyXG4gICAgc2NvcmVTRChwb3ApIHtcclxuICAgICAgICBsZXQgdmFscyA9IHRoaXMudmVjdG9yU2NvcmVzKHBvcCk7XHJcbiAgICAgICAgcmV0dXJuIGpTdGF0LnN0ZGV2KHZhbHMpO1xyXG4gICAgfVxyXG4gICAgYWZ0ZXIocnVuLCBjZmcpIHtcclxuICAgICAgICB0aGlzLnBvcHVsYXRpb25bcnVuICUgY2ZnLmV4cGVyaW1lbnQuc2l6ZV0uc2NvcmUgPSB0aGlzLmNvc3QodGhpcy5leHBlcmltZW50TG9nW3J1bl0sIHRoaXMudGFyZ2V0KTtcclxuICAgICAgICB0aGlzLmV4cGVyaW1lbnRMb2dbcnVuXS5zY29yZSA9IHRoaXMucG9wdWxhdGlvbltydW4gJSBjZmcuZXhwZXJpbWVudC5zaXplXS5zY29yZTtcclxuICAgIH1cclxuICAgIGNvc3QocHJlZGljdCwgdGFyZ2V0KSB7XHJcbiAgICAgICAgbGV0IGRldiA9IDA7XHJcbiAgICAgICAgbGV0IGRpbWVuc2lvbnMgPSAwO1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiB0YXJnZXQubWVhbnMpIHtcclxuICAgICAgICAgICAgZGV2ICs9IE1hdGguYWJzKHRhcmdldC5tZWFuc1trZXldIC0gcHJlZGljdC5tZWFuc1trZXldKTtcclxuICAgICAgICAgICAgZGltZW5zaW9ucysrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gdGFyZ2V0LmZyZXFzKSB7XHJcbiAgICAgICAgICAgIGRldiArPSBNYXRoLmFicyh0YXJnZXQuZnJlcXNba2V5XSAtIHByZWRpY3QuZnJlcXNba2V5XSk7XHJcbiAgICAgICAgICAgIGRpbWVuc2lvbnMrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHRhcmdldC5tb2RlbCkge1xyXG4gICAgICAgICAgICBkZXYgKz0gTWF0aC5hYnModGFyZ2V0Lm1vZGVsW2tleV0gLSBwcmVkaWN0Lm1vZGVsW2tleV0pO1xyXG4gICAgICAgICAgICBkaW1lbnNpb25zKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkZXYgLyBkaW1lbnNpb25zO1xyXG4gICAgfVxyXG4gICAgbXV0YXRlKHBvcHVsYXRpb24sIGNoYW5jZSkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgcG9wdWxhdGlvbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5ybmcucmFuZG9tKCkgPiBjaGFuY2UpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBiZXN0ID0gcG9wdWxhdGlvblswXS5wYXJhbXM7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gcG9wdWxhdGlvbltpXS5wYXJhbXM7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgY3VycmVudC5sZW5ndGg7IHArKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNjYWxlZEIgPSBzY2FsZShiZXN0W3BdLmFzc2lnbiwgdGhpcy5yYW5nZXNbcF1bMF0sIHRoaXMucmFuZ2VzW3BdWzFdIC0gdGhpcy5yYW5nZXNbcF1bMF0pO1xyXG4gICAgICAgICAgICAgICAgbGV0IHNjYWxlZEMgPSBzY2FsZShjdXJyZW50W3BdLmFzc2lnbiwgdGhpcy5yYW5nZXNbcF1bMF0sIHRoaXMucmFuZ2VzW3BdWzFdIC0gdGhpcy5yYW5nZXNbcF1bMF0pO1xyXG4gICAgICAgICAgICAgICAgbGV0IGRpZmYgPSBzY2FsZWRCIC0gc2NhbGVkQztcclxuICAgICAgICAgICAgICAgIGlmIChkaWZmID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NhbGVkQyArPSB0aGlzLnJuZy5ub3JtYWwoMCwgMWUtOCkgKiB0aGlzLm11dGF0ZVJhdGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBzY2FsZWRDICs9IGRpZmYgKiB0aGlzLm11dGF0ZVJhdGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvL2NsYW1wIHRvIHVuaWZvcm0gbWluIGFuZCBtYXguXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50W3BdLmFzc2lnbiA9IHNjYWxlSW52KE1hdGgubWF4KHRoaXMucmFuZ2VzW3BdWzBdLCBNYXRoLm1pbihzY2FsZWRDLCB0aGlzLnJhbmdlc1twXVsxXSkpLCB0aGlzLnJhbmdlc1twXVswXSwgdGhpcy5yYW5nZXNbcF1bMV0gLSB0aGlzLnJhbmdlc1twXVswXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBtYXRlKHBhcmVudHMpIHtcclxuICAgICAgICBsZXQgbnVtUGFyYW1zID0gdGhpcy5wb3B1bGF0aW9uWzBdLnBhcmFtcy5sZW5ndGg7XHJcbiAgICAgICAgbGV0IG51bUNoaWxkcmVuID0gTWF0aC5tYXgoTWF0aC5taW4oMTAsIE1hdGgubWF4KDIsIE1hdGguZmxvb3IodGhpcy5wb3B1bGF0aW9uLmxlbmd0aCAqIDAuMzMzKSkpKTtcclxuICAgICAgICBsZXQgY2hpbGRyZW4gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bUNoaWxkcmVuOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGNoaWxkID0geyBwYXJhbXM6IFtdLCBzY29yZTogMCB9O1xyXG4gICAgICAgICAgICBsZXQgcDEgPSBNYXRoLmZsb29yKHRoaXMucm5nLnJhbmRvbSgpICogcGFyZW50cyk7XHJcbiAgICAgICAgICAgIGxldCBwMiA9IE1hdGguZmxvb3IodGhpcy5ybmcucmFuZG9tKCkgKiBwYXJlbnRzKTtcclxuICAgICAgICAgICAgaWYgKHAxID09PSBwMikge1xyXG4gICAgICAgICAgICAgICAgcDIgPSBwMiA9PT0gMCA/IHBhcmVudHMgLSAxIDogcDIgLSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBzcGxpdCA9IE1hdGguZmxvb3IodGhpcy5ybmcucmFuZG9tKCkgKiBudW1QYXJhbXMpO1xyXG4gICAgICAgICAgICBjaGlsZC5wYXJhbXMgPSBbXS5jb25jYXQodGhpcy5wb3B1bGF0aW9uW3AxXS5wYXJhbXMuc2xpY2UoMCwgc3BsaXQpLCB0aGlzLnBvcHVsYXRpb25bcDJdLnBhcmFtcy5zbGljZShzcGxpdCwgbnVtUGFyYW1zKSk7XHJcbiAgICAgICAgICAgIGNoaWxkcmVuLnB1c2goY2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2hpbGRyZW47XHJcbiAgICB9XHJcbiAgICBkc2NTb3J0KGEsIGIpIHtcclxuICAgICAgICBpZiAoYS5zY29yZSA+IGIuc2NvcmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChhLnNjb3JlIDwgYi5zY29yZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICBhc2NTb3J0KGEsIGIpIHtcclxuICAgICAgICBpZiAoYS5zY29yZSA+IGIuc2NvcmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGEuc2NvcmUgPCBiLnNjb3JlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZXZvbHZlLmpzLm1hcCIsImltcG9ydCB7IFFDb21wb25lbnQgfSBmcm9tICcuL1FDb21wb25lbnQnO1xyXG5pbXBvcnQgeyBTVUNDRVNTIH0gZnJvbSAnLi91dGlscyc7XHJcbmV4cG9ydCBjbGFzcyBIeWJyaWRBdXRvbWF0YSBleHRlbmRzIFFDb21wb25lbnQge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgZGF0YSwgZmxvd1NldCwgZmxvd01hcCwganVtcFNldCwganVtcE1hcCkge1xyXG4gICAgICAgIHN1cGVyKG5hbWUpO1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgdGhpcy5mbG93U2V0ID0gZmxvd1NldDtcclxuICAgICAgICB0aGlzLmZsb3dNYXAgPSBmbG93TWFwO1xyXG4gICAgICAgIHRoaXMuanVtcFNldCA9IGp1bXBTZXQ7XHJcbiAgICAgICAgdGhpcy5qdW1wTWFwID0ganVtcE1hcDtcclxuICAgIH1cclxuICAgIHVwZGF0ZShhZ2VudCwgc3RlcCkge1xyXG4gICAgICAgIGxldCB0ZW1wID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShhZ2VudCkpO1xyXG4gICAgICAgIGZvciAodmFyIG1vZGUgaW4gdGhpcy5qdW1wU2V0KSB7XHJcbiAgICAgICAgICAgIGxldCBlZGdlID0gdGhpcy5qdW1wU2V0W21vZGVdO1xyXG4gICAgICAgICAgICBsZXQgZWRnZVN0YXRlID0gZWRnZS5jaGVjayhhZ2VudFtlZGdlLmtleV0sIGVkZ2UudmFsdWUpO1xyXG4gICAgICAgICAgICBpZiAoZWRnZVN0YXRlID09PSBTVUNDRVNTICYmIG1vZGUgIT0gYWdlbnQuY3VycmVudE1vZGUpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWdlbnRbZWRnZS5rZXldID0gdGhpcy5qdW1wTWFwW2VkZ2Uua2V5XVthZ2VudC5jdXJyZW50TW9kZV1bbW9kZV0oYWdlbnRbZWRnZS5rZXldKTtcclxuICAgICAgICAgICAgICAgICAgICBhZ2VudC5jdXJyZW50TW9kZSA9IG1vZGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXRjaCAoRXJyKSB7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMuZmxvd01hcCkge1xyXG4gICAgICAgICAgICAgICAgLy9zZWNvbmQgb3JkZXIgaW50ZWdyYXRpb25cclxuICAgICAgICAgICAgICAgIGxldCB0ZW1wRCA9IHRoaXMuZmxvd01hcFtrZXldW2FnZW50LmN1cnJlbnRNb2RlXShhZ2VudFtrZXldKTtcclxuICAgICAgICAgICAgICAgIHRlbXBba2V5XSA9IGFnZW50W2tleV0gKyB0ZW1wRDtcclxuICAgICAgICAgICAgICAgIGFnZW50W2tleV0gKz0gMC41ICogKHRlbXBEICsgdGhpcy5mbG93TWFwW2tleV1bYWdlbnQuY3VycmVudE1vZGVdKHRlbXBba2V5XSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWhhLmpzLm1hcCIsImltcG9ydCB7IFFDb21wb25lbnQgfSBmcm9tICcuL1FDb21wb25lbnQnO1xyXG5pbXBvcnQgeyBnZW5lcmF0ZVVVSUQgfSBmcm9tICcuL3V0aWxzJztcclxuLy9IaWVyYXJjaGFsIFRhc2sgTmV0d29ya1xyXG5leHBvcnQgY2xhc3MgSFROUGxhbm5lciBleHRlbmRzIFFDb21wb25lbnQge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgcm9vdCwgdGFzaywgZGF0YSkge1xyXG4gICAgICAgIHN1cGVyKG5hbWUpO1xyXG4gICAgICAgIHRoaXMucm9vdCA9IHJvb3Q7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgICAgICB0aGlzLnN1bW1hcnkgPSBbXTtcclxuICAgICAgICB0aGlzLnJlc3VsdHMgPSBbXTtcclxuICAgICAgICB0aGlzLnRhc2sgPSB0YXNrO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIHRpY2sobm9kZSwgdGFzaywgYWdlbnQpIHtcclxuICAgICAgICBpZiAoYWdlbnQucnVubmluZ0xpc3QpIHtcclxuICAgICAgICAgICAgYWdlbnQucnVubmluZ0xpc3QucHVzaChub2RlLm5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgYWdlbnQucnVubmluZ0xpc3QgPSBbbm9kZS5uYW1lXTtcclxuICAgICAgICAgICAgYWdlbnQuc3VjY2Vzc0xpc3QgPSBbXTtcclxuICAgICAgICAgICAgYWdlbnQuYmFycmllckxpc3QgPSBbXTtcclxuICAgICAgICAgICAgYWdlbnQuYmxhY2tib2FyZCA9IFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgc3RhdGUgPSBub2RlLnZpc2l0KGFnZW50LCB0YXNrKTtcclxuICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoYWdlbnQsIHN0ZXApIHtcclxuICAgICAgICAvL2l0ZXJhdGUgYW4gYWdlbnQoZGF0YSkgdGhyb3VnaCB0aGUgdGFzayBuZXR3b3JrXHJcbiAgICAgICAgYWdlbnQuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICBIVE5QbGFubmVyLnRpY2sodGhpcy5yb290LCB0aGlzLnRhc2ssIGFnZW50KTtcclxuICAgICAgICBpZiAoYWdlbnQuc3VjY2Vzc0xpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBhZ2VudC5zdWNjZWVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGFnZW50LnN1Y2NlZWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYWdlbnQuYWN0aXZlID0gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEhUTlJvb3RUYXNrIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGdvYWxzKSB7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgICB0aGlzLmdvYWxzID0gZ29hbHM7XHJcbiAgICB9XHJcbiAgICBldmFsdWF0ZUdvYWwoYWdlbnQpIHtcclxuICAgICAgICB2YXIgcmVzdWx0LCBnO1xyXG4gICAgICAgIGZvciAodmFyIHAgPSAwOyBwIDwgdGhpcy5nb2Fscy5sZW5ndGg7IHArKykge1xyXG4gICAgICAgICAgICBnID0gdGhpcy5nb2Fsc1twXTtcclxuICAgICAgICAgICAgaWYgKGcuZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZy5jaGVjayhnLmRhdGFbZy5rZXldLCBnLnZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGcuY2hlY2soYWdlbnRbZy5rZXldLCBnLnZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgSFROTm9kZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBwcmVjb25kaXRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IGdlbmVyYXRlVVVJRCgpO1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy5wcmVjb25kaXRpb25zID0gcHJlY29uZGl0aW9ucztcclxuICAgIH1cclxuICAgIGV2YWx1YXRlUHJlQ29uZHMoYWdlbnQpIHtcclxuICAgICAgICB2YXIgcmVzdWx0O1xyXG4gICAgICAgIGlmICh0aGlzLnByZWNvbmRpdGlvbnMgaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBwID0gMDsgcCA8IHRoaXMucHJlY29uZGl0aW9ucy5sZW5ndGg7IHArKykge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5wcmVjb25kaXRpb25zW3BdLmNoZWNrKGFnZW50W3RoaXMucHJlY29uZGl0aW9uc1twXS5rZXldLCB0aGlzLnByZWNvbmRpdGlvbnNbcF0udmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gSFROUGxhbm5lci5GQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSFROUGxhbm5lci5GQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIEhUTlBsYW5uZXIuU1VDQ0VTUztcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgSFROT3BlcmF0b3IgZXh0ZW5kcyBIVE5Ob2RlIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHByZWNvbmRpdGlvbnMsIGVmZmVjdHMpIHtcclxuICAgICAgICBzdXBlcihuYW1lLCBwcmVjb25kaXRpb25zKTtcclxuICAgICAgICB0aGlzLnR5cGUgPSBcIm9wZXJhdG9yXCI7XHJcbiAgICAgICAgdGhpcy5lZmZlY3RzID0gZWZmZWN0cztcclxuICAgICAgICB0aGlzLnZpc2l0ID0gZnVuY3Rpb24gKGFnZW50LCB0YXNrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmV2YWx1YXRlUHJlQ29uZHMoYWdlbnQpID09PSBIVE5QbGFubmVyLlNVQ0NFU1MpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lZmZlY3RzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lZmZlY3RzW2ldKGFnZW50LmJsYWNrYm9hcmRbMF0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRhc2suZXZhbHVhdGVHb2FsKGFnZW50LmJsYWNrYm9hcmRbMF0pID09PSBIVE5QbGFubmVyLlNVQ0NFU1MpIHtcclxuICAgICAgICAgICAgICAgICAgICBhZ2VudC5zdWNjZXNzTGlzdC51bnNoaWZ0KHRoaXMubmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEhUTlBsYW5uZXIuU1VDQ0VTUztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBIVE5QbGFubmVyLlJVTk5JTkc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBhZ2VudC5iYXJyaWVyTGlzdC51bnNoaWZ0KHsgbmFtZTogdGhpcy5uYW1lLCBjb25kaXRpb25zOiB0aGlzLnByZWNvbmRpdGlvbnMgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gSFROUGxhbm5lci5GQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBIVE5NZXRob2QgZXh0ZW5kcyBIVE5Ob2RlIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHByZWNvbmRpdGlvbnMsIGNoaWxkcmVuKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSwgcHJlY29uZGl0aW9ucyk7XHJcbiAgICAgICAgdGhpcy50eXBlID0gXCJtZXRob2RcIjtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XHJcbiAgICAgICAgdGhpcy52aXNpdCA9IGZ1bmN0aW9uIChhZ2VudCwgdGFzaykge1xyXG4gICAgICAgICAgICB2YXIgY29weSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoYWdlbnQpKTtcclxuICAgICAgICAgICAgZGVsZXRlIGNvcHkuYmxhY2tib2FyZDtcclxuICAgICAgICAgICAgYWdlbnQuYmxhY2tib2FyZC51bnNoaWZ0KGNvcHkpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5ldmFsdWF0ZVByZUNvbmRzKGFnZW50KSA9PT0gSFROUGxhbm5lci5TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSBIVE5QbGFubmVyLnRpY2sodGhpcy5jaGlsZHJlbltpXSwgdGFzaywgYWdlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0ZSA9PT0gSFROUGxhbm5lci5TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFnZW50LnN1Y2Nlc3NMaXN0LnVuc2hpZnQodGhpcy5uYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEhUTlBsYW5uZXIuU1VDQ0VTUztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBhZ2VudC5iYXJyaWVyTGlzdC51bnNoaWZ0KHsgbmFtZTogdGhpcy5uYW1lLCBjb25kaXRpb25zOiB0aGlzLnByZWNvbmRpdGlvbnMgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIEhUTlBsYW5uZXIuRkFJTEVEO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aHRuLmpzLm1hcCIsImltcG9ydCB7IFFDb21wb25lbnQgfSBmcm9tICcuL1FDb21wb25lbnQnO1xyXG5leHBvcnQgY2xhc3MgTUhTYW1wbGVyIGV4dGVuZHMgUUNvbXBvbmVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBybmcsIGRhdGEsIHRhcmdldCwgc2F2ZSA9IHRydWUpIHtcclxuICAgICAgICBzdXBlcihuYW1lKTtcclxuICAgICAgICB0aGlzLmtlcHQgPSAwO1xyXG4gICAgICAgIHRoaXMudGltZSA9IDA7XHJcbiAgICAgICAgdGhpcy5ybmcgPSBybmc7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgICAgICB0aGlzLmNoYWluID0gW107XHJcbiAgICAgICAgdGhpcy5zYXZlID0gc2F2ZTtcclxuICAgICAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcclxuICAgIH1cclxuICAgIHVwZGF0ZShhZ2VudCwgc3RlcCkge1xyXG4gICAgICAgIGxldCBuZXdQcm9iID0gMDtcclxuICAgICAgICBhZ2VudC55ID0gYWdlbnQucHJvcG9zYWwoYWdlbnQsIHN0ZXAsIHRoaXMucm5nKTtcclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMudGFyZ2V0ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC5mb3JFYWNoKChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBuZXdQcm9iICs9IGFnZW50LmxuUHJvYkYoYWdlbnQsIHN0ZXAsIGQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgbmV3UHJvYiAqPSAxIC8gdGhpcy50YXJnZXQubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgbmV3UHJvYiA9IGFnZW50LmxuUHJvYkYoYWdlbnQsIHN0ZXApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgZGlmZiA9IG5ld1Byb2IgLSBhZ2VudC5sblByb2I7XHJcbiAgICAgICAgbGV0IHUgPSB0aGlzLnJuZy5yYW5kb20oKTtcclxuICAgICAgICBpZiAoTWF0aC5sb2codSkgPD0gZGlmZiB8fCBkaWZmID49IDApIHtcclxuICAgICAgICAgICAgYWdlbnQubG5Qcm9iID0gbmV3UHJvYjtcclxuICAgICAgICAgICAgYWdlbnQueCA9IGFnZW50Lnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmtlcHQgKz0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuc2F2ZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmNoYWluLnB1c2goeyBpZDogYWdlbnQuaWQsIHRpbWU6IGFnZW50LnRpbWUsIHg6IGFnZW50LnggfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1jLmpzLm1hcCIsImV4cG9ydCBjbGFzcyBrTWVhbiB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhLCBwcm9wcywgaykge1xyXG4gICAgICAgIHRoaXMuY2VudHJvaWRzID0gW107XHJcbiAgICAgICAgdGhpcy5saW1pdHMgPSB7fTtcclxuICAgICAgICB0aGlzLml0ZXJhdGlvbnMgPSAwO1xyXG4gICAgICAgIC8vY3JlYXRlIGEgbGltaXRzIG9iaiBmb3IgZWFjaCBwcm9wXHJcbiAgICAgICAgcHJvcHMuZm9yRWFjaChwID0+IHtcclxuICAgICAgICAgICAgdGhpcy5saW1pdHNbcF0gPSB7XHJcbiAgICAgICAgICAgICAgICBtaW46IDFlMTUsXHJcbiAgICAgICAgICAgICAgICBtYXg6IC0xZTE1XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy9zZXQgbGltaXRzIGZvciBlYWNoIHByb3BcclxuICAgICAgICBkYXRhLmZvckVhY2goZCA9PiB7XHJcbiAgICAgICAgICAgIHByb3BzLmZvckVhY2gocCA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZFtwXSA+IHRoaXMubGltaXRzW3BdLm1heCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGltaXRzW3BdLm1heCA9IGRbcF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZFtwXSA8IHRoaXMubGltaXRzW3BdLm1pbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGltaXRzW3BdLm1pbiA9IGRbcF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vY3JlYXRlIGsgcmFuZG9tIHBvaW50c1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgazsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2VudHJvaWRzW2ldID0geyBjb3VudDogMCB9O1xyXG4gICAgICAgICAgICBwcm9wcy5mb3JFYWNoKHAgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNlbnRyb2lkID0gTWF0aC5yYW5kb20oKSAqIHRoaXMubGltaXRzW3BdLm1heCArIHRoaXMubGltaXRzW3BdLm1pbjtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2VudHJvaWRzW2ldW3BdID0gY2VudHJvaWQ7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xyXG4gICAgICAgIHRoaXMucHJvcHMgPSBwcm9wcztcclxuICAgIH1cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICB0aGlzLl9hc3NpZ25DZW50cm9pZCgpO1xyXG4gICAgICAgIHRoaXMuX21vdmVDZW50cm9pZCgpO1xyXG4gICAgfVxyXG4gICAgcnVuKCkge1xyXG4gICAgICAgIGxldCBmaW5pc2hlZCA9IGZhbHNlO1xyXG4gICAgICAgIHdoaWxlICghZmluaXNoZWQpIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuICAgICAgICAgICAgdGhpcy5jZW50cm9pZHMuZm9yRWFjaChjID0+IHtcclxuICAgICAgICAgICAgICAgIGZpbmlzaGVkID0gYy5maW5pc2hlZDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuaXRlcmF0aW9ucysrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gW3RoaXMuY2VudHJvaWRzLCB0aGlzLmRhdGFdO1xyXG4gICAgfVxyXG4gICAgX2Fzc2lnbkNlbnRyb2lkKCkge1xyXG4gICAgICAgIHRoaXMuZGF0YS5mb3JFYWNoKChkLCBqKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBkaXN0YW5jZXMgPSBbXTtcclxuICAgICAgICAgICAgbGV0IHRvdGFsRGlzdCA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgbWluRGlzdDtcclxuICAgICAgICAgICAgbGV0IG1pbkluZGV4O1xyXG4gICAgICAgICAgICAvL2ZvcmVhY2ggcG9pbnQsIGdldCB0aGUgcGVyIHByb3AgZGlzdGFuY2UgZnJvbSBlYWNoIGNlbnRyb2lkXHJcbiAgICAgICAgICAgIHRoaXMuY2VudHJvaWRzLmZvckVhY2goKGMsIGkpID0+IHtcclxuICAgICAgICAgICAgICAgIGRpc3RhbmNlc1tpXSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgdG90YWxEaXN0W2ldID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZm9yRWFjaChwID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZXNbaV1bcF0gPSBNYXRoLnNxcnQoKGRbcF0gLSBjW3BdKSAqIChkW3BdIC0gY1twXSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRvdGFsRGlzdFtpXSArPSBkaXN0YW5jZXNbaV1bcF07XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRvdGFsRGlzdFtpXSA9IE1hdGguc3FydCh0b3RhbERpc3RbaV0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgbWluRGlzdCA9IE1hdGgubWluLmFwcGx5KG51bGwsIHRvdGFsRGlzdCk7XHJcbiAgICAgICAgICAgIG1pbkluZGV4ID0gdG90YWxEaXN0LmluZGV4T2YobWluRGlzdCk7XHJcbiAgICAgICAgICAgIGQuY2VudHJvaWQgPSBtaW5JbmRleDtcclxuICAgICAgICAgICAgZC5kaXN0YW5jZXMgPSBkaXN0YW5jZXM7XHJcbiAgICAgICAgICAgIHRoaXMuY2VudHJvaWRzW21pbkluZGV4XS5jb3VudCArPSAxO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgX21vdmVDZW50cm9pZCgpIHtcclxuICAgICAgICB0aGlzLmNlbnRyb2lkcy5mb3JFYWNoKChjLCBpKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBkaXN0RnJvbUNlbnRyb2lkID0ge307XHJcbiAgICAgICAgICAgIHRoaXMucHJvcHMuZm9yRWFjaChwID0+IGRpc3RGcm9tQ2VudHJvaWRbcF0gPSBbXSk7XHJcbiAgICAgICAgICAgIC8vZ2V0IHRoZSBwZXIgcHJvcCBkaXN0YW5jZXMgZnJvbSB0aGUgY2VudHJvaWQgYW1vbmcgaXRzJyBhc3NpZ25lZCBwb2ludHNcclxuICAgICAgICAgICAgdGhpcy5kYXRhLmZvckVhY2goZCA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZC5jZW50cm9pZCA9PT0gaSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZm9yRWFjaChwID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzdEZyb21DZW50cm9pZFtwXS5wdXNoKGRbcF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy9oYW5kbGUgY2VudHJvaWQgd2l0aCBubyBhc3NpZ25lZCBwb2ludHMgKHJhbmRvbWx5IGFzc2lnbiBuZXcpO1xyXG4gICAgICAgICAgICBpZiAoYy5jb3VudCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5mb3JFYWNoKHAgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3RGcm9tQ2VudHJvaWRbcF0gPSBbTWF0aC5yYW5kb20oKSAqIHRoaXMubGltaXRzW3BdLm1heCArIHRoaXMubGltaXRzW3BdLm1pbl07XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL2dldCB0aGUgc3VtIGFuZCBtZWFuIHBlciBwcm9wZXJ0eSBvZiB0aGUgYXNzaWduZWQgcG9pbnRzXHJcbiAgICAgICAgICAgIHRoaXMucHJvcHMuZm9yRWFjaChwID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBzdW0gPSBkaXN0RnJvbUNlbnRyb2lkW3BdLnJlZHVjZSgocHJldiwgbmV4dCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmV2ICsgbmV4dDtcclxuICAgICAgICAgICAgICAgIH0sIDApO1xyXG4gICAgICAgICAgICAgICAgbGV0IG1lYW4gPSBzdW0gLyBkaXN0RnJvbUNlbnRyb2lkW3BdLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coaSwgJ1xcJ3MgYXZlcmFnZSBkaXN0IHdhcycsIG1lYW4sICcgdGhlIGN1cnJlbnQgcG9zIHdhcyAnLCBjW3BdKTtcclxuICAgICAgICAgICAgICAgIGlmIChjW3BdICE9PSBtZWFuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY1twXSA9IG1lYW47XHJcbiAgICAgICAgICAgICAgICAgICAgYy5maW5pc2hlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGMuY291bnQgPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYy5maW5pc2hlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWttZWFuLmpzLm1hcCIsImV4cG9ydCBjbGFzcyBLTk4ge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgdHJhaW5lZERhdGEsIGtQYXJhbXMsIGNsYXNzaWZpZXIsIG5lYXJlc3ROKSB7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgICB0aGlzLnRyYWluZWREYXRhID0gdHJhaW5lZERhdGE7XHJcbiAgICAgICAgdGhpcy5rUGFyYW1zID0ga1BhcmFtcztcclxuICAgICAgICB0aGlzLmNsYXNzaWZpZXIgPSBjbGFzc2lmaWVyO1xyXG4gICAgICAgIHRoaXMubmVhcmVzdE4gPSBuZWFyZXN0TjtcclxuICAgIH1cclxuICAgIHNldE5laWdoYm9ycyhwb2ludCwgZGF0YSwgcGFyYW0sIGNsYXNzaWZpZXIpIHtcclxuICAgICAgICBkYXRhLmZvckVhY2goKGQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGQuaWQgIT09IHBvaW50LmlkKSB7XHJcbiAgICAgICAgICAgICAgICBwb2ludC5uZWlnaGJvcnNbZC5pZF0gPSBwb2ludC5uZWlnaGJvcnNbZC5pZF0gfHwge307XHJcbiAgICAgICAgICAgICAgICBwb2ludC5uZWlnaGJvcnNbZC5pZF1bY2xhc3NpZmllcl0gPSBkW2NsYXNzaWZpZXJdO1xyXG4gICAgICAgICAgICAgICAgcG9pbnQubmVpZ2hib3JzW2QuaWRdW3BhcmFtLnBhcmFtXSA9IE1hdGguYWJzKHBvaW50W3BhcmFtLnBhcmFtXSAtIGRbcGFyYW0ucGFyYW1dKSAvIHBhcmFtLnJhbmdlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBzb3J0KG5laWdoYm9ycywgcGFyYW0pIHtcclxuICAgICAgICB2YXIgbGlzdCA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIG5laWdoIGluIG5laWdoYm9ycykge1xyXG4gICAgICAgICAgICBsaXN0LnB1c2gobmVpZ2hib3JzW25laWdoXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxpc3Quc29ydCgoYSwgYikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoYVtwYXJhbV0gPj0gYltwYXJhbV0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChiW3BhcmFtXSA+PSBhW3BhcmFtXSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBsaXN0O1xyXG4gICAgfVxyXG4gICAgc2V0RGlzdGFuY2VzKGRhdGEsIHRyYWluZWQsIGtQYXJhbXNPYmosIGNsYXNzaWZpZXIpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgZGF0YVtpXS5uZWlnaGJvcnMgPSB7fTtcclxuICAgICAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBrUGFyYW1zT2JqLmxlbmd0aDsgaysrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRhdGFbaV1ba1BhcmFtc09ialtrXS5wYXJhbV0gPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXROZWlnaGJvcnMoZGF0YVtpXSwgdHJhaW5lZCwga1BhcmFtc09ialtrXSwgY2xhc3NpZmllcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yICh2YXIgbiBpbiBkYXRhW2ldLm5laWdoYm9ycykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG5laWdoYm9yID0gZGF0YVtpXS5uZWlnaGJvcnNbbl07XHJcbiAgICAgICAgICAgICAgICB2YXIgZGlzdCA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBwID0gMDsgcCA8IGtQYXJhbXNPYmoubGVuZ3RoOyBwKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBkaXN0ICs9IG5laWdoYm9yW2tQYXJhbXNPYmpbcF0ucGFyYW1dICogbmVpZ2hib3Jba1BhcmFtc09ialtwXS5wYXJhbV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBuZWlnaGJvci5kaXN0YW5jZSA9IE1hdGguc3FydChkaXN0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgIH1cclxuICAgIGdldFJhbmdlKGRhdGEsIGtQYXJhbXMpIHtcclxuICAgICAgICBsZXQgcmFuZ2VzID0gW10sIG1pbiA9IDFlMjAsIG1heCA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBrUGFyYW1zLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGQgPSAwOyBkIDwgZGF0YS5sZW5ndGg7IGQrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGFbZF1ba1BhcmFtc1tqXV0gPCBtaW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBtaW4gPSBkYXRhW2RdW2tQYXJhbXNbal1dO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGFbZF1ba1BhcmFtc1tqXV0gPiBtYXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXggPSBkYXRhW2RdW2tQYXJhbXNbal1dO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJhbmdlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIHBhcmFtOiBrUGFyYW1zW2pdLFxyXG4gICAgICAgICAgICAgICAgbWluOiBtaW4sXHJcbiAgICAgICAgICAgICAgICBtYXg6IG1heCxcclxuICAgICAgICAgICAgICAgIHJhbmdlOiBtYXggLSBtaW5cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIDtcclxuICAgICAgICByZXR1cm4gcmFuZ2VzO1xyXG4gICAgfVxyXG4gICAgY2xhc3NpZnkoZGF0YSwgdHJhaW5lZERhdGEsIGtQYXJhbXMsIGNsYXNzaWZpZXIsIG5lYXJlc3ROKSB7XHJcbiAgICAgICAgbGV0IGtQYXJhbXNPYmogPSB0aGlzLmdldFJhbmdlKFtdLmNvbmNhdChkYXRhLCB0cmFpbmVkRGF0YSksIGtQYXJhbXMpO1xyXG4gICAgICAgIGRhdGEgPSB0aGlzLnNldERpc3RhbmNlcyhkYXRhLCB0cmFpbmVkRGF0YSwga1BhcmFtc09iaiwgY2xhc3NpZmllcik7XHJcbiAgICAgICAgZm9yIChsZXQgZCA9IDA7IGQgPCBkYXRhLmxlbmd0aDsgZCsrKSB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHRzID0ge307XHJcbiAgICAgICAgICAgIGxldCBuID0gMDtcclxuICAgICAgICAgICAgbGV0IG1heCA9IDA7XHJcbiAgICAgICAgICAgIGxldCBsaWtlbGllc3QgPSAnJztcclxuICAgICAgICAgICAgbGV0IG9yZGVyZWQgPSB0aGlzLnNvcnQoZGF0YVtkXS5uZWlnaGJvcnMsICdkaXN0YW5jZScpO1xyXG4gICAgICAgICAgICB3aGlsZSAobiA8IG5lYXJlc3ROKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY3VycmVudCA9IG9yZGVyZWRbbl1bY2xhc3NpZmllcl07XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzW2N1cnJlbnRdID0gcmVzdWx0c1tjdXJyZW50XSB8fCAwO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0c1tjdXJyZW50XSArPSAxO1xyXG4gICAgICAgICAgICAgICAgbisrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAobGV0IHBhcmFtIGluIHJlc3VsdHMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHRzW3BhcmFtXSA+IG1heCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1heCA9IHJlc3VsdHNbcGFyYW1dO1xyXG4gICAgICAgICAgICAgICAgICAgIGxpa2VsaWVzdCA9IHBhcmFtO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRhdGFbZF1bY2xhc3NpZmllcl0gPSBsaWtlbGllc3Q7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWtubi5qcy5tYXAiLCJleHBvcnQgY2xhc3MgVmVjdG9yIHtcclxuICAgIGNvbnN0cnVjdG9yKGFycmF5LCBzaXplKSB7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIE1hdHJpeCB7XHJcbiAgICBjb25zdHJ1Y3RvcihtYXQpIHtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgYWN0aXZhdGlvbk1ldGhvZHMge1xyXG4gICAgc3RhdGljIFJlTFUoeCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLm1heCh4LCAwKTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBzaWdtb2lkKHgpIHtcclxuICAgICAgICByZXR1cm4gMSAvICgxICsgTWF0aC5leHAoLXgpKTtcclxuICAgIH1cclxuICAgIHN0YXRpYyB0YW5oKHgpIHtcclxuICAgICAgICBsZXQgdmFsID0gKE1hdGguZXhwKHgpIC0gTWF0aC5leHAoLXgpKSAvIChNYXRoLmV4cCh4KSArIE1hdGguZXhwKC14KSk7XHJcbiAgICAgICAgcmV0dXJuIHZhbDtcclxuICAgIH1cclxufVxyXG47XHJcbmV4cG9ydCBjbGFzcyBkZXJpdml0ZU1ldGhvZHMge1xyXG4gICAgc3RhdGljIFJlTFUodmFsdWUpIHtcclxuICAgICAgICBsZXQgZGVyID0gdmFsdWUgPD0gMCA/IDAgOiAxO1xyXG4gICAgICAgIHJldHVybiBkZXI7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgc2lnbW9pZCh2YWx1ZSkge1xyXG4gICAgICAgIGxldCBzaWcgPSBhY3RpdmF0aW9uTWV0aG9kcy5zaWdtb2lkO1xyXG4gICAgICAgIHJldHVybiBzaWcodmFsdWUpICogKDEgLSBzaWcodmFsdWUpKTtcclxuICAgIH1cclxuICAgIHN0YXRpYyB0YW5oKHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIDEgLSBNYXRoLnBvdyhhY3RpdmF0aW9uTWV0aG9kcy50YW5oKHZhbHVlKSwgMik7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGxvZ2lzdGljKHgsIG0sIGIsIGspIHtcclxuICAgIHZhciB5ID0gMSAvIChtICsgTWF0aC5leHAoLWsgKiAoeCAtIGIpKSk7XHJcbiAgICByZXR1cm4geTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gbG9naXQoeCwgbSwgYiwgaykge1xyXG4gICAgdmFyIHkgPSAxIC8gTWF0aC5sb2coeCAvICgxIC0geCkpO1xyXG4gICAgcmV0dXJuIHk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGxpbmVhcih4LCBtLCBiLCBrKSB7XHJcbiAgICB2YXIgeSA9IG0gKiB4ICsgYjtcclxuICAgIHJldHVybiB5O1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBleHBvbmVudGlhbCh4LCBtLCBiLCBrKSB7XHJcbiAgICB2YXIgeSA9IDEgLSBNYXRoLnBvdyh4LCBrKSAvIE1hdGgucG93KDEsIGspO1xyXG4gICAgcmV0dXJuIHk7XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWF0aC5qcy5tYXAiLCJleHBvcnQgY2xhc3MgTmV0d29yayB7XHJcbiAgICBjb25zdHJ1Y3RvcihkYXRhLCBsYWJlbHMsIGhpZGRlbk51bSwgYWN0aXZhdGlvblR5cGUgPSAndGFuaCcsIGNvc3RUeXBlID0gJ21zZScpIHtcclxuICAgICAgICB0aGlzLml0ZXIgPSAwO1xyXG4gICAgICAgIHRoaXMuY29ycmVjdCA9IDA7XHJcbiAgICAgICAgdGhpcy5oaWRkZW5OdW0gPSBoaWRkZW5OdW07XHJcbiAgICAgICAgdGhpcy5sZWFyblJhdGUgPSAwLjAxO1xyXG4gICAgICAgIHRoaXMuYWN0Rm4gPSBOZXR3b3JrLmFjdGl2YXRpb25NZXRob2RzW2FjdGl2YXRpb25UeXBlXTtcclxuICAgICAgICB0aGlzLmRlckZuID0gTmV0d29yay5kZXJpdmF0aXZlTWV0aG9kc1thY3RpdmF0aW9uVHlwZV07XHJcbiAgICAgICAgdGhpcy5jb3N0Rm4gPSBOZXR3b3JrLmNvc3RNZXRob2RzW2Nvc3RUeXBlXTtcclxuICAgICAgICB0aGlzLmluaXQoZGF0YSwgbGFiZWxzKTtcclxuICAgIH1cclxuICAgIGxlYXJuKGl0ZXJhdGlvbnMsIGRhdGEsIGxhYmVscykge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlcmF0aW9uczsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCByYW5kSWR4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogZGF0YS5sZW5ndGgpO1xyXG4gICAgICAgICAgICB0aGlzLml0ZXIrKztcclxuICAgICAgICAgICAgdGhpcy5mb3J3YXJkKGRhdGFbcmFuZElkeF0pO1xyXG4gICAgICAgICAgICB0aGlzLmJhY2t3YXJkKGxhYmVsc1tyYW5kSWR4XSk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlV2VpZ2h0cygpO1xyXG4gICAgICAgICAgICB0aGlzLnJlc2V0VG90YWxzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY2xhc3NpZnkoZGF0YSkge1xyXG4gICAgICAgIHRoaXMucmVzZXRUb3RhbHMoKTtcclxuICAgICAgICB0aGlzLmZvcndhcmQoZGF0YSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVzW3RoaXMudmFsdWVzLmxlbmd0aCAtIDFdO1xyXG4gICAgfVxyXG4gICAgZXZhbHVhdGUoZGF0YSwgbGFiZWxzKSB7XHJcbiAgICAgICAgbGV0IGNvcnJlY3QgPSAwO1xyXG4gICAgICAgIGxldCBsb3NzID0gMDtcclxuICAgICAgICBsZXQgYWNjdXJhY3kgPSAwO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgeSA9IHRoaXMuY2xhc3NpZnkoZGF0YVtpXSk7XHJcbiAgICAgICAgICAgIGxldCBjb3JyZWN0SWR4ID0gLTE7XHJcbiAgICAgICAgICAgIGxldCBtYXhHdWVzc0lkeCA9IC0xO1xyXG4gICAgICAgICAgICBsZXQgbWF4R3Vlc3MgPSAtMTAwO1xyXG4gICAgICAgICAgICBsZXQgZ3Vlc3M7XHJcbiAgICAgICAgICAgIGxhYmVsc1tpXS5mb3JFYWNoKCh4LCBpZHgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh4ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvcnJlY3RJZHggPSBpZHg7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoeVtpZHhdID49IG1heEd1ZXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF4R3Vlc3NJZHggPSBpZHg7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF4R3Vlc3MgPSB5W2lkeF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoY29ycmVjdElkeCA9PT0gbWF4R3Vlc3NJZHgpIHtcclxuICAgICAgICAgICAgICAgIGNvcnJlY3QrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBndWVzcyA9IHlbY29ycmVjdElkeF07IC8vaXNOYU4oeVtjb3JyZWN0SWR4XSkgPyBNYXRoLnJhbmRvbSgpIDogeVtjb3JyZWN0SWR4XTtcclxuICAgICAgICAgICAgbG9zcyArPSBNYXRoLmFicyh0aGlzLmNvc3RGbihsYWJlbHNbaV1bY29ycmVjdElkeF0sIGd1ZXNzKSk7IC8vIGhvdyBmYXIgb2ZmPyAgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGFjY3VyYWN5ID0gY29ycmVjdCAvIGRhdGEubGVuZ3RoO1xyXG4gICAgICAgIHJldHVybiB7IGxvc3M6IGxvc3MsIGNvcnJlY3Q6IGNvcnJlY3QsIGV4YW1wbGVzOiBkYXRhLmxlbmd0aCwgYWNjdXJhY3k6IGFjY3VyYWN5IH07XHJcbiAgICB9XHJcbiAgICBjb3B5TmV0d29yayhvdGhlcikge1xyXG4gICAgICAgIHRoaXMuZGVyID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvdGhlci5kZXIpKTtcclxuICAgICAgICB0aGlzLnZhbHVlcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob3RoZXIudmFsdWVzKSk7XHJcbiAgICAgICAgdGhpcy53ZWlnaHRzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvdGhlci53ZWlnaHRzKSk7XHJcbiAgICAgICAgdGhpcy53ZWlnaHRDaGFuZ2VzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvdGhlci53ZWlnaHRDaGFuZ2VzKSk7XHJcbiAgICAgICAgdGhpcy50b3RhbHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG90aGVyLnRvdGFscykpO1xyXG4gICAgICAgIHRoaXMuZGVyVG90YWxzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvdGhlci5kZXJUb3RhbHMpKTtcclxuICAgICAgICB0aGlzLmJpYXNlcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob3RoZXIuYmlhc2VzKSk7XHJcbiAgICB9XHJcbiAgICBpbml0KGRhdGEsIGxhYmVscykge1xyXG4gICAgICAgIGxldCBpbnB1dHMgPSBbXTtcclxuICAgICAgICB0aGlzLmRlciA9IFtdO1xyXG4gICAgICAgIHRoaXMudmFsdWVzID0gW107XHJcbiAgICAgICAgdGhpcy53ZWlnaHRzID0gW107XHJcbiAgICAgICAgdGhpcy53ZWlnaHRDaGFuZ2VzID0gW107XHJcbiAgICAgICAgdGhpcy50b3RhbHMgPSBbXTtcclxuICAgICAgICB0aGlzLmRlclRvdGFscyA9IFtdO1xyXG4gICAgICAgIHRoaXMuYmlhc2VzID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgbiA9IDA7IG4gPCBkYXRhWzBdLmxlbmd0aDsgbisrKSB7XHJcbiAgICAgICAgICAgIGlucHV0cy5wdXNoKDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCB0aGlzLmhpZGRlbk51bS5sZW5ndGg7IGNvbCsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVyW2NvbF0gPSBbXTtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZXNbY29sXSA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLnRvdGFsc1tjb2xdID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuZGVyVG90YWxzW2NvbF0gPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgdGhpcy5oaWRkZW5OdW1bY29sXTsgcm93KyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudmFsdWVzW2NvbF1bcm93XSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlcltjb2xdW3Jvd10gPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy50b3RhbHNbY29sXVtyb3ddID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVyVG90YWxzW2NvbF1bcm93XSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy52YWx1ZXMudW5zaGlmdChpbnB1dHMpO1xyXG4gICAgICAgIHRoaXMudG90YWxzLnVuc2hpZnQoaW5wdXRzKTtcclxuICAgICAgICB0aGlzLmRlci51bnNoaWZ0KGlucHV0cyk7XHJcbiAgICAgICAgdGhpcy5kZXJUb3RhbHMudW5zaGlmdChpbnB1dHMpO1xyXG4gICAgICAgIHRoaXMudmFsdWVzW3RoaXMuaGlkZGVuTnVtLmxlbmd0aCArIDFdID0gbGFiZWxzWzBdLm1hcCgobCkgPT4geyByZXR1cm4gMDsgfSk7XHJcbiAgICAgICAgdGhpcy50b3RhbHNbdGhpcy5oaWRkZW5OdW0ubGVuZ3RoICsgMV0gPSBsYWJlbHNbMF0ubWFwKChsKSA9PiB7IHJldHVybiAwOyB9KTtcclxuICAgICAgICB0aGlzLmRlclt0aGlzLmhpZGRlbk51bS5sZW5ndGggKyAxXSA9IGxhYmVsc1swXS5tYXAoKGwpID0+IHsgcmV0dXJuIDA7IH0pO1xyXG4gICAgICAgIHRoaXMuZGVyVG90YWxzW3RoaXMuaGlkZGVuTnVtLmxlbmd0aCArIDFdID0gbGFiZWxzWzBdLm1hcCgobCkgPT4geyByZXR1cm4gMDsgfSk7XHJcbiAgICAgICAgZm9yIChsZXQgd2cgPSAwOyB3ZyA8IHRoaXMudmFsdWVzLmxlbmd0aCAtIDE7IHdnKyspIHtcclxuICAgICAgICAgICAgdGhpcy53ZWlnaHRzW3dnXSA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLndlaWdodENoYW5nZXNbd2ddID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuYmlhc2VzW3dnXSA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBzcmMgPSAwOyBzcmMgPCB0aGlzLnZhbHVlc1t3Z10ubGVuZ3RoOyBzcmMrKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy53ZWlnaHRzW3dnXVtzcmNdID0gW107XHJcbiAgICAgICAgICAgICAgICB0aGlzLndlaWdodENoYW5nZXNbd2ddW3NyY10gPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGRzdCA9IDA7IGRzdCA8IHRoaXMudmFsdWVzW3dnICsgMV0ubGVuZ3RoOyBkc3QrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYmlhc2VzW3dnXVtkc3RdID0gTWF0aC5yYW5kb20oKSAtIDAuNTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLndlaWdodHNbd2ddW3NyY11bZHN0XSA9IE1hdGgucmFuZG9tKCkgLSAwLjU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53ZWlnaHRDaGFuZ2VzW3dnXVtzcmNdW2RzdF0gPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmVzZXRUb3RhbHMoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgdGhpcy50b3RhbHMubGVuZ3RoOyBjb2wrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCB0aGlzLnRvdGFsc1tjb2xdLmxlbmd0aDsgcm93KyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudG90YWxzW2NvbF1bcm93XSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlclRvdGFsc1tjb2xdW3Jvd10gPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZm9yd2FyZChpbnB1dCkge1xyXG4gICAgICAgIHRoaXMudmFsdWVzWzBdID0gaW5wdXQ7XHJcbiAgICAgICAgZm9yIChsZXQgd2cgPSAwOyB3ZyA8IHRoaXMud2VpZ2h0cy5sZW5ndGg7IHdnKyspIHtcclxuICAgICAgICAgICAgbGV0IHNyY1ZhbHMgPSB3ZztcclxuICAgICAgICAgICAgbGV0IGRzdFZhbHMgPSB3ZyArIDE7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHNyYyA9IDA7IHNyYyA8IHRoaXMud2VpZ2h0c1t3Z10ubGVuZ3RoOyBzcmMrKykge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZHN0ID0gMDsgZHN0IDwgdGhpcy53ZWlnaHRzW3dnXVtzcmNdLmxlbmd0aDsgZHN0KyspIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRvdGFsc1tkc3RWYWxzXVtkc3RdICs9IHRoaXMudmFsdWVzW3NyY1ZhbHNdW3NyY10gKiB0aGlzLndlaWdodHNbd2ddW3NyY11bZHN0XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnZhbHVlc1tkc3RWYWxzXSA9IHRoaXMudG90YWxzW2RzdFZhbHNdLm1hcCgodG90YWwsIGlkeCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWN0Rm4odG90YWwgKyB0aGlzLmJpYXNlc1t3Z11baWR4XSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHVwZGF0ZShpbnB1dCwgc3RlcCkge1xyXG4gICAgICAgIHRoaXMuZm9yd2FyZChpbnB1dCk7XHJcbiAgICB9XHJcbiAgICBiYWNrd2FyZChsYWJlbHMpIHtcclxuICAgICAgICBmb3IgKGxldCB3ZyA9IHRoaXMud2VpZ2h0cy5sZW5ndGggLSAxOyB3ZyA+PSAwOyB3Zy0tKSB7XHJcbiAgICAgICAgICAgIGxldCBzcmNWYWxzID0gd2c7XHJcbiAgICAgICAgICAgIGxldCBkc3RWYWxzID0gd2cgKyAxO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBzcmMgPSAwOyBzcmMgPCB0aGlzLndlaWdodHNbd2ddLmxlbmd0aDsgc3JjKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBlcnIgPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZHN0ID0gMDsgZHN0IDwgdGhpcy53ZWlnaHRzW3dnXVtzcmNdLmxlbmd0aDsgZHN0KyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAod2cgPT09IHRoaXMud2VpZ2h0cy5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVyciArPSB0aGlzLmNvc3RGbihsYWJlbHNbZHN0XSwgdGhpcy52YWx1ZXNbZHN0VmFsc11bZHN0XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVyW2RzdFZhbHNdW2RzdF0gPSBlcnI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnIgKz0gdGhpcy5kZXJbZHN0VmFsc11bZHN0XSAqIHRoaXMud2VpZ2h0c1t3Z11bc3JjXVtkc3RdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGVyVG90YWxzW3NyY1ZhbHNdW3NyY10gPSBlcnI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlcltzcmNWYWxzXVtzcmNdID0gZXJyICogdGhpcy5kZXJGbih0aGlzLnZhbHVlc1tzcmNWYWxzXVtzcmNdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHVwZGF0ZVdlaWdodHMoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgd2cgPSAwOyB3ZyA8IHRoaXMud2VpZ2h0cy5sZW5ndGg7IHdnKyspIHtcclxuICAgICAgICAgICAgbGV0IHNyY1ZhbHMgPSB3ZztcclxuICAgICAgICAgICAgbGV0IGRzdFZhbHMgPSB3ZyArIDE7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHNyYyA9IDA7IHNyYyA8IHRoaXMud2VpZ2h0c1t3Z10ubGVuZ3RoOyBzcmMrKykge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZHN0ID0gMDsgZHN0IDwgdGhpcy53ZWlnaHRzW3dnXVtzcmNdLmxlbmd0aDsgZHN0KyspIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbW9tZW50dW0gPSB0aGlzLndlaWdodENoYW5nZXNbd2ddW3NyY11bZHN0XSAqIDAuMTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLndlaWdodENoYW5nZXNbd2ddW3NyY11bZHN0XSA9ICh0aGlzLnZhbHVlc1tzcmNWYWxzXVtzcmNdICogdGhpcy5kZXJbZHN0VmFsc11bZHN0XSAqIHRoaXMubGVhcm5SYXRlKSArIG1vbWVudHVtO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2VpZ2h0c1t3Z11bc3JjXVtkc3RdICs9IHRoaXMud2VpZ2h0Q2hhbmdlc1t3Z11bc3JjXVtkc3RdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuYmlhc2VzW3dnXSA9IHRoaXMuYmlhc2VzW3dnXS5tYXAoKGJpYXMsIGlkeCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubGVhcm5SYXRlICogdGhpcy5kZXJbZHN0VmFsc11baWR4XSArIGJpYXM7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIG1zZSgpIHtcclxuICAgICAgICBsZXQgZXJyID0gMDtcclxuICAgICAgICBsZXQgY291bnQgPSAwO1xyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5kZXJUb3RhbHMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgZXJyICs9IHRoaXMuZGVyVG90YWxzW2pdLnJlZHVjZSgobGFzdCwgY3VycmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY291bnQrKztcclxuICAgICAgICAgICAgICAgIHJldHVybiBsYXN0ICsgTWF0aC5wb3coY3VycmVudCwgMik7XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZXJyIC8gY291bnQ7XHJcbiAgICB9XHJcbn1cclxuTmV0d29yay5hY3RpdmF0aW9uTWV0aG9kcyA9IHtcclxuICAgIFJlTFU6IGZ1bmN0aW9uICh4KSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KHgsIDApO1xyXG4gICAgfSxcclxuICAgIFNlTFU6IGZ1bmN0aW9uICh4KSB7XHJcbiAgICAgICAgbGV0IGFscGhhID0gMS42NzMyNjMyNDIzNTQzNzcyODQ4MTcwNDI5OTE2NzE3O1xyXG4gICAgICAgIGxldCBzY2FsZSA9IDEuMDUwNzAwOTg3MzU1NDgwNDkzNDE5MzM0OTg1Mjk0NjtcclxuICAgICAgICBsZXQgc3RlcCA9IHggPj0gMCA/IHggOiAoYWxwaGEgKiBNYXRoLmV4cCh4KSAtIDEpO1xyXG4gICAgICAgIHJldHVybiBzY2FsZSAqIHg7XHJcbiAgICB9LFxyXG4gICAgc2lnbW9pZDogZnVuY3Rpb24gKHgpIHtcclxuICAgICAgICByZXR1cm4gMSAvICgxICsgTWF0aC5leHAoLXgpKTtcclxuICAgIH0sXHJcbiAgICB0YW5oOiBmdW5jdGlvbiAoeCkge1xyXG4gICAgICAgIGxldCB2YWwgPSAoTWF0aC5leHAoeCkgLSBNYXRoLmV4cCgteCkpIC8gKE1hdGguZXhwKHgpICsgTWF0aC5leHAoLXgpKTtcclxuICAgICAgICByZXR1cm4gdmFsO1xyXG4gICAgfVxyXG59O1xyXG5OZXR3b3JrLmRlcml2YXRpdmVNZXRob2RzID0ge1xyXG4gICAgUmVMVTogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgbGV0IGRlciA9IHZhbHVlIDw9IDAgPyAwIDogMTtcclxuICAgICAgICByZXR1cm4gZGVyO1xyXG4gICAgfSxcclxuICAgIFNlTFU6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIGxldCBhbHBoYSA9IDEuNjczMjYzMjQyMzU0Mzc3Mjg0ODE3MDQyOTkxNjcxNztcclxuICAgICAgICBsZXQgc2NhbGUgPSAxLjA1MDcwMDk4NzM1NTQ4MDQ5MzQxOTMzNDk4NTI5NDY7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlID49IDAgPyB2YWx1ZSA6IE5ldHdvcmsuYWN0aXZhdGlvbk1ldGhvZHMuU2VMVSh2YWx1ZSkgKyBhbHBoYTtcclxuICAgIH0sXHJcbiAgICBzaWdtb2lkOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICBsZXQgc2lnID0gTmV0d29yay5hY3RpdmF0aW9uTWV0aG9kcy5zaWdtb2lkO1xyXG4gICAgICAgIHJldHVybiBzaWcodmFsdWUpICogKDEgLSBzaWcodmFsdWUpKTtcclxuICAgIH0sXHJcbiAgICB0YW5oOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gMSAtIE1hdGgucG93KE5ldHdvcmsuYWN0aXZhdGlvbk1ldGhvZHMudGFuaCh2YWx1ZSksIDIpO1xyXG4gICAgfVxyXG59O1xyXG5OZXR3b3JrLmNvc3RNZXRob2RzID0ge1xyXG4gICAgbXNlOiBmdW5jdGlvbiAodGFyZ2V0LCBndWVzcykge1xyXG4gICAgICAgIHJldHVybiB0YXJnZXQgLSBndWVzcztcclxuICAgIH0sXHJcbiAgICBhYnM6IGZ1bmN0aW9uICgpIHtcclxuICAgIH0sXHJcbiAgICBjcm9zc0VudHJvcHk6IGZ1bmN0aW9uICh0YXJnZXQsIGd1ZXNzKSB7XHJcbiAgICAgICAgaWYgKHRhcmdldCA9PT0gMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gLU1hdGgubG9nKGd1ZXNzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiAtTWF0aC5sb2coMSAtIGd1ZXNzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW5ldHdvcmsuanMubWFwIiwiZXhwb3J0IGNsYXNzIFFMZWFybmVyIHtcclxuICAgIC8vVE9ETyAtIGNoYW5nZSBlcGlzb2RlIHRvIHVwZGF0ZVxyXG4gICAgY29uc3RydWN0b3IoUiwgZ2FtbWEsIGdvYWwpIHtcclxuICAgICAgICB0aGlzLnJhd01heCA9IDE7XHJcbiAgICAgICAgdGhpcy5SID0gUjtcclxuICAgICAgICB0aGlzLmdhbW1hID0gZ2FtbWE7XHJcbiAgICAgICAgdGhpcy5nb2FsID0gZ29hbDtcclxuICAgICAgICB0aGlzLlEgPSB7fTtcclxuICAgICAgICBmb3IgKHZhciBzdGF0ZSBpbiBSKSB7XHJcbiAgICAgICAgICAgIHRoaXMuUVtzdGF0ZV0gPSB7fTtcclxuICAgICAgICAgICAgZm9yICh2YXIgYWN0aW9uIGluIFJbc3RhdGVdKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLlFbc3RhdGVdW2FjdGlvbl0gPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZ2FtbWEgPSBnYW1tYTtcclxuICAgIH1cclxuICAgIGdyb3coc3RhdGUsIGFjdGlvbnMpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFjdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgLy9yZXdhcmQgaXMgY3VycmVudGx5IHVua25vd25cclxuICAgICAgICAgICAgdGhpcy5SW3N0YXRlXVthY3Rpb25zW2ldXSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZXhwbG9yZShwcm9tKSB7XHJcbiAgICB9XHJcbiAgICB0cmFuc2l0aW9uKHN0YXRlLCBhY3Rpb24pIHtcclxuICAgICAgICAvL2lzIHRoZSBzdGF0ZSB1bmV4YW1pbmVkXHJcbiAgICAgICAgbGV0IGV4YW1pbmVkID0gdHJ1ZTtcclxuICAgICAgICBsZXQgYmVzdEFjdGlvbjtcclxuICAgICAgICBmb3IgKGFjdGlvbiBpbiB0aGlzLlJbc3RhdGVdKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLlJbc3RhdGVdW2FjdGlvbl0gPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGJlc3RBY3Rpb24gPSBhY3Rpb247XHJcbiAgICAgICAgICAgICAgICBleGFtaW5lZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJlc3RBY3Rpb24gPSB0aGlzLm1heChhY3Rpb24pO1xyXG4gICAgICAgIHRoaXMuUVtzdGF0ZV1bYWN0aW9uXSA9IHRoaXMuUltzdGF0ZV1bYWN0aW9uXSArICh0aGlzLmdhbW1hICogdGhpcy5RW2FjdGlvbl1bYmVzdEFjdGlvbl0pO1xyXG4gICAgfVxyXG4gICAgbWF4KHN0YXRlKSB7XHJcbiAgICAgICAgdmFyIG1heCA9IDAsIG1heEFjdGlvbiA9IG51bGw7XHJcbiAgICAgICAgZm9yICh2YXIgYWN0aW9uIGluIHRoaXMuUVtzdGF0ZV0pIHtcclxuICAgICAgICAgICAgaWYgKCFtYXhBY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIG1heCA9IHRoaXMuUVtzdGF0ZV1bYWN0aW9uXTtcclxuICAgICAgICAgICAgICAgIG1heEFjdGlvbiA9IGFjdGlvbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLlFbc3RhdGVdW2FjdGlvbl0gPT09IG1heCAmJiAoTWF0aC5yYW5kb20oKSA+IDAuNSkpIHtcclxuICAgICAgICAgICAgICAgIG1heCA9IHRoaXMuUVtzdGF0ZV1bYWN0aW9uXTtcclxuICAgICAgICAgICAgICAgIG1heEFjdGlvbiA9IGFjdGlvbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLlFbc3RhdGVdW2FjdGlvbl0gPiBtYXgpIHtcclxuICAgICAgICAgICAgICAgIG1heCA9IHRoaXMuUVtzdGF0ZV1bYWN0aW9uXTtcclxuICAgICAgICAgICAgICAgIG1heEFjdGlvbiA9IGFjdGlvbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbWF4QWN0aW9uO1xyXG4gICAgfVxyXG4gICAgcG9zc2libGUoc3RhdGUpIHtcclxuICAgICAgICB2YXIgcG9zc2libGUgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBhY3Rpb24gaW4gdGhpcy5SW3N0YXRlXSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5SW3N0YXRlXVthY3Rpb25dID4gLTEpIHtcclxuICAgICAgICAgICAgICAgIHBvc3NpYmxlLnB1c2goYWN0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcG9zc2libGVbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcG9zc2libGUubGVuZ3RoKV07XHJcbiAgICB9XHJcbiAgICBlcGlzb2RlKHN0YXRlKSB7XHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uKHN0YXRlLCB0aGlzLnBvc3NpYmxlKHN0YXRlKSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuUTtcclxuICAgIH1cclxuICAgIG5vcm1hbGl6ZSgpIHtcclxuICAgICAgICBmb3IgKHZhciBzdGF0ZSBpbiB0aGlzLlEpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgYWN0aW9uIGluIHRoaXMuUVtzdGF0ZV0pIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLlFbYWN0aW9uXVtzdGF0ZV0gPj0gdGhpcy5yYXdNYXgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJhd01heCA9IHRoaXMuUVthY3Rpb25dW3N0YXRlXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKHZhciBzdGF0ZSBpbiB0aGlzLlEpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgYWN0aW9uIGluIHRoaXMuUVtzdGF0ZV0pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuUVthY3Rpb25dW3N0YXRlXSA9IE1hdGgucm91bmQodGhpcy5RW2FjdGlvbl1bc3RhdGVdIC8gdGhpcy5yYXdNYXggKiAxMDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVFMZWFybmVyLmpzLm1hcCIsImltcG9ydCB7IE5ldHdvcmsgfSBmcm9tICcuL25ldHdvcmsnO1xyXG5pbXBvcnQgeyBSTkdCdXJ0bGUgfSBmcm9tICcuL3JhbmRvbSc7XHJcbmV4cG9ydCBjbGFzcyBUYXNrRGVjb21wb3NlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihleGFtcGxlSW5wdXRzLCBleGFtcGxlVGFza3MsIHRhc2tMaWJyYXJ5LCBuZXR3b3JrUGFyYW1zLCBybmcgPSBuZXcgUk5HQnVydGxlKE1hdGgucmFuZG9tKCkpKSB7XHJcbiAgICAgICAgdGhpcy50cmFpbmluZ1N1bW1hcnkgPSBbXTtcclxuICAgICAgICB0aGlzLnRyYWluaW5nID0gZXhhbXBsZUlucHV0cztcclxuICAgICAgICB0aGlzLmxhYmVscyA9IGV4YW1wbGVUYXNrcztcclxuICAgICAgICB0aGlzLnRhc2tMaWJyYXJ5ID0gdGFza0xpYnJhcnk7XHJcbiAgICAgICAgdGhpcy5uZXR3b3JrUGFyYW1zID0gbmV0d29ya1BhcmFtcztcclxuICAgICAgICB0aGlzLnJuZyA9IHJuZztcclxuICAgIH1cclxuICAgIHRyYWluKHNhbXBsZXMgPSA1MCwgYmF0Y2hlcyA9IDI1LCBwb3BTaXplID0gMjUpIHtcclxuICAgICAgICBsZXQgY29zdEZucyA9IE9iamVjdC5rZXlzKE5ldHdvcmsuY29zdE1ldGhvZHMpO1xyXG4gICAgICAgIGxldCBhY3RGbnMgPSBPYmplY3Qua2V5cyhOZXR3b3JrLmFjdGl2YXRpb25NZXRob2RzKTtcclxuICAgICAgICBsZXQgdG9wTmV0O1xyXG4gICAgICAgIGxldCBuZXR3b3JrcyA9IFtdO1xyXG4gICAgICAgIGxldCB0ZXN0UmVzdWx0cyA9IFtdO1xyXG4gICAgICAgIGxldCBzdW1tYXJ5ID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiYXRjaGVzOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHRvcEFjY3VyYWN5ID0gLTEwMDtcclxuICAgICAgICAgICAgbGV0IGJvdHRvbUFjY3VyYWN5ID0gMTAwO1xyXG4gICAgICAgICAgICBsZXQgc3VtQWNjID0gMDtcclxuICAgICAgICAgICAgbGV0IGxvd2VzdExvc3MgPSAxZTk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcG9wU2l6ZTsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYWN0ID0gYWN0Rm5zW01hdGguZmxvb3IodGhpcy5ybmcucmFuZFJhbmdlKDAsIGFjdEZucy5sZW5ndGgpKV07XHJcbiAgICAgICAgICAgICAgICBsZXQgY29zdCA9IGNvc3RGbnNbTWF0aC5mbG9vcih0aGlzLnJuZy5yYW5kUmFuZ2UoMCwgY29zdEZucy5sZW5ndGgpKV07XHJcbiAgICAgICAgICAgICAgICBsZXQgaGlkZGVuID0gdGhpcy5uZXR3b3JrUGFyYW1zLmhpZGRlbi5tYXAoKGxheWVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IodGhpcy5ybmcucmFuZFJhbmdlKGxheWVyWzBdLCBsYXllclsxXSkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoaSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldHdvcmtzW2pdID0gbmV3IE5ldHdvcmsodGhpcy50cmFpbmluZywgdGhpcy5sYWJlbHMsIGhpZGRlbiwgYWN0LCBjb3N0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldHdvcmtzW2pdID0gbmV3IE5ldHdvcmsodGhpcy50cmFpbmluZywgdGhpcy5sYWJlbHMsIGhpZGRlbiwgYWN0LCBjb3N0KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA8IDAuNzUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV0d29ya3Nbal0uY29weU5ldHdvcmsodG9wTmV0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV0d29ya3Nbal0uYWN0Rm4gPSB0b3BOZXQuYWN0Rm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldHdvcmtzW2pdLmRlckZuID0gdG9wTmV0LmRlckZuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXR3b3Jrc1tqXS5jb3N0Rm4gPSB0b3BOZXQuY29zdEZuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXR3b3Jrc1tqXS5pdGVyID0gdG9wTmV0Lml0ZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbmV0d29ya3Nbal0ubGVhcm4oc2FtcGxlcywgdGhpcy50cmFpbmluZywgdGhpcy5sYWJlbHMpO1xyXG4gICAgICAgICAgICAgICAgdGVzdFJlc3VsdHNbal0gPSBuZXR3b3Jrc1tqXS5ldmFsdWF0ZSh0aGlzLnRyYWluaW5nLCB0aGlzLmxhYmVscyk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGVzdFJlc3VsdHNbal0uYWNjdXJhY3kgPiB0b3BBY2N1cmFjeSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRvcEFjY3VyYWN5ID0gdGVzdFJlc3VsdHNbal0uYWNjdXJhY3k7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9wTmV0ID0gbmV0d29ya3Nbal07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGVzdFJlc3VsdHNbal0ubG9zcyA8IGxvd2VzdExvc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb3dlc3RMb3NzID0gdGVzdFJlc3VsdHNbal0ubG9zcztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0ZXN0UmVzdWx0c1tqXS5hY2N1cmFjeSA8IGJvdHRvbUFjY3VyYWN5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYm90dG9tQWNjdXJhY3kgPSB0ZXN0UmVzdWx0c1tqXS5hY2N1cmFjeTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHN1bUFjYyArPSB0ZXN0UmVzdWx0c1tqXS5hY2N1cmFjeTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzdW1tYXJ5W2ldID0geyBsb3dlc3RMb3NzOiBsb3dlc3RMb3NzLCBtZWFuQWNjdXJhY3k6IHN1bUFjYyAvIHBvcFNpemUsIG1vc3RBY2M6IHRvcEFjY3VyYWN5LCBsZWFzdEFjYzogYm90dG9tQWNjdXJhY3kgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy50cmFpbmluZ1N1bW1hcnkgPSBzdW1tYXJ5O1xyXG4gICAgICAgIHRoaXMuYmVzdE5ldCA9IHRvcE5ldDtcclxuICAgIH1cclxuICAgIGxpdmVUcmFpbihpbnB1dCwgbGFiZWxzLCBjYWxsYmFjaykge1xyXG4gICAgICAgIC8vY29uc29sZS5sb2coaW5wdXQsIGxhYmVscylcclxuICAgICAgICBsZXQgcmVzdWx0ID0gdGhpcy5iZXN0TmV0LmNsYXNzaWZ5KGlucHV0KTtcclxuICAgICAgICBsZXQgbWF4ID0galN0YXQubWF4KHJlc3VsdCk7XHJcbiAgICAgICAgbGV0IGxhYmVsSWR4ID0gcmVzdWx0LmluZGV4T2YobWF4KTtcclxuICAgICAgICBsZXQgbGFiZWwgPSAnJztcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gbGFiZWxzKSB7XHJcbiAgICAgICAgICAgIGlmIChsYWJlbHNba2V5XSA9PT0gbGFiZWxJZHgpIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsID0ga2V5O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhbGxiYWNrKGxhYmVsKTsgLy8udGhlbigodHJ1ZVJlc3VsdCkgPT4ge1xyXG4gICAgICAgIC8vdGhpcy5iZXN0TmV0LmJhY2t3YXJkKHRydWVSZXN1bHQpO1xyXG4gICAgICAgIC8vdGhpcy5iZXN0TmV0LnVwZGF0ZVdlaWdodHMoKTtcclxuICAgICAgICAvL3RoaXMuYmVzdE5ldC5yZXNldFRvdGFscygpO1xyXG4gICAgICAgIC8vdGhpcy50cmFpbmluZy5wdXNoKGlucHV0KTtcclxuICAgICAgICAvL3RoaXMubGFiZWxzLnB1c2godHJ1ZVJlc3VsdCk7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGFza0RlY29tcG9zZXIuanMubWFwIiwiaW1wb3J0IHsgc3RhbmRhcmRpemVkLCBkYXRhVG9NYXRyaXggfSBmcm9tICcuL3V0aWxzJztcclxuZXhwb3J0IGZ1bmN0aW9uIG9scyhpdnMsIGR2KSB7XHJcbiAgICBsZXQgZGF0YSA9IGRhdGFUb01hdHJpeChpdnMsIHRoaXMuc3RhbmRhcmRpemVkKTtcclxuICAgIGxldCBkdkRhdGEgPSBkdi5kYXRhO1xyXG4gICAgbGV0IG4gPSBkdkRhdGEubGVuZ3RoO1xyXG4gICAgbGV0IG1lYW5zID0gaXZzLm1hcCgoYSkgPT4geyByZXR1cm4gYS5tZWFuOyB9KTtcclxuICAgIGxldCBzZHMgPSBpdnMubWFwKChhKSA9PiB7IHJldHVybiBhLnNkOyB9KTtcclxuICAgIGxldCB2YXJzID0gaXZzLm1hcCgoYSkgPT4geyByZXR1cm4gW2EudmFyaWFuY2VdOyB9KTtcclxuICAgIG1lYW5zLnVuc2hpZnQoMSk7XHJcbiAgICBzZHMudW5zaGlmdCgxKTtcclxuICAgIHZhcnMudW5zaGlmdChbMV0pO1xyXG4gICAgaWYgKHRoaXMuc3RhbmRhcmRpemVkKSB7XHJcbiAgICAgICAgZHZEYXRhID0gc3RhbmRhcmRpemVkKGR2LmRhdGEpO1xyXG4gICAgfVxyXG4gICAgbGV0IFggPSBkYXRhO1xyXG4gICAgbGV0IFkgPSBkdkRhdGEubWFwKCh5KSA9PiB7IHJldHVybiBbeV07IH0pO1xyXG4gICAgbGV0IFhwcmltZSA9IGpTdGF0LnRyYW5zcG9zZShYKTtcclxuICAgIGxldCBYcHJpbWVYID0galN0YXQubXVsdGlwbHkoWHByaW1lLCBYKTtcclxuICAgIGxldCBYcHJpbWVZID0galN0YXQubXVsdGlwbHkoWHByaW1lLCBZKTtcclxuICAgIC8vY29lZmZpY2llbnRzXHJcbiAgICBsZXQgYiA9IGpTdGF0Lm11bHRpcGx5KGpTdGF0LmludihYcHJpbWVYKSwgWHByaW1lWSk7XHJcbiAgICB0aGlzLmJldGFzID0gYi5yZWR1Y2UoKGEsIGIpID0+IHsgcmV0dXJuIGEuY29uY2F0KGIpOyB9KTtcclxuICAgIC8vc3RhbmRhcmQgZXJyb3Igb2YgdGhlIGNvZWZmaWNpZW50c1xyXG4gICAgdGhpcy5zdEVyckNvZWZmID0galN0YXQubXVsdGlwbHkoalN0YXQuaW52KFhwcmltZVgpLCB2YXJzKVxyXG4gICAgICAgIC5yZWR1Y2UoKGEsIGIpID0+IHsgcmV0dXJuIGEuY29uY2F0KGIpOyB9KTtcclxuICAgIC8vdCBzdGF0aXN0aWNzXHJcbiAgICB0aGlzLnRTdGF0cyA9IHRoaXMuc3RFcnJDb2VmZi5tYXAoKHNlLCBpKSA9PiB7IHJldHVybiB0aGlzLmJldGFzW2ldIC8gc2U7IH0pO1xyXG4gICAgLy9wIHZhbHVlc1xyXG4gICAgdGhpcy5wVmFsdWVzID0gdGhpcy50U3RhdHMubWFwKCh0LCBpKSA9PiB7IHJldHVybiBqU3RhdC50dGVzdCh0LCBtZWFuc1tpXSwgc2RzW2ldLCBuKTsgfSk7XHJcbiAgICAvL3Jlc2lkdWFsc1xyXG4gICAgbGV0IHloYXQgPSBbXTtcclxuICAgIGxldCByZXMgPSBkdi5kYXRhLm1hcCgoZCwgaSkgPT4ge1xyXG4gICAgICAgIGRhdGFbaV0uc2hpZnQoKTtcclxuICAgICAgICBsZXQgcm93ID0gZGF0YVtpXTtcclxuICAgICAgICB5aGF0W2ldID0gdGhpcy5wcmVkaWN0KHJvdyk7XHJcbiAgICAgICAgcmV0dXJuIGQgLSB5aGF0W2ldO1xyXG4gICAgfSk7XHJcbiAgICBsZXQgcmVzaWR1YWwgPSB5aGF0O1xyXG4gICAgcmV0dXJuIHRoaXMuYmV0YXM7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHBscyh4LCB5KSB7XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmVncmVzc2lvbi5qcy5tYXAiLCJpbXBvcnQgeyBRQ29tcG9uZW50IH0gZnJvbSAnLi9RQ29tcG9uZW50JztcclxuLypcclxuKiBVdGlsaXR5IFN5c3RlbXMgY2xhc3NcclxuKi9cclxuZXhwb3J0IGNsYXNzIFVTeXMgZXh0ZW5kcyBRQ29tcG9uZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIG9wdGlvbnMsIGRhdGEpIHtcclxuICAgICAgICBzdXBlcihuYW1lKTtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgICAgIHRoaXMucmVzdWx0cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoYWdlbnQsIHN0ZXApIHtcclxuICAgICAgICB2YXIgdG1wID0gW10sIG1heCA9IDAsIGF2ZywgdG9wO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5vcHRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRtcFtpXSA9IDA7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5vcHRpb25zW2ldLmNvbnNpZGVyYXRpb25zLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYyA9IHRoaXMub3B0aW9uc1tpXS5jb25zaWRlcmF0aW9uc1tqXTtcclxuICAgICAgICAgICAgICAgIGxldCB4ID0gYy54KGFnZW50LCB0aGlzLm9wdGlvbnNbaV0ucGFyYW1zKTtcclxuICAgICAgICAgICAgICAgIHRtcFtpXSArPSBjLmYoeCwgYy5tLCBjLmIsIGMuayk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYXZnID0gdG1wW2ldIC8gdGhpcy5vcHRpb25zW2ldLmNvbnNpZGVyYXRpb25zLmxlbmd0aDtcclxuICAgICAgICAgICAgdGhpcy5yZXN1bHRzLnB1c2goeyBwb2ludDogYWdlbnQuaWQsIG9wdDogdGhpcy5vcHRpb25zW2ldLm5hbWUsIHJlc3VsdDogYXZnIH0pO1xyXG4gICAgICAgICAgICBpZiAoYXZnID4gbWF4KSB7XHJcbiAgICAgICAgICAgICAgICBhZ2VudC50b3AgPSB7IG5hbWU6IHRoaXMub3B0aW9uc1tpXS5uYW1lLCB1dGlsOiBhdmcgfTtcclxuICAgICAgICAgICAgICAgIHRvcCA9IGk7XHJcbiAgICAgICAgICAgICAgICBtYXggPSBhdmc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vcHRpb25zW3RvcF0uYWN0aW9uKHN0ZXAsIGFnZW50KTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1VU3lzLmpzLm1hcCIsImV4cG9ydCAqIGZyb20gJy4vdXRpbHMnO1xyXG5leHBvcnQgeyBRQ29tcG9uZW50IH0gZnJvbSAnLi9RQ29tcG9uZW50JztcclxuZXhwb3J0IHsgQkRJQWdlbnQgfSBmcm9tICcuL2JkaSc7XHJcbmV4cG9ydCAqIGZyb20gJy4vYmVoYXZpb3JUcmVlJztcclxuZXhwb3J0ICogZnJvbSAnLi9jb21wYXJ0bWVudCc7XHJcbmV4cG9ydCB7IENvbnRhY3RQYXRjaCB9IGZyb20gJy4vY29udGFjdFBhdGNoJztcclxuZXhwb3J0IHsgRW52aXJvbm1lbnQgfSBmcm9tICcuL2Vudmlyb25tZW50JztcclxuZXhwb3J0ICogZnJvbSAnLi9lcGknO1xyXG5leHBvcnQgKiBmcm9tICcuL2V2ZW50cyc7XHJcbmV4cG9ydCB7IEV4cGVyaW1lbnQgfSBmcm9tICcuL2V4cGVyaW1lbnQnO1xyXG5leHBvcnQgKiBmcm9tICcuL2dlbmV0aWMnO1xyXG4vL2V4cG9ydCB7RXZvbHV0aW9uYXJ5fSBmcm9tICcuL2V2b2x1dGlvbmFyeSc7XHJcbmV4cG9ydCB7IEV2b2x2ZSB9IGZyb20gJy4vZXZvbHZlJztcclxuZXhwb3J0IHsgSHlicmlkQXV0b21hdGEgfSBmcm9tICcuL2hhJztcclxuZXhwb3J0ICogZnJvbSAnLi9odG4nO1xyXG5leHBvcnQgKiBmcm9tICcuL2ludGVyZmFjZXMnO1xyXG5leHBvcnQgKiBmcm9tICcuL21jJztcclxuZXhwb3J0IHsga01lYW4gfSBmcm9tICcuL2ttZWFuJztcclxuZXhwb3J0IHsgS05OIH0gZnJvbSAnLi9rbm4nO1xyXG5leHBvcnQgKiBmcm9tICcuL21hdGgnO1xyXG5leHBvcnQgeyBOZXR3b3JrIH0gZnJvbSAnLi9uZXR3b3JrJztcclxuZXhwb3J0IHsgUUxlYXJuZXIgfSBmcm9tICcuL1FMZWFybmVyJztcclxuZXhwb3J0IHsgVGFza0RlY29tcG9zZXIgfSBmcm9tICcuL3Rhc2tEZWNvbXBvc2VyJztcclxuZXhwb3J0ICogZnJvbSAnLi9yZWdyZXNzaW9uJztcclxuZXhwb3J0IHsgU3RhdGVNYWNoaW5lIH0gZnJvbSAnLi9zdGF0ZU1hY2hpbmUnO1xyXG5leHBvcnQgKiBmcm9tICcuL1VTeXMnO1xyXG5leHBvcnQgKiBmcm9tICcuL3JhbmRvbSc7XHJcbmV4cG9ydCAqIGZyb20gJy4vcmVzb3VyY2UnO1xyXG5leHBvcnQgdmFyIHZlcnNpb24gPSAnMC4wLjUnO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYWluLmpzLm1hcCIsImltcG9ydCAqIGFzIHFlcGlraXQgZnJvbSAnLi9tYWluJztcclxubGV0IFFFcGlLaXQgPSBxZXBpa2l0O1xyXG5mb3IgKGxldCBrZXkgaW4gUUVwaUtpdCkge1xyXG4gICAgaWYgKGtleSA9PSAndmVyc2lvbicpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhRRXBpS2l0W2tleV0pO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXFlcGlraXQuanMubWFwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQU8sTUFBTSxRQUFRLENBQUM7SUFDbEIsV0FBVyxDQUFDLFFBQVEsRUFBRTtRQUNsQixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztRQUNqQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUN0QixJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztRQUMzQixJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztRQUMzQixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNmLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztRQUM1QixJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFDNUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFD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Q2xCO1lBQ0QsTUFBTTtLQUNiO0lBQ0QsT0FBTyxNQUFNLENBQUM7Q0FDakI7QUFDRCxBQUFPLFNBQVMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUU7SUFDakMsS0FBSyxJQUFJLEtBQUssSUFBSSxNQUFNLEVBQUU7UUFDdEIsSUFBSSxRQUFRLElBQUksQ0FBQyxLQUFLLFdBQVcsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQzdELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDO1NBQ3JFO2FBQ0ksSUFBSSxRQUFRLElBQUksQ0FBQyxLQUFLLFdBQVcsRUFBRTtZQUNwQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQztTQUNyRTtLQUNKO0NBQ0o7QUFDRCxBQUFPLFNBQVMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUU7SUFDakMsS0FBSyxJQUFJLEtBQUssSUFBSSxNQUFNLEVBQUU7UUFDdEIsSUFBSSxRQUFRLElBQUksQ0FBQyxLQUFLLFdBQVcsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQzdELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDO1NBQ3JFO2FBQ0ksSUFBSSxRQUFRLElBQUksQ0FBQyxLQUFLLFdBQVcsRUFBRTtZQUNwQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFL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QUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzdFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzdFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2hGLEtBQUssSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUU7WUFDaEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDdEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDNUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDckIsS0FBSyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFO2dCQUNuRCxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxD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QUFPLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0lBRXhDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNwRCxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDOztJQUV6RCxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUM7U0FDckQsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7SUFFL0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDOztJQUU3RSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7SUFFMUYsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ2QsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFH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
