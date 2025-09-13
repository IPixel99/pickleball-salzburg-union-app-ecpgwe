
import { supabase } from '../lib/supabase';
import { Platform } from 'react-native';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// Helper function to convert URI to blob for React Native
const uriToBlob = async (uri: string): Promise<Blob> => {
  try {
    console.log('Converting URI to blob:', uri);
    
    if (Platform.OS === 'web') {
      // For web, use fetch directly
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      return await response.blob();
    } else {
      // For React Native, we need to handle this differently
      // First, try to read the file as a blob
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      console.log('Blob created successfully, size:', blob.size, 'type:', blob.type);
      
      // If blob type is not set, try to determine it from the URI
      if (!blob.type || blob.type === 'application/octet-stream') {
        const ext = getFileExtension(uri);
        const mimeType = getMimeTypeFromExtension(ext);
        console.log('Setting blob type to:', mimeType);
        
        // Create a new blob with the correct MIME type
        return new Blob([blob], { type: mimeType });
      }
      
      return blob;
    }
  } catch (error) {
    console.error('Error converting URI to blob:', error);
    throw new Error('Fehler beim Konvertieren des Bildes');
  }
};

// Helper function to get MIME type from file extension
const getMimeTypeFromExtension = (ext: string): string => {
  const mimeTypes: { [key: string]: string } = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'gif': 'image/gif'
  };
  
  return mimeTypes[ext.toLowerCase()] || 'image/jpeg';
};

// Helper function to get file extension from URI
const getFileExtension = (uri: string): string => {
  try {
    // Try to get extension from URI
    const uriParts = uri.split('.');
    if (uriParts.length > 1) {
      let ext = uriParts[uriParts.length - 1].toLowerCase();
      
      // Remove query parameters if present
      ext = ext.split('?')[0];
      
      // Validate common image extensions
      if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
        return ext;
      }
    }
    
    // Try to determine from URI pattern (React Native image picker)
    if (uri.includes('ImagePicker') || uri.includes('Camera')) {
      return 'jpg'; // Default for camera/picker images
    }
    
    // Default to jpg if we can't determine the extension
    return 'jpg';
  } catch (error) {
    console.error('Error getting file extension:', error);
    return 'jpg';
  }
};

// Helper function to create a file from URI (alternative approach)
const uriToFile = async (uri: string, fileName: string): Promise<File | Blob> => {
  try {
    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new File([blob], fileName, { type: blob.type });
    } else {
      // For React Native, return blob
      return await uriToBlob(uri);
    }
  } catch (error) {
    console.error('Error creating file from URI:', error);
    throw error;
  }
};

export const uploadProfileImage = async (
  uri: string, 
  userId: string
): Promise<ImageUploadResult> => {
  try {
    console.log('Starting profile image upload for user:', userId);
    console.log('Image URI:', uri);
    
    if (!uri || !userId) {
      return {
        success: false,
        error: 'Ungültige Parameter für Bildupload'
      };
    }

    // Validate URI format
    if (!validateImageUri(uri)) {
      return {
        success: false,
        error: 'Ungültige Bild-URI'
      };
    }

    // Convert image to blob
    let blob: Blob;
    try {
      blob = await uriToBlob(uri);
    } catch (error) {
      console.error('Blob conversion failed:', error);
      return {
        success: false,
        error: 'Fehler beim Verarbeiten des Bildes'
      };
    }

    // Validate blob
    if (!blob || blob.size === 0) {
      return {
        success: false,
        error: 'Das Bild ist leer oder ungültig'
      };
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (blob.size > maxSize) {
      return {
        success: false,
        error: 'Das Bild ist zu groß. Maximale Größe: 5MB'
      };
    }

    // Create file name with timestamp to avoid caching issues
    const fileExt = getFileExtension(uri);
    const timestamp = Date.now();
    const fileName = `${userId}/avatar_${timestamp}.${fileExt}`;
    
    console.log('Uploading to storage with filename:', fileName);
    console.log('Blob size:', blob.size, 'type:', blob.type);
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: true,
        contentType: blob.type || getMimeTypeFromExtension(fileExt),
      });

    if (error) {
      console.error('Storage upload error:', error);
      
      // Handle specific error cases
      if (error.message.includes('Bucket not found')) {
        return {
          success: false,
          error: 'Avatar-Speicher ist nicht eingerichtet. Bitte gehe zu den Einstellungen und richte den Speicher ein.'
        };
      } else if (error.message.includes('Policy') || error.message.includes('permission')) {
        return {
          success: false,
          error: 'Keine Berechtigung zum Hochladen von Bildern. Bitte überprüfe die Storage-Richtlinien.'
        };
      } else if (error.message.includes('size') || error.message.includes('limit')) {
        return {
          success: false,
          error: 'Das Bild ist zu groß. Maximale Größe: 5MB'
        };
      } else if (error.message.includes('mime') || error.message.includes('type')) {
        return {
          success: false,
          error: 'Ungültiger Dateityp. Nur JPEG, PNG, WebP und GIF sind erlaubt.'
        };
      } else {
        return {
          success: false,
          error: `Upload-Fehler: ${error.message}`
        };
      }
    }

    if (!data) {
      return {
        success: false,
        error: 'Upload fehlgeschlagen - keine Daten erhalten'
      };
    }

    console.log('Image uploaded successfully:', data);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    if (!publicUrl) {
      return {
        success: false,
        error: 'Fehler beim Generieren der Bild-URL'
      };
    }

    console.log('Public URL generated:', publicUrl);

    // Update the user's profile with the new avatar URL
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Error updating profile with avatar URL:', profileError);
      // Don't fail the upload, just log the error
      console.warn('Avatar uploaded but profile not updated:', profileError.message);
    } else {
      console.log('Profile updated with new avatar URL');
    }

    return {
      success: true,
      url: publicUrl
    };
  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    return {
      success: false,
      error: 'Unerwarteter Fehler beim Hochladen des Bildes'
    };
  }
};

