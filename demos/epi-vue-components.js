var bus = new Vue({
  data: {
    config: {

    }
  }
});

Vue.component('experiment-form', {
  props: ['experiment'],
  template: `<div class="form-horizontal"><h2>Experiment Parameters</h2>
  <div class="form-group">
    <label class="control-label col-sm-4">Experiment Type</label>
    <div class="col-sm-8">
    <select class="form-control" v-model="experiment.type">
      <option v-for="type in experimentTypes">{{type}}</option>
    </select>
    </div>
  </div>
<div class="form-group">
<label class="control-label col-sm-4">Number of Runs</label>
<div class="col-sm-8">
<input class="form-control" type="number" v-model.number="experiment.iterations" />
</div>
</div>
<div class="form-group">
<label class="control-label col-sm-4">Iterations per Run</label>
<div class="col-sm-8">
<input class="form-control" type="number" v-model.number="experiment.size" />
</div>
</div>
<div class="form-group">
<label class="control-label col-sm-4">Seed</label>
<div class="col-sm-8">
<input class="form-control" type="number" v-model.number="experiment.seed" />
</div>
</div>
<div>
<h3>Experiment Parameters</h3>
  <param-form v-for="param in experiment.params" :param="param" :level="param.level" :group="param.group" :name="param.name" :show-path="true"></param-form>
  <div class="row form-group">
    <span class="col-lg-3"><input class="form-control" placeholder="parameter level" v-model="newLevel" /></span>
    <span class="col-lg-3"><input class="form-control" placeholder="parameter group" v-model="newGroup" /></span>
    <span class="col-lg-3"><input class="form-control" placeholder="parameter name" v-model="newName" /></span>
    <span class="col-lg-3">
      <div class="btn btn-primary" @click="addParam()">Add Parameter</div>
    </span>
  </div>
</div>
</div>`,
  data: function() {
    return {
      experimentTypes: ['param-sweep', 'evolution'],
      newLevel: '',
      newGroup: '',
      newName: ''
    }
  },
  methods:{
    addParam: function(level, group, name){
      this.experiment.params.push({level:this.newLevel, group:this.newGroup, name:this.newName, type:'distribution', distribution: {name: 'normal', params:[0 , 1]}});
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
        <td>{{entry.score.toExponential(3)}}</td>
      </tr>
    </table>
  </div>`
});

Vue.component('report-form', {
  props: ['report'],
  template: `<div>
      <h3>Report</h3>
      <div class="form">
        <div class="row">
          <div class="col-sm-6">
            <label class="form-label">Sums</label>
            <input class="form-control" v-model="report.sums[idx]" v-for="(sum, idx) in report.sums" />
          </div>
          <div class="col-sm-6 bottom-align-text">
            <button class="btn btn btn-sm btn-default" @click="add('sums')">Add Sum</button>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-6">
          <label>Means</label>
          <input class="form-control" v-model="report.means[idx]" v-for="(mean, idx) in report.means" />
          </div>
          <div class="col-sm-6 center-block">
          <button class="btn btn-sm btn-default" @click="add('means')">Add Mean</button>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-6">
          <label>Frequencies</label>
          <input class="form-control" v-model="report.freqs[idx]" v-for="(freq,idx) in report.freqs" />
          </div>
          <div class="col-sm-6 center-block">
          <button class="btn btn-sm btn-default" @click="add('freqs')">Add Freq</button>
          </div>
        </div>
      </div>
    </div>`,
  methods: {
    add: function(fieldType) {
      this.report[fieldType].splice(this.report[fieldType].length, 1, '');
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
            <input class="form-control" v-model="param"/><label class="form-label"> : </label><input class="form-control" v-model="statVal[param]"/>
            </div>
          </div>
    </div>`
})


Vue.component('environment-form', {
  props: ['environment'],
  template: `<div class="form-horizontal"><h2>Environment Parameters</h2>
<div class="form-group">
<label class="control-label col-sm-4">Step Size (days)</label>
  <div class="col-sm-8">
  <input class="form-control" type="number" v-model.number="environment.step" />
  </div>
</div>
<div class="form-group">
  <label class="control-label col-sm-4">Until (days)</label>
  <div class="col-sm-8">
  <input class="form-control" type="number" v-model.number="environment.until" />
  </div>
</div>
<div class="form-group">
  <label class="control-label col-sm-4">Spatial Type</label>
  <div class="col-sm-8">
  <select class="form-control" v-model="environment.type">
    <option v-for="type in spatialTypes">{{type}}</option>
  </select>
  </div>
</div>
  <div class="form-group" v-if="environment.type !== 'compartmental'">
    <label class="control-label col-sm-3">Bottom-Left-Bound</label>
    <div class="col-sm-3"><input class="form-control" v-model.number="environment.boundaries[0]"/></div>
    <label class="control-label col-sm-3">Top-Right-Bound</label>
    <div class="col-sm-3"><input class="form-control" v-model.number="environment.boundaries[1]"/></div>
  </div>
</div>`,
  data: function() {
    return {
      spatialTypes: ['continuous', 'geospatial', 'compartmental']
    }
  },
  methods: {
    save: function() {
      bus._data.config.environment = this.environment;
    }
  }
});

Vue.component('entity-form', {
  props:['entity','entityName'],
  template:`<div>
    <h2>{{entityName}}</h2>
    <h3>Parameters</h3>
    <div>
      <param-form :level="'entities'" :group="entityName" :name="key" :param="entity.params[key]" :show-path="false" v-for="(prm, key) in entity.params"></param-form>
    </div>
    <div class="form-group input-group">
      <input class="form-control" placeholder="enter parameter name" v-model="newName" />
      <span class="input-group-btn">
      <div class="btn btn-primary" @click="addParam(newName)">Add Parameter</div>
      </span>
    </div>
  </div>`,
  data: function() {
    return {
      newName: ''
    }
  },
})

Vue.component('pathogen-form', {
  props: ['pathogen'],
  template: `<div>
    <h3>Pathogen</h3>
    <form class="form-horizontal ">
    <div class="form-group">
      <label class="control-label col-sm-4">Person to Person</label>
      <div class="col-sm-8">
      <input class="checkbox" type="checkbox">
      </div>
    </div>
    <div class="form-group">
      <label class="control-label col-sm-4">Name</label>
      <div class="col-sm-8">
      <input class="form-control" v-model="pathogen.name"/>
      </div>
    </div>
    <div class="form-group">
      <label class="control-label col-sm-4">N50</label>
      <div class="col-sm-8">
      <input class="form-control" v-model.number="pathogen.N50"/>
      </div>
    </div>
    <div class="form-group">
      <label class="control-label col-sm-4">Optimizied Parameter</label>
      <div class="col-sm-8">
      <input class="form-control" v-model.number="pathogen.optParam"/>
      </div>
    </div>
    <div class="form-group">
      <label class="control-label col-sm-4">Best Fit Model</label>
      <div class="col-sm-8">
      <select class="form-control" v-model="pathogen.bestFitModel">
        <option>exponential</option>
        <option>beta-Poisson</option>
      </select>
      </div>
    </div>
    <div class="form-group">
      <label class="control-label col-sm-4">Log-Reduction Rate</label>
      <div class="col-sm-8">
      <input class="form-control" v-model.number="pathogen.decayRate"/>
      </div>
    </div>
    <div class="form-group">
      <label class="control-label col-sm-4">Recovery Time</label>
      <div class="col-sm-8">
      <input class="form-control" v-model.number="pathogen.recoveryTime"/>
      </div>
    </div>
    <div class="form-group">
      <label class="control-label col-sm-4">Shed Rate</label>
      <div class="col-sm-8">
      <input class="form-control" v-model.number="pathogen.shedRate"/>
      </div>
    </div>
    <div class="form-group">
      <label class="control-label col-sm-4">Mutation Time</label>
      <div class="col-sm-8">
      <input class="form-control" v-model.number="pathogen.mutationTime"/>
      </div>
    </div>
    </form>
    </div>`,
  methods: {
    save: function() {
      bus._data.config.environment.params.pathogen = this.pathogen;
    }
  }
});


Vue.component('param-form', {
  props: ["level", "group", "name", "param", "showPath"],
  template: `<div>
      <div v-show="showPath" class="row">
        <div class="form-group col-lg-4">
          <input class="form-control" v-model="level" />
        </div>
        <div class="form-group col-lg-4">
          <input class="form-control" v-model="group" />
        </div>
      </div>
      <div class="row">
        <div class="form-group col-lg-4">
          <input class="form-control" v-model="name" />
        </div>
        <div class="col-lg-4">
          <select class="form-control" @change="toggle" v-model="type">
            <option v-for="t in types">{{t}}</option>
          </select>
        </div>
        <div v-if="type === 'assign'" class="form-group col-lg-4">
          <input class="form-control" v-model.number="param.assign" />
        </div>
        <div v-if="type === 'distribution'" class="form-group col-lg-4">
          <select class="form-control" v-model="param.distribution.name">
            <option v-for="(dist,key) in distributions">{{key}}</option>
          </select>
          <div v-for="(dpm,idx) in distributions[param.distribution.name]">
            <label class="control-label">{{dpm}}</label>
            <input v-if="param.distribution.name === 'pick'" v-model="paramStrings[idx]" class="form-control" @change="checkParams" />
            <input v-else v-model.number="param.distribution.params[idx]" class="form-control" type="number" @change="save" />
          </div>
        </div>
        <div v-if="type === 'states'" class="form-group col-lg-4">
          <div v-for="(dpm,idx) in distributions.pick">
          <input v-model="paramStrings[idx]" class="form-control" @change="checkParams(paramStrings[idx], idx)" />
          </div>
        </div>
      </div>
    </div>`,
  created: function() {
    if ('assign' in this.param) {
      this.type = 'assign';
    } else if ('distribution' in this.param) {
      this.type = 'distribution';
      if (this.param.distribution.name === 'pick') {
        this.paramStrings = [this.param.distribution.params[0].join(','), this.param.distribution.params[1].join(',')];
      }
    } else if ('action' in this.param) {
      this.type = 'action';
    } else if ('states' in this.param) {
      this.type = 'states';
      this.paramStrings = [this.param.states.params[0].join(','), this.param.states.params[1].join(',')];
    }
  },
  data: function() {
    return {
      type: 'assign',
      types: ['action', 'assign', 'distribution', 'states'],
      distributions: {
        uniform: ["min", "max"],
        normal: ["mean", "sd"],
        gamma: ["shape", "scale"],
        lognormal: ["mean", "sd"],
        poisson: ["k", "lambda"],
        pick: ['list', 'probabilities']
      },
      paramStrings: ['', ''],
      distribution: 'normal',
      value: 0
    }
  },
  methods: {
    toggle: function() {
      this.param = {};
      switch(this.type){
        case 'action': this.param = Object.assign(this.param, {action : 'move'}); break;
        case 'distribution': this.param = Object.assign(this.param, {distribution:{
            name: 'normal',
            params: [0, 1]
          }}); break;
        case 'states' : this.param = Object.assign(this.param, {states: {
            params: [
              ['yes', 'no'],
              [0.5, 0.5]
            ]
        }}); break;
        default:this.param = Object.assign(this.param, {assign : 0}); break;
      }
      this.save();
    },
    checkParams: function(value, idx) {
      let type = 'distribution';
      if (value.match(',') !== null) {
        if('states' in this.param){
          type = 'states';
        }
        this.param[type].params[idx] = value.split(',');
        if (idx === 1) {
          this.param[type].params[idx] = this.param[type].params[idx].map((d) => {
            return parseFloat(d);
          });
        }
      }
      this.save();
    },
    save: function() {
      bus.$emit('updateParam', this.level, this.group, this.name, this.param);
      this.$forceUpdate();
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
            <div>
            <h3>Parameters</h3>
            <div class="input-group">
              <input class="form-control" placeholder="enter parameter name" v-model="newName" />
              <span class="input-group-btn">
              <div class="btn btn-primary" @click="addParam(newName)">Add Parameter</div>
              </span>
            </div>
            <br/>
            <div>
            <param-form :level="'agents'" :group="agents.name" :name="name" :param="prm" :show-path="false" v-for="(prm, name) in agents.params"></param-form>
            </div>
            </div>
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
      <label class="col-sm-4">Name</label>
      <label class="col-sm-4">Type</label>
      <label class="col-sm-4">Agent Groups</label>
    </div>
    <div class="row">
      <div class="col-sm-4">
        <input class="form-control" v-model="comp.name" />
      </div>
      <div class="col-sm-4">
        <select class="form-control" v-model="comp.type">
          <option v-for="type in componentTypes">{{type}}</option>
        </select>
      </div>
      <div class="col-sm-4">
        <select class="form-control" v-model="comp.agents">
          <option v-for="group in groups">{{group}}</option>
        </select>
      </div>
    </div>
    <compartmental-model v-if="comp.type === 'compartmental'" :component="comp"></compartmental-model>
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

Vue.component('compartmental-model', {
  props: ['component'],
  template: `
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
        <div v-for="(patch, idx) in component.patches">
          <input v-model="component.patches[idx]" />
        </div>
      </div>
    </div>
  `
})

Vue.component('patches-form', {
  props: ['patches'],
  template: `
  <div>
    <h3>Patches</h3>
    <div v-for="patch in patches">
      <h4>{{patch.name}}</h4>
      <div class="row" v-for="(pop, key) in patch.populations">
        <div class="col-lg-4 form-group">
          <input class="form-control"  v-model="key"/>
        </div>
        <div class="col-lg-4 form-group">
          <input class="form-control" v-model.number="patch.populations[key]" />
        </div>
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
    </div>
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
  template: `<div>
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
  </div>
</div>`
});
