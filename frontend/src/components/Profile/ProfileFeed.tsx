import { useState, useRef, useEffect } from "react";
import ApartmentIcon from "@mui/icons-material/Apartment";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PublicIcon from "@mui/icons-material/Public";
import GroupIcon from "@mui/icons-material/Group";
import SchoolIcon from "@mui/icons-material/School";

// MUI
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Modal from "@mui/material/Modal";
import FeedModal from "../Feed/FeedModal";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import { useTheme, useUserStore } from "../../global/mode";
import EmptyFeedImg from "../../assets/Feed.png";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import EditPostModal from "./EditPostModal";

import { IconButton, Menu, MenuItem } from "@mui/material";

import { useNavigate } from "react-router-dom";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  p: 4,
};

const ProfileFeed = ({ user, isCurrentUser, refresh, handleRefresh }) => {
  const {
    currentUser,
    getAllPost,
    deletePost,
    likePost,
    commentOnPost,
    getCommentsForPost,
    deleteComment,
  } = useUserStore();
  const { isDarkMode } = useTheme();

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

  const navigate = useNavigate();

  // State for posts and loading
  const [allUserPost, setAllUserPost] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // State for comments
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>(
    {}
  );
  const [activeCommentBoxes, setActiveCommentBoxes] = useState<
    Record<string, boolean>
  >({});

  // State for media modal
  const [mediaModal, setMediaModal] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaUrlActive, setMediaUrlActive] = useState(0);

  // Edit post modal
  const [editFeedOpen, setEditFeedOpen] = useState(false);
  const [activeFeed, setActiveFeed] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);

  // Popover state
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  // Textarea ref
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Fetch all posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const posts = await getAllPost(user._id);

        if (posts) {
          setAllUserPost(posts);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast.error("Failed to load posts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [refresh, user._id, getAllPost]);

  // Adjust textarea height
  const adjustHeight = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  };

  // Handle like post
  const handleLocalLike = async (postId: string) => {
    if (!currentUser) return;

    // Optimistic update
    setAllUserPost((prevPosts) =>
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
      setAllUserPost((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id !== postId) return post;
          return { ...post, likes: post.likes };
        })
      );
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

        // Trigger refresh if needed
        handleRefresh?.();
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

  // Close media modal
  const closeMediaModal = () => setMediaModal(false);

  // Close edit modal
  const closeEditFeed = () => {
    setEditFeedOpen(false);
    setActiveFeed(null);
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

  // Handle popover click
  const handleClickPopOver = (
    event: React.MouseEvent<HTMLElement>,
    postId: string,
    post: any
  ) => {
    event.stopPropagation();
    setOpenPopoverId(openPopoverId === postId ? null : postId);
    setActiveFeed(post);
  };

  // Close popover
  const handleClosePopOver = () => {
    setOpenPopoverId(null);
  };

  // Handle delete post
  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
      setAllUserPost((prev) => prev.filter((post) => post._id !== postId));
      toast.success("Post successfully deleted.");
      handleClosePopOver();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete the post. Please try again.");
    }
  };

  // Open edit modal
  const openEditFeed = (post: any) => {
    setFormData(post);
    setEditFeedOpen(true);
    handleClosePopOver();
  };

  // Loading skeleton
  if (isLoading) {
    return (
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
    );
  }

  // Empty state
  if (allUserPost.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center mt-10">
        <img
          src={EmptyFeedImg}
          alt="Empty Feed"
          className="w-full max-w-50 opacity-25"
        />
        <h2 className="text-lg font-semibold text-gray-600 mt-5">
          No Posts Yet
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {isCurrentUser
            ? "You haven't posted anything yet"
            : "No posts available yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="relative mt-7 md:mt-10 rounded-xl">
      <Modal
        open={editFeedOpen}
        onClose={closeEditFeed}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <EditPostModal
          key={activeFeed?._id}
          closeEditFeed={closeEditFeed}
          activeFeed={formData}
          handleRefresh={handleRefresh}
        />
      </Modal>

      <Modal
        open={mediaModal}
        onClose={closeMediaModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <FeedModal
            mediaUrls={mediaUrls}
            mediaUrlActive={mediaUrlActive}
            onClose={closeMediaModal}
          />
        </Box>
      </Modal>

      <div className="flex flex-col gap-5">
        {allUserPost.map((post: any) => (
          <div
            key={post._id}
            className="bg-secondaryBg relative rounded-xl p-4 md:p-6"
          >
            {/* Post header */}
            <div className="flex justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-400 rounded-full">
                  {post.user?.avatar && (
                    <img
                      src={post.user.avatar}
                      alt="User Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <h1 className="font-medium text-sm">
                    {post.user.firstName} {post.user.lastName}
                  </h1>
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

              {isCurrentUser && (
                <button
                  onClick={(event) => handleClickPopOver(event, post._id, post)}
                  className="text-xs text-customGray self-start cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 -mt-1 p-1 rounded-full"
                >
                  <MoreHorizIcon />
                </button>
              )}

              {openPopoverId === post._id && (
                <div
                  className="cursor-pointer absolute right-4 top-10 md:top-12 z-50 w-28 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 popover-container"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => openEditFeed(post)}
                    className="cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center gap-2"
                  >
                    <EditIcon fontSize="small" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="cursor-pointer w-full text-left px-4  py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center gap-2 text-red-500"
                  >
                    <DeleteIcon fontSize="small" />
                    Delete
                  </button>
                </div>
              )}
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
                {post.likes.includes(currentUser?._id) ? (
                  <FavoriteIcon fontSize="medium" className="text-red-500" />
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
                    <img
                      src={currentUser?.avatar}
                      alt="Profile Avatar"
                      className="rounded-full w-full h-full object-cover"
                    />
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
                        <img
                          src={cmt.user?.avatar}
                          alt="Comment Avatar"
                          className="rounded-full w-full h-full object-cover"
                        />
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
                                    onClick={(e) => handleMenuOpen(e, cmt._id)}
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
                                      onClick={() => handleDelete(post._id)}
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

                            <div className=" flex items-center">
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
    </div>
  );
};

export default ProfileFeed;
