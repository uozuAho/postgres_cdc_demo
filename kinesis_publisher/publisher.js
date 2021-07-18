var LogicalReplication = require('pg-logical-replication');
const { KinesisClient, PutRecordCommand } = require("@aws-sdk/client-kinesis");

const DEBUG = true;

var truthDbConnection = {
  user: 'postgres',
  password: 'postgres',
  database: 'my_db'
};

const kinesisClient = new KinesisClient({
  endpoint: 'http://localhost:4566',
});

function printWalRecord(walRecord) {
  const record_obj = JSON.parse(walRecord);
  console.log(JSON.stringify(record_obj, null, 2));
}

/**
 * Encode a WAL record for placing onto a stream
 * @param {string} walRecord WAL output from wal2json
 * @returns
 */
function encode(walRecord) {
  return new TextEncoder('utf-8').encode(walRecord);
}

async function processWalRecord(record) {
  if (DEBUG) {
    console.log('writing record:');
    printWalRecord(record);
  }
  const message = encode(record);
  const command = new PutRecordCommand({
    PartitionKey: 'asdf',  // don't care about partitioning for this demo
    StreamName: 'Foo',
    Data: Buffer.from(message)
  });
  await kinesisClient.send(command);
}

var lastLsn = null;

var stream = (new LogicalReplication(truthDbConnection))
  .on('data', async function(msg) {
    lastLsn = msg.lsn || lastLsn;
    var log = (msg.log || '').toString('utf8');
    await processWalRecord(log);
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
