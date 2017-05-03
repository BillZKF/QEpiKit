var bus = new Vue({
    data: {
        config: {

        }
    }
});

Vue.component('experiment-form', {
    props:['experiment'],
    template: `<div><h2>Experiment Parameters</h2>
<div class="form-group">
<label>Total Iterations</label>
<input class="form-control" type="number" v-model="experiment.iterations" />
</div>
<div class="form-group">
<label>Seed</label>
<input class="form-control" type="number" v-model="experiment.seed" />
</div>
<div class="form-group">
  <label>Experiment Type</label>
  <select class="form-control" v-model="experiment.type">
    <option v-for="type in experimentTypes">{{type}}</option>
  </select>
</div>
</div>`,
    data: function() {
        return {
            experimentTypes: ['random-seed', 'param-sweep', 'evolution'],
        }
    }
});

Vue.component('report-form', {
    props:['report'],
    template:`<div>
      <h3>Report</h3>
      <div>
        <label class="form-label">Sums</label>
        <input class="form-control" v-model="sum" v-for="sum in report.sums" />
        <label>Means</label>
        <input class="form-control" v-model="mean" v-for="mean in report.means" />
        <label>Frequencies</label>
        <input class="form-control" v-model="freq" v-for="freq in report.freqs" />
      </div>
    </div>`
})

Vue.component('evolution-form', {
    props:['evolution'],
    template: `<div><h3>Evolution</h3>
      <h4>Targets</h4>
          <div v-for="(statVal, stat) in evolution.target">
            <label>{{stat}}</label>
            <div class="row" v-for="(val, param) in statVal">
            <input class="form-control col-lg-6" v-model="param"/> : <input class="form-control col-lg-6" v-model="val"/>
            </div>
          </div>
      <h4>Params</h4>
      <div v-for="param in evolution.params">
        <exp-param-form :exp-param="param"></exp-param-form>
      </div>
    </div>`
})

Vue.component('exp-param-form', {
    props: ['expParam'],
    template: `<div class="row">
      <label>Parameter Address</label>
      <input class="form-control" v-model="expParam.level"/>
      <input class="form-control" v-model="expParam.group"/>
      <input class="form-control" v-model="expParam.name"/>
      <label>Range</label>
      <input class="form-control" v-model="expParam.range[0]"/>
      <input class="form-control" v-model="expParam.range[1]"/>
    </div>`
})


Vue.component('environment-form', {
    props:['environment'],
    template: `<div><h2>Environment Parameters</h2>
<div class="form-group">
<label>Step Size (days)</label>
  <input class="form-control" type="number" v-model="environment.step" />
</div>
<div class="form-group">
  <label>Until (days)</label>
  <input class="form-control" type="number" v-model="environment.until" />
</div>
<div class="form-group">
  <label>Spatial Type</label>
  <select class="form-control" v-model="environment.type">
    <option v-for="type in spatialTypes">{{type}}</option>
  </select>
</div>
<div class="form-group">
<label>Boundaries</label>
<label>Bottom-Left</label><input class="form-control" v-model="environment.bounds[0]"/>
<label>Top-Right</label><input class="form-control" v-model="environment.bounds[1]"/>
</div>
</div>`,
    data: function() {
        return {
            spatialTypes: ['continuous', 'geospatial']
        }
    },
    methods: {
        save: function() {
            bus._data.config.environment = this.environment;
        }
    }
});

Vue.component('pathogen-form', {
    props:['pathogen'],
    template: `<div>
    <h3>Pathogen</h3>
    <label>Person to Person
      <input class="checkbox" type="checkbox">
    </label>
    <div class="form-group">
      <label>Name</label>
      <input class="form-control" v-model="pathogen.name"/>
    </div>
    <div class="form-group">
      <label>N50</label>
      <input class="form-control" v-model.number="pathogen.N50"/>
    </div>
    <div class="form-group">
      <label>Optimizied Parameter</label>
      <input class="form-control" v-model.number="pathogen.optParam"/>
    </div>
    <div class="form-group">
      <label>Best Fit Model</label>
      <select class="form-control" v-model="pathogen.bestFitModel">
        <option>exponential</option>
        <option>beta-Poisson</option>
    </div>
    <div class="form-group">
      <label>Decay Rate</label>
      <input class="form-control" v-model.number="pathogen.decayRate"/>
    </div>
    <div class="form-group">
      <label>Recovery Time</label>
      <input class="form-control" v-model.number="pathogen.recoveryTime"/>
    </div>
    <div class="form-group">
      <label>Shed Rate</label>
      <input class="form-control" v-model.number="pathogen.shedRate"/>
    </div>
    <div class="form-group">
      <label>Mutation Time</label>
      <input class="form-control" v-model.number="pathogen.mutationTime"/>
    </div>
    </div>`,
    methods: {
        save: function() {
            bus._data.config.environment.params.pathogen = this.pathogen;
        }
    }
});

