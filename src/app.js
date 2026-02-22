const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const passport = require('passport');
const flash = require('connect-flash');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const methodOverride = require('method-override');
const MenuSettings = require('./models/MenuSettings');

const configurePassport = require('./config/passport');
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/authRoutes');
const videoRoutes = require('./routes/videoRoutes');
const commentRoutes = require('./routes/commentRoutes');
const blogRoutes = require('./routes/blogRoutes');
const blogCommentRoutes = require('./routes/blogCommentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

configurePassport();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(
  helmet({
    contentSecurityPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);
app.use(compression());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(process.cwd(), 'public')));

const sessionStoreOptions = mongoose.connection.readyState === 1
  ? { client: mongoose.connection.getClient() }
  : { mongoUrl: process.env.MONGODB_URI };

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change-me',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create(sessionStoreOptions),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.siteBaseUrl = `${req.protocol}://${req.get('host')}`;
  res.locals.flashSuccess = req.flash('success');
  res.locals.flashError = req.flash('error');
  next();
});

app.use(async (req, res, next) => {
  try {
    const menuSettings = await MenuSettings.findOneAndUpdate(
      {},
      { $setOnInsert: { showVideosMenu: true, showBlogsMenu: true } },
      { upsert: true, new: true }
    );
    res.locals.menuSettings = menuSettings;
    return next();
  } catch (error) {
    return next(error);
  }
});

app.use('/', indexRoutes);
app.use('/admin', authRoutes);
app.use('/admin', adminRoutes);
app.use('/videos', videoRoutes);
app.use('/comments', commentRoutes);
app.use('/blogs', blogRoutes);
app.use('/blog-comments', blogCommentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
