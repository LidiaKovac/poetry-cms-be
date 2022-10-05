import { Strategy } from "passport-google-oauth20"
import passport from "passport"
import User from "../services/user/schema.js"
import { config } from "dotenv"
import jtw from "jsonwebtoken"
import { addHoursToToday } from "./index.js"
import { NextFunction, Request, Response } from "express"

config()
const { G_CLIENT_ID, G_CLIENT_SECRET, G_CB, SESSION_SECRET } = process.env

export const passportInit = () => passport.use(new Strategy({
    clientID: G_CLIENT_ID!,
    clientSecret: G_CLIENT_SECRET!,
    callbackURL: G_CB,
    passReqToCallback: true,
},
    async function (req, accessToken, refreshToken, profile, cb) {
        try {


            let user = await User.findOne({ googleID: profile.id })
            if (user) {
                console.log("🌚 Passport initialized")
                req.user = user
                console.log(user)
            } else {
                console.log("🌝 User not found.. Creating!");
                console.log(profile)

                let newUser = new User({ name: profile.name?.givenName, googleID: profile.id, profilePic: profile.photos![0].value })
                await newUser.save()
                req.user = newUser as IUser
                cb("", newUser)
            }

            cb("", user || undefined)

        } catch (error) {
            console.log(error)
        }
    }))
passport.serializeUser(function (user, next) {
    next(null, user);
});

export const checkUser = async(req:Request,res:Response,next:NextFunction) => {
    try {
        let token = req['headers'].authorization
        if(!token) {
            res.sendStatus(400)
        } else {
            let decoded = await verifyId(token)
            if(decoded._id) {
                req.user = decoded
            } else res.redirect("/login")
            next()
        }
    } catch (error) {
        next(error)
    }
}

export const hideId = (user: IUser) => {
    return new Promise((resolve, reject) => {
        
        console.log("hiding this", user);
        let objectToHide = {
            
            name: user.name, 
            googleID: user.googleID, 
            _id: user._id, 
            profilePic: user.profilePic
        }
        return jtw.sign(objectToHide, SESSION_SECRET!, { expiresIn: '1 day' }, (err, hiddenId) => {
            if (err) reject(err)
            else resolve(hiddenId)
        })
    })
}

export const verifyId = (hiddenId: string): Promise<IUser> => {
    return new Promise((resolve, reject) => {
        return jtw.verify(hiddenId, SESSION_SECRET!, (err, id) => {
            if (err) {
                reject(err)
            }
            else {
                console.log("getting this", id);

                resolve(id as IUser)
            }
        })
    })
}