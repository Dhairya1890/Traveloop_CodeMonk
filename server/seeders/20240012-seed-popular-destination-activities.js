'use strict'

module.exports = {
  up: async (queryInterface) => {
    const find = async (name, country) => {
      const [rows] = await queryInterface.sequelize.query(
        `SELECT id FROM cities WHERE name = :name AND country = :country LIMIT 1`,
        { replacements: { name, country } }
      )
      if (!rows.length) { console.warn(`City not found: ${name}, ${country}`); return null }
      return rows[0].id
    }

    const hasActivities = async (cityId) => {
      if (!cityId) return true
      const [rows] = await queryInterface.sequelize.query(
        `SELECT COUNT(*) as c FROM activities WHERE city_id = :cityId`,
        { replacements: { cityId } }
      )
      return Number(rows[0].c) > 0
    }

    const [jakartaId, delhiId, guangzhouId, mumbaiId, manilaId] = await Promise.all([
      find('Jakarta',    'Indonesia'),
      find('Delhi',      'India'),
      find('Guangzhou',  'China'),
      find('Mumbai',     'India'),
      find('Manila',     'Philippines'),
    ])

    const toInsert = []
    const now = new Date()

    // ── Jakarta ─────────────────────────────────────────────────
    if (jakartaId && !await hasActivities(jakartaId)) {
      toInsert.push(
        { city_id: jakartaId, name: 'Monas National Monument', category: 'sightseeing', cost: 2.00, duration_minutes: 90, description: 'Climb the iconic 132m obelisk at the heart of Jakarta for panoramic city views.', image_url: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=400', created_at: now, updated_at: now },
        { city_id: jakartaId, name: 'Kota Tua (Old Town) Walk', category: 'culture', cost: 0.00, duration_minutes: 120, description: 'Explore Dutch colonial-era buildings, cafes and street art in Batavia old town.', image_url: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=400', created_at: now, updated_at: now },
        { city_id: jakartaId, name: 'Jakarta Street Food Night Tour', category: 'food', cost: 18.00, duration_minutes: 180, description: 'Taste nasi goreng, sate, martabak and other local favourites at night markets.', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', created_at: now, updated_at: now },
        { city_id: jakartaId, name: 'Thousand Islands Snorkeling', category: 'adventure', cost: 40.00, duration_minutes: 360, description: 'Day trip to Pulau Tidung for snorkeling, cycling, and beach relaxation.', image_url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400', created_at: now, updated_at: now },
        { city_id: jakartaId, name: 'Grand Indonesia Mall', category: 'shopping', cost: 0.00, duration_minutes: 150, description: 'One of Jakarta\'s largest luxury malls with international and local brands.', image_url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400', created_at: now, updated_at: now },
      )
    }

    // ── Delhi ────────────────────────────────────────────────────
    if (delhiId && !await hasActivities(delhiId)) {
      toInsert.push(
        { city_id: delhiId, name: 'Red Fort', category: 'culture', cost: 3.50, duration_minutes: 120, description: 'UNESCO World Heritage Mughal fort that was home to emperors for 200 years.', image_url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400', created_at: now, updated_at: now },
        { city_id: delhiId, name: 'Qutub Minar', category: 'sightseeing', cost: 3.50, duration_minutes: 90, description: 'The world\'s tallest brick minaret and a UNESCO World Heritage Site.', image_url: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400', created_at: now, updated_at: now },
        { city_id: delhiId, name: 'Old Delhi Food Walk', category: 'food', cost: 20.00, duration_minutes: 180, description: 'Sample chaat, parathas, biryani and jalebi in the lanes of Chandni Chowk.', image_url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400', created_at: now, updated_at: now },
        { city_id: delhiId, name: 'Humayun\'s Tomb', category: 'culture', cost: 3.50, duration_minutes: 90, description: 'Stunning Mughal-era tomb that inspired the design of the Taj Mahal.', image_url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400', created_at: now, updated_at: now },
        { city_id: delhiId, name: 'Lotus Temple', category: 'sightseeing', cost: 0.00, duration_minutes: 60, description: 'Iconic flower-shaped Bahai House of Worship open to all faiths.', image_url: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400', created_at: now, updated_at: now },
      )
    }

    // ── Guangzhou ────────────────────────────────────────────────
    if (guangzhouId && !await hasActivities(guangzhouId)) {
      toInsert.push(
        { city_id: guangzhouId, name: 'Canton Tower Observation Deck', category: 'sightseeing', cost: 17.00, duration_minutes: 90, description: 'Visit the 600m tall tower with a glass-floor observation deck over the Pearl River.', image_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400', created_at: now, updated_at: now },
        { city_id: guangzhouId, name: 'Chen Clan Ancestral Hall', category: 'culture', cost: 4.00, duration_minutes: 90, description: 'Magnificent Qing-dynasty folk art museum with intricate carvings and ceramics.', image_url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400', created_at: now, updated_at: now },
        { city_id: guangzhouId, name: 'Dim Sum Breakfast Tour', category: 'food', cost: 15.00, duration_minutes: 120, description: 'Experience authentic Cantonese dim sum culture at a traditional yum cha restaurant.', image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', created_at: now, updated_at: now },
        { city_id: guangzhouId, name: 'Shamian Island Walk', category: 'sightseeing', cost: 0.00, duration_minutes: 90, description: 'Stroll through the charming European-style former colonial concession island.', image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400', created_at: now, updated_at: now },
        { city_id: guangzhouId, name: 'Guangzhou Night Market', category: 'nightlife', cost: 10.00, duration_minutes: 150, description: 'Browse street food, local crafts and live entertainment at Shangxiajiu pedestrian street.', image_url: 'https://images.unsplash.com/photo-1575367439058-6096bb522a54?w=400', created_at: now, updated_at: now },
      )
    }

    // ── Mumbai ───────────────────────────────────────────────────
    if (mumbaiId && !await hasActivities(mumbaiId)) {
      toInsert.push(
        { city_id: mumbaiId, name: 'Gateway of India', category: 'sightseeing', cost: 0.00, duration_minutes: 60, description: 'Iconic arch monument overlooking the Arabian Sea — Mumbai\'s most recognisable landmark.', image_url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400', created_at: now, updated_at: now },
        { city_id: mumbaiId, name: 'Dharavi Slum Tour', category: 'culture', cost: 18.00, duration_minutes: 180, description: 'Responsible guided walk through one of Asia\'s largest and most entrepreneurial slums.', image_url: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=400', created_at: now, updated_at: now },
        { city_id: mumbaiId, name: 'Mumbai Street Food Trail', category: 'food', cost: 12.00, duration_minutes: 150, description: 'Taste vada pav, pav bhaji, bhel puri and cutting chai across iconic stalls.', image_url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400', created_at: now, updated_at: now },
        { city_id: mumbaiId, name: 'Elephanta Caves', category: 'culture', cost: 6.00, duration_minutes: 240, description: 'UNESCO-listed rock-cut temples on an island in Mumbai Harbour dedicated to Shiva.', image_url: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400', created_at: now, updated_at: now },
        { city_id: mumbaiId, name: 'Marine Drive Sunset Walk', category: 'nature', cost: 0.00, duration_minutes: 90, description: 'Walk along the 3.6km Queen\'s Necklace promenade at golden hour.', image_url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400', created_at: now, updated_at: now },
      )
    }

    // ── Manila ───────────────────────────────────────────────────
    if (manilaId && !await hasActivities(manilaId)) {
      toInsert.push(
        { city_id: manilaId, name: 'Intramuros Walking Tour', category: 'culture', cost: 5.00, duration_minutes: 120, description: 'Explore the 16th-century walled city with Spanish colonial forts and churches.', image_url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400', created_at: now, updated_at: now },
        { city_id: manilaId, name: 'Rizal Park', category: 'nature', cost: 0.00, duration_minutes: 90, description: 'Lush urban park and national shrine honouring Philippine national hero José Rizal.', image_url: 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=400', created_at: now, updated_at: now },
        { city_id: manilaId, name: 'Manila Bay Sunset Cruise', category: 'sightseeing', cost: 22.00, duration_minutes: 120, description: 'Enjoy one of Asia\'s most famous sunsets from a traditional bangka boat.', image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400', created_at: now, updated_at: now },
        { city_id: manilaId, name: 'Filipino Food Crawl', category: 'food', cost: 20.00, duration_minutes: 180, description: 'Taste lechon, adobo, sinigang and halo-halo across BGC\'s best local restaurants.', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', created_at: now, updated_at: now },
        { city_id: manilaId, name: 'National Museum of Fine Arts', category: 'culture', cost: 0.00, duration_minutes: 120, description: 'Neoclassical building housing the finest collection of Philippine art and artefacts.', image_url: 'https://images.unsplash.com/photo-1526299099370-40b27a9c7db1?w=400', created_at: now, updated_at: now },
      )
    }

    if (toInsert.length === 0) {
      console.log('All popular destination cities already have activities — nothing to insert.')
      return
    }

    await queryInterface.bulkInsert('activities', toInsert)
    console.log(`Inserted ${toInsert.length} activities for popular destinations.`)
  },

  down: async (queryInterface) => {
    const find = async (name, country) => {
      const [rows] = await queryInterface.sequelize.query(
        `SELECT id FROM cities WHERE name = :name AND country = :country LIMIT 1`,
        { replacements: { name, country } }
      )
      return rows[0]?.id || null
    }

    const ids = (await Promise.all([
      find('Jakarta', 'Indonesia'), find('Delhi', 'India'),
      find('Guangzhou', 'China'),   find('Mumbai', 'India'),
      find('Manila', 'Philippines'),
    ])).filter(Boolean)

    if (ids.length) {
      await queryInterface.bulkDelete('activities', { city_id: ids })
    }
  }
}