export const deleteProfileImage = async (
  avatarUrl: string,
  userId: string
): Promise<boolean> => {
  try {
    if (!avatarUrl || !userId) {
      console.error('Invalid parameters for deleteProfileImage');
      return false;
    }

    // Extract filename from URL
    const urlParts = avatarUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    if (!fileName) {
      console.error('Could not extract filename from URL:', avatarUrl);
      return false;
    }

    const filePath = `${userId}/${fileName}`;
    
    console.log('Deleting profile image:', filePath);
    
    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting profile image:', error);
      return false;
    }

    // Update the user's profile to remove the avatar URL
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        avatar_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Error updating profile after avatar deletion:', profileError);
      // Don't fail the deletion, just log the error
      console.warn('Avatar deleted but profile not updated:', profileError.message);
    } else {
      console.log('Profile updated after avatar deletion');
    }

    console.log('Profile image deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteProfileImage:', error);
    return false;
  }
};

export const getAvatarUrl = (userId: string, filename?: string): string => {
  if (!userId) {
    return '';
  }

  if (!filename) {
    filename = `avatar.jpg`;
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(`${userId}/${filename}`);
    
  return publicUrl || '';
};

// Helper function to validate image URI
export const validateImageUri = (uri: string): boolean => {
  if (!uri) return false;
  
  // Check if it's a valid URI format
  try {
    // For web URLs
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      new URL(uri);
      return true;
    }
    
    // For React Native file URIs
    if (uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('ph://')) {
      return true;
    }
    
    // For data URIs
    if (uri.startsWith('data:image/')) {
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
};

// Helper function to compress image if needed (placeholder for future implementation)
export const compressImage = async (uri: string, quality: number = 0.8): Promise<string> => {
  // For now, just return the original URI
  // In the future, we could implement image compression here using expo-image-manipulator
  return uri;
};

// Helper function to get image dimensions
export const getImageDimensions = async (uri: string): Promise<{ width: number; height: number } | null> => {
  try {
    return new Promise((resolve) => {
      if (Platform.OS === 'web') {
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => {
          resolve(null);
        };
        img.src = uri;
      } else {
        // For React Native, we would need expo-image-manipulator or similar
        resolve(null);
      }
    });
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    return null;
  }
};

// Helper function to resize image (placeholder)
export const resizeImage = async (
  uri: string, 
  maxWidth: number = 800, 
  maxHeight: number = 800
): Promise<string> => {
  // For now, just return the original URI
  // In the future, we could implement image resizing here using expo-image-manipulator
  return uri;
};

// Helper function to get all user avatars
export const getUserAvatars = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase.storage
      .from('avatars')
      .list(userId, {
        limit: 100,
        offset: 0,
      });

    if (error) {
      console.error('Error listing user avatars:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    // Return full URLs for each avatar
    return data.map(file => {
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(`${userId}/${file.name}`);
      return publicUrl;
    }).filter(url => url);
  } catch (error) {
    console.error('Error in getUserAvatars:', error);
    return [];
  }
};

// Helper function to clean up old avatars (keep only the latest 3)
export const cleanupOldAvatars = async (userId: string): Promise<void> => {
  try {
    const { data, error } = await supabase.storage
      .from('avatars')
      .list(userId, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error || !data) {
      console.error('Error listing avatars for cleanup:', error);
      return;
    }

    // Keep only the latest 3 avatars, delete the rest
    if (data.length > 3) {
      const filesToDelete = data.slice(3).map(file => `${userId}/${file.name}`);
      
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove(filesToDelete);

      if (deleteError) {
        console.error('Error cleaning up old avatars:', deleteError);
      } else {
        console.log(`Cleaned up ${filesToDelete.length} old avatars for user ${userId}`);
      }
    }
  } catch (error) {
    console.error('Error in cleanupOldAvatars:', error);
  }
};
