import { useEffect, useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useTheme, useUserStore } from "../../global/mode";
import PlayCircleFilledWhiteOutlinedIcon from "@mui/icons-material/PlayCircleFilledWhiteOutlined";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";

//MUI
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

import ReelViewer from "../Reels/ReelViewer";

//MUI
import Skeleton from "@mui/material/Skeleton";

const ProfileReels = ({ userId }) => {
  const { currentUser, getUserReels, addReelViews } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [userReels, setUserReels] = useState();
  const [hasReels, setHasReels] = useState(false);

  useEffect(() => {
    const fetchUserReels = async () => {
      try {
        const reels = await getUserReels(userId); // Await the async function
        setUserReels(reels); // Update state
        setHasReels(reels?.length > 0); // Determine if there are reels
      } catch (err) {
        console.error("Failed to fetch user reels", err);
      } finally {
        setIsLoading(false); // Ensure loading is disabled
      }
    };
    fetchUserReels();
  }, []);

  const [reelViewVisible, setReelViewVisible] = useState(false);
  const handleOpenReel = () => setReelViewVisible(true);
  const handleCloseReel = () => setReelViewVisible(false);
  const [reelData, setReelData] = useState(0);

  const [sort, setSort] = useState("newest");
  const { isDarkMode } = useTheme();

  const handleChange = (event: SelectChangeEvent) => {
    setSort(event.target.value);
  };

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

  return !isLoading ? (
    <div className="relative mt-7 md:mt-10 bg-secondaryBg rounded-xl p-4 md:p-6 ">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <h1 className="font-semibold sm:mb-5 text-lg md:text-xl">Reels</h1>

        {/* <label className="flex  items-center gap-3 ">
          <h1>Sort by:</h1>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <Select
              value={sort}
              variant={"standard"}
              onChange={handleChange}
              defaultValue="newest"
              displayEmpty
              inputProps={{ "aria-label": "Without label" }}
              sx={{
                color: isDarkMode ? "white" : "black",
                "& .MuiSelect-icon": { color: isDarkMode ? "white" : "black" },
              }}
              className="bg-blue-100 dark:bg-gray-700 p-2 px-3 rounded-md "
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: isDarkMode ? "#374151" : "white", // gray-700 for dark, white for light
                    color: isDarkMode ? "white" : "black",
                    "& .MuiMenuItem-root": {
                      "&:hover": {
                        bgcolor: isDarkMode ? "#4B5563" : "#E5E7EB", // gray-600 for dark, gray-200 for light
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value={"newest"}>Newest</MenuItem>
              <MenuItem value={"popularity"}>Popularity</MenuItem>
              <MenuItem value={"oldest"}>Oldest</MenuItem>
            </Select>
          </FormControl>
        </label> */}
      </div>
      {hasReels ? (
        <div className=" mt-7 grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3 lg:grid-cols-4 gap-5">
          {userReels.map((reel, index) => (
            <div
              onClick={() => {
                setReelData(reel);
                setReelViewVisible(true);
                addReelViews(reel._id);
              }}
              className="cursor-pointer"
              key={index}
            >
              <div className="dark:bg-gray-800 bg-blue-300/20 h-95 sm:h-85 w-full rounded-lg">
                <video
                  id={`video-${index}`}
                  src={reel.videoUrl}
                  preload="auto"
                  className="z-0 w-full h-full rounded-lg"
                  loop
                  playsInline
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="mt-3 flex flex-col">
                <h1 className="truncate pr-5 font-medium">{reel.caption}</h1>
                <div className="mt-1 flex gap-3 text-customGray text-sm">
                  <div className="flex gap-1 items-center">
                    <p>{reel.views}</p>
                    <VisibilityOutlinedIcon fontSize="small" />
                  </div>
                  <div className="flex gap-1 items-center">
                    <p>{reel.likes.length}</p>
                    <FavoriteBorderOutlinedIcon fontSize="small" />
                  </div>
                  <div className="flex gap-1 items-center">
                    <p>{reel.comments.length}</p>
                    <ChatBubbleOutlineOutlinedIcon fontSize="small" />
                  </div>
                </div>
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
                data={reelData}
                setReelData={setReelData}
                onClose={handleCloseReel}
                setUserReels={setUserReels}
              />
            </Box>
          </Modal>
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center justify-center text-center py-10">
          <div className="w-24 h-24 bg-gray-200 dark:bg-[#2C2C2C] rounded-full flex items-center justify-center mb-4">
            <PlayCircleFilledWhiteOutlinedIcon className="text-gray-400 scale-220" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Reels Yet</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            When this user shares reels, you’ll see them here.
          </p>
        </div>
      )}
    </div>
  ) : (
    <div className="relative mt-7 md:mt-10 bg-secondaryBg rounded-xl p-4 md:p-6 ">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div className="w-13 mb-5 h-7 flex-shrink-0 overflow-hidden">
          <Skeleton
            animation="wave"
            variant="rectangular"
            width="100%"
            height="100%"
          />
        </div>
        {/* 
        <label className="flex  items-center gap-3 ">
          <div className="w-16 mb-5 h-7 mt-4 flex-shrink-0 overflow-hidden">
            <Skeleton
              animation="wave"
              variant="rectangular"
              width="100%"
              height="100%"
            />
          </div>

          <div className="w-25 mb-5 h-11 mt-4 flex-shrink-0 overflow-hidden">
            <Skeleton
              animation="wave"
              variant="rectangular"
              width="100%"
              height="100%"
            />
          </div>
        </label> */}
      </div>

      <div className=" mt-7 grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3 lg:grid-cols-4 gap-5">
        {Array.from({ length: 12 }).map((_, index) => (
          <div className="cursor-pointer" key={index}>
            <div className=" h-95 sm:h-85 w-full rounded-lg flex-shrink-0 overflow-hidden">
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
                </div>{" "}
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
  );
};

export default ProfileReels;
