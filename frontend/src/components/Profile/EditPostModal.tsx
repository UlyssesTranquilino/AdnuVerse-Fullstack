import { useState, useEffect, useRef } from "react";

//MUI Icons
import InsertPhotoRoundedIcon from "@mui/icons-material/InsertPhotoRounded";
import PublicIcon from "@mui/icons-material/Public";
import GroupIcon from "@mui/icons-material/Group";
import ApartmentIcon from "@mui/icons-material/Apartment";
import SchoolIcon from "@mui/icons-material/School";
import CloseIcon from "@mui/icons-material/Close";
import TagIcon from "@mui/icons-material/Tag";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";

import EmojiPicker from "emoji-picker-react";

import { formatDistanceToNow } from "date-fns";
import { useUserStore, useTheme } from "../../global/mode";

//Components
import PostMediaPreview from "../Post/PostMediaPreview";

//Toaster
import toast, { Toaster } from "react-hot-toast";

import { uploadFile } from "../../utils/cloudinary";

//Closing Emoji Picker
const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if clicked element is the emoji picker button
      const isEmojiButton = event.target.closest(".emoji-picker-button");

      if (
        ref.current &&
        !ref.current.contains(event.target) &&
        !isEmojiButton
      ) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
};

const EditPostModal = ({ closeEditFeed, activeFeed, handleRefresh }) => {
  const [formState, setFormState] = useState(activeFeed || {});

  const [mediaUrls, setMediaUrls] = useState(formState.media);

  const { currentUser, updatePost } = useUserStore();

  const { isDarkMode } = useTheme();

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

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
  const [isFocused, setIsFocused] = useState(false);
  const [postBody, setPostBody] = useState(formState.text);

  const adjustHeight = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [postBody]);

  // UI State
  const [relatedCourse, setRelatedCourse] = useState(formState.relatedCourse);
  const [showVisibilityOptions, setShowVisibilityOptions] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tags, setTags] = useState(formState.tags);

  const [tagInput, setTagInput] = useState("");

  const [showCourseInput, setShowCourseInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [visibility, setVisibility] = useState(formState.visibility);

  const visibilityOptions = ["public", "department-only", "followers-only"];

  const visibilityLabels = {
    public: "Public",
    "department-only": "Department Only",
    "followers-only": "Followers Only",
  };

  const handleSave = async () => {
    try {
      let updateMedia = [];

      await toast.promise(
        (async () => {
          if (mediaUrls.length > 0) {
            // Filter out only new files that need to be uploaded
            const filesToUpload = mediaUrls.filter((item) => item.file);

            if (filesToUpload.length > 0) {
              const uploadPromises = filesToUpload.map((item) => {
                const isVideo = item.type.startsWith("video/");
                return uploadFile(isVideo ? "video" : "image", item.file);
              });

              const uploadedUrls = await Promise.all(uploadPromises);

              // Combine existing URLs (that don't have a file property) with newly uploaded URLs
              updateMedia = [
                ...mediaUrls
                  .filter((item) => !item.file)
                  .map((item) => item.preview || item),
                ...uploadedUrls.filter((url) => url !== ""),
              ];
            } else {
              // No new files to upload, just use the existing URLs
              updateMedia = mediaUrls.map((item) => item.preview || item);
            }
          }

          await updatePost(formState._id, {
            text: postBody,
            media: updateMedia,
            visibility,
            tags,
            relatedCourse,
          });

          closeEditFeed();
          if (handleRefresh) handleRefresh();
        })(),
        {
          loading: "Editing...",
          success: "Post Edited!",
          error: "Editing post failed. Try again.",
        }
      );
    } catch (error) {
      console.error("Error editing post:", error);
    }
  };

  const emojiPickerRef = useRef(null);
  useClickOutside(emojiPickerRef, () => {
    setShowEmojiPicker(false);
  });

  return (
    <div className="flex-col relative pb-10 overflow-y-auto h-120 md:h-150 scrollComment max-w-xl mt-20 rounded-2xl w-[95%] mx-auto inset-0 bg-secondaryBg  z-100 flex  px-2 sm:px-6 md:px-10 ">
      <Toaster
        toastOptions={{
          className: "text-primary bg-secondaryBg",
          style: {
            color: isDarkMode ? "white" : "black",
            backgroundColor: isDarkMode ? "#1F2937" : "#F9FAFB",
          },
        }}
      />
      <div
        className={` w-full flex flex-col gap-5 rounded-2xl px-3  ${
          formState.media.length > 1
            ? "grid grid-cols-1 sm:grid-cols-2"
            : "flex"
        }`}
      >
        <div className="w-full max-w-xl overflow-hidden p-5">
          <h1 className=" font-semibold text-center text-lg">Edit Post</h1>
        </div>

        <button
          onClick={closeEditFeed}
          className="cursor-pointer hover:bg-gray-100/30 p-1 rounded-full  absolute top-5   right-2 text-white z-50"
          aria-label="Close story viewer"
        >
          <CloseIcon className="scale-115" />
        </button>

        <div className="flex justify-between ">
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
                  {formatDistanceToNow(new Date(formState.createdAt), {
                    addSuffix: true,
                  }).replace("about ", "")}
                </p>
                <span className="mx-1 text-sm">•</span> {/* Dot */}
                {getVisibilityIcon(formState.visibility)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 md:gap-4 ">
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

        {/* Post Metadata */}
        <div className=" flex flex-wrap items-center gap-2">
          {/* Visibility Selector */}
          <div className="relative">
            <button
              onClick={() => setShowVisibilityOptions(!showVisibilityOptions)}
              className="cursor-pointer flex items-center gap-1  px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {getVisibilityIcon(visibility)}
              <span className="text-xs">{visibilityLabels[visibility]}</span>
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

        {/* Media Post Preview */}
        {mediaUrls.length > 0 && (
          <PostMediaPreview mediaUrls={mediaUrls} setMediaUrls={setMediaUrls} />
        )}

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
              accept="image/*,video/*"
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
              className="emoji-picker-button cursor-pointer flex items-center gap-1 group" // Added emoji-picker-button class
            >
              <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-gray-700 transition-colors">
                <EmojiEmotionsOutlinedIcon className="text-gray-500 dark:text-gray-400 scale-110 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
              </div>
              <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors hidden sm:block">
                Emoji
              </span>
            </button>

            {showEmojiPicker && (
              <div
                className="absolute z-50 mt-2 left-5 sm:left-20 emoji-picker-container" // Changed z-index to 50
                style={{ right: 0 }} // Ensure it stays within viewport
                ref={emojiPickerRef}
              >
                <div className="origin-top-left scale-75 sm:scale-90 md:scale-100">
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
            onClick={handleSave}
            className="cursor-pointer relative px-5 md:px-8 py-2 bg-accent dark:bg-blue-800 text-white  rounded-lg text-sm font-medium hover:scale-[1.02] transform transition-all duration-200 group overflow-hidden"
          >
            {/* Button text */}
            <span className="relative z-10 flex items-center justify-center gap-1">
              Save Post
            </span>

            {/* Shine effect on hover */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -rotate-45 -translate-x-full group-hover:translate-x-full" />

            {/* Pulse ring effect when active */}
            <span className="absolute inset-0 rounded-lg ring-0 group-active:ring-2 group-active:ring-accent/50 dark:group-active:ring-secondary/50 transition-all duration-200" />
          </button>
        )}
      </div>
    </div>
  );
};

export default EditPostModal;
