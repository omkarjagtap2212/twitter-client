import axios from "axios"
import { prismaClient } from "../../client/db"
import JWTServices from "../../services/jwt"
import { GraphqlContext } from "../../interfaces"


// import JWT

interface GoogleTokanResult{
    iss?: string
  azp?:string 
  aud?: string
  sub?: string
  email: string
  email_verified:string
  nbf?:string
  name?: string
  given_name:string
  family_name?:string
  locale?: string
  iat?: string
  exp?:string 
  jti?: string
  alg?: string
  kid?: string
  typ ?:string
  picture?:string
}


 const queries ={

    verfiyGoogleToken:async(parent: any,{token}:{token:string})=>{
    //    / return token
        const googleToken=token

    const GoogleOauthURL =new URL("https://oauth2.googleapis.com/tokeninfo")
    GoogleOauthURL.searchParams.set("id_token",googleToken)


    const {data}=await axios.get<GoogleTokanResult>(GoogleOauthURL.toString(), {
        responseType:"json"
       })


       const user = await prismaClient.user.findUnique({
        where: {email: data.email},
       })


       if(!user){
        await prismaClient.user.create({
            data:{
                email:data.email,
                firstName:data.given_name,
                lastName:data.family_name,
                profileImage:data.picture,

            },
        })
       }

   

    const userInDb =await prismaClient.user.findUnique({
        where :{email:data.email}
    })


    if(!userInDb)  throw new Error("user not found")
       

    const userToken =JWTServices.generateTokenForUser(userInDb)
    return userToken

    //    return "your are succesfully created JWT authentiactions"


    },

    getCurrentUser:async (parent:any,args:any,ctx:GraphqlContext)=>{
        // console.log(ctx)
      const id=ctx.user?.id
      if(!id) return null

      const user= await prismaClient.user.findUnique({where :{id}})
      return user
    }
}


export const resolvers ={queries}