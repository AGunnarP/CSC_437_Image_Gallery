import express from "express";
import path from "path";
import { ValidRoutes } from "./shared/ValidRoutes";
import { fetchDataFromServer } from "./common/ApiImageData";


const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR!; // "../frontend/dist"


// process.cwd() when run from packages/backend → …/packages/backend
const staticPath = path.resolve(process.cwd(), STATIC_DIR);


const app = express();
app.use(express.static(STATIC_DIR));

/*function waitDuration(numMs: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, numMs));
}

async function awaitDuration(thing : Promise<void>){

    await thing;

}*/

app.get(Object.keys(ValidRoutes), (_req, res) =>{


    res.sendFile(staticPath)

}

    )



app.get("/api/images", (_req, res) => {

    fetchDataFromServer().then(data => res.send(data))

});



app.listen(PORT, () => console.log(`Listening on ${PORT}`));

