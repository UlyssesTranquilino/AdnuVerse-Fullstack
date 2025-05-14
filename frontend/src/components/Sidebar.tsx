import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";

import { useLocation, Link } from "react-router-dom";

import { useUserStore } from "../global/mode";

const Sidebar = () => {
  const { currentUser } = useUserStore();
  const location = useLocation();
  const currentPath = location.pathname;

  const sidebarItems = [
    {
      title: "Home",
      icon: <HomeOutlinedIcon className="scale-120 lg:scale-100" />,
      path: "/",
    },
    {
      title: "Reels",
      icon: <PlayCircleOutlinedIcon className="scale-120 lg:scale-100" />,
      path: "/reels",
    },
    {
      title: "Followers",
      icon: <GroupOutlinedIcon className="scale-120 lg:scale-100" />,
      path: "/followers",
    },
    {
      title: "Following",
      icon: <PersonAddAltOutlinedIcon className="scale-120 lg:scale-100" />,
      path: "/following",
    },
  ];
  return (
    <div className="sticky top-22 z-50 rounded-md md:flex flex-col items-center  gap-5 ">
      {" "}
      <Link to={`/profile/${currentUser?._id}`} className={`w-full relative `}>
        {currentPath == `/profile/${currentUser?._id}` && (
          <div className="hidden sm:flex absolute sm:right-8 md:left-1 w-1 lg:w-2 h-12 mt-2 bg-accent rounded-sm" />
        )}
        <div
          className={`pl-6 w-full cursor-pointer bg-secondaryBg rounded-md flex items-center gap-3 p-3 `}
        >
          <div className="w-10 h-10 bg-gray-500 rounded-sm ml-1 lg:mx-0 flex-shrink-0">
            {currentUser?.avatar &&
            !currentUser.avatar.includes(
              "https://lh3.googleusercontent.com/"
            ) ? (
              <img
                src={currentUser.avatar}
                alt="User Avatar"
                className="w-full h-full rounded-sm object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-sm bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-xl font-semibold text-blue-400 dark:text-accent">
                  {currentUser?.firstName?.[0]?.toUpperCase()}
                  {currentUser?.lastName?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold ">
              {currentUser?.firstName} {currentUser?.lastName}
            </h1>
            <p className="text-sm -mt-1 ">@{currentUser?.username}</p>
          </div>
        </div>
      </Link>
      <div className="w-full  md:items-center lg:items-start bg-secondaryBg rounded-md flex flex-col  gap-2 p-3 py-5">
        {sidebarItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.title}
              to={item.path}
              className="w-full flex items-center "
            >
              <div className="relative flex items-center gap-2 w-full ">
                {isActive && (
                  <div className="hidden sm:flex absolute sm:right-8 md:left-1 w-1 lg:w-2 h-6 lg:h-8 bg-accent rounded-sm" />
                )}
                <div
                  className={`flex items-center gap-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-[#283443] rounded-md w-full py-3 md:pl-6 ${
                    isActive
                      ? "text-accent bg-blue-100 dark:bg-[#283443]"
                      : "text-primary"
                  }`}
                >
                  {item.icon}
                  <h1 className="text-sm md:text-base hidden lg:block ">
                    {item.title}
                  </h1>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
