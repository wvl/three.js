/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.GeometryUtils = {

	// Merge two geometries or geometry and geometry from object (using object's transform)

	merge: function ( geometry1, object2 /* mesh | geometry */ ) {

		var matrix, matrixRotation,
		vertexOffset = geometry1.vertices.length,
		uvPosition = geometry1.faceVertexUvs[ 0 ].length,
		geometry2 = object2 instanceof THREE.Mesh ? object2.geometry : object2,
		vertices1 = geometry1.vertices,
		vertices2 = geometry2.vertices,
		faces1 = geometry1.faces,
		faces2 = geometry2.faces,
		uvs1 = geometry1.faceVertexUvs[ 0 ],
		uvs2 = geometry2.faceVertexUvs[ 0 ];

		var geo1MaterialsMap = {};

		for ( var i = 0; i < geometry1.materials.length; i ++ ) {

			var id = geometry1.materials[ i ].id;

			geo1MaterialsMap[ id ] = i;

		}


		if ( object2 instanceof THREE.Mesh ) {

			object2.matrixAutoUpdate && object2.updateMatrix();

			matrix = object2.matrix;
			matrixRotation = new THREE.Matrix4();
			matrixRotation.extractRotation( matrix, object2.scale );

		}

		// vertices

		for ( var i = 0, il = vertices2.length; i < il; i ++ ) {

			var vertex = vertices2[ i ];

			var vertexCopy = vertex.clone();

			if ( matrix ) matrix.multiplyVector3( vertexCopy.position );

			vertices1.push( vertexCopy );

		}

		// faces

		for ( i = 0, il = faces2.length; i < il; i ++ ) {

			var face = faces2[ i ], faceCopy, normal, color,
			faceVertexNormals = face.vertexNormals,
			faceVertexColors = face.vertexColors;

			if ( face instanceof THREE.Face3 ) {

				faceCopy = new THREE.Face3( face.a + vertexOffset, face.b + vertexOffset, face.c + vertexOffset );

			} else if ( face instanceof THREE.Face4 ) {

				faceCopy = new THREE.Face4( face.a + vertexOffset, face.b + vertexOffset, face.c + vertexOffset, face.d + vertexOffset );

			}

			faceCopy.normal.copy( face.normal );

			if ( matrixRotation ) matrixRotation.multiplyVector3( faceCopy.normal );

			for ( var j = 0, jl = faceVertexNormals.length; j < jl; j ++ ) {

				normal = faceVertexNormals[ j ].clone();

				if ( matrixRotation ) matrixRotation.multiplyVector3( normal );

				faceCopy.vertexNormals.push( normal );

			}

			faceCopy.color.copy( face.color );

			for ( var j = 0, jl = faceVertexColors.length; j < jl; j ++ ) {

				color = faceVertexColors[ j ];
				faceCopy.vertexColors.push( color.clone() );

			}

			if ( face.materialIndex !== undefined ) {

				var material2 = geometry2.materials[ face.materialIndex ];
				var materialId2 = material2.id;

				var materialIndex = geo1MaterialsMap[ materialId2 ];

				if ( materialIndex === undefined ) {

					materialIndex = geometry1.materials.length;
					geo1MaterialsMap[ materialId2 ] = materialIndex;

					geometry1.materials.push( material2 );

				}

				faceCopy.materialIndex = materialIndex;

			}

			faceCopy.centroid.copy( face.centroid );
			if ( matrix ) matrix.multiplyVector3( faceCopy.centroid );

			faces1.push( faceCopy );

		}

		// uvs

		for ( i = 0, il = uvs2.length; i < il; i ++ ) {

			var uv = uvs2[ i ], uvCopy = [];

			for ( var j = 0, jl = uv.length; j < jl; j ++ ) {

				uvCopy.push( new THREE.UV( uv[ j ].u, uv[ j ].v ) );

			}

			uvs1.push( uvCopy );

		}

	},

	clone: function ( geometry ) {

		var cloneGeo = new THREE.Geometry();

		var i, il;

		var vertices = geometry.vertices,
			faces = geometry.faces,
			uvs = geometry.faceVertexUvs[ 0 ];

		// materials

		if ( geometry.materials ) {

			cloneGeo.materials = geometry.materials.slice();

		}

		// vertices

		for ( i = 0, il = vertices.length; i < il; i ++ ) {

			var vertex = vertices[ i ];
			var vertexCopy = new THREE.Vertex( vertex.position.clone() );

			cloneGeo.vertices.push( vertexCopy );

		}

		// faces

		for ( i = 0, il = faces.length; i < il; i ++ ) {

			var face = faces[ i ], faceCopy, normal, color,
			faceVertexNormals = face.vertexNormals,
			faceVertexColors = face.vertexColors;

			if ( face instanceof THREE.Face3 ) {

				faceCopy = new THREE.Face3( face.a, face.b, face.c );

			} else if ( face instanceof THREE.Face4 ) {

				faceCopy = new THREE.Face4( face.a, face.b, face.c, face.d );

			}

			faceCopy.normal.copy( face.normal );

			for ( var j = 0, jl = faceVertexNormals.length; j < jl; j ++ ) {

				normal = faceVertexNormals[ j ];
				faceCopy.vertexNormals.push( normal.clone() );

			}

			faceCopy.color.copy( face.color );

			for ( var j = 0, jl = faceVertexColors.length; j < jl; j ++ ) {

				color = faceVertexColors[ j ];
				faceCopy.vertexColors.push( color.clone() );

			}

			faceCopy.materialIndex = face.materialIndex;

			faceCopy.centroid.copy( face.centroid );

			cloneGeo.faces.push( faceCopy );

		}

		// uvs

		for ( i = 0, il = uvs.length; i < il; i ++ ) {

			var uv = uvs[ i ], uvCopy = [];

			for ( var j = 0, jl = uv.length; j < jl; j ++ ) {

				uvCopy.push( new THREE.UV( uv[ j ].u, uv[ j ].v ) );

			}

			cloneGeo.faceVertexUvs[ 0 ].push( uvCopy );

		}

		return cloneGeo;

	},

	// Get random point in triangle (via barycentric coordinates)
	// 	(uniform distribution)
	// 	http://www.cgafaq.info/wiki/Random_Point_In_Triangle

	randomPointInTriangle: function ( vectorA, vectorB, vectorC ) {

		var a, b, c,
			point = new THREE.Vector3(),
			tmp = THREE.GeometryUtils.__v1;

		a = THREE.GeometryUtils.random();
		b = THREE.GeometryUtils.random();

		if ( ( a + b ) > 1 ) {

			a = 1 - a;
			b = 1 - b;

		}

		c = 1 - a - b;

		point.copy( vectorA );
		point.multiplyScalar( a );

		tmp.copy( vectorB );
		tmp.multiplyScalar( b );

		point.addSelf( tmp );

		tmp.copy( vectorC );
		tmp.multiplyScalar( c );

		point.addSelf( tmp );

		return point;

	},

	// Get random point in face (triangle / quad)
	// (uniform distribution)

	randomPointInFace: function ( face, geometry, useCachedAreas ) {

		var vA, vB, vC, vD;

		if ( face instanceof THREE.Face3 ) {

			vA = geometry.vertices[ face.a ].position;
			vB = geometry.vertices[ face.b ].position;
			vC = geometry.vertices[ face.c ].position;

			return THREE.GeometryUtils.randomPointInTriangle( vA, vB, vC );

		} else if ( face instanceof THREE.Face4 ) {

			vA = geometry.vertices[ face.a ].position;
			vB = geometry.vertices[ face.b ].position;
			vC = geometry.vertices[ face.c ].position;
			vD = geometry.vertices[ face.d ].position;

			var area1, area2;

			if ( useCachedAreas ) {

				if ( face._area1 && face._area2 ) {

					area1 = face._area1;
					area2 = face._area2;

				} else {

					area1 = THREE.GeometryUtils.triangleArea( vA, vB, vD );
					area2 = THREE.GeometryUtils.triangleArea( vB, vC, vD );

					face._area1 = area1;
					face._area2 = area2;

				}

			} else {

				area1 = THREE.GeometryUtils.triangleArea( vA, vB, vD ),
				area2 = THREE.GeometryUtils.triangleArea( vB, vC, vD );

			}

			var r = THREE.GeometryUtils.random() * ( area1 + area2 );

			if ( r < area1 ) {

				return THREE.GeometryUtils.randomPointInTriangle( vA, vB, vD );

			} else {

				return THREE.GeometryUtils.randomPointInTriangle( vB, vC, vD );

			}

		}

	},

	// Get uniformly distributed random points in mesh
	// 	- create array with cumulative sums of face areas
	//  - pick random number from 0 to total area
	//  - find corresponding place in area array by binary search
	//	- get random point in face

	randomPointsInGeometry: function ( geometry, n ) {

		var face, i,
			faces = geometry.faces,
			vertices = geometry.vertices,
			il = faces.length,
			totalArea = 0,
			cumulativeAreas = [],
			vA, vB, vC, vD;

		// precompute face areas

		for ( i = 0; i < il; i ++ ) {

			face = faces[ i ];

			if ( face instanceof THREE.Face3 ) {

				vA = vertices[ face.a ].position;
				vB = vertices[ face.b ].position;
				vC = vertices[ face.c ].position;

				face._area = THREE.GeometryUtils.triangleArea( vA, vB, vC );

			} else if ( face instanceof THREE.Face4 ) {

				vA = vertices[ face.a ].position;
				vB = vertices[ face.b ].position;
				vC = vertices[ face.c ].position;
				vD = vertices[ face.d ].position;

				face._area1 = THREE.GeometryUtils.triangleArea( vA, vB, vD );
				face._area2 = THREE.GeometryUtils.triangleArea( vB, vC, vD );

				face._area = face._area1 + face._area2;

			}

			totalArea += face._area;

			cumulativeAreas[ i ] = totalArea;

		}

		// binary search cumulative areas array

		function binarySearchIndices( value ) {

			function binarySearch( start, end ) {

				// return closest larger index
				// if exact number is not found

				if ( end < start )
					return start;

				var mid = start + Math.floor( ( end - start ) / 2 );

				if ( cumulativeAreas[ mid ] > value ) {

					return binarySearch( start, mid - 1 );

				} else if ( cumulativeAreas[ mid ] < value ) {

					return binarySearch( mid + 1, end );

				} else {

					return mid;

				}

			}

			var result = binarySearch( 0, cumulativeAreas.length - 1 )
			return result;

		}

		// pick random face weighted by face area

		var r, index,
			result = [];

		var stats = {};

		for ( i = 0; i < n; i ++ ) {

			r = THREE.GeometryUtils.random() * totalArea;

			index = binarySearchIndices( r );

			result[ i ] = THREE.GeometryUtils.randomPointInFace( faces[ index ], geometry, true );

			if ( ! stats[ index ] ) {

				stats[ index ] = 1;

			} else {

				stats[ index ] += 1;

			}

		}

		return result;

	},

	// Get triangle area (by Heron's formula)
	// 	http://en.wikipedia.org/wiki/Heron%27s_formula

	triangleArea: function ( vectorA, vectorB, vectorC ) {

		var s, a, b, c,
			tmp = THREE.GeometryUtils.__v1;

		tmp.sub( vectorA, vectorB );
		a = tmp.length();

		tmp.sub( vectorA, vectorC );
		b = tmp.length();

		tmp.sub( vectorB, vectorC );
		c = tmp.length();

		s = 0.5 * ( a + b + c );

		return Math.sqrt( s * ( s - a ) * ( s - b ) * ( s - c ) );

	},

	// Center geometry so that 0,0,0 is in center of bounding box

	center: function ( geometry ) {

		geometry.computeBoundingBox();

		var bb = geometry.boundingBox;

		var offset = new THREE.Vector3();

		offset.add( bb.min, bb.max );
		offset.multiplyScalar( -0.5 );

		geometry.applyMatrix( new THREE.Matrix4().setTranslation( offset.x, offset.y, offset.z ) );
		geometry.computeBoundingBox();

		return offset;

	},

	// Normalize UVs to be from <0,1>
	// (for now just the first set of UVs)

	normalizeUVs: function ( geometry ) {

		var uvSet = geometry.faceVertexUvs[ 0 ];

		for ( var i = 0, il = uvSet.length; i < il; i ++ ) {

			var uvs = uvSet[ i ];

			for ( var j = 0, jl = uvs.length; j < jl; j ++ ) {

				// texture repeat

				if( uvs[ j ].u !== 1.0 ) uvs[ j ].u = uvs[ j ].u - Math.floor( uvs[ j ].u );
				if( uvs[ j ].v !== 1.0 ) uvs[ j ].v = uvs[ j ].v - Math.floor( uvs[ j ].v );

			}

		}

	},

	triangulateQuads: function ( geometry ) {

		for ( var i = geometry.faces.length - 1; i >= 0; i -- ) {

			var face = geometry.faces[ i ];

			if ( face instanceof THREE.Face4 ) {

				var a = face.a;
				var b = face.b;
				var c = face.c;
				var d = face.d;

				var triA = new THREE.Face3( a, b, d );
				var triB = new THREE.Face3( b, c, d );

				triA.materialIndex = triB.materialIndex = face.materialIndex;

				triA.color.copy( face.color );
				triB.color.copy( face.color );

				if ( face.vertexColors.length === 4 ) {

					var cA = face.vertexColors[ 0 ];
					var cB = face.vertexColors[ 1 ];
					var cC = face.vertexColors[ 2 ];
					var cD = face.vertexColors[ 3 ];

					triA.vertexColors[ 0 ] = cA.clone();
					triA.vertexColors[ 1 ] = cB.clone();
					triA.vertexColors[ 2 ] = cD.clone();

					triB.vertexColors[ 0 ] = cB.clone();
					triB.vertexColors[ 1 ] = cC.clone();
					triB.vertexColors[ 2 ] = cD.clone();

				}

				geometry.faces.splice( i, 1, triA, triB );

				for ( var j = 0; j < geometry.faceVertexUvs.length; j ++ ) {

					if ( geometry.faceVertexUvs[ j ].length ) {

						var faceVertexUvs = geometry.faceVertexUvs[ j ][ i ];

						var uvA = faceVertexUvs[ 0 ];
						var uvB = faceVertexUvs[ 1 ];
						var uvC = faceVertexUvs[ 2 ];
						var uvD = faceVertexUvs[ 3 ];

						var uvsTriA = [ uvA.clone(), uvB.clone(), uvD.clone() ];
						var uvsTriB = [ uvB.clone(), uvC.clone(), uvD.clone() ];

						geometry.faceVertexUvs[ j ].splice( i, 1, uvsTriA, uvsTriB );

					}

				}

				for ( var j = 0; j < geometry.faceUvs.length; j ++ ) {

					if ( geometry.faceUvs[ j ].length ) {

						var faceUv = geometry.faceUvs[ j ][ i ];

						geometry.faceUvs[ j ].splice( i, 1, faceUv, faceUv );

					}

				}

			}

		}

		geometry.computeCentroids();
		geometry.computeFaceNormals();
		geometry.computeVertexNormals();

		if ( geometry.hasTangents ) geometry.computeTangents();

	},

	// Make all faces use unique vertices
	// so that each face can be separated from others

	explode: function( geometry ) {

		var vertices = [];

		for ( var i = geometry.faces.length - 1; i >= 0; i -- ) {

			var n = vertices.length;

			var face = geometry.faces[ i ];

			if ( face instanceof THREE.Face4 ) {

				var a = face.a;
				var b = face.b;
				var c = face.c;
				var d = face.d;

				var va = geometry.vertices[ a ];
				var vb = geometry.vertices[ b ];
				var vc = geometry.vertices[ c ];
				var vd = geometry.vertices[ d ];

				vertices.push( va.clone() );
				vertices.push( vb.clone() );
				vertices.push( vc.clone() );
				vertices.push( vd.clone() );

				face.a = n;
				face.b = n + 1;
				face.c = n + 2;
				face.d = n + 3;

			} else {

				var a = face.a;
				var b = face.b;
				var c = face.c;

				var va = geometry.vertices[ a ];
				var vb = geometry.vertices[ b ];
				var vc = geometry.vertices[ c ];

				vertices.push( va.clone() );
				vertices.push( vb.clone() );
				vertices.push( vc.clone() );

				face.a = n;
				face.b = n + 1;
				face.c = n + 2;

			}

		}

		geometry.vertices = vertices;

	}

};

THREE.GeometryUtils.random = THREE.Math.random16;

THREE.GeometryUtils.__v1 = new THREE.Vector3();
