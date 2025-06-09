import React, { useId, useState } from "react";
import { useActionState } from "react";

interface UploadPageProps {
  authToken: string;
}

interface FormState {
  success?: string;
  error?: string;
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.readAsDataURL(file);
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = (err) => reject(err);
  });
}

export function UploadPage({ authToken }: UploadPageProps) {
  const fileInputId = useId();
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await readAsDataURL(file);
        setPreviewUrl(dataUrl);
      } catch (err) {
        console.error("Failed to preview image:", err);
      }
    }
  };

  const handleUpload = async (_prevState: FormState, formData: FormData): Promise<FormState> => {
    try {
      const res = await fetch("/api/images", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData, // let browser set Content-Type
      });

      if (!res.ok) {
        return { error: `Upload failed with status ${res.status}` };
      }

      return { success: "Upload successful!" };
    } catch (err) {
      console.error("Upload failed:", err);
      return { error: "Network or server error" };
    }
  };

  const [state, formAction, isPending] = useActionState<FormState, FormData>(handleUpload, {});

  return (
    <form action={formAction}>
      <div>
        <label htmlFor={fileInputId}>Choose image to upload:</label>
        <input
          id={fileInputId}
          name="image"
          type="file"
          accept=".png,.jpg,.jpeg"
          required
          disabled={isPending}
          onChange={handleFileChange}
        />
      </div>

      <div>
        <label>
          <span>Image title:</span>
          <input name="name" required disabled={isPending} />
        </label>
      </div>

      {previewUrl && (
        <div>
          <img
            src={previewUrl}
            style={{ width: "20em", maxWidth: "100%" }}
            alt="Preview of selected image"
          />
        </div>
      )}

      <input type="submit" value="Confirm upload" disabled={isPending} />

      {/* ✅ aria-live feedback region */}
      <p aria-live="polite" style={{ color: state.error ? "red" : "green" }}>
        {state.error || state.success}
      </p>
    </form>
  );
}
