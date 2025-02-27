import { useState, useEffect } from 'react';
import {
  getResourceCategories,
  createResourceCategory,
  updateResourceCategory,
  deleteResourceCategory,
} from './resourceService';

const useResourceCategory = () => {
  const [categories, setCategories] = useState([]); // State to store categories
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [error, setError] = useState(null); // State to manage errors

  useEffect(() => {
    // Fetch categories on component mount
    const fetchCategories = async () => {
      try {
        const data = await getResourceCategories();
        setCategories(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const addCategory = async (category) => {
    // Add a new category
    try {
      const newCategory = await createResourceCategory(category);
      setCategories([...categories, newCategory]);
    } catch (err) {
      setError(err);
    }
  };

  const editCategory = async (id, category) => {
    // Edit an existing category
    try {
      const updatedCategory = await updateResourceCategory(id, category);
      setCategories(
        categories.map((cat) => (cat.id === id ? updatedCategory : cat))
      );
    } catch (err) {
      setError(err);
    }
  };

  const removeCategory = async (id) => {
    // Remove a category
    try {
      await deleteResourceCategory(id);
      setCategories(categories.filter((cat) => cat.id !== id));
    } catch (err) {
      setError(err);
    }
  };

  return {
    categories,
    loading,
    error,
    addCategory,
    editCategory,
    removeCategory,
  };
};

export default useResourceCategory;