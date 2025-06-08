// lib/ImageProvider.ts
import { MongoClient, Collection, ObjectId } from "mongodb";

export interface IImageDocument {
  _id: ObjectId;
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
    // …any other user fields you care about
  };
}

export class ImageProvider {
  private images: Collection<IImageDocument>;

  constructor(private readonly mongoClient: MongoClient) {
    const collName = process.env.IMAGES_COLLECTION_NAME;
    if (!collName) {
      throw new Error(
        "Missing IMAGES_COLLECTION_NAME from environment variables"
      );
    }
    this.images = this.mongoClient.db().collection(collName);
  }

  /**
   * Fetch all images, looking up the matching user by `authorId`
   * and placing it into an `author` sub-document.
   */
  getAllImagesWithAuthors(): Promise<IImageWithAuthor[]> {
    return this.images
      .aggregate<IImageWithAuthor>([
        {
          $lookup: {
            from: "users",
            localField: "authorId",      // the string in your image docs
            foreignField: "username",    // adjust this to match your users schema
            as: "author"
          }
        },
        { $unwind: "$author" },
        {
          $project: {
            src: 1,
            name: 1,
            author: {
              _id: "$author._id",
              username: "$author.username"
              // …any other fields you want to expose
            }
          }
        }
      ])
      .toArray();
  }
}
