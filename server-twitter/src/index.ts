import 'dotenv/config'
import * as dotenv from "dotenv"
import { initServer } from "./app";
import cors from 'cors';

dotenv.config()
// console.log(process.env)

const init=async()=>{
    const app=await initServer()
    app.use(cors())
    app.listen(8000,()=>console.log(`server ahs started :PORT 8000`))
}
init() 