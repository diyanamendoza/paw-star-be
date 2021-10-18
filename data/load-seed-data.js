const bcrypt = require('bcryptjs');
const client = require('../lib/client');
// import our seed data:
const pets = require('./pets.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');
run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        const hash = bcrypt.hashSync(user.password, 8);
        return client.query(`
                      INSERT INTO users (email, hash, sign, zipcode)
                      VALUES ($1, $2, $3, $4)
                      RETURNING *;
                  `,
        [user.email, hash, user.sign, user.zipcode]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      pets.map(pet => {
        return client.query(`
                    INSERT INTO pets (name, sign, type, owner_id)
                    VALUES ($1, $2, $3, $4);
                `,
        [pet.name, pet.sign, pet.type, user.id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
