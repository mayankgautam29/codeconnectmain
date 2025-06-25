import mongoose from "mongoose"
export async function connect(){
    try {
        await mongoose.connect(process.env.MONGO_URI!)
        const connection = mongoose.connection;
        connection.on("connecteed",() => {
            console.log("Database connected in dbconfig")
        })
        connection.on("error",() => {
            console.log("Error in dbconfig try")
        })
    } catch (error:any) {
        console.log(error.message);
        console.log("Error from the dbconfig catch")
    }
}