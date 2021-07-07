const { Client } = require('pg');

async function main() {
  const client = new Client({
    user: 'postgres',
    password: 'postgres',
    database: 'my_db'
  });
  await client.connect();
  const res = await client.query('SELECT $1::text as message', ['Hello world!']);
  console.log(res.rows[0].message);
  await client.end();
}

main()
  .then(_ => console.log('done'))
  .catch(e => {
    console.error('Unhandled exception:');
    console.error(e)
  });
