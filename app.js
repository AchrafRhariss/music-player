//Local Static API haha
let musicList = [
    {
        id: 1,
        artist: "Coldplay",
        title: "Viva La Vida",
        coverUrl: "./images/Coldplay - Viva La Vida.jpg",
        srcUrl: "./music/Coldplay - Viva La Vida.mp3"
    },
    {
        id: 2,
        artist: "One Repulic",
        title: "I Lived",
        coverUrl: "./images/OneRepublic - I Lived.png",
        srcUrl: "./music/OneRepublic - I Lived.mp3"
    },
    {
        id: 3,
        artist: "One Direction",
        title: "Kiss You",
        coverUrl: "./images/OneDirection - Kiss You.png",
        srcUrl: "./music/OneDirection - Kiss You.mp3"
    }
]

// variables & elements
var currentMusicId = 0
var isMusicPaused = true
var isProgressBarClicked = false
var intervalId = undefined
var notifTimeoutId = undefined

let musicElem = document.getElementById('audio')
let publicityElem = document.getElementById('publicity')

let playPauseBtn = document.getElementById('play-pause-btn')
let previousBtn = document.getElementById('previous-btn')
let nextBtn = document.getElementById('next-btn')

let musicDurationLabel = document.getElementById('music-duration')
let musicCurrentTimeLabel = document.getElementById('music-current-time')

let musicCover = document.getElementById('music-cover')
let artist = document.querySelector('.artist')
let songTitle = document.querySelector('.song-title')

let progressBar = document.getElementById('progress-bar')
let progressBarElem = document.getElementById('progress-bar-fg-container')

let notification = document.querySelector('.glass-ui-notif-container')
let counter = document.querySelector('.time-to-start')

let resetBtn = document.getElementById('reset')
let spinnerElem = document.getElementById('spinner')


// Functions & Utilities :
function playPreviousSong() {
    if(publicityElem.paused) {
        if(currentMusicId == 0) {
            //show notification message : 'No more music.'
            notification.innerHTML = `<div class="text">There is no previous songs. <span id="reset" class="time-to-start">Go Ahead</span></div>`
            notification.style.left = '50%'
            if(!notifTimeoutId){
                notifTimeoutId = setTimeout(e=>notification.style.left = '-50%',5000)
            } else {
                clearTimeout(notifTimeoutId)
                notifTimeoutId = undefined
            }
                
        } else {
            currentMusicId--

            // setting the cover image and source for the next music
            musicElem.setAttribute('src',musicList[currentMusicId].srcUrl)
            musicCover.setAttribute('src',musicList[currentMusicId].coverUrl)
        
            // setting the artist name and title for the next music
            artist.innerText = musicList[currentMusicId].artist
            songTitle.innerText = musicList[currentMusicId].title
            
            // setting the slider & the music current time back to initial state
            progressBarElem.style.width = '0%'
            spinnerElem.style.left = '-5px'
            musicCurrentTimeLabel.innerText = '00:00'
            
            // Playing the music and sets the duration when the audio is loaded and ready (Promise)
            isMusicPaused ? musicElem.pause() : musicElem.play().then(data=> {
                musicDurationLabel.innerText = `${convertSecondsToTimeFormat(musicElem.duration)}`
            })
        }
    }
}

function playNextSong(id) {

    /* 
        Clear the interval for notification countdown timer if exists
        and initializes variables related to it.
    */
    if(publicityElem.paused) {
        // if(id) {
        //     clearInterval(id)
        //     notification.style.left = '-50%'
        //     counter.innerText = 5
        //     id = undefined
        // }
    
        if(currentMusicId == musicList.length-1) {
            //show notification message : 'No more music.'
            notification.innerHTML = `<div class="text">Playlist Ended. <span id="reset" class="time-to-start">Replay Again</span></div>`
            notification.style.left = '50%'
            notifTimeoutId = setTimeout(e=>notification.style.left = '-50%',5000)
        } else {
            currentMusicId++
    
            // setting the cover image and source for the next music
            musicElem.setAttribute('src',musicList[currentMusicId].srcUrl)
            musicCover.setAttribute('src',musicList[currentMusicId].coverUrl)
        
            // setting the artist name and title for the next music
            artist.innerText = musicList[currentMusicId].artist
            songTitle.innerText = musicList[currentMusicId].title
            
            // setting the slider & the music current time back to initial state
            progressBarElem.style.width = '0%'
            spinnerElem.style.left = '-5px'
            musicCurrentTimeLabel.innerText = '00:00'
            
            // Playing the music and sets the duration when the audio is loaded and ready (Promise)
            isMusicPaused ? musicElem.pause() : musicElem.play().then(data=> {
                musicDurationLabel.innerText = `${convertSecondsToTimeFormat(musicElem.duration)}`
            })
        }
    }

}

// [0-9] => 0[0-9] ex: 9 => '09'
function zeroLeftPad(num) {
    return (num<10) ? '0'+num : num;
}

// Convert number of seconds to time format => mm:ss
function convertSecondsToTimeFormat(seconds) {
    seconds = Math.round(seconds)
    let minutes = zeroLeftPad((seconds / 60) | 0)
    seconds = zeroLeftPad(seconds % 60)

    return `${minutes}:${seconds}`
}

