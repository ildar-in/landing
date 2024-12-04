const w = 50, h=25, size=20
const width = w*size, height=h*size

const fps = 60
const dt = 1000/fps

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

resetSculpture()

var pressedKeys = {};
window.onkeyup = function(e) { pressedKeys[e.code] = false; }
window.onkeydown = function(e) { pressedKeys[e.code] = true; }

const char = {
    w:40,h:30,
    x:450,y:h*size/2,
    dx:0,dy:0,
    jumpAmount:2,
    speed:7,
    freezeDyElapsed:0,
    isFlip:false
}

const effects=[]
const attackSize = 40

const charHtml = createDiv(document.body,char.x,char.y,char.w,char.h,tag='div')

setInterval(()=>{
    if(char.isFlip){
        charHtml.style.transform='scaleX(-1)'
    }else{
        charHtml.style.transform='scaleX(1)'
    }
}, dt)

document.body.addEventListener('keyup',e=>{
    if(e.code === 'KeyR'){
        resetSculpture()
    }
})

document.body.addEventListener('keydown',e=>{
    if(e.code === 'KeyW' && char.jumpAmount>0){
        char.dy=-25
        char.jumpAmount--
    }
})

document.body.addEventListener('mousedown',e=>{

    let x = char.x
    let y = char.y
    char.freezeDyElapsed=150
    
    let diff = [e.pageX - char.x, e.pageY - char.y]
    diff = normalizeVector(diff)
    diff = multVector(diff, 25)
    x = char.x+diff[0]
    y = char.y+diff[1]
    //x = e.pageX;
    //y = e.pageY;

    createEffect(x,y,attackSize,attackSize)
    if(Math.random()<=0.33){playAudio('content/audio/17_orc_atk_sword_1.wav', 0.3)}
    else if(Math.random()<=0.66){playAudio('content/audio/17_orc_atk_sword_2.wav', 0.3)}
    else {playAudio('content/audio/17_orc_atk_sword_3.wav', 0.3)}

    let damagedBlocks=[]
    getAllBlocks(blocks).forEach(b=>{
        if(b.value<=0){return}
        const distance = Math.sqrt((b.x-x)*(b.x-x) + (b.y-y)*(b.y-y))
        if(distance<attackSize){
            b.value -= 25
            if(b.value<=0){b.value=0}
            updateBlockView(b.i,b.j)
            damagedBlocks.push(b)
        }
    })
    if(damagedBlocks.length>0){
        playAudio('content/audio/26_sword_hit_1.wav', 0.3)
    }
})

//----------------

let gravity = 1
setInterval(()=>{

    if(pressedKeys['KeyA']){
        char.isFlip=true
        if(!getCharacterBlocked(-char.speed, 0)){
            char.x-=char.speed
        }
    }else if(pressedKeys['KeyD']){
        char.isFlip=false
        if(!getCharacterBlocked(char.speed, 0)){
            char.x+=char.speed
        }
    }

    char.dy*=0.98
    char.dy+=gravity

    if(char.freezeDyElapsed>0){
        char.dy=0
    }
    if(char.y+char.h>=height && char.dy>0){
        char.dy=0
        char.y=height-char.h
        char.jumpAmount = 2
    }else if (getCharacterBlocked(0,char.dy)){
        char.dy=0
        char.jumpAmount = 2
    }else{
        char.y+=char.dy
    }

    char.freezeDyElapsed-=dt

    charHtml.style.left = char.x-char.w/2+char.speed
    charHtml.style.top = char.y
    //charHtml.style.backgroundColor='#0000cc'
    charHtml.style.backgroundImage ='url("content/image/3.png")'
    charHtml.style.backgroundSize='contain'
}, dt)

//---------------

function resetSculpture(){
    for(let i=25;i<40;i++){
        for(let j=15;j<25;j++){
            blocks[i][j].value=100
            updateBlockView(i,j)
        }
    }
}

function getCharacterBlocked(dx,dy){
    const block = getAllBlocks().find(b=>{
        //if(b.value>0 && isRectanglesCollides(char.x + dx,char.y + dy, char.w/2, char.h, b.x,b.y,w,h))
        if(b.value>0 && FindPoint(b.x,b.y,b.x+w,b.y+h, char.x + dx+char.w/2,char.y + dy+char.h))
        {
            return true
        }
        return false
    })
    return block
}

function updateBlockView(i,j){
    const block = blocks[i][j]
    blockView = blockViews[i][j]
    if(block.value==0){
        blockView.blockHtml.style.backgroundColor='#55555500'
    }else{
        const color = block.value==100?'#555555ff': block.value>50?'#665544'
            : block.value>25?'#775533': block.value>0?'#885522':'#ffffffFF'
        blockView.blockHtml.style.backgroundColor=color
    }
    blockView.blockHtml.style.border='1px solid #aaaaaa'
}

/**
 * 
 * @param {*} items 
 * @returns {Array<ReturnType<typeof createBlockInfo>>}
 */
function getAllBlocks(items=blocks){
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

function createEffect(x,y,w,h){
    const effectHtml = createDiv(document.body,x-w/2,y-h/2,w,h,tag='div')
    //effectHtml.style.backgroundColor ='#ffcc33'
    //effectHtml.style.border ='1px solid #ffcc33'
    effectHtml.style.backgroundImage ='url("content/image/4.png")'
    effectHtml.style.backgroundSize='contain'
    setTimeout(()=>{
        document.body.removeChild(effectHtml)
    }, 500)
}

function playAudio(path,volume=1){
    var a = new Audio(path)
    a.volume = volume
    a.play()
    return a
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


//-----------------

function normalizeVector(v=[]){
    var x=v[0],y=v[1];
    var length = Math.sqrt(x**2+y**2);
    //Then divide the x and y by the length.
    x = x/length;
    y = y/length;
    return [x,y]
}
function multVector(v=[], m=1){
    return [v[0]*m,v[1]*m]
}

// Javascript program to Check if a 
// point lies on or inside a rectangle | Set-2 
 
// function to find if given point 
// lies inside a given rectangle or not. 
function FindPoint(x1, y1, x2, y2, x, y) 
{ 
    return x > x1 && x < x2 && y > y1 && y < y2
} 
function isRectanglesCollides(x1,y1,w1,h1, x2,y2,w2,h2) {
	return overlaps({x1:x1,y1:y1, x2:x1+w1,y2:y1+h1},{x1:x2,y1:y2, x2:x2+w2,y2:y2+h2});
}
// Check if rectangle a overlaps rectangle b
// Each object (a and b) should have 2 properties to represent the
// top-left corner (x1, y1) and 2 for the bottom-right corner (x2, y2).
function overlaps(a, b) {
	// no horizontal overlap
	if (a.x1 >= b.x2 || b.x1 >= a.x2) return false;

	// no vertical overlap
	if (a.y1 >= b.y2 || b.y1 >= a.y2) return false;

	return true;
}