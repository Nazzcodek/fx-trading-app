# FX Wallet API Documentation

A robust API for managing foreign exchange transactions, currency conversions, and wallet operations.

## Table of Contents

- [Overview](#overview)
- [Setup Instructions](#setup-instructions)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [User Profile](#user-profile)
  - [Wallet Operations](#wallet-operations)
  - [Foreign Exchange](#foreign-exchange)
  - [Trading](#trading)
  - [Transactions](#transactions)
- [Example Workflows](#example-workflows)

## Overview

This API provides a complete solution for handling multi-currency wallets, foreign exchange operations, and trading between different currencies. The system supports user registration with email verification, secure authentication, wallet funding, currency conversion using real-time FX rates, and comprehensive transaction tracking.

## Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/fx-wallet-api.git
cd fx-wallet-api
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Configure environment variables:

```bash
cp .env.example .env.development
```

Edit the `.env.development` file with your database credentials and other configuration settings:

```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_NAME=fx_wallet

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=1d

# Email (for OTP verification)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=noreply@fxwallet.com
```

### Database Setup

1. Create a PostgreSQL database:

```sql
CREATE DATABASE fx_wallet;
```

2. Run migrations:

```bash
npm run migration:run
# or
yarn migration:run
```

### Running the Application

Start the development server:

```bash
npm run start:dev
# or
yarn start:dev
```

The API will be available at `http://localhost:3000`.

## API Reference

### Authentication

#### Register a new user

```
POST /auth/register
```

Creates a new user account and sends an OTP email for verification.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for verification code",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isVerified": false,
    "createdAt": "2023-05-15T10:30:00.000Z"
  }
}
```

#### Verify OTP and activate account

```
POST /auth/verify
```

Verifies the OTP sent via email and activates the user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isVerified": true
    }
  }
}
```

#### User login

```
POST /auth/login
```

Authenticates a user and returns an access token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

#### Resend verification code

```
POST /auth/resend-verification
```

Resends the verification OTP to the user's email.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Verification code sent to your email"
}
```

### User Profile

#### Get user profile

```
GET /users/profile
```

Retrieves the authenticated user's profile information.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isVerified": true,
    "createdAt": "2023-05-15T10:30:00.000Z",
    "updatedAt": "2023-05-15T10:35:00.000Z"
  }
}
```

#### Update user profile

```
PATCH /users/profile
```

Updates the authenticated user's profile information.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "firstName": "Jonathan",
  "lastName": "Doe"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "firstName": "Jonathan",
    "lastName": "Doe",
    "updatedAt": "2023-05-16T09:20:00.000Z"
  }
}
```

### Wallet Operations

#### Get user wallet balances

```
GET /wallet
```

Retrieves all wallet balances for the authenticated user.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "wallets": [
      {
        "id": "7d9f5e1c-8e4d-4a3b-b2c1-6d5f4e3c2b1a",
        "currency": "NGN",
        "balance": 50000.0,
        "updatedAt": "2023-05-16T09:20:00.000Z"
      },
      {
        "id": "8e0f6d2c-9f5e-5b4c-c3d2-7e6f5g4h3i2j",
        "currency": "USD",
        "balance": 100.0,
        "updatedAt": "2023-05-16T09:20:00.000Z"
      }
    ]
  }
}
```

#### Get wallet balance for specific currency

```
GET /wallet/:currency
```

Retrieves the wallet balance for a specific currency.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Parameters:**

- `currency` (string): The currency code (e.g., NGN, USD)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "7d9f5e1c-8e4d-4a3b-b2c1-6d5f4e3c2b1a",
    "currency": "NGN",
    "balance": 50000.0,
    "updatedAt": "2023-05-16T09:20:00.000Z"
  }
}
```

#### Fund wallet

```
POST /wallet/fund
```

Adds funds to a specified currency wallet.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "currency": "NGN",
  "amount": 10000.0,
  "paymentMethod": "card",
  "paymentReference": "pay_ref_123456789"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Wallet funded successfully",
  "data": {
    "wallet": {
      "id": "7d9f5e1c-8e4d-4a3b-b2c1-6d5f4e3c2b1a",
      "currency": "NGN",
      "balance": 60000.0,
      "updatedAt": "2023-05-16T10:15:00.000Z"
    },
    "transaction": {
      "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
      "type": "DEPOSIT",
      "status": "COMPLETED",
      "amount": 10000.0,
      "currency": "NGN",
      "reference": "TRX-123456789",
      "paymentMethod": "card",
      "paymentReference": "pay_ref_123456789",
      "createdAt": "2023-05-16T10:15:00.000Z"
    }
  }
}
```

