#!/bin/bash
set -e

# Initialize MySQL
service mysql start

# Wait for MySQL to be ready
until mysqladmin ping -h localhost --silent; do
    echo 'Waiting for MySQL to be ready...'
    sleep 2
done

# Create database and user
mysql -u root <<-EOSQL
    CREATE DATABASE IF NOT EXISTS examwizards;
    CREATE USER IF NOT EXISTS 'examport'@'%' IDENTIFIED BY 'examport123';
    GRANT ALL PRIVILEGES ON examwizards.* TO 'examport'@'%';
    FLUSH PRIVILEGES;
EOSQL

echo "MySQL initialization completed"
