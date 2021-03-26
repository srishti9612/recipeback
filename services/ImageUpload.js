const aws = require("aws-sdk")
const multer = require("multer")
const multerS3 = require("multer-s3")

const s3 = new aws.S3({
  signatureVersion: 'v4'
})

aws.config.update({
  secretAccessKey: process.env.S3_ACCESS_SECRET,
  accessKeyId: process.env.S3_ACCESS_KEY,
  region: "us-east-2"
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
     cb (null, true)
  } else {
    cb (new Error("Invalid file type, only JPEG and PNG is allowed"), false)
  }
}

const upload = multer({
  fileFilter,
  storage: multerS3({
    acl: "public-read",
    s3,
    bucket: "cookbook-food-pictures",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: "TESTING_METADATA"})
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString()) 
    },
  }),
})

module.exports = upload
