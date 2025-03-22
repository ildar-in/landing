document.body.style.position='absolute'
document.body.style.top='0'
document.body.style.left='0'
document.body.style.margin='0'

function createGrid(){
  const w = 25, h=15, size=35, dt=12, ticks = 5
  const collumns = []
  const cells = []

  const gridDiv = createDiv(document.body, 10, 10, w*size, h*size)

  const grid = {
    div:gridDiv,
    w,h,size,dt,
    //** @type {Array<Array<ReturnType<typeof createCell>>>} */
    col: collumns,
    //** @type {Array<ReturnType<typeof createCell>>} */
    cells,
    //** @type {Array<ReturnType<typeof createStruct>>} */
    structs:[],
    //** @type {Array<ReturnType<typeof createCharge>>} */
    charges:[],
    onTick:[],
    //---
    destroyCharge
  }
  
  for(let i=0; i<w; i++){
    const collumn = []
    collumns.push(collumn)
    for(let j=0; j<h; j++){
      const cell = createCell(grid, i, j, size)
      collumn.push(cell)
      cells.push(cell)
    }
  }

  grid.cells.forEach(c=>{
    c.div.addEventListener('click',e=>{
      if(gridControl.selCell==c){
        if(c.struct){
          gridControl.selCell.struct.rotate(1)
        }
      }else{
        if(c.struct){
          if(gridControl.selCell){
            gridControl.selCell.div.style.border='1px solid #444444'
          }
          c.div.style.border='1px solid #44ff44'
          gridControl.selCell=c
        }else{
            if(gridControl.selCell && gridControl.selCell.struct){
              gridControl.selCell.struct.div.style.left = c.i * grid.size
              gridControl.selCell.struct.div.style.top = c.j * grid.size
              c.struct=gridControl.selCell.struct
              gridControl.selCell.struct = null
              c.struct.cell = c
          }
        }
      }
    })
  })

  let ticksElapsed = 0
  setInterval(()=>{
    grid.onTick.forEach(h=>h(grid))
    if(ticksElapsed++<ticks){
      return
    }else{
      ticksElapsed = 0
    }
    grid.charges.forEach(ch=>{
      const x = ch.r==1? ch.cell.i+1: ch.r==3? ch.cell.i-1: ch.cell.i
      const y = ch.r==0? ch.cell.j-1: ch.r==2? ch.cell.j+1: ch.cell.j
      if(x>=grid.w || y>=grid.h || x<0 || y<0){
        ch.power=0
      }else{
        ch.cell = grid.col[x][y]
        ch.update()
      }
    })
    grid.charges.filter(ch=>ch.power<=0).forEach(ch=>{grid.destroyCharge(ch)})
    grid.structs.forEach(s=>{
      s.handlers.forEach(h=>{
        h.action(h.props, s, grid)
      })
    })
  }, grid.dt)

  return grid
  //---
  function destroyCharge(c){
    arrayRemove(grid.charges, c)
    c.div.remove()
  }
}

function createCell(grid, i, j, size){
  const div = createDiv(grid.div, i*size, j*size, size, size)
  div.style.zIndex = 100
  div.style.border='1px solid #444444'

  const cell = {
    div:div,
    i, j,    
    /** @type {ReturnType<typeof createStruct>} */
    struct:null,
    grid
  }
  
  return cell
}

function createStruct(cell, id, r=0) {
  const div = createDiv(cell.grid.div, cell.i*grid.size, cell.j*grid.size, grid.size, grid.size)
  div.style.backgroundImage='url(content/image/'+id+'.png)'
  div.style.backgroundSize='contain'
  div.style.imageRendering='pixelated'
  div.style.transform='rotate('+r*90+'deg)'
  div.title = id

  const struct = {
    id, r, div, cell,
    /** @type {Array<ReturnType<typeof createHandler>>} */
    handlers:[],
    //---
    rotate,
    addHandler
  }
  cell.struct = struct
  cell.grid.structs.push(struct)
  return struct
  //---
  function rotate(dr){
    struct.r+=dr
    if(struct.r<0){struct.r+=4}
    if(struct.r>3){struct.r-=4}
    div.style.transform='rotate('+struct.r*90+'deg)'
  }
  function addHandler(handler){
    struct.handlers.push(handler)
  }
}

function createHandler(id='', props={}, action=(props,struct, grid)=>{}){
  const handler = {id,props,action}
  return handler
}

function createCharge(/** @type {ReturnType<typeof createCell>} */cell, id, r=0, power=0){
  const div = createDiv(cell.grid.div, cell.i*grid.size, cell.j*grid.size, grid.size, grid.size)
  div.style.backgroundImage='url(content/image/'+id+'.png)'
  div.style.backgroundSize='contain'
  div.style.imageRendering='pixelated'
  div.style.transform='rotate('+r*90+'deg)'
  div.style.zIndex = 50
  div.title = id

  const divPower = createDiv(div, 0, 0, grid.size, grid.size)
  divPower.style.position = 'relative'
  divPower.style.fontSize = 20
  divPower.style.fontFamily = 'monospace'
  divPower.style.color = '#ffffff'
  divPower.style.textShadow = '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
  divPower.style.transform='rotate('+(-r*90)+'deg)'
  divPower.innerText = power

  const charge = {
    cell, div, divPower, id, r, power,
    //---
    update
  }
  cell.grid.charges.push(charge)
  update()
  return charge
  //---
  function update(){
    div.setPosition(charge.cell.i*charge.cell.grid.size, charge.cell.j*charge.cell.grid.size)
    div.style.transform='rotate('+charge.r*90+'deg)'
    divPower.style.transform='rotate('+(-charge.r*90)+'deg)'
    divPower.innerText = charge.power
  }
}

//------

const grid = createGrid()
const gridControl = { selCell:null }
const battle = createBattle(document.body, grid.w*grid.size + 30, 10, 400, 400)
grid.onTick.push((g)=>{battle.update()})

const generatorHandler = createHandler('generator', {timer:0, cd:5, power: 4}, (p,s,g)=>{
  if(p.timer==0){
    createCharge(s.cell, 'charge1', s.r, p.power)
  }
  p.timer++
  if(p.timer>=p.cd){p.timer=0}
})

const consumerHandler = createHandler('consumer', {power: 1}, (p,s,/** @type {ReturnType<typeof createGrid>} g */g)=>{
  g.charges.filter(ch=>ch.cell===s.cell).forEach(ch=>{
    ch.power--
    battle.createBullet((s.r-1)*Math.PI/2 + (Math.random()-0.5)*Math.PI/2)
  })
})

const redirectorHandler = createHandler('redirector', { }, (p,s,/** @type {ReturnType<typeof createGrid>} g */g)=>{
  g.charges.filter(ch=>ch.cell===s.cell).forEach(ch=>{
    ch.r = s.r
  })
})

const crystal = createStruct(grid.col[0][0], 'crystal', 1)
const ballista1 = createStruct(grid.col[1][0], 'ballista', 1)
const ballista2 = createStruct(grid.col[2][0], 'ballista', 2)
const ballista3 = createStruct(grid.col[2][1], 'ballista', 3)
const ballista4 = createStruct(grid.col[1][1], 'ballista', 0)

crystal.addHandler(generatorHandler)
ballista1.addHandler(consumerHandler)
ballista1.addHandler(redirectorHandler)
ballista2.addHandler(consumerHandler)
ballista2.addHandler(redirectorHandler)
ballista3.addHandler(consumerHandler)
ballista3.addHandler(redirectorHandler)
ballista4.addHandler(consumerHandler)
ballista4.addHandler(redirectorHandler)
//createCharge(grid.col[1][0], 'charge1', 1)

console.log(grid)
console.log(grid.col[0][0])

window.addEventListener('keydown',e=>{
  if(e.code === 'KeyW'){
  }
})

window.addEventListener('mousedown',e=>{ })