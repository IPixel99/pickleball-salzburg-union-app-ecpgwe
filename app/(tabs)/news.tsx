
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, RefreshControl, Image } from 'react-native';
import { commonStyles, colors } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    console.log('Reading more about news:', newsId);
    // TODO: Navigate to detailed news view
    Alert.alert('Artikel lesen', 'Detailansicht wird bald verfügbar sein!');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
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
        <View style={{ marginBottom: 30 }}>
          <Text style={[commonStyles.title, { color: colors.primary }]}>Nachrichten</Text>
          <Text style={commonStyles.textLight}>
            Bleibe auf dem Laufenden mit den neuesten Vereinsnachrichten
          </Text>
        </View>

        {/* News Posts */}
        {newsPosts.length === 0 ? (
          <View style={[commonStyles.card, { alignItems: 'center', padding: 40 }]}>
            <Icon name="newspaper" size={48} color={colors.textLight} style={{ marginBottom: 16 }} />
            <Text style={[commonStyles.text, { textAlign: 'center', marginBottom: 8 }]}>
              Keine Nachrichten verfügbar
            </Text>
            <Text style={[commonStyles.textLight, { textAlign: 'center' }]}>
              Schau später wieder vorbei für die neuesten Updates vom Verein.
            </Text>
          </View>
        ) : (
          newsPosts.map((post) => (
            <TouchableOpacity 
              key={post.id} 
              style={commonStyles.card}
              onPress={() => handleReadMore(post.id)}
            >
              {/* Image */}
              {post.image_url && (
                <Image
                  source={{ uri: post.image_url }}
                  style={{
                    width: '100%',
                    height: 200,
                    borderRadius: 8,
                    marginBottom: 16,
                    resizeMode: 'cover',
                  }}
                />
              )}

              {/* YouTube Indicator */}
              {post.youtube_url && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 12,
                  padding: 8,
                  backgroundColor: colors.red,
                  borderRadius: 6,
                  alignSelf: 'flex-start',
                }}>
                  <Icon name="play" size={16} color={colors.white} style={{ marginRight: 6 }} />
                  <Text style={[commonStyles.textLight, { color: colors.white, fontSize: 12 }]}>
                    Video verfügbar
                  </Text>
                </View>
              )}

              {/* Title */}
              <Text style={[commonStyles.text, { fontWeight: '600', fontSize: 18, marginBottom: 8, color: colors.primary }]}>
                {post.title}
              </Text>

              {/* Content Preview */}
              <Text style={[commonStyles.textLight, { marginBottom: 12, lineHeight: 20 }]}>
                {truncateContent(post.content)}
              </Text>

              {/* Footer */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[commonStyles.textLight, { fontSize: 12 }]}>
                  {formatDate(post.created_at)}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[commonStyles.textLight, { fontSize: 12, marginRight: 4, color: colors.primary }]}>
                    Weiterlesen
                  </Text>
                  <Icon name="chevron-forward" size={16} color={colors.primary} />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
