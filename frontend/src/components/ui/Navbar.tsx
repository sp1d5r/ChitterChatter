import { Link, useNavigate } from 'react-router-dom';
import { Button } from "../shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../shadcn/dropdown-menu";
import { Menu, Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeProvider';
import { AuthStatus, useAuth } from '../../contexts/AuthenticationProvider';

export default function Navbar() {
  const navigate = useNavigate();
  const {darkModeState, toggleDarkMode} = useDarkMode();
  const {authState} = useAuth()

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="sticky top-0 bg-accent dark:bg-gray-700 shadow-sm dark:shadow-gray-800 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold text-black">ChitterChatter</Link>
        </div>

        {
          authState.status === AuthStatus.UNAUTHENTICATED && <div className="hidden md:flex space-x-2">
            <Button variant="outline" asChild><Link to="/authentication?mode=login" className="dark:text-gray-200 dark:hover:text-white">Log in</Link></Button>
            <Button asChild><Link to="/authentication?mode=sign-up" className="dark:text-gray-200">Sign up</Link></Button>
          </div>
        }
        {
          authState.status === AuthStatus.AUTHENTICATED && <div className="hidden md:flex space-x-2">
            <Button variant="outline" asChild><Link to="/dashboard" className="dark:text-gray-200 dark:hover:text-white">Dashboard</Link></Button>
            <Button variant="outline" size="icon" onClick={toggleDarkMode} className="dark:border-gray-600 dark:text-gray-200 dark:hover:text-white dark:hover:border-gray-400">
              {darkModeState ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        }
        {
          authState.status === AuthStatus.LOADING && <div className="hidden md:flex space-x-2">
            <p className='dark:text-white text-bold'>Loading...</p>
            <Button variant="outline" size="icon" onClick={toggleDarkMode} className="dark:border-gray-600 dark:text-gray-200 dark:hover:text-white dark:hover:border-gray-400">
              {darkModeState ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        }
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="dark:border-gray-600 dark:text-gray-200 dark:hover:text-white dark:hover:border-gray-400">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
              {
                authState.status === AuthStatus.UNAUTHENTICATED && <>
                  <DropdownMenuItem onSelect={() => handleNavigation('/authentication?mode=login')} className="dark:text-gray-200 dark:focus:bg-gray-700">Log in</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleNavigation('/authentication?mode=sign-up')} className="dark:text-gray-200 dark:focus:bg-gray-700">Sign up</DropdownMenuItem>
                </>
              }
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}