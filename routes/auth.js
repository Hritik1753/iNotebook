const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
//this is use for validation input
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');
const JWT_SECRET = 'Hritikrajkarega';

//Route1
//create a user using:POST "/api/auth/" .Doesn't require login
router.post('/createuser', [
    body('name','enter avalid name').isLength({ min: 3 }),
    body('email','enter a valid email').isEmail(),
    body('password','password must be atleast 5 character').isLength({min:5})
], async(req, res) => {
    let success = false;
    //from documentation of express validator
    // if there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success,errors:errors.array()});
    }
    try {
//check whether the user with this email exist already
    let user = await User.findOne({ email: req.body.email });
    if (user) {
        return res.status(400).json({ success,error: "sorry user with this email is already exist" });
        }
        
        const salt = await bcrypt.genSalt(10);
        //await uses for those function which return promises
       const secPass = await bcrypt.hash(req.body.password,salt);
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        
        })
        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);

        success = true;
        res.json({success, authtoken });
        // res.json(user);
        // res.json({ "msg": "your account is succesfully created" });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }
       
    //    .then(user => res.json(user))
    //     .catch(err => {
    //         console.log(err)
    //         res.json({ error: 'user already exist with this email id' });
    //     })

    // res.send(req.body);
    // console.log(req.body);
    // const user = User(req.body);
    // user.save();
    // res.send(req.body);
})


//Route2
//Authenticate the user using Post "/api/auth/login" .No login required
router.post('/login', [
    body('email','enter a valid email').isEmail(),
    body('password','password can not be blank').exists(),
], async (req, res) => {
    let success = false;
    //from documentation of express validator
    // if there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors:errors.array()});
    }

    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            success = false;
            return res.status(400).json({ error: "try to login with correct credentils user not matched" });
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            success = false;
            return res.status(400).json({ success,error: "try to login with correct credentils password not matched" });
        }

        const data = {
            user: {
                id:user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success,authtoken });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal server error occured");
    }

})

//Route3
//get loggedin User Details using Post "/api/auth/getuser". Login required
router.get('/getuser',fetchuser, async (req, res) => {

    try {
        const userId = req.user.id;
        // const user = await User.find({ user: req.user.id });
        const user = await User.findById(userId).select("-password");
        res.json(user);
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal server error occured");
    }
})


module.exports = router;