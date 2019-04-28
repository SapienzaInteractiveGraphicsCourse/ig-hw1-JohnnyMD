"use strict";

var canvas;
var gl;

var numVertices  = 36;
var numChecks    = 8;

var program;

var pointsArray     = [];
var colorsArray     = [];
var normalsArray    = [];
var texCoordsArray  = [];


var aspect       =  0.5;     // viewport aspect ratio
var fovy         =  90.0;    // field-of-view in Y direction angle (°)
var phi          =  25.0 * Math.PI / 180.0;
var theta        =  25.0 * Math.PI / 180.0;
var zNear        = -1.0 / 2 * (-1); // distance measured
var zFar         =  3.0 / 2;        // from CAMERA
var radius       =  1.0;

var ytop         =  1;
var bottom       = -ytop;
var right        =  ytop * aspect;
var left         = -right;

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
var defaultShadingModel = "1";                // 0 - Gouraud; 1 - Phong;
var shadingModel        = parseInt(defaultShadingModel);

var lightPosition     = vec4(-1.0,  1.0,  1.0,  0.0 );
var lightAmbient      = vec4( 0.2,  0.2,  0.2,  1.0 );
var lightDiffuse      = vec4( 0.8,  0.8,  0.8,  1.0 );
var lightSpecular     = vec4( 1.0,  1.0,  1.0,  1.0 );

var materialAmbient   = vec4( 1.0,  0.0,  1.0,  1.0 );
var materialDiffuse   = vec4( 1.0,  0.8,  0.0,  1.0);
var materialSpecular  = vec4( 1.0,  0.8,  0.0,  1.0 );
var materialShininess = 32.0;

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

var texCoord = [
        vec2(0, 0),
        vec2(0, 1),
        vec2(1, 1),
        vec2(1, 0)
    ];


var texSize = 16;
var image;

newImage(texSize);

function newImage(textureSize){
    // Create a checkerboard pattern using floats
    var imageArr = new Array();
    for (var i =0; i<textureSize; i++){
        imageArr[i] = new Array();
    }
    for (var i =0; i<textureSize; i++){
        for ( var j = 0; j < textureSize; j++){
           imageArr[i][j] = new Float32Array(4);
        }
    }
    for (var i =0; i<textureSize; i++) for (var j=0; j<textureSize; j++) {
        var c = (((i & 0x8) == 0) ^ ((j & 0x8)  == 0));
        imageArr[i][j] = [c, c, c, 1];
    }


    // Convert floats to ubytes for texture
    image = new Uint8Array(4 * texSize * texSize);
    for (var i=0; i<textureSize; i++){
        for (var j=0; j<textureSize; j++){
           for(var k=0; k<4; k++){
                image[4 * textureSize * i  +  4 * j  +  k] = 255 * imageArr[i][j][k];
           }
        }
    }
}

function quad(a, b, c, d) {
    /* Each quadrilater is drown as two triangles. */
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);


    pointsArray.push(vertices[a]);
    normalsArray.push(normal);
    //colorsArray.push(vertexColors[a]);
    colorsArray.push(vertexColors[a]);        
    texCoordsArray.push(texCoord[0]);


    pointsArray.push(vertices[b]);
    normalsArray.push(normal);
    //colorsArray.push(vertexColors[a]);
    colorsArray.push(vertexColors[b]);        
    texCoordsArray.push(texCoord[1]);


    pointsArray.push(vertices[c]);
    normalsArray.push(normal);
    //colorsArray.push(vertexColors[a]);
    colorsArray.push(vertexColors[c]);        
    texCoordsArray.push(texCoord[2]);




    pointsArray.push(vertices[a]);
    normalsArray.push(normal);
    //colorsArray.push(vertexColors[a]);
    colorsArray.push(vertexColors[a]);        
    texCoordsArray.push(texCoord[0]);


    pointsArray.push(vertices[c]);
    normalsArray.push(normal);
    //colorsArray.push(vertexColors[a]);
    colorsArray.push(vertexColors[c]);        
    texCoordsArray.push(texCoord[2]);


    pointsArray.push(vertices[d]);
    normalsArray.push(normal);
    //colorsArray.push(vertexColors[a]);
    colorsArray.push(vertexColors[d]);  
    texCoordsArray.push(texCoord[3]);
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


