import axios from "axios"
import { prismaClient } from "../../client/db"
import JWTServices from "../../services/jwt"
import { GraphqlContext } from "../../interfaces"
import { User } from "@prisma/client"
import UserService from "../../services/user"


// import JWT



const queries = {

    verfiyGoogleToken: async (parent: any, { token }: { token: string }) => {
        //    / return token
        const resultToken =await UserService.verifyGoogleAuthToken(token)
        return resultToken
         



    },

    getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
        // console.log(ctx)
        const id = ctx.user?.id
        if (!id) return null

        const user = await UserService.getUserById(id)
        return user
    },
    getUserById:async (parent:any,{id}:{id:string},ctx:GraphqlContext)=>UserService.getUserById(id)
}


export const extraResolvers = {

    User: {
        tweets: (parent: User) => prismaClient.tweet.findMany({ where: { author: { id: parent.id } } })
    }
}

export const resolvers = { queries, extraResolvers }