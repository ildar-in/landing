window.addEventListener('load', e => {
	const urlParams = new URLSearchParams(window.location.search)
	const speedUrlParam = new Number(urlParams.get("speed"))
	const hpUrlParam = new Number(urlParams.get("hp"))

	var elapsedTime = 0
	const timeDelta = 13
	const persec = timeDelta/1000
	const center = getCenterOfScreen()
	const screen = {w:800, h:600}
	
	const player = {
		x:center.x, y:center.y,
		tx:center.x, ty:center.y,
		speed: speedUrlParam ==0 ? 1200 : speedUrlParam,
		w:26, h:26,
		hpMax: hpUrlParam==0? 1 : hpUrlParam,
		cd:100,
		cdBase:100,
		cdElapsed:100,
		hp: 0,
		attackDistanceBase: 200,
		attackDistance: 200,
		damage: 1,
		damageBase: 1,
		attackDistanceUp: 100,
		damageUp: 100,
		attackSpeed: 100,
		EnemyAttackSpeed:100,
		EnemyBulletSpeed:100,
		EnemyBulletSize:100,
	}
	player.attackDistance = player.attackDistanceBase
	player.cd = player.cdBase
	player.damage = player.damageBase
	player.hp = player.hpMax

	const enemiesCount = [2,3,4,5,5,6,6,7,7,8]
	var stageDone = 1
	const stageDoneMax = enemiesCount.length

	const bgDiv = createDiv(center.x-screen.w/2, center.y-screen.h/2, screen.w, screen.h, '#999')

	const guiDiv = document.createElement('div')
	document.body.appendChild(guiDiv)

	const mouseDiv = createDiv(0,0,30,30)
	mouseDiv.style.backgroundColor = '#00F9'
	
	var enemies=[]
	var bullets=[]
	var effects = []

	var gameStop = 0
	createEnemies()

	const playerDiv = createDiv(center.x,center.y,player.w,player.h,'#050')

  initUpdateMouseMove(player, mouseDiv)
	var keyPressed = initUpdateKeyboard()

	var upgradesShown = 0
	showUpgrade(3, [0,1,2])
	//for(let i=0;i<9;i++){showUpgrade()}

	setInterval(()=>{
		guiDiv.innerText = 'HP: ' + player.hp + '/'+  + player.hpMax + '\n' + 'Stage:'+stageDone+'/'+stageDoneMax
			+'\nAttack distance: '+player.attackDistance
			+'\nDamage: ' + player.damage
			+'\nAttackSpeed: ' + player.attackSpeed + '%'
			+'\nEnemy attack speed: ' + player.EnemyAttackSpeed + '%'
			+'\nEnemy bullet speed: ' + player.EnemyBulletSpeed + '%'
			+'\nEnemy bullet size: ' + player.EnemyBulletSize + '%'

		if(player.hp<=0 || gameStop){ return }
		elapsedTime++

		playerDiv.style.left = player.x - player.w/2
		playerDiv.style.top = player.y - player.h/2
		playerDiv.innerText = player.hp
	
		player.cdElapsed -= timeDelta
		if(player.cdElapsed<=0){
			player.cdElapsed = player.cd
			if(enemies.length>0){
				const closest = enemies.minBy(e=> getLen(player.x,player.y,e.x,e.y))
				bullets.push(createBullet(player.x, player.y,  closest.x, closest.y, false, player.attackDistance , 800))
			}
		}

		enemies.forEach(e => {
			e.div.style.left = e.x-e.w/2
			e.div.style.top = e.y-e.h/2
			e.div.innerText = Math.ceil(e.hp)
			e.div.style.color = '#fff'
			e.cdElapsed-=persec

			if(e.cdElapsed<=0){
				e.cdElapsed = e.cd * (100+(100-player.EnemyAttackSpeed))/100
				if(e.type===1){
					bullets.push(createBullet(e.x,e.y,player.x + (Math.random()-0.5) * 100, player.y + (Math.random()-0.5) * 100, true, 
						400, 150*player.EnemyBulletSpeed/100, 40 *player.EnemyBulletSize/100 , 40 *player.EnemyBulletSize/100))//big
				} else if(e.type===2){
					let a = getAngleBetweenTwoPoints(e.x, e.y, player.x, player.y) - Math.PI/6
					for(let i=0;i<3;i++){
						let posx = e.x + Math.cos(a)*100
						let posy = e.y + Math.sin(a)*100
						bullets.push(createBullet(e.x,e.y, posx, posy, true, 
							500, 100*player.EnemyBulletSpeed/100, 20*player.EnemyBulletSize/100, 20*player.EnemyBulletSize/100))
						a+=Math.PI/6
					}
				} else if(e.type===3){
						bullets.push(createBullet(e.x,e.y,center.x + (Math.random()-0.5) * screen.w, center.y + (Math.random()-0.5) * screen.h, true, 
							400, 120*player.EnemyBulletSpeed/100, 25*player.EnemyBulletSize/100, 25*player.EnemyBulletSize/100))
				} else if(e.type===0){
					const count = 12
					let a = Math.random()*Math.PI*2*2/3
					for(let i=0;i<count;i++){
						bullets.push(createBullet(e.x,e.y,
							e.x + Math.cos(a)*100, e.y + Math.sin(a)*100, true, 
							800, 70*player.EnemyBulletSpeed/100, 25*player.EnemyBulletSize/100, 25*player.EnemyBulletSize/100))
						a+=Math.PI*2/count	
					}
				}
			}
			if(e.hp<=0){
				e.isDead = true
			}
		})
		enemies = enemies.filter(e=>{
			if(e.isDead){
				document.body.removeChild(e.div)
				return false
			}
			return true
		})

		bullets.forEach(b => {
			if(b.isEnemy){
				if(getLen(player.x,player.y,b.x,b.y)<=b.size){
					player.hp-=1
					b.isDead = true
					bullets.forEach(b => { if(b.isEnemy) {b.isDead = true } })
				}
				borderColorA = Math.ceil((b.distance/b.distanceMax)*16)
				b.div.style.border = '1px solid #fff'+borderColorA.toString(16);
			}
			if(!b.isEnemy){
				enemies.forEach(e => {
					if(getLen(b.x, b.y, e.x, e.y)<(b.size + e.size)){
						b.isDead = true
						e.hp-= player.damage
					}
				})
			}

			b.div.style.left = b.x-b.w/2
			b.div.style.top = b.y-b.h/2

			b.x+=b.dx
			b.y+=b.dy

			b.distance-=b.speed*persec
			if(b.distance<=0){
				b.isDead = true
			}
			if(b.x < center.x-screen.w/2|| b.x > center.x+screen.w/2 || b.y < center.y-screen.h/2 || b.y > center.y+screen.h/2){
				b.isDead = true
			}
		})

		bullets = bullets.filter(b=>{
			if(b.isDead){
				const effect={x:b.x, y:b.y, div:createDiv(b.x-b.w/2,b.y-b.h/2,b.w,b.h,'#fff5'), duration:20, durationElased:20}
				effect.div.style.borderRadius = b.w+'px'
				effects.push(effect)
				document.body.removeChild(b.div)
				return false
			}
			return true
		})

		if(keyPressed[0]){
			player.ty = player.y - 10
		}
		if(keyPressed[2]){
			player.ty = player.y + 10
		}
		if(keyPressed[1]){
			player.tx = player.x - 10
		}
		if(keyPressed[3]){
			player.tx = player.x + 10
		}

		const playerDiff = getDiffTowards(player.x, player.y, player.tx, player.ty, player.speed * persec)
		player.x += playerDiff.x
		player.y += playerDiff.y

		if(player.x < center.x-screen.w/2) { player.x = center.x-screen.w/2 }
		if(player.x > center.x+screen.w/2) { player.x = center.x+screen.w/2 }
		if(player.y < center.y-screen.h/2) { player.y = center.y-screen.h/2 }
		if(player.y > center.y+screen.h/2) { player.y = center.y+screen.h/2 }
		
		if(enemies.length===0){
			if(stageDone>=stageDoneMax){
				const winDiv = createDiv(center.x-screen.w/2, center.y-screen.h/2, screen.w, screen.h, '#0a0')
				winDiv.innerText = 'You WIN! Congratulations! \nElapsed time: '+ elapsedTime + '\n' 
					+ 'HP: ' + player.hp + '/'+  + player.hpMax + '\n' + 'Stage:'+stageDone+'/'+stageDoneMax
				gameStop = 1
			}
			else
			{
				bullets.forEach(b => { b.isDead = true })
				stageDone++
				createEnemies()
				showUpgrade()
			}
		}

		effects.forEach(e=>{
			const color = Math.round(e.durationElased/e.duration * 16)
			const transparency = Math.round(e.durationElased/e.duration * 5)
			e.div.style.backgroundColor = '#'+color.toString(16)+color.toString(16)+color.toString(16)+transparency.toString(16)
			e.durationElased--
		})
		effects = effects.filter(e=>{
			if(e.durationElased<=0){
				e.div.parentNode.removeChild(e.div)
			}
			return e.durationElased>0
		})

	}, 13)

	function showUpgrade(count = 4, upgradeTypes = [0, 1, 2, 3, 4, 5, 6, 7]) {
		gameStop = 1
		upgradesShown++
		
		const upgradeDivs = []
		for(let i=0;i<count;i++){
			upgradeDivs.push(
				createDiv(center.x - screen.w / 2 + screen.w / count * i, center.y - screen.h / 2, screen.w / count, screen.h, '#999'),
			)
		}
		const upgradesRandom = getRandomItemsFromArray(upgradeTypes, count)
		upgradeDivs.forEach((d, i) => {
			d.style.border = '3px solid black'
			const upgradeType = upgradesRandom[i]
			if (upgradeType === 0) {
				d.innerText = '+1 HP MAX'
				d.addEventListener('click', e => {
					player.hp += 1
					player.hpMax += 1
					clear()
				})
			} else if (upgradeType === 1) {
				d.innerText = '+40% attack distance'
				d.addEventListener('click', e => {
					player.attackDistanceUp += 40
					player.attackDistance = Math.ceil((player.attackDistanceUp/100) * player.attackDistanceBase)
					clear()
				})
			} else if (upgradeType === 2) {
				d.innerText = '+16% damage'
				d.addEventListener('click', e => {
					player.damageUp += 16
					player.damage = (player.damageUp/100) * player.damageBase
					clear()
				})
			} else if (upgradeType === 3) {
				d.innerText = '+15% attack speed'
				d.addEventListener('click', e => {
					player.attackSpeed += 15
					player.cd = player.cdBase / (player.attackSpeed/100)
					clear()
				})
			} else if (upgradeType === 4) {
				d.innerText = 'Full Heal'
				d.addEventListener('click', e => {
					player.hp = player.hpMax
					clear()
				})
			} else if (upgradeType === 5) {
				d.innerText = 'Slow enemies attack speed by 15% of current value'
				d.addEventListener('click', e => {
					player.EnemyAttackSpeed = Math.floor( player.EnemyAttackSpeed * (1-0.15) )
					clear()
				})
			}else if (upgradeType === 6) {
				d.innerText = 'Decrease enemies bullet size by 12% of current value'
				d.addEventListener('click', e => {
					player.EnemyBulletSize = Math.floor( player.EnemyBulletSize * (1-0.12) )
					clear()
				})
			}else if (upgradeType === 7) {
				d.innerText = 'Slow enemies bullet speed by 12% of current value'
				d.addEventListener('click', e => {
					player.EnemyBulletSpeed = Math.floor( player.EnemyBulletSpeed * (1-0.12) )
					clear()
				})
			}
			function clear(){
				upgradeDivs.forEach(dr => dr.parentNode.removeChild(dr))
				upgradesShown--
				console.log(upgradesShown)
				if(upgradesShown===0){
					gameStop = 0
				}
			}
		})
	}

	function createEnemies() {
		const enemyScreenRelated = 0.4
		const enemiesStartPositions = [ 
			[ center.x-screen.w * enemyScreenRelated, center.y-screen.h * enemyScreenRelated],
			[ center.x, center.y-screen.h * enemyScreenRelated],
			[ center.x+screen.w * enemyScreenRelated, center.y-screen.h * enemyScreenRelated],
			[ center.x-screen.w * enemyScreenRelated, center.y+screen.h * enemyScreenRelated],
			[ center.x, center.y+screen.h * enemyScreenRelated],
			[ center.x+screen.w * enemyScreenRelated, center.y+screen.h * enemyScreenRelated],
			[ center.x-screen.w * enemyScreenRelated, center.y],
			[ center.x+screen.w * enemyScreenRelated, center.y],
		]

		const count = enemiesCount[stageDone-1]
		const positions = getRandomItemsFromArray(enemiesStartPositions, count)
		positions.forEach(pos => {
			createEnemy(pos[0], pos[1], getRandomInt(1, 3))
		})

		if(stageDone === stageDoneMax){
			createEnemy(center.x, center.y, 0)
		}
	}

function createEnemy(x,y,type=1){
	const enemyTypes = [
		{
			color:'#900',
			size: 60,
			cd: 2.3,
			hp: 200,
		},
		{
			color:'#500',
			size: 30,
			cd: 1.2,
			hp:45,
		},
		{
			color:'#403',
			size: 20,
			cd: 1,
			hp:50,
		},
		{
			color:'#620',
			size: 26,
			cd: 0.35,
			hp:60,
		},
	]
	const enemyType = enemyTypes[type]

	const w=enemyType.size,h=enemyType.size
	const div = createDiv(x-w/2,y-h/2,w,h, enemyType.color)
	div.style.borderRadius = '5px'
	const size = getLen(0,0,w,h)/2
	const enemy = {
		x,y,w,h, 
		hp:enemyType.hp,
		isDead:false,
		div,
		cd: enemyType.cd, 
		cdElapsed:2,
		size,
		type
	}
	enemies.push(enemy)
	return enemy
}

function createBullet(x, y, tx, ty, isEnemy, distance = 500, speed = 400, w = 22, h = 22){
	const div = createDiv(x,y,w,h,isEnemy?'#900A':'#009A')
	div.style.borderRadius='50%'

	const diff = getDiffTowards(x,y,tx,ty, speed*persec)
	const size = getLen(0,0,w,h)/2
	return {
		x,y,w,h,
		div,
		speed,
		dx:diff.x, dy:diff.y,
		distance,
		distanceMax:distance,
		isEnemy,
		isDead: false,
		size
	}
}

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

	function initUpdateKeyboard() {
		var keyPressed = [0, 0, 0, 0]
		const codes = ['KeyW', 'KeyA', 'KeyS', 'KeyD']
		document.addEventListener('keyup', e => {
			codes.forEach((key, i) => {
				if (e.code === key) {
					keyPressed[i] = 0
				}
			})
		})
		document.addEventListener('keydown', e => {
			codes.forEach((key, i) => {
				if (e.code === key) {
					keyPressed[i] = 1
				}
			})
			// if(e.code==='KeyP'){
			// 	enemies.forEach(e=>e.isDead=true)
			// }
		})
		return keyPressed
	}

})

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

function getRandomItemsFromArray(arr, count) {
  // Create a shallow copy of the array to avoid modifying the original
  const shuffled = [...arr]; 
  let currentIndex = shuffled.length;
  let randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [shuffled[currentIndex], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[currentIndex],
    ];
  }

  // Return the first 'count' elements of the shuffled array
  return shuffled.slice(0, count);
}

function getRandomInt(min, max) {
  min = Math.ceil(min); // Ensure min is an integer
  max = Math.floor(max); // Ensure max is an integer
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getAngleBetweenTwoPoints(x1,y1, x2,y2) {
  const dy = y2 - y1
  const dx = x2 - x1
  const angleRadians = Math.atan2(dy, dx)
  return angleRadians;
}