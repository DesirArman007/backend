import { v2 as cloudinary } from 'cloudinary';
import { log } from 'console';

import fs from "fs"

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

    const uploadOnCloudinary = async (localFilePath)=>{
        try{
            if(!localFilePath) return "Path not found"
                // upload file on clloudinary
           const response = await cloudinary.uploader.upload(localFilePath, {
                 resource_type: "auto"
            })
            // file has been uploaded successfully
            console.log("file uploaded on cloudinary",response.url);
            return response
        } catch (error){
            // remove the locally saved temp file as the upload operation got failed
            fs.unlinkSync(localFilePath)
            return null;
        }
    }


    export {uploadOnCloudinary}