# Beamery Blackjack Challenge

## Overview

I decided to focus on creating a simplied game of Blackjack in client side
Javascript and Angularjs. Although I toyed with the idea of a server side
solution with multiplayer features, I felt this would increase the complexity
and time required without adding anything to the goal.

My goal, was to create a Blackjack game in angularjs that would demonstrate
my ability to design, structure and write applications in Javascript.

## Structure

The solution structure is very simple:-

    root/
      index.html - Contains all the html for the game
      images/
        card_spritesheet.png - Okay so I borrowed this from here
        (http://www.codethislab.com/bozze/codecanyon/blackjack/)
      javascripts/
        app.js - All the javascript is in here
      stylesheets/
        style.css - Some simple styles and a set of image offsets to work
        with the card sprite image

Within the app.js I have structured the Angularjs using factory definition
that allows for specific instantiations of objects (e.g. Deck and Player).

    angular.module('blackjack').factory('Deck', function () {
      var Deck = function() {
          this.cards = buildDeck();
      };
      ...
      return Deck;
    }]);

Although not necessary with Angular, which is often written in a more functional programming idiom, I felt that the logic associated with the different objects lent itself well to an object oriented approach.

## Game logic

The game allows for one human player and up-to two computer players in addition to the dealer. I opted for a limit, purely to make the UI easier and ensure that layout was functional.

The dealer and computer players use a simple playing strategy of hit to 16, stand on 17. I also opted for a dealer wins draws which isn't always the case but made the logic easier as there is always a winning hand.

The human player can hit and stand on any number and the split feature is implemented but does not yet support splitting again. The split feature has not been added to the dealer and computer player logic.

## External Libraries

The solution uses the following open source libraries:

1. Angularjs - Used to demonstrate an working knowledge.
2. Bootstrap - Used to provide quick styling and allow me to focus on the Javascript. I haven't used the Bootstrap Javascript components
3. Lodash - Although not necessary, Lodash is my first go-to library when working with Javascript.

## Possible improvements

There are many but I would start with implementing the split feature for dealer and computer. I would update the UI and shoot for a blackjack table look and feel with animations for the card deal and turn.

As previously mentioned a server side solution with multiplayer support would be a great addition.
