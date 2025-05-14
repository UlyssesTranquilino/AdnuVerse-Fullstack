import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";

import { useLocation, Link } from "react-router-dom";

import { useUserStore } from "../global/mode";

const MobileSidebar = () => {
  const { currentUser } = useUserStore();
  const location = useLocation();
  const currentPath = location.pathname;

  const sidebarItems = [
    {
      title: "Home",
      icon: <HomeOutlinedIcon className="scale-90" />,
      path: "/",
    },
    {
      title: "Reels",
      icon: <PlayCircleOutlinedIcon className="scale-90" />,
      path: "/reels",
    },
    {
      title: "Followers",
      icon: <GroupOutlinedIcon className="scale-90" />,
      path: "/followers",
    },
    {
      title: "Profile",
      icon: (
        <div className="w-6 h-6 bg-gray-500 rounded-full">
          {currentUser?.avatar && (
            <img
              src={currentUser.avatar}
              alt="User Profile"
              className="w-full h-full rounded-full object-cover"
            />
          )}
        </div>
      ),
      path: `/profile/${currentUser?._id}`, // update this based on your route
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-secondaryBg h-13 md:hidden">
      <div className="w-full flex items-center justify-around">
        {sidebarItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link key={item.title} to={item.path}>
              <div className="relative  flex items-center gap-2">
                {isActive && (
                  <div className="absolute bottom-1 h-1 w-full  bg-accent rounded-sm" />
                )}
                <div
                  className={`flex items-center gap-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-[#283443]  rounded-md w-full py-3 px-2  lg:pl-5 ${
                    isActive ? "text-accent" : "text-primary"
                  }`}
                >
                  {item.icon}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileSidebar;
