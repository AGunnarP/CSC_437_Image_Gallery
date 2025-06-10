import { useState } from "react";
import type { IApiImageData } from "./types";

interface INameEditorProps {
  initialValue: string;
  imageId: string;
  setImageData: React.Dispatch<React.SetStateAction<IApiImageData[]>>;
  imageData: IApiImageData[];
  authToken: string; 
}

async function updateImageAuthor(id: string, username: string, token: string): Promise<void> {
  const response = await fetch(`/api/images/update/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,  
    },
    body: JSON.stringify({ username }),
  });

  let json: any = null;

  try {
    json = await response.json();
    console.log("Server response:", json);
  } catch (err) {
    console.warn("No JSON body returned or failed to parse JSON");
  }

  if (!response.ok) {
    throw new Error(json?.error || "Failed to update image author");
  }
}

export function ImageNameEditor(props: INameEditorProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [input, setInput] = useState(props.initialValue);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmitPressed() {
    setErrorMessage(null); // Clear old errors

    try {
      await updateImageAuthor(props.imageId, input, props.authToken);

      props.setImageData(prev =>
        prev.map(image =>
          image._id === props.imageId
            ? {
                ...image,
                name: input
              }
            : image
        )
      );

      setIsEditingName(false);
    } catch (error: any) {
      if (error.message.includes("403")) {
        setErrorMessage("You do not have permission to change this author.");
      } else {
        setErrorMessage(error.message || "An unexpected error occurred.");
      }
    }
  }

  return (
    <div style={{ margin: "1em 0" }}>
      {isEditingName ? (
        <>
          <label>
            New Name{" "}
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
            />
          </label>
          <button
            disabled={input.length === 0}
            onClick={handleSubmitPressed}
          >
            Submit
          </button>
          <button onClick={() => setIsEditingName(false)}>Cancel</button>
        </>
      ) : (
        <button onClick={() => setIsEditingName(true)}>Edit name</button>
      )}
      {errorMessage && (
        <div style={{ color: "red", marginTop: "0.5em" }}>
          {errorMessage}
        </div>
      )}
    </div>
  );
}
