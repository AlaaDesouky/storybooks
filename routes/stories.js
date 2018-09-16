const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Story = mongoose.model("story");
const User = mongoose.model("user");
const { ensureAuthenticated, ensureGuest } = require("../helpers/auth");

// Stories Index
router.get("/", (req, res) => {
  Story.find({ status: "public" })
    .populate("user")
    .sort({ date: "desc" })
    .then(stories => {
      res.render("stories/index", { stories: stories });
    });
});

// Add Story Form
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("stories/add");
});

// Edit Story Form
router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  Story.findOne({ _id: req.params.id })
    .then(story => {
      if (story.user != req.user.id) {
        res.redirect("/stories");
      } else {
        res.render("stories/edit", { story: story });
      }
    })
    .catch((err, story) => {
      if (err || !story) {
        req.flash("error_msg", "Story not found");
        res.redirect("/dashboard");
      }
    });
});

// Show single story
router.get("/show/:id", (req, res) => {
  Story.findOne({
    _id: req.params.id
  })
    .populate("user")
    .populate("comments.commentUser")
    .then(story => {
      if (story.status == "public") {
        res.render("stories/show", { story: story });
      } else {
        if (req.user) {
          if (req.user.id == story.user._id) {
            res.render("stories/show", { story: story });
          } else {
            res.redirect("/stories");
          }
        } else {
          res.redirect("/stories");
        }
      }
    })
    .catch((err, story) => {
      if (err || !story) {
        req.flash("error_msg", "Story not found");
        res.redirect("/stories");
      }
    });
});

// List stories from a user
router.get("/user/:userId", (req, res) => {
  Story.find({ user: req.params.userId, status: "public" })
    .populate("user")
    .sort({ date: "desc" })
    .then(stories => {
      res.render("stories/index", { stories: stories });
    })
    .catch((err, user) => {
      if (err || !user) {
        req.flash("error_msg", "User not found");
        res.redirect("/stories");
      }
    });
});

// Logged in users stories
router.get("/my", ensureAuthenticated, (req, res) => {
  Story.find({ user: req.user.id })
    .populate("user")
    .sort({ date: "desc" })
    .then(stories => {
      res.render("stories/index", { stories: stories });
    });
});

// Process Add Route
router.post("/", (req, res) => {
  let allowComments;

  if (req.body.allowComments) {
    allowComments = true;
  } else {
    allowComments = false;
  }

  const newStory = {
    title: req.body.title,
    body: req.body.body,
    status: req.body.status,
    allowComments: allowComments,
    user: req.user.id
  };

  // Create Story
  new Story(newStory).save().then(story => {
    res.redirect(`/stories/show/${story.id}`);
  });
});

// Edit Form Process
router.put("/:id", ensureAuthenticated, (req, res) => {
  Story.findOne({
    _id: req.params.id
  }).then(story => {
    let allowComments;
    if (req.body.allowComments) {
      allowComments = true;
    } else {
      allowComments = false;
    }

    story.title = req.body.title;
    story.body = req.body.body;
    story.status = req.body.status;
    story.allowComments = allowComments;

    story.save().then(story => {
      res.redirect(`/stories/show/${story.id}`);
    });
  });
});

// Delete Story
router.delete("/:id", ensureAuthenticated, (req, res) => {
  Story.deleteOne({
    _id: req.params.id
  }).then(() => {
    res.redirect("/dashboard");
  });
});

//------------------------ Comments Routes ------------------------//

// Add Comment route
router.post("/comments/:id", ensureAuthenticated, (req, res) => {
  Story.findOne({ _id: req.params.id }).then(story => {
    const newComment = {
      commentBody: req.body.commentBody,
      commentUser: req.user.id
    };
    // Add Comment to Story
    story.comments.unshift(newComment);

    story.save().then(story => {
      res.redirect(`/stories/show/${story.id}`);
    });
  });
});

module.exports = router;
