/**
 * @author mr.doob / http://mrdoob.com/
 *
 * parameters = {
 *  color: <hex>,
 *  program: <function>,
 *  opacity: <float>,
 *  blending: THREE.NormalBlending
 * }
 */

THREE.ParticleCanvasMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );

	parameters = parameters || {};

	this.color = parameters.color !== undefined ? new THREE.Color( parameters.color ) : new THREE.Color( 0xffffff );
	this.program = parameters.program !== undefined ? parameters.program : function ( context, color ) {};

};

THREE.ParticleCanvasMaterial.prototype = Object.create( THREE.Material.prototype );

THREE.ParticleCanvasMaterial.prototype.clone = function(){ 
	var returnValue = new THREE.ParticleCanvasMaterial(this);
	return returnValue;
};