import React from "react";
import CloseIcon from "@mui/icons-material/Close";
interface PostReelsPreviewProps {
  videoReel: { file: File; type: string; preview: string };
  setVideoReelEmpty: any;
}

const PostReelsPreview: React.FC<PostReelsPreviewProps> = ({
  videoReel,
  setVideoReelEmpty,
}) => {
  return (
    <div>
      <div className="w-full flex items-center justify-center  mt-3 gap-2 overflow-x-auto py-2">
        <div className="relative ">
          <video
            src={videoReel.preview}
            className="h-100 sm:h-120 w-full rounded-md object"
            controls
          >
            Your browser does not support video tag
          </video>

          <button
            onClick={() => setVideoReelEmpty()}
            className="cursor-pointer absolute top-1 right-1 bg-gray-800/80 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostReelsPreview;
