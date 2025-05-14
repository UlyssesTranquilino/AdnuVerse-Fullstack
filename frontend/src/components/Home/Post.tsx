import { useState, useRef, useEffect, SetStateAction } from "react";
//Icons
import InsertPhotoRoundedIcon from "@mui/icons-material/InsertPhotoRounded";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";
import PublicIcon from "@mui/icons-material/Public";
import ApartmentIcon from "@mui/icons-material/Apartment";
import GroupIcon from "@mui/icons-material/Group";
import TagIcon from "@mui/icons-material/Tag";
import SchoolIcon from "@mui/icons-material/School";
import CloseIcon from "@mui/icons-material/Close";
import VideoFileIcon from "@mui/icons-material/VideoFile";
import EmojiPicker from "emoji-picker-react";
import FeedIcon from "@mui/icons-material/Feed";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import InfoOutlineIcon from "@mui/icons-material/InfoOutline";

//Toaster
import toast, { Toaster } from "react-hot-toast";

//MUI
import Skeleton from "@mui/material/Skeleton";

//Theme
import { useTheme, useUserStore } from "../../global/mode";

//Components
import PostMediaPreview from "../Post/PostMediaPreview";
import PostReelsPreview from "../Post/PostReelsPreview";
import Popover from "@mui/material/Popover";
import Tooltip from "@mui/material/Tooltip";

// Axios
import { uploadFile } from "../../utils/cloudinary";

