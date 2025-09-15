
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface LocalImageResult {
  success: boolean;
  url?: string;
  error?: string;
}

const PROFILE_IMAGE_KEY = 'profile_image_';
const IMAGE_METADATA_KEY = 'image_metadata_';

interface ImageMetadata {
  userId: string;
  originalUri: string;
  timestamp: number;
  size?: number;
}

/**
 * Speichert ein Profilbild lokal auf dem Gerät
 */
export const saveImageLocally = async (
  imageUri: string,
  userId: string
): Promise<LocalImageResult> => {
  try {
    console.log('Saving image locally for user:', userId);
    console.log('Image URI:', imageUri);

    if (!imageUri || !userId) {
      return {
        success: false,
        error: 'Ungültige Parameter für lokale Speicherung'
      };
    }

    // Erstelle Metadaten für das Bild
    const metadata: ImageMetadata = {
      userId,
      originalUri: imageUri,
      timestamp: Date.now()
    };

    // Speichere die Bild-URI und Metadaten
    const imageKey = `${PROFILE_IMAGE_KEY}${userId}`;
    const metadataKey = `${IMAGE_METADATA_KEY}${userId}`;

    await AsyncStorage.setItem(imageKey, imageUri);
    await AsyncStorage.setItem(metadataKey, JSON.stringify(metadata));

    console.log('Image saved locally successfully');

    return {
      success: true,
      url: imageUri
    };

  } catch (error) {
    console.error('Error saving image locally:', error);
    return {
      success: false,
      error: 'Fehler beim lokalen Speichern des Bildes'
    };
  }
};

/**
 * Lädt ein lokal gespeichertes Profilbild
 */
export const getLocalImage = async (userId: string): Promise<string | null> => {
  try {
    console.log('Getting local image for user:', userId);

    if (!userId) {
      return null;
    }

    const imageKey = `${PROFILE_IMAGE_KEY}${userId}`;
    const imageUri = await AsyncStorage.getItem(imageKey);

    if (!imageUri) {
      console.log('No local image found for user:', userId);
      return null;
    }

    // Überprüfe, ob das Bild noch existiert (für React Native)
    if (Platform.OS !== 'web') {
      try {
        const response = await fetch(imageUri);
        if (!response.ok) {
          console.log('Local image no longer exists, removing from storage');
          await removeLocalImage(userId);
          return null;
        }
      } catch (error) {
        console.log('Error checking local image existence:', error);
        await removeLocalImage(userId);
        return null;
      }
    }

    console.log('Local image found:', imageUri);
    return imageUri;

  } catch (error) {
    console.error('Error getting local image:', error);
    return null;
  }
};

/**
 * Entfernt ein lokal gespeichertes Profilbild
 */
export const removeLocalImage = async (userId: string): Promise<boolean> => {
  try {
    console.log('Removing local image for user:', userId);

    if (!userId) {
      return false;
    }

    const imageKey = `${PROFILE_IMAGE_KEY}${userId}`;
    const metadataKey = `${IMAGE_METADATA_KEY}${userId}`;

    await AsyncStorage.removeItem(imageKey);
    await AsyncStorage.removeItem(metadataKey);

    console.log('Local image removed successfully');
    return true;

  } catch (error) {
    console.error('Error removing local image:', error);
    return false;
  }
};

/**
 * Holt die Metadaten eines lokal gespeicherten Bildes
 */
export const getLocalImageMetadata = async (userId: string): Promise<ImageMetadata | null> => {
  try {
    if (!userId) {
      return null;
    }

    const metadataKey = `${IMAGE_METADATA_KEY}${userId}`;
    const metadataJson = await AsyncStorage.getItem(metadataKey);

    if (!metadataJson) {
      return null;
    }

    return JSON.parse(metadataJson) as ImageMetadata;

  } catch (error) {
    console.error('Error getting local image metadata:', error);
    return null;
  }
};

/**
 * Listet alle lokal gespeicherten Profilbilder auf
 */
export const getAllLocalImages = async (): Promise<{ userId: string; imageUri: string; metadata: ImageMetadata }[]> => {
  try {
    console.log('Getting all local images...');

    const allKeys = await AsyncStorage.getAllKeys();
    const imageKeys = allKeys.filter(key => key.startsWith(PROFILE_IMAGE_KEY));

    const images: { userId: string; imageUri: string; metadata: ImageMetadata }[] = [];

    for (const key of imageKeys) {
      const userId = key.replace(PROFILE_IMAGE_KEY, '');
      const imageUri = await AsyncStorage.getItem(key);
      const metadata = await getLocalImageMetadata(userId);

      if (imageUri && metadata) {
        images.push({ userId, imageUri, metadata });
      }
    }

    console.log(`Found ${images.length} local images`);
    return images;

  } catch (error) {
    console.error('Error getting all local images:', error);
    return [];
  }
};

/**
 * Bereinigt alte lokal gespeicherte Bilder (älter als 30 Tage)
 */
export const cleanupOldLocalImages = async (): Promise<void> => {
  try {
    console.log('Cleaning up old local images...');

    const allImages = await getAllLocalImages();
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 Tage in Millisekunden

    let cleanedCount = 0;

    for (const image of allImages) {
      if (image.metadata.timestamp < thirtyDaysAgo) {
        await removeLocalImage(image.userId);
        cleanedCount++;
      }
    }

    console.log(`Cleaned up ${cleanedCount} old local images`);

  } catch (error) {
    console.error('Error cleaning up old local images:', error);
  }
};

/**
 * Überprüft die Größe des lokalen Bildspeichers
 */
export const getLocalStorageSize = async (): Promise<{ totalImages: number; estimatedSize: string }> => {
  try {
    const allImages = await getAllLocalImages();
    
    // Geschätzte Größe basierend auf der Anzahl der Bilder
    // Durchschnittlich ~500KB pro Bild (komprimiert)
    const estimatedSizeBytes = allImages.length * 500 * 1024;
    const estimatedSizeMB = (estimatedSizeBytes / (1024 * 1024)).toFixed(2);

    return {
      totalImages: allImages.length,
      estimatedSize: `~${estimatedSizeMB} MB`
    };

  } catch (error) {
    console.error('Error calculating local storage size:', error);
    return {
      totalImages: 0,
      estimatedSize: '0 MB'
    };
  }
};

/**
 * Exportiert alle lokalen Bilder (für Backup-Zwecke)
 */
export const exportLocalImages = async (): Promise<{ userId: string; imageUri: string; metadata: ImageMetadata }[]> => {
  try {
    console.log('Exporting all local images...');
    return await getAllLocalImages();
  } catch (error) {
    console.error('Error exporting local images:', error);
    return [];
  }
};

/**
 * Importiert Bilder aus einem Export (für Restore-Zwecke)
 */
export const importLocalImages = async (
  images: { userId: string; imageUri: string; metadata: ImageMetadata }[]
): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  try {
    console.log(`Importing ${images.length} local images...`);

    for (const image of images) {
      try {
        const result = await saveImageLocally(image.imageUri, image.userId);
        if (result.success) {
          success++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Error importing image for user ${image.userId}:`, error);
        failed++;
      }
    }

    console.log(`Import completed: ${success} successful, ${failed} failed`);

  } catch (error) {
    console.error('Error importing local images:', error);
  }

  return { success, failed };
};
