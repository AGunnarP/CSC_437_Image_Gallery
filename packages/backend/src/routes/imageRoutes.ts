import { updateImageAuthorUsername } from "../common/ApiImageData";
import express from "express";
import { IImageWithAuthor } from "ImageProvider";
import { verifyAuthToken } from "../middleware";
import { ObjectId } from "mongodb";
import { imageMiddlewareFactory, handleImageFileErrors } from "../imageUploadMiddleware";
import { Request, Response } from "express";
import { ImageProvider } from "../ImageProvider";
import { mongoClient } from "../common/ApiImageData"
import fs from "fs";
import path from "path";





export function registerImageRoutes(app: express.Application, fetchDataFromServer: () => Promise<IImageWithAuthor[]>) {

    var Images : IImageWithAuthor[] = [];
    fetchDataFromServer().then(data => Images = data)
    const provider = new ImageProvider(mongoClient)


    /*app.post(
      "/api/images",
      imageMiddlewareFactory.single("image"),
      handleImageFileErrors,
        (req: Request, res: Response) => {
        const file = req.file;
        const name = body.name?.trim();

    
        if (!file || !name || !user?.username) {
          res.status(400).json({ error: "Missing image file, name, or authentication" });
          return;
        }
    
        // Rename the uploaded file
        const ext = path.extname(file.filename);
        const safeName = name.replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
        const newFileName = `${safeName}-${Date.now()}${ext}`;
        const newPath = path.join(file.destination, newFileName);
        fs.renameSync(file.path, newPath);
    
        // Create image document in DB
        const imageDoc = {
          src: `/uploads/${newFileName}`,
          name,
          authorId: user.username,
        };
    
        try {

          provider.createImage(imageDoc).then(response => res.status(201).send({ response })) 
          
        } catch (err) {
          console.error("DB insert error:", err);
          res.status(500).json({ error: "Failed to save image metadata" });
        }
      }
    );*/

    
    
    app.post(
      "/api/images",
      imageMiddlewareFactory.single("image"),
      verifyAuthToken,
      handleImageFileErrors,
        (req: Request, res: Response) => {
        
        const name = req.body.name?.trim();
        const file = req.file;
        const username = req.user?.username;
        


    
        if (!file || !name || !username ) {
          res.status(400).json({ error: "Missing image file, name, or authentication" });
          return;
        }
    
        // Rename the uploaded file
        const ext = path.extname(file.filename);
        const safeName = name.replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
        const newFileName = `${safeName}`;
        const newPath = path.join(file.destination, newFileName);
        fs.renameSync(file.path, newPath);
    
        // Create image document in DB
        const imageDoc = {
          src: `/uploads/${newFileName}`,
          name,
          authorId: username,
        };
    
        try {

          provider.createImage(imageDoc).then(response => res.status(201).send({ response })) 
          
        } catch (err) {
          console.error("DB insert error:", err);
          res.status(500).json({ error: "Failed to save image metadata" });
        }
      }
    );
    
    

    app.get("/api/images", verifyAuthToken,  (req, res) => {

        const q = (req.query.query as string)?.trim(); // optional chaining
        console.log("All image names:", Images.map(i => i.name));

        if(!q)
            res.send(Images)
        else{

            console.log("filtering")
            const filtered = Images.filter((img) =>
            img.name.toLowerCase().includes(q.toLowerCase())
          );
      
          res.json(filtered);

        }
        
    });

    app.get("/api/images/search", verifyAuthToken,  (req, res) => {

        const q = (req.query.query as string)?.trim(); // optional chaining

        if (!q) {
            res
            .status(400)
            .send({ error: "Missing required query parameter `query`" });
            return;
        }

      
          // simple in-memory filter after fetching all (for demo)
          // 👉 you could also push this down into a Mongo filter using $regex
          const filtered = Images.filter((img) =>
            img.name.toLowerCase().includes(q.toLowerCase())
          );
      
          res.json(filtered);
      });


      app.patch("/api/images/update/:id", verifyAuthToken, express.json(), (req, res) => {

        const imageId = new ObjectId(req.params.id);
        const newName = req.body.username;
        
    
        if (!newName || typeof newName !== "string") {
            res.status(400).send({ error: "Missing or invalid 'name'" });
            return;
        }

        const data = Images.filter((img) => 
          img._id.equals(imageId));

        if(!req.user){

          res.status(401).send("No authorization given");
          return;

        }

        const authorId = req.user.username; // assuming req.user.username is an ObjectId string
        const data_author_id = data[0].author._id; // 🔧 force conversion to ObjectId


        console.log(typeof data[0].author._id)
        if (data_author_id.toString() === authorId) {
          res.status(401).send(`You are not the owner of the picture; the owner is ${data[0].author.username}`);
          return;
          }
        
    
        console.log(`I will try to set the name of ${imageId} to ${newName}`);

        updateImageAuthorUsername(new ObjectId(authorId), req.params.id, newName).then(data => res.send(data));
        fetchDataFromServer().then(data => Images = data)

      });

      

}