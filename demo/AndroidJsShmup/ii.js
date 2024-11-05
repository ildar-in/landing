function initapproot(){try{
  
const app = new PIXI.Application({
 width:1080,
 height:2048
})
document.body.appendChild(app.view)

const bgui = new PIXI.Graphics()
bgui.eventMode = 'static'
//bgui.beginFill(0x000000,1)
bgui.beginFill(0x151111,1)
//bgui.beginFill(0x333333,1)
bgui.drawRect(0,0,app.screen.width,app.screen.height)
app.stage.addChild(bgui)

const bg = new PIXI.Graphics()
app.stage.addChild(bg)

const bggui = new PIXI.Graphics()
app.stage.addChild(bggui)

const canvas = app.view
initfullscreenbtn(canvas)
const cp={x:0,y:0,f:0,cpx:0,cpy:0,sx:0,sy:0}

bgui.on('pointerdown',e=>{ 
  
cp.sx=e.globalX
cp.sy=e.globalY

cp.cpx=cp.x
cp.cpy=cp.y
cp.f=1
})

bgui.on('pointermove',(e)=>{
const cpscale=1.5, cpscaleaspect=app.screen.width/app.screen.height
  const dx=e.globalX-cp.sx
  const dy=e.globalY-cp.sy
  cp.x=cp.cpx+dx*cpscale
  cp.y=cp.cpy+dy*cpscale
})

return {
  app,
  bg,
  cp,
  bggui,
}

}catch(ex){err(ex)}}

//----------------------------------------

function initfightbg(spbg=[], bg, screen){try{
  const items=[]
  const bgsranges=[
    {s:0,e:8,c:3,szs:600,szm:1000},
    {s:0,e:10,c:10,szs:100,szm:300},
    {s:11,e:18,c:150,szs:10,szm:50}
  ]
  for(let l=2;l>=0;l--){
    const count = bgsranges[l].c
    const dist=((3-l)/3)
    for(let i=0;i<count;i++){
const rnd=Math.random()
      const sid=Math.round((bgsranges[l].e-bgsranges[l].s)*Math.random()+bgsranges[l].s)
const s1= PIXI.Sprite.from(spbg[sid])
s1.anchor.set(0.5)
s1.x=Math.random()*screen.width
s1.y=Math.random()*screen.height
s1.rotation=Math.PI*2*rnd
if(l==2){
  s1.tint=0x777777
}else if(l==1){
  s1.tint=0x555555
}else{
  s1.tint=0x333333
}
s1.width=dist*bgsranges[l].szm*rnd+bgsranges[l].szs
s1.height=dist*bgsranges[l].szm*rnd+bgsranges[l].szs
s1.speed=dist*5
bg.addChild(s1)
items.push(s1)
s1.l=l
s1.spark=0
    }
  }
  
  function update(t){
    for(let [i,s] of items.entries()){
      if(s.spark>0){
        s.spark=-t
        if(s.spark<=0){
          s.spark=0
          s.tint=s.oldtint
        }
      }
      if(s.l==2){
        if(Math.random()<0.01){
          s.oldtint=s.tint
          s.tint=0xffffff
          s.spark=100
        }
      }
      s.y+=s.speed
      if(s.y>s.height+screen.height){
        s.x=Math.random()*screen.width
        s.y=-s.height
      }
    }
  }
  
  return {
    update
  }
}catch(ex){err(ex)}}

function initgamer(bg){
let obj = new PIXI.Graphics()
bg.addChild(obj)
obj.x=450
obj.y=1400
obj.zIndex=100

return {
  obj
}
}

