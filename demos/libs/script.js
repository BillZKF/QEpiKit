var diagram = $("#diagram");

var controls = $("#controls");


var init = function () {
	getProperties(popData);
	getChildByID(BHTree.root, "select-obese");
};

var addNode = function (nodeJSON) {
	var node = QKit.loadFromJSON(nodeJSON);
	var el = {
		type: "vertConnects",
		header: node.id,
		entityId: node.id
	};
	el.outputs = node.children === undefined ? undefined : true;
	diagram.wyard('addEntity', el);
};

var getChildByID = function (node, id) {
	if(node.id === id){
		return node;
	}
	if (node.children !== null) {
		for (var c in node.children) {
			getChildByID(node.children[c], id);
		}
	}
};

var getProperties = function(data){
	var props = [];
	for (var prop in data[0]){
		props.push(prop);
		$("#node-cond-prop").append(
			"<option>" + prop +  "</option>"
		);
	}
	//bht.props = props;
}

//init();