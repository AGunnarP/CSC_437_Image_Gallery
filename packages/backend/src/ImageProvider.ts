// lib/ImageProvider.ts
import { MongoClient, Collection, ObjectId } from "mongodb";

export interface IImageDocument {
  _id?: ObjectId;
  src: string;
  name: string;
  authorId: string;
}

export interface IImageWithAuthor {
  _id: ObjectId;
  src: string;
  name: string;
  author: {
    _id: ObjectId;
    username: string;
  };
}

export class ImageProvider {
  private images: Collection<IImageDocument>;

  constructor(private readonly mongoClient: MongoClient) {
    const collName = process.env.IMAGES_COLLECTION_NAME;
    if (!collName) {
      throw new Error("Missing IMAGES_COLLECTION_NAME from environment variables");
    }
    this.images = this.mongoClient.db().collection(collName);
  }

  /**
 * Inserts a new image document into the images collection.
 */
async createImage(image: { src: string; name: string; authorId: string }): Promise<void> {

  console.log("uploading image")
    await this.images.insertOne({
      src: image.src,
      name: image.name,
      authorId: image.authorId,
    });
  }


  /**
   * Fetch all images (optionally filtering by name substring),
   * and join with users by authorId → username
   */
  getImages(nameSubstring?: string): Promise<IImageWithAuthor[]> {
    const matchStage = nameSubstring
      ? {
          $match: {
            name: {
              $regex: nameSubstring,
              $options: "i", // case-insensitive
            },
          },
        }
      : undefined;

    const pipeline = [
      ...(matchStage ? [matchStage] : []),
      {
        $lookup: {
          from: "users",
          localField: "authorId",
          foreignField: "username",
          as: "author",
        },
      },
      { $unwind: "$author" },
      {
        $project: {
          src: 1,
          name: 1,
          author: {
            _id: "$author._id",
            username: "$author.username",
          },
        },
      },
    ];

    return this.images.aggregate<IImageWithAuthor>(pipeline).toArray();
  }
}
