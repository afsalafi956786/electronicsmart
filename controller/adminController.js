
const adminModel = require('../models/admin-schema')
const adminSchema = require('../models/admin-schema')
const usermodel = require('../models/user-schema')
const categoryModel = require('../models/category-schema')
const orderModel = require('../models/order-shema')
const productModel = require('../models/product-schema')
const couponModel = require('../models/coupen-schema')
const multer = require('multer')
const moment = require('moment')
const bannerModel = require('../models/banner-schema')
const hbs = require('hbs')
const { findByIdAndUpdate } = require('../models/admin-schema')
const { json } = require('express')
let msg;
let msg1;
let bannerMsg;






// Get index page
module.exports.admin_home = async (req, res, next) => {
    try {
        const adminId = req.session.adminId
        const admin = await adminModel.findById(adminId)
        const users = await usermodel.find().count()
        const order = await orderModel.find()
        const category = await categoryModel.find().count()
        const totalsale = order.reduce((acc, cur) => (acc + cur.total), 0)
        const products = await productModel.find({ isdelete: false }).count()
        const orders = await orderModel.find().populate('user').sort({ createdAt: -1 }).limit(8)
        let date = new Date();
        for (let i = 0; i < orders.length; i++) {
            let dates = orders[i].createdAt;
            orders[i].date = moment(date).format("DD MMMM , YYYY");
        } 
          
        //income statistic graph
        let salesbymonth = await orderModel.aggregate([
            {
                $project: {
                    'total': true,
                    'createdAt': true,
                }
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    total: { '$sum': '$total' }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ])
        const month = [
            "jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",

        ]

        salesbymonth = month.map((el, ind) => {
            const found = salesbymonth.find((elm) => elm._id === ind + 1)
            return found ? found.total : 0
        })
        salesbymonth = JSON.stringify(salesbymonth)

        const today = moment().startOf('day')
        sales = await orderModel.find({
           createdAt: {
             $gte: today.toDate(),
             $lte: moment(today).endOf('day').toDate()
           }
         }).populate('user')
         
         for(let i=0;i<sales.length;i++){
           const todayDate=sales[i].createdAt;
           sales[i].date= moment(todayDate).format("DD MMMM , YYYY");
         }

        res.render('admin/index', { admin, totalsale, users, category, products, orders, salesbymonth,sales })
    } catch (error) {
        next(error)

    }


}

// sales report dashboard
module.exports.sale_report=async(req,res,next)=>{
    try {
        const {keyValue}=req.body
        console.log(keyValue)
        let sales
        if(keyValue==1){
            const today = moment().startOf('day')
             sales = await orderModel.find({
                createdAt: {
                  $gte: today.toDate(),
                  $lte: moment(today).endOf('day').toDate()
                }
              }).populate('user')
              
              for(let i=0;i<sales.length;i++){
                const todayDate=sales[i].createdAt;
                sales[i].date= moment(todayDate).format("DD MMMM , YYYY");
              }
               
             
         } else if(keyValue==2){
            const week = moment().startOf('week')
            sales = await orderModel.find({
               createdAt: {
                 $gte: week.toDate(),
                 $lte: moment(week).endOf('week').toDate()
               }
             }).populate('user')
             for(let i=0;i<sales.length;i++){
                const testDate=sales[i].createdAt
                sales[i].date=moment(testDate).format("DD MMMM , YYYY");
             }

        }else if(keyValue==3){
            const month = moment().startOf('month')
            sales = await orderModel.find({
              createdAt:{
                  $gte:month.toDate(),
                  $lte:moment(month).endOf('month').toDate()
              }
            }).populate('user')
            for (let i = 0; i < sales.length; i++) {
                const testDate = sales[i].createdAt;
                sales[i].date = moment(testDate).format("DD MMMM , YYYY");
            }
        }else if(keyValue==4){
            const year = moment().startOf('year')
            sales = await orderModel.find({
              createdAt:{
                  $gte:year.toDate(),
                  $lte:moment(year).endOf('year').toDate()
              }
            }).populate('user')
            for (let i = 0; i < sales.length; i++) {
                const testDate = sales[i].createdAt;
                sales[i].date = moment(testDate).format("DD MMMM , YYYY");
            }
            
        }else{
           
            sales=0
        }
        res.json({status:true,sales})
    } catch (error) {
        console.log(error)
        next(error)
        
    }
}

// Get Admin Signin
module.exports.admin_signin = (req, res,next) => {
    try {
          adminSignin = req.session.admin
    if (adminSignin) {
        res.render('admin/index')
    } else {
        res.render('admin/signin')
    }
    } catch (error) {
      next(error)  
    }
  
}

//post admin Signin
module.exports.admin_doSignin = async (req, res,next) => {
    try {
        const adminData = req.body

        const adminDb = await adminModel.findOne({ email: adminData.email })
        if (adminData.email == "" && adminData.password == "") {
            res.render('admin/signin', { nullError: " Please Enter the Valid emial and password " })
        } else {
            if (adminDb) {
                const adminPass = await adminModel.findOne({ password: adminData.password })
                if (adminPass) {
                    req.session.admin = true
                    req.session.adminId = adminDb._id
                    res.redirect('/admin')
                } else {
                    res.render('admin/signin', { adminPassErr: "Invalid Password !" })
                }

            } else {
                res.render('admin/signin', { adminEmailErr: "Invalid Email !" })
            }
        }
    } catch (error) {
        next(error)
    }
}
//Admin Logout
module.exports.admin_Logout = (req, res,next) => {
    try {
   req.session.admin = false
    res.redirect('/admin/signin')
    } catch (error) {
        next(error)
    }


}

//user finding
module.exports.view_user = async (req, res,next) => {
    try {
        const userManage = req.body
        const adminId = req.session.adminId
        const admin = await adminModel.findById(adminId)
        console.log(userManage);
        getUsers = await usermodel.find()
        res.render('admin/user', { getUsers, admin })
    } catch (error) {
        next(error)
    }

}
//Block Users
module.exports.block_User = async (req, res,next) => {
    try {
        const userId = req.query.userId
        console.log(userId);
        await usermodel.findByIdAndUpdate(userId, { isBanned: true })
        res.redirect('/admin/user')

    } catch (error) {
        next(error)
    }

}
//Active Users
module.exports.Active_User = async (req, res,next) => {
    try {
        activeId = req.query.activeId
        console.log(activeId);
        await usermodel.findByIdAndUpdate(activeId, { isBanned: false })
        res.redirect('/admin/user')
    } catch (error) {
      next(error)
    }
}
//category page view
module.exports.view_category = async (req, res,next) => {
    try {
        const adminId = req.session.adminId
        const admin = await adminModel.findById(adminId)
        const categories = await categoryModel.find()
        res.render('admin/category', { categories, msg1, admin })
        msg1 = false
    } catch (error) {
      next(error)
    }
}
//category add
module.exports.add_category = async (req, res,next) => {
    try {

        let category = req.body
  
        category.imgCategory = req.files
        console.log(category);
        await categoryModel.create(category)
        msg1 = true
        res.redirect('/admin/category')
    } catch (error) {
        next(error)
    }
}

//category edit
module.exports.edit_category = async (req, res,next) => {
    try {
        const { _id } = req.query
        const imgCategory = req.files
        console.log(imgCategory);
        if (imgCategory != '')
            await categoryModel.updateOne({ _id: _id }, {
                $set: {
                    category: req.body.category,
                    imgCategory: req.files
                }

            })
        else
            await categoryModel.updateOne({ _id: _id }, {
                $set: {
                    category: req.body.category,
                }

            })

        res.redirect('/admin/category')

    } catch (error) {
       next(error)
    }
}

//category delete
module.exports.delete_category = async (req, res,next) => {
    try {
        const deleteId = req.params.id
        console.log(deleteId);
        await categoryModel.findByIdAndDelete(deleteId)
        res.redirect('/admin/category')
    } catch (error) {
        next(error)
    }

}

//product page view
module.exports.view_product = async (req, res,next) => {

    try {
        const adminId = req.session.adminId
        const admin = await adminModel.findById(adminId)
        const getProducts = await productModel.find({ isdelete: false })
        res.render('admin/product', { getProducts, msg, admin });
        msg = false
    } catch (error) {
     next(error)
    }

}
//view addProduct page
module.exports.view_addProduct = async (req, res,next) => {
    try {
        const adminId = req.session.adminId
        const admin = await adminModel.findById(adminId)
        const categories = await categoryModel.find()
        res.render('admin/addProduct', { categories, admin })
    } catch (error) {
        next(error)
    }

}
//add product page
module.exports.add_product = (req, res,next) => {
    try {

        const products = req.body;
        products.product_image = req.files
        productModel.create(products)
        msg = true;
        res.redirect('/admin/product')
    } catch (error) {
     next(error)
    }
}
//view edit product page
module.exports.view_editProduct = async (req, res,next) => {
    const adminId = req.session.adminId
    const admin = await adminModel.findById(adminId)
    try {
        const { id } = req.query
        const categories = await categoryModel.find()
        const products = await productModel.findById(id)
        res.render('admin/editProduct', { products, categories, admin })
    } catch (error) {
       next(error)
    }

}

// edit products
module.exports.edit_product = async (req, res,next) => {
    try {
        const { _id } = req.query
        const edit = req.body
        const product_image = req.files
        console.log(product_image);
        if (product_image != '')
            await productModel.findByIdAndUpdate(_id, {
                name: edit.name,
                category: edit.category,
                price: edit.price,
                description: edit.description,
                specification:edit.specification,
                stock: edit.stock,
                brand: edit.brand,
                product_image: product_image

            })
        else
            await productModel.findByIdAndUpdate(_id, {
                name: edit.name,
                category: edit.category,
                price: edit.price,
                description: edit.description,
                specification:edit.specification,
                stock: edit.stock,
                brand: edit.brand,

            })
           
        res.redirect('/admin/product')
    } catch (error) {
        next(error)

    }


}
//delete products
module.exports.delete_product = async (req, res,next) => {
    try {
        productId = req.params.id
        console.log(productId)
        await productModel.findByIdAndUpdate(productId, { isdelete: true })
        res.redirect('/admin/product')
    } catch (error) {
        next(error)
    }
}
// const images=await productModel.findById(productId)

//  images.product_image.forEach((elm)=>{
//     console.log(elm.path)
//     let dd=elm.path
//    fs.unlinkSync('./'+dd);

// })


module.exports.order_manage = async (req, res, next) => {
    try {
        const adminId = req.session.adminId
        const admin = await adminModel.findById(adminId)
        let order = await orderModel.find().populate('user').populate('products').sort({ createdAt: -1 }).lean()
        date = new Date()
        for (let i = 0; i < order.length; i++) {
            const createdAt = order[i].createdAt
            order[i].date = moment(createdAt).format("DD MMMM , YYYY");
        }


        res.render('admin/order', { order, admin })
    } catch (error) {
        next(error)
    }


}
//change order status
module.exports.change_status = async (req, res, next) => {
    try {
        const { orderId, status } = req.body
        await orderModel.findByIdAndUpdate(orderId, {
            status: status
        })
        res.json(true)

    } catch (error) {
        next(error)

    }

}
//coupon page view

module.exports.coupon_view = async (req, res, next) => {
    try {
        const adminId = req.session.adminId
        const admin = await adminModel.findById(adminId)
        const coupons = await couponModel.find().lean()
        let date = new Date();
        for (let i = 0; i < coupons.length; i++) {
            const startdate = coupons[i].startDate;
            const enddate = coupons[i].endDate;
            coupons[i].start = moment(startdate).format("DD MMMM , YYYY");
            coupons[i].end = moment(enddate).format("DD MMMM , YYYY");

        }
        res.render('admin/coupen', { admin, coupons })

    } catch (error) {
        next(error)

    }
}
//coupon add page view
module.exports.coupon_addview = async (req, res, next) => {
    try {
        const adminId = req.session.adminId
        const admin = await adminModel.findById(adminId)
        res.render('admin/couponsAdd', { admin })
    } catch (error) {
        next(error)

    }
}
//coupen adding post
module.exports.add_coupon = async (req, res, next) => {
    try {

        data = req.body
        await couponModel.create(data)
        res.redirect('/admin/coupon-view')
    } catch (error) {
        next(error)
    }
}
//edit coupon view page
module.exports.edit_view = async (req, res, next) => {
    try {
        const couponId = req.params.id
        const adminId = req.session.adminId
        const admin = await adminModel.findById(adminId)
        //use ful method
        const coupon = await couponModel.findById(couponId).lean()
        if (coupon.status == 'disabled') {
            coupon.statusCheck = false
        } else {
            coupon.statusCheck = true
        }
        //end
        if (coupon.type == 'amount') {
            coupon.check = false
        } else {
            coupon.check = true
        }

        res.render('admin/editCoupon', { admin, coupon })
    } catch (error) {

        next(error)
    }

}
//coupon edit post
module.exports.edit_coupon = async (req, res, next) => {
    try {
        const data = req.body
        const { id } = req.query
        console.log(data);
        await couponModel.findByIdAndUpdate(id, data)
        res.redirect('/admin/coupon-view')
    } catch (error) {
        console.log(error);
        next(error)

    }

}
module.exports.delete_coupon = async (req, res, next) => {
    try {
        const { coupon } = req.body
        console.log(coupon);
        await couponModel.findByIdAndDelete(coupon)
        res.json(true)
    } catch (error) {

    }

}
//verify coupon is available or not
module.exports.check_coupon = async (req, res, next) => {
    try {
        const { couponCheckId } = req.body
        const coupon = await couponModel.findOne({ code: couponCheckId.trim() })
        if (coupon != null) {
            res.json({ status: true, coupon })
        } else {
            res.json({ status: false, couponErr: 'Sorry no coupon available' })
        }
    } catch (error) {
        next(error)

    }

}
//banner view
module.exports.banner_view = async (req, res, next) => {
    try {
        const adminId = req.session.adminId
        const admin = await adminModel.findById(adminId)
        const banner = await bannerModel.find()

        res.render('admin/banner', { admin, banner, bannerMsg })
        bannerMsg = false
    } catch (error) {
        next(error)

    }

}
module.exports.addBanner_view = async (req, res, next) => {
    try {
        const adminId = req.session.adminId
        const admin = await adminModel.findById(adminId)
        const banner = await bannerModel.find()
        res.render('admin/addbanner', { admin, banner })
    } catch (error) {
        next(error)
    }

}
module.exports.add_banner = async (req, res, next) => {
    try {
        const banner = req.body
        banner.imgBanner = req.files
        if (banner.imgBanner.length != 0) {
            await bannerModel.create(banner)
            bannerMsg = true;
            res.redirect('/admin/banner')
        } else {
            const adminId = req.session.adminId
            const admin = await adminModel.findById(adminId)
            res.render('admin/addbanner', { imgErr: 'banner is invalid ! please choose a banner image', admin })
        }

    } catch (error) {
        next(error)
    }


}
//banner delete
module.exports.delete_banner = async (req, res, next) => {
    try {
        const { bannerId } = req.body
        await bannerModel.findByIdAndDelete(bannerId)
        res.json(true)
    } catch (error) {
        next(error)

    }

}




