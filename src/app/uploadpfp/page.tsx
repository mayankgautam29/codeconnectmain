"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";

export default function UploadCard() {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const router = useRouter();
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0] || null);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    multiple: false,
  });
  const handleUpload = async () => {
    if (!file) return alert("Please select a file first");
    setLoading(true);
    try {
      const base64 = await toBase64(file);
      const isVideo = file.type.startsWith("video");
      const res = await fetch("/api/uploadpfp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: base64,
          caption: caption
        }),
      });

      const text = await res.text();
      if (!res.ok) {
        console.error("Upload failed:", text);
        return;
      }

      const data = JSON.parse(text);
      setFileUrl(data.url);
      router.push("/profile"); 
    } catch (err: any) {
      console.error("Error uploading:", err.message || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#1e1e2f] rounded-xl shadow-xl p-6 mt-10 space-y-4 text-white">
      <h2 className="text-2xl font-bold text-center">Upload Profile Image</h2>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition ${
          isDragActive ? "border-blue-400 bg-blue-900/20" : "border-gray-600"
        }`}
      >
        <input {...getInputProps()} />
        <p>{isDragActive ? "Drop it here..." : "Click or drag a file to select"}</p>
        {file && (
          <p className="text-sm text-green-400 mt-2">Selected: {file.name}</p>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? "Updating..." : "Update Profile Image"}
      </button>

      {fileUrl && (
        <p className="text-center text-green-400 text-sm">Upload complete!</p>
      )}
    </div>
  );
}

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
  });