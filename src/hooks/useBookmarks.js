import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem('bookmarks').then(data => {
      if (data) setBookmarks(JSON.parse(data));
    });
  }, []);

  const toggle = async (clinic) => {
    const exists = bookmarks.find(b => b.id === clinic.id);
    const next = exists
      ? bookmarks.filter(b => b.id !== clinic.id)
      : [...bookmarks, clinic];
    setBookmarks(next);
    await AsyncStorage.setItem('bookmarks', JSON.stringify(next));
  };

  const isBookmarked = (id) => bookmarks.some(b => b.id === id);

  return { bookmarks, toggle, isBookmarked };
}