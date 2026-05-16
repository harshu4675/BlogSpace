import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads folder
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Cloudinary - called lazily when needed
const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
};

// Multer disk storage
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `upload_${Date.now()}_${Math.round(Math.random() * 99999)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed.`), false);
  }
};

export const upload = multer({
  storage: diskStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

export const uploadAvatar = multer({
  storage: diskStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

const deleteLocal = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (e) {}
};

export const uploadToCloudinary = async (
  filePath,
  folder = "blog-platform",
  options = {},
) => {
  // Configure cloudinary here (after dotenv is loaded)
  configureCloudinary();

  console.log("\n--- Cloudinary Upload ---");
  console.log("File:", filePath);
  console.log("Folder:", folder);

  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error("File not found: " + filePath);
  }

  const stats = fs.statSync(filePath);
  console.log("Size:", Math.round(stats.size / 1024), "KB");

  if (stats.size === 0) {
    deleteLocal(filePath);
    throw new Error("File is empty");
  }

  try {
    const uploadOptions = {
      folder,
      resource_type: "image",
      quality: "auto",
      fetch_format: "auto",
    };

    if (options.transformation) {
      uploadOptions.transformation = options.transformation;
    }

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    console.log("✅ Upload success:", result.secure_url);
    deleteLocal(filePath);

    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    console.error("❌ Cloudinary error:", error.message);
    deleteLocal(filePath);
    throw new Error("Cloudinary upload failed: " + error.message);
  }
};

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  configureCloudinary();
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log("🗑️ Deleted:", publicId);
  } catch (error) {
    console.error("Delete error:", error.message);
  }
};

export { cloudinary };
