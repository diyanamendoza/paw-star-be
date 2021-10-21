The name of the project
Paw-Star

Names of the team members
Katie, Diyana, Elijah, Sarani

A description of the project
This project connects multple third party API's to provide our front-end with the access to retrieving a user's/pet's sign and horoscope. 

A list of any libraries, frameworks, or packages that your application requires in order to properly function:
Node.js, Postgres, Heroku, bcryptjs, cors, dotenv, express, jsonwebtoken, morgan, pg, superagent,

Clearly defined API endpoints with sample responses:
endpoint: get('/api/pets') 
response: 
 [
    {id: 12, name: 'Cutie ', sign: 'Gemini', type: 'dog', owner_id: 7}, 
    {id: 13, name: 'Patootie ', sign: 'Aries', type: 'cat', owner_id: 7} 
 ]



endpoint: post('/api/pets'').send({id: 14, name: 'Spooky ', sign: 'Taurus', type: 'cat', owner_id: 7})
response:  
     {id: 14, name: 'Spooky ', sign: 'Taurus', type: 'cat', owner_id: 7}
 
endpoint: delete('/api/pets/:id') 
response:  
{}

endpoint: post('/horoscope') 
response:   

endpoint: get('/yelp') 
response:   

endpoint: get('/dailyquote') 
response:   

endpoint: get('/randomwordlist') 
response:   

   


Clearly defined database schemas: