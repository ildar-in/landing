function initGame(){
    const w=8, h=8,
    elems=[0,1,2,3,4]

    const grid = []
    for(let i=0;i<w;i++) {
        const line = []
        grid.push(line)
        for(let j=0;j<h;j++) {
            line.push(getGridRandomElementId())
        }
    }

    const playerAbilities=[]//[createAbilityDamage({mpCost:[]})]

    const player = {
        hp:100,hpMax:100, 
        /** @type {Array<ReturnType<typeof createMana>>} */
        mp: [],
        playerAbilities
    }
    elems.forEach(i => { player.mp.push(createMana(i,0,10)) })
    const enemies = [createEnemy(15,1),createEnemy(15,1),createEnemy(15,1)]

    const events = new EventTarget()
    
    return {grid, gridClick, player, enemies, events}
    //-----------------------------------------------//-----------------------------------------------//-----------------------

    function turnEnd(turnInfo=createTurnInfo()){
        console.log('turn end')
        turnInfo.mp.forEach(mp=>{
            player.mp[mp.elementId].value+=mp.amount
        })

        for(let i=0;i<elems.length;i++){
            if(player.mp[i].value>=3){
                const firstEnemyId = enemies.findIndex(e=>e.hp>0)
                if(firstEnemyId!==-1){
                    player.mp[i].value-=3
                    enemies[firstEnemyId].hp-=3
                }
            }
        }

        enemies.forEach(e=>{
            if(e.hp<=0){ return }
            player.hp-=e.dmg
        })
        
        player.mp.forEach(mp=>{
            if(mp.value>mp.valueMax){
                mp.value=mp.valueMax
            }
        })

        events.dispatchEvent(new CustomEvent('turnEnd', {detail:turnInfo}))
    }

    function gridClick(i,j){
        
        const elementId = grid[i][j]
        const done = getMatched(i,j,grid[i][j])

        const lines = []
        for(var i=0;i<w;i++){
            lines.push({i,items:[]})
        }
        done.forEach(d=>{
            lines[d.i].items.push(d)
        })

        lines.forEach(l=>{
            l.items.forEach(d=>{
                for(var i=d.i;i>0;i--){
                    grid[i][d.j]=grid[i-1][d.j]
                }
                grid[0][d.j]=getGridRandomElementId()
                
            })
        })

        turnEnd(createTurnInfo({mp:[{elementId: elementId, amount:done.length}]}))

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

    function getGridRandomElementId(){
        return Math.ceil(Math.random()*elems.length)-1
    }

    function createTurnInfo(d={mp:[{elementId: 0, amount:0}]}){
        return d
    }

    //------------

    function createEnemy(hp,dmg){
        return {hp,hpMax:hp,dmg}
    }

    function createMana(elementId=0,value=0,valueMax=10){
        return {elementId,value,valueMax}
    }
}
//-----------------
function randomInt(min,max){
    return min + Math.ceil(Math.random()*(max-min+1))-1
}
function removeFromArray(array, val){
    const index = array.indexOf(val);
    if (index > -1) { // only splice array when item is found
    array.splice(index, 1); // 2nd parameter means remove one item only
    }
}