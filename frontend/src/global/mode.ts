// Importing necessary modules and functions
import { create } from "zustand"; // Zustand for state management
import { persist, createJSONStorage } from "zustand/middleware"; // Middleware for persistence
import { jwtDecode } from "jwt-decode"; // JWT decoding library for decoding tokens

import axios from "axios"; // Axios for making HTTP requests

// Interface for Theme state
interface Theme {
  isDarkMode: boolean; // Boolean to track if dark mode is enabled
  toggleTheme: () => void; // Function to toggle between dark and light mode
}

// Interface for User state
interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  backgroundImage: string;
  role: string;
  department: string;
  batchYear: number;
  studentId: string;
  orgs: string[];
  avatar: string;
  bio: string;
  createdAt: Date; // Date when the user was created
}

// Interface for Comment state
interface Comment {
  user: User; // User who posted the comment
  parent: {
    type: string; // Type of the parent (post, reel, story, etc.)
    id: string; // ID of the parent entity (post, reel, etc.)
  };
  text: string; // Comment text
  createdAt: Date; // Date when the comment was created
}

// Interface for Post state
interface Post {
  user: User; // User who created the post
  text: string; // Post content
  media: string[]; // Array of media (e.g., images, videos)
  likes: User[]; // List of users who liked the post
  comments: Comment[]; // List of comments on the post
  shares: User[]; // List of users who shared the post
  createdAt: Date; // Date when the post was created
  visibility: string; // Visibility settings (e.g., public, private)
  tags: string[]; // Tags associated with the post
  relatedCourse: string; // Associated course (if applicable)
}

// Interface for Reel state (video posts)
interface Reel {
  user: User; // User who created the reel
  videoUrl: string; // URL of the video
  caption: string; // Caption for the video
  likes: User[]; // List of users who liked the reel
  comments: Comment[]; // List of comments on the reel
  shares: User[]; // List of users who shared the reel
  views: number; // Number of views for the reel
  createdAt: Date; // Date when the reel was created
  visibility: string; // Visibility settings (e.g., public, private)
  tags: string[]; // Tags associated with the reel
  relatedCourse: string; // Associated course (if applicable)
}

// Interface for Stories state (temporary content)
interface Stories {
  user: User; // User who created the story
  type: string; // Type of the story (e.g., text, image, video)
  text: string; // Text content of the story
  textStlye: {
    fontSize: number; // Font size for the text
    position: {
      x: number; // X position of the text
      y: number; // Y position of the text
    };
    background: string; // Background color or style for the text
  };
  media: string[]; // Array of media (e.g., images, videos)
  ilikes: User[]; // List of users who liked the story
  visibility: string; // Visibility settings (e.g., public, private)
  createdAt: Date; // Date when the story was created
  expiresAt: Date; // Date when the story will expire
}

// Interface for Notification state
interface Notification {
  recipient: User; // User receiving the notification
  sender: User; // User who triggered the notification
  type: string; // Type of notification (e.g., like, comment, follow)
  reference: {
    type: string; // Type of the reference (e.g., post, reel)
    id: string; // ID of the referenced entity
  };
  seen: boolean; // Whether the notification has been seen
  createdAt: Date; // Date when the notification was created
}

// Zustand store for managing theme state (dark mode or light mode)
export const useTheme = create<Theme>()(
  persist(
    (set, get) => ({
      isDarkMode: true, // Default to dark mode
      toggleTheme: () => {
        // Toggles the dark mode state
        set({ isDarkMode: !get().isDarkMode });
      },
    }),
    {
      name: "theme-storage", // Key for localStorage persistence
      storage: createJSONStorage(() => localStorage), // Using localStorage for persistence
    }
  )
);

interface ReelsStore {
  reels: Reel[];
  viewedIds: Set<string>;
  loading: boolean;
  error: string | null;
  fetchReels: () => Promise<void>;
  markAsViewed: (id: string) => void;
}

