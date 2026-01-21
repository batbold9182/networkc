require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const axios = require("axios");
const Transaction = require("./models/Transaction");
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

const PORT = process.env.PORT || 3001;  
const JWT_SECRET = process.env.JWT_SECRET;


const server = app.listen(PORT, () => {
  log(`✅ Server listening on port ${PORT}`);
});

server.on("error", (err) => {
  log(`❌ Server error: ${err.message}`);
});

log("Connecting to MongoDB...");
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => log("✅ MongoDB connected"))
  .catch((err) => log(`❌ MongoDB error: ${err.message}`));


// Note: Do not execute DB writes at top-level during startup.
app.get("/api/ping", (req, res) => {
  res.json({ message: "pong" });
});

app.get("/", (req, res) => {
  res.send("Backend API is running");


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

// Withdraw PLN from balance
app.post("/api/user/withdraw", authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0)
      return res.status(400).json({ message: "Invalid amount" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.balance < amount)
      return res.status(400).json({ message: "Insufficient PLN balance" });

    user.balance -= amount;
    await user.save();

    res.json({ message: "Withdrawn successfully", balance: user.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// Sell route
app.post("/api/transaction/sell", authenticateToken, async (req, res) => {
  const { amountForeign, rate, code } = req.body;

  if (!amountForeign || !rate || !code) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  // Ensure the user has enough of the foreign currency before selling
  const walletEntry = user.wallet.find((c) => c.code === code);
  if (!walletEntry || walletEntry.amount < amountForeign) {
    return res.status(400).json({ message: `Insufficient ${code} to sell` });
  }
  walletEntry.amount -= amountForeign;

  const receivedPLN = amountForeign * rate;
  user.balance += receivedPLN;
  await user.save();

  // Record SELL transaction
  let transaction = null;
  try {
    transaction = await Transaction.create({
      userId: user._id,
      type: "SELL",
      fromCurrency: code,
      toCurrency: "PLN",
      amount: amountForeign,
      rate: rate,
    });
  } catch (e) {
    console.error("Failed to record transaction", e);
  }

  res.json({
    message: "Sell successful",
    newBalance: user.balance,
    receivedPLN,
    user: {
      id: user._id,
      email: user.email,
      balance: user.balance,
      wallet: user.wallet,
    },
    transaction,
  });
});

// Buy route
app.post("/api/transaction/buy", authenticateToken, async (req, res) => {
  const { amount, inputCode, targetCode } = req.body;

  if (!amount || !inputCode || !targetCode) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  // Get rates once when either side is not PLN
  let rates = [];
  if (inputCode !== "PLN" || targetCode !== "PLN") {
    try {
      const resRates = await axios.get("http://api.nbp.pl/api/exchangerates/tables/A/?format=json");
      rates = resRates.data[0].rates;
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch rates" });
    }
  }

  const getMid = (code) => {
    if (code === "PLN") return 1;
    const found = rates.find((r) => r.code === code);
    return found ? found.mid : null;
  };

  const inputMid = getMid(inputCode);
  if (inputMid === null) return res.status(404).json({ message: `Rate not found for ${inputCode}` });

  const targetMid = getMid(targetCode);
  if (targetMid === null) return res.status(404).json({ message: `Rate not found for ${targetCode}` });

  // Get input currency balance
  const inputBalance = inputCode === "PLN"
    ? user.balance
    : user.wallet.find((c) => c.code === inputCode)?.amount || 0;

  if (inputBalance < amount) {
    return res.status(400).json({ message: `Insufficient balance in ${inputCode}` });
  }

  // Convert input currency → PLN, then PLN → target currency using server-fetched mid rates
  const amountInPLN = amount * inputMid;
  const receivedTarget = amountInPLN / targetMid;

  // Deduct input currency
  if (inputCode === "PLN") {
    user.balance -= amount;
  } else {
    const walletItem = user.wallet.find((c) => c.code === inputCode);
    walletItem.amount -= amount;
  }

  // Add target currency
  if (targetCode === "PLN") {
    user.balance += receivedTarget;
  } else {
    const targetItem = user.wallet.find((c) => c.code === targetCode);
    if (targetItem) {
      targetItem.amount += receivedTarget;
    } else {
      user.wallet.push({ code: targetCode, amount: receivedTarget });
    }
  }

  await user.save();

  // Record transaction
  let transaction = null;
  try {
    transaction = await Transaction.create({
      userId: user._id,
      type: "BUY",
      fromCurrency: inputCode,
      toCurrency: targetCode,
      amount,
      rate: targetMid,
    });
  } catch (e) {
    console.error("Failed to record transaction", e);
  }

  res.json({
    message: "Buy successful",
    user: {
      id: user._id,
      email: user.email,
      balance: user.balance,
      wallet: user.wallet,
    },
    receivedTarget,
    transaction,
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

// Get transaction history (paginated)
app.get("/api/transactions", authenticateToken, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = parseInt(req.query.skip) || 0;

    const [items, total] = await Promise.all([
      Transaction.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments({ userId: req.user.id }),
    ]);

    res.json({ items, total, limit, skip });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});


