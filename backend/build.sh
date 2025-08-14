#!/bin/bash
echo "Building backend..."
npm run build
echo "Generating Prisma client..."
npx prisma generate
echo "Build complete!"
