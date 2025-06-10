import { ImageProvider } from "../ImageProvider";
import { connectMongo } from "../connectMongo"
import { ObjectId } from "mongodb";


import dotenv from "dotenv";

dotenv.config();
export const mongoClient = connectMongo();
mongoClient.db().listCollections().toArray()

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
    console.log(provider.getImages())
    return provider.getImages();
}


export async function updateImageAuthorUsername(
  authorId: string,
  imageIdStr: string,
  newUsername: string
): Promise<{ success: boolean; updated?: object; warning?: string }> {
  console.log("⏳ Starting updateImageAuthorUsername...");
  console.log(`🔍 Params received - authorId: ${authorId}, imageId: ${imageIdStr}, newUsername: ${newUsername}`);

  if (!ObjectId.isValid(imageIdStr)) {
    console.error("❌ Invalid image ID format");
    throw new Error("Invalid image ID");
  }

  const imageId = new ObjectId(imageIdStr);
  const db = mongoClient.db();
  const imagesCollection = db.collection("images");

  console.log("📡 Attempting update in MongoDB...");
  let result;
  try {
    result = await imagesCollection.updateOne(
      { _id: imageId },
      { $set: { name: newUsername } }
    );
  } catch (err) {
    console.error("❌ MongoDB updateOne threw an error:", err);
    throw new Error("Database error while updating image author");
  }

  console.log("📄 MongoDB update result:", result);

  if (result.matchedCount === 0) {
    console.warn(`⚠️ No image matched for ID: ${imageIdStr}`);
    throw new Error("No image found with that ID");
  }

  if (result.modifiedCount === 0) {
    console.info("✅ Image matched, but no changes made (same username)");
    return {
      success: true,
      updated: { _id: imageIdStr, authorId: newUsername },
      warning: "Matched image, but authorId was already the same",
    };
  }

  console.log("✅ Successfully updated image author!");
  return {
    success: true,
    updated: { _id: imageIdStr, authorId: newUsername },
  };
}

