
//-------------------------------------------

//const colors = [
//    '#ff0000',
//    '#00ff00',
//    '#0000ff',
//    '#ffff00',
//    '#ff00ff',
//]
//const colors = [
//    '#EF3E36',
//    '#17BEBB',
//    '#2E282A',
//    '#EDB88B',
//    '#FAD8D6',
//]

function initHtml(game=initGame()){
  const grid=game.grid
  const gridClick=game.gridClick

  const colors = [
    '#EF3E36',
    '#358600',
    '#39517a',
    '#ede9d0',
    '#666666',
  ]
  const elementIcons = ['🔴','🟢','🔵','⚪','⚫']

  const textInfoHtml = createDiv(document.body, 400, 10, 500, 300)
  
  let gridHtml = initGridHtml()

  game.events.addEventListener('turnEnd', e=>{
    gridHtml = initGridHtml(e)
  })

  return { }

  //---------

  function initGridHtml(turnInfo){

    if(game.player.hp<=0){
      textInfoHtml.innerText=`Game over`
      return
    }

    textInfoHtml.innerText=`Player info: hp: ${game.player.hp}/${game.player.hpMax} mp:\n`
    game.player.mp.forEach((mp,i)=>{
      textInfoHtml.innerText+=elementIcons[mp.elementId]+ mp.value+'/'+mp.valueMax+'\n'
    })
    textInfoHtml.innerText+=`\nEnemies info:\n`
    game.enemies.forEach(e=>{ if(e.hp<=0){return}
      textInfoHtml.innerText+=`hp:${e.hp}/${e.hpMax}; damage:${e.dmg}\n`
    })

    textInfoHtml.innerText+=`\nAbilities info:\n`
    game.player.playerAbilities.forEach((a,i)=>{

      let manaNeedText=''
      a.manaNeed.forEach(mn=>{
        manaNeedText+=elementIcons[mn.elementId]+mn.amount
      })
      textInfoHtml.innerText+= `${manaNeedText}| ${a.name}: ${a.description}\n`
 
    })

    const gridHtml = document.createElement('div')
    document.body.appendChild(gridHtml)

    grid.forEach((l, i)=>{
      l.forEach((v,j)=>{
          const cell = createCell(v, i,j, 45,45)
          cell.addEventListener('click', e=>{
              
              const done = gridClick(i,j)

              const soundId = done.length<3?1: done.length<5?2 : 3;
              var audio = new Audio('content/audio/pop00'+soundId+'.mp3')
              audio.play()

              document.body.removeChild(gridHtml)
              initGridHtml()
          })
      })
    })

    function createCell(v,i,j,w,h){
      const cellHtml = createDiv(gridHtml, j*w, i*h, w, h, 'button')
      cellHtml.style.backgroundColor = colors[v]
      cellHtml.style.border = '2px solid #111111'
      cellHtml.classList.add('neumorphic')
      return cellHtml
    } 
  }

  


  function createDiv(parent,x,y,w,h,tag='div'){
    const cellHtml = document.createElement(tag)
    parent.appendChild(cellHtml)
    cellHtml.style.position='absolute'
    cellHtml.style.left = x
    cellHtml.style.top = y
    cellHtml.style.width = w
    cellHtml.style.height = h
    return cellHtml
  }
}