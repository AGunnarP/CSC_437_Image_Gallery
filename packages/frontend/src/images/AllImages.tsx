
import { ImageGrid } from "./ImageGrid.tsx";
import type { IApiImageData } from "../types"

interface AllImagesProps{

    imageData: IApiImageData[];
    searchPanel : React.ReactNode;

};



export function AllImages(props : AllImagesProps) {
    return (
        <>
            <h2>All Images</h2>
            {props.searchPanel}
            <ImageGrid images={props.imageData} />
        </>
    );
}
