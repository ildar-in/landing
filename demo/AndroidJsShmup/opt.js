const pi2=Math.PI/2
const mopts={
  fullscreen:1,
}

const sps=[
'f.png','pt1.png','pt2.png','pt3.png','pt4.png','pt5.png','pt6.png',7,8,9,
10,'a.png',2,3,4,5,6,7,8,9,
20,'b.png','b1.png','b2.png',4,5,6,7,8,9,
30,'e1.png','e2.png','e3.png','e4.png','e5.png','e6.png','e7.png','e8.png',9,
40,'fx1.png','fx2.png','fx3.png','fx4.png','fx5.png','fx6.png','fx7.png','fx8.png',9,
50,'w1.png','w2.png',3,4,5,6,7,8,9,
60,'en1.png','en2.png','en3.png','en4.png','en5.png',6,7,8,9,
70,'br1.png','br2.png','br3.png','br4.png',5,6,7,8,9,
80,'win/win1.png','win/win2.png','win/win3.png',4,5,6,7,8,9,

//70,1,2,3,4,5,6,7,8,9,
]
for(let i=0;i<sps.length;i++){sps[i]='sprites/'+sps[i]}

const spbgcount=19
const spbg=[]
for(let i=0;i<spbgcount;i++){
  spbg[i]='sprites/bg/bg'+i+'.png'
}

const ships=[
  {
    sprite:sps[11],
    w:100,h:100,
    size:50,
    maxspeed:30,
    maxhp:100,
    parts:[
      {x:-40, y:0},{x:40, y:0},
      {x:-20, y:20},{x:20, y:20},
      {x:-10, y:-10},{x:10, y:-10},
      ],
    engines:[
      {sprite:sps[2],tf:[-30,30,40,40]},
      {sprite:sps[2],tf:[30,30,40,40]},
    ]
  },
  ]
  
const bullets=[
{
  sprite:sps[22],
  hitsprite:sps[2],
  speed:16,
  w:80,
  h:80,
  size:20,
},
{
  sprite:sps[23],
  hitsprite:sps[1],
  lifespan:null,
  speed:25,
  w:60,
  h:60,
  size:15,
},
]

const weapons=[
{
  img:sps[51],w:50,h:50,
  bullet:bullets[1],
  delay:0.1,
  mcd:50,
  dmg:10,
  repel:5,
  range:700,
},
{
  img:sps[52],w:80,h:80,
  bullet:bullets[0],
  delay:0.1,
  mcd:100,
  dmg:5,
  repel:1,
  range:500,
}
]

const enemies=[
  //aster
  {
    sprite:sps[32],
    w:100,
    h:100,
    rndrotate:Math.PI*2,
    size:25,
    speed:7,
    frag:{
      count:5,
      sprites:[sps[32],sps[31],sps[33]]
    },
    hp:30,
  },
  {
    sprite:sps[33],
    w:150,
    h:150,
    rndrotate:Math.PI*2,
    size:40,
    speed:5,
    frag:{
      count:5,
      sprites:[sps[32],sps[31],sps[33]]
    },
    hp:60,
  },  
  //barrel
  {
    sprite:sps[71],
    w:75,
    h:75,
    r:pi2,//Math.PI,
    size:40,
    speed:12,
    dmg:5,
    frag:{
      count:5,
      sprites:[sps[32]]
    },
    hp:10,
  },
  {
    sprite:sps[72],
    w:120,
    h:120,
    r:pi2,
    size:40,
    speed:5,
    dmg:5,
    frag:{
      count:5,
      sprites:[sps[32],sps[31],sps[33]]
    },
    hp:20,
  },
  //spike
    {
    sprite:sps[63],
    w:100,
    h:100,
    r:pi2,
    size:40,
    speed:13,
    dmg:10,
    frag:{
      count:5,
      sprites:[sps[32],sps[31],sps[33]]
    },
    hp:20,
  },
  {
    sprite:sps[64],
    w:150,
    h:150,
    r:pi2,
    size:40,
    speed:5,
    dmg:5,
    frag:{
      count:5,
      sprites:[sps[32],sps[31],sps[33]]
    },
    hp:30,
  },
  {
    sprite:sps[65],
    w:150,
    h:150,
    r:pi2,
    size:40,
    speed:5,
    dmg:5,
    frag:{
      count:5,
      sprites:[sps[32],sps[31],sps[33]]
    },
    hp:40,
  },
]

const 
enemy_barrel={
    sprite:sps[71],
    w:100,
    h:100,
    r:pi2,//Math.PI,
    size:40,
    speed:12,
    dmg:5,
    frag:{
      count:5,
      sprites:[sps[32]]
    },
    hp:10,
  }
, ens_barel1=[enemy_barrel,
copywith(enemy_barrel,{sprite:sps[72]}),
copywith(enemy_barrel,{sprite:sps[73]})
]

//const ens_barel1=[enemies[2],enemies[3]]
//----------------------------------

