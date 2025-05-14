import { useState, useRef, useEffect } from "react";
import { useTheme, useUserStore } from "../../global/mode";
import { useNavigate, useParams, Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
//Toaster
import toast, { Toaster } from "react-hot-toast";

// Icons
import ApartmentIcon from "@mui/icons-material/Apartment";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import PublicIcon from "@mui/icons-material/Public";
import GroupIcon from "@mui/icons-material/Group";
import SchoolIcon from "@mui/icons-material/School";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

// Components
import Sidebar from "../../components/Sidebar";
import MobileSidebar from "../../components/MobileSidebar";
import Skeleton from "@mui/material/Skeleton";
import ReelViewer from "../../components/Reels/ReelViewer";
import FeedModal from "../../components/Feed/FeedModal";

// MUI
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

import EmptySearchImg from "../../assets/EmptySearch.png";
import { IconButton, Menu, MenuItem } from "@mui/material";

const SearchPage = () => {
  const navigate = useNavigate();
  const { searchTerm } = useParams();
  const { isDarkMode } = useTheme();

  const {
    currentUser,
    getAllDataPost,
    getAllReels,
    getAllUsers,
    likePost,
    commentOnPost,
    getCommentsForPost,
    deleteComment,
  } = useUserStore();

  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [reels, setReels] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [activeReel, setActiveReel] = useState();

  // Comment state
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>(
    {}
  );
  const [activeCommentBoxes, setActiveCommentBoxes] = useState<
    Record<string, boolean>
  >({});
  const [isFocused, setIsFocused] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Reel viewer state
  const [reelViewVisible, setReelViewVisible] = useState(false);
  const [reelData, setReelData] = useState(0);
  const handleOpenReel = () => setReelViewVisible(true);
  const handleCloseReel = () => setReelViewVisible(false);

  // Results length
  const [peopleLength, setPeopleLength] = useState(4);
  const [postsLength, setPostsLength] = useState(1);
  const [reelsLength, setReelsLength] = useState(4);

  // Media modal state
  const [mediaModal, setMediaModal] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaUrlActive, setMediaUrlActive] = useState(0);

  // Modal Style
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "90vw", sm: "55vw", md: "40vw" }, // responsive width

    maxHeight: "90vh", // prevent it from being too tall
    bgcolor: isDarkMode ? "#1d2026" : "#f0f5ff",
    borderRadius: "16px", // rounded corners
    boxShadow: 24,

    overflow: "hidden", // prevent content from overflowing
    display: "flex",
    flexDirection: "column",
  };

  const feedStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    p: 4,
  };

  // Adjust textarea height
  const adjustHeight = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [commentInputs]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch posts
        const postsData = await getAllDataPost();
        if (postsData) {
          setPosts(filterPosts(postsData, searchTerm || ""));
        }

        // Fetch reels
        const reelsData = await getAllReels();
        if (reelsData) {
          setReels(filterReels(reelsData, searchTerm || ""));
        }

        const users = await getAllUsers();
        if (users) setPeople(filterUsers(users, searchTerm || ""));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getAllDataPost, getAllReels, getAllUsers, searchTerm]);

  // Filter functions
  const filterUsers = (users: any, searchTerm: string) => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter((user: any) => {
      return (
        user.firstName?.toLowerCase().includes(term) ||
        user.lastName?.toLowerCase().includes(term) ||
        user.username?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.studentId?.toLowerCase().includes(term)
      );
    });
  };

  const filterReels = (allReels: any, searchTerm: string) => {
    if (!searchTerm) return allReels;
    const term = searchTerm.toLowerCase();
    return allReels.filter((reel: any) => {
      return (
        reel.caption?.toLowerCase().includes(term) ||
        reel.relatedCourse?.toLowerCase().includes(term) ||
        reel.tags?.some((tag) => tag.toLowerCase().includes(term)) ||
        reel.user.firstName?.toLowerCase().includes(term) ||
        reel.user.lastName?.toLowerCase().includes(term) ||
        reel.user.username?.toLowerCase().includes(term)
      );
    });
  };

  const filterPosts = (allPosts: any, searchTerm: string) => {
    if (!searchTerm) return allPosts;
    const term = searchTerm.toLowerCase();
    return allPosts.filter((post: any) => {
      return (
        post.text?.toLowerCase().includes(term) ||
        post.relatedCourse?.toLowerCase().includes(term) ||
        post.tags?.some((tag: string) => tag.toLowerCase().includes(term)) ||
        post.user.firstName?.toLowerCase().includes(term) ||
        post.user.lastName?.toLowerCase().includes(term) ||
        post.user.username?.toLowerCase().includes(term)
      );
    });
  };

  // Get visibility icon
  const getVisibilityIcon = (option: string) => {
    switch (option) {
      case "public":
        return <PublicIcon className="scale-50 -ml-1" />;
      case "department-only":
        return <ApartmentIcon className="scale-55 -ml-1" />;
      case "followers-only":
        return <GroupIcon className="scale-55 -ml-1" />;
      default:
        return null;
    }
  };

  // Close media modal
  const closeMediaModal = () => setMediaModal(false);

  // Handle like post
  const handleLocalLike = async (postId: string) => {
    if (!currentUser) return;

    // Optimistic update
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id !== postId) return post;

        const alreadyLiked = post.likes.includes(currentUser._id);
        const updatedLikes = alreadyLiked
          ? post.likes.filter((id) => id !== currentUser._id)
          : [...post.likes, currentUser._id];

        return { ...post, likes: updatedLikes };
      })
    );

    // Sync with backend
    try {
      await likePost(postId);
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to like post");
      // Revert optimistic update if error
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id !== postId) return post;
          return { ...post, likes: post.likes };
        })
      );
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (postId: string) => {
    const commentText = commentInputs[postId]?.trim();
    if (!commentText || !currentUser) return;

    try {
      setIsLoading(true);
      const newComment = await commentOnPost(postId, commentText);

      if (newComment) {
        // Update local state with the new comment
        setComments((prev) => ({
          ...prev,
          [postId]: [
            ...(prev[postId] || []),
            {
              ...newComment,
              user: {
                _id: currentUser._id,
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                avatar: currentUser.avatar,
              },
            },
          ],
        }));

        // Clear the input
        setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
      toast.error("Failed to post comment");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle comment box and fetch comments if needed
  const toggleCommentBox = async (postId: string) => {
    const isOpening = !activeCommentBoxes[postId];
    setActiveCommentBoxes((prev) => ({
      ...prev,
      [postId]: isOpening,
    }));

    if (isOpening && !comments[postId]) {
      try {
        const data = await getCommentsForPost(postId);
        setComments((prev) => ({ ...prev, [postId]: data }));
      } catch (err) {
        console.error("Failed to load comments:", err);
        toast.error("Failed to load comments");
      }
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await deleteComment(commentId);
      // Update local state to remove the deleted comment
      setComments((prev) => ({
        ...prev,
        [postId]: prev[postId].filter((comment) => comment._id !== commentId),
      }));
      toast.success("Comment Deleted!");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(
    null
  );

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    commentId: string
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedCommentId(commentId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCommentId(null);
  };

  const handleDelete = (postId: string) => {
    if (selectedCommentId && postId) {
      handleDeleteComment(postId, selectedCommentId);
    }
    handleMenuClose();
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="md:grid md:grid-cols-15 px-3 sm:px-5 mt-5 gap-7 mx-auto mb-30">
        <section className="col-span-0 hidden md:block md:col-span-2 lg:col-span-3">
          <Sidebar />
        </section>
        <section className="overflow-hidden w-full sm:col-span-3 md:col-span-13 lg:col-span-11 flex-1 rounded-md lg:px-15 flex flex-col gap-10">
          {/* Loading skeletons for people */}
          <div>
            <div className="w-15 h-5 mt-1 flex-shrink-0 overflow-hidden">
              <Skeleton
                animation="wave"
                variant="rectangular"
                width="100%"
                height="100%"
              />
            </div>
            <div className="mt-3 gap-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: peopleLength }).map((_, index) => (
                <div key={index} className="mt-3">
                  <div className="flex flex-col gap-6 rounded-md bg-secondaryBg p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 md:w-12 h-10 md:h-12 rounded-full flex-shrink-0 overflow-hidden">
                        <Skeleton
                          animation="wave"
                          variant="rectangular"
                          width="100%"
                          height="100%"
                        />
                      </div>
                      <div>
                        <div className="w-15 h-5 flex-shrink-0 overflow-hidden">
                          <Skeleton
                            animation="wave"
                            variant="rectangular"
                            width="100%"
                            height="100%"
                          />
                        </div>
                        <div className="mt-1 flex items-center text-customGray">
                          <div className="w-24 h-3 flex-shrink-0 overflow-hidden">
                            <Skeleton
                              animation="wave"
                              variant="rectangular"
                              width="100%"
                              height="100%"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full">
                      <div className="w-full h-9 rounded-md flex-shrink-0 overflow-hidden">
                        <Skeleton
                          animation="wave"
                          variant="rectangular"
                          height="100%"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Loading skeletons for posts */}
          <div>
            <div className="w-13 h-5 mt-1 flex-shrink-0 overflow-hidden">
              <Skeleton
                animation="wave"
                variant="rectangular"
                width="100%"
                height="100%"
              />
            </div>
            <div className="mt-3">
              {Array.from({ length: postsLength }).map((_, index) => (
                <div key={index} className="mt-3">
                  <div className="relative mt-7 md:mt-10 bg-secondaryBg rounded-xl p-4 md:p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 md:w-12 h-10 md:h-12 rounded-full flex-shrink-0 overflow-hidden">
                        <Skeleton
                          animation="wave"
                          variant="rectangular"
                          width="100%"
                          height="100%"
                        />
                      </div>
                      <div>
                        <div className="w-15 h-5 flex-shrink-0 overflow-hidden">
                          <Skeleton
                            animation="wave"
                            variant="rectangular"
                            width="100%"
                            height="100%"
                          />
                        </div>
                        <div className="mt-1 flex items-center text-customGray">
                          <div className="w-20 h-3 flex-shrink-0 overflow-hidden">
                            <Skeleton
                              animation="wave"
                              variant="rectangular"
                              width="100%"
                              height="100%"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mb-4 w-15 h-4 flex-shrink-0 overflow-hidden">
                        <Skeleton
                          animation="wave"
                          variant="rectangular"
                          width="100%"
                          height="100%"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="w-full mb-4 h-10 mt-5 flex-shrink-0 overflow-hidden">
                        <Skeleton
                          animation="wave"
                          variant="rectangular"
                          width="100%"
                          height="100%"
                        />
                      </div>
                      <div className="w-full mb-4 h-70 mt-5 rounded-lg flex-shrink-0 overflow-hidden">
                        <Skeleton
                          animation="wave"
                          variant="rectangular"
                          width="100%"
                          height="100%"
                        />
                      </div>
                    </div>
                    <div className="mt-5 flex gap-2 text-gray-500 dark:text-gray-400">
                      <div className="w-8 mb-4 h-8 rounded-full flex-shrink-0 overflow-hidden">
                        <Skeleton
                          animation="wave"
                          variant="rectangular"
                          width="100%"
                          height="100%"
                        />
                      </div>
                      <div className="w-8 mb-4 h-8 rounded-full flex-shrink-0 overflow-hidden">
                        <Skeleton
                          animation="wave"
                          variant="rectangular"
                          width="100%"
                          height="100%"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Loading skeletons for reels */}
          <div>
            <div className="w-14 h-5 mt-1 flex-shrink-0 overflow-hidden">
              <Skeleton
                animation="wave"
                variant="rectangular"
                width="100%"
                height="100%"
              />
            </div>
            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: reelsLength }).map((_, index) => (
                <div className="cursor-pointer" key={index}>
                  <div className="h-95 sm:h-85 w-full rounded-lg flex-shrink-0 overflow-hidden">
                    <Skeleton
                      animation="wave"
                      variant="rectangular"
                      width="100%"
                      height="100%"
                    />
                  </div>
                  <div className="mt-3 flex flex-col">
                    <div className="w-50 mb-5 h-5 flex-shrink-0 overflow-hidden">
                      <Skeleton
                        animation="wave"
                        variant="rectangular"
                        width="100%"
                        height="100%"
                      />
                    </div>
                    <div className="-mt-2 flex gap-3 text-customGray text-sm">
                      <div className="w-10 mb-5 h-5 flex-shrink-0 overflow-hidden">
                        <Skeleton
                          animation="wave"
                          variant="rectangular"
                          width="100%"
                          height="100%"
                        />
                      </div>
                      <div className="w-10 mb-5 h-5 flex-shrink-0 overflow-hidden">
                        <Skeleton
                          animation="wave"
                          variant="rectangular"
                          width="100%"
                          height="100%"
                        />
                      </div>
                      <div className="w-10 mb-5 h-5 flex-shrink-0 overflow-hidden">
                        <Skeleton
                          animation="wave"
                          variant="rectangular"
                          width="100%"
                          height="100%"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <MobileSidebar />
      </div>
    );
  }

  if (people.length === 0 && posts.length === 0 && reels.length === 0) {
    return (
      <div className="md:grid md:grid-cols-15 px-3 sm:px-5 mt-5 gap-7 mx-auto mb-30">
        <section className="col-span-0 hidden md:block md:col-span-2 lg:col-span-3">
          <Sidebar />
        </section>
        <section className="overflow-hidden w-full sm:col-span-3 md:col-span-13 lg:col-span-11 flex-1 rounded-md lg:px-15 flex flex-col gap-5 items-center">
          <img src={EmptySearchImg} alt="Empty Search" className="max-w-130" />
          <h1 className="font-semibold text-xl md:text-2xl mt-1">
            Nothing Found
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6 max-w-md">
            We couldn't find anything matching your search. Try checking your
            spelling or using different keywords.
          </p>
          <Link to="/">
            <button className="md:text-lg cursor-pointer relative px-5 md:px-12 py-2 bg-accent dark:bg-blue-800 text-white rounded-lg text-sm font-medium hover:scale-[1.02] transform transition-all duration-200 group overflow-hidden">
              Back to Home
            </button>
          </Link>
        </section>
        <MobileSidebar />
      </div>
    );
  }

  return (
    <div
      key={searchTerm}
      className="md:grid md:grid-cols-15 px-3 sm:px-5 mt-5 gap-7 mx-auto mb-30"
    >
      <Toaster
        toastOptions={{
          className: "text-primary bg-secondaryBg",
          style: {
            color: isDarkMode ? "white" : "black",
            backgroundColor: isDarkMode ? "#1F2937" : "#F9FAFB",
          },
        }}
      />
      <Modal
        open={mediaModal}
        onClose={closeMediaModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={feedStyle}>
          <FeedModal
            mediaUrls={mediaUrls}
            mediaUrlActive={mediaUrlActive}
            onClose={closeMediaModal}
          />
        </Box>
      </Modal>

      <section className="col-span-0 hidden md:block md:col-span-2 lg:col-span-3">
        <Sidebar />
      </section>

      <section className="overflow-hidden w-full sm:col-span-3 md:col-span-13 lg:col-span-11 flex-1 rounded-md lg:px-15 flex flex-col gap-10">
        {/* People Section */}
        {people.length > 0 && (
          <div>
            <h1 className="font-medium text-lg md:text-xl">People</h1>
            <div className="mt-3 gap-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              {people.slice(0, peopleLength).map((person, index) => (
                <div key={index} className="mt-3">
                  <div className="flex flex-col gap-6 rounded-md bg-secondaryBg p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden">
                        {person?.avatar &&
                        !person.avatar.includes(
                          "https://lh3.googleusercontent.com/"
                        ) ? (
                          <img
                            src={person.avatar}
                            alt="User Avatar"
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-xl font-semibold text-blue-400 dark:text-accent">
                              {person?.firstName?.[0]?.toUpperCase()}
                              {person?.lastName?.[0]?.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h1
                          onClick={() => navigate(`/profile/${person._id}`)}
                          className="cursor-pointer hover:underline"
                        >
                          {person.firstName} {person.lastName}
                        </h1>
                        <p
                          onClick={() => navigate(`/profile/${person._id}`)}
                          className="cursor-pointer hover:underline text-xs text-gray-500 dark:text-gray-400"
                        >
                          @{person.username}
                        </p>
                      </div>
                    </div>
                    <div className="w-full flex justify-around gap-4 text-xs">
                      <button
                        onClick={() => navigate(`/profile/${person._id}`)}
                        className="text-accent p-1 py-2 border-1 border-accent hover:bg-blue-100 dark:hover:bg-[#283443] rounded-md w-full cursor-pointer"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {people.length > 3 && (
              <div className="mt-10 flex items-center justify-center">
                <button
                  onClick={() =>
                    setPeopleLength((prev) =>
                      prev === people.length ? 3 : people.length
                    )
                  }
                  className="max-w-90 text-primary text-sm lg:text-base bg-gray-200 dark:bg-[#2C2C2C] hover:bg-gray-300 dark:hover:bg-[#3F3F3F] p-1 py-3 rounded-md w-full cursor-pointer"
                >
                  {peopleLength === people.length ? "See Less" : "See All"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Posts Section */}
        {posts.length > 0 && (
          <div>
            <h1 className="font-medium text-lg md:text-xl">Posts</h1>
            <div className="mt-3 flex flex-col gap-5">
              {posts.slice(0, postsLength).map((post) => (
                <div
                  key={post._id}
                  className="bg-secondaryBg relative rounded-xl p-4 md:p-6"
                >
                  {/* Post header */}
                  <div className="flex justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-400 rounded-full">
                        {post.user?.avatar &&
                        !post.user.avatar.includes(
                          "https://lh3.googleusercontent.com/"
                        ) ? (
                          <img
                            src={post.user.avatar}
                            alt="User Avatar"
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-xl font-semibold text-blue-400 dark:text-accent">
                              {post.user?.firstName?.[0]?.toUpperCase()}
                              {post.user?.lastName?.[0]?.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <button
                          onClick={() => navigate(`/profile/${post.user._id}`)}
                          className="font-medium text-sm cursor-pointer hover:underline"
                        >
                          {post.user.firstName} {post.user.lastName}
                        </button>
                        <div className="-mt-1 flex items-center text-customGray">
                          <p className="text-xs text-accent">
                            {formatDistanceToNow(new Date(post.createdAt), {
                              addSuffix: true,
                            }).replace("about ", "")}
                          </p>
                          <span className="mx-1 text-sm">•</span>
                          {getVisibilityIcon(post.visibility)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Post content */}
                  <div>
                    <p className="text-sm p-1 mt-5">{post.text}</p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {/* Course badge */}
                      {post.relatedCourse && (
                        <div className="flex items-center gap-1 px-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
                          <SchoolIcon className="scale-80" />
                          <span>{post.relatedCourse}</span>
                        </div>
                      )}
                      {/* Tags */}
                      {post.tags?.map((tag: string) => (
                        <div
                          key={tag}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        >
                          #{tag}
                        </div>
                      ))}
                    </div>

                    {/* Media */}
                    {post.media && post.media.length > 0 && (
                      <div
                        className={`mt-3 items-center justify-center gap-5 bg-gray-100 dark:bg-gray-800 rounded-2xl ${
                          post.media.length > 1
                            ? "grid grid-cols-1 sm:grid-cols-2"
                            : "flex"
                        }`}
                      >
                        {post.media.map((item: string, index: number) => (
                          <div
                            key={index}
                            onClick={() => {
                              setMediaUrls(post.media);
                              setMediaUrlActive(index);
                              setMediaModal(true);
                            }}
                            className={`cursor-pointer bg-gray-400 w-full rounded-lg max-w-150 ${
                              post.media.length > 1
                                ? "h-50 sm:h-70 lg:h-90 max-h-110"
                                : "h-80"
                            }`}
                          >
                            {item.includes("/video/") ? (
                              <video
                                src={item}
                                className="object-cover rounded-lg w-full h-full"
                              />
                            ) : (
                              <img
                                src={item}
                                alt="Preview"
                                className="object-cover rounded-lg w-full h-full"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Post actions */}
                  <div className="border-t pt-2 border-gray-400/70 dark:border-gray-600/70 mt-5 flex gap-4 text-gray-500 dark:text-gray-400">
                    <button
                      onClick={() => handleLocalLike(post._id)}
                      className="cursor-pointer text-primary hover:text-red-500 dark:hover:text-red-400 rounded-full p-1 transition-all transform hover:scale-110"
                    >
                      {post.likes.includes(currentUser._id) ? (
                        <FavoriteIcon
                          fontSize="medium"
                          className="text-red-500"
                        />
                      ) : (
                        <FavoriteBorderIcon fontSize="medium" />
                      )}
                    </button>

                    <button
                      onClick={() => toggleCommentBox(post._id)}
                      className="cursor-pointer hover:text-blue-500 dark:hover:text-blue-400"
                    >
                      <ChatBubbleOutlineRoundedIcon />
                    </button>
                  </div>

                  {/* Comments section */}
                  {activeCommentBoxes[post._id] && (
                    <div className="mt-7">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center">
                          <h1>Comments</h1>
                          <p className="text-sm ml-3 text-customGray">
                            {comments[post._id]?.length || 0}
                          </p>
                        </div>
                        <div>
                          <button
                            onClick={() => toggleCommentBox(post._id)}
                            className="cursor-pointer"
                          >
                            <CloseOutlinedIcon className="text-customGray hover:text-primary" />
                          </button>
                        </div>
                      </div>

                      {/* Comment input */}
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 bg-gray-300 rounded-full flex-shrink-0">
                          {currentUser?.avatar &&
                          !currentUser.avatar.includes(
                            "https://lh3.googleusercontent.com/"
                          ) ? (
                            <img
                              src={currentUser.avatar}
                              alt="User Avatar"
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                              <span className="text-sm font-semibold text-blue-400 dark:text-accent">
                                {currentUser?.firstName?.[0]?.toUpperCase()}
                                {currentUser?.lastName?.[0]?.toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="relative flex-1">
                          <textarea
                            ref={textAreaRef}
                            value={commentInputs[post._id] || ""}
                            placeholder="Write your comment..."
                            onChange={(e) => {
                              setCommentInputs((prev) => ({
                                ...prev,
                                [post._id]: e.target.value,
                              }));
                              adjustHeight();
                            }}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className={`pb-3 pr-10 placeholder:text-gray-500 dark:placeholder:text-gray-400 overflow-y-hidden resize-none text-sm md:text-base bg-white dark:bg-gray-800 w-full focus:outline-none p-3 rounded-lg transition-all duration-200 border ${
                              isFocused
                                ? "border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20 dark:ring-blue-400/20"
                                : "border-gray-200 dark:border-gray-600"
                            }`}
                            rows={1}
                          />
                          {commentInputs[post._id] && (
                            <button
                              onClick={() => handleCommentSubmit(post._id)}
                              className="cursor-pointer absolute right-3 bottom-4 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors disabled:opacity-50"
                              disabled={!commentInputs[post._id]?.trim()}
                            >
                              <SendOutlinedIcon className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Comments list */}
                      {(comments[post._id] || []).map((cmt, index) => (
                        <div
                          key={cmt._id || index}
                          className="mt-4 rounded-lg mb-3 group"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              onClick={() => {
                                navigate(`/profile/${cmt.user._id}`);
                              }}
                              className="cursor-pointer w-7 h-7 bg-gray-300 rounded-full flex-shrink-0"
                            >
                              {cmt.user?.avatar &&
                              !cmt.user.avatar.includes(
                                "https://lh3.googleusercontent.com/"
                              ) ? (
                                <img
                                  src={cmt.user.avatar}
                                  alt="User Avatar"
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                                  <span className="text-xs font-semibold text-blue-400 dark:text-accent">
                                    {cmt.user?.firstName?.[0]?.toUpperCase()}
                                    {cmt.user?.lastName?.[0]?.toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              {/* Changed container to flex-1 min-w-0 */}
                              <div className="inline-flex flex-col max-w-full">
                                {" "}
                                {/* Added max-w-full */}
                                <div className="bg-white dark:bg-gray-800 py-2 px-3   rounded-lg inline-block max-w-full">
                                  <div className="flex justify-between items-start gap-10">
                                    <div
                                      onClick={() => {
                                        navigate(`/profile/${cmt.user._id}`);
                                      }}
                                      className="cursor-pointer hover:underline font-medium text-sm text-gray-800 dark:text-gray-200 truncate max-w-[180px]"
                                    >
                                      {cmt.user?.firstName} {cmt.user?.lastName}{" "}
                                    </div>

                                    {/* Add delete button for current user's comments */}
                                    {cmt.user._id === currentUser?._id && (
                                      <>
                                        <IconButton
                                          size="small"
                                          onClick={(e) =>
                                            handleMenuOpen(e, cmt._id)
                                          }
                                          className="ml-2 text-gray-500 hover:text-gray-700"
                                        >
                                          <MoreHorizIcon fontSize="small" />
                                        </IconButton>

                                        <Menu
                                          anchorEl={anchorEl}
                                          open={
                                            Boolean(anchorEl) &&
                                            selectedCommentId === cmt._id
                                          }
                                          onClose={handleMenuClose}
                                          anchorOrigin={{
                                            vertical: "bottom",
                                            horizontal: "right",
                                          }}
                                          transformOrigin={{
                                            vertical: "top",
                                            horizontal: "right",
                                          }}
                                        >
                                          <MenuItem
                                            onClick={() =>
                                              handleDelete(post._id)
                                            }
                                          >
                                            <DeleteIcon
                                              fontSize="small"
                                              className="mr-2 text-red-500"
                                            />
                                            Delete
                                          </MenuItem>
                                        </Menu>
                                      </>
                                    )}
                                  </div>

                                  <div className="mt-1 flex items-center">
                                    <div className="-mt-1 flex items-center text-customGray">
                                      <p
                                        className={`text-xs text-accent ${
                                          cmt.user._id === currentUser?._id
                                            ? "-mt-[10px]"
                                            : ""
                                        }`}
                                      >
                                        {formatDistanceToNow(
                                          new Date(cmt.createdAt),
                                          {
                                            addSuffix: true,
                                          }
                                        ).replace("about ", "")}
                                      </p>
                                    </div>
                                  </div>
                                  <p className="text-sm pt-2 text-gray-700 dark:text-gray-300 break-words pr-9">
                                    {cmt.text}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {posts.length > 1 && (
              <div className="mt-10 flex items-center justify-center">
                <button
                  onClick={() =>
                    setPostsLength((prev) =>
                      prev === posts.length ? 1 : posts.length
                    )
                  }
                  className="max-w-90 text-primary text-sm lg:text-base bg-gray-200 dark:bg-[#2C2C2C] hover:bg-gray-300 dark:hover:bg-[#3F3F3F] p-1 py-3 rounded-md w-full cursor-pointer"
                >
                  {postsLength === posts.length ? "See Less" : "See All"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Reels Section */}
        {reels.length > 0 && (
          <div>
            <h1 className="font-medium text-lg md:text-xl">Reels</h1>
            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {reels.slice(0, reelsLength).map((reel, index) => (
                <div
                  onClick={() => {
                    setReelData(index);
                    setActiveReel(reel);
                    setReelViewVisible(true);
                  }}
                  className="cursor-pointer"
                  key={index}
                >
                  <div className="bg-gray-500 h-95 sm:h-85 w-full rounded-lg overflow-hidden">
                    {reel.videoUrl && (
                      <video
                        src={reel.videoUrl}
                        className="w-full h-full object-cover"
                        muted
                        loop
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <div className="w-9 h-9 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden">
                      {reel.user?.avatar &&
                      !reel.user.avatar.includes(
                        "https://lh3.googleusercontent.com/"
                      ) ? (
                        <img
                          src={reel.user.avatar}
                          alt="User Avatar"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-xl font-semibold text-blue-400 dark:text-accent">
                            {reel.user?.firstName?.[0]?.toUpperCase()}
                            {reel.user?.lastName?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h1
                        onClick={() => navigate(`/profile/${reel.user._id}`)}
                        className="cursor-pointer hover:underline"
                      >
                        {reel.user.firstName} {reel.user.lastName}
                      </h1>
                      <p
                        onClick={() => navigate(`/profile/${reel.user._id}`)}
                        className="cursor-pointer hover:underline text-xs text-gray-500 dark:text-gray-400"
                      >
                        @{reel.user.username}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col">
                    <h1 className="truncate pr-5 font-medium">
                      {reel.caption || ""}
                    </h1>
                    {/* <div className="mt-1 flex gap-3 text-customGray text-sm">
                      <div className="flex gap-1 items-center">
                        <p>{reel.views || 0}</p>
                        <VisibilityOutlinedIcon fontSize="small" />
                      </div>
                      <div className="flex gap-1 items-center">
                        <p>{reel.likes?.length || 0}</p>
                        <FavoriteBorderOutlinedIcon fontSize="small" />
                      </div>
                      <div className="flex gap-1 items-center">
                        <p>{reel.comments?.length || 0}</p>
                        <ChatBubbleOutlineOutlinedIcon fontSize="small" />
                      </div>
                    </div> */}
                  </div>
                </div>
              ))}

              <Modal
                open={reelViewVisible}
                onClose={handleCloseReel}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
              >
                <Box sx={style}>
                  <ReelViewer
                    data={activeReel}
                    onClose={handleCloseReel}
                    setUserReels={() => {}}
                  />
                </Box>
              </Modal>
            </div>
            {reels.length > 4 && (
              <div className="mt-10 flex items-center justify-center">
                <button
                  onClick={() =>
                    setReelsLength((prev) =>
                      prev === reels.length ? 4 : reels.length
                    )
                  }
                  className="max-w-90 text-primary text-sm lg:text-base bg-gray-200 dark:bg-[#2C2C2C] hover:bg-gray-300 dark:hover:bg-[#3F3F3F] p-1 py-3 rounded-md w-full cursor-pointer"
                >
                  {reelsLength === reels.length ? "See Less" : "See All"}
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      <MobileSidebar />
    </div>
  );
};

export default SearchPage;
