// ---------- Lista de simbolos disponibles para el fractal ----------
var SIMBOL_FORWARD = "F";
var SIMBOL_FORWARD_NOP = "f";
var SIMBOL_RIGHT = "+";
var SIMBOL_LEFT = "-";
var SIMBOL_ROLL_LEFT = "\\";
var SIMBOL_ROLL_RIGHT = "/";
var SIMBOL_PICH_UP = "^";
var SIMBOL_PICH_DOWN = "&";
var SIMBOL_TURN_BACK = "|";
var SIMBOL_THICKNESS = "!";
var SIMBOL_STACK_PUSH = "[";
var SIMBOL_STACK_POP = "]";
var SIMBOL_FLOWER_OPEN = "{";
var SIMBOL_FLOWER_CLOSE = "}";
var SIMBOL_FLOWER_ADD = ".";
var SIMBOL_COLOR_INDEX = "`"



function productionsParser(prods) {
  var d = {};
  prods = prods.map((p) => p.split(""));
  prods.map(function(p) {
    if(!(p[0] in d)) d[p[0]]=[]
    d[p[0]].push(p.slice(5));
    return 1;
  });
  return d;
}


/********************* 0.2 FRACTALES **************************************/
function fractal(object, times) {

  var simbols = object.base;
  var fProds = productionsParser(object.productions)

  for (var i = 0; i < times; i++) simbols = fExpand(simbols, fProds);

  var turtle = fTurtle(object, simbols,
    [0, 0, 0], [0, 1, 0],[0,0,1],[1,0,0]);

  console.log("BASE/PRODS: ", object.base, fProds);
  console.log("EXPANDED: ", simbols);
  console.log("POINTS: ", turtle.branches);
  console.log("LEAVES: ", turtle.leaves);

  return turtle;
}

function fExpand(simbols, productions) {
  simbols = simbols.map((s) => s in productions ? productions[s][getRandomInt(0,productions[s].length-1)] : s);
  console.log(simbols.flat());
  simbols = simbols.map((s) => s in productions ? productions[s][getRandomInt(0,productions[s].length-1)] : s).flat();
  return simbols;
}

function getP(t, st) {
  return {
    pos: t.pos,
    rot: getRot(t.dir),
    sca: [t.thk, st, t.thk],
    col: t.col
  }
}

function fTurtle(object, simbols, start, direction, front, lateral) {
  var turtle = {
    pos: start,
    dir: direction,
    frt: front,
    lat: lateral,
    thk: object.base_radius,
    col: 0
  };
  var branches = [],
    leaves = [];

  var segment = [getP(turtle, object.step)];
  var stack = [];

  var polygon = null;
  var polygon_stack = [];

  for (var i = 0; i < simbols.length; i++) {
    var angle=null,axis;
    switch (simbols[i]) {
      case SIMBOL_FORWARD:
        turtle.pos = add(turtle.pos, turtle.dir.map((x)=>x*object.step));
        segment.push(getP(turtle, object.step));
        break;
      case SIMBOL_FORWARD_NOP:
        turtle.pos = add(turtle.pos, turtle.dir.map((x)=>x*object.step));
        break;
      case SIMBOL_LEFT:
        angle = object.angle.z;axis=turtle.frt;
        break;
      case SIMBOL_RIGHT:
        angle = -object.angle.z;axis=turtle.frt;
        break;
      case SIMBOL_ROLL_LEFT:
        angle = object.angle.y;axis=turtle.dir;
        break;
      case SIMBOL_ROLL_RIGHT:
        angle = -object.angle.y;axis=turtle.dir;
        break;
      case SIMBOL_PICH_UP:
        angle = object.angle.x;axis=turtle.lat;
        break;
      case SIMBOL_PICH_DOWN:
        angle = -object.angle.x;axis=turtle.lat;
        break;
      case SIMBOL_TURN_BACK:
        turtle.dir = turtle.dir.map((x)=>-x);
        break;
      case SIMBOL_THICKNESS:
        turtle.thk = Math.max(turtle.thk - object.step_thick, object.min_thick);
        break;
      case SIMBOL_COLOR_INDEX:
        turtle.col += 1;
        break;
      case SIMBOL_STACK_PUSH:
        stack.push({
          segment: segment,
          pos: turtle.pos,
          dir: turtle.dir,
          frt: turtle.frt,
          lat: turtle.lat,
          thk: turtle.thk,
          col: turtle.col
        });
        segment = [getP(turtle, object.step)];
        break;
      case SIMBOL_STACK_POP:
        if (segment.length > 1) branches.push(segment);
        var s = stack.pop();
        segment = s.segment;
        turtle.pos = s.pos;
        turtle.dir = s.dir;
        turtle.frt = s.frt;
        turtle.lat = s.lat;
        turtle.thk = s.thk;
        turtle.col = s.col;
        break;
      case SIMBOL_FLOWER_OPEN:
        if (polygon != null){
          polygon_stack.push(polygon);
        }
        polygon = [];
        break;
      case SIMBOL_FLOWER_CLOSE:
        if (polygon.length > 2) leaves.push(polygon);
        polygon = polygon_stack.pop();
        break;
      case SIMBOL_FLOWER_ADD:
        polygon.push({pos:turtle.pos,col:turtle.col});
        break;
      default:
        //pass
    }
    if(!(angle == null)){
      turtle.dir = rotate(turtle.dir, angle* Math.PI / 180, axis);
      turtle.frt = rotate(turtle.frt, angle* Math.PI / 180, axis);
      turtle.lat = rotate(turtle.lat, angle* Math.PI / 180, axis);
    }
  }
  if (segment.length > 1) branches.push(segment);
  return {
    "branches": branches,
    "leaves": leaves
  };
}
