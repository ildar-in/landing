window.addEventListener('load', e => {
	const game = createGame()
})

function createGame(){
	const gameUi = {
		isPaused:false,
		/** @type {ReturnType<typeof createGo>} */
		selectedGo:null
	}
	const screen = {w:800, h:600, c:10}
	const screenDiv = createDiv(10, 10, screen.w,screen.h,'#eee')
	const settings = {
		quadsCount:300,
		gameTimeDealy: new URLSearchParams(window.location.search).get('speed')??13,
		skip: new URLSearchParams(window.location.search).get('skip')??1,
		size: new URLSearchParams(window.location.search).get('size')??20,
		actorContactRange: screen.c * 6,
		// hungerSpeed:0.03,
		hungerSpeed:0,
		hungerDamageSpeed:1,
		foodSatiety:100,
		fullDayDuration:900,
		nightDuration:300,
		guardAwareDays:30,
	}
	const game={
		time:1,
		isDay:()=>{return game.time%settings.fullDayDuration>settings.nightDuration}
	}
	const gos = createGos()
	const quads = createQuads()
	for(let i=0;i<settings.size;i++){
		createActor(screen.w/2+screen.c*Math.random()*5, screen.h/2+screen.c*Math.random()*5)
	}
	const lordGo = createLord(screen.w/2,screen.h/2+screen.c)

	//-------------------
	function updateGame(){
		if(gameUi.isPaused){return}
		gos.items.forEach(go=>{
			go.update()
		})
		removeFromArrayByFilter(gos.items,(go)=>{
			if(go.isAlive==0){
				go.div.parentElement.removeChild(go.div)
				removeFromArray(gos.getGroup(go.type),go)
				return true
			}
			return false
		})
		game.time++
		if(game.isDay()){screenDiv.style.backgroundColor='#ccc'}else{screenDiv.style.backgroundColor='#aaa'}
	}
	setInterval(()=>{ for(let i=0;i<settings.skip;i++){updateGame()}}, settings.gameTimeDealy)

	let quadsOwned=[]
	const selectedActorDiv = createDiv(0,0,settings.actorContactRange,settings.actorContactRange, '#0003', screenDiv)
	selectedActorDiv.style.borderRadius='1000px'
	selectedActorDiv.style.border='1px #0005 solid'
	selectedActorDiv.style.overflow='visible'
	selectedActorDiv.style.visibility='hidden'
	selectedActorDiv.style.pointerEvents='none'
	screenDiv.addEventListener('click',e=>{if(e.target === screenDiv){
		gameUi.selectedGo=null
	}})
	function updateGameUi(){
		selectedActorDiv.style.visibility=gameUi.selectedGo!==null?'visible':'hidden'
		if(gameUi.selectedGo){
			selectedActorDiv.style.left = gameUi.selectedGo.x -settings.actorContactRange/2
			selectedActorDiv.style.top = gameUi.selectedGo.y -settings.actorContactRange/2
			if(gameUi.selectedGo.actor){
				const a=gameUi.selectedGo.actor
				selectedActorDiv.innerText=Math.round(a.hp)+'\n'+Math.round(a.satiety)+'\n'+a.resources
					+'\n'+a.guardAware+'\n'+Math.round(a.guardAwarePerDay*100)+'%'
					+'\n'+Math.round(a.guardAwareList.reduce((accumulator, currentValue) => accumulator + currentValue, 0)/a.guardAwareList.length*100)+'%'
			}
		}
	}
	setInterval(updateGameUi, 13)
	document.body.addEventListener('keypress',e=>{
		if(e.code=='KeyQ'){ gameUi.isPaused=!gameUi.isPaused }
	})

	//----------------------------------------------------------------------------------------
	function createLord(x=Math.random()*screen.w,y=Math.random()*screen.h){
		const go = createActor(x,y,screen.c)
		go.div.style.backgroundColor='#9909'
		const lordQuad = getDistanceQuad(go.x,go.y,q=>q.owner==null)
		lordQuad.owner=go
		const guards=[]
		const farmers=[]
		const lord = {
			quad: lordQuad,
			guards,
			farmers,
			quadsPerGuard:6,
			guardShifts:3,
		}
		go.lord=lord
		go.actor.moveTarget = {x:lordQuad.x,y:lordQuad.y}
		gos.getGroup('actor').forEach(g=>{
			if(g===go){return}
			assignNewActor(g)
		})
		go.updates.push(()=>{
			guards.forEach(guard=>{
				if(guard.rest>0){
					guard.rest--
				}else{
					guard.workTime++
					if(guard.go.actor.moveTarget===null){
						if(guard.workTime>settings.fullDayDuration-settings.nightDuration){
							guard.workTime=0
							guard.rest=settings.nightDuration
							guard.go.actor.moveTarget=lordQuad
						}else{
							guard.go.actor.moveTarget=guard.patrol[guard.currentPatrolId]
							guard.currentPatrolId++
							if(guard.currentPatrolId>=guard.patrol.length){guard.currentPatrolId=0}
						}
					}
				}
			})
			farmers.forEach(f=>{
				if(f.go.actor.moveTarget===null){
					if(game.isDay()){
						f.go.actor.moveTarget={x:f.quadFarm.x+(Math.random()-0.5)*quads.w,y:f.quadFarm.y+(Math.random()-0.5)*quads.h}
					}else{
						f.go.actor.moveTarget=f.quadHome
					}
				}
			})
		})
		return go
		//----
		function getDistanceQuadFree(x=go.x,y=go.y,isClosest=true){return getDistanceQuad(x,y,q=>q.owner==null,isClosest)}
		function getDistanceQuad(x,y,filter,isClosest=true){
			const quad = quads.filter(filter).reduce((min, q) => {
				if(isClosest){
					return (Math.abs(q.x-x)+Math.abs(q.y-y)) < (Math.abs(min.x-x)+Math.abs(min.y-y)) ? q : min;
				}else{
					return (Math.abs(q.x-x)+Math.abs(q.y-y)) > (Math.abs(min.x-x)+Math.abs(min.y-y)) ? q : min;
				}
			})
			return quad
		}
		function assignNewActor(g){
			if(guards.length===0){
				assignGuard(g)
			} else if(guards.length*lord.quadsPerGuard>quads.filter(q=>q.owner!==null).length){
				assignFarmer(g)
			} else {
				assignGuard(g)
			}
			guardPatrolUpdate()
		}
		function assignGuard(g){
			g.div.style.backgroundColor='#0099'
			// const quadHome=getClosestQuadFree()
			// quadHome.owner=g
			const guard = {
				go: g,
				// quadHome,
				patrol:[],
				currentPatrolId:0,
				workTime:0,
				isRest:0,
			}
			guards.push(guard)
			return guard
		}
		function assignFarmer(g){
			g.div.style.backgroundColor='#0909'
			const quadHome = getDistanceQuadFree()
			quadHome.owner=g
			const quadFarm = getDistanceQuadFree(quadHome.x,quadHome.y)
			quadFarm.owner=g
			const farmer = {
				go: g,
				quadHome,
				quadFarm,
			}
			farmers.push(farmer)
			return farmer
		}
		function guardPatrolUpdate(){
			const unassignedQuads=quads.filter(q=>q.owner!==null)
			removeFromArray(unassignedQuads,lordQuad)
			guards.forEach((g,i)=>{
				g.patrol=[lordQuad]
				g.currentPatrolId=0
				g.workTime=(i*(settings.fullDayDuration/lord.guardShifts))%(settings.fullDayDuration)
			})
			let currentGuardId=0
			while(unassignedQuads.length>0){
				const q = getDistanceQuad(lordQuad.x,lordQuad.y,q=>q.owner&&unassignedQuads.includes(q),guards[currentGuardId].patrol%2==0)
				removeFromArray(unassignedQuads,q)
				guards[currentGuardId].patrol.push(q)
				currentGuardId++
				if(currentGuardId>=guards.length){currentGuardId=0}
			}
		}
	}
	function createActor(x=Math.random()*screen.w,y=Math.random()*screen.h){
		const go = createGo(x,y,screen.c,'#090a','actor')
		const actor = {
			hp:100,
			satiety:100,
			speed:1+Math.random()*0.4,
			strength:1+Math.random()*0.4,
			resources:20,
			moveTarget:{x:go.x,y:go.y},
			guardAware:0,
			guardAwarePerDay:1,
			guardAwareList:[],
			banditChance:0,
			banditChanceDays:0,
		}
		go.actor = actor
		go.updates.push(()=>{
			actor.satiety-=settings.hungerSpeed
			if(actor.satiety<100 && actor.resources>0){
				actor.resources--
				actor.satiety+=settings.foodSatiety
			}
			if(actor.satiety<0){
				actor.satiety=0
				actor.hp-=settings.hungerDamageSpeed
			}
			if(actor.hp<=0){
				go.isAlive=0
			}
			if(actor.moveTarget!==null){
				if(getDistance(actor.moveTarget,go)>actor.speed){
					const a = getAngleRad(go,actor.moveTarget)
					go.x+=Math.cos(a)*actor.speed
					go.y+=Math.sin(a)*actor.speed
				}else{
					actor.moveTarget=null
				}
			}
			actor.guardAware+=lordGo.lord.guards.filter(guard=>getDistance(go,guard.go)<settings.actorContactRange).length
			if(game.time%settings.fullDayDuration==0){ 
				actor.guardAwarePerDay=actor.guardAware/settings.fullDayDuration
				actor.guardAwareList.push(actor.guardAwarePerDay)
				if(actor.guardAwareList.length>settings.guardAwareDays){actor.guardAwareList.shift()}
				actor.guardAware=0
				actor.banditChanceDays++
				if(actor.guardAwarePerDay<0.3){ actor.banditChance++ }
				go.div.innerText=Math.round(actor.banditChance/actor.banditChanceDays*100)+'%'
					// Math.round(actor.guardAwareList.reduce((accumulator, currentValue) => accumulator + currentValue, 0)/actor.guardAwareList.length*100)+'%'
			}
		})
		return go
	}

	function createGos(){
		/** @type {Array<ReturnType<typeof createGo>>} */
		const items = []
		const gos = {
			items,
			groups:[],
			add:(go)=>{
				const group = gos.getGroup(go.type)
				group.push(go)
				items.push(go)
			},
			getGroup,
		}
		/** @returns {Array<ReturnType<typeof createGo>>} */
		function getGroup(type=''){
			if(gos.groups[type]===undefined){gos.groups[type]=[]}
			return gos.groups[type]
		}
		return gos
	}

	function createGo(x=Math.random()*screen.w,y=Math.random()*screen.h,size=screen.c,color='#000',type='undefined'){
		const div = createDiv(x-size/2,y-size/2,size,size,color, screenDiv)
		div.style.borderRadius='1000px'
		const go = {
			x,y,size,type,
			div,
			isAlive:1,
			updates:[updateDiv],
			update
		}
		function update(){
			go.updates.forEach(u=>u())
		}
		function updateDiv(){
			if(go.x<0){go.x=50}
			if(go.x>screen.w){go.x=screen.w-50}
			if(go.y<0){go.y=50}
			if(go.y>screen.h){go.y=screen.h-50}
			div.style.left = go.x - go.size/2
			div.style.top = go.y - go.size/2
		}
		div.addEventListener('click',e=>{
			gameUi.selectedGo = go
			quadsOwned.forEach(d=>d.parentElement.removeChild(d))
			quadsOwned=[]
			quads.forEach(q=>{
				if(q.owner===go){
					quadsOwned.push(createDiv(q.x,q.y,10,10,'#f0fa'))
				}
			})
		})
		gos.add(go)
		return go
	}

	function createQuads() {
		const quads = []
		const aspectRatio = screen.w / screen.h
		const quadW = Math.round(Math.sqrt(settings.quadsCount * aspectRatio))
		const quadH = Math.round(Math.sqrt(settings.quadsCount / aspectRatio))
		const quadSizeW = screen.w / quadW
		const quadSizeH = screen.h / quadH
		quads.w=quadSizeW
		quads.h=quadSizeH
		for (let i = 0; i < quadW; i++) {
			for (let j = 0; j < quadH; j++) {
				const div = createDiv(i * quadSizeW, j * quadSizeH, quadSizeW, quadSizeH, '#fff0', screenDiv)
				div.style.border = '1px solid #0005'
				div.style.pointerEvents = 'none'
				x=i * quadSizeW-quadSizeW/2
				y=j * quadSizeH-quadSizeH/2
				const quad = {
					i,j,x,y,
					/** @returns {ReturnType<typeof createGo>} */
					owner: null,
					div,
				}
				quads.push(quad)
			}
		}
		return quads
	}
	// return game
}

