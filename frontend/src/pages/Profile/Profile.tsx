import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTheme, useUserStore } from "../../global/mode";

// Icons and Components
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PlayCircleFilledWhiteOutlinedIcon from "@mui/icons-material/PlayCircleFilledWhiteOutlined";
import Sidebar from "../../components/Sidebar";
import MobileSidebar from "../../components/MobileSidebar";
import ProfileDetails from "../../components/Profile/ProfileDetails";
import Organizations from "../../components/Profile/Organizations";
import Post from "../../components/Home/Post";
import ProfileFeed from "../../components/Profile/ProfileFeed";
import ProfileFollowing from "../../components/Profile/ProfileFollowing";
import ProfileFollowers from "../../components/Profile/ProfileFollowers";
import ProfileReels from "../../components/Profile/ProfileReels";
import AddStory from "../../components/Story/AddStory";

// MUI Components
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Skeleton from "@mui/material/Skeleton";
import Modal from "@mui/material/Modal";

// Utils and Toaster
import toast, { Toaster } from "react-hot-toast";
import { uploadFile } from "../../utils/cloudinary";

const Profile = () => {
  const { isDarkMode } = useTheme();
  const { userId } = useParams(); // Get userId from URL params
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "About";

  const {
    currentUser,
    updateUser,
    following,
    followers,
    getAllPost,
    getAllStories,
    fetchUserById,
    followUser,
    unfollowUser,
    getOtherFollowers,
    getOtherFollowing,
    getAllFollowing,
    getAllFollowers,
    changePassword,
  } = useUserStore();

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const closeEditProfile = () => setEditProfileOpen(false);

  // All User's Posts
  const [allUserPost, setAllUserPost] = useState<any[]>([]);

  const [profileUser, setProfileUser] = useState(currentUser); // User whose profile is being viewed
  const [isCurrentUserProfile, setIsCurrentUserProfile] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  const [totalFollowers, setTotalFollowers] = useState([]);
  const [totalFollowing, setTotalFollowing] = useState([]);

  // Check if this is the current user's profile
  useEffect(() => {
    const checkProfileOwner = async () => {
      try {
        const followerCount = await getOtherFollowers(
          userId ?? currentUser?._id
        );
        setTotalFollowers(followerCount);

        const followingCount = await getOtherFollowing(
          userId ?? currentUser?._id
        );
        setTotalFollowing(followingCount);

        if (userId && userId !== currentUser?._id) {
          const userData = await fetchUserById(userId);

          const allFollowers = await getAllFollowers(userId);

          const isFollowed = allFollowers.some((user: any) =>
            user.following?.includes(userId)
          );

          setIsFollowing(isFollowed);

          setProfileUser(userData);
          setIsCurrentUserProfile(false);
        } else {
          setProfileUser(currentUser);
          setIsCurrentUserProfile(true);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Error loading profile data");
      } finally {
        setLoadingProfile(false);
      }
    };

    checkProfileOwner();
  }, [userId, currentUser, fetchUserById, following]); // Added 'following' to dependencies

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const posts = await getAllPost(profileUser._id); // Await the async function

        if (posts) {
          setAllUserPost(posts); // Set posts if not null
        } else {
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, [userId]);

  // Initialize profileBar state based on URL
  const [profileBar, setProfileBar] = useState([
    { name: "About", active: activeTab === "About" },
    { name: "Reels", active: activeTab === "Reels" },
    { name: "Followers", active: activeTab === "Followers" },
    { name: "Following", active: activeTab === "Following" },
  ]);

  // Update URL when tab changes
  const toggleTab = (tab: string) => {
    setSearchParams({ tab });
    setProfileBar((prev) =>
      prev.map((item) => ({
        ...item,
        active: item.name === tab,
      }))
    );
  };

  //Refreshing when user Posted
  const [refreshFeed, setRefreshFeed] = useState(false);

  const handlePostCreated = () => {
    setRefreshFeed((prev) => !prev); // Toggle to trigger re-fetch
  };

  const fetchStories = useCallback(async () => {
    const stories = await getAllStories();

    if (!stories || !currentUser) return;

    setHasStory(
      stories.some((story: any) => story.user._id === currentUser._id)
    );
  }, [getAllStories, currentUser]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const [hasStory, setHasStory] = useState(false);

  const [firstName, setFirstName] = useState(currentUser?.firstName);
  const [lastName, setLastName] = useState(currentUser?.lastName);
  const [isFocused, setIsFocused] = useState(false);
  const [userName, setUserName] = useState(currentUser?.username);
  const [bio, setBio] = useState(currentUser?.bio);
  const [email, setEmail] = useState(currentUser?.email);
  const [role, setRole] = useState(currentUser?.role);
  const [department, setDepartment] = useState(
    currentUser?.department ? currentUser?.department : ""
  );
  const [batchYear, setBatchYear] = useState(
    currentUser?.batchYear ? "" : currentUser?.batchYear
  );
  const [studentId, setStudentId] = useState(currentUser?.studentId);
  const [organization, setOrganizations] = useState(
    currentUser?.orgs ? currentUser?.orgs : ["Add Organization"]
  );

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [avatar, setAvatar] = useState(currentUser?.avatar);
  const [background, setBackground] = useState(currentUser?.backgroundImage);

  const handleChangeOrg = (value: string, idx: number) => {
    setOrganizations((prev) =>
      prev.map((item, index) => (index === idx ? value : item))
    );
  };

  const handleAddOrg = () => {
    setOrganizations((prev) => [...prev, ""]);
  };

  const handleRemoveOrg = (idx: number) => {
    setOrganizations((prev) => prev.filter((_, index) => index !== idx));
  };

  const [addStoryOpen, setAddStoryOpen] = useState(false);
  const closeAddStory = () => setAddStoryOpen(false);

  const handleEditProfile = async () => {
    let user = {
      username: userName,
      firstName: firstName,
      lastName: lastName,
      email: email,
      avatar: avatar,
      bio: bio,
      role: role,
      department: department,
      batchYear: batchYear,
      studentId: studentId,
      orgs: organization,
      backgroundImage: background,
    };

    try {
      await toast.promise(
        (async () => {
          if (avatar?.file) {
            const uploadedAvatar = await uploadFile("image", avatar.file);
            if (uploadedAvatar) user.avatar = uploadedAvatar;
          }

          if (background?.file) {
            const uploadedBackground = await uploadFile(
              "image",
              background.file
            );
            if (uploadedBackground) user.backgroundImage = uploadedBackground;
          }

          await updateUser(user);

          // Then handle password change if any password fields are filled
          if (currentPassword || newPassword || confirmPassword) {
            await handlePasswordChange();
          }
        })(),
        {
          loading: "Updating profile...",
          success: "Profile updated",
          error: "Error updating profile. Please try again.",
        }
      );
    } catch (error) {
      toast.error("Error updating profile. Please try again.");
      console.error("Error updating profile:", error);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    try {
      await toast.promise(
        changePassword(currentPassword, newPassword, confirmPassword),
        {
          loading: "Changing password...",
          success: "Password changed successfully",
          error: "Failed to change password",
        }
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Password change error:", error);
    }
  };

  if (loadingProfile) {
    return (
      <div
        key={userId}
        className="md:grid md:grid-cols-15 px-3 sm:px-5 mt-5 gap-7 mx-auto mb-30"
      >
        <section className="col-span-0 hidden md:block md:col-span-2 lg:col-span-3">
          <Sidebar />
        </section>

        <section className="w-full sm:col-span-3 md:col-span-13 lg:col-span-11 flex-1 lg:pl-15 rounded-2xl">
          {/* Profile Header Skeleton */}
          <div className="relative w-full h-50 sm:h-65 lg:h-75">
            <Skeleton
              variant="rectangular"
              width="100%"
              height="100%"
              className="rounded-2xl"
            />

            <div className="absolute -bottom-6 sm:-bottom-15 w-full h-20 flex flex-col sm:flex-row">
              <div className="flex items-center justify-center sm:pl-10">
                <Skeleton variant="circular" width={130} height={130} />
              </div>

              <div className="w-full mt-5 sm:mt-7 text-center sm:text-left sm:pl-5">
                <div className="flex items-center flex-col sm:items-start">
                  <Skeleton variant="text" width="40%" height={30} />
                  <Skeleton variant="text" width="20%" height={20} />
                  <div className="mt-3 w-full">
                    <Skeleton variant="text" width="30%" height={20} />
                  </div>
                </div>
                <div className="text-sm lg:text-base flex items-center sm:justify-start justify-center gap-2 ">
                  <Skeleton variant="text" width="25%" height={50} />
                  <Skeleton variant="text" width="25%" height={50} />
                </div>
              </div>
            </div>
          </div>

          {/* Profile Tabs Skeleton */}
          <div className="mt-65 sm:mt-45 grid grid-cols-4 gap-3 sm:max-w-150">
            <Skeleton variant="rectangular" height={40} />
            <Skeleton variant="rectangular" height={40} />
            <Skeleton variant="rectangular" height={40} />
            <Skeleton variant="rectangular" height={40} />
          </div>

          {/* Profile Content Skeleton */}
          <div className="mt-10">
            <div className="flex flex-col gap-7 lg:px-30">
              <div className="flex flex-col gap-7">
                <Skeleton variant="rectangular" height={200} />
                <Skeleton variant="rectangular" height={150} />
              </div>

              <div>
                <Skeleton variant="rectangular" height={100} className="mb-4" />
                <Skeleton variant="rectangular" height={300} />
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!profileUser) {
    return <div>User not found</div>;
  }

  const handleFollow = async () => {
    await followUser(profileUser._id);
    getAllStories();
    setIsFollowing(true);

    // Update followers count
    const updatedFollowers = await getOtherFollowers(profileUser._id);
    setTotalFollowers(updatedFollowers);

    toast.success("Followed");
  };

  const handleUnFollow = async () => {
    await unfollowUser(profileUser._id);
    getAllStories();
    setIsFollowing(false);

    // Update followers count
    const updatedFollowers = await getOtherFollowers(profileUser._id);
    setTotalFollowers(updatedFollowers);

    toast.success("Unfollowed");
  };

  return (
    <div className=" md:grid md:grid-cols-15 px-3 sm:px-5 mt-5 gap-7 mx-auto mb-30">
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
        open={addStoryOpen}
        onClose={closeAddStory}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <AddStory closeStoryModal={closeAddStory} />
      </Modal>

      <section className="col-span-0 hidden md:block md:col-span-2 lg:col-span-3">
        <Sidebar />
      </section>

      <section className="w-full sm:col-span-3 md:col-span-13 lg:col-span-11 flex-1 rounded-md lg:pl-15">
        {/* Profile Header */}
        <div className="relative w-full h-50 sm:h-65 lg:h-75 bg-blue-400 rounded-2xl">
          {profileUser?.backgroundImage != "" && (
            <img
              src={profileUser.backgroundImage}
              alt="User Background"
              className="w-full h-full rounded-2xl object-cover"
            />
          )}

          <div className="absolute -bottom-6 sm:-bottom-15 w-full h-20 flex flex-col sm:flex-row">
            <div className="flex items-center justify-center sm:pl-10">
              <div className="w-30 h-30 md:w-35 md:h-35 lg:w-37 lg:h-37 bg-gray-500 rounded-full outline-primaryBg outline-5 flex items-center justify-center">
                {profileUser?.avatar &&
                !profileUser.avatar.includes(
                  "https://lh3.googleusercontent.com/"
                ) ? (
                  <img
                    src={profileUser.avatar}
                    alt="User Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-6xl font-semibold text-blue-400 dark:text-accent">
                      {profileUser?.firstName?.[0]?.toUpperCase()}
                      {profileUser?.lastName?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="w-full mt-5 sm:mt-7 text-center sm:text-left justify-between sm:pl-5 profileHead">
              <div>
                <div>
                  <h1 className="font-semibold text-2xl sm:text-2xl">
                    {profileUser?.firstName} {profileUser?.lastName}
                  </h1>
                  <p className="text-base text-customGray sm:text-base">
                    @{profileUser?.username}
                  </p>
                </div>
                <div className="text-sm lg:text-base flex items-center sm:justify-start justify-center sm gap-2 mt-3">
                  <div className="flex items-center gap-1">
                    <h1>{allUserPost.length}</h1>
                    <p className="text-customGray">Posts</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <h1>{totalFollowers?.length}</h1>
                    <p className="text-customGray">Followers</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <h1>{totalFollowing?.length}</h1>
                    <p className="text-customGray">Following</p>
                  </div>
                </div>
              </div>

              {/* Only show these buttons if it's the current user's profile */}
              {isCurrentUserProfile ? (
                <div className="mt-5 sm:mt-3 flex justify-center sm:justify-start gap-5 w-full profileButton">
                  <button
                    onClick={() => {
                      if (hasStory) {
                        toast.error("You can only post one story at a time.");
                        return;
                      }
                      setAddStoryOpen(true);
                    }}
                    className="text-accent text-sm lg:text-base p-1 py-2 border-1 border-accent hover:bg-blue-100 dark:hover:bg-[#283443] rounded-md w-full max-w-45 cursor-pointer"
                  >
                    Add Story
                  </button>
                  <button
                    onClick={() => setEditProfileOpen(true)}
                    className="text-primary text-sm lg:text-base bg-gray-200 dark:bg-[#2C2C2C] hover:bg-gray-300 dark:hover:bg-[#3F3F3F] p-1 py-2 rounded-md w-full max-w-45 cursor-pointer"
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <div className="mt-5 sm:mt-3 flex justify-center sm:justify-start gap-5 w-full profileButton">
                  {isFollowing ? (
                    <button
                      onClick={() => handleUnFollow()}
                      className="text-accent text-sm lg:text-base p-1 py-2 border-1 border-accent hover:bg-blue-100 dark:hover:bg-[#283443] rounded-md w-full max-w-45 cursor-pointer"
                    >
                      Followed
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFollow()}
                      className="text-accent text-sm lg:text-base p-1 py-2 border-1 border-accent hover:bg-blue-100 dark:hover:bg-[#283443] rounded-md w-full max-w-45 cursor-pointer"
                    >
                      Follow
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="mt-65 sm:mt-45 grid grid-cols-3 profileTabs gap-3 sm:max-w-150">
          {profileBar.map((tab) => (
            <button
              key={tab.name}
              className={`cursor-pointer w-full relative px-3 py-2 ${
                tab.active
                  ? "text-accent border-b-1"
                  : "text-primary hover:bg-blue-100 dark:hover:bg-[#283443] hover:rounded-md"
              }`}
              onClick={() => toggleTab(tab.name)}
            >
              <h1>{tab.name}</h1>
            </button>
          ))}
        </div>

        {/* Profile Content */}
        <div className="mt-10 profilePost">
          {profileBar[0].active && (
            <div className="flex flex-col gap-7 lg:px-30">
              <div className="flex flex-col gap-7">
                <ProfileDetails
                  user={profileUser}
                  isCurrentUser={isCurrentUserProfile}
                  setEditProfileOpen={
                    isCurrentUserProfile ? setEditProfileOpen : undefined
                  }
                />
                <Organizations
                  orgs={profileUser?.orgs}
                  isCurrentUser={isCurrentUserProfile}
                  setEditProfileOpen={
                    isCurrentUserProfile ? setEditProfileOpen : undefined
                  }
                />
              </div>

              <div className="col-span-2 md:-mt-10">
                {isCurrentUserProfile && (
                  <div className="-mt-10 md:mt-0">
                    <Post
                      onPostCreated={() => setRefreshFeed((prev) => !prev)}
                    />
                  </div>
                )}
                <div className="md:-mt-3">
                  <ProfileFeed
                    user={profileUser}
                    isCurrentUser={isCurrentUserProfile}
                    refresh={refreshFeed}
                    handleRefresh={() => setRefreshFeed((prev) => !prev)}
                  />
                </div>
              </div>
            </div>
          )}

          {profileBar[1].active && <ProfileReels userId={profileUser?._id} />}
          {profileBar[2].active && (
            <ProfileFollowers userId={profileUser?._id} />
          )}
          {profileBar[3].active && (
            <ProfileFollowing userId={profileUser?._id} />
          )}
        </div>
      </section>

      {isCurrentUserProfile && (
        <Modal
          open={editProfileOpen}
          onClose={closeEditProfile}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <div className="relative  overflow-y-auto h-120 md:h-150 scrollComment max-w-xl mt-20 rounded-2xl w-[95%] mx-auto inset-0 bg-primaryBg z-100 flex items-center justify-center px-2 sm:px-6 md:px-10 ">
            {" "}
            <div className="absolute top-0 pt-7 w-full max-w-xl overflow-hidden p-5">
              <h1 className=" font-semibold text-center mb-5 text-lg">
                Edit Profile
              </h1>

              <button
                onClick={closeEditProfile}
                className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-100/30  p-1 rounded-full  absolute top-4 sm:top-5  right-4 text-white z-50"
              >
                <CloseIcon className="text-primary" />
              </button>

              <div className="flex flex-col gap-4">
                <div>
                  <h1 className=" font-medium mb-2">Profile Image</h1>
                  <div className="relative mx-auto w-25 h-25 rounded-full outline-1 overflow-hidden">
                    {avatar ? (
                      <div className="w-full h-full">
                        <img
                          src={avatar.preview ?? avatar}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="bg-blue-900 w-full h-full rounded-full"></div>
                    )}
                    <button
                      type="button"
                      className="absolute right-0 bottom-0 bg-black/30 hover:bg-black/50 cursor-pointer rounded-full p-1"
                      onClick={() =>
                        document.getElementById("image-upload")?.click()
                      }
                    >
                      <EditIcon className="text-white" />
                    </button>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || [];
                        if (file) {
                          setAvatar({
                            file,
                            type: file.type,
                            preview: URL.createObjectURL(file),
                          });
                        }
                      }}
                      className="hidden"
                    />
                  </div>
                </div>

                <div>
                  <h1 className="font-medium mb-2">Profile Background</h1>
                  <div className="relative mx-auto w-full h-40 sm:h-50 md:h-55 overflow-hidden flex items-center justify-center rounded-2xl bg-gray-500">
                    {background != "" ? (
                      <div>
                        <img
                          src={background.preview ?? background}
                          alt="Profile"
                          className="w-full h-full rounded-md object-cover"
                        />
                      </div>
                    ) : (
                      <div className="bg-blue-900 w-full h-full  rounded-2xl"></div>
                    )}
                    <button
                      type="button"
                      className="absolute right-2 bottom-2 bg-black/30 hover:bg-black/50 cursor-pointer transition p-1 rounded-full"
                      title="Edit Background"
                      onClick={() => {
                        document.getElementById("background-upload")?.click();
                      }}
                    >
                      <EditIcon className="text-white" />
                    </button>
                  </div>
                  <input
                    id="background-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || [];
                      if (file) {
                        setBackground({
                          file,
                          type: file.type,
                          preview: URL.createObjectURL(file),
                        });
                      }
                    }}
                  />
                </div>

                <div>
                  <h1 className="font-medium mb-2">Username</h1>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="custom-textarea"
                  />
                </div>

                <div>
                  <h1 className="font-medium mb-2">First Name</h1>
                  <input
                    type="text"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="custom-textarea"
                  />
                </div>

                <div>
                  <h1 className="font-medium mb-2">Last Name</h1>
                  <input
                    type="text"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="custom-textarea"
                  />
                </div>

                <div>
                  <h1 className="font-medium mb-2">Bio</h1>
                  <textarea
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write a short bio..."
                    maxLength={120}
                    className={`placeholder:text-gray-500 min-h-15 sm:min-h-10 dark:placeholder:text-gray-400 overflow-y-hidden resize-none text-sm md:text-base bg-white dark:bg-gray-700 w-full focus:outline-none p-3 rounded-lg transition-all duration-200 border ${
                      isFocused
                        ? "border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20 dark:ring-blue-400/20"
                        : "border-gray-200 dark:border-gray-600"
                    }`}
                  />
                </div>

                <div>
                  <h1 className="font-medium mb-2">Type</h1>

                  <label className="flex  items-center gap-3 ">
                    <FormControl sx={{ minWidth: 120 }}>
                      <Select
                        value={role}
                        variant={"standard"}
                        onChange={(e) => setRole(e.target.value)}
                        defaultValue="student"
                        displayEmpty
                        inputProps={{ "aria-label": "Without label" }}
                        sx={{
                          color: isDarkMode ? "white" : "black",
                          "& .MuiSelect-icon": {
                            color: isDarkMode ? "white" : "black",
                          },
                        }}
                        className="bg-white dark:bg-gray-700 p-2 px-3 rounded-md "
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
                        <MenuItem value={"student"}>Student</MenuItem>
                        <MenuItem value={"professor"}>Professor</MenuItem>
                        <MenuItem value={"faculty"}>Faculty</MenuItem>
                      </Select>
                    </FormControl>
                  </label>
                </div>

                <div>
                  <h1 className="font-medium mb-2">Email</h1>
                  <input
                    type="text"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="custom-textarea"
                  />
                </div>

                <div>
                  <h1 className="font-medium mb-2">Department</h1>

                  <label className="flex  items-center gap-3 ">
                    <FormControl sx={{ minWidth: 120 }}>
                      <Select
                        value={department}
                        variant={"standard"}
                        onChange={(e) => setDepartment(e.target.value)}
                        defaultValue="College of Computer Studies"
                        displayEmpty
                        inputProps={{ "aria-label": "Without label" }}
                        sx={{
                          color: isDarkMode ? "white" : "black",
                          "& .MuiSelect-icon": {
                            color: isDarkMode ? "white" : "black",
                          },
                        }}
                        className="bg-white dark:bg-gray-700 p-2 px-3 rounded-md "
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
                        <MenuItem
                          value="College of Business and Accountancy"
                          className="whitespace-normal text-sm sm:text-base"
                        >
                          <p className="whitespace-normal ">
                            College of Business and Accountancy
                          </p>
                        </MenuItem>
                        <MenuItem
                          value="College of Computer Studies"
                          className="whitespace-normal text-sm sm:text-base"
                        >
                          <p className="whitespace-normal ">
                            College of Computer Studies
                          </p>
                        </MenuItem>
                        <MenuItem value="College of Education">
                          <p className="whitespace-normal ">
                            College of Education
                          </p>
                        </MenuItem>
                        <MenuItem
                          value="College of Humanities and Social Sciences"
                          className="whitespace-normal text-sm sm:text-base"
                        >
                          <p className="whitespace-normal ">
                            College of Humanities and Social Sciences
                          </p>
                        </MenuItem>
                        <MenuItem
                          value="College of Law"
                          className="whitespace-normal text-sm sm:text-base"
                        >
                          <p className="whitespace-normal ">College of Law</p>
                        </MenuItem>
                        <MenuItem
                          value="College of Nursing"
                          className="whitespace-normal text-sm sm:text-base"
                        >
                          <p className="whitespace-normal ">
                            College of Nursing
                          </p>
                        </MenuItem>
                        <MenuItem value="College of Science, Engineering, and Architecture">
                          <p className="whitespace-normal ">
                            College of Science, Engineering, and Architecture
                          </p>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </label>
                </div>

                <div>
                  <h1 className="font-medium mb-2">Student ID</h1>
                  <input
                    type="text"
                    placeholder="Enter your student ID (e.g., 2023-1234)"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="custom-textarea"
                  />
                </div>

                <div>
                  <h1 className="font-medium mb-2">Batch Year</h1>
                  <input
                    type="number"
                    placeholder="Enter your batch year (e.g., 2024)"
                    value={batchYear}
                    onChange={(e) => setBatchYear(e.target.value)}
                    className="custom-textarea"
                  />
                </div>

                <div>
                  <h1 className="font-medium mb-2">Organization</h1>
                  <div className="flex flex-col gap-3">
                    {organization ? (
                      organization.map((org, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Enter organization"
                            value={org}
                            onChange={(e) =>
                              handleChangeOrg(e.target.value, index)
                            }
                            className="custom-textarea flex-1"
                          />
                          {organization.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOrg(index)}
                              className="cursor-pointer "
                            >
                              <DeleteOutlineIcon className="hover:text-red-400" />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Enter organization"
                          value={""}
                          onChange={(e) => handleChangeOrg(e.target.value, 0)}
                          className="custom-textarea flex-1"
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleAddOrg}
                      className="text-accent hover:underline text-left text-sm"
                    >
                      + Add Organization
                    </button>
                  </div>
                </div>

                <h1 className="text-center font-semibold text-lg">
                  Change Password
                </h1>
                <div>
                  <h1 className="font-medium mb-2">Current Password</h1>
                  <input
                    type="password"
                    placeholder="Enter your current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="custom-textarea"
                  />
                </div>

                <div>
                  <h1 className="font-medium mb-2">New Password</h1>
                  <input
                    type="password"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="custom-textarea"
                  />
                </div>

                <div>
                  <h1 className="font-medium mb-2">Confirm New Password</h1>
                  <input
                    type="password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="custom-textarea"
                  />
                </div>

                <div className="my-5 mx-auto">
                  <button
                    onClick={() => {
                      handleEditProfile();
                      closeEditProfile();
                    }}
                    className="cursor-pointer relative px-5 md:px-14 py-2 bg-accent dark:bg-blue-800 text-white  rounded-lg text-sm font-medium hover:scale-[1.02] transform transition-all duration-200 group overflow-hidden"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
      <MobileSidebar />
    </div>
  );
};

export default Profile;
