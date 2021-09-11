// Import dependencies
const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");

// Set up express
const PORT = process.env.PORT || 3000;
const app = express();

// Set up morgan logs
app.use(logger("dev"));

// Use compression and sets up data parsing
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
app.use(express.static("public"));

// Set up mongoose connection
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost/budget',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  }
);

// Set up express routes
app.use(require("./routes"));

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});