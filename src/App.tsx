import React, { useState, useEffect } from 'react';
import { useZxing } from 'react-zxing';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Barcode, Search, X, Camera, Package, Moon, Sun } from 'lucide-react';

interface FoodProduct {
  product_name: string;
  brands: string;
  ingredients_text: string;
  nutriments: {
    energy_100g: number;
    proteins_100g: number;
    carbohydrates_100g: number;
    fat_100g: number;
  };
  image_url: string;
}

function App() {
  const [barcode, setBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [product, setProduct] = useState<FoodProduct | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const { ref } = useZxing({
    onDecodeResult: async (result) => {
      setBarcode(result.getText());
      setIsScanning(false);
      await searchProduct(result.getText());
    },
    constraints: {
      facingMode: 'environment'
    },
  });

  const searchProduct = async (code: string) => {
    if (!code.trim()) {
      setError('Please enter a barcode number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        `https://world.openfoodfacts.org/api/v0/product/${code}.json`
      );
      if (response.data.status === 1) {
        setProduct(response.data.product);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      setError('Error fetching product information');
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100'}`}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-4 right-4 p-3 rounded-full bg-opacity-80 backdrop-blur-sm shadow-lg z-50"
        style={{
          background: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        }}
      >
        {darkMode ? (
          <Sun className="w-6 h-6 text-yellow-300" />
        ) : (
          <Moon className="w-6 h-6 text-purple-600" />
        )}
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-8 md:py-12 max-w-4xl"
      >
        <div className="text-center mb-8 md:mb-16">
          <motion.h1
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className={`text-4xl md:text-6xl font-bold mb-4 md:mb-6 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}
          >
            foodinfo.co.za
          </motion.h1>
          <p className={`text-lg md:text-xl px-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            find out what's in your food, type in your barcode to get started
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`rounded-2xl shadow-xl p-4 md:p-8 mb-8 transition-colors duration-300 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Enter barcode number"
                className={`w-full px-4 py-3 rounded-lg border transition-colors duration-300 ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'border-purple-200 focus:border-purple-500'
                } focus:outline-none`}
              />
            </div>
            <div className="flex gap-2 w-full">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => searchProduct(barcode)}
                className={`flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors duration-300 ${
                  darkMode
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-purple-500 hover:bg-purple-600'
                } text-white`}
              >
                <Search size={20} />
                <span className="hidden md:inline">Search</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsScanning(!isScanning)}
                className={`flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors duration-300 ${
                  darkMode
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
              >
                {isScanning ? <X size={20} /> : <Camera size={20} />}
                <span className="hidden md:inline">{isScanning ? 'Stop' : 'Scan'}</span>
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <video
                  ref={ref}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <p className={`text-center mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Point your camera at a barcode
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {loading && (
            <div className="text-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Package size={40} className={`mx-auto ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
              </motion.div>
              <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Searching for product...
              </p>
            </div>
          )}

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`p-4 rounded-lg mb-6 ${
                  darkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-600'
                }`}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {product && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`rounded-xl p-4 md:p-6 transition-colors duration-300 ${
                  darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-purple-50 to-blue-50'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {product.image_url && (
                    <motion.div className="relative w-full aspect-square md:aspect-auto md:h-64">
                      <motion.img
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        src={product.image_url}
                        alt={product.product_name}
                        className="w-full h-full object-cover rounded-lg shadow-md"
                      />
                    </motion.div>
                  )}
                  <div>
                    <h2 className={`text-xl md:text-2xl font-bold mb-4 ${
                      darkMode ? 'text-purple-300' : 'text-purple-600'
                    }`}>
                      {product.product_name}
                    </h2>
                    {product.brands && (
                      <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Brand: {product.brands}
                      </p>
                    )}
                    <div className="space-y-4">
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className={`p-4 rounded-lg shadow-sm ${
                          darkMode ? 'bg-gray-800' : 'bg-white'
                        }`}
                      >
                        <h3 className={`font-semibold mb-2 ${
                          darkMode ? 'text-purple-300' : 'text-purple-500'
                        }`}>
                          Nutrition per 100g
                        </h3>
                        <ul className={`space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <li>Energy: {product.nutriments.energy_100g}kcal</li>
                          <li>Proteins: {product.nutriments.proteins_100g}g</li>
                          <li>Carbohydrates: {product.nutriments.carbohydrates_100g}g</li>
                          <li>Fat: {product.nutriments.fat_100g}g</li>
                        </ul>
                      </motion.div>
                      {product.ingredients_text && (
                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className={`p-4 rounded-lg shadow-sm ${
                            darkMode ? 'bg-gray-800' : 'bg-white'
                          }`}
                        >
                          <h3 className={`font-semibold mb-2 ${
                            darkMode ? 'text-purple-300' : 'text-purple-500'
                          }`}>
                            Ingredients
                          </h3>
                          <p className={`text-sm md:text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {product.ingredients_text}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default App;