// UI --- Raton
var ratonAbajo = false;
let posRatonX = null;
let posRatonY = null;

var scale = SCALE_INIT;

var objectType = OBJECT_TYPE_INIT,
    objectIndex = OBJECT_INDEX_INIT,
    objectTimes = OBJECT_TIMES_INIT;


/*********************** RATON Y TECLADO: Funciones de control del Movimiento y Rotación***/
/* Deteccion de eventos*/

function deteccionEventos() {
  canvas.addEventListener("mousedown", pulsaRatonAbajo);
  window.addEventListener("resize", resize_canvas);
  document.addEventListener("mouseup", pulsaRatonArriba);
  document.addEventListener("mousemove", mueveRaton);
  document.addEventListener("keydown", pulsaTecla);
  document.addEventListener("keyup", arrivaTecla);
  window.addEventListener("wheel", mueveRueda);


  var sliderSeed = document.getElementById("seed");
  var numberSeed = document.getElementById("seedN");
  Random(sliderSeed.value);
  sliderSeed.addEventListener("input",function(){
    numberSeed.innerHTML = this.value;
    Random(this.value);
    setupFractal();
    setupBuffers();
  });

  var sliderGen = document.getElementById("gen");
  var numberGen = document.getElementById("genN");
  sliderGen.addEventListener("input",function(){
    numberGen.innerHTML = this.value;
    objectTimes = this.value;
    setupFractal();
    setupBuffers();
  });

  numberGen.innerHTML = objectTimes;
  sliderGen.value = objectTimes;

  var trees =[
    document.getElementById("tree1"),
    document.getElementById("tree2"),
    document.getElementById("tree3"),
    document.getElementById("tree4")];


  for(var i=0;i<trees.length;i++){

    (function(index) {
      trees[index].addEventListener("click",function(){
        objectType = "trees";
        objectIndex = index;
        objectTimes = OBJECTS[objectType][objectIndex].times;

        numberGen.innerHTML = objectTimes;
        sliderGen.value = objectTimes;
        setupFractal();
        setupBuffers();
      });
    })(i);
  }

    var leaves =[
      document.getElementById("leaf1"),
      document.getElementById("leaf2")
      // document.getElementById("leaf4")
    ];
    for(var i=0;i<leaves.length;i++){
      (function(index) {
        leaves[index].addEventListener("click",function(){
          objectType = "leaves";
          objectIndex = index;
          objectTimes = OBJECTS[objectType][objectIndex].times;

          numberGen.innerHTML = objectTimes;
          sliderGen.value = objectTimes;
          setupFractal();
          setupBuffers();
        });
      })(i);
    }

    var flowers =[
      document.getElementById("flower1"),
      document.getElementById("flower2"),
      document.getElementById("flower3")
    ];
    for(var i=0;i<flowers.length;i++){
      (function(index) {
        flowers[index].addEventListener("click",function(){
          objectType = "flowers";
          objectIndex = index;
          objectTimes = OBJECTS[objectType][objectIndex].times;

          numberGen.innerHTML = objectTimes;
          sliderGen.value = objectTimes;
          setupFractal();
          setupBuffers();
        });
      })(i);
    }

}
/* Gestion de ventos*/
function resize_canvas(){
  canvas = document.getElementById("canvas");
  canvas.width = window.innerWidth*4;
  canvas.height = window.innerHeight*4;
  gl.viewport(0, 0, canvas.width, canvas.height);
  // console.log(canvas.width, canvas.height);

  reshapeMatrix(canvas);
}

function mueveRueda(event) {

  var delta = Math.max(-1,Math.min(1,event.deltaY))/10+1;

  if(scale*delta<SCALE_MAX && scale*delta>SCALE_MIN){

    camera.eye[2] = scale;
  }

  scale = Math.min(SCALE_MAX,Math.max(SCALE_MIN,
    scale*delta));

  console.log(`FOV: ${camera.fov_y} Aspect: ${camera.aspect}`);
  console.log(`Camera: ${camera.eye}`);

}

function pulsaRatonAbajo(event) {
  ratonAbajo = true;
  posRatonX = event.clientX;
  posRatonY = event.clientY;
}

function pulsaRatonArriba(event) {
  ratonAbajo = false;
}

function mueveRaton(event) {
  if (!ratonAbajo) {
    return;
  }
  let nuevaX = event.clientX;
  let nuevaY = event.clientY;
  let deltaX = (nuevaX - posRatonX);
  let deltaY = (nuevaY - posRatonY);

  let idMatrix = mat4.create();

  mat4.rotate(idMatrix, idMatrix, degToRad(deltaX / 2), [0, 1, 0]);
  mat4.rotate(idMatrix, idMatrix, degToRad(-deltaY / 2), [1, 0, 0]);
  mat4.multiply(MvMatrix, idMatrix, MvMatrix);
  //console.log(`TARGET: ${vec}`);

  posRatonX = nuevaX;
  posRatonY = nuevaY;
}


function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

function pulsaTecla(event) {
  switch (event.keyCode) {
    case 81:
      camera.fov_y += sn, m;
      break; // The right arrow key was pressed
    case 87:
      camera.fov_y -= sn, m;
      break; // The left arrow key was pressed
    case 69:
      camera.aspect += sf, m;
      break; // The up arrow key was pressed
    case 82:
      camera.aspect -= sf, m;
      break; // The down arrow key was pressed
  }
}

function arrivaTecla() {
  console.log(`FOV: ${camera.fov_y} Aspect: ${camera.aspect}`);
  console.log(`Camera: ${camera.eye}`);
}
