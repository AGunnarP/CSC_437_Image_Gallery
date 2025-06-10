import express from "express";
import path from "path";
import { ValidRoutes } from "./shared/ValidRoutes";
import { registerImageRoutes } from "./routes/imageRoutes";
import { fetchDataFromServer } from "./common/ApiImageData";
import { registerAuthRoutes } from "./routes/authRoutes";

const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR!; // "../frontend/dist"
const IMAGE_UPLOAD_DIR = process.env.IMAGE_UPLOAD_DIR!; // "../frontend/dist"


// process.cwd() when run from packages/backend → …/packages/backend
const staticPath = path.resolve(process.cwd(), STATIC_DIR);
const imagePath = path.resolve(process.cwd(), IMAGE_UPLOAD_DIR);

export const app = express();
app.use(express.static(STATIC_DIR));
app.use("/uploads", express.static(IMAGE_UPLOAD_DIR))
app.use(express.json());

export const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("Missing JWT_SECRET in environment variables");
}

app.locals.JWT_SECRET = jwtSecret;

//console.log(Object.values(ValidRoutes))

app.get(Object.values(ValidRoutes), (_req, res) =>{

    res.sendFile(path.join(staticPath, "index.html"));

});

registerImageRoutes(app, fetchDataFromServer);
registerAuthRoutes(app);




app.listen(PORT, () => console.log(`Listening on ${PORT}`));

