
const session = require('express-session');

module.exports.userAuthentication= (req,res,next)=>{
    try{
    const userSignin=req.session.user
    if(userSignin){
        next()
    }else{
        res.redirect('/signin')  
    }
} catch(error){
    console.log(error); 
}

 }

 module.exports.adminAuthentication=(req,res,next)=>{
    try{
      const  adminSignin=req.session.admin
        if(adminSignin){
            next()
        }else{
            res.redirect('/admin/signin')
        }
    }catch(error){
        console.log(error);   
    } 

 }