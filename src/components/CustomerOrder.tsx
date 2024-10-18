import React, { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { databaseService } from '../services/DatabaseService';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  image: string;
}

const CustomerOrder: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [order, setOrder] = useState<{ [key: number]: number }>({});
  const [showCart, setShowCart] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const loadMenuItems = async () => {
      const items = await databaseService.getMenuItems();
      if (items.length === 0) {
        // Si la base de données est vide, ajoutons quelques éléments par défaut
        const defaultItems: MenuItem[] = [
          { id: 1, name: 'Burger', price: 10, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
          { id: 2, name: 'Pizza', price: 12, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
          { id: 3, name: 'Salade', price: 8, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
          { id: 4, name: 'Frites', price: 4, image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
          { id: 5, name: 'Boisson', price: 2, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        ];
        for (const item of defaultItems) {
          await databaseService.addMenuItem(item);
        }
        setMenuItems(defaultItems);
      } else {
        setMenuItems(items);
      }
    };
    loadMenuItems();

    const getUsername = async () => {
      const user = await databaseService.getLoggedInUser();
      if (user) {
        setUsername(user.username);
      }
    };
    getUsername();
  }, []);

  const addToOrder = (itemId: number) => {
    setOrder((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const removeFromOrder = (itemId: number) => {
    setOrder((prev) => {
      const newOrder = { ...prev };
      if (newOrder[itemId] > 1) {
        newOrder[itemId]--;
      } else {
        delete newOrder[itemId];
      }
      return newOrder;
    });
  };

  const totalPrice = Object.entries(order).reduce((total, [itemId, quantity]) => {
    const item = menuItems.find((i) => i.id === parseInt(itemId));
    return total + (item ? item.price * quantity : 0);
  }, 0);

  const submitOrder = async () => {
    const newOrder = {
      id: Date.now(),
      username: username,
      items: Object.entries(order).map(([itemId, quantity]) => ({
        id: parseInt(itemId),
        quantity,
      })),
      status: 'pending' as const,
      timestamp: new Date(),
    };
    await databaseService.addOrder(newOrder);
    alert('Votre commande a été soumise avec succès !');
    setOrder({});
    setShowCart(false);
  };

  return (
    <div className="container mx-auto p-4 pb-20">
      <h2 className="text-2xl font-bold mb-4">Menu</h2>
      {menuItems.length === 0 ? (
        <p>Chargement du menu...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-4">
              <img src={item.image} alt={item.name} className="w-full h-48 object-cover rounded-md mb-2" />
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-gray-600">{item.price.toFixed(2)} €</p>
              <div className="mt-2 flex justify-between items-center">
                <button
                  onClick={() => removeFromOrder(item.id)}
                  className="bg-red-500 text-white p-2 rounded-full"
                  disabled={!order[item.id]}
                >
                  <Minus size={16} />
                </button>
                <span>{order[item.id] || 0}</span>
                <button
                  onClick={() => addToOrder(item.id)}
                  className="bg-green-500 text-white p-2 rounded-full"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md p-4">
        <div className="container mx-auto">
          <button
            onClick={() => setShowCart(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-full flex items-center justify-center w-full"
          >
            <ShoppingCart className="mr-2" /> Voir la commande ({Object.values(order).reduce((a, b) => a + b, 0)})
          </button>
        </div>
      </div>
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Votre commande</h3>
            {Object.entries(order).map(([itemId, quantity]) => {
              const item = menuItems.find((i) => i.id === parseInt(itemId));
              return item ? (
                <div key={itemId} className="flex justify-between mb-2">
                  <span>{item.name} x {quantity}</span>
                  <span>{(item.price * quantity).toFixed(2)} €</span>
                </div>
              ) : null;
            })}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{totalPrice.toFixed(2)} €</span>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowCart(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded-full mr-2"
              >
                Fermer
              </button>
              <button
                onClick={submitOrder}
                className="bg-green-500 text-white px-4 py-2 rounded-full"
              >
                Commander
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrder;