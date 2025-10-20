window.addEventListener('load', e => {
	const game = createGame()
})

function createGame(){

	const tokenColors = ['#eb4034', '#d1c31f', '#1c9c13', '#0b1bb0', '#32333d', '#edebda']
	const slotColors = ['#eb403488', '#d1c31f88', '#1c9c1388', '#0b1bb088', '#32333d88', '#edebda88']

	const boardDiv = document.createElement('div')
	boardDiv.style.width='100%'
	boardDiv.style.height='75%'
	boardDiv.style.backgroundColor='#AAA'
	document.body.append(boardDiv)

	const bottomDiv = document.createElement('div')
	bottomDiv.style.width='100%'
	bottomDiv.style.height='25%'
	bottomDiv.style.display = 'flex'
	bottomDiv.style.backgroundColor='#CCC'
	document.body.append(bottomDiv)

	const slotDiv1 = createSlotDiv(1, boardDiv )
	const slotDiv2 = createSlotDiv(2, boardDiv )
	const slotDiv3 = createSlotDiv(3, boardDiv )

	const slots = []
	const tokens = []

	for(let i=0;i<8;i++){
		const slotDiv = createSlotDiv(5,  bottomDiv )
		slots.push(slotDiv)
		const tokenDiv = createTokenDiv( getRandomInt(0, 5), slotDiv)
		tokens.push(tokenDiv)
		slotDiv.data.contains = tokenDiv
	}

	return {}

	//------------------------------------------------------------------------------------------

	function createTokenDiv(id, parent){
		const div = createDiv('4vh', '4vh', tokenColors[id])
		div.style.border='2px solid #222'
		div.style.borderRadius='5px'
		div.style.margin='1vh 1vh 1vh 1vh'
		div.draggable=true
		div.id='i'+Math.random()
		div.style.cursor='grab'
		div.classList.add('grabbable')
		parent.appendChild(div)
		div.addEventListener('dragstart', e=>{
			e.dataTransfer.setData("text/plain", e.target.id);
		})
		return	div
	}

	function createSlotDiv(id, parent){
		const div = createDiv('6.5vh', '6.5vh', slotColors[id])
		div.style.border='3px solid #555'
		div.style.borderRadius='5px'
		div.data = { 
			contains: null
		}
		parent.appendChild(div)
		div.addEventListener('dragover', e=>{
			if(div.data.contains !== null){
				return
			}
			e.preventDefault()
			div.style.backgroundColor=tokenColors[id]
		})
		div.addEventListener('dragleave', e=>{
			e.preventDefault()
			div.style.backgroundColor=slotColors[id]
		})
		div.addEventListener('drop', e=>{
			if(div.data.contains !== null){
				return
			}
			e.preventDefault()
			div.style.backgroundColor=slotColors[id]
			const data = e.dataTransfer.getData("text/plain")
			const droppedElement = document.getElementById(data)
			const dropTarget = e.target

			droppedElement.parentNode.data.contains = null
			droppedElement.parentNode.removeChild(droppedElement)
			dropTarget.appendChild(droppedElement)
			dropTarget.data.contains = droppedElement
		})
		return div
  }
}



function createDiv(w,h,color='#33333366'){
	const div = document.createElement('div')
	div.style.backgroundColor =  color
	div.style.width=w
	div.style.height=h
	document.body.appendChild(div)
	return div
}

function createAbsoulteDiv(x=0,y=0,w=50,h=50,color='#33333366'){
	const div = document.createElement('div')
	div.style.width = w
	div.style.height = h
	div.style.position='absolute'
	div.style.left = x
	div.style.top = y
	div.style.backgroundColor =  color
	document.body.appendChild(div)
	return div
}

function getRandomInt(min, max) {
  min = Math.ceil(min); // Ensure min is an integer
  max = Math.floor(max); // Ensure max is an integer
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// let o=0
// function update({context, width, height} = createContext()){

// 	//context.clearRect(0,0,800,600)
// //
// 	//const x=25, y=25, w=40, w2=12, n=10, m=10, wq = 3, lw = 2
// //
// 	//context.fillStyle = '#000000'
// 	//context.fillRect(x+w/2, y+w/2, (n-1)*(2*w-2*w2)+w/2, (m-1)*(2*w-2*w2)+w/2)
// //
// 	//context.fillStyle = '#cccccc'
// 	//context.strokeStyle = '#cccccc'
// //
// 	//drawOctagonGrid(context, n, m, x, y, w, w2, wq, lw)
// }
