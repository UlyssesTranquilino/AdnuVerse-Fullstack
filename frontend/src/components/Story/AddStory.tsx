import { useState, useRef, useEffect } from "react";

// Icons
import PublicIcon from "@mui/icons-material/Public";
import ApartmentIcon from "@mui/icons-material/Apartment";
import GroupIcon from "@mui/icons-material/Group";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";

// Utils
import { uploadFile } from "../../utils/cloudinary";

//Toaster
import toast, { Toaster } from "react-hot-toast";

//Theme
import { useTheme, useUserStore } from "../../global/mode";

const AddStory = ({ closeStoryModal, hasStory, onStoryAdded }) => {
  const { createStory, getAllStories, currentUser } = useUserStore();

  const { isDarkMode } = useTheme();
  const [isImageStory, setIsImageStory] = useState(false);
  const [isTextStory, setIsTextStory] = useState(false);
  const [textContent, setTextContent] = useState("");
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [fontSize, setFontSize] = useState(24);
  const [showTextControls, setShowTextControls] = useState(false);
  const textAreaRef = useRef(null);

  const gradientOptions = [
    "bg-gradient-to-tr from-blue-400 to-purple-500",
    "bg-gradient-to-tr from-pink-400 to-red-500",
    "bg-gradient-to-tr from-green-400 to-emerald-500",
    "bg-gradient-to-tr from-yellow-400 to-orange-500",
    "bg-gradient-to-tr from-teal-400 to-cyan-500",
    "bg-gradient-to-tr from-rose-400 to-pink-500",
    "bg-gradient-to-tr from-lime-400 to-green-500",
    "bg-gradient-to-tr from-orange-400 to-amber-500",
  ];

  const [selectedBg, setSelectedBg] = useState(gradientOptions[0]);

  const handleMouseDown = (e: {
    currentTarget: { getBoundingClientRect: () => any };
    clientX: number;
    clientY: number;
  }) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  const handleMouseMove = (e: { clientX: number; clientY: number }) => {
    if (!isDragging) return;

    const container = document.querySelector(".story-container");
    if (!container) return;
    const containerRect = container.getBoundingClientRect();

    let x = e.clientX - containerRect.left - dragOffset.x;
    let y = e.clientY - containerRect.top - dragOffset.y;

    // Boundary checks
    x = Math.max(0, Math.min(x, containerRect.width - 200)); // Assuming text area width of 200px
    y = Math.max(0, Math.min(y, containerRect.height - 100)); // Assuming text area height of 100px

    setTextPosition({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, dragOffset]);

  const handleFontSizeChange = (e: { target: { value: string } }) => {
    setFontSize(parseInt(e.target.value));
  };

  const [image, setImage] = useState({});
  const [textStoryImage, setTextStoryImage] = useState("");

  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  const divRef = useRef();

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];

    const container = document.querySelector(".story-container");
    const containerRect = container.getBoundingClientRect();

    let x = touch.clientX - containerRect.left - dragOffset.x;
    let y = touch.clientY - containerRect.top - dragOffset.y;

    x = Math.max(0, Math.min(x, containerRect.width - 200));
    y = Math.max(0, Math.min(y, containerRect.height - 100));

    setTextPosition({ x, y });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const [visibility, setVisibility] = useState("public");
  const [showVisibilityOptions, setShowVisibilityOptions] = useState(false);

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
      default:
        return null;
    }
  };

  const handleAddStory = async () => {
    if (!isImageStory && !textContent) return;

    let storyData = {
      type: isImageStory ? "image" : "text",
      text: isTextStory ? textContent : null,
      textStyle: {
        fontSize: fontSize,
        position: textPosition,
        background: selectedBg,
      },
      media: "",
      likes: [],
      visibility: visibility,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
    };

    try {
      await toast.promise(
        (async () => {
          if (isImageStory) {
            try {
              const uploadedImage = await uploadFile("image", image.file);
              storyData.media = uploadedImage;
            } catch (error) {
              toast.error("Error uploading story");
              console.error("Error uploading story: ", error);
            }
          }

          await createStory(
            storyData.type,
            storyData.text,
            storyData.media,
            storyData.visibility,
            storyData.textStyle
          );
        })(),
        {
          loading: "Adding Story...",
          success: "Story Posted!",
          error: "Adding Story failed. Try again.",
        }
      );
    } catch (error) {
      toast.error("Upload failed. Please try again.");
      console.error("Upload faild: ", error);
    } finally {
      onStoryAdded();
      closeStoryModal();
    }
  };

  return (
    <div className=" px-5 pb-15 sm:pb-0 sm:px-0 max-w-sm  h-screen  flex items-center justify-center  relative  mx-auto">
      <Toaster
        toastOptions={{
          className: "text-primary bg-secondaryBg",
          style: {
            color: isDarkMode ? "white" : "black",
            backgroundColor: isDarkMode ? "#1F2937" : "#F9FAFB",
          },
        }}
      />
      <div className=" w-full relative h-[80%] bg-secondaryBg m-auto rounded-2xl story-container ">
        <button
          onClick={closeStoryModal}
          className="cursor-pointer hover:bg-gray-100/30 p-1 rounded-full  absolute top-4 sm:top-5  right-4 text-white z-50"
        >
          <CloseIcon className="text-white" />
        </button>

        <h1 className="absolute text-primary font-semibold w-full text-center top-5 text-lg">
          Add Story
        </h1>

        {(isImageStory || isTextStory) && (
          <button
            onClick={() => {
              setIsImageStory(false);
              setIsTextStory(false);
            }}
            className="cursor-pointer hover:bg-gray-100/30 p-1 rounded-full  absolute top-4   left-4 text-white z-50 scale-90"
          >
            <ArrowBackIosNewIcon className="text-white" />
          </button>
        )}

        {!isImageStory && !isTextStory && (
          <div className="mt-5 sm:mt-0 flex flex-col items-center justify-center h-full text-white text-center font-medium gap-10">
            <label className="cursor-pointer hover:shadow-lg shadow-red-400/50 w-45 h-40 bg-gradient-to-tr from-pink-400 to-red-500 rounded-lg flex items-center justify-center transition-all duration-300 ease-in-out relative">
              Image Story
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || [];
                  if (file) {
                    setImage({
                      file,
                      type: file.type,
                      preview: URL.createObjectURL(file),
                    });
                    setIsImageStory(true);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>

            <div
              onClick={() => setIsTextStory(true)}
              className="cursor-pointer hover:shadow-lg shadow-purple-500/50 w-45 h-40 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-lg flex items-center justify-center transition-all duration-300 ease-in-out"
            >
              Text Story
            </div>
          </div>
        )}

        {/* Text Story */}
        {isTextStory && (
          <div className="h-full flex flex-col">
            <div
              ref={divRef}
              className={`flex-1 relative overflow-hidden ${selectedBg} rounded-t-2xl`}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <div
                className={`absolute cursor-move ${
                  showTextControls ? "ring-2 ring-white" : ""
                }`}
                style={{
                  left: `${textPosition.x}px`,
                  top: `${textPosition.y}px`,
                  transform: "translate(0, 0)",
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onClick={() => setShowTextControls(!showTextControls)}
              >
                <textarea
                  ref={textAreaRef}
                  placeholder="Type your story..."
                  className={`resize-none bg-transparent text-white focus:outline-none p-2 w-64 text-center`}
                  style={{
                    fontSize: `${fontSize}px`,
                    minHeight: `${fontSize * 2}px`,
                    lineHeight: `${fontSize * 1.2}px`,
                  }}
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                />
                {showTextControls && (
                  <div className="absolute -top-8 left-0 right-0 flex justify-center">
                    <DragIndicatorIcon className="text-white" />
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-secondaryBg rounded-b-2xl my-1">
              <div className="flex  justify-between sm:items-center mb-5 ">
                <div className="flex items-center space-x-2">
                  <FormatColorTextIcon className="text-primary" />
                  <input
                    type="range"
                    min="16"
                    max="60"
                    value={fontSize}
                    onChange={handleFontSizeChange}
                    className="w-24"
                  />
                </div>

                <div>
                  <button
                    onClick={() =>
                      setShowVisibilityOptions(!showVisibilityOptions)
                    }
                    className="cursor-pointer flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {getVisibilityIcon(visibility)}
                    <span>{visibilityLabels[visibility]}</span>
                  </button>

                  {showVisibilityOptions && (
                    <div className="absolute z-20 mt-1 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-1 min-w-[180px] border border-gray-200 dark:border-gray-700">
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
              </div>
              <div className="flex flex-wrap gap-3  mb-4">
                {gradientOptions.map((itemBg) => (
                  <button
                    key={itemBg}
                    onClick={() => setSelectedBg(itemBg)}
                    className={`w-7 h-7 rounded-full ${itemBg} ${
                      itemBg === selectedBg ? "ring-2 ring-white" : ""
                    }`}
                  ></button>
                ))}
              </div>
              <button
                onClick={() => {
                  handleAddStory();
                }}
                className="cursor-pointer w-full py-2 bg-accent dark:bg-blue-800 text-white rounded-lg text-sm font-medium hover:scale-[1.02] transform transition-all duration-200"
              >
                Add Story
              </button>

              {textStoryImage && (
                <div>
                  <img src={textStoryImage} alt="text story" />
                </div>
              )}
            </div>
          </div>
        )}

        {isImageStory && image && (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-hidden rounded-t-2xl flex items-center justify-center px-4 mt-15 ">
              <img
                src={image.preview}
                alt="Story preview"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Visibility */}

            <div className="px-4 mt-2">
              <button
                onClick={() => setShowVisibilityOptions(!showVisibilityOptions)}
                className="cursor-pointer flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {getVisibilityIcon(visibility)}
                <span>{visibilityLabels[visibility]}</span>
              </button>

              {showVisibilityOptions && (
                <div className="absolute z-20 mt-1 left-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-1 min-w-[180px] border border-gray-200 dark:border-gray-700">
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

            <div className="p-4 bg-secondaryBg rounded-b-2xl my-1">
              <button
                onClick={handleAddStory}
                className="cursor-pointer w-full py-2 bg-accent dark:bg-blue-800 text-white rounded-lg text-sm font-medium hover:scale-[1.02] transform transition-all duration-200"
              >
                Add Story
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddStory;
