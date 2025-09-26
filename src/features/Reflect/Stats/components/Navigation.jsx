
// import Link from "next/link";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Calendar, BarChart2, SplitSquareVertical, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  // const pathname = usePathname();
  const location = useLocation();
  const navigate = useNavigate();
  const { hash, pathname, search } = location;
  const path = pathname?.split( '/' );
  const [ isOpen, setIsOpen ] = useState( false );

  const routes = [
    { path: "/", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
    { path: "/calendar", label: "Calendar", icon: <Calendar className="h-4 w-4 mr-2" /> },
    { path: "/sidebar-demo", label: "Sidebar View", icon: <Menu className="h-4 w-4 mr-2" /> },
    { path: "/combined-view", label: "Combined View", icon: <SplitSquareVertical className="h-4 w-4 mr-2" /> },
    { path: "/analysis", label: "Analysis", icon: <BarChart2 className="h-4 w-4 mr-2" /> },
  ];

  return (
    <div className="bg-gray-900 border-b border-gray-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center">
            <h1 className="text-xl font-bold mr-8">CompassApp</h1>

            {/* Desktop Navigation */ }
            <div className="hidden md:flex space-x-1">
              { routes.map( ( route ) => (
                <Link key={ route.path } to={ { pathname: route.path } }>
                  <Button
                    variant={ pathname === route.path ? "default" : "ghost" }
                    className={ pathname === route.path ? "bg-blue-600" : "" }
                    size="sm"
                  >
                    { route.icon }
                    { route.label }
                  </Button>
                </Link>
              ) ) }
            </div>
          </div>

          {/* Mobile Menu Button */ }
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={ () => setIsOpen( !isOpen ) }>
              { isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" /> }
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */ }
        { isOpen && (
          <div className="md:hidden py-2 space-y-1">
            { routes.map( ( route ) => (
              <Link key={ route.path } to={ { pathname: route.path } } className="block">
                <Button
                  variant={ pathname === route.path ? "default" : "ghost" }
                  className={ `w-full justify-start ${ pathname === route.path ? "bg-blue-600" : "" }` }
                  size="sm"
                  onClick={ () => setIsOpen( false ) }
                >
                  { route.icon }
                  { route.label }
                </Button>
              </Link>
            ) ) }
          </div>
        ) }
      </div>
    </div>
  );
};

export default Navigation;
