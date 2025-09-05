function createAudio(){
    async function loadAsync(soundFiles=['path/sound.wav']){ return new Promise(resolve=>{
        let loadedCount = 0
        soundFiles.forEach(async path=>{
            const audio = new Audio(path)
            function onLoad(){
                audio.removeEventListener('loadeddata',onLoad,false)
                if(++loadedCount === soundFiles.length){
                    resolve()
                }
            }
            audio.addEventListener('loadeddata',onLoad,false)
        })
    })}
    function play(path='path/sound.wav', volume = 1, duration = null){
        const audio = new Audio(path)
        audio.volume = volume
        if(duration!==null){
           const interval =  setInterval(() => {
                if(audio.currentTime >= duration){
                    audio.ontimeupdate = null
                    audio.pause()
                    clearInterval(interval)
                }
            }, 1)
        }
        audio.play()
    }
    //---------------------------------------------------------------
    const audio = {
        play,
        loadAsync
    }
    return audio
}

function createMusicGenerator(
    audio = createAudio(), 
    notes=['a.wav','b.wav'],
    bits=['bit.wav'],
    hits=['bit.wav'],
){
    function randomizePattern(length, soundRatio = 0.1){
        const line = []
        for(let i=0;i<length;i++){
            const volume = Math.random()<soundRatio?0.5+Math.random()/2:0
            line.push(volume)
        }
        return line
    }
    function randomizePattern2(length, longRatio = 0.4){
        const line = []
        for(let i=0;i<length;i++){
            const volume = Math.random()>=longRatio? 1 :Math.ceil(Math.random() * (length-1))+1
            line.push(volume)
        }
        return line
    }
    function play(
        bitCount = 8,
        bpm = 120,
        notesRation = 0.25,
        durationRation = 0.25,
        bitRatio = 0.5
    ){
        const bps = bpm/60
        const tact = 1/bps
        const delay = 1000/bps
        const createParty = ()=>{
            const pattern = [], dpattern = []
            notes.forEach((n,i)=>{
                pattern.push(randomizePattern(bitCount, notesRation))
                dpattern.push(randomizePattern2(bitCount, durationRation))
            })
            const bitsPattern = randomizePattern(bitCount, bitRatio)
            //---
            return{
                pattern,
                dpattern,
                bitsPattern
            }
        }
        const party = createParty()
        let bit = 0
        setInterval(()=>{
            const pbit = bit % bitCount
            party.pattern.forEach((p,i)=>{
                const volume =  p[pbit]
                const tacts = party.dpattern[i][pbit]
                if(volume>0){
                    audio.play(notes[i], volume, tact * tacts)
                }
            })
            if(party.bitsPattern[bit]>0){
                audio.play(bits[0])
            }
            if(pbit===1){
                audio.play(hits[0])
            }
            bit++
        }, delay)
    }
    //---
    const music = {
        play,
    }
    return music
}