try{

const approot=initapproot()
const gui=initgui(approot.bggui)
const gamer=initgamer(approot.bg)
const pts=createparticlesystem(approot.bg, gui)
const ensys=initensys(approot.app, approot.bg, pts,gamer.obj)
const fight=initfight(gui, approot.app, approot.bg, approot.cp, pts, ensys.wvc, ensys.ens,gamer.obj)

}catch(ex){err(ex)}

function err(ex){
  alert(ex.stack?ex.stack:ex)
}