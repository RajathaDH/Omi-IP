const Deck = require('./Deck');

class OmiGame {
    constructor(room, scoreLimit) {
        this.deck = new Deck();
        this.players = new Map();
        this.room = room;
        this.gameStarted = false;
        this.gameFinished = false;
        this.matchNumber = 0;
        this.scoreLimit = scoreLimit;
        this.currentPlayer = -1;
        this.trump = null;
        this.table = [null, null, null, null];
        this.currentRoundFirstPlayer = -1;
    }

    addPlayer(player) {
        const playerNumber = player.playerNumber;
        this.players.set(playerNumber, player);
    }

    startGame() {
        this.gameStarted = true;
        this.matchNumber = 1;
        this.currentPlayer = 1;
        this.currentRoundFirstPlayer = 1;

        this.dealCards();
    }

    dealCards() {
        this.deck.generateDeck();
        this.deck.shuffle();

        // deal 8 cards to each player
        for (let i = 1; i <= 4; i++) {
            for (let j = 0; j < 8; j++) {
                const card = this.deck.deal();
                this.players.get(i).hand.set(card.name, card);
            }
        }
    }

    playCard(card) {
        // check if trump is called before playing
        if (!this.trump) return;

        if (this.players.get(this.currentPlayer).playCard(card)) {
            // if table is empty, current player is first player of that round
            if (!this.table[0] && !this.table[1] && !this.table[2] && !this.table[3]) {
                this.currentRoundFirstPlayer = this.currentPlayer;
            }

            // put card in player position
            this.table[this.currentPlayer - 1] = card;
            
            this.currentPlayer += 1;
            if (this.currentPlayer > 4) {
                this.currentPlayer = 1;
            }

            return true;
        }

        return false;
    }

    callTrump(trump) {
        if (trump == 'S' || trump == 'H' || trump == 'C' || trump == 'D') {
            this.trump = trump;
            return true;
        }

        return false;
    }

    roundWinner() {
        // -1 due to array indexing, player 1 will be 0 in array
        let currentRoundWinner = this.currentRoundFirstPlayer - 1;
        let currentRoundWinnerCard = this.table[this.currentRoundFirstPlayer - 1];

        let i = 0;
        while (i < 4) {
            const currentCardSuit = this.table[i].slice(0, 1);
            const currentCardValue = parseInt(this.table[i].slice(1));

            // check if current card is a trump and round winning card is not a trump
            if (currentCardSuit == this.trump && currentRoundWinnerCard.slice(0, 1) != this.trump) {
                currentRoundWinnerCard = this.table[i];
                currentRoundWinner = i;
            }

            // check if current card is higher than the round winning card
            if (currentCardSuit == currentRoundWinnerCard.slice(0, 1) && currentCardValue > parseInt(currentRoundWinnerCard.slice(1))) {
                currentRoundWinnerCard = this.table[i];
                currentRoundWinner = i;
            }

            i++;
        }

        this.clearTable();

        // +1 due to currentRoundWinner representing array position
        this.currentPlayer = currentRoundWinner + 1;
        
        return currentRoundWinner + 1;
    }

    clearTable() {
        this.table = [null, null, null, null];
    }
}

module.exports = OmiGame;