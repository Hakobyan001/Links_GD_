const express = require("express")
const Api = require('./src/api/urls.api');
const cors = require('cors');

const app = express()

const PORT = process.env.PORT || 8080

app.use(express.json())

app.use('/api/v1', Api);

const allowedOrigins = ['https://app.linksguradian.io', 'https://www.app.linksguardian.io'];
app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

    app.listen(PORT, () => {
    console.log(`Server is connected on port ${PORT}`);
})


module.exports = app