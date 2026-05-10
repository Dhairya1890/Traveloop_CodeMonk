'use strict'

module.exports = {
  up: async (queryInterface) => {
    // Look up real city IDs by name + country to avoid hardcoding
    const find = async (name, country) => {
      const [rows] = await queryInterface.sequelize.query(
        `SELECT id FROM cities WHERE name = :name AND country = :country LIMIT 1`,
        { replacements: { name, country } }
      )
      if (!rows.length) throw new Error(`City not found: ${name}, ${country}`)
      return rows[0].id
    }

    const [
      parisId, tokyoId, newYorkId, barcelonaId, bangkokId,
      romeId, dubaiId, baliId, londonId, singaporeId,
      istanbulId, sydneyId, capeTownId
    ] = await Promise.all([
      find('Paris',        'France'),
      find('Tokyo',        'Japan'),
      find('New York',     'United States'),
      find('Barcelona',    'Spain'),
      find('Bangkok',      'Thailand'),
      find('Rome',         'Italy'),
      find('Dubai',        'United Arab Emirates'),
      find('Denpasar',     'Indonesia'),   // Bali's main city in world cities DB
      find('London',       'United Kingdom'),
      find('Singapore',    'Singapore'),
      find('Istanbul',     'Turkey'),
      find('Sydney',       'Australia'),
      find('Cape Town',    'South Africa'),
    ])

    await queryInterface.bulkInsert('activities', [

      // ── Paris ──────────────────────────────────────────────
      { city_id: parisId, name: 'Eiffel Tower Visit', category: 'sightseeing', cost: 26.00, duration_minutes: 180, description: 'Visit the iconic iron lattice tower on the Champ de Mars.', image_url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: parisId, name: 'Louvre Museum', category: 'culture', cost: 17.00, duration_minutes: 240, description: 'World\'s largest art museum and historic monument.', image_url: 'https://images.unsplash.com/photo-1541233349642-6e425fe6190e?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: parisId, name: 'Seine River Cruise', category: 'sightseeing', cost: 15.00, duration_minutes: 60, description: 'Scenic boat ride along the Seine past major landmarks.', image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: parisId, name: 'Montmartre Food Tour', category: 'food', cost: 45.00, duration_minutes: 180, description: 'Explore the bohemian neighborhood and taste local delicacies.', image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', created_at: new Date(), updated_at: new Date() },

      // ── Tokyo ──────────────────────────────────────────────
      { city_id: tokyoId, name: 'Senso-ji Temple', category: 'culture', cost: 0.00, duration_minutes: 90, description: 'Tokyo\'s oldest Buddhist temple in Asakusa.', image_url: 'https://images.unsplash.com/photo-1583396618422-c8ebf4e61e03?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: tokyoId, name: 'Shibuya Crossing', category: 'sightseeing', cost: 0.00, duration_minutes: 30, description: 'Experience the world\'s busiest pedestrian crossing.', image_url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: tokyoId, name: 'Tsukiji Outer Market Food Tour', category: 'food', cost: 30.00, duration_minutes: 120, description: 'Sample fresh sushi, sashimi and Japanese street food.', image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: tokyoId, name: 'teamLab Planets', category: 'culture', cost: 32.00, duration_minutes: 90, description: 'Immersive digital art museum with stunning installations.', image_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400', created_at: new Date(), updated_at: new Date() },

      // ── New York ───────────────────────────────────────────
      { city_id: newYorkId, name: 'Central Park Walking Tour', category: 'nature', cost: 0.00, duration_minutes: 120, description: 'Explore 843 acres of urban parkland in the heart of Manhattan.', image_url: 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: newYorkId, name: 'Statue of Liberty', category: 'sightseeing', cost: 24.00, duration_minutes: 180, description: 'Ferry to Liberty Island to see the iconic copper statue.', image_url: 'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: newYorkId, name: 'Broadway Show', category: 'culture', cost: 120.00, duration_minutes: 150, description: 'Watch a world-class musical or play on the famous Broadway strip.', image_url: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: newYorkId, name: 'NYC Food Crawl', category: 'food', cost: 55.00, duration_minutes: 180, description: 'Taste NYC\'s best pizza, bagels, and street food.', image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', created_at: new Date(), updated_at: new Date() },

      // ── Barcelona ──────────────────────────────────────────
      { city_id: barcelonaId, name: 'Sagrada Familia', category: 'sightseeing', cost: 26.00, duration_minutes: 120, description: 'Gaudi\'s unfinished masterpiece basilica.', image_url: 'https://images.unsplash.com/photo-1583779457094-ab6f77f7bf57?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: barcelonaId, name: 'Park Güell', category: 'nature', cost: 10.00, duration_minutes: 90, description: 'Colorful mosaic park with panoramic views over the city.', image_url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: barcelonaId, name: 'La Boqueria Market', category: 'food', cost: 0.00, duration_minutes: 60, description: 'Famous public market with fresh produce, seafood, and tapas.', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: barcelonaId, name: 'Flamenco Show', category: 'culture', cost: 35.00, duration_minutes: 90, description: 'Authentic Spanish flamenco dance in the Gothic Quarter.', image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400', created_at: new Date(), updated_at: new Date() },

      // ── Bangkok ────────────────────────────────────────────
      { city_id: bangkokId, name: 'Grand Palace', category: 'culture', cost: 17.00, duration_minutes: 150, description: 'Stunning royal complex and the famous Emerald Buddha.', image_url: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: bangkokId, name: 'Floating Market Tour', category: 'sightseeing', cost: 20.00, duration_minutes: 240, description: 'Explore the iconic Damnoen Saduak floating market by boat.', image_url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: bangkokId, name: 'Street Food Night Tour', category: 'food', cost: 25.00, duration_minutes: 180, description: 'Sample pad thai, mango sticky rice and more at Yaowarat.', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: bangkokId, name: 'Muay Thai Class', category: 'adventure', cost: 15.00, duration_minutes: 90, description: 'Learn Thailand\'s national sport with a local trainer.', image_url: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=400', created_at: new Date(), updated_at: new Date() },

      // ── Rome ───────────────────────────────────────────────
      { city_id: romeId, name: 'Colosseum Tour', category: 'culture', cost: 18.00, duration_minutes: 120, description: 'Explore the ancient amphitheatre that once held 80,000 spectators.', image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: romeId, name: 'Vatican Museums', category: 'culture', cost: 20.00, duration_minutes: 180, description: 'World\'s greatest art collection including the Sistine Chapel.', image_url: 'https://images.unsplash.com/photo-1555992457-b8fefdd09069?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: romeId, name: 'Roman Food Tour', category: 'food', cost: 65.00, duration_minutes: 180, description: 'Taste authentic Roman pasta, gelato and supplì.', image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', created_at: new Date(), updated_at: new Date() },

      // ── Dubai ──────────────────────────────────────────────
      { city_id: dubaiId, name: 'Burj Khalifa Observation Deck', category: 'sightseeing', cost: 35.00, duration_minutes: 90, description: 'Observation deck of the world\'s tallest building.', image_url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: dubaiId, name: 'Desert Safari', category: 'adventure', cost: 60.00, duration_minutes: 360, description: 'Dune bashing, camel riding, and a BBQ dinner under the stars.', image_url: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: dubaiId, name: 'Dubai Mall Shopping', category: 'shopping', cost: 0.00, duration_minutes: 180, description: 'Shop at one of the world\'s largest malls with 1200+ stores.', image_url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400', created_at: new Date(), updated_at: new Date() },

      // ── Bali (Denpasar) ────────────────────────────────────
      { city_id: baliId, name: 'Ubud Rice Terrace Trek', category: 'nature', cost: 10.00, duration_minutes: 180, description: 'Hike through the stunning Tegallalang rice terraces.', image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: baliId, name: 'Mount Batur Sunrise Hike', category: 'adventure', cost: 35.00, duration_minutes: 300, description: 'Trek to the summit of an active volcano for a stunning sunrise.', image_url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: baliId, name: 'Balinese Cooking Class', category: 'food', cost: 30.00, duration_minutes: 240, description: 'Learn to cook authentic Balinese dishes with local spices.', image_url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: baliId, name: 'Tanah Lot Temple', category: 'culture', cost: 5.00, duration_minutes: 90, description: 'Visit the iconic sea temple perched on a rocky outcrop.', image_url: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400', created_at: new Date(), updated_at: new Date() },

      // ── London ─────────────────────────────────────────────
      { city_id: londonId, name: 'Tower of London', category: 'culture', cost: 30.00, duration_minutes: 150, description: 'Historic castle housing the Crown Jewels.', image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: londonId, name: 'British Museum', category: 'culture', cost: 0.00, duration_minutes: 180, description: 'One of the world\'s greatest museums of human history.', image_url: 'https://images.unsplash.com/photo-1526299099370-40b27a9c7db1?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: londonId, name: 'London Pub Crawl', category: 'nightlife', cost: 20.00, duration_minutes: 240, description: 'Visit the best historic pubs with a local guide.', image_url: 'https://images.unsplash.com/photo-1575367439058-6096bb522a54?w=400', created_at: new Date(), updated_at: new Date() },

      // ── Singapore ──────────────────────────────────────────
      { city_id: singaporeId, name: 'Gardens by the Bay', category: 'nature', cost: 14.00, duration_minutes: 120, description: 'Futuristic nature park with iconic Supertree Grove.', image_url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: singaporeId, name: 'Hawker Centre Food Tour', category: 'food', cost: 20.00, duration_minutes: 120, description: 'Try chicken rice, laksa and char kway teow at Maxwell Food Centre.', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: singaporeId, name: 'Marina Bay Sands Skypark', category: 'sightseeing', cost: 23.00, duration_minutes: 90, description: 'Observation deck atop the iconic hotel for city views.', image_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400', created_at: new Date(), updated_at: new Date() },

      // ── Istanbul ───────────────────────────────────────────
      { city_id: istanbulId, name: 'Hagia Sophia', category: 'culture', cost: 0.00, duration_minutes: 90, description: 'Magnificent former cathedral and mosque with Byzantine architecture.', image_url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: istanbulId, name: 'Grand Bazaar Shopping', category: 'shopping', cost: 0.00, duration_minutes: 120, description: 'One of the world\'s oldest covered markets with 4000+ shops.', image_url: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: istanbulId, name: 'Bosphorus Cruise', category: 'sightseeing', cost: 15.00, duration_minutes: 120, description: 'Scenic cruise through the strait separating Europe and Asia.', image_url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400', created_at: new Date(), updated_at: new Date() },

      // ── Sydney ─────────────────────────────────────────────
      { city_id: sydneyId, name: 'Sydney Opera House Tour', category: 'culture', cost: 43.00, duration_minutes: 90, description: 'Guided tour of one of the world\'s most famous performing arts centres.', image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: sydneyId, name: 'Bondi Beach', category: 'nature', cost: 0.00, duration_minutes: 180, description: 'Australia\'s most famous beach with golden sand and great surf.', image_url: 'https://images.unsplash.com/photo-1523428096881-5bd79d043006?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: sydneyId, name: 'Harbour Bridge Climb', category: 'adventure', cost: 174.00, duration_minutes: 210, description: 'Climb to the summit of the iconic Sydney Harbour Bridge.', image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400', created_at: new Date(), updated_at: new Date() },

      // ── Cape Town ──────────────────────────────────────────
      { city_id: capeTownId, name: 'Table Mountain Cable Car', category: 'nature', cost: 22.00, duration_minutes: 120, description: 'Ride the rotating cable car to the top of the iconic flat-topped mountain.', image_url: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: capeTownId, name: 'Cape Winelands Tour', category: 'food', cost: 55.00, duration_minutes: 360, description: 'Visit Stellenbosch and Franschhoek vineyards for wine tasting.', image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400', created_at: new Date(), updated_at: new Date() },
      { city_id: capeTownId, name: 'Robben Island', category: 'culture', cost: 18.00, duration_minutes: 240, description: 'Visit the island prison where Nelson Mandela was held for 18 years.', image_url: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400', created_at: new Date(), updated_at: new Date() },
    ])
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('activities', null, {})
  }
}