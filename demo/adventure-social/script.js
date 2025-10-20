window.addEventListener('load', e => {
	const game = createGame()
})

function createGame(){
	const screen = {w:800, h:600, c:20}
	const screenDiv = createDiv(10, 10, screen.w,screen.h,'#eee')
	const gos = createGos()

	const settings = {
		gameTimeDealy:13,
		foodMax: 20,
		foodSpawnDelay:1000,
		foodSpawnDelayElapsed:0,
		monsterMax: 5,
		monsterSpawnDelay:10000,
		monsterSpawnDelayElapsed:0,
	}

	for(let i=0;i<5;i++){
		createAdventurer()
		createAdventurer()
	}

	//-------------------
	function updateGame(){
		gos.items.forEach(go=>{
			go.update()
		})

		const foodCount = gos.getGroup('food').length
		if(settings.foodMax>foodCount)
		{
			settings.foodSpawnDelayElapsed-=settings.gameTimeDealy
			if(settings.foodSpawnDelayElapsed<=0){
				settings.foodSpawnDelayElapsed = settings.foodSpawnDelay
				const chanceRandom = foodCount==0?1:1/foodCount
				if(chanceRandom>Math.random()){
					createFood()
				}else{
					const foodGo = getRandomElementFromArray(gos.getGroup('food'))
					createFood(foodGo.x+(Math.random()-0.5)*screen.c*5,foodGo.y+(Math.random()-0.5)*screen.c*5)
				}
			}
		}

		if(settings.monsterMax>gos.getGroup('monster').length)
			{
				settings.monsterSpawnDelayElapsed-=settings.gameTimeDealy
				if(settings.monsterSpawnDelayElapsed<=0){
					settings.monsterSpawnDelayElapsed = settings.monsterSpawnDelay
					createMonster()
				}
			}
	}

	setInterval(updateGame, settings.gameTimeDealy)

	//--------
	function createAdventurer(x=Math.random()*screen.w,y=Math.random()*screen.h){
		const go = createGo(x,y,screen.c,'#009','adventurer')
		const adventurer = {
		}
		go.updates.push(()=>{
		})
		return go
	}

	function createMonster(x=Math.random()*screen.w,y=Math.random()*screen.h){
		const pos = Math.floor(Math.random()*3)
		if(pos==0){x=0}if(pos==1){x=screen.w}if(pos==2){y=0}if(pos==3){y=screen.y}
		const go = createGo(x,y,screen.c,'#900','monster')
		const monster = {
		}
		go.updates.push(()=>{
		})
		return go
	}

	function createFood(x=Math.random()*screen.w,y=Math.random()*screen.h){
		const go = createGo(x,y,screen.c*0.4,'#0a0','food')
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
		const go = {
			x,y,size,type,
			div,
			updates:[updateDiv],
			update
		}
		function update(){
			go.updates.forEach(u=>u())
		}
		function updateDiv(){
			if(go.x<0){go.x=0}
			if(go.x>screen.w){go.x=screen.w}
			if(go.y<0){go.y=0}
			if(go.y>screen.h){go.y=screen.h}
			div.style.left = go.x - go.size/2
			div.style.top = go.y - go.size/2
		}
		gos.add(go)
		return go
	}
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