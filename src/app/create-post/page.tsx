"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, Film, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function UploadCard() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "video/*": [] },
    multiple: true,
  });

  const handleUpload = async () => {
    if (!files.length) return;
    setLoading(true);
    try {
      const base64Files = await Promise.all(files.map((file) => toBase64(file)));

      const res = await fetch("/api/uploadfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: base64Files,
          types: files.map((f) => (f.type.startsWith("video") ? "video" : "image")),
          caption,
        }),
      });

      if (!res.ok) {
        console.error("Upload failed:", await res.text());
        return;
      }

      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload error";
      console.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="glass-card p-5 md:p-6 space-y-5">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition",
            isDragActive
              ? "border-cyan-400/60 bg-cyan-400/5"
              : "border-white/15 hover:border-white/25 hover:bg-white/[0.03]"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="size-8 mx-auto mb-3 text-white/40" />
          <p className="text-white/70 text-sm">
            {isDragActive ? "Drop files here..." : "Drag & drop or click to upload"}
          </p>
          <p className="text-white/35 text-xs mt-1">Images and videos supported</p>
        </div>

        {previews.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {previews.map((preview, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden border border-white/10 aspect-square">
                {files[i]?.type.startsWith("video") ? (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <Film className="size-8 text-white/40" />
                    <span className="absolute bottom-2 left-2 text-xs text-white/60 truncate max-w-[80%]">
                      {files[i].name}
                    </span>
                  </div>
                ) : (
                  <Image src={preview} alt="" fill className="object-cover" />
                )}
                <button
                  onClick={() => removeFile(i)}
                  className="absolute top-2 right-2 size-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          placeholder="Write a caption..."
          rows={3}
          className="w-full rounded-xl bg-white/[0.06] border border-white/10 p-3 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-300/40 resize-none text-sm"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        <Button
          onClick={handleUpload}
          disabled={loading || files.length === 0}
          className="w-full rounded-xl py-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-semibold disabled:opacity-40"
        >
          {loading ? (
            "Posting..."
          ) : (
            <span className="flex items-center gap-2">
              <ImageIcon size={16} />
              Publish Post
            </span>
          )}
        </Button>
      </div>
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
