import { Promise } from "mongoose"
// this method and try catch method does the same work
const asyncHandeler = (requestHandler) => {
    (req, res, next) =>{
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export {asyncHandeler}


// Now its an async function: const asyncHandeler = (fn) => async() => {}
// const asyncHandeler = (fn) => {() => {}} can be wriitern as down one


// const asyncHandeler = (fn) => async (req,res,next)=> {
//     try{
//         await fn(req,res,next)
//     }catch(error){
//         res.status(error.code || 500).json({
//             success: false,
//             message:error.message
//         })
//     }
// }