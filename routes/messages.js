var express = require("express");
var router = express.Router();
let messageModel = require("../schemas/messages");
const { checkLogin } = require("../utils/authHandler");

router.get("/:userID", checkLogin, async function (req, res, next) {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userID;

    const messages = await messageModel
      .find({
        $or: [
          { from: currentUserId, to: targetUserId },
          { from: targetUserId, to: currentUserId }
        ]
      })
      .sort({ createdAt: 1 })
      .populate("from", "username avatarUrl")
      .populate("to", "username avatarUrl");

    res.send(messages);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post("/", checkLogin, async function (req, res, next) {
  try {
    const currentUserId = req.user._id;
    const { to, messageContent } = req.body;

    if (!to || !messageContent) {
      return res.status(400).send({ message: "Missing required fields" });
    }

    if (!messageContent.type || !messageContent.text) {
      return res.status(400).send({ message: "Invalid message content format" });
    }

    if (messageContent.type !== "file" && messageContent.type !== "text") {
      return res.status(400).send({ message: "Type must be 'file' or 'text'" });
    }

    const newMessage = new messageModel({
      from: currentUserId,
      to: to,
      messageContent: messageContent
    });

    await newMessage.save();

    const populatedMessage = await messageModel
      .findById(newMessage._id)
      .populate("from", "username avatarUrl")
      .populate("to", "username avatarUrl");

    res.send(populatedMessage);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/", checkLogin, async function (req, res, next) {
  try {
    const currentUserId = req.user._id;

    const lastMessages = await messageModel.aggregate([
      {
        $match: {
          $or: [
            { from: currentUserId },
            { to: currentUserId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$from", currentUserId] },
              "$to",
              "$from"
            ]
          },
          lastMessage: { $first: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $lookup: {
          from: "users",
          localField: "lastMessage.from",
          foreignField: "_id",
          as: "lastMessage.from"
        }
      },
      {
        $unwind: "$lastMessage.from"
      },
      {
        $lookup: {
          from: "users",
          localField: "lastMessage.to",
          foreignField: "_id",
          as: "lastMessage.to"
        }
      },
      {
        $unwind: "$lastMessage.to"
      },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          username: "$user.username",
          avatarUrl: "$user.avatarUrl",
          lastMessage: {
            _id: "$lastMessage._id",
            from: {
              _id: "$lastMessage.from._id",
              username: "$lastMessage.from.username",
              avatarUrl: "$lastMessage.from.avatarUrl"
            },
            to: {
              _id: "$lastMessage.to._id",
              username: "$lastMessage.to.username",
              avatarUrl: "$lastMessage.to.avatarUrl"
            },
            messageContent: "$lastMessage.messageContent",
            createdAt: "$lastMessage.createdAt",
            updatedAt: "$lastMessage.updatedAt"
          }
        }
      }
    ]);

    res.send(lastMessages);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;