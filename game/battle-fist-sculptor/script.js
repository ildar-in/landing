const w = 50, h=25, size=20
const width = w*size, height=h*size

const blocks = []
for(let i=0;i<w;i++){
    blocks.push([])
    for(let j=0;j<h;j++){
        blocks[i].push(createBlockInfo(i,j))
    }
}

const blockViews = []
for(let i=0;i<w;i++){
    blockViews.push([])
    for(let j=0;j<h;j++){
        const block = blocks[i][j]
        const blockHtml = createDiv(document.body,block.x,block.y,size,size,tag='div')
        const blockView = {block,i,j,blockHtml}
        blockViews[i].push(blockView)
        updateBlockView(i,j)
    }
}

for(let i=25;i<40;i++){
    for(let j=10;j<25;j++){
        blocks[i][j].value=100
        updateBlockView(i,j)
    }
}

var pressedKeys = {};
window.onkeyup = function(e) { pressedKeys[e.code] = false; }
window.onkeydown = function(e) { pressedKeys[e.code] = true; }

const char = {
    w:40,h:30,x:50,y:h*size/2,
    dx:0,dy:0,
    jumpAmount:2,
    speed:7,
    freezeDyElapsed:0
}

const effects=[]
const attackSize = 40

const charHtml = createDiv(document.body,char.x,char.y,char.w,char.h,tag='div')

document.body.addEventListener('keydown',e=>{
    if(e.code === 'KeyW' && char.jumpAmount>0){
        char.dy=-25
        char.jumpAmount--
    }
})

document.body.addEventListener('mousedown',e=>{
    char.freezeDyElapsed=150
    createEffect(char.x,char.y)
    playAudio('content/audio/17_orc_atk_sword_1.wav')

    let damagedBlocks=[]
    getAllBlocks(blocks).forEach(b=>{
        if(b.value<=0){return}
        const distance = Math.sqrt((b.x-char.x)*(b.x-char.x) + (b.y-char.y)*(b.y-char.y))
        if(distance<attackSize){
            //console.log(distance)
            b.value -= 25
            if(b.value<=0){b.value=0}
            updateBlockView(b.i,b.j)
            //isDamage=true
            damagedBlocks.push(b)
            //
        }
    })
    console.log(damagedBlocks)
    if(damagedBlocks.length>0){
        playAudio('content/audio/26_sword_hit_1.wav')
    }
})

const fps = 60
const dt = 1000/fps

let gravity = 1
setInterval(()=>{

    if(pressedKeys['KeyA']){
        char.x-=char.speed
    }else if(pressedKeys['KeyD']){
        char.x+=char.speed
    }

    char.dy*=0.98
    char.dy+=gravity

    if(char.freezeDyElapsed>0){
        char.dy=0
    }
    char.y+=char.dy
    
    if(char.y+char.h>height){
        char.dy=0
        char.y=height-char.h
        char.jumpAmount = 2
    }

    char.freezeDyElapsed-=dt

    charHtml.style.left = char.x
    charHtml.style.top = char.y
    //charHtml.style.backgroundColor='#0000cc'
    charHtml.style.backgroundImage ='url("content/image/3.png")'
    charHtml.style.backgroundSize='contain'
    

}, dt)

//---------------

function updateBlockView(i,j){
    const block = blocks[i][j]
    blockView = blockViews[i][j]
    if(block.value==0){
        blockView.blockHtml.style.backgroundColor='#55555500'
    }else{
        const color = block.value==100?'#555555ff': block.value>50?'#886666': block.value>0?'#886666':'#ffffffFF'
        blockView.blockHtml.style.backgroundColor=color
    }
    blockView.blockHtml.style.border='1px solid #aaaaaa'
}

function getAllBlocks(items=[[]]){
    const res = []
    items.forEach(b=>b.forEach(v=>res.push(v)))
    return res
}

function createBlockInfo(i,j,value=0){
    return {
        i,j,value,
        x:i*size,y:j*size
    }
}

function createEffect(x,y){
    const effectHtml = createDiv(document.body,x,y,attackSize,attackSize,tag='div')
    //effectHtml.style.backgroundColor ='#ffcc33'
    //effectHtml.style.border ='1px solid #ffcc33'
    effectHtml.style.backgroundImage ='url("content/image/4.png")'
    effectHtml.style.backgroundSize='contain'
    setTimeout(()=>{
        document.body.removeChild(effectHtml)
    }, 500)
}


function playAudio(path){
    new Audio(path).play()
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
