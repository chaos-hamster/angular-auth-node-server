const router = require('express').Router();
const { verifyToken, generateToken, disableToken } = require('../auth/tokenauth');

router.post('/register', (req, res) => {
    res.send({
        result:  'ok'
    });
});

const login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        await generateToken(res, '123456', 'Mark');
        res.send({
            result:  'ok'
        });
    } catch (err) {
        return res.status(500).json(err.toString());
    }
}

router.post('/login', login);

router.get('/user', verifyToken, (req,res) => res.send(req.user));

const logout = async (req, res) => {
  return res.status(200).json({
    'status': 200,
    'data': 'You are logged out',
  });
  }


router.post('/logout', disableToken, logout);

module.exports = router;