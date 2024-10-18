import React, { useState, useEffect } from 'react';
import { Menu, ShoppingCart, ChefHat, LogIn } from 'lucide-react';
import CustomerOrder from './components/CustomerOrder';
import KitchenView from './components/KitchenView';
import LoginRegister from './components/LoginRegister';
import { databaseService } from './services/DatabaseService';

type View = 'customer' | 'kitchen' | 'login';
type UserRole = 'client' | 'admin' | null;

function App() {
  const [view, setView] = useState<View>('login');
  const [userRole, setUserRole] = useState<UserRole>(null);

  useEffect(() => {
    const checkLoggedInUser = async () => {
      const user = await databaseService.getLoggedInUser();
      if (user) {
        setUserRole(user.role);
        setView(user.role === 'admin' ? 'kitchen' : 'customer');
      }
    };
    checkLoggedInUser();
  }, []);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setView(role === 'admin' ? 'kitchen' : 'customer');
  };

  const handleLogout = async () => {
    await databaseService.logout();
    setUserRole(null);
    setView('login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <Menu className="mr-2" /> Restaurant App
          </h1>
          {userRole && (
            <div className="flex items-center">
              {userRole === 'admin' && (
                <button
                  onClick={() => setView(view === 'kitchen' ? 'customer' : 'kitchen')}
                  className="bg-white text-blue-600 px-4 py-2 rounded-full flex items-center mr-4"
                >
                  {view === 'kitchen' ? (
                    <>
                      <ShoppingCart className="mr-2" /> Vue Client
                    </>
                  ) : (
                    <>
                      <ChefHat className="mr-2" /> Vue Cuisine
                    </>
                  )}
                </button>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-full flex items-center"
              >
                <LogIn className="mr-2" /> Déconnexion
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="container mx-auto mt-8 p-4">
        {view === 'login' && <LoginRegister onLogin={handleLogin} />}
        {view === 'customer' && <CustomerOrder />}
        {view === 'kitchen' && <KitchenView />}
      </main>
    </div>
  );
}

export default App;