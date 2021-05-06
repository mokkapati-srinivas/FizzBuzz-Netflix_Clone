module.exports = {
    // ensureAuthenticated: function(req, res, next) {
    //   if (!req.isAuthenticated()) {
    //     return next();
    //   }
    //   req.flash('error_msg', 'Please log in to view that resource');
    //   res.redirect('/signin');
    // },
    // forwardAuthenticated: function(req, res, next) {
    //   if (req.isAuthenticated()) {
    //     return next();
    //   }  
    // }
    checkAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
          return next()
        }
        req.flash('error_msg', 'Please log in to view that resource');
        res.redirect('/signin')
      },
      checkNotAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
          return res.redirect('/index')
        }
        next()
      }
};