//----------------------------------
function moveang(s,a,l){
  s.x+=Math.cos(a)*l
  s.y+=Math.sin(a)*l
}
function moveto(a,b,l){
  if(getlen(a,b)>l){
    const r=getang(a,b)
    a.x+=Math.cos(r)*l
    a.y+=Math.sin(r)*l
    return true
  }else{
    a.x=b.x
    a.y=b.y
    return false
  }
}
function getang(a,b){
  return Math.atan2(b.y-a.y,b.x-a.x)
}
function getlen(a,b){
  const x=a.x-b.x,y=a.y-b.y
  return Math.sqrt(x*x+y*y)
}
function bound(sobj,screen){
if(sobj.x<0)sobj.x=0
if(sobj.y<0)sobj.y=0
if(sobj.x>screen.width)sobj.x=screen.width
if(sobj.y>screen.height)sobj.y=screen.height
}
function getrand(arr){
  if(arr.length===0){return null}
 const i= Math.round(
        (arr.length-1)*Math.random())
        return arr[i]
}

function segment_intersection(x1,y1,x2,y2, x3,y3,x4,y4) {
  var eps = 0.0000001;
function between(a, b, c) {
    return a-eps <= b && b <= c+eps;
}
    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4)) /
            ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4)) /
            ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    if (isNaN(x)||isNaN(y)) {
        return false;
    } else {
        if (x1>=x2) {
            if (!between(x2, x, x1)) {return false;}
        } else {
            if (!between(x1, x, x2)) {return false;}
        }
        if (y1>=y2) {
            if (!between(y2, y, y1)) {return false;}
        } else {
            if (!between(y1, y, y2)) {return false;}
        }
        if (x3>=x4) {
            if (!between(x4, x, x3)) {return false;}
        } else {
            if (!between(x3, x, x4)) {return false;}
        }
        if (y3>=y4) {
            if (!between(y4, y, y3)) {return false;}
        } else {
            if (!between(y3, y, y4)) {return false;}
        }
    }
    return {x: x, y: y};
}

function segment_intersection2(p11,p12,p21,p22){
  return segment_intersection(p11.x,p11.y,p12.x,p12.y,p21.x,p21.y,p22.x,p22.y)
}

function hitscan(b,en){
      const l1=getlen(b.s,b.next)
      const a1=getang(b.s,b.next)
      const a2=a1-pi2
      const a3=a1+pi2
      const p11={
        x:b.s.x+Math.cos(a2)*b.size,
        y:b.s.y+Math.sin(a2)*b.size,
      }
      const p12={
        x:p11.x+Math.cos(a1)*l1,
        y:p11.y+Math.sin(a1)*l1,
      }
      const p21={
        x:b.s.x+Math.cos(a3)*b.size,
        y:b.s.y+Math.sin(a3)*b.size,
      }
      const p22={
        x:p21.x+Math.cos(a1)*l1,
        y:p21.y+Math.sin(a1)*l1,
      }
      const p31={
        x:en.s.x+Math.cos(a2)*en.size,
        y:en.s.y+Math.sin(a2)*en.size,
      }
      const p32={
        x:en.s.x+Math.cos(a3)*en.size,
        y:en.s.y+Math.sin(a3)*en.size,
      }
      const line3={p1:p31,p2:p32}
     let inter=segment_intersection(p11.x,p11.y,p12.x,p12.y,p31.x,p31.y,p32.x,p32.y)
  if(!inter){
    inter=segment_intersection(p21.x,p21.y,p22.x,p22.y,p31.x,p31.y,p32.x,p32.y)
  }
  return inter
}

function gethitlines(q,q2,size){
  const l1=getlen(q,q2)
  const a1=getang(q,q2)
  const a2=a1-pi2
  const a3=a1+pi2
  const p11={
    x:q.x+Math.cos(a2)*size,
    y:q.y+Math.sin(a2)*size,
  }
  const p12={
    x:p11.x+Math.cos(a1)*l1,
    y:p11.y+Math.sin(a1)*l1,
  }
  const p21={
    x:q.x+Math.cos(a3)*size,
    y:q.y+Math.sin(a3)*size,
  }
  const p22={
    x:p21.x+Math.cos(a1)*l1,
    y:p21.y+Math.sin(a1)*l1,
  }
  return [p11,p12,p21,p22]
}

function hitscan2(q,q2,qsize,b,b2,bsize){
  
  if(getlen(q2,b2)<=qsize+bsize){
    return getmid(q2,b2)
  }
  
  const ln1=gethitlines(q,q2,qsize)
  , ln2=gethitlines(b,b2,bsize)
  , rs1=[],rs2=[]
  
  for(let i=0;i<4;i++){
    const i2=i===3?0:i+1
    rs1.push([ln1[i],ln1[i2]])
    rs2.push([ln2[i],ln2[i2]])
  }
  
  for(let r1 of rs1){
    for(let r2 of rs2){
      const inter=segment_intersection2(r1[0],r1[1],r2[0],r2[1])
      if(inter){
        return inter
      }
    }
  }
  return false
}

function getmid(a,b){
  return {
    x:(a.x+b.x)/2,
    y:(a.y+b.y)/2,
  }
}

function copywith(sourse,addon){
  return Object.assign(
    Object.assign({},sourse),
    addon
  )
}