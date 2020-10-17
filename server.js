const bodyParser = require("body-parser"),
  config = require("./config/default.json"),
  rateLimit = require("express-rate-limit"),
  mongoose = require("mongoose"),
  express = require("express"),
  cors = require("cors"),
  app = express();

//requiring routes
const commentRoutes = require("./routes/comments"),
  indexRoutes = require("./routes/index"),
  cafeRoutes = require("./routes/cafe");

const limiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 200,
});

mongoose.connect(config["uri"], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

app.use(cors());
app.use(limiter);
app.use(bodyParser.json());

app.use("/cafe/:id/comments", commentRoutes);
app.use("/cafe", cafeRoutes);
app.use("/", indexRoutes);

app.listen(process.env.PORT || 5000, process.env.IP, function () {
  console.log("The React Cafe Server Has Started! 5000");
});
