function createLogic(title='Jam'){
    const logic = {
        initializeAsync
    }
    return logic
    //---
    async function initializeAsync(){
        const translates = {
            loading:'Loading...',
            pressAnyKey:'Press any key...',
        }
        const noteFiles = [
            '1.wav','2.wav','3.wav','4.wav',
            '1.mp3','2.mp3','3.mp3','4.mp3',
            '5.mp3','6.mp3','7.mp3','8.mp3',
            //'9.mp3','10.mp3','11.mp3','12.mp3',
            '13.mp3','14.mp3','15.mp3','16.mp3',
        ].map(p=> 'assets/audio/' + p )
        const soundFiles = ['alert.wav','click.wav','notification.wav'].map(p=> 'assets/audio/' + p )
        const audioFiles= noteFiles.concat(soundFiles)
        const audio = createAudio()
        const audioDataAsync = audio.loadAsync(audioFiles)
        const inputAsync = waitForInputAsync()
        const video = createVideo()
        const loadingScreen = video.createScreen(title, 400, 225)
            .addTextLine(title).done()
            .addTextLine(translates.pressAnyKey).done()
            .addTextLine(translates.loading).finallyHide(inputAsync).done()
        console.log(loadingScreen.draw())
        //.clear()
        const iii = setInterval(()=>{
            // loadingScreen.draw()
        }, 10)
        await Promise.all([audioDataAsync, inputAsync])
        clearInterval(iii)
        loadingScreen.draw()
        loadingScreen.dispose()

        audio.play(soundFiles[2])
        document.body.addEventListener('click',e=>{
            audio.play(soundFiles[1], 1, 0.1)
        })
    }
    async function waitForInputAsync(eTypes=['touchstart','keydown','click']){
        return new Promise(resolve=>{
            function ready(e){
                eTypes.forEach(t=>{
                    document.body.removeEventListener(t, ready, false)
                })
                resolve()
            }
            eTypes.forEach(t=>{
                document.body.addEventListener(t, ready, false)
            })
        })
    }
}