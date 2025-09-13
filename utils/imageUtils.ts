
import { supabase } from '../lib/supabase';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const uploadProfileImage = async (
  uri: string, 
  userId: string
): Promise<ImageUploadResult> => {
  try {
    console.log('Starting profile image upload for user:', userId);
    
    // Convert image to blob
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Create file name with timestamp to avoid caching issues
    const fileExt = uri.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const fileName = `${userId}/avatar_${timestamp}.${fileExt}`;
    
    console.log('Uploading to storage with filename:', fileName);
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return {
        success: false,
        error: 'Fehler beim Hochladen des Bildes'
      };
    }

    console.log('Image uploaded successfully:', data);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    console.log('Public URL generated:', publicUrl);

    return {
      success: true,
      url: publicUrl
    };
  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    return {
      success: false,
      error: 'Unerwarteter Fehler beim Hochladen'
    };
  }
};

export const deleteProfileImage = async (
  avatarUrl: string,
  userId: string
): Promise<boolean> => {
  try {
    // Extract filename from URL
    const urlParts = avatarUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `${userId}/${fileName}`;
    
    console.log('Deleting profile image:', filePath);
    
    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting profile image:', error);
      return false;
    }

    console.log('Profile image deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteProfileImage:', error);
    return false;
  }
};

export const getAvatarUrl = (userId: string, filename?: string): string => {
  if (!filename) {
    filename = `avatar.jpg`;
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(`${userId}/${filename}`);
    
  return publicUrl;
};
