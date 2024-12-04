const helpInfoHtml = createDiv(document.body, 50,50,800,200)
helpInfoHtml.style.userSelect='none'

const w = 50, h=25, size=20
const width = w*size, height=h*size

const fps = 60
const dt = 1000/fps

const allBlueprints = getBlueprints()
let currentBlueprint = allBlueprints[0]
const score = { missing:0, incorrect:0 }
let screenShake = 5

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
resetBlueprint()
calculateScore()

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

document.body.style.position='absolute'
document.body.style.top='0'
document.body.style.left='0'
document.body.style.margin='0'

setInterval(()=>{
    if(screenShake>0.1){
        document.body.style.top=Math.random()*screenShake
        document.body.style.left=Math.random()*screenShake
        screenShake*=0.8
    }else{
        screenShake=0
        document.body.style.top=0
        document.body.style.left=0
    }
}, dt)

setInterval(()=>{
    if(char.isFlip){
        charHtml.style.transform='scaleX(-1)'
    }else{
        charHtml.style.transform='scaleX(1)'
    }
}, dt)

window.addEventListener('keyup',e=>{
    if(e.code === 'KeyR'){
        screenShake=10
        resetSculpture()
    }
    if(e.code === 'KeyB'){
        resetBlueprint()
    }
})

window.addEventListener('keydown',e=>{
    if(e.code === 'KeyW' && char.jumpAmount>0){
        char.dy=-25
        char.jumpAmount--
    }
})

