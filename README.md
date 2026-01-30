# NetworkC – Mobile Currency Converter

## 📌 Overview
NetworkC is a mobile currency exchange application built with React Native and Express.js.
It allows users to exchange currencies using real-time data from the National Bank of Poland API.

## 🚀 Features
- User authentication (JWT)
- Real-time exchange rates
- Buy and sell currencies
- Digital wallet
- Transaction history
- Historical rate charts

## 🏗 System Architecture
- Mobile App: React Native + Expo
- Backend API: Node.js + Express
- Database: MongoDB
- External API: NBP

## 📐 UML Diagrams
- Use Case Diagram
- Class Diagram
- Sequence Diagrams: User authentication flow, Buy currency flow

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React Native, Expo, Expo Router |
| **State Management** | React Context (AuthProvider) |
| **HTTP Client** | Axios |
| **Storage** | AsyncStorage |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose |
| **Authentication** | JWT (JSON Web Tokens), bcrypt |
| **External API** | NBP (National Bank of Poland) Exchange Rates |

## 🔐 Security
- JWT authentication
- Password hashing with bcrypt
- HTTPS communication recommended for production

## 📡 Networking Aspects
- REST API communication between frontend and backend
- Integration with NBP external API for real-time exchange rates
- Error handling and caching for network reliability

## 🧪 How to Run

### Frontend
```bash
cd networkc
npm install
npm start

