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
router.get('/user/block',authentication.adminAuthentication,adminController.block_User)
router.get('/user/active',authentication.adminAuthentication,adminController.Active_User)    
        
//admin category view router   
router.get('/category',authentication.adminAuthentication,adminController.view_category)
router.post('/addCategory',authentication.adminAuthentication,uploadfile.upload.array('image') ,adminController.add_category)
router.post('/category/edit',authentication.adminAuthentication,uploadfile.upload.array('image') ,adminController.edit_category)
router.get('/category/delete/:id',authentication.adminAuthentication,adminController.delete_category)
   
    
//admin product view router
router.get('/product',authentication.adminAuthentication,adminController.view_product)
router.get('/product/addProduct',authentication.adminAuthentication,adminController.view_addProduct)
router.post('/product/addProduct',authentication.adminAuthentication,uploadfile.upload.array('image',4),adminController.add_product)
router.get('/product/edit',authentication.adminAuthentication,adminController.view_editProduct)
router.post('/product/editProduct',authentication.adminAuthentication,uploadfile.upload.array('image',4),adminController.edit_product) 
router.get('/product/deleteProduct/:id',authentication.adminAuthentication,adminController.delete_product)


//order page view 
router.get('/order-manage',authentication.adminAuthentication,adminController.order_manage)
router.post('/change-status',authentication.adminAuthentication,adminController.change_status)


//coupen view 
router.get('/coupon-view',authentication.adminAuthentication,adminController.coupon_view)
router.get('/add-coupon',authentication.adminAuthentication,adminController.coupon_addview)
router.post('/add-coupon',authentication.adminAuthentication,adminController.add_coupon)
router.get('/edit-coupon/:id',authentication.adminAuthentication,adminController.edit_view)
router.post('/edit-coupon',authentication.adminAuthentication,adminController.edit_coupon)
router.post('/delete-coupon',authentication.adminAuthentication,adminController.delete_coupon)

//coupen validation check
router.post('/check-coupon',adminController.check_coupon)
//banner view and add
router.get('/banner',authentication.adminAuthentication,adminController.banner_view)
router.get('/add-banner',authentication.adminAuthentication,adminController.addBanner_view)
router.post('/add-banner',authentication.adminAuthentication,uploadfile.upload.array('image'),adminController.add_banner)
router.post('/banner-delete',authentication.adminAuthentication,adminController.delete_banner)


// dashboard routes
router.post('/sales-report',authentication.adminAuthentication,adminController.sale_report)

module.exports=router           