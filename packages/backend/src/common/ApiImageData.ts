import { ImageProvider } from "../ImageProvider";
import { connectMongo } from "../connectMongo"
import { MongoClient, ObjectId } from "mongodb";


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

const IMAGES: IApiImageData[] = [
    {
        id: "0",
        src: "https://upload.wikimedia.org/wikipedia/commons/3/33/Blue_merle_koolie_short_coat_heading_sheep.jpg",
        name: "Blue merle herding sheep",
        author: {
            id: "0",
            username: "chunkylover23"
        }
    },
    {
        id: "1",
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Huskiesatrest.jpg/2560px-Huskiesatrest.jpg",
        name: "Huskies",
        author: {
            id: "0",
            username: "chunkylover23"
        }
    },
    {
        id: "2",
        src: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Taka_Shiba.jpg",
        name: "Shiba",
        author: {
            id: "0",
            username: "chunkylover23"
        }
    },
    {
        id: "3",
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Felis_catus-cat_on_snow.jpg/2560px-Felis_catus-cat_on_snow.jpg",
        name: "Tabby cat",
        author: {
            id: "1",
            username: "silas_meow"
        },
    },
    {
        id: "4",
        src: "https://upload.wikimedia.org/wikipedia/commons/8/84/Male_and_female_chicken_sitting_together.jpg",
        name: "Chickens",
        author: {
            id: "2",
            username: "fulffycoat"
        }
    }
];

let fetchCount = 0;
export function fetchDataFromServer() {
    fetchCount++;
    console.log("Fetching data x" + fetchCount);
    return provider.getImages();
}

export async function updateImageAuthorUsername(
    imageIdStr: string,
    newUsername: string
  ): Promise<void> {
    if (!ObjectId.isValid(imageIdStr)) {
      throw new Error("Invalid image ID");
    }
  
    const imageId = new ObjectId(imageIdStr);
    const db = mongoClient.db(); // optionally .db("yourDbName")
    const imagesCollection = db.collection("images");
  
    const result = await imagesCollection.updateOne(
      { _id: imageId },
      { $set: { authorId: newUsername, userName: newUsername } }
    );
  
    console.log("Update result:", await result);
  
    if (result.matchedCount === 0) {
      throw new Error("No image found with that ID");
    }
  
    if (result.modifiedCount === 0) {
      console.warn("Matched image, but authorId was already the same");
    } else {
      console.log(`✅ Updated image ${imageIdStr} with new author: ${newUsername}`);
    }
  }

