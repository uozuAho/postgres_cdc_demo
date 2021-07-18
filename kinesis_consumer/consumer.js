const {
  KinesisClient,
  GetRecordsCommand,
  GetShardIteratorCommand
} = require("@aws-sdk/client-kinesis");

const kinesisClient = new KinesisClient({
  endpoint: 'http://localhost:4566',
});

let shardIterator = null;

async function sleep(ms) {
  await new Promise((resolve, reject) => setTimeout(_ => resolve(), ms));
}

/**
 * Get the latest shard iterator from Kinesis
 * @returns {string} shard iterator value
 */
async function retrieveLatestShardIterator() {
  const command = new GetShardIteratorCommand({
    StreamName: 'Foo',
    ShardId: 'shardId-000000000000',
    ShardIteratorType: 'LATEST'
  });
  const response = await kinesisClient.send(command);
  return response.ShardIterator;
}

async function runConsumerLoop() {
  while (true) {
    if (!shardIterator) {
      shardIterator = await retrieveLatestShardIterator();
    }
    const command = new GetRecordsCommand({
      ShardIterator: shardIterator
    });
    const response = await kinesisClient.send(command);
    for (const record of response.Records) {
      console.log("read record!");
      console.log(record);
      shardIterator = response.NextShardIterator;
    }
    await sleep(1000);
  }
}

runConsumerLoop().then(_ => console.log('consumer done'));
