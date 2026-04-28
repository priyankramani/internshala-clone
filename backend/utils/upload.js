const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "public_space",
    resource_type: "auto", // supports image + video
  },
});

const upload = multer({ storage });

module.exports = upload;
