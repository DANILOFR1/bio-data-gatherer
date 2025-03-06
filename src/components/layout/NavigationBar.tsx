
import { NavLink } from "react-router-dom";
import { Home, Plus, List, Settings, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavigationBarProps {
  isOnline: boolean;
}

export const NavigationBar = ({ isOnline }: NavigationBarProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur-md z-50">
      <nav className="container max-w-md mx-auto px-4 py-2">
        <ul className="flex items-center justify-around">
          <NavItem icon={<Home size={24} />} to="/" label="Home" />
          <NavItem icon={<Plus size={24} />} to="/new" label="New" />
          <NavItem icon={<List size={24} />} to="/observations" label="Observations" />
          <NavItem icon={<Settings size={24} />} to="/settings" label="Settings" />
          
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    {isOnline ? (
                      <Wifi size={16} className="text-bio-highlight" />
                    ) : (
                      <WifiOff size={16} className="text-muted-foreground" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isOnline ? "Online" : "Offline mode"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </ul>
      </nav>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  to: string;
  label: string;
}

const NavItem = ({ icon, to, label }: NavItemProps) => {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          cn(
            "flex flex-col items-center justify-center py-2 px-4 rounded-lg transition-all",
            isActive
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )
        }
      >
        {icon}
        <span className="text-xs mt-1">{label}</span>
      </NavLink>
    </li>
  );
};
