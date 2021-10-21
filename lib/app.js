const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');
const request = require('superagent');
const { editedYelpData, editedRandomWord } = require('./data-utils.js');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});


//pets route - to be updated later with auth
app.get('/api/pets', async(req, res) => {
  try {
    const data = await client.query('SELECT * from pets WHERE owner_id=$1', [req.userId]);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/pets', async(req, res) => {
  try {
    const data = await client.query('INSERT INTO pets (name, type, sign, owner_id) VALUES($1, $2, $3, $4) RETURNING *', [req.body.name, req.body.type, req.body.sign, req.userId]);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/pets/:id', async(req, res) => {
  try {
    const data = await client.query('DELETE from pets WHERE id=$1 AND owner_id=$2 RETURNING *', [req.params.id, req.userId]);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

//zodiac route that returns sign based on birthday
app.get('/sign', async(req, res) => {
  try {
  
    const birthday = req.query.date;
    const data = await request.get(`https://zodiac-sign.p.rapidapi.com/sign?date=${birthday}`)
      .set('x-rapidapi-host', 'zodiac-sign.p.rapidapi.com')
      .set('x-rapidapi-key'.replace(/\r?\n|\r/g, ''), process.env.ZODIAC_SIGNKEY.replace(/\r?\n|\r/g, ''));
    
    res.json(data.text);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

//aztro astrology api route that returns horoscope based on sign
app.post('/horoscope', async(req, res) => {
  try {
  
    const sign = req.query.sign;
    const data = await request.post(`https://aztro.sameerkumar.website/?sign=${sign}&day=today`);
    
    const returnedHoroscope = JSON.parse(data.text);
    res.json(returnedHoroscope);

  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

// yelp api route returns parks and relevant pet businesses based on user location
app.get('/yelp', async(req, res) => {
  try {
    const location = req.query.location;
    const categories = 'parks,petphotography,petadoption,groomer';
    const response = await request
      .get(`https://api.yelp.com/v3/businesses/search?location=${location}&categories=${categories}`)
      // .get(`https://api.yelp.com/v3/businesses/search?location=${location}`)
      .set('Authorization'.replace(/\r?\n|\r/g, ''), `Bearer ${process.env.YELP_KEY.replace(/\r?\n|\r/g, '')}`);
    
    const editedResponse = editedYelpData(response.body.businesses);
    res.json(editedResponse);
    // res.json(response.body.businesses);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/dailyquote', async(req, res) => {
  try {
    const response = await request
      .get('https://type.fit/api/quotes');
    
    const parsed = JSON.parse(response.text);
    res.json(parsed);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/randomwordlist', async(req, res) => {
  try {
    const response = await request
      .get('api.datamuse.com/words?topics=nature,adventure,toys,food,family&p=noun');
    

    const parse = JSON.parse(response.text);
    const editedResponse = editedRandomWord(parse);
    res.json(editedResponse);
    // res.json(response.body.businesses);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/pets/:id', async(req, res) => {
  try {
    const data = await client.query('UPDATE pets SET name=$1, sign=$2, type=$3 WHERE id=$4 AND owner_id=$5 RETURNING *', [req.body.name, req.body.sign, req.body.type, req.params.id, req.userId]);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
