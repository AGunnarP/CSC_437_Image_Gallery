import { updateImageAuthorUsername } from "../common/ApiImageData";
import express from "express";
import { IImageWithAuthor } from "ImageProvider";
import { ObjectId } from "mongodb"

export function registerImageRoutes(app: express.Application, fetchDataFromServer: () => Promise<IImageWithAuthor[]>) {

    var Images : IImageWithAuthor[] = [];
    fetchDataFromServer().then(data => Images = data)

    app.get("/api/images", (req, res) => {

        const q = (req.query.query as string)?.trim(); // optional chaining

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

    app.get("/api/images/search", (req, res) => {

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


      app.patch("/api/images/update/:id", express.json(), (req, res) => {

        const imageId = req.params.id;
        const newName = req.body.username;
    
        if (!newName || typeof newName !== "string") {
            res.status(400).send({ error: "Missing or invalid 'name'" });
            return;
        }
    
        console.log(`I will try to set the name of ${imageId} to ${newName}`);

        updateImageAuthorUsername(imageId, newName).then(data => res.send(data));
        fetchDataFromServer().then(data => Images = data)

      });

      

}