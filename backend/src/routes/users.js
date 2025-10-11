const express = require('express');
const { User } = require('../schemas/User');
const { upload } = require('../middleware/upload');
const { auth } = require('../middleware/auth');

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

router.delete('/:id', async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json({ msg: 'User removed successfully' });
    } catch (e) {
        next(e);
    }
});

// Route to upload profile image
router.post('/:id/profile-image', auth, upload.single('profileImage'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'Please upload an image file' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check if user is updating their own profile or is an admin
        if (req.user.id !== req.params.id && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized to update this profile' });
        }

        // Update user profile image
        user.profileImage = `/uploads/profiles/${req.file.filename}`;
        await user.save();

        res.json({ 
            msg: 'Profile image uploaded successfully',
            profileImage: user.profileImage 
        });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