function createDivSimple(w,h,color='#33333366'){
	const div = document.createElement('div')
	div.style.backgroundColor =  color
	div.style.width=w
	div.style.height=h
	document.body.appendChild(div)
	return div
}

function createDiv(x=0,y=0,w=50,h=50,color='#33333366',parent=document.body){
	const div = document.createElement('div')
	div.style.position='absolute'
	div.style.left = x
	div.style.top = y
	div.style.width = w
	div.style.height = h
	div.style.backgroundColor =  color
	parent.appendChild(div)
	return div
}

function getRandomInt(min, max) {
  min = Math.ceil(min); // Ensure min is an integer
  max = Math.floor(max); // Ensure max is an integer
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElementFromArray(myArray=[]){
	const randomIndex = Math.floor(Math.random() * myArray.length);
	const randomElement = myArray[randomIndex];
	return randomElement
}

function removeFromArrayByFilter(arr=[], filter=(e)=>{ return false }) {
  var i = 0;
  while (i < arr.length) {
    if (filter(arr[i])) {
      arr.splice(i, 1);
    } else {
      ++i;
    }
  }
  return arr;
}

function removeFromArray(arr=[], elem) {
  var i = 0;
  while (i < arr.length) {
    if (arr[i]===elem) {
      arr.splice(i, 1);
    } else {
      ++i;
    }
  }
  return arr;
}

function getDistance(a={x:0,y:0},b={x:0,y:0}){
	const dx = a.x-b.x
	const dy = a.y-b.y
	return Math.sqrt(dx*dx+dy*dy )
}

function getAngleRad(a={x:0,y:0},b={x:0,y:0}){
	const dx = b.x - a.x;
	const dy = b.y - a.y;
	const angleRadians = Math.atan2(dy, dx);
	return angleRadians
}