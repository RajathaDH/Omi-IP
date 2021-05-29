const fs = require('fs').promises;

const popupDiv = document.querySelector('.room-popups')
const leaderboardDiv = document.querySelector('#leaderboard-div')
const joinPartyDiv = document.querySelector('#join-party-div')
const joinForm = document.querySelector('#joinForm');
const roomId = document.querySelector('#room-id');
const scoreElement = document.querySelector('#score');
const createRoomPopup = document.querySelector('.creating-room');
const leaderboardElement = document.querySelector('#leaderboard');
const advertisementElement = document.querySelector('#advertisement');
const roomErrorElement = document.querySelector('#roomError');

const BASE_URL = 'http://localhost:3000';

function popupLeaderboard(){
    popupDiv.style.display = 'flex';
    leaderboardDiv.style.display = 'flex';
    createLeaderboard();
}

function popupJoinParty(){
    popupDiv.style.display = 'flex';
    joinPartyDiv.style.display = 'flex';
}

function popoutDiv(){
    popupDiv.style.display = 'none';
    leaderboardDiv.style.display = 'none';
    joinPartyDiv.style.display = 'none';
}

joinForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const room = roomId.value;

    if (room == '') {
        roomErrorElement.innerText = 'Enter a Room ID';
    } else if (room.length != 5) {
        roomErrorElement.innerText = 'Invalid Room ID';
    } else {
        try {
            await fs.writeFile('room.txt', room);
        } catch(err) {
            console.log(err);
        }

        window.location = 'omi.html';
    }
});

function decodeToken(token) {
    const tokenData = token.split('.')[1];

    const decodedTokenData = atob(tokenData);

    return JSON.parse(decodedTokenData);
}

async function fetchScore(dbId) {
    try {
        const result = await fetch(`${BASE_URL}/scores/user/${dbId}`);
        const data = await result.json();
        
        return data.score;
    } catch(err) {
        console.log(err);
        return 0;
    }
}

async function fetchLeaderboard() {
    try {
        const result = await fetch(`${BASE_URL}/scores/leaderboard`);
        const data = await result.json();

        return data.leaderboard;
    } catch(err) {
        console.log(err);
        return [];
    }
}

async function fetchAdvertisement() {
    try {
        const result = await fetch(`${BASE_URL}/advertisements/random`);
        const data = await result.json();

        return data.advertisement;
    } catch(err) {
        console.log(err);
        return null;
    }
}

function createAdvertisement(advertisement) {
    if (!advertisement) return;

    const advertisementImg = document.createElement('img');
    advertisementImg.src = `${BASE_URL}/uploads/advertisement-photos/${advertisement.imageName}`;
    advertisementElement.appendChild(advertisementImg);

    const advertisementDiv = document.createElement('div');
    advertisementDiv.classList.add('advertisement-details');
    const advertisementHeading = document.createElement('h1');
    advertisementHeading.innerText = advertisement.title;
    advertisementDiv.appendChild(advertisementHeading);
    const advertisementDetails = document.createElement('p');
    advertisementDetails.innerText = advertisement.details;
    advertisementDiv.appendChild(advertisementDetails);
    advertisementElement.appendChild(advertisementDiv);
}

function createRoom() {
    createRoomPopup.style.display = 'flex';
    setTimeout(() => {
        window.location = 'omi.html';
    }, 3000);
}

async function createLeaderboard() {
    const leaderboard = await fetchLeaderboard();
    leaderboardElement.innerHTML = '';

    leaderboard.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.classList.add('leaderboard-score');

        const playerNameDiv = document.createElement('div');
        playerNameDiv.classList.add('player-name');
        playerNameDiv.classList.add('div-space');
        playerNameDiv.innerText = `${player.rank}. ${player.username}`;

        const playerRankingDiv = document.createElement('div');
        playerRankingDiv.classList.add('player-ranking');
        playerRankingDiv.classList.add('div-space');
        playerRankingDiv.innerText = `${player.score}`;

        playerDiv.appendChild(playerNameDiv);
        playerDiv.appendChild(playerRankingDiv);

        leaderboardElement.appendChild(playerDiv);
    });
}

async function main() {
    let token = '';

    try {
        token = await fs.readFile('token.txt', 'utf-8');
    } catch(err) {
        console.log(err);
    }

    try {
        await fs.writeFile('room.txt', '');
    } catch(err) {
        console.log(err);
    }

    if (token == '') {
        window.location = 'login.html';
    }

    const decodedToken = decodeToken(token);

    const score = await fetchScore(decodedToken.dbId);
    scoreElement.innerText = score;

    const advertisement = await fetchAdvertisement();
    createAdvertisement(advertisement);
}

main();

function setRoom(room) {
    const d = new Date();
    d.setTime(d.getTime() + 60*60*1000);
    const expires = 'expires='+ d.toUTCString();
    document.cookie = 'omi-room' + '=' + room + ';' + expires + ';path=/';
}

async function logout() {
    // clear token
    try {
        await fs.writeFile('token.txt', '');
    } catch(err) {
        console.log(err);
    }

    window.location = 'index.html';
}