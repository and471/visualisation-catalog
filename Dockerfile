# Script for creating a Rails (+dependencies) Docker image

# Based on ubuntu latest (14.04) distribution
FROM ubuntu:14.04

# Update packages and install git, curl and libkrb5-dev
RUN apt-get update
RUN apt-get --yes --force-yes install git
RUN apt-get --yes --force-yes install curl
RUN apt-get --yes install libkrb5-dev
RUN  apt-get --yes install imagemagick libmagickwand-dev



# Obtain public key for RVM, then pull and install RVM via curl
RUN gpg --keyserver hkp://keys.gnupg.net --recv-keys D39DC0E3
RUN curl -SL1 https://get.rvm.io | bash -s stable --ruby=2.1.4

# Docker runs dash by default, specify /bin/bash -c -l
#  to run bash-only commands ---

# Use RVM by specifying the source address (suggested by RVM install msg)
# N.B. address different from that on installLocalRails.sh
RUN /bin/bash -c -l 'source /usr/local/rvm/scripts/rvm'

# Install gems for rails and bundler (save time by not installing ri and rdoc)
RUN /bin/bash -c -l 'gem install --no-ri --no-rdoc rails'
RUN /bin/bash -c -l 'gem install --no-ri --no-rdoc bundler'

# Copy the project on a temp folder (in the VM container)
#  and perform bundle install on there temporarily
ADD . /tmp/rails
WORKDIR /tmp/rails

# Install the rest of the gems specified in Gemfile
RUN /bin/bash -c -l 'bundle install'

# Specify the work directory we would like to mount our source files on
WORKDIR /src

# Expose port (port no.) for external connection
EXPOSE 3123

# Default start-up command (if not specified in 'docker run')
CMD /bin/bash -c -l 'rake db:migrate && rake db:seed && rails server -p 3123' 
