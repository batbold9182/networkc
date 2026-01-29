# NetworkC - Currency Converter App UML Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              REACT NATIVE / EXPO APP                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────┐     ┌─────────────────────────────────────────────────────┐    │
│  │   App.tsx   │────▶│                   _layout.tsx                        │    │
│  │  (Entry)    │     │              (RootLayout + AuthProvider)             │    │
│  └─────────────┘     └─────────────────────────────────────────────────────┘    │
│                                           │                                      │
│                                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                           NAVIGATION (Expo Router)                        │   │
│  │  ┌──────────────────────────────────────────────────────────────────┐    │   │
│  │  │                         Stack Navigator                           │    │   │
│  │  │  ┌──────────────┐ ┌──────────────┐ ┌────────────────────────┐    │    │   │
│  │  │  │ LoginScreen  │ │ SignUpScreen │ │      HomeScreen        │    │    │   │
│  │  │  │   (Auth)     │ │    (Auth)    │ │    (Dashboard)         │    │    │   │
│  │  │  └──────────────┘ └──────────────┘ └────────────────────────┘    │    │   │
│  │  │                                                                   │    │   │
│  │  │  ┌──────────────┐ ┌────────────────┐ ┌──────────────────────┐   │    │   │
│  │  │  │ WalletScreen │ │ConverterScreen │ │ HistoricalScreen     │   │    │   │
│  │  │  │(Buy/Sell/Bal)│ │  (Exchange)    │ │   (Rate Charts)      │   │    │   │
│  │  │  └──────────────┘ └────────────────┘ └──────────────────────┘   │    │   │
│  │  │                                                                   │    │   │
│  │  │  ┌────────────────┐ ┌────────────────────────────────────────┐   │    │   │
│  │  │  │ FundingScreen  │ │       TransactionsScreen               │   │    │   │
│  │  │  │ (Add PLN Bal)  │ │       (Transaction History)            │   │    │   │
│  │  │  └────────────────┘ └────────────────────────────────────────┘   │    │   │
│  │  └──────────────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTP/REST (Axios)
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              EXPRESS.JS BACKEND                                   │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                            API ENDPOINTS                                     │ │
│  │  ┌──────────────────────┐  ┌────────────────────┐  ┌─────────────────────┐  │ │
│  │  │   Authentication     │  │   User Management  │  │   Exchange Rates    │  │ │
│  │  │  POST /api/user/     │  │  GET  /api/user    │  │  GET /api/rates     │  │ │
│  │  │       register       │  │  POST /api/user/   │  │  GET /api/          │  │ │
│  │  │  POST /api/user/     │  │       fund         │  │   historical/:cur/  │  │ │
│  │  │       login          │  │  POST /api/user/   │  │   :start/:end       │  │ │
│  │  │                      │  │       withdraw     │  │                     │  │ │
│  │  └──────────────────────┘  └────────────────────┘  └─────────────────────┘  │ │
│  │                                                                              │ │
│  │  ┌──────────────────────────────────┐  ┌────────────────────────────────┐   │ │
│  │  │        Transactions              │  │         Middleware             │   │ │
│  │  │  POST /api/transaction/buy       │  │  ┌──────────────────────────┐  │   │ │
│  │  │  POST /api/transaction/sell      │  │  │   authenticateToken      │  │   │ │
│  │  │  GET  /api/transactions          │  │  │   (JWT Verification)     │  │   │ │
│  │  └──────────────────────────────────┘  │  └──────────────────────────┘  │   │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
                      │                                        │
                      │ MongoDB Driver                         │ HTTP Request
                      ▼                                        ▼
┌────────────────────────────────┐            ┌─────────────────────────────────────┐
│         MONGODB DATABASE       │            │        EXTERNAL API                 │
├────────────────────────────────┤            │    (NBP - National Bank of Poland)  │
│                                │            ├─────────────────────────────────────┤
│  ┌──────────────────────────┐  │            │  GET /api/exchangerates/tables/A    │
│  │       Users Collection   │  │            │  GET /api/exchangerates/rates/A/    │
│  │  - _id: ObjectId         │  │            │       {currency}/{start}/{end}      │
│  │  - email: String         │  │            └─────────────────────────────────────┘
│  │  - password: String(hash)│  │
│  │  - balance: Number       │  │
│  │  - wallet: [{            │  │
│  │      code: String,       │  │
│  │      amount: Number      │  │
│  │    }]                    │  │
│  └──────────────────────────┘  │
│                                │
│  ┌──────────────────────────┐  │
│  │  Transactions Collection │  │
│  │  - _id: ObjectId         │  │
│  │  - userId: ObjectId(ref) │  │
│  │  - type: "BUY"|"SELL"    │  │
│  │  - fromCurrency: String  │  │
│  │  - toCurrency: String    │  │
│  │  - amount: Number        │  │
│  │  - rate: Number          │  │
│  │  - createdAt: Date       │  │
│  └──────────────────────────┘  │
│                                │
│  ┌──────────────────────────┐  │
│  │    Rates Collection      │  │
│  │  - _id: ObjectId         │  │
│  │  - code: String          │  │
│  │  - currency: String      │  │
│  │  - mid: Number           │  │
│  └──────────────────────────┘  │
└────────────────────────────────┘
```

---

## Class Diagram (Data Models)

```
┌─────────────────────────────────┐
│             User                │
├─────────────────────────────────┤
│ - _id: ObjectId                 │
│ - email: String {required}      │
│ - password: String {required}   │
│ - balance: Number = 0           │
│ - wallet: WalletEntry[]         │
├─────────────────────────────────┤
│ + comparePassword(pwd): Boolean │
│ + pre("save"): hashPassword()   │
└─────────────────────────────────┘
              │ 1
              │
              │ owns
              │
              ▼ *
┌─────────────────────────────────┐
│         WalletEntry             │
├─────────────────────────────────┤
│ - code: String (USD, EUR...)    │
│ - amount: Number                │
└─────────────────────────────────┘

              │ 1
              │
              │ has many
              │
              ▼ *
┌─────────────────────────────────┐
│         Transaction             │
├─────────────────────────────────┤
│ - _id: ObjectId                 │
│ - userId: ObjectId {ref: User}  │
│ - type: Enum ["BUY", "SELL"]    │
│ - fromCurrency: String          │
│ - toCurrency: String            │
│ - amount: Number                │
│ - rate: Number                  │
│ - createdAt: Date               │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│            Rate                 │
├─────────────────────────────────┤
│ - _id: ObjectId                 │
│ - code: String {unique}         │
│ - currency: String              │
│ - mid: Number                   │
└─────────────────────────────────┘
```

---

## Component Diagram (React Native)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                               FRONTEND COMPONENTS                                 │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│   ┌─────────────────────────────────────────────────────────────────────────┐    │
│   │                        PROVIDERS / CONTEXT                               │    │
│   │   ┌──────────────────────────────────────────────────────────────────┐  │    │
│   │   │                    AuthProvider (auth.tsx)                        │  │    │
│   │   │  ┌────────────────────────────────────────────────────────────┐  │  │    │
│   │   │  │ State:                                                      │  │  │    │
│   │   │  │  - token: string | null                                     │  │  │    │
│   │   │  │  - user: User | null                                        │  │  │    │
│   │   │  │  - loading: boolean                                         │  │  │    │
│   │   │  │                                                             │  │  │    │
│   │   │  │ Methods:                                                    │  │  │    │
│   │   │  │  - signIn(token): Promise<void>                             │  │  │    │
│   │   │  │  - signOut(): Promise<void>                                 │  │  │    │
│   │   │  │  - setUser(): Dispatch                                      │  │  │    │
│   │   │  └────────────────────────────────────────────────────────────┘  │  │    │
│   │   └──────────────────────────────────────────────────────────────────┘  │    │
│   └─────────────────────────────────────────────────────────────────────────┘    │
│                                        │                                          │
│                                        │ useAuth()                                │
│                                        ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────────────┐    │
│   │                           SCREEN COMPONENTS                              │    │
│   │                                                                          │    │
│   │   ┌────────────────┐    ┌────────────────┐    ┌────────────────────┐    │    │
│   │   │  LoginScreen   │───▶│  SignUpScreen  │    │    HomeScreen      │    │    │
│   │   │  - email       │◀───│  - email       │───▶│  - user info       │    │    │
│   │   │  - password    │    │  - password    │    │  - navigation      │    │    │
│   │   │  - signIn()    │    │  - register()  │    │  - signOut()       │    │    │
│   │   └────────────────┘    └────────────────┘    └────────────────────┘    │    │
│   │          │                                            │                  │    │
│   │          │ authenticated                              ▼                  │    │
│   │          └────────────────────────────┬───────────────┘                  │    │
│   │                                       │                                  │    │
│   │   ┌────────────────┐    ┌────────────────┐    ┌────────────────────┐    │    │
│   │   │  WalletScreen  │    │ConverterScreen │    │HistoricalScreen    │    │    │
│   │   │  - rates[]     │    │  - rates[]     │    │  - currency        │    │    │
│   │   │  - buy()       │    │  - convert()   │    │  - dateRange       │    │    │
│   │   │  - sell()      │    │  - inputAmount │    │  - chartData       │    │    │
│   │   │  - balance     │    │  - targetCur   │    │  - fetchHistory()  │    │    │
│   │   └────────────────┘    └────────────────┘    └────────────────────┘    │    │
│   │                                                                          │    │
│   │   ┌────────────────┐    ┌─────────────────────────────────────────┐     │    │
│   │   │ FundingScreen  │    │        TransactionsScreen               │     │    │
│   │   │  - amount      │    │  - transactions[]                       │     │    │
│   │   │  - fund()      │    │  - fetchTransactions()                  │     │    │
│   │   │  - withdraw()  │    │  - pagination (limit, skip)             │     │    │
│   │   └────────────────┘    └─────────────────────────────────────────┘     │    │
│   └─────────────────────────────────────────────────────────────────────────┘    │
│                                        │                                          │
│                                        │ API Calls                                │
│                                        ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────────────┐    │
│   │                           API LAYER (api.ts)                             │    │
│   │   ┌─────────────────────────────────────────────────────────────────┐   │    │
│   │   │  useApi()                                                        │   │    │
│   │   │  - Returns axios instance with Authorization header              │   │    │
│   │   │                                                                  │   │    │
│   │   │  useTransactionsApi()                                            │   │    │
│   │   │  - list(params): GET /api/transactions                           │   │    │
│   │   │                                                                  │   │    │
│   │   │  sellCurrency(token, amountForeign, rate, code)                  │   │    │
│   │   │  - POST /api/transaction/sell                                    │   │    │
│   │   └─────────────────────────────────────────────────────────────────┘   │    │
│   └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## Sequence Diagram - User Authentication Flow

```
┌──────┐          ┌─────────────┐          ┌─────────┐          ┌─────────┐
│ User │          │ LoginScreen │          │ Backend │          │ MongoDB │
└──┬───┘          └──────┬──────┘          └────┬────┘          └────┬────┘
   │                     │                      │                    │
   │ Enter credentials   │                      │                    │
   │────────────────────▶│                      │                    │
   │                     │                      │                    │
   │                     │  POST /api/user/login│                    │
   │                     │─────────────────────▶│                    │
   │                     │                      │                    │
   │                     │                      │  findOne({email})  │
   │                     │                      │───────────────────▶│
   │                     │                      │                    │
   │                     │                      │     user data      │
   │                     │                      │◀───────────────────│
   │                     │                      │                    │
   │                     │                      │ comparePassword()  │
   │                     │                      │────────┐           │
   │                     │                      │        │           │
   │                     │                      │◀───────┘           │
   │                     │                      │                    │
   │                     │                      │ jwt.sign()         │
   │                     │                      │────────┐           │
   │                     │                      │        │           │
   │                     │                      │◀───────┘           │
   │                     │                      │                    │
   │                     │     { token }        │                    │
   │                     │◀─────────────────────│                    │
   │                     │                      │                    │
   │                     │  AuthContext.signIn()│                    │
   │                     │────────┐             │                    │
   │                     │        │ Store token │                    │
   │                     │◀───────┘ AsyncStorage│                    │
   │                     │                      │                    │
   │                     │  GET /api/user       │                    │
   │                     │─────────────────────▶│                    │
   │                     │                      │  findById()        │
   │                     │                      │───────────────────▶│
   │                     │                      │◀───────────────────│
   │                     │     { user }         │                    │
   │                     │◀─────────────────────│                    │
   │                     │                      │                    │
   │  Navigate to Home   │                      │                    │
   │◀────────────────────│                      │                    │
   │                     │                      │                    │
```

---

## Sequence Diagram - Buy Currency Flow

```
┌──────┐      ┌──────────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐
│ User │      │ WalletScreen │      │ api.ts  │      │ Backend │      │ MongoDB │
└──┬───┘      └──────┬───────┘      └────┬────┘      └────┬────┘      └────┬────┘
   │                 │                   │                │                │
   │ Enter amount,   │                   │                │                │
   │ select currency │                   │                │                │
   │────────────────▶│                   │                │                │
   │                 │                   │                │                │
   │ Press "Buy"     │                   │                │                │
   │────────────────▶│                   │                │                │
   │                 │                   │                │                │
   │                 │  POST /api/       │                │                │
   │                 │  transaction/buy  │                │                │
   │                 │──────────────────▶│                │                │
   │                 │                   │                │                │
   │                 │                   │  POST request  │                │
   │                 │                   │  with Bearer   │                │
   │                 │                   │───────────────▶│                │
   │                 │                   │                │                │
   │                 │                   │                │ authenticateToken
   │                 │                   │                │───────┐        │
   │                 │                   │                │       │verify  │
   │                 │                   │                │◀──────┘        │
   │                 │                   │                │                │
   │                 │                   │                │ findById(userId)
   │                 │                   │                │───────────────▶│
   │                 │                   │                │                │
   │                 │                   │                │   user data    │
   │                 │                   │                │◀───────────────│
   │                 │                   │                │                │
   │                 │                   │                │ Check balance  │
   │                 │                   │                │ Update wallet  │
   │                 │                   │                │ Deduct balance │
   │                 │                   │                │───────────────▶│
   │                 │                   │                │                │
   │                 │                   │                │ Create         │
   │                 │                   │                │ Transaction    │
   │                 │                   │                │───────────────▶│
   │                 │                   │                │                │
   │                 │                   │  { success,    │                │
   │                 │                   │    newBalance, │                │
   │                 │                   │    wallet }    │                │
   │                 │                   │◀───────────────│                │
   │                 │                   │                │                │
   │                 │   response        │                │                │
   │                 │◀──────────────────│                │                │
   │                 │                   │                │                │
   │                 │ setUser(updated)  │                │                │
   │                 │───────┐           │                │                │
   │                 │◀──────┘           │                │                │
   │                 │                   │                │                │
   │ Show updated    │                   │                │                │
   │ balance/wallet  │                   │                │                │
   │◀────────────────│                   │                │                │
```

---

## Use Case Diagram

```
                         ┌─────────────────────────────────────────────────┐
                         │            Currency Converter App               │
                         │                                                 │
    ┌──────────┐         │  ┌──────────────────────────────────────────┐  │
    │          │         │  │           Authentication                  │  │
    │          │         │  │  ┌────────────┐      ┌─────────────┐     │  │
    │          │─────────│──│──│  Register  │      │   Login     │     │  │
    │          │         │  │  └────────────┘      └─────────────┘     │  │
    │   User   │         │  │         ┌─────────────┐                  │  │
    │ (Actor)  │─────────│──│─────────│   Logout    │                  │  │
    │          │         │  └─────────└─────────────┘──────────────────┘  │
    │          │         │                                                 │
    │          │         │  ┌──────────────────────────────────────────┐  │
    │          │         │  │           Account Management              │  │
    │          │─────────│──│  ┌────────────────┐  ┌────────────────┐  │  │
    │          │         │  │  │  Fund Account  │  │    Withdraw    │  │  │
    │          │         │  │  │   (Add PLN)    │  │     (PLN)      │  │  │
    │          │         │  │  └────────────────┘  └────────────────┘  │  │
    │          │         │  │         ┌─────────────────┐              │  │
    │          │─────────│──│─────────│  View Balance   │              │  │
    │          │         │  └─────────└─────────────────┘──────────────┘  │
    │          │         │                                                 │
    │          │         │  ┌──────────────────────────────────────────┐  │
    │          │         │  │           Currency Exchange               │  │
    │          │         │  │  ┌────────────────┐  ┌────────────────┐  │  │
    │          │─────────│──│──│ Buy Currency   │  │ Sell Currency  │  │  │
    │          │         │  │  │ (PLN → Foreign)│  │ (Foreign→PLN)  │  │  │
    │          │         │  │  └────────────────┘  └────────────────┘  │  │
    │          │         │  │         ┌──────────────────┐             │  │
    │          │─────────│──│─────────│ Convert Currency │             │  │
    │          │         │  │         │   (Calculate)    │             │  │
    │          │         │  └─────────└──────────────────┘─────────────┘  │
    │          │         │                                                 │
    │          │         │  ┌──────────────────────────────────────────┐  │
    │          │         │  │           Information & History           │  │
    │          │         │  │  ┌──────────────────┐                    │  │
    │          │─────────│──│──│View Live Rates   │                    │  │
    │          │         │  │  │   (NBP API)      │                    │  │
    │          │         │  │  └──────────────────┘                    │  │
    │          │         │  │  ┌──────────────────┐                    │  │
    │          │─────────│──│──│View Historical   │                    │  │
    │          │         │  │  │     Rates        │                    │  │
    │          │         │  │  └──────────────────┘                    │  │
    │          │         │  │  ┌──────────────────┐                    │  │
    │          │─────────│──│──│View Transaction  │                    │  │
    │          │         │  │  │    History       │                    │  │
    └──────────┘         │  │  └──────────────────┘                    │  │
                         │  │         ┌──────────────────┐             │  │
                         │  │         │   View Wallet    │             │  │
    ┌──────────┐         │  │         │   (Holdings)     │             │  │
    │  NBP API │─ ─ ─ ─ ─│──│─ ─ ─ ─ ─└──────────────────┘─────────────┘  │
    │(External)│         │                                                 │
    └──────────┘         └─────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React Native, Expo, Expo Router |
| **State Management** | React Context (AuthProvider) |
| **HTTP Client** | Axios |
| **Storage** | AsyncStorage (mobile) / localStorage (web) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose |
| **Authentication** | JWT (JSON Web Tokens), bcrypt |
| **External API** | NBP (National Bank of Poland) Exchange Rates |

---

## File Structure Summary

```
networkc/
├── App.tsx                    # Entry point
├── api.ts                     # API hooks (useApi, useTransactionsApi)
├── auth.tsx                   # AuthProvider context
├── config.tsx                 # Backend URL configuration
├── app/
│   ├── _layout.tsx            # Root layout with navigation
│   └── screens/
│       ├── LoginScreen.tsx    # User login
│       ├── SignUpScreen.tsx   # User registration
│       ├── HomeScreen.tsx     # Main dashboard
│       ├── WalletScreen.tsx   # Buy/Sell currencies
│       ├── ConverterScreen.tsx# Currency conversion
│       ├── HistoricalScreen.tsx# Historical rates
│       ├── FundingScreen.tsx  # Add PLN balance
│       └── TransactionsScreen.tsx # Transaction history
├── server/
│   ├── server.js              # Express API server
│   └── models/
│       ├── User.js            # User model (Mongoose)
│       ├── Transaction.js     # Transaction model
│       └── Rate.js            # Rate model
└── styles/
    └── Styles.tsx             # Shared styles
```
