const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ecommerce',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  },
});

const upload = multer({ storage });

const uploadToCloudinary = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'ecommerce',
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  });
  return result.secure_url;
};

const deleteFromCloudinary = async (url) => {
  if (!url) return;
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  const publicId = 'ecommerce/' + filename.split('.')[0];
  await cloudinary.uploader.destroy(publicId);
};

module.exports = { upload, uploadToCloudinary, deleteFromCloudinary };
