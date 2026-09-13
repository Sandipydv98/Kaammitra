const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Frontend folder serve karo
app.use(express.static(path.join(__dirname, "../frontend")));

// Temporary database
const requests = [];
const payments = [];

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "KaamMitra server chalu cha"
  });
});

// Naya kaam post
app.post("/api/requests", (req, res) => {
  const {
    name,
    service,
    description,
    location,
    budget
  } = req.body;

  if (
    !name ||
    !service ||
    !description ||
    !location ||
    !budget
  ) {
    return res.status(400).json({
      success: false,
      message: "कृपया सबै विवरण भर्नुहोस्।"
    });
  }

  const request = {
    id: Date.now(),
    name,
    service,
    description,
    location,
    budget: Number(budget),
    status: "open",
    createdAt: new Date().toISOString()
  };

  requests.push(request);

  res.status(201).json({
    success: true,
    message: "काम सफलतापूर्वक पोस्ट भयो।",
    request
  });
});

// सबै काम हेर्न
app.get("/api/requests", (req, res) => {
  res.json({
    success: true,
    requests
  });
});

// Payment हिसाब
app.post("/api/payments/calculate", (req, res) => {
  const amount = Number(req.body.amount);

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "सही रकम राख्नुहोस्।"
    });
  }

  const platformFee = Math.round(amount * 0.10);
  const helperPayout = amount - platformFee;

  res.json({
    success: true,
    customerPaid: amount,
    platformFee,
    helperPayout,
    ownerEarning: platformFee
  });
});

// Demo payment
app.post("/api/payments/demo", (req, res) => {
  const amount = Number(req.body.amount);

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "सही रकम राख्नुहोस्।"
    });
  }

  const platformFee = Math.round(amount * 0.10);
  const helperPayout = amount - platformFee;

  const payment = {
    id: Date.now(),
    customerPaid: amount,
    platformFee,
    helperPayout,
    status: "demo_success",
    createdAt: new Date().toISOString()
  };

  payments.push(payment);

  res.json({
    success: true,
    message: "Demo payment सफल भयो।",
    payment
  });
});

// Owner earning
app.get("/api/owner/earning", (req, res) => {
  const earning = payments.reduce(
    (total, payment) => total + payment.platformFee,
    0
  );

  res.json({
    success: true,
    ownerEarning: earning
  });
});

// Frontend fallback
app.get(/.*/, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../frontend/index.html")
  );
});

app.listen(PORT, () => {
  console.log(`KaamMitra server running on port ${PORT}`);
});
