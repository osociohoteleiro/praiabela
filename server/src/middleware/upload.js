import multer from 'multer'

// Use memory storage for S3 upload
const storage = multer.memoryStorage()

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed image types
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  // Allowed video types
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime']

  const allAllowedTypes = [...allowedImageTypes, ...allowedVideoTypes]

  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Tipo de arquivo não permitido. Use apenas JPG, PNG, WEBP, MP4 ou WebM.'), false)
  }
}

// Image upload config (max 5MB)
export const uploadImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).single('image')

// Video upload config (max 100MB)
export const uploadVideo = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
}).single('video')

// Multiple images upload (max 10 files, 5MB each)
export const uploadMultipleImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10,
  },
}).array('images', 10)

export default { uploadImage, uploadVideo, uploadMultipleImages }
