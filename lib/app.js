const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');
const request = require('superagent');

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
app.get('/pets', async(req, res) => {
  try {
    const data = await client.query('SELECT * from pets');
    
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
      .set('X-RapidAPI-Host', 'zodiac-sign.p.rapidapi.com')
      // .set('Accept', 'application/json')
      .set('X-RapidAPI-Key', `${process.env.ZODIAC_SIGNKEY}`);
    
    // const returnedSign = JSON.parse(data.text);
    res.json(data.text);
    // res.json(data.body);
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
    // res.json(data.body);
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
      .set('Authorization', `Bearer ${process.env.YELP_KEY}`);
    
    // const editedResponse = editedYelpData(response.body.businesses);
    // res.json(editedResponse);
    res.json(response.body.businesses);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});



app.use(require('./middleware/error'));

module.exports = app;
