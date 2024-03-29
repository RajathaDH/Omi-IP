const popupDiv = document.querySelector('.popups');
const playerConnectDiv = document.querySelector('#playerConnectInner');
const trumpCallDiv = document.querySelector('#select-trumps-div');
const waitingForTrumps = document.querySelector(".waiting-for-trumps");
const gameDetails = document.querySelector('.game-details');
const fourRandomCards = document.querySelector('.four-trump-cards');
const currentTrump = document.querySelector('#trump-of-game');
const player1Cards = document.querySelector("#player-1-cards");
const player1Name = document.querySelector("#player-1-name");
const player2Name = document.querySelector("#player-2-name");
const player3Name = document.querySelector("#player-3-name");
const player4Name = document.querySelector("#player-4-name");
const opponent1Hand = document.querySelector("#opponent-1-hand");
const opponent2Hand = document.querySelector("#opponent-2-hand");
const teammateHand = document.querySelector("#teammate-hand");
const inviteYourFriends = document.querySelector("#invite-your-friends");
const matchWinnerElement = document.querySelector('#match-winner');
const newMatchStarting = document.querySelector("#new-game-starting");
const gameEndElement = document.querySelector("#game-end");
const connectionErrorElement = document.querySelector("#connection-error");
const roomErrorElement = document.querySelector("#room-error");
const playerDisconnectedElement = document.querySelector("#player-disconnected");
const otherTeamDots = document.querySelector('#other-team-dots');
const yourTeamDots = document.querySelector('#your-team-dots');
const yourTeamScoreElement = document.querySelector('#your-team-score');
const otherTeamScoreElement = document.querySelector('#other-team-score');
const player1Image = document.querySelector('#player-1-image');
const player2Image = document.querySelector('#player-2-image');
const player3Image = document.querySelector('#player-3-image');
const player4Image = document.querySelector('#player-4-image');
const settingsPopup = document.querySelector('#settingsPopup');

/********SOUNDS******/
const backgroundAudio = new Audio('assets/sounds/game-page-bg.mp3');
const clickAudio = new Audio('assets/sounds/click.mp3');
const myPointAddAudio = new Audio('assets/sounds/points-add.mp3');
const enemyPointAddAudio = new Audio('assets/sounds/enemy-point-sound.mp3');
const errorCardAudio = new Audio('assets/sounds/error-card.mp3');

backgroundAudio.volume = 0.2;
clickAudio.volume = 0.2;
myPointAddAudio.volume = 0.2;
enemyPointAddAudio.volume = 0.2;
errorCardAudio.volume = 0.2;

backgroundAudio.play();
backgroundAudio.loop = true;

/*********************************************/
let matchNumber = 1;
let playerNumber = -1;
let playerHand = [];
let matchPlayers = [];
let firstCard = null;
let currentPlayer = 1;
let tableCards = [];
let isGameEnded = false;
let matchCount = 0;
let yourTeamScore = 0;
let otherTeamScore = 0;

let musicEnabled = true;
let soundEffectsEnabled = true;

const fs = require('fs').promises;

let callTrump = () => {
    console.log('Calling Trump');
}

