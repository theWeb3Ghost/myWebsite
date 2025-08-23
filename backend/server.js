const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const cartRoutes = require("./routes/cartRoutes.js");
const walletRoute = require("./routes/walletRoutes.js");
const addressRoutes = require("./routes/addressRoutes.js");
const mintRoutes = require("./routes/mintRoutes");




dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// === MongoDB connect ===
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ Mongo error:", err));

// === Routes ===
app.use("/api/cart", cartRoutes);
app.use("/api/wallet", walletRoute);

app.use("/api/addresses", addressRoutes);
app.use("/api/signup", mintRoutes);


const PORT = 4000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
