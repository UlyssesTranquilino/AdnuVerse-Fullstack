import { Request, Response, NextFunction } from 'express';
import { PostModel } from '../models/Post.model';
import { IUser, UserModel } from '../models/User.model';
import { Types } from 'mongoose';
import { NotificationModel } from '../models/notification.model';

// Create a new post
// controller/postController.ts
const createPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as Request & { user: IUser }).user;  // Accessing the user from JWT

    // Ensure user is authenticated
    if (!user || !user._id) {
      res.status(403).json({ success: false, error: 'User is not authenticated or user ID is missing' });
      return;
    }

    const { text, media, visibility, tags, relatedCourse } = req.body;  // Destructure from request body

    // Create a new post
    const newPost = new PostModel({
      user: user._id,  // Reference the user's _id
      text,
      media,
      visibility,
      tags,
      relatedCourse,  // Ensure relatedCourse is passed from the request body
    });

    // Save the new post
    await newPost.save();

    // Notify followers of the new post
    const followers = await UserModel.find({ following: user._id }); // Find users following this user
    followers.forEach(async (follower) => {
      const notification = new NotificationModel({
        recipient: follower._id,
        sender: user._id,
        type: 'follow',
        reference: { type: 'Post', id: newPost._id },
        seen: false,
      });
      await notification.save();
    });

    // Respond with the created post data
    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    console.error('Error creating post:', error);
    next(error);  // Pass error to global handler
  }
};


// Update an existing post
const updatePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { text, media, visibility, tags, relatedCourse } = req.body;
    const user = (req as Request & { user: IUser }).user;

    const post = await PostModel.findById(id);
    if (!post) {
      res.status(404).json({ success: false, error: 'Post not found' });
      return;
    }

    if (post.user.toString() !== user._id.toString()) {
      res.status(403).json({ success: false, error: 'Unauthorized to update this post' });
      return;
    }

    // Update post fields
    post.text = text || post.text;
    post.media = media || post.media;
    post.visibility = visibility || post.visibility;
    post.tags = tags || post.tags;
    post.relatedCourse = relatedCourse || post.relatedCourse;

    await post.save();

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error('Error updating post:', error);
    next(error);
  }
};

// Delete a post
const deletePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as Request & { user: IUser }).user;

    const post = await PostModel.findById(id);
    if (!post) {
      res.status(404).json({ success: false, error: 'Post not found' });
      return;
    }

    if (post.user.toString() !== user._id.toString()) {
      res.status(403).json({ success: false, error: 'Unauthorized to delete this post' });
      return;
    }

    // Delete the post
    await PostModel.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    next(error);
  }
};

// Get all posts
const getAllPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const posts = await PostModel.find().populate('user');
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    next(error);
  }
};

// Like a post
// controller/postController.ts
const likePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => { 
  try {
    const { postId } = req.params;
    const user = (req as Request & { user: IUser }).user;

    const post = await PostModel.findById(postId);
    if (!post) {
      res.status(404).json({ success: false, error: 'Post not found' });
      return;
    }

    const userId = new Types.ObjectId(user._id);
    const userIndex = post.likes.indexOf(userId);

    if (userIndex > -1) {
      // Remove like if already liked
      post.likes.splice(userIndex, 1);
      await post.save();
      res.status(200).json({ success: true, message: 'Like removed', data: post });
    } else {
      // Add like if not liked yet
      post.likes.push(userId);
      await post.save();
      
      // Create notification for the post owner
      const postOwner = await UserModel.findById(post.user);
      if (postOwner) {
        const message = `${user.firstName} liked your post`;
        const newNotification = new NotificationModel({
          recipient: postOwner._id,
          sender: user._id,
          type: 'like',
          reference: { type: 'Post', id: post._id },
          seen: false,
          createdAt: new Date(),
        });
        await newNotification.save();
      }

      res.status(200).json({ success: true, message: 'Post liked', data: post });
    }
  } catch (error) {
    console.error('Error liking/unliking post:', error);
    next(error);
  }
};

// Get a single post by ID
const getPostById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;  // Get post ID from params
    const post = await PostModel.findById(id).populate('user');  // Fetch the post and populate user data

    if (!post) {
      res.status(404).json({ success: false, error: 'Post not found' });
      return;
    }

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error('Error fetching post:', error);
    next(error);
  }
};
// In PostController
const getPostsByUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;  // Get user ID from params

    // Ensure the userId is a valid ObjectId before querying
    const userObjectId = new Types.ObjectId(userId);

    // Find posts by the user
    const posts = await PostModel.find({ user: userObjectId }).populate('user');  

    if (!posts || posts.length === 0) {
    res.status(404).json({ success: false, error: 'No posts found for this user' });
    return
    }

    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    console.error('Error fetching posts for user:', error);
    next(error);  // Pass the error to the global error handler
  }
};


// Export PostController
export const PostController = {
  createPost,
  updatePost,
  deletePost,
  getAllPosts,
  likePost,
  getPostById,
  getPostsByUser,
};
