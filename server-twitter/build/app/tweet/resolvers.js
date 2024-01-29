"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const user_1 = __importDefault(require("../../services/user"));
const tweet_1 = __importDefault(require("../../services/tweet"));
// import { Tweet } from './index';
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_DEFAULT_REGION
});
const queries = {
    getAllTweets: () => tweet_1.default.getAllTweets(),
    getSignedURLForTweet: (parent, { imageType, imageName }, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        if (!ctx.user || !ctx.user.id)
            throw new Error("Unaunthenticated");
        const allowedImagesTypes = [
            "image/JPG",
            "image/jpeg",
            "image/png",
            "image/webp",
        ];
        if (!allowedImagesTypes.includes(imageType))
            throw new Error("Unsupported Image Format");
        const putObjectCommand = new client_s3_1.PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `uploads/
            ${ctx.user.id}
            /tweets/${imageName}-${Date.now()}.${imageType}
            `
        });
        const signedURL = yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, putObjectCommand);
        return signedURL;
    }),
};
const muatations = {
    createTweet: (parent, { payload }, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        if (!ctx.user)
            throw new Error("you are not Verified");
        const tweet = yield tweet_1.default.createTweet(Object.assign(Object.assign({}, payload), { userId: ctx.user.id }));
        return tweet;
    }),
};
const extraResolvers = {
    Tweet: {
        author: (parent) => user_1.default.getUserById(parent.authorId)
    }
};
exports.resolvers = { muatations, extraResolvers, queries };
