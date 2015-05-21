var diagram = $("#diagram");

var controls = $("#controls");


var init = function () {
	getProperties(popData);
	visit(BHTree.root, listIDs);
	setChildrenOptions(ids);
};

var addNode = function (node) {
	node = $(node).serializeArray();
	
	var nodeJSON = {
		"id" : node[0].value,
		"type" : node[1].value,
		"children" : node[2].value || null,
		"condition" : { "key": node[3].value || null, "check" : node[4].value || null, "value" : node[5].value},
		"action" : node[4].value || null 
	}
	
	node = QKit.BehaviorTree.fromJSON([nodeJSON]);
	var el = {
		type : "vertConnects",
		header : "<div>" + node.id + "</div><div class='bh-tree-type'>" + node.type + "</div>",
		entityId : node.id
	};
	el.outputs = node.children === undefined ? undefined : true;
	diagram.wyard('addEntity', el);
};



var ids = [];
var visit = function(node, cb){
	cb(node);
	if (node.children !== null) {
		for (var c in node.children) {
			visit(node.children[c], cb);
		}
	}
};

var listIDs = function(node){
	ids.push(node.id);
};

var byID = function(node){
	if(node.id === id){
		return node;
	}
}

var getProperties = function(data){
	var props = [];
	for (var prop in data[0]){
		props.push(prop);
		$("#node-cond-prop").append(
			"<option>" + prop +  "</option>"
		);
	}
	
}

var setChildrenOptions = function(data){
	for(var i = 0; i < data.length; i++){
		$("#node-children").append(
			"<option>" + data[i] +  "</option>"
		);
	}	
};

init();