var mat4 = glMatrix.mat4;
var mat3 = glMatrix.mat4;
var vec3 = glMatrix.vec3;
var vec4 = glMatrix.vec4;
var ext = null;

// ****************** Variables Globales ******
let gl = null,
  canvas = null,
  glProgram = null,
  glProgram_2 = null,
  fragmentShader = null,
  vertexShader = null,
  vertexShader_2 = null;

//-- Atributos y buffers para las ramas --
var positionLocatAttrib = null,
  colorLocatAttrib = null,
  wallVertexBuffer = null,
  colorsBuffer = null;
// Atributos y buffers instancia
var treePointsAttrib = null,
  treeScaleAttrib = null,
  treeRotateAttrib = null,
  treePointsBuffer = null,
  treeScaleBuffer = null,
  treeRotateBuffer = null;

//-- Matrices rotacion y proyeccion --
var MvMatrix = null,
    SMatrix = null,
    CMatrix = null,
    PMatrix = null;
// Atributos shaders, Matrices
var uMvMatrix = null,
    uSMatrix = null,
    uCMatrix = null,
    uPMatrix = null;


//-- Atributos y buffers para las Hojas
var leavesVertexAttrib = null,
  leavesColorAttrib = null,
  leavesVertexBuffer = null,
  leavesColorBuffer = null;

//-- Matrices rotacion y proyeccion --
// Atributos shaders, Matrices
var uMvMatrix_leaves = null,
    uSMatrix_leaves = null,
    uCMatrix_leaves = null,
    uPMatrix_leaves = null;


// Camara
var camera = {
  eye: CAMERA.EYE,
  target: CAMERA.TARGET,
  up: CAMERA.UP,
  fov_y: CAMERA.FOV_Y,
  aspect: CAMERA.ASPECT,
  near: CAMERA.NEAR,
  far: CAMERA.FAR
}

var tree = {};


/********************* 0. UTILIDADES **************************************/
/******   FunCiones de inicialización de matrices  ********* */

function inicializarMatrices() {
  PMatrix = mat4.create();
  mat4.perspective(PMatrix, camera.fov_y, camera.aspect, camera.near, camera.far);

  CMatrix = mat4.create();
  mat4.lookAt(CMatrix, camera.eye, camera.target, camera.up);

  MvMatrix = mat4.create();
  var idMatrix = mat4.create();
  var v = vec3.create();

  var mx = Math.max(canvas.width,canvas.height);
  vec3.set(v, 0.2, 0.2, 0.2);
  mat4.fromScaling(idMatrix, v);
  mat4.multiply(MvMatrix, idMatrix, MvMatrix);

  reshapeMatrix(canvas);


}

function reshapeMatrix(canvas){
  SMatrix = mat4.create();
  var idMatrix = mat4.create();
  var v = vec3.create();

  vec3.set(v, 2000/canvas.width, 2000/canvas.height, 1);
  mat4.fromScaling(idMatrix, v);
  mat4.multiply(SMatrix, idMatrix, SMatrix);
}



/********************* 1. INIT WEBGL **************************************/
function initWebGL() {

  canvas = document.getElementById("canvas");
  gl = canvas.getContext("webgl",{
    antialias: true,
  });

  var antialias = gl.getContextAttributes().antialias;

  var size = gl.getParameter(gl.SAMPLES);
  console.log(antialias,size);

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  if (gl) {

    setupWebGL();
    initShaders();
    deteccionEventos();
    setupFractal();
    setupBuffers();
    setupLocations();
    drawScene();
    animacion();
  } else {
    alert("El navegador no soporta WEBGL.");
  }
}
/********************* 2.setup WEBGL **************************************/
function setupWebGL() {
  //Pone el color de fondo a verde ---para 2d no funciona
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  //Crea un viewport del tamaño del canvas
  gl.viewport(0, 0, canvas.width, canvas.height);

  // Modo ON DEPTH
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  //Inicializarmatrices de movimeinto
  inicializarMatrices();

  //gl.enable ACTIVA una serie de caracteristicas tan variadas como:
  // a) Mezcla de colores (pordefecto está activado)
  gl.enable(gl.BLEND);
  // b) CullFace (me desaparecen tres triangulos o no, jugar con el CCW y EL CW)
  //gl.enable(gl.CULL_FACE);

  //Perspectiva

  // Para funciones de instancias
  ext = gl.getExtension('ANGLE_instanced_arrays');

  gl.enable(gl.SAMPLE_COVERAGE);
  gl.sampleCoverage(1, false);




}
/********************* 3. INIT SHADER **************************************/
function initShaders() {
  // Esta función inicializa los shaders

  //1.Obtengo la referencia de los shaders
  let vs_source = document.getElementById('vertex-shader').innerHTML;
  let vs_source_2 = document.getElementById('vertex-shader-leaves').innerHTML;
  let fs_source = document.getElementById('fragment-shader').innerHTML;


  //2. Compila los shaders
  vertexShader = makeShader(vs_source, gl.VERTEX_SHADER);
  vertexShader_2 = makeShader(vs_source_2, gl.VERTEX_SHADER);
  fragmentShader = makeShader(fs_source, gl.FRAGMENT_SHADER);

  //3. Crea un programa
  glProgram = gl.createProgram();
  glProgram_2 = gl.createProgram();

  //4. Adjunta al programa cada shader
  gl.attachShader(glProgram, vertexShader);
  gl.attachShader(glProgram, fragmentShader);
  gl.linkProgram(glProgram);

  // Segundo shader
  gl.attachShader(glProgram_2, vertexShader_2);
  gl.attachShader(glProgram_2, fragmentShader);
  gl.linkProgram(glProgram_2);

  if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS) ||
    !gl.getProgramParameter(glProgram_2, gl.LINK_STATUS)) {
    alert("No se puede inicializar el Programa .");
  }


}

