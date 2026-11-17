import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, typography, spacing, radius } from '../theme/colors'

const { width } = Dimensions.get('window')

const STATS = [
  { icon: '🎯', value: '98.7%', label: 'Accuracy' },
  { icon: '🤟', value: '35+',   label: 'Signs' },
  { icon: '⚡', value: '<50ms', label: 'Latency' },
  { icon: '🌍', value: '2',     label: 'Languages' },
]

const QUICK_ACTIONS = [
  { icon: '📚', title: 'Learn A-Z',      sub: 'Full ASL alphabet guide',    color: colors.teal,  tab: 'Learn' },
  { icon: '🤚', title: 'Sign Reference', sub: 'ASL + ISL visual cards',     color: colors.amber, tab: 'Reference' },
  { icon: '🇮🇳', title: 'ISL Reference', sub: 'Indian Sign Language',        color: colors.green, tab: 'Reference' },
  { icon: '👤', title: 'Your Profile',   sub: 'Account & progress',         color: colors.blue,  tab: 'Profile' },
]

export default function HomeScreen({ navigation }) {
  const [recentSigns] = useState(['A', 'Hello', 'B', 'V', 'L'])

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>

      {/* Hero Banner */}
      <LinearGradient colors={['#0d3d3a', '#0c0f16']} style={styles.heroBanner}>
        <Text style={styles.heroEmoji}>🤟</Text>
        <Text style={styles.heroTitle}>SignAI Mobile</Text>
        <Text style={styles.heroSub}>AI-powered sign language recognition{'\n'}on your phone — free & accessible</Text>
        <View style={styles.langRow}>
          <View style={styles.langBadge}><Text style={[styles.langBadgeText, { color: colors.teal }]}>ASL</Text></View>
          <View style={[styles.langBadge, { borderColor: 'rgba(245,158,11,0.3)', backgroundColor: colors.amberBg }]}>
            <Text style={[styles.langBadgeText, { color: colors.amber }]}>ISL</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsGrid}>
        {STATS.map(s => (
          <View key={s.label} style={styles.statCard}>
            <Text style={styles.statIcon}>{s.icon}</Text>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {QUICK_ACTIONS.map(a => (
          <TouchableOpacity key={a.title} style={[styles.actionCard, { borderLeftColor: a.color, borderLeftWidth: 3 }]}
            onPress={() => navigation.navigate(a.tab)} activeOpacity={0.75}>
            <Text style={styles.actionIcon}>{a.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>{a.title}</Text>
              <Text style={styles.actionSub}>{a.sub}</Text>
            </View>
            <Text style={{ color: a.color, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Signs */}
      <Text style={styles.sectionTitle}>Recent Signs</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
        {recentSigns.map((s, i) => (
          <View key={i} style={styles.recentChip}>
            <Text style={styles.recentChipText}>{s}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Info Note */}
      <View style={styles.infoNote}>
        <Text style={{ fontSize: 16, marginBottom: 4 }}>💡</Text>
        <Text style={styles.infoNoteText}>
          Live camera detection is available in the web dashboard at{' '}
          <Text style={{ color: colors.teal, fontWeight: '700' }}>localhost:5173</Text>.{' '}
          Mobile detection coming in v2.
        </Text>
      </View>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.bg },
  heroBanner:   { padding: 28, paddingTop: 40, paddingBottom: 32, alignItems: 'center' },
  heroEmoji:    { fontSize: 52, marginBottom: 12 },
  heroTitle:    { fontSize: typography.xxl, fontWeight: typography.black, color: colors.text, letterSpacing: -0.5, marginBottom: 8 },
  heroSub:      { fontSize: typography.sm, color: colors.muted, textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  langRow:      { flexDirection: 'row', gap: 10 },
  langBadge:    { paddingHorizontal: 14, paddingVertical: 5, borderRadius: radius.full, borderWidth: 1, borderColor: 'rgba(45,212,191,0.3)', backgroundColor: colors.tealBg },
  langBadgeText:{ fontSize: typography.xs, fontWeight: typography.bold, letterSpacing: 1 },

  statsGrid:  { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 10, justifyContent: 'center' },
  statCard:   { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 16, alignItems: 'center', width: (width - 56) / 2, gap: 4 },
  statIcon:   { fontSize: 26, marginBottom: 4 },
  statValue:  { fontSize: typography.xl, fontWeight: typography.black, color: colors.teal, letterSpacing: -0.5 },
  statLabel:  { fontSize: typography.xs, color: colors.muted, fontWeight: typography.medium },

  sectionTitle: { fontSize: typography.base, fontWeight: typography.extrabold, color: colors.text, marginHorizontal: 16, marginTop: 24, marginBottom: 12 },

  actionsGrid:  { paddingHorizontal: 16, gap: 10 },
  actionCard:   { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14 },
  actionIcon:   { fontSize: 28 },
  actionTitle:  { fontSize: typography.sm, fontWeight: typography.bold, color: colors.text, marginBottom: 2 },
  actionSub:    { fontSize: typography.xs, color: colors.muted },

  recentRow:    { marginBottom: 8 },
  recentChip:   { backgroundColor: colors.tealBg, borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(45,212,191,0.2)', paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  recentChipText: { fontSize: typography.base, fontWeight: typography.black, color: colors.teal },

  infoNote:     { margin: 16, backgroundColor: 'rgba(45,212,191,0.06)', borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(45,212,191,0.15)', padding: 16, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  infoNoteText: { flex: 1, fontSize: typography.xs, color: colors.muted, lineHeight: 18 },
})
