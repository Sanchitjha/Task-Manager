import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, Wallet, ShoppingBag, Package, Truck, 
  Settings, LogOut, ChevronDown,
  Users, Video, DollarSign, Store, BarChart3, FileText
} from "lucide-react";

// Dashboard blocks configuration for each role
const getDashboardBlocks = (role) => {
  const blockConfigs = {
    user: [
      {
        id: "earn",
        name: "EARN",
        icon: DollarSign,
        description: "Watch Videos & Earn Coins",
        route: "/earn",
        bgImage: "https://images.pexels.com/photos/12956000/pexels-photo-12956000.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        styles: {
          bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50",
          border: "border-emerald-200",
          text: "text-emerald-900",
          iconBg: "bg-emerald-500",
          hover: "hover:border-emerald-400 hover:shadow-emerald-200/60"
        },
        span: "md:col-span-2"
      },
      {
        id: "wallet",
        name: "WALLET",
        icon: Wallet,
        description: "Balance & Payments",
        route: "/wallet",
        bgImage: "https://images.pexels.com/photos/4246844/pexels-photo-4246844.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        styles: {
          bg: "bg-gradient-to-br from-indigo-50 to-indigo-100/50",
          border: "border-indigo-200",
          text: "text-indigo-900",
          iconBg: "bg-indigo-500",
          hover: "hover:border-indigo-400 hover:shadow-indigo-200/60"
        },
        span: "md:col-span-1"
      },
      {
        id: "shop",
        name: "SHOP",
        icon: Store,
        description: "Browse & Buy",
        route: "/shops",
        bgImage: "https://images.unsplash.com/photo-1758520387283-303b0b332e89?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwyfHxzaG9wcGluZyUyMGJhZ3MlMjByZXRhaWwlMjBzdG9yZXxlbnwwfHx8fDE3NzIxMDYxNDV8MA&ixlib=rb-4.1.0&q=85",
        styles: {
          bg: "bg-gradient-to-br from-cyan-50 to-cyan-100/50",
          border: "border-cyan-200",
          text: "text-cyan-900",
          iconBg: "bg-cyan-500",
          hover: "hover:border-cyan-400 hover:shadow-cyan-200/60"
        },
        span: "md:col-span-1"
      },
      {
        id: "product",
        name: "PRODUCTS",
        icon: Package,
        description: "Browse Products",
        route: "/products",
        bgImage: "https://images.pexels.com/photos/31850029/pexels-photo-31850029.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        styles: {
          bg: "bg-gradient-to-br from-violet-50 to-violet-100/50",
          border: "border-violet-200",
          text: "text-violet-900",
          iconBg: "bg-violet-500",
          hover: "hover:border-violet-400 hover:shadow-violet-200/60"
        },
        span: "md:col-span-1"
      },
      {
        id: "order",
        name: "ORDERS",
        icon: Truck,
        description: "Track & Manage",
        route: "/orders",
        bgImage: "https://images.pexels.com/photos/4440800/pexels-photo-4440800.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        styles: {
          bg: "bg-gradient-to-br from-amber-50 to-amber-100/50",
          border: "border-amber-200",
          text: "text-amber-900",
          iconBg: "bg-amber-500",
          hover: "hover:border-amber-400 hover:shadow-amber-200/60"
        },
        span: "md:col-span-1"
      }
    ],
    Partner: [
      {
        id: "earn",
        name: "EARNINGS",
        icon: TrendingUp,
        description: "Revenue & Analytics",
        route: "/partner/reports",
        bgImage: "https://images.pexels.com/photos/12956000/pexels-photo-12956000.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        styles: {
          bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50",
          border: "border-emerald-200",
          text: "text-emerald-900",
          iconBg: "bg-emerald-500",
          hover: "hover:border-emerald-400 hover:shadow-emerald-200/60"
        },
        span: "md:col-span-2"
      },
      {
        id: "wallet",
        name: "WALLET",
        icon: Wallet,
        description: "Payouts & Balance",
        route: "/seller/wallet",
        bgImage: "https://images.pexels.com/photos/4246844/pexels-photo-4246844.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        styles: {
          bg: "bg-gradient-to-br from-indigo-50 to-indigo-100/50",
          border: "border-indigo-200",
          text: "text-indigo-900",
          iconBg: "bg-indigo-500",
          hover: "hover:border-indigo-400 hover:shadow-indigo-200/60"
        },
        span: "md:col-span-1"
      },
      {
        id: "shop",
        name: "MY STORE",
        icon: Store,
        description: "Manage Store",
        route: "/seller/profile",
        bgImage: "https://images.unsplash.com/photo-1758520387283-303b0b332e89?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwyfHxzaG9wcGluZyUyMGJhZ3MlMjByZXRhaWwlMjBzdG9yZXxlbnwwfHx8fDE3NzIxMDYxNDV8MA&ixlib=rb-4.1.0&q=85",
        styles: {
          bg: "bg-gradient-to-br from-cyan-50 to-cyan-100/50",
          border: "border-cyan-200",
          text: "text-cyan-900",
          iconBg: "bg-cyan-500",
          hover: "hover:border-cyan-400 hover:shadow-cyan-200/60"
        },
        span: "md:col-span-1"
      },
      {
        id: "product",
        name: "PRODUCTS",
        icon: Package,
        description: "Manage Inventory",
        route: "/seller/inventory",
        bgImage: "https://images.pexels.com/photos/31850029/pexels-photo-31850029.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        styles: {
          bg: "bg-gradient-to-br from-violet-50 to-violet-100/50",
          border: "border-violet-200",
          text: "text-violet-900",
          iconBg: "bg-violet-500",
          hover: "hover:border-violet-400 hover:shadow-violet-200/60"
        },
        span: "md:col-span-1"
      },
      {
        id: "order",
        name: "ORDERS",
        icon: Truck,
        description: "Customer Orders",
        route: "/seller/orders",
        bgImage: "https://images.pexels.com/photos/4440800/pexels-photo-4440800.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        styles: {
          bg: "bg-gradient-to-br from-amber-50 to-amber-100/50",
          border: "border-amber-200",
          text: "text-amber-900",
          iconBg: "bg-amber-500",
          hover: "hover:border-amber-400 hover:shadow-amber-200/60"
        },
        span: "md:col-span-1"
      }
    ],
    subadmin: [
      {
        id: "users",
        name: "USERS",
        icon: Users,
        description: "Manage Clients",
        route: "/subadmin/dashboard",
        bgImage: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        styles: {
          bg: "bg-gradient-to-br from-blue-50 to-blue-100/50",
          border: "border-blue-200",
          text: "text-blue-900",
          iconBg: "bg-blue-500",
          hover: "hover:border-blue-400 hover:shadow-blue-200/60"
        },
        span: "md:col-span-2"
      },
      {
        id: "coins",
        name: "COINS",
        icon: DollarSign,
        description: "Distribute Coins",
        route: "/subadmin/dashboard",
        bgImage: "https://images.pexels.com/photos/12956000/pexels-photo-12956000.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        styles: {
          bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50",
          border: "border-emerald-200",
          text: "text-emerald-900",
          iconBg: "bg-emerald-500",
          hover: "hover:border-emerald-400 hover:shadow-emerald-200/60"
        },
        span: "md:col-span-1"
      },
      {
        id: "wallet",
        name: "WALLET",
        icon: Wallet,
        description: "Balance & Tracking",
        route: "/subadmin/dashboard",
        bgImage: "https://images.pexels.com/photos/4246844/pexels-photo-4246844.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        styles: {
          bg: "bg-gradient-to-br from-indigo-50 to-indigo-100/50",
          border: "border-indigo-200",
          text: "text-indigo-900",
          iconBg: "bg-indigo-500",
          hover: "hover:border-indigo-400 hover:shadow-indigo-200/60"
        },
        span: "md:col-span-1"
      },
      {
        id: "reports",
        name: "REPORTS",
        icon: FileText,
        description: "Activity Reports",
        route: "/subadmin/dashboard",
        bgImage: "https://images.pexels.com/photos/7709159/pexels-photo-7709159.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        styles: {
          bg: "bg-gradient-to-br from-purple-50 to-purple-100/50",
          border: "border-purple-200",
          text: "text-purple-900",
          iconBg: "bg-purple-500",
          hover: "hover:border-purple-400 hover:shadow-purple-200/60"
        },
        span: "md:col-span-2"
      }
    ],
    admin: [
      {
        id: "users",
        name: "USERS",
        icon: Users,
        description: "Manage All Users",
        route: "/admin/dashboard",
        bgImage: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        styles: {
          bg: "bg-gradient-to-br from-blue-50 to-blue-100/50",
          border: "border-blue-200",
          text: "text-blue-900",
          iconBg: "bg-blue-500",
          hover: "hover:border-blue-400 hover:shadow-blue-200/60"
        },
        span: "md:col-span-1"
      },
      {
        id: "partners",
        name: "PARTNERS",
        icon: ShoppingBag,
        description: "Manage Partners",
        route: "/admin/partners",
        bgImage: "https://images.pexels.com/photos/4246844/pexels-photo-4246844.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        styles: {
          bg: "bg-gradient-to-br from-cyan-50 to-cyan-100/50",
          border: "border-cyan-200",
          text: "text-cyan-900",
          iconBg: "bg-cyan-500",
          hover: "hover:border-cyan-400 hover:shadow-cyan-200/60"
        },
        span: "md:col-span-1"
      },
      {
        id: "subadmins",
        name: "SUB-ADMINS",
        icon: Users,
        description: "Manage Sub-Admins",
        route: "/admin/dashboard",
        bgImage: "https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        styles: {
          bg: "bg-gradient-to-br from-violet-50 to-violet-100/50",
          border: "border-violet-200",
          text: "text-violet-900",
          iconBg: "bg-violet-500",
          hover: "hover:border-violet-400 hover:shadow-violet-200/60"
        },
        span: "md:col-span-1"
      },
      {
        id: "videos",
        name: "VIDEOS",
        icon: Video,
        description: "Video Management",
        route: "/admin/videos",
        bgImage: "https://images.pexels.com/photos/7658355/pexels-photo-7658355.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        styles: {
          bg: "bg-gradient-to-br from-rose-50 to-rose-100/50",
          border: "border-rose-200",
          text: "text-rose-900",
          iconBg: "bg-rose-500",
          hover: "hover:border-rose-400 hover:shadow-rose-200/60"
        },
        span: "md:col-span-1"
      },
      {
        id: "coins",
        name: "COINS",
        icon: DollarSign,
        description: "Coin Distribution",
        route: "/admin/dashboard",
        bgImage: "https://images.pexels.com/photos/12956000/pexels-photo-12956000.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        styles: {
          bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50",
          border: "border-emerald-200",
          text: "text-emerald-900",
          iconBg: "bg-emerald-500",
          hover: "hover:border-emerald-400 hover:shadow-emerald-200/60"
        },
        span: "md:col-span-1"
      },
      {
        id: "products",
        name: "PRODUCTS",
        icon: Package,
        description: "All Products",
        route: "/products",
        bgImage: "https://images.pexels.com/photos/31850029/pexels-photo-31850029.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        styles: {
          bg: "bg-gradient-to-br from-amber-50 to-amber-100/50",
          border: "border-amber-200",
          text: "text-amber-900",
          iconBg: "bg-amber-500",
          hover: "hover:border-amber-400 hover:shadow-amber-200/60"
        },
        span: "md:col-span-1"
      },
      {
        id: "orders",
        name: "ORDERS",
        icon: Truck,
        description: "All Orders",
        route: "/orders",
        bgImage: "https://images.pexels.com/photos/4440800/pexels-photo-4440800.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        styles: {
          bg: "bg-gradient-to-br from-indigo-50 to-indigo-100/50",
          border: "border-indigo-200",
          text: "text-indigo-900",
          iconBg: "bg-indigo-500",
          hover: "hover:border-indigo-400 hover:shadow-indigo-200/60"
        },
        span: "md:col-span-1"
      },
      {
        id: "shops",
        name: "SHOPS",
        icon: Store,
        description: "All Shops",
        route: "/shops",
        bgImage: "https://images.unsplash.com/photo-1758520387283-303b0b332e89?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwyfHxzaG9wcGluZyUyMGJhZ3MlMjByZXRhaWwlMjBzdG9yZXxlbnwwfHx8fDE3NzIxMDYxNDV8MA&ixlib=rb-4.1.0&q=85",
        styles: {
          bg: "bg-gradient-to-br from-teal-50 to-teal-100/50",
          border: "border-teal-200",
          text: "text-teal-900",
          iconBg: "bg-teal-500",
          hover: "hover:border-teal-400 hover:shadow-teal-200/60"
        },
        span: "md:col-span-1"
      },
      {
        id: "subscriptions",
        name: "SUBSCRIPTIONS",
        icon: BarChart3,
        description: "Manage Subscriptions",
        route: "/admin/subscriptions",
        bgImage: "https://images.pexels.com/photos/7709159/pexels-photo-7709159.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        styles: {
          bg: "bg-gradient-to-br from-purple-50 to-purple-100/50",
          border: "border-purple-200",
          text: "text-purple-900",
          iconBg: "bg-purple-500",
          hover: "hover:border-purple-400 hover:shadow-purple-200/60"
        },
        span: "md:col-span-2"
      }
    ]
  };

  return blockConfigs[role] || blockConfigs.user;
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Get dashboard blocks based on user role
  const dashboardBlocks = getDashboardBlocks(user?.role);

  const handleCardClick = (block) => {
    if (block.route) {
      navigate(block.route);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // Redirect to login if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="dashboard-page">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/80 backdrop-blur-md">
        <div className="flex h-16 md:h-20 items-center justify-between px-6 md:px-8 lg:px-12">
          {/* Logo / Title */}
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-zinc-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Dashboard
            </h1>
            <p className="text-xs text-zinc-500 capitalize">{user.role} Portal</p>
          </div>

          {/* User Profile Section */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm font-medium text-zinc-700" data-testid="user-name">
              {user.name}
            </span>
            
            <div className="relative group">
              <button 
                className="flex items-center gap-2 px-2 py-1.5 h-auto rounded-full hover:bg-zinc-100 transition-colors"
                data-testid="profile-dropdown-trigger"
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-zinc-200">
                  {user.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <ChevronDown className="h-4 w-4 text-zinc-500" />
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-zinc-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200" data-testid="profile-dropdown-menu">
                <div className="p-4 border-b border-zinc-200">
                  <p className="text-sm font-medium text-zinc-900">{user.name}</p>
                  <p className="text-xs text-zinc-500">{user.email}</p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full px-4 py-2 text-sm text-left hover:bg-zinc-100 flex items-center gap-2"
                    data-testid="profile-settings-btn"
                  >
                    <Settings className="h-4 w-4" />
                    Profile Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm text-left hover:bg-red-50 text-red-600 flex items-center gap-2"
                    data-testid="logout-btn"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Dashboard Blocks */}
      <main className="p-6 md:p-8 lg:p-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 auto-rows-min">
          {dashboardBlocks.map((block) => {
            const IconComponent = block.icon;
            return (
              <div
                key={block.id}
                onClick={() => handleCardClick(block)}
                className={`
                  group relative overflow-hidden rounded-3xl border-2 cursor-pointer
                  ${block.styles.bg} ${block.styles.border} ${block.styles.hover}
                  ${block.span}
                  p-6 md:p-8 min-h-[180px] md:min-h-[200px]
                  transition-all duration-300 ease-out hover:shadow-xl
                `}
                data-testid={`${block.id}-card`}
              >
                {/* Background image */}
                {block.bgImage && (
                  <img 
                    src={block.bgImage} 
                    alt={block.name}
                    className="absolute right-0 bottom-0 h-full w-auto max-w-[65%] opacity-40 object-cover transition-transform duration-500 group-hover:scale-110 group-hover:opacity-50"
                  />
                )}
                
                <div className="flex flex-col h-full justify-between relative z-10">
                  {/* Icon with circle background */}
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${block.styles.iconBg} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3`}>
                    <IconComponent className="h-7 w-7 md:h-8 md:w-8 text-white" />
                  </div>
                  
                  <div>
                    <h2 
                      className={`text-2xl md:text-3xl font-bold tracking-tight ${block.styles.text}`}
                      style={{ fontFamily: 'Manrope, sans-serif' }}
                    >
                      {block.name}
                    </h2>
                    <p className={`text-sm mt-1 ${block.styles.text} font-medium opacity-80`}>
                      {block.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
