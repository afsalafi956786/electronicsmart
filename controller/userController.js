const bcrypt = require("bcrypt");
const usermodel = require("../models/user-schema");
const categoryModel = require("../models/category-schema");
const adminModel = require("../models/admin-schema");
const productModel = require("../models/product-schema");
const cartModel = require("../models/cart-schema");
const wishlistModel = require("../models/whishlist");
const addressModel = require("../models/address-schema");
const orderModel = require("../models/order-shema");
const otpSend = require("../OTPverify/otp");
const bannerModel = require("../models/banner-schema");
const OTP = require("twilio");
const moment = require("moment");
const { response } = require("express");
const router = require("../routes/userRouter");
const { NetworkContext } = require("twilio/lib/rest/supersim/v1/network");
const client = require("twilio")(process.env.accountSID, process.env.authToken);
const Razorpay = require("razorpay");
const crypto = require("crypto");
const couponModel = require("../models/coupen-schema");
const {
  BrandRegistrationContext,
} = require("twilio/lib/rest/messaging/v1/brandRegistration");
let userSignin;
let phoneNum;
let key_id = "rzp_test_Qb7Rw3E5m4cY6D";
let key_secret = "uVtNyxp8HDTJbMLfaTXDkhqk";
let msg;
let addressMsg;
let editMsg;

module.exports.user_home = async (req, res, next) => {
  try {
    //cart count find
    countwish = 0;
    let count = 0;
    if (req.session.user) {
      const userid = req.session.userId;
      const userCart = await cartModel.findOne({ user: userid });
      if (userCart) {
        count = userCart.products.length;
      } else {
        count = 0;
      }
      //count end
      const userId = req.session.userId;
      let userWish = await wishlistModel.findOne({ user: userId });
      if (userWish) {
        countwish = userWish.products.length;
      } else {
        countwish = 0;
      }
    }
    const brand = await productModel
      .find()
      .sort({ brand: 1 })
      .distinct("brand");
    const banner = await bannerModel.find();

    const userId = req.session.userId;
    const user = await usermodel.findById(userId);
    const categories = await categoryModel.find().limit(5);
    const products = await productModel.find({ isdelete: false });
    const hotProducts = await productModel.find({ isdelete: false }).limit(5);
    res.render("user/index", {
      user,
      categories,
      products,
      count,
      hotProducts,
      countwish,
      banner,
      brand,
    });
  } catch (error) {
    next(error);
  }
};

//user sign in

module.exports.user_signin = async (req, res) => {
  try {
    userSignin = req.session.user;
    if (userSignin) {
      res.redirect("/");
    } else {
      res.render("user/signin");
    }
  } catch (error) {
    next(error);
  }
};
module.exports.do_signin = async (req, res) => {
  try {
    const userData = req.body;
    const dbData = await usermodel.findOne({ email: userData.email });
    if (userData.email == "" && userData.password == "") {
      res.render("user/signin", {
        userErr: "Please enter the valid emial and password",
      });
    } else {
      if (dbData) {
        const dbPassword = await bcrypt.compare(
          userData.password,
          dbData.password
        );
        if (dbPassword) {
          const user = await usermodel.findById(dbData._id);
          if (user.isBanned) {
            req.session.userId = false;
            res.render("user/signin", {
              banErr: "you are banned for few days",
            });
          } else {
            req.session.user = true;
            req.session.userId = dbData._id;
            res.redirect("/");
          }
        } else {
          res.render("user/signin", { passErr: "Invalid  password !" });
        }
      } else {
        res.render("user/signin", { emailErr: "Invalid email !" });
      }
    }
  } catch (error) {
    next(error);
  }
};

