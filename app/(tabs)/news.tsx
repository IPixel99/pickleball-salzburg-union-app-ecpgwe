
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, RefreshControl, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

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

export default function NewsScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNewsPosts = async () => {
    try {
      console.log('Fetching news posts from Supabase...');
      const { data, error } = await supabase
        .from('news_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching news posts:', error);
        Alert.alert('Fehler', 'Nachrichten konnten nicht geladen werden.');
        return;
      }

      console.log('Fetched news posts:', data);
      setNewsPosts(data || []);
    } catch (error) {
      console.error('Error in fetchNewsPosts:', error);
      Alert.alert('Fehler', 'Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNewsPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNewsPosts();
  };

  const handleReadMore = (newsId: string) => {
    console.log('Navigating to news detail:', newsId);
    router.push(`/news/${newsId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Heute';
    } else if (diffDays === 1) {
      return 'Gestern';
    } else if (diffDays < 7) {
      return `Vor ${diffDays} Tagen`;
    } else {
      return date.toLocaleDateString('de-DE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    header: {
      marginBottom: 24,
      paddingTop: 8,
    },
    headerGradient: {
      paddingVertical: 20,
      paddingHorizontal: 24,
      borderRadius: 20,
      marginBottom: 24,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: theme === 'dark' ? 0.5 : 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    newsGrid: {
      gap: 16,
    },
    newsCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      overflow: 'hidden',
      shadowColor: theme === 'dark' ? colors.primary : colors.black,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: theme === 'dark' ? 0.4 : 0.1,
      shadowRadius: 12,
      elevation: 6,
      borderWidth: theme === 'dark' ? 1 : 0,
      borderColor: theme === 'dark' ? colors.border : 'transparent',
      marginBottom: 16,
    },
    featuredCard: {
      marginBottom: 8,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: theme === 'dark' ? 0.5 : 0.15,
      shadowRadius: 16,
      elevation: 10,
    },
    imageContainer: {
      position: 'relative',
      width: '100%',
      height: 200,
    },
    newsImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    imageGradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 120,
    },
    contentContainer: {
      padding: 20,
    },
    contentContainerNoImage: {
      paddingTop: 20,
    },
    videoBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    },
    videoBadgeText: {
      color: colors.white,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    dateText: {
      fontSize: 13,
      color: colors.textLight,
      fontWeight: '500',
    },
    newsTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 10,
      lineHeight: 24,
    },
    featuredTitle: {
      fontSize: 22,
      lineHeight: 28,
    },
    newsContent: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 16,
    },
    readMoreContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    readMoreText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 80,
      paddingHorizontal: 40,
    },
    emptyIconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.backgroundSecondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 12,
      color: colors.text,
    },
    emptyDescription: {
      fontSize: 15,
      textAlign: 'center',
      lineHeight: 22,
      color: colors.textSecondary,
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.text, fontSize: 16 }}>Nachrichten werden geladen...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={theme === 'dark' 
            ? ['#F20505', '#C00404'] 
            : ['#F20505', '#FF4444']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Text style={{ color: colors.white, fontSize: 32, fontWeight: 'bold', marginBottom: 4 }}>
            Nachrichten
          </Text>
          <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 15 }}>
            Bleibe auf dem Laufenden
          </Text>
        </LinearGradient>

        {/* News Posts */}
        {newsPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Icon name="newspaper-outline" size={56} color={colors.textLight} />
            </View>
            <Text style={styles.emptyTitle}>
              Keine Nachrichten verfügbar
            </Text>
            <Text style={styles.emptyDescription}>
              Schau später wieder vorbei für die neuesten Updates vom Verein.
            </Text>
          </View>
        ) : (
          <View style={styles.newsGrid}>
            {newsPosts.map((post, index) => (
              <TouchableOpacity 
                key={post.id} 
                style={[
                  styles.newsCard,
                  index === 0 && styles.featuredCard
                ]}
                onPress={() => handleReadMore(post.id)}
                activeOpacity={0.7}
              >
                {/* Image - Only render if image_url exists */}
                {post.image_url && (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: post.image_url }}
                      style={styles.newsImage}
                    />
                    {/* Gradient Overlay for better text readability on featured card */}
                    {index === 0 && (
                      <LinearGradient
                        colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
                        style={styles.imageGradient}
                      />
                    )}
                  </View>
                )}

                {/* Content Container */}
                <View style={[
                  styles.contentContainer,
                  !post.image_url && styles.contentContainerNoImage
                ]}>
                  {/* YouTube Badge */}
                  {post.youtube_url && (
                    <View style={styles.videoBadge}>
                      <Icon name="play-circle" size={14} color={colors.white} style={{ marginRight: 4 }} />
                      <Text style={styles.videoBadgeText}>Video</Text>
                    </View>
                  )}

                  {/* Date */}
                  <View style={styles.dateContainer}>
                    <Icon name="time-outline" size={14} color={colors.textLight} style={{ marginRight: 4 }} />
                    <Text style={styles.dateText}>
                      {formatDate(post.created_at)}
                    </Text>
                  </View>

                  {/* Title */}
                  <Text 
                    style={[
                      styles.newsTitle,
                      index === 0 && styles.featuredTitle
                    ]}
                    numberOfLines={index === 0 ? 3 : 2}
                  >
                    {post.title}
                  </Text>

                  {/* Content Preview */}
                  <Text 
                    style={styles.newsContent}
                    numberOfLines={index === 0 ? 3 : 2}
                  >
                    {truncateContent(post.content, index === 0 ? 150 : 100)}
                  </Text>

                  {/* Read More Link */}
                  <View style={styles.readMoreContainer}>
                    <Text style={styles.readMoreText}>Weiterlesen</Text>
                    <Icon name="arrow-forward" size={16} color={colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
