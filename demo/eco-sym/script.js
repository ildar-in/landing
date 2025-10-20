window.addEventListener('load', e => {

	const timeDelta = 13
	const persec = timeDelta/1000
	const center = getCenterOfScreen()
	const screen = {w:600, h:400}

	const guiDiv = document.createElement('div')
	document.body.appendChild(guiDiv)
	
	let gos = []

	let soilMatrix = []
	const soilsWCount = 75, soilsHCount = 50
	const soilW = screen.w / soilsWCount, soilH = screen.h / soilsHCount
	for(let i=0;i<soilsWCount;i++){
		let soilMatrixLine = []
		soilMatrix.push(soilMatrixLine)
		for(let j=0;j<soilsHCount;j++){
			let soilCell = { 
				i, 
				j, 
				resource: 0.2 + Math.random() * 0.8,
				x: i * soilW,
				y: j * soilH,
				/** @type {HTMLDivElement} */
				div: null,
			}
			if(i>15 && i<35 && j>15 && j<35) { soilCell.resource = 10 }
			if(i>20 && i<30 && j>20 && j<30) { soilCell.resource = 0 }
			
			soilCell.getColor = ()=> '#'+Math.ceil( Math.min(soilCell.resource,1)*15  ).toString(16)+'337'
			soilCell.updateColor = ()=> { soilCell.div.style.backgroundColor = soilCell.getColor() }
			soilCell.div = createDiv(soilCell.x, soilCell.y, soilW, soilH,  soilCell.getColor())
			soilMatrixLine.push(soilCell)
		}
	}

	for(let i=0;i<1;i++){
		createPlant((Math.random()) * screen.w,  (Math.random()) * screen.h)
	}

	setInterval(()=>{
		
		gos.forEach(g=>{
			g.update()
		})

	}, timeDelta)

	function createPlant(x=0,y=0,energyStart=1) {
		x=x<0?0:x>screen.w-0.5?screen.w-0.5:x
		y=y<0?0:y>screen.h-0.5?screen.h-0.5:y
		const plant = {
			x,
			y,
			size: 15,
			spreadSize: 50,
			energy: energyStart,
			/** @type {HTMLDivElement} */
			div: null,
			soilCell: null,
			resourceCollected: 0
		}
		plant.size = 3 + plant.energy * 10
		plant.div = createDiv(plant.x - plant.size / 2, plant.y - plant.size / 2, plant.size, plant.size, '#0905')
		plant.div.style.borderRadius = '5000px'
		plant.soilCell = soilMatrix[Math.floor(plant.x / soilW)][Math.floor(plant.y / soilH)]
		if(!plant.soilCell){
			console.log(plant.soilCell,plant.x,plant.y, Math.floor(plant.x / soilW), Math.floor(plant.y / soilH))
		}
		plant.update = () => {
			
			plant.size = 3 + plant.energy * 10
			plant.div.style.width = plant.size
			plant.div.style.height = plant.size
			plant.div.style.left = plant.x - plant.size/2
			plant.div.style.top = plant.y - plant.size/2

			plant.energy -= 0.01
			if(plant.energy<=0){
				plant.soilCell.resource += plant.resourceCollected
				plant.soilCell.updateColor()
				gos.remove(plant)
				plant.div.parentElement.removeChild(plant.div)
				return
			}

			function subtractIfPossible(currentValue, subtractValue) {
				const amountToSubtract = Math.min(currentValue, subtractValue);
				return currentValue - amountToSubtract;
			}

			const consumeMax = 0.1/5
			const consumeNeed = Math.min(consumeMax, 1-plant.energy)
			const elapsedResouce = subtractIfPossible(plant.soilCell.resource, consumeNeed)
			let consumed = plant.soilCell.resource - elapsedResouce
			plant.soilCell.resource = elapsedResouce
			let plantsAround = 1
			gos.forEach(g=>{
				if(g!=plant){
					if(Math.abs(g.x-plant.x)<10 && Math.abs(g.y-plant.y)<10){
						plantsAround++
					}
				}
			})
			let energyMultipler = 5/plantsAround

			plant.energy += consumed * energyMultipler
			plant.resourceCollected += consumed

			if (plant.energy >= 1 && plant.resourceCollected>0.1) {
				const energyToReproduce = 0.5
				plant.energy-=energyToReproduce
				const spreadResource = Math.min(0.1, plant.resourceCollected)
				const childPlant = createPlant(
					plant.x + (Math.random()-0.5) * plant.spreadSize,
					plant.y + (Math.random()-0.5) * plant.spreadSize, 
					energyToReproduce)
				childPlant.resourceCollected+=spreadResource
				plant.resourceCollected -= spreadResource
			}

			plant.soilCell.updateColor()
			// consumeMax.log(plant.energy, plant.resourceCollected, )
		}
		plant.div.addEventListener('click', e => {
			console.log(plant.soilCell)
		})
		gos.push(plant)
		return plant
	}
})

