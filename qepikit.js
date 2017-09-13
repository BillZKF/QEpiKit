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
        let model = {}, selu;
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
    constructor(data, labels, hiddenNum, activationType = "tanh") {
        this.iter = 0;
        this.correct = 0;
        this.hiddenNum = hiddenNum;
        this.learnRate = 0.01;
        this.actFn = Network.activationMethods[activationType];
        this.derFn = Network.derivativeMethods[activationType];
        this.init(data, labels);
    }
    learn(iterations, data, labels) {
        data = data || this.data;
        labels = labels || this.labels;
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

/***
*@module QEpiKit
*/
let QEpiKit = qepikit;
for (let key in QEpiKit) {
    if (key == 'version') {
        console.log(QEpiKit[key]);
    }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicWVwaWtpdC5qcyIsInNvdXJjZXMiOlsiZGlzdC9yZXNvdXJjZS5qcyIsImRpc3QvdXRpbHMuanMiLCJkaXN0L1FDb21wb25lbnQuanMiLCJkaXN0L2JkaS5qcyIsImRpc3QvYmVoYXZpb3JUcmVlLmpzIiwiZGlzdC9jb21wYXJ0bWVudC5qcyIsImRpc3QvY29udGFjdFBhdGNoLmpzIiwiZGlzdC9lbnZpcm9ubWVudC5qcyIsImRpc3QvZXBpLmpzIiwiZGlzdC9ldmVudHMuanMiLCJkaXN0L3N0YXRlTWFjaGluZS5qcyIsImRpc3QvcmFuZG9tLmpzIiwiZGlzdC9leHBlcmltZW50LmpzIiwiZGlzdC9nZW5ldGljLmpzIiwiZGlzdC9ldm9sdXRpb25hcnkuanMiLCJkaXN0L2V2b2x2ZS5qcyIsImRpc3QvaGEuanMiLCJkaXN0L2h0bi5qcyIsImRpc3QvbWMuanMiLCJkaXN0L2ttZWFuLmpzIiwiZGlzdC9rbm4uanMiLCJkaXN0L21hdGguanMiLCJkaXN0L25ldHdvcmsuanMiLCJkaXN0L1FMZWFybmVyLmpzIiwiZGlzdC9yZWdyZXNzaW9uLmpzIiwiZGlzdC9VU3lzLmpzIiwiZGlzdC9tYWluLmpzIiwiZGlzdC9RRXBpS2l0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBSZXNvdXJjZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZSkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IDA7XHJcbiAgICAgICAgdGhpcy5hdmFpbGFibGUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMudXNlVXBwZXJMaW1pdCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMudXNlTG93ZXJMaW1pdCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYWRkZWQgPSAwO1xyXG4gICAgICAgIHRoaXMucmVtb3ZlZCA9IDA7XHJcbiAgICAgICAgdGhpcy5pbmNvbWluZ1RyYW5zID0gMDtcclxuICAgICAgICB0aGlzLm91dGdvaW5nVHJhbnMgPSAwO1xyXG4gICAgICAgIHRoaXMubGFiZWwgPSB0ZW1wbGF0ZS5sYWJlbDtcclxuICAgICAgICB0aGlzLnVuaXRzID0gdGVtcGxhdGUudW5pdHM7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gdGVtcGxhdGUuY3VycmVudCB8fCAwO1xyXG4gICAgICAgIHRoaXMuYXZhaWxhYmxlID0gdGVtcGxhdGUuYXZhaWxhYmxlIHx8IHRydWU7XHJcbiAgICAgICAgdGhpcy51c2VVcHBlckxpbWl0ID0gdGVtcGxhdGUudXNlVXBwZXJMaW1pdCB8fCBmYWxzZTtcclxuICAgICAgICB0aGlzLmxvd2VyTGltaXQgPSB0ZW1wbGF0ZS51c2VMb3dlckxpbWl0IHx8IGZhbHNlO1xyXG4gICAgICAgIGlmICh0aGlzLnVzZUxvd2VyTGltaXQpIHtcclxuICAgICAgICAgICAgdGhpcy51cHBlckxpbWl0ID0gdGVtcGxhdGUudXBwZXJMaW1pdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMudXNlTG93ZXJMaW1pdCkge1xyXG4gICAgICAgICAgICB0aGlzLmxvd2VyTGltaXQgPSB0ZW1wbGF0ZS5sb3dlckxpbWl0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGxvd2VyTGltaXRDQihxdWFudGl0eSkge1xyXG4gICAgICAgIHRoaXMuYXZhaWxhYmxlID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB1cHBlckxpbWl0Q0IocXVhbnRpdHkpIHtcclxuICAgICAgICB0aGlzLmF2YWlsYWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmVtb3ZlKHF1YW50aXR5KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYXZhaWxhYmxlKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnVzZUxvd2VyTGltaXQgfHwgKHRoaXMudXNlVXBwZXJMaW1pdCAmJiB0aGlzLmN1cnJlbnQgPj0gdGhpcy51cHBlckxpbWl0KSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGdhcCA9IHRoaXMubG93ZXJMaW1pdCAtICh0aGlzLmN1cnJlbnQgLSBxdWFudGl0eSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZ2FwID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHF1YW50aXR5ID0gcXVhbnRpdHkgLSBnYXA7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb3dlckxpbWl0Q0IocXVhbnRpdHkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlZCA9IHRoaXMucmVtb3ZlZCB8fCAwO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQgLT0gcXVhbnRpdHk7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlZCArPSBxdWFudGl0eTtcclxuICAgICAgICAgICAgdGhpcy5vdXRnb2luZ1RyYW5zICs9IDE7XHJcbiAgICAgICAgICAgIHJldHVybiBxdWFudGl0eTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICBhZGQocXVhbnRpdHkpIHtcclxuICAgICAgICBpZiAodGhpcy5hdmFpbGFibGUgfHwgKHRoaXMudXNlTG93ZXJMaW1pdCAmJiB0aGlzLmN1cnJlbnQgPD0gdGhpcy5sb3dlckxpbWl0KSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy51c2VVcHBlckxpbWl0KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZXhjZXNzID0gKHRoaXMuY3VycmVudCArIHF1YW50aXR5KSAtIHRoaXMudXBwZXJMaW1pdDtcclxuICAgICAgICAgICAgICAgIGlmIChleGNlc3MgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcXVhbnRpdHkgPSBxdWFudGl0eSAtIGV4Y2VzcztcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwcGVyTGltaXRDQihxdWFudGl0eSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5hZGRlZCA9IHRoaXMuYWRkZWQgfHwgMDtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50ICs9IHF1YW50aXR5O1xyXG4gICAgICAgICAgICB0aGlzLmFkZGVkICs9IHF1YW50aXR5O1xyXG4gICAgICAgICAgICB0aGlzLmluY29taW5nVHJhbnMgKz0gMTtcclxuICAgICAgICAgICAgcmV0dXJuIHF1YW50aXR5O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICAgIHRyYW5zZmVyKHJlc291cmNlQiwgcXVhbnRpdHkpIHtcclxuICAgICAgICBxdWFudGl0eSA9IHRoaXMucmVtb3ZlKHF1YW50aXR5KTtcclxuICAgICAgICByZXNvdXJjZUIuYWRkKHF1YW50aXR5KTtcclxuICAgIH1cclxuICAgIGdpdmUoYWdlbnQsIHF1YW50aXR5KSB7XHJcbiAgICAgICAgcXVhbnRpdHkgPSB0aGlzLnJlbW92ZShxdWFudGl0eSk7XHJcbiAgICAgICAgYWdlbnRbdGhpcy5sYWJlbF0gPSBhZ2VudFt0aGlzLmxhYmVsXSB8fCAwO1xyXG4gICAgICAgIGFnZW50W3RoaXMubGFiZWxdICs9IHF1YW50aXR5O1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlc291cmNlLmpzLm1hcCIsImltcG9ydCB7IFJlc291cmNlIH0gZnJvbSAnLi9yZXNvdXJjZSc7XHJcbmV4cG9ydCBjb25zdCBTVUNDRVNTID0gMTtcclxuZXhwb3J0IGNvbnN0IEZBSUxFRCA9IDI7XHJcbmV4cG9ydCBjb25zdCBSVU5OSU5HID0gMztcclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNTVlVSSShkYXRhKSB7XHJcbiAgICB2YXIgZGF0YVN0cmluZztcclxuICAgIHZhciBVUkk7XHJcbiAgICB2YXIgY3N2Q29udGVudCA9IFwiZGF0YTp0ZXh0L2NzdjtjaGFyc2V0PXV0Zi04LFwiO1xyXG4gICAgdmFyIGNzdkNvbnRlbnRBcnJheSA9IFtdO1xyXG4gICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpbmZvQXJyYXkpIHtcclxuICAgICAgICBkYXRhU3RyaW5nID0gaW5mb0FycmF5LmpvaW4oXCIsXCIpO1xyXG4gICAgICAgIGNzdkNvbnRlbnRBcnJheS5wdXNoKGRhdGFTdHJpbmcpO1xyXG4gICAgfSk7XHJcbiAgICBjc3ZDb250ZW50ICs9IGNzdkNvbnRlbnRBcnJheS5qb2luKFwiXFxuXCIpO1xyXG4gICAgVVJJID0gZW5jb2RlVVJJKGNzdkNvbnRlbnQpO1xyXG4gICAgcmV0dXJuIFVSSTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gYXJyYXlGcm9tUmFuZ2Uoc3RhcnQsIGVuZCwgc3RlcCkge1xyXG4gICAgdmFyIHJhbmdlID0gW107XHJcbiAgICB2YXIgaSA9IHN0YXJ0O1xyXG4gICAgd2hpbGUgKGkgPCBlbmQpIHtcclxuICAgICAgICByYW5nZS5wdXNoKGkpO1xyXG4gICAgICAgIGkgKz0gc3RlcDtcclxuICAgIH1cclxuICAgIHJldHVybiByYW5nZTtcclxufVxyXG4vKipcclxuKiBzaHVmZmxlIC0gZmlzaGVyLXlhdGVzIHNodWZmbGVcclxuKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNodWZmbGUoYXJyYXksIHJuZykge1xyXG4gICAgdmFyIGN1cnJlbnRJbmRleCA9IGFycmF5Lmxlbmd0aCwgdGVtcG9yYXJ5VmFsdWUsIHJhbmRvbUluZGV4O1xyXG4gICAgLy8gV2hpbGUgdGhlcmUgcmVtYWluIGVsZW1lbnRzIHRvIHNodWZmbGUuLi5cclxuICAgIHdoaWxlICgwICE9PSBjdXJyZW50SW5kZXgpIHtcclxuICAgICAgICAvLyBQaWNrIGEgcmVtYWluaW5nIGVsZW1lbnQuLi5cclxuICAgICAgICByYW5kb21JbmRleCA9IE1hdGguZmxvb3Iocm5nLnJhbmRvbSgpICogY3VycmVudEluZGV4KTtcclxuICAgICAgICBjdXJyZW50SW5kZXggLT0gMTtcclxuICAgICAgICAvLyBBbmQgc3dhcCBpdCB3aXRoIHRoZSBjdXJyZW50IGVsZW1lbnQuXHJcbiAgICAgICAgdGVtcG9yYXJ5VmFsdWUgPSBhcnJheVtjdXJyZW50SW5kZXhdO1xyXG4gICAgICAgIGFycmF5W2N1cnJlbnRJbmRleF0gPSBhcnJheVtyYW5kb21JbmRleF07XHJcbiAgICAgICAgYXJyYXlbcmFuZG9tSW5kZXhdID0gdGVtcG9yYXJ5VmFsdWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXJyYXk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlVVVJRCgpIHtcclxuICAgIC8vIGh0dHA6Ly93d3cuYnJvb2ZhLmNvbS9Ub29scy9NYXRoLnV1aWQuaHRtXHJcbiAgICB2YXIgY2hhcnMgPSAnMDEyMzQ1Njc4OUFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXonLnNwbGl0KCcnKTtcclxuICAgIHZhciB1dWlkID0gbmV3IEFycmF5KDM2KTtcclxuICAgIHZhciBybmQgPSAwLCByO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzNjsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGkgPT0gOCB8fCBpID09IDEzIHx8IGkgPT0gMTggfHwgaSA9PSAyMykge1xyXG4gICAgICAgICAgICB1dWlkW2ldID0gJy0nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChpID09IDE0KSB7XHJcbiAgICAgICAgICAgIHV1aWRbaV0gPSAnNCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAocm5kIDw9IDB4MDIpXHJcbiAgICAgICAgICAgICAgICBybmQgPSAweDIwMDAwMDAgKyAoTWF0aC5yYW5kb20oKSAqIDB4MTAwMDAwMCkgfCAwO1xyXG4gICAgICAgICAgICByID0gcm5kICYgMHhmO1xyXG4gICAgICAgICAgICBybmQgPSBybmQgPj4gNDtcclxuICAgICAgICAgICAgdXVpZFtpXSA9IGNoYXJzWyhpID09IDE5KSA/IChyICYgMHgzKSB8IDB4OCA6IHJdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB1dWlkLmpvaW4oJycpO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBhbHdheXMoYSkge1xyXG4gICAgaWYgKGEgPT09IFNVQ0NFU1MpIHtcclxuICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGV2ZW50dWFsbHkoYSkge1xyXG4gICAgaWYgKGEgPT09IFNVQ0NFU1MpIHtcclxuICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBSVU5OSU5HO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBlcXVhbFRvKGEsIGIpIHtcclxuICAgIGlmIChhID09PSBiKSB7XHJcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBub3QocmVzdWx0KSB7XHJcbiAgICB2YXIgbmV3UmVzdWx0O1xyXG4gICAgaWYgKHJlc3VsdCA9PT0gU1VDQ0VTUykge1xyXG4gICAgICAgIG5ld1Jlc3VsdCA9IEZBSUxFRDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHJlc3VsdCA9PT0gRkFJTEVEKSB7XHJcbiAgICAgICAgbmV3UmVzdWx0ID0gU1VDQ0VTUztcclxuICAgIH1cclxuICAgIHJldHVybiBuZXdSZXN1bHQ7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIG5vdEVxdWFsVG8oYSwgYikge1xyXG4gICAgaWYgKGEgIT09IGIpIHtcclxuICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGd0KGEsIGIpIHtcclxuICAgIGlmIChhID4gYikge1xyXG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZ3RFcShhLCBiKSB7XHJcbiAgICBpZiAoYSA+PSBiKSB7XHJcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBsdChhLCBiKSB7XHJcbiAgICBpZiAoYSA8IGIpIHtcclxuICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGx0RXEoYSwgYikge1xyXG4gICAgaWYgKGEgPD0gYikge1xyXG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gaGFzUHJvcChhLCBiKSB7XHJcbiAgICBhID0gYSB8fCBmYWxzZTtcclxuICAgIGlmIChhID09PSBiKSB7XHJcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBpblJhbmdlKGEsIGIpIHtcclxuICAgIGlmIChiID49IGFbMF0gJiYgYiA8PSBhWzFdKSB7XHJcbiAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBub3RJblJhbmdlKGEsIGIpIHtcclxuICAgIGlmIChiID49IGFbMF0gJiYgYiA8PSBhWzFdKSB7XHJcbiAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRNYXRjaGVyU3RyaW5nKGNoZWNrKSB7XHJcbiAgICB2YXIgc3RyaW5nID0gbnVsbDtcclxuICAgIHN3aXRjaCAoY2hlY2spIHtcclxuICAgICAgICBjYXNlIGVxdWFsVG86XHJcbiAgICAgICAgICAgIHN0cmluZyA9IFwiZXF1YWwgdG9cIjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBub3RFcXVhbFRvOlxyXG4gICAgICAgICAgICBzdHJpbmcgPSBcIm5vdCBlcXVhbCB0b1wiO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIGd0OlxyXG4gICAgICAgICAgICBzdHJpbmcgPSBcImdyZWF0ZXIgdGhhblwiO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIGd0RXE6XHJcbiAgICAgICAgICAgIHN0cmluZyA9IFwiZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvXCI7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgbHQ6XHJcbiAgICAgICAgICAgIHN0cmluZyA9IFwibGVzcyB0aGFuXCI7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgbHRFcTpcclxuICAgICAgICAgICAgc3RyaW5nID0gXCJsZXNzIHRoYW4gb3IgZXF1YWwgdG9cIjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBoYXNQcm9wOlxyXG4gICAgICAgICAgICBzdHJpbmcgPSBcImhhcyB0aGUgcHJvcGVydHlcIjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHN0cmluZyA9IFwibm90IGEgZGVmaW5lZCBtYXRjaGVyXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHN0cmluZztcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gc2V0TWluKHBhcmFtcywga2V5cykge1xyXG4gICAgZm9yICh2YXIgcGFyYW0gaW4gcGFyYW1zKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiAoa2V5cykgIT09ICd1bmRlZmluZWQnICYmIGtleXMuaW5kZXhPZihwYXJhbSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHBhcmFtc1twYXJhbV0uY3VycmVudCA9IHBhcmFtc1twYXJhbV0udmFsdWUgLSBwYXJhbXNbcGFyYW1dLmVycm9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgKGtleXMpID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBwYXJhbXNbcGFyYW1dLmN1cnJlbnQgPSBwYXJhbXNbcGFyYW1dLnZhbHVlIC0gcGFyYW1zW3BhcmFtXS5lcnJvcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHNldE1heChwYXJhbXMsIGtleXMpIHtcclxuICAgIGZvciAodmFyIHBhcmFtIGluIHBhcmFtcykge1xyXG4gICAgICAgIGlmICh0eXBlb2YgKGtleXMpICE9PSAndW5kZWZpbmVkJyAmJiBrZXlzLmluZGV4T2YocGFyYW0pICE9PSAtMSkge1xyXG4gICAgICAgICAgICBwYXJhbXNbcGFyYW1dLmN1cnJlbnQgPSBwYXJhbXNbcGFyYW1dLnZhbHVlICsgcGFyYW1zW3BhcmFtXS5lcnJvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIChrZXlzKSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgcGFyYW1zW3BhcmFtXS5jdXJyZW50ID0gcGFyYW1zW3BhcmFtXS52YWx1ZSArIHBhcmFtc1twYXJhbV0uZXJyb3I7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRTdGFuZGFyZChwYXJhbXMsIGtleXMpIHtcclxuICAgIGZvciAodmFyIHBhcmFtIGluIHBhcmFtcykge1xyXG4gICAgICAgIGlmICh0eXBlb2YgKGtleXMpICE9PSAndW5kZWZpbmVkJyAmJiBrZXlzLmluZGV4T2YocGFyYW0pICE9PSAtMSkge1xyXG4gICAgICAgICAgICBwYXJhbXNbcGFyYW1dLmN1cnJlbnQgPSBwYXJhbXNbcGFyYW1dLnZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgKGtleXMpID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBwYXJhbXNbcGFyYW1dLmN1cnJlbnQgPSBwYXJhbXNbcGFyYW1dLnZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZGF0YVRvTWF0cml4KGl0ZW1zLCBzdGRpemVkID0gZmFsc2UpIHtcclxuICAgIGxldCBkYXRhID0gW107XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgbGV0IGl0ZW0gPSBpdGVtc1tpXTtcclxuICAgICAgICBpZiAoc3RkaXplZCkge1xyXG4gICAgICAgICAgICBpdGVtID0gc2NhbGUoaXRlbSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGl0ZW0uZm9yRWFjaCgoeCwgaWkpID0+IHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBkYXRhW2lpXSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIGRhdGFbaWldID0gWzEsIHhdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZGF0YVtpaV0ucHVzaCh4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGRhdGE7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGNhdGVnb3JpZXNUb1ZlY3RvcihkYXRhKSB7XHJcbiAgICBsZXQgdmFsdWVzID0gW107XHJcbiAgICBsZXQga2V5cyA9IHt9O1xyXG4gICAgbGV0IG1hdHJpeDtcclxuICAgIGxldCBpZHggPSAwO1xyXG4gICAgZGF0YS5mb3JFYWNoKCh4KSA9PiB7XHJcbiAgICAgICAgbGV0IGtleSA9IHggKyAnJztcclxuICAgICAgICBpZiAoIShrZXkgaW4ga2V5cykpIHtcclxuICAgICAgICAgICAgdmFsdWVzLnB1c2goa2V5KTtcclxuICAgICAgICAgICAga2V5c1trZXldID0gdmFsdWVzLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBtYXRyaXggPSBkYXRhLm1hcCgoeSkgPT4ge1xyXG4gICAgICAgIGxldCB6ID0gdmFsdWVzLm1hcCgodikgPT4geyByZXR1cm4gMDsgfSk7XHJcbiAgICAgICAgbGV0IGlkeCA9IGtleXNbeSArICcnXTtcclxuICAgICAgICB6W2lkeF0gPSAxO1xyXG4gICAgICAgIHJldHVybiB6O1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4geyBsYWJlbHM6IGtleXMsIGRhdGE6IG1hdHJpeCB9O1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBzY2FsZSh2YWxzLCBjZW50ZXIsIHNjYWxlKSB7XHJcbiAgICBpZiAodHlwZW9mIHZhbHMgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgcmV0dXJuICh2YWxzIC0gY2VudGVyKSAvIHNjYWxlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgY2VudGVyID0gY2VudGVyIHx8IGpTdGF0Lm1lYW4odmFscyk7XHJcbiAgICAgICAgc2NhbGUgPSBzY2FsZSB8fCBqU3RhdC5zdGRldih2YWxzKTtcclxuICAgICAgICByZXR1cm4gdmFscy5tYXAoKGQpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIChkIC0gY2VudGVyKSAvIHNjYWxlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBzY2FsZUludih2YWxzLCBjZW50ZXIsIHNjYWxlKSB7XHJcbiAgICBpZiAodHlwZW9mIHZhbHMgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgcmV0dXJuIHZhbHMgKiBzY2FsZSArIGNlbnRlcjtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiB2YWxzLm1hcCgoZCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gZCAqIHNjYWxlICsgY2VudGVyO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcbi8qXHJcbiogcmVsYXRpdmUgdG8gdGhlIG1lYW4sIGhvdyBtYW55IHNkc1xyXG4qL1xyXG5leHBvcnQgZnVuY3Rpb24gc3RhbmRhcmRpemVkKGFycikge1xyXG4gICAgbGV0IHN0ZCA9IGpTdGF0LnN0ZGV2KGFycik7XHJcbiAgICBsZXQgbWVhbiA9IGpTdGF0Lm1lYW4oYXJyKTtcclxuICAgIGxldCBzdGFuZGFyZGl6ZWQgPSBhcnIubWFwKChkKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIChkIC0gbWVhbikgLyBzdGQ7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBzdGFuZGFyZGl6ZWQ7XHJcbn1cclxuLypcclxuKiBiZXR3ZWVuIDAgYW5kIDEgd2hlbiBtaW4gYW5kIG1heCBhcmUga25vd25cclxuKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZSh4LCBtaW4sIG1heCkge1xyXG4gICAgbGV0IHZhbCA9IHggLSBtaW47XHJcbiAgICByZXR1cm4gdmFsIC8gKG1heCAtIG1pbik7XHJcbn1cclxuLypcclxuKiBnaXZlIHRoZSByZWFsIHVuaXQgdmFsdWVcclxuKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGludk5vcm0oeCwgbWluLCBtYXgpIHtcclxuICAgIHJldHVybiAoeCAqIG1heCAtIHggKiBtaW4pICsgbWluO1xyXG59XHJcbi8qXHJcbipcclxuKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJhbmRSYW5nZShtaW4sIG1heCkge1xyXG4gICAgcmV0dXJuIChtYXggLSBtaW4pICogTWF0aC5yYW5kb20oKSArIG1pbjtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmFuZ2UoZGF0YSwgcHJvcCkge1xyXG4gICAgbGV0IHJhbmdlID0ge1xyXG4gICAgICAgIG1pbjogMWUxNSxcclxuICAgICAgICBtYXg6IC0xZTE1XHJcbiAgICB9O1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKHJhbmdlLm1pbiA+IGRhdGFbaV1bcHJvcF0pIHtcclxuICAgICAgICAgICAgcmFuZ2UubWluID0gZGF0YVtpXVtwcm9wXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJhbmdlLm1heCA8IGRhdGFbaV1bcHJvcF0pIHtcclxuICAgICAgICAgICAgcmFuZ2UubWF4ID0gZGF0YVtpXVtwcm9wXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmFuZ2U7XHJcbn1cclxuZXhwb3J0IGNsYXNzIE1hdGNoIHtcclxuICAgIHN0YXRpYyBndChhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEgPiBiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdlKGEsIGIpIHtcclxuICAgICAgICBpZiAoYSA+PSBiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGx0KGEsIGIpIHtcclxuICAgICAgICBpZiAoYSA8IGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgbGUoYSwgYikge1xyXG4gICAgICAgIGlmIChhIDw9IGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgYWx3YXlzKGEpIHtcclxuICAgICAgICBpZiAoYSA9PT0gU1VDQ0VTUykge1xyXG4gICAgICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc3RhdGljIGV2ZW50dWFsbHkoYSkge1xyXG4gICAgICAgIGlmIChhID09PSBTVUNDRVNTKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIFJVTk5JTkc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc3RhdGljIGVxdWFsVG8oYSwgYikge1xyXG4gICAgICAgIGlmIChhID09PSBiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgbm90KHJlc3VsdCkge1xyXG4gICAgICAgIHZhciBuZXdSZXN1bHQ7XHJcbiAgICAgICAgaWYgKHJlc3VsdCA9PT0gU1VDQ0VTUykge1xyXG4gICAgICAgICAgICBuZXdSZXN1bHQgPSBGQUlMRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHJlc3VsdCA9PT0gRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIG5ld1Jlc3VsdCA9IFNVQ0NFU1M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXdSZXN1bHQ7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgbm90RXF1YWxUbyhhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEgIT09IGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHN0YXRpYyBndEVxKGEsIGIpIHtcclxuICAgICAgICBpZiAoYSA+PSBiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgbHRFcShhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEgPD0gYikge1xyXG4gICAgICAgICAgICByZXR1cm4gU1VDQ0VTUztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBGQUlMRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc3RhdGljIGhhc1Byb3AoYSwgYikge1xyXG4gICAgICAgIGEgPSBhIHx8IGZhbHNlO1xyXG4gICAgICAgIGlmIChhID09PSBiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBTVUNDRVNTO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgaW5SYW5nZShhLCBiKSB7XHJcbiAgICAgICAgaWYgKGIgPj0gYVswXSAmJiBiIDw9IGFbMV0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHN0YXRpYyBub3RJblJhbmdlKGEsIGIpIHtcclxuICAgICAgICBpZiAoYiA+PSBhWzBdICYmIGIgPD0gYVsxXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gRkFJTEVEO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIFNVQ0NFU1M7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBhZGRSZXNvdXJjZXMoYXJyLCB0ZW1wbGF0ZSwgbnVtYmVyKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG51bWJlcjsgaSsrKSB7XHJcbiAgICAgICAgYXJyLnB1c2gobmV3IFJlc291cmNlKHRlbXBsYXRlKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXJyO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVBvcChudW1BZ2VudHMsIG9wdGlvbnMsIHR5cGUsIGJvdW5kYXJpZXMsIGN1cnJlbnRBZ2VudElkLCBybmcpIHtcclxuICAgIHZhciBwb3AgPSBbXTtcclxuICAgIHZhciBsb2NzID0ge1xyXG4gICAgICAgIHR5cGU6ICdGZWF0dXJlQ29sbGVjdGlvbicsXHJcbiAgICAgICAgZmVhdHVyZXM6IFtdXHJcbiAgICB9O1xyXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwgW107XHJcbiAgICB0eXBlID0gdHlwZSB8fCAnY29udGludW91cyc7XHJcbiAgICBmb3IgKHZhciBhID0gMDsgYSA8IG51bUFnZW50czsgYSsrKSB7XHJcbiAgICAgICAgcG9wW2FdID0ge1xyXG4gICAgICAgICAgICBpZDogY3VycmVudEFnZW50SWQsXHJcbiAgICAgICAgICAgIHR5cGU6IHR5cGUsXHJcbiAgICAgICAgICAgIHN0YXRlczoge31cclxuICAgICAgICB9O1xyXG4gICAgICAgIC8vbW92ZW1lbnQgcGFyYW1zXHJcbiAgICAgICAgcG9wW2FdLm1vdmVQZXJEYXkgPSBybmcubm9ybWFsKDI1MDAgKiAyNCwgMTAwMCk7IC8vIG0vZGF5XHJcbiAgICAgICAgcG9wW2FdLnByZXZYID0gMDtcclxuICAgICAgICBwb3BbYV0ucHJldlkgPSAwO1xyXG4gICAgICAgIHBvcFthXS5tb3ZlZFRvdGFsID0gMDtcclxuICAgICAgICBpZiAocG9wW2FdLnR5cGUgPT09ICdjb250aW51b3VzJykge1xyXG4gICAgICAgICAgICBwb3BbYV0ubWVzaCA9IG5ldyBUSFJFRS5NZXNoKG5ldyBUSFJFRS5UZXRyYWhlZHJvbkdlb21ldHJ5KDEsIDEpLCBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe1xyXG4gICAgICAgICAgICAgICAgY29sb3I6IDB4MDAwMDAwXHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgcG9wW2FdLm1lc2gucUlkID0gcG9wW2FdLmlkO1xyXG4gICAgICAgICAgICBwb3BbYV0ubWVzaC50eXBlID0gJ2FnZW50JztcclxuICAgICAgICAgICAgcG9wW2FdLnBvc2l0aW9uID0geyB4OiAwLCB5OiAwLCB6OiAwIH07XHJcbiAgICAgICAgICAgIHBvcFthXS5ib3VuZGFyeUdyb3VwID0gb3B0aW9ucy5ncm91cE5hbWU7XHJcbiAgICAgICAgICAgIHBvcFthXS5wb3NpdGlvbi54ID0gcm5nLnJhbmRSYW5nZShib3VuZGFyaWVzLmxlZnQsIGJvdW5kYXJpZXMucmlnaHQpO1xyXG4gICAgICAgICAgICBwb3BbYV0ucG9zaXRpb24ueSA9IHJuZy5yYW5kUmFuZ2UoYm91bmRhcmllcy5ib3R0b20sIGJvdW5kYXJpZXMudG9wKTtcclxuICAgICAgICAgICAgcG9wW2FdLm1lc2gucG9zaXRpb24ueCA9IHBvcFthXS5wb3NpdGlvbi54O1xyXG4gICAgICAgICAgICBwb3BbYV0ubWVzaC5wb3NpdGlvbi55ID0gcG9wW2FdLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2NlbmUgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICBzY2VuZS5hZGQocG9wW2FdLm1lc2gpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwb3BbYV0udHlwZSA9PT0gJ2dlb3NwYXRpYWwnKSB7XHJcbiAgICAgICAgICAgIGxvY3MuZmVhdHVyZXNbYV0gPSB0dXJmLnBvaW50KFtybmcucmFuZFJhbmdlKC03NS4xNDY3LCAtNzUuMTg2NyksIHJuZy5yYW5kUmFuZ2UoMzkuOTIwMCwgMzkuOTkwMCldKTtcclxuICAgICAgICAgICAgcG9wW2FdLmxvY2F0aW9uID0gbG9jcy5mZWF0dXJlc1thXTtcclxuICAgICAgICAgICAgcG9wW2FdLmxvY2F0aW9uLnByb3BlcnRpZXMuYWdlbnRSZWZJRCA9IHBvcFthXS5pZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcG9wW2FdID0gYXNzaWduUGFyYW1zKHBvcFthXSwgb3B0aW9ucywgcm5nKTtcclxuICAgICAgICBjdXJyZW50QWdlbnRJZCsrO1xyXG4gICAgfVxyXG4gICAgZm9yIChsZXQgYSA9IDA7IGEgPCBwb3AubGVuZ3RoOyBhKyspIHtcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gcG9wW2FdLnN0YXRlcykge1xyXG4gICAgICAgICAgICBwb3BbYV1bcG9wW2FdLnN0YXRlc1trZXldXSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIFtwb3AsIGxvY3NdO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBhc3NpZ25QYXJhbXModGFyZ2V0T2JqLCBwYXJhbXMsIHJuZykge1xyXG4gICAgZm9yIChsZXQga2V5IGluIHBhcmFtcykge1xyXG4gICAgICAgIHRhcmdldE9ialtrZXldID0gYXNzaWduUGFyYW0odGFyZ2V0T2JqLCBwYXJhbXNba2V5XSwga2V5LCBybmcpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRhcmdldE9iajtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gYXNzaWduUGFyYW0odGFyZ2V0T2JqLCBwYXJhbSwga2V5LCBybmcpIHtcclxuICAgIGlmICh0eXBlb2YgcGFyYW0uc3RhdGVzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIHRhcmdldE9iai5zdGF0ZXNba2V5XSA9IHJuZy5waWNrKHBhcmFtLnN0YXRlcy5wYXJhbXNbMF0sIHBhcmFtLnN0YXRlcy5wYXJhbXNbMV0pO1xyXG4gICAgICAgIHJldHVybiB0YXJnZXRPYmouc3RhdGVzW2tleV07XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHBhcmFtLmRpc3RyaWJ1dGlvbiAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICB0YXJnZXRPYmpba2V5XSA9IHJuZ1twYXJhbS5kaXN0cmlidXRpb24ubmFtZV0ocGFyYW0uZGlzdHJpYnV0aW9uLnBhcmFtc1swXSwgcGFyYW0uZGlzdHJpYnV0aW9uLnBhcmFtc1sxXSk7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHBhcmFtLmFjdGlvbiAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICB0YXJnZXRPYmpba2V5XSA9IFFBY3Rpb25zW3BhcmFtLmFjdGlvbl07XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHBhcmFtLmFzc2lnbiAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICB0YXJnZXRPYmpba2V5XSA9IHBhcmFtLmFzc2lnbjtcclxuICAgIH1cclxuICAgIHJldHVybiB0YXJnZXRPYmpba2V5XTtcclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD11dGlscy5qcy5tYXAiLCJpbXBvcnQgeyBnZW5lcmF0ZVVVSUQgfSBmcm9tICcuL3V0aWxzJztcclxuLyoqXHJcbipRQ29tcG9uZW50cyBhcmUgdGhlIGJhc2UgY2xhc3MgZm9yIG1hbnkgbW9kZWwgY29tcG9uZW50cy5cclxuKi9cclxuZXhwb3J0IGNsYXNzIFFDb21wb25lbnQge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSkge1xyXG4gICAgICAgIHRoaXMuaWQgPSBnZW5lcmF0ZVVVSUQoKTtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMudGltZSA9IDA7XHJcbiAgICAgICAgdGhpcy5oaXN0b3J5ID0gW107XHJcbiAgICB9XHJcbiAgICAvKiogVGFrZSBvbmUgdGltZSBzdGVwIGZvcndhcmQgKG1vc3Qgc3ViY2xhc3NlcyBvdmVycmlkZSB0aGUgYmFzZSBtZXRob2QpXHJcbiAgICAqIEBwYXJhbSBzdGVwIHNpemUgb2YgdGltZSBzdGVwIChpbiBkYXlzIGJ5IGNvbnZlbnRpb24pXHJcbiAgICAqL1xyXG4gICAgdXBkYXRlKGFnZW50LCBzdGVwKSB7XHJcbiAgICAgICAgLy9zb21ldGhpbmcgc3VwZXIhXHJcbiAgICB9XHJcbn1cclxuUUNvbXBvbmVudC5TVUNDRVNTID0gMTtcclxuUUNvbXBvbmVudC5GQUlMRUQgPSAyO1xyXG5RQ29tcG9uZW50LlJVTk5JTkcgPSAzO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1RQ29tcG9uZW50LmpzLm1hcCIsImltcG9ydCB7IFFDb21wb25lbnQgfSBmcm9tICcuL1FDb21wb25lbnQnO1xyXG5pbXBvcnQgeyBnZXRNYXRjaGVyU3RyaW5nIH0gZnJvbSAnLi91dGlscyc7XHJcbi8qKlxyXG4qIEJlbGllZiBEZXNpcmUgSW50ZW50IGFnZW50cyBhcmUgc2ltcGxlIHBsYW5uaW5nIGFnZW50cyB3aXRoIG1vZHVsYXIgcGxhbnMgLyBkZWxpYmVyYXRpb24gcHJvY2Vzc2VzLlxyXG4qL1xyXG5leHBvcnQgY2xhc3MgQkRJQWdlbnQgZXh0ZW5kcyBRQ29tcG9uZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGdvYWxzID0gW10sIHBsYW5zID0ge30sIGRhdGEgPSBbXSwgcG9saWN5U2VsZWN0b3IgPSBCRElBZ2VudC5zdG9jaGFzdGljU2VsZWN0aW9uKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSk7XHJcbiAgICAgICAgdGhpcy5nb2FscyA9IGdvYWxzO1xyXG4gICAgICAgIHRoaXMucGxhbnMgPSBwbGFucztcclxuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xyXG4gICAgICAgIHRoaXMucG9saWN5U2VsZWN0b3IgPSBwb2xpY3lTZWxlY3RvcjtcclxuICAgICAgICB0aGlzLmJlbGllZkhpc3RvcnkgPSBbXTtcclxuICAgICAgICB0aGlzLnBsYW5IaXN0b3J5ID0gW107XHJcbiAgICB9XHJcbiAgICAvKiogVGFrZSBvbmUgdGltZSBzdGVwIGZvcndhcmQsIHRha2UgaW4gYmVsaWVmcywgZGVsaWJlcmF0ZSwgaW1wbGVtZW50IHBvbGljeVxyXG4gICAgKiBAcGFyYW0gc3RlcCBzaXplIG9mIHRpbWUgc3RlcCAoaW4gZGF5cyBieSBjb252ZW50aW9uKVxyXG4gICAgKi9cclxuICAgIHVwZGF0ZShhZ2VudCwgc3RlcCkge1xyXG4gICAgICAgIHZhciBwb2xpY3ksIGludGVudCwgZXZhbHVhdGlvbjtcclxuICAgICAgICBwb2xpY3kgPSB0aGlzLnBvbGljeVNlbGVjdG9yKHRoaXMucGxhbnMsIHRoaXMucGxhbkhpc3RvcnksIGFnZW50KTtcclxuICAgICAgICBpbnRlbnQgPSB0aGlzLnBsYW5zW3BvbGljeV07XHJcbiAgICAgICAgaW50ZW50KGFnZW50LCBzdGVwKTtcclxuICAgICAgICBldmFsdWF0aW9uID0gdGhpcy5ldmFsdWF0ZUdvYWxzKGFnZW50KTtcclxuICAgICAgICB0aGlzLnBsYW5IaXN0b3J5LnB1c2goeyB0aW1lOiB0aGlzLnRpbWUsIGlkOiBhZ2VudC5pZCwgaW50ZW50aW9uOiBwb2xpY3ksIGdvYWxzOiBldmFsdWF0aW9uLmFjaGlldmVtZW50cywgYmFycmllcnM6IGV2YWx1YXRpb24uYmFycmllcnMsIHI6IGV2YWx1YXRpb24uc3VjY2Vzc2VzIC8gdGhpcy5nb2Fscy5sZW5ndGggfSk7XHJcbiAgICB9XHJcbiAgICBldmFsdWF0ZUdvYWxzKGFnZW50KSB7XHJcbiAgICAgICAgbGV0IGFjaGlldmVtZW50cyA9IFtdLCBiYXJyaWVycyA9IFtdLCBzdWNjZXNzZXMgPSAwLCBjLCBtYXRjaGVyO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5nb2Fscy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjID0gdGhpcy5nb2Fsc1tpXS5jb25kaXRpb247XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYy5kYXRhID09PSAndW5kZWZpbmVkJyB8fCBjLmRhdGEgPT09IFwiYWdlbnRcIikge1xyXG4gICAgICAgICAgICAgICAgYy5kYXRhID0gYWdlbnQ7IC8vaWYgbm8gZGF0YXNvdXJjZSBpcyBzZXQsIHVzZSB0aGUgYWdlbnRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhY2hpZXZlbWVudHNbaV0gPSB0aGlzLmdvYWxzW2ldLnRlbXBvcmFsKGMuY2hlY2soYy5kYXRhW2Mua2V5XSwgYy52YWx1ZSkpO1xyXG4gICAgICAgICAgICBpZiAoYWNoaWV2ZW1lbnRzW2ldID09PSBCRElBZ2VudC5TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzZXMgKz0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG1hdGNoZXIgPSBnZXRNYXRjaGVyU3RyaW5nKGMuY2hlY2spO1xyXG4gICAgICAgICAgICAgICAgYmFycmllcnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGMubGFiZWwsXHJcbiAgICAgICAgICAgICAgICAgICAga2V5OiBjLmtleSxcclxuICAgICAgICAgICAgICAgICAgICBjaGVjazogbWF0Y2hlcixcclxuICAgICAgICAgICAgICAgICAgICBhY3R1YWw6IGMuZGF0YVtjLmtleV0sXHJcbiAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IGMudmFsdWVcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3Nlczogc3VjY2Vzc2VzLCBiYXJyaWVyczogYmFycmllcnMsIGFjaGlldmVtZW50czogYWNoaWV2ZW1lbnRzIH07XHJcbiAgICB9XHJcbiAgICAvL2dvb2QgZm9yIHRyYWluaW5nXHJcbiAgICBzdGF0aWMgc3RvY2hhc3RpY1NlbGVjdGlvbihwbGFucywgcGxhbkhpc3RvcnksIGFnZW50KSB7XHJcbiAgICAgICAgdmFyIHBvbGljeSwgc2NvcmUsIG1heCA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgcGxhbiBpbiBwbGFucykge1xyXG4gICAgICAgICAgICBzY29yZSA9IE1hdGgucmFuZG9tKCk7XHJcbiAgICAgICAgICAgIGlmIChzY29yZSA+PSBtYXgpIHtcclxuICAgICAgICAgICAgICAgIG1heCA9IHNjb3JlO1xyXG4gICAgICAgICAgICAgICAgcG9saWN5ID0gcGxhbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcG9saWN5O1xyXG4gICAgfVxyXG59XHJcbkJESUFnZW50LmxhenlQb2xpY3lTZWxlY3Rpb24gPSBmdW5jdGlvbiAocGxhbnMsIHBsYW5IaXN0b3J5LCBhZ2VudCkge1xyXG4gICAgdmFyIG9wdGlvbnMsIHNlbGVjdGlvbjtcclxuICAgIGlmICh0aGlzLnRpbWUgPiAwKSB7XHJcbiAgICAgICAgb3B0aW9ucyA9IE9iamVjdC5rZXlzKHBsYW5zKTtcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucy5zbGljZSgxLCBvcHRpb25zLmxlbmd0aCk7XHJcbiAgICAgICAgc2VsZWN0aW9uID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogb3B0aW9ucy5sZW5ndGgpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgb3B0aW9ucyA9IE9iamVjdC5rZXlzKHBsYW5zKTtcclxuICAgICAgICBzZWxlY3Rpb24gPSAwO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG9wdGlvbnNbc2VsZWN0aW9uXTtcclxufTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YmRpLmpzLm1hcCIsImltcG9ydCB7IFFDb21wb25lbnQgfSBmcm9tICcuL1FDb21wb25lbnQnO1xyXG5pbXBvcnQgeyBnZW5lcmF0ZVVVSUQgfSBmcm9tICcuL3V0aWxzJztcclxuLyoqXHJcbiogQmVoYXZpb3IgVHJlZVxyXG4qKi9cclxuZXhwb3J0IGNsYXNzIEJlaGF2aW9yVHJlZSBleHRlbmRzIFFDb21wb25lbnQge1xyXG4gICAgc3RhdGljIHRpY2sobm9kZSwgYWdlbnQpIHtcclxuICAgICAgICB2YXIgc3RhdGUgPSBub2RlLm9wZXJhdGUoYWdlbnQpO1xyXG4gICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH1cclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHJvb3QsIGRhdGEpIHtcclxuICAgICAgICBzdXBlcihuYW1lKTtcclxuICAgICAgICB0aGlzLnJvb3QgPSByb290O1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgdGhpcy5yZXN1bHRzID0gW107XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoYWdlbnQsIHN0ZXApIHtcclxuICAgICAgICB2YXIgc3RhdGU7XHJcbiAgICAgICAgYWdlbnQuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB3aGlsZSAoYWdlbnQuYWN0aXZlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHN0YXRlID0gQmVoYXZpb3JUcmVlLnRpY2sodGhpcy5yb290LCBhZ2VudCk7XHJcbiAgICAgICAgICAgIGFnZW50LnRpbWUgPSB0aGlzLnRpbWU7XHJcbiAgICAgICAgICAgIGFnZW50LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEJUTm9kZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lKSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IGdlbmVyYXRlVVVJRCgpO1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEJUQ29udHJvbE5vZGUgZXh0ZW5kcyBCVE5vZGUge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgY2hpbGRyZW4pIHtcclxuICAgICAgICBzdXBlcihuYW1lKTtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEJUUm9vdCBleHRlbmRzIEJUQ29udHJvbE5vZGUge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgY2hpbGRyZW4pIHtcclxuICAgICAgICBzdXBlcihuYW1lLCBjaGlsZHJlbik7XHJcbiAgICAgICAgdGhpcy50eXBlID0gXCJyb290XCI7XHJcbiAgICAgICAgdGhpcy5vcGVyYXRlID0gZnVuY3Rpb24gKGFnZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBzdGF0ZSA9IEJlaGF2aW9yVHJlZS50aWNrKHRoaXMuY2hpbGRyZW5bMF0sIGFnZW50KTtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEJUU2VsZWN0b3IgZXh0ZW5kcyBCVENvbnRyb2xOb2RlIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNoaWxkcmVuKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSwgY2hpbGRyZW4pO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IFwic2VsZWN0b3JcIjtcclxuICAgICAgICB0aGlzLm9wZXJhdGUgPSBmdW5jdGlvbiAoYWdlbnQpIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkU3RhdGU7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGNoaWxkIGluIHRoaXMuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkU3RhdGUgPSBCZWhhdmlvclRyZWUudGljayh0aGlzLmNoaWxkcmVuW2NoaWxkXSwgYWdlbnQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5SVU5OSU5HKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5SVU5OSU5HO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5TVUNDRVNTO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBCZWhhdmlvclRyZWUuRkFJTEVEO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEJUU2VxdWVuY2UgZXh0ZW5kcyBCVENvbnRyb2xOb2RlIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNoaWxkcmVuKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSwgY2hpbGRyZW4pO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IFwic2VxdWVuY2VcIjtcclxuICAgICAgICB0aGlzLm9wZXJhdGUgPSBmdW5jdGlvbiAoYWdlbnQpIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkU3RhdGU7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGNoaWxkIGluIHRoaXMuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkU3RhdGUgPSBCZWhhdmlvclRyZWUudGljayh0aGlzLmNoaWxkcmVuW2NoaWxkXSwgYWdlbnQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5SVU5OSU5HKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5SVU5OSU5HO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5GQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLkZBSUxFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLlNVQ0NFU1M7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgQlRQYXJhbGxlbCBleHRlbmRzIEJUQ29udHJvbE5vZGUge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgY2hpbGRyZW4sIHN1Y2Nlc3Nlcykge1xyXG4gICAgICAgIHN1cGVyKG5hbWUsIGNoaWxkcmVuKTtcclxuICAgICAgICB0aGlzLnR5cGUgPSBcInBhcmFsbGVsXCI7XHJcbiAgICAgICAgdGhpcy5zdWNjZXNzZXMgPSBzdWNjZXNzZXM7XHJcbiAgICAgICAgdGhpcy5vcGVyYXRlID0gZnVuY3Rpb24gKGFnZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBzdWNjZWVkZWQgPSBbXSwgZmFpbHVyZXMgPSBbXSwgY2hpbGRTdGF0ZSwgbWFqb3JpdHk7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGNoaWxkIGluIHRoaXMuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkU3RhdGUgPSBCZWhhdmlvclRyZWUudGljayh0aGlzLmNoaWxkcmVuW2NoaWxkXSwgYWdlbnQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VlZGVkLnB1c2goY2hpbGRTdGF0ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaGlsZFN0YXRlID09PSBCZWhhdmlvclRyZWUuRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmFpbHVyZXMucHVzaChjaGlsZFN0YXRlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNoaWxkU3RhdGUgPT09IEJlaGF2aW9yVHJlZS5SVU5OSU5HKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJlaGF2aW9yVHJlZS5SVU5OSU5HO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzdWNjZWVkZWQubGVuZ3RoID49IHRoaXMuc3VjY2Vzc2VzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLlNVQ0NFU1M7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gQmVoYXZpb3JUcmVlLkZBSUxFRDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEJUQ29uZGl0aW9uIGV4dGVuZHMgQlROb2RlIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNvbmRpdGlvbikge1xyXG4gICAgICAgIHN1cGVyKG5hbWUpO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IFwiY29uZGl0aW9uXCI7XHJcbiAgICAgICAgdGhpcy5jb25kaXRpb24gPSBjb25kaXRpb247XHJcbiAgICAgICAgdGhpcy5vcGVyYXRlID0gZnVuY3Rpb24gKGFnZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBzdGF0ZTtcclxuICAgICAgICAgICAgc3RhdGUgPSBjb25kaXRpb24uY2hlY2soYWdlbnRbY29uZGl0aW9uLmtleV0sIGNvbmRpdGlvbi52YWx1ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBCVEFjdGlvbiBleHRlbmRzIEJUTm9kZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBjb25kaXRpb24sIGFjdGlvbikge1xyXG4gICAgICAgIHN1cGVyKG5hbWUpO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IFwiYWN0aW9uXCI7XHJcbiAgICAgICAgdGhpcy5jb25kaXRpb24gPSBjb25kaXRpb247XHJcbiAgICAgICAgdGhpcy5hY3Rpb24gPSBhY3Rpb247XHJcbiAgICAgICAgdGhpcy5vcGVyYXRlID0gZnVuY3Rpb24gKGFnZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBzdGF0ZTtcclxuICAgICAgICAgICAgc3RhdGUgPSBjb25kaXRpb24uY2hlY2soYWdlbnRbY29uZGl0aW9uLmtleV0sIGNvbmRpdGlvbi52YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmIChzdGF0ZSA9PT0gQmVoYXZpb3JUcmVlLlNVQ0NFU1MpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWN0aW9uKGFnZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1iZWhhdmlvclRyZWUuanMubWFwIiwiaW1wb3J0IHsgZ2VuZXJhdGVVVUlEIH0gZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCB7IFFDb21wb25lbnQgfSBmcm9tICcuL1FDb21wb25lbnQnO1xyXG5leHBvcnQgY2xhc3MgQ29tcGFydG1lbnRNb2RlbCBleHRlbmRzIFFDb21wb25lbnQge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgY29tcGFydG1lbnRzLCBkYXRhKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSk7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTsgLy9hbiBhcnJheSBvZiBQYXRjaGVzLiBFYWNoIHBhdGNoIGNvbnRhaW5zIGFuIGFycmF5IG9mIGNvbXBhcnRtZW50cyBpbiBvcGVyYXRpb25hbCBvcmRlclxyXG4gICAgICAgIHRoaXMudG90YWxQb3AgPSAwO1xyXG4gICAgICAgIHRoaXMuY29tcGFydG1lbnRzID0gY29tcGFydG1lbnRzO1xyXG4gICAgICAgIHRoaXMuaGlzdG9yeSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGQgPSAwOyBkIDwgdGhpcy5kYXRhLmxlbmd0aDsgZCsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMudG90YWxQb3AgKz0gdGhpcy5kYXRhW2RdLnRvdGFsUG9wO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl90b2xlcmFuY2UgPSAxZS05OyAvL21vZGVsIGVyciB0b2xlcmFuY2VcclxuICAgIH1cclxuICAgIHVwZGF0ZShwYXRjaCwgc3RlcCkge1xyXG4gICAgICAgIGxldCB0ZW1wX3BvcCA9IHt9LCB0ZW1wX2QgPSB7fSwgbmV4dF9kID0ge30sIGx0ZSA9IHt9LCBlcnIgPSAxLCBuZXdTdGVwO1xyXG4gICAgICAgIGZvciAobGV0IGMgaW4gdGhpcy5jb21wYXJ0bWVudHMpIHtcclxuICAgICAgICAgICAgcGF0Y2guZHBvcHNbY10gPSB0aGlzLmNvbXBhcnRtZW50c1tjXS5vcGVyYXRpb24ocGF0Y2gucG9wdWxhdGlvbnMsIHN0ZXApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL2ZpcnN0IG9yZGVyIChFdWxlcilcclxuICAgICAgICBmb3IgKGxldCBjIGluIHRoaXMuY29tcGFydG1lbnRzKSB7XHJcbiAgICAgICAgICAgIHRlbXBfcG9wW2NdID0gcGF0Y2gucG9wdWxhdGlvbnNbY107XHJcbiAgICAgICAgICAgIHRlbXBfZFtjXSA9IHBhdGNoLmRwb3BzW2NdO1xyXG4gICAgICAgICAgICBwYXRjaC5wb3B1bGF0aW9uc1tjXSA9IHRlbXBfcG9wW2NdICsgdGVtcF9kW2NdO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL3NlY29uZCBvcmRlciAoSGV1bnMpXHJcbiAgICAgICAgcGF0Y2gudG90YWxQb3AgPSAwO1xyXG4gICAgICAgIGZvciAobGV0IGMgaW4gdGhpcy5jb21wYXJ0bWVudHMpIHtcclxuICAgICAgICAgICAgbmV4dF9kW2NdID0gdGhpcy5jb21wYXJ0bWVudHNbY10ub3BlcmF0aW9uKHBhdGNoLnBvcHVsYXRpb25zLCBzdGVwKTtcclxuICAgICAgICAgICAgcGF0Y2gucG9wdWxhdGlvbnNbY10gPSB0ZW1wX3BvcFtjXSArICgwLjUgKiAodGVtcF9kW2NdICsgbmV4dF9kW2NdKSk7XHJcbiAgICAgICAgICAgIHBhdGNoLnRvdGFsUG9wICs9IHBhdGNoLnBvcHVsYXRpb25zW2NdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgQ29tcGFydG1lbnQge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgcG9wLCBvcGVyYXRpb24pIHtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMub3BlcmF0aW9uID0gb3BlcmF0aW9uIHx8IG51bGw7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIFBhdGNoIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNvbXBhcnRtZW50cywgcG9wdWxhdGlvbnMpIHtcclxuICAgICAgICB0aGlzLnBvcHVsYXRpb25zID0ge307XHJcbiAgICAgICAgdGhpcy5kcG9wcyA9IHt9O1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbFBvcCA9IHt9O1xyXG4gICAgICAgIHRoaXMuaWQgPSBnZW5lcmF0ZVVVSUQoKTtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMuZHBvcHMgPSB7fTtcclxuICAgICAgICB0aGlzLmNvbXBhcnRtZW50cyA9IGNvbXBhcnRtZW50cztcclxuICAgICAgICB0aGlzLnRvdGFsUG9wID0gMDtcclxuICAgICAgICBmb3IgKGxldCBjIGluIHBvcHVsYXRpb25zKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZHBvcHNbY10gPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmluaXRpYWxQb3BbY10gPSBwb3B1bGF0aW9uc1tjXTtcclxuICAgICAgICAgICAgdGhpcy5wb3B1bGF0aW9uc1tjXSA9IHBvcHVsYXRpb25zW2NdO1xyXG4gICAgICAgICAgICB0aGlzLnRvdGFsUG9wICs9IHRoaXMucG9wdWxhdGlvbnNbY107XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbXBhcnRtZW50LmpzLm1hcCIsImltcG9ydCB7IGdlbmVyYXRlVVVJRCB9IGZyb20gJy4vdXRpbHMnO1xyXG5leHBvcnQgY2xhc3MgQ29udGFjdFBhdGNoIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNhcGFjaXR5KSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IGdlbmVyYXRlVVVJRCgpO1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy5jYXBhY2l0eSA9IGNhcGFjaXR5O1xyXG4gICAgICAgIHRoaXMucG9wID0gMDtcclxuICAgICAgICB0aGlzLm1lbWJlcnMgPSB7fTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBkZWZhdWx0RnJlcUYoYSwgYikge1xyXG4gICAgICAgIHZhciB2YWwgPSAoNTAgLSBNYXRoLmFicyhhLmFnZSAtIGIuYWdlKSkgLyAxMDA7XHJcbiAgICAgICAgcmV0dXJuIHZhbDtcclxuICAgIH1cclxuICAgIHN0YXRpYyBkZWZhdWx0Q29udGFjdEYoYSwgdGltZSkge1xyXG4gICAgICAgIHZhciBjID0gMiAqIE1hdGguc2luKHRpbWUpICsgYTtcclxuICAgICAgICBpZiAoYyA+PSAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGFzc2lnbihhZ2VudCwgY29udGFjdFZhbHVlRnVuYykge1xyXG4gICAgICAgIHZhciBjb250YWN0VmFsdWU7XHJcbiAgICAgICAgY29udGFjdFZhbHVlRnVuYyA9IGNvbnRhY3RWYWx1ZUZ1bmMgfHwgQ29udGFjdFBhdGNoLmRlZmF1bHRGcmVxRjtcclxuICAgICAgICBpZiAodGhpcy5wb3AgPCB0aGlzLmNhcGFjaXR5KSB7XHJcbiAgICAgICAgICAgIHRoaXMubWVtYmVyc1thZ2VudC5pZF0gPSB7IHByb3BlcnRpZXM6IGFnZW50IH07XHJcbiAgICAgICAgICAgIGZvciAobGV0IG90aGVyIGluIHRoaXMubWVtYmVycykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGlkID0gcGFyc2VJbnQob3RoZXIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG90aGVyICE9PSBhZ2VudC5pZCAmJiAhaXNOYU4oaWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGFjdFZhbHVlID0gY29udGFjdFZhbHVlRnVuYyh0aGlzLm1lbWJlcnNbaWRdLnByb3BlcnRpZXMsIGFnZW50KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbWJlcnNbYWdlbnQuaWRdW2lkXSA9IGNvbnRhY3RWYWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbWJlcnNbaWRdW2FnZW50LmlkXSA9IGNvbnRhY3RWYWx1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnBvcCsrO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVuY291bnRlcnMoYWdlbnQsIHByZWNvbmRpdGlvbiwgY29udGFjdEZ1bmMsIHJlc3VsdEtleSwgc2F2ZSA9IGZhbHNlKSB7XHJcbiAgICAgICAgY29udGFjdEZ1bmMgPSBjb250YWN0RnVuYyB8fCBDb250YWN0UGF0Y2guZGVmYXVsdENvbnRhY3RGO1xyXG4gICAgICAgIGxldCBjb250YWN0VmFsO1xyXG4gICAgICAgIGZvciAodmFyIGNvbnRhY3QgaW4gdGhpcy5tZW1iZXJzKSB7XHJcbiAgICAgICAgICAgIGlmIChwcmVjb25kaXRpb24ua2V5ID09PSAnc3RhdGVzJykge1xyXG4gICAgICAgICAgICAgICAgY29udGFjdFZhbCA9IEpTT04uc3RyaW5naWZ5KHRoaXMubWVtYmVyc1tjb250YWN0XS5wcm9wZXJ0aWVzW3ByZWNvbmRpdGlvbi5rZXldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnRhY3RWYWwgPSB0aGlzLm1lbWJlcnNbY29udGFjdF0ucHJvcGVydGllc1twcmVjb25kaXRpb24ua2V5XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocHJlY29uZGl0aW9uLmNoZWNrKHRoaXMubWVtYmVyc1tjb250YWN0XS5wcm9wZXJ0aWVzW3ByZWNvbmRpdGlvbi5rZXldLCBwcmVjb25kaXRpb24udmFsdWUpICYmIE51bWJlcihjb250YWN0KSAhPT0gYWdlbnQuaWQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBvbGRWYWwgPSB0aGlzLm1lbWJlcnNbY29udGFjdF0ucHJvcGVydGllc1tyZXN1bHRLZXldO1xyXG4gICAgICAgICAgICAgICAgdmFyIG5ld1ZhbCA9IGNvbnRhY3RGdW5jKHRoaXMubWVtYmVyc1tjb250YWN0XSwgYWdlbnQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG9sZFZhbCAhPT0gbmV3VmFsICYmIHNhdmUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbWJlcnNbY29udGFjdF0ucHJvcGVydGllc1tyZXN1bHRLZXldID0gbmV3VmFsO1xyXG4gICAgICAgICAgICAgICAgICAgIENvbnRhY3RQYXRjaC5XSVdBcnJheS5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0Y2hJRDogdGhpcy5pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZlY3RlZDogY29udGFjdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5mZWN0ZWRBZ2U6IHRoaXMubWVtYmVyc1tjb250YWN0XS5wcm9wZXJ0aWVzLmFnZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiB0aGlzLm1lbWJlcnNbY29udGFjdF0ucHJvcGVydGllc1tyZXN1bHRLZXldLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRLZXk6IHJlc3VsdEtleSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnk6IGFnZW50LmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBieUFnZTogYWdlbnQuYWdlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lOiBhZ2VudC50aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuQ29udGFjdFBhdGNoLldJV0FycmF5ID0gW107XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbnRhY3RQYXRjaC5qcy5tYXAiLCJpbXBvcnQgeyBzaHVmZmxlIH0gZnJvbSAnLi91dGlscyc7XHJcbi8qKlxyXG4qRW52aXJvbm1lbnRzIGFyZSB0aGUgZXhlY3V0YWJsZSBlbnZpcm9ubWVudCBjb250YWluaW5nIHRoZSBtb2RlbCBjb21wb25lbnRzLFxyXG4qc2hhcmVkIHJlc291cmNlcywgYW5kIHNjaGVkdWxlci5cclxuKi9cclxuZXhwb3J0IGNsYXNzIEVudmlyb25tZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKHJlc291cmNlcyA9IFtdLCBlbnRpdGllcyA9IHt9LCBldmVudHNRdWV1ZSA9IFtdLCBhY3RpdmF0aW9uVHlwZSA9ICdyYW5kb20nLCBybmcgPSBNYXRoKSB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiBzcGF0aWFsIGJvdW5kYXJpZXNcclxuICAgICAgICAqKi9cclxuICAgICAgICB0aGlzLmJvdW5kYXJpZXMgPSB7fTtcclxuICAgICAgICB0aGlzLnRpbWUgPSAwO1xyXG4gICAgICAgIHRoaXMudGltZU9mRGF5ID0gMDtcclxuICAgICAgICB0aGlzLm1vZGVscyA9IFtdO1xyXG4gICAgICAgIHRoaXMuaGlzdG9yeSA9IFtdO1xyXG4gICAgICAgIHRoaXMuYWdlbnRzID0gW107XHJcbiAgICAgICAgdGhpcy5yZXNvdXJjZXMgPSByZXNvdXJjZXM7XHJcbiAgICAgICAgdGhpcy5lbnRpdGllcyA9IGVudGl0aWVzO1xyXG4gICAgICAgIHRoaXMuZXZlbnRzUXVldWUgPSBldmVudHNRdWV1ZTtcclxuICAgICAgICB0aGlzLmFjdGl2YXRpb25UeXBlID0gYWN0aXZhdGlvblR5cGU7XHJcbiAgICAgICAgdGhpcy5ybmcgPSBybmc7XHJcbiAgICAgICAgdGhpcy5fYWdlbnRJbmRleCA9IHt9O1xyXG4gICAgfVxyXG4gICAgLyoqIEFkZCBhIG1vZGVsIGNvbXBvbmVudHMgZnJvbSB0aGUgZW52aXJvbm1lbnRcclxuICAgICogQHBhcmFtIGNvbXBvbmVudCB0aGUgbW9kZWwgY29tcG9uZW50IG9iamVjdCB0byBiZSBhZGRlZCB0byB0aGUgZW52aXJvbm1lbnQuXHJcbiAgICAqL1xyXG4gICAgYWRkKGNvbXBvbmVudCkge1xyXG4gICAgICAgIHRoaXMubW9kZWxzLnB1c2goY29tcG9uZW50KTtcclxuICAgIH1cclxuICAgIC8qKiBSZW1vdmUgYSBtb2RlbCBjb21wb25lbnRzIGZyb20gdGhlIGVudmlyb25tZW50IGJ5IGlkXHJcbiAgICAqIEBwYXJhbSBpZCBVVUlEIG9mIHRoZSBjb21wb25lbnQgdG8gYmUgcmVtb3ZlZC5cclxuICAgICovXHJcbiAgICByZW1vdmUoaWQpIHtcclxuICAgICAgICB2YXIgZGVsZXRlSW5kZXgsIEwgPSB0aGlzLmFnZW50cy5sZW5ndGg7XHJcbiAgICAgICAgdGhpcy5tb2RlbHMuZm9yRWFjaChmdW5jdGlvbiAoYywgaW5kZXgpIHtcclxuICAgICAgICAgICAgaWYgKGMuaWQgPT09IGlkKSB7XHJcbiAgICAgICAgICAgICAgICBkZWxldGVJbmRleCA9IGluZGV4O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgd2hpbGUgKEwgPiAwICYmIHRoaXMuYWdlbnRzLmxlbmd0aCA+PSAwKSB7XHJcbiAgICAgICAgICAgIEwtLTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYWdlbnRzW0xdLm1vZGVsSW5kZXggPT09IGRlbGV0ZUluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFnZW50cy5zcGxpY2UoTCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5tb2RlbHMuc3BsaWNlKGRlbGV0ZUluZGV4LCAxKTtcclxuICAgIH1cclxuICAgIC8qKiBSdW4gYWxsIGVudmlyb25tZW50IG1vZGVsIGNvbXBvbmVudHMgZnJvbSB0PTAgdW50aWwgdD11bnRpbCB1c2luZyB0aW1lIHN0ZXAgPSBzdGVwXHJcbiAgICAqIEBwYXJhbSBzdGVwIHRoZSBzdGVwIHNpemVcclxuICAgICogQHBhcmFtIHVudGlsIHRoZSBlbmQgdGltZVxyXG4gICAgKiBAcGFyYW0gc2F2ZUludGVydmFsIHNhdmUgZXZlcnkgJ3gnIHN0ZXBzXHJcbiAgICAqL1xyXG4gICAgcnVuKHN0ZXAsIHVudGlsLCBzYXZlSW50ZXJ2YWwpIHtcclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgICAgICB3aGlsZSAodGhpcy50aW1lIDw9IHVudGlsKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKHN0ZXApO1xyXG4gICAgICAgICAgICBsZXQgcmVtID0gKHRoaXMudGltZSAlIHNhdmVJbnRlcnZhbCk7XHJcbiAgICAgICAgICAgIGlmIChyZW0gPCBzdGVwKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY29weSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5hZ2VudHMpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGlzdG9yeSA9IHRoaXMuaGlzdG9yeS5jb25jYXQoY29weSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy50aW1lICs9IHN0ZXA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqIEFzc2lnbiBhbGwgYWdlbnRzIHRvIGFwcHJvcHJpYXRlIG1vZGVsc1xyXG4gICAgKi9cclxuICAgIGluaXQoKSB7XHJcbiAgICAgICAgdGhpcy5fYWdlbnRJbmRleCA9IHt9O1xyXG4gICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgdGhpcy5tb2RlbHMubGVuZ3RoOyBjKyspIHtcclxuICAgICAgICAgICAgbGV0IGFscmVhZHlJbiA9IFtdO1xyXG4gICAgICAgICAgICAvL2Fzc2lnbiBlYWNoIGFnZW50IG1vZGVsIGluZGV4ZXMgdG8gaGFuZGxlIGFnZW50cyBhc3NpZ25lZCB0byBtdWx0aXBsZSBtb2RlbHNcclxuICAgICAgICAgICAgZm9yIChsZXQgZCA9IDA7IGQgPCB0aGlzLm1vZGVsc1tjXS5kYXRhLmxlbmd0aDsgZCsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaWQgPSB0aGlzLm1vZGVsc1tjXS5kYXRhW2RdLmlkO1xyXG4gICAgICAgICAgICAgICAgaWYgKGlkIGluIHRoaXMuX2FnZW50SW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL3RoaXMgYWdlbnQgYmVsb25ncyB0byBtdWx0aXBsZSBtb2RlbHMuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlbHNbY10uZGF0YVtkXS5tb2RlbHMucHVzaCh0aGlzLm1vZGVsc1tjXS5uYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVsc1tjXS5kYXRhW2RdLm1vZGVsSW5kZXhlcy5wdXNoKGMpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFscmVhZHlJbi5wdXNoKGlkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcyBhZ2VudCBiZWxvbmdzIHRvIG9ubHkgb25lIG1vZGVsIHNvIGZhci5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZ2VudEluZGV4W2lkXSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlbHNbY10uZGF0YVtkXS5tb2RlbHMgPSBbdGhpcy5tb2RlbHNbY10ubmFtZV07XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlbHNbY10uZGF0YVtkXS5tb2RlbEluZGV4ZXMgPSBbY107XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9lbGltaW5hdGUgYW55IGR1cGxpY2F0ZSBhZ2VudHMgYnkgaWRcclxuICAgICAgICAgICAgdGhpcy5tb2RlbHNbY10uZGF0YSA9IHRoaXMubW9kZWxzW2NdLmRhdGEuZmlsdGVyKChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYWxyZWFkeUluLmluZGV4T2YoZC5pZCkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvL2NvbmNhdCB0aGUgcmVzdWx0c1xyXG4gICAgICAgICAgICB0aGlzLmFnZW50cyA9IHRoaXMuYWdlbnRzLmNvbmNhdCh0aGlzLm1vZGVsc1tjXS5kYXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKiogVXBkYXRlIGVhY2ggbW9kZWwgY29tcGVuZW50IG9uZSB0aW1lIHN0ZXAgZm9yd2FyZFxyXG4gICAgKiBAcGFyYW0gc3RlcCB0aGUgc3RlcCBzaXplXHJcbiAgICAqL1xyXG4gICAgdXBkYXRlKHN0ZXApIHtcclxuICAgICAgICB2YXIgaW5kZXggPSAwO1xyXG4gICAgICAgIHdoaWxlIChpbmRleCA8IHRoaXMuZXZlbnRzUXVldWUubGVuZ3RoICYmIHRoaXMuZXZlbnRzUXVldWVbaW5kZXhdLmF0IDw9IHRoaXMudGltZSkge1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50c1F1ZXVlW2luZGV4XS50cmlnZ2VyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzUXVldWVbaW5kZXhdLnRyaWdnZXJlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmV2ZW50c1F1ZXVlW2luZGV4XS51bnRpbCA8PSB0aGlzLnRpbWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRzUXVldWUuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5hY3RpdmF0aW9uVHlwZSA9PT0gXCJyYW5kb21cIikge1xyXG4gICAgICAgICAgICBzaHVmZmxlKHRoaXMuYWdlbnRzLCB0aGlzLnJuZyk7XHJcbiAgICAgICAgICAgIHRoaXMuYWdlbnRzLmZvckVhY2goKGFnZW50LCBpKSA9PiB7IHRoaXMuX2FnZW50SW5kZXhbYWdlbnQuaWRdID0gaTsgfSk7IC8vIHJlYXNzaWduIGFnZW50XHJcbiAgICAgICAgICAgIHRoaXMuYWdlbnRzLmZvckVhY2goKGFnZW50LCBpKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBhZ2VudC5tb2RlbEluZGV4ZXMuZm9yRWFjaCgobW9kZWxJbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZWxzW21vZGVsSW5kZXhdLnVwZGF0ZShhZ2VudCwgc3RlcCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGFnZW50LnRpbWUgPSBhZ2VudC50aW1lICsgc3RlcCB8fCAwO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZhdGlvblR5cGUgPT09IFwicGFyYWxsZWxcIikge1xyXG4gICAgICAgICAgICBsZXQgdGVtcEFnZW50cyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5hZ2VudHMpKTtcclxuICAgICAgICAgICAgdGVtcEFnZW50cy5mb3JFYWNoKChhZ2VudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgYWdlbnQubW9kZWxJbmRleGVzLmZvckVhY2goKG1vZGVsSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVsc1ttb2RlbEluZGV4XS51cGRhdGUoYWdlbnQsIHN0ZXApO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLmFnZW50cy5mb3JFYWNoKChhZ2VudCwgaSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgYWdlbnQubW9kZWxJbmRleGVzLmZvckVhY2goKG1vZGVsSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVsc1ttb2RlbEluZGV4XS5hcHBseShhZ2VudCwgdGVtcEFnZW50c1tpXSwgc3RlcCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGFnZW50LnRpbWUgPSBhZ2VudC50aW1lICsgc3RlcCB8fCAwO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKiogRm9ybWF0IGEgdGltZSBvZiBkYXkuIEN1cnJlbnQgdGltZSAlIDEuXHJcbiAgICAqXHJcbiAgICAqL1xyXG4gICAgZm9ybWF0VGltZSgpIHtcclxuICAgICAgICB0aGlzLnRpbWVPZkRheSA9IHRoaXMudGltZSAlIDE7XHJcbiAgICB9XHJcbiAgICAvKiogR2V0cyBhZ2VudCBieSBpZC4gQSB1dGlsaXR5IGZ1bmN0aW9uIHRoYXRcclxuICAgICpcclxuICAgICovXHJcbiAgICBnZXRBZ2VudEJ5SWQoaWQpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hZ2VudHNbdGhpcy5fYWdlbnRJbmRleFtpZF1dO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWVudmlyb25tZW50LmpzLm1hcCIsImV4cG9ydCBjbGFzcyBFcGkge1xyXG4gICAgc3RhdGljIHByZXZhbGVuY2UoY2FzZXMsIHRvdGFsKSB7XHJcbiAgICAgICAgdmFyIHByZXYgPSBjYXNlcyAvIHRvdGFsO1xyXG4gICAgICAgIHJldHVybiBwcmV2O1xyXG4gICAgfVxyXG4gICAgc3RhdGljIHJpc2tEaWZmZXJlbmNlKHRhYmxlKSB7XHJcbiAgICAgICAgdmFyIHJkID0gdGFibGUuYSAvICh0YWJsZS5hICsgdGFibGUuYikgLSB0YWJsZS5jIC8gKHRhYmxlLmMgKyB0YWJsZS5kKTtcclxuICAgICAgICByZXR1cm4gcmQ7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgcmlza1JhdGlvKHRhYmxlKSB7XHJcbiAgICAgICAgdmFyIHJyYXRpbyA9ICh0YWJsZS5hIC8gKHRhYmxlLmEgKyB0YWJsZS5iKSkgLyAodGFibGUuYyAvICh0YWJsZS5jICsgdGFibGUuZCkpO1xyXG4gICAgICAgIHJldHVybiBycmF0aW87XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgb2Rkc1JhdGlvKHRhYmxlKSB7XHJcbiAgICAgICAgdmFyIG9yID0gKHRhYmxlLmEgKiB0YWJsZS5kKSAvICh0YWJsZS5iICogdGFibGUuYyk7XHJcbiAgICAgICAgcmV0dXJuIG9yO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIElQRjJEKHJvd1RvdGFscywgY29sVG90YWxzLCBpdGVyYXRpb25zLCBzZWVkcykge1xyXG4gICAgICAgIHZhciByVCA9IDAsIGNUID0gMCwgc2VlZENlbGxzID0gc2VlZHM7XHJcbiAgICAgICAgcm93VG90YWxzLmZvckVhY2goZnVuY3Rpb24gKHIsIGkpIHtcclxuICAgICAgICAgICAgclQgKz0gcjtcclxuICAgICAgICAgICAgc2VlZENlbGxzW2ldID0gc2VlZENlbGxzW2ldIHx8IFtdO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbFRvdGFscy5mb3JFYWNoKGZ1bmN0aW9uIChjLCBqKSB7XHJcbiAgICAgICAgICAgIGNUICs9IGM7XHJcbiAgICAgICAgICAgIHNlZWRDZWxscy5mb3JFYWNoKGZ1bmN0aW9uIChyb3csIGspIHtcclxuICAgICAgICAgICAgICAgIHNlZWRDZWxsc1trXVtqXSA9IHNlZWRDZWxsc1trXVtqXSB8fCBNYXRoLnJvdW5kKHJvd1RvdGFsc1trXSAvIHJvd1RvdGFscy5sZW5ndGggKyAoY29sVG90YWxzW2pdIC8gY29sVG90YWxzLmxlbmd0aCkgLyAyICogTWF0aC5yYW5kb20oKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChyVCA9PT0gY1QpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaXRlciA9IDA7IGl0ZXIgPCBpdGVyYXRpb25zOyBpdGVyKyspIHtcclxuICAgICAgICAgICAgICAgIHNlZWRDZWxscy5mb3JFYWNoKGZ1bmN0aW9uIChyb3csIGlpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRSb3dUb3RhbCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgcm93LmZvckVhY2goZnVuY3Rpb24gKGNlbGwsIGopIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFJvd1RvdGFsICs9IGNlbGw7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcm93LmZvckVhY2goZnVuY3Rpb24gKGNlbGwsIGpqKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZWRDZWxsc1tpaV1bampdID0gY2VsbCAvIGN1cnJlbnRSb3dUb3RhbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VlZENlbGxzW2lpXVtqal0gKj0gcm93VG90YWxzW2lpXTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgY29sVG90YWxzLmxlbmd0aDsgY29sKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudENvbFRvdGFsID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBzZWVkQ2VsbHMuZm9yRWFjaChmdW5jdGlvbiAociwgaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50Q29sVG90YWwgKz0gcltjb2xdO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlZWRDZWxscy5mb3JFYWNoKGZ1bmN0aW9uIChyb3csIGtrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZWRDZWxsc1tra11bY29sXSA9IHJvd1tjb2xdIC8gY3VycmVudENvbFRvdGFsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWVkQ2VsbHNba2tdW2NvbF0gKj0gY29sVG90YWxzW2NvbF07XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHNlZWRDZWxscztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZXBpLmpzLm1hcCIsIi8qKiBFdmVudHMgY2xhc3MgaW5jbHVkZXMgbWV0aG9kcyBmb3Igb3JnYW5pemluZyBldmVudHMuXHJcbipcclxuKi9cclxuZXhwb3J0IGNsYXNzIEV2ZW50cyB7XHJcbiAgICBjb25zdHJ1Y3RvcihldmVudHMgPSBbXSkge1xyXG4gICAgICAgIHRoaXMucXVldWUgPSBbXTtcclxuICAgICAgICB0aGlzLnNjaGVkdWxlKGV2ZW50cyk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICogc2NoZWR1bGUgYW4gZXZlbnQgd2l0aCB0aGUgc2FtZSB0cmlnZ2VyIG11bHRpcGxlIHRpbWVzLlxyXG4gICAgKiBAcGFyYW0gcWV2ZW50IGlzIHRoZSBldmVudCB0byBiZSBzY2hlZHVsZWQuIFRoZSBhdCBwYXJhbWV0ZXIgc2hvdWxkIGNvbnRhaW4gdGhlIHRpbWUgYXQgZmlyc3QgaW5zdGFuY2UuXHJcbiAgICAqIEBwYXJhbSBldmVyeSBpbnRlcnZhbCBmb3IgZWFjaCBvY2N1cm5jZVxyXG4gICAgKiBAcGFyYW0gZW5kIHVudGlsXHJcbiAgICAqL1xyXG4gICAgc2NoZWR1bGVSZWN1cnJpbmcocWV2ZW50LCBldmVyeSwgZW5kKSB7XHJcbiAgICAgICAgdmFyIHJlY3VyID0gW107XHJcbiAgICAgICAgdmFyIGR1cmF0aW9uID0gZW5kIC0gcWV2ZW50LmF0O1xyXG4gICAgICAgIHZhciBvY2N1cmVuY2VzID0gTWF0aC5mbG9vcihkdXJhdGlvbiAvIGV2ZXJ5KTtcclxuICAgICAgICBpZiAoIXFldmVudC51bnRpbCkge1xyXG4gICAgICAgICAgICBxZXZlbnQudW50aWwgPSBxZXZlbnQuYXQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IG9jY3VyZW5jZXM7IGkrKykge1xyXG4gICAgICAgICAgICByZWN1ci5wdXNoKHsgbmFtZTogcWV2ZW50Lm5hbWUgKyBpLCBhdDogcWV2ZW50LmF0ICsgKGkgKiBldmVyeSksIHVudGlsOiBxZXZlbnQudW50aWwgKyAoaSAqIGV2ZXJ5KSwgdHJpZ2dlcjogcWV2ZW50LnRyaWdnZXIsIHRyaWdnZXJlZDogZmFsc2UgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2NoZWR1bGUocmVjdXIpO1xyXG4gICAgfVxyXG4gICAgLypcclxuICAgICogc2NoZWR1bGUgYSBvbmUgdGltZSBldmVudHMuIHRoaXMgYXJyYW5nZXMgdGhlIGV2ZW50IHF1ZXVlIGluIGNocm9ub2xvZ2ljYWwgb3JkZXIuXHJcbiAgICAqIEBwYXJhbSBxZXZlbnRzIGFuIGFycmF5IG9mIGV2ZW50cyB0byBiZSBzY2hlZHVsZXMuXHJcbiAgICAqL1xyXG4gICAgc2NoZWR1bGUocWV2ZW50cykge1xyXG4gICAgICAgIHFldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICBkLnVudGlsID0gZC51bnRpbCB8fCBkLmF0O1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMucXVldWUgPSB0aGlzLnF1ZXVlLmNvbmNhdChxZXZlbnRzKTtcclxuICAgICAgICB0aGlzLnF1ZXVlID0gdGhpcy5vcmdhbml6ZSh0aGlzLnF1ZXVlLCAwLCB0aGlzLnF1ZXVlLmxlbmd0aCk7XHJcbiAgICB9XHJcbiAgICBwYXJ0aXRpb24oYXJyYXksIGxlZnQsIHJpZ2h0KSB7XHJcbiAgICAgICAgdmFyIGNtcCA9IGFycmF5W3JpZ2h0IC0gMV0uYXQsIG1pbkVuZCA9IGxlZnQsIG1heEVuZDtcclxuICAgICAgICBmb3IgKG1heEVuZCA9IGxlZnQ7IG1heEVuZCA8IHJpZ2h0IC0gMTsgbWF4RW5kICs9IDEpIHtcclxuICAgICAgICAgICAgaWYgKGFycmF5W21heEVuZF0uYXQgPD0gY21wKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN3YXAoYXJyYXksIG1heEVuZCwgbWluRW5kKTtcclxuICAgICAgICAgICAgICAgIG1pbkVuZCArPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc3dhcChhcnJheSwgbWluRW5kLCByaWdodCAtIDEpO1xyXG4gICAgICAgIHJldHVybiBtaW5FbmQ7XHJcbiAgICB9XHJcbiAgICBzd2FwKGFycmF5LCBpLCBqKSB7XHJcbiAgICAgICAgdmFyIHRlbXAgPSBhcnJheVtpXTtcclxuICAgICAgICBhcnJheVtpXSA9IGFycmF5W2pdO1xyXG4gICAgICAgIGFycmF5W2pdID0gdGVtcDtcclxuICAgICAgICByZXR1cm4gYXJyYXk7XHJcbiAgICB9XHJcbiAgICBvcmdhbml6ZShldmVudHMsIGxlZnQsIHJpZ2h0KSB7XHJcbiAgICAgICAgaWYgKGxlZnQgPCByaWdodCkge1xyXG4gICAgICAgICAgICB2YXIgcCA9IHRoaXMucGFydGl0aW9uKGV2ZW50cywgbGVmdCwgcmlnaHQpO1xyXG4gICAgICAgICAgICB0aGlzLm9yZ2FuaXplKGV2ZW50cywgbGVmdCwgcCk7XHJcbiAgICAgICAgICAgIHRoaXMub3JnYW5pemUoZXZlbnRzLCBwICsgMSwgcmlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZXZlbnRzO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWV2ZW50cy5qcy5tYXAiLCJpbXBvcnQgeyBRQ29tcG9uZW50IH0gZnJvbSAnLi9RQ29tcG9uZW50JztcclxuZXhwb3J0IGNsYXNzIFN0YXRlTWFjaGluZSBleHRlbmRzIFFDb21wb25lbnQge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgc3RhdGVzLCB0cmFuc2l0aW9ucywgY29uZGl0aW9ucywgZGF0YSkge1xyXG4gICAgICAgIHN1cGVyKG5hbWUpO1xyXG4gICAgICAgIHRoaXMuc3RhdGVzID0gc3RhdGVzO1xyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbnMgPSB0aGlzLmNoZWNrVHJhbnNpdGlvbnModHJhbnNpdGlvbnMpO1xyXG4gICAgICAgIHRoaXMuY29uZGl0aW9ucyA9IGNvbmRpdGlvbnM7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgIH1cclxuICAgIHVwZGF0ZShhZ2VudCwgc3RlcCkge1xyXG4gICAgICAgIGZvciAodmFyIHMgaW4gYWdlbnQuc3RhdGVzKSB7XHJcbiAgICAgICAgICAgIGxldCBzdGF0ZSA9IGFnZW50LnN0YXRlc1tzXTtcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZXNbc3RhdGVdKGFnZW50LCBzdGVwKTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnRyYW5zaXRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMudHJhbnNpdGlvbnNbaV0uZnJvbS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0cmFucyA9IHRoaXMudHJhbnNpdGlvbnNbaV0uZnJvbVtqXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnMgPT09IHN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB2YWx1ZSwgcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNvbmQgPSB0aGlzLmNvbmRpdGlvbnNbdGhpcy50cmFuc2l0aW9uc1tpXS5uYW1lXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAoY29uZC52YWx1ZSkgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gY29uZC52YWx1ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBjb25kLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHIgPSBjb25kLmNoZWNrKGFnZW50W2NvbmQua2V5XSwgdmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAociA9PT0gU3RhdGVNYWNoaW5lLlNVQ0NFU1MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFnZW50LnN0YXRlc1tzXSA9IHRoaXMudHJhbnNpdGlvbnNbaV0udG87XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZ2VudFt0aGlzLnRyYW5zaXRpb25zW2ldLnRvXSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZ2VudFt0aGlzLnRyYW5zaXRpb25zW2ldLmZyb21bal1dID0gZmFsc2U7IC8vZm9yIGVhc2llciByZXBvcnRpbmdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGNoZWNrVHJhbnNpdGlvbnModHJhbnNpdGlvbnMpIHtcclxuICAgICAgICBmb3IgKHZhciB0ID0gMDsgdCA8IHRyYW5zaXRpb25zLmxlbmd0aDsgdCsrKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdHJhbnNpdGlvbnNbdF0uZnJvbSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIHRyYW5zaXRpb25zW3RdLmZyb20gPSBbdHJhbnNpdGlvbnNbdF0uZnJvbV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJhbnNpdGlvbnM7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c3RhdGVNYWNoaW5lLmpzLm1hcCIsImNsYXNzIFJhbmRvbSB7XHJcbiAgICBjb25zdHJ1Y3RvcihzZWVkKSB7XHJcbiAgICAgICAgdGhpcy51bmlmb3JtID0gdGhpcy5yYW5kUmFuZ2U7XHJcbiAgICAgICAgdGhpcy5zZWVkID0gc2VlZDtcclxuICAgICAgICB0aGlzLmNhbGxlZCA9IDA7XHJcbiAgICB9XHJcbiAgICByYW5kUmFuZ2UobWluLCBtYXgpIHtcclxuICAgICAgICByZXR1cm4gKG1heCAtIG1pbikgKiB0aGlzLnJhbmRvbSgpICsgbWluO1xyXG4gICAgfVxyXG4gICAgbWF0KHJvd3MsIGNvbHMsIGRpc3QgPSAncmFuZG9tJykge1xyXG4gICAgICAgIGxldCByYW5kcyA9IFtdO1xyXG4gICAgICAgIGlmICh0eXBlb2Ygcm93cyA9PSAnbnVtYmVyJyAmJiB0eXBlb2YgY29scyA9PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCByID0gMDsgciA8IHJvd3M7IHIrKykge1xyXG4gICAgICAgICAgICAgICAgcmFuZHNbcl0gPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgY29sczsgYysrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmFuZHNbcl1bY10gPSB0aGlzW2Rpc3RdKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJhbmRzO1xyXG4gICAgfVxyXG4gICAgYXJyYXkobiwgZGlzdCA9ICdyYW5kb20nKSB7XHJcbiAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgIGxldCByYW5kcyA9IFtdO1xyXG4gICAgICAgIHdoaWxlIChpIDwgbikge1xyXG4gICAgICAgICAgICByYW5kc1tpXSA9IHRoaXNbZGlzdF0oKTtcclxuICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmFuZHM7XHJcbiAgICB9XHJcbiAgICBwaWNrKGFycmF5LCBwcm9iYWJpbGl0aWVzKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBwcm9iYWJpbGl0aWVzID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICByZXR1cm4gYXJyYXlbTWF0aC5mbG9vcih0aGlzLnJhbmRvbSgpICogYXJyYXkubGVuZ3RoKV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoalN0YXQuc3VtKHByb2JhYmlsaXRpZXMpID09IDEuMCkge1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGFycmF5Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgaWR4ID0gTWF0aC5mbG9vcih0aGlzLnJhbmRvbSgpICogYXJyYXkubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5yYW5kb20oKSA8IHByb2JhYmlsaXRpZXNbaWR4XSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXJyYXlbaWR4XTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy9hcnJheS5zcGxpY2UoaWR4LCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAvL3Byb2JhYmlsaXRpZXMuc3BsaWNlKGlkeCwgMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignc3VtIG9mIHByb2JhYmlsaXRpZXMgYXJyYXkgZGlkIG5vdCBlcXVhbCAxJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICpCZWxvdyBpcyBhZGFwdGVkIGZyb20galN0YXQ6aHR0cHM6Ly9naXRodWIuY29tL2pzdGF0L2pzdGF0L2Jsb2IvbWFzdGVyL3NyYy9zcGVjaWFsLmpzXHJcbiAgICAqKi9cclxuICAgIHJhbmRuKCkge1xyXG4gICAgICAgIHZhciB1LCB2LCB4LCB5LCBxO1xyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgdSA9IHRoaXMucmFuZG9tKCk7XHJcbiAgICAgICAgICAgIHYgPSAxLjcxNTYgKiAodGhpcy5yYW5kb20oKSAtIDAuNSk7XHJcbiAgICAgICAgICAgIHggPSB1IC0gMC40NDk4NzE7XHJcbiAgICAgICAgICAgIHkgPSBNYXRoLmFicyh2KSArIDAuMzg2NTk1O1xyXG4gICAgICAgICAgICBxID0geCAqIHggKyB5ICogKDAuMTk2MDAgKiB5IC0gMC4yNTQ3MiAqIHgpO1xyXG4gICAgICAgIH0gd2hpbGUgKHEgPiAwLjI3NTk3ICYmIChxID4gMC4yNzg0NiB8fCB2ICogdiA+IC00ICogTWF0aC5sb2codSkgKiB1ICogdSkpO1xyXG4gICAgICAgIHJldHVybiB2IC8gdTtcclxuICAgIH1cclxuICAgIHJhbmRnKHNoYXBlKSB7XHJcbiAgICAgICAgdmFyIG9hbHBoID0gc2hhcGU7XHJcbiAgICAgICAgdmFyIGExLCBhMiwgdSwgdiwgeDtcclxuICAgICAgICBpZiAoIXNoYXBlKVxyXG4gICAgICAgICAgICBzaGFwZSA9IDE7XHJcbiAgICAgICAgaWYgKHNoYXBlIDwgMSlcclxuICAgICAgICAgICAgc2hhcGUgKz0gMTtcclxuICAgICAgICBhMSA9IHNoYXBlIC0gMSAvIDM7XHJcbiAgICAgICAgYTIgPSAxIC8gTWF0aC5zcXJ0KDkgKiBhMSk7XHJcbiAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICB4ID0gdGhpcy5yYW5kbigpO1xyXG4gICAgICAgICAgICAgICAgdiA9IDEgKyBhMiAqIHg7XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKHYgPD0gMCk7XHJcbiAgICAgICAgICAgIHYgPSB2ICogdiAqIHY7XHJcbiAgICAgICAgICAgIHUgPSB0aGlzLnJhbmRvbSgpO1xyXG4gICAgICAgIH0gd2hpbGUgKHUgPiAxIC0gMC4zMzEgKiBNYXRoLnBvdyh4LCA0KSAmJlxyXG4gICAgICAgICAgICBNYXRoLmxvZyh1KSA+IDAuNSAqIHggKiB4ICsgYTEgKiAoMSAtIHYgKyBNYXRoLmxvZyh2KSkpO1xyXG4gICAgICAgIC8vIGFscGhhID4gMVxyXG4gICAgICAgIGlmIChzaGFwZSA9PSBvYWxwaClcclxuICAgICAgICAgICAgcmV0dXJuIGExICogdjtcclxuICAgICAgICAvLyBhbHBoYSA8IDFcclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIHUgPSB0aGlzLnJhbmRvbSgpO1xyXG4gICAgICAgIH0gd2hpbGUgKHUgPT09IDApO1xyXG4gICAgICAgIHJldHVybiBNYXRoLnBvdyh1LCAxIC8gb2FscGgpICogYTEgKiB2O1xyXG4gICAgfVxyXG4gICAgYmV0YShhbHBoYSwgYmV0YSkge1xyXG4gICAgICAgIHZhciB1ID0gdGhpcy5yYW5kZyhhbHBoYSk7XHJcbiAgICAgICAgcmV0dXJuIHUgLyAodSArIHRoaXMucmFuZGcoYmV0YSkpO1xyXG4gICAgfVxyXG4gICAgZ2FtbWEoc2hhcGUsIHNjYWxlKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmFuZGcoc2hhcGUpICogc2NhbGU7XHJcbiAgICB9XHJcbiAgICBsb2dOb3JtYWwobXUsIHNpZ21hKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguZXhwKHRoaXMucmFuZG4oKSAqIHNpZ21hICsgbXUpO1xyXG4gICAgfVxyXG4gICAgbm9ybWFsKG1lYW4gPSAwLCBzdGQgPSAxKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmFuZG4oKSAqIHN0ZCArIG1lYW47XHJcbiAgICB9XHJcbiAgICBwb2lzc29uKGwpIHtcclxuICAgICAgICB2YXIgcCA9IDEsIGsgPSAwLCBMID0gTWF0aC5leHAoLWwpO1xyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgaysrO1xyXG4gICAgICAgICAgICBwICo9IHRoaXMucmFuZG9tKCk7XHJcbiAgICAgICAgfSB3aGlsZSAocCA+IEwpO1xyXG4gICAgICAgIHJldHVybiBrIC0gMTtcclxuICAgIH1cclxuICAgIHQoZG9mKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmFuZG4oKSAqIE1hdGguc3FydChkb2YgLyAoMiAqIHRoaXMucmFuZGcoZG9mIC8gMikpKTtcclxuICAgIH1cclxuICAgIHdlaWJ1bGwoc2NhbGUsIHNoYXBlKSB7XHJcbiAgICAgICAgcmV0dXJuIHNjYWxlICogTWF0aC5wb3coLU1hdGgubG9nKHRoaXMucmFuZG9tKCkpLCAxIC8gc2hhcGUpO1xyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4qIEJvYiBKZW5raW5zJyBzbWFsbCBub25jcnlwdG9ncmFwaGljIFBSTkcgKHBzZXVkb3JhbmRvbSBudW1iZXIgZ2VuZXJhdG9yKSBwb3J0ZWQgdG8gSmF2YVNjcmlwdFxyXG4qIGFkYXB0ZWQgZnJvbTpcclxuKiBodHRwczovL2dpdGh1Yi5jb20vZ3JhdWUvYnVydGxlcHJuZ1xyXG4qIHdoaWNoIGlzIGZyb20gaHR0cDovL3d3dy5idXJ0bGVidXJ0bGUubmV0L2JvYi9yYW5kL3NtYWxscHJuZy5odG1sXHJcbiovXHJcbmV4cG9ydCBjbGFzcyBSTkdCdXJ0bGUgZXh0ZW5kcyBSYW5kb20ge1xyXG4gICAgY29uc3RydWN0b3Ioc2VlZCkge1xyXG4gICAgICAgIHN1cGVyKHNlZWQpO1xyXG4gICAgICAgIHRoaXMuc2VlZCA+Pj49IDA7XHJcbiAgICAgICAgdGhpcy5jdHggPSBuZXcgQXJyYXkoNCk7XHJcbiAgICAgICAgdGhpcy5jdHhbMF0gPSAweGYxZWE1ZWVkO1xyXG4gICAgICAgIHRoaXMuY3R4WzFdID0gdGhpcy5jdHhbMl0gPSB0aGlzLmN0eFszXSA9IHRoaXMuc2VlZDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDIwOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5yYW5kb20oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByb3QoeCwgaykge1xyXG4gICAgICAgIHJldHVybiAoeCA8PCBrKSB8ICh4ID4+ICgzMiAtIGspKTtcclxuICAgIH1cclxuICAgIHJhbmRvbSgpIHtcclxuICAgICAgICB2YXIgY3R4ID0gdGhpcy5jdHg7XHJcbiAgICAgICAgdmFyIGUgPSAoY3R4WzBdIC0gdGhpcy5yb3QoY3R4WzFdLCAyNykpID4+PiAwO1xyXG4gICAgICAgIGN0eFswXSA9IChjdHhbMV0gXiB0aGlzLnJvdChjdHhbMl0sIDE3KSkgPj4+IDA7XHJcbiAgICAgICAgY3R4WzFdID0gKGN0eFsyXSArIGN0eFszXSkgPj4+IDA7XHJcbiAgICAgICAgY3R4WzJdID0gKGN0eFszXSArIGUpID4+PiAwO1xyXG4gICAgICAgIGN0eFszXSA9IChlICsgY3R4WzBdKSA+Pj4gMDtcclxuICAgICAgICB0aGlzLmNhbGxlZCArPSAxO1xyXG4gICAgICAgIHJldHVybiBjdHhbM10gLyA0Mjk0OTY3Mjk2LjA7XHJcbiAgICB9XHJcbn1cclxuLypcclxuKiB4b3JzaGlmdDcqLCBieSBGcmFuw6dvaXMgUGFubmV0b24gYW5kIFBpZXJyZSBMJ2VjdXllcjogMzItYml0IHhvci1zaGlmdCByYW5kb20gbnVtYmVyIGdlbmVyYXRvclxyXG4qIGFkZHMgcm9idXN0bmVzcyBieSBhbGxvd2luZyBtb3JlIHNoaWZ0cyB0aGFuIE1hcnNhZ2xpYSdzIG9yaWdpbmFsIHRocmVlLiBJdCBpcyBhIDctc2hpZnQgZ2VuZXJhdG9yIHdpdGggMjU2IGJpdHMsIHRoYXQgcGFzc2VzIEJpZ0NydXNoIHdpdGggbm8gc3lzdG1hdGljIGZhaWx1cmVzLlxyXG4qIEFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vZGF2aWRiYXUveHNyYW5kXHJcbiovXHJcbmV4cG9ydCBjbGFzcyBSTkd4b3JzaGlmdDcgZXh0ZW5kcyBSYW5kb20ge1xyXG4gICAgY29uc3RydWN0b3Ioc2VlZCkge1xyXG4gICAgICAgIGxldCBqLCB3LCBYID0gW107XHJcbiAgICAgICAgc3VwZXIoc2VlZCk7XHJcbiAgICAgICAgLy8gU2VlZCBzdGF0ZSBhcnJheSB1c2luZyBhIDMyLWJpdCBpbnRlZ2VyLlxyXG4gICAgICAgIHcgPSBYWzBdID0gdGhpcy5zZWVkO1xyXG4gICAgICAgIC8vIEVuZm9yY2UgYW4gYXJyYXkgbGVuZ3RoIG9mIDgsIG5vdCBhbGwgemVyb2VzLlxyXG4gICAgICAgIHdoaWxlIChYLmxlbmd0aCA8IDgpIHtcclxuICAgICAgICAgICAgWC5wdXNoKDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGogPSAwOyBqIDwgOCAmJiBYW2pdID09PSAwOyArK2opIHtcclxuICAgICAgICAgICAgaWYgKGogPT0gOCkge1xyXG4gICAgICAgICAgICAgICAgdyA9IFhbN10gPSAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHcgPSBYW2pdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMueCA9IFg7XHJcbiAgICAgICAgdGhpcy5pID0gMDtcclxuICAgICAgICAvLyBEaXNjYXJkIGFuIGluaXRpYWwgMjU2IHZhbHVlcy5cclxuICAgICAgICBmb3IgKGogPSAyNTY7IGogPiAwOyAtLWopIHtcclxuICAgICAgICAgICAgdGhpcy5yYW5kb20oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByYW5kb20oKSB7XHJcbiAgICAgICAgbGV0IFggPSB0aGlzLngsIGkgPSB0aGlzLmksIHQsIHYsIHcsIHJlcztcclxuICAgICAgICB0ID0gWFtpXTtcclxuICAgICAgICB0IF49ICh0ID4+PiA3KTtcclxuICAgICAgICB2ID0gdCBeICh0IDw8IDI0KTtcclxuICAgICAgICB0ID0gWFsoaSArIDEpICYgN107XHJcbiAgICAgICAgdiBePSB0IF4gKHQgPj4+IDEwKTtcclxuICAgICAgICB0ID0gWFsoaSArIDMpICYgN107XHJcbiAgICAgICAgdiBePSB0IF4gKHQgPj4+IDMpO1xyXG4gICAgICAgIHQgPSBYWyhpICsgNCkgJiA3XTtcclxuICAgICAgICB2IF49IHQgXiAodCA8PCA3KTtcclxuICAgICAgICB0ID0gWFsoaSArIDcpICYgN107XHJcbiAgICAgICAgdCA9IHQgXiAodCA8PCAxMyk7XHJcbiAgICAgICAgdiBePSB0IF4gKHQgPDwgOSk7XHJcbiAgICAgICAgWFtpXSA9IHY7XHJcbiAgICAgICAgdGhpcy5pID0gKGkgKyAxKSAmIDc7XHJcbiAgICAgICAgcmVzID0gKHYgPj4+IDApIC8gKCgxIDw8IDMwKSAqIDQpO1xyXG4gICAgICAgIHRoaXMuY2FsbGVkICs9IDE7XHJcbiAgICAgICAgcmV0dXJuIHJlcztcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1yYW5kb20uanMubWFwIiwiaW1wb3J0IHsgZ2VuZXJhdGVVVUlELCBnZW5lcmF0ZVBvcCwgYWRkUmVzb3VyY2VzLCBhc3NpZ25QYXJhbSwgTWF0Y2ggfSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IHsgUGF0Y2gsIENvbXBhcnRtZW50TW9kZWwgfSBmcm9tICcuL2NvbXBhcnRtZW50JztcclxuaW1wb3J0IHsgRW52aXJvbm1lbnQgfSBmcm9tICcuL2Vudmlyb25tZW50JztcclxuaW1wb3J0IHsgU3RhdGVNYWNoaW5lIH0gZnJvbSAnLi9zdGF0ZU1hY2hpbmUnO1xyXG5pbXBvcnQgeyBSTkdCdXJ0bGUsIFJOR3hvcnNoaWZ0NyB9IGZyb20gJy4vcmFuZG9tJztcclxuLyoqXHJcbipCYXRjaCBydW4gZW52aXJvbm1lbnRzXHJcbiovXHJcbmV4cG9ydCBjbGFzcyBFeHBlcmltZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKGVudmlyb25tZW50LCBzZXR1cCwgdGFyZ2V0KSB7XHJcbiAgICAgICAgdGhpcy50eXBlID0gJ3N3ZWVwJztcclxuICAgICAgICB0aGlzLmVudmlyb25tZW50ID0gZW52aXJvbm1lbnQ7XHJcbiAgICAgICAgdGhpcy5zZXR1cCA9IHNldHVwO1xyXG4gICAgICAgIHRoaXMucm5nID0gc2V0dXAuZXhwZXJpbWVudC5ybmcgPT09ICd4b3JzaGlmdDcnID8gbmV3IFJOR3hvcnNoaWZ0NyhzZXR1cC5leHBlcmltZW50LnNlZWQpIDogbmV3IFJOR0J1cnRsZShzZXR1cC5leHBlcmltZW50LnNlZWQpO1xyXG4gICAgICAgIHRoaXMuZXhwZXJpbWVudExvZyA9IFtdO1xyXG4gICAgICAgIHRoaXMuY3VycmVudENGRyA9IHt9O1xyXG4gICAgICAgIHRoaXMuZ2VuTG9nID0gW107XHJcbiAgICB9XHJcbiAgICBzdGFydChydW5zLCBzdGVwLCB1bnRpbCwgcHJlcENCKSB7XHJcbiAgICAgICAgdmFyIHIgPSAwO1xyXG4gICAgICAgIHJ1bnMgPSBydW5zICogdGhpcy5zZXR1cC5leHBlcmltZW50LnNpemU7XHJcbiAgICAgICAgd2hpbGUgKHIgPCBydW5zKSB7XHJcbiAgICAgICAgICAgIHRoaXMucHJlcChyLCB0aGlzLnNldHVwLCBwcmVwQ0IpO1xyXG4gICAgICAgICAgICB0aGlzLmVudmlyb25tZW50LnRpbWUgPSAwOyAvL1xyXG4gICAgICAgICAgICB0aGlzLmVudmlyb25tZW50LnJ1bihzdGVwLCB1bnRpbCwgMCk7XHJcbiAgICAgICAgICAgIHRoaXMuZXhwZXJpbWVudExvZ1tyXSA9IHRoaXMucmVwb3J0KHIsIHRoaXMuc2V0dXApO1xyXG4gICAgICAgICAgICB0aGlzLmFmdGVyKHIsIHRoaXMuc2V0dXApO1xyXG4gICAgICAgICAgICBpZiAociAlIHRoaXMuc2V0dXAuZXhwZXJpbWVudC5zaXplID09PSAwICYmIHIgIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW5kR2VuKHIsIHRoaXMuc2V0dXApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHIrKztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcmVwKHIsIGNmZywgY2IpIHtcclxuICAgICAgICB0aGlzLnBhcnNlQ0ZHKGNmZyk7XHJcbiAgICAgICAgaWYgKGNiICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgY2IoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbmRHZW4ocnVuLCBjZmcpIHtcclxuICAgICAgICBsZXQgcHJldlN0YXJ0ID0gTWF0aC5taW4oMCwgcnVuIC0gY2ZnLmV4cGVyaW1lbnQuc2l6ZSk7XHJcbiAgICAgICAgdGhpcy5nZW5Mb2cucHVzaCh0aGlzLmdlbkF2Zyh0aGlzLmV4cGVyaW1lbnRMb2cuc2xpY2UocHJldlN0YXJ0LCBydW4pLCBjZmcpKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZUFzc2lnbm1lbnQoY2ZnLCBjZmcuZXhwZXJpbWVudC5wYXJhbXMpO1xyXG4gICAgfVxyXG4gICAgcGFyc2VDRkcoY2ZnKSB7XHJcbiAgICAgICAgbGV0IGdyb3VwcyA9IHt9O1xyXG4gICAgICAgIGxldCBjdXJyZW50QWdlbnRJZCA9IDA7XHJcbiAgICAgICAgY2ZnID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjZmcpKTtcclxuICAgICAgICBjZmcuYm91bmRhcmllcyA9IHt9O1xyXG4gICAgICAgIHRoaXMuZW52aXJvbm1lbnQgPSBuZXcgRW52aXJvbm1lbnQoKTtcclxuICAgICAgICB0aGlzLmVudmlyb25tZW50LnJuZyA9IHRoaXMucm5nO1xyXG4gICAgICAgIGlmICgnYWdlbnRzJyBpbiBjZmcpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgZ3JOYW1lIGluIGNmZy5hZ2VudHMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBncm91cCA9IGNmZy5hZ2VudHNbZ3JOYW1lXTtcclxuICAgICAgICAgICAgICAgIGdyb3VwLnBhcmFtcy5ncm91cE5hbWUgPSBnck5hbWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVudmlyb25tZW50LmJvdW5kYXJpZXNbZ3JOYW1lXSA9IGdyb3VwLmJvdW5kYXJpZXM7XHJcbiAgICAgICAgICAgICAgICBncm91cHNbZ3JOYW1lXSA9IGdlbmVyYXRlUG9wKGdyb3VwLmNvdW50LCBncm91cC5wYXJhbXMsIGNmZy5lbnZpcm9ubWVudC5zcGF0aWFsVHlwZSwgZ3JvdXAuYm91bmRhcmllcywgY3VycmVudEFnZW50SWQsIHRoaXMucm5nKTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRBZ2VudElkID0gZ3JvdXBzW2dyTmFtZV1bZ3JvdXBzW2dyTmFtZV0ubGVuZ3RoIC0gMV0uaWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCdwYXRjaGVzJyBpbiBjZmcpIHtcclxuICAgICAgICAgICAgY2ZnLnBhdGNoZXMuZm9yRWFjaCgocGF0Y2gpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW52aXJvbm1lbnQuYm91bmRhcmllc1twYXRjaC5uYW1lXSA9IHBhdGNoLmJvdW5kYXJpZXM7XHJcbiAgICAgICAgICAgICAgICBwYXRjaC5wYXJhbXMgPSB7IGdyb3VwTmFtZTogcGF0Y2gubmFtZSB9O1xyXG4gICAgICAgICAgICAgICAgZ3JvdXBzW3BhdGNoLm5hbWVdID0gZ2VuZXJhdGVQb3AoMSwgcGF0Y2gucGFyYW1zLCBjZmcuZW52aXJvbm1lbnQuc3BhdGlhbFR5cGUsIHBhdGNoLmJvdW5kYXJpZXMsIGN1cnJlbnRBZ2VudElkLCB0aGlzLnJuZyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoJ3Jlc291cmNlcycgaW4gY2ZnKSB7XHJcbiAgICAgICAgICAgIGxldCByZXNvdXJjZXMgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgcnNjIGluIGNmZy5yZXNvdXJjZXMpIHtcclxuICAgICAgICAgICAgICAgIHJlc291cmNlcyA9IGFkZFJlc291cmNlcyhyZXNvdXJjZXMsIGNmZy5yZXNvdXJjZXNbcnNjXSwgY2ZnLnJlc291cmNlc1tyc2NdLnF1YW50aXR5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmVudmlyb25tZW50LnJlc291cmNlcyA9IHJlc291cmNlcztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCdlbnRpdGllcycgaW4gY2ZnKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGVudGl0eSBpbiBjZmcuZW50aXRpZXMpIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IG1ldGhvZCBpbiBjZmcuZW50aXRpZXNbZW50aXR5XS5tZXRob2RzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgcCBpbiBjZmcuZW50aXRpZXNbZW50aXR5XS5wYXJhbXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9jb3B5IHRvIG91dHNpZGUgZm9yIGV4dGVybmFsIHJlZmVyZW5jZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2ZnLmVudGl0aWVzW2VudGl0eV1bcF0gPSBjZmcuZW50aXRpZXNbZW50aXR5XS5wYXJhbXNbcF0uYXNzaWduO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjZmcuZW50aXRpZXNbZW50aXR5XS5tZXRob2RzW21ldGhvZF0gPSBRQWN0aW9uc1ttZXRob2RdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC5lbnRpdGllc1tlbnRpdHldID0gY2ZnLmVudGl0aWVzW2VudGl0eV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY2ZnLmNvbXBvbmVudHMuZm9yRWFjaCgoY21wKSA9PiB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoY21wLnR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3N0YXRlLW1hY2hpbmUnOlxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHN0YXRlIGluIGNtcC5zdGF0ZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY21wLnN0YXRlc1tzdGF0ZV0gPSBRQWN0aW9uc1tjbXAuc3RhdGVzW3N0YXRlXV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGNvbmQgaW4gY21wLmNvbmRpdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY21wLmNvbmRpdGlvbnNbY29uZF0uY2hlY2sgPSBNYXRjaFtjbXAuY29uZGl0aW9uc1tjb25kXS5jaGVja107XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzbSA9IG5ldyBTdGF0ZU1hY2hpbmUoY21wLm5hbWUsIGNtcC5zdGF0ZXMsIGNtcC50cmFuc2l0aW9ucywgY21wLmNvbmRpdGlvbnMsIGdyb3Vwc1tjbXAuYWdlbnRzXVswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC5hZGQoc20pO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnY29tcGFydG1lbnRhbCc6XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGNoZXMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBjZmcucGF0Y2hlcy5mb3JFYWNoKChwYXRjaCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY21wLnBhdGNoZXMuaW5kZXhPZihwYXRjaC5uYW1lKSAhPSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgY29tcGFydG1lbnQgaW4gY21wLmNvbXBhcnRtZW50cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNtcC5jb21wYXJ0bWVudHNbY29tcGFydG1lbnRdLm9wZXJhdGlvbiA9IFFBY3Rpb25zW2NtcC5jb21wYXJ0bWVudHNbY29tcGFydG1lbnRdLm9wZXJhdGlvbl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcCA9IG5ldyBQYXRjaChwYXRjaC5uYW1lLCBjbXAuY29tcGFydG1lbnRzLCBwYXRjaC5wb3B1bGF0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm91cHNbcGF0Y2gubmFtZV1bMF1bMF0gPSBPYmplY3QuYXNzaWduKGdyb3Vwc1twYXRjaC5uYW1lXVswXVswXSwgcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRjaGVzLnB1c2goZ3JvdXBzW3BhdGNoLm5hbWVdWzBdWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjTW9kZWwgPSBuZXcgQ29tcGFydG1lbnRNb2RlbChjbXAubmFtZSwgY21wLmNvbXBhcnRtZW50cywgcGF0Y2hlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC5hZGQoY01vZGVsKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2V2ZXJ5LXN0ZXAnOlxyXG4gICAgICAgICAgICAgICAgICAgIGNtcC5hY3Rpb24gPSBRQWN0aW9uc1tjbXAuYWN0aW9uXTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVudmlyb25tZW50LmFkZCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBnZW5lcmF0ZVVVSUQoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY21wLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZTogY21wLmFjdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZ3JvdXBzW2NtcC5hZ2VudHNdWzBdXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICByZXBvcnQociwgY2ZnKSB7XHJcbiAgICAgICAgbGV0IHN1bXMgPSB7fTtcclxuICAgICAgICBsZXQgbWVhbnMgPSB7fTtcclxuICAgICAgICBsZXQgZnJlcXMgPSB7fTtcclxuICAgICAgICBsZXQgbW9kZWwgPSB7fSwgc2VsdTtcclxuICAgICAgICBsZXQgY291bnQgPSB0aGlzLmVudmlyb25tZW50LmFnZW50cy5sZW5ndGg7XHJcbiAgICAgICAgLy9jZmcucmVwb3J0LnN1bSA9IGNmZy5yZXBvcnQuc3VtLmNvbmNhdChjZmcucmVwb3J0Lm1lYW4pO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5lbnZpcm9ubWVudC5hZ2VudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGQgPSB0aGlzLmVudmlyb25tZW50LmFnZW50c1tpXTtcclxuICAgICAgICAgICAgY2ZnLnJlcG9ydC5zdW1zLmZvckVhY2goKHMpID0+IHtcclxuICAgICAgICAgICAgICAgIHN1bXNbc10gPSBzdW1zW3NdID09IHVuZGVmaW5lZCA/IGRbc10gOiBkW3NdICsgc3Vtc1tzXTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNmZy5yZXBvcnQuZnJlcXMuZm9yRWFjaCgoZikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBkW2ZdID09PSAnbnVtYmVyJyB8fCB0eXBlb2YgZFtmXSA9PT0gJ2Jvb2xlYW4nICYmICFpc05hTihkW2ZdKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZyZXFzW2ZdID0gZnJlcXNbZl0gPT0gdW5kZWZpbmVkID8gMSA6IGRbZl0gKyBmcmVxc1tmXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmICgnY29tcGFydG1lbnRzJyBpbiBkKSB7XHJcbiAgICAgICAgICAgICAgICBjZmcucmVwb3J0LmNvbXBhcnRtZW50cy5mb3JFYWNoKChjbSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsW2NtXSA9IG1vZGVsW2NtXSA9PSB1bmRlZmluZWQgPyBkLnBvcHVsYXRpb25zW2NtXSA6IGQucG9wdWxhdGlvbnNbY21dICsgbW9kZWxbY21dO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgO1xyXG4gICAgICAgIGNmZy5yZXBvcnQubWVhbnMuZm9yRWFjaCgobSkgPT4ge1xyXG4gICAgICAgICAgICBtZWFuc1ttXSA9IHN1bXNbbV0gLyBjb3VudDtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBydW46IHIsXHJcbiAgICAgICAgICAgIGNmZzogdGhpcy5jdXJyZW50Q0ZHLFxyXG4gICAgICAgICAgICBjb3VudDogY291bnQsXHJcbiAgICAgICAgICAgIHN1bXM6IHN1bXMsXHJcbiAgICAgICAgICAgIG1lYW5zOiBtZWFucyxcclxuICAgICAgICAgICAgZnJlcXM6IGZyZXFzLFxyXG4gICAgICAgICAgICBtb2RlbDogbW9kZWxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgLy9vbiBlYWNoIHJ1biwgY2hhbmdlIG9uZSBwYXJhbSwgaG9sZCBvdGhlcnMgY29uc3RhbnRcclxuICAgIGFmdGVyKHJ1biwgY2ZnKSB7XHJcbiAgICB9XHJcbiAgICBnZW5BdmcobG9ncywgY2ZnKSB7XHJcbiAgICAgICAgbGV0IHN1bXMgPSB7fTtcclxuICAgICAgICBsZXQgZnJlcXMgPSB7fTtcclxuICAgICAgICBsZXQgc3VtTWVhbnMgPSB7fTtcclxuICAgICAgICBsZXQgbWVhbnMgPSB7fTtcclxuICAgICAgICBsb2dzLmZvckVhY2goKGxvZykgPT4ge1xyXG4gICAgICAgICAgICBjZmcucmVwb3J0LnN1bXMuZm9yRWFjaCgocykgPT4ge1xyXG4gICAgICAgICAgICAgICAgc3Vtc1tzXSA9IHN1bXNbc10gPT0gdW5kZWZpbmVkID8gbG9nLnN1bXNbc10gOiBsb2cuc3Vtc1tzXSArIHN1bXNbc107XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjZmcucmVwb3J0LmZyZXFzLmZvckVhY2goKGYpID0+IHtcclxuICAgICAgICAgICAgICAgIGZyZXFzW2ZdID0gZnJlcXNbZl0gPT0gdW5kZWZpbmVkID8gbG9nLmZyZXFzW2ZdIDogbG9nLmZyZXFzW2ZdICsgZnJlcXNbZl07XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjZmcucmVwb3J0Lm1lYW5zLmZvckVhY2goKG0pID0+IHtcclxuICAgICAgICAgICAgICAgIHN1bU1lYW5zW21dID0gc3VtTWVhbnNbbV0gPT0gdW5kZWZpbmVkID8gbG9nLm1lYW5zW21dIDogbG9nLm1lYW5zW21dICsgc3VtTWVhbnNbbV07XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNmZy5yZXBvcnQubWVhbnMuZm9yRWFjaCgobSkgPT4ge1xyXG4gICAgICAgICAgICBtZWFuc1ttXSA9IHN1bU1lYW5zW21dIC8gbG9ncy5sZW5ndGg7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY2ZnLnJlcG9ydC5mcmVxcy5mb3JFYWNoKChmKSA9PiB7XHJcbiAgICAgICAgICAgIG1lYW5zW2ZdID0gZnJlcXNbZl0gLyBsb2dzLmxlbmd0aDtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBtZWFuczogbWVhbnMsXHJcbiAgICAgICAgICAgIHN1bXM6IHN1bXMsXHJcbiAgICAgICAgICAgIGZyZXFzOiBmcmVxc1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICAvKlxyXG4gICAgKiBBc3NpZ24gbmV3IGVudmlyb25tZW50YWwgcGFyYW1ldGVycyBmcm9tIGV4cGVyaW1lbnRhbCBwYXJhbWV0ZXJzLlxyXG4gICAgKi9cclxuICAgIHVwZGF0ZUFzc2lnbm1lbnQoY2ZnLCBwYXJhbWV0ZXJzKSB7XHJcbiAgICAgICAgZm9yIChsZXQgcG0gPSAwOyBwbSA8IHBhcmFtZXRlcnMubGVuZ3RoOyBwbSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBwYXJhbSA9IHBhcmFtZXRlcnNbcG1dO1xyXG4gICAgICAgICAgICBsZXQgdmFsID0gYXNzaWduUGFyYW0oe30sIHBhcmFtLCBwYXJhbS5uYW1lLCB0aGlzLnJuZyk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudENGR1twYXJhbS5sZXZlbF0gPSB0aGlzLmN1cnJlbnRDRkdbcGFyYW0ubGV2ZWxdIHx8IHt9O1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDRkdbcGFyYW0ubGV2ZWxdW3BhcmFtLmdyb3VwXSA9IHRoaXMuY3VycmVudENGR1twYXJhbS5sZXZlbF1bcGFyYW0uZ3JvdXBdIHx8IHt9O1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDRkdbcGFyYW0ubGV2ZWxdW3BhcmFtLmdyb3VwXVtwYXJhbS5uYW1lXSA9IHZhbDtcclxuICAgICAgICAgICAgc3dpdGNoIChwYXJhbS5sZXZlbCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnYWdlbnRzJzpcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyYW0uZ3JvdXAgPT09ICdib3VuZGFyaWVzJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZmcuYWdlbnRzLmJvdW5kYXJpZXNbcGFyYW0ubmFtZV0uYXNzaWduID0gdmFsO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2ZnLmFnZW50c1twYXJhbS5ncm91cF0ucGFyYW1zW3BhcmFtLm5hbWVdLmFzc2lnbiA9IHZhbDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdlbnRpdGllcyc6XHJcbiAgICAgICAgICAgICAgICAgICAgY2ZnLmVudGl0aWVzW3BhcmFtLmdyb3VwXS5wYXJhbXNbcGFyYW0ubmFtZV0uYXNzaWduID0gdmFsO1xyXG4gICAgICAgICAgICAgICAgICAgIGNmZy5lbnRpdGllc1twYXJhbS5ncm91cF1bcGFyYW0ubmFtZV0gPSB2YWw7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGNmZ1twYXJhbS5sZXZlbF0ucGFyYW1zW3BhcmFtLmdyb3VwXVtwYXJhbS5uYW1lXSA9IHZhbDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1leHBlcmltZW50LmpzLm1hcCIsImV4cG9ydCBjbGFzcyBHZW5lIHtcclxuICAgIGNvbnN0cnVjdG9yKHBhcmFtcywgdHlwZSwgcm5nKSB7XHJcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ25vcm1hbCc6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvZGUgPSBybmcubm9ybWFsKHBhcmFtc1swXSwgcGFyYW1zWzFdKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb2RlID0gcm5nLnJhbmRvbSgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBDaHJvbWFzb21lIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ2VuZXMgPSBbXTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1nZW5ldGljLmpzLm1hcCIsImltcG9ydCB7IEV4cGVyaW1lbnQgfSBmcm9tICcuL2V4cGVyaW1lbnQnO1xyXG5pbXBvcnQgeyBDaHJvbWFzb21lLCBHZW5lIH0gZnJvbSAnLi9nZW5ldGljJztcclxuaW1wb3J0IHsgc2NhbGVJbnYgfSBmcm9tICcuL3V0aWxzJztcclxuZXhwb3J0IGNsYXNzIEV2b2x1dGlvbmFyeSBleHRlbmRzIEV4cGVyaW1lbnQge1xyXG4gICAgY29uc3RydWN0b3IoZW52aXJvbm1lbnQsIHNldHVwLCBkaXNjcmV0ZSA9IGZhbHNlLCBtYXRpbmcgPSB0cnVlKSB7XHJcbiAgICAgICAgc3VwZXIoZW52aXJvbm1lbnQsIHNldHVwKTtcclxuICAgICAgICB0aGlzLm1ldGhvZCA9IFwibm9ybWFsXCI7XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSBzZXR1cC5ldm9sdXRpb24udGFyZ2V0O1xyXG4gICAgICAgIHRoaXMubWV0aG9kID0gc2V0dXAuZXZvbHV0aW9uLm1ldGhvZCB8fCBcIm5vcm1hbFwiO1xyXG4gICAgICAgIHRoaXMucGFyYW1zID0gc2V0dXAuZXhwZXJpbWVudC5wYXJhbXM7XHJcbiAgICAgICAgdGhpcy5zaXplID0gc2V0dXAuZXhwZXJpbWVudC5zaXplO1xyXG4gICAgICAgIHRoaXMubWF0aW5nID0gbWF0aW5nO1xyXG4gICAgICAgIGlmICh0aGlzLnNpemUgPCAyKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWF0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucG9wdWxhdGlvbiA9IFtdO1xyXG4gICAgICAgIHRoaXMubXV0YXRlUmF0ZSA9IDAuNTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc2l6ZTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjaHJvbWEgPSBuZXcgQ2hyb21hc29tZSgpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IHRoaXMucGFyYW1zLmxlbmd0aDsgaysrKSB7XHJcbiAgICAgICAgICAgICAgICAvL25ldyBHZW5lKHRoaXMucmFuZ2VzW2tdLnJhbmdlLCB0aGlzLm1ldGhvZCwgdGhpcy5ybmcpXHJcbiAgICAgICAgICAgICAgICBjaHJvbWEuZ2VuZXMucHVzaCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGlvbi5wdXNoKGNocm9tYSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc3RhcnQocnVucywgc3RlcCwgdW50aWwsIHByZXBDQikge1xyXG4gICAgICAgIGxldCByID0gMDtcclxuICAgICAgICB3aGlsZSAociA8IHJ1bnMpIHtcclxuICAgICAgICAgICAgdGhpcy5wcmVwKHIsIHRoaXMuc2V0dXAsIHByZXBDQik7XHJcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGlvbi5zb3J0KHRoaXMuYXNjU29ydCk7XHJcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGlvbiA9IHRoaXMucG9wdWxhdGlvbi5zbGljZSgwLCB0aGlzLnNpemUpO1xyXG4gICAgICAgICAgICB0aGlzLmV4cGVyaW1lbnRMb2dbdGhpcy5leHBlcmltZW50TG9nLmxlbmd0aCAtIDFdLmJlc3QgPSB0cnVlO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInJ1biBcIiArIHIgKyBcIiBzY29yZSA6ICBtZWFuID0gXCIgKyB0aGlzLnNjb3JlTWVhbih0aGlzLnBvcHVsYXRpb24pICsgJyAgc2QgPSAnICsgdGhpcy5zY29yZVNEKHRoaXMucG9wdWxhdGlvbikpO1xyXG4gICAgICAgICAgICByKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaW1wcm92ZW1lbnQgPSB0aGlzLmltcHJvdmVtZW50U2NvcmUodGhpcy5leHBlcmltZW50TG9nKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5leHBlcmltZW50TG9nO1xyXG4gICAgfVxyXG4gICAgZ2V0UGFyYW1zKGNocm9tYSwgY2ZnKSB7XHJcbiAgICAgICAgbGV0IG91dCA9IHt9O1xyXG4gICAgICAgIGZvciAobGV0IHBtID0gMDsgcG0gPCB0aGlzLnBhcmFtcy5sZW5ndGg7IHBtKyspIHtcclxuICAgICAgICAgICAgbGV0IGNmZ1BtID0gdGhpcy5wYXJhbXNbcG1dO1xyXG4gICAgICAgICAgICBpZiAoY2ZnUG0ubGV2ZWwgPT09ICdhZ2VudHMnIHx8IHR5cGVvZiBjZmdQbS5sZXZlbCA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIG91dFtjZmdQbS5sZXZlbCArIFwiX1wiICsgY2ZnUG0ubmFtZV0gPSBzY2FsZUludihjaHJvbWEuZ2VuZXNbcG1dLmNvZGUsIGNmZ1BtLnJhbmdlWzBdLCBjZmdQbS5yYW5nZVsxXSAtIGNmZ1BtLnJhbmdlWzBdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG91dFtjZmdQbS5sZXZlbCArIFwiX1wiICsgY2ZnUG0ubmFtZV0gPSBzY2FsZUludihjaHJvbWEuZ2VuZXNbcG1dLmNvZGUsIGNmZ1BtLnJhbmdlWzBdLCBjZmdQbS5yYW5nZVsxXSAtIGNmZ1BtLnJhbmdlWzBdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3V0O1xyXG4gICAgfVxyXG4gICAgZHNjU29ydChhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEuc2NvcmUgPiBiLnNjb3JlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoYS5zY29yZSA8IGIuc2NvcmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgYXNjU29ydChhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEuc2NvcmUgPiBiLnNjb3JlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChhLnNjb3JlIDwgYi5zY29yZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgcHJlcChyLCBjZmcsIGNiKSB7XHJcbiAgICAgICAgbGV0IHJlcG9ydDtcclxuICAgICAgICBpZiAodGhpcy5tYXRpbmcpIHtcclxuICAgICAgICAgICAgbGV0IHRvcFBlcmNlbnQgPSBNYXRoLnJvdW5kKDAuMSAqIHRoaXMuc2l6ZSkgKyAyOyAvL3RlbiBwZXJjZW50IG9mIG9yaWdpbmFsIHNpemUgKyAyXHJcbiAgICAgICAgICAgIGxldCBjaGlsZHJlbiA9IHRoaXMubWF0ZSh0b3BQZXJjZW50KTtcclxuICAgICAgICAgICAgdGhpcy5wb3B1bGF0aW9uID0gdGhpcy5wb3B1bGF0aW9uLmNvbmNhdChjaGlsZHJlbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wb3B1bGF0aW9uLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMubXV0YXRlKHRoaXMucG9wdWxhdGlvbltpXSwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5wb3B1bGF0aW9uLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQXNzaWdubWVudChjZmcsIHRoaXMucG9wdWxhdGlvbltqXSwgdGhpcy5wYXJhbXMpO1xyXG4gICAgICAgICAgICBzdXBlci5wcmVwKHIsIGNmZywgY2IpO1xyXG4gICAgICAgICAgICB0aGlzLmVudmlyb25tZW50LnRpbWUgPSAwO1xyXG4gICAgICAgICAgICByZXBvcnQgPSB0aGlzLnJlcG9ydChyLCBjZmcpO1xyXG4gICAgICAgICAgICB0aGlzLnBvcHVsYXRpb25bal0uc2NvcmUgPSB0aGlzLmNvc3QocmVwb3J0LCB0aGlzLnRhcmdldCk7XHJcbiAgICAgICAgICAgIHJlcG9ydC5zY29yZSA9IHRoaXMucG9wdWxhdGlvbltqXS5zY29yZTtcclxuICAgICAgICAgICAgdGhpcy5leHBlcmltZW50TG9nLnB1c2gocmVwb3J0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICB1cGRhdGVBc3NpZ25tZW50KGNmZywgY2hyb21hLCBwYXJhbWV0ZXJzKSB7XHJcbiAgICAgICAgZm9yIChsZXQgcG0gPSAwOyBwbSA8IHBhcmFtZXRlcnMubGVuZ3RoOyBwbSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBwYXJhbSA9IHBhcmFtZXRlcnNbcG1dO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKHBhcmFtLmxldmVsKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdhZ2VudHMnOlxyXG4gICAgICAgICAgICAgICAgICAgIGNmZy5hZ2VudHNbcGFyYW0uZ3JvdXBdLnBhcmFtc1twYXJhbS5uYW1lXS5hc3NpZ24gPSBzY2FsZUludihjaHJvbWEuZ2VuZXNbcG1dLmNvZGUsIHBhcmFtLnJhbmdlWzBdLCBwYXJhbS5yYW5nZVsxXSAtIHBhcmFtLnJhbmdlWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2VudGl0aWVzJzpcclxuICAgICAgICAgICAgICAgICAgICBjZmcuZW50aXRpZXNbcGFyYW0uZ3JvdXBdW3BhcmFtLm5hbWVdID0gc2NhbGVJbnYoY2hyb21hLmdlbmVzW3BtXS5jb2RlLCBwYXJhbS5yYW5nZVswXSwgcGFyYW0ucmFuZ2VbMV0gLSBwYXJhbS5yYW5nZVswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGNmZ1twYXJhbS5sZXZlbF0ucGFyYW1zW3BhcmFtLmdyb3VwXVtwYXJhbS5uYW1lXSA9IHNjYWxlSW52KGNocm9tYS5nZW5lc1twbV0uY29kZSwgcGFyYW0ucmFuZ2VbMF0sIHBhcmFtLnJhbmdlWzFdIC0gcGFyYW0ucmFuZ2VbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29zdChwcmVkaWN0LCB0YXJnZXQpIHtcclxuICAgICAgICBsZXQgZGV2ID0gMDtcclxuICAgICAgICBsZXQgZGltZW5zaW9ucyA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHRhcmdldC5tZWFucykge1xyXG4gICAgICAgICAgICBkZXYgKz0gTWF0aC5hYnModGFyZ2V0Lm1lYW5zW2tleV0gLSBwcmVkaWN0Lm1lYW5zW2tleV0pO1xyXG4gICAgICAgICAgICBkaW1lbnNpb25zKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiB0YXJnZXQuZnJlcXMpIHtcclxuICAgICAgICAgICAgZGV2ICs9IE1hdGguYWJzKHRhcmdldC5mcmVxc1trZXldIC0gcHJlZGljdC5mcmVxc1trZXldKTtcclxuICAgICAgICAgICAgZGltZW5zaW9ucysrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gdGFyZ2V0Lm1vZGVsKSB7XHJcbiAgICAgICAgICAgIGRldiArPSBNYXRoLmFicyh0YXJnZXQubW9kZWxba2V5XSAtIHByZWRpY3QubW9kZWxba2V5XSk7XHJcbiAgICAgICAgICAgIGRpbWVuc2lvbnMrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRldiAvIGRpbWVuc2lvbnM7XHJcbiAgICB9XHJcbiAgICByZXBvcnQociwgY2ZnKSB7XHJcbiAgICAgICAgbGV0IHJlcG9ydCA9IHN1cGVyLnJlcG9ydChyLCBjZmcpO1xyXG4gICAgICAgIHJldHVybiByZXBvcnQ7XHJcbiAgICB9XHJcbiAgICBpbXByb3ZlbWVudFNjb3JlKGxvZywgYXZnR2VuZXJhdGlvbiA9IHRydWUpIHtcclxuICAgICAgICBsZXQgTiA9IGxvZy5sZW5ndGg7XHJcbiAgICAgICAgbGV0IHN1bSA9IDA7XHJcbiAgICAgICAgbGV0IHJhbmtlZDtcclxuICAgICAgICBpZiAoYXZnR2VuZXJhdGlvbikge1xyXG4gICAgICAgICAgICByYW5rZWQgPSB0aGlzLmdlbkF2Zyhsb2csIHRoaXMuc2V0dXApO1xyXG4gICAgICAgICAgICBOID0gcmFua2VkLmxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJhbmtlZCA9IGxvZy5tYXAoKGQsIGkpID0+IHsgZC5vcmRlciA9IGk7IHJldHVybiBkOyB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmFua2VkLnNvcnQodGhpcy5kc2NTb3J0KTtcclxuICAgICAgICByYW5rZWQubWFwKChkLCBpKSA9PiB7IGQucmFuayA9IGk7IHJldHVybiBkOyB9KTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJhbmtlZC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBzdW0gKz0gTWF0aC5hYnMocmFua2VkW2ldLm9yZGVyIC8gTiAtIHJhbmtlZFtpXS5yYW5rIC8gTik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAxIC0gMiAqIHN1bSAvIE47XHJcbiAgICB9XHJcbiAgICBnZW5BdmcobG9nLCBjZmcpIHtcclxuICAgICAgICBsZXQgc3VtcyA9IHt9O1xyXG4gICAgICAgIGxldCBwb3BzID0ge307XHJcbiAgICAgICAgbGV0IGF2Z3MgPSBbXTtcclxuICAgICAgICBsb2cuZm9yRWFjaCgoZCkgPT4ge1xyXG4gICAgICAgICAgICBzdW1zW2QucnVuXSA9IHN1bXNbZC5ydW5dICsgZC5zY29yZSB8fCBkLnNjb3JlO1xyXG4gICAgICAgICAgICBwb3BzW2QucnVuXSA9IHBvcHNbZC5ydW5dICsgMSB8fCAxO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGZvciAobGV0IHJ1biBpbiBzdW1zKSB7XHJcbiAgICAgICAgICAgIGF2Z3NbcnVuXSA9IHsgb3JkZXI6IHJ1biwgc2NvcmU6IHN1bXNbcnVuXSAvIHBvcHNbcnVuXSB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYXZncztcclxuICAgIH1cclxuICAgIGNlbnRyb2lkKHBvcCkge1xyXG4gICAgICAgIGxldCBjZW50cm9pZCA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wYXJhbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY2VudHJvaWRbaV0gPSBqU3RhdC5tZWFuKHRoaXMucG9wdWxhdGlvbi5tYXAoKGQpID0+IHsgcmV0dXJuIGQuZ2VuZXNbaV0uY29kZTsgfSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2VudHJvaWQ7XHJcbiAgICB9XHJcbiAgICB2ZWN0b3JTY29yZXMocG9wKSB7XHJcbiAgICAgICAgbGV0IHZlYyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcG9wLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZlY1tpXSA9IHBvcFtpXS5zY29yZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZlYztcclxuICAgIH1cclxuICAgIHNjb3JlTWVhbihwb3ApIHtcclxuICAgICAgICBsZXQgdmFscyA9IHRoaXMudmVjdG9yU2NvcmVzKHBvcCk7XHJcbiAgICAgICAgcmV0dXJuIGpTdGF0Lm1lYW4odmFscyk7XHJcbiAgICB9XHJcbiAgICBzY29yZVNEKHBvcCkge1xyXG4gICAgICAgIGxldCB2YWxzID0gdGhpcy52ZWN0b3JTY29yZXMocG9wKTtcclxuICAgICAgICByZXR1cm4galN0YXQuc3RkZXYodmFscyk7XHJcbiAgICB9XHJcbiAgICB3ZWlnaHRlZFN1bSgpIHtcclxuICAgICAgICAvL211c3QgYmUgc29ydGVkIGFscmVhZHlcclxuICAgICAgICBsZXQgbWVhbiA9IHRoaXMuc2NvcmVNZWFuKHRoaXMucG9wdWxhdGlvbik7XHJcbiAgICAgICAgbGV0IHNkID0gdGhpcy5zY29yZVNEKHRoaXMucG9wdWxhdGlvbik7XHJcbiAgICAgICAgbGV0IHdlaWdodHMgPSB0aGlzLnBvcHVsYXRpb24ubWFwKChwLCBpZHgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIChwLnNjb3JlIC0gbWVhbikgLyBzZDtcclxuICAgICAgICB9KTtcclxuICAgICAgICBsZXQgc3VtID0gdGhpcy5wYXJhbXMubWFwKChwYXJhbSwgaWR4KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBvcHVsYXRpb24ucmVkdWNlKChhY2MsIGN1cnJlbnQsIGN1cnJlbnRJZHgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50LmdlbmVzW2lkeF0uY29kZSAqIHdlaWdodHNbY3VycmVudElkeF0gKyBhY2M7XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBzdW07XHJcbiAgICB9XHJcbiAgICBtYXRlKHBhcmVudHMpIHtcclxuICAgICAgICBsZXQgbnVtQ2hpbGRyZW4gPSBNYXRoLm1pbigyLCBNYXRoLm1heCgxMCwgdGhpcy5wYXJhbXMubGVuZ3RoKSk7XHJcbiAgICAgICAgbGV0IGNoaWxkcmVuID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1DaGlsZHJlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjaGlsZCA9IG5ldyBDaHJvbWFzb21lKCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5wYXJhbXMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBnZW5lID0gbmV3IEdlbmUoW3RoaXMucGFyYW1zW2pdLnJhbmdlWzBdLCB0aGlzLnBhcmFtc1tqXS5yYW5nZVsxXV0sIHRoaXMubWV0aG9kLCB0aGlzLnJuZyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmFuZCA9IE1hdGguZmxvb3IodGhpcy5ybmcucmFuZG9tKCkgKiBwYXJlbnRzKTtcclxuICAgICAgICAgICAgICAgIGxldCBleHByZXNzZWQgPSB0aGlzLnBvcHVsYXRpb25bcmFuZF0uZ2VuZXMuc2xpY2UoaiwgaiArIDEpO1xyXG4gICAgICAgICAgICAgICAgZ2VuZS5jb2RlID0gZXhwcmVzc2VkWzBdLmNvZGU7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5nZW5lcy5wdXNoKGdlbmUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNoaWxkcmVuLnB1c2goY2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2hpbGRyZW47XHJcbiAgICB9XHJcbiAgICBtdXRhdGUoY2hyb21hLCBjaGFuY2UpIHtcclxuICAgICAgICBsZXQgYmVzdCA9IHRoaXMucG9wdWxhdGlvblswXS5nZW5lcztcclxuICAgICAgICBsZXQgY2VudHJvaWQgPSB0aGlzLmNlbnRyb2lkKFt0aGlzLnBvcHVsYXRpb25bMF0sIHRoaXMucG9wdWxhdGlvblsxXV0pO1xyXG4gICAgICAgIGlmICh0aGlzLnJuZy5yYW5kb20oKSA+IGNoYW5jZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgY2hyb21hLmdlbmVzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGxldCBnZW5lID0gY2hyb21hLmdlbmVzW2pdO1xyXG4gICAgICAgICAgICBsZXQgZGlmZiA9IGJlc3Rbal0uY29kZSAtIGdlbmUuY29kZTtcclxuICAgICAgICAgICAgaWYgKGRpZmYgPT0gMCB8fCB0aGlzLm1ldGhvZCA9PT0gJ25vcm1hbCcpIHtcclxuICAgICAgICAgICAgICAgIGdlbmUuY29kZSArPSB0aGlzLnJuZy5ub3JtYWwoMCwgMSkgKiB0aGlzLm11dGF0ZVJhdGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBnZW5lLmNvZGUgKz0gZGlmZiAqIHRoaXMubXV0YXRlUmF0ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBnZW5lLmNvZGUgPSBNYXRoLm1pbihNYXRoLm1heCgwLCBnZW5lLmNvZGUpLCAxKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZXZvbHV0aW9uYXJ5LmpzLm1hcCIsImltcG9ydCB7IEV4cGVyaW1lbnQgfSBmcm9tICcuL2V4cGVyaW1lbnQnO1xyXG5pbXBvcnQgeyBhc3NpZ25QYXJhbSwgc2NhbGUsIHNjYWxlSW52IH0gZnJvbSAnLi91dGlscyc7XHJcbmV4cG9ydCBjbGFzcyBFdm9sdmUgZXh0ZW5kcyBFeHBlcmltZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKGVudmlyb25tZW50LCBzZXR1cCkge1xyXG4gICAgICAgIHN1cGVyKGVudmlyb25tZW50LCBzZXR1cCk7XHJcbiAgICAgICAgdGhpcy50eXBlID0gJ2V2b2x2ZSc7XHJcbiAgICAgICAgdGhpcy5wb3B1bGF0aW9uID0gW107XHJcbiAgICAgICAgdGhpcy5tdXRhdGVSYXRlID0gMC41O1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gc2V0dXAuZXZvbHV0aW9uLnRhcmdldDtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc2V0dXAuZXhwZXJpbWVudC5zaXplOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5wb3B1bGF0aW9uW2ldID0geyBzY29yZTogMWUxNiwgcGFyYW1zOiBbXSB9O1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwID0gMDsgcCA8IHRoaXMuc2V0dXAuZXhwZXJpbWVudC5wYXJhbXMubGVuZ3RoOyBwKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBzZXRQYXJhbSA9IHRoaXMuc2V0dXAuZXhwZXJpbWVudC5wYXJhbXNbcF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRpb25baV0ucGFyYW1zLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldmVsOiBzZXRQYXJhbS5sZXZlbCxcclxuICAgICAgICAgICAgICAgICAgICBncm91cDogc2V0UGFyYW0uZ3JvdXAsXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogc2V0UGFyYW0ubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBhc3NpZ246IGFzc2lnblBhcmFtKHt9LCBzZXRQYXJhbSwgc2V0UGFyYW0ubmFtZSwgdGhpcy5ybmcpXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnJhbmdlcyA9IHRoaXMuc2V0dXAuZXhwZXJpbWVudC5wYXJhbXMubWFwKChkKSA9PiB7IHJldHVybiBkLmRpc3RyaWJ1dGlvbi5wYXJhbXM7IH0pO1xyXG4gICAgfVxyXG4gICAgc3RhcnQocnVucywgc3RlcCwgdW50aWwsIHByZXBDQikge1xyXG4gICAgICAgIHZhciByID0gMDtcclxuICAgICAgICBydW5zID0gcnVucyAqIHRoaXMuc2V0dXAuZXhwZXJpbWVudC5zaXplO1xyXG4gICAgICAgIHdoaWxlIChyIDwgcnVucykge1xyXG4gICAgICAgICAgICB0aGlzLnByZXAociwgdGhpcy5zZXR1cCwgcHJlcENCKTtcclxuICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC50aW1lID0gMDtcclxuICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudC5ydW4oc3RlcCwgdW50aWwsIDApO1xyXG4gICAgICAgICAgICB0aGlzLmV4cGVyaW1lbnRMb2dbcl0gPSB0aGlzLnJlcG9ydChyLCB0aGlzLnNldHVwKTtcclxuICAgICAgICAgICAgdGhpcy5hZnRlcihyLCB0aGlzLnNldHVwKTtcclxuICAgICAgICAgICAgaWYgKHIgJSB0aGlzLnNldHVwLmV4cGVyaW1lbnQuc2l6ZSA9PT0gMCAmJiByICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVuZEdlbihyLCB0aGlzLnNldHVwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaW1wcm92ZW1lbnQgPSB0aGlzLm92ZXJhbGwodGhpcy5nZW5Mb2cpO1xyXG4gICAgfVxyXG4gICAgb3ZlcmFsbChnZW5Mb2cpIHtcclxuICAgICAgICBsZXQgTiA9IGdlbkxvZy5sZW5ndGg7XHJcbiAgICAgICAgbGV0IHN1bSA9IDA7XHJcbiAgICAgICAgbGV0IHJhbmtlZCA9IGdlbkxvZztcclxuICAgICAgICByYW5rZWQuc29ydCh0aGlzLmRzY1NvcnQpO1xyXG4gICAgICAgIHJhbmtlZC5tYXAoKGQsIGkpID0+IHsgZC5yYW5rID0gaTsgcmV0dXJuIGQ7IH0pO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmFua2VkLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHN1bSArPSBNYXRoLmFicyhyYW5rZWRbaV0ub3JkZXIgLyBOIC0gcmFua2VkW2ldLnJhbmsgLyBOKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDEgLSAyICogc3VtIC8gTjtcclxuICAgIH1cclxuICAgIHByZXAocnVuLCBzZXR1cCwgcHJlcENCKSB7XHJcbiAgICAgICAgc2V0dXAuZXhwZXJpbWVudC5wYXJhbXMgPSB0aGlzLnBvcHVsYXRpb25bcnVuICUgc2V0dXAuZXhwZXJpbWVudC5zaXplXS5wYXJhbXM7XHJcbiAgICAgICAgc3VwZXIudXBkYXRlQXNzaWdubWVudChzZXR1cCwgc2V0dXAuZXhwZXJpbWVudC5wYXJhbXMpO1xyXG4gICAgICAgIHN1cGVyLnByZXAocnVuLCBzZXR1cCwgcHJlcENCKTtcclxuICAgIH1cclxuICAgIGVuZEdlbihydW4sIGNmZykge1xyXG4gICAgICAgIGxldCBjaGlsZHJlbjtcclxuICAgICAgICBsZXQgcHJldlN0YXJ0ID0gTWF0aC5taW4oMCwgcnVuIC0gY2ZnLmV4cGVyaW1lbnQuc2l6ZSk7XHJcbiAgICAgICAgdGhpcy5wb3B1bGF0aW9uLnNvcnQodGhpcy5hc2NTb3J0KTtcclxuICAgICAgICB0aGlzLnBvcHVsYXRpb24gPSB0aGlzLnBvcHVsYXRpb24uc2xpY2UoMCwgY2ZnLmV4cGVyaW1lbnQuc2l6ZSk7XHJcbiAgICAgICAgY2hpbGRyZW4gPSB0aGlzLm1hdGUoTWF0aC5taW4oNSwgTWF0aC5tYXgoMiwgTWF0aC5mbG9vcih0aGlzLnBvcHVsYXRpb24ubGVuZ3RoICogMC4zMzMpKSkpO1xyXG4gICAgICAgIHRoaXMubXV0YXRlKHRoaXMucG9wdWxhdGlvbiwgMSk7XHJcbiAgICAgICAgdGhpcy5nZW5Mb2cucHVzaCh0aGlzLmdlbkF2Zyh0aGlzLmV4cGVyaW1lbnRMb2cuc2xpY2UocHJldlN0YXJ0LCBydW4pLCBjZmcpKTtcclxuICAgICAgICB0aGlzLmdlbkxvZ1t0aGlzLmdlbkxvZy5sZW5ndGggLSAxXS5vcmRlciA9IHRoaXMuZ2VuTG9nLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgdGhpcy5nZW5Mb2dbdGhpcy5nZW5Mb2cubGVuZ3RoIC0gMV0uc2NvcmUgPSB0aGlzLnNjb3JlTWVhbih0aGlzLnBvcHVsYXRpb24pO1xyXG4gICAgICAgIHRoaXMuZ2VuTG9nW3RoaXMuZ2VuTG9nLmxlbmd0aCAtIDFdLnNjb3JlU0QgPSB0aGlzLnNjb3JlU0QodGhpcy5wb3B1bGF0aW9uKTtcclxuICAgICAgICB0aGlzLnBvcHVsYXRpb24uc3BsaWNlKHRoaXMucG9wdWxhdGlvbi5sZW5ndGggLSBjaGlsZHJlbi5sZW5ndGggLSAxLCBjaGlsZHJlbi5sZW5ndGgpO1xyXG4gICAgICAgIHRoaXMucG9wdWxhdGlvbiA9IHRoaXMucG9wdWxhdGlvbi5jb25jYXQoY2hpbGRyZW4pO1xyXG4gICAgfVxyXG4gICAgdmVjdG9yU2NvcmVzKHBvcCkge1xyXG4gICAgICAgIGxldCB2ZWMgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBvcC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2ZWNbaV0gPSBwb3BbaV0uc2NvcmU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2ZWM7XHJcbiAgICB9XHJcbiAgICBzY29yZU1lYW4ocG9wKSB7XHJcbiAgICAgICAgbGV0IHZhbHMgPSB0aGlzLnZlY3RvclNjb3Jlcyhwb3ApO1xyXG4gICAgICAgIHJldHVybiBqU3RhdC5tZWFuKHZhbHMpO1xyXG4gICAgfVxyXG4gICAgc2NvcmVTRChwb3ApIHtcclxuICAgICAgICBsZXQgdmFscyA9IHRoaXMudmVjdG9yU2NvcmVzKHBvcCk7XHJcbiAgICAgICAgcmV0dXJuIGpTdGF0LnN0ZGV2KHZhbHMpO1xyXG4gICAgfVxyXG4gICAgYWZ0ZXIocnVuLCBjZmcpIHtcclxuICAgICAgICB0aGlzLnBvcHVsYXRpb25bcnVuICUgY2ZnLmV4cGVyaW1lbnQuc2l6ZV0uc2NvcmUgPSB0aGlzLmNvc3QodGhpcy5leHBlcmltZW50TG9nW3J1bl0sIHRoaXMudGFyZ2V0KTtcclxuICAgICAgICB0aGlzLmV4cGVyaW1lbnRMb2dbcnVuXS5zY29yZSA9IHRoaXMucG9wdWxhdGlvbltydW4gJSBjZmcuZXhwZXJpbWVudC5zaXplXS5zY29yZTtcclxuICAgIH1cclxuICAgIGNvc3QocHJlZGljdCwgdGFyZ2V0KSB7XHJcbiAgICAgICAgbGV0IGRldiA9IDA7XHJcbiAgICAgICAgbGV0IGRpbWVuc2lvbnMgPSAwO1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiB0YXJnZXQubWVhbnMpIHtcclxuICAgICAgICAgICAgZGV2ICs9IE1hdGguYWJzKHRhcmdldC5tZWFuc1trZXldIC0gcHJlZGljdC5tZWFuc1trZXldKTtcclxuICAgICAgICAgICAgZGltZW5zaW9ucysrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gdGFyZ2V0LmZyZXFzKSB7XHJcbiAgICAgICAgICAgIGRldiArPSBNYXRoLmFicyh0YXJnZXQuZnJlcXNba2V5XSAtIHByZWRpY3QuZnJlcXNba2V5XSk7XHJcbiAgICAgICAgICAgIGRpbWVuc2lvbnMrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHRhcmdldC5tb2RlbCkge1xyXG4gICAgICAgICAgICBkZXYgKz0gTWF0aC5hYnModGFyZ2V0Lm1vZGVsW2tleV0gLSBwcmVkaWN0Lm1vZGVsW2tleV0pO1xyXG4gICAgICAgICAgICBkaW1lbnNpb25zKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkZXYgLyBkaW1lbnNpb25zO1xyXG4gICAgfVxyXG4gICAgbXV0YXRlKHBvcHVsYXRpb24sIGNoYW5jZSkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgcG9wdWxhdGlvbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5ybmcucmFuZG9tKCkgPiBjaGFuY2UpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBiZXN0ID0gcG9wdWxhdGlvblswXS5wYXJhbXM7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gcG9wdWxhdGlvbltpXS5wYXJhbXM7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHAgPSAwOyBwIDwgY3VycmVudC5sZW5ndGg7IHArKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNjYWxlZEIgPSBzY2FsZShiZXN0W3BdLmFzc2lnbiwgdGhpcy5yYW5nZXNbcF1bMF0sIHRoaXMucmFuZ2VzW3BdWzFdIC0gdGhpcy5yYW5nZXNbcF1bMF0pO1xyXG4gICAgICAgICAgICAgICAgbGV0IHNjYWxlZEMgPSBzY2FsZShjdXJyZW50W3BdLmFzc2lnbiwgdGhpcy5yYW5nZXNbcF1bMF0sIHRoaXMucmFuZ2VzW3BdWzFdIC0gdGhpcy5yYW5nZXNbcF1bMF0pO1xyXG4gICAgICAgICAgICAgICAgbGV0IGRpZmYgPSBzY2FsZWRCIC0gc2NhbGVkQztcclxuICAgICAgICAgICAgICAgIGlmIChkaWZmID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NhbGVkQyArPSB0aGlzLnJuZy5ub3JtYWwoMCwgMWUtOCkgKiB0aGlzLm11dGF0ZVJhdGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBzY2FsZWRDICs9IGRpZmYgKiB0aGlzLm11dGF0ZVJhdGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvL2NsYW1wIHRvIHVuaWZvcm0gbWluIGFuZCBtYXguXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50W3BdLmFzc2lnbiA9IHNjYWxlSW52KE1hdGgubWF4KHRoaXMucmFuZ2VzW3BdWzBdLCBNYXRoLm1pbihzY2FsZWRDLCB0aGlzLnJhbmdlc1twXVsxXSkpLCB0aGlzLnJhbmdlc1twXVswXSwgdGhpcy5yYW5nZXNbcF1bMV0gLSB0aGlzLnJhbmdlc1twXVswXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBtYXRlKHBhcmVudHMpIHtcclxuICAgICAgICBsZXQgbnVtUGFyYW1zID0gdGhpcy5wb3B1bGF0aW9uWzBdLnBhcmFtcy5sZW5ndGg7XHJcbiAgICAgICAgbGV0IG51bUNoaWxkcmVuID0gTWF0aC5tYXgoTWF0aC5taW4oMTAsIE1hdGgubWF4KDIsIE1hdGguZmxvb3IodGhpcy5wb3B1bGF0aW9uLmxlbmd0aCAqIDAuMzMzKSkpKTtcclxuICAgICAgICBsZXQgY2hpbGRyZW4gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bUNoaWxkcmVuOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGNoaWxkID0geyBwYXJhbXM6IFtdLCBzY29yZTogMCB9O1xyXG4gICAgICAgICAgICBsZXQgcDEgPSBNYXRoLmZsb29yKHRoaXMucm5nLnJhbmRvbSgpICogcGFyZW50cyk7XHJcbiAgICAgICAgICAgIGxldCBwMiA9IE1hdGguZmxvb3IodGhpcy5ybmcucmFuZG9tKCkgKiBwYXJlbnRzKTtcclxuICAgICAgICAgICAgaWYgKHAxID09PSBwMikge1xyXG4gICAgICAgICAgICAgICAgcDIgPSBwMiA9PT0gMCA/IHBhcmVudHMgLSAxIDogcDIgLSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBzcGxpdCA9IE1hdGguZmxvb3IodGhpcy5ybmcucmFuZG9tKCkgKiBudW1QYXJhbXMpO1xyXG4gICAgICAgICAgICBjaGlsZC5wYXJhbXMgPSBbXS5jb25jYXQodGhpcy5wb3B1bGF0aW9uW3AxXS5wYXJhbXMuc2xpY2UoMCwgc3BsaXQpLCB0aGlzLnBvcHVsYXRpb25bcDJdLnBhcmFtcy5zbGljZShzcGxpdCwgbnVtUGFyYW1zKSk7XHJcbiAgICAgICAgICAgIGNoaWxkcmVuLnB1c2goY2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2hpbGRyZW47XHJcbiAgICB9XHJcbiAgICBkc2NTb3J0KGEsIGIpIHtcclxuICAgICAgICBpZiAoYS5zY29yZSA+IGIuc2NvcmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChhLnNjb3JlIDwgYi5zY29yZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICBhc2NTb3J0KGEsIGIpIHtcclxuICAgICAgICBpZiAoYS5zY29yZSA+IGIuc2NvcmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGEuc2NvcmUgPCBiLnNjb3JlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZXZvbHZlLmpzLm1hcCIsImltcG9ydCB7IFFDb21wb25lbnQgfSBmcm9tICcuL1FDb21wb25lbnQnO1xyXG5pbXBvcnQgeyBTVUNDRVNTIH0gZnJvbSAnLi91dGlscyc7XHJcbmV4cG9ydCBjbGFzcyBIeWJyaWRBdXRvbWF0YSBleHRlbmRzIFFDb21wb25lbnQge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgZGF0YSwgZmxvd1NldCwgZmxvd01hcCwganVtcFNldCwganVtcE1hcCkge1xyXG4gICAgICAgIHN1cGVyKG5hbWUpO1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgdGhpcy5mbG93U2V0ID0gZmxvd1NldDtcclxuICAgICAgICB0aGlzLmZsb3dNYXAgPSBmbG93TWFwO1xyXG4gICAgICAgIHRoaXMuanVtcFNldCA9IGp1bXBTZXQ7XHJcbiAgICAgICAgdGhpcy5qdW1wTWFwID0ganVtcE1hcDtcclxuICAgIH1cclxuICAgIHVwZGF0ZShhZ2VudCwgc3RlcCkge1xyXG4gICAgICAgIGxldCB0ZW1wID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShhZ2VudCkpO1xyXG4gICAgICAgIGZvciAodmFyIG1vZGUgaW4gdGhpcy5qdW1wU2V0KSB7XHJcbiAgICAgICAgICAgIGxldCBlZGdlID0gdGhpcy5qdW1wU2V0W21vZGVdO1xyXG4gICAgICAgICAgICBsZXQgZWRnZVN0YXRlID0gZWRnZS5jaGVjayhhZ2VudFtlZGdlLmtleV0sIGVkZ2UudmFsdWUpO1xyXG4gICAgICAgICAgICBpZiAoZWRnZVN0YXRlID09PSBTVUNDRVNTICYmIG1vZGUgIT0gYWdlbnQuY3VycmVudE1vZGUpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWdlbnRbZWRnZS5rZXldID0gdGhpcy5qdW1wTWFwW2VkZ2Uua2V5XVthZ2VudC5jdXJyZW50TW9kZV1bbW9kZV0oYWdlbnRbZWRnZS5rZXldKTtcclxuICAgICAgICAgICAgICAgICAgICBhZ2VudC5jdXJyZW50TW9kZSA9IG1vZGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXRjaCAoRXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9ubyB0cmFuc2l0aW9uIHRoaXMgZGlyZWN0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coRXJyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5mbG93TWFwKSB7XHJcbiAgICAgICAgICAgICAgICAvL3NlY29uZCBvcmRlciBpbnRlZ3JhdGlvblxyXG4gICAgICAgICAgICAgICAgbGV0IHRlbXBEID0gdGhpcy5mbG93TWFwW2tleV1bYWdlbnQuY3VycmVudE1vZGVdKGFnZW50W2tleV0pO1xyXG4gICAgICAgICAgICAgICAgdGVtcFtrZXldID0gYWdlbnRba2V5XSArIHRlbXBEO1xyXG4gICAgICAgICAgICAgICAgYWdlbnRba2V5XSArPSAwLjUgKiAodGVtcEQgKyB0aGlzLmZsb3dNYXBba2V5XVthZ2VudC5jdXJyZW50TW9kZV0odGVtcFtrZXldKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aGEuanMubWFwIiwiaW1wb3J0IHsgUUNvbXBvbmVudCB9IGZyb20gJy4vUUNvbXBvbmVudCc7XHJcbmltcG9ydCB7IGdlbmVyYXRlVVVJRCB9IGZyb20gJy4vdXRpbHMnO1xyXG4vL0hpZXJhcmNoYWwgVGFzayBOZXR3b3JrXHJcbmV4cG9ydCBjbGFzcyBIVE5QbGFubmVyIGV4dGVuZHMgUUNvbXBvbmVudCB7XHJcbiAgICBzdGF0aWMgdGljayhub2RlLCB0YXNrLCBhZ2VudCkge1xyXG4gICAgICAgIGlmIChhZ2VudC5ydW5uaW5nTGlzdCkge1xyXG4gICAgICAgICAgICBhZ2VudC5ydW5uaW5nTGlzdC5wdXNoKG5vZGUubmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBhZ2VudC5ydW5uaW5nTGlzdCA9IFtub2RlLm5hbWVdO1xyXG4gICAgICAgICAgICBhZ2VudC5zdWNjZXNzTGlzdCA9IFtdO1xyXG4gICAgICAgICAgICBhZ2VudC5iYXJyaWVyTGlzdCA9IFtdO1xyXG4gICAgICAgICAgICBhZ2VudC5ibGFja2JvYXJkID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBzdGF0ZSA9IG5vZGUudmlzaXQoYWdlbnQsIHRhc2spO1xyXG4gICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH1cclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHJvb3QsIHRhc2ssIGRhdGEpIHtcclxuICAgICAgICBzdXBlcihuYW1lKTtcclxuICAgICAgICB0aGlzLnJvb3QgPSByb290O1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgdGhpcy5zdW1tYXJ5ID0gW107XHJcbiAgICAgICAgdGhpcy5yZXN1bHRzID0gW107XHJcbiAgICAgICAgdGhpcy50YXNrID0gdGFzaztcclxuICAgIH1cclxuICAgIHVwZGF0ZShhZ2VudCwgc3RlcCkge1xyXG4gICAgICAgIC8vaXRlcmF0ZSBhbiBhZ2VudChkYXRhKSB0aHJvdWdoIHRoZSB0YXNrIG5ldHdvcmtcclxuICAgICAgICBhZ2VudC5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIEhUTlBsYW5uZXIudGljayh0aGlzLnJvb3QsIHRoaXMudGFzaywgYWdlbnQpO1xyXG4gICAgICAgIGlmIChhZ2VudC5zdWNjZXNzTGlzdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGFnZW50LnN1Y2NlZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgYWdlbnQuc3VjY2VlZCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBhZ2VudC5hY3RpdmUgPSBmYWxzZTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgSFROUm9vdFRhc2sge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgZ29hbHMpIHtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMuZ29hbHMgPSBnb2FscztcclxuICAgIH1cclxuICAgIGV2YWx1YXRlR29hbChhZ2VudCkge1xyXG4gICAgICAgIHZhciByZXN1bHQsIGc7XHJcbiAgICAgICAgZm9yICh2YXIgcCA9IDA7IHAgPCB0aGlzLmdvYWxzLmxlbmd0aDsgcCsrKSB7XHJcbiAgICAgICAgICAgIGcgPSB0aGlzLmdvYWxzW3BdO1xyXG4gICAgICAgICAgICBpZiAoZy5kYXRhKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBnLmNoZWNrKGcuZGF0YVtnLmtleV0sIGcudmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZy5jaGVjayhhZ2VudFtnLmtleV0sIGcudmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBIVE5Ob2RlIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHByZWNvbmRpdGlvbnMpIHtcclxuICAgICAgICB0aGlzLmlkID0gZ2VuZXJhdGVVVUlEKCk7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgICB0aGlzLnByZWNvbmRpdGlvbnMgPSBwcmVjb25kaXRpb25zO1xyXG4gICAgfVxyXG4gICAgZXZhbHVhdGVQcmVDb25kcyhhZ2VudCkge1xyXG4gICAgICAgIHZhciByZXN1bHQ7XHJcbiAgICAgICAgaWYgKHRoaXMucHJlY29uZGl0aW9ucyBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIHAgPSAwOyBwIDwgdGhpcy5wcmVjb25kaXRpb25zLmxlbmd0aDsgcCsrKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0aGlzLnByZWNvbmRpdGlvbnNbcF0uY2hlY2soYWdlbnRbdGhpcy5wcmVjb25kaXRpb25zW3BdLmtleV0sIHRoaXMucHJlY29uZGl0aW9uc1twXS52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ID09PSBIVE5QbGFubmVyLkZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBIVE5QbGFubmVyLkZBSUxFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gSFROUGxhbm5lci5TVUNDRVNTO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBIVE5PcGVyYXRvciBleHRlbmRzIEhUTk5vZGUge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgcHJlY29uZGl0aW9ucywgZWZmZWN0cykge1xyXG4gICAgICAgIHN1cGVyKG5hbWUsIHByZWNvbmRpdGlvbnMpO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IFwib3BlcmF0b3JcIjtcclxuICAgICAgICB0aGlzLmVmZmVjdHMgPSBlZmZlY3RzO1xyXG4gICAgICAgIHRoaXMudmlzaXQgPSBmdW5jdGlvbiAoYWdlbnQsIHRhc2spIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZXZhbHVhdGVQcmVDb25kcyhhZ2VudCkgPT09IEhUTlBsYW5uZXIuU1VDQ0VTUykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVmZmVjdHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVmZmVjdHNbaV0oYWdlbnQuYmxhY2tib2FyZFswXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGFzay5ldmFsdWF0ZUdvYWwoYWdlbnQuYmxhY2tib2FyZFswXSkgPT09IEhUTlBsYW5uZXIuU1VDQ0VTUykge1xyXG4gICAgICAgICAgICAgICAgICAgIGFnZW50LnN1Y2Nlc3NMaXN0LnVuc2hpZnQodGhpcy5uYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSFROUGxhbm5lci5TVUNDRVNTO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEhUTlBsYW5uZXIuUlVOTklORztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGFnZW50LmJhcnJpZXJMaXN0LnVuc2hpZnQoeyBuYW1lOiB0aGlzLm5hbWUsIGNvbmRpdGlvbnM6IHRoaXMucHJlY29uZGl0aW9ucyB9KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBIVE5QbGFubmVyLkZBSUxFRDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIEhUTk1ldGhvZCBleHRlbmRzIEhUTk5vZGUge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgcHJlY29uZGl0aW9ucywgY2hpbGRyZW4pIHtcclxuICAgICAgICBzdXBlcihuYW1lLCBwcmVjb25kaXRpb25zKTtcclxuICAgICAgICB0aGlzLnR5cGUgPSBcIm1ldGhvZFwiO1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcclxuICAgICAgICB0aGlzLnZpc2l0ID0gZnVuY3Rpb24gKGFnZW50LCB0YXNrKSB7XHJcbiAgICAgICAgICAgIHZhciBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShhZ2VudCkpO1xyXG4gICAgICAgICAgICBkZWxldGUgY29weS5ibGFja2JvYXJkO1xyXG4gICAgICAgICAgICBhZ2VudC5ibGFja2JvYXJkLnVuc2hpZnQoY29weSk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmV2YWx1YXRlUHJlQ29uZHMoYWdlbnQpID09PSBIVE5QbGFubmVyLlNVQ0NFU1MpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0ZSA9IEhUTlBsYW5uZXIudGljayh0aGlzLmNoaWxkcmVuW2ldLCB0YXNrLCBhZ2VudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXRlID09PSBIVE5QbGFubmVyLlNVQ0NFU1MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWdlbnQuc3VjY2Vzc0xpc3QudW5zaGlmdCh0aGlzLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gSFROUGxhbm5lci5TVUNDRVNTO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGFnZW50LmJhcnJpZXJMaXN0LnVuc2hpZnQoeyBuYW1lOiB0aGlzLm5hbWUsIGNvbmRpdGlvbnM6IHRoaXMucHJlY29uZGl0aW9ucyB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gSFROUGxhbm5lci5GQUlMRUQ7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1odG4uanMubWFwIiwiaW1wb3J0IHsgUUNvbXBvbmVudCB9IGZyb20gJy4vUUNvbXBvbmVudCc7XHJcbmV4cG9ydCBjbGFzcyBNSFNhbXBsZXIgZXh0ZW5kcyBRQ29tcG9uZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHJuZywgZGF0YSwgdGFyZ2V0LCBzYXZlID0gdHJ1ZSkge1xyXG4gICAgICAgIHN1cGVyKG5hbWUpO1xyXG4gICAgICAgIHRoaXMua2VwdCA9IDA7XHJcbiAgICAgICAgdGhpcy50aW1lID0gMDtcclxuICAgICAgICB0aGlzLnJuZyA9IHJuZztcclxuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xyXG4gICAgICAgIHRoaXMuY2hhaW4gPSBbXTtcclxuICAgICAgICB0aGlzLnNhdmUgPSBzYXZlO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xyXG4gICAgfVxyXG4gICAgdXBkYXRlKGFnZW50LCBzdGVwKSB7XHJcbiAgICAgICAgbGV0IG5ld1Byb2IgPSAwO1xyXG4gICAgICAgIGFnZW50LnkgPSBhZ2VudC5wcm9wb3NhbChhZ2VudCwgc3RlcCwgdGhpcy5ybmcpO1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy50YXJnZXQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LmZvckVhY2goKGQpID0+IHtcclxuICAgICAgICAgICAgICAgIG5ld1Byb2IgKz0gYWdlbnQubG5Qcm9iRihhZ2VudCwgc3RlcCwgZCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBuZXdQcm9iICo9IDEgLyB0aGlzLnRhcmdldC5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBuZXdQcm9iID0gYWdlbnQubG5Qcm9iRihhZ2VudCwgc3RlcCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBkaWZmID0gbmV3UHJvYiAtIGFnZW50LmxuUHJvYjtcclxuICAgICAgICBsZXQgdSA9IHRoaXMucm5nLnJhbmRvbSgpO1xyXG4gICAgICAgIGlmIChNYXRoLmxvZyh1KSA8PSBkaWZmIHx8IGRpZmYgPj0gMCkge1xyXG4gICAgICAgICAgICBhZ2VudC5sblByb2IgPSBuZXdQcm9iO1xyXG4gICAgICAgICAgICBhZ2VudC54ID0gYWdlbnQueTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMua2VwdCArPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5zYXZlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hhaW4ucHVzaCh7IGlkOiBhZ2VudC5pZCwgdGltZTogYWdlbnQudGltZSwgeDogYWdlbnQueCB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWMuanMubWFwIiwiZXhwb3J0IGNsYXNzIGtNZWFuIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEsIHByb3BzLCBrKSB7XHJcbiAgICAgICAgdGhpcy5jZW50cm9pZHMgPSBbXTtcclxuICAgICAgICB0aGlzLmxpbWl0cyA9IHt9O1xyXG4gICAgICAgIHRoaXMuaXRlcmF0aW9ucyA9IDA7XHJcbiAgICAgICAgLy9jcmVhdGUgYSBsaW1pdHMgb2JqIGZvciBlYWNoIHByb3BcclxuICAgICAgICBwcm9wcy5mb3JFYWNoKHAgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmxpbWl0c1twXSA9IHtcclxuICAgICAgICAgICAgICAgIG1pbjogMWUxNSxcclxuICAgICAgICAgICAgICAgIG1heDogLTFlMTVcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvL3NldCBsaW1pdHMgZm9yIGVhY2ggcHJvcFxyXG4gICAgICAgIGRhdGEuZm9yRWFjaChkID0+IHtcclxuICAgICAgICAgICAgcHJvcHMuZm9yRWFjaChwID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChkW3BdID4gdGhpcy5saW1pdHNbcF0ubWF4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5saW1pdHNbcF0ubWF4ID0gZFtwXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChkW3BdIDwgdGhpcy5saW1pdHNbcF0ubWluKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5saW1pdHNbcF0ubWluID0gZFtwXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy9jcmVhdGUgayByYW5kb20gcG9pbnRzXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5jZW50cm9pZHNbaV0gPSB7IGNvdW50OiAwIH07XHJcbiAgICAgICAgICAgIHByb3BzLmZvckVhY2gocCA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2VudHJvaWQgPSBNYXRoLnJhbmRvbSgpICogdGhpcy5saW1pdHNbcF0ubWF4ICsgdGhpcy5saW1pdHNbcF0ubWluO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jZW50cm9pZHNbaV1bcF0gPSBjZW50cm9pZDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgdGhpcy5wcm9wcyA9IHByb3BzO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIHRoaXMuX2Fzc2lnbkNlbnRyb2lkKCk7XHJcbiAgICAgICAgdGhpcy5fbW92ZUNlbnRyb2lkKCk7XHJcbiAgICB9XHJcbiAgICBydW4oKSB7XHJcbiAgICAgICAgbGV0IGZpbmlzaGVkID0gZmFsc2U7XHJcbiAgICAgICAgd2hpbGUgKCFmaW5pc2hlZCkge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmNlbnRyb2lkcy5mb3JFYWNoKGMgPT4ge1xyXG4gICAgICAgICAgICAgICAgZmluaXNoZWQgPSBjLmZpbmlzaGVkO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5pdGVyYXRpb25zKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBbdGhpcy5jZW50cm9pZHMsIHRoaXMuZGF0YV07XHJcbiAgICB9XHJcbiAgICBfYXNzaWduQ2VudHJvaWQoKSB7XHJcbiAgICAgICAgdGhpcy5kYXRhLmZvckVhY2goKGQsIGopID0+IHtcclxuICAgICAgICAgICAgbGV0IGRpc3RhbmNlcyA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgdG90YWxEaXN0ID0gW107XHJcbiAgICAgICAgICAgIGxldCBtaW5EaXN0O1xyXG4gICAgICAgICAgICBsZXQgbWluSW5kZXg7XHJcbiAgICAgICAgICAgIC8vZm9yZWFjaCBwb2ludCwgZ2V0IHRoZSBwZXIgcHJvcCBkaXN0YW5jZSBmcm9tIGVhY2ggY2VudHJvaWRcclxuICAgICAgICAgICAgdGhpcy5jZW50cm9pZHMuZm9yRWFjaCgoYywgaSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZGlzdGFuY2VzW2ldID0ge307XHJcbiAgICAgICAgICAgICAgICB0b3RhbERpc3RbaV0gPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5mb3JFYWNoKHAgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlc1tpXVtwXSA9IE1hdGguc3FydCgoZFtwXSAtIGNbcF0pICogKGRbcF0gLSBjW3BdKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdG90YWxEaXN0W2ldICs9IGRpc3RhbmNlc1tpXVtwXTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdG90YWxEaXN0W2ldID0gTWF0aC5zcXJ0KHRvdGFsRGlzdFtpXSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBtaW5EaXN0ID0gTWF0aC5taW4uYXBwbHkobnVsbCwgdG90YWxEaXN0KTtcclxuICAgICAgICAgICAgbWluSW5kZXggPSB0b3RhbERpc3QuaW5kZXhPZihtaW5EaXN0KTtcclxuICAgICAgICAgICAgZC5jZW50cm9pZCA9IG1pbkluZGV4O1xyXG4gICAgICAgICAgICBkLmRpc3RhbmNlcyA9IGRpc3RhbmNlcztcclxuICAgICAgICAgICAgdGhpcy5jZW50cm9pZHNbbWluSW5kZXhdLmNvdW50ICs9IDE7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBfbW92ZUNlbnRyb2lkKCkge1xyXG4gICAgICAgIHRoaXMuY2VudHJvaWRzLmZvckVhY2goKGMsIGkpID0+IHtcclxuICAgICAgICAgICAgbGV0IGRpc3RGcm9tQ2VudHJvaWQgPSB7fTtcclxuICAgICAgICAgICAgdGhpcy5wcm9wcy5mb3JFYWNoKHAgPT4gZGlzdEZyb21DZW50cm9pZFtwXSA9IFtdKTtcclxuICAgICAgICAgICAgLy9nZXQgdGhlIHBlciBwcm9wIGRpc3RhbmNlcyBmcm9tIHRoZSBjZW50cm9pZCBhbW9uZyBpdHMnIGFzc2lnbmVkIHBvaW50c1xyXG4gICAgICAgICAgICB0aGlzLmRhdGEuZm9yRWFjaChkID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChkLmNlbnRyb2lkID09PSBpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5mb3JFYWNoKHAgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXN0RnJvbUNlbnRyb2lkW3BdLnB1c2goZFtwXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvL2hhbmRsZSBjZW50cm9pZCB3aXRoIG5vIGFzc2lnbmVkIHBvaW50cyAocmFuZG9tbHkgYXNzaWduIG5ldyk7XHJcbiAgICAgICAgICAgIGlmIChjLmNvdW50ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmZvckVhY2gocCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzdEZyb21DZW50cm9pZFtwXSA9IFtNYXRoLnJhbmRvbSgpICogdGhpcy5saW1pdHNbcF0ubWF4ICsgdGhpcy5saW1pdHNbcF0ubWluXTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vZ2V0IHRoZSBzdW0gYW5kIG1lYW4gcGVyIHByb3BlcnR5IG9mIHRoZSBhc3NpZ25lZCBwb2ludHNcclxuICAgICAgICAgICAgdGhpcy5wcm9wcy5mb3JFYWNoKHAgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHN1bSA9IGRpc3RGcm9tQ2VudHJvaWRbcF0ucmVkdWNlKChwcmV2LCBuZXh0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZXYgKyBuZXh0O1xyXG4gICAgICAgICAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgbWVhbiA9IHN1bSAvIGRpc3RGcm9tQ2VudHJvaWRbcF0ubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhpLCAnXFwncyBhdmVyYWdlIGRpc3Qgd2FzJywgbWVhbiwgJyB0aGUgY3VycmVudCBwb3Mgd2FzICcsIGNbcF0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNbcF0gIT09IG1lYW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBjW3BdID0gbWVhbjtcclxuICAgICAgICAgICAgICAgICAgICBjLmZpbmlzaGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgYy5jb3VudCA9IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjLmZpbmlzaGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9a21lYW4uanMubWFwIiwiZXhwb3J0IGNsYXNzIEtOTiB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCB0cmFpbmVkRGF0YSwga1BhcmFtcywgY2xhc3NpZmllciwgbmVhcmVzdE4pIHtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMudHJhaW5lZERhdGEgPSB0cmFpbmVkRGF0YTtcclxuICAgICAgICB0aGlzLmtQYXJhbXMgPSBrUGFyYW1zO1xyXG4gICAgICAgIHRoaXMuY2xhc3NpZmllciA9IGNsYXNzaWZpZXI7XHJcbiAgICAgICAgdGhpcy5uZWFyZXN0TiA9IG5lYXJlc3ROO1xyXG4gICAgfVxyXG4gICAgc2V0TmVpZ2hib3JzKHBvaW50LCBkYXRhLCBwYXJhbSwgY2xhc3NpZmllcikge1xyXG4gICAgICAgIGRhdGEuZm9yRWFjaCgoZCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZC5pZCAhPT0gcG9pbnQuaWQpIHtcclxuICAgICAgICAgICAgICAgIHBvaW50Lm5laWdoYm9yc1tkLmlkXSA9IHBvaW50Lm5laWdoYm9yc1tkLmlkXSB8fCB7fTtcclxuICAgICAgICAgICAgICAgIHBvaW50Lm5laWdoYm9yc1tkLmlkXVtjbGFzc2lmaWVyXSA9IGRbY2xhc3NpZmllcl07XHJcbiAgICAgICAgICAgICAgICBwb2ludC5uZWlnaGJvcnNbZC5pZF1bcGFyYW0ucGFyYW1dID0gTWF0aC5hYnMocG9pbnRbcGFyYW0ucGFyYW1dIC0gZFtwYXJhbS5wYXJhbV0pIC8gcGFyYW0ucmFuZ2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHNvcnQobmVpZ2hib3JzLCBwYXJhbSkge1xyXG4gICAgICAgIHZhciBsaXN0ID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgbmVpZ2ggaW4gbmVpZ2hib3JzKSB7XHJcbiAgICAgICAgICAgIGxpc3QucHVzaChuZWlnaGJvcnNbbmVpZ2hdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGlzdC5zb3J0KChhLCBiKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChhW3BhcmFtXSA+PSBiW3BhcmFtXSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGJbcGFyYW1dID49IGFbcGFyYW1dKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGxpc3Q7XHJcbiAgICB9XHJcbiAgICBzZXREaXN0YW5jZXMoZGF0YSwgdHJhaW5lZCwga1BhcmFtc09iaiwgY2xhc3NpZmllcikge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBkYXRhW2ldLm5laWdoYm9ycyA9IHt9O1xyXG4gICAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IGtQYXJhbXNPYmoubGVuZ3RoOyBrKyspIHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZGF0YVtpXVtrUGFyYW1zT2JqW2tdLnBhcmFtXSA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldE5laWdoYm9ycyhkYXRhW2ldLCB0cmFpbmVkLCBrUGFyYW1zT2JqW2tdLCBjbGFzc2lmaWVyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKHZhciBuIGluIGRhdGFbaV0ubmVpZ2hib3JzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmVpZ2hib3IgPSBkYXRhW2ldLm5laWdoYm9yc1tuXTtcclxuICAgICAgICAgICAgICAgIHZhciBkaXN0ID0gMDtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIHAgPSAwOyBwIDwga1BhcmFtc09iai5sZW5ndGg7IHArKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3QgKz0gbmVpZ2hib3Jba1BhcmFtc09ialtwXS5wYXJhbV0gKiBuZWlnaGJvcltrUGFyYW1zT2JqW3BdLnBhcmFtXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG5laWdoYm9yLmRpc3RhbmNlID0gTWF0aC5zcXJ0KGRpc3QpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgfVxyXG4gICAgZ2V0UmFuZ2UoZGF0YSwga1BhcmFtcykge1xyXG4gICAgICAgIGxldCByYW5nZXMgPSBbXSwgbWluID0gMWUyMCwgbWF4ID0gMDtcclxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGtQYXJhbXMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgZCA9IDA7IGQgPCBkYXRhLmxlbmd0aDsgZCsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YVtkXVtrUGFyYW1zW2pdXSA8IG1pbikge1xyXG4gICAgICAgICAgICAgICAgICAgIG1pbiA9IGRhdGFbZF1ba1BhcmFtc1tqXV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YVtkXVtrUGFyYW1zW2pdXSA+IG1heCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1heCA9IGRhdGFbZF1ba1BhcmFtc1tqXV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmFuZ2VzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgcGFyYW06IGtQYXJhbXNbal0sXHJcbiAgICAgICAgICAgICAgICBtaW46IG1pbixcclxuICAgICAgICAgICAgICAgIG1heDogbWF4LFxyXG4gICAgICAgICAgICAgICAgcmFuZ2U6IG1heCAtIG1pblxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgO1xyXG4gICAgICAgIHJldHVybiByYW5nZXM7XHJcbiAgICB9XHJcbiAgICBjbGFzc2lmeShkYXRhLCB0cmFpbmVkRGF0YSwga1BhcmFtcywgY2xhc3NpZmllciwgbmVhcmVzdE4pIHtcclxuICAgICAgICBsZXQga1BhcmFtc09iaiA9IHRoaXMuZ2V0UmFuZ2UoW10uY29uY2F0KGRhdGEsIHRyYWluZWREYXRhKSwga1BhcmFtcyk7XHJcbiAgICAgICAgZGF0YSA9IHRoaXMuc2V0RGlzdGFuY2VzKGRhdGEsIHRyYWluZWREYXRhLCBrUGFyYW1zT2JqLCBjbGFzc2lmaWVyKTtcclxuICAgICAgICBmb3IgKGxldCBkID0gMDsgZCA8IGRhdGEubGVuZ3RoOyBkKyspIHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdHMgPSB7fTtcclxuICAgICAgICAgICAgbGV0IG4gPSAwO1xyXG4gICAgICAgICAgICBsZXQgbWF4ID0gMDtcclxuICAgICAgICAgICAgbGV0IGxpa2VsaWVzdCA9ICcnO1xyXG4gICAgICAgICAgICBsZXQgb3JkZXJlZCA9IHRoaXMuc29ydChkYXRhW2RdLm5laWdoYm9ycywgJ2Rpc3RhbmNlJyk7XHJcbiAgICAgICAgICAgIHdoaWxlIChuIDwgbmVhcmVzdE4pIHtcclxuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50ID0gb3JkZXJlZFtuXVtjbGFzc2lmaWVyXTtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHNbY3VycmVudF0gPSByZXN1bHRzW2N1cnJlbnRdIHx8IDA7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzW2N1cnJlbnRdICs9IDE7XHJcbiAgICAgICAgICAgICAgICBuKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChsZXQgcGFyYW0gaW4gcmVzdWx0cykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdHNbcGFyYW1dID4gbWF4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gcmVzdWx0c1twYXJhbV07XHJcbiAgICAgICAgICAgICAgICAgICAgbGlrZWxpZXN0ID0gcGFyYW07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGF0YVtkXVtjbGFzc2lmaWVyXSA9IGxpa2VsaWVzdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9a25uLmpzLm1hcCIsImV4cG9ydCBjbGFzcyBWZWN0b3Ige1xyXG4gICAgY29uc3RydWN0b3IoYXJyYXksIHNpemUpIHtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgTWF0cml4IHtcclxuICAgIGNvbnN0cnVjdG9yKG1hdCkge1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBhY3RpdmF0aW9uTWV0aG9kcyB7XHJcbiAgICBzdGF0aWMgUmVMVSh4KSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KHgsIDApO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIHNpZ21vaWQoeCkge1xyXG4gICAgICAgIHJldHVybiAxIC8gKDEgKyBNYXRoLmV4cCgteCkpO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIHRhbmgoeCkge1xyXG4gICAgICAgIGxldCB2YWwgPSAoTWF0aC5leHAoeCkgLSBNYXRoLmV4cCgteCkpIC8gKE1hdGguZXhwKHgpICsgTWF0aC5leHAoLXgpKTtcclxuICAgICAgICByZXR1cm4gdmFsO1xyXG4gICAgfVxyXG59XHJcbjtcclxuZXhwb3J0IGNsYXNzIGRlcml2aXRlTWV0aG9kcyB7XHJcbiAgICBzdGF0aWMgUmVMVSh2YWx1ZSkge1xyXG4gICAgICAgIGxldCBkZXIgPSB2YWx1ZSA8PSAwID8gMCA6IDE7XHJcbiAgICAgICAgcmV0dXJuIGRlcjtcclxuICAgIH1cclxuICAgIHN0YXRpYyBzaWdtb2lkKHZhbHVlKSB7XHJcbiAgICAgICAgbGV0IHNpZyA9IGFjdGl2YXRpb25NZXRob2RzLnNpZ21vaWQ7XHJcbiAgICAgICAgcmV0dXJuIHNpZyh2YWx1ZSkgKiAoMSAtIHNpZyh2YWx1ZSkpO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIHRhbmgodmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gMSAtIE1hdGgucG93KGFjdGl2YXRpb25NZXRob2RzLnRhbmgodmFsdWUpLCAyKTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gbG9naXN0aWMoeCwgbSwgYiwgaykge1xyXG4gICAgdmFyIHkgPSAxIC8gKG0gKyBNYXRoLmV4cCgtayAqICh4IC0gYikpKTtcclxuICAgIHJldHVybiB5O1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBsb2dpdCh4LCBtLCBiLCBrKSB7XHJcbiAgICB2YXIgeSA9IDEgLyBNYXRoLmxvZyh4IC8gKDEgLSB4KSk7XHJcbiAgICByZXR1cm4geTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gbGluZWFyKHgsIG0sIGIsIGspIHtcclxuICAgIHZhciB5ID0gbSAqIHggKyBiO1xyXG4gICAgcmV0dXJuIHk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGV4cG9uZW50aWFsKHgsIG0sIGIsIGspIHtcclxuICAgIHZhciB5ID0gMSAtIE1hdGgucG93KHgsIGspIC8gTWF0aC5wb3coMSwgayk7XHJcbiAgICByZXR1cm4geTtcclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXRoLmpzLm1hcCIsImV4cG9ydCBjbGFzcyBOZXR3b3JrIHtcclxuICAgIGNvbnN0cnVjdG9yKGRhdGEsIGxhYmVscywgaGlkZGVuTnVtLCBhY3RpdmF0aW9uVHlwZSA9IFwidGFuaFwiKSB7XHJcbiAgICAgICAgdGhpcy5pdGVyID0gMDtcclxuICAgICAgICB0aGlzLmNvcnJlY3QgPSAwO1xyXG4gICAgICAgIHRoaXMuaGlkZGVuTnVtID0gaGlkZGVuTnVtO1xyXG4gICAgICAgIHRoaXMubGVhcm5SYXRlID0gMC4wMTtcclxuICAgICAgICB0aGlzLmFjdEZuID0gTmV0d29yay5hY3RpdmF0aW9uTWV0aG9kc1thY3RpdmF0aW9uVHlwZV07XHJcbiAgICAgICAgdGhpcy5kZXJGbiA9IE5ldHdvcmsuZGVyaXZhdGl2ZU1ldGhvZHNbYWN0aXZhdGlvblR5cGVdO1xyXG4gICAgICAgIHRoaXMuaW5pdChkYXRhLCBsYWJlbHMpO1xyXG4gICAgfVxyXG4gICAgbGVhcm4oaXRlcmF0aW9ucywgZGF0YSwgbGFiZWxzKSB7XHJcbiAgICAgICAgZGF0YSA9IGRhdGEgfHwgdGhpcy5kYXRhO1xyXG4gICAgICAgIGxhYmVscyA9IGxhYmVscyB8fCB0aGlzLmxhYmVscztcclxuICAgICAgICB0aGlzLmNvcnJlY3QgPSAwO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlcmF0aW9uczsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCByYW5kSWR4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogZGF0YS5sZW5ndGgpO1xyXG4gICAgICAgICAgICB0aGlzLml0ZXIrKztcclxuICAgICAgICAgICAgdGhpcy5mb3J3YXJkKGRhdGFbcmFuZElkeF0pO1xyXG4gICAgICAgICAgICBsZXQgbWF4ID0gLTE7XHJcbiAgICAgICAgICAgIGxldCBtYXhJZHggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aGlzLnZhbHVlcy5sZW5ndGgpO1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlc1t0aGlzLnZhbHVlcy5sZW5ndGggLSAxXS5mb3JFYWNoKCh4LCBpZHgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh4ID4gbWF4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF4SWR4ID0gaWR4O1xyXG4gICAgICAgICAgICAgICAgICAgIG1heCA9IHg7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBsZXQgZ3Vlc3NlZCA9IHRoaXMudmFsdWVzW3RoaXMudmFsdWVzLmxlbmd0aCAtIDFdW21heElkeF0gPj0gMC41ID8gMSA6IDA7XHJcbiAgICAgICAgICAgIGlmIChndWVzc2VkID09PSBsYWJlbHNbcmFuZElkeF1bbWF4SWR4XSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb3JyZWN0Kys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5hY2N1cmFjeSA9IHRoaXMuY29ycmVjdCAvIChpICsgMSk7XHJcbiAgICAgICAgICAgIHRoaXMuYmFja3dhcmQobGFiZWxzW3JhbmRJZHhdKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVXZWlnaHRzKCk7XHJcbiAgICAgICAgICAgIHRoaXMucmVzZXRUb3RhbHMoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjbGFzc2lmeShkYXRhKSB7XHJcbiAgICAgICAgdGhpcy5yZXNldFRvdGFscygpO1xyXG4gICAgICAgIHRoaXMuZm9yd2FyZChkYXRhKTtcclxuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZXNbdGhpcy52YWx1ZXMubGVuZ3RoIC0gMV07XHJcbiAgICB9XHJcbiAgICBpbml0KGRhdGEsIGxhYmVscykge1xyXG4gICAgICAgIGxldCBpbnB1dHMgPSBbXTtcclxuICAgICAgICB0aGlzLmRlciA9IFtdO1xyXG4gICAgICAgIHRoaXMudmFsdWVzID0gW107XHJcbiAgICAgICAgdGhpcy53ZWlnaHRzID0gW107XHJcbiAgICAgICAgdGhpcy53ZWlnaHRDaGFuZ2VzID0gW107XHJcbiAgICAgICAgdGhpcy50b3RhbHMgPSBbXTtcclxuICAgICAgICB0aGlzLmRlclRvdGFscyA9IFtdO1xyXG4gICAgICAgIHRoaXMuYmlhc2VzID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgbiA9IDA7IG4gPCBkYXRhWzBdLmxlbmd0aDsgbisrKSB7XHJcbiAgICAgICAgICAgIGlucHV0cy5wdXNoKDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCB0aGlzLmhpZGRlbk51bS5sZW5ndGg7IGNvbCsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVyW2NvbF0gPSBbXTtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZXNbY29sXSA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLnRvdGFsc1tjb2xdID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuZGVyVG90YWxzW2NvbF0gPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgdGhpcy5oaWRkZW5OdW1bY29sXTsgcm93KyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudmFsdWVzW2NvbF1bcm93XSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlcltjb2xdW3Jvd10gPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy50b3RhbHNbY29sXVtyb3ddID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVyVG90YWxzW2NvbF1bcm93XSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy52YWx1ZXMudW5zaGlmdChpbnB1dHMpO1xyXG4gICAgICAgIHRoaXMudG90YWxzLnVuc2hpZnQoaW5wdXRzKTtcclxuICAgICAgICB0aGlzLmRlci51bnNoaWZ0KGlucHV0cyk7XHJcbiAgICAgICAgdGhpcy5kZXJUb3RhbHMudW5zaGlmdChpbnB1dHMpO1xyXG4gICAgICAgIHRoaXMudmFsdWVzW3RoaXMuaGlkZGVuTnVtLmxlbmd0aCArIDFdID0gbGFiZWxzWzBdLm1hcCgobCkgPT4geyByZXR1cm4gMDsgfSk7XHJcbiAgICAgICAgdGhpcy50b3RhbHNbdGhpcy5oaWRkZW5OdW0ubGVuZ3RoICsgMV0gPSBsYWJlbHNbMF0ubWFwKChsKSA9PiB7IHJldHVybiAwOyB9KTtcclxuICAgICAgICB0aGlzLmRlclt0aGlzLmhpZGRlbk51bS5sZW5ndGggKyAxXSA9IGxhYmVsc1swXS5tYXAoKGwpID0+IHsgcmV0dXJuIDA7IH0pO1xyXG4gICAgICAgIHRoaXMuZGVyVG90YWxzW3RoaXMuaGlkZGVuTnVtLmxlbmd0aCArIDFdID0gbGFiZWxzWzBdLm1hcCgobCkgPT4geyByZXR1cm4gMDsgfSk7XHJcbiAgICAgICAgZm9yIChsZXQgd2cgPSAwOyB3ZyA8IHRoaXMudmFsdWVzLmxlbmd0aCAtIDE7IHdnKyspIHtcclxuICAgICAgICAgICAgdGhpcy53ZWlnaHRzW3dnXSA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLndlaWdodENoYW5nZXNbd2ddID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuYmlhc2VzW3dnXSA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBzcmMgPSAwOyBzcmMgPCB0aGlzLnZhbHVlc1t3Z10ubGVuZ3RoOyBzcmMrKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy53ZWlnaHRzW3dnXVtzcmNdID0gW107XHJcbiAgICAgICAgICAgICAgICB0aGlzLndlaWdodENoYW5nZXNbd2ddW3NyY10gPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGRzdCA9IDA7IGRzdCA8IHRoaXMudmFsdWVzW3dnICsgMV0ubGVuZ3RoOyBkc3QrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYmlhc2VzW3dnXVtkc3RdID0gTWF0aC5yYW5kb20oKSAtIDAuNTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLndlaWdodHNbd2ddW3NyY11bZHN0XSA9IE1hdGgucmFuZG9tKCkgLSAwLjU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53ZWlnaHRDaGFuZ2VzW3dnXVtzcmNdW2RzdF0gPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmVzZXRUb3RhbHMoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgdGhpcy50b3RhbHMubGVuZ3RoOyBjb2wrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCB0aGlzLnRvdGFsc1tjb2xdLmxlbmd0aDsgcm93KyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudG90YWxzW2NvbF1bcm93XSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlclRvdGFsc1tjb2xdW3Jvd10gPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZm9yd2FyZChpbnB1dCkge1xyXG4gICAgICAgIHRoaXMudmFsdWVzWzBdID0gaW5wdXQ7XHJcbiAgICAgICAgZm9yIChsZXQgd2cgPSAwOyB3ZyA8IHRoaXMud2VpZ2h0cy5sZW5ndGg7IHdnKyspIHtcclxuICAgICAgICAgICAgbGV0IHNyY1ZhbHMgPSB3ZztcclxuICAgICAgICAgICAgbGV0IGRzdFZhbHMgPSB3ZyArIDE7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHNyYyA9IDA7IHNyYyA8IHRoaXMud2VpZ2h0c1t3Z10ubGVuZ3RoOyBzcmMrKykge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZHN0ID0gMDsgZHN0IDwgdGhpcy53ZWlnaHRzW3dnXVtzcmNdLmxlbmd0aDsgZHN0KyspIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRvdGFsc1tkc3RWYWxzXVtkc3RdICs9IHRoaXMudmFsdWVzW3NyY1ZhbHNdW3NyY10gKiB0aGlzLndlaWdodHNbd2ddW3NyY11bZHN0XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnZhbHVlc1tkc3RWYWxzXSA9IHRoaXMudG90YWxzW2RzdFZhbHNdLm1hcCgodG90YWwsIGlkeCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWN0Rm4odG90YWwgKyB0aGlzLmJpYXNlc1t3Z11baWR4XSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHVwZGF0ZShpbnB1dCwgc3RlcCkge1xyXG4gICAgICAgIHRoaXMuZm9yd2FyZChpbnB1dCk7XHJcbiAgICB9XHJcbiAgICBiYWNrd2FyZChsYWJlbHMpIHtcclxuICAgICAgICBmb3IgKGxldCB3ZyA9IHRoaXMud2VpZ2h0cy5sZW5ndGggLSAxOyB3ZyA+PSAwOyB3Zy0tKSB7XHJcbiAgICAgICAgICAgIGxldCBzcmNWYWxzID0gd2c7XHJcbiAgICAgICAgICAgIGxldCBkc3RWYWxzID0gd2cgKyAxO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBzcmMgPSAwOyBzcmMgPCB0aGlzLndlaWdodHNbd2ddLmxlbmd0aDsgc3JjKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBlcnIgPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZHN0ID0gMDsgZHN0IDwgdGhpcy53ZWlnaHRzW3dnXVtzcmNdLmxlbmd0aDsgZHN0KyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAod2cgPT09IHRoaXMud2VpZ2h0cy5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVyciArPSBsYWJlbHNbZHN0XSAtIHRoaXMudmFsdWVzW2RzdFZhbHNdW2RzdF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVyW2RzdFZhbHNdW2RzdF0gPSBlcnI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnIgKz0gdGhpcy5kZXJbZHN0VmFsc11bZHN0XSAqIHRoaXMud2VpZ2h0c1t3Z11bc3JjXVtkc3RdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGVyVG90YWxzW3NyY1ZhbHNdW3NyY10gPSBlcnI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlcltzcmNWYWxzXVtzcmNdID0gZXJyICogdGhpcy5kZXJGbih0aGlzLnZhbHVlc1tzcmNWYWxzXVtzcmNdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHVwZGF0ZVdlaWdodHMoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgd2cgPSAwOyB3ZyA8IHRoaXMud2VpZ2h0cy5sZW5ndGg7IHdnKyspIHtcclxuICAgICAgICAgICAgbGV0IHNyY1ZhbHMgPSB3ZztcclxuICAgICAgICAgICAgbGV0IGRzdFZhbHMgPSB3ZyArIDE7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHNyYyA9IDA7IHNyYyA8IHRoaXMud2VpZ2h0c1t3Z10ubGVuZ3RoOyBzcmMrKykge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgZHN0ID0gMDsgZHN0IDwgdGhpcy53ZWlnaHRzW3dnXVtzcmNdLmxlbmd0aDsgZHN0KyspIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbW9tZW50dW0gPSB0aGlzLndlaWdodENoYW5nZXNbd2ddW3NyY11bZHN0XSAqIDAuMTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLndlaWdodENoYW5nZXNbd2ddW3NyY11bZHN0XSA9ICh0aGlzLnZhbHVlc1tzcmNWYWxzXVtzcmNdICogdGhpcy5kZXJbZHN0VmFsc11bZHN0XSAqIHRoaXMubGVhcm5SYXRlKSArIG1vbWVudHVtO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2VpZ2h0c1t3Z11bc3JjXVtkc3RdICs9IHRoaXMud2VpZ2h0Q2hhbmdlc1t3Z11bc3JjXVtkc3RdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuYmlhc2VzW3dnXSA9IHRoaXMuYmlhc2VzW3dnXS5tYXAoKGJpYXMsIGlkeCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubGVhcm5SYXRlICogdGhpcy5kZXJbZHN0VmFsc11baWR4XSArIGJpYXM7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIG1zZSgpIHtcclxuICAgICAgICBsZXQgZXJyID0gMDtcclxuICAgICAgICBsZXQgY291bnQgPSAwO1xyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5kZXJUb3RhbHMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgZXJyICs9IHRoaXMuZGVyVG90YWxzW2pdLnJlZHVjZSgobGFzdCwgY3VycmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY291bnQrKztcclxuICAgICAgICAgICAgICAgIHJldHVybiBsYXN0ICsgTWF0aC5wb3coY3VycmVudCwgMik7XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZXJyIC8gY291bnQ7XHJcbiAgICB9XHJcbn1cclxuTmV0d29yay5hY3RpdmF0aW9uTWV0aG9kcyA9IHtcclxuICAgIFJlTFU6IGZ1bmN0aW9uICh4KSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KHgsIDApO1xyXG4gICAgfSxcclxuICAgIFNlTFU6IGZ1bmN0aW9uICh4KSB7XHJcbiAgICAgICAgbGV0IGFscGhhID0gMS42NzMyNjMyNDIzNTQzNzcyODQ4MTcwNDI5OTE2NzE3O1xyXG4gICAgICAgIGxldCBzY2FsZSA9IDEuMDUwNzAwOTg3MzU1NDgwNDkzNDE5MzM0OTg1Mjk0NjtcclxuICAgICAgICBsZXQgc3RlcCA9IHggPj0gMCA/IHggOiAoYWxwaGEgKiBNYXRoLmV4cCh4KSAtIDEpO1xyXG4gICAgICAgIHJldHVybiBzY2FsZSAqIHg7XHJcbiAgICB9LFxyXG4gICAgc2lnbW9pZDogZnVuY3Rpb24gKHgpIHtcclxuICAgICAgICByZXR1cm4gMSAvICgxICsgTWF0aC5leHAoLXgpKTtcclxuICAgIH0sXHJcbiAgICB0YW5oOiBmdW5jdGlvbiAoeCkge1xyXG4gICAgICAgIGxldCB2YWwgPSAoTWF0aC5leHAoeCkgLSBNYXRoLmV4cCgteCkpIC8gKE1hdGguZXhwKHgpICsgTWF0aC5leHAoLXgpKTtcclxuICAgICAgICByZXR1cm4gdmFsO1xyXG4gICAgfVxyXG59O1xyXG5OZXR3b3JrLmRlcml2YXRpdmVNZXRob2RzID0ge1xyXG4gICAgUmVMVTogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgbGV0IGRlciA9IHZhbHVlIDw9IDAgPyAwIDogMTtcclxuICAgICAgICByZXR1cm4gZGVyO1xyXG4gICAgfSxcclxuICAgIFNlTFU6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIGxldCBhbHBoYSA9IDEuNjczMjYzMjQyMzU0Mzc3Mjg0ODE3MDQyOTkxNjcxNztcclxuICAgICAgICBsZXQgc2NhbGUgPSAxLjA1MDcwMDk4NzM1NTQ4MDQ5MzQxOTMzNDk4NTI5NDY7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlID49IDAgPyB2YWx1ZSA6IE5ldHdvcmsuYWN0aXZhdGlvbk1ldGhvZHMuU2VMVSh2YWx1ZSkgKyBhbHBoYTtcclxuICAgIH0sXHJcbiAgICBzaWdtb2lkOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICBsZXQgc2lnID0gTmV0d29yay5hY3RpdmF0aW9uTWV0aG9kcy5zaWdtb2lkO1xyXG4gICAgICAgIHJldHVybiBzaWcodmFsdWUpICogKDEgLSBzaWcodmFsdWUpKTtcclxuICAgIH0sXHJcbiAgICB0YW5oOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gMSAtIE1hdGgucG93KE5ldHdvcmsuYWN0aXZhdGlvbk1ldGhvZHMudGFuaCh2YWx1ZSksIDIpO1xyXG4gICAgfVxyXG59O1xyXG5OZXR3b3JrLmNvc3RNZXRob2RzID0ge1xyXG4gICAgc3FFcnI6IGZ1bmN0aW9uICh0YXJnZXQsIGd1ZXNzKSB7XHJcbiAgICAgICAgcmV0dXJuIGd1ZXNzIC0gdGFyZ2V0O1xyXG4gICAgfSxcclxuICAgIGFic0VycjogZnVuY3Rpb24gKCkge1xyXG4gICAgfVxyXG59O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1uZXR3b3JrLmpzLm1hcCIsImV4cG9ydCBjbGFzcyBRTGVhcm5lciB7XHJcbiAgICAvL1RPRE8gLSBjaGFuZ2UgZXBpc29kZSB0byB1cGRhdGVcclxuICAgIGNvbnN0cnVjdG9yKFIsIGdhbW1hLCBnb2FsKSB7XHJcbiAgICAgICAgdGhpcy5yYXdNYXggPSAxO1xyXG4gICAgICAgIHRoaXMuUiA9IFI7XHJcbiAgICAgICAgdGhpcy5nYW1tYSA9IGdhbW1hO1xyXG4gICAgICAgIHRoaXMuZ29hbCA9IGdvYWw7XHJcbiAgICAgICAgdGhpcy5RID0ge307XHJcbiAgICAgICAgZm9yICh2YXIgc3RhdGUgaW4gUikge1xyXG4gICAgICAgICAgICB0aGlzLlFbc3RhdGVdID0ge307XHJcbiAgICAgICAgICAgIGZvciAodmFyIGFjdGlvbiBpbiBSW3N0YXRlXSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5RW3N0YXRlXVthY3Rpb25dID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmdhbW1hID0gZ2FtbWE7XHJcbiAgICB9XHJcbiAgICBncm93KHN0YXRlLCBhY3Rpb25zKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhY3Rpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIC8vcmV3YXJkIGlzIGN1cnJlbnRseSB1bmtub3duXHJcbiAgICAgICAgICAgIHRoaXMuUltzdGF0ZV1bYWN0aW9uc1tpXV0gPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGV4cGxvcmUocHJvbSkge1xyXG4gICAgfVxyXG4gICAgdHJhbnNpdGlvbihzdGF0ZSwgYWN0aW9uKSB7XHJcbiAgICAgICAgLy9pcyB0aGUgc3RhdGUgdW5leGFtaW5lZFxyXG4gICAgICAgIGxldCBleGFtaW5lZCA9IHRydWU7XHJcbiAgICAgICAgbGV0IGJlc3RBY3Rpb247XHJcbiAgICAgICAgZm9yIChhY3Rpb24gaW4gdGhpcy5SW3N0YXRlXSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5SW3N0YXRlXVthY3Rpb25dID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBiZXN0QWN0aW9uID0gYWN0aW9uO1xyXG4gICAgICAgICAgICAgICAgZXhhbWluZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBiZXN0QWN0aW9uID0gdGhpcy5tYXgoYWN0aW9uKTtcclxuICAgICAgICB0aGlzLlFbc3RhdGVdW2FjdGlvbl0gPSB0aGlzLlJbc3RhdGVdW2FjdGlvbl0gKyAodGhpcy5nYW1tYSAqIHRoaXMuUVthY3Rpb25dW2Jlc3RBY3Rpb25dKTtcclxuICAgIH1cclxuICAgIG1heChzdGF0ZSkge1xyXG4gICAgICAgIHZhciBtYXggPSAwLCBtYXhBY3Rpb24gPSBudWxsO1xyXG4gICAgICAgIGZvciAodmFyIGFjdGlvbiBpbiB0aGlzLlFbc3RhdGVdKSB7XHJcbiAgICAgICAgICAgIGlmICghbWF4QWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBtYXggPSB0aGlzLlFbc3RhdGVdW2FjdGlvbl07XHJcbiAgICAgICAgICAgICAgICBtYXhBY3Rpb24gPSBhY3Rpb247XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5RW3N0YXRlXVthY3Rpb25dID09PSBtYXggJiYgKE1hdGgucmFuZG9tKCkgPiAwLjUpKSB7XHJcbiAgICAgICAgICAgICAgICBtYXggPSB0aGlzLlFbc3RhdGVdW2FjdGlvbl07XHJcbiAgICAgICAgICAgICAgICBtYXhBY3Rpb24gPSBhY3Rpb247XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5RW3N0YXRlXVthY3Rpb25dID4gbWF4KSB7XHJcbiAgICAgICAgICAgICAgICBtYXggPSB0aGlzLlFbc3RhdGVdW2FjdGlvbl07XHJcbiAgICAgICAgICAgICAgICBtYXhBY3Rpb24gPSBhY3Rpb247XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG1heEFjdGlvbjtcclxuICAgIH1cclxuICAgIHBvc3NpYmxlKHN0YXRlKSB7XHJcbiAgICAgICAgdmFyIHBvc3NpYmxlID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgYWN0aW9uIGluIHRoaXMuUltzdGF0ZV0pIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuUltzdGF0ZV1bYWN0aW9uXSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBwb3NzaWJsZS5wdXNoKGFjdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBvc3NpYmxlW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBvc3NpYmxlLmxlbmd0aCldO1xyXG4gICAgfVxyXG4gICAgZXBpc29kZShzdGF0ZSkge1xyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbihzdGF0ZSwgdGhpcy5wb3NzaWJsZShzdGF0ZSkpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLlE7XHJcbiAgICB9XHJcbiAgICBub3JtYWxpemUoKSB7XHJcbiAgICAgICAgZm9yICh2YXIgc3RhdGUgaW4gdGhpcy5RKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGFjdGlvbiBpbiB0aGlzLlFbc3RhdGVdKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5RW2FjdGlvbl1bc3RhdGVdID49IHRoaXMucmF3TWF4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yYXdNYXggPSB0aGlzLlFbYWN0aW9uXVtzdGF0ZV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yICh2YXIgc3RhdGUgaW4gdGhpcy5RKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGFjdGlvbiBpbiB0aGlzLlFbc3RhdGVdKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLlFbYWN0aW9uXVtzdGF0ZV0gPSBNYXRoLnJvdW5kKHRoaXMuUVthY3Rpb25dW3N0YXRlXSAvIHRoaXMucmF3TWF4ICogMTAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1RTGVhcm5lci5qcy5tYXAiLCJpbXBvcnQgeyBzdGFuZGFyZGl6ZWQsIGRhdGFUb01hdHJpeCB9IGZyb20gJy4vdXRpbHMnO1xyXG5leHBvcnQgZnVuY3Rpb24gb2xzKGl2cywgZHYpIHtcclxuICAgIGxldCBkYXRhID0gZGF0YVRvTWF0cml4KGl2cywgdGhpcy5zdGFuZGFyZGl6ZWQpO1xyXG4gICAgbGV0IGR2RGF0YSA9IGR2LmRhdGE7XHJcbiAgICBsZXQgbiA9IGR2RGF0YS5sZW5ndGg7XHJcbiAgICBsZXQgbWVhbnMgPSBpdnMubWFwKChhKSA9PiB7IHJldHVybiBhLm1lYW47IH0pO1xyXG4gICAgbGV0IHNkcyA9IGl2cy5tYXAoKGEpID0+IHsgcmV0dXJuIGEuc2Q7IH0pO1xyXG4gICAgbGV0IHZhcnMgPSBpdnMubWFwKChhKSA9PiB7IHJldHVybiBbYS52YXJpYW5jZV07IH0pO1xyXG4gICAgbWVhbnMudW5zaGlmdCgxKTtcclxuICAgIHNkcy51bnNoaWZ0KDEpO1xyXG4gICAgdmFycy51bnNoaWZ0KFsxXSk7XHJcbiAgICBpZiAodGhpcy5zdGFuZGFyZGl6ZWQpIHtcclxuICAgICAgICBkdkRhdGEgPSBzdGFuZGFyZGl6ZWQoZHYuZGF0YSk7XHJcbiAgICB9XHJcbiAgICBsZXQgWCA9IGRhdGE7XHJcbiAgICBsZXQgWSA9IGR2RGF0YS5tYXAoKHkpID0+IHsgcmV0dXJuIFt5XTsgfSk7XHJcbiAgICBsZXQgWHByaW1lID0galN0YXQudHJhbnNwb3NlKFgpO1xyXG4gICAgbGV0IFhwcmltZVggPSBqU3RhdC5tdWx0aXBseShYcHJpbWUsIFgpO1xyXG4gICAgbGV0IFhwcmltZVkgPSBqU3RhdC5tdWx0aXBseShYcHJpbWUsIFkpO1xyXG4gICAgLy9jb2VmZmljaWVudHNcclxuICAgIGxldCBiID0galN0YXQubXVsdGlwbHkoalN0YXQuaW52KFhwcmltZVgpLCBYcHJpbWVZKTtcclxuICAgIHRoaXMuYmV0YXMgPSBiLnJlZHVjZSgoYSwgYikgPT4geyByZXR1cm4gYS5jb25jYXQoYik7IH0pO1xyXG4gICAgLy9zdGFuZGFyZCBlcnJvciBvZiB0aGUgY29lZmZpY2llbnRzXHJcbiAgICB0aGlzLnN0RXJyQ29lZmYgPSBqU3RhdC5tdWx0aXBseShqU3RhdC5pbnYoWHByaW1lWCksIHZhcnMpXHJcbiAgICAgICAgLnJlZHVjZSgoYSwgYikgPT4geyByZXR1cm4gYS5jb25jYXQoYik7IH0pO1xyXG4gICAgLy90IHN0YXRpc3RpY3NcclxuICAgIHRoaXMudFN0YXRzID0gdGhpcy5zdEVyckNvZWZmLm1hcCgoc2UsIGkpID0+IHsgcmV0dXJuIHRoaXMuYmV0YXNbaV0gLyBzZTsgfSk7XHJcbiAgICAvL3AgdmFsdWVzXHJcbiAgICB0aGlzLnBWYWx1ZXMgPSB0aGlzLnRTdGF0cy5tYXAoKHQsIGkpID0+IHsgcmV0dXJuIGpTdGF0LnR0ZXN0KHQsIG1lYW5zW2ldLCBzZHNbaV0sIG4pOyB9KTtcclxuICAgIC8vcmVzaWR1YWxzXHJcbiAgICBsZXQgeWhhdCA9IFtdO1xyXG4gICAgbGV0IHJlcyA9IGR2LmRhdGEubWFwKChkLCBpKSA9PiB7XHJcbiAgICAgICAgZGF0YVtpXS5zaGlmdCgpO1xyXG4gICAgICAgIGxldCByb3cgPSBkYXRhW2ldO1xyXG4gICAgICAgIHloYXRbaV0gPSB0aGlzLnByZWRpY3Qocm93KTtcclxuICAgICAgICByZXR1cm4gZCAtIHloYXRbaV07XHJcbiAgICB9KTtcclxuICAgIGxldCByZXNpZHVhbCA9IHloYXQ7XHJcbiAgICByZXR1cm4gdGhpcy5iZXRhcztcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gcGxzKHgsIHkpIHtcclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZWdyZXNzaW9uLmpzLm1hcCIsImltcG9ydCB7IFFDb21wb25lbnQgfSBmcm9tICcuL1FDb21wb25lbnQnO1xyXG4vKlxyXG4qIFV0aWxpdHkgU3lzdGVtcyBjbGFzc1xyXG4qL1xyXG5leHBvcnQgY2xhc3MgVVN5cyBleHRlbmRzIFFDb21wb25lbnQge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgb3B0aW9ucywgZGF0YSkge1xyXG4gICAgICAgIHN1cGVyKG5hbWUpO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICAgICAgdGhpcy5yZXN1bHRzID0gW107XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgIH1cclxuICAgIHVwZGF0ZShhZ2VudCwgc3RlcCkge1xyXG4gICAgICAgIHZhciB0bXAgPSBbXSwgbWF4ID0gMCwgYXZnLCB0b3A7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm9wdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdG1wW2ldID0gMDtcclxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLm9wdGlvbnNbaV0uY29uc2lkZXJhdGlvbnMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBjID0gdGhpcy5vcHRpb25zW2ldLmNvbnNpZGVyYXRpb25zW2pdO1xyXG4gICAgICAgICAgICAgICAgbGV0IHggPSBjLngoYWdlbnQsIHRoaXMub3B0aW9uc1tpXS5wYXJhbXMpO1xyXG4gICAgICAgICAgICAgICAgdG1wW2ldICs9IGMuZih4LCBjLm0sIGMuYiwgYy5rKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhdmcgPSB0bXBbaV0gLyB0aGlzLm9wdGlvbnNbaV0uY29uc2lkZXJhdGlvbnMubGVuZ3RoO1xyXG4gICAgICAgICAgICB0aGlzLnJlc3VsdHMucHVzaCh7IHBvaW50OiBhZ2VudC5pZCwgb3B0OiB0aGlzLm9wdGlvbnNbaV0ubmFtZSwgcmVzdWx0OiBhdmcgfSk7XHJcbiAgICAgICAgICAgIGlmIChhdmcgPiBtYXgpIHtcclxuICAgICAgICAgICAgICAgIGFnZW50LnRvcCA9IHsgbmFtZTogdGhpcy5vcHRpb25zW2ldLm5hbWUsIHV0aWw6IGF2ZyB9O1xyXG4gICAgICAgICAgICAgICAgdG9wID0gaTtcclxuICAgICAgICAgICAgICAgIG1heCA9IGF2ZztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm9wdGlvbnNbdG9wXS5hY3Rpb24oc3RlcCwgYWdlbnQpO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVVTeXMuanMubWFwIiwiZXhwb3J0ICogZnJvbSAnLi91dGlscyc7XHJcbmV4cG9ydCB7IFFDb21wb25lbnQgfSBmcm9tICcuL1FDb21wb25lbnQnO1xyXG5leHBvcnQgeyBCRElBZ2VudCB9IGZyb20gJy4vYmRpJztcclxuZXhwb3J0ICogZnJvbSAnLi9iZWhhdmlvclRyZWUnO1xyXG5leHBvcnQgKiBmcm9tICcuL2NvbXBhcnRtZW50JztcclxuZXhwb3J0IHsgQ29udGFjdFBhdGNoIH0gZnJvbSAnLi9jb250YWN0UGF0Y2gnO1xyXG5leHBvcnQgeyBFbnZpcm9ubWVudCB9IGZyb20gJy4vZW52aXJvbm1lbnQnO1xyXG5leHBvcnQgKiBmcm9tICcuL2VwaSc7XHJcbmV4cG9ydCAqIGZyb20gJy4vZXZlbnRzJztcclxuZXhwb3J0IHsgRXhwZXJpbWVudCB9IGZyb20gJy4vZXhwZXJpbWVudCc7XHJcbmV4cG9ydCAqIGZyb20gJy4vZ2VuZXRpYyc7XHJcbmV4cG9ydCB7IEV2b2x1dGlvbmFyeSB9IGZyb20gJy4vZXZvbHV0aW9uYXJ5JztcclxuZXhwb3J0IHsgRXZvbHZlIH0gZnJvbSAnLi9ldm9sdmUnO1xyXG5leHBvcnQgeyBIeWJyaWRBdXRvbWF0YSB9IGZyb20gJy4vaGEnO1xyXG5leHBvcnQgKiBmcm9tICcuL2h0bic7XHJcbmV4cG9ydCAqIGZyb20gJy4vbWMnO1xyXG5leHBvcnQgeyBrTWVhbiB9IGZyb20gJy4va21lYW4nO1xyXG5leHBvcnQgeyBLTk4gfSBmcm9tICcuL2tubic7XHJcbmV4cG9ydCAqIGZyb20gJy4vbWF0aCc7XHJcbmV4cG9ydCB7IE5ldHdvcmsgfSBmcm9tICcuL25ldHdvcmsnO1xyXG5leHBvcnQgeyBRTGVhcm5lciB9IGZyb20gJy4vUUxlYXJuZXInO1xyXG5leHBvcnQgKiBmcm9tICcuL3JlZ3Jlc3Npb24nO1xyXG5leHBvcnQgeyBTdGF0ZU1hY2hpbmUgfSBmcm9tICcuL3N0YXRlTWFjaGluZSc7XHJcbmV4cG9ydCAqIGZyb20gJy4vVVN5cyc7XHJcbmV4cG9ydCAqIGZyb20gJy4vcmFuZG9tJztcclxuZXhwb3J0ICogZnJvbSAnLi9yZXNvdXJjZSc7XHJcbmV4cG9ydCB2YXIgdmVyc2lvbiA9ICcwLjAuNSc7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1haW4uanMubWFwIiwiLyoqKlxyXG4qQG1vZHVsZSBRRXBpS2l0XHJcbiovXHJcbmltcG9ydCAqIGFzIHFlcGlraXQgZnJvbSAnLi9tYWluJztcclxubGV0IFFFcGlLaXQgPSBxZXBpa2l0O1xyXG5mb3IgKGxldCBrZXkgaW4gUUVwaUtpdCkge1xyXG4gICAgaWYgKGtleSA9PSAndmVyc2lvbicpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhRRXBpS2l0W2tleV0pO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXFlcGlraXQuanMubWFwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQU8sTUFBTSxRQUFRLENBQUM7SUFDbEIsV0FBVyxDQUFDLFFBQVEsRUFBRTtRQUNsQixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztRQUNqQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUN0QixJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztRQUMzQixJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztRQUMzQixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNmLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztRQUM1QixJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFDNUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDO1FBQzVDLElBQUksQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDLGFBQWEsSUFBSSxLQUFLLENBQUM7UUFDckQsSUFBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUMsYUFBYSxJQUFJLEtBQUssQ0FBQztRQUNsRCxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDcEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDO1NBQ3pDO1FBQ0QsSUFBSSxJ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Q0FBQyxFQUFFO1lBQzdELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDO1NBQ3JFO2FBQ0ksSUFBSSxRQUFRLElBQUksQ0FBQyxLQUFLLFdBQVcsRUFBRTtZQUNwQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQztTQUNyRTtLQUNKO0NBQ0o7QUFDRCxBQUFPLFNBQVMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUU7SUFDakMsS0FBSyxJQUFJLEtBQUssSUFBSSxNQUFNLEVBQUU7UUFDdEIsSUFBSSxRQUFRLElBQUksQ0FBQyxLQUFLLFdBQVcsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQzdELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDO1NBQ3JFO2FBQ0ksSUFBSSxRQUFRLElBQUksQ0FBQyxLQUFLLFdBQVcsRUFBRTtZQUNwQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQztTQUNyRTtLQUNKO0NBQ0o7QUFDRCxBQUFPLFNBQVMsV0FBVyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUU7SUFDdEMsS0FBSyxJQUFJLEtBQUssSUFBSSxNQUFNLEVBQUU7UUFDdEIsSUFBSSxRQUFRLElBQUksQ0FBQyxLQUFLLFdBQVcsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FB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SUFBSSxDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEUsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzRixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDbkUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDNUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENB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LENBQUMsR0FBRyxDQUFDLENBQUM7YUFDaEM7U0FDSjtRQUNELElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzdFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzdFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2hGLEtBQUssSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUs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
