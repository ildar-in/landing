function addbutton(bgc, s1='btn5.png',s2='btn6.png', btnscale=140,x=50,y=50,w=500,h=400,scale=3){
const plane9 = new PIXI.NineSlicePlane(PIXI.Texture.from(s1), btnscale+5,btnscale+5,btnscale,btnscale)
plane9.scale.x=1/scale
plane9.scale.y=1/scale
plane9.pressed=PIXI.Texture.from(s2)
plane9.released=plane9.texture
bgc.addChild(plane9)
plane9.x=x
plane9.y=y
plane9.width=w*scale
plane9.height=h*scale
plane9.eventMode='static'
plane9.width2=plane9.width
plane9.height2=plane9.height
plane9.presssize=25
plane9.on('pointerdown', e=>{
 plane9.texture=plane9.pressed
})
plane9.on('pointerup', e=>{
  plane9.texture=plane9.released
})
}

function initfullscreenbtn(canvas){
const fullscreenBtn=document.getElementById('root')

fullscreenBtn.addEventListener('click',e=>{
try{
canvas.requestFullscreen()
canvas.webkitRequestFullscreen()
}catch(ex){alert(ex)}
})
}

function initrel(w,h){
  function c(s){
    
  }
  return {
    c
  }
}

function initwinui(bggui,w,h){
const rel=initrel(w,h)

const container=new PIXI.Graphics()
const wb = PIXI.Sprite.from(sps[82])
wb.aspect=wb.width/wb.height
wb.anchor.set(0.5)
wb.x=w/2
wb.y=h/2
wb.width=w/10
wb.height=wb.width/wb.aspect
wb.alpha=0
container.addChild(wb)

function createwing(){
const w0 = PIXI.Sprite.from(sps[81])
w0.aspect=wb.width/wb.height
w0.anchor.set(0.2, 0.9)
w0.x=w/2
w0.y=h/2
w0.width=w/2
w0.height=w0.width/w0.aspect
container.addChild(w0)
return w0
}
//w0.scale.x=-1
/*
const w0=createwing(),w1=createwing(),w2=createwing()
w0.rotation=-0.3
w1.rotation=0.0
w2.rotation=0.3
*/
const sw = PIXI.Sprite.from(sps[83])
sw.aspect=sw.width/sw.height
sw.anchor.set(0.5)
sw.x=w/2
sw.y=h/2
sw.width=w/2
sw.height=sw.width/sw.aspect
sw.alpha=0
container.addChild(sw)

bggui.addChild(container)
let n=0
return {
  update
}
function update(t){
  n++

let wbn=10-n*0.005*n

if(wbn<1){wbn=1}
if(wbn>=1){
wb.alpha=1
wb.width=w/wbn
wb.y=h/2-wbn*50
wb.height=wb.width/wb.aspect


}
let swn=2-n*0.05
swn=swn<0?0:swn
sw.y=h/2-swn*h
sw.alpha=1
  
}
}

function initgui(bggui){
  
const gui={ 
  bggui,
addtext:(x=0,y=0,str='',opts={})=>{
  opts=Object.assign({
     fontFamily: 'Arial',
     fontSize: 60,
     fill: 0xaaaaaa,
     align: 'left',
 },opts)
  const textmo = new PIXI.Text(str, opts)
  textmo.x=x
  textmo.y=y
  bggui.addChild(textmo)
  return textmo
},
addspritebar:(x=0,y=0,w=100,h=30)=>{try{
  
  const wc=1024,hc=272
  const bar=new PIXI.Graphics()

  bar.x=x
  bar.y=y 
  bar.w=w
  
  const bar0 = PIXI.Sprite.from('sprites/ui/bar1.png')
  bar.addChild(bar0)
  bar0.tint=0xff0000
  const bar1 = PIXI.Sprite.from('sprites/ui/bar1.png')
  bar.addChild(bar1)
  const bar2 = PIXI.Sprite.from('sprites/ui/bar2.png')
  bar.addChild(bar2)
  for(let b of [bar0,bar1,bar2]){
    b.width=w
    b.height=h 
  }
  const mask = new PIXI.Graphics()
  mask.beginFill(0x000000)
  mask.drawRect(0,0,w,h)
  bar.addChild(mask)
  bar1.mask = mask
  bar.set=(v=0.5)=>{
    const sx=0.21,se=0.90,
      swx=sx*w,
      swe=(1-se)*w
      fw=swx+swe,
      rw=w-fw
    
    mask.width=rw*v+swx
    //mask.width=w*v
  }
  bggui.addChild(bar)
  return bar
}catch(ex){err(ex)}},

addbar:(x=0,y=0,w=100,h=30)=>{
  const bar=new PIXI.Graphics()
  bar.beginFill(0x444444,1)
  bar.drawRect(0,0,w,h)
  bar.x=x
  bar.y=y 
  bar.w=w
  
  const pro=new PIXI.Graphics()
  pro.beginFill(0x00aa00,1)
  pro.drawRect(0,0,w,h*0.61)
 // pro.x=x
//  pro.y=y 
  bar.addChild(pro)
  
  bar.set=(v=0.5)=>{
    pro.width=w*v
  }
  
  bggui.addChild(bar)
  return bar
}
}

return gui
}
