import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";

class ImageFormatError extends Error {}

const storageEngine = multer.diskStorage({
    destination: function (req, file, cb) {
        // ✅ Save to the uploads folder at the project root
        const uploadPath = path.resolve(__dirname, "../../uploads");
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // ✅ Determine file extension based on mimetype
        let fileExtension: string;
        switch (file.mimetype) {
            case "image/png":
                fileExtension = "png";
                break;
            case "image/jpeg":
            case "image/jpg":
                fileExtension = "jpg";
                break;
            default:
                return cb(new ImageFormatError("Unsupported image type"), "");
        }

        // ✅ Generate a random filename
        const fileName =
            Date.now() + "-" + Math.round(Math.random() * 1e9) + "." + fileExtension;

        cb(null, fileName);
    }
});

export const imageMiddlewareFactory = multer({
    storage: storageEngine,
    limits: {
        files: 1,
        fileSize: 5 * 1024 * 1024 // 5 MB
    },
});

export function handleImageFileErrors(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof multer.MulterError || err instanceof ImageFormatError) {
        res.status(400).send({
            error: "Bad Request",
            message: err.message
        });
        return;
    }
    next(err); // Let the next middleware handle unexpected errors
}
``