const Post = ({ onPostCreated }) => {
  const { currentUser, createPost, createReel } = useUserStore();
  const { isDarkMode } = useTheme();

  // Post type state
  const [postType, setPostType] = useState("post"); // 'post' or 'reel'

  // Common post states
  const [postBody, setPostBody] = useState("");
  const [mediaUrls, setMediaUrls] = useState([]);
  const [visibility, setVisibility] = useState("public");
  const [tags, setTags] = useState([]);
  const [relatedCourse, setRelatedCourse] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Reel-specific states
  const [videoReel, setVideoReel] = useState(null);
  const [reelCaption, setReelCaption] = useState("");

  // UI State
  const [showVisibilityOptions, setShowVisibilityOptions] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [showCourseInput, setShowCourseInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const adjustHeight = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [postBody, reelCaption]);

  const visibilityOptions = ["public", "department-only", "followers-only"];

  const visibilityLabels = {
    public: "Public",
    "department-only": "Department Only",
    "followers-only": "Followers Only",
  };

  const getVisibilityIcon = (option: string) => {
    switch (option) {
      case "public":
        return <PublicIcon fontSize="small" />;
      case "department-only":
        return <ApartmentIcon fontSize="small" />;
      case "followers-only":
        return <GroupIcon fontSize="small" />;
    }
  };

  const [anchorElPopOver, setAnchorElPopOver] = useState(null);

  const handleClickPopOver = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElPopOver(event.currentTarget);
  };

  const handleClosePopOver = () => {
    setAnchorElPopOver(null);
  };

  const openPopOver = Boolean(anchorElPopOver);
  const id = openPopOver ? "simple-popover" : undefined;

  const clearFeedData = () => {
    setPostBody("");
    setMediaUrls([]);
    setVisibility("public");
    setTags([]);
    setRelatedCourse("");
  };

  const handleFeedSubmit = async () => {
    if (!postBody && mediaUrls.length === 0) {
      toast.error("Please add text or media to post");
      return;
    }

    try {
      await toast.promise(
        (async () => {
          let uploadedUrls = [];

          if (mediaUrls.length > 0) {
            uploadedUrls = await Promise.all(
              mediaUrls.map(async (item) => {
                let resourceType;

                // Determine resource type based on file type
                if (item.type.startsWith("video/")) {
                  resourceType = "video";
                } else if (item.type === "image/gif") {
                  resourceType = "image"; // or "auto" if your Cloudinary supports it
                } else {
                  resourceType = "image";
                }

                return await uploadFile(resourceType, item.file);
              })
            ).then((urls) => urls.filter((url) => url !== ""));
          }

          await createPost(
            postBody,
            uploadedUrls,
            visibility,
            tags,
            relatedCourse
          );
          onPostCreated();
          clearFeedData();
        })(),
        {
          loading: "Posting...",
          success: "Posted!",
          error: "Post failed. Try again.",
        }
      );
    } catch (error) {
      console.error("Upload failed: ", error);
      toast.error("Upload failed. Please try again.");
    }
  };

  const clearReelData = () => {
    setPostBody("");
    setVisibility("public");
    setTags([]);
    setRelatedCourse("");
    setVideoReel({});
  };

  const handleReelSubmit = async () => {
    if (!videoReel) {
      console.error("Error");
      return;
    }

    let postReelData = {
      userJ: "",
      videoUrl: "",
      text: postBody,
      media: "",
      likes: 0,
      comments: "",
      shares: "",
      views: 0,
      createdAt: new Date(),
      visibility: visibility,
      tags: tags,
      relatedCourse: relatedCourse,
    };

    try {
      const uploadedReel = await uploadFile("video", videoReel.file);
      postReelData.videoUrl = uploadedReel;

      await toast.promise(
        (async () => {
          const uploadedReel = await uploadFile("video", videoReel.file);
          postReelData.videoUrl = uploadedReel;

          await createReel(
            postReelData.text,
            postReelData.videoUrl,
            postReelData.visibility,
            postReelData.tags,
            postReelData.relatedCourse
          );
          onPostCreated();
        })(),
        {
          loading: "Posting...",
          success: "Posted!",
          error: "Post failed. Try again.",
        }
      );
    } catch (error) {
      console.error("Upload Faliled: ", error);
    }

    clearReelData();
  };

  const setVideoReelEmpty = () => {
    setVideoReel({});
  };

  //Closing Emoji Picker
  const useClickOutside = (ref, callback) => {
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
          callback();
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref, callback]);
  };

  const emojiPickerRef = useRef(null);
  useClickOutside(emojiPickerRef, () => {
    setShowEmojiPicker(false);
  });

  return !isLoading ? (
    <div className="relative mt-7 md:mt-10 bg-secondaryBg rounded-xl p-4 md:p-6 ">
      <Toaster
        toastOptions={{
          className: "text-primary bg-secondaryBg",
          style: {
            color: isDarkMode ? "white" : "black",
            backgroundColor: isDarkMode ? "#1F2937" : "#F9FAFB",
          },
        }}
      />
      <div className="flex items-start gap-3 md:gap-4">
        <div className="w-10 md:w-12 h-10 md:h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0">
          {currentUser?.avatar &&
          !currentUser.avatar.includes("https://lh3.googleusercontent.com/") ? (
            <img
              src={currentUser.avatar}
              alt="User Avatar"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-xl font-semibold text-blue-400 dark:text-accent">
                {currentUser?.firstName?.[0]?.toUpperCase()}
                {currentUser?.lastName?.[0]?.toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <textarea
          ref={textAreaRef}
          placeholder="Share about your thoughts..."
          value={postBody}
          onChange={(e) => setPostBody(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`placeholder:text-gray-500 min-h-15 sm:min-h-10 dark:placeholder:text-gray-400 overflow-y-hidden resize-none text-sm md:text-base bg-white dark:bg-gray-700 w-full focus:outline-none p-3 rounded-lg transition-all duration-200 border ${
            isFocused
              ? "border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20 dark:ring-blue-400/20"
              : "border-gray-200 dark:border-gray-600"
          }`}
          rows={1}
        />
      </div>

      {/* Media Post Preview */}
      {mediaUrls.length > 0 && (
        <PostMediaPreview mediaUrls={mediaUrls} setMediaUrls={setMediaUrls} />
      )}

      {/* Reel Post Preview */}
      {videoReel && Object.keys(videoReel).length > 0 && (
        <PostReelsPreview
          videoReel={videoReel}
          setVideoReelEmpty={setVideoReelEmpty}
        />
      )}

      {/* Post Metadata */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {/* Visibility Selector */}
        <div className="relative">
          <button
            onClick={() => setShowVisibilityOptions(!showVisibilityOptions)}
            className="cursor-pointer flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {getVisibilityIcon(visibility)}
            <span>{visibilityLabels[visibility]}</span>
          </button>

          {showVisibilityOptions && (
            <div className="absolute z-20 mt-1 left-0 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-1 min-w-[180px] border border-gray-200 dark:border-gray-700">
              {visibilityOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setVisibility(option);
                    setShowVisibilityOptions(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 rounded ${
                    visibility === option
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {getVisibilityIcon(option)}
                  {visibilityLabels[option]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Course Input */}
        {showCourseInput ? (
          <input
            type="text"
            value={relatedCourse}
            onChange={(e) => setRelatedCourse(e.target.value)}
            onBlur={() => setShowCourseInput(false)}
            onKeyDown={(e: any) => {
              if (e.key === "Enter") {
                e.preventDefault(); // Prevent default enter behavior
                setRelatedCourse(e.target.value); // Update the course code state
                setShowCourseInput(false); // Close the input field
              }
            }}
            placeholder="Course code (e.g., CS 101)"
            className="text-xs px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setShowCourseInput(true)}
            className="cursor-pointer flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <SchoolIcon fontSize="small" />
            <span>{relatedCourse || "Add Course"}</span>
          </button>
        )}

        {/* Tags Input */}
        {showTagInput ? (
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && tagInput.trim()) {
                setTags([...tags, tagInput.trim()]);
                setTagInput("");
              }
            }}
            onBlur={() => setShowTagInput(false)}
            placeholder="#tag (press Enter)"
            className="text-xs px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setShowTagInput(true)}
            className="cursor-pointer flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <TagIcon fontSize="small" />
            <span>Add Tag</span>
          </button>
        )}

        {/* Display Tags */}
        {tags.map((tag, index) => (
          <div
            key={index}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
          >
            #{tag}
            <button
              onClick={() => setTags(tags.filter((_, i) => i !== index))}
              className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>
        ))}
      </div>

      {/* Post Type Toggle */}
      <div className="my-3 flex items-center gap-2">
        <div className="flex items-center gap-2">
          <button
            className={`flex items-center justify-center gap-1 text-primary text-sm py-1  px-5  rounded-full  cursor-pointer ${
              postType === "post"
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                : "hover:bg-blue-200/20 dark:hover:bg-blue-900/20"
            }`}
            onClick={() => {
              setPostType("post");
              setVideoReel(undefined);
            }}
          >
            <FeedIcon className="scale-75" />
            Feed
          </button>
          <button
            className={`flex items-center justify-center gap-1 text-primary text-sm py-1  px-5  rounded-full  cursor-pointer ${
              postType === "reels"
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                : "hover:bg-blue-200/20 dark:hover:bg-blue-900/20"
            }`}
            onClick={() => {
              setPostType("reels");
              setMediaUrls([]);
            }}
          >
            <PlayCircleOutlineIcon className="scale-75" />
            Reels
          </button>
          <Tooltip title="Info">
            <button
              aria-describedby={id}
              onClick={handleClickPopOver}
              className="text-customGray cursor-pointer hover:text-primary"
            >
              <InfoOutlineIcon className="scale-70" />
            </button>
          </Tooltip>

          <Popover
            id={id}
            open={openPopOver}
            anchorEl={anchorElPopOver}
            onClose={handleClosePopOver}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          >
            <p className="text-sm p-2 bg-secondaryBg">
              Reels will show on the reels tab. Upload portrait videos for
              better view.
            </p>
          </Popover>
        </div>
      </div>
      {postType == "post" ? (
        <div>
          {/* Action Buttons */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Media Upload */}
              <label className="cursor-pointer flex items-center gap-1 group">
                <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-gray-700 transition-colors">
                  <InsertPhotoRoundedIcon className="text-gray-500 dark:text-gray-400 scale-110 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                </div>
                <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors hidden sm:block">
                  Media
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.gif"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const newMedia = files.map((file) => ({
                      file, // The actual File object
                      type: file.type, // image/jpeg, video/mp4, etc.
                      preview: URL.createObjectURL(file), // Preview URL
                    }));
                    setMediaUrls((prev) => [...prev, ...newMedia]);
                  }}
                  className="hidden"
                />
              </label>

              <div className="" ref={emojiPickerRef}>
                {/* Emoji Picker */}
                <button
                  onClick={() => {
                    setShowEmojiPicker((prev) => !prev);
                  }}
                  className="cursor-pointer flex items-center gap-1 group"
                >
                  <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-gray-700 transition-colors">
                    <EmojiEmotionsOutlinedIcon className="text-gray-500 dark:text-gray-400 scale-110 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                  <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors hidden sm:block">
                    Emoji
                  </span>
                </button>
                {showEmojiPicker && (
                  <div className="absolute z-20 mt-40 md:mt-35 emojiPicker">
                    <div className="origin-top-left  scale-75 sm:scale-90 md:scale-100">
                      <EmojiPicker
                        onEmojiClick={(emojiData) =>
                          setPostBody((prev) => prev + emojiData.emoji)
                        }
                        theme={isDarkMode ? "dark" : "light"}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Post Button - Only shows when there's content */}
            {postBody && (
              <button
                onClick={handleFeedSubmit}
                className="cursor-pointer relative px-5 md:px-8 py-2 bg-accent dark:bg-blue-800 text-white  rounded-lg text-sm font-medium hover:scale-[1.02] transform transition-all duration-200 group overflow-hidden"
              >
                {/* Button text */}
                <span className="relative z-10 flex items-center justify-center gap-1">
                  Post
                </span>

                {/* Shine effect on hover */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -rotate-45 -translate-x-full group-hover:translate-x-full" />

                {/* Pulse ring effect when active */}
                <span className="absolute inset-0 rounded-lg ring-0 group-active:ring-2 group-active:ring-accent/50 dark:group-active:ring-secondary/50 transition-all duration-200" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          {/* Action Buttons */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Media Upload */}
              <label className="cursor-pointer flex items-center gap-1 group">
                <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-gray-700 transition-colors">
                  <VideoFileIcon className="text-gray-500 dark:text-gray-400 scale-110 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                </div>
                <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors hidden sm:block">
                  Video
                </span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || [];

                    if (file) {
                      setVideoReel({
                        file,
                        type: file.type,
                        preview: URL.createObjectURL(file),
                      });
                    }
                  }}
                  className="hidden"
                />
              </label>

              {/* Emoji Picker */}
              <button
                onClick={() => {
                  setShowEmojiPicker((prev) => !prev);
                }}
                className="cursor-pointer flex items-center gap-1 group"
              >
                <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-gray-700 transition-colors">
                  <EmojiEmotionsOutlinedIcon className="text-gray-500 dark:text-gray-400 scale-110 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                </div>
                <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors hidden sm:block">
                  Emoji
                </span>
              </button>
              {showEmojiPicker && (
                <div className="absolute z-20 mt-40 md:mt-35  emojiPicker">
                  <div className="origin-top-left  scale-75 sm:scale-90 md:scale-100">
                    <EmojiPicker
                      onEmojiClick={(emojiData) =>
                        setPostBody((prev) => prev + emojiData.emoji)
                      }
                      theme={isDarkMode ? "dark" : "light"}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Post Button - Only shows when there's content */}
            {videoReel && (
              <button
                onClick={handleReelSubmit}
                className="cursor-pointer relative px-5 md:px-8 py-2 bg-accent dark:bg-blue-800 text-white  rounded-lg text-sm font-medium hover:scale-[1.02] transform transition-all duration-200 group overflow-hidden"
              >
                {/* Button text */}
                <span className="relative z-10 flex items-center justify-center gap-1">
                  Share Reel
                </span>

                {/* Shine effect on hover */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -rotate-45 -translate-x-full group-hover:translate-x-full" />

                {/* Pulse ring effect when active */}
                <span className="absolute inset-0 rounded-lg ring-0 group-active:ring-2 group-active:ring-accent/50 dark:group-active:ring-secondary/50 transition-all duration-200" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="relative mt-7 md:mt-10 bg-secondaryBg rounded-xl p-4 md:p-6 ">
      <div className="flex items-start gap-3 md:gap-4 overflow-hidden">
        <div className="w-10 md:w-12 h-10 md:h-12 rounded-full flex-shrink-0 overflow-hidden">
          <Skeleton
            animation="wave"
            variant="rectangular"
            width="100%"
            height="100%"
          />
        </div>

        <div className="w-full  mr-10 h-12 sm:min-h-10 flex-shrink-0 overflow-hidden">
          <Skeleton
            animation="wave"
            variant="rectangular"
            width="100%"
            height="100%"
          />
        </div>
      </div>

      {/* Post Metadata */}
      <div className="mt-1 flex flex-wrap items-center gap-2">
        {/* Visibility Selector */}
        <div className="relative">
          <div className=" py-1.5 rounded-full w-20 h-11 flex-shrink-0 overflow-hidden">
            <Skeleton
              animation="wave"
              variant="rectangular"
              width="100%"
              height="100%"
              className="rounded-full"
            />
          </div>
        </div>

        <div className=" py-1.5 rounded-full w-20 h-11 flex-shrink-0 overflow-hidden">
          <Skeleton
            animation="wave"
            variant="rectangular"
            width="100%"
            height="100%"
            className="rounded-full"
          />
        </div>

        <div className=" py-1.5 rounded-full w-24 h-11 flex-shrink-0 overflow-hidden">
          <Skeleton
            animation="wave"
            variant="rectangular"
            width="100%"
            height="100%"
            className="rounded-full"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Media Upload */}

          <div className=" py-1.5 rounded-md w-11 h-11 flex-shrink-0 overflow-hidden">
            <Skeleton
              animation="wave"
              variant="rectangular"
              width="100%"
              height="100%"
              className="rounded-sm"
            />
          </div>

          {/* Emoji Picker */}

          <div className=" py-1.5 rounded-full w-8 h-11 flex-shrink-0 overflow-hidden">
            <Skeleton
              animation="wave"
              variant="rectangular"
              width="100%"
              height="100%"
              className="rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
