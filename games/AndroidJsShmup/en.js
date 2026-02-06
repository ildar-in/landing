function initensys(app, bg, pts,obj) {try{

const ens=[]

//--------------------------------------

const wvc=createwavechain()

const lvlbdr=initlevelbuilder()

//--------------------------------------

const spawnpoints=[
  {x:app.screen.width/2,y:-100},
  {x:app.screen.width*0.1,y:-150},
  {x:app.screen.width*0.9,y:-200},
]

const waves=[
{
  factory:enfactory1,
  spawn:spawnpoints[0],
  enemies:ens_barel1,
  update:enupdatefly,
},
{
  factory:enfactory1,
  spawn:spawnpoints[1],
  enemies:[enemies[3]],
  update:enupdatefly,
},
{
  factory:enfactory1,
  spawn:spawnpoints[1],
  count:9,
  y:400,
  enemies:[enemies[4]],
  update:enupdatefly,
  idle:enidlespike,
},
{
  factory:enfactory1,
  spawn:spawnpoints[1],
  count:9,
  y:400,
  enemies:[enemies[5]],
  update:enupdatefly,
},
{
  factory:enfactory1,
  spawn:spawnpoints[2],
  count:9,
  y:400,
  enemies:[enemies[6]],
  update:enupdatefly,
},
]

function getposline(x,y,w,h,i,en,enz){
  if(typeof w == 'number'){
  return {
    x:x*app.screen.width
      +app.screen.width*w/enz.length*(i+0.5)
      -app.screen.width*w/2,
    y:y*app.screen.height,
  }
  }else{
    
    return {
    x:x*app.screen.width,
    y:y*app.screen.height
      +app.screen.height*h/enz.length*(i+0.5)
      -app.screen.height*h/2,
  }
  }
}
function getposdot(x,y,w,h,i,en,enz){
  return {
    x:x*app.screen.width,
    y:y*app.screen.height,
  }
}

const enpath1=[
  {
    getpos:getposline,
    x:0.5,
    y:-0.1,
    w:-0.3,
    delay:15,
  },
  {
    getpos:getposdot,
    x:0.5,
    y:0.3,
    delay:0,
  },
  {
    getpos:getposline,
    x:0.5,
    y:0.1,
    w:0.8,
    delay:20,
    wait:50,
  },
]
const enpath2=[
  {
    getpos:getposline,
    x:0.3,
    y:-0.4,
    h:-0.3,
    delay:15,
  },
  {
    getpos:getposdot,
    x:0.3,
    y:0.6,
    delay:0,
  },
  {
    getpos:getposdot,
    x:0.7,
    y:0.6,
    delay:0,
  },
  {
    getpos:getposline,
    x:0.5,
    y:0.2,
    w:0.8,
    delay:20,
    wait:50,
  },
]
const enpath3=[
  {
    getpos:getposline,
    x:0.7,
    y:-0.4,
    h:-0.4,
    delay:15,
  },
  {
    getpos:getposdot,
    x:0.7,
    y:0.6,
    delay:0,
  },
  {
    getpos:getposdot,
    x:0.3,
    y:0.6,
    delay:0,
  },
  {
    getpos:getposline,
    x:0.5,
    y:0.3,
    w:0.6,
    delay:20,
    wait:50,
  },
]

for(let i=0;i<5;i++){
wvc.add(waves[2],{wnum:i,count:9,path:enpath1})
wvc.add(waves[1],{wnum:i,count:4,path:enpath2})
wvc.add(waves[0],{wnum:i,count:9,path:enpath3})
}

return {
  wvc,
  ens,
}

//--------------------------------------

function initlevelbuilder(){
  const lvlbdr={
    
  }
  return lvlbdr
}

function createenemy(opts, eg){
  const en={
    o:eg,
    hp:eg.hp,
    tspark:0,
    dmgdelay:0,
  }
const e = PIXI.Sprite.from(eg.sprite)
e.anchor.set(0.5)
if(eg.rndrotate){
  e.rotation=Math.random()*eg.rndrotate
}else if(eg.r){
  e.rotation=eg.r
}
const scale=0
e.width=eg.w+scale
e.height=eg.h+scale
e.x=Math.random()*app.screen.width
e.y=-e.height/2
bg.addChild(e)
en.s=e
e.zIndex=50
bg.sortChildren()
en.speed=eg.speed
en.size=eg.size
en.frag=eg.frag
ens.push(en)
return en
}
function enidle(en){
  en.targetpos={
     x:en.lastpos.x+Math.random()*100-50,
     y:en.lastpos.y+Math.random()*100-50
   }
   en.speed=1
}
function enidlespike(en,obj,t){
  const ang=getang(en.s,obj)
  en.s.rotation=ang
  if(Math.random()<0.01*t){
  en.targets.push({x:en.s.x,y:en.s.y})
  en.targetpos={
     x:obj.x,
     y:obj.y,
   }
  }
  // en.speed=15
}
function enupdatefly(i,opts,en,enm,t,enz){
let targetpos=null
if(!en.targetpos || getlen(en.s,en.targetpos)<5){
  if(en.targets?.length>0){
      en.targetpos=en.targets.shift()
      en.lastpos=en.targetpos
  }else{
    const idle=en.idle??enidle
    idle(en,obj,t)
  }
}
  moveto(en.s,targetpos??en.targetpos,en.speed*t)
  pts.enengine(en)
}

function enfactory1(opts){
  const enz=[]
  
  for(let i=0;i<opts.count;i++){
    const enm=getrand(opts.enemies)
    const en=createenemy(null,enm)
    en.s.x=opts.spawn.x
    en.s.y=opts.spawn.y
    en.idle=opts.idle
    en.update=(t)=>{
      opts.update(i,opts,en,enm,t,enz)
    }
    enz.push(en)
  }
  
  while(opts.path?.length>0){
    const dot=opts.path.shift()
    for(let [i,en] of enz.entries()){
      const pos=
        dot.getpos(dot.x,dot.y,dot.w,dot.h,i,en,enz)
        if(!en.targets){
      en.s.x=pos.x
      en.s.y=pos.y
      en.targets=[]
        }else{
          en.targets.push(pos)
        }
    }
  }
  
  return {
    enz:enz
  }
}

function createwavechain(){
  const chain={
    wnum:0,
    waves:[],
    cur:{
      enz:[],
    },
    keepspawn:0,
  }
  
  function add(w,opts){
    w=Object.assign({},w)
    w=Object.assign(w,opts)
    if(opts.path){
      w.path=[...opts.path]
    }
    chain.waves.push(w)
  }
  
  function update(t){try{
    chain.cur.enz=chain.cur.enz.filter(en=>!en.rem)
    if(!chain.keepspawn && chain.cur.enz.length>0){
      return
    }
    let isend=0
    while(!isend){
      if(chain.waves.length===0){
      //win
      return
      }
      const w = chain.waves[0]
      if(w.delay>0){
        w.delay-=t
        isend=1
        chain.keepspawn=1
        break
      }
      if(w.wnum>chain.wnum){
        isend=1
        chain.wnum++
        chain.keepspawn=0
        break
      }
    chain.waves.shift()
    chain.cur.enz=chain.cur.enz.concat(w.factory(w).enz)
    }
  }catch(ex){alert(ex.stack)}}
  
  return {
    update,
    add,
  }
}

}catch(ex){alert(ex.stack)}}