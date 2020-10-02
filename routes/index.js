const express = require("express"),
  router = express.Router(),
  User = require("../models/user"),
  bcrypt = require("bcryptjs"),
  config = require("../config/default.json"),
  jwt = require("jsonwebtoken"),
  auth = require("../middleware/index");

//handle sign up logic
router.post("/register", function (req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    res.send("Enter all fields");
  }
  User.findOne({ username }).then((user) => {
    if (user) return res.send("User Exists");

    const newUser = new User({
      username,
      password,
    });

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;

        newUser.password = hash;
        newUser.save().then((user) => {
          jwt.sign(
            { id: user.id },
            config["jwtSecret"],
            {
              expiresIn: 3600,
            },
            (err, token) => {
              if (err) throw err;
              res.send({
                token,
                userId: user.id,
                Success: "Successfully Signed In",
              });
            }
          );
        });
      });
    });
  });
});

router.post("/auth", function (req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    res.send("Enter all fields");
  }
  User.findOne({ username }).then((user) => {
    if (!user) return res.send("User Doesn't Exist");

    bcrypt.compare(password, user.password).then((isMatched) => {
      if (!isMatched) return res.send("Invalid Credentials");

      jwt.sign(
        { id: user.id },
        config["jwtSecret"],
        {
          expiresIn: 3600,
        },
        (err, token) => {
          if (err) throw err;
          res.send({
            token,
            userId: user.id,
            Success: "Successfully Logged In",
          });
        }
      );
    });
  });
});

router.post("/user", (req, res) => {
  User.findById(req.body.id)
    .select("-password")
    .then((user) => res.send(user));
});

router.get("/users", (req, res) => {
  User.find({})
    .select("-password")
    .then((user) => res.send(user));
});

router.post("/follow", auth, (req, res) => {
  let followCheck = 0;
  User.findById(req.body.userId, (err, user) => {
    if (err) {
      res.send(err);
    } else {
      user.following.forEach((follow) => {
        if (follow.id == req.body.followId) {
          followCheck++;
        }
      });

      if (followCheck == 0) {
        let follow = {
          id: req.body.followId,
        };
        user.following.push(follow);
        user.save();
        User.findById(req.body.followId, (err, user) => {
          let follow = {
            id: req.body.userId,
          };
          user.followers.push(follow);
          user.save();
          res.send("Successfully followed User");
        });
      } else {
        user.following = user.following.filter((follow) => {
          if (follow.id != req.body.followId) {
            return follow;
          }
        });
        user.save();
        User.findById(req.body.followId, (err, user) => {
          user.followers = user.followers.filter((follow) => {
            if (follow.id != req.body.userId) {
              return follow;
            }
          });
          user.save();
          res.send("UnFollowed");
        });
      }
    }
  });
});

// logout route
router.get("/logout", function (req, res) {
  req.logout();
});

module.exports = router;