async function initializeGame() {
    let token = '';
    let room = '';

    try {
        token = await fs.readFile('token.txt', 'utf-8');
    } catch(err) {
        console.log(err);
        window.location = 'login.html';
    }

    try {
        room = await fs.readFile('room.txt', 'utf-8');
    } catch(err) {
        console.log(err);
    }

    const socket = io("http://localhost:3000", {
        query: {
            token: token,
            room: room,
            scoreLimit: 10
        }
    });

    socket.on('connection-error', data => {
        console.log(data);
        window.location = 'login.html';
        connectionError(data);
    });

    // sends any errors that can occur while joining room (room full, already in the room)
    socket.on('room-error', data => {
        console.log(data);
        roomError(data);
        setTimeout(() => {
            window.location = 'lobby.html';
        }, 2000);
    });

    socket.on('new-room', data => {
        console.log(data);
        inviteYourFriends.style.display = "flex";
        inviteYourFriends.innerHTML = `Room ID : <span>${data.roomId}</span>`
    });

    // sends all the players currently in the room when a new player joins
    socket.on('player-connect', data => {
        playerConnect(data);

        if (data.players.length == 4) {
            matchPlayers = data.players;
        }
    });

    socket.on('player-disconnect', () => {
        //window.location.replace('http://localhost:5000');
        playerDisconnected();
        console.log('Player disconnected');
    });

    // sends current players number when player joins
    socket.on('player-number', data => {
        playerNumber = data;
        console.log(data);
    });

    socket.on('game-started', () => {
        startGame();
        glowCurrentPlayer();
    });

    // sends the players cards when at the start of each match
    socket.on('player-hand', hand => {
        playerHand = hand;

        createHands();
    });

    // sends the player number and card when someone plays a card
    socket.on('played-card', data => {
        currentPlayer = data.player + 1;
        if (currentPlayer > 4) {
            currentPlayer = 1;
        }
        if (firstCard == null) {
            firstCard = data.card;
        }
        console.log(data);
        if (data.player == playerNumber) {
            //playCard(data);
        }
        otherCardMove(getRelativePlayerNumber(playerNumber, data.player), data.card.imageName.replace('.png', ''));
        glowCurrentPlayer();
    });

    // your turn to call trumps
    socket.on('call-trump', () => {
        popupDiv.style.display = 'flex';
        waitingForTrumps.style.display = 'none';

        setTimeout(() => {
            trumpCallDiv.style.display = 'flex';
            waitingForTrumps.style.display = 'none';
            showRandomCards();
        }, 4000);
    });

    // sends the player number and trumps when someone calls trumps
    socket.on('trump-card', data => {
        console.log(data);
        currentPlayer = data.player;
        waitingForTrumps.style.display = 'none';
        popupDiv.style.display = 'none';
        trumpCard(data);
        createHand(playerHand);
        glowCurrentPlayer();
    });

    // sends the player who won the current round and current points (when 4 cards are on the table)
    socket.on('round-winner', data => {
        currentPlayer = data.roundWinner;
        console.log(data);
        roundWinner(data);
        glowCurrentPlayer();

    });

    // sends the winner of the current match at the end
    socket.on('match-winner', data => {
        console.log(data);
        matchCount++;
        if (matchCount > 9) {
            isGameEnded = true;
        }
        startNewMatch(data);

    });

    // sends the current scores of the players at the end of the match
    socket.on('match-scores', data => {
        console.log(data);
    });

    socket.on('game-finished', data => {
        console.log(data);
        isGameEnded = true;

        //game finished eka call wenne startNewMatch() eka call unata passe;
        gameFinish(data);
    });

    function createHand(hand) {
        player1Cards.innerHTML = '';

        hand.forEach(card => {
            const img = document.createElement('img');
            img.src = `assets/imgs/cards/${card.imageName}`;

            img.addEventListener('click', () => {

                if (playerNumber == currentPlayer) {
                    if (validateCard(card)) {
                        socket.emit('play-card', card);
                        tableCards.push(img);
                        playerCardMove(img, card);
                        clickSound();
                    } else {
                        invalidCard(img);
                        errorCardAudio.currentTime = 0;
                        errorCardAudio.play();
                    }
                }
                else {
                    invalidCard(img);
                    errorCardAudio.currentTime = 0;
                    errorCardAudio.play();
                }
            });
            player1Cards.appendChild(img);
        });
    }

    callTrump = (trump) => {
        socket.emit('call-trump', trump);
        trumpCallDiv.style.display = 'none';
        fourRandomCards.style.display = 'none';
        popupDiv.style.display = 'none';
    }
}

initializeGame();

function connectionError(data) {
    popupDiv.style.display = 'flex';
    connectionErrorElement.style.display = 'flex';
    waitingForTrumps.style.display = 'none';
    connectionErrorElement.innerText = data.error;
}

function roomError(data) {
    popupDiv.style.display = 'flex';
    roomErrorElement.style.display = 'flex';
    waitingForTrumps.style.display = 'none';
    roomErrorElement.innerText = data.message;
}

function playerDisconnected() {
    popupDiv.style.display = 'flex';
    playerDisconnectedElement.style.display = 'flex';
    waitingForTrumps.style.display = 'none';

    playerDisconnectedElement.innerHTML = `Player Disconnected <br> Returning to Lobby in 3`;

    setTimeout(() => {
        playerDisconnectedElement.innerHTML = `Player Disconnected <br> Returning to Lobby in 2`;
    }, 1000);
    setTimeout(() => {
        playerDisconnectedElement.innerHTML = `Player Disconnected <br> Returning to Lobby in 1`;
    }, 2000);

    setTimeout(() => {
        window.location = 'lobby.html';
    }, 3000);
}

