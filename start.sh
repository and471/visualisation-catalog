#!/bin/bash

# Remove the tmp directory to avoid multiple running server clash
#  error on RVM
sudo rm -rf tmp

# Temproarily remove persistent data storage
#sudo rm -rf /data
sudo mkdir -p /data

# Copy all migrations to /data (persistent data storage)
#  - would not affect existing .sqlite3 files as it is not checked in on git
sudo cp -r db/migrate db/seeds.rb /data

# Start and run a docker container:
# - In background
# - With current folder mounted as /src folder in container VM
# - With /data (persistent storage) mounted as /src/db in container VM
# - Routing port 3123 within the container VM to host machine's port 3123
# - With name rails-app
# - Based on the rails image
sudo docker run -itd \
                -v $(pwd):/src \
                -v /data:/src/db \
                -p 3123:3123 \
                --name rails-app \
                rails

# Output the logs for the app
sudo docker logs rails-app
