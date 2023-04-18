require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const cookieParser = require('cookie-parser');
const userRoute = require('./routes/userRoute');
const formRoute = require('./routes/formRoute');
const resourceRoute = require('./routes/resourceRoute');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://ezcompliance.vercel.app',
      'https://ezcomplaince-api.onrender.com',
    ],
    credentials: true,
  })
);

//Routes
app.use('/api/users', userRoute);
app.use('/api/forms', formRoute);
app.use('/api/resources', resourceRoute);

app.get('/', (req, res) => {
  res.send('Home Page');
});

//Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
mongoose.set('strictQuery', false);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