Vue.component('param-form', {
    props: ["level", "group", "name", "param"],
    template: `
    <div class="row">
        <div class="form-group col-lg-4">
            <label class="control-label">Name</label>
            <input class="form-control" v-model="name" />
        </div>
        <span v-if="typeof(param.assign) !== 'function'">
            <label>Use Distribution<input class="checkbox" type="checkbox" v-model="useDistribution" /></label>
            <div v-if="!useDistribution" class="form-group col-lg-4">
                <label class="control-label">Value</label>
                <input class="form-control" v-model="param.assign" />
            </div>
            <div v-if="useDistribution" class="form-group col-lg-4">
              <label class="control-label">Distribution</label>
              <select class="form-control" v-model="distribution">
                <option v-for="(dist,key) in distributions">{{key}}</option>
              </select>
              <div v-for="(dpm,idx) in distributions[distribution]">
                <label class="control-label">{{dpm}}</label>
                <input v-model.number="dParams[idx]" class="form-control" type="number" />
              </div>
            </div>
        </span>
        <label v-else >Param assigned using custom function.</label>
    </div>`,
    data: function() {
        return {
            useDistribution: false,
            distributions: {
                uniform: ["min", "max"],
                normal: ["mean", "sd"],
                gamma: ["shape", "scale"],
                lognormal: ["mean", "sd"],
                poisson: ["k", "lambda"]
            },
            distribution: 'normal',
            dParams: [0, 0],
            value: 0
        }
    },
    methods: {
        save: function() {
            if (useDistribution) {
                bus._data.config[level][group].params[name] = {
                    assign: (rng, dist) => {
                        rng[dist](this.params[0], this.params[1])
                    }
                }
            } else {
                bus._data.config[level][group].params[name] = {
                    assign: this.value
                }
            }
        }
    }
});

Vue.component('agents-form', {
    props: ['agents'],
    template: `<div><h2>Agents</h2>
            <div class="form-group">
              <label>Name</label>
              <input @change="save()" class="form-control" v-model="agents.name" />
            </div>
            <div class="form-group">
              <label># Agents</label>
              <input @change="save()" class="form-control" type="number" v-model="agents.count" />
            </div>
            <h3>Parameters</h3>
            <div class="input-group">
            <input class="form-control" placeholder="enter parameter name" v-model="newName" />
            <span class="input-group-btn">
            <div class="btn btn-primary" @click="addParam(newName)">Add Parameter</div>
            </span>
            </div>
            <param-form :level="'agents'" :group.sync="agents.name" :name.sync="name" :param="prm" v-for="(prm, name) in agents.params"></param-form>
            </div>`,
    data: function() {
        return {
            newName: '',
        }
    },
    methods: {
        save: function() {
            bus._data.config.agents = bus._data.config.agents || {};
            bus._data.config.agents[this.agents.name] = this.agents;
            bus.$emit('update-component');
        },
        updateParam: function(name, oldName) {
            this.agents.params[name] = this.agents.params[oldName];
            delete this.agents.params[oldName];
        },
        addParam: function(name) {
            this.agents.params[name] = {
                assign: 0
            }
            this.$forceUpdate();
        }
    }
});

