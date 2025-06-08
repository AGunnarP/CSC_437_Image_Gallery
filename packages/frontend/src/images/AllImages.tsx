
import { ImageGrid } from "./ImageGrid.tsx";
import type { IApiImageData } from "../types"



export function AllImages({ imageData }: { imageData: IApiImageData[] }) {
    return (
        <>
            <h2>All Images</h2>
            <ImageGrid images={imageData} />
        </>
    );
}
