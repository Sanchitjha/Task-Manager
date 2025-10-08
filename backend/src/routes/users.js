const express = require('express');
const { User } = require('../schemas/User');

const router = express.Router();

// Route to get ALL users
router.get('/', async (_req, res, next) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (e) { next(e); }
});

// Route to get a SINGLE user by their ID
router.get('/:id', async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        
        res.json(user);
    } catch (e) {
        next(e);
    }
});



router.patch('/:id', async (req, res, next) => {
    try {
        
        const user = await User.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true } 
        ).select('-password');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user);
    } catch (e) {
        next(e);
    }
});


module.exports = router;