Vue.component('components-form', {
    props:['comp','params','groups'],
    template: `<div><h3>Component</h3>
    <div class="row">
    <div class="form-group col-lg-4">
    <label>Name</label>
    <input class="form-control" v-model="comp.name" />
    </div>
    <div class="form-group col-lg-4">
    <label>Type</label>
    <select class="form-control" v-model="comp.type">
    <option v-for="type in componentTypes">{{type}}</option>
    </select>
    </div>
    <div class="form-group col-lg-4">
      <label>Agent Groups</label>
      <select class="form-control" v-model="comp.agents">
        <option v-for="group in groups">{{group}}</option>
      </select>
    </div>
    </div>
    <state-machine v-if="comp.type === 'state-machine'" :component="comp" :params="params"></state-machine>
</div>`,
    created: function() {
        bus.$on('update-component', this.update);
    },
    data: function() {
        return {
            componentTypes: ['every-step', 'state-machine', 'behavior-tree', 'hierarchal-task-network']
        }
    }
})

Vue.component('state-machine', {
    props: ['component', 'params'],
    template: `
<div class="panel panel-body panel-default">
<h3>{{component.name}}</h3>
<div>
  <label>Conditions</label>
  <condition :name="key" :condition="cond" :params="params" v-for="(cond, key) in component.conditions"></condition>
  <div class="input-group">
    <input class="form-control" v-model="newConditionName"/>
    <span class="input-group-btn">
    <span class="btn btn-default" @click="addCondition()" :disabled="params.length < 1">Add Condition</span>
    </span>
  </div>
</div>
<div>
  <label>States</label>
  <state :name="key" :state="state" v-for="(state, key) in component.states"></state>
  <div class="input-group">
    <input class="form-control" v-model="newStateName" />
    <span class="input-group-btn">
    <span class="btn btn-default" @click="addState()">Add State</span>
    </span>
  </div>
</div>
<div>
  <label>Transition</label>
  <transition :transition="transition" :states="component.states" :conditions="component.conditions" v-for="transition in component.transitions"></transition>
  <div class="input-group">
  <input class="form-control" v-model="newTransitionName"/>
  <span class="input-group-btn">
  <span class="btn btn-default" @click="addTransition()"  :disabled="Object.keys(component.states).length < 2">Add Transition</span>
  </span>
</div>
</div>`,
    data: function() {
        return {
            newConditionName: '',
            newStateName: '',
            newTransitionName: '',
        }
    },
    methods: {

        addCondition: function() {
            this.conditions[this.newConditionName] = {
                key: '',
                value: 0,
                check: QEpiKit.gt
            }
        },
        addState: function(){
          this.states[this.newStateName] = '';
        },
        addTransition: function(){
          this.transitions.push({
            name:this.newTransitionName,
            from:'',
            to:''
          })
        }

    }
})

Vue.component('state', {
    props: ['state','name'],
    template: `<div class="form-group">
    <label class="control-label">{{name}}</label>
    <select class="form-control" v-model="state">
      <option v-for="action in source">{{action}}</option>
    </select>
  </div>`,
    data: function() {
        return {
            source: Object.keys(QActions)
        }
    }
});

Vue.component('condition', {
    props: ['name', 'condition', 'params'],
    template: `<div>
<label class="control-label">{{name}}</label>
<div class="form-inline">
<label>Parameter</label>
<div class="form-group">
<select class="form-control" v-model="condition.key">
<option v-for="(param, paramName) in params">{{paramName}}</option>
</select>
</div>
<label>Check</label>
<div class="form-group">
<select class="form-control" v-model="condition.check">
<option v-for="matcher in matchers">{{matcher}}</option>
</select>
</div>
<div v-if="typeof(condition.value) !== 'function'" class="form-group">
  <label class="control-label">Value</label>
  <input class="form-control" v-model="condition.value"/>
</div>
<span v-else>
  Condition calls a custom function.
</span>
</div>`,
  data: function(){
    return {
      matchers: ['eq','lt','lte','gt','gte','neq']
    }
  }
});

Vue.component('transition', {
    props: ['transition', 'states', 'conditions'],
    template: `<div class="panel panel-default panel-body">
<label>{{transition.name}}</label>
<div class="form-group form-inline">
<label class="control-label">On</label>
<div class="form-group">
<select class="form-control" v-model="transition.name">
<option v-for="(cond,key) in conditions">{{key}}</option>
</select>
</div>
<label>To</label>
<div class="form-group">
<select class="form-control" v-model="transition.to">
<option v-for="(state,key) in states">{{key}}</option>
</select>
</div>
<label>From</label>
<div class="form-group">
<select class="form-control" v-model="transition.from">
<option v-for="(state,key) in states">{{key}}</option>
</select>
</div>
</div>`
});
