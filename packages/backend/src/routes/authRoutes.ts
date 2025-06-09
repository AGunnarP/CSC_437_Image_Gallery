import express from "express";
import { CredentialsProvider } from "../CredentialsProvider"
import { mongoClient } from "../common/ApiImageData";
import { jwtSecret } from "../index"

import jwt from "jsonwebtoken";

interface IAuthTokenPayload {
    username: string;
}

function generateAuthToken(username: string, jwtSecret: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const payload: IAuthTokenPayload = {
            username
        };
        jwt.sign(
            payload,
            jwtSecret,
            { expiresIn: "1d" },
            (error, token) => {
                if (error) reject(error);
                else resolve(token as string);
            }
        );
    });
}



export function registerAuthRoutes(app: express.Application) {

    const provider = new CredentialsProvider(mongoClient)

    /*app.get("/login", (_req, res) => {

        res.status(200).send("yurp");

    });*/

    app.post("/auth/login",  (req, res) => {

        const { username, password } = req.body;
    
        if (!username || !password) {
            res.status(400).send({ error: "Username and password required" });
            return;
        }
    
        provider.verifyPassword(username, password).then(response => {

            if(response === true){

                if (!jwtSecret) 
                throw new Error("Missing JWT_SECRET in environment variables");

                const trimmedUsername = username.trim();
                generateAuthToken(trimmedUsername, jwtSecret).then(token => res.status(200).json({ token }))

            }else
                res.status(401).send({ error: "Incorrect username or password" });

        });
        
      });

    app.post("/auth/register", (req, res) => {
        provider.registerUser(req.body.username,req.body.password).then(response => res.send(response))
      });

}