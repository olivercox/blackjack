angular.module('blackjack', []);

angular.module('blackjack').controller('BlackjackCtrl', ['$scope', 'Game',
  function ($scope, Game) {
    $scope.options = {
      playerName: 'Player 1',
      playerCount: 1
    }
    $scope.coercePlayers = function(event) {
      if(!$scope.options.playerCount) $scope.options.playerCount = 1;
    }
    $scope.startGame = function() {
      $scope.game = new Game();
      $scope.game.start($scope.options);
    }
    $scope.hit = function(player, hand) {
      $scope.game.hitHand(player, hand);
      $scope.game.playComputerPlayers(false);
      if(player.hasFinished()) {
        $scope.game.finishGame();
      }
    }
    $scope.stand = function(player, hand) {
      $scope.game.standHand(hand);
      $scope.game.playComputerPlayers(false);
      if(player.hasFinished()) {
        $scope.game.finishGame();
      }
    }
    $scope.split = function(player, hand) {
      $scope.game.splitHand(player, hand);
    }
}]);

angular.module('blackjack').factory('Deck', function () {

    var Deck = function() {
        this.cards = buildDeck();
    };

    var suits = ['Hearts', 'Diamonds', 'Spades', 'Clubs'];
  	var cardValues = [
        { name: 'Ace', value: 1 },
        { name: 'Two', value: 2 },
        { name: 'Three', value: 3 },
        { name: 'Four', value: 4 },
        { name: 'Five', value: 5 },
        { name: 'Six', value: 6 },
        { name: 'Seven', value: 7 },
        { name: 'Eight', value: 8 },
        { name: 'Nine', value: 9 },
        { name: 'Ten', value: 10 },
        { name: 'Jack', value: 10 },
        { name: 'Queen', value: 10 },
        { name: 'King', value: 10 }
      ];

    function buildDeck() {
        var cards = [];
        _.each(suits, function(suit) {
            _.each(cardValues, function(cardValue) {
                cards.push({
                    suit: suit,
                    name: cardValue.name,
                    value: cardValue.value
                });
            });
        });
        return cards;
    }

    Deck.prototype.cards = this.cards;

    Deck.prototype.shuffle = function() {
        for (var i = 51; i > 0; i--) {
            var r = Math.floor((i+1)*Math.random(i));
            var temp = this.cards[r];
            this.cards[r] = this.cards[i];
            this.cards[i] = temp;
        }
    }
    return Deck;
});

angular.module('blackjack').factory('Player', ['Hand', function (Hand) {

  var Player = function(isComputer, isDealer, name) {
      this.name = name;
      this.isComputer = isComputer;
      this.isDealer = isDealer;
      this.hands = [new Hand(this)];
  };

  Player.prototype.hands = this.hands;
  Player.prototype.hasFinished = function() {
    var finished = true;
    _.each(this.hands, function(hand) {
      if(!hand.stand && !hand.bust) {
        finished = false;
      }
    }, this);
    return finished;
  };

  return Player;
}]);

angular.module('blackjack').factory('Hand', function () {
  var player = null;
  var Hand = function(player, cards) {
      player = player;
      this.cards = cards ? cards : [];
      this.bust = false;
      this.stand = false;
      this.wins = null;
  };

  Hand.prototype.cards = this.cards;
  Hand.prototype.isBust = function() {
    if(this.score() > 21) this.bust = true;
  }
  Hand.prototype.score = function() {
    var hasAce = false;
    var score = _.reduce(this.cards, function(score, card) {
      if(card.value===1) hasAce = true;
      return score + card.value;
    }, 0);
    if(score <= 11 && hasAce) score += 10;
    return score;
  };

  return Hand;
});

angular.module('blackjack').factory('Game', ['Player', 'Hand', 'Deck',
  function (Player, Hand, Deck) {
  var Game = function() {
      this.players = [];
      this.dealer = null;
      this.computerPlayers = [];
      this.deck = new Deck();
      this.gameInPorgress = false;
  };

  /**
   * Start the game, add players, shuffle
   */
  Game.prototype.start = function(options) {
    this.gameInProgress = true;
    this.dealer = new Player(false, true, 'Dealer')
    this.players.push(this.dealer);
    this.players.push(new Player(false, false, options.playerName));
    _.times(options.playerCount-1, function(num) {
      this.computerPlayers.push(new Player(true, false, 'Computer ' + (num+1)));
      this.players.push(this.computerPlayers[this.computerPlayers.length-1]);
    }, this);
    this.deck.shuffle();
    this.deal();
  };

  /**
   * Deal two cards to each players hand
   */
  Game.prototype.deal = function() {
    // Deal first card to each player
    _.each(this.players, function(player) {
      player.hands[0].cards.push(this.deck.cards.pop());
    }, this);
    // Deal second card to each player
    _.each(this.players, function(player) {
      player.hands[0].cards.push(this.deck.cards.pop());
    }, this);
  }

  Game.prototype.hitHand = function(player, hand, recurse) {
    if(this.shouldPlay(player, hand)) {
      hand.cards.push(this.deck.cards.pop());
    }
    if(recurse && this.shouldPlay(player, hand)) {
        hand.cards.push(this.deck.cards.pop());
    }
    hand.isBust();
  }

  Game.prototype.standHand = function(hand) {
    hand.stand = true;
  }

  Game.prototype.splitHand = function(player, hand) {
    player.hands = [
      new Hand(player, [hand.cards[0], this.deck.cards.pop()]),
      new Hand(player, [hand.cards[1], this.deck.cards.pop()])
    ];
  }

  Game.prototype.shouldPlay = function(player, hand) {
    if(player.isComputer||player.isDealer) {
      if(hand.score() >= 17) hand.stand = true;
      return !hand.bust && !hand.stand;
    }
    return true;
  }

  Game.prototype.playComputerPlayers = function(recurse) {
    _.each(this.computerPlayers, function(player) {
      _.each(player.hands, function(hand) {
        this.hitHand(player, hand, recurse);
      }, this)
    }, this);
  }

  Game.prototype.playDealer = function() {
    _.each(this.dealer.hands, function(hand) {
      this.hitHand(this.dealer, hand, true);
    }, this);
  }

  Game.prototype.finishGame = function() {
    this.playComputerPlayers(true);
    this.playDealer();
    var dealerScore = 0;
    _.each(this.dealer.hands, function(hand) {
      var score = hand.score();
      if(score > dealerScore && score <= 21) dealerScore = score;
    });
    _.each(this.players, function(player) {
      _.each(player.hands, function(hand) {
        var score = hand.score();
        if(score > dealerScore && score <= 21) {
          hand.wins = true;
        }
      });
    });
    this.gameOver = true;
  }

  return Game;
}]);

angular.module('blackjack').filter('playerOffset', function() {
  return function(index, players) {
    if(index===1) {
      if(players === 1) return 'col-md-offset-4';
      if(players === 2) return 'col-md-offset-2';
    }
  };
});

angular.module('blackjack').filter('canSplit', function() {
  return function(player, hand) {
    if(!player.isComputer && !player.isDealer) {
      if(hand.cards.length === 2) {
        return !(
          hand.cards[0].value === hand.cards[1].value &&
          hand.cards[0].name === hand.cards[1].name
        );
      }
    }
    return true;
  };
});
