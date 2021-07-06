# Postgres change data capture (CDC) using Kinesis

```sh
docker-compose up -d
# prove 'truth' db is up and schema has been created
docker exec db_truth psql -U postgres -d my_db -c 'select * from my_records;'
# start interactive psql session with 'truth' db
docker exec -it db_truth psql -U postgres -d my_db
```
