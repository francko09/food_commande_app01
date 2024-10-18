import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface Order {
  id: number;
  username: string;
  items: { id: number; quantity: number }[];
  status: 'pending' | 'ready' | 'served';
  timestamp: Date;
}

interface User {
  username: string;
  password: string;
  role: 'client' | 'admin';
}

interface RestaurantDB extends DBSchema {
  menu: {
    key: number;
    value: MenuItem;
  };
  orders: {
    key: number;
    value: Order;
  };
  users: {
    key: string;
    value: User;
  };
  session: {
    key: string;
    value: User;
  };
}

class DatabaseService {
  private db: IDBPDatabase<RestaurantDB> | null = null;

  async init() {
    this.db = await openDB<RestaurantDB>('RestaurantDB', 2, {
      upgrade(db, oldVersion, newVersion, transaction) {
        if (oldVersion < 1) {
          db.createObjectStore('menu', { keyPath: 'id' });
          db.createObjectStore('orders', { keyPath: 'id' });
        }
        if (oldVersion < 2) {
          db.createObjectStore('users', { keyPath: 'username' });
          db.createObjectStore('session', { keyPath: 'username' });
        }
      },
    });
  }

  async getMenuItems(): Promise<MenuItem[]> {
    if (!this.db) await this.init();
    return this.db!.getAll('menu');
  }

  async addMenuItem(item: MenuItem): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.put('menu', item);
  }

  async removeMenuItem(itemId: number): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.delete('menu', itemId);
  }

  async getOrders(): Promise<Order[]> {
    if (!this.db) await this.init();
    return this.db!.getAll('orders');
  }

  async addOrder(order: Order): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.put('orders', order);
  }

  async updateOrderStatus(orderId: number, status: 'pending' | 'ready' | 'served'): Promise<void> {
    if (!this.db) await this.init();
    const order = await this.db!.get('orders', orderId);
    if (order) {
      order.status = status;
      await this.db!.put('orders', order);
    }
  }

  async register(username: string, password: string, role: 'client' | 'admin'): Promise<boolean> {
    if (!this.db) await this.init();
    const existingUser = await this.db!.get('users', username);
    if (existingUser) {
      return false;
    }
    await this.db!.put('users', { username, password, role });
    return true;
  }

  async login(username: string, password: string): Promise<User | null> {
    if (!this.db) await this.init();
    const user = await this.db!.get('users', username);
    if (user && user.password === password) {
      await this.db!.put('session', user);
      return user;
    }
    return null;
  }

  async logout(): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.clear('session');
  }

  async getLoggedInUser(): Promise<User | null> {
    if (!this.db) await this.init();
    const users = await this.db!.getAll('session');
    return users.length > 0 ? users[0] : null;
  }
}

export const databaseService = new DatabaseService();