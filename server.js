/**
 * Express server for serving static files and handling routes.
 * @module server
 */

const express = require("express");

const app = express();
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

/**
 * Route for serving the main.js file.
 * @name GET /js/main.js
 * @function
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get("/js/main.js", (req, res) => {
  res.sendFile(path.join(__dirname, "js", "main.js"));
});

/**
 * Route for serving the FruitTest20240401.csv file.
 * @name GET /FruitTest20240401.csv
 * @function
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get("/FruitTest20240401.csv", (req, res) => {
  res.sendFile(path.join(__dirname, "FruitTest20240401.csv"));
});

/**
 * Route for serving the index.html file.
 * @name GET /
 * @function
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;

/**
 * Start the server and listen on the specified port.
 * @name listen
 * @function
 * @param {number} port - The port number to listen on.
 * @param {Function} callback - The callback function to execute when the server starts listening.
 */
app.listen(PORT, console.log(`Server is listening on port ${PORT}`));
