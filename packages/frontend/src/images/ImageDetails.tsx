import { useParams } from 'react-router-dom'
import type { IApiImageData } from "../types"
import { ImageNameEditor } from '../imageNameEditor'

interface ImageDetailsProps{

    imageData: IApiImageData[];
    setImageData: React.Dispatch<React.SetStateAction<IApiImageData[]>>
    authToken : string

}

export function ImageDetails(props : ImageDetailsProps) {

    const { imageId } = useParams()

    console.log(`Image details is ${imageId}`)
    console.log(props.imageData)

    var whyIsThisAString : string;
    whyIsThisAString = (imageId)? imageId.toString() : "";

    const image = props.imageData.find(image => image._id === imageId);
    if (!image) {
        return <><h2>Image not found</h2></>;
    }

    return (
        <>
            <h2>{image.name}</h2>
            <p>By {image.author.username}</p>
            <ImageNameEditor imageId={whyIsThisAString} initialValue={image.author.username} setImageData={props.setImageData} imageData={props.imageData} authToken={props.authToken}/>
            <img className="ImageDetails-img" src={image.src} alt={image.name} />
        </>
    )
}