/********************* 3.1. MAKE SHADER **************************************/
function makeShader(src, type) {
  //Compila cada  shader
  let shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("Error de compilación del shader: " + gl.getShaderInfoLog(shader));
  }
  return shader;
}


/********************* 4.0 SETUP FRACTAL *************************************/
function setupFractal() {
  var obj = OBJECTS[objectType][objectIndex];
  var fract = fractal(obj, objectTimes);
  tree.branches = fract.branches;
  tree.leaves = fract.leaves.map((p)=>p.map((v)=>v.pos));


  tree.points = tree.branches.map(
    (b) => b.map(
      (p, i) => i + 1 == b.length ? null : add(p.pos, b[i + 1].pos).map((s) => s / 2)
    ).slice(0, -1)
  ).flat();

  var means = tree.points.reduce((tot, x) => add(tot, x)).map((v) => v / tree.points.length);
  tree.points = tree.points.map((v) => sub(v, means)).flat();

  tree.scale = tree.branches.map((b) => b.map((p) => p.sca).slice(0,-1)).flat().flat();
  tree.rotate = tree.branches.map((b) => b.map((p) => p.rot).slice(1)).flat().flat();

  // COLORES
  tree.colors = tree.branches.map((b) => b.map((p) => p.col).slice(0, -1)).flat().map(
    (i) => (i < obj.base_colors.length ? obj.base_colors[i] : obj.base_colors[obj.base_colors.length - 1]
    ).map((x)=>x/256)
  ).flat();


  tree.leaves = tree.leaves.map(function(p){
    if(p.length>3){
      var pn=[];

      for(var i=1;i<p.length-1;i++){
        pn.push(p[0],p[i],p[i+1]);
      }
      return pn;
    }
    return p;
  });

  tree.leaves = tree.leaves.map((p) => p.map((v) => sub(v, means)).flat()).flat();
  tree.leaves_colors = fract.leaves.map((p)=>p.map(
    (o)=> (o.col < obj.base_colors.length ? obj.base_colors[o.col] : obj.base_colors[obj.base_colors.length - 1]).map((x)=>x/256)
  )).flat().flat().flat();

  console.log("Leaves: ", tree.leaves);
  console.log("Leaves Colors: ", tree.leaves_colors);
  console.log("Points: ", tree.points);
  console.log("Colors: ", tree.colors);
  console.log("Scale: ", tree.scale);
  console.log("Rotate: ", tree.rotate);

}

/********************* 5. SETUP BUFFERS  **************************************/
function setupBuffers() {
  var prism = generatePrism(PRISM_RADIUS, PRISM_LENGTH, PRISM_N);
  console.log(prism);

  gl.useProgram(glProgram);
  //BUFFER PARA POSICIONES DEL PRISMA
  wallVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, wallVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(prism.wall), gl.STATIC_DRAW);


  // Caracteristicas de Instancia
  treePointsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, treePointsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tree.points), gl.STATIC_DRAW);
  treeScaleBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, treeScaleBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tree.scale), gl.STATIC_DRAW);
  treeRotateBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, treeRotateBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tree.rotate), gl.STATIC_DRAW);
  colorsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tree.colors), gl.STATIC_DRAW);

  //---------------- Hojas ------------------
  gl.useProgram(glProgram_2);
  leavesVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, leavesVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tree.leaves), gl.STATIC_DRAW);


  leavesColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, leavesColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tree.leaves_colors), gl.STATIC_DRAW);

}


