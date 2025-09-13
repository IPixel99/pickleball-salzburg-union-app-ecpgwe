
import { supabase } from './supabase';

// Sample data for testing the home screen
export const insertSampleEvents = async () => {
  console.log('Inserting sample events...');
  
  const sampleEvents = [
    {
      title: 'Wöchentliches Training',
      description: 'Regelmäßiges Training für alle Spielstärken',
      start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
      location: 'Sporthalle Salzburg',
      type: 'PRACTICE' as const,
    },
    {
      title: 'Vereinsmeisterschaft',
      description: 'Jährliche Vereinsmeisterschaft - Anmeldung erforderlich',
      start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // 4 hours later
      location: 'Hauptplatz Salzburg',
      type: 'TOURNAMENT' as const,
    },
    {
      title: 'Freundschaftsspiel',
      description: 'Entspanntes Spiel mit anderen Vereinsmitgliedern',
      start_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString(), // 1.5 hours later
      location: 'Tennisplatz Nord',
      type: 'GAME' as const,
    },
  ];

  try {
    const { data, error } = await supabase
      .from('events')
      .insert(sampleEvents)
      .select();

    if (error) {
      console.error('Error inserting sample events:', error);
      return null;
    }

    console.log('Sample events inserted successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to insert sample events:', error);
    return null;
  }
};

export const insertSampleNewsPost = async () => {
  console.log('Inserting sample news post...');
  
  const sampleNews = {
    title: 'Willkommen bei Pickleball Salzburg Union!',
    content: 'Wir freuen uns, euch in unserem Verein begrüßen zu dürfen. Hier findet ihr alle wichtigen Informationen zu unseren Trainings, Turnieren und Veranstaltungen. Schaut regelmäßig vorbei für Updates!',
    image_url: null,
    youtube_url: null,
  };

  try {
    const { data, error } = await supabase
      .from('news_posts')
      .insert(sampleNews)
      .select();

    if (error) {
      console.error('Error inserting sample news:', error);
      return null;
    }

    console.log('Sample news post inserted successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to insert sample news:', error);
    return null;
  }
};
