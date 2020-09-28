const express = require("express");
const router = express.Router();
const Cafe = require("../models/cafe");
const auth = require("../middleware/index");

const checkCafeOwnership = (req, res, next) => {
  Cafe.findById(req.params.id, (err, foundCafe) => {
    if (err) {
      res.send("Somthing Went Wrong");
    } else {
      if (foundCafe.author.id.equals(req.header("X-Auth-id"))) {
        next();
      } else {
        res.send("Not authorized");
      }
    }
  });
};

router.get("/", (req, res) => {
  Cafe.find({}, (err, allCafes) => {
    if (err) {
      res.send(err);
    } else {
      res.send(allCafes);
    }
  });
});

router.get("/links", (req, res) => {
  Cafe.find({}, (err, allCafes) => {
    if (err) {
      res.send(err);
    } else {
      let cafeLinks = [];
      allCafes.forEach((cafe) => {
        cafeLinks.push({
          id: cafe._id,
          image: cafe.image,
          name: cafe.name,
          authorId: cafe.author.id,
          authorName: cafe.author.username,
        });
      });
      res.send(cafeLinks);
    }
  });
});

router.post("/", auth, (req, res) => {
  let newCafe = {
    name: req.body.name,
    image: req.body.image,
    description: req.body.desc,
    author: {
      id: req.body.id,
      username: req.body.username,
    },
  };
  Cafe.create(newCafe, (err, newlyCreated) => {
    if (err) {
      res.send(err);
    } else {
      res.send("Successfully Created Cafe");
    }
  });
});

router.get("/:id", (req, res) => {
  Cafe.findById(req.params.id)
    .populate("comments")
    .exec((err, foudCafe) => {
      if (err) {
        res.send(err);
      } else {
        res.send(foudCafe);
      }
    });
});

router.get("/:id/edit", (req, res) => {
  Cafe.findById(req.params.id, (err, foudCafe) => {
    res.send(foudCafe);
  });
});

router.put("/:id", auth, checkCafeOwnership, (req, res) => {
  Cafe.findByIdAndUpdate(req.params.id, req.body.cafe, (err, updatedCafe) => {
    if (err) {
      res.send(err);
    } else {
      res.send("Successfully Edited Cafe");
    }
  });
});

router.delete("/:id", auth, checkCafeOwnership, (req, res) => {
  Cafe.findByIdAndRemove(req.params.id, (err) => {
    if (err) {
      res.send(err);
    } else {
      res.send("Successfully Deleted Cafe");
    }
  });
});

router.post("/:id/like", auth, (req, res) => {
  let likeCheck = 0;
  Cafe.findById(req.params.id, (err, cafe) => {
    if (err) {
      res.send(err);
    } else {
      cafe.likes.forEach((like) => {
        if (like.id == req.body.id) {
          likeCheck++;
        }
      });

      if (likeCheck == 0) {
        let like = {
          id: req.body.id,
        };
        cafe.likes.push(like);
        cafe.save();
        res.send("Successfully Liked Post");
      } else {
        cafe.likes = cafe.likes.filter((like) => {
          if (like.id != req.body.id) {
            return like;
          }
        });
        cafe.save();
        res.send("Disliked");
      }
    }
  });
});

module.exports = router;
