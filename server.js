const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv');
  dotenv.config();
}
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();
const port = process.env.PORT || 5000;

// With this middleware we're saying node to process the properties of the body
// into an json
app.use(bodyParser.json());
// url strings that we're getting in & passing out doesn't contain spaces, symbols
//  or if they do then they are properly escaped
app.use(bodyParser.urlencoded({ extended: true }));

// Cross Origin Request, our web server is hosted from a origin (port=5000)
// our web client is hosted at different origin (port=3000) when our client makes a
// request to backend CORS does is that checks origin is same if it's different then it denies the request
// which is a safety server
// using this library it allows the request from different servers to be allowed
app.use(cors());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build ')));
  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(port, (error) => {
  if (error) throw error;
  console.log(`Server running on port - ${port}`);
});

app.post('/payment', (req, res, next) => {
  const body = {
    source: req.body.token.id,
    amount: req.body.amount,
    currency: 'inr',
  };

  stripe.charges.create(body, (stripeError, stripeRes) => {
    if (stripeError) {
      res.status(500).send({ error: stripeError });
    } else {
      res.status(200).send({ success: stripeRes });
    }
  });
});