function configureTexture(image) {
    var texture = gl.createTexture();
    gl.activeTexture(  gl.TEXTURE0 );
    gl.bindTexture(    gl.TEXTURE_2D, texture );
    gl.pixelStorei(    gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(     gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri(  gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri(  gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
}



window.onload  =  function init() {
    document.getElementById("shadingModel").value = defaultShadingModel;

    // Get the canvas object
    canvas = document.getElementById( "gl-canvas" );

    // Check for WebGL availability
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // Set the viewport properties
    gl.viewport( 0, 0, canvas.width, canvas.height );

    // Init the aspect
    aspect = 0.5;   // because the splitted canvas;

    // Clear the screen area where to draw (use clip coordinates)(alpha component = 1 --- opaque)
    gl.clearColor( 1.0, 1.0, 1.0,  1.0 );

    // Tell WebGL to test the depth when drawing, so if something is behind, it won't be drawn;
    gl.enable(gl.DEPTH_TEST);

    
    /***  Load shaders and initialize attribute buffers ***/
    
    // Create the program object to identify and hold the two shaders 
    // in the application, considering the selected shadingModel.
    setShadingModel(defaultShadingModel);



    // get the range sliders for viewing parameters
    document.getElementById("range_phi").oninput        = function(event) {
        phi    = event.target.value * Math.PI / 180.0;
    };

    document.getElementById("range_theta").oninput      = function(event) {
        theta  = event.target.value * Math.PI / 180.0;
    };

    document.getElementById("range_radius").oninput     = function(event) {
        radius = event.target.value;
    };

    document.getElementById("range_zNear").oninput      = function(event) {
        zNear = -event.target.value / 2;
    };

    document.getElementById("range_zFar").oninput       = function(event) {
        zFar = event.target.value / 2;
    };

    document.getElementById("range_fovy").oninput       = function(event) {
        fovy = event.target.value;
    };

    document.getElementById("range_right").oninput       = function(event) {
        right   =  event.target.value / 2;
        left    = -event.target.value / 2;
    };

    document.getElementById("range_top").oninput       = function(event) {
        ytop    =  event.target.value / 2;
        bottom  = -event.target.value / 2;
    };

    document.getElementById("range_aspect").oninput       = function(event) {
        aspect = 0.5 * event.target.value;
    };

    document.getElementById("range_scale").oninput      = function(event) {
        scaleFactor = event.target.value;
        scaleVector = [ scaleFactor, scaleFactor, scaleFactor ]
    };


    document.getElementById("range_translateX").oninput =  function(event) {
        translationVector[0] = event.target.value;
        console.log("\n translationVector = [" + translationVector + "]");
    };

    document.getElementById("range_translateY").oninput =  function(event) {
        translationVector[1] = event.target.value;
        console.log("\n translationVector = [" + translationVector + "]");
    };

    document.getElementById("range_translateZ").oninput =  function(event) {
        translationVector[2] = event.target.value;
        console.log("\n translationVector = [" + translationVector + "]");
    };


    document.getElementById("shadingModel").onchange =  function(event) {
        shadingModel = parseInt(event.target.value);  // 0 - Gouraud; 1 - Phong; 
        setShadingModel(shadingModel);
    };

    document.getElementById("textureSize").onchange     =  function(event) {
        texSize = parseInt(event.target.value);
        newImage(texSize);
        configureTexture(image);
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

        // update the eye position (polar coordinates)(view position)
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


        var ambientProduct   = mult(lightAmbient,  materialAmbient);
        var diffuseProduct   = mult(lightDiffuse,  materialDiffuse);
        var specularProduct  = mult(lightSpecular, materialSpecular);

        gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"),  flatten(ambientProduct)  );
        gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"),  flatten(diffuseProduct)  );
        gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );
        gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"),   flatten(lightPosition)   );

        gl.uniform1f( gl.getUniformLocation(program, "shininess"), materialShininess );


        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    }


    const width  = gl.canvas.width;
    const height = gl.canvas.height;

    // draw the left scene ( ORTHOGRAPHIC projection )
    {        
        const projectionMatrix  =  ortho(left, right, bottom, ytop, zNear, zFar);
        
        gl.clearColor(1, 1, 1, 1);
        
        renderScene(0, 0, width/2, height, projectionMatrix);
    }


    // draw the right scene ( PERSPECTIVE projection )
    {        
        const projectionMatrix  =  perspective(fovy, aspect, zNear, zFar);
        
        gl.clearColor(1, 1, 1, 1);
        
        renderScene(width/2, 0,  width/2, height, projectionMatrix);
    }

    requestAnimFrame(render);
    
}


function setShadingModel(shadingModel){
    if(shadingModel == 0){
        program = initShaders( gl, "vertex-shader-gouraudShading", "fragment-shader-gouraudShading" );
    }else{
        program = initShaders( gl, "vertex-shader-phongShading", "fragment-shader-phongShading" );
    }

    gl.useProgram( program );

    console.log("\n shadingModel = " + shadingModel);
    // 0 - Gouraud; 1 - Phong; 
    

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

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);


    configureTexture(image);


    modelViewMatrixLoc   = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc  = gl.getUniformLocation( program, "projectionMatrix" );

    translationVectorLoc = gl.getUniformLocation(program, "t");
    scaleVectorLoc       = gl.getUniformLocation(program, "s");
}