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

async function runConsumerLoop() {
  while (true) {
    if (!shardIterator) {
      const command = new GetShardIteratorCommand({
        StreamName: 'Foo',
        ShardId: 'shardId-000000000000',
        ShardIteratorType: 'LATEST'
      });
      const response = await kinesisClient.send(command);
      shardIterator = response.ShardIterator;
    }
    const command = new GetRecordsCommand({
      ShardIterator: shardIterator
    });
    const response = await kinesisClient.send(command);
    for (const record of response.Records) {
      console.log("read record!");
      console.log(record);
    }
    await sleep(1000);
    // console.log('moo');
  }
}

runConsumerLoop().then(_ => console.log('consumer done'));
