import { Tweet } from "@prisma/client";
import { prismaClient } from "../../client/db";
import { GraphqlContext } from "../../interfaces";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import UserService from "../../services/user";
import TweetService, { CreateTweetPayload } from "../../services/tweet";
// import { Tweet } from './index';



const s3Client = new S3Client({
    region:process.env.AWS_DEFAULT_REGION
})
const queries = {
    getAllTweets: () => TweetService.getAllTweets(),
    getSignedURLForTweet: async (parent: any, { imageType, imageName }: { imageType: string, imageName: string }, ctx: GraphqlContext
    ) => {
        if (!ctx.user || !ctx.user.id) throw new Error("Unaunthenticated")

        const allowedImagesTypes = [
            "image/JPG",
            "image/jpeg",
            "image/png",
            "image/webp",

        ]

        if (!allowedImagesTypes.includes(imageType)) throw new Error("Unsupported Image Format")


        const putObjectCommand = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `uploads/
            ${ctx.user.id}
            /tweets/${imageName}-${Date.now()}.${imageType}
            `

        })

        const signedURL = await getSignedUrl(s3Client, putObjectCommand)
        return signedURL



    },
}




const muatations = {
    createTweet: async (
        parent: any,
        { payload }: { payload: CreateTweetPayload },
        ctx: GraphqlContext) => {

        if (!ctx.user) throw new Error("you are not Verified")
        const tweet = await TweetService.createTweet({
            ...payload,
            userId: ctx.user.id,
        })
        return tweet
    },

}

const extraResolvers = {
    Tweet: {
        author: (parent: Tweet) => UserService.getUserById(parent.authorId)

    }
}

export const resolvers = { muatations, extraResolvers, queries }