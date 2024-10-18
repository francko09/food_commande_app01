import React, { useState } from 'react';
import { databaseService } from '../services/DatabaseService';

interface LoginRegisterProps {
  onLogin: (role: 'client' | 'admin') => void;
}

const LoginRegister: React.FC<LoginRegisterProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'admin'>('client');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      const user = await databaseService.login(username, password);
      if (user) {
        onLogin(user.role);
      } else {
        alert('Identifiants incorrects');
      }
    } else {
      const success = await databaseService.register(username, password, role);
      if (success) {
        alert('Inscription réussie. Vous pouvez maintenant vous connecter.');
        setIsLogin(true);
      } else {
        alert('Erreur lors de l\'inscription. Veuillez réessayer.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isLogin ? 'Connexion' : 'Inscription'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 font-bold mb-2">
            Nom d'utilisateur
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 font-bold mb-2">
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        {!isLogin && (
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Rôle</label>
            <div className="flex">
              <label className="inline-flex items-center mr-4">
                <input
                  type="radio"
                  value="client"
                  checked={role === 'client'}
                  onChange={() => setRole('client')}
                  className="form-radio"
                />
                <span className="ml-2">Client</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={() => setRole('admin')}
                  className="form-radio"
                />
                <span className="ml-2">Administrateur</span>
              </label>
            </div>
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
        >
          {isLogin ? 'Se connecter' : 'S\'inscrire'}
        </button>
      </form>
      <p className="mt-4 text-center">
        {isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="ml-1 text-blue-500 hover:underline"
        >
          {isLogin ? 'S\'inscrire' : 'Se connecter'}
        </button>
      </p>
    </div>
  );
};

export default LoginRegister;