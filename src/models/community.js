'use strict';
const mongoose = require('mongoose');
const helper = require('./helper');

const post = mongoose.model('post', mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, require: true },
  comments: { type: [] },
  likes: { type: Number, default: 0 },
  pinned: { type: String, default: 'false' },
  auth_id: { type: Number, require: true },
  profile: mongoose.Schema.Types.Mixed,
  date: { type: Date, default: Date.now },
}));

// const record = {
//   title: 'test',
//   body: 'testrt tae abr ba bab arb ababab',
//   auth_id: 1,
//   profile:{test:'here'},
// };



class Community {
  constructor() {

  }

  async posts(user) {
    const pinned = await post.find({ pinned: 'true' });
    const personPost = await post.find({ auth_id: user.id, pinned: 'false' });
    const communityPosts = await post.find({ pinned: 'false', auth_id: { $ne: user.id } });
    return { pinned, personPost, communityPosts };
  }

  async submitPost(user, payload) {
    if (user.account_type === 'c') {
      return;
    }
    const id = await helper.getID(user.id, 'person');
    const profile = await helper.getProfile(id, 'person');

    const record = {
      title: payload.title,
      body: payload.body,
      auth_id: user.id,
      profile: { name: `${profile.first_name} ${profile.last_name}`, avatar: profile.avatar, job_title: profile.job_title },
    };

    const newPost = new post(record);
    await newPost.save();
  }

  async deletePost(user, id) {
    await post.findByIdAndDelete({ auth_id: user.id, id });
  }

  async updatePost(user, id, payload) {
    const check = await post.find({ auth_id: user.id, id });
    if (check.length > 0) {
      await post.findByIdAndUpdate(id, payload, { new: true });
    }
  }

  async addComment(user, id, payload) {
    const idPerson = await helper.getID(user.id, 'person');
    const profile = await helper.getProfile(idPerson, 'person');
    const newComment = {
      writerID: user.id,
      comment: payload,
      profile: `${profile.first_name} ${profile.last_name}`, avatar: profile.avatar, job_title: profile.job_title,
    };
    const targetPost = await post.find({ id });
    const comments = targetPost[0].comments;
    comments.push(newComment);
    await post.findByIdAndUpdate(id, comments, { new: true });
  }
  
  async deleteComment(user, postID, commentID) {
    const targetPost = await post.find({ postID });
    const comments = targetPost[0].comments;
    const check = comments[commentID].writerID == user.id;
    const newComments = [];
    if (check) {
      comments.forEach((item, index) => {
        if (index !== commentID) {
          newComments.push(item);
        }
      });
      await post.findByIdAndUpdate(postID, newComments, { new: true });
    }
  }
}

module.exports = new Community();

// tests--------
// function test() {
// const newR = new post(record);
// newR.save();
// 5fa702a089dcd943290dc5cf
// async function test() {
//   const x = await post.find({ _id: '5fa702a089dcd943290dc5cf' });
//   console.log(x);
//   x[0].comments.push({by:'auth_id',comment:'g',like:0});
//   x[0].save();
// }
// test();
// newR.findByIdAndUpdate('5fa7018ee7312742eb3f1bc0', record, { new: true });
// }

