import React, { useState, useEffect, useCallback } from "react";
import { Close, ChevronLeft, ChevronRight } from "@mui/icons-material";
import useEmblaCarousel from "embla-carousel-react";

//icons
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PublicIcon from "@mui/icons-material/Public";
import GroupIcon from "@mui/icons-material/Group";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DeleteIcon from "@mui/icons-material/Delete";
import FavoriteIcon from "@mui/icons-material/Favorite";

import { useUserStore, useTheme } from "../global/mode";

//Toaster
import toast, { Toaster } from "react-hot-toast";

import { useNavigate } from "react-router-dom";

interface StoryViewerProps {
  stories: any[];
  initialIndex: number;
  onClose: () => void;
  storyData: any;
  refreshStories: () => void;
  setAllStories: (stories: any[]) => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  initialIndex,
  onClose,
  storyData,
  refreshStories,
  setAllStories,
}) => {
  const navigate = useNavigate();

  const { currentUser, deleteStory, likeStory } = useUserStore();
  const { isDarkMode } = useTheme();

  // Local state for stories that can be modified without affecting the parent state
  const [localStories, setLocalStories] = useState(storyData);
  const [deletedStories, setDeletedStories] = useState<string[]>([]);
  const [likedStories, setLikedStories] = useState<Record<string, string[]>>(
    {}
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    startIndex: initialIndex,
    align: "center",
    slidesToScroll: 1,
  });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = useCallback(() => {
    emblaApi && emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi && emblaApi.scrollNext();
  }, [emblaApi]);

  const updateButtons = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    updateButtons();
    emblaApi.on("select", updateButtons);
    emblaApi.on("reInit", updateButtons);
    return () => {
      emblaApi.off("select", updateButtons);
      emblaApi.off("reInit", updateButtons);
    };
  }, [emblaApi, updateButtons]);

  // Initialize local state when component mounts
  useEffect(() => {
    setLocalStories(storyData);
  }, [storyData]);

  const getVisibilityIcon = (option: string) => {
    switch (option) {
      case "public":
        return <PublicIcon className="scale-55 -ml-2" />;
      case "department-only":
        return <ApartmentIcon className="scale-55 -ml-2" />;
      case "followers-only":
        return <GroupIcon className="scale-55 -ml-2" />;
      default:
        return null;
    }
  };

  // State for popover
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  const handleClickPopOver = (
    event: React.MouseEvent<HTMLElement>,
    postId: string
  ) => {
    event.stopPropagation();
    setOpenPopoverId(openPopoverId === postId ? null : postId);
  };

  const handleClosePopOver = () => {
    setOpenPopoverId(null);
  };

  // Handle click outside popover
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

  // Local delete handler
  const handleLocalDelete = (storyId: string) => {
    setLocalStories(localStories.filter((story) => story._id !== storyId));
    setDeletedStories([...deletedStories, storyId]);
    handleClosePopOver();

    // If we deleted the current story, close the viewer if no more stories
    if (localStories.length <= 1) {
      onClose();
    }
  };

  // Local like handler
  const handleLocalLike = async (storyId: string) => {
    const story = localStories.find((s) => s._id === storyId);
    if (!story || !currentUser) return;

    const isLiked = story.likes.includes(currentUser._id);
    const newLikes = isLiked
      ? story.likes.filter((id: string) => id !== currentUser._id)
      : [...story.likes, currentUser._id];

    // Update local state immediately
    setLocalStories(
      localStories.map((s) =>
        s._id === storyId ? { ...s, likes: newLikes } : s
      )
    );

    // Track liked stories to update later
    setLikedStories((prev) => ({
      ...prev,
      [storyId]: newLikes,
    }));
  };

  // When closing, update the parent state with all changes
  const handleClose = async () => {
    // First update likes
    await Promise.all(
      Object.entries(likedStories).map(async ([storyId, likes]) => {
        try {
          await likeStory(storyId);
        } catch (error) {
          console.error("Failed to update like:", error);
        }
      })
    );

    // Then delete stories
    await Promise.all(
      deletedStories.map(async (storyId) => {
        try {
          await deleteStory(storyId);
        } catch (error) {
          console.error("Failed to delete story:", error);
        }
      })
    );

    // Refresh stories after all changes
    await refreshStories();

    // Now close the modal
    onClose();
  };

  return (
    <div className="rounded-2xl fixed inset-0 text-primary bg-primaryBg z-100 flex items-center justify-center px-2 sm:px-6 md:px-10 overflow-y-auto">
      <Toaster
        toastOptions={{
          className: "text-primary bg-secondaryBg",
          style: {
            color: isDarkMode ? "white" : "black",
            backgroundColor: isDarkMode ? "#1F2937" : "#F9FAFB",
          },
        }}
      />

      <div className="relative w-full max-w-sm h-full sm:h-auto storyContainer overflow-hidden">
        {/* Story Carousel */}
        <div className="relative w-full h-full sm:h-[85vh] mx-auto">
          {prevBtnEnabled && (
            <button
              onClick={scrollPrev}
              className="cursor-pointer absolute left-2 top-1/2 -translate-y-1/2 text-white z-50 p-2 hover:bg-white/10 rounded-full transition"
              aria-label="Previous story"
            >
              <ChevronLeft fontSize="large" />
            </button>
          )}

          <div className="embla h-full w-full rounded-2xl" ref={emblaRef}>
            <div className="embla__container h-full flex rounded-2xl">
              {localStories.map((story, index) => (
                <div className="embla__slide flex-[0_0_100%] px-2" key={index}>
                  <div className="h-full flex items-center justify-center">
                    {story.Type_Of_Story === "text" ? (
                      <div
                        className={`relative ${story.textStyle.background} w-full aspect-[9/16] max-h-[80vh] md:max-h-[85vh] rounded-2xl flex items-center justify-center  `}
                      >
                        <div
                          style={{
                            left: story.textStyle.position.x,
                            top: story.textStyle.position.y,
                            transform: "translate(0, 0)",
                          }}
                          className="absolute"
                        >
                          <p
                            className={`resize-none bg-transparent text-white focus:outline-none p-2 w-64 text-center`}
                            style={{
                              fontSize: `${story.textStyle.fontSize}px`,
                            }}
                          >
                            {story.text}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`relative bg-blue-500/20 dark:bg-gray-900 w-full aspect-[9/16] max-h-[85vh] rounded-2xl flex items-center justify-center `}
                      >
                        <img src={story.media} alt="text story" />
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="absolute top-5 left-4 flex items-center gap-2 z-40">
                    <div className="w-8 h-8 bg-gray-600 rounded-full">
                      {story.user?.avatar &&
                      !story.user.avatar.includes(
                        "https://lh3.googleusercontent.com/"
                      ) ? (
                        <img
                          src={story.user.avatar}
                          alt="User Avatar"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-base font-semibold text-blue-400 dark:text-accent">
                            {story.user?.firstName?.[0]?.toUpperCase()}
                            {story.user?.lastName?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-start gap-1">
                      <div>
                        <h1
                          onClick={() => {
                            navigate(`/profile/${story.user._id}`);
                          }}
                          className="cursor-pointer hover:underline text-sm sm:text-base dark:text-white  sm:text-primary text-black"
                        >
                          {story.user.firstName} {story.user.lastName}
                        </h1>
                        <div className="flex -mt-1 items-center dark:text-white sm:text-primary text-black">
                          <p
                            onClick={() => {
                              navigate(`/profile/${story.user._id}`);
                            }}
                            className="cursor-pointer hover:underline text-xs text-customGray "
                          >
                            @{story.user.username}
                          </p>{" "}
                          <span className="mx-1 mr-[6px] text-sm">•</span>
                          {getVisibilityIcon(story.visibility)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {openPopoverId === story._id && (
                    <div
                      className="cursor-pointer absolute right-14 top-12 z-50 w-28 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 popover-container"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleLocalDelete(story._id)}
                        className="cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center gap-2 text-red-500"
                      >
                        <DeleteIcon fontSize="small" />
                        Delete
                      </button>
                    </div>
                  )}

                  <div className="">
                    {story.user._id === currentUser?._id && (
                      <button
                        onClick={(event) => {
                          handleClickPopOver(event, story._id);
                        }}
                        className="cursor-pointer hover:bg-gray-100/30 p-1 rounded-full  absolute top-4  right-13 text-primary z-50"
                      >
                        <MoreHorizIcon />
                      </button>
                    )}
                    {/* Close Button */}
                    <button
                      onClick={handleClose}
                      className="cursor-pointer hover:bg-gray-100/30 p-1 rounded-full  absolute top-4 right-4 text-primary z-50"
                      aria-label="Close story viewer"
                    >
                      <Close className="scale-115" />
                    </button>
                  </div>

                  {/* Actions */}
                  {story.user._id !== currentUser?._id && (
                    <div className="absolute bottom-4  right-5 flex gap-3 z-50 ">
                      <button
                        onClick={() => handleLocalLike(story._id)}
                        className="cursor-pointer text-primary hover:text-red-500 rounded-full p-1 transition-all transform hover:scale-110"
                      >
                        {story.likes.includes(currentUser?._id) ? (
                          <FavoriteIcon
                            fontSize="medium"
                            className="text-red-500"
                          />
                        ) : (
                          <FavoriteBorderIcon fontSize="medium" className="" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {nextBtnEnabled && (
            <button
              onClick={scrollNext}
              className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-white z-50 p-2 hover:bg-white/10 rounded-full transition"
              aria-label="Next story"
            >
              <ChevronRight fontSize="large" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;
