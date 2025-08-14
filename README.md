# Udyam Registration System

A comprehensive MSME (Micro, Small & Medium Enterprises) Registration Portal clone that replicates India's official Udyam Registration system. Built with modern web technologies including **Next.js**, **Express.js**, **PostgreSQL**, and **Prisma ORM**.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Validation Rules](#validation-rules)
- [Deployment](#deployment)

---

## Overview

This project is a full-stack web application that mimics the official Udyam Registration portal used by the Government of India for MSME registration. It provides a complete **6-step registration process** with comprehensive validation, duplicate prevention, and data management capabilities.

---

## Features

### Core Functionality

- **6-Step Registration Process** – Complete form workflow matching official portal
- **Real-time Form Validation** – Client-side and server-side validation
- **Aadhaar Integration** – Aadhaar number verification with OTP simulation
- **PAN Validation** – Real-time PAN format validation
- **Address Auto-fill** – PIN code-based city/state population
- **Duplicate Prevention** – Prevents duplicate Aadhaar and PAN registrations
- **Udyam ID Generation** – Automatic unique ID generation (`UDYAM-XXXXXXXX`)

### Technical Features

- **Responsive Design** – Mobile-first approach
- **Progressive Form** – Step-by-step data collection with validation
- **Data Persistence** – PostgreSQL database with Prisma ORM
- **RESTful API** – Well-structured backend API
- **Type Safety** – Full TypeScript implementation
- **Comprehensive Testing** – Unit, integration, and API tests

### Management Features

- **Application Listing** – View all submitted applications
- **Data Export** – Export applications as JSON
- **Real-time Statistics** – Application analytics
- **Error Handling** – Comprehensive error management

---

## Tech Stack

### Backend

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validation:** Zod
- **Testing:** Jest + Supertest
- **CORS:** express-cors

### Frontend

- **Framework:** Next.js 14 (React 18)
- **Language:** TypeScript
- **Styling:** CSS-in-JS
- **Form Handling:** React Hook Form
- **HTTP Client:** Fetch API

### Development Tools

- **Package Manager:** npm
- **Build Tool:** TypeScript Compiler
- **Development:** Nodemon
- **Code Quality:** ESLint + Prettier
- **Database Management:** Prisma Studio

---

## Project Structure

```
udyam-mimic-app/
├── backend/                     # Express.js API Server
│   ├── src/
│   │   ├── controllers/         # Request handlers
│   │   ├── services/            # Business logic
│   │   ├── routes/              # API routes
│   │   ├── validations/         # Zod schemas
│   │   ├── utils/               # Helper functions
│   │   └── index.ts             # App entry point
│   ├── tests/                   # Test files
│   │   ├── helpers/             # Test utilities
│   │   └── fixtures/            # Mock data
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/          # Database migrations
│   ├── package.json
│   ├── jest.config.js
│   ├── jest.setup.js
│   └── .env
├── frontend/                    # Next.js Frontend
│   ├── src/
│   │   ├── app/                 # Next.js 14 app router
│   │   ├── components/          # React components
│   │   └── services/            # API services
│   ├── public/
│   └── package.json
├── scrapping/                   # Data scraping utilities
├── .gitignore
└── README.md
```

## Prerequisites

Ensure you have the following installed:  
Node.js (v18.0.0 or higher)  
npm (v8.0.0 or higher)  
PostgreSQL (v12 or higher)  
Git

# Clone the repository

git clone https://github.com/Shreyyaa17/udyam-mimic-app.git
cd udyam-registration-system

# Install backend dependencies

cd backend
npm install

# Install frontend dependencies

cd ../frontend
npm install

## Environment Setup

# Backend Environment

Create backend/.env:  
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/myprojectdb"  
PORT=4000  
NODE_ENV=development  
FRONTEND_URL=http://localhost:3000

## Frontend Environment

Create frontend/.env.local:  
NEXT_PUBLIC_API_URL=http://localhost:4000/api  
NEXT_PUBLIC_APP_NAME=Udyam Registration Portal

## Database Setup

# Create PostgreSQL Database

createdb myprojectdb

# Generate Prisma Client

cd backend
npx prisma generate

# Push Database Schema

npx prisma db push

# Optional: Open Prisma Studio

npx prisma studio

Running the Application
Development Mode

# Start Backend

cd backend
npm run dev

# Server runs on: http://localhost:4000

# Start Frontend in new terminal

cd frontend
npm run dev

# App runs on: http://localhost:3000

Production Mode

# Build & Start Backend

cd backend
npm run build
npm start

# Build & Start Frontend

cd frontend
npm run build
npm start

## Testing

cd backend

# Run all tests

npm test

# Run specific test suites

npm run test:basic
npm run test:validation
npm run test:api
npm run test:integration

# Run with coverage

npm run test:coverage

# Run in watch mode

npm run test:watch

## Validation Rules

Field Validation Patterns  
Aadhaar: 12-digit numeric format  
PAN: ABCDE1234F (5 letters + 4 digits + 1 letter)  
Mobile: Indian mobile numbers starting with 6, 7, 8, or 9  
IFSC: Bank IFSC code format (e.g., SBIN0001234)  
Email: Standard email validation  
Pincode: 6-digit numeric format

## Business Rules

Aadhaar numbers must be unique across all registrations  
PAN numbers must be unique across all registrations  
Mobile numbers must follow Indian numbering standards  
All fields are required for successful registration

## D
