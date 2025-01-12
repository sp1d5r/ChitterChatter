import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../components/aceturnity/sidebar";
import {
  IconHome,
  IconUser,
  IconSettings,
  IconLogout,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "../components/shadcn/button";
import { Moon, Sun } from "lucide-react";
import { useDarkMode } from "../contexts/DarkModeProvider";
import { DashboardMain } from "../components/page-components/dashboard/DashboardMain";
import { AuthStatus, useAuth } from "../contexts/AuthenticationProvider";
import { ProfileStatus, useProfile } from "../contexts/ProfileProvider";
import DashboardProfile from "../components/page-components/dashboard/DashboardProfile";
import { useToast } from "../contexts/ToastProvider";

const Dashboard: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {darkModeState, toggleDarkMode} = useDarkMode();
  const [activeContent, setActiveContent] = useState<string>("home");
  const { authState, logout } = useAuth();
  const { status: profileStatus, profile} = useProfile();
  const {toast} = useToast();

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    
    if (sessionId) {
      // Clear the URL parameter
      window.history.replaceState({}, '', '/dashboard');
      // Show success message
      toast({
        title: "Subscription Updated",
        description: "Your subscription has been updated successfully.",
      });
    }
  }, []);

  useEffect(() => {
    const content = searchParams.get("content");
    if (content && sidebarLinks.some(link => link.id === content)) {
      setActiveContent(content);
    } else {
      setActiveContent("home");
    }
  }, [searchParams]);

  useEffect(() => {
    if (authState) {
      switch (authState.status) {
        case AuthStatus.UNAUTHENTICATED:
          navigate("/authentication?mode=login");
          break;
        case AuthStatus.AUTHENTICATED:
          // Check profile status when authenticated
          console.log("Profile status:", authState.user);
          switch (profileStatus) {
            case ProfileStatus.NO_PROFILE:
            case ProfileStatus.NEEDS_ONBOARDING:
              navigate("/onboarding");
              break;
            case ProfileStatus.COMPLETE:
            case ProfileStatus.LOADING:
              break;
          }
          break;
        case AuthStatus.LOADING:
          break;
      }
    }
  }, [authState, profileStatus, navigate]);

  const handleLinkClick = (id: string) => {
    navigate(`?content=${id}`);
  };

  return (
    <div className={cn(
      "rounded-md flex flex-col md:flex-row  dark:bg-background w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden px-1 py-1",
      "h-screen"
    )}>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 bg-primary dark:bg-background border border-neutral-200 dark:border-primary rounded-l-xl">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2 text-gray-800 dark:text-gray-200">
              {sidebarLinks.map((link) => (
                <SidebarLink 
                  key={link.id} 
                  link={link} 
                  onClick={() => handleLinkClick(link.id)}
                  active={activeContent === link.id}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 text-gray-800 dark:text-gray-200">
            <div className={`flex gap-2 ${!open && 'flex-col'}`}>
                <Button variant="outline" size="icon" onClick={toggleDarkMode} className="border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-500">
                    {darkModeState ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <Button variant='destructive' onClick={() => {logout()}}>
                    <IconLogout className="h-5 w-5 flex-shrink-0" />
                    {open && 'Logout'}
                </Button>
            </div>
            <SidebarLink
              link={{
                id: "profile",
                label: (profile && profile.displayName) || '',
                icon: <UserAvatar />
              }}
              onClick={() => handleLinkClick("profile")}
              active={activeContent === "profile"}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <main className="flex-1 p-6 overflow-auto">
        <nav>

        </nav>
        {renderContent(activeContent)}
      </main>
    </div>
  );
};

const Logo = () => (
  <div className="font-normal flex -space-x-[0.5rem] items-center text-sm text-gray-200 py-1 relative z-20">
    <p className="text-2xl font-bold text-coffee-500">C</p>
    <p className="text-2xl font-bold text-coffee-300">C</p>
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-medium pl-2 whitespace-pre ml-3 bg-gradient-to-r from-coffee-500 via-coffee-300 to-coffee-500 bg-clip-text text-transparent"
    >
      ChitterChatter
    </motion.span>
  </div>
);

const LogoIcon = () => (
  <div className="font-normal flex -space-x-2 items-center text-sm text-gray-200 py-1 relative z-20 w-10">
    <p className="text-2xl font-bold text-coffee-500">C</p>
    <p className="text-2xl font-bold text-coffee-300">C</p>
  </div>
);


const UserAvatar = () => (
<div className="h-7 w-7 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" />
);

const sidebarLinks = [
{
    id: "home",
    label: "Dashboard",
    icon: <IconHome className="h-5 w-5 flex-shrink-0" />
},
{
    id: "profile",
    label: "Profile",
    icon: <IconUser className="h-5 w-5 flex-shrink-0" />
},
{
    id: "settings",
    label: "Settings",
    icon: <IconSettings className="h-5 w-5 flex-shrink-0" />
},
{
    id: "logout",
    label: "Logout",
    icon: <IconLogout className="h-5 w-5 flex-shrink-0" />
}
];

const renderContent = (contentId: string) => {
  switch (contentId) {
    case "home":
      return <DashboardMain />;
    case "profile":
      return <DashboardProfile />;
    case "settings":
      return <h1>Settings</h1>;
    case "logout":
      return <h1>Logout Confirmation</h1>;
    default:
      return <h1>404 Not Found</h1>;
  }
};

export default Dashboard;