
THREE.TextPath = function ( text, parameters ) {

	THREE.Path.call( this );

	this.parameters = parameters || {};
	this.set( text );

};


THREE.TextPath.prototype.set = function ( text, parameters ) {

	this.text = text;
	var parameters = parameters || this.parameters;

	var size = parameters.size !== undefined ? parameters.size : 100;
	var height = parameters.height !== undefined ? parameters.height : 50;
	var curveSegments = parameters.curveSegments !== undefined ? parameters.curveSegments: 4;

	var font = parameters.font !== undefined ? parameters.font : "helvetiker";
	var weight = parameters.weight !== undefined ? parameters.weight : "normal";
	var style = parameters.style !== undefined ? parameters.style : "normal";

	var bevelThickness = parameters.bevelThickness !== undefined ? parameters.bevelThickness : 10;
	var bevelSize = parameters.bevelSize !== undefined ? parameters.bevelSize : 8;
	var bevelEnabled = parameters.bevelEnabled !== undefined ? parameters.bevelEnabled : false;

	THREE.FontUtils.size = size;
	THREE.FontUtils.divisions = curveSegments;

	THREE.FontUtils.face = font;
	THREE.FontUtils.weight = weight;
	THREE.FontUtils.style = style;


};



THREE.TextPath.prototype.toShapes = function () {
	
	
	// Get a Font data json object

	var data = THREE.FontUtils.drawText( this.text );
	
	var paths = data.paths;
	var shapes = [];
	for (var p=0, pl = paths.length; p<pl; p++) {
		shapes = shapes.concat(paths[p].toShapes());
	}
	
	return shapes;

	//console.log(path);
	//console.log(fontShapes);
	
	// Either find actions or curves.
	
	//var text3d = new THREE.ExtrudeGeometry( shapes , { amount: 20, bevelEnabled:true, bevelThickness:3	} );

	//return text3d;
};
