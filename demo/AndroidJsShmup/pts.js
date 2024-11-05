function createparticlesystem(bg,gui){
  
const particleups=[
  //0
(t,p)=>{
  const ptsr=2*t
  p.s.width-=ptsr
  p.s.height-=ptsr
  if(typeof p.r == 'number' ){
    moveang(p.s,p.r,ptsr)
  }else{
    p.s.y+=p.dy??ptsr
  }
  
  p.s.alpha=p.s.alpha*0.8
  
  p.s.x+=Math.cos(p.s.rotation-pi2)*t
  p.s.y+=Math.sin(p.s.rotation-pi2)*t
  
  if(p.s.width<10){p.t=-1}
},
//1
(t,p)=>{
  const ptsr=(p.o?.dt??0.99)/t
  p.s.width*=ptsr
  p.s.height*=ptsr
  p.s.alpha*=ptsr
  if(p.o?.rtr){
    p.s.rotation+=Math.PI*2*Math.random()//p.o.rt
  }
  p.s.x+=Math.cos(p.s.rotation-pi2)*t*(p?.o?.speed??1)
  p.s.y+=Math.sin(p.s.rotation-pi2)*t*(p?.o?.speed??1)
  if(p.s.width<1){p.t=-1}
},
//2
(t,p)=>{
    const o=p.o
    /*if(p.o?.g>0){
      p.dy=p.dy??0+p.o.g
     // p.s.y+=p.dy
    }*/
    if(o.speed>0){
      p.distance+=o.speed*t
      if(p.next){
        p.s.x=p.next.x
        p.s.y=p.next.y
      }
      p.next={
        x:p.s.x+Math.cos(o.r-Math.PI/2)*o.speed*t,
        y:p.s.y+Math.sin(o.r-Math.PI/2)*o.speed*t,
      }
    }
},
(t,p)=>{
  const ptsr=p.expand??1*t
  p.s.width+=ptsr
  p.s.height+=ptsr
  p.s.alpha=1-(p.time/p.lifetime)
  if(p.s.alpha<=0.0001){p.t=-1}
},
]
//----------------------------
const particles=[
{
  update:particleups[0],
},
{
  update:particleups[1],
},
{
  update:particleups[2],
},
{
  update:particleups[3],
},
]
//----------------------------
const ps=[]
const colbs=[]
const dmgtxts=[]
const pts = {
    bg,
    c,
    update,
    colbs,
}

const ptsc = {

shipshoot:(t1,w,o)=>{
  const p= pts.c(t1,Math.cos(w.s.rotation-pi2)*o.h*0.5,Math.sin(w.s.rotation-pi2)*o.h*0.5,o.w,o.h,o, particles[2])
  p.ondestroy=(p)=>{
    pts.c(bg,p.s.x,p.s.y,p.s.width/2,p.s.height/2, {sprite:p.b.o.hitsprite,dt:0.8},particles[1])
  }
},
enengine:(en)=>{
  p= pts.c(en.s,0,0,en.s.width*0.7,en.s.height*0.7,{dy:-2,order:40,sprite:sps[47]}, particles[0])
  p.r=en.s.rotation-pi2
},
shipengines:(cship,obj)=>{
  for(let eng of cship.engines){
        pts.c(obj, eng.tf[0],eng.tf[1], eng.tf[2],eng.tf[3],{zIndex:10,sprite:eng.sprite}, particles[0])
      }
},
frag:(en,b)=>{
  const sz=(en.s.width+en.s.height)
  for(let i=0;i<5;i++){
  pts.c(bg,en.s.x+Math.random()*sz-sz/2, en.s.y+Math.random()*sz-sz/2, sz*0,sz*0,{lifetime:50*Math.random(),sprite:sps[46]},particles[3])
  }
  pts.c(bg,en.s.x,en.s.y,sz*2,sz*2,{dt:0.9,speed:1*Math.random(),rtr:1,r:2*Math.PI*Math.random(),sprite:sps[45]},particles[1])
 if(en.frag){
   for(let ptj=0;ptj<15;ptj++){
    pts.c(bg,en.s.x,en.s.y,sz*Math.random()/4,sz*Math.random()/4,{dt:0.99,speed:15*Math.random(),r:2*Math.PI*Math.random(),sprite:getrand(en.frag.sprites)},particles[1])
   }
 }
},
mos:(mos,en)=>{
  const dxy=en.s.width
  for(let ptej=0;ptej<5+5*Math.random();ptej++){
    const moc={
      //speed:2*Math.random(),
      g:0.9,dy:-5,
      lifetime:0,r:Math.PI*Math.random()*2,sprite:getrand([sps[4],sps[5],sps[6]])}
    p=pts.c(bg,en.s.x+Math.random()*dxy,en.s.y+Math.random()*dxy,20,20,moc,particles[2])
    p.s.blendMode=PIXI.BLEND_MODES.SCREEN
    const mo={
      p:p,
      amount:1,
    }
    mos.push(mo)
  }
},
hit:(en,b,x,y,dmg)=>{
  
  const txt=gui.addtext(x,y,dmg,{fontWeight:'bold'})
  dmgtxts.push(txt)
  
  pts.c(bg,x,y,b.p.s.width,b.p.s.height,{sprite:b.o.hitsprite,dt:0.8},particles[1])
if(en.frag){for(let ptj=0;ptj<en.frag.count??5;ptj++){
  pts.c(bg,x,y,15*Math.random(),15*Math.random(),{speed:25*Math.random(),lifetime:10,r:b.s.rotation+Math.PI+Math.random()-0.5,sprite:getrand(en.frag.sprites)},particles[2])
  }}
},
gather:(mo)=>{
    const p = pts.c(mo.p.s, 0,0, 120,120,{dt:0.85,sprite:sps[41],rtr:1,}, particles[1])
    pts.c(mo.p.s, 0,0, 80,80,{dt:0.87,sprite:sps[43],rt:0.3,}, particles[1])
},
takedamage:(obj,pos)=>{
  
  for(let ptj=0;ptj<7;ptj++){
  pts.c(bg,pos.x,pos.y,15*Math.random()+10,15*Math.random()+10,{dt:0.99,speed:15*Math.random(),lifetime:1000,r:pos.a+Math.PI/4*Math.random(),sprite:sps[48]},particles[1])
  }
    const p = pts.c(obj, 0,0, 120,120,{dt:0.985,sprite:sps[48],rtr:1,}, particles[1])
},

//------
}
  
  Object.assign(pts,ptsc)
  return pts
  
  function update(t){try{

for(let [i,txt] of dmgtxts.entries()){
  txt.y+=-2*t
  txt.alpha+=-0.01*t
  if(txt.alpha<=0){
    txt.parent.removeChild(txt)
    dmgtxts.splice(i,1)
  }
}

for(let i=ps.length-1;i>=0;i--){
const p=ps[i]
if(p.t==-1 || p.b?.rem==1){
  if(p.ondestroy){ p.ondestroy(p) }
  if(p.b){p.b.rem=1}
  p.s.parent.removeChild(p.s)
  ps.splice(i,1)
}else{
  p.update(t,p)
  p.time+=t
  if(p.range-p.distance<100){
    p.s.alpha=(p.range-p.distance)/100
  }
  if(p.time>p.lifetime && p.lifetime>0 
    || p.distance>p.range && p.range>0){
    p.t=-1
  }
  if(p.o?.g){
    p.dy=(p.dy??-20)+p.o.g*t
    p.s.y+=p.dy
    p.dy*=0.98
  }
}
}}catch(ex){alert(ex)}}
  
function c(a,x=0,y=0,w=40,h=40,o={},particle=null){try{
const spritedef=o?.sprite??sps[0]
const s = PIXI.Sprite.from(spritedef)
s.anchor.set(0.5)
s.rotation=o?.r??Math.PI*2*Math.random()
s.position.x=a.x+x
s.position.y=a.y+y
s.width=w
s.height=h

const p={
  s,
  t:1,
  o,
  b:null,
  range:o?.range,
  lifetime:o?.lifetime??0,
  distance:0,
  time:0,
  update:particle?.update??dummyupd,
}

if(o?.b){
  o.time=0
  const b=Object.assign({
    s:s,
    size:o.size,
    p:p,
    o:o,
  },o.b)
  p.b=b
  colbs.push(b)
}

ps.push(p)
bg.addChild(s)

if(o?.order || o?.zIndex){
  s.zIndex=o.order??o.zIndex
}else{
  s.zIndex=100
}
bg.sortChildren()

return p
function dummyupd(t,p){}
}catch(ex){alert(ex)}}
}