window.addEventListener('mousedown',e=>{

    let x = char.x
    let y = char.y
    char.freezeDyElapsed=150
    
    let diff = [e.pageX - char.x, e.pageY - char.y]
    diff = normalizeVector(diff)
    diff = multVector(diff, 25)
    x = char.x+diff[0]
    y = char.y+diff[1]

    createEffect(x,y,attackSize,attackSize)
    if(Math.random()<=0.33){playAudio('content/audio/17_orc_atk_sword_1.wav', 0.3)}
    else if(Math.random()<=0.66){playAudio('content/audio/17_orc_atk_sword_2.wav', 0.3)}
    else {playAudio('content/audio/17_orc_atk_sword_3.wav', 0.3)}

    const damage = 25
    let damagedBlocks=[]
    getAllBlocks(blocks).forEach(b=>{
        if(b.value<=0){return}
        const distance = Math.sqrt((b.x-x)*(b.x-x) + (b.y-y)*(b.y-y))
        if(distance<attackSize){
            b.value -= damage
            if(b.value<=0){b.value=0}
            updateBlockView(b.i,b.j)
            damagedBlocks.push(b)
            createDamageNumber(b.x,b.y,damage)
        }
    })
    if(damagedBlocks.length>0){
        screenShake=2
        playAudio('content/audio/26_sword_hit_1.wav', 0.3)
    }


    calculateScore()
    //const markeds = []
    //getAllBlocks(blocks).forEach(b=>{
    //    const distance = Math.sqrt((b.x-e.pageX)*(b.x-e.pageX) + (b.y-e.pageY)*(b.y-e.pageY))
    //    if(distance<w/2){
    //        b.isMarked=!e.shiftKey
    //        updateBlockView(b.i,b.j)
    //    }
    //    if(b.isMarked) {markeds.push([b.i,b.j])}
    //})
    //console.log(markeds)

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

//---------------------------------------------------------------------------------------

function calculateScore(){
    score.missing = 0
    score.incorrect = 0
    getAllBlocks().forEach(b=>{
        const isMarked = currentBlueprint.findIndex(bp=>bp[0]==b.i && bp[1]==b.j)!=-1
        if(isMarked && b.value<=0){
            score.missing++
        }
        if(!isMarked && b.value>0){
            score.incorrect++
        }
    })

    const errors = score.incorrect+score.missing
    let quality = 0
    if(errors == 0){
        quality = 1
    }else if(errors<currentBlueprint.length) {
        quality=(currentBlueprint.length-errors)/currentBlueprint.length
    }

    helpInfoHtml.innerText = 
`Качество скульптуры: ${Math.round(quality*100)}%

Движение - WASD; Удар - ЛКМ; Сбросить скульптуру - R; Другой шаблон - B; 
Лишних блоков: ${score.incorrect}
Недостает блоков: ${score.missing}
Всего в шаблоне: ${currentBlueprint.length}
`

}

function resetSculpture(){
    for(let i=25;i<40;i++){
        for(let j=15;j<25;j++){
            blocks[i][j].value=100
            updateBlockView(i,j)
        }
    }
}

function resetBlueprint(){
    
    //var id = Math.floor(allBlueprints.length*Math.random())
    var id = allBlueprints.indexOf(currentBlueprint)+1
    if(id>=allBlueprints.length){id=0}
    currentBlueprint=allBlueprints[id]
    //console.log(id)

    for(let i=0;i<w;i++){
        for(let j=0;j<h;j++){
            blocks[i][j].isMarked=false
        }
    }
    currentBlueprint.forEach(m=>{
        blocks[m[0]][m[1]].isMarked=true
    })
    getAllBlocks().forEach(b => {
        updateBlockView(b.i,b.j)
    })
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
    /** @type {Array<ReturnType<typeof createBlockInfo>>} */
    const block = blocks[i][j]
    blockView = blockViews[i][j]
    if(block.value==0){
        //blockView.blockHtml.style.backgroundColor='#55555500'
         blockView.blockHtml.style.backgroundColor='#87CEEB'
    }else{
        const color = block.value==100?'#555555ff': block.value>50?'#665544'
            : block.value>25?'#775533': block.value>0?'#885522':'#ffffffFF'
        blockView.blockHtml.style.backgroundColor=color
    }
    if(block.isMarked){
        blockView.blockHtml.style.border='2px solid #0077ff'
        blockView.blockHtml.style.zIndex=0
    }else{
        //blockView.blockHtml.style.border='1px solid #aaaaaa'
        blockView.blockHtml.style.border='none'
        blockView.blockHtml.style.zIndex=-1
    }
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
        x:i*size,y:j*size,
        isMarked:false
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

function createDamageNumber(x,y,text){
    const w=0,h=0
    const effectHtml = createDiv(document.body,x-w/2,y-h/2,w,h,tag='div')
    effectHtml.style.userSelect='none'
    effectHtml.style.backgroundSize='contain'
    effectHtml.innerText = text
    effectHtml.style.zIndex = 2
    effectHtml.style.textAlign='center'
    effectHtml.style.color='#ffffff'
    const dpos = [Math.random()*2+1,Math.random()-3]
    let number = 16
    const interval = setInterval(()=>{
        effectHtml.style.left = x
        effectHtml.style.top = y
        x+=dpos[0]
        y+=dpos[1]

        //var txtClr = number.toString(16)
        //while(txtClr.length<2){txtClr='0'+txtClr}
        number-=0.5
        if(number<0){ 
            clearInterval(interval)
            document.body.removeChild(effectHtml)
         }
    }, dt)
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


function getBlueprints(){

    const blueprint_T = [
        [
            25,
            15
        ],
        [
            25,
            16
        ],
        [
            25,
            17
        ],
        [
            26,
            15
        ],
        [
            26,
            16
        ],
        [
            26,
            17
        ],
        [
            27,
            15
        ],
        [
            27,
            16
        ],
        [
            27,
            17
        ],
        [
            28,
            15
        ],
        [
            28,
            16
        ],
        [
            28,
            17
        ],
        [
            29,
            15
        ],
        [
            29,
            16
        ],
        [
            29,
            17
        ],
        [
            30,
            15
        ],
        [
            30,
            16
        ],
        [
            30,
            17
        ],
        [
            31,
            15
        ],
        [
            31,
            16
        ],
        [
            31,
            17
        ],
        [
            31,
            18
        ],
        [
            31,
            19
        ],
        [
            31,
            20
        ],
        [
            31,
            21
        ],
        [
            31,
            22
        ],
        [
            31,
            23
        ],
        [
            31,
            24
        ],
        [
            32,
            15
        ],
        [
            32,
            16
        ],
        [
            32,
            17
        ],
        [
            32,
            18
        ],
        [
            32,
            19
        ],
        [
            32,
            20
        ],
        [
            32,
            21
        ],
        [
            32,
            22
        ],
        [
            32,
            23
        ],
        [
            32,
            24
        ],
        [
            33,
            15
        ],
        [
            33,
            16
        ],
        [
            33,
            17
        ],
        [
            33,
            18
        ],
        [
            33,
            19
        ],
        [
            33,
            20
        ],
        [
            33,
            21
        ],
        [
            33,
            22
        ],
        [
            33,
            23
        ],
        [
            33,
            24
        ],
        [
            34,
            15
        ],
        [
            34,
            16
        ],
        [
            34,
            17
        ],
        [
            35,
            15
        ],
        [
            35,
            16
        ],
        [
            35,
            17
        ],
        [
            36,
            15
        ],
        [
            36,
            16
        ],
        [
            36,
            17
        ],
        [
            37,
            15
        ],
        [
            37,
            16
        ],
        [
            37,
            17
        ],
        [
            38,
            15
        ],
        [
            38,
            16
        ],
        [
            38,
            17
        ],
        [
            39,
            15
        ],
        [
            39,
            16
        ],
        [
            39,
            17
    ]]

    const blueprint_reversedT = [
        [
            28,
            23
        ],
        [
            28,
            24
        ],
        [
            29,
            23
        ],
        [
            29,
            24
        ],
        [
            30,
            21
        ],
        [
            30,
            22
        ],
        [
            30,
            23
        ],
        [
            30,
            24
        ],
        [
            31,
            21
        ],
        [
            31,
            22
        ],
        [
            31,
            23
        ],
        [
            31,
            24
        ],
        [
            32,
            15
        ],
        [
            32,
            16
        ],
        [
            32,
            17
        ],
        [
            32,
            18
        ],
        [
            32,
            19
        ],
        [
            32,
            20
        ],
        [
            32,
            21
        ],
        [
            32,
            22
        ],
        [
            32,
            23
        ],
        [
            32,
            24
        ],
        [
            33,
            15
        ],
        [
            33,
            16
        ],
        [
            33,
            17
        ],
        [
            33,
            18
        ],
        [
            33,
            19
        ],
        [
            33,
            20
        ],
        [
            33,
            21
        ],
        [
            33,
            22
        ],
        [
            33,
            23
        ],
        [
            33,
            24
        ],
        [
            34,
            21
        ],
        [
            34,
            22
        ],
        [
            34,
            23
        ],
        [
            34,
            24
        ],
        [
            35,
            20
        ],
        [
            35,
            21
        ],
        [
            35,
            22
        ],
        [
            35,
            23
        ],
        [
            35,
            24
        ],
        [
            36,
            20
        ],
        [
            36,
            21
        ],
        [
            36,
            22
        ],
        [
            36,
            23
        ],
        [
            36,
            24
        ],
        [
            37,
            20
        ],
        [
            37,
            21
        ],
        [
            37,
            22
        ],
        [
            37,
            23
        ],
        [
            37,
            24
        ],
        [
            38,
            21
        ],
        [
            38,
            22
        ],
        [
            38,
            23
        ]
    ]

    return [blueprint_T, blueprint_reversedT]
}