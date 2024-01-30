import axios from "axios"
import { prismaClient } from "../client/db"
import JWTService from "./jwt"

interface GoogleTokanResult {
    iss?: string
    azp?: string
    aud?: string
    sub?: string
    email: string
    email_verified: string
    nbf?: string
    name?: string
    given_name: string
    family_name?: string
    locale?: string
    iat?: string
    exp?: string
    jti?: string
    alg?: string
    kid?: string
    typ?: string
    picture?: string
}



class UserService {
    public static async verifyGoogleAuthToken(token: string) {
        const googleToken = token

        const GoogleOauthURL = new URL("https://oauth2.googleapis.com/tokeninfo")
        GoogleOauthURL.searchParams.set("id_token", googleToken)


        const { data } = await axios.get<GoogleTokanResult>(GoogleOauthURL.toString(), {
            responseType: "json"
        })


        const user = await prismaClient.user.findUnique({
            where: { email: data.email },
        })


        if (!user) {
            await prismaClient.user.create({
                data: {
                    email: data.email,
                    firstName: data.given_name,
                    lastName: data.family_name,
                    profileImage: data.picture,

                },
            })
        }



        const userInDb = await prismaClient.user.findUnique({
            where: { email: data.email }
        })


        if (!userInDb) throw new Error("user not found")


        const userToken = JWTService.generateTokenForUser(userInDb)
        return userToken

    }

    public static getUserById(id: string) {
        return prismaClient.user.findUnique({ where: { id } })
    }

    public static followUser(from: string, to: string) {
        return prismaClient.follows.create({
            data: {
                follower: { connect: { id: from } },
                following: { connect: { id: to } },
            }
        })

    }

    public static unfollowUser(from: string, to: string) {
        return prismaClient.follows.delete({
            where: { followerId_followingId: { followerId: from, followingId: to } }
        })

    }
}

export default UserService