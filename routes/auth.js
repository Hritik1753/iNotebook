
const express = require('express');
require('dotenv').config();
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
//this is use for validation input
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');
const JWT_SECRET = process.env.SECRET;


const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    secure:true,
    host: 'smtp.gmail.com',
    port:465, // or any other email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    },
    debug: true,  // Add this line
    logger: true, // Add this line
});

const crypto = require('crypto');

//Route1
//create a user using:POST "/api/auth/" .Doesn't require login
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 })
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ success: false, error: "Sorry, a user with this email already exists" });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        user = new User({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
            verificationToken,
            isVerified: false
        });

        // Send verification email
        const verificationLink = `http://${req.headers.host}/api/auth/verify/${verificationToken}`;
        const mailOptions = {
            // from: process.env.EMAIL_USER,
            to: user.email, 
            subject: 'Email Verification',
            text: `Please verify your email by clicking the following link: ${verificationLink}`
        };
        try {
            // await sendMail(user.email, "this is checking", `please verify your email by clicking the following link: ${verificationLink}`);
            await transporter.sendMail(mailOptions);
            await user.save();
            res.json({ success: true, message: "Verification email sent. Please verify your email to complete the registration." });
        } catch (emailError) {
            console.error("Error sending verification email:", emailError.message);
            return res.status(500).json({ success: false, error: "Failed to send verification email. Please try again later." });
        }
      
    } catch (error) {
        console.error("Error in /createuser route:", error.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});





// next thing added

router.get('/verify/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // Find user by the verification token
        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({ success: false, error: "Invalid or expired verification link." });
        }

        // Mark the user as verified
        user.isVerified = true;
        user.verificationToken = null; // Clear the token after verification
        await user.save();

        res.json({ success: true, message: "Email verified successfully. You can now log in." });
    } catch (error) {
        console.error("Error in /verify route:", error.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});


// const fetchuser = require('../middleware/fetchuser');

const requireVerifiedEmail = async (req, res, next) => {
    try {
        const userId = req.user.id;  // Assuming fetchuser middleware adds user ID to req object
        const user = await User.findById(userId);
        
        if (!user.isVerified) {
            return res.status(403).json({ success: false, error: "Please verify your email to access this resource." });
        }

        next();
    } catch (error) {
        console.error("Error in email verification middleware:", error.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};



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
        
        // Check if user is verified
        if (!user.isVerified) {
            return res.status(401).json({ success: false, error: "Please verify your email before logging in." });
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

// //Route1
// //create a user using:POST "/api/auth/" .Doesn't require login
// router.post('/createuser', [
//     body('name','enter avalid name').isLength({ min: 3 }),
//     body('email','enter a valid email').isEmail(),
//     body('password','password must be atleast 5 character').isLength({min:5})
// ], async(req, res) => {
//     let success = false;
//     //from documentation of express validator
//     // if there are errors, return bad request and the errors
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({success,errors:errors.array()});
//     }
//     try {
// //check whether the user with this email exist already
//     let user = await User.findOne({ email: req.body.email });
//     if (user) {
//         return res.status(400).json({ success,error: "sorry user with this email is already exist" });
//         }
        
//         const salt = await bcrypt.genSalt(10);
//         //await uses for those function which return promises
//        const secPass = await bcrypt.hash(req.body.password,salt);
//         user = await User.create({
//             name: req.body.name,
//             email: req.body.email,
//             password: secPass,
        
//         })
//         const data = {
//             user: {
//                 id: user.id
//             }
//         }
//         const authtoken = jwt.sign(data, JWT_SECRET);

//         success = true;
//         res.json({success, authtoken });
//         // res.json(user);
//         // res.json({ "msg": "your account is succesfully created" });
//     }
//     catch (error) {
//         console.error(error.message);
//         res.status(500).send("Some error occured");
//     }
       
  
// })


// //Route2
// //Authenticate the user using Post "/api/auth/login" .No login required
// router.post('/login', [
//     body('email','enter a valid email').isEmail(),
//     body('password','password can not be blank').exists(),
// ], async (req, res) => {
//     let success = false;
//     //from documentation of express validator
//     // if there are errors, return bad request and the errors
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({errors:errors.array()});
//     }

//     const { email, password } = req.body;

//     try {
//         let user = await User.findOne({ email });
//         if (!user) {
//             success = false;
//             return res.status(400).json({ error: "try to login with correct credentils user not matched" });
//         }
//         const passwordCompare = await bcrypt.compare(password, user.password);
//         if (!passwordCompare) {
//             success = false;
//             return res.status(400).json({ success,error: "try to login with correct credentils password not matched" });
//         }

//         const data = {
//             user: {
//                 id:user.id
//             }
//         }
//         const authtoken = jwt.sign(data, JWT_SECRET);
//         success = true;
//         res.json({ success,authtoken });

//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send("internal server error occured");
//     }

// })

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