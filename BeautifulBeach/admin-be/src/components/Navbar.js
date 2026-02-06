import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaSearch } from "react-icons/fa";
import { listRegion, url, accountDetal } from "../api/function";

function Navbar() {
  const [inputValue, setInputValue] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [regions, setRegions] = useState([]);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    fetchDataRegion();
  }, []);

  const fetchDataRegion = async () => {
    try {
      const rs = await listRegion();
      setRegions(rs.data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchDataUser = async () => {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("user");

      if (token && username) {
        setUser(username);

        const storedAvatar = localStorage.getItem("avatar");
        if (storedAvatar && storedAvatar !== "null" && storedAvatar !== "undefined") {
          setAvatarUrl(storedAvatar.startsWith('http') ? storedAvatar : url + storedAvatar);
        }

        try {
          const rs = await accountDetal();
          if (rs?.data?.data?.avatar) {
            const serverAvatar = rs.data.data.avatar;
            localStorage.setItem("avatar", serverAvatar);
            setAvatarUrl(serverAvatar.startsWith('http') ? serverAvatar : url + serverAvatar);
          }
        } catch (error) {
          console.error("Lỗi lấy avatar:", error);
          if (!storedAvatar) {
            setAvatarUrl(`https://ui-avatars.com/api/?name=${username}&background=random&color=fff&size=128`);
          }
        }
      }
    };

    fetchDataUser();
  }, []);

  const handleSearch = () => {
    navigate("/seach-beaches/" + inputValue);
  };

  const handleSelectRegion = (regionId) => {
    navigate(`/region/${regionId}`);
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("avatar"); 
    setUser(null);
    setAvatarUrl(null);
    window.location.reload();
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4 py-3 lg:px-12 transition-colors duration-300 shadow-sm relative z-50">
      <div className="flex items-center justify-between h-10">

        <div className="flex items-center z-50">
          <div
            className="flex items-center text-lg md:text-xl font-bold text-blue-600 cursor-pointer"
            onClick={() => navigate("/")}
          >
            🌴 SeaView
          </div>
          <button
            className="ml-4 text-2xl lg:hidden text-gray-700 dark:text-gray-200 focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <FaBars />
          </button>
        </div>

        <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2">
          <ul className="flex space-x-8 font-medium text-base">
            <li>
              <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Home
              </Link>
            </li>

            <li 
              className="relative group h-full flex items-center"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button
                className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center focus:outline-none transition-colors h-full"
              >
                Region ▾
              </button>

              {dropdownOpen && (

                <div className="absolute top-full left-0 pt-3 w-48">
                  <ul className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xl overflow-hidden py-1">
                    <li
                      className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => handleSelectRegion("all")}
                    >
                      All
                    </li>
                    {regions.map((r) => (
                      <li
                        key={r.id}
                        className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        onClick={() => handleSelectRegion(r.id)}
                      >
                        {r.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>

            <li>
              <Link to="/favorite" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Featured Beaches
              </Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Profile
              </Link>
            </li>
          </ul>
        </div>

        <div className="hidden lg:flex items-center space-x-5 z-50">
          <button 
            className="text-xl focus:outline-none hover:rotate-12 transition-transform text-yellow-500 dark:text-yellow-300" 
            onClick={toggleDarkMode}
          >
            {darkMode ? "🌙" : "☀️"}
          </button>

          {!user ? (
            <button
              onClick={() => navigate("/login-account")}
              className="bg-blue-600 text-white px-5 py-1.5 rounded-full hover:bg-blue-700 transition-all shadow-md font-medium text-sm"
            >
              Login
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <img 
                src={avatarUrl} 
                alt={user}
                title={user}
                className="w-9 h-9 rounded-full object-cover border-2 border-blue-500 shadow-sm cursor-pointer"
                onError={(e) => {e.target.onerror = null; e.target.src="https://via.placeholder.com/40?text=U"}}
              />
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-1.5 rounded-full hover:bg-red-600 transition-all shadow-md text-sm"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`${menuOpen ? "block" : "hidden"} lg:hidden mt-3 transition-all duration-300`}>
        <ul className="space-y-2 font-medium border-t dark:border-gray-700 pt-4">
          <li>
            <Link to="/" className="block px-4 py-2 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              Home
            </Link>
          </li>

          <li className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="block w-full text-left px-4 py-2 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Region ▾
            </button>
            {dropdownOpen && (
              <ul className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-600 pl-2">
                <li
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded"
                  onClick={() => handleSelectRegion("all")}
                >
                  All
                </li>
                {regions.map((r) => (
                  <li
                    key={r.id}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded"
                    onClick={() => handleSelectRegion(r.id)}
                  >
                    {r.name}
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li>
            <Link
              to="/featured"
              className="block px-4 py-2 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Featured Beaches
            </Link>
          </li>
          <li>
            <Link to="/contact" className="block px-4 py-2 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              Contact
            </Link>
          </li>
        </ul>

        <div className="mt-4 space-y-4 pb-4">
          <div className="px-4 flex items-center justify-between">
               <span className="text-sm text-gray-500 dark:text-gray-400">Appearance</span>
               <button className="text-2xl" onClick={toggleDarkMode}>
                {darkMode ? "🌙" : "☀️"}
              </button>
          </div>
       
          <div className="flex border dark:border-gray-600 rounded-lg overflow-hidden mx-4">
            <input
              type="text"
              placeholder="Search beaches..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="px-3 py-2 outline-none flex-1 text-sm bg-white dark:bg-gray-800 dark:text-white"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-4 hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
          
          <div className="px-4">
            {!user ? (
              <button
                onClick={() => navigate("/login-account")}
                className="bg-green-600 text-white w-full py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Login
              </button>
            ) : (
              <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700 mt-2">
                <div className="flex items-center space-x-3">
                  <img 
                    src={avatarUrl} 
                    alt={user} 
                    className="w-10 h-10 rounded-full object-cover border border-gray-300"
                    onError={(e) => {e.target.onerror = null; e.target.src="https://via.placeholder.com/40?text=U"}}
                  />
                  <span className="text-gray-700 dark:text-gray-200 font-medium truncate max-w-[150px]">
                    {user}
                  </span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 transition-all shadow-md text-sm"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;