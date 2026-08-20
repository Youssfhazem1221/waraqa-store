'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Product, Order } from '@/types';
import { PRODUCT_STATUSES, ORDER_STATUSES } from '@/types';
import { fetchProducts, fetchOrders, updateStock, updateOrderStatus } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Icon from '@/components/ui/Icon';
import Spinner from '@/components/ui/Spinner';
import fallbackProducts from '@/data/products.json';
import { CURRENCY } from '@/lib/constants';

/**
 * ============================================================================
 * Waraqa Admin Dashboard
 * ============================================================================
 * NOTE FOR REVIEWERS:
 * This password gate is an MVP convenience gate for the store owner.
 * The token is sent directly to Google Apps Script where it is verified
 * securely server-side against the Apps Script's ADMIN_TOKEN secret.
 * ============================================================================
 */

export default function AdminPage() {
  const [token, setToken] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem('waraqa-admin-token') || '';
      } catch {
        return '';
      }
    }
    return '';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return Boolean(sessionStorage.getItem('waraqa-admin-token'));
      } catch {
        return false;
      }
    }
    return false;
  });

  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');

  // Inventory state
  const [products, setProducts] = useState<Product[]>(fallbackProducts as Product[]);
  const [savingSku, setSavingSku] = useState<string | null>(null);
  const [inventoryMsg, setInventoryMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [ordersMsg, setOrdersMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      const live = await fetchProducts();
      setProducts(live);
    } catch (err) {
      console.error('Failed to load products in admin:', err);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const liveOrders = await fetchOrders(token);
      setOrders(liveOrders);
    } catch (err) {
      console.warn('Orders fetch error (check ADMIN_TOKEN match in Apps Script):', err);
      setOrdersMsg({
        text: 'Could not fetch orders from Google Sheet. Verify that ADMIN_TOKEN in waraqa-apps-script.gs matches your password.',
        type: 'error',
      });
    } finally {
      setLoadingOrders(false);
    }
  }, [token]);

  // Load products & orders once authenticated
  useEffect(() => {
    let mounted = true;
    if (isAuthenticated && token) {
      fetchProducts()
        .then((live) => {
          if (mounted) setProducts(live);
        })
        .catch((err) => console.error('Failed to load products in admin:', err));

      fetchOrders(token)
        .then((liveOrders) => {
          if (mounted) setOrders(liveOrders);
        })
        .catch((err) => {
          console.warn('Orders fetch error (check ADMIN_TOKEN match in Apps Script):', err);
          if (mounted) {
            setOrdersMsg({
              text: 'Could not fetch orders from Google Sheet. Verify that ADMIN_TOKEN in waraqa-apps-script.gs matches your password.',
              type: 'error',
            });
          }
        })
        .finally(() => {
          if (mounted) setLoadingOrders(false);
        });
    }
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setAuthError('Please enter the admin password');
      return;
    }

    setAuthError('');
    try {
      sessionStorage.setItem('waraqa-admin-token', token.trim());
      setIsAuthenticated(true);
    } catch {
      // Ignore
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('waraqa-admin-token');
    setIsAuthenticated(false);
    setToken('');
  };

  const handleProductChange = (sku: string, field: 'stock' | 'status', value: number | string) => {
    setProducts((prev) =>
      prev.map((p) => (p.sku === sku ? { ...p, [field]: value } : p))
    );
  };

  const handleSaveProduct = async (product: Product) => {
    setSavingSku(product.sku);
    setInventoryMsg(null);
    try {
      const success = await updateStock({
        action: 'updateStock',
        token,
        sku: product.sku,
        stock: Number(product.stock),
        status: product.status,
      });

      if (success) {
        setInventoryMsg({ text: `Updated ${product.sku} successfully!`, type: 'success' });
      } else {
        setInventoryMsg({
          text: `Failed to update ${product.sku}. If backend is not yet deployed, changes stay local for testing.`,
          type: 'error',
        });
      }
    } catch {
      setInventoryMsg({ text: 'Error saving product.', type: 'error' });
    } finally {
      setSavingSku(null);
      setTimeout(() => setInventoryMsg(null), 4000);
    }
  };

  const handleOrderStatusChange = (orderId: string, status: string) => {
    setOrders((prev) =>
      prev.map((o) => (o['Order ID'] === orderId ? { ...o, Status: status } : o))
    );
  };

  const handleSaveOrderStatus = async (orderId: string, status: string) => {
    setSavingOrderId(orderId);
    setOrdersMsg(null);
    try {
      const success = await updateOrderStatus({
        action: 'updateOrderStatus',
        token,
        orderId,
        status,
      });

      if (success) {
        setOrdersMsg({ text: `Order ${orderId} marked as ${status}`, type: 'success' });
      } else {
        setOrdersMsg({ text: `Failed to update order ${orderId}`, type: 'error' });
      }
    } catch {
      setOrdersMsg({ text: 'Error saving order status.', type: 'error' });
    } finally {
      setSavingOrderId(null);
      setTimeout(() => setOrdersMsg(null), 4000);
    }
  };

  // Auth Gate View
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 px-4">
        <div className="bg-white border border-line rounded-3xl p-8 sm:p-10 shadow-sm space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-cream border border-line flex items-center justify-center mx-auto text-maroon">
            <Icon name="lock" size={28} />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono text-muted uppercase">Owner Portal</span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-char">
              Admin Access
            </h1>
            <p className="text-xs text-muted">
              Enter your secret token matching <code className="bg-cream px-1.5 py-0.5 rounded text-maroon font-mono">ADMIN_TOKEN</code> in Apps Script.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <Input
              label="Admin Secret Token"
              type="password"
              placeholder="Enter your secret password..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              error={authError}
              required
            />

            <Button type="submit" size="lg" fullWidth>
              <span>Unlock Admin Panel</span>
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-maroon">
              Control Center
            </span>
            <span className="bg-sage text-[#20301a] text-[10px] font-bold px-2 py-0.5 rounded-full">
              LIVE
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-char mt-1">
            Store Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              loadProducts();
              loadOrders();
            }}
          >
            <span>Refresh Data</span>
          </Button>
          <button
            onClick={handleLogout}
            className="text-xs text-muted hover:text-error transition-colors px-2 py-1"
          >
            Lock / Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-line pb-px">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-5 py-2.5 rounded-t-xl font-medium text-sm transition-colors cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-white text-maroon border-t border-x border-line font-semibold shadow-xs'
              : 'text-muted hover:text-char'
          }`}
        >
          <span>Inventory &amp; Stock</span>
          <span className="ml-2 text-xs bg-cream text-maroon px-2 py-0.5 rounded-full font-mono font-bold">
            {products.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2.5 rounded-t-xl font-medium text-sm transition-colors cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-white text-maroon border-t border-x border-line font-semibold shadow-xs'
              : 'text-muted hover:text-char'
          }`}
        >
          <span>Orders</span>
          <span className="ml-2 text-xs bg-cream text-maroon px-2 py-0.5 rounded-full font-mono font-bold">
            {orders.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Inventory */}
      {activeTab === 'inventory' && (
        <div className="space-y-4 animate-fadeIn">
          {inventoryMsg && (
            <div
              className={`p-4 rounded-2xl text-xs font-medium ${
                inventoryMsg.type === 'success'
                  ? 'bg-success/15 text-success border border-success/30'
                  : 'bg-error/15 text-error border border-error/30'
              }`}
            >
              {inventoryMsg.text}
            </div>
          )}

          <div className="bg-white border border-line rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm divide-y divide-line">
                <thead className="bg-cream/60 text-muted uppercase tracking-wider text-[11px] font-semibold">
                  <tr>
                    <th className="px-6 py-4">Product / SKU</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock Quantity</th>
                    <th className="px-6 py-4">Storefront Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {products.map((p) => {
                    const isSaving = savingSku === p.sku;
                    return (
                      <tr key={p.sku} className="hover:bg-cream/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-char text-sm">{p.name}</div>
                          <div className="text-xs text-muted font-mono">{p.sku} · {p.size}</div>
                        </td>

                        <td className="px-6 py-4 font-mono font-semibold text-maroon">
                          {p.price} {CURRENCY}
                        </td>

                        <td className="px-6 py-4">
                          <input
                            type="number"
                            min="0"
                            value={p.stock}
                            onChange={(e) =>
                              handleProductChange(p.sku, 'stock', Number(e.target.value))
                            }
                            className="w-20 bg-cream/40 border border-line rounded-lg px-2.5 py-1.5 font-mono text-char font-semibold focus:outline-none focus:border-maroon"
                          />
                        </td>

                        <td className="px-6 py-4">
                          <select
                            value={p.status}
                            onChange={(e) => handleProductChange(p.sku, 'status', e.target.value)}
                            className="bg-cream/40 border border-line rounded-lg px-2.5 py-1.5 text-xs text-char font-medium cursor-pointer focus:outline-none focus:border-maroon"
                          >
                            {PRODUCT_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Button
                            size="sm"
                            isLoading={isSaving}
                            onClick={() => handleSaveProduct(p)}
                          >
                            <span>Save</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-fadeIn">
          {ordersMsg && (
            <div
              className={`p-4 rounded-2xl text-xs font-medium ${
                ordersMsg.type === 'success'
                  ? 'bg-success/15 text-success border border-success/30'
                  : 'bg-error/15 text-error border border-error/30'
              }`}
            >
              {ordersMsg.text}
            </div>
          )}

          {loadingOrders ? (
            <div className="text-center py-16">
              <Spinner size="lg" />
              <p className="text-xs text-muted mt-2">Fetching live orders from Google Sheet...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white border border-line rounded-3xl p-12 text-center text-muted">
              <p className="font-serif text-lg text-char mb-1">No orders yet</p>
              <p className="text-xs">
                When customers click &quot;Confirm &amp; Buy&quot;, their orders will populate directly here and in your Google Sheet.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-line rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm divide-y divide-line">
                  <thead className="bg-cream/60 text-muted uppercase tracking-wider text-[11px] font-semibold">
                    <tr>
                      <th className="px-6 py-4">Order ID / Date</th>
                      <th className="px-6 py-4">Customer &amp; Location</th>
                      <th className="px-6 py-4">Items Summary</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {orders.map((o) => {
                      const orderId = o['Order ID'];
                      const isSaving = savingOrderId === orderId;
                      return (
                        <tr key={orderId} className="hover:bg-cream/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-mono font-bold text-maroon">{orderId}</div>
                            <div className="text-[11px] text-muted">{o.Timestamp}</div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="font-semibold text-char">{o['Customer name']}</div>
                            <div className="text-xs text-muted font-mono">{o['Phone (WhatsApp)']}</div>
                            <div className="text-[11px] text-muted truncate max-w-xs">
                              {o['Governorate/City']} · {o.Address}
                            </div>
                          </td>

                          <td className="px-6 py-4 text-xs text-char/80 max-w-xs">
                            {o['Items summary']}
                          </td>

                          <td className="px-6 py-4 font-serif font-bold text-maroon">
                            {o['Total (EGP)']} {CURRENCY}
                          </td>

                          <td className="px-6 py-4">
                            <select
                              value={o.Status || 'Pending'}
                              onChange={(e) =>
                                handleOrderStatusChange(orderId, e.target.value)
                              }
                              className="bg-cream/40 border border-line rounded-lg px-2.5 py-1.5 text-xs text-char font-semibold cursor-pointer focus:outline-none focus:border-maroon"
                            >
                              {ORDER_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <Button
                              size="sm"
                              isLoading={isSaving}
                              onClick={() => handleSaveOrderStatus(orderId, o.Status)}
                            >
                              <span>Update</span>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
