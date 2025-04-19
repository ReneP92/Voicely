#!/usr/bin/env bash

host="${1:-127.0.0.1}"  # Default to 127.0.0.1 if no argument provided
shift
cmd="$@"

until mysqladmin ping -h "$host" -u root -prootpassword ; do
  >&2 echo "MySQL is unavailable - sleeping"
  sleep 1
done

>&2 echo "MySQL is up - executing command"
exec $cmd