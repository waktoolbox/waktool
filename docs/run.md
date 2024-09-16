# Install Flyctl
https://fly.io/docs/flyctl/install/

# Proxy DB
```
fly auth login
fly proxy 15432:5432 -a waktool-db
```

Then setup you localhost connection to postgres

# Local database 
```
docker run --name waktool-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=changeme -p 5432:5432 -d postgres:13
```