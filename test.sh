#!/bin/bash

# Remove the tmp directory to avoid multiple running server clash
#  error on RVM
sudo rm -rf tmp

# Copy all migrations to /data (persistent data storage)
#  - would not affect existing .sqlite3 files as it is not checked in on git
# Copy all source files to (new folder) - for mounting
sudo cp -r db/migrate db/seeds.rb /data

# Start and run a docker container:
# - With current folder mounted as /src folder in container VM
# - With /data (persistent storage) mounted as /src/db in container VM
# - Routing port 3123 within the container VM to host machine's port 3124
# - With name rails-app
# - Based on the rails image
# - With the command that runs the RSpec tests
sudo docker run -it \
                -v $(pwd):/src \
                -v /data:/src/db \
                --name rails-test \
                rails \
                '/bin/bash' \
                '-c' '-l' 'rake spec'

