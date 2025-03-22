function createBattle(parent = document.body,x,y,w,h){
    const cells = 20
    const size = w/cells
    const sizeSquare = size*size
    const wSquare = (w/2)*(w/2)

    const div = createDiv(parent,x,y,w,h)
    div.style.backgroundColor = '#0d553c'

    const towerDiv = createDiv(div,w/2-size,h/2-size,size*2,size*2)
    towerDiv.style.backgroundImage='url(content/image/tower.png)'
    towerDiv.style.backgroundSize='contain'
    towerDiv.style.imageRendering='pixelated'

    const battle = {
        div,enemies:[],bullets:[], difficulty:25, 
        //---
        update,
        createBullet
    }

    return battle
    //---
    function update(){
      const removeEnemies=[]
      battle.enemies.forEach(e=>{
        if(e.hp<=0){
          removeEnemies.push(e)
          return
        }
        e.div.style.transform='rotate('+(Math.random()-0.5)*10+'deg)'
        if(e.x*e.x+e.y*e.y>sizeSquare){
          e.x+=Math.cos(e.a)*e.speed
          e.y+=Math.sin(e.a)*e.speed
          e.div.style.left = w/2+e.x-size/2
          e.div.style.top = h/2+e.y-size/2
        }
      })      
      removeEnemies.forEach(r=> {
        arrayRemove(battle.enemies,r)
        r.div.remove()
      })
      //if(Math.random()<0.025 && battle.enemies.length<100){
      if(battle.enemies.length<battle.difficulty){
        createEnemy()
      }
      const removeBullets=[]
      battle.bullets.forEach(b=>{
        if(b.x*b.x+b.y*b.y<wSquare){
          b.x+=Math.cos(b.a)*b.speed
          b.y+=Math.sin(b.a)*b.speed
          b.div.style.left = b.x+w/2-size/2
          b.div.style.top = b.y+h/2-size/2
          battle.enemies.forEach(e=>{
            if(Math.abs(e.x-b.x)+Math.abs(e.y-b.y)<size){
              e.hp-=b.damage
              removeBullets.push(b)
            }
          })
        }else{
          removeBullets.push(b)
        }
      })
      removeBullets.forEach(r=> {
        arrayRemove(battle.bullets,r)
        r.div.remove()
      })
    }
    function createBullet(a,x=0,y=0,speed=1,damage=5){
      const bulletDiv = createDiv(div,x+w/2-size/2,y+h/2-size/2,size,size)
      bulletDiv.style.backgroundImage='url(content/image/arrow.png)'
      bulletDiv.style.backgroundSize='contain'
      bulletDiv.style.imageRendering='pixelated'
      bulletDiv.style.transform='rotate('+(a*57.2958+90)+'deg)'
      const bullet = {
        div:bulletDiv, a, x, y, speed, damage
      }
      battle.bullets.push(bullet)
      return bullet
    }
    function createEnemy(hp=10){
      const a = Math.random()*Math.PI*2
      const x = Math.cos(a)*w/2
      const y = Math.sin(a)*w/2
      const enemyDiv = createDiv(div,x+w/2-size/2,y+h/2-size/2,size,size)
      enemyDiv.style.backgroundImage='url(content/image/enemy.png)'
      enemyDiv.style.backgroundSize='contain'
      enemyDiv.style.imageRendering='pixelated'
      const enemy = {
        div:enemyDiv, x, y, a:a+Math.PI, speed:0.1, hp,
      }
      battle.enemies.push(enemy)
      return enemy
    }
}