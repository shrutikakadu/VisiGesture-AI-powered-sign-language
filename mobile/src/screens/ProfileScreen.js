import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, typography, radius } from '../theme/colors'

const BADGES = [
  { icon: '🥇', name: 'First Sign',    earned: true  },
  { icon: '🔥', name: '7-Day Streak',  earned: true  },
  { icon: '⚡', name: 'Speed Demon',   earned: true  },
  { icon: '🎯', name: 'Dead Accurate', earned: false },
  { icon: '🌍', name: 'Bilingual',     earned: false },
  { icon: '🏆', name: 'Sign Master',   earned: false },
]

const STATS = [
  ['🤟', 'Signs Detected', '47'],
  ['📅', 'Days Active',    '12'],
  ['🔥', 'Current Streak', '7 days'],
  ['🎯', 'Avg Accuracy',   '94.3%'],
]

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>

      {/* Avatar Banner */}
      <LinearGradient colors={['#0d3d3a', '#0c0f16']} style={styles.banner}>
        <View style={styles.avatar}><Text style={styles.avatarText}>S</Text></View>
        <Text style={styles.name}>SignAI User</Text>
        <Text style={styles.email}>user@signai.app</Text>
        <View style={styles.badgeRow}>
          <View style={styles.badge}><Text style={styles.badgeText}>Free Plan</Text></View>
          <View style={[styles.badge, { borderColor: 'rgba(52,211,153,0.3)', backgroundColor: colors.greenBg }]}>
            <Text style={[styles.badgeText, { color: colors.green }]}>Active</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Stats */}
      <Text style={styles.sectionTitle}>Your Stats</Text>
      <View style={styles.statsGrid}>
        {STATS.map(([icon, label, val]) => (
          <View key={label} style={styles.statCard}>
            <Text style={styles.statIcon}>{icon}</Text>
            <Text style={styles.statVal}>{val}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Badges */}
      <Text style={styles.sectionTitle}>Badges</Text>
      <View style={styles.badgesGrid}>
        {BADGES.map(b => (
          <View key={b.name} style={[styles.badgeCard, !b.earned && styles.badgeLocked]}>
            <Text style={styles.badgeIcon}>{b.earned ? b.icon : '🔒'}</Text>
            <Text style={styles.badgeName}>{b.name}</Text>
          </View>
        ))}
      </View>

      {/* App Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>About SignAI Mobile</Text>
        {[['Version','1.0.0'],['Supports','ASL + ISL'],['Camera AI','v2 (coming)'],['Web App','localhost:5173']].map(([k,v]) => (
          <View key={k} style={styles.infoRow}>
            <Text style={styles.infoKey}>{k}</Text>
            <Text style={styles.infoVal}>{v}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.75}>
        <Text style={styles.logoutText}>🚪 Sign Out</Text>
      </TouchableOpacity>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  banner:     { padding: 28, paddingTop: 36, alignItems: 'center', gap: 6 },
  avatar:     { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.tealSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 8, shadowColor: colors.teal, shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 0 } },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#0a1a19' },
  name:       { fontSize: typography.xl, fontWeight: typography.black, color: colors.text, letterSpacing: -0.5 },
  email:      { fontSize: typography.sm, color: colors.muted, marginBottom: 4 },
  badgeRow:   { flexDirection: 'row', gap: 8, marginTop: 6 },
  badge:      { paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full, borderWidth: 1, borderColor: 'rgba(45,212,191,0.3)', backgroundColor: colors.tealBg },
  badgeText:  { fontSize: typography.xs, fontWeight: typography.bold, color: colors.teal },

  sectionTitle: { fontSize: typography.base, fontWeight: typography.extrabold, color: colors.text, marginHorizontal: 16, marginTop: 24, marginBottom: 12 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10 },
  statCard:  { flex: 1, minWidth: '44%', backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 14, alignItems: 'center', gap: 4 },
  statIcon:  { fontSize: 22 },
  statVal:   { fontSize: typography.xl, fontWeight: typography.black, color: colors.teal, letterSpacing: -0.5 },
  statLabel: { fontSize: typography.xs, color: colors.muted, fontWeight: typography.medium },

  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10 },
  badgeCard:  { width: '30%', backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)', padding: 12, alignItems: 'center', gap: 6 },
  badgeLocked:{ opacity: 0.4 },
  badgeIcon:  { fontSize: 28 },
  badgeName:  { fontSize: typography.xs, fontWeight: typography.bold, color: colors.text, textAlign: 'center' },

  infoCard:   { margin: 16, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 16 },
  infoTitle:  { fontSize: typography.sm, fontWeight: typography.extrabold, color: colors.text, marginBottom: 12 },
  infoRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoKey:    { fontSize: typography.sm, color: colors.muted },
  infoVal:    { fontSize: typography.sm, fontWeight: typography.bold, color: colors.text },

  logoutBtn:  { margin: 16, padding: 14, backgroundColor: 'rgba(248,113,113,0.08)', borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(248,113,113,0.2)', alignItems: 'center' },
  logoutText: { fontSize: typography.sm, fontWeight: typography.bold, color: colors.red },
})
