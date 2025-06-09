import { Collection, MongoClient } from "mongodb";
import { mongoClient } from "./common/ApiImageData"
import bcrypt from "bcrypt";

interface ICredentialsDocument {
    _id: string;
    username: string;
    password: string;
}

export class CredentialsProvider {
    private readonly collection: Collection<ICredentialsDocument>;

    constructor(mongoClient: MongoClient) {
        const COLLECTION_NAME = process.env.CREDS_COLLECTION_NAME;
        if (!COLLECTION_NAME) {
            throw new Error("Missing CREDS_COLLECTION_NAME from env file");
        }
        this.collection = mongoClient.db().collection<ICredentialsDocument>(COLLECTION_NAME);
    }

    
    async verifyPassword(username: string, plaintextPassword: string): Promise<boolean> {
        const user = await this.collection.findOne({ _id: username });
        if (!user) {
          return false; // user not found
        }
      
        // bcrypt will internally extract the salt and verify the hash
        console.log(`user : ${username}`)
        console.log(`plaintext : ${plaintextPassword}`)
        console.log(`user.password: ${user.password}`)
        const isMatch = await bcrypt.compare(plaintextPassword, user.password);
        return isMatch;
      }

      async registerUser(
        username: string,
        password: string
      ): Promise<{ success: boolean; error?: string }> {
        if (!username || !password) {
          return { success: false, error: "Username and password required" };
        }
      
        const db = mongoClient.db();
        const credsCollection = db.collection<{ _id: string; username: string; password: string }>("userCreds");
        const usersCollection = db.collection<{ _id: string; username: string; email: string }>("users");
      
        const existing = await credsCollection.findOne({ _id: username });
        if (existing) {
          return { success: false, error: "User already exists" };
        }
      
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
      
        // Insert into credentials collection
        await credsCollection.insertOne({
          _id: username,
          username: username,
          password: hashedPassword,
        });
      
        // Insert into users collection with bogus email
        await usersCollection.insertOne({
          _id: username,
          username: username,
          email: `${username}@bogus.email`, // or just "bogus@email.com"
        });
      
        return { success: true };
      }
}
