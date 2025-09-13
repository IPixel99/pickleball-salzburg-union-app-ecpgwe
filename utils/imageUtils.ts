
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
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      console.log('Blob created successfully, size:', blob.size, 'type:', blob.type);
      
      return blob;
    }
  } catch (error) {
    console.error('Error converting URI to blob:', error);
    throw new Error('Fehler beim Konvertieren des Bildes');
  }
};

// Helper function to get file extension from URI
const getFileExtension = (uri: string): string => {
  try {
    // Try to get extension from URI
    const uriParts = uri.split('.');
    if (uriParts.length > 1) {
      const ext = uriParts[uriParts.length - 1].toLowerCase();
      // Validate common image extensions
      if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
        return ext;
      }
    }
    
    // Default to jpg if we can't determine the extension
    return 'jpg';
  } catch (error) {
    console.error('Error getting file extension:', error);
    return 'jpg';
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
        contentType: blob.type || `image/${fileExt}`,
      });

    if (error) {
      console.error('Storage upload error:', error);
      
      // Handle specific error cases
      if (error.message.includes('Bucket not found')) {
        return {
          success: false,
          error: 'Avatar-Speicher ist nicht eingerichtet. Bitte kontaktiere den Administrator.'
        };
      } else if (error.message.includes('Policy')) {
        return {
          success: false,
          error: 'Keine Berechtigung zum Hochladen von Bildern.'
        };
      } else if (error.message.includes('size')) {
        return {
          success: false,
          error: 'Das Bild ist zu groß.'
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
    const url = new URL(uri);
    return true;
  } catch {
    // For React Native file URIs
    return uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('ph://');
  }
};

// Helper function to compress image if needed (placeholder for future implementation)
export const compressImage = async (uri: string, quality: number = 0.8): Promise<string> => {
  // For now, just return the original URI
  // In the future, we could implement image compression here
  return uri;
};
