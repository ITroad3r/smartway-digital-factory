import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

interface Props {
  value?: string | null;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  /** Recommended dimensions hint shown to admin */
  recommendedSize?: string;
}

export default function ImageUpload({
  value,
  onChange,
  bucket = "blog-images",
  folder = "covers",
  recommendedSize = "1200×630 px (Open Graph / social share)",
}: Props) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please pick an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    setBusy(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    onChange(data.publicUrl);
    toast.success("Image uploaded");
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Cover preview"
            className="h-40 w-auto rounded-lg border border-border object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 bg-foreground text-background rounded-full p-1"
            aria-label="Remove image"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : null}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-paper px-3 py-2 text-sm hover:bg-paper-soft"
        >
          <Upload className="h-4 w-4" />
          {busy ? "Uploading…" : value ? "Replace image" : "Upload image"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = "";
          }}
        />
        <input
          type="url"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="…or paste an image URL"
          className="flex-1 bg-paper border border-border rounded-lg px-3 py-2 text-sm"
        />
      </div>
      <p className="text-[11px] text-muted-foreground">
        Recommended: {recommendedSize}. Use a 1.91:1 ratio so social share thumbnails (LinkedIn, Facebook, X) crop cleanly.
      </p>
    </div>
  );
}
