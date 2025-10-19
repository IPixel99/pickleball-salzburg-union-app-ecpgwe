
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, RefreshControl, Image, StyleSheet } from 'react-native';
import { commonStyles, colors } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
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

export default function NewsScreen() {
  const router = useRouter();
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

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.centerContent}>
          <Text style={commonStyles.text}>Nachrichten werden geladen...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView 
        style={commonStyles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[commonStyles.title, { color: colors.primary, fontSize: 32, marginBottom: 8 }]}>
            Nachrichten
          </Text>
          <Text style={[commonStyles.textLight, { fontSize: 15 }]}>
            Bleibe auf dem Laufenden
          </Text>
        </View>

        {/* News Posts */}
        {newsPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Icon name="newspaper-outline" size={56} color={colors.textLight} />
            </View>
            <Text style={[commonStyles.text, styles.emptyTitle]}>
              Keine Nachrichten verfügbar
            </Text>
            <Text style={[commonStyles.textLight, styles.emptyDescription]}>
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
                      <View style={styles.imageGradient} />
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

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
    paddingTop: 8,
  },
  newsGrid: {
    gap: 16,
  },
  newsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  featuredCard: {
    marginBottom: 8,
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
    height: 100,
    backgroundColor: 'transparent',
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
    backgroundColor: colors.red,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 12,
  },
  videoBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    color: colors.textLight,
    lineHeight: 20,
    marginBottom: 16,
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
