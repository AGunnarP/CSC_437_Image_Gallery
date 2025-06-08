import { useState } from "react";
import type { IApiImageData } from "./types"

interface INameEditorProps {
    initialValue: string,
    imageId: string,
    setImageData: React.Dispatch<React.SetStateAction<IApiImageData[]>>,
    imageData: IApiImageData[];

}

async function updateImageAuthor(id: string, username: string): Promise<void> {
    const response = await fetch(`/api/images/update/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });
  
    let json: any = null;
  
    try {
      json = await response.json(); // ✅ read once
      console.log("Server response:", json);
    } catch (err) {
      console.warn("No JSON body returned or failed to parse JSON");
    }
  
    if (!response.ok) {
      // now you're safe — body was read only once
      throw new Error(json?.error || "Failed to update image author");
    }
  
    // continue here if needed...
  }

export function ImageNameEditor(props: INameEditorProps) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [input, setInput] = useState(props.initialValue);
    async function handleSubmitPressed() {

        props.setImageData(prev =>
            prev.map(image =>
              image._id === props.imageId
                ? {
                    ...image,
                    author: {
                      id: image.author.id,   // or whatever new id you have
                      username: input
                    }
                  }
                : image
            )
          );   
          
          updateImageAuthor(props.imageId, input).then(response => console.log(response));

    }

    if (isEditingName) {
        return (
            <div style={{ margin: "1em 0" }}>
                <label>
                    New Name <input value={input} onChange={e => setInput(e.target.value)}/>
                </label>
                <button disabled={input.length === 0} onClick={handleSubmitPressed}>Submit</button>
                <button onClick={() => setIsEditingName(false)}>Cancel</button>
            </div>
        );
    } else {
        return (
            <div style={{ margin: "1em 0" }}>
                <button onClick={() => setIsEditingName(true)}>Edit name</button>
            </div>
        );
    }
}
