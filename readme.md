# Postgres change data capture (CDC) using Kinesis

A demonstration of CDC usage - maintaining an up-to-date materialized view of a
document-oriented database. Uses postgres, wal2json, nodejs & kinesis.

Work in progress!

Change data capture (CDC) is a way to extract data changes from a system of
record in a streaming fashion. In this case, the system of record is postgres,
with a table that stores records in json document format. The changes will be
placed onto a kinesis stream, and processed by a derived data system - in this
case, another postgres database that maintains a materialized, tabular view of
the data in the system of record.


# todo
- ensure language is consistent. event, message, record
- consumer: write to db
- consumer: handle expired shard iterators
- investigate fault behaviour of each node, eg.
  - what happens when source db crashes/restarts. publisher? consumer? derived
    data DB?
- investigate load behaviour
  - what's the bottleneck?
  - how does the system behave when it is overloaded?
- how to handle schema changes?


# Quick start
Install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)

```sh
docker-compose build
docker-compose up -d
# check 'truth' db is up and schema has been created
docker exec db_truth psql -U postgres -d my_db -c 'select * from my_records;'
# create a logical replication slot
docker exec db_truth pg_recvlogical \
  -U postgres -d my_db --slot test_slot --create-slot -P wal2json
# create a kinesis stream (localstack may take some time to start. wait a bit.)
aws --endpoint-url=http://localhost:4566 kinesis create-stream --stream-name Foo --shard-count 1
# start the kinesis publisher
cd kinesis_publisher && npm start
# in another terminal, start the kinesis consumer (just prints to console at the moment)
cd kinesis_consumer && npm start
# in another terminal, insert a record
docker exec db_truth psql -U postgres -d my_db -c \
  'insert into my_records values ('\''{"name": "Warwick", "age": 3}'\'');'
# go back to the first terminal, and see the wal2json output!
```

Alternatives / tests
```sh
# start interactive psql session with 'truth' db
docker exec -it db_truth psql -U postgres -d my_db
# stream changes to stdout, pretty printed by wal2json (instead of kinesis publisher)
docker exec db_truth pg_recvlogical \
  -U postgres -d my_db --slot test_slot --start -o pretty-print=1 \
  -o add-msg-prefixes=wal2json -f -
```


# How it works
```
┌─────────────────────┐             ┌───────────────────┐
│                     │             │                   │
│ postgres 'truth db' │             │ kinesis publisher │
│ logical replication │             │ nodejs            │
│ enabled, using      ├─────────────►                   │
│ wal2json            │  replication│                   │
│                     │  stream     │                   │
└─────────────────────┘  (json)     └───────────────────┘
```


# References
- [debezium: logical decoding output plugin installation for postgres](https://debezium.io/documentation/reference/postgres-plugins.html)
- [debezium: example postgres docker image](https://github.com/debezium/docker-images/tree/master/postgres/9.6)
- [wal2json readme](https://github.com/eulerto/wal2json)
- [AWS blog post: stream changes from RDS to kinesis](https://aws.amazon.com/blogs/database/stream-changes-from-amazon-rds-for-postgresql-using-amazon-kinesis-data-streams-and-aws-lambda/)
