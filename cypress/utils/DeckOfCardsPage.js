class DeckOfCardsPage {
  shuffleDeck(deckCount = 1) {
    return cy.request({
      method: 'GET',
      url: '/deck/new/shuffle/',
      qs: { deck_count: deckCount },
    })
  }

  drawCards(deckId, count = 1) {
    return cy.request({
      method: 'GET',
      url: `/deck/${deckId}/draw/`,
      qs: { count: count },
    })
  }

  reshuffleDeck(deckId, remaining = true) {
    return cy.request({
      method: 'GET',
      url: `/deck/${deckId}/shuffle/`,
      qs: { remaining: remaining },
    })
  }

  createNewDeck(jokersEnabled = false) {
    return cy.request({
      method: 'GET',
      url: '/deck/new/',
      qs: { jokers_enabled: jokersEnabled },
    })
  }

  createPartialDeck(cards) {
    return cy.request({
      method: 'GET',
      url: '/deck/new/shuffle/',
      qs: { cards: cards },
    })
  }

  addToPile(deckId, pileName, cards) {
    return cy.request({
      method: 'GET',
      url: `/deck/${deckId}/pile/${pileName}/add/`,
      qs: { cards: cards },
    })
  }

  shufflePile(deckId, pileName) {
    return cy.request({
      method: 'GET',
      url: `/deck/${deckId}/pile/${pileName}/shuffle/`,
    })
  }

  listPile(deckId, pileName) {
    return cy.request({
      method: 'GET',
      url: `/deck/${deckId}/pile/${pileName}/list/`,
    })
  }

  drawFromPile(deckId, pileName, options = {}) {
    let url = `/deck/${deckId}/pile/${pileName}/draw/`
    if (options.type === 'bottom') {
      url += 'bottom/'
    } else if (options.type === 'random') {
      url += 'random/'
    }
    return cy.request({
      method: 'GET',
      url: url,
      qs: options.cards ? { cards: options.cards } : options.count ? { count: options.count } : {},
    })
  }

  returnPileToDeck(deckId, pileName, cards = null) {
    let url = `/deck/${deckId}/pile/${pileName}/return/`
    return cy.request({
      method: 'GET',
      url: url,
      qs: cards ? { cards: cards } : {},
    })
  }

  getBackOfCardImage() {
    return 'https://www.deckofcardsapi.com/static/img/back.png'
  }
}

export const deckOfCardsPage = new DeckOfCardsPage()
