window.addEventListener('load', e => {
	const game = createGame()
})

function createGame(){

	const gobjList = []
	const mapWidth = 70
	const mapHeight = 35
	const map = []
	const mapList = []
	for(let i=0;i<mapWidth;i++){
		map.push([])
		for(let j=0;j<mapHeight;j++){
			const cell = {
				i,j,items:[]
			}
			map[i][j] = cell
			mapList.push(cell)
		}
	}

	const boardDiv = document.createElement('div')
	boardDiv.style.width='100%'
	boardDiv.style.height='100%'
	boardDiv.style.margin='0'
	boardDiv.style.padding='0'
	boardDiv.style.backgroundColor='#222'
	document.body.append(boardDiv)

	const descriptionDiv = createAbsoulteDiv(0,0,300,200,'#3330',boardDiv)
	descriptionDiv.style.zIndex = 10000
	descriptionDiv.style.color = '#AAA'
	descriptionDiv.style.pointerEvents = 'none'

	let isPaused = false
	document.body.addEventListener('click',e=>{
		isPaused=!isPaused
	})

	generateTrees(100)

	const effects=[]
	const heroes=[]
	const homes=[]
	const goblins=[]

	const home1 = createHome(20,10)
	homes.push(home1)
	const home2 = createHome(48,25)
	homes.push(home2)

	
	const goblinChasingDistance = 12
	const goblinSpawnMax = 25
	const goblinSpawnDelay = 10
	let goblinSpawnDelayElapsed = 10
	let heroIdCounter = 0
	const heroCount = 5
	const heroSpawnDelay = 20
	let heroSpawnDelayElapsed = 20
	const forestSpeedLoseChance = 0.8
	setInterval(()=>{
		if(isPaused) { return }

		goblinsUpdate()
		heroesUpdate()

		gobjList.forEach(g => {
			if(g.x<0){g.x+=mapWidth}
			if(g.x>=mapWidth){g.x-=mapWidth}
			if(g.y<0){g.y+=mapHeight}
			if(g.y>=mapHeight){g.y-=mapHeight}
			g.update()
			if(g.dx!=0 || g.dy!=0){
				if(map[g.x][g.y].items.length!=0){
					if(Math.random()<forestSpeedLoseChance){
						g.dx=0
						g.dy=0
					}
				}
				g.x+=g.dx
				g.y+=g.dy
				g.dx=0
				g.dy=0
			}
		})

		removeWhere(goblins, g=>g.hp<=0, g=>g.remove())
		removeWhere(heroes, g=>g.hp<=0, g=>g.remove())

	}, 100)
	
	setInterval(()=>{
		effects.forEach(e=>{
			e.duration-=30
		})
		removeWhere(effects, g=>g.duration<=0, e=>{ e.div.parentElement.removeChild(e.div) })
	},30)

	return {}

	//------------------------------------------------------------------------------------------🕹

	function heroesUpdate() {
		if(heroes.length<heroCount && heroSpawnDelayElapsed<=0){
			const hero = createHero( getRandomInt(0,mapWidth),  getRandomInt(0,mapHeight) )
			heroes.push(hero)
			heroSpawnDelayElapsed=heroSpawnDelay
		}
		heroSpawnDelayElapsed--

		heroes.forEach(h => {
			if(h.level==0){
				if(h.gold>5){
					h.gold-=5
					h.level=1
					h.dmg+=1
					h.maxHp+=5
					h.div.innerText = '👨‍🎤'+h.name
				}
			}
			if(h.level==1){
				if(h.gold>10){
					h.gold-=10
					h.level=2
					h.dmg+=1
					h.maxHp+=5
					h.div.innerText = '🦸‍♂️'+h.name
				}
			}
			if(h.level==2){
				if(h.gold>100){
					h.gold-=100
					h.level=3
					h.dmg+=1
					h.maxHp+=5
					h.div.innerText = '🧙‍♂️'+h.name
				}
			}

			const heroTargetOffsetDistance = 8
			const dx = h.target.x - h.x
			const dy = h.target.y - h.y

			if(h.hp<=h.maxHp){
				const home = homes.minBy(m=> getDistance(h,m))
				if(h.hp<=h.maxHp/2){
					h.target.enemy = null
					h.target.x=home.x
					h.target.y=home.y
				}
				if(getDistance(h,home)<=1){
					if(h.gold>=1 && h.maxHp-h.hp>=8){
						h.gold-=1
						h.hp+=10
						if(h.hp>h.maxHp){h.hp=h.maxHp}
					}
					if(h.hp<h.maxHp){
						if(Math.random()<0.3) { h.hp++ }
					}
				}
			}

			if(h.target.enemy!=null){
				if(h.target.enemy.hp>0){
					h.target.x=h.target.enemy.x
					h.target.y=h.target.enemy.y
				}else{
					h.target.enemy=null
				}
			} else if (Math.random() <= 0.10) {
				h.target.x += getRandomInt(-heroTargetOffsetDistance, heroTargetOffsetDistance)
				h.target.y += getRandomInt(-heroTargetOffsetDistance, heroTargetOffsetDistance)
			}
			if (h.target.x < 0) { h.target.x += mapWidth} 
			if (h.target.x > mapWidth) { h.target.x -= mapWidth} 
			if (h.target.y < 0) { h.target.y += mapHeight} 
			if (h.target.y > mapHeight) { h.target.y -= mapHeight} 

			if (Math.abs(dx) + Math.abs(dy) > 1) {
				let isXChasing = dx != 0 && Math.random() < 0.5 || dy == 0
				if (isXChasing) {
					h.dx = dx > 0 ? 1 : -1
				} else {
					h.dy = dy > 0 ? 1 : -1
				}
			}
		})
	}

	function goblinsUpdate() {
		goblins.forEach(g => {
			if(g.chasingTarget!==null){
				const h = g.chasingTarget
				const dx = h.x - g.x
				const dy = h.y - g.y
				if (Math.abs(dx) + Math.abs(dy) > goblinChasingDistance || h.hp<=0){
					g.chasingTarget=null
				}
				else {
					if (Math.abs(dx) + Math.abs(dy) <= 1 && h.hp>0 && g.hp>0) {
						h.hp -= g.dmg
						g.hp -= h.dmg
						createEffect(g,h,'#9991')
						createEffect(h,g,'#7002')
						if(g.hp<=0){
							h.gold+=g.reward
						}
					} else {
						let isXChasing = dx != 0 && Math.random() < 0.5 || dy==0
						if (isXChasing) {
							g.dx = dx > 0 ? 1 : -1
						} else {
							g.dy = dy > 0 ? 1 : -1
						}
					}
				}
			} else {
				let min=Number.MAX_VALUE
				let chasingTarget = null
				heroes.forEach(h => {
					const dx = h.x - g.x
					const dy = h.y - g.y
					const diff = Math.abs(dx) + Math.abs(dy)
					if(diff<goblinChasingDistance && diff<min){
						chasingTarget=h
						min=diff
					}
				})
				if(chasingTarget!=null){
					g.chasingTarget=chasingTarget
					if(chasingTarget.target.enemy==null){
						chasingTarget.target.x=g.x
						chasingTarget.target.y=g.y
						chasingTarget.target.enemy=g
					}
				}
				if (Math.random() <= 0.05) {
					const dir = getRandomInt(0, 4)
					try{
					if (dir === 0 && map[g.x - 1][g.y].items.length === 0) { g.dx=-1} 
					if (dir === 1 && map[g.x + 1][g.y].items.length === 0) { g.dx=1} 
					if (dir === 2 && map[g.x][g.y - 1].items.length === 0) { g.dy=-1} 
					if (dir === 3 && map[g.x][g.y + 1].items.length === 0) { g.dy=1} 
					}catch(exc){console.error(exc)}
				}
			}
		})

		if(goblins.length<goblinSpawnMax && goblinSpawnDelayElapsed<=0){
			const mapListCopy = [...mapList.filter(c=>c.items.length===0)]
			const randomCell = sliceRandomFromArray(mapListCopy)
			const gobj = createGoblin(randomCell.i, randomCell.j)
			goblins.push(gobj)
			goblinSpawnDelayElapsed=goblinSpawnDelay
		}
		goblinSpawnDelayElapsed--
	}

	function createEffect(attacker, attacked,color){
		const div = createAbsoulteDiv(attacked.x*20+Math.random()*20-10,attacked.y*20+Math.random()*20-10,15,15,color,boardDiv)
		const effect = {
			div,
			duration:350,
			durationTotal:350
		}
		effects.push(effect)
		return effect
	}

	function createHome(x,y){
		const gobj = createGobj('🏰', x,y)
		return gobj
	}

	function createGoblin(x,y){
		const monsterTypes = [
			{
				symbol:'🐺',
				hp:5,
				dmg:1,
				reward:2,
				level:0,
			},
			{
				symbol:'🐻',
				hp:10,
				dmg:2,
				reward:5,
				level:1,
			},
			{
				symbol:'🐲',
				hp:50,
				dmg:4,
				reward:20,
				level:2,
			}
		]

		let monsterType = Math.random()<0.70? monsterTypes[0] : Math.random()<0.85? monsterTypes[1] : monsterTypes[2]
		const levelSum = goblins.reduce((accumulator, currentValue) => accumulator + currentValue.level, 0);
		if(levelSum>8){ monsterType = monsterTypes[0] }

		const gobj = createGobj(monsterType.symbol, x,y)
		gobj.level=monsterType.level
		gobj.hp=monsterType.hp
		gobj.dmg=monsterType.dmg
		gobj.reward=monsterType.reward
		gobj.chasingTarget = null
		gobj.div.addEventListener('mouseover',e=>{ 
			descriptionDiv.style.display='block' 
			descriptionDiv.innerText=`HP:${gobj.hp}\nDMG:${gobj.dmg}\nREWARD:${gobj.reward}`
		})
		return gobj
	}

	function createHero(x,y){
		const gobj = createGobj('🏃‍♂️', x, y)
		gobj.name = '\n#'+(++heroIdCounter)
		gobj.hp=30
		gobj.maxHp=30
		gobj.dmg=1
		gobj.gold=0
		gobj.level=0
		gobj.target = {x,y,enemy:null}
		gobj.div.addEventListener('mouseover',e=>{ 
			descriptionDiv.style.display='block' 
			descriptionDiv.innerText=`HP:${gobj.hp}/${gobj.maxHp}\nGOLD:${gobj.gold}`
		})
		gobj.div.style.color='#ffff'
		gobj.div.innerText+=gobj.name
		return gobj
	}

	function generateTrees(count = 100){
		const mapListCopy = [...mapList]
		const trees = []
		for(let i=0;i<count;i++){
			const randomCell = sliceRandomFromArray(mapListCopy)
			const gobj = createGobj('🌲', randomCell.i, randomCell.j)
			randomCell.items.push(gobj)
		}
	}

	function createGobj(symbol='🕹', x, y){
		const div = createAbsoulteDiv(x*20,y*20,20,20, '#fff0', boardDiv)
		div.innerHTML = symbol
		const gobj = {
			x,y,dx:0,dy:0,
			div,
			update,
			remove
		}
		gobjList.push(gobj)
		return gobj
		//------
		function update(){
			div.style.left = gobj.x*20
			div.style.top = gobj.y*20
		}
		function remove(){
			div.parentElement.removeChild(div)
			for (let i = gobjList.length - 1; i >= 0; i--) {
				if (gobjList[i] == gobj) {
					goblins.splice(i, 1)
				}
			}
		}
	}

}

