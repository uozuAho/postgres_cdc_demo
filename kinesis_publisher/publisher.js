var LogicalReplication = require('pg-logical-replication');
const { KinesisClient, AddTagsToStreamCommand } = require("@aws-sdk/client-kinesis");

var truthDbConnection = {
  user: 'postgres',
  password: 'postgres',
  database: 'my_db'
};

const kinesisClient = new KinesisClient({ region: "ap-southeast-2" });

async function processWalRecord(record) {
  const record_obj = JSON.parse(record);
  console.log(JSON.stringify(record_obj, null, 2));
  const params = {
    message: 'yo'
  };
  // nup, wrong command. how to send a message? PutRecordCommand?
  const command = new AddTagsToStreamCommand(params);
  const kResponse = await kinesisClient.send(command);
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
