# Postgres change data capture (CDC) using Kinesis

Change data capture (CDC) is a way to extract data changes from a data system in
a streaming fashion. In this case, the data system is postgres. The changes will
be placed onto a kinesis stream, and processed by a derived data system - in
this case, another postgres database that maintains a materialized view of data
in the first database.

# todo
- publish replication logs to kinesis
- error handling/monitoring
  - a replication slot stores all messages not read by a client. Create
    monitoring to show the size of the slot 'outbox'

# Quick start

```sh
docker-compose build
docker-compose up -d
# check 'truth' db is up and schema has been created
docker exec db_truth psql -U postgres -d my_db -c 'select * from my_records;'
# start interactive psql session with 'truth' db
docker exec -it db_truth psql -U postgres -d my_db
# create a logical replication slot
docker exec db_truth pg_recvlogical \
  -U postgres -d my_db --slot test_slot --create-slot -P wal2json
# stream changes to stdout, pretty printed by wal2json
docker exec db_truth pg_recvlogical \
  -U postgres -d my_db --slot test_slot --start -o pretty-print=1 \
  -o add-msg-prefixes=wal2json -f -
```

# References
- [debezium: logical decoding output plugin installation for postgres](https://debezium.io/documentation/reference/postgres-plugins.html)
- [debezium: example postgres docker image](https://github.com/debezium/docker-images/tree/master/postgres/9.6)
- [wal2json readme](https://github.com/eulerto/wal2json)
- [AWS blog post: stream changes from RDS to kinesis](https://aws.amazon.com/blogs/database/stream-changes-from-amazon-rds-for-postgresql-using-amazon-kinesis-data-streams-and-aws-lambda/)
