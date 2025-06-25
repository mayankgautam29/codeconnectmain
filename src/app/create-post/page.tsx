"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";

export default function UploadCard() {
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "video/*": [] },
    multiple: true,
  });

  const handleUpload = async () => {
    if (!files.length) return alert("Please select at least one file");
    setLoading(true);
    try {
      const base64Files = await Promise.all(
        files.map(file => toBase64(file))
      );

      const res = await fetch("/api/uploadfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: base64Files,
          types: files.map(f => f.type.startsWith("video") ? "video" : "image"),
          caption
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Upload failed:", err);
        return;
      }

      router.push("/");
    } catch (err: any) {
      console.error("Upload error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#1e1e2f] rounded-xl shadow-xl p-6 mt-10 space-y-4 text-white">
      <h2 className="text-2xl font-bold text-center">Upload Media</h2>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition ${
          isDragActive ? "border-blue-400 bg-blue-900/20" : "border-gray-600"
        }`}
      >
        <input {...getInputProps()} />
        <p>{isDragActive ? "Drop files here..." : "Click or drag to upload files"}</p>
        {files.length > 0 && (
          <ul className="text-sm text-green-400 mt-2">
            {files.map((file, i) => (
              <li key={i}>{file.name}</li>
            ))}
          </ul>
        )}
      </div>

      <input
        type="text"
        placeholder="Caption"
        className="w-full rounded-md bg-gray-700 border-none p-2 text-white placeholder-gray-400"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </div>
  );
}

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = err => reject(err);
  });
