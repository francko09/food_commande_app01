import React, { useState, useEffect } from 'react';
import { Check, Clock, Plus, Trash } from 'lucide-react';
import { databaseService } from '../services/DatabaseService';

interface Order {
  id: number;
  username: string;
  items: { id: number; quantity: number }[];
  status: 'pending' | 'ready' | 'served';
  timestamp: Date;
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  image: string;
}

const KitchenView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [newItem, setNewItem] = useState({ name: '', price: '', image: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const loadedOrders = await databaseService.getOrders();
      setOrders(loadedOrders);
      const loadedMenuItems = await databaseService.getMenuItems();
      setMenuItems(loadedMenuItems);
    };
    loadData();

    const interval = setInterval(loadData, 5000);

    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (orderId: number, newStatus: 'ready' | 'served') => {
    await databaseService.updateOrderStatus(orderId, newStatus);
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const newMenuItem: MenuItem = {
      id: Date.now(),
      name: newItem.name,
      price: parseFloat(newItem.price),
      image: newItem.image,
    };
    await databaseService.addMenuItem(newMenuItem);
    setMenuItems([...menuItems, newMenuItem]);
    setNewItem({ name: '', price: '', image: '' });
    setShowAddForm(false);
  };

  const handleRemoveItem = async (itemId: number) => {
    await databaseService.removeMenuItem(itemId);
    setMenuItems(menuItems.filter((item) => item.id !== itemId));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Gestion du Menu</h2>
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="bg-blue-500 text-white px-4 py-2 rounded-full mb-4 flex items-center"
      >
        <Plus size={16} className="mr-2" /> Ajouter un plat
      </button>
      {showAddForm && (
        <form onSubmit={handleAddItem} className="mb-8 bg-white p-4 rounded-lg shadow">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
              Nom du plat
            </label>
            <input
              type="text"
              id="name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="price" className="block text-gray-700 font-bold mb-2">
              Prix
            </label>
            <input
              type="number"
              id="price"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="image" className="block text-gray-700 font-bold mb-2">
              URL de l'image
            </label>
            <input
              type="url"
              id="image"
              value={newItem.image}
              onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded-full"
          >
            Ajouter le plat
          </button>
        </form>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md p-4">
            <img src={item.image} alt={item.name} className="w-full h-48 object-cover rounded-md mb-2" />
            <h3 className="text-lg font-semibold">{item.name}</h3>
            <p className="text-gray-600">{item.price.toFixed(2)} €</p>
            <button
              onClick={() => handleRemoveItem(item.id)}
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded-full flex items-center"
            >
              <Trash size={16} className="mr-2" /> Retirer
            </button>
          </div>
        ))}
      </div>
      <h2 className="text-2xl font-bold mb-4">Commandes en cuisine</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className={`bg-white p-4 rounded-lg shadow ${
              order.status === 'pending'
                ? 'border-l-4 border-yellow-500'
                : order.status === 'ready'
                ? 'border-l-4 border-green-500'
                : 'border-l-4 border-blue-500'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold">Commande #{order.id}</span>
              <span className="text-sm text-gray-500">
                {new Date(order.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="mb-2 text-sm text-gray-600">
              Client: {order.username}
            </div>
            <ul className="mb-4">
              {order.items.map((item) => {
                const menuItem = menuItems.find((mi) => mi.id === item.id);
                return (
                  <li key={item.id}>
                    {menuItem ? menuItem.name : `Item #${item.id}`} x{item.quantity}
                  </li>
                );
              })}
            </ul>
            {order.status === 'pending' && (
              <button
                onClick={() => updateOrderStatus(order.id, 'ready')}
                className="bg-green-500 text-white px-4 py-2 rounded-full w-full flex items-center justify-center"
              >
                <Check size={16} className="mr-2" /> Marquer comme prêt
              </button>
            )}
            {order.status === 'ready' && (
              <button
                onClick={() => updateOrderStatus(order.id, 'served')}
                className="bg-blue-500 text-white px-4 py-2 rounded-full w-full flex items-center justify-center"
              >
                <Clock size={16} className="mr-2" /> Marquer comme servi
              </button>
            )}
            {order.status === 'served' && (
              <div className="text-center text-green-600 font-bold">Commande servie</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KitchenView;