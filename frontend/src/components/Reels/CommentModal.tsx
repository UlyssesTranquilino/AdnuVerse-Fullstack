import { useState, useRef, useEffect } from "react";

import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

//utils
import { postComment } from "../../utils/postComment";

import { IconButton, Menu, MenuItem } from "@mui/material";

import { useNavigate } from "react-router-dom";

//Toaster
import toast, { Toaster } from "react-hot-toast";

import { useUserStore, useTheme } from "../../global/mode";
import { formatDistanceToNow } from "date-fns";

interface CommentModalProps {
  reelData: any;
  commentData: any; // Replace 'any' with the appropriate type for commentData
  setCommentData: (data: any) => void; // Replace 'any' with the appropriate type for data
  commentOpen: boolean;
  setCommentOpen: (open: boolean) => void;
  isReelViewer: boolean;
}

const CommentModal: React.FC<CommentModalProps> = ({
  reelData,
  commentOpen,
  setCommentOpen,
  isReelViewer,
}) => {
  const [data, setData] = useState(reelData);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const { currentUser, deleteComment, getCommentsForReel, commentOnReel } =
    useUserStore();

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

  useEffect(() => {
    const fetchComments = async () => {
      if (!reelData?._id) return;

      try {
        const fetchedComments = await getCommentsForReel(reelData._id);
        if (fetchedComments) {
          setComments(fetchedComments); // Directly set the fetched comments
        }
      } catch (err) {
        console.error("Failed to load comments:", err);
        toast.error("Failed to load comments");
      }
    };

    if (commentOpen) {
      fetchComments();
    }
  }, [commentOpen, reelData?._id]);

  const [comments, setComments] = useState<any[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(
    null
  );

  const [isLoading, setIsLoading] = useState(false);

  // Handle comment submission
  const handleCommentSubmit = async (postId: string) => {
    if (!comment.trim() || !currentUser) return;

    try {
      setIsLoading(true);
      const newComment = await commentOnReel(postId, comment);

      if (newComment) {
        // Update local state with the new comment

        setComments((prev) => [
          {
            ...newComment,
            user: {
              _id: currentUser._id,
              firstName: currentUser.firstName,
              lastName: currentUser.lastName,
              avatar: currentUser.avatar,
            },
          },
          ...prev,
        ]);
        setComment("");
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
      toast.error("Failed to post comment");
    } finally {
      setIsLoading(false);
    }
  };

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

  // Handle delete comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setComments((prev) =>
        prev.filter((comment) => comment._id !== commentId)
      );
      toast.success("Comment Deleted!");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const handleDelete = (postId: string) => {
    if (selectedCommentId && postId) {
      handleDeleteComment(postId, selectedCommentId);
    }
    handleMenuClose();
  };

  return (
    <div className="bg-secondaryBg  m-auto mb-5 sm:mb-12  h-[430px] sm:h-[520px] max-w-75 commentModal pt-[3px]  px-5 rounded-lg">
      {!isReelViewer && (
        <Toaster
          toastOptions={{
            className: "text-primary bg-secondaryBg",
            style: {
              color: isDarkMode ? "white" : "black",
              backgroundColor: isDarkMode ? "#1F2937" : "#F9FAFB",
            },
          }}
        />
      )}

      <div className="mt-7 max-w-90">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center">
            <h1 className="text-primary"> Comments</h1>
            <p className="text-sm ml-3 text-customGray">
              {/* {comments[reelData._id]?.length || 0} */}
            </p>
          </div>
          <div>
            <button
              onClick={() => setCommentOpen(false)}
              className="cursor-pointer "
            >
              <CloseOutlinedIcon className="text-customGray hover:text-primary " />
            </button>
          </div>
        </div>
        <div className="flex items-start gap-3 mb-3">
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
                onClick={() => handleCommentSubmit(data._id)}
                className="cursor-pointer absolute right-3 bottom-4 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors disabled:opacity-50"
                disabled={!comment.trim()}
              >
                <SendOutlinedIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Comments list */}
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="mt-4 rounded-lg mb-3 group">
              {/* ... your comment rendering JSX ... */}
              <div className="flex items-start gap-3">
                <div
                  onClick={() => navigate(`/profile/${comment.user._id}`)}
                  className="cursor-pointer w-7 h-7 bg-gray-300 rounded-full flex-shrink-0"
                >
                  {comment.user?.avatar &&
                  !comment.user.avatar.includes(
                    "https://lh3.googleusercontent.com/"
                  ) ? (
                    <img
                      src={comment.user.avatar}
                      alt="User Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-400 dark:text-accent">
                        {comment.user?.firstName?.[0]?.toUpperCase()}
                        {comment.user?.lastName?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="inline-flex flex-col max-w-full">
                    <div className="bg-white dark:bg-gray-800 py-2 px-3 rounded-lg inline-block max-w-full">
                      <div className="flex justify-between items-start gap-10">
                        <div
                          onClick={() =>
                            navigate(`/profile/${comment.user._id}`)
                          }
                          className="cursor-pointer hover:underline font-medium text-sm text-gray-800 dark:text-gray-200 truncate max-w-[180px]"
                        >
                          {comment.user?.firstName} {comment.user?.lastName}
                        </div>
                        {comment.user._id === currentUser?._id && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              setSelectedCommentId(comment._id);
                              setAnchorEl(e.currentTarget);
                            }}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                          >
                            <MoreHorizIcon fontSize="small" />
                          </IconButton>
                        )}
                      </div>
                      <div className=" flex items-center">
                        <div className="-mt-[2px] flex items-center text-customGray">
                          <p
                            className={`text-xs text-accent ${
                              comment.user._id === currentUser?._id
                                ? "-mt-[9px]"
                                : ""
                            }`}
                          >
                            {formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true,
                            }).replace("about ", "")}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm pt-2 text-gray-700 dark:text-gray-300 break-words pr-9">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl) && selectedCommentId === comment._id}
                onClose={() => {
                  setAnchorEl(null);
                  setSelectedCommentId(null);
                }}
              >
                <MenuItem
                  onClick={() => {
                    if (selectedCommentId) {
                      handleDeleteComment(selectedCommentId);
                    }
                    setAnchorEl(null);
                  }}
                >
                  <DeleteIcon fontSize="small" className="mr-2 text-red-500" />
                  Delete
                </MenuItem>
              </Menu>
            </div>
          ))
        ) : (
          <div className="text-center mt-15">No Comments</div>
        )}
      </div>
    </div>
  );
};

export default CommentModal;
