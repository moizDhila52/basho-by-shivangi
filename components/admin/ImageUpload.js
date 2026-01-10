// components/admin/ImageUpload.js
"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, Image as ImageIcon, Loader2 } from "lucide-react";

export default function ImageUpload({
  value,
  onChange,
  disabled,
  multiple = false,
  label = "Upload Image",
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      setUploading(true);
      setProgress(0);

      try {
        const uploadedUrls = [];
        const totalFiles = acceptedFiles.length;

        for (let i = 0; i < totalFiles; i++) {
          const file = acceptedFiles[i];
          const formData = new FormData();
          formData.append("file", file);
          formData.append(
            "upload_preset",
            process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
          );

          // Simulated progress for visual feedback (since fetch doesn't expose progress natively)
          const progressInterval = setInterval(() => {
            setProgress((prev) => {
              if (prev >= 90) return prev;
              return prev + 10;
            });
          }, 200);

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

          clearInterval(progressInterval);
          const data = await response.json();

          if (data.secure_url) {
            uploadedUrls.push(data.secure_url);
          }
        }

        setProgress(100);
        
        // Handle Multiple vs Single logic
        if (multiple) {
          const currentValue = Array.isArray(value) ? value : [];
          onChange([...currentValue, ...uploadedUrls]);
        } else {
          onChange(uploadedUrls[0]);
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert("Upload failed. Please check your Cloudinary configuration.");
      } finally {
        // Reset after a brief delay so user sees the 100% green bar
        setTimeout(() => {
          setUploading(false);
          setProgress(0);
        }, 500);
      }
    },
    [multiple, onChange, value]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    disabled: disabled || uploading,
    multiple: multiple,
  });

  const removeImage = (urlToRemove) => {
    if (multiple) {
      onChange(value.filter((url) => url !== urlToRemove));
    } else {
      onChange("");
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-stone-700 font-serif">
        {label}
      </label>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 transition-all text-center cursor-pointer overflow-hidden group
          ${
            isDragActive
              ? "border-[#8E5022] bg-[#8E5022]/5"
              : "border-stone-300 hover:border-[#8E5022]/50 hover:bg-stone-50"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <p className="text-sm text-stone-600 font-medium mb-3">Uploading to Cloud...</p>
            {/* THE REQUESTED GREEN LOADER */}
            <div className="w-full max-w-[200px] h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-3 text-stone-500 group-hover:text-[#8E5022] transition-colors">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-stone-700">
              {isDragActive ? "Drop files here" : "Click or drag to upload"}
            </p>
            <p className="text-xs text-stone-400 mt-1">
              JPG, PNG, WEBP up to 5MB
            </p>
          </div>
        )}
      </div>

      {/* Preview Area */}
      {value && (
        <div className={`grid gap-4 ${multiple ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-1"}`}>
          {(Array.isArray(value) ? value : [value]).map((url, index) => {
             if (!url) return null;
             return (
              <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-50 shadow-sm">
                <img
                  src={url}
                  alt="Uploaded"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(url);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}