//----------------------------------------
function initfight(gui, app, bg, cp, pts, wvc, ens, obj){try{

//const winui=initwinui(gui.bggui,app.screen.width,app.screen.height)

const fightbg=initfightbg(spbg,bg,app.screen)
const textmo=gui.addtext(50,0,'0')
const cship=ships[0]

const hp=gui.addspritebar(obj.x,obj.y,150,30)

const s1 = PIXI.Sprite.from(cship.sprite)
s1.anchor.set(0.5)
s1.rotation=Math.PI
s1.width=cship.w
s1.height=cship.h
obj.addChild(s1)
//-------------------------------
const colbs=pts.colbs
const mos=[]
const ship=createship()

for(sp of cship.parts){
addshippart(sp.x,sp.y)
}

addweapon(0,weapons[0])
addweapon(1,weapons[0])
addweapon(2,weapons[1])
addweapon(3,weapons[0])
addweapon(4,weapons[0])
addweapon(5,weapons[1])

//-------------------------------
//UPDATE
const ticker = PIXI.Ticker.shared
ticker.start()
ticker.add((t)=>{try{

//winui.update(t)

fightbg.update(t)
wvc.update(t)

for(var sobj of [obj,cp]){
  bound(sobj,app.screen)
}

obj.prev={x:obj.x,y:obj.y}
if(cp.f){
  moveto(obj,cp,ship.maxspeed*t)
}else{
 cp.x=obj.x
 cp.y=obj.y
}

const brem=[]
for(let [enidx,en] of ens.entries()){
  
  en.prev={x:en.s.x,y:en.s.y}
  if(en.update){
    en.update(t)
  }else{
    en.s.y+=en.speed*t
  }
  
  if(en.tspark<=0){
     en.tspark=0
     lightenreset(en.s)
  }else{
     en.tspark-=t
  }
  en.dmgdelay-=t
  
  if(en.s.y>app.screen.height+en.s.height){
    en.rem=1
  } else if(en.hp<=0){
    en.drop=1
    en.rem=1
  }

  const hs=hitscan2(obj.prev, obj, cship.size, en.prev,en.s,en.size)
  if(hs){
    hs.a=getang(obj, en.s)-pi2
    hiten(hs)
  }

function hiten(pos){
  if(en.dmgdelay>0){return}
  const p = pts.takedamage(obj,pos)
  const dmg=en.o.dmg??0
  ship.hp-=dmg
  en.dmgdelay=100
  lighten(obj)
  obj.tspark=10
}
  
  for(let [i,b] of colbs.entries()){
    if(b.next){
      const inter=hitscan(b,en)
      if(inter){
        hit(inter.x,inter.y,b)
      }
    }else{
      const l=getlen(en.s,b.s)
      if(l<=b.size+en.size){
      hit(b.s.x,b.s.y,b)
      }
    }
function hit(x,y,b){if(b.rem!==1){
  lighten(en.s)
  en.tspark=1
  const dmg=b.dmg
  en.hp-=dmg
  moveang(en.s,b.s.rotation-pi2,b.repel)
  b.rem=1
  pts.hit(en,b,x,y,dmg)
  brem.push(i)
}}
  }
  
if(en.rem){
  if(en.drop){
   pts.frag(en)
   pts.mos(mos,en)
  }
  en.s.parent.removeChild(en.s)
  ens.splice(enidx,1)
}

}

for(let i=brem.length-1;i>=0;i--){
  colbs.splice(brem[i],1)
}

for(let [moid,mo] of mos.entries()){
  const l=getlen(mo.p.s,obj)
  if(l<50){
    ship.score+=mo.amount
    textmo.text=ship.score
    pts.gather(mo)
    moremove()
  }else if(mo.p.s.x<-100||mo.p.s.x>app.screen.width+100||mo.p.s.y<-100||mo.p.s.y>app.screen.height+100){
    moremove()
  }
  function moremove(){
    mos.splice(moid,1)
    mo.p.t=-1
  }
}

pts.update(t)
ship.update(t)

}catch(ex){alert(ex.stack)}})
//-------------------------------
function createship(x,y){
  const parts=[]
  const ship={
    score:0,
    hp:cship.maxhp,
    parts,
    ws:[],
    update:update
  }

function update(t){
  x=obj.x
  y=obj.y
  if(ship.hp<0){ship.hp=0}
  hp.x=obj.x-hp.w/2
  hp.y=obj.y+cship.h
  hp.set(ship.hp/cship.maxhp)
  if(obj.tspark>0){
    obj.tspark-=t
  }else{
    lightenreset(obj)
  }
  
    for(w of ship.ws){
      const t1={x:x+w.s.x,y:y+w.s.y}
      let min=Number.MAX_VALUE
        w.target.f=null
        for(let en of ens){
         const l=getlen(t1,en.s)
         if(l<min){
           w.target.f=en
           w.target.x=en.s.x
           w.target.y=en.s.y
           min=l
         }
        }
       //if(w.target.f===null){continue}
       const r=w.target.f===null?-pi2:getang(t1,w.target)
       w.s.rotation=r+Math.PI/2
       w.cd-=t
if(w.cd<0){
w.cd=w.mcd
const o=Object.assign({}, w.b)
o.r=w.s.rotation
o.range=w.range
o.b={
  dmg:w.dmg,
  repel:w.repel*t,
}
pts.shipshoot(t1,w,o)

const animrecoil=o.h*0.2
w.s.x=w.x+Math.cos(w.s.rotation+pi2)*animrecoil
w.s.y=w.y+Math.sin(w.s.rotation+pi2)*animrecoil
  }else{
         w.s.x-=(w.s.x-w.x)/(2*t)
         w.s.y-=(w.s.y-w.y)/(2*t)
  }
      }
      pts.shipengines(cship,obj)
  }
  return ship
}

function addshippart(x,y){
  const spw=15
  const s = PIXI.Sprite.from(sps[21])
  s.anchor.set(0.5)
  s.width=spw
  s.height=spw
  s.x=x
  s.y=y
  obj.addChild(s)
  const sp={
    s:s,
    attach:null
  }
  ship.parts.push(sp)
}

function addweapon(spid,opt){
  const s = PIXI.Sprite.from(opt.img)
  s.anchor.set(0.5)
  s.width=opt.w
  s.height=opt.h
  s.x=ship.parts[spid].s.x
  s.y=ship.parts[spid].s.y
  s.zIndex=110
  obj.addChild(s)
  const w=Object.assign(
{
    mcd:opt.mcd,
    cd:opt.mcd*Math.random(),
    s,
    x:s.x,
    y:s.y,
    target:{f:null,x:0,y:0},
    b:opt.bullet,
},opt)
  ship.ws.push(w)
}

function lighten(s){
  let filter = new PIXI.filters.ColorMatrixFilter()
  filter.matrix = [
    100, 100, 100, 100,
    100, 100, 100, 100,
    100, 100, 100, 100,
    -1, -1, -1, 1
]
  s.filters = [filter]
}
function lightenreset(s){
  s.filters=[]
}

}catch(ex){err(ex.stack)}}
