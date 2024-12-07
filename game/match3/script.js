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

    const enemies = [createEnemy(15,1),createEnemy(15,1),createEnemy(15,1)]
    const events = new EventTarget()

    const playerAbilities=[
        createAbility([{elementId:0,amount:3}], ()=>{
            const firstEnemyId = enemies.findIndex(e=>e.hp>0)
                if(firstEnemyId===-1){return}
                enemies[firstEnemyId].hp-=3
        }, 'fireball', 'deal 3 damage to the first enemy'),
        createAbility([{elementId:1,amount:3},{elementId:3,amount:2}], ()=>{
            player.hp+=5
        }, 'healing', 'heal yourself at 5'),
        createAbility([{elementId:2,amount:5},{elementId:4,amount:2}], ()=>{
            enemies.forEach(e=>{
                if(e.hp>0){
                    e.hp-=5
                }
            })
        }, 'frost nova', 'deal 5 damage to all enemies'),
    ]//[createAbilityDamage({mpCost:[]})]

    const player = {
        hp:20,hpMax:20, 
        /** @type {Array<ReturnType<typeof createMana>>} */
        mp: [],
        playerAbilities
    }
    elems.forEach(i => { player.mp.push(createMana(i,0,10)) })
    
    return {grid, gridClick, player, enemies, events}
    //-----------------------------------------------//-----------------------------------------------//-----------------------

    function turnEnd(turnInfo=createTurnInfo()){
        turnInfo.mp.forEach(mp=>{
            player.mp[mp.elementId].value+=mp.amount
        })

        player.playerAbilities.forEach(a=>{
            let isManaEnought=true
            a.manaNeed.forEach(mn=>{
                if(player.mp[mn.elementId].value<mn.amount){
                    isManaEnought=false
                }
            })
            if(!isManaEnought){return false}
            a.manaNeed.forEach(mn=>{
                player.mp[mn.elementId].value-=mn.amount
            })
            a.action()
        })

        enemies.forEach(e=>{
            if(e.hp<=0){ return }
            player.hp-=e.dmg
        })
        
        player.mp.forEach(mp=>{
            if(mp.value>mp.valueMax){
                mp.value=mp.valueMax
            }
            if(mp.value<0){
                mp.value=0
            }
        })

        if(player.hp>player.hpMax){player.hp=player.hpMax}

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

    //------------

    function createAbility(manaNeed=[{elementId:0,amount:3}],action=()=>{return true},name='',description=''){
        return {
            manaNeed,action,name,description
        }
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