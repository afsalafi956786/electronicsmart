
const adminModel = require('../models/admin-schema')
const adminSchema = require('../models/admin-schema')
const usermodel = require('../models/user-schema')
const categoryModel = require('../models/category-schema')
const productModel = require('../models/product-schema')
const multer = require('multer')
const { findByIdAndUpdate } = require('../models/admin-schema')
let msg;
let msg1;




// Get index page
module.exports.admin_home = async (req, res, next) => {
    const adminId = req.session.adminId
    const admin = await adminModel.findById(adminId)
    res.render('admin/index', { admin })
}

// Get Admin Signin
module.exports.admin_signin = (req, res) => {
    adminSignin = req.session.admin
    if (adminSignin) {
        res.render('admin/index')
    } else {
        res.render('admin/signin')
    }
}

//post admin Signin
module.exports.admin_doSignin = async (req, res) => {
    try {
        const adminData = req.body
        console.log(adminData);

        const adminDb = await adminModel.findOne({ email: adminData.email })
        if (adminData.email == "" && adminData.password == "") {
            res.render('admin/signin', { nullError: " Please Enter the Valid emial and password " })
        } else {
            if (adminDb) {
                const adminPass = await adminModel.findOne({ password: adminData.password })
                if (adminPass) {
                    req.session.admin = true
                    // req.session.adminId=adminDb._id
                    res.redirect('/admin')
                } else {
                    res.render('admin/signin', { adminPassErr: "Invalid Password !" })
                }

            } else {
                res.render('admin/signin', { adminEmailErr: "Invalid Email !" })
            }
        }
    } catch (error) {
        console.log(error);
    }
}
//Admin Logout
module.exports.admin_Logout = (req, res) => {
    req.session.admin = false
    res.redirect('/admin/signin')

}

//user finding
module.exports.view_user = async (req, res) => {
    try {
        const userManage = req.body
        console.log(userManage);
        getUsers = await usermodel.find()
        res.render('admin/user', { getUsers })
    } catch (error) {
        console.log(error);
    }

}
//Block Users
module.exports.block_User = async (req, res) => {
    try {
        const userId = req.query.userId
        console.log(userId);
        await usermodel.findByIdAndUpdate(userId, { isBanned: true })
        res.redirect('/admin/user')

    } catch (error) {
        console.log(error);
    }

}
//Active Users
module.exports.Active_User = async (req, res) => {
    try {
        activeId = req.query.activeId
        console.log(activeId);
        await usermodel.findByIdAndUpdate(activeId, { isBanned: false })
        res.redirect('/admin/user')
    } catch (error) {
        console.log(error);
    }
}
//category page view
module.exports.view_category = async (req, res) => {
    try {
        const categories = await categoryModel.find()
        res.render('admin/category', { categories, msg1 })
        msg1 = false
    } catch (error) {
        console.log(error);
    }
}
//category add
module.exports.add_category = async (req, res) => {
    try {

        let category = req.body
        category.imgCategory = req.files
        console.log(category);
        await categoryModel.create(category)
        msg1 = true
        res.redirect('/admin/category')
    } catch (error) {
        console.log(error.message);
    }
}

//category edit
module.exports.edit_category = async (req, res) => {
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
        console.log(error.message);
    }
}

//category delete
module.exports.delete_category = async (req, res) => {
    try {
        const deleteId = req.params.id
        console.log(deleteId);
        await categoryModel.findByIdAndDelete(deleteId)
        res.redirect('/admin/category')
    } catch (error) {
        console.log(error.message);
    }

}

//product page view
module.exports.view_product = async (req, res) => {

    try {
        const getProducts = await productModel.find({ isdelete: false })
        res.render('admin/product', { getProducts, msg });
        msg = false
        editmesg = false
    } catch (error) {
        console.log(error.message);
    }

}
//view addProduct page
module.exports.view_addProduct = async (req, res) => {
    try {
        const categories = await categoryModel.find()
        res.render('admin/addProduct', { categories })
    } catch (error) {
        console.log(error.message);
    }

}
//add product page
module.exports.add_product = (req, res) => {
    try {

        const products = req.body;
        products.product_image = req.files
        productModel.create(products)
        msg = true;
        res.redirect('/admin/product')
    } catch (error) {
        console.log(error.message);
    }
}
//view edit product page
module.exports.view_editProduct = async (req, res) => {
    const { id } = req.query
    const categories = await categoryModel.find()
    const products = await productModel.findById(id)
    res.render('admin/editProduct', { products, categories })
}

// edit products
module.exports.edit_product = async (req, res) => {
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
                stock: edit.stock,
                brand: edit.brand,

            })

        console.log(req.files);
        res.redirect('/admin/product')
    } catch (error) {

    }


}
//delete products
module.exports.delete_product = async (req, res) => {
    try {
        productId = req.params.id
        console.log(productId)
        await productModel.findByIdAndUpdate(productId, { isdelete: true })
        res.redirect('/admin/product')
    } catch (error) {
        console.log(error.message);
    }
}


