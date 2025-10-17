#!/bin/bash

echo "Starting Angular 17 3PC Platform..."
cd /app/angular-frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  yarn install
fi

# Start the Angular development server
echo "Starting Angular development server on port 4200..."
ng serve --host 0.0.0.0 --port 4200 --poll=2000
