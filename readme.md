# Postgres change data capture (CDC) using Kinesis

Change data capture (CDC) is a way to extract data changes from a data system
in a streaming fashion. In this case, it's postgres. The changes will be placed
onto a kinesis stream, and processed by a derived data system - in this case,
another postgres database that maintains a materialized view of data in the
first database.

# Todo
- try to replicate example in [wal2json readme](https://github.com/eulerto/wal2json)


# Quick start

```sh
docker-compose up -d
# prove 'truth' db is up and schema has been created
docker exec db_truth psql -U postgres -d my_db -c 'select * from my_records;'
# start interactive psql session with 'truth' db
docker exec -it db_truth psql -U postgres -d my_db
```

# References
- [debezium: logical decoding output plugin installation for postgres](https://debezium.io/documentation/reference/postgres-plugins.html)
- [debezium: example postgres docker image](https://github.com/debezium/docker-images/tree/master/postgres/9.6)
- [wal2json readme](https://github.com/eulerto/wal2json)
- [AWS blog post: stream changes from RDS to kinesis](https://aws.amazon.com/blogs/database/stream-changes-from-amazon-rds-for-postgresql-using-amazon-kinesis-data-streams-and-aws-lambda/)
