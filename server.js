const express = require("express");

const app = express();
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

app.get("/js/main.js", (req, res) => {
  res.sendFile(path.join(__dirname, "js", "main.js"));
});

app.get("/FruitTest20240401.csv", (req, res) => {
  res.sendFile(path.join(__dirname, "FruitTest20240401.csv"));
});

// Send HTML file at root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server is listening on port ${PORT}`));
