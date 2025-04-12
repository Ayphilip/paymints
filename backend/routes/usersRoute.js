import express from 'express';
import User from '../models/user.js';
import { getToken, isAuth, isAdmin } from '../util.js';
import bcrypt from 'bcryptjs';
import { generateUsername } from '../config.js';
const router = express.Router();
// const sql = require("mssql");


router.get("/", async (req, res) => {

  const address = req.query.address ? {
    address: {
      $regex: req.query.address,
      $options: 'i',
    },
  }
    : {};;
  const searchKeyword = req.query.searchKeyword
    ? {
      name: {
        $regex: req.query.searchKeyword,
        $options: 'i',
      },
    }
    : {};

  const username = req.query.username
    ? {
      username: {
        $regex: req.query.username,
        $options: 'i',
      },
    }
    : {};
  const user = await User.find({ ...searchKeyword, ...address, ...username });
  try {
    res.send({ message: 'User Information Retrieved Successfully', data: user });

  } catch (error) {
    console.log(error)
    res.status(400).send({ message: error })
  }
});




router.put('/:id', async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId);
  try {

    if (user) {
      user.name = req.body.name || user.name;
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      user.image = req.body.image || user.image;
      user.address = req.body.address || user.address;
      user.status = req.body.status || user.status;
      user.isAdmin = req.body.isAdmin || user.isAdmin;
      user.twitterId = req.body.twitterId || user.twitterId;
      user.website = req.body.website || user.website;

      const updatedUser = await user.save();
      res.send({
        _id: updatedUser.id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        image: updatedUser.image,
        address: updatedUser.address,
        status: updatedUser.status,
        isAdmin: updatedUser.isAdmin,
        twitterId: updatedUser.twitterId,
        website: updatedUser.website,
        token: getToken(updatedUser)
      });

    } else {
      res.status(404).send({ message: 'User Not Found' });
    }
  } catch (error) {
    console.log(error)
    res.status(400).send({ message: error })
  }
});

router.get('/:id', async (req, res) => {
  const user = await User.findOne({ _id: req.params.id });
  try {

    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ message: "user not found" });
    }
  } catch (error) {
    console.log(error)
    res.status(400).send({ message: error })
  }
});

router.post('/signin', async (req, res) => {

  try {

    const signinUser = await User.findOne({
      address: req.body.address
    });
    const newUsername = generateUsername();
    // console.log(signinUser)
    if (signinUser) {
      res.send({
        _id: signinUser.id,
        name: signinUser.name,
        username: signinUser.username,
        email: signinUser.email,
        image: signinUser.image,
        address: signinUser.address,
        status: signinUser.status,
        isAdmin: signinUser.isAdmin,
        twitterId: signinUser.twitterId,
        website: signinUser.website,
        token: getToken(signinUser)
      });
    } else {
      // res.status(401).send({ message: "Invalid Email or Password" });
      const user = new User({
        name: req.body.name,
        username: newUsername,
        email: req.body.email,
        image: req.body.image,
        address: req.body.address,
        status: req.body.status,
        isAdmin: req.body.isAdmin,
        twitterId: req.body.twitterId,
        website: req.body.website
      });
      const newUser = await user.save();
      if (newUser) {
        res.send({
          _id: newUser.id,
          name: newUser.name,
          username: newUser.username,
          email: newUser.email,
          image: newUser.image,
          address: newUser.address,
          status: newUser.status,
          isAdmin: newUser.isAdmin,
          twitterId: newUser.twitterId,
          website: newUser.website,
          token: getToken(newUser)
        })
      }
    }
  } catch (error) {
    console.log(error)
    res.status(400).send({ message: error })
  }
});

router.delete("/:id", isAuth, isAdmin, async (req, res) => {
  const deletedUser = await User.findById(req.params.id);
  if (deletedUser) {
    await deletedUser.remove();
    res.send({ message: "User Deleted" });
  } else {
    res.send({ message: "Error Deleting User" });
  }
})

export default router;