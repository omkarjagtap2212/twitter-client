import axios from "axios"
import { prismaClient } from "../../client/db"
import JWTServices from "../../services/jwt"
import { GraphqlContext } from "../../interfaces"
import { User } from "@prisma/client"
import UserService from "../../services/user"
// import { mutations } from './mutation';


// import JWT



const queries = {

    verfiyGoogleToken: async (parent: any, { token }: { token: string }) => {
        //    / return token
        const resultToken = await UserService.verifyGoogleAuthToken(token)
        return resultToken




    },

    getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
        // console.log(ctx)
        const id = ctx.user?.id
        if (!id) return null

        const user = await UserService.getUserById(id)
        return user
    },
    getUserById: async (parent: any, { id }: { id: string }, ctx: GraphqlContext) => UserService.getUserById(id)
}


export const extraResolvers = {

    User: {
        tweets: (parent: User) =>
            prismaClient.tweet.findMany({ where: { author: { id: parent.id } } }),

        followers: async(parent: User) => {
            const result = await prismaClient.follows.findMany({
                where: { following: { id: parent.id } },
                include: {
                    follower: true,
                }


            })
            return result.map((el)=>el.follower)
        },

        following: async (parent: User) => {
            const result = await prismaClient.follows.findMany({
                where: { follower: { id: parent.id } },
                include: {
                    following: true,
                }

            })
            // console.log(result)
            // return
            return result.map((el) => el.following)

        }

    }
}


const mutations = {
    followUser: async (parent: any, { to }: { to: string }, ctx: GraphqlContext) => {
        if (!ctx.user || !ctx.user.id) throw new Error("unaunthicated..")
        await UserService.followUser(ctx.user.id, to)
        return true

    },
    unfollowUser: async (parent: any, { to }: { to: string }, ctx: GraphqlContext) => {
        if (!ctx.user || !ctx.user.id) throw new Error("unaunthicated..")
        await UserService.unfollowUser(ctx.user.id, to)
        return true

    }
}
export const resolvers = { queries, extraResolvers, mutations }