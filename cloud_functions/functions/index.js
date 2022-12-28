const functions = require("firebase-functions");
const express = require('express');
const app = express();
const cors = require('cors');
const productRoutes = require('./routes/product');

app.use(cors())


app.use(productRoutes);

app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || err.statusCode || 500).json({ message: err.message });
})


exports.app = functions.https.onRequest(app);