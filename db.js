const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL; // sótt úr env gegnum dotenv pakka

async function select(){

 	const client = new Client({
 		connectionString,
	});

  	client.connect().catch( err => console.log(err) );

  try {
    const query = 'SELECT * FROM scores ORDER BY score DESC LIMIT 10';
    const res = await client.query(query);
	return res;
  } catch (err) {
    console.log(err);
  } finally {
    client.end();
  }
  client.end();
}


async function insert(name, score){

	const client = new Client({
 		connectionString,
	});

  	client.connect().catch( err => console.log(err) );

  try {
    const query = 'INSERT INTO scores (name, score) VALUES ($1, $2)';
    const res = await client.query(query, [name, score]);
    console.log(res.rows);
  } catch (err) {
    console.log(err);
  } finally {
    client.end();
  }
  client.end();
}



module.exports = { 
	insert,
	select 
};