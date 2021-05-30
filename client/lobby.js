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
const downloadPopupDiv = document.querySelector('#download-div');
const popupContainer = document.querySelector('.popup-container');
const settingsPopup = document.querySelector('#settingsPopup');

const backgroundAudio = new Audio('assets/sounds/lobby-page.mp3');
backgroundAudio.volume = 0.2;

backgroundAudio.play();
backgroundAudio.loop = true;

let musicEnabled = true;
let soundEffectsEnabled = true;

const BASE_URL = 'https://omi-ip.herokuapp.com';

function popupLeaderboard() {
    popupDiv.style.display = 'flex';
    leaderboardDiv.style.display = 'flex';
    createLeaderboard();
}

function popupJoinParty() {
    popupDiv.style.display = 'flex';
    joinPartyDiv.style.display = 'flex';
}

function popoutDiv() {
    popupDiv.style.display = 'none';
    leaderboardDiv.style.display = 'none';
    joinPartyDiv.style.display = 'none';
    downloadPopupDiv.style.display = "none";
}


joinForm.addEventListener('submit', e => {
    e.preventDefault();

    const room = roomId.value;

    if (room == '') {
        roomErrorElement.innerText = 'Enter a Room ID';
    } else if (room.length != 5) {
        roomErrorElement.innerText = 'Invalid Room ID';
    } else {
        setRoom(room);

        window.location = 'omi.html';
    }
});

function getToken() {
    const cookieName = 'omi-token' + '=';
    const cookie = decodeURIComponent(document.cookie);
    const cookieArray = cookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
        let c = cookieArray[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(cookieName) == 0) {
            return c.substring(cookieName.length, c.length);
        }
    }

    return "";
}

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
    } catch (err) {
        console.log(err);
        return 0;
    }
}

async function fetchLeaderboard() {
    try {
        const result = await fetch(`${BASE_URL}/scores/leaderboard`);
        const data = await result.json();

        return data.leaderboard;
    } catch (err) {
        console.log(err);
        return [];
    }
}

async function fetchAdvertisement() {
    try {
        const result = await fetch(`${BASE_URL}/advertisements/random`);
        const data = await result.json();

        return data.advertisement;
    } catch (err) {
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

    advertisementElement.addEventListener('click', async () => {
        const result = await fetch(`${BASE_URL}/advertisements/visit/${advertisement._id}`);
        const data = await result.json();
        window.open(data.link);
    });
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
    const token = getToken();
    deleteRoom();

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
    d.setTime(d.getTime() + 60 * 60 * 1000);
    const expires = 'expires=' + d.toUTCString();
    document.cookie = 'omi-room' + '=' + room + ';' + expires + ';path=/';
}

function deleteRoom() {
    document.cookie = 'omi-room=;expires=Thu 01 Jan 1970 00:00:00UTC;path=/;';
}

function logout() {
    // clear token
    document.cookie = 'omi-token=;expires=Thu 01 Jan 1970 00:00:00UTC;path=/;';

    window.location = 'index.html';
}

function downloadGame() {

    downloadPopupDiv.style.display = "flex";
    popupDiv.style.display = "flex";

}

function downloadFor(os) {
    window.open(`${BASE_URL}/downloads/omi/${os}`);
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