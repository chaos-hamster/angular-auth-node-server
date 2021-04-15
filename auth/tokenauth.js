const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const redis = require("redis");

// ----
// to start redis docker container run
// docker run -d --name redisDev -p 6379:6379 redis
// ----

const redisClient = redis.createClient();

redisClient.on("error", function(error) {
  console.error(error);
});

const generateToken = (res, id, firstname) => {
    const expiration = process.env.DB_ENV === 'testing' ? 30000 : 604800000;
    const token = jwt.sign(
                      { id, firstname },
                      process.env.JWT_SECRET,
                      {
                          expiresIn: process.env.DB_ENV === 'testing' ? '1d' : '7d',
                      });
  
    return res.cookie('token', token, {
      expires: new Date(Date.now() + expiration),
      secure: false, // set to true if your using https
      httpOnly: true,
    });
  };

  

const verifyToken = async (req, res, next) => {
  const invalid = (callback) => {
        redisClient.lrange('token', 0, 999999999, (err, result) => 
        callback(result));
    };

  try {
    const token = req.cookies.token || '';
    if (!token) {
      return res.status(401).json('You need to Login')
    }

    invalid(async (result) => {
        // check if token has been blacklisted
        console.log(result);
        if (result.indexOf(token) > -1) {
            return res.status(400).json({
                status: 400,
                error: 'Invalid Token',
                });
       }

       const decrypt = await jwt.verify(token, process.env.JWT_SECRET);
       req.user = {
            id: decrypt.id,
            firstname: decrypt.firstname,
        };
        next();
    });
  } catch (err) {
    return res.status(500).json(err.toString());
  }
};

const disableToken = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (token) {
            redisClient.LPUSH('token', token, (err) => {
                if (err) {
                    return res.status(500).json({
                        'status': 500,
                        'error': err,
                    });
                } 
            });
        }

        next();
    } catch (error) {
      return res.status(500).json({
        'status': 500,
        'error': error.toString(),
      });
    }
};

module.exports = {
    verifyToken: verifyToken,
    generateToken: generateToken,
    disableToken: disableToken
 };