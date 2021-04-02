const fs = require('fs').promises;
const aboutUsElement = document.querySelector('#aboutUs');
const advertiseElement = document.querySelector('#advertise');
const popupContainer = document.querySelector('.popup-container');

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