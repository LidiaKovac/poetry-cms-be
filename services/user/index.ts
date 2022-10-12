import { Request, RequestHandler, Router } from "express"
import passport from "passport"
import { hideId, verifyId } from "../../utils/auth.js"
import User from "./schema.js"
export const userRoute = Router()

userRoute.get("/login/callback", passport.authenticate("google", { failureRedirect: "http://localhost:3000/login" }), async (req, res, next) => {
  try {
    const hiddenId = await hideId(req.user as IUser)
    res.redirect("http://localhost:3000?id=" + hiddenId);
  } catch (error) {
    next(error)
  }
})

userRoute.get("/login", passport.authenticate("google", { scope: ["profile"] }))
userRoute.get("/me", async (req, res, next) => {
  try {
    const user = await verifyId(req.headers['authorization'] as string)
    
    if(user) {
      let foundUser = await User.findById(user._id)
      console.log(user);
      
      res.send(foundUser)
    } else res.redirect("http://localhost:3000/login")
  } catch (error) {
    next(error)
  }
})

