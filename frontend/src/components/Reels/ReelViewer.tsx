import { useState, useEffect } from "react";
import { Close } from "@mui/icons-material";

import ApartmentIcon from "@mui/icons-material/Apartment";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import PublicIcon from "@mui/icons-material/Public";
import GroupIcon from "@mui/icons-material/Group";
import SchoolIcon from "@mui/icons-material/School";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FavoriteIcon from "@mui/icons-material/Favorite";

//Componenets
import CommentModal from "./CommentModal";

//Utils
import { postComment } from "../../utils/postComment";

import { formatDistanceToNow } from "date-fns";

import { useTheme, useUserStore } from "../../global/mode";

//Toaster
import toast, { Toaster } from "react-hot-toast";

interface ReelViewerProps {
  data: any;
  setReelData: any;
  onClose: () => void;
}

const ReelViewer: React.FC<ReelViewerProps> = ({
  data,
  onClose,
  setUserReels,
}) => {
  const [isLiked, setIsLiked] = useState();
  const { isDarkMode } = useTheme();
  const { deleteReel, error, currentUser, likeReel } = useUserStore();
  //Comment
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentData, setCommentData] = useState(0);

  //Video
  const [showPlayPause, setShowPlayPause] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const handleLikeReel = async () => {
    const updateReel = await likeReel(data._id);

    if (!updateReel) return;

    setUserReels((prevReels: any[]) =>
      prevReels.map((r) =>
        r._id === data._id ? { ...r, likes: updateReel.likes } : r
      )
    );

    // Immediately update local isLiked state
    setIsLiked(updateReel.likes.includes(currentUser?._id));
  };

  useEffect(() => {
    setIsLiked(data.likes.includes(currentUser?._id));
  }, [data.likes, currentUser?._id]);

  useEffect(() => {
    const videoElement = document.getElementById("video") as HTMLVideoElement;
    if (videoElement) {
      videoElement.play();
      setIsPlaying(true);
    }
  }, []);

  const handleTogglePay = () => {
    const videoElement = document.getElementById("video") as HTMLVideoElement;

    if (videoElement) {
      if (videoElement.paused) {
        videoElement.play();
        setIsPlaying(true);
      } else {
        videoElement.pause();
        setIsPlaying(false);
      }

      setShowPlayPause(true);
      setTimeout(() => setShowPlayPause(false), 500);
    }
  };

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

  const handleToggleMute = () => {
    const videoElement = document.getElementById("video") as HTMLVideoElement;
    if (videoElement) {
      videoElement.muted = !videoElement.muted;
      setIsMuted(videoElement.muted);
    }
  };

  // State for popover
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [popoverState, setPopoverState] = useState<{
    anchorEl: HTMLElement | null;
    postId: string | null;
  }>({ anchorEl: null, postId: null });

  const handleClickPopOver = (
    event: React.MouseEvent<HTMLElement>,
    postId: string
  ) => {
    event.stopPropagation();
    setOpenPopoverId(openPopoverId === postId ? null : postId);
  };

  const handleClosePopOver = () => {
    setOpenPopoverId(null);
    setPopoverState({ anchorEl: null, postId: null });
  };

  const handleDeleteReel = async (reelId: string) => {
    await deleteReel(reelId);
    setUserReels((prev: any) => prev.filter((reel: any) => reel._id != reelId));
    if (error) {
      toast.error("Failed to delete the reel. Please try again.");
    } else {
      toast.success("Reel successfully deleted.");
    }
    onClose();
  };
  return (
    <div className="relative z-50  bg-primaryBg  rounded-3xl overflow-y-scroll scrollComment  flex justify-center items-center  ">
      <div className="flex flex-col overflow-x-visible gap-5 h-[90vh]  ">
        {currentUser?._id === data.user._id && (
          <button
            onClick={(event) => {
              handleClickPopOver(event, data._id);
            }}
            className=" absolute top-3 sm:top-5 right-12 sm:right-14  text-primary cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded-full transition-all duration-200 ease-in-out"
          >
            <MoreHorizIcon />
          </button>
        )}
        {openPopoverId === data._id && (
          <div
            className="cursor-pointer absolute right-16 top-10 md:top-12 z-50 w-28 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 popover-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* <button
              onClick={() => {
                handleClosePopOver();
              }}
              className="cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center gap-2"
            >
              <EditIcon fontSize="small" />
              Edit
            </button> */}
            <button
              onClick={() => {
                handleDeleteReel(data._id);
                handleClosePopOver();
              }}
              className="cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center gap-2 text-red-500"
            >
              <DeleteIcon fontSize="small" />
              Delete
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className=" absolute top-3 sm:top-5 right-3 sm:right-5 text-primary cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded-full transition-all duration-200 ease-in-out"
        >
          <Close />
        </button>
        <div className="  cursor-pointer flex justify-center items-center flex-grow  text-primary  ">
          <div className="mt-20 w-[300px] px-5 sm:px-0  bg-primaryBg  rounded-2xl relative flex justify-center items-center">
            {/* Comment Section */}
            <div
              key={Date.now()}
              className={`commentSectionMobile-viewer  reelviewComment px-5 sm:px-0 z-3  absolute `}
            >
              {commentOpen && (
                <CommentModal
                  reelData={data}
                  commentOpen={commentOpen}
                  setCommentOpen={setCommentOpen}
                  isReelViewer={true}
                />
              )}
            </div>

            {showPlayPause && (
              <div className="absolute inset-0 top-20 flex items-center justify-center z-20">
                <div className="bg-black bg-opacity-60 rounded-full p-4 play-pause-indicator">
                  {isPlaying ? (
                    <PauseIcon
                      className="text-white"
                      style={{ fontSize: "2rem" }}
                    />
                  ) : (
                    <PlayArrowIcon
                      className="text-white"
                      style={{ fontSize: "2rem" }}
                    />
                  )}
                </div>
              </div>
            )}

            <div className="bg-gray-900 h-full ">
              <video
                id="video"
                src={data.videoUrl}
                preload="auto"
                className="z-0 h-full  rounded-2xl object-cover "
                loop
                playsInline
                onClick={handleTogglePay}
              >
                Your browser does not suppoort the video tag.
              </video>
            </div>
            {/* Right side action buttons */}
            <div className="absolute right-7 sm:right-3 lg:-right-12 bottom-8 flex flex-col gap-5 items-center">
              <button
                onClick={handleLikeReel}
                className="cursor-pointer text-white lg:text-primary hover:text-red-500 transition-all duration-300 ease-in-out transform hover:scale-110 "
              >
                {isLiked ? (
                  <FavoriteIcon fontSize="medium" className="text-red-500" />
                ) : (
                  <FavoriteBorderIcon fontSize="medium" />
                )}
              </button>

              <button
                onClick={() => {
                  setCommentOpen((prev) => !prev);
                  setCommentData(data);
                }}
                className="cursor-pointer text-white lg:text-primary hover:text-blue-400 transition-all duration-300 ease-in-out transform hover:scale-110 "
              >
                <ChatBubbleOutlineRoundedIcon fontSize="medium" />
              </button>
              {/* <button className="cursor-pointer text-white lg:text-primary hover:text-green-400 transition-all duration-300 ease-in-out transform hover:scale-110 ">
                <ShareOutlinedIcon fontSize="medium" />
              </button> */}
              <button
                onClick={handleToggleMute}
                className="cursor-pointer text-white lg:text-primary hover:text-customGray transition-all duration-300 ease-in-out transform hover:scale-110 "
              >
                {isMuted ? (
                  <VolumeOffIcon fontSize="medium" />
                ) : (
                  <VolumeUpIcon fontSize="medium" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* User info at the bottom */}
        <div className="w-[300px] px-5 pr-8 sm:px-0 pb-10 text-primary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-400 rounded-full">
              {data.user?.avatar &&
              !data.user.avatar.includes(
                "https://lh3.googleusercontent.com/"
              ) ? (
                <img
                  src={data.user.avatar}
                  alt="User Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-xl font-semibold text-blue-400 dark:text-accent">
                    {data.user?.firstName?.[0]?.toUpperCase()}
                    {data.user?.lastName?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h1 className="font-medium text-sm text-primary">
                {data.user.firstName} {data.user.lastName}
              </h1>
              <div className="-mt-1 flex items-center text-customGray">
                <p className="text-xs">@{data.user.username}</p>
                <span className="mx-1 text-sm">•</span>
                <div>{getVisibilityIcon(data.visibility)}</div>
              </div>
            </div>
            <p className="text-xs text-customGray self-start mt-[3px] ml-auto">
              {formatDistanceToNow(new Date(data.createdAt), {
                addSuffix: true,
              }).replace("about ", "")}
            </p>
          </div>

          {/* Description with See More */}
          <div className="mt-3 max-w-50 ">
            <p className="text-sm flex-grow text-primary">{data.caption}</p>

            <div className="flex  flex-col mt-3">
              {/* Course badge */}
              {data.relatedCourse && (
                <div className=" flex items-center gap-1 px-2 pr-3 py-1 mr-1 rounded-full   bg-gray-900/40 text-xs">
                  <SchoolIcon className=" scale-70" />
                  <span>{data.relatedCourse}</span>
                </div>
              )}
              {data.tags && (
                <div className="flex items-center gap-1 flex-wrap ">
                  {data.tags.map((tag: string) => (
                    <div
                      key={tag}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full  bg-gray-900/10 dark:bg-gray-900/40 "
                    >
                      #{tag}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* <div
        key={Date.now()}
        className=" hidden commentSectionDesktop  z-3  absolute  items-start "
      >
        {commentOpen && (
          <CommentModal
            commentData={commentData}
            setCommentData={setCommentData}
            commentOpen={commentOpen}
            setCommentOpen={setCommentOpen}
          />
        )}
      </div> */}
    </div>
  );
};

export default ReelViewer;
