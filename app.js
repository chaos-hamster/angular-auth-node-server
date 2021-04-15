const express = require('express');
const apiRoutes = require('./routes/api-routes');
const cors = require('cors');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const app = express();

// allow cross-origin requests
var corsOptions = {
    origin: 'http://localhost:4200',
    credentials: true };

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());       // to support JSON-encoded bodies
////app.use(express.urlencoded()); // to support URL-encoded bodies

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
