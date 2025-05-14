import { useCallback, useEffect, useState } from "react";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import useEmblaCarousel from "embla-carousel-react";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import PublicIcon from "@mui/icons-material/Public";
import GroupIcon from "@mui/icons-material/Group";
import SchoolIcon from "@mui/icons-material/School";
import FavoriteIcon from "@mui/icons-material/Favorite";

// Components
import Sidebar from "../../components/Sidebar";
import MobileSidebar from "../../components/MobileSidebar";
import CommentModal from "../../components/Reels/CommentModal";

//MUI
import Skeleton from "@mui/material/Skeleton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";

// Utils
import { postComment } from "../../utils/postComment";

import { useUserStore, useReelsStore } from "../../global/mode";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

const Reels = () => {
  const navigate = useNavigate();
  const { reels, viewedIds, fetchReels, markAsViewed } = useReelsStore();

  const {
    currentUser,
    getAllReels,
    likeReel,
    getCommentsForReel,
    addReelViews,
  } = useUserStore();
  const [allReels, setAllReels] = useState<any[]>([]);
  const [viewedReelIds, setViewedReelIds] = useState<Set<string>>(new Set());
  const [currentReelIdView, setCurrentReelIdView] = useState();

  useEffect(() => {
    fetchReels();
  }, []);

  useEffect(() => {
    const getReels = async () => {
      try {
        const reels = await getAllReels();

        if (reels && reels.length > 0) {
          setAllReels(reels);
          setViewedReelIds(new Set([reels[0]._id]));
        }
      } catch (error) {
        console.error("Error fetching reels:", error);
      }
    };
    getReels();
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  const users = Array(10).fill(null); // Mock user data
  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: "y", // Vertical scroll
    align: "start", // Aligns the snaps to the start of each reel
    containScroll: "keepSnaps", // Keeps the snaps within the container boundaries
    dragFree: false, // Disables free dragging/swiping (will snap to each reel)
    loop: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedDescriptions, setExpandedDescriptions] = useState<
    Record<string, boolean>
  >({});

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
    setCommentOpen(false);
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
    setCommentOpen(false);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCommentOpen(false);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    //Initial setup
    handlePlayPauseOnScroll();

    emblaApi.on("select", handlePlayPauseOnScroll);
    onSelect();
    return () => emblaApi.off("select", handlePlayPauseOnScroll);
  }, [emblaApi, onSelect]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: { key: string }) => {
      if (e.key === "ArrowUp") {
        scrollPrev();
      } else if (e.key === "ArrowDown") {
        scrollNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrollPrev, scrollNext]);

  const toggleDescription = (reelId: string) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [reelId]: !prev[reelId],
    }));
  };

  //Comment
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentData, setCommentData] = useState(0);

  //Video
  const [showPlayPause, setShowPlayPause] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const handleTogglePlay = (index: number) => {
    const videoElement = document.getElementById(
      `video-${index}`
    ) as HTMLVideoElement | null;

    if (videoElement) {
      if (videoElement.paused) {
        videoElement.play();
        setIsPlaying(true);
      } else {
        videoElement.pause();
        setIsPlaying(false);
      }
    }

    setShowPlayPause(true);
    setTimeout(() => setShowPlayPause(false), 500);
  };

  const handleToggleMute = (index: number) => {
    const videoElement = document.getElementById(
      `video-${index}`
    ) as HTMLVideoElement | null;

    if (videoElement) {
      if (videoElement.muted) {
        videoElement.muted = false;
        setIsMuted(false);
      } else {
        videoElement.muted = true;
        setIsMuted(true);
      }
    }
  };

  const handlePlayPauseOnScroll = useCallback(() => {
    if (!emblaApi) return;

    const selectedIndex = emblaApi.selectedScrollSnap();
    const currentReel = reels[selectedIndex];

    if (currentReel && currentReel._id) {
      addReelViews(currentReel._id);
    }

    // Pause all videos
    users.forEach((_, index) => {
      const videoEl = document.getElementById(
        `video-${index}`
      ) as HTMLVideoElement | null;
      if (videoEl) {
        videoEl.pause();
      }
    });

    // Play only the selected video
    const selectedVideoEl = document.getElementById(
      `video-${selectedIndex}`
    ) as HTMLVideoElement | null;

    if (selectedVideoEl) {
      selectedVideoEl
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsMuted(selectedVideoEl.muted);

          // Add view count for the current reel if it hasn't been viewed yet
          if (currentReel && !viewedReelIds.has(currentReel._id)) {
            addReelViews(currentReel._id);
            setViewedReelIds(
              (prevIds) => new Set(prevIds.add(currentReel._id))
            );
          }
        })
        .catch((err) => console.warn("Auto-play blocked:", err));
    }
  }, [emblaApi, users, allReels, addReelViews, viewedReelIds]);

  useEffect(() => {
    const rootNode = emblaApi?.rootNode();

    if (rootNode && window.innerWidth < 767) {
      rootNode.style.pointerEvents = commentOpen ? "none" : "auto";
      rootNode.style.overflow = commentOpen ? "hidden" : "";

      if (commentOpen) {
        emblaApi?.scrollTo(emblaApi.selectedScrollSnap());
      } else {
        emblaApi?.reInit(); // after comments close
      }
    }
  }, [commentOpen, emblaApi]);

  const getVisibilityIcon = (option: string) => {
    switch (option) {
      case "public":
        return <PublicIcon className="scale-45 mb-[1px] -ml-1" />;
      case "department-only":
        return <ApartmentIcon className="scale-45 mb-[1px] -ml-1" />;
      case "followers-only":
        return <GroupIcon className="scale-45 mb-[1px] -ml-1" />;
    }
  };

  const [activeReel, setActiveReel] = useState();

  return (
    <div className=" relative md:grid md:grid-cols-15 px-3 sm:px-5 gap-7 mx-auto  ">
      <section className=" mt-5 col-span-0 hidden md:block md:col-span-2 lg:col-span-3">
        <Sidebar />
      </section>

      <section className="overflow-hidden h-[90vh] relative  sm:col-span-3 md:col-span-13 lg:col-span-9 flex-1 rounded-md lg:px-15 ">
        {/* Comment Section */}
        <div key={Date.now()} className={`commentSectionMobile z-3 `}>
          {commentOpen && (
            <CommentModal
              reelData={activeReel}
              commentOpen={commentOpen}
              setCommentOpen={setCommentOpen}
            />
          )}
        </div>
        <div
          className="embla__viewport_reels "
          ref={emblaRef}
          style={{ scrollBehavior: "smooth" }}
        >
          <div className="embla__container_reels flex flex-col ">
            {allReels?.map((reel, index) => {
              const MAX_LENGTH = 35; // Characters to show before truncation
              const caption = reel.caption || "";
              const shouldTruncate =
                caption.length > MAX_LENGTH ||
                reel.relatedCourse ||
                reel.tags.length > 0;
              const isExpanded = expandedDescriptions[reel._id] || false;

              const displayText = isExpanded
                ? caption
                : shouldTruncate
                ? `${caption.substring(0, MAX_LENGTH)}...`
                : caption;

              return (
                <div
                  key={index}
                  className="embla__slide_reels   flex-shrink-0 w-full min-h-screen flex flex-col justify-center pb-16"
                >
                  {!isLoading ? (
                    <div className="cursor-pointer flex justify-center items-center flex-grow w-full">
                      {/* Blurred background container */}
                      <div className="absolute w-[340px] xl:w-[22vw] h-[85%] md:h-[88vh] overflow-hidden rounded-2xl">
                        <div
                          style={{
                            backgroundImage: `url(${reel.videoUrl})`,
                          }}
                          className="w-full h-full bg-cover bg-center filter blur-xl scale-110 opacity-70"
                        />
                      </div>

                      {/* Main video container */}
                      <div
                        style={{
                          backgroundImage: `url(${reel.videoUrl})`,
                        }}
                        className="bg-gray-500 dark:bg-secondaryBg reelsVidContainer relative w-[320px] xl:w-[21vw] h-[80%] md:h-[85vh] mb-25 md:mb-10 rounded-2xl flex justify-center items-center bg-cover bg-center"
                      >
                        {showPlayPause && (
                          <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="bg-black bg-opacity-60 rounded-full p-4 play-pause-indicator">
                              {isPlaying ? (
                                <PauseIcon
                                  className="text-white"
                                  style={{ fontSize: "3rem" }}
                                />
                              ) : (
                                <PlayArrowIcon
                                  className="text-white"
                                  style={{ fontSize: "3rem" }}
                                />
                              )}
                            </div>
                          </div>
                        )}

                        <video
                          id={`video-${index}`}
                          src={reel.videoUrl}
                          preload="auto"
                          className="absolute z-0 w-full  h-full rounded-2xl object-cover "
                          loop
                          playsInline
                          autoPlay={index == 0}
                          onClick={() => handleTogglePlay(index)}
                        >
                          Your browser does not support the video tag.
                        </video>

                        {/* Right side action buttons */}
                        <div className="absolute z-10 right-3 lg:-right-12 bottom-8 flex flex-col gap-5 items-center">
                          <button
                            onClick={scrollPrev}
                            className="cursor-pointer text-white lg:text-primary hover:text-customGray z-10 hidden md:block transition-all duration-300 ease-in-out transform hover:scale-110 "
                            // disabled={selectedIndex === 0}
                          >
                            <ChevronLeftIcon
                              className="rotate-90"
                              fontSize="large"
                            />
                          </button>

                          <button
                            onClick={scrollNext}
                            className="cursor-pointer text-white lg:text-primary hover:text-customGray z-10 hidden md:block transition-all duration-300 ease-in-out transform hover:scale-110 "
                            disabled={selectedIndex === allReels.length - 1}
                          >
                            <ChevronRightIcon
                              className="rotate-90"
                              fontSize="large"
                            />
                          </button>

                          <button
                            onClick={async () => {
                              const updateReel = await likeReel(reel._id);

                              if (!updateReel) return;

                              setAllReels((prevReels) =>
                                prevReels.map((r) =>
                                  r._id === reel._id
                                    ? { ...r, likes: updateReel.likes }
                                    : r
                                )
                              );
                            }}
                            className="cursor-pointer  text-white lg:text-primary hover:text-red-500 transition-all duration-300 ease-in-out transform hover:scale-110 "
                          >
                            {reel.likes.includes(currentUser?._id) ? (
                              <FavoriteIcon
                                fontSize="medium"
                                className="text-red-500"
                              />
                            ) : (
                              <FavoriteBorderIcon
                                fontSize="medium"
                                className=""
                              />
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setCommentOpen((prev) => !prev);
                              setCommentData(index + 1);
                              setActiveReel(reel);
                            }}
                            className="cursor-pointer text-white lg:text-primary hover:text-blue-400 transition-all duration-300 ease-in-out transform hover:scale-110 "
                          >
                            <ChatBubbleOutlineRoundedIcon fontSize="medium" />
                          </button>

                          {/* <button className="cursor-pointer text-white lg:text-primary hover:text-green-400 transition-all duration-300 ease-in-out transform hover:scale-110 ">
                            <ShareOutlinedIcon fontSize="medium" />
                          </button> */}

                          <button
                            onClick={() => handleToggleMute(index)}
                            className="cursor-pointer text-white lg:text-primary hover:text-customGray transition-all duration-300 ease-in-out transform hover:scale-110 "
                          >
                            {isMuted ? (
                              <VolumeOffIcon fontSize="medium" />
                            ) : (
                              <VolumeUpIcon fontSize="medium" />
                            )}
                          </button>
                        </div>

                        {/* User info at the bottom */}
                        <div className=" w-[320px] xl:w-[21vw] mx-auto px-4 mt-2 absolute bottom-0 pb-3  bg-gradient-to-t from-black to-transparent rounded-b-2xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-400 rounded-full">
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
                                onClick={() => {
                                  navigate(`/profile/${reel.user._id}`);
                                }}
                                className="cursor-pointer hover:underline font-medium text-sm text-white"
                              >
                                {reel.user.firstName} {reel.user.lastName}
                              </h1>
                              <div className="-mt-1 flex items-center text-gray-200">
                                <p
                                  onClick={() => {
                                    navigate(`/profile/${reel.user._id}`);
                                  }}
                                  className=" cursor-pointer hover:underline text-xs"
                                >
                                  @{reel.user.username}
                                </p>
                                <span className="mx-1 text-sm">•</span>
                                <div>{getVisibilityIcon(reel.visibility)}</div>
                              </div>
                            </div>
                          </div>

                          {/* Description with See More */}
                          <div className="mt-3  mr-5 text-white">
                            <p className="text-sm flex-grow ">{displayText}</p>

                            {isExpanded && (
                              <div className="flex flex-wrap mt-3 gap-1">
                                {/* Course badge */}
                                {reel.relatedCourse && (
                                  <div className="flex items-center gap-1 px-2 pr-3 py-1 rounded-full bg-gray-900/40 text-xs">
                                    <SchoolIcon className="scale-70" />
                                    <span>{reel.relatedCourse}</span>
                                  </div>
                                )}

                                {/* Tags */}
                                {reel.tags?.map((tag: string) => (
                                  <div
                                    key={tag}
                                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-gray-900/40"
                                  >
                                    #{tag}
                                  </div>
                                ))}
                              </div>
                            )}
                            {shouldTruncate && (
                              <button
                                onClick={() => toggleDescription(reel._id)}
                                className="cursor-pointer text-sm text-gray-300 hover:text-[#8fbfff]"
                              >
                                {isExpanded ? "See Less" : "See More"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="cursor-pointer flex justify-center items-center flex-grow w-full">
                      <div className="relative w-full max-w-[20rem] h-[80%] md:h-[93%] mb-25 md:mb-1  bg-gray-600 rounded-2xl flex justify-center items-center">
                        <Skeleton
                          animation="wave"
                          variant="rectangular"
                          width="100%"
                          height="100%"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Comment Section */}
      </section>

      <section className="absolute top-5 w-1/3 right-0 mx-auto flex items-start justify-start">
        <div
          key={Date.now()}
          className="hidden commentSectionDesktop  w-90  items-start mr-[3%] "
        >
          {commentOpen && (
            <CommentModal
              reelData={activeReel}
              commentOpen={commentOpen}
              setCommentOpen={setCommentOpen}
            />
          )}
        </div>
      </section>

      <MobileSidebar />
    </div>
  );
};

export default Reels;
