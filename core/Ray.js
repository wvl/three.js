/**
 * @author mrdoob / http://mrdoob.com/
 */
(function(THREE){

	THREE.Ray = function ( origin, direction, near, far ) {

		this.origin = origin || new THREE.Vector3();
		this.direction = direction || new THREE.Vector3();
		this.near = near || 0;
		this.far = far || Infinity;

	};

	var originCopy = new THREE.Vector3();

	var localOriginCopy = new THREE.Vector3();
	var localDirectionCopy = new THREE.Vector3();

	var vector = new THREE.Vector3();
	var normal = new THREE.Vector3();
	var intersectPoint = new THREE.Vector3();

	var inverseMatrix = new THREE.Matrix4();

	var descSort = function ( a, b ) {

		return a.distance - b.distance;

	};

	var v0 = new THREE.Vector3(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3();

	var distanceFromIntersection = function ( origin, direction, position ) {

		v0.sub( position, origin );

		var dot = v0.dot( direction );

		var intersect = v1.add( origin, v2.copy( direction ).multiplyScalar( dot ) );
		var distance = position.distanceTo( intersect );

		return distance;

	};

	// http://www.blackpawn.com/texts/pointinpoly/default.html

	var pointInFace3 = function ( p, a, b, c ) {

		v0.sub( c, a );
		v1.sub( b, a );
		v2.sub( p, a );

		var dot00 = v0.dot( v0 );
		var dot01 = v0.dot( v1 );
		var dot02 = v0.dot( v2 );
		var dot11 = v1.dot( v1 );
		var dot12 = v1.dot( v2 );

		var invDenom = 1 / ( dot00 * dot11 - dot01 * dot01 );
		var u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom;
		var v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;

		return ( u >= 0 ) && ( v >= 0 ) && ( u + v < 1 );

	};

	//

	THREE.Ray.prototype.precision = 0.0001;

	THREE.Ray.prototype.intersectObject = function ( object, recursive ) {

		var intersect, intersects = [], distance;

		if ( recursive === true ) {

			for ( var i = 0, l = object.children.length; i < l; i ++ ) {

				Array.prototype.push.apply( intersects, this.intersectObject( object.children[ i ], recursive ) );

			}

		}

		if ( object instanceof THREE.Particle ) {

			distance = distanceFromIntersection( this.origin, this.direction, object.matrixWorld.getPosition() );

			if ( distance > object.scale.x ) {

				return [];

			}

			intersect = {

				distance: distance,
				point: object.position,
				face: null,
				object: object

			};

			intersects.push( intersect );

		} else if ( object instanceof THREE.Mesh ) {

			// Checking boundingSphere

			//var scale = THREE.Frustum.__v1.set( object.matrixWorld.getColumnX().length(), object.matrixWorld.getColumnY().length(), object.matrixWorld.getColumnZ().length() );
			var scaledRadius = object.geometry.boundingSphere.radius * object.matrixWorld.getMaxScaleOnAxis();

			// Checking distance to ray

			distance = distanceFromIntersection( this.origin, this.direction, object.matrixWorld.getPosition() );

			if ( distance > scaledRadius) {

				return intersects;

			}

			// Checking faces

			var f, fl, face, dot, scalar,
			geometry = object.geometry,
			vertices = geometry.vertices,
			objMatrix, geometryMaterials,
			isFaceMaterial, material, side, point;

			geometryMaterials = object.geometry.materials;
			isFaceMaterial = object.material instanceof THREE.MeshFaceMaterial;
			side = object.material.side;
			var a, b, c, d;
			var precision = this.precision;

			object.matrixRotationWorld.extractRotation( object.matrixWorld );

			originCopy.copy( this.origin );
			//directionCopy.copy( this.direction );

			objMatrix = object.matrixWorld;
			inverseMatrix.getInverse(objMatrix);

			localOriginCopy.copy(originCopy);
			inverseMatrix.multiplyVector3(localOriginCopy);

			localDirectionCopy.copy(this.direction);
			inverseMatrix.rotateAxis(localDirectionCopy).normalize();

			for ( f = 0, fl = geometry.faces.length; f < fl; f ++ ) {

				face = geometry.faces[ f ];

				material = isFaceMaterial === true ? geometryMaterials[ face.materialIndex ] : object.material;
				if ( material === undefined ) continue;
				side = material.side;

				vector.sub( face.centroid, localOriginCopy );
				normal = face.normal;
				dot = localDirectionCopy.dot( normal );

				// bail if ray and plane are parallel

				if ( Math.abs( dot ) < precision ) continue;

				// calc distance to plane

				scalar = normal.dot( vector ) / dot;

				// if negative distance, then plane is behind ray

				if ( scalar < 0 ) continue;

				if ( side === THREE.DoubleSide || ( side === THREE.FrontSide ? dot < 0 : dot > 0 ) ) {

					intersectPoint.add( localOriginCopy, localDirectionCopy.multiplyScalar( scalar ) );

					if ( face instanceof THREE.Face3 ) {

						a = vertices[ face.a ];
						b = vertices[ face.b ];
						c = vertices[ face.c ];

						if ( pointInFace3( intersectPoint, a, b, c ) ) {

							point = object.matrixWorld.multiplyVector3(intersectPoint.clone()); 
							distance = originCopy.distanceTo( point);

							if ( distance < this.near ) continue;
							if ( distance > this.far ) continue; 

							intersect = {

								distance: distance,
								point: point,
								face: face,
								faceIndex: f,
								object: object

							};

							intersects.push( intersect );

						}

					} else if ( face instanceof THREE.Face4 ) {

						a = vertices[ face.a ];
						b = vertices[ face.b ];
						c = vertices[ face.c ];
						d = vertices[ face.d ];

						if ( pointInFace3( intersectPoint, a, b, d ) || pointInFace3( intersectPoint, b, c, d ) ) {

							point = object.matrixWorld.multiplyVector3(intersectPoint.clone()); 
							distance = originCopy.distanceTo( point);

							if ( distance < this.near ) continue;
							if ( distance > this.far ) continue; 

							intersect = {

								distance: distance,
								point: point,
								face: face,
								faceIndex: f,
								object: object

							};

							intersects.push( intersect );

						}

					}

				}

			}

		}

		intersects.sort( descSort );

		return intersects;

	};

	THREE.Ray.prototype.intersectObjects = function ( objects, recursive ) {

		var intersects = [];

		for ( var i = 0, l = objects.length; i < l; i ++ ) {

			Array.prototype.push.apply( intersects, this.intersectObject( objects[ i ], recursive ) );

		}

		intersects.sort( descSort );

		return intersects;

	};

}(THREE));
