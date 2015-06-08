module QKit{

	export class BehaviorTree{
		public data : any[];
		public root : BTNode;
		public runningMem : any[];

		constructor(root:BTNode, data: any[]){
			this.root = root;
			this.data = data;
		}

		start(agentID:number){
			this.data[agentID].active = true;
			var state;
			while (this.data[agentID].active === true){
				state = BehaviorTree.tick(this.root, agentID);
				this.data[agentID].active = false;
			}
		}

		update(){
			for (var d in this.data){
				this.start(d);
			}
		}

		public static fromJSON = function(json: JSON){
			var n;
			for (var node in json){
				switch(json[node].type){
					case "root":
						n = new BTRoot(json[node].id, json[node].children);
						break;
					case "selector":
						n = new BTSelector(json[node].id, json[node].children);
						break;
					case "sequence":
						n = new BTSequence(json[node].id, json[node].children);
							break;
					case "parallel":
							n = new BTParallel(json[node].id, json[node].children);
							break;
					case "condition":
						console.log(json[node]);
						n = new BTCondition(json[node].id, json[node].condition);
						break;
					case "action":
						n = new BTAction(json[node].id, json[node].condition, json[node].action);
						break;
					default:
						try {

						} catch (error) {
							throw error;
						}
						break;
				}
				return n;
			}
		}


		public static tick = function(node:BTNode, agentID:number){
			var state = node.operate(agentID);
			if(state === 3){
				this.runningMem.push(node);
			}
			return state;
		}

		public static equalTo = function(a, b){
			if(a === b){
				return 1;
			} else {
				return 2;
			}
		}

		public static notEqualTo = function(a, b){
			if(a !== b){
				return 1;
			} else {
				return 2;
			}
		}

		public static gt = function(a, b){
			if(a > b){
				return 1;
			} else {
				return 2;
			}
		}

		public static gtEq = function(a, b){
			if(a >= b){
				return 1;
			} else {
				return 2;
			}
		}

		public static lt = function(a, b){
			if(a < b){
				return 1;
			} else {
				return 2;
			}
		}

		public static ltEq = function(a, b){
			if(a <= b){
				return 1;
			} else {
				return 2;
			}
		}
	}

	export class BTNode{
		public id: string;
		public state: number;
		public type : string;
		public operate: Function;
		constructor(id:string){
			this.id = id;
		}
	}

	export class  BTControlNode extends BTNode{
		public children : BTNode[];
		constructor(id: string, children: BTNode[]){
			super(id);
			this.children = children;
		}
	}

	export class BTRoot extends BTControlNode{
		constructor(id:string, children:BTNode[]){
			super(id, children);
			this.type = "root";
			this.operate = function(agentID){
				var state = BehaviorTree.tick(this.children[0], agentID);
				return state;
			}
		}
	}

	export class BTSelector extends BTControlNode{
		constructor(id:string, children:BTNode[]){
			super(id, children);
			this.type = "selector";
			this.operate = function(agentID){
				var childState;
				for(var child in this.children){
					childState = BehaviorTree.tick(this.children[child], agentID);
					if(childState === 3){
						return 3;
					}
					if(childState === 1){
						return 1;
					}
				}
				return 2;
			}
		}
	}

	export class BTSequence extends BTControlNode{
		constructor(id:string, children:BTNode[]){
			super(id, children);
			this.type = "sequence";
			this.operate = function(agentID){
				var childState;
				for(var child in this.children){
					childState = BehaviorTree.tick(this.children[child], agentID);
					if(childState === 3){
						return 3;
					}
					if(childState === 2){
						return 2;
					}
				}
				return 1;
			}
		}
	}

	export class BTParallel extends BTControlNode{
		constructor(id:string, children:BTNode[]){
			super(id, children);
			this.type = "parallel";
			this.operate = function(agentID){
				var successes = [], failures =[], childState, majority;
				for(var child in this.children){
					childState = BehaviorTree.tick(this.children[child], agentID);
					if(childState === 1){
						successes.push(childState);
					}
					if(childState === 2){
						failures.push(childState);
					}
				}
				majority = this.children.length / 2;
				if(successes.length >= majority){
					return 1;
				} else if (failures.length >= majority) {
					return 2;
				} else {
					return 3;
				}
			}
		}
	}

	export class BTCondition extends BTNode{
		public condition: Condition;
		constructor(id:string, condition){
			super(id);
			this.type = "condition";
			this.condition = condition;
			this.operate = function(agentID){
				var state;
				state = condition.check(condition.data[agentID][condition.key], condition.value);
				return state;
			}
		}
	}

	export class BTAction extends BTNode{
		public condition: Condition;
		public action : Function;
		constructor(id:string, condition, action: Function){
			super(id);
			this.type = "action";
			this.condition = condition;
			this.action = action;
			this.operate = function(agentID){
				var state;
				state = condition.check(condition.data[agentID][condition.key], condition.value);
				if(state === 1){
					this.action(condition.data[agentID]);
				}
				return state;
			}
		}
	}

	export interface Condition{
		key : string;
		value : any;
		check : Function;
		data : any[];
	}

}
