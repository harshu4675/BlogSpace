import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlinePhoto,
  HiOutlineCloudArrowUp,
  HiOutlineTrash,
  HiOutlineArrowPath,
} from "react-icons/hi2";

const CoverImageUpload = ({ coverImage, onFileSelect, onRemove }) => {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(coverImage || null);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be under 10MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleRemove = () => {
    setPreview(null);
    onRemove();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
        Cover Image
      </label>

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative rounded-2xl overflow-hidden group"
          >
            <img
              src={preview}
              alt="Cover preview"
              className="w-full aspect-[16/9] object-cover"
            />
            <div
              className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors 
                            flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100"
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-xl bg-white/90 text-dark-700 hover:bg-white transition-colors 
                           shadow-lg"
                title="Replace image"
              >
                <HiOutlineArrowPath className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-3 rounded-xl bg-red-500/90 text-white hover:bg-red-500 transition-colors 
                           shadow-lg"
                title="Remove image"
              >
                <HiOutlineTrash className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12 
                        text-center transition-all duration-200 ${
                          dragging
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-950/20 scale-[1.01]"
                            : "border-dark-300 dark:border-dark-600 hover:border-primary-400 hover:bg-dark-50 dark:hover:bg-dark-800"
                        }`}
          >
            <div className="flex flex-col items-center">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 
                              transition-colors ${
                                dragging
                                  ? "bg-primary-100 dark:bg-primary-900/30"
                                  : "bg-dark-100 dark:bg-dark-700"
                              }`}
              >
                {dragging ? (
                  <HiOutlineCloudArrowUp className="w-8 h-8 text-primary-500 animate-bounce" />
                ) : (
                  <HiOutlinePhoto className="w-8 h-8 text-dark-400" />
                )}
              </div>
              <p className="text-sm font-semibold text-dark-700 dark:text-dark-300 mb-1">
                {dragging
                  ? "Drop your image here"
                  : "Click or drag to upload cover image"}
              </p>
              <p className="text-xs text-dark-400">
                PNG, JPG, WebP up to 10MB · Recommended 1200×630px
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="hidden"
      />
    </div>
  );
};

export default CoverImageUpload;
