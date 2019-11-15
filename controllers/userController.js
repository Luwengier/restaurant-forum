const bcrypt = require('bcrypt-nodejs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = '5d5c9ecc8433aa7'
const db = require('../models')
const User = db.User
const Restaurant = db.Restaurant
const Comment = db.Comment
const Favorite = db.Favorite
const fs = require('fs')


const UserController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },
  signUp: (req, res) => {
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複!')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            return res.redirect('/signin')
          })
        }
      })
    }
  },
  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },

  // Profile CRUD
  getUser: (req, res) => {
    return User.findByPk(req.params.id, {
      include: [
        { model: Comment, include: [Restaurant] }
      ]
    })
      .then((user) => {
        const commentNum = user.Comments.length
        res.render('profile/profile', { user, commentNum })
      })
  },
  editUser: (req, res) => {
    return res.render('profile/create')
  },
  putUser: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {

        return User.findByPk(req.params.id)
          .then((user) => {
            console.log(user)
            return user.update({
              name: req.body.name,
              image: file ? img.data.link : null
            })
          })
          .then((user) => {
            console.log(user)
            req.flash('success_messages', 'User was successfully updated')
            return res.redirect(`/users/${user.id}`)
          })
      })
    } else {
      return User.findByPk(req.params.id)
        .then((user) => {
          return user.update({
            name: req.body.name,
            image: null
          })
        })
        .then((user) => {
          req.flash('success_messages', 'User was successfully updated')
          return res.redirect(`/users/${user.id}`)
        })
    }
  },

  // Favorite 
  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then((favorite) => {
        return res.redirect('back')
      })
  },

  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((favorite) => {
        favorite.destroy()
          .then((favorite) => {
            return res.redirect('back')
          })
      })
  }
}

module.exports = UserController