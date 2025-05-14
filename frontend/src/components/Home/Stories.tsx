import { useState, useEffect, useCallback } from "react";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import useEmblaCarousel from "embla-carousel-react";

import { useTheme, useUserStore } from "../../global/mode";

//MUI
import Skeleton from "@mui/material/Skeleton";
import Modal from "@mui/material/Modal";

//Components
import StoryViewer from "../../components/StoryViewer";
import AddStory from "../Story/AddStory";

//Toaster
import toast, { Toaster } from "react-hot-toast";

const Stories = () => {
  const { isDarkMode } = useTheme();

  const { getAllStories, isLoading, currentUser } = useUserStore();
  const [currStoryData, setCurrStoryData] = useState();
  const [allStories, setAllStories] = useState<any[]>([]);
  const [hasStory, setHasStory] = useState(false);

  const fetchStories = useCallback(async () => {
    const stories = await getAllStories();
    setAllStories(stories);

    if (!stories || !currentUser) return;

    setHasStory(
      stories.some((story: any) => story.user._id === currentUser._id)
    );
  }, [getAllStories, currentUser]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const users = Array(2).fill(null); // Mock user data
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    skipSnaps: true,
    dragFree: true,
  });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  // Number of slides to scroll at once
  const slidesToScroll = 2;

  // Scroll to the previous slide (scrolls multiple slides at once)
  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      const currentIndex = emblaApi.selectedScrollSnap();
      const newIndex = Math.max(currentIndex - slidesToScroll, 0);
      emblaApi.scrollTo(newIndex);
    }
  }, [emblaApi]);

  // Scroll to the next slide (scrolls multiple slides at once)
  const scrollNext = useCallback(() => {
    if (emblaApi) {
      const currentIndex = emblaApi.selectedScrollSnap();
      const newIndex = Math.min(
        currentIndex + slidesToScroll,
        emblaApi.scrollSnapList().length - 1
      );
      emblaApi.scrollTo(newIndex);
    }
  }, [emblaApi]);

  // Update button states based on whether scrolling is possible
  const updateCarousel = useCallback(() => {
    if (!emblaApi) return;

    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  // Initialize the carousel and listen for changes
  useEffect(() => {
    if (!emblaApi) return;

    updateCarousel();
    emblaApi.on("select", updateCarousel);
    emblaApi.on("reInit", updateCarousel);

    return () => {
      emblaApi.off("select", updateCarousel);
      emblaApi.off("reInit", updateCarousel);
    };
  }, [emblaApi, updateCarousel]);

  const [selectedStoryIndex, setSelectedStoryIndex] = useState<null | number>(
    null
  );
  const [isViewingStory, setIsViewingStory] = useState(false);

  const openStory = (index: number, story: any) => {
    setSelectedStoryIndex(index);
    setIsViewingStory(true);
  };

  const closeStory = () => {
    setIsViewingStory(false);
  };

  const [addStoryModal, setAddStoryModal] = useState(false);
  const closeStoryModal = () => setAddStoryModal(false);

  return !isLoading ? (
    <div className="py-2 rounded-2xl relative ">
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
        open={addStoryModal}
        onClose={closeStoryModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <AddStory
          closeStoryModal={closeStoryModal}
          hasStory={hasStory}
          onStoryAdded={fetchStories}
        />
      </Modal>

      <div className="embla relative overflow-hidden rounded-2xl">
        {/* Previous Button */}
        {prevBtnEnabled && (
          <button
            onClick={scrollPrev}
            className=" cursor-pointer absolute left-0 top-3/8 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-md hidden md:flex items-center justify-center hover:bg-gray-100 transition-all"
          >
            <ChevronLeftIcon className="text-gray-700" />
          </button>
        )}

        <div className="embla__viewport overflow-hidden" ref={emblaRef}>
          <div className="embla__container flex gap-1 sm:gap-2">
            {/* Add Story Slide */}
            <div className="embla__slide flex-shrink-0 min-w-0 pl-2">
              <div
                onClick={() => {
                  if (hasStory) {
                    toast.error("You can only post one story at a time.");
                    return;
                  }
                  setAddStoryModal(true);
                }}
                className="cursor-pointer relative flex flex-col items-center justify-center"
              >
                <div className="bg-gradient-to-tr from-blue-400 to-purple-500 h-35 w-35 md:h-40 md:w-40  bg-gray-200 rounded-2xl ">
                  {currentUser?.avatar &&
                  !currentUser.avatar.includes(
                    "https://lh3.googleusercontent.com/"
                  ) ? (
                    <img
                      src={currentUser.avatar}
                      alt="User Avatar"
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-2xl bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-7xl font-semibold text-blue-400 dark:text-accent">
                        {currentUser?.firstName?.[0]?.toUpperCase()}
                        {currentUser?.lastName?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="w-full flex flex-col items-center">
                  <button className="outline-3  outline-secondaryBg cursor-pointer -translate-y-5 w-10 h-10 bg-[#283891] hover:bg-[#4053BD] rounded-full drop-shadow-[0_0_7px_rgba(0,43,255,0.7)] hover:drop-shadow-[0_0_10px_rgba(0,43,255,0.7)] transition-all duration-300 flex items-center justify-center">
                    <AddOutlinedIcon className="text-white scale-130" />
                  </button>
                  <h1 className="text-sm -mt-1">Add Story</h1>
                </div>
              </div>
            </div>

            {/* User Stories */}
            {allStories?.length === 0 ? (
              <div className="flex flex-col items-center justify-center w-full mb-10 mx-2">
                <h2 className="text-lg font-semibold text-gray-600">
                  No Stories Yet
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  You haven't added any friends or stories yet.
                </p>
              </div>
            ) : (
              allStories?.map((story, index) => (
                <div
                  className="embla__slide flex-shrink-0 min-w-0 pl-2"
                  key={story._id}
                >
                  <div
                    onClick={() => openStory(index, story)}
                    className="cursor-pointer relative flex flex-col items-center justify-center"
                  >
                    <div
                      className={`${story.textStyle.background} h-35 w-35 md:h-40 md:w-40  rounded-2xl`}
                    >
                      {story.Type_Of_Story == "image" && (
                        <img
                          src={story.media}
                          alt="Story Media"
                          className="object-cover h-full w-full rounded-2xl"
                        />
                      )}
                    </div>
                    <div className="w-full flex flex-col items-center">
                      <button className="-translate-y-5 w-11 h-11 rounded-full outline-4 outline-[#506AFF] flex items-center justify-center">
                        <div className="w-10 h-10 bg-blue-300 rounded-full flex-shrink-0 overflow-hidden">
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
                              <span className="text-lg font-semibold text-blue-400 dark:text-accent">
                                {story.user?.firstName?.[0]?.toUpperCase()}
                                {story.user?.lastName?.[0]?.toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                      <h1 className="text-sm -mt-1">
                        {story.user._id == currentUser._id
                          ? "Your Story"
                          : story.user.username}
                      </h1>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Next Button */}
        {nextBtnEnabled && (
          <button
            onClick={scrollNext}
            className="cursor-pointer absolute right-0 top-3/8 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-md hidden md:flex  items-center justify-center hover:bg-gray-100 transition-all"
          >
            <ChevronRightIcon className="text-gray-700" />
          </button>
        )}

        <Modal
          open={isViewingStory}
          onClose={() => setIsViewingStory(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <StoryViewer
            initialIndex={selectedStoryIndex}
            onClose={closeStory}
            storyData={allStories}
            refreshStories={fetchStories}
            setAllStories={setAllStories}
          />
        </Modal>
      </div>
    </div>
  ) : (
    <div className="py-2 rounded-2xl relative ">
      <div className="embla relative overflow-hidden rounded-2xl">
        <div className="embla__viewport overflow-hidden" ref={emblaRef}>
          <div className="embla__container flex gap-1 sm:gap-2">
            {/* Add Story Slide */}
            <div className="embla__slide flex-shrink-0 min-w-0 pl-2">
              <div className="cursor-pointer relative flex flex-col items-center justify-center">
                <div className="h-[140px] w-[140px] md:h-[160px] md:w-[160px] rounded-2xl overflow-hidden">
                  <Skeleton
                    animation="wave"
                    variant="rectangular"
                    width="100%"
                    height="100%"
                  />
                </div>

                <div className="w-full flex flex-col items-center">
                  <button className="-translate-y-5 w-11 h-11 rounded-full flex items-center justify-center">
                    <div className=" w-11 h-11 rounded-full flex-shrink-0 overflow-hidden">
                      <Skeleton
                        animation="wave"
                        variant="rectangular"
                        width="100%"
                        height="100%"
                      />
                    </div>
                  </button>
                  <Skeleton
                    animation="wave"
                    variant="rectangular"
                    sx={{ width: 55 }}
                    className="-mt-2"
                  />
                </div>
              </div>
            </div>

            {/* User Stories */}
            {users.map((_, index) => (
              <div
                className="embla__slide flex-shrink-0 min-w-0 pl-2"
                key={index}
              >
                <div className="cursor-pointer relative flex flex-col items-center justify-center">
                  <div className="h-[140px] w-[140px] md:h-[160px] md:w-[160px] rounded-2xl overflow-hidden">
                    <Skeleton
                      animation="wave"
                      variant="rectangular"
                      width="100%"
                      height="100%"
                    />
                  </div>

                  <div className="w-full flex flex-col items-center">
                    <button className="-translate-y-5 w-11 h-11 rounded-full flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full flex-shrink-0 overflow-hidden">
                        <Skeleton
                          animation="wave"
                          variant="rectangular"
                          width="100%"
                          height="100%"
                        />
                      </div>
                    </button>
                    <Skeleton
                      animation="wave"
                      variant="rectangular"
                      sx={{ width: 55 }}
                      className="-mt-2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stories;
