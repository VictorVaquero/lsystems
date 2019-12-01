
/**************** Generación datos prisma *************/
function generatePrism(radius, length, faces) {

  var base = [];
  var ang = -2 * Math.PI / faces;
  var init_ang = -Math.PI / 4;

  var base = Array(faces).fill().map(
    (v, i) => [radius * Math.sin(-ang * (i + 1) + init_ang),
      -length / 2,
      radius * Math.cos(-ang * (i + 1) + init_ang)
    ]
  ).flat();

  var top = Array(faces).fill().map(
    (v, i) => [
      radius * Math.sin(ang * (i + 1) + init_ang),
      +length / 2,
      radius * Math.cos(ang * (i + 1) + init_ang)
    ]
  ).flat();

  var wall = Array(faces).fill().map(
    function(v, i) {
      var ni = (i + 1) % faces;
      return [
        top[i * 3], +length / 2, top[i * 3 + 2],
        top[i * 3], -length / 2, top[i * 3 + 2],
        top[ni * 3], -length / 2, top[ni * 3 + 2],
        top[i * 3], +length / 2, top[i * 3 + 2],
        top[ni * 3], -length / 2, top[ni * 3 + 2],
        top[ni * 3], +length / 2, top[ni * 3 + 2]
      ];
    }).flat();

  return {
    "base": base,
    "top": top,
    "wall": wall
  }
}
