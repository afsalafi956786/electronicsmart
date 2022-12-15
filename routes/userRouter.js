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


//otp authentication  

router.post('/otp',userController.otp_Verify)

//get user shop page  
router.get('/shop',userController.view_shop)
 

//filter product and categories
router.get('/filter',userController.do_filter)

//get productDetails page display 
router.get('/productDetails',userController.view_details)

//get user cart page
router.get('/cart',authentication.userAuthentication,userController.view_cart)
router.get('/cart/:id',userController.add_cart)
router.post('/prodct-cart',authentication.userAuthentication,userController.product_cart)
router.post('/channgProductQuantity',authentication.userAuthentication,userController.change_quant)
router.post('/deleteCart',authentication.userAuthentication,userController.delete_cart)


//add user address
router.post('/add-address',authentication.userAuthentication,userController.add_address)
router.post('/edit-address',authentication.userAuthentication,userController.edit_address)
router.post('/delete-address',authentication.userAuthentication,userController.delete_address)

//place order
router.get('/placeOrder',authentication.userAuthentication,userController.place_order)
router.post('/place-order',authentication.userAuthentication,userController.placing_order)
//order success page
router.get('/order-success',authentication.userAuthentication,userController.order_success)

//order details page
router.get('/order-details',authentication.userAuthentication,userController.order_details)
router.post('/verify-payment',authentication.userAuthentication,userController.verify_payment)

//whislist page 
router.get('/wishlist',authentication.userAuthentication,userController.view_wishlist)
router.get('/wishlist/:id',userController.add_wishlist)
router.post('/delete-wishlist',authentication.userAuthentication,userController.delete_wishlist)

//user profile manage 
router.get('/account',authentication.userAuthentication,userController.account_view)

//user account details
router.get('/account-details',authentication.userAuthentication,userController.account_details)
router.post('/change-details',authentication.userAuthentication,userController.change_details)

//order cancel
router.post('/cancel-order',authentication.userAuthentication,userController.cancel_order)

//verify-payment 
router.post('/verify-payment',authentication.userAuthentication,userController.verify_payment)

//coupen view page
router.get('/coupon',authentication.userAuthentication,userController.coupon_view)



module.exports=router                                                      