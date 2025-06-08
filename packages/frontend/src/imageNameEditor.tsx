import { useState } from "react";
import type { IApiImageData } from "./types"

interface INameEditorProps {
    initialValue: string,
    imageId: string,
    setImageData: React.Dispatch<React.SetStateAction<IApiImageData[]>>,
    imageData: IApiImageData[];

}

export function ImageNameEditor(props: INameEditorProps) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [input, setInput] = useState(props.initialValue);
    async function handleSubmitPressed() {

        props.setImageData(prev =>
            prev.map(image =>
              image.id === props.imageId
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
