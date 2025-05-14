import { useState, useEffect } from "react";
import Logo from "../assets/Logo.png";

import { Link, useNavigate, useLocation } from "react-router-dom";

//Icons
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";

import { useTheme, useUserStore } from "../global/mode";

//MUI
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Tooltip from "@mui/material/Tooltip";
import Logout from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import Skeleton from "@mui/material/Skeleton";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import { formatDistanceToNow } from "date-fns";

const Navbar = () => {
  const {
    currentUser,
    getAllNotifications,
    logout,
    deleteNotification,
    deleteAllNotifications,
  } = useUserStore();

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const isAuthRoute =
    location.pathname === "/signin" || location.pathname === "/signup";

  useEffect(() => {
    fetchNotifications();
  }, []);

  const { isDarkMode, toggleTheme } = useTheme();
  const [search, setSearch] = useState("");
  const clearSearch = () => setSearch("");

  // Fetch notifications when user opens the notification menu
  const fetchNotifications = async () => {
    if (currentUser?._id) {
      setIsLoading(true);
      const notifs = await getAllNotifications(currentUser._id);
      if (notifs) {
        setNotifications(notifs);
      }

      // Filter out self-notifications
      const filtered = notifs.filter(
        (notif: any) => notif.sender?._id !== currentUser._id
      );
      setNotifications(filtered);

      setIsLoading(false);
    }
  };

  //Profile Popup
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  //Notif Popup
  const [anchorNotif, setAnchorNotif] = useState<null | HTMLElement>(null);
  const notifOpen = Boolean(anchorNotif);
  const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorNotif(event.currentTarget);
    fetchNotifications();
  };

  const handleCloseNotif = () => {
    setAnchorNotif(null);
  };

  const handleSearch = () => {
    if (search) {
      navigate(`/search/${search}`);
    }
  };

  const getNotificationMessage = (type: string, referenceType: string) => {
    switch (type) {
      case "follow":
        return "started following you";
      case "like":
        return `liked your ${referenceType.toLowerCase()}`;
      case "comment":
        return `commented on your ${referenceType.toLowerCase()}`;
      case "share":
        return `shared your ${referenceType.toLowerCase()}`;
      default:
        return "sent you a notification";
    }
  };

  return (
    // dark:bg-secondaryBg
    <nav className="sticky top-0 z-50 bg-secondaryBg grid grid-cols-15 justify-between p-3 md:px-10 lg:px-5 shadow-none dark:shadow-sm md:gap-10 w-full">
      <Link
        to={isAuthRoute ? "/signin" : "/"}
        className="flex items-center gap-3 col-span-3 md:col-span-3 mr-2 sm:mr-0"
      >
        <img src={Logo} alt="Logo" className="w-12 sm:w-15" />
        <h1 className="font-semibold hidden sm:block lg:text-lg">AdNUVerse</h1>
      </Link>

      {/* Search */}
      {!isAuthRoute && (
        <div className="relative mr-1 sm:ml-13 px-2 sm:px-3 lg:mx-15 col-span-9 items-center justify-between rounded-md flex bg-[#e5ecff] dark:bg-[#2A2D34]">
          <div className="flex items-center w-full">
            <input
              type="text"
              placeholder="#Explore"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="focus:outline-0 w-full pl-2 text-sm sm:text-base py-2"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>
          {search && (
            <CloseRoundedIcon
              className="cursor-pointer hover:text-primary text-customGray mr-7 md:mr-9 transition-all duration-200 ease-in-out"
              onClick={clearSearch}
            />
          )}

          <div
            onClick={handleSearch}
            className="cursor-pointer bg-gray-300/70 hover:bg-gray-300 dark:bg-gray-700/50 dark:hover:bg-gray-700 p-1 absolute right-0 rounded-r-md transition-all duration-200 ease-in-out md:px-2"
          >
            <SearchRoundedIcon className="text-customGray scale-90 sm:scale-100" />
          </div>
        </div>
      )}

      {/* Profile */}
      <div
        className={`flex items-center justify-end gap-2 ${
          isAuthRoute ? "col-span-12" : "col-span-3 sm:col-span-3"
        }`}
      >
        <Tooltip title="Theme" className="hidden sm:block">
          {isDarkMode ? (
            <button onClick={toggleTheme} className="cursor-pointer">
              <LightModeIcon className="text-amber-400" />
            </button>
          ) : (
            <button onClick={toggleTheme} className="cursor-pointer">
              <DarkModeIcon className="text-blue-900" />
            </button>
          )}
        </Tooltip>

        {!isAuthRoute && (
          <Tooltip title="Notifications">
            <button
              onClick={handleNotifClick}
              className="cursor-pointer relative"
            >
              <NotificationsOutlinedIcon className="text-gray-600 dark:text-[#DFDFDF]" />
              {notifications.length > 0 && (
                <div className="bg-accent w-2 h-2 rounded-full absolute top-[5px] right-[2px] translate-x-1/2 -translate-y-1/2"></div>
              )}
            </button>
          </Tooltip>
        )}

        {isAuthRoute && (
          <Tooltip title="Theme" className="sm:hidden">
            {isDarkMode ? (
              <button onClick={toggleTheme} className="cursor-pointer">
                <LightModeIcon className="text-amber-400" />
              </button>
            ) : (
              <button onClick={toggleTheme} className="cursor-pointer">
                <DarkModeIcon className="text-blue-900" />
              </button>
            )}
          </Tooltip>
        )}

        {!isAuthRoute && (
          <Tooltip title="Account settings">
            <div>
              <div
                onClick={handleClick}
                className="w-7 h-7 bg-gray-500 rounded-full cursor-pointer flex-shrink-0 hidden lg:block"
              >
                {currentUser?.avatar &&
                !currentUser.avatar.includes(
                  "https://lh3.googleusercontent.com/"
                ) ? (
                  <img
                    src={currentUser.avatar}
                    alt="User Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-400 dark:text-accent">
                      {currentUser?.firstName?.[0]?.toUpperCase()}
                      {currentUser?.lastName?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div
                onClick={handleClick}
                className="block lg:hidden cursor-pointer"
              >
                <MenuIcon />
              </div>
            </div>
          </Tooltip>
        )}

        <Menu
          disableScrollLock={true}
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                overflow: "visible",
                bgcolor: isDarkMode ? "#232323" : "#f0f5ff",
                color: isDarkMode ? "white" : "black",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1.5,
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                "&::before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: isDarkMode ? "#232323" : "#f0f5ff",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
                "& .MuiMenuItem-root:hover": {
                  backgroundColor: isDarkMode ? "#333333" : "#e0e7ff",
                },
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          className="ml-1 md:ml-1"
        >
          <Link to="/profile">
            <MenuItem onClick={handleClose}>
              <div className="flex items-center">
                <div className="mr-2 w-7 h-7 bg-gray-500 rounded-full cursor-pointer flex-shrink-0 lg:block">
                  {currentUser?.avatar &&
                  !currentUser.avatar.includes(
                    "https://lh3.googleusercontent.com/"
                  ) ? (
                    <img
                      src={currentUser.avatar}
                      alt="User Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-400 dark:text-accent">
                        {currentUser?.firstName?.[0]?.toUpperCase()}
                        {currentUser?.lastName?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                Profile
              </div>
            </MenuItem>
          </Link>

          <Link to="/signin">
            <MenuItem
              onClick={() => {
                handleClose();
                logout();
              }}
            >
              <ListItemIcon>
                <Logout className="text-primary" fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Link>

          <div onClick={toggleTheme} className="sm:hidden">
            <MenuItem>
              <ListItemIcon>
                {isDarkMode ? (
                  <button className="cursor-pointer">
                    <LightModeIcon className="text-amber-400" />
                  </button>
                ) : (
                  <button className="cursor-pointer">
                    <DarkModeIcon className="text-blue-900" />
                  </button>
                )}
              </ListItemIcon>
              Theme
            </MenuItem>
          </div>
        </Menu>

        <Menu
          disableScrollLock={true}
          anchorEl={anchorNotif}
          id="notification"
          open={notifOpen}
          onClose={handleCloseNotif}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                overflow: "visible",
                bgcolor: isDarkMode ? "#232323" : "#f0f5ff",
                color: isDarkMode ? "white" : "black",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1.5,
                borderRadius: "8px",
                padding: "8px 0",
                width: "300px",
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                  borderRadius: "50%",
                },
                "&::before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: isDarkMode ? "#232323" : "#f0f5ff",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
                "& .MuiMenuItem-root:hover": {
                  backgroundColor: isDarkMode ? "#333333" : "#e0e7ff",
                  transition: "background-color 0.2s ease-in-out",
                },
                "& .MuiMenuItem-root": {
                  padding: "10px 15px",
                  fontSize: "14px",
                },
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          className="mr-8 ml-2"
        >
          <div className="overflow-y-scroll scrollComment h-[60vh]">
            <div className="flex items-center justify-between mb-5 ">
              <h1 className="px-4 font-semibold md:text-lg">Notifications</h1>

              {notifications.length > 0 && (
                <div className="flex justify-end px-2">
                  <button
                    onClick={async () => {
                      await deleteAllNotifications(currentUser?._id);
                      fetchNotifications();
                    }}
                    className="text-xs text-red-500 hover:bg-red-400/10 p-1 rounded-md cursor-pointer flex items-center  gap-1"
                  >
                    <DeleteSweepIcon className="scale-90" />
                    Clear All
                  </button>
                </div>
              )}
            </div>
            {isLoading ? (
              // Loading skeletons
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <MenuItem key={`skeleton-${index}`}>
                    <div className="flex items-center gap-3 text-sm w-full">
                      <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden">
                        <Skeleton
                          animation="wave"
                          variant="rectangular"
                          width="100%"
                          height="100%"
                        />
                      </div>
                      <div className="text-xs min-w-0">
                        <div className="w-50 h-4 flex-shrink-0 overflow-hidden">
                          <Skeleton
                            animation="wave"
                            variant="rectangular"
                            width="100%"
                            height="100%"
                          />
                        </div>
                        <div className="w-30 mt-1 h-4 flex-shrink-0 overflow-hidden">
                          <Skeleton
                            animation="wave"
                            variant="rectangular"
                            width="100%"
                            height="100%"
                          />
                        </div>
                        <div className="w-20 mt-1 h-3 flex-shrink-0 overflow-hidden">
                          <Skeleton
                            animation="wave"
                            variant="rectangular"
                            width="100%"
                            height="100%"
                          />
                        </div>
                      </div>
                    </div>
                  </MenuItem>
                ))
            ) : notifications.length > 0 ? (
              // Actual notifications
              notifications.map((item) => (
                <MenuItem key={item._id}>
                  <div className="flex items-center gap-3 text-sm w-full justify-between">
                    <div className="flex gap-3 w-full">
                      {item.sender?.avatar &&
                      !item.sender.avatar.includes(
                        "https://lh3.googleusercontent.com/"
                      ) ? (
                        <img
                          src={item.sender.avatar}
                          alt="User Avatar"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-lg font-semibold text-blue-400 dark:text-accent">
                            {item.sender?.firstName?.[0]?.toUpperCase()}
                            {item.sender?.lastName?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="text-xs min-w-0">
                        <p className="font-semibold break-words whitespace-normal overflow-hidden">
                          <span className="text-sm text-blue-500 dark:text-accent">
                            {item.sender?.firstName} {item.sender?.lastName}
                          </span>{" "}
                          {getNotificationMessage(
                            item.type,
                            item.reference?.type || ""
                          )}
                        </p>
                        <p className="text-gray-400">
                          {formatDistanceToNow(new Date(item.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={async () => {
                        await deleteNotification(item._id);
                        fetchNotifications(); // call from useUserStore
                      }}
                      className="text-xs text-primary hover:text-red-400 hover:underline cursor-pointer mb-2"
                    >
                      <DeleteOutlineIcon className="scale-90" />
                    </button>
                  </div>
                </MenuItem>
              ))
            ) : (
              // No notifications
              <div className="px-4 py-2 text-gray-500 text-center">
                No notifications yet
              </div>
            )}
          </div>
        </Menu>
      </div>
    </nav>
  );
};

export default Navbar;
