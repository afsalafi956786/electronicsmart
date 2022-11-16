const express=require('express')
const router=express.Router()
const authentication = require('../middelware/authentication')
const userController = require('../controller/userController')

// get user home page 
router.get('/',userController.user_home) 

//get user router signup,signin
router.get('/signin',userController.user_signin)
router.get('/signup',userController.user_signup)
router.post('/signup',userController.do_signup)
router.post('/signin',userController.do_signin,)
router.get('/logout',userController.user_logout) 

//get user shop page 
router.get('/shop',userController.view_shop)
 
//get productDetails page display 
router.get('/productDetails',userController.view_details)

           
module.exports=router                                                      