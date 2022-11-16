const bcrypt = require('bcrypt');
const usermodel =require('../models/user-schema')
const categoryModel = require('../models/category-schema');
const adminModel = require('../models/admin-schema');
const productModel = require('../models/product-schema');
let userSignin;
 
module.exports.user_home =async(req,res)=>{
    try{
        
      const  userId=req.session.userId
    const user=await usermodel.findById(userId)
    const categories=await categoryModel.find()
    const products=await productModel.find()
        res.render('user/index',{user,categories,products})
    }catch(error){
        console.log(error.message);
    }
        } 
            
//user sign in

module.exports.user_signin =async(req,res)=>{
     userSignin=req.session.user
    if(userSignin){
       res.redirect('/')
    }else{
        res.render('user/signin') 
    }
    
}
module.exports.do_signin= async(req,res)=>{
   try{
    const userData=req.body
   const dbData=await usermodel.findOne({email:userData.email})
   if(userData.email=="" && userData.password==""){
    res.render('user/signin',{userErr:'Please enter the valid emial and password'})
   }else{ 
   if(dbData){
   const dbPassword= await bcrypt.compare(userData.password,dbData.password)
   if(dbPassword){
    const user=await usermodel.findById(dbData._id)
    if(user.isBanned){
        req.session.userId=false
        res.render('user/signin',{banErr:'you are banned for few days'})
    }else{
        req.session.user=true
    req.session.userId=dbData._id
    res.redirect('/')
    }    
   }else{ 
    res.render('user/signin',{passErr:'Invalid  password !'})
   }
 }else{
    res.render('user/signin',{emailErr:'Invalid email !'})
 }
}

}catch(error){
    console.log(error);
}
} 


//user signup
module.exports.user_signup=(req,res)=>{
   userSignin=req.session.user
   if(userSignin){
    res.redirect('/')
   }else{
     res.render('user/signup') 
   }
   
}
module.exports.do_signup=async (req,res)=>{
    const emailCheck=req.body.email
    const existEmail=await usermodel.findOne({email:emailCheck})
    if(existEmail){
        res.render('user/signup',{checkEmailErr:'This email already existed'})
    }else{
        const userDetails=req.body
        userDetails.password=await bcrypt.hash(userDetails.password,10)
        await usermodel.create(userDetails).then((data)=>{
               console.log(userDetails);
               console.log(data)
        req.session.user=true
        req.session.userId=data._id
        res.redirect('/')
        })
}
}
//user Logout 
module.exports.user_logout=(req,res)=>{
    req.session.user=false
    req.session.userId=null
    res.redirect('/')
   

}

//user shop page 
module.exports.view_shop=async(req,res)=>{
   const categories=await categoryModel.find()
   const products=await productModel.find()
   const  userId=req.session.userId
   const user=await usermodel.findById(userId)
   console.log(categories);
    res.render('user/shop',{categories,products,user})
}
//product details display page
module.exports.view_details=async(req,res)=>{
    const {id}=req.query
    const products = await productModel.findById(id)
    const product=await productModel.find()
    const  userId=req.session.userId
    const user=await usermodel.findById(userId)
      res.render('user/productDetails',{products,product,user})

}