function removeWhere(array, predicate, action) {
	for (let i = array.length - 1; i >= 0; i--) {
		const item = array[i]
		if (predicate(item)) {
			action(item)
			array.splice(i, 1)
		}
	}
}

function getRandomFromArray(mapListCopy) {
	const randomIndex = Math.floor(Math.random() * mapListCopy.length)
	const randomCell = mapListCopy[randomIndex]
	return randomCell
}

function sliceRandomFromArray(mapListCopy) {
	const randomIndex = Math.floor(Math.random() * mapListCopy.length)
	const randomCell = mapListCopy[randomIndex]
	mapListCopy.splice(randomIndex, 1)
	return randomCell
}

function createDiv(w,h,color='#33333366', parent=document.body){
	const div = document.createElement('div')
	div.style.backgroundColor =  color
	div.style.width=w
	div.style.height=h
	parent.appendChild(div)
	return div
}

function createAbsoulteDiv(x=0,y=0,w=50,h=50,color='#33333366', parent=document.body){
	const div = document.createElement('div')
	div.style.width = w
	div.style.height = h
	div.style.position='absolute'
	div.style.left = x
	div.style.top = y
	div.style.backgroundColor =  color
	parent.appendChild(div)
	return div
}

function getRandomInt(min, max) {
  min = Math.ceil(min); // Ensure min is an integer
  max = Math.floor(max); // Ensure max is an integer
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getDistance(h,g){
	const dx = h.x - g.x
	const dy = h.y - g.y
	return Math.abs(dx) + Math.abs(dy)
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