function setupLocations() {

  gl.useProgram(glProgram);
  //Busca dónde debe ir la posicion de los vértices en el programa.
  positionLocatAttrib = gl.getAttribLocation(glProgram, "aVertexPosition");
  colorLocatAttrib = gl.getAttribLocation(glProgram, "aVertexColor");
  treePointsAttrib = gl.getAttribLocation(glProgram, "aSegmentPoint");
  treeScaleAttrib = gl.getAttribLocation(glProgram, "aSegmentScale");
  treeRotateAttrib = gl.getAttribLocation(glProgram, "aSegmentRotate");

  // Localiza la matriz en el glProgram
  uMvMatrix = gl.getUniformLocation(glProgram, 'uMvMatrix');
  uSMatrix = gl.getUniformLocation(glProgram, 'uSMatrix');
  uCMatrix = gl.getUniformLocation(glProgram, 'uCMatrix');
  uPMatrix = gl.getUniformLocation(glProgram, 'uPMatrix');

  gl.useProgram(glProgram_2);
  // Igual para el segundo shader
  leavesVertexAttrib = gl.getAttribLocation(glProgram_2, "aVertexPosition");
  leavesColorAttrib = gl.getAttribLocation(glProgram_2, "aVertexColorL");
  uMvMatrix_leaves = gl.getUniformLocation(glProgram_2, 'uMvMatrix');
  uSMatrix_leaves = gl.getUniformLocation(glProgram_2, 'uSMatrix');
  uCMatrix_leaves = gl.getUniformLocation(glProgram_2, 'uCMatrix');
  uPMatrix_leaves = gl.getUniformLocation(glProgram_2, 'uPMatrix');
}


/********************* 6. SETUP DYNAMIC BUFFERS  **************************************/
function setupDynamicBuffers() {
  CMatrix = mat4.create();
  mat4.lookAt(CMatrix, camera.eye, camera.target, camera.up);
}

/********************* 7. Draw Scene        *********************************** */
function drawScene() {


  // gl.clearColor(183/256, 197/256, 255/256, 1.0);
  gl.clearColor(...BACKGROUND_COLOR.map((x)=>x/256));
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(glProgram);

  gl.uniformMatrix4fv(uMvMatrix, false, MvMatrix);
  gl.uniformMatrix4fv(uSMatrix, false, SMatrix);
  gl.uniformMatrix4fv(uCMatrix, false, CMatrix);
  gl.uniformMatrix4fv(uPMatrix, false, PMatrix);



  // ------------------------ Dibuja las ramas del arbol --------
  gl.enableVertexAttribArray(colorLocatAttrib);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
  gl.vertexAttribPointer(colorLocatAttrib, 4, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(positionLocatAttrib);
  gl.bindBuffer(gl.ARRAY_BUFFER, wallVertexBuffer);
  gl.vertexAttribPointer(positionLocatAttrib, 3, gl.FLOAT, false, 0, 0);

  // Atributos de instancia
  gl.enableVertexAttribArray(treePointsAttrib);
  gl.bindBuffer(gl.ARRAY_BUFFER, treePointsBuffer);
  gl.vertexAttribPointer(treePointsAttrib, 3, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(treeScaleAttrib);
  gl.bindBuffer(gl.ARRAY_BUFFER, treeScaleBuffer);
  gl.vertexAttribPointer(treeScaleAttrib, 3, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(treeRotateAttrib);
  gl.bindBuffer(gl.ARRAY_BUFFER, treeRotateBuffer);
  gl.vertexAttribPointer(treeRotateAttrib, 3, gl.FLOAT, false, 0, 0);


  ext.vertexAttribDivisorANGLE(treePointsAttrib, 1);
  ext.vertexAttribDivisorANGLE(treeScaleAttrib, 1);
  ext.vertexAttribDivisorANGLE(treeRotateAttrib, 1);
  ext.vertexAttribDivisorANGLE(colorLocatAttrib, 1);


  ext.drawArraysInstancedANGLE(gl.TRIANGLES, 0, PRISM_N * 6, tree.points.length / 3);

  gl.disableVertexAttribArray(colorLocatAttrib);
  gl.disableVertexAttribArray(positionLocatAttrib);
  gl.disableVertexAttribArray(treePointsAttrib);
  gl.disableVertexAttribArray(treeScaleAttrib);
  gl.disableVertexAttribArray(treeRotateAttrib);

  // ------------------------ Dibuja las hojas --------
  gl.useProgram(glProgram_2);


  gl.uniformMatrix4fv(uMvMatrix_leaves, false, MvMatrix);
  gl.uniformMatrix4fv(uSMatrix_leaves, false, SMatrix);
  gl.uniformMatrix4fv(uCMatrix_leaves, false, CMatrix);
  gl.uniformMatrix4fv(uPMatrix_leaves, false, PMatrix);

  gl.enableVertexAttribArray(leavesColorAttrib);
  gl.bindBuffer(gl.ARRAY_BUFFER, leavesColorBuffer);
  gl.vertexAttribPointer(leavesColorAttrib, 4, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(leavesVertexAttrib);
  gl.bindBuffer(gl.ARRAY_BUFFER, leavesVertexBuffer);
  gl.vertexAttribPointer(leavesVertexAttrib, 3, gl.FLOAT, false, 0, 0);


  ext.vertexAttribDivisorANGLE(leavesColorAttrib, 0);
  ext.vertexAttribDivisorANGLE(leavesVertexAttrib, 0);


  gl.drawArrays(gl.TRIANGLES, 0, tree.leaves.length/3);

  gl.disableVertexAttribArray(leavesColorAttrib);
  gl.disableVertexAttribArray(leavesVertexAttrib);
}


function animacion() {
  setupDynamicBuffers();
  drawScene();
  requestAnimationFrame(animacion);
}
