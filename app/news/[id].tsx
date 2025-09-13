
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
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

  const fetchNewsPost = async () => {
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
  };

  useEffect(() => {
    if (id) {
      fetchNewsPost();
    }
  }, [id]);

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

  const handleOpenYouTube = () => {
    if (newsPost?.youtube_url) {
      console.log('Opening YouTube URL:', newsPost.youtube_url);
      // TODO: Open YouTube URL in browser or app
      Alert.alert('YouTube Video', 'Video wird in Kürze verfügbar sein!');
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
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <TouchableOpacity
          onPress={handleBack}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
          }}
        >
          <Icon name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[commonStyles.text, { fontSize: 18, fontWeight: '600', flex: 1 }]}>
          Artikel
        </Text>
      </View>

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Article Image */}
        {newsPost.image_url && (
          <Image
            source={{ uri: newsPost.image_url }}
            style={{
              width: '100%',
              height: 250,
              resizeMode: 'cover',
              marginBottom: 24,
            }}
          />
        )}

        {/* YouTube Video Button */}
        {newsPost.youtube_url && (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.red,
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
            }}
            onPress={handleOpenYouTube}
          >
            <Icon name="play" size={24} color={colors.white} style={{ marginRight: 12 }} />
            <Text style={[commonStyles.text, { color: colors.white, fontWeight: '600' }]}>
              Video ansehen
            </Text>
          </TouchableOpacity>
        )}

        {/* Article Title */}
        <Text style={[
          commonStyles.title,
          {
            color: colors.primary,
            fontSize: 28,
            lineHeight: 36,
            marginBottom: 16,
          }
        ]}>
          {newsPost.title}
        </Text>

        {/* Article Meta */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 32,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          <Icon name="calendar" size={16} color={colors.textLight} style={{ marginRight: 8 }} />
          <Text style={[commonStyles.textLight, { fontSize: 14 }]}>
            Veröffentlicht am {formatDate(newsPost.created_at)}
          </Text>
        </View>

        {/* Article Content */}
        <View style={{ marginBottom: 40 }}>
          <Text style={[
            commonStyles.text,
            {
              fontSize: 16,
              lineHeight: 24,
              textAlign: 'justify',
            }
          ]}>
            {newsPost.content}
          </Text>
        </View>

        {/* Back Button */}
        <TouchableOpacity
          style={[buttonStyles.secondary, { width: '100%', marginBottom: 20 }]}
          onPress={handleBack}
        >
          <Icon name="chevron-back" size={20} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={[commonStyles.text, { color: colors.primary, fontWeight: '600' }]}>
            Zurück zu den Nachrichten
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