//otp page
module.exports.otp_page = (req, res, next) => {
  try {
    const user = req.session.user;
    if (user) {
      next(error);
    } else {
      res.render("user/otp");
    }
  } catch (error) {
    next(error);
  }
};
//user signup
module.exports.user_signup = (req, res) => {
  try {
    userSignin = req.session.user;
    if (userSignin) {
      res.redirect("/");
    } else {
      res.render("user/signup");
    }
  } catch (error) {
    next(error);
  }
};
//user signup
module.exports.do_signup = async (req, res, next) => {
  try {
    const { name, email, password, confirmPass, phone } = req.body;
    const emailCheck = req.body.email;
    const existEmail = await usermodel.findOne({ email: emailCheck });
    if (existEmail) {
      res.render("user/signup", { checkEmailErr: "This email already exist" });
    }
    const phoneNumber = await usermodel.findOne({ phone: phone });
    if (phoneNumber) {
      res.render("user/signup", {
        numberErr: "This phone number already exist",
      });
    } else {
      const userDetails = req.body;
      if (userDetails.password === userDetails.confirmPass) {
        req.session.userDetail = userDetails;
        phoneNum = userDetails.phone;
        const phone = parseInt(phoneNum);
        otpSend.otpCall(phone);
        res.render("user/otp", { phoneNum });
      } else {
        res.render("user/signup", { checkErr: "password is not mathced" });
      }
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// otp authentication page

//otp authentication
module.exports.otp_Verify = async (req, res, next) => {
  try {
    const { otp1, otp2, otp3, otp4, phone } = req.body;
    const otpArr = [];
    otpArr.push(otp1, otp2, otp3, otp4);
    const otparr = otpArr.join("");
    if (otparr == "") {
      res.render("user/otp", { otpErr: "Invalid otp !" });
    }
    let users = req.session.userDetail;
    const mobile = users.phone;
    let otps = parseInt(otparr);
    const phoneNo = parseInt(mobile);
    let otpStatus = await otpSend.otpVerify(phoneNo, otps);
    if (otpStatus.valid || otpStatus != null) {
      users.password = await bcrypt.hash(users.password, 10);
      const user = await usermodel.create(users);
      req.session.user = true;
      req.session.userId = user._id;
      res.redirect("/");
    } else {
      res.render("user/otp", { otpErr: "Invalid otp !" });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//user Logout
module.exports.user_logout = (req, res) => {
  req.session.user = false;
  req.session.userId = null;
  res.redirect("/");
};

//user shop page
module.exports.view_shop = async (req, res, next) => {
  try {
    countwish = 0;
    let count = 0;
    if (req.session.user) {
      const userid = req.session.userId;
      const userCart = await cartModel.findOne({ user: userid });
      if (userCart) {
        count = userCart.products.length;
      } else {
        count = 0;
      }
      //count end
      const userId = req.session.userId;
      let userWish = await wishlistModel.findOne({ user: userId });
      if (userWish) {
        countwish = userWish.products.length;
      } else {
        countwish = 0;
      }
    }
    const brand = await productModel
      .find()
      .sort({ brand: 1 })
      .distinct("brand");
    const categories = await categoryModel.find();
    const products = await productModel.find({ isdelete: false });
    const userId = req.session.userId;
    const user = await usermodel.findById(userId);
    res.render("user/shop", {
      categories,
      products,
      user,
      count,
      countwish,
      brand,
    });
  } catch (error) {
    next(error);
  }
};
//filter products and categories
module.exports.do_filter = async (req, res, next) => {
  try {
    countwish = 0;
    let count = 0;
    if (req.session.user) {
      const userid = req.session.userId;
      const userCart = await cartModel.findOne({ user: userid });
      if (userCart) {
        count = userCart.products.length;
      } else {
        count = 0;
      }
      //count end
      const userId = req.session.userId;
      let userWish = await wishlistModel.findOne({ user: userId });
      if (userWish) {
        countwish = userWish.products.length;
      } else {
        countwish = 0;
      }
    }

    let userId = req.session.userId;
    let user = await usermodel.findById(userId);
    const name = req.query.name;
    let products = await productModel.find({ isdelete: false }).populate();
    const brand = await productModel
      .find()
      .sort({ brand: 1 })
      .distinct("brand");
    products = products.filter((data) => {
      if (data.category == name) return data;
    });

    res.render("user/filter", {
      products,
      name,
      user,
      count,
      countwish,
      brand,
    });
  } catch (error) {
    next(error);
  }
};

//product details display page
module.exports.view_details = async (req, res, next) => {
  try {
    countwish = 0;
    let count = 0;
    if (req.session.user) {
      const userid = req.session.userId;
      const userCart = await cartModel.findOne({ user: userid });
      if (userCart) {
        count = userCart.products.length;
      } else {
        count = 0;
      }
      //count end
      const userId = req.session.userId;
      let userWish = await wishlistModel.findOne({ user: userId });
      if (userWish) {
        countwish = userWish.products.length;
      } else {
        countwish = 0;
      }
    }

    const { id } = req.query;
    const products = await productModel.findById(id);
    const product = await productModel.find({ isdelete: false });
    const userId = req.session.userId;
    const user = await usermodel.findById(userId);
    res.render("user/productDetails", {
      products,
      product,
      user,
      count,
      countwish,
    });
  } catch (error) {
    next(error);
  }
};
//cart page view
module.exports.view_cart = async (req, res, next) => {
  try {
    countwish = 0;
    let count = 0;
    let empty = null;
    if (req.session.user) {
      const userid = req.session.userId;
      const userCart = await cartModel.findOne({ user: userid });
      if (userCart) {
        count = userCart.products.length;
      } else {
        count = 0;
      }
      //count end
      const users = req.session.userId;
      let userWish = await wishlistModel.findOne({ user: users });
      if (userWish) {
        countwish = userWish.products.length;
      } else {
        countwish = 0;
      }

      //count end
      const userId = req.session.userId;
      const user = await usermodel.findById(userId);
      //fetch product details and user id inside of cart
      const cart = await cartModel
        .findOne({ user: userId })
        .populate("products.item");
      if (cart != null) {
        const total = cart.products.reduce(
          (acc, cur) => acc + cur.item.price * cur.quantity,
          0
        );
        res.render("user/cart", { cart, user, total, count, countwish });
      } else {
        countwish = 0;
        let count = 0;
        let empty;
        if (req.session.user) {
          const userid = req.session.userId;
          const userCart = await cartModel.findOne({ user: userid });
          if (userCart) {
            count = userCart.products.length;
          } else {
            count = 0;
          }
          //count end
          const users = req.session.userId;
          let userWish = await wishlistModel.findOne({ user: users });
          if (userWish) {
            countwish = userWish.products.length;
          } else {
            countwish = 0;
          }
        }
        const userId = req.session.userId;
        const user = await usermodel.findById(userId);
        empty = "cart is empty";
        res.render("user/cart", { empty, count, countwish, user });
      }
    }
  } catch (error) {
    next(error);
  }
};
module.exports.add_cart = async (req, res, next) => {
  try {
    const user = req.session.user;
    if (user) {
      const prodId = req.params.id;
      const userId = req.session.userId;
      //already have a user cart
      let userCart = await cartModel.findOne({ user: userId });
      console.log(user);
      if (userCart != null) {
        let proObj = {
          item: prodId,
          quantity: 1,
        };
        let proExist = userCart.products.findIndex(
          (product) => product.item == prodId
        );

        if (proExist != -1) {
          await cartModel
            .updateOne(
              { user: userId, "products.item": prodId },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then((resolve) => {
              res.json({ status: true });
            });
        } else {
          //new product add to cart
          await cartModel.updateOne(
            { user: userId },
            {
              $push: {
                products: proObj,
              },
            }
          );
          res.json({ status: true });
        }
      } else {
        //new user cart
        let proObj = {
          item: prodId,
          quantity: 1,
        };
        let cartObj = {
          user: userId,
          products: [proObj],
        };
        await cartModel.create(cartObj);

        res.json({ status: true });
      }
    } else {
      res.json({ status: false });
    }
  } catch (error) {
    next(error);
  }
};
//change cart quantity
module.exports.change_quant = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    let { cart, product, count, quantity } = req.body;
    count = parseInt(count);
    quantity = parseInt(quantity);
    //count increment and decrement
    if (count == -1 && quantity == 1) {
      await cartModel
        .findByIdAndUpdate(cart, {
          $pull: { products: { item: product } },
        })
        .populate("products")
        .then((response) => {
          res.json({ removeProduct: true });
        });
    } else {
      await cartModel
        .updateOne(
          { _id: cart, "products.item": product },
          {
            $inc: { "products.$.quantity": count },
          }
        )
        .then(async () => {
          const carts = await cartModel
            .findOne({ user: userId })
            .populate("products.item");
          const total = carts.products.reduce(
            (acc, cur) => acc + cur.item.price * cur.quantity,
            0
          );
          res.json({ response: true, total });
        });
    }
  } catch (error) {
    next(error);
  }
};
//product details page product add and quantity
module.exports.product_cart = async (req, res, next) => {
  try {
    const { prodId, count } = req.body;
    const user = req.session.user;
    if (user) {
      const userId = req.session.userId;
      //already have a user cart
      let userCart = await cartModel.findOne({ user: userId });
      if (userCart != null) {
        let proObj = {
          item: prodId,
          quantity: count,
        };
        let proExist = userCart.products.findIndex(
          (product) => product.item == prodId
        );

        if (proExist != -1) {
          await cartModel
            .updateOne(
              { user: userId, "products.item": prodId },
              {
                $inc: { "products.$.quantity": count },
              }
            )
            .then((resolve) => {
              res.json({ status: true });
            });
        } else {
          //new product add to cart
          await cartModel.updateOne(
            { user: userId },
            {
              $push: {
                products: proObj,
              },
            }
          );
          res.json({ status: true });
        }
      } else {
        //new user cart
        let proObj = {
          item: prodId,
          quantity: 1,
        };
        let cartObj = {
          user: userId,
          products: [proObj],
        };
        await cartModel.create(cartObj);

        res.json({ status: true });
      }
    } else {
      res.send(
        "<script>alert(login required) location.reload='/login'</script>"
      );
    }
  } catch (error) {
    next(error);
  }
};

//cart items delete
module.exports.delete_cart = async (req, res, next) => {
  try {
    const { cart, product } = req.body;
    console.log(product);
    await cartModel
      .findByIdAndUpdate(cart, {
        $pull: { products: { item: product } },
      })
      .populate("products")
      .then((response) => {
        res.json(true);
      });
  } catch (error) {
    next(error);
  }
};

//wishlist page view
module.exports.view_wishlist = async (req, res, next) => {
  try {
    countwish = 0;
    let count = 0;
    if (req.session.user) {
      const userid = req.session.userId;
      const userCart = await cartModel.findOne({ user: userid });
      if (userCart) {
        count = userCart.products.length;
      } else {
        count = 0;
      }
      //count end
      const userId = req.session.userId;
      let userWish = await wishlistModel.findOne({ user: userId });
      if (userWish) {
        countwish = userWish.products.length;
      } else {
        countwish = 0;
      }
      const wishlist = await wishlistModel
        .findOne({ user: userId })
        .populate("products.item");
      const user = await usermodel.findById(userId);
      res.render("user/wishlist", { user, count, wishlist, countwish });
    }
  } catch (error) {
    next(error);
  }
};

// addProducts wishlist
module.exports.add_wishlist = async (req, res, next) => {
  try {
    const user = req.session.user;
    if (user) {
      const prodId = req.params.id;
      const userId = req.session.userId;
      //already havea a wish list
      let wishlist = await wishlistModel.findOne({ user: userId });
      if (wishlist) {
        let proObj = {
          item: prodId,
        };
        let productExist = wishlist.products.findIndex(
          (product) => product.item == prodId
        );
        if (productExist != -1) {
          let Exist = await wishlistModel
            .findOne({ user: userId })
            .populate("products.item");
          Exist.products.splice(productExist, 0);
          await Exist.save().then((response) => {
            res.json(false);
          });
        } else {
          const Exist = await wishlistModel
            .findOne({ user: userId })
            .populate("products");
          Exist.products.push(proObj);
          await Exist.save().then((response) => {
            res.json(true);
          });
        }
      } else {
        //new wishlist
        let proObj = {
          item: prodId,
        };
        let wishObj = {
          user: userId,
          products: [proObj],
        };
        await wishlistModel.create(wishObj).then((response) => {
          res.json({ status: true });
        });
      }
    } else {
      res.json({ notUser: true });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};
//delete-wishlist products
module.exports.delete_wishlist = async (req, res, next) => {
  try {
    const { wishlist, product } = req.body;
    await wishlistModel
      .findByIdAndUpdate(wishlist, {
        $pull: { products: { item: product } },
      })
      .populate("products")
      .then((response) => {
        res.json(true);
      });
  } catch (error) {
    next(error);
  }
};

//user address page view
module.exports.account_view = async (req, res) => {
  countwish = 0;
  let count = 0;
  if (req.session.user) {
    const userid = req.session.userId;
    const userCart = await cartModel.findOne({ user: userid });
    if (userCart) {
      count = userCart.products.length;
    } else {
      count = 0;
    }
    //count end
    const users = req.session.userId;
    let userWish = await wishlistModel.findOne({ user: users });
    if (userWish) {
      countwish = userWish.products.length;
    } else {
      countwish = 0;
    }
    //count end
  }

  const userId = req.session.userId;
  const user = await usermodel.findById(userId);
  let address = await addressModel.findOne({ user: userId });
  res.render("user/profile", {
    user,
    addressMsg,
    editMsg,
    address,
    count,
    countwish,
  });
  addressMsg = false;
  editMsg = false;
};

//add user address
module.exports.add_address = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const { name, address, city, state, pincode, phone } = req.body;
    let obj = {
      user: userId,
      address: [{ name, address, city, state, pincode, phone }],
    };
    let objpush = { name, address, city, state, pincode, phone };
    let user = await usermodel.findById(userId);
    let userAddress = await addressModel.findOne({ user: userId });
    if (userAddress) {
      userAddress.address.push(objpush);
      userAddress.save().then((data) => {
        res.redirect("/account");
      });
    } else {
      await addressModel.create(obj);
      addressMsg = true;
      res.redirect("/account");
    }
  } catch (error) {
    next(error);
  }
};
module.exports.edit_address = async (req, res, next) => {
  try {
    const { id } = req.query;
    console.log(id);
    const userId = req.session.userId;
    const user = await usermodel.findById(userId);
    if (user) {
      const userId = req.session.userId;
      const { name, address, city, pincode, phone, state } = req.body;
      let objaddress = { name, address, city, state, pincode, phone };
      console.log(objaddress);
      const addresses = await addressModel.findOne({ user: userId });
      addresses.address[id] = objaddress;
      await addresses.save();
      editMsg = true;
      res.redirect("/account");
    }
  } catch (error) {
    next(error);
  }
};

//user address delete
module.exports.delete_address = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const { address } = req.body;
    await addressModel
      .updateOne({ user: userId }, { $pull: { address: { _id: address } } })
      .then((data) => {
        res.json({ response: true });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    next(error);
  }
};

//plcae order page
module.exports.place_order = async (req, res, next) => {
  try {
    countwish = 0;
    let count = 0;
    if (req.session.user) {
      const userid = req.session.userId;
      const userCart = await cartModel.findOne({ user: userid });
      if (userCart) {
        count = userCart.products.length;
      } else {
        count = 0;
      }
      //count end
      const users = req.session.userId;
      let userWish = await wishlistModel.findOne({ user: users });
      if (userWish) {
        countwish = userWish.products.length;
      } else {
        countwish = 0;
      }
      //count end
    }

    const userId = req.session.userId;
    const user = await usermodel.findById(userId);
    const cart = await cartModel
      .findOne({ user: userId })
      .populate("products.item");
    const total = cart.products.reduce(
      (acc, cur) => acc + cur.item.price * cur.quantity,
      0
    );
    const product = cart.products;
    const address = await addressModel.findOne({ user: userId });
    console.log(address,'((((((((((')
    res.render("user/placeOrder", {
      total,
      address,
      user,
      count,
      countwish,
      product,
    });
  } catch (error) {
    console.log(error.message)
    next(error);
  }
};

//place order
module.exports.placing_order = async (req, res, next) => {
  try {
    const orders = req.body;
    const coupon = req.body.coupon;
    const userId = req.session.userId;
    let cart = await cartModel
      .findOne({ user: userId })
      .populate("products.item");
    let products = cart.products;
    let total = cart.products.reduce(
      (acc, cur) => acc + cur.item.price * cur.quantity,
      0
    );
    let status = orders["payment-method"] === "COD" ? "placed" : "pending";
    if (coupon) {
      let coupons = await couponModel.findOne({ code: coupon.trim() });

      if (coupons) {
        let discount = coupons.discount;
        if (discount) {
          if (coupons.type === "percentage") {
            const getPercentage = (coupons.discount * total) / 100;
            console.log(getPercentage);
            total = total - getPercentage;
          } else {
            total = total - coupons.discount;
          }
          const takeAddress = orders.radiobtn;
          const userAddress = await addressModel.findOne({ user: userId });
          console.log(userAddress,'_____________');
          if (userAddress != null) {
            const codOrder = userAddress.address.at(takeAddress);
            //end address
            let orderObj = {
              address: {
                name: codOrder.name,
                address: codOrder.address,
                city: codOrder.city,
                state: codOrder.state,
                pin: codOrder.pincode,
                phone: codOrder.phone,
              },
              user: userId,
              payment: orders["payment-method"],
              products: products,
              total: total,
              status: status,
            };

            await orderModel.create(orderObj).then(async (data) => {
              let orderId = data._id.toString();
              if (req.body["payment-method"] === "COD") {
                res.json({ status: true });
              } else {
                //razor pay
                var instance = new Razorpay({
                  key_id: "rzp_test_Qb7Rw3E5m4cY6D",
                  key_secret: "uVtNyxp8HDTJbMLfaTXDkhqk",
                });
                let total = data.total;
                instance.orders.create(
                  {
                    amount: total * 100,
                    currency: "INR",
                    receipt: orderId,
                  },
                  (err, order) => {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log("new order:", order);
                      res.json({ status: false, order });
                    }
                  }
                );
              }
              await cartModel.deleteOne({ user: userId });
            });
          } else {
            console.log('eerr')
            res.json({ address: false });
          }
        }
      } else {
        res.json({ couponErr: false, coupons });
      }
    } else {
      const takeAddress = orders.radiobtn;
      const userAddress = await addressModel.findOne({ user: userId });
      if (userAddress != null) {
        const codOrder = userAddress.address.at(takeAddress);
        console.log(codOrder,'...........')

        //end address
        let orderObj = {
          address: {
            name: codOrder.name,
            address: codOrder.address,
            city: codOrder.city,
            state: codOrder.state,
            pin: codOrder.pincode,
            phone: codOrder.phone,
          },
          user: userId,
          payment: orders["payment-method"],
          products: products,
          total: total,
          status: status,
        };

        await orderModel.create(orderObj).then(async (data) => {
          let orderId = data._id.toString();
          if (req.body["payment-method"] === "COD") {
            res.json({ status: true });
          } else {
            //razor pay
            var instance = new Razorpay({
              key_id: "rzp_test_Qb7Rw3E5m4cY6D",
              key_secret: "uVtNyxp8HDTJbMLfaTXDkhqk",
            });
            let total = data.total;
            instance.orders.create(
              {
                amount: total * 100,
                currency: "INR",
                receipt: orderId,
              },
              (err, order) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log("new order:", order);
                  res.json({ status: false, order });
                }
              }
            );
          }
          await cartModel.deleteOne({ user: userId });
        });
      } else {
        console.log('address keri chec')
        res.json({ address: false });
      }
    }

    //adding default address radio button
  } catch (error) {
    res.send({address:false})
    next(error);
  }
};

//payment varify
module.exports.verify_payment = async (req, res, next) => {
  try {
    let userId = req.session.userId;
    let details = req.body;
    let orderId = req.body["order[receipt]"];
    console.log(orderId);
    let hmac = crypto.createHmac("sha256", key_secret);
    hmac.update(
      details["payment[razorpay_order_id]"] +
        "|" +
        details["payment[razorpay_payment_id]"]
    );
    hmac = hmac.digest("hex");
    if (hmac == details["payment[razorpay_signature]"]) {
      console.log("payment successful");
      // await cartModel.updateOne({user:userId},{
      //     $set:{
      //     }
      // })
      await orderModel
        .findByIdAndUpdate(orderId, {
          $set: {
            status: "placed",
          },
        })
        .then((data) => {
          res.json({ status: true, data });
        })
        .catch((err) => {
          res.json({ status: false, err });
        });
    } else {
      console.log("payment failed");
    }
  } catch (error) {
    next(error);
  }
};

//order success page
module.exports.order_success = async (req, res, next) => {
  try {
    countwish = 0;
    let count = 0;
    if (req.session.user) {
      const userid = req.session.userId;
      const userCart = await cartModel.findOne({ user: userid });
      if (userCart) {
        count = userCart.products.length;
      } else {
        count = 0;
      }
      //count end
      const users = req.session.userId;
      let userWish = await wishlistModel.findOne({ user: users });
      if (userWish) {
        countwish = userWish.products.length;
      } else {
        countwish = 0;
      }
      //count end
    }
    const userId = req.session.userId;
    const user = await usermodel.findById(userId);
    let address = await addressModel.findOne({ user: userId });
    const order = await orderModel
      .findOne({ user: userId })
      .populate({
        path: "products",
        populate: {
          path: "item",
          model: "products",
        },
      })
      .sort({ createdAt: -1 })
      .limit(1)
      .lean();
    let date = new Date();
    const createdAt = order.createdAt;
    order.date = moment(createdAt).format("DD MMMM , YYYY");
    res.render("user/orderSuccess", { order, user, count, countwish, address });
  } catch (error) {
    next(error);
  }
};

//order details page
module.exports.order_details = async (req, res, next) => {
  try {
    countwish = 0;
    let count = 0;
    if (req.session.user) {
      const userid = req.session.userId;
      const userCart = await cartModel.findOne({ user: userid });
      if (userCart) {
        count = userCart.products.length;
      } else {
        count = 0;
      }
      //count end
      const users = req.session.userId;
      let userWish = await wishlistModel.findOne({ user: users });
      if (userWish) {
        countwish = userWish.products.length;
      } else {
        countwish = 0;
      }
      //count end
    }

    const { id } = req.query;
    const userId = req.session.userId;
    const user = await usermodel.findById(userId);
    const order = await orderModel
      .find({ user: userId })
      .populate({
        path: "products",
        populate: {
          path: "item",
          model: "products",
        },
      })
      .sort({ updatedAt: -1 });
    for (let i = 0; i < order.length; i++) {
      if (order[i].status == "placed") {
        order[i].placed = true;
      } else if (order[i].status == "Processed") {
        order[i].placed = true;
        order[i].Processed = true;
      } else if (order[i].status == "Shipped") {
        order[i].placed = true;
        order[i].Processed = true;
        order[i].Shipped = true;
      } else if (order[i].status == "Delivered") {
        order[i].placed = true;
        order[i].Processed = true;
        order[i].Shipped = true;
        order[i].Delivered = true;
      } else if (order[i].status == "cancelled") {
        order[i].cancelled = true;
      }
    }
    const date = new Date();
    for (let i = 0; i < order.length; i++) {
      const dateOrder = order[i].updatedAt;
      order[i].date = moment(dateOrder).format("DD MMMM , YYYY");
    }
    res.render("user/orderDetails", { user, order, count, countwish });
  } catch (error) {
    next(error);
  }
};
//order cancel
module.exports.cancel_order = async (req, res, next) => {
  try {
    const orderId = req.body.orderId;
    console.log(orderId);
    await orderModel.findByIdAndUpdate(orderId, {
      $set: {
        status: "cancelled",
      },
    });
    res.json(true);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
module.exports.coupon_view = async (req, res, next) => {
  try {
    countwish = 0;
    let count = 0;
    if (req.session.user) {
      const userid = req.session.userId;
      const userCart = await cartModel.findOne({ user: userid });
      if (userCart) {
        count = userCart.products.length;
      } else {
        count = 0;
      }
      //count end
      const users = req.session.userId;
      let userWish = await wishlistModel.findOne({ user: users });
      if (userWish) {
        countwish = userWish.products.length;
      } else {
        countwish = 0;
      }
      //count end
    }
    const userId = req.session.userId;
    const user = await usermodel.findById(userId);
    let coupon = await couponModel.find({ status: "enabled" }).lean();
    let date = new Date();
    for (let i = 0; i < coupon.length; i++) {
      const enddate = coupon[i].endDate;
      coupon[i].end = moment(enddate).format("DD MMMM , YYYY");
    }
    //for each
    coupon.forEach((el) => {
      if (el.type == "amount") {
        el.valueCheck = true;
      } else {
        el.valueCheck = false;
      }
    });
    res.render("user/coupon", { count, countwish, user, coupon });
  } catch (error) {
    next(error);
  }
};

//user account details
module.exports.account_details = async (req, res, next) => {
  try {
    countwish = 0;
    let count = 0;
    if (req.session.user) {
      const userid = req.session.userId;
      const userCart = await cartModel.findOne({ user: userid });
      if (userCart) {
        count = userCart.products.length;
      } else {
        count = 0;
      }
      //count end
      const users = req.session.userId;
      let userWish = await wishlistModel.findOne({ user: users });
      if (userWish) {
        countwish = userWish.products.length;
      } else {
        countwish = 0;
      }
      //count end
    }
    const userId = req.session.userId;
    const user = await usermodel.findById(userId);
    res.render("user/accountDetails", { msg, user, count, countwish });
    msg = false;
  } catch (error) {
    next(error);
  }
};

module.exports.change_details = async (req, res, next) => {
  try {
    countwish = 0;
    let count = 0;
    if (req.session.user) {
      const userid = req.session.userId;
      const userCart = await cartModel.findOne({ user: userid });
      if (userCart) {
        count = userCart.products.length;
      } else {
        count = 0;
      }
      //count end
      const users = req.session.userId;
      let userWish = await wishlistModel.findOne({ user: users });
      if (userWish) {
        countwish = userWish.products.length;
      } else {
        countwish = 0;
      }
      //count end
    }

    const { name, email, currPass, newPass, confirmPass } = req.body;
    const userId = req.session.userId;
    const user = await usermodel.findById(userId);
    if (newPass == confirmPass) {
      let newPassword = await bcrypt.compare(currPass, user.password);
      console.log(newPassword);
      if (newPassword) {
        newPassword = await bcrypt.hash(newPass, 10);
        await usermodel.findByIdAndUpdate(userId, {
          $set: {
            name: name,
            email: email,
            password: newPassword,
          },
        });
        msg = true;
        res.redirect("/account-details", user, count, countwish);
      } else {
        countwish = 0;
        let count = 0;
        if (req.session.user) {
          const userid = req.session.userId;
          const userCart = await cartModel.findOne({ user: userid });
          if (userCart) {
            count = userCart.products.length;
          } else {
            count = 0;
          }
          //count end
          const users = req.session.userId;
          let userWish = await wishlistModel.findOne({ user: users });
          if (userWish) {
            countwish = userWish.products.length;
          } else {
            countwish = 0;
          }
          //count end
        }
        const userId = req.session.userId;
        const user = await usermodel.findById(userId);

        res.render("user/accountDetails", {
          currentPass: "current password is not matched",
          count,
          user,
          countwish,
        });
      }
    } else {
      countwish = 0;
      let count = 0;
      if (req.session.user) {
        const userid = req.session.userId;
        const userCart = await cartModel.findOne({ user: userid });
        if (userCart) {
          count = userCart.products.length;
        } else {
          count = 0;
        }
        //count end
        const users = req.session.userId;
        let userWish = await wishlistModel.findOne({ user: users });
        if (userWish) {
          countwish = userWish.products.length;
        } else {
          countwish = 0;
        }
        //count end
      }
      const userId = req.session.userId;
      const user = await usermodel.findById(userId);
      res.render("user/accountDetails", {
        confirmErr: "Confirm password is not matched",
        user,
        count,
        countwish,
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};
//live search
module.exports.live_search = async (req, res, next) => {
  try {
    const { SE } = req.body;
    let products = await productModel.find({ name: { $regex: SE } });

    res.json({ status: true, products });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
//searching
module.exports.search = async (req, res, next) => {
  try {
    //cart count
    countwish = 0;
    let count = 0;
    if (req.session.user) {
      const userid = req.session.userId;
      const userCart = await cartModel.findOne({ user: userid });
      if (userCart) {
        count = userCart.products.length;
      } else {
        count = 0;
      }
      //count end
      const users = req.session.userId;
      let userWish = await wishlistModel.findOne({ user: users });
      if (userWish) {
        countwish = userWish.products.length;
      } else {
        countwish = 0;
      }
      //count end
    }
    const userId = req.session.userId;
    const user = await usermodel.findById(userId);
    const { search } = req.query;
    const brand = await productModel
      .find()
      .sort({ brand: 1 })
      .distinct("brand");
    let products = await productModel.find({ name: { $regex: search } });

    //filter
    const name = req.query.name;
    let product = await productModel.find({ isdelete: false }).populate();
    let categories = await categoryModel.find();
    product = product.filter((data) => {
      if (data.category == name) return data;
    });

    res.render("user/search", {
      products,
      brand,
      search,
      product,
      categories,
      count,
      countwish,
      user,
    });
  } catch (error) {
    next(error);
  }
};