function seekProgress_old(ev) {
    let progressSpinnerWidth = 10
    let newWidth = Math.round(ev.clientX-progressBar.getBoundingClientRect().x)
    console.log(ev.clientX,newWidth);
    if(newWidth >= progressBar.getBoundingClientRect().width) {
        newWidth = progressBar.getBoundingClientRect().width
    }

    if(newWidth <= progressSpinnerWidth) {
        newWidth = progressSpinnerWidth
    }
    progressBarElem.style.width = `${newWidth}px`
    spinnerElem.style.left = `${newWidth-5}px`

    musicElem.currentTime = Math.round(musicElem.duration*newWidth/progressBar.getBoundingClientRect().width) 
    musicCurrentTimeLabel.innerText = `${convertSecondsToTimeFormat(musicElem.currentTime)}`
}

function seekProgress(ev) {
    if(publicityElem.paused) {
        let cursorPosition = ev.clientX
        if(cursorPosition>=progressBar.getBoundingClientRect().right ) {
            cursorPosition = progressBar.getBoundingClientRect().width
        } else if(cursorPosition<=progressBar.getBoundingClientRect().left) {
            cursorPosition = 0
        } else {
            cursorPosition = cursorPosition - progressBar.getBoundingClientRect().left
        }

        progressBarElem.style.width = `${cursorPosition}px`
        spinnerElem.style.left = `${cursorPosition-5}px`
        
        let currentTime = musicElem.duration*progressBarElem.getBoundingClientRect().width/progressBar.getBoundingClientRect().width
        musicCurrentTimeLabel.innerText = `${convertSecondsToTimeFormat(currentTime)}`
        musicElem.volume = 1
    }
}

function throttle(callback, wait) {
    let time = Date.now()
    return function throttled(ev) {
        if((time + wait) < Date.now()){
            callback(ev)
            time = Date.now()
        }
    }
}

function resetAll(ev) {
    console.log('reset');
}


//Event Listeners


progressBarElem.addEventListener('mousedown', e=> {
    clearInterval(intervalId)
    intervalId == undefined
    isProgressBarClicked = true
    window.addEventListener('mousemove',seekProgress)
})

window.addEventListener('mouseup', e=> {
    if(isProgressBarClicked) {
        musicElem.currentTime = musicElem.duration*progressBarElem.getBoundingClientRect().width/progressBar.getBoundingClientRect().width
        window.removeEventListener('mousemove',seekProgress)
        isProgressBarClicked = false
        intervalId = setInterval(e=>{
            let currentTimeInSeconds = musicElem.currentTime
            musicCurrentTimeLabel.innerText = `${convertSecondsToTimeFormat(currentTimeInSeconds)}`
            progressBarElem.style.width = `${(currentTimeInSeconds * 100)/musicElem.duration}%`
            spinnerElem.style.left = `${progressBarElem.getBoundingClientRect().width-5}px`
        },501)
    }
})

window.addEventListener('load', e=>{
    musicElem.setAttribute('src',musicList[currentMusicId].srcUrl)
})

musicElem.addEventListener('loadedmetadata', evt => {

    console.log('meta looaded '+musicElem.duration);
    let durationInSeconds = musicElem.duration
    musicDurationLabel.innerText = `${convertSecondsToTimeFormat(durationInSeconds)}`
    progressBarElem.style.width = '0%'
    spinnerElem.style.left = '-5px'
})

// when music is played the interval that updates the current time is launched
musicElem.addEventListener('play', e=> {
    
    if(intervalId == undefined) {
        intervalId = setInterval(e=>{
            let currentTimeInSeconds = musicElem.currentTime
            musicCurrentTimeLabel.innerText = `${convertSecondsToTimeFormat(currentTimeInSeconds)}`
            progressBarElem.style.width = `${(currentTimeInSeconds * 100)/musicElem.duration}%`
            spinnerElem.style.left = `${progressBarElem.getBoundingClientRect().width-5}px`
        },501)
    }
})


musicElem.addEventListener('ended', e=> {
    
    if(currentMusicId>=musicList.length-1) {
        
        clearInterval(intervalId)
        intervalId = undefined
        Array.from(playPauseBtn.children).forEach(icon=>icon.classList.toggle('hide'))
        notification.innerHTML = `<div class="text">Playlist Ended. <span id="reset" class="time-to-start">Replay Again</span></div>`
        notification.style.left = '50%'
        
    } else {

        publicityElem.play()
        notification.innerHTML = `<div class="text">Playing Next Song In <span class="time-to-start">5</span> Seconds</div>`
        notification.style.left = '50%'
        counter = document.querySelector('.time-to-start')
        var id = setInterval(e=>{
            if(counter.innerText == 0) {
                clearInterval(id)
                notification.style.left = '-50%'
                playNextSong(id);
                return;
            }
            counter.innerText -= 1
        },1000);
    }

})

playPauseBtn.addEventListener('click',e=>{
    if(publicityElem.paused) {
        isMusicPaused = !isMusicPaused
        Array.from(playPauseBtn.children).forEach(icon=>icon.classList.toggle('hide'))
        musicElem.volume = 1
        musicElem.paused ? musicElem.play() : musicElem.pause()
    }
})

nextBtn.addEventListener('click', playNextSong)
previousBtn.addEventListener('click',playPreviousSong)

resetBtn.addEventListener('click', resetAll)