export const useReelsStore = create<ReelsStore>((set) => ({
  reels: [],
  viewedIds: new Set(),
  loading: false,
  error: null,
  fetchReels: async () => {
    set({ loading: true });
    try {
      const res = await axios.get(
        "https://adnuverse-backend.onrender.com/api/reels"
      );

      set({ reels: res.data.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
  markAsViewed: (id) => {
    set((state) => {
      const newSet = new Set(state.viewedIds);
      newSet.add(id);
      return { viewedIds: newSet };
    });
  },
}));

// Zustand store for managing user state (authentication and user data)
export const useUserStore = create(
  persist(
    (
      set: any,
      get: () => {
        getAllStories(): unknown;
        getUserReels(userId: string): unknown;
        getAllPost(userId: string): unknown;
        currentUser: User | null;
      }
    ) => ({
      currentUser: null, // Initially no user is logged in
      isLoading: false, // Loading state for login process
      error: null, // Error state for login failures
      followers: [],
      following: [],
      notifications: [],

      // Function to set the current user
      setCurrentUser: (user: User) => {
        set({ currentUser: user });
      },

      // Login function to authenticate the user
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null }); // Set loading state before API call
        try {
          // Sending POST request to authenticate the user
          const res = await axios.post(
            `https://adnuverse-backend.onrender.com/api/users/login`,
            {
              email: email,
              password: password,
            }
          );
          // Extract the token from the response
          const token = res.data.token;

          // Decode the token using jwt-decode
          const decodedToken = jwtDecode(token);

          // Store the token in localStorage for persistence
          localStorage.setItem("token", token);

          // Set the decoded user data to the store
          set({ currentUser: res.data.user, isLoading: false });
        } catch (error: any) {
          // Error handling
          set({ error: error.response?.data.error, isLoading: false }); // Set error state
        }
      },

      //Signup function
      signup: async (
        firstName: string,
        lastName: string,
        email: string,
        username: string,
        password: string,
        confirmPassword: string
      ) => {
        set({ isLoading: true, error: null });
        try {
          if (password !== confirmPassword) {
            set({
              error: "Passwords do not match. Please re-enter them.",
              isLoading: false,
            });
            return;
          }

          if (password.length < 8 || password.length > 64) {
            set({
              error: "Password must be between 8 and 64 characters long",
              isLoading: false,
            });
            return;
          }

          interface SignupResponse {
            data: {
              message: string;
              user: User;
            };
          }

          const res: SignupResponse = await axios.post(
            "https://adnuverse-backend.onrender.com/api/users/create",
            {
              firstName,
              lastName,
              email,
              username,
              password,
            }
          );

          set({ isLoading: false, error: null });
        } catch (error: any) {
          set({ error: error.response?.data.error, isLoading: false });
        }
      },

      //Logout function
      logout: () => {
        localStorage.removeItem("token");
        set({ currentUser: null, error: null, isLoading: false });
      },

      //Update Profile
      updateUser: async (updatedFields: Partial<User>) => {
        set({ isLoading: true, error: null });

        try {
          const token = localStorage.getItem("token");

          if (!token) {
            throw new Error("No token found. User not authenticated");
          }

          const { currentUser } = get();

          if (!currentUser) {
            throw new Error("No current user found.");
          }

          const res = await axios.put(
            `https://adnuverse-backend.onrender.com/api/users/${currentUser._id}`,
            updatedFields,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          set({ currentUser: res.data.data, isLoading: false });
        } catch (error: any) {
          console.error(error);
          set({
            error: error.response.data.error || error.message,
            isLoading: false,
          });
        }
      },

      // Change Password
      changePassword: async (
        oldPassword: string,
        newPassword: string,
        confirmNewPassword: string
      ) => {
        set({ isLoading: true, error: null });

        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("No token found. User not authenticated.");
          }

          const res = await axios.put(
            "https://adnuverse-backend.onrender.com/api/users/change-password",
            {
              oldPassword,
              newPassword,
              confirmNewPassword,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          set({ isLoading: false });

          return res.data; // optional, for success UI handling
        } catch (error: any) {
          console.error("Change password error:", error);
          set({
            error: error.response?.data?.error || error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      //Get All Users
      // Get all users
      getAllUsers: async () => {
        set({ isLoading: true, error: null });

        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("User is not authenticated.");
          }

          const res = await axios.get(
            "https://adnuverse-backend.onrender.com/api/users",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const users = res.data.data;

          set({ isLoading: false, error: null });
          return users;
        } catch (error: any) {
          console.error("Error in getAllUsers:", error);
          set({
            error: error.response?.data?.error || error.message,
            isLoading: false,
          });
          return null;
        }
      },

      // Get All User Posts
      getAllPost: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
          const res = await axios.get(
            "https://adnuverse-backend.onrender.com/api/posts"
          );
          const allPosts = res.data.data;
          const { currentUser } = get();

          // Step 1: Filter based on visibility rules
          const filteredPosts = allPosts.filter((post: any) => {
            const visibility = post.visibility;
            const postUser = post.user;

            if (!postUser) return false;

            if (visibility === "public" || postUser._id === currentUser?._id) {
              return true;
            }

            if (visibility === "department-only") {
              return (
                postUser?.department &&
                currentUser?.department &&
                postUser.department[0] === currentUser.department[0]
              );
            }

            if (visibility === "followers-only") {
              return (
                Array.isArray(postUser?.followers) &&
                postUser.followers.some(
                  (followerId: string) => followerId === currentUser._id
                )
              );
            }

            return false;
          });

          // Step 2: Filter for posts by the specific user
          const userPosts = filteredPosts
            .filter((post: any) => post.user._id === userId)
            .sort(
              (a: any, b: any) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );

          set({ isLoading: false, error: null });
          return userPosts;
        } catch (error: any) {
          console.error("Error in getAllPost:", error);
          set({
            error: error.response?.data?.error || error.message,
            isLoading: false,
          });
          return null;
        }
      },

      //Get All User Posts
      getAllDataPost: async () => {
        set({ isLoading: true, error: null });

        try {
          const res = await axios.get(
            "https://adnuverse-backend.onrender.com/api/posts"
          );
          const allPosts = res.data.data;
          const { currentUser } = get();

          // Filter posts based on visibility rules
          const filteredPosts = allPosts.filter((post: any) => {
            const visibility = post.visibility;
            const postUser = post.user;

            if (visibility === "public" || postUser._id === currentUser?._id) {
              return true;
            }

            if (visibility === "department-only") {
              return (
                postUser?.department &&
                currentUser?.department &&
                postUser.department[0] === currentUser.department[0]
              );
            }

            if (visibility === "followers-only") {
              return (
                Array.isArray(postUser?.followers) &&
                postUser.followers.some(
                  (followerId: string) => followerId === currentUser._id
                )
              );
            }

            return false; // Default: do not show post if visibility is unknown
          });

          // Sort posts by date (newest first)
          const userPosts = filteredPosts.sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          set({ isLoading: false, error: null });

          return userPosts;
        } catch (error: any) {
          console.error("Error in getAllPost:", error);
          set({
            error: error.response?.data?.error || error.message,
            isLoading: false,
          });
          return null;
        }
      },

      //Delete Post
      deletePost: async (postId: string) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("token");

          if (!token) {
            throw new Error("User is not authenticated.");
          }

          await axios.delete(
            `https://adnuverse-backend.onrender.com/api/posts/${postId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const updatedPosts = await get().getAllPost();

          set({ isLoading: false });

          return updatedPosts;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || error.message,
            isLoading: false,
          });
          return null;
        }
      },

      // Create Post
      createPost: async (
        caption: string,
        media: string[],
        visibility: string,
        tags: string[],
        relatedCourse: string
      ) => {
        set({ isLoading: true, error: null });

        try {
          const token = localStorage.getItem("token");

          if (!token) {
            throw new Error("User is not authenticated.");
          }

          const res = await axios.post(
            "https://adnuverse-backend.onrender.com/api/posts",
            { media, text: caption, visibility, tags, relatedCourse }, //relatedCourse
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          set({ isLoading: false });
          return res.data.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || error.message,
            isLoading: false,
          });
          return null;
        }
      },

      //Update Post
      updatePost: async (
        postId: string,
        updatedFields: {
          text?: string;
          media?: string[];
          visibility?: string;
          tags?: string[];
          relatedCourse?: string;
        }
      ) => {
        set({ isLoading: true, error: null });

        try {
          const token = localStorage.getItem("token");

          if (!token) {
            throw new Error("User is not authenticated");
          }

          const res = await axios.put(
            `https://adnuverse-backend.onrender.com/api/posts/${postId}`,
            updatedFields,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const updatedPost = res.data.data;

          // Optionally refresh the user's posts list or manually update the local store

          set({ isLoading: false });
          return updatedPost;
        } catch (error: any) {
          console.error("Error updating post:", error);
          set({
            error: error.response?.data?.error || error.message,
            isLoading: false,
          });
          return null;
        }
      },

      // Create Reel
      createReel: async (
        text: string,
        videoUrl: string[],
        visibility: string,
        tags: string[],
        relatedCourse: string
      ) => {
        set({ isLoading: true, error: null });

        try {
          const token = localStorage.getItem("token");

          if (!token) {
            throw new Error("User is not authenticated.");
          }

          const res = await axios.post(
            "https://adnuverse-backend.onrender.com/api/reels",
            { caption: text, videoUrl, visibility, tags, relatedCourse },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          set({ isLoading: false });
          return res.data.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || error.message,
            isLoading: false,
          });
          return null;
        }
      },

      // Get All Reels
      getAllReels: async () => {
        set({ isLoading: true, error: null });

        try {
          const res = await axios.get(
            "https://adnuverse-backend.onrender.com/api/reels"
          );

          const { currentUser } = get();
          const allReels = res.data.data;

          // Filter reels based on visibility
          const filteredReels = allReels.filter((reel: any) => {
            const visibility = reel.visibility;
            const reelUser = reel.user;

            if (!reelUser || !visibility) return false;

            if (visibility === "public" || reelUser._id === currentUser?._id) {
              return true;
            }

            if (visibility === "department-only") {
              return (
                Array.isArray(reelUser?.department) &&
                Array.isArray(currentUser?.department) &&
                reelUser.department[0] === currentUser.department[0]
              );
            }

            if (visibility === "followers-only") {
              return (
                Array.isArray(reelUser?.followers) &&
                reelUser.followers.includes(currentUser._id)
              );
            }

            return false;
          });

          // Sort reels by newest first
          const sortedReels = filteredReels.sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          set({ isLoading: false, error: null });
          return sortedReels;
        } catch (error: any) {
          console.error("Error in getAllReels:", error);
          set({
            error: error.response?.data?.error || error.message,
            isLoading: false,
          });
          return null;
        }
      },

      // Get User's Reels
      // Get User's Reels
      getUserReels: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
          const res = await axios.get(
            "https://adnuverse-backend.onrender.com/api/reels"
          );
          const { currentUser } = get();

          const userReels = res.data.data
            .filter((reel: any) => {
              const reelUser = reel.user;
              const visibility = reel.visibility;

              if (!reelUser || reelUser._id !== userId) return false;

              if (
                visibility === "public" ||
                reelUser._id === currentUser?._id
              ) {
                return true;
              }

              if (visibility === "department-only") {
                return (
                  Array.isArray(reelUser?.department) &&
                  Array.isArray(currentUser?.department) &&
                  reelUser.department[0] === currentUser.department[0]
                );
              }

              if (visibility === "followers-only") {
                return (
                  Array.isArray(reelUser?.followers) &&
                  reelUser.followers.includes(currentUser._id)
                );
              }

              return false;
            })
            .sort(
              (a: any, b: any) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );

          set({ isLoading: false, error: null });
          return userReels;
        } catch (error: any) {
          console.error("Error in getUserReels:", error);
          set({
            error: error.response?.data?.error || error.message,
            isLoading: false,
          });
          return null;
        }
      },

      //Delete Reel
      deleteReel: async (reelId: string) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("token");

          if (!token) {
            throw new Error("User is not authenticated.");
          }

          await axios.delete(
            `https://adnuverse-backend.onrender.com/api/reels/${reelId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const updatedReels = await get().getUserReels();

          set({ isLoading: false });

          return updatedReels;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || error.message,
            isLoading: false,
          });
          return null;
        }
      },

      //Increment Reel Views
      addReelViews: async (reelId: string) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("token");

          if (!token) {
            throw new Error("User is not authenticated.");
          }

          const res = await axios.post(
            `https://adnuverse-backend.onrender.com/api/reels/${reelId}/view`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const updatedReels = await get().getUserReels(res.data.data.user._id);

          set({ isLoading: false });

          return updatedReels;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || error.message,
            isLoading: false,
          });
          return null;
        }
      },

      //Like Reel
      likeReel: async (reelId: string) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("token");

          if (!token) {
            throw new Error("User is not authenticated.");
          }

          const res = await axios.post(
            `https://adnuverse-backend.onrender.com/api/reels/${reelId}/like`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const updatedReels = await get().getUserReels();

          set({ isLoading: false });

          return res.data.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || error.message,
            isLoading: false,
          });
          return null;
        }
      },

      //Create Story
      createStory: async (
        Type_Of_Story: string,
        text: string,
        media: string,
        visibility: string,
        textStyle: Object
      ) => {
        set({ isLoading: true, error: null });

        try {
          const token = localStorage.getItem("token");

          if (!token) {
            throw new Error("User is not authenticated.");
          }

          const res = await axios.post(
            "https://adnuverse-backend.onrender.com/api/stories/create",
            { Type_Of_Story, text, media, visibility, textStyle },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          set({ isLoading: false });
          return res.data.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || error.message,
            isLoading: false,
          });
          return null;
        }
      },

      // Get All Reel
      getAllStories: async () => {
        set({ isLoading: true, error: null });

        try {
          const res = await axios.get(
            "https://adnuverse-backend.onrender.com/api/stories"
          );
          const { currentUser } = get();

          let stories = res.data.data;

          // Filter based on visibility rules
          const filteredStories = stories.filter((story: any) => {
            const visibility = story.visibility;
            const storyUser = story.user;

            if (!storyUser) return false;

            if (visibility === "public" || storyUser._id === currentUser?._id) {
              return true;
            }

            if (visibility === "department-only") {
              return (
                storyUser?.department &&
                currentUser?.department &&
                storyUser.department[0] === currentUser.department[0]
              );
            }

            if (visibility === "followers-only") {
              return (
                Array.isArray(storyUser?.followers) &&
                storyUser.followers.some(
                  (followerId: string) => followerId === currentUser._id
                )
              );
            }

            return false; // Default case
          });

          // Sort by date (newest first)
          filteredStories.sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          // Ensure currentUser's story appears first
          if (currentUser) {
            const currentUserStoryIndex = filteredStories.findIndex(
              (story: any) => story.user._id === currentUser._id
            );

            if (currentUserStoryIndex !== -1) {
              const [currentUserStory] = filteredStories.splice(
                currentUserStoryIndex,
                1
              );
              filteredStories.unshift(currentUserStory);
            }
          }

          set({ isLoading: false, error: null });
          return filteredStories;
        } catch (error: any) {
          console.error("Error in getAllStories:", error);
          set({
            error: error.response?.data?.error || error.message,
            isLoading: false,
          });
          return null;
        }
      },

      //Delete Story
      deleteStory: async (storyId: string) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("token");

          if (!token) {
            throw new Error("User is not authenticated.");
          }

          const res = await axios.delete(
            `https://adnuverse-backend.onrender.com/api/stories/${storyId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          set({ isLoading: false });

          return res.data.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || error.message,
            isLoading: false,
          });
          return null;
        }
      },

      //Like Story
      likeStory: async (storyId: string) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("token");

          if (!token) {
            throw new Error("User is not authenticated.");
          }

          const res = await axios.post(
            `https://adnuverse-backend.onrender.com/api/stories/${storyId}/like`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          set({ isLoading: false });

          return res.data.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || error.message,
            isLoading: false,
          });
          return null;
        }
      },

      //Increment Reel Views
      addStoryViews: async (storyId: string) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("token");

          if (!token) {
            throw new Error("User is not authenticated.");
          }

          await axios.post(
            `https://adnuverse-backend.onrender.com/api/stories/${storyId}/view`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const updatedStories = await get().getAllStories();

          set({ isLoading: false });

          return updatedStories;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || error.message,
            isLoading: false,
          });
          return null;
        }
      },

      //Like Post
      likePost: async (postId: string) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("token");

          if (!token) {
            throw new Error("User is not authenticated.");
          }

          const res = await axios.post(
            `https://adnuverse-backend.onrender.com/api/posts/${postId}/like`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          set({ isLoading: false });

          // Optionally return the updated post
          return res.data.data;
        } catch (error: any) {
          console.error("Error liking post:", error);
          set({
            error: error.response?.data?.error || error.message,
            isLoading: false,
          });
          return null;
        }
      },

      //Add Comment to Post
      commentOnPost: async (postId: string, text: string) => {
        try {
          const token = localStorage.getItem("token"); // Assuming you store JWT in localStorage
          const response = await axios.post(
            `https://adnuverse-backend.onrender.com/api/comments/post/${postId}/comment`,
            { text },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          return response.data?.data; // newComment object
        } catch (error) {
          console.error("Error commenting on post:", error);
          throw error;
        }
      },

      //Get Comment for Post
      getCommentsForPost: async (postId: string) => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `https://adnuverse-backend.onrender.com/api/comments/post/${postId}/comments`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          return response.data?.data; // array of comments
        } catch (error) {
          console.error("Error fetching comments:", error);
          throw error;
        }
      },

      // Delete a Comment
      deleteComment: async (commentId: string) => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.delete(
            `https://adnuverse-backend.onrender.com/api/comments/${commentId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          return response.data;
        } catch (error) {
          console.error("Error deleting comment:", error);
          throw error;
        }
      },

      //Add Comment to Post
      commentOnReel: async (reelId: string, text: string) => {
        try {
          const token = localStorage.getItem("token"); // Assuming you store JWT in localStorage
          const response = await axios.post(
            `https://adnuverse-backend.onrender.com/api/comments/reel/${reelId}/comment`,
            { reelId, text },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          return response.data?.data; // newComment object
        } catch (error) {
          console.error("Error commenting on post:", error);
          throw error;
        }
      },

      //Get Comment for Reel
      getCommentsForReel: async (reelId: string) => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `https://adnuverse-backend.onrender.com/api/comments/reel/${reelId}/comments`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          return response.data?.data; // array of comments
        } catch (error) {
          console.error("Error fetching comments:", error);
          throw error;
        }
      },

      //Get User By Id
      fetchUserById: async (userId: string) => {
        try {
          const token = localStorage.getItem("token");

          const res = await axios.get(
            `https://adnuverse-backend.onrender.com/api/users/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          set({ isLoading: false });

          // Axios responses have `res.status` and `res.data`, not `res.ok`
          return res.data.data; // assuming `data` contains the user object
        } catch (error) {
          console.error("Error fetching user by ID:", error);
          throw error;
        }
      },

      //Get All Followers
      getAllFollowers: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
          const token = localStorage.getItem("token");

          const res = await axios.get(
            `https://adnuverse-backend.onrender.com/api/users/${userId}/followers`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const followers = res.data.data;

          set({ followers, isLoading: false, error: null });
          return followers;
        } catch (error: any) {
          console.error("Error in getAllFollowers:", error);
          set({
            error: error.response?.data?.error || error.message,
            isLoading: false,
          });
          return null;
        }
      },

      //Get Other User Profile
      getOtherFollowing: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
          const token = localStorage.getItem("token");

          const res = await axios.get(
            `https://adnuverse-backend.onrender.com/api/users/${userId}/following`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const following = res.data.data;

          return following;
        } catch (error: any) {
          console.error("Error in getAllFollowers:", error);
          set({
            error: error.response?.data?.error || error.message,
            isLoading: false,
          });
          return null;
        }
      },

      //Get All Following
      getOtherFollowers: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
          const token = localStorage.getItem("token");

          const res = await axios.get(
            `https://adnuverse-backend.onrender.com/api/users/${userId}/followers`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const following = res.data.data;

          set({ isLoading: false, error: null });
          return following;
        } catch (error: any) {
          console.error("Error in getAllFollowers:", error);
          set({
            error: error.response?.data?.error || error.message,
            isLoading: false,
          });
          return null;
        }
      },

      //Get All Following
      getAllFollowing: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
          const token = localStorage.getItem("token");

          const res = await axios.get(
            `https://adnuverse-backend.onrender.com/api/users/${userId}/following`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const following = res.data.data;

          set({ following, isLoading: false, error: null });
          return following;
        } catch (error: any) {
          console.error("Error in getAllFollowing:", error);
          set({
            error: error.response?.data?.error || error.message,
            isLoading: false,
          });
          return null;
        }
      },

      // Follow User
      followUser: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
          const token = localStorage.getItem("token");

          if (!token) {
            throw new Error("User is not authenticated.");
          }

          const response = await axios.post(
            `https://adnuverse-backend.onrender.com/api/users/${userId}/follow`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          set({ isLoading: false });

          const followedUser = response.data.data;

          set((state) => ({
            isLoading: false,
            following: [...state.following, followedUser._id],
          }));

          return response.data.data; // returns followed user
        } catch (error: any) {
          console.error("ERROR: ", error);

          set({
            error: error.response?.data?.error || error.message,
            isLoading: false,
          });

          return null;
        }
      },

      // Unfollow User
      unfollowUser: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
          const token = localStorage.getItem("token");

          if (!token) {
            throw new Error("User is not authenticated.");
          }

          const response = await axios.post(
            `https://adnuverse-backend.onrender.com/api/users/${userId}/unfollow`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          set((state) => ({
            isLoading: false,
            following: state.following.filter((id: string) => id !== userId),
          }));

          return response.data; // returns success message
        } catch (error: any) {
          console.error("ERROR: ", error);

          set({
            error: error.response?.data?.error || error.message,
            isLoading: false,
          });

          return null;
        }
      },

      //Get All Notifications
      getAllNotifications: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
          const token = localStorage.getItem("token");

          const res = await axios.get(
            `https://adnuverse-backend.onrender.com/api/notifications/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const notifications = res.data.data;

          set({ notifications, isLoading: false, error: null });
          return notifications;
        } catch (error: any) {
          console.error("Error in getAllNotifications:", error);
          set({
            error: error.response?.data?.error || error.message,
            isLoading: false,
          });
          return null;
        }
      },

      //Delete Notification
      deleteNotification: async (notificationId: string) => {
        try {
          const token = localStorage.getItem("token");

          await axios.delete(
            `https://adnuverse-backend.onrender.com/api/notifications/${notificationId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // Optionally: remove it from local state
          set((state) => ({
            notifications: state.notifications.filter(
              (n) => n._id !== notificationId
            ),
          }));
        } catch (error: any) {
          console.error("Error deleting notification:", error);
          set({ error: error.response?.data?.error || error.message });
        }
      },

      //Delete All Notifications
      deleteAllNotifications: async (userId: string) => {
        try {
          const token = localStorage.getItem("token");

          const res = await axios.delete(
            `https://adnuverse-backend.onrender.com/api/notifications/user/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (res.data.success) {
            set({ notifications: [] }); // Clear local state
          }
        } catch (error: any) {
          console.error("Error deleting all notifications:", error);
          set({ error: error.response?.data?.error || error.message });
        }
      },
    }),

    {
      name: "user-store", // Key for localStorage persistence
      storage: createJSONStorage(() => localStorage), // Using localStorage for persistence
    }
  )
);

//test@example123.com
//password123

//test@example123.com
//password123

//johndoe@gmail.com
//johnDoe3
//12345678

//miles@gmail.com
//spiderman