function validateCard(card) {
    if (firstCard == null) return true;

    const playedCardSymbol = card.name[0];

    if (firstCard.name[0] == playedCardSymbol) return true;

    for (let i = 0; i < playerHand.length; i++) {
        if (firstCard.name[0] == playerHand[i].name[0]) {
            return false;
        }
    }

    return true;
}

function trumpCard(data) {
    const trump = data.trump;

    if (trump == 'S') {
        currentTrump.src = 'assets/imgs/spades.png';
    } else if (trump == 'H') {
        currentTrump.src = 'assets/imgs/hearts.png';
    } else if (trump == 'C') {
        currentTrump.src = 'assets/imgs/clubs.png';
    } else if (trump == 'D') {
        currentTrump.src = 'assets/imgs/diamonds.png';
    }
}

function roundWinner(data) {

    firstCard = null;
    let bodyRect = document.body.getBoundingClientRect();

    let relativeRoundWinner = getRelativePlayerNumber(playerNumber, data.roundWinner);
    addPointsToPlayer(data.roundWinner, relativeRoundWinner);


    setTimeout(() => {

        if (relativeRoundWinner == 1) {
            for (let i = 0; i < 4; i++) {
                tableCards[i].style.transform = `translateX(${bodyRect.width / 2}px) translateY(${bodyRect.height}px)`;
            }
        } else if (relativeRoundWinner == 2) {
            for (let i = 0; i < 4; i++) {

                tableCards[i].style.transform = `translateY(${bodyRect.height / 2}px) translateX(${bodyRect.width}px)`;
            }

        } else if (relativeRoundWinner == 3) {
            for (let i = 0; i < 4; i++) {
                tableCards[i].style.transform = `translateX(${bodyRect.width / 2}px) translateY(-${bodyRect.height}px)`;
            }

        } else if (relativeRoundWinner == 4) {
            for (let i = 0; i < 4; i++) {
                tableCards[i].style.transform = `translateY(${bodyRect.height / 2}px) translateX(-${bodyRect.width}px)`;
            }
        }
    }, 2000);

    setTimeout(() => {
        tableCards = [];
        console.log(tableCards);
    }, 3000);

    console.log(tableCards);
}

function glowCurrentPlayer() {
    player1Image.classList.remove('player-1-drop-shadow');
    player2Image.classList.remove('player-2-drop-shadow');
    player3Image.classList.remove('player-3-drop-shadow');
    player4Image.classList.remove('player-4-drop-shadow');

    player1Name.classList.remove('player-1-name-drop-shadow');
    player2Name.classList.remove('player-3-name-drop-shadow');
    player3Name.classList.remove('player-1-name-drop-shadow');
    player4Name.classList.remove('player-3-name-drop-shadow');

    if (currentPlayer == 1) {
        player1Image.classList.add('player-1-drop-shadow');
        player1Name.classList.add('player-1-name-drop-shadow');
    } else if (currentPlayer == 2) {
        player2Image.classList.add('player-2-drop-shadow');
        player2Name.classList.add('player-3-name-drop-shadow');
    } else if (currentPlayer == 3) {
        player3Image.classList.add('player-3-drop-shadow');
        player3Name.classList.add('player-1-name-drop-shadow');
    } else if (currentPlayer == 4) {
        player4Image.classList.add('player-4-drop-shadow');
        player4Name.classList.add('player-3-name-drop-shadow');
    }
}

function addPointsToPlayer(roundWinner, relativeRoundWinner) {
    const dot = document.createElement('div');

    if (relativeRoundWinner == 1 || relativeRoundWinner == 3) {
        dot.classList.add(`green-dot`);
        myPointAddAudio.currentTime = 0;
        myPointAddAudio.play();

    }
    else if (relativeRoundWinner == 2 || relativeRoundWinner == 4) {
        dot.classList.add(`purple-dot`);
        enemyPointAddAudio.currentTime = 0;
        enemyPointAddAudio.play()
    }
    dot.classList.add('dot');
    dot.classList.add('test-dot');

    document.querySelector(`#player-${roundWinner}-points`).appendChild(dot);


}

function addScore(color) {
    const dot = document.createElement('div');
    dot.classList.add(`${color}-dot`);
    dot.classList.add('dot');
    dot.classList.add('test-dot');


    if (color == "purple") {
        otherTeamScore++;
        otherTeamScoreElement.innerText = otherTeamScore.toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false
        });

        otherTeamDots.appendChild(dot);
    } else if (color == "green") {
        yourTeamScore++;
        yourTeamScoreElement.innerText = yourTeamScore.toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false
        });
        yourTeamDots.appendChild(dot);
    }

}

