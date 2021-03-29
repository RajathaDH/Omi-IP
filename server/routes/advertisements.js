const fs = require('fs');
const path = require('path');
const express = require('express');
const passport = require('passport');
const multer = require('multer');

const { checkAuthenticated, checkNotAuthenticated } = require('../config/auth');
const Advertisement = require('../models/Advertisement');

const router = express.Router();

const uploadPath = path.join('public', Advertisement.advertisementImageBasePath); // upload location of advertisement images

const imageMimeTypes = ['image/jpeg', 'image/png']; // accepted image types

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadPath);
    },
    filename: (req, file, callback) => {
        callback(null, file.fieldname + '-' + Date.now() + '.jpg');
    }
});
const upload = multer({
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype));
    },
    storage: storage
});


/* router.get('/advertisements', checkAuthenticated, async (req, res) => {
    try{
        const advertisements = await Advertisement.find({});

        res.render('advertisements', { advertisements: advertisements });
    } catch{
        res.render('/admins/advertisements', { advertisements: [] });
    }
}); */

// new advertisement
router.post('/new', checkAuthenticated, upload.single('advertisementImage'), async (req, res) => {
    const imageName = req.file != null ? req.file.filename : null;

    try{
        const advertisements = await Advertisement.find();
        
        let errors = [];

        if(req.body.title == '' || req.body.details == ''){
            errors.push({ msg: 'Please enter all the details.' });
        }

        if(errors.length > 0){
            if(imageName != null){
                removeAdvertisementImage(imageName);
            }

            return res.render('advertisements', { advertisements, errors });
        } else {
            const details = req.body.details.replace(/(?:\r\n|\r|\n)/g, '. ');

            const advertisement = new Advertisement({
                title: req.body.title,
                details: details,
                link: req.body.link,
                imageName
            });

            const newAdvertisement = await advertisement.save();

            res.redirect('/admins/advertisements');
        }
    } catch(err){
        if(imageName != null){
            removeAdvertisementImage(imageName);
        }

        res.redirect('/admins/advertisements');
    }
});