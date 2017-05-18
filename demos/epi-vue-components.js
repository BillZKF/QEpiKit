var bus = new Vue({
  data: {
    config: {

    }
  }
});

Vue.component('experiment-form', {
  props: ['experiment'],
  template: `<div><h2>Experiment Parameters</h2>
<div class="form-group">
<label>Total Iterations</label>
<input class="form-control" type="number" v-model.number="experiment.iterations" />
</div>
<div class="form-group">
<div class="form-group">
<label>Iteration Size (runs per iteration)</label>
<input class="form-control" type="number" v-model.number="experiment.size" />
</div>
<label>Seed</label>
<input class="form-control" type="number" v-model.number="experiment.seed" />
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

Vue.component('experiment-log', {
  props: ['log', 'improvement', 'targets'],
  template: `<div class="panel panel-success" v-if="log.length > 0" >
    <div class="panel-heading">Exp Results</div>
    <div class="panel-body">
      Overall Improvement : {{improvement}}
    </div>
    <table class="table">
      <tr>
        <th>Iteration</th>
        <th v-for="(mean, key) in log[0].means">mean_{{key}}</th>
        <th v-for="(sum, key) in log[0].sums">sum_{{key}}</th>
        <th v-for="(freq, key) in log[0].freqs">freq_{{key}}</th>
        <th>Score</th>
      </tr>
      <tr v-for="entry in log">
        <td>{{entry.run}}</td>
        <td v-for="(mean, key) in entry.means">{{mean.toFixed(3)}}</td>
        <td v-for="(sum, key) in entry.sums">{{sum.toFixed(3)}}</td>
        <td v-for="(freq, key) in entry.freqs">{{freq.toFixed(3)}}</td>
        <td>{{entry.score}}</td>
      </tr>
    </table>
  </div>`
});

Vue.component('report-form', {
  props: ['report'],
  template: `<div>
      <h3>Report</h3>
      <div class="form">
        <label class="form-label">Sums</label>
        <input class="form-control" v-model="sum" v-for="sum in report.sums" />
        <button class="btn btn btn-sm btn-default" @click="add('sums')">Add Sum</button>
        <label>Means</label>
        <input class="form-control" v-model="mean" v-for="mean in report.means" />
        <button class="btn btn-sm btn-default" @click="add('means')">Add Mean</button>
        <label>Frequencies</label>
        <input class="form-control" v-model="freq" v-for="freq in report.freqs" />
        <button class="btn btn-sm btn-default" @click="add('freqs')">Add Freq</button>
      </div>
    </div>`,
    methods:{
      add: function(fieldType){
        this.report[fieldType].splice(this.report[fieldType].length,1,'');
      }
    }
})

Vue.component('evolution-form', {
  props: ['evolution'],
  template: `<div><h3>Evolution</h3>
      <h4>Targets</h4>
          <div v-for="(statVal, stat) in evolution.target" class="form-inline">
            <label>{{stat}}</label>
            <div v-for="(val, param) in statVal">
            <input class="form-control" v-model="param"/><label class="form-label"> : </label><input class="form-control" v-model="val"/>
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
  template: `<div>
      <label>Parameter Address</label>
      <div class="form-inline">
      <input class="form-control" v-model="expParam.level"/>
      <input class="form-control" v-model="expParam.group"/>
      <input class="form-control" v-model="expParam.name"/>
      </div>
      <label>Range</label>
      <div class="form-inline">
      <input class="form-control" v-model="expParam.range[0]"/>
      <input class="form-control" v-model="expParam.range[1]"/>
      </div>
    </div>`
})


Vue.component('environment-form', {
  props: ['environment'],
  template: `<div><h2>Environment Parameters</h2>
<div class="form-group">
<label>Step Size (days)</label>
  <input class="form-control" type="number" v-model.number="environment.step" />
</div>
<div class="form-group">
  <label>Until (days)</label>
  <input class="form-control" type="number" v-model.number="environment.until" />
</div>
<div class="form-group">
  <label>Spatial Type</label>
  <select class="form-control" v-model="environment.type">
    <option v-for="type in spatialTypes">{{type}}</option>
  </select>
</div>
<div class="form-group" v-if="environment.bounds">
<label>Boundaries</label>
<label>Bottom-Left</label><input class="form-control" v-model.number="environment.bounds[0]"/>
<label>Top-Right</label><input class="form-control" v-model.number="environment.bounds[1]"/>
</div>
</div>`,
  data: function() {
    return {
      spatialTypes: ['continuous', 'geospatial','compartmental']
    }
  },
  methods: {
    save: function() {
      bus._data.config.environment = this.environment;
    }
  }
});

Vue.component('pathogen-form', {
  props: ['pathogen'],
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
      <label>Log-Reduction Rate</label>
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
  props: ['comp', 'params', 'groups'],
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
    <compartmental-model v-if="comp.type === 'compartmental'" :component="comp"></compartmental-model>
    <div class="form-group col-lg-4" v-if="comp.agents">
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
      componentTypes: ['every-step', 'state-machine', 'compartmental', 'behavior-tree', 'hierarchal-task-network']
    }
  }
});

Vue.component('compartmental-model',{
  props:['component'],
  template:`
    <div class="panel panel-body panel-default">
      <h3>{{component.type}}</h3>
      <div v-for="(compartment, key) in component.compartment">
        <label>{{key}}</label>
        <div v-if="typeof compartment.operation == 'function'">
          This compartment uses a custom function defined in seperate file.
        </div>
        <input v-else v-model="compartment.operation" />
      </div>
      <div>
        <label>Patches</label>
        <div v-for="patch in component.patches">
          <input v-model="patch" />
        </div>
      </div>
    </div>
  `
})

Vue.component('patches-form', {
  props:['patches'],
  template: `
  <div>
    <h3>Patches</h3>
    <div v-for="patch in patches">
      <h4>{{patch.name}}</h4>
      <div v-for="(pop, key) in patch.populations">
        <input  v-model="key"/>
        <input v-model.number="pop" />
      </div>
    </div>
  </div>
  `
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
    addState: function() {
      this.states[this.newStateName] = '';
    },
    addTransition: function() {
      this.transitions.push({
        name: this.newTransitionName,
        from: '',
        to: ''
      })
    }

  }
})

Vue.component('state', {
  props: ['state', 'name'],
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
  data: function() {
    return {
      matchers: ['equalTo', 'lt', 'lte', 'gt', 'gte', 'notEqualTo']
    }
  }
});

Vue.component('rb-dataset', {
  props: ['dataset'],
  template: `<div>
    <label>Show Property</label>
    <select v-model="showProp">
      <option v-for="prop in dataset.properties"></option>
    </select>
    <label>Values</label>
    <select v-model="selectedEntry">
      <option v-for="(entry, index) in dataset.entries" value="{{dataset.entries[index]}}">{{entry[showProp]}}</option>
    </select>
    <h4>(From dataset {{dataset.title}})</h4>
  </div>`,
  data: function() {
    return {
      showProp: '',
      selectedEntry: {}
    }
  }
});

Vue.component('rb-page', {
  props: ['page'],
  template: `<div>
    <div v-for="pp in page.pageProps">
      <label>{{pp.property.name}}</label> : {{pp.value}}
    </div>
    <h4>(From page {{page.title}})</h4>
  </div>`
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
