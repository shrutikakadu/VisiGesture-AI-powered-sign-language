import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native'
import { colors, typography, spacing, radius } from '../theme/colors'
import { ASL_SIGNS, WORD_SIGNS } from '../data/signs'

const { width } = Dimensions.get('window')

export default function LearnScreen() {
  const [tab, setTab] = useState('alpha')
  const [selected, setSelected] = useState(null)
  const signs = tab === 'alpha' ? ASL_SIGNS : WORD_SIGNS

  return (
    <View style={styles.container}>
      {/* Tab Toggle */}
      <View style={styles.tabRow}>
        {[['alpha','🔤 A-Z Alphabet'],['words','💬 Common Words']].map(([id, label]) => (
          <TouchableOpacity key={id} style={[styles.tabBtn, tab === id && styles.tabBtnActive]}
            onPress={() => { setTab(id); setSelected(null) }} activeOpacity={0.7}>
            <Text style={[styles.tabBtnText, tab === id && styles.tabBtnTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Grid */}
        <View style={styles.grid}>
          {signs.map(s => (
            <TouchableOpacity key={s.letter}
              style={[styles.signCard, selected?.letter === s.letter && styles.signCardActive]}
              onPress={() => setSelected(selected?.letter === s.letter ? null : s)}
              activeOpacity={0.75}>
              <Text style={[styles.signLetter, selected?.letter === s.letter && { color: colors.teal }]}>{s.letter}</Text>
              {s.detectable && <View style={styles.detectableDot} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Detail Card */}
        {selected && (
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>"{selected.letter}"</Text>
            <Text style={styles.detailDesc}>👋  <Text style={{ fontWeight: '700', color: colors.text }}>How to sign: </Text>{selected.desc}</Text>
            {selected.detectable && (
              <View style={styles.detectableBadge}>
                <Text style={styles.detectableBadgeText}>✓ AI Detectable in camera mode</Text>
              </View>
            )}
          </View>
        )}

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendRow}>
            <View style={styles.detectableDot} />
            <Text style={styles.legendText}>Green dot = AI camera-detectable sign</Text>
          </View>
          <Text style={[styles.legendText, { marginTop: 4 }]}>Tap any card to see how-to instructions</Text>
        </View>
      </ScrollView>
    </View>
  )
}

const CARD = (width - 16 * 2 - 8 * 5) / 6

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  tabRow: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: colors.bg2, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabBtn: { flex: 1, paddingVertical: 9, paddingHorizontal: 12, borderRadius: radius.md, backgroundColor: colors.surface2, alignItems: 'center' },
  tabBtnActive: { backgroundColor: colors.tealBg, shadowColor: colors.teal, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 8 },
  tabBtnText: { fontSize: typography.sm, fontWeight: typography.semibold, color: colors.muted },
  tabBtnTextActive: { color: colors.teal, fontWeight: typography.bold },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  signCard: {
    width: CARD, height: CARD,
    backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  signCardActive: { backgroundColor: colors.tealBg, borderColor: 'rgba(45,212,191,0.5)' },
  signLetter: { fontSize: typography.base, fontWeight: typography.black, color: colors.text },
  detectableDot: { position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green },

  detailCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(45,212,191,0.25)', padding: 16, marginBottom: 16, backgroundColor: colors.tealBg },
  detailTitle: { fontSize: typography.xl, fontWeight: typography.black, color: colors.teal, marginBottom: 8 },
  detailDesc:  { fontSize: typography.sm, color: colors.muted, lineHeight: 22 },
  detectableBadge: { marginTop: 10, alignSelf: 'flex-start', backgroundColor: colors.greenBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  detectableBadgeText: { fontSize: typography.xs, color: colors.green, fontWeight: typography.bold },

  legend: { padding: 12, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendText: { fontSize: typography.xs, color: colors.muted },
})
