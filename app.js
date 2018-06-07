const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const fs = require('fs')
const multer = require('multer')
const fetch = require('node-fetch')

const multerMemStorage = multer.memoryStorage()
const multerDiskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "public", "images"))
      },
      filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + ".png")
      }
})
const upload = multer({ storage: multerMemStorage })

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.post("/api/v1/image", upload.single("blob"), (req, res) => {
    let buffer = req.file.buffer

    let url = "https://southcentralus.api.cognitive.microsoft.com/customvision/v2.0/Prediction/4f1dfce0-f5bb-493f-b87b-36a25ed20cd4/image"
    let fetchOptions = {
        method: "POST",
        headers: {
            "Prediction-Key": "23bdf2c2632c420dadf920e97fcc0760",
            "Content-Type": "application/octet-stream",
        },
        body: buffer
    }

    fetch(url, fetchOptions).then(r => r.json()).then(j => {
        let result = {
            predictions: [
                {
                    rocktype: j.predictions[0].tagName,
                    probability: j.predictions[0].probability
                },
                {
                    rocktype: j.predictions[1].tagName,
                    probability: j.predictions[1].probability
                }
            ]
        }
        res.json(result)
    })
})

module.exports = app;
