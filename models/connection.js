const mongoose=require('mongoose')
const connectDb = async (DATABASE_URL) => {
    try{
        const DB_OPTIONS ={dbName:'Electronics'}
        await mongoose.connect(DATABASE_URL,DB_OPTIONS )
        console.log('connected successfully..');
    }catch(error){
        console.log(error); 
    } 
}

    module.exports=connectDb  