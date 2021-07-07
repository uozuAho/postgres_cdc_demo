// const { Client } = require('pg');

// async function main() {
//   const client = new Client({
//     user: 'postgres',
//     password: 'postgres',
//     database: 'my_db'
//   });
//   await client.connect();
//   const res = await client.query('SELECT $1::text as message', ['Hello world!']);
//   console.log(res.rows[0].message);
//   await client.end();
// }

// main()
//   .then(_ => console.log('done'))
//   .catch(e => {
//     console.error('Unhandled exception:');
//     console.error(e)
//   });

var LogicalReplication = require('pg-logical-replication');
// var PluginTestDecoding = LogicalReplication.LoadPlugin('output/test_decoding');

//Connection parameter : https://github.com/brianc/node-postgres/wiki/Client#parameters
var connInfo = {
  user: 'postgres',
  password: 'postgres',
  database: 'my_db'
};

//Initialize with last LSN value
var lastLsn = null;

var stream = (new LogicalReplication(connInfo))
  .on('data', function(msg) {
    lastLsn = msg.lsn || lastLsn;

    var log = (msg.log || '').toString('utf8');
    try {
      console.log(log);
      //TODO: DO SOMETHING. eg) replicate to other dbms(pgsql, mysql, ...)
    } catch (e) {
      console.trace(log, e);
    }
  }).on('error', function(err) {
    console.trace('Error #2', err);
    setTimeout(proc, 1000);
  });

(function proc() {
  stream.getChanges('test_slot', lastLsn, {
    includeXids: false, //default: false
    includeTimestamp: false, //default: false
  }, function(err) {
    if (err) {
      console.trace('Logical replication initialize error', err);
      setTimeout(proc, 1000);
    }
  });
})();
