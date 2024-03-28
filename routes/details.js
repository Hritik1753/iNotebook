const express = require('express');
const router = express.Router();
var fetchuser = require('../middleware/fetchuser');
const Detail = require('../models/User-details');
const { body, validationResult } = require('express-validator');

//get all the notes using: Post "/api/auth/fetchallnotes"
router.get('/fetchuserdetail', fetchuser, async (req, res) => {

    // try {
    //     const userId = req.user.id;
    //     // const user = await User.find({ user: req.user.id });
    //     const user = await User.findById(userId).select("-password");
    //     res.json(user);
        
    // } catch (error) {
    //     console.error(error.message);
    //     res.status(500).send("internal server error occured");
    // }



    try {
        const details = await Detail.find({ user: req.user.id });
    res.json(details);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("internal Server Error");
    }
    
})


//route2  //add anew notes using: Post "/api/notes/addnotes" . login reqiured
router.post('/adddetail', fetchuser, [
    body('country', 'Country name is required').isLength({ min: 4 }),
], async (req, res) => {

      try {
    const {photo,Phone,address,country,links } = req.body;
    // if there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors:errors.array()});
    }
      

   
        const detail = new Detail({
            photo,Phone,address,country,links, user: req.user.id
        })

        const saveDetail = await detail.save();
        res.json(saveDetail);
        
    } catch (error) {
        console.log(error.message);
        res.status(500).send("internal Server Error");
    }

   
})

// Route3: Update an existing Note using: PUT "/api/notes/updatenote" .Login required
router.put('/updatedetail/:id', fetchuser, async (req, res) => {
    const { photo,Phone,address,country,links } = req.body;
    //Create a newNote object

    const newDetail = {};
    if (photo) { newDetail.photo = photo };
    if (Phone) { newDetail.Phone = Phone };
    if (address) { newDetail.address = address };
    if (country) { newDetail.country = country };
    if (links) { newDetail.links = links };
  
    //first authenticate the user that updating person is right user or not
    let detail = await Detail.findById(req.params.id);
    if (!detail) { return res.status(404).send("Not Found") }
    if (detail.user.toString() !== req.user.id) {
        return res.status(401).send("Not Allowed");
    }
    //find the note to be updated and update it
    detail = await Detail.findByIdAndUpdate(req.params.id, { $set: newDetail }, { new: true })
    res.json(detail);

})




module.exports = router;