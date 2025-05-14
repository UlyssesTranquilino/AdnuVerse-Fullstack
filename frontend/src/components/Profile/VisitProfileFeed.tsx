import { useState, useRef, useEffect } from "react";
import ApartmentIcon from "@mui/icons-material/Apartment";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

//MUI
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Modal from "@mui/material/Modal";
import Tooltip from "@mui/material/Tooltip";
import Popover from "@mui/material/Popover";
import FeedModal from "../Feed/FeedModal";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PublicIcon from "@mui/icons-material/Public";
import GroupIcon from "@mui/icons-material/Group";
import SchoolIcon from "@mui/icons-material/School";

//Utils
import { postComment } from "../../utils/postComment";

import { useTheme, useUserStore } from "../../global/mode";

import EmptyFeedImg from "../../assets/Feed.png";

import { formatDistanceToNow } from "date-fns";

//Toaster
import toast, { Toaster } from "react-hot-toast";

//Component
import EditPostModal from "./EditPostModal";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  p: 4,
};

const VisitProfileFeed = ({ refresh, handleRefresh }) => {
  const { currentUser, getAllPost, deletePost, error } = useUserStore();

  const { isDarkMode } = useTheme();

  //Edit Post Feed
  const [editFeedOpen, setEditFeedOpen] = useState(false);
  const closeEditFeed = () => {
    setEditFeedOpen(false);
    setActiveFeed(null);
  };
  const [activeFeed, setActiveFeed] = useState();

  const [isLoading, setIsLoading] = useState(false);

  // All User's Posts
  const [allUserPost, setAllUserPost] = useState<any[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const posts = await getAllPost(); // Await the async function

        if (posts) {
          setAllUserPost(posts); // Set posts if not null
        } else {
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, [refresh]);

  const [isLike, setIsLike] = useState(false);
  const [isCommentActive, setIsCommentActive] = useState(false);
  const [comment, setComment] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [comment]);

  //Modal View
  const [mediaModal, setMediaModal] = useState(false);
  const closeMediaModal = () => setMediaModal(false);

  const [mediaUrls, setMediaUrls] = useState([]);
  const [mediaUrlActive, setMediaUrlActive] = useState(0);

  //Popover
  const [popoverState, setPopoverState] = useState<{
    anchorEl: HTMLElement | null;
    postId: string | null;
  }>({ anchorEl: null, postId: null });

  // State for popover
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  const handleClickPopOver = (
    event: React.MouseEvent<HTMLElement>,
    postId: string,
    post: any
  ) => {
    event.stopPropagation();
    setOpenPopoverId(openPopoverId === postId ? null : postId);
    setActiveFeed(post);
  };

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".popover-container")) {
        handleClosePopOver();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClosePopOver = () => {
    setOpenPopoverId(null);
    setPopoverState({ anchorEl: null, postId: null });
  };

  const handleDeletePost = async (postId: string) => {
    await deletePost(postId);
    setAllUserPost((prev) => prev.filter((post) => post._id != postId));
    if (error) {
      toast.error("Failed to delete the post. Please try again.");
    } else {
      toast.success("Post successfully deleted.");
    }
  };

  const getVisibilityIcon = (option: string) => {
    switch (option) {
      case "public":
        return <PublicIcon className="scale-50 -ml-1" />;
      case "department-only":
        return <ApartmentIcon className="scale-55 -ml-1" />;
      case "followers-only":
        return <GroupIcon className="scale-55 -ml-1" />;
    }
  };

  const [formData, setFormData] = useState();

  useEffect(() => {
    if (activeFeed) {
      setFormData(activeFeed); // Update the form data inside the modal
    }
  }, [activeFeed]); // Run the effect whenever activeFeed changes

  const openEditFeed = (post) => {
    setFormData(post);
    setActiveFeed(post);
    setEditFeedOpen(true);
  };
  return !isLoading ? (
    <div className="relative mt-7 md:mt-10   ">
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
          {" "}
          <FeedModal
            mediaUrls={mediaUrls}
            mediaUrlActive={mediaUrlActive}
            onClose={closeMediaModal}
          />
        </Box>
      </Modal>

      {allUserPost ? (
        <div className="flex flex-col gap-5">
          {allUserPost.map((post: any, index: number) => (
            <div
              key={post._id}
              className="bg-secondaryBg relative rounded-xl p-4 md:p-6"
            >
              <div className="flex justify-between">
                <div className="flex items-center gap-3 ">
                  <div className="w-10 h-10  bg-gray-400 rounded-full">
                    {" "}
                    {currentUser?.avatar && (
                      <img
                        src={currentUser.avatar}
                        alt="User Avatar"
                        className="w-full h-full  rounded-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h1 className="font-medium - text-sm">
                      {currentUser?.firstName} {currentUser?.lastName}
                    </h1>
                    <div className="-mt-1 flex items-center text-customGray">
                      {/* <p className="text-xs">@{currentUser?.username}</p> */}
                      <p className="text-xs text-accent ">
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                        }).replace("about ", "")}
                      </p>
                      <span className="mx-1 text-sm">•</span> {/* Dot */}
                      {getVisibilityIcon(post.visibility)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={(event) => {
                    handleClickPopOver(event, post._id, post);
                  }}
                  className="text-xs text-customGray self-start cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 -mt-1 p-1 rounded-full"
                >
                  <MoreHorizIcon />
                </button>

                {openPopoverId === post._id && (
                  <div
                    className="cursor-pointer absolute right-4 top-10 md:top-12 z-50 w-28 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 popover-container"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        openEditFeed(post);
                        handleClosePopOver();
                      }}
                      className="cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center gap-2"
                    >
                      <EditIcon fontSize="small" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDeletePost(post._id);
                        handleClosePopOver();
                      }}
                      className="cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center gap-2 text-red-500"
                    >
                      <DeleteIcon fontSize="small" />
                      Delete
                    </button>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm p-1 mt-5">{post.text}</p>

                <div className="flex   mt-3">
                  {/* Course badge */}
                  {post.relatedCourse && (
                    <div className=" flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
                      <SchoolIcon className=" scale-80" />
                      <span>{post.relatedCourse}</span>
                    </div>
                  )}
                  {post.tags && (
                    <div className="flex items-center gap-1 ">
                      {post.tags.map((tag: string) => (
                        <div
                          key={tag}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        >
                          #{tag}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {post.media && (
                  <div
                    className={`mt-3 items-center justify-center gap-5 bg-gray-100 dark:bg-gray-800 rounded-2xl ${
                      post.media.length > 1
                        ? "grid grid-cols-1 sm:grid-cols-2"
                        : "flex"
                    }`}
                  >
                    {post.media.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setMediaUrls(post.media);
                          setMediaUrlActive(index);
                        }}
                      >
                        <div
                          onClick={() => {
                            setMediaModal(true);
                            setMediaUrlActive(index);
                          }}
                          className={`cursor-pointer bg-gray-400 w-full rounded-lg max-w-150 ${
                            mediaUrls.length > 1
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
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t pt-2 border-gray-400/70 dark:border-gray-600/70 mt-5 flex gap-4 text-gray-500 dark:text-gray-400">
                <button className="cursor-pointer hover:text-red-500 dark:hover:text-red-400">
                  <FavoriteBorderIcon />
                </button>
                <button
                  onClick={() => setIsCommentActive((prev) => !prev)}
                  className="cursor-pointer hover:text-blue-500 dark:hover:text-blue-400"
                >
                  <ChatBubbleOutlineRoundedIcon />
                </button>
                {/* <button className="cursor-pointer hover:text-green-500">
                <ShareOutlinedIcon />
              </button> */}
              </div>

              {isCommentActive && (
                <div className="mt-7">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center">
                      <h1 className=""> Comments</h1>
                      <p className="text-sm ml-3 text-customGray">10</p>
                    </div>
                    <div>
                      <button
                        onClick={() => setIsCommentActive(false)}
                        className="cursor-pointer "
                      >
                        <CloseOutlinedIcon className="text-customGray hover:text-primary " />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-gray-300 rounded-full flex-shrink-0" />
                    <div className="relative flex-1">
                      <textarea
                        ref={textAreaRef}
                        value={comment}
                        placeholder="Write your comment..."
                        onChange={(e) => setComment(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className={`pb-3 pr-10 placeholder:text-gray-500 dark:placeholder:text-gray-400 overflow-y-hidden resize-none text-sm md:text-base bg-white dark:bg-gray-800 w-full focus:outline-none p-3 rounded-lg transition-all duration-200 border ${
                          isFocused
                            ? "border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20 dark:ring-blue-400/20"
                            : "border-gray-200 dark:border-gray-600"
                        }`}
                        rows={1}
                      />
                      {comment && (
                        <button
                          onClick={() => {
                            postComment("post", "1231", comment);
                            setComment("");
                          }}
                          className="cursor-pointer absolute right-3 bottom-4 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors disabled:opacity-50"
                          disabled={!comment.trim()}
                        >
                          <SendOutlinedIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="mt-4 rounded-lg mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0" />
                        <div className=" bg-white dark:bg-gray-800 py-2 p-3 rounded-lg ">
                          <div className="font-medium text-gray-800 dark:text-gray-200">
                            User {index + 1}
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            This is a dummy comment number {index + 1}.
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <img
            src={EmptyFeedImg}
            alt="Empty Feed"
            className="w-full max-w-40 md:max-w-50 opacity-25"
          />

          <h2 className="text-lg font-semibold text-gray-500 mt-5">
            No Feed Yet
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            You haven't added posts yet.
          </p>
        </div>
      )}
    </div>
  ) : (
    <div className="relative mt-7 md:mt-10 bg-secondaryBg rounded-xl p-4 md:p-6 ">
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
          <div className="w-15 h-5  flex-shrink-0 overflow-hidden">
            <Skeleton
              animation="wave"
              variant="rectangular"
              width="100%"
              height="100%"
            />
          </div>
          <div className="mt-1 flex items-center text-customGray">
            <div className="w-20 h-3  flex-shrink-0 overflow-hidden">
              <Skeleton
                animation="wave"
                variant="rectangular"
                width="100%"
                height="100%"
              />
            </div>
          </div>
        </div>

        <div className="mb-4 w-15 h-4  flex-shrink-0 overflow-hidden">
          <Skeleton
            animation="wave"
            variant="rectangular"
            width="100%"
            height="100%"
          />
        </div>
      </div>

      <div>
        <div className="w-full mb-4 h-10 mt-5  flex-shrink-0 overflow-hidden">
          <Skeleton
            animation="wave"
            variant="rectangular"
            width="100%"
            height="100%"
          />
        </div>

        <div className="w-full mb-4 h-70 mt-5 rounded-lg  flex-shrink-0 overflow-hidden">
          <Skeleton
            animation="wave"
            variant="rectangular"
            width="100%"
            height="100%"
          />
        </div>
      </div>

      <div className="mt-5 flex gap-2 text-gray-500 dark:text-gray-400">
        <div className="w-8 mb-4 h-8 rounded-full  flex-shrink-0 overflow-hidden">
          <Skeleton
            animation="wave"
            variant="rectangular"
            width="100%"
            height="100%"
          />
        </div>
        <div className="w-8 mb-4 h-8 rounded-full  flex-shrink-0 overflow-hidden">
          <Skeleton
            animation="wave"
            variant="rectangular"
            width="100%"
            height="100%"
          />
        </div>
        <div className="w-8 mb-4 h-8 rounded-full  flex-shrink-0 overflow-hidden">
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
};

export default VisitProfileFeed;
