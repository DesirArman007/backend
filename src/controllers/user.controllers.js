import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiErro.js'
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'

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
    console.log("fullname:",fullname);

    if(
        [fullname,email,username,password].some((field)=>
        field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are Required")
    }

    const existedUser = User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409,"User with email or username already exist")
     }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

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

    console.log("createdUserId ",createdUserId);

    if(!createdUserId){
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    

    return res.status(201).json(
        new ApiResponse(200, createdUserId, "User registered Successfully")
    )

})


export {registerUser}