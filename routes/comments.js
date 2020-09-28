const express = require("express");
const router = express.Router({ mergeParams: true });
const Cafe = require("../models/cafe");
const Comment = require("../models/comment");
const auth = require("../middleware/index");

const checkCommentOwnership = (req, res, next) => {
  Comment.findById(req.params.comment_id, (err, foundComment) => {
    if (err) {
      res.send("err");
    } else {
      if (foundComment.author.id.equals(req.header("X-Auth-id"))) {
        next();
      } else {
        res.send("Not authorized");
      }
    }
  });
};

router.post("/", auth, (req, res) => {
  Cafe.findById(req.params.id, (err, cafe) => {
    if (err) {
      res.send(err);
    } else {
      let comment = {
        text: req.body.comment,
        author: {
          id: req.body.id,
          username: req.body.username,
        },
      };
      Comment.create(comment, (err, comment) => {
        if (err) {
          console.log(err);
        } else {
          comment.save();
          cafe.comments.push(comment);
          cafe.save();
          res.send("Successfully Created Comment");
        }
      });
    }
  });
});

router.get("/:comment_id/edit", (req, res) => {
  Comment.findById(req.params.comment_id, function (err, foundComment) {
    if (err) {
      res.send("err");
    } else {
      res.send(foundComment);
    }
  });
});

router.put("/:comment_id", auth, checkCommentOwnership, (req, res) => {
  comment = { text: req.body.comment };
  Comment.findByIdAndUpdate(
    req.params.comment_id,
    comment,
    (err, updatedComment) => {
      if (err) {
        res.send("err");
      } else {
        res.send("Successfully Edited Comment");
      }
    }
  );
});

router.delete("/:comment_id", auth, checkCommentOwnership, (req, res) => {
  Comment.findByIdAndRemove(req.params.comment_id, (err) => {
    if (err) {
      res.send(err);
    } else {
      res.send("Successfully Deleted Comment");
    }
  });
});

module.exports = router;
