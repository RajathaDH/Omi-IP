const fs = require('fs').promises;

const aboutUsElement = document.querySelector('#aboutUs');
const advertiseElement = document.querySelector('#advertise');
const popupContainer = document.querySelector('.popup-container');
const settingsPopup = document.querySelector('#settingsPopup');

const backgroundAudio = new Audio('assets/sounds/lobby-page.mp3');
backgroundAudio.volume = 0.2;

backgroundAudio.play();
backgroundAudio.loop = true;

let musicEnabled = true;
let soundEffectsEnabled = true;

function openAboutUs() {
    popupContainer.style.display = 'block';
    aboutUsElement.style.display = 'flex';
}

function openAdvertise() {
    popupContainer.style.display = 'block';
    advertiseElement.style.display = 'flex';
}

function closeAboutUs() {
    popupContainer.style.display = 'none';
    aboutUsElement.style.display = 'none';
}

function closeAdvertise() {
    popupContainer.style.display = 'none';
    advertiseElement.style.display = 'none';
}

async function login() {
    let token = '';

    try {
        token = await fs.readFile('token.txt', 'utf-8');
    } catch(err) {
        console.log(err);
    }

    if (token == '') {
        window.location = 'login.html';
    } else {
        window.location = 'lobby.html';
    }
}

function openSettings() {
    popupContainer.style.display = 'flex';
    settingsPopup.style.display = 'flex';
}

function closeSettings() {
    popupContainer.style.display = 'none';
    settingsPopup.style.display = 'none';
}

function toggleMusic() {
    if (musicEnabled) {
        musicEnabled = false;
        backgroundAudio.pause();
    } else {
        musicEnabled = true;
        backgroundAudio.currentTime = 0;
        backgroundAudio.play();
    }
}

function toggleSoundEffects() {
    
}