#### Convert between currencies

```
POST /wallet/convert
```

Converts funds between different currencies using real-time FX rates.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "fromCurrency": "NGN",
  "toCurrency": "USD",
  "amount": 500000.0
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Currency converted successfully",
  "data": {
    "fromWallet": {
      "currency": "NGN",
      "previousBalance": 500000.0,
      "newBalance": 0.0
    },
    "toWallet": {
      "currency": "USD",
      "previousBalance": 100.0,
      "newBalance": 1100.0
    },
    "exchangeRate": 500.0,
    "transaction": {
      "id": "b2c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7",
      "type": "CONVERSION",
      "status": "COMPLETED",
      "amount": 500000.0,
      "fromCurrency": "NGN",
      "toCurrency": "USD",
      "convertedAmount": 1000.0,
      "exchangeRate": 500.0,
      "reference": "CNV-123456789",
      "createdAt": "2023-05-16T11:30:00.000Z"
    }
  }
}
```

### Foreign Exchange

#### Get exchange rate

```
GET /fx/rates/:baseCurrency/:targetCurrency
```

Retrieves the current exchange rate between two currencies.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Parameters:**

- `baseCurrency` (string): The base currency code (e.g., NGN)
- `targetCurrency` (string): The target currency code (e.g., USD)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "baseCurrency": "NGN",
    "targetCurrency": "USD",
    "rate": 0.002,
    "inverseRate": 500.0,
    "lastUpdated": "2023-05-16T11:00:00.000Z"
  }
}
```

#### Convert amount

```
POST /fx/convert
```

Calculates conversion amount without performing actual wallet conversion.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "fromCurrency": "NGN",
  "toCurrency": "USD",
  "amount": 50000.0
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "fromCurrency": "NGN",
    "toCurrency": "USD",
    "originalAmount": 50000.0,
    "convertedAmount": 100.0,
    "exchangeRate": 0.002,
    "inverseRate": 500.0
  }
}
```

#### Get supported currencies

```
GET /fx/currencies
```

Retrieves the list of supported currencies.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "currencies": [
      {
        "code": "NGN",
        "name": "Nigerian Naira",
        "symbol": "₦"
      },
      {
        "code": "USD",
        "name": "US Dollar",
        "symbol": "$"
      },
      {
        "code": "EUR",
        "name": "Euro",
        "symbol": "€"
      },
      {
        "code": "GBP",
        "name": "British Pound",
        "symbol": "£"
      }
    ]
  }
}
```

### Trading

#### Create a new trade

```
POST /trading
```

Creates a new trade between two currencies.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "from_currency": "ngn",
  "to_currency": "usd",
  "amount": 250000.0
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Trade executed successfully",
  "data": {
    "trade": {
      "id": "c3d4e5f6-g7h8-i9j0-k1l2-m3n4o5p6q7r8",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "fromCurrency": "NGN",
      "toCurrency": "USD",
      "amount": 250000.0,
      "convertedAmount": 500.0,
      "rate": 0.002,
      "status": "COMPLETED",
      "createdAt": "2023-05-16T14:45:00.000Z"
    },
    "wallets": {
      "from": {
        "currency": "NGN",
        "previousBalance": 300000.0,
        "newBalance": 50000.0
      },
      "to": {
        "currency": "USD",
        "previousBalance": 200.0,
        "newBalance": 700.0
      }
    }
  }
}
```

#### Get all user trades

```
GET /trading
```

Retrieves all trades for the authenticated user.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "trades": [
      {
        "id": "c3d4e5f6-g7h8-i9j0-k1l2-m3n4o5p6q7r8",
        "fromCurrency": "NGN",
        "toCurrency": "USD",
        "amount": 250000.0,
        "convertedAmount": 500.0,
        "rate": 0.002,
        "status": "COMPLETED",
        "createdAt": "2023-05-16T14:45:00.000Z"
      },
      {
        "id": "d4e5f6g7-h8i9-j0k1-l2m3-n4o5p6q7r8s9",
        "fromCurrency": "USD",
        "toCurrency": "NGN",
        "amount": 100.0,
        "convertedAmount": 50000.0,
        "rate": 500.0,
        "status": "COMPLETED",
        "createdAt": "2023-05-15T09:30:00.000Z"
      }
    ]
  }
}
```

#### Get specific trade

```
GET /trading/:id
```

Retrieves a specific trade by ID.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Parameters:**

- `id` (string): The trade ID

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "c3d4e5f6-g7h8-i9j0-k1l2-m3n4o5p6q7r8",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "fromCurrency": "NGN",
    "toCurrency": "USD",
    "amount": 250000.0,
    "convertedAmount": 500.0,
    "rate": 0.002,
    "status": "COMPLETED",
    "createdAt": "2023-05-16T14:45:00.000Z",
    "updatedAt": "2023-05-16T14:45:00.000Z"
  }
}
```

### Transactions

#### Get user transactions

```
GET /transactions
```

Retrieves transactions for the authenticated user with optional filtering.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Results per page (default: 10)
- `type` (string, optional): Filter by transaction type (DEPOSIT, WITHDRAWAL, CONVERSION, TRADE)
- `status` (string, optional): Filter by status (PENDING, COMPLETED, FAILED)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
        "type": "DEPOSIT",
        "status": "COMPLETED",
        "amount": 10000.0,
        "currency": "NGN",
        "reference": "TRX-123456789",
        "createdAt": "2023-05-16T10:15:00.000Z"
      },
      {
        "id": "b2c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7",
        "type": "CONVERSION",
        "status": "COMPLETED",
        "amount": 500000.0,
        "fromCurrency": "NGN",
        "toCurrency": "USD",
        "convertedAmount": 1000.0,
        "reference": "CNV-123456789",
        "createdAt": "2023-05-16T11:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 2,
      "totalPages": 1
    }
  }
}
```

#### Get transaction by ID

```
GET /transactions/:id
```

Retrieves a specific transaction by ID.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Parameters:**

- `id` (string): The transaction ID

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "type": "DEPOSIT",
    "status": "COMPLETED",
    "amount": 10000.0,
    "currency": "NGN",
    "reference": "TRX-123456789",
    "paymentMethod": "card",
    "paymentReference": "pay_ref_123456789",
    "createdAt": "2023-05-16T10:15:00.000Z",
    "updatedAt": "2023-05-16T10:15:00.000Z"
  }
}
```

## Example Workflows

### Registration and Login Flow

1. Register a new user account:

   ```
   POST /auth/register
   ```

2. Check email for OTP and verify account:

   ```
   POST /auth/verify
   ```

3. Login to get access token:
   ```
   POST /auth/login
   ```

### Currency Trading Flow

1. Fund your NGN wallet:

   ```
   POST /wallet/fund
   ```

2. Check current exchange rate:

   ```
   GET /fx/rates/NGN/USD
   ```

3. Execute a trade from NGN to USD:

   ```
   POST /trading
   ```

4. View your updated wallet balances:

   ```
   GET /wallet
   ```

5. Check transaction history:
   ```
   GET /transactions
   ```
