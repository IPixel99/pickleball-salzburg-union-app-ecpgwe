
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import Icon from '../components/Icon';
import { commonStyles, colors, buttonStyles, buttonTextStyles } from '../styles/commonStyles';

interface MembershipInfo {
  memberships: {
    type: 'summer_season' | 'ten_block' | 'pay_by_play';
    credits?: number;
    displayName: string;
  }[];
  primaryMembership: string;
}

export default function TestMembershipScreen() {
  const [membershipInfo, setMembershipInfo] = useState<MembershipInfo>({ 
    memberships: [], 
    primaryMembership: 'Keine Mitgliedschaft' 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [testResults, setTestResults] = useState<string[]>([]);

  const { user } = useAuth();
  const router = useRouter();

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const fetchMembershipInfo = useCallback(async () => {
    if (!user) return;

    try {
      console.log('Fetching membership info for user:', user.id);
      addTestResult(`Fetching membership info for user: ${user.id}`);
      
      const memberships: {
        type: 'summer_season' | 'ten_block' | 'pay_by_play';
        credits?: number;
        displayName: string;
      }[] = [];

      // Check summer_season_members
      const { data: summerData, error: summerError } = await supabase
        .from('summer_season_members')
        .select('*')
        .eq('id', user.id)
        .single();

      if (summerData && !summerError) {
        console.log('Found summer season membership:', summerData);
        addTestResult('✅ Found summer season membership');
        memberships.push({
          type: 'summer_season',
          displayName: 'Wintermembership'
        });
      } else {
        addTestResult(`❌ Summer season check: ${summerError?.message || 'Not found'}`);
      }

      // Check ten_block_membership
      const { data: tenBlockData, error: tenBlockError } = await supabase
        .from('ten_block_membership')
        .select('*')
        .eq('id', user.id)
        .single();

      if (tenBlockData && !tenBlockError) {
        console.log('Found ten block membership:', tenBlockData);
        addTestResult(`✅ Found ten block membership with ${tenBlockData.credits} credits`);
        memberships.push({
          type: 'ten_block',
          credits: Number(tenBlockData.credits) || 0,
          displayName: 'Zehner Block'
        });
      } else {
        addTestResult(`❌ Ten block check: ${tenBlockError?.message || 'Not found'}`);
      }

      // Check pay_by_play_members
      const { data: payByPlayData, error: payByPlayError } = await supabase
        .from('pay_by_play_members')
        .select('*')
        .eq('id', user.id)
        .single();

      if (payByPlayData && !payByPlayError) {
        console.log('Found pay by play membership:', payByPlayData);
        addTestResult('✅ Found pay by play membership');
        memberships.push({
          type: 'pay_by_play',
          displayName: 'Pay by Play'
        });
      } else {
        addTestResult(`❌ Pay by play check: ${payByPlayError?.message || 'Not found'}`);
      }

      // Set membership info
      if (memberships.length > 0) {
        const primaryMembership = memberships.length === 1 
          ? memberships[0].displayName 
          : `${memberships.length} aktive Mitgliedschaften`;
        
        setMembershipInfo({
          memberships,
          primaryMembership
        });
        addTestResult(`✅ Final result: ${primaryMembership}`);
      } else {
        console.log('No membership found for user');
        addTestResult('❌ No memberships found');
        setMembershipInfo({
          memberships: [],
          primaryMembership: 'Keine Mitgliedschaft'
        });
      }

    } catch (error) {
      console.error('Error fetching membership info:', error);
      addTestResult(`❌ Error: ${error}`);
      setMembershipInfo({
        memberships: [],
        primaryMembership: 'Fehler beim Laden'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchMembershipInfo();
    } else {
      setIsLoading(false);
    }
  }, [user, fetchMembershipInfo]);

  const handleBack = () => {
    router.back();
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const retryTest = () => {
    setIsLoading(true);
    setTestResults([]);
    fetchMembershipInfo();
  };

  if (!user) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.content, commonStyles.centered]}>
          <Text style={commonStyles.title}>Nicht angemeldet</Text>
          <Text style={commonStyles.text}>Bitte melde dich an, um den Test durchzuführen.</Text>
          <TouchableOpacity style={buttonStyles.primary} onPress={handleBack}>
            <Text style={buttonTextStyles.primaryText}>Zurück</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity onPress={handleBack} style={{ marginRight: 15 }}>
            <Icon name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={commonStyles.title}>Membership Test</Text>
        </View>

        {/* User Info */}
        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>Benutzer Info</Text>
          <Text style={commonStyles.text}>ID: {user.id}</Text>
          <Text style={commonStyles.text}>Email: {user.email}</Text>
        </View>

        {/* Membership Results */}
        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>Mitgliedschaft Ergebnis</Text>
          
          {isLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[commonStyles.text, { marginTop: 10 }]}>Lade Mitgliedschaftsdaten...</Text>
            </View>
          ) : (
            <>
              <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 10 }]}>
                {membershipInfo.primaryMembership}
              </Text>
              
              {membershipInfo.memberships.map((membership, index) => (
                <View key={membership.type} style={{ marginBottom: 10 }}>
                  <Text style={commonStyles.text}>• {membership.displayName}</Text>
                  {membership.credits !== undefined && (
                    <Text style={[commonStyles.caption, { marginLeft: 15, color: colors.textSecondary }]}>
                      Credits: {membership.credits}
                    </Text>
                  )}
                </View>
              ))}
            </>
          )}
        </View>

        {/* Test Results */}
        <View style={commonStyles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <Text style={commonStyles.subtitle}>Test Logs</Text>
            <TouchableOpacity onPress={clearResults}>
              <Text style={[commonStyles.text, { color: colors.primary }]}>Löschen</Text>
            </TouchableOpacity>
          </View>
          
          {testResults.length === 0 ? (
            <Text style={[commonStyles.text, { color: colors.textSecondary }]}>
              Keine Logs verfügbar
            </Text>
          ) : (
            testResults.map((result, index) => (
              <Text key={index} style={[commonStyles.caption, { marginBottom: 5, fontFamily: 'monospace' }]}>
                {result}
              </Text>
            ))
          )}
        </View>

        {/* Action Buttons */}
        <View style={{ marginBottom: 40 }}>
          <TouchableOpacity 
            style={[buttonStyles.primary, { marginBottom: 15 }]} 
            onPress={retryTest}
            disabled={isLoading}
          >
            <Icon name="refresh-cw" size={20} color="white" style={{ marginRight: 10 }} />
            <Text style={buttonTextStyles.primaryText}>Test wiederholen</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={buttonStyles.secondary} onPress={handleBack}>
            <Text style={buttonTextStyles.secondaryText}>Zurück</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
