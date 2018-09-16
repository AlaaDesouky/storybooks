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
    .then(story => {
      res.render("stories/index", { story: story });
    });
});

// Add Story Form
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("stories/add");
});

// Edit Story Form
router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  Story.findOne({ _id: req.params.id }).then(story => {
    res.render("stories/edit", { story: story });
  });
});

// Show single story
router.get("/show/:id", (req, res) => {
  Story.findOne({
    _id: req.params.id
  })
    .populate("user")
    .then(story => {
      res.render("stories/show", { story: story });
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
router.put("/:id", (req, res) => {
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
      res.redirect("/dashboard");
    });
  });
});

// Delete Story
router.delete("/:id", (req, res) => {
  Story.remove({
    _id: req.params.id
  }).then(() => {
    res.redirect("/dashboard");
  });
});

module.exports = router;
