const db = require('../models')
const Category = db.Category


let categoryController = {
  getCategories: (req, res) => {
    return Category.findAll()
      .then((categories) => {
        if (req.params.id) {
          Category.findByPk(req.params.id)
            .then((category) => {
              return res.render('admin/category', { categories, category })
            })
        } else {
          return res.render('admin/category', { categories })
        }
      })
  },
  postCategory: (req, res) => {
    if (!req.body.category_name) {
      req.flash('error_messages', 'name didn\'t exist')
      return res.redirect('back')
    } else {
      return Category.create({
        name: req.body.category_name
      })
        .then((category) => {
          req.flash('success_messages', 'category was successfully created')
          res.redirect('/admin/categories')
        })
    }
  },
  putCategory: (req, res) => {
    if (!req.body.category_name) {
      req.flash('error_messages', 'name didn\'t exist')
      return res.redirect('back')
    } else {
      return Category.findByPk(req.params.id)
        .then((category) => {
          category.update({
            name: req.body.category_name
          }).then((category) => {
            req.flash('success_messages', 'category was successfully to update')
            res.redirect('/admin/categories')
          })
        })
    }
  },
  deleteCategory: (req, res) => {
    return Category.findByPk(req.params.id)
      .then((category) => {
        category.destroy()
      })
      .then((category) => {
        res.redirect('/admin/categories')
      })
  }
}

module.exports = categoryController