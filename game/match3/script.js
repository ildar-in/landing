
const w=8, h=8

const grid = []
for(let i=0;i<w;i++) {
    const line = []
    grid.push(line)
    for(let j=0;j<h;j++) {
        line.push(getRandomValue())
    }
}

function getRandomValue(){
    return Math.ceil(Math.random()*5)-1
}

function gridClick(i,j){
    
    const done = getMatched(i,j,grid[i][j])
    console.log(done)

    const lines = []
    for(var i=0;i<w;i++){
        lines.push({i,items:[]})
    }
    done.forEach(d=>{
        lines[d.i].items.push(d)
    })

    lines.forEach(l=>{
        console.log(l)

        l.items.forEach(d=>{
            for(var i=d.i;i>0;i--){
                grid[i][d.j]=grid[i-1][d.j]
            }
            grid[0][d.j]=getRandomValue()
            
        })
    })

    return done
}

function getMatched(i,j, v, done = []){
    if(i<0 || i>=w){return done}
    if(j<0 || j>=h){return done}

    if(grid[i][j]!=v){return done}

    if(done.findIndex(d=>d.i==i && d.j==j) != -1){
        return
    }
    done.push({i,j})
    
    getMatched(i+1, j, v, done)
    getMatched(i-1, j, v, done)
    getMatched(i, j+1, v, done)
    getMatched(i, j-1, v, done)
        
    return done
}

//--------

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
const colors = [
    '#EF3E36',
    '#358600',
    '#39517a',
    '#ede9d0',
    '#a5438d',
]
initGridHtml()
function initGridHtml(){

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

function randomInt(min,max){
    return min + Math.ceil(Math.random()*(max-min+1))-1
}