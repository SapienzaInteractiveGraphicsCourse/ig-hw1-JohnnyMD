"use strict";

var canvas;
var gl;

var numVertices  = 36;
var numChecks    = 8;

var program;

var c;

var flag         = true;

var pointsArray  = [];
var colorsArray  = [];
var normalsArray = [];

var thetaLoc;



var  aspect;                // viewport aspect ratio
var  fovy        = 90.0;    // field-of-view in Y direction angle (°)
var phi          =  25.0 * Math.PI / 180.0;
var theta        =  25.0 * Math.PI / 180.0;
var zNear        = -1.0 / 2 * (-1); // distance measured
var zFar         =  3.0 / 2;        // from CAMERA
var radius       =  1.0;

var dr           =  5.0 * Math.PI / 180.0;

var eye;

var modelViewMatrix,       projectionMatrix;
var modelViewMatrixLoc,    projectionMatrixLoc;

var translationVectorLoc,  scaleVectorLoc;
var translationVector = [ 0, 0, 0 ];
var scaleFactor       = 1;
var scaleVector       = [ 1, 1, 1 ];


// LookAt fixed parameters 
const at         = vec3(0.0, 0.0, 0.0);     // the camera looks at the center of the object
const up         = vec3(0.0, 0.2, 0.0);     // the camera orientation (Y) 


// Lighting and Shading
var shadingModel = 0;   // 0 - Gouraud; 1 - Phong;

var lightPosition     = vec4(-4.0,  4.0,  2.0,  0.0 );
var lightAmbient      = vec4( 0.2,  0.2,  0.2,  1.0 );
var lightDiffuse      = vec4( 1.0,  1.0,  1.0,  1.0 );
var lightSpecular     = vec4( 1.0,  1.0,  1.0,  1.0 );

var materialAmbient   = vec4( 1.0,  0.0,  1.0,  1.0 );
var materialDiffuse   = vec4( 1.0,  0.8,  0.0,  1.0);
var materialSpecular  = vec4( 1.0,  0.8,  0.0,  1.0 );
var materialShininess = 100.0;

var ambientColor, diffuseColor, specularColor;




var vertices     = [
        vec4( -0.2, -0.2,    0.2,   1.0 ),  // 0  // (x, y, z, _) //
        vec4( -0.2,  0.2,    0.2,   1.0 ),  // 1
        vec4(  0.2,  0.2,    0.2,   1.0 ),  // 2
        vec4(  0.2, -0.2,    0.2,   1.0 ),  // 3
        vec4( -0.2, -0.2,   -0.2,   1.0 ),  // 4
        vec4( -0.2,  0.2,   -0.2,   1.0 ),  // 5
        vec4(  0.2,  0.2,   -0.2,   1.0 ),  // 6
        vec4(  0.2, -0.2,   -0.2,   1.0 )   // 7
    ];

var vertexColors = [
        vec4(  0.0,  0.0,  0.0,  1.0 ),  // black
        vec4(  1.0,  0.0,  0.0,  1.0 ),  // red
        vec4(  1.0,  1.0,  0.0,  1.0 ),  // yellow
        vec4(  0.0,  1.0,  0.0,  1.0 ),  // green
        vec4(  0.0,  0.0,  1.0,  1.0 ),  // blue
        vec4(  1.0,  0.0,  1.0,  1.0 ),  // magenta
        vec4(  0.0,  1.0,  1.0,  1.0 ),  // white
        vec4(  0.0,  1.0,  1.0,  1.0 )   // cyan
    ];




function quad(a, b, c, d) {
    /* Each quadrilater is drown as two triangles. */
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);


    pointsArray.push(vertices[a]);
    normalsArray.push(normal);
    colorsArray.push(vertexColors[a]);
    //colorsArray.push(vertexColors[a]);    

    pointsArray.push(vertices[b]);
    normalsArray.push(normal);
    colorsArray.push(vertexColors[a]);
    //colorsArray.push(vertexColors[b]);    

    pointsArray.push(vertices[c]);
    normalsArray.push(normal);
    colorsArray.push(vertexColors[a]);
    //colorsArray.push(vertexColors[c]);    


    pointsArray.push(vertices[a]);
    normalsArray.push(normal);
    colorsArray.push(vertexColors[a]);
    //colorsArray.push(vertexColors[a]);    

    pointsArray.push(vertices[c]);
    normalsArray.push(normal);
    colorsArray.push(vertexColors[a]);
    //colorsArray.push(vertexColors[c]);    

    pointsArray.push(vertices[d]);
    normalsArray.push(normal);
    colorsArray.push(vertexColors[a]);
    //colorsArray.push(vertexColors[d]);    
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


window.onload  =  function init() {
    // Get the canvas object
    canvas = document.getElementById( "gl-canvas" );

    // Check for WebGL availability
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // Set the viewport properties
    gl.viewport( 0, 0, canvas.width, canvas.height );

    // Init the aspect
    aspect = canvas.width / canvas.height;    console.log("aspect = " + aspect);

    // Clear the screen area where to draw (use clip coordinates)(alpha component = 1 --- opaque)
    gl.clearColor( 1.0, 1.0, 1.0,  1.0 );

    // Tell WebGL to test the depth when drawing, so if something is behind, it won't be drawn;
    gl.enable(gl.DEPTH_TEST);

    
    /***  Load shaders and initialize attribute buffers ***/
    
    // Create the program object to identify and hold the two shaders in the application
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Push the vertexes and their colors in the corresponding arrays.
    colorCube();



    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );     // specify the data type in the vertex shaders;
    gl.enableVertexAttribArray( vColor );           // enable the vertex attributes that  are in the shaders;
    


    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );



    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );



    modelViewMatrixLoc   = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc  = gl.getUniformLocation( program, "projectionMatrix" );

    translationVectorLoc = gl.getUniformLocation(program, "t");
    scaleVectorLoc       = gl.getUniformLocation(program, "s");



    var ambientProduct   = mult(lightAmbient,  materialAmbient);
    var diffuseProduct   = mult(lightDiffuse,  materialDiffuse);
    var specularProduct  = mult(lightSpecular, materialSpecular);


    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),  flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),  flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),   flatten(lightPosition) );

    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);



    // get the range sliders for viewing parameters
    document.getElementById("range_phi").onchange    = function(event) {
        phi    = event.target.value * Math.PI / 180.0;
    };

    document.getElementById("range_theta").onchange  = function(event) {
        theta  = event.target.value * Math.PI / 180.0;
    };

    document.getElementById("range_radius").onchange = function(event) {
        radius = event.target.value;
    };

    document.getElementById("range_zNear").onchange = function(event) {
        zNear = -event.target.value / 2;
    };

    document.getElementById("range_zFar").onchange = function(event) {
        zFar = event.target.value / 2;
    };

    document.getElementById("range_fovy").onchange = function(event) {
        fovy = event.target.value;
    };


    document.getElementById("range_scale").onchange = function(event) {
        scaleFactor = event.target.value;
        scaleVector = [ scaleFactor, scaleFactor, scaleFactor ]
    };


    document.getElementById("range_translateX").onchange =  function(event) {
        translationVector[0] = event.target.value;
        console.log("\n translationVector = [" + translationVector + "]");
    };

    document.getElementById("range_translateY").onchange =  function(event) {
        translationVector[1] = event.target.value;
        console.log("\n translationVector = [" + translationVector + "]");
    };

    document.getElementById("range_translateZ").onchange =  function(event) {
        translationVector[2] = event.target.value;
        console.log("\n translationVector = [" + translationVector + "]");
    };


    document.getElementById("shadingModel").onchange =  function(event) {
        shadingModel = event.target.value;
        console.log("\n shadingModel = " + shadingModel);
    };


    // recursevly call render()
    render();
}


var render = function() {
    function renderScene(X, Y, width, height, projectionMatrix) {
        gl.enable(gl.SCISSOR_TEST);             // Only pixels that lie within the scissor box
        gl.viewport(X, Y, width, height);       //         can be modified by drawing commands;
        gl.scissor(X, Y, width, height);        // Define the scissor box;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // update the eye position (polar coordinates)
        eye = vec3( radius * Math.sin(theta) * Math.cos(phi),
                    radius * Math.sin(theta) * Math.sin(phi),
                    radius * Math.cos(theta) );

        // compute the modelViewMatrix 
        modelViewMatrix  = lookAt(eye, at, up);

        // send the model-view and the projection matrix to the vertex shader (VS)
        gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(modelViewMatrix));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

        // send the translation and scale vectors
        gl.uniform3fv(translationVectorLoc, translationVector);
        gl.uniform3fv(scaleVectorLoc, scaleVector);


        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    }


    const width  = gl.canvas.width;
    const height = gl.canvas.height;
    const aspect = (width / 2) / height;  // 1;

    // draw left scene ( ORTHOGRAPHIC projection )
    {
        const top         =  1;
        const bottom      = -top;
        const right       =  top * aspect;
        const left        = -right;
        
        const projectionMatrix  =  ortho(left, right, bottom, top, zNear, zFar);
        
        gl.clearColor(1, 1, 1, 1);
        
        renderScene(0, 0, width/2, height, projectionMatrix);
    }


    // draw right scene ( PERSPECTIVE projection )
    {        
        const projectionMatrix  =  perspective(fovy, aspect, zNear, zFar);
        
        gl.clearColor(1, 1, 1, 1);
        
        renderScene(width/2, 0,  width/2, height, projectionMatrix);
    }

    requestAnimFrame(render);
    
}