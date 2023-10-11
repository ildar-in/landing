function initRelax68() {
    const sounds = [
        createSound('🐥', 'birds-1.mp3'),
        createSound('🐥', 'birds-2.wav'),
        createSound('🌨', 'rain-1.mp3'),
        createSound('🌨', 'rain-2.mp3'),
        createSound('🔥', 'campfire-1.mp3'),
        createSound('🌊', 'ocean-1.mp3'),
        createSound('🌊', 'ocean-2.mp3'),
        createSound('🏞', 'river-1.mp3'),
        createSound('💧', 'water-1.mp3'),
        createSound('💧', 'water-2.mp3'),
        createSound('🎼', 'music-1-mantra.mp3'),
        createSound('🎼', 'music-2.mp3'),
        createSound('🎼', 'music-3.mp3'),

    ]
    return sounds
}

function createSound(name = '😊', path = 'soft-rain-ambient-111154.mp3') {
    const sound = {
        name,
        path: path
    }
    return sound
}

function createSoundElements(sounds = initRelax68()) {
    const elements = []
    const div = document.createElement('div')
    div.style.display = 'flex'
    div.style.justifyContent = 'space-evenly'
    div.classList.add('navbar-nav')
    for (const sound of sounds) {
        const { audio, button } = createAudioButton(sound)
        div.appendChild(button)
        elements.push({
            audio,
            button
        })
    }

    return div
}

function createAudioButton(sound) {
    const audio = createAudio(sound.path)
    const button = createSwitch(sound.name)
    button.addEventListener('change', e => {
        if (audio.paused) {
            audio.play()
        } else {
            audio.pause()
        }
    })
    return { audio, button }
}

function createSwitch(text='💛'){
    const div = document.createElement('div')
    div.classList.add('form-check')
    div.classList.add('form-switch')
    div.classList.add('form-check-inline')
    //---
    const input = document.createElement('input')
    input.classList.add('form-check-input')
    input.type='checkbox'
    input.id='checkbox'+Math.random()
    div.appendChild(input)
    //---
    const label = document.createElement('label')
    label.classList.add('form-check-label')
    label.type='checkbox'
    label.for=input.id
    div.appendChild(label)
    //---
    const span = document.createElement('span')
    span.classList.add('badge')
    span.classList.add('bg-secondary')
    span.innerText=text
    label.appendChild(span)
    //---
    return div
}


function createAudio(path, soundPath = 'mvp/rx68/sound/') {
    const audio = new Audio(soundPath + path)
    audio.loop = true
    return audio
}

window.addEventListener('DOMContentLoaded', e => {
    const soundsPanel = createSoundElements()
    document.getElementById('navigation-bar').appendChild(soundsPanel)
    document.addEventListener('click', e => {
}, { once: true })
})