if (!Array.prototype.flat)
{
    Object.defineProperty(Array.prototype, 'flat',
    {
        value: function(depth = 1, stack = [])
        {
            for (let item of this)
            {
                if (item instanceof Array && depth > 0)
                {
                    item.flat(depth - 1, stack);
                }
                else {
                    stack.push(item);
                }
            }

            return stack;
        }
    });
}


function add(v1, v2) {
  return v1.map((x, i) => x + v2[i]);
}

function sub(v1, v2) {
  return v1.map((x, i) => x - v2[i]);
}

// function rotate(v, ang, axis) {
//   var va = vec4.create(),
//     m = mat4.create();
//
//   mat4.rotate(m, m, ang, axis);
//   vec4.transformMat4(va, [...v, 1], m)
//
//   return [va[0], va[1], va[2]];
// }

function rotate(v, ang, axis){
  var x=v[0], y=v[1], z=v[2];
  var qr=Math.cos(ang/2),
      qi=Math.sin(ang/2)*axis[0],
      qj=Math.sin(ang/2)*axis[1],
      qk=Math.sin(ang/2)*axis[2];
  var xp = x*(1-2*(qj**2+qk**2))+y*(2*(qi*qj-qk*qr))+z*(2*(qi*qk+qj*qr));
  var yp = x*(2*(qi*qj+qk*qr))+y*(1-2*(qi**2+qk**2))+z*(2*(qj*qk-qi*qr));
  var zp = x*(2*(qi*qk-qj*qr))+y*(2*(qj*qk+qi*qr))+z*(1-2*(qi**2+qj**2));
  //console.log("OR",v,[xp,yp,zp]);
  return [xp,yp,zp];
}



function getRot(v) {
  return [
    0,
    -(v[2] == 0 ? 0 : Math.atan(v[2] / v[0])) + (v[0] < 0 ? Math.PI : 0),
    -Math.abs(Math.PI / 2 - Math.asin(v[1]))
  ];
}

function test(){

    console.log("ROT: ",getRot([1,0,0]).map((x)=>x*180/Math.PI));
    console.log("ROT: ",getRot([0,1,0]).map((x)=>x*180/Math.PI));
    console.log("ROT: ",getRot([0,0,1]).map((x)=>x*180/Math.PI));

    console.log("ROT: ",getRot([0.5,0.86602,0]).map((x)=>x*180/Math.PI));
    console.log("ROT: ",getRot([0,0.5,0.86602]).map((x)=>x*180/Math.PI));
    console.log("ROT: ",getRot([-0.86602,0.5,0]).map((x)=>x*180/Math.PI));

}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(random() * (max - min + 1)) + min;
}

var _seed = 0;

function Random(seed) {

  _seed = (seed*100147483657) % 2147483647;
  if (_seed <= 0) _seed += 2147483646;

}

function random() {
  _seed = _seed * 16807 % 2147483647;
  return _seed/2147483647;
};
