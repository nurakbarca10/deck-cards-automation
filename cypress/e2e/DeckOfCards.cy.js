//import { expect } from "chai";
import { deckOfCardsPage } from '../utils/DeckOfCardsPage'
import { expectedOrder } from '../fixtures/apiData'

let deckId
const pileName = 'discard'
const pileName2 = 'player1'

describe('Deck of Cards API Test Automation', () => {
  it('TC01 - Shuffle the Cards', () => {
    // Define the number of decks to be used, e.g., 6 for Blackjack
    const deckCount = 6

    deckOfCardsPage.shuffleDeck(deckCount).then((response) => {
      // Assert the response status code
      expect(response.status).to.eq(200)

      // Assert the response body properties
      expect(response.body).to.have.property('success', true)
      expect(response.body).to.have.property('deck_id').and.to.be.a('string')
      deckId = response.body.deck_id
      expect(response.body).to.have.property('shuffled', true)
      expect(response.body).to.have.property('remaining', 52 * deckCount)
    })
  })

  it('TC02 - Draw a Card', () => {
    // Define the number of cards to draw
    const cardCount = 2

    deckOfCardsPage.drawCards(deckId, cardCount).then((drawResponse) => {
      // Assert the response status code
      expect(drawResponse.status).to.eq(200)

      // Assert the response body properties
      expect(drawResponse.body).to.have.property('success', true)
      expect(drawResponse.body).to.have.property('deck_id', deckId)
      expect(drawResponse.body).to.have.property('remaining').and.to.be.a('number')
      expect(drawResponse.body.cards).to.have.length(cardCount)

      // Assert card properties
      drawResponse.body.cards.forEach((card) => {
        expect(card).to.have.property('code').and.to.be.a('string')
        expect(card).to.have.property('image').and.to.be.a('string')
        expect(card).to.have.property('value').and.to.be.a('string')
        expect(card).to.have.property('suit').and.to.be.a('string')
      })
    })
  })

  it('TC03 - Reshuffle the Cards', () => {
    // Use the reshuffleDeck method from the page object
    deckOfCardsPage.reshuffleDeck(deckId, true).then((reshuffleResponse) => {
      expect(reshuffleResponse.status).to.eq(200)

      // Assert the response body properties
      expect(reshuffleResponse.body).to.have.property('success', true)
      expect(reshuffleResponse.body).to.have.property('deck_id', deckId)
      expect(reshuffleResponse.body).to.have.property('shuffled', true)
      expect(reshuffleResponse.body).to.have.property('remaining').and.to.be.a('number')
    })
  })

  it('TC04 - A Brand New Deck', () => {
    // Send a GET request to create a brand new deck of cards
    deckOfCardsPage.createNewDeck(true).then((response) => {
      // Assert the response status code
      expect(response.status).to.eq(200)

      // Assert the response body properties
      expect(response.body).to.have.property('success', true)
      expect(response.body).to.have.property('shuffled', false)
      expect(response.body).to.have.property('remaining', 54) // 52 cards + 2 jokers
      expect(response.body).to.have.property('deck_id').and.to.be.a('string')

      deckId = response.body.deck_id

      // Draw all cards to validate the order of the deck
      deckOfCardsPage.drawCards(deckId, 52).then((drawResponse) => {
        // Assert the response status code
        expect(drawResponse.status).to.eq(200)

        // Assert the cards are in the expected order
        drawResponse.body.cards.forEach((card, index) => {
          expect(card.code).to.eq(expectedOrder[index])
        })
      })
    })
  })

  it('TC05 - A Partial Deck', () => {
    // Define the cards to be used in the partial deck
    const cards = 'AS,2S,KS,AD,2D,KD,AC,2C,KC,AH,2H,KH'

    // Send a GET request to create and shuffle a partial deck
    deckOfCardsPage.createPartialDeck(cards).then((response) => {
      expect(response.status).to.eq(200)

      // Assert the response body properties
      expect(response.body).to.have.property('success', true)
      expect(response.body).to.have.property('shuffled', true)
      expect(response.body).to.have.property('remaining', 12)
      expect(response.body).to.have.property('deck_id').and.to.be.a('string')
    })
  })

  it('TC06 - Adding to Piles', () => {
    // First, shuffle a new deck and get the deck_id
    deckOfCardsPage.shuffleDeck(1).then((shuffleResponse) => {
      deckId = shuffleResponse.body.deck_id

      // Draw cards to add to the pile
      deckOfCardsPage.drawCards(deckId, 2).then((drawResponse) => {
        const cards = drawResponse.body.cards.map((card) => card.code).join(',')

        // Send a GET request to add the drawn cards to a pile named 'discard'
        deckOfCardsPage.addToPile(deckId, pileName, cards).then((pileResponse) => {
          // Assert the response status code
          expect(pileResponse.status).to.eq(200)

          // Assert the response body properties
          expect(pileResponse.body).to.have.property('success', true)
          expect(pileResponse.body).to.have.property('deck_id', deckId)
          expect(pileResponse.body).to.have.property('piles')
          expect(pileResponse.body.piles).to.have.property(pileName)
          expect(pileResponse.body.piles.discard).to.have.property('remaining', 2)
        })
      })
    })
  })

  it('TC07 - Shuffle Piles', () => {
    // First, shuffle a new deck and get the deck_id
    deckOfCardsPage.shufflePile(deckId, pileName).then((shuffleResponse) => {
      const deckId = shuffleResponse.body.deck_id

      // Draw cards to add to the pile
      deckOfCardsPage.drawCards(deckId, 1).then((drawResponse) => {
     const cards = drawResponse.body.cards.map((card) => card.code).join(',')

        // Add the drawn cards to a pile named 'discard'
        deckOfCardsPage.listPile(deckId, pileName).then((pileResponse) => {
          // Assert the response status code
          expect(pileResponse.status).to.eq(200)

          // Shuffle the pile named 'discard'
          deckOfCardsPage.shufflePile(deckId, pileName).then((shufflePileResponse) => {
            // Assert the response status code
            expect(shufflePileResponse.status).to.eq(200)

            // Assert the response body properties
            expect(shufflePileResponse.body).to.have.property('success', true)
            expect(shufflePileResponse.body).to.have.property('deck_id', deckId)
            expect(shufflePileResponse.body).to.have.property('piles')
            expect(shufflePileResponse.body.piles).to.have.property(pileName)
            expect(shufflePileResponse.body.piles.discard).to.have.property('remaining', 2)
          })
        })
      })
    })
  })

  it('TC08 - Listing Cards in Piles', () => {
    // First, shuffle a new deck and get the deck_id
    deckOfCardsPage.shuffleDeck(1).then((shuffleResponse) => {
      const deckId = shuffleResponse.body.deck_id

      // Draw cards to add to the pile
      cy.request({
        method: 'GET',
        url: `/deck/${deckId}/draw/`,
        qs: {
          count: 2,
        },
      }).then((drawResponse) => {
        const cards = drawResponse.body.cards.map((card) => card.code).join(',')

        // Add the drawn cards to a pile named 'player1'
        deckOfCardsPage.addToPile(deckId, pileName2, cards).then((pileResponse) => {
          // Assert the response status code
          expect(pileResponse.status).to.eq(200)

          // List the cards in the pile named 'player1'
          deckOfCardsPage.listPile(deckId, pileName2).then((listPileResponse) => {
            // Assert the response status code
            expect(listPileResponse.status).to.eq(200)

            // Assert the response body properties
            expect(listPileResponse.body).to.have.property('success', true)
            expect(listPileResponse.body).to.have.property('deck_id', deckId)
            expect(listPileResponse.body).to.have.property('piles')
            expect(listPileResponse.body.piles).to.have.property('player1')
            expect(listPileResponse.body.piles.player1).to.have.property('remaining', 2)
            expect(listPileResponse.body.piles.player1).to.have.property('cards')
            expect(listPileResponse.body.piles.player1.cards).to.have.length(2)
          })
        })
      })
    })
  })

  it('TC09 - Drawing from Piles', () => {
    // First, shuffle a new deck and get the deck_id
    deckOfCardsPage.shuffleDeck(1).then((shuffleResponse) => {
      deckId = shuffleResponse.body.deck_id

      // Draw cards to add to the pile
      deckOfCardsPage.drawCards(deckId, 2).then((drawResponse) => {
        const cards = drawResponse.body.cards.map((card) => card.code).join(',')

        // Add the drawn cards to a pile named 'player1'
        deckOfCardsPage.addToPile(deckId, pileName2, cards).then((pileResponse) => {
          // Assert the response status code
          expect(pileResponse.status).to.eq(200)

          // List the cards in the pile named 'player1'
          deckOfCardsPage.listPile(deckId, pileName2).then((listPileResponse) => {
            // Assert the response status code
            expect(listPileResponse.status).to.eq(200)

            // Assert the response body properties
            expect(listPileResponse.body).to.have.property('success', true)
            expect(listPileResponse.body).to.have.property('deck_id', deckId)
            expect(listPileResponse.body).to.have.property('piles')
            expect(listPileResponse.body.piles).to.have.property('player1')
            expect(listPileResponse.body.piles.player1).to.have.property('remaining', 2)
            expect(listPileResponse.body.piles.player1).to.have.property('cards')
            expect(listPileResponse.body.piles.player1.cards).to.have.length(2)
          })
        })
      })
    })
  })

  it('TC10 - Returning Cards to the Deck', () => {
    // First, shuffle a new deck and get the deck_id
    deckOfCardsPage.shuffleDeck(1).then((shuffleResponse) => {
      deckId = shuffleResponse.body.deck_id

      // Draw cards to add to the pile
      deckOfCardsPage.drawCards(deckId, 3).then((drawResponse) => {
        const cards = drawResponse.body.cards.map((card) => card.code).join(',')

        // Add the drawn cards to a pile named 'discard'
        deckOfCardsPage.addToPile(deckId, pileName, cards).then((pileResponse) => {
          // Assert the response status code
          expect(pileResponse.status).to.eq(200)

          // Return specific cards from the pile to the deck
          deckOfCardsPage.returnPileToDeck(deckId, pileName, 'AS,2S').then((returnResponse) => {
            // Assert the response status code
            expect(returnResponse.status).to.eq(200)
            expect(returnResponse.body).to.have.property('success', true)
            expect(returnResponse.body).to.have.property('deck_id', deckId)
            // expect(returnResponse.body.piles.discard.remaining).to.eq(1);
          })

          // Return all cards from the pile to the deck
          deckOfCardsPage.returnPileToDeck(deckId, pileName).then((returnAllResponse) => {
            // Assert the response status code
            expect(returnAllResponse.status).to.eq(200)
            expect(returnAllResponse.body).to.have.property('success', true)
            expect(returnAllResponse.body).to.have.property('deck_id', deckId)
            expect(returnAllResponse.body.piles.discard).to.have.property('remaining', 0)
          })
        })
      })
    })
  })

  it('TC11 - Get Back of Card Image URL', () => {
    const backOfCardImageUrl = deckOfCardsPage.getBackOfCardImage()
    expect(backOfCardImageUrl).to.contain('/static/img/back.png')
  })
})
