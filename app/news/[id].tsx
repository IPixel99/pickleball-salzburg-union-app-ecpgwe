
import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator, StyleSheet, Linking } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from '../../components/Icon';
import { supabase } from '../../lib/supabase';

interface NewsPost {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  youtube_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export default function NewsDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [newsPost, setNewsPost] = useState<NewsPost | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchNewsPost = useCallback(async () => {
    try {
      console.log('Fetching news post with id:', id);
      const { data, error } = await supabase
        .from('news_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching news post:', error);
        Alert.alert('Fehler', 'Artikel konnte nicht geladen werden.');
        router.back();
        return;
      }

      console.log('Fetched news post:', data);
      setNewsPost(data);
    } catch (error) {
      console.error('Error in fetchNewsPost:', error);
      Alert.alert('Fehler', 'Ein unerwarteter Fehler ist aufgetreten.');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) {
      fetchNewsPost();
    }
  }, [id, fetchNewsPost]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBack = () => {
    router.back();
  };

  const handleOpenYouTube = async () => {
    if (newsPost?.youtube_url) {
      console.log('Opening YouTube URL:', newsPost.youtube_url);
      try {
        const supported = await Linking.canOpenURL(newsPost.youtube_url);
        if (supported) {
          await Linking.openURL(newsPost.youtube_url);
        } else {
          Alert.alert('Fehler', 'YouTube-Link konnte nicht geöffnet werden.');
        }
      } catch (error) {
        console.error('Error opening YouTube URL:', error);
        Alert.alert('Fehler', 'YouTube-Link konnte nicht geöffnet werden.');
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[commonStyles.text, { marginTop: 16 }]}>Artikel wird geladen...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!newsPost) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.centerContent}>
          <Icon name="alert-circle" size={48} color={colors.textLight} style={{ marginBottom: 16 }} />
          <Text style={[commonStyles.text, { textAlign: 'center', marginBottom: 8 }]}>
            Artikel nicht gefunden
          </Text>
          <Text style={[commonStyles.textLight, { textAlign: 'center', marginBottom: 24 }]}>
            Der angeforderte Artikel konnte nicht geladen werden.
          </Text>
          <TouchableOpacity
            style={[buttonStyles.primary, { paddingHorizontal: 24 }]}
            onPress={handleBack}
          >
            <Text style={commonStyles.buttonTextWhite}>Zurück</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Artikel</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Article Image - Only render if image_url exists */}
        {newsPost.image_url && (
          <View style={styles.heroImageContainer}>
            <Image
              source={{ uri: newsPost.image_url }}
              style={styles.heroImage}
            />
          </View>
        )}

        {/* Content Container */}
        <View style={styles.articleContent}>
          {/* YouTube Video Button */}
          {newsPost.youtube_url && (
            <TouchableOpacity
              style={styles.youtubeButton}
              onPress={handleOpenYouTube}
              activeOpacity={0.8}
            >
              <View style={styles.youtubeIconContainer}>
                <Icon name="play" size={20} color={colors.white} />
              </View>
              <Text style={styles.youtubeButtonText}>Video ansehen</Text>
              <Icon name="open-outline" size={18} color={colors.white} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          )}

          {/* Article Meta */}
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Icon name="calendar-outline" size={16} color={colors.textLight} style={{ marginRight: 6 }} />
              <Text style={styles.metaText}>
                {formatDate(newsPost.created_at)}
              </Text>
            </View>
          </View>

          {/* Article Title */}
          <Text style={styles.articleTitle}>
            {newsPost.title}
          </Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Article Body */}
          <Text style={styles.articleBody}>
            {newsPost.content}
          </Text>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Floating Back Button */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity
          style={styles.floatingBackButton}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Icon name="arrow-back" size={20} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.floatingBackButtonText}>Zurück</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  heroImageContainer: {
    width: '100%',
    height: 280,
    marginBottom: 0,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  articleContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  youtubeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.red,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    shadowColor: colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  youtubeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  youtubeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '500',
  },
  articleTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 36,
    marginBottom: 20,
  },
  divider: {
    height: 3,
    width: 60,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginBottom: 24,
  },
  articleBody: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 26,
    textAlign: 'justify',
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  floatingBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  floatingBackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});
