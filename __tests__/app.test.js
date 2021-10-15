require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
    }, 10000);
  
    afterAll(done => {
      return client.end(done);
    });

    test('creates a pet', async() => {

      const expectation = [
        {
          id: expect.any(Number),
          name: 'Sparky',
          birthday: '2010-03-29',
          type: 'Dog',
          owner_id: expect.any(Number)
        }
      
      ];

      const data = await fakeRequest(app)
        .post('/api/pets')
        .send({
          name: 'Sparky',
          birthday: '2010-03-29',
          type: 'Dog',
          owner_id: expect.any(Number)
        })
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });


    test('returns pets', async() => {

      const expectation = {
        id: expect.any(Number),
        name: 'Sparky',
        birthday: '2010-03-29',
        type: 'Dog',
        owner_id: expect.any(Number)
      };

      const data = await fakeRequest(app)
        .get('/api/pets')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expect.arrayContaining([expectation]));
    });

    test('updates a pet', async() => {

      const expectation = {
        id: 2,
        name: 'Bob',
        birthday: '2010-03-29',
        type: 'Dog',
        owner_id: expect.any(Number)
      };

      const update = {
        name: 'Bob',
        birthday: '2010-03-29',
        type: 'Dog',
      };

      const data = await fakeRequest(app)
        .put('/api/pets/2')
        .send(update)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual([expectation]);
    });

    test('deletes a pet', async() => {

      const expectation = {
        id: 2,
        name: 'Bob',
        birthday: '2010-03-29',
        type: 'Dog',
        owner_id: expect.any(Number)
      };

      const data = await fakeRequest(app)
        .delete('/api/pets/2')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual([expectation]);
    });

    // test('returns sign', async() => {

    //   const expectation = 'Capricorn';

    //   const data = await fakeRequest(app)
    //     .get('/sign?date=2000-01-01')
    //     .expect('Content-Type', /json/)
    //     .expect(200);
      
    //   expect(JSON.parse(data.text)).toEqual(expectation);
    //   // expect(data.body).toEqual(expectation);
    // });

    test('returns horoscope', async() => {

      const expectation = {
        date_range: expect.any(String),
        current_date: expect.any(String),
        description: expect.any(String),
        compatibility: expect.any(String),
        mood: expect.any(String),
        color: expect.any(String),
        lucky_number: expect.any(String),
        lucky_time: expect.any(String),
      };

      const data = await fakeRequest(app)
        .post('/horoscope?sign=aries')
        // .send({ sign: 'aries' })
        .expect('Content-Type', /json/)
        .expect(200);
      const parsedData = JSON.parse(data.text);
      expect(parsedData).toEqual(expectation);

    });


  //KEEP THESE BELOW    
  });
});
