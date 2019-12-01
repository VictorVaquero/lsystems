// CONSTANTES GLOBALES DEL PROYECTO

// Color fondo

var BACKGROUND_COLOR = [201, 212, 236, 256];
// var BACKGROUND_COLOR = [256, 256, 256, 256];


// Constantes prisma (tronco 3D)
var PRISM_RADIUS = 1,
  PRISM_LENGTH = 1,
  PRISM_N = 6;


// Limite de escalado de la vista
// var SCALE_INIT = 1,
//     SCALE_MAX = 6,
//     SCALE_MIN = 0.05;
var SCALE_INIT = 20,
    SCALE_MAX = 40,
    SCALE_MIN = 1;

// Objeto inicial de la vista
var OBJECT_TYPE_INIT = "trees",
    OBJECT_INDEX_INIT = 0,
    OBJECT_TIMES_INIT = 3;



// Valores iniciales de la Camara
var CAMERA = {
  EYE: [0, 0.0, SCALE_INIT],
  TARGET: [0.0, 0.0, 0.0],
  UP: [0.0, 1.0, 0.0],
  FOV_Y: 1.6,
  ASPECT: 1,
  NEAR: 0.1,
  FAR: 50
}
