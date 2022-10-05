import { Strategy } from "passport-google-oauth20"
import passport from "passport"
import User from "../services/user/schema.js"
import { config } from "dotenv"
import jtw from "jsonwebtoken"

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
                req.user = newUser
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

export const hideId = (user: IUser) => {
    return new Promise((resolve, reject) => {
        console.log("hiding this", user);
        
        return jtw.sign({name: user.name, googleID: user.googleID, _id: user._id, profilePic: user.profilePic}, SESSION_SECRET!, { expiresIn: '1 day' }, (err, hiddenId) => {
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