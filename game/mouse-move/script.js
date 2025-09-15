window.addEventListener('load', e => {

	const urlParams = new URLSearchParams(window.location.search)
	const speedUrlParam = new Number(urlParams.get("speed"))
	const hpUrlParam = new Number(urlParams.get("hp"))

	const timeDelta = 13
	const persec = timeDelta/1000
	const center = getCenterOfScreen()
	const screen = {w:600, h:400}

	const player = {
		x:center.x, y:center.y,
		tx:center.x, ty:center.y,
		speed: speedUrlParam ==0 ? 1200 : speedUrlParam,
		w:26, h:26,
		hp: hpUrlParam==0? 1 : hpUrlParam,
		cd:100,
		cdElapsed:100
	}

	const bgDiv = createDiv(center.x-screen.w/2, center.y-screen.h/2, screen.w, screen.h, '#999')

	const guiDiv = document.createElement('div')
	document.body.appendChild(guiDiv)
	guiDiv.innerText = 'HP: ' + player.hp

	const mouseDiv = createDiv(0,0,30,30)
	//mouseDiv.style.stroke = '1px solid #009A'
	mouseDiv.style.backgroundColor = '#00F9'
	
	let enemies=[]
	let bullets=[]

	enemies.push(createEnemy(center.x-screen.w/2, center.y-screen.h/2))
	enemies.push(createEnemy(center.x+screen.w/2, center.y+screen.h/2))
	enemies.push(createEnemy(center.x-screen.w/2, center.y+screen.h/2))
	enemies.push(createEnemy(center.x+screen.w/2, center.y-screen.h/2))

	const playerDiv = createDiv(center.x,center.y,player.w,player.h,'#050')

  initUpdateMouseMove(player, mouseDiv)
	
	var keyPressed = initUpdateKeyboard()

	setInterval(()=>{
		if(player.hp<=0){ return } else { guiDiv.innerText = 'HP: ' + player.hp }

		playerDiv.style.left = player.x - player.w/2
		playerDiv.style.top = player.y- player.h/2
	
		player.cdElapsed -= timeDelta
		if(player.cdElapsed<=0){
			player.cdElapsed = player.cd
			if(enemies.length>0){
				const closest = enemies.minBy(e=> getLen(player.x,player.y,e.x,e.y))
				bullets.push(createBullet(player.x, player.y,  closest.x, closest.y, false, 200, 800))
			}
		}

		enemies.forEach(e => {
			e.div.style.left = e.x-e.w/2
			e.div.style.top = e.y-e.h/2
			e.div.innerText = e.hp
			e.div.style.color = '#fff'
			e.cdElapsed-=persec

			if(e.cdElapsed<=0){
				e.cdElapsed=e.cd
				// bullets.push(createBullet(e.x,e.y,player.x,player.y, true, 500))
				// bullets.push(createBullet(e.x,e.y,player.x,player.y, true, 500, 400, 66, 66))
				bullets.push(createBullet(e.x,e.y,player.x + (Math.random()-0.5) * 100 ,player.y + (Math.random()-0.5) * 100, true, 500, 200, 66, 66))
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
				}
			}

			if(!b.isEnemy){
				enemies.forEach(e => {
					if(getLen(b.x, b.y, e.x, e.y)<(b.size + e.size)){
						b.isDead = true
						e.hp-=1
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
		})

		bullets = bullets.filter(b=>{
			if(b.isDead){
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
			
	}, 13)

function createEnemy(x,y){
	const w=26,h=26
	const div = createDiv(x-w/2,y-h/2,w,h,'#500')
	const size = getLen(0,0,w,h)/2
	return {
		x,y,w,h, 
		hp:50,
		isDead:false,
		div,
		cd:1, cdElapsed:1,
		size
	}
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
			console.log(e.code)
			codes.forEach((key, i) => {
				console.log(key)
				if (e.code === key) {
					keyPressed[i] = 1
				}
			})
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