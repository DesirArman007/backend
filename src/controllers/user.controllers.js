import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiErro.js'
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import jwt from "jsonwebtoken"

const registerUser= asyncHandler( async (req, res)=>{
    // get user details from frontend
    // validation if entered data in in correct format and is correctand not empty
    // check if user already exist: username , email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object- create entery in db
    // remove password and refresh token field from response
    // check for user creation
    // return response if user created

    // ---------------------------------

    // req.body mei saari details mil jati hai (agar form and json se data aa rha hai )
    // yahi pe data ko destructure kar liya (check usr schema for data u get)
    const {fullname,email, username, password}=req.body
    // console.log("fullname:",fullname);

    if(
        [fullname,email,username,password].some((field)=>
        field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are Required")
    }

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409,"User with email or username already exist")
     }


    //  console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path
     let coverImageLocalPath;
     if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
        coverImageLocalPath=req.files.coverImage[0].path
     }

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }    

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    // console.log(avatar);
    
    if(!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    // created object with the required fields
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUserId = await User.findById(user._id).select(
        "-password -refreshToken"
    ) 

    if(!createdUserId){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUserId, "User registered Successfully")
    )

})

const generateAcessAndRefreshTokens = async(userId)=>{
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken,refreshToken}

    }catch(error){
        throw new ApiError(500, "Something went wrong while acess and refresh token")
    }
}

const loginUser= asyncHandler( async (req, res)=>{

    // req body se data le ao
    // username or email
    // find the user
    // password check
    // accss and refresh token
    // send cookie

    const {email, username, password}=req.body
    
    if(! (username || email)){
        throw new ApiError(400, "Username or password is required")
    }

    const user = await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    
    if(!isPasswordValid){
        throw new ApiError(401, "Password invalid")
    }

    const {accessToken, refreshToken} = await generateAcessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


    const options={
        httpOnly:true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken", refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            }, "User logged in Successfully"
        )
    )

})



const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
        $set:{
            refreshToken:undefined
             }
        },
        {
           new: true
        }
    )

    const options={
        httpOnly:true,
        secure: true
    }


    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse (200,"User logged out sccessflu"))
    
    })   

const refreshAccessToken = asyncHandler(async( req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken ||req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }
        if(incomingRefreshToken!== user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used")
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
        const {accessToken, newRefreshToken}=await generateAcessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access token Refreshed"
    
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token")
    }
})

export {
    registerUser,
    logoutUser,
    loginUser,
    refreshAccessToken
}