function createDiv(x=0,y=0,w=50,h=50,color='#33333366'){
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

function initUpdateMouseMove(player, mouseDiv) {
	document.onmousemove = handleMouseMove
	function handleMouseMove(event) {
		var eventDoc, doc, body

		event = event || window.event
		if (event.pageX == null && event.clientX != null) {
			eventDoc = (event.target && event.target.ownerDocument) || document
			doc = eventDoc.documentElement
			body = eventDoc.body

			event.pageX = event.clientX +
				(doc && doc.scrollLeft || body && body.scrollLeft || 0) -
				(doc && doc.clientLeft || body && body.clientLeft || 0)
			event.pageY = event.clientY +
				(doc && doc.scrollTop || body && body.scrollTop || 0) -
				(doc && doc.clientTop || body && body.clientTop || 0)
		}
		player.tx = event.pageX
		player.ty = event.pageY

		mouseDiv.style.left = event.pageX-15
		mouseDiv.style.top = event.pageY-15
	}
}

function getDiffTowards(startX, startY, targetX, targetY, movementDistance) {
	let dx = targetX - startX;
	let dy = targetY - startY;
	let distance = Math.sqrt(dx * dx + dy * dy);

	if (distance === 0) {
		// return { x: startX, y: startY }; // No movement if at the target
		return { x: 0, y: 0 }; // No movement if at the target
	}

	// Ensure we don't overshoot if the remaining distance is less than movementDistance
	let actualMovementDistance = Math.min(movementDistance, distance);

	let unitX = dx / distance;
	let unitY = dy / distance;

	//let newX = startX + (unitX * actualMovementDistance);
	//let newY = startY + (unitY * actualMovementDistance);

	return { x: unitX * actualMovementDistance, y: unitY * actualMovementDistance };
}

function getCenterOfScreen() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const leftPosition = (windowWidth ) / 2;
  const topPosition = (windowHeight ) / 2;
	return {
		x: leftPosition,
		y: topPosition,
	}
}

function getLen(x1,y1,x2,y2){
	return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2))
}

// the only difference between minBy and maxBy is the ordering
// function, so abstract that out
Array.prototype.minBy = function(fn) { 
  return this.extremumBy(fn, Math.min); 
};

Array.prototype.maxBy = function(fn) { 
  return this.extremumBy(fn, Math.max);
};

Array.prototype.extremumBy = function(pluck, extremum) {
  return this.reduce(function(best, next) {
    var pair = [ pluck(next), next ];
    if (!best) {
       return pair;
    } else if (extremum.apply(null, [ best[0], pair[0] ]) == best[0]) {
       return best;
    } else {
       return pair;
    }
  },null)[1];
}

Array.prototype.remove = function(elementToRemove) {
	const index = this.indexOf(elementToRemove); // Find the index of the element
	if (index > -1) { // Only splice if element is found
		this.splice(index, 1); // Remove 1 element starting from the found index
	} 
  return this;
};