const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const fs = require('fs')
const multer = require('multer')
const upload = multer({ dest: 'public/' })

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.post("/api/v1/image", upload.single("img"), (req, res) => {
    let imgDataURL = req.body

    let regex = "/^data:.+\/(.+);base64,(.*)$/";

    let matches = imgDataURL.match(regex);
    var ext = matches[1];
    var data = matches[2];
    var buffer = new Buffer(data, 'base64');
    fs.writeFileSync('data.' + ext, buffer);
})

module.exports = app;
