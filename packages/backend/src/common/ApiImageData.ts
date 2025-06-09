import { ImageProvider } from "../ImageProvider";
import { connectMongo } from "../connectMongo"
import { ObjectId } from "mongodb";


import dotenv from "dotenv";

dotenv.config();
export const mongoClient = connectMongo();
mongoClient.db().listCollections().toArray().then(data => console.log(data))

const provider = new ImageProvider(mongoClient)


export interface IApiImageData {
    id: string;
    src: string;
    name: string;
    author: IApiUserData;
}

export interface IApiUserData {
    id: string,
    username: string
}

let fetchCount = 0;
export function fetchDataFromServer() {
    fetchCount++;
    console.log("Fetching data x" + fetchCount);
    return provider.getImages();
}


export async function updateImageAuthorUsername(
  authorId : ObjectId,
  imageIdStr: string,
  newUsername: string
): Promise<{ success: boolean; updated?: object; warning?: string }> {
  if (!ObjectId.isValid(imageIdStr)) {
    throw new Error("Invalid image ID");
  }

  const imageId = new ObjectId(imageIdStr);
  const db = mongoClient.db();
  const imagesCollection = db.collection("images");

  const result = await imagesCollection.updateOne(
    { _id: imageId },
    { $set: { authorId: authorId, userName: newUsername } }
  );

  if (result.matchedCount === 0) {
    throw new Error("No image found with that ID");
  }

  if (result.modifiedCount === 0) {
    return {
      success: true,
      updated: { _id: imageIdStr, authorId: newUsername },
      warning: "Matched image, but authorId was already the same",
    };
  }

  return {
    success: true,
    updated: { _id: imageIdStr, authorId: newUsername },
  };
}

