const {
  KinesisClient,
  GetRecordsCommand,
  GetShardIteratorCommand,
  GetRecordsCommandOutput,
  _Record
} = require("@aws-sdk/client-kinesis");

const kinesisClient = new KinesisClient({
  endpoint: 'http://localhost:4566',
});

async function sleep(ms) {
  await new Promise((resolve, reject) => setTimeout(_ => resolve(), ms));
}

/**
 * Get the latest shard iterator from Kinesis
 * @returns {Promise<string>} shard iterator value
 */
async function getLatestShardIterator() {
  const command = new GetShardIteratorCommand({
    StreamName: 'Foo',
    ShardId: 'shardId-000000000000',
    ShardIteratorType: 'LATEST'
  });
  const response = await kinesisClient.send(command);
  return response.ShardIterator;
}

/**
 * Get records starting at the given iterator.
 * @param {string} shardIterator Iterator to start reading records from
 * @returns {Promise<GetRecordsCommandOutput>}
 */
async function getKinesisRecords(shardIterator) {
  const command = new GetRecordsCommand({
    ShardIterator: shardIterator
  });
  const response = await kinesisClient.send(command);
  return response;
}

/**
 * Process the given kinesis records
 * @param {_Record[]} records
 */
function processKinesisRecords(records) {
  for (const record of records) {
    console.log("read record!");
    const message = new TextDecoder('utf-8').decode(record.Data);
    console.log(message);
  }
}

async function runConsumerLoop() {
  let shardIterator = null;

  while (true) {
    if (!shardIterator) {
      shardIterator = await getLatestShardIterator();
    }
    const response = await getKinesisRecords(shardIterator);
    processKinesisRecords(response.Records);
    shardIterator = response.NextShardIterator;
    await sleep(1000);
  }
}

runConsumerLoop().then(_ => console.log('consumer done'));
