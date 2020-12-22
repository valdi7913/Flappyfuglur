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

async function update(name, score){
  const client = new Client({
    connectionString,
  });

  client.connect().catch( err => console.log(err) );

  try {
    const queryselect = 'SELECT * FROM "scores" WHERE name=$1 ORDER BY score DESC LIMIT 1';
    const resselect = await client.query(queryselect, [name]);
    if(resselect.rows.length > 0 && resselect.rows[0].score < score){
      try {
        const query = 'UPDATE scores SET score = $2 WHERE name = $1';
        const res = await client.query(query, [name, score]);
        console.log(res.rows);
      } catch (err) {
        console.log(err);
      } finally {
        client.end();
      }
    } else if (resselect.rows.length == 0){
      try {
        const query = 'INSERT INTO scores (name, score) VALUES ($1, $2)';
        const res = await client.query(query, [name, score]);
        console.log(res.rows);
      } catch (err) {
        console.log(err);
      } finally {
        client.end();
      }
    }
  } catch (err) {
    console.log(err);
  }

  client.end();
}


module.exports = { 
	insert,
	select,
  update
};