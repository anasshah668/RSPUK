import React from 'react';
import { useCart } from '../context/CartContext';

const CartDropdown = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  if (!isOpen) return null;

  const total = getCartTotal();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Dropdown */}
      <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl z-50 border border-gray-100 max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h3 
            className="text-lg font-bold text-gray-900"
          >
            Shopping Cart
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p 
                className="text-gray-500 mb-2"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Your cart is empty
              </p>
              <p 
                className="text-sm text-gray-400"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Add items to get started
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.lineId || item.id}
                  className="flex gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name || item.title || 'Item'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const label = item.name || item.title || 'Item';
                        e.target.src = 'https://via.placeholder.com/80x80?text=' + encodeURIComponent(label);
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 
                      className="font-semibold text-gray-900 mb-1 truncate"
                    >
                      {item.name || item.title || 'Item'}
                    </h4>
                    <p 
                      className="text-sm text-gray-500 mb-2"
                      style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                    >
                      {item.category || item.type || ''}
                    </p>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.lineId || item.id, item.quantity - 1)}
                          className="px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span 
                          className="px-3 py-1 text-sm font-medium text-gray-900 min-w-[3rem] text-center"
                          style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.lineId || item.id, item.quantity + 1)}
                          className="px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>

                      <div className="flex-1">
                        <p 
                          className="font-bold text-gray-900"
                          style={{ fontFamily: 'Lexend Deca, sans-serif' }}
                        >
                          £{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.lineId || item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                        title="Remove item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <span 
                className="text-lg font-semibold text-gray-700"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Subtotal:
              </span>
              <span 
                className="text-xl font-bold text-gray-900"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                £{total.toFixed(2)}
              </span>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => {
                  // Navigate to checkout
                  onClose();
                }}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Checkout
              </button>
              <button
                onClick={() => {
                  clearCart();
                  onClose();
                }}
                className="w-full py-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                style={{ fontFamily: 'Lexend Deca, sans-serif' }}
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDropdown;
