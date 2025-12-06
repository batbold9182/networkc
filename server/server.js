
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const axios = require("axios");
const Rate = require("./models/Rate"); // backend Mongoose model for exchange rates

const log = (msg) => {
  console.log(msg);
  console.error(msg);
};

log("Starting server...");

const app = express();

const corsOptions = {
  origin: "*", // allow all origins (for LAN testing)
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());


log("Express configured");

const PORT = 3001;  

const server = app.listen(PORT, () => {
  log(`✅ Server listening on port ${PORT}`);
});

server.on("error", (err) => {
  log(`❌ Server error: ${err.message}`);
});

log("Connecting to MongoDB...");
mongoose
  .connect("mongodb://127.0.0.1:27017/networkc")
  .then(() => log("✅ MongoDB connected"))
  .catch((err) => log(`❌ MongoDB error: ${err.message}`));

const JWT_SECRET = "your_secret_key_here";

// Add this **before** all other routes
app.get("/api/ping", (req, res) => {
  res.json({ message: "pong" });
});

app.get("/", (req, res) => {
  res.send("🔥 Backend API is running! 🔥1111");


});
app.get("/api/rates", async (req, res) => {
  try {
    const response = await axios.get("http://api.nbp.pl/api/exchangerates/tables/A/?format=json");
    const rates = response.data[0].rates;
    res.json(rates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch exchange rates" });
  }
});
// Historical rates: GET /api/historical/:currency/:start/:end
app.get("/api/historical/:currency/:start/:end", async (req, res) => {
  const { currency, start, end } = req.params;

  try {
    // NBP API: https://api.nbp.pl/api/exchangerates/rates/A/USD/2025-12-01/2025-12-06/?format=json
    const url = `https://api.nbp.pl/api/exchangerates/rates/A/${currency}/${start}/${end}/?format=json`;
    const response = await axios.get(url);

    if (!response.data || !response.data.rates) {
      return res.status(404).json({ message: "No historical rates found" });
    }

    res.json(response.data.rates); // Send only the rates array
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch historical rates" });
  }
});


// Register route
app.post("/api/user/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    
    if (existingUser)
      return res.status(400).json({ message: "Email already in use" });

    const user = new User({ email, password });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login route
app.post("/api/user/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const validPassword = await user.comparePassword(password);
  if (!validPassword)
    return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });
  res.json({ token });
});
// Add virtual account funding
app.post("/api/user/fund", authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0)
      return res.status(400).json({ message: "Invalid amount" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.balance += amount; // Add funds
    await user.save();

    res.json({ message: "Account funded successfully", balance: user.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// Buy route- AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
app.post("/api/transaction/buy", authenticateToken, async (req, res) => {
  const { amount, inputCode, targetCode, rate } = req.body;

  if (!amount || !inputCode || !targetCode || !rate) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  // Get input currency balance
  let inputBalance = inputCode === "PLN"
    ? user.balance
    : user.wallet.find(c => c.code === inputCode)?.amount || 0;

  if (inputBalance < amount) {
    return res.status(400).json({ message: `Insufficient balance in ${inputCode}` });
  }

  // Convert input currency → PLN
  let amountInPLN = 0;
  if (inputCode === "PLN") {
    amountInPLN = amount;
  } else {
    try {
      const resRates = await axios.get("http://api.nbp.pl/api/exchangerates/tables/A/?format=json");
      const rates = resRates.data[0].rates;
      const inputRate = rates.find(r => r.code === inputCode);
      if (!inputRate) return res.status(404).json({ message: `Rate not found for ${inputCode}` });
      amountInPLN = amount * inputRate.mid;
    } catch (err) {
      return res.status(500).json({ message: "Failed to fetch rates" });
    }
  }

  // Convert PLN → target currency
  const receivedTarget = targetCode === "PLN" ? amountInPLN : amountInPLN / rate;

  // Deduct input currency
  if (inputCode === "PLN") {
    user.balance -= amount;
  } else {
    const walletItem = user.wallet.find(c => c.code === inputCode);
    walletItem.amount -= amount;
  }

  // Add target currency
  if (targetCode === "PLN") {
    user.balance += receivedTarget;
  } else {
    const targetItem = user.wallet.find(c => c.code === targetCode);
    if (targetItem) {
      targetItem.amount += receivedTarget;
    } else {
      user.wallet.push({ code: targetCode, amount: receivedTarget });
    }
  }

  await user.save();

  res.json({
    message: "Buy successful",
    user: {
      id: user._id,
      email: user.email,
      balance: user.balance,
      wallet: user.wallet,
    },
    receivedTarget,
  });
});



// Sell route
app.post("/api/transaction/sell" , async (req, res) => {
  const { amountForeign, rate } = req.body;

  if (!amountForeign || !rate) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const receivedPLN = amountForeign * rate;

  const user = req.user;
  user.balance += receivedPLN;
  await user.save();

  res.json({
    message: "Sell successful",
    newBalance: user.balance,
    receivedPLN,
  });
});


// Middleware to verify token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Missing token" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
}


// Protected route: get user info
app.get("/api/user", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.error(err);
  }

});