function playerConnect(data) {
    playerConnectDiv.innerHTML = '';
    console.log(data);
    const players = data.players;

    players.forEach(player => {

        const playerDiv = document.createElement('div');
        playerDiv.innerHTML = `
        <div>
            <span>${player.playerNumber}.</span>${player.playerName}<br>
        </div>
        `;

        playerConnectDiv.appendChild(playerDiv);
    });
}

function startGame() {
    waitingForTrumps.style.display = 'none';
    playerConnectDiv.style.display = 'none';
    inviteYourFriends.style.display = 'none';


    document.querySelector("#wating-for-players").style.display = 'none';
    gameDetails.style.display = 'flex';
    gameDetails.innerText = 'Game is starting';
    setTimeout(() => {
        gameDetails.style.display = 'none';
        inviteYourFriends.style.display = 'none';
        waitingForTrumps.style.display = 'flex';
        console.log('startGame');
    }, 2000);

    player1Name.innerText = matchPlayers[0].playerName;
    player2Name.innerText = matchPlayers[1].playerName;
    player3Name.innerText = matchPlayers[2].playerName;
    player4Name.innerText = matchPlayers[3].playerName;
    console.log(matchPlayers[0].playerName);

}
function showRandomCards() {
    fourRandomCards.style.display = 'flex';
    fourRandomCards.innerHTML = '';
    for (let i = 0; i < 4; i++) {
        const img = document.createElement('img');
        img.src = `assets/imgs/cards/${playerHand[i].imageName}`;

        fourRandomCards.appendChild(img);
    }
}

function playerCardMove(img, card) {
    let rect = img.getBoundingClientRect();
    let bodyRect = document.body.getBoundingClientRect();
    let middleOfScreen = bodyRect.width / 2;
    let offSet = middleOfScreen - rect.x;

    img.style.transition = "transform 0.5s ease";

    img.style.transform = `translate(${offSet}px,-150%) 
                            translateX(-50%) scale(1.2)
                            rotate(${offSet > 0 ? '-' : ''}180deg)`;

    console.log(playerHand);
    playerHand = playerHand.filter(playerCard => playerCard.name != card.name);
    console.log(playerHand);
}

function invalidCard(img) {
    img.style.animation = "invalid-move 800ms ease";

    setTimeout(() => {
        img.style.animation = "none";
    }, 800)
}

function offSetX(playerCard) {
    let rect = playerCard.getBoundingClientRect();
    let bodyRect = document.body.getBoundingClientRect();
    let middleOfScreenX = bodyRect.width / 2;
    let offSetX = middleOfScreenX - rect.x;

    return offSetX;
}

function offSetY(playerCard) {
    let rect = playerCard.getBoundingClientRect();
    let bodyRect = document.body.getBoundingClientRect();
    let middleOfScreenY = bodyRect.height / 2;
    let offSetY = middleOfScreenY - rect.y;

    return offSetY;
}

function otherCardMove(player, card) {
    if (player == 1) return;

    let playerCard;
    let cardNumber = card;
    let playerPositionX;

    if (player == 2) {
        playerCard = opponent1Hand.children[8 - roundCount];
        playerCard.style.transition = "transform 0.5s linear 0s";
        playerCard.style.transform = `translatey(${offSetY(playerCard)}px) translatex(-150%) rotateX(180deg) rotateY(180deg) rotateZ(0deg)`;
        setTimeout(() => {
            playerCard.src = "assets/imgs/cards/" + cardNumber + ".png";
        }, 250);

    } else if (player == 3) {
        playerCard = teammateHand.children[8 - roundCount];
        playerCard.style.transition = "transform 0.5s linear 0s";
        playerCard.style.transform = `translatey(150%) translateX(${offSetX(playerCard)}px) translateX(-50%) rotatey(180deg) scale(1.45)`;

        setTimeout(() => {
            playerCard.src = "assets/imgs/cards/" + cardNumber + ".png";
        }, 250);

    } else if (player == 4) {
        playerCard = opponent2Hand.children[8 - roundCount];
        playerCard.style.transition = "transform 0.5s linear 0s";
        playerCard.style.transform = `translatey(${offSetY(playerCard)}px) translatex(150%) rotatey(180deg) `;
        setTimeout(() => {
            playerCard.src = "assets/imgs/cards/" + cardNumber + ".png";
        }, 250);
    }
    tableCards.push(playerCard);
}

function createHands() {
    opponent1Hand.innerHTML = '';
    opponent2Hand.innerHTML = '';
    teammateHand.innerHTML = '';

    for (let i = 0; i < 8; i++) {
        const opponent1Card = document.createElement('img');
        const opponent2Card = document.createElement('img');
        const teammateCard = document.createElement('img');
        opponent1Card.src = "assets/imgs/cards/card-back-red.png";
        opponent2Card.src = "assets/imgs/cards/card-back-red.png";
        teammateCard.src = "assets/imgs/cards/card-back-red.png";

        opponent1Hand.appendChild(opponent1Card);
        opponent2Hand.appendChild(opponent2Card);
        teammateHand.appendChild(teammateCard);

    }
}

function getRelativePlayerNumber(playerNumber, otherPlayer) {
    if (playerNumber == 1) return otherPlayer;

    if (playerNumber == 2) {
        if (otherPlayer == 1) return 4;
        if (otherPlayer == 2) return 1;
        if (otherPlayer == 3) return 2;
        if (otherPlayer == 4) return 3;
    }

    if (playerNumber == 3) {
        if (otherPlayer == 1) return 3;
        if (otherPlayer == 2) return 4;
        if (otherPlayer == 3) return 1;
        if (otherPlayer == 4) return 2;
    }

    if (playerNumber == 4) {
        if (otherPlayer == 1) return 2;
        if (otherPlayer == 2) return 3;
        if (otherPlayer == 3) return 4;
        if (otherPlayer == 4) return 1;
    }

    return false;
}

function startNewMatch(data) {

    //glowCurrentPlayer();
    for (let i = 1; i <= 4; i++) {
        document.querySelector(`#player-${i}-points`).innerHTML = '';
    }

    if (isGameEnded == true) return;


    popupDiv.style.display = 'flex';
    matchWinnerElement.style.display = 'flex';
    if (data.matchWinner == "Tie Match") {
        matchWinnerElement.innerHTML = `${data.matchWinner}`;

    } else {
        matchWinnerElement.innerHTML = `${data.matchWinner} won the match`;
    }

    setTimeout(() => {
        matchWinnerElement.style.display = 'none';
        newMatchStarting.style.display = 'flex';
        newMatchStarting.innerHTML = ` Match ${++matchNumber} starting`

        setTimeout(() => {
            newMatchStarting.style.display = 'none';
            waitingForTrumps.style.display = 'flex';

        }, 2000);
    }, 1000);

    if (data.matchWinner == "Team 1") {
        if (isTeam(playerNumber, 1)) {
            addScore('green');



        } else {
            addScore('purple');
        }
    } else if (data.matchWinner == "Team 2") {
        if (isTeam(playerNumber, 2)) {
            addScore('green')
        } else {
            addScore('purple');
        }
    }

}

function gameFinish(data) {
    popupDiv.style.display = 'flex';
    gameEndElement.style.display = 'flex';
    waitingForTrumps.style.display = 'none';
    if (isTeam(playerNumber, data.gameWinner)) {
        gameEndElement.innerHTML =
            `VICTORY <br> You Won <br><a href="lobby.html" class="back-to-lobby-btn">Back to Lobby</a> `;
    } else {
        gameEndElement.innerHTML =
            `GAME OVER <br> You Lose <br><a href="lobby.html" class="back-to-lobby-btn">Back to Lobby</a> `;
    }


}

function isTeam(playerNumber, team) {
    if (playerNumber == 1 || playerNumber == 3) {
        if (team == 1) {
            return true;
        } else if (team == 2) {
            return false;
        }
    } else if (playerNumber == 2 || playerNumber == 4) {
        if (team == 1) {
            return false;
        } else if (team == 2) {
            return true;
        }
    }
}

function clickSound() {
    clickAudio.currentTime = 0;
    clickAudio.play();
}

function openSettings() {
    popupDiv.style.display = 'flex';
    settingsPopup.style.display = 'flex';
}

function closeSettings() {
    popupDiv.style.display = 'none';
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
    if (soundEffectsEnabled) {
        soundEffectsEnabled = false;
        clickAudio.muted = true;
        myPointAddAudio.muted = true;
        enemyPointAddAudio.muted = true;
        errorCardAudio.muted = true;
    } else {
        soundEffectsEnabled = true;
        clickAudio.muted = false;
        myPointAddAudio.muted = false;
        enemyPointAddAudio.muted = false;
        errorCardAudio.muted = false;
    }
}