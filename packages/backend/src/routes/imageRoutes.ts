import express from "express";
import { IImageWithAuthor } from "ImageProvider";

export function registerImageRoutes(app: express.Application, fetchDataFromServer: () => Promise<IImageWithAuthor[]>) {

    var Images : IImageWithAuthor[] = [];
    fetchDataFromServer().then(data => Images = data)

    app.get("/api/images", (_req, res) => {

        res.send(Images)
    
    });

    app.get("/api/images/search", (req, res) => {

        const q = (req.query.query as string)?.trim(); // optional chaining

        if (!q) {
            res
            .status(400)
            .send({ error: "Missing required query parameter `query`" });
        }

      
          // simple in-memory filter after fetching all (for demo)
          // 👉 you could also push this down into a Mongo filter using $regex
          const filtered = Images.filter((img) =>
            img.name.toLowerCase().includes(q.toLowerCase())
          );
      
          res.json(filtered);
      });

}