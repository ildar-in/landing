document.body.style.position='absolute'
document.body.style.top='0'
document.body.style.left='0'
document.body.style.margin='0'

function createGrid(){
  const w = 25, h=15, size=35, dt=250
  const collumns = []
  const cells = []

  const grid = {
    w,h,size,dt,
    //** @type {Array<Array<ReturnType<typeof createCell>>>} */
    col: collumns,
    //** @type {Array<ReturnType<typeof createCell>>} */
    cells,
    //** @type {Array<ReturnType<typeof createStruct>>} */
    structs:[],
    //** @type {Array<ReturnType<typeof createCharge>>} */
    charges:[],
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

  setInterval(()=>{
    grid.structs.forEach(s=>{
      s.handlers.forEach(h=>{
        h.action(h.props, s, grid)
      })
    })
    grid.charges.forEach(c=>{
      if(c.power<=0){
        grid.destroyCharge(c)
        return
      }
      const x = c.r==1? c.cell.i+1: c.r==3? c.cell.i-1: c.cell.i
      const y = c.r==0? c.cell.j-1: c.r==2? c.cell.j+1: c.cell.j
      if(x>=grid.w || y>=grid.h || x<0 || y<0){
        grid.destroyCharge(c)
      }else{
        c.cell = grid.col[x][y]
        c.updatePosition()
      }
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
  const div = createDiv(document.body, i*size, j*size, size, size)
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
  const div = createDiv(document.body, cell.i*grid.size, cell.j*grid.size, grid.size, grid.size)
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
  const div = createDiv(document.body, cell.i*grid.size, cell.j*grid.size, grid.size, grid.size)
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
    updatePosition: update
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

const generatorHandler = createHandler('generator', {timer:0, cd:5, power: 3}, (p,s,g)=>{
  if(p.timer==0){
    createCharge(s.cell, 'charge1', s.r, p.power)
  }
  p.timer++
  if(p.timer>=p.cd){p.timer=0}
})

const consumerHandler = createHandler('consumer', {power: 1}, (p,s,/** @type {ReturnType<typeof createGrid>} g */g)=>{
  const charges = g.charges.filter((v)=>v.cell===s.cell)
  if(charges.length)
  {
    charges.forEach(c=>{
      c.power--
    })
  }
})

const crystal = createStruct(grid.col[0][0], 'crystal', 1)
const ballista1 = createStruct(grid.col[1][0], 'ballista', 1)
const ballista2 = createStruct(grid.col[2][0], 'ballista', 2)
const ballista3 = createStruct(grid.col[2][3], 'ballista', 2)

crystal.addHandler(generatorHandler)
ballista1.addHandler(consumerHandler)
ballista2.addHandler(consumerHandler)
ballista3.addHandler(consumerHandler)

//createCharge(grid.col[1][0], 'charge1', 1)

console.log(grid)
console.log(grid.col[0][0])

window.addEventListener('keydown',e=>{
  if(e.code === 'KeyW'){
  }
})

window.addEventListener('mousedown',e=>{ })