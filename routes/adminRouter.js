const express=require('express')
const router=express.Router()
const adminController=require('../controller/adminController')
const authentication = require('../middelware/authentication')
const multer=require('multer');
const uploadfile = require('../middelware/fileUpload')
  
  
// Get home and validation router
router.get('/',authentication.adminAuthentication,adminController.admin_home)
router.get('/signin',adminController.admin_signin)
router.post('/signin',adminController.admin_doSignin)
router.get('/logout',adminController.admin_Logout)   
     
//get userpage router 
router.get('/user',authentication.adminAuthentication,adminController.view_user) 
    
//user block, Active router 
router.get('/user/block',adminController.block_User)
router.get('/user/active',adminController.Active_User)   
        
//admin category view router  
router.get('/category',authentication.adminAuthentication,adminController.view_category)
router.post('/addCategory',uploadfile.upload.array('image') ,adminController.add_category)
router.post('/category/edit',uploadfile.upload.array('image') ,adminController.edit_category)
router.get('/category/delete/:id',adminController.delete_category)
   
    
//admin product view router
router.get('/product',authentication.adminAuthentication,adminController.view_product)
router.get('/product/addProduct',authentication.adminAuthentication,adminController.view_addProduct)
router.post('/product/addProduct',uploadfile.upload.array('image',4),adminController.add_product)
router.get('/product/edit',authentication.adminAuthentication,adminController.view_editProduct)
router.post('/product/editProduct',uploadfile.upload.array('image',4),adminController.edit_product) 
router.get('/product/deleteProduct/:id',adminController.delete_product)
  
module.exports=router          