import React from "react";
import CloseIcon from "@mui/icons-material/Close";

const PostMediaPreview = ({ mediaUrls, setMediaUrls }) => {
  return (
    <div>
      <div
        className={`mt-3 items-center justify-center gap-3 overflow-x-auto pb-2 ${
          mediaUrls.length > 1 ? "grid grid-cols-1 sm:grid-cols-2" : "flex"
        }`}
      >
        {mediaUrls.map((item, index) => {
          const isVideo =
            typeof item === "string"
              ? item.includes(".mp4")
              : item.type?.includes("video");

          return (
            <div
              key={index}
              className="relative flex items-center justify-center object-cover h-full w-full"
            >
              {isVideo ? (
                <video
                  src={item.preview ? item.preview : item}
                  className="w-full h-full max-h-120 rounded-md"
                  controls
                />
              ) : (
                <img
                  src={item.preview ? item.preview : item}
                  className="w-full max-w-120 h-full rounded-md object-cover"
                  alt="Media preview"
                />
              )}
              <button
                onClick={() =>
                  setMediaUrls(mediaUrls.filter((_, i) => i !== index))
                }
                className="cursor-pointer absolute top-1 right-1 bg-gray-800/80 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <CloseIcon className="" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PostMediaPreview;
