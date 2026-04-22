#!/bin/sh
# Initialize data files if they don't exist

if [ ! -f /data/recipes.json ]; then
    echo "[]" > /data/recipes.json
    echo "Initialized recipes.json"
fi

if [ ! -f /data/comments.json ]; then
    echo "[]" > /data/comments.json
    echo "Initialized comments.json"
fi
