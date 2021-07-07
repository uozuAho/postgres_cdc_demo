var LogicalReplication = require('pg-logical-replication');

var truthDbConnection = {
  user: 'postgres',
  password: 'postgres',
  database: 'my_db'
};

function processWalRecord(record) {
  const record_obj = JSON.parse(record);
  console.log(JSON.stringify(record_obj, null, 2));
  // todo: output to kinesis here
}

var lastLsn = null;

var stream = (new LogicalReplication(truthDbConnection))
  .on('data', function(msg) {
    lastLsn = msg.lsn || lastLsn;
    var log = (msg.log || '').toString('utf8');
    processWalRecord(log);
  }).on('error', function(err) {
    console.error('Error processing replication data:');
    console.error(err);
    setTimeout(proc, 1000);
  });

(function proc() {
  stream.getChanges('test_slot', lastLsn, {
    includeXids: false,
    includeTimestamp: false,
  }, function(err) {
    if (err) {
      console.trace('Logical replication initialize error', err);
      setTimeout(proc, 1000);
    }
  });
})();
