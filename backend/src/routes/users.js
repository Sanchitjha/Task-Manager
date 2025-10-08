const express = require('express');
const { User } = require('../schemas/User');

const router = express.Router();

// This route handles getting ALL users
router.get('/', async (_req, res, next) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (e) { next(e); }
});


// This route handles getting a single user by their ID
router.get('/:id', async (req, res, next) => {
    try {
        // Find a user whose '_id' matches the 'id' from the URL
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            // If no user is found with that ID, send a 404 "Not Found" response
            return res.status(404).json({ msg: 'User not found' });
        }
        
        // If the user is found, send their data as a response
        res.json(user);
    } catch (e) {
        // Pass any other errors to your error handler
        next(e);
    }
});


module.exports = router;