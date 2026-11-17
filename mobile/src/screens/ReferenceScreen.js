import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { colors, typography, radius } from '../theme/colors'
import { WORD_SIGNS, ISL_SIGNS } from '../data/signs'

export default function ReferenceScreen() {
  const [lang, setLang] = useState('asl')

  return (
    <View style={styles.container}>
      {/* Language Toggle */}
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tabBtn, lang === 'asl' && styles.tabActive]} onPress={() => setLang('asl')} activeOpacity={0.75}>
          <Text style={[styles.tabText, lang === 'asl' && styles.tabTextActive]}>🇺🇸 ASL Words</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, lang === 'isl' && styles.tabActiveAmber]} onPress={() => setLang('isl')} activeOpacity={0.75}>
          <Text style={[styles.tabText, lang === 'isl' && styles.tabTextAmber]}>🇮🇳 ISL Reference</Text>
        </TouchableOpacity>
      </View>

      {lang === 'isl' && (
        <View style={styles.islNotice}>
          <Text style={styles.islNoticeText}>
            ℹ️  <Text style={{ fontWeight: '700', color: colors.amber }}>ISL Reference Mode</Text>
            {' '}— Visual reference only. Live AI detection is ASL only. ISL detection coming soon!
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {lang === 'asl' ? (
          WORD_SIGNS.map(s => (
            <View key={s.letter} style={styles.aslCard}>
              <View style={styles.aslSignBox}><Text style={styles.aslSign}>{s.letter}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.aslTitle}>{s.letter}</Text>
                <Text style={styles.aslDesc}>{s.desc}</Text>
                {s.detectable && (
                  <View style={styles.aiTag}><Text style={styles.aiTagText}>✓ AI Detectable</Text></View>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.islGrid}>
            {ISL_SIGNS.map(s => (
              <View key={s.sign} style={styles.islCard}>
                <Text style={styles.islSign}>{s.sign}</Text>
                <Text style={styles.islDesc}>{s.desc}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  tabRow: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: colors.bg2, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabBtn: { flex: 1, paddingVertical: 9, borderRadius: radius.md, backgroundColor: colors.surface2, alignItems: 'center' },
  tabActive: { backgroundColor: colors.tealBg },
  tabActiveAmber: { backgroundColor: colors.amberBg },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.muted },
  tabTextActive: { color: colors.teal, fontWeight: '700' },
  tabTextAmber:  { color: colors.amber, fontWeight: '700' },

  islNotice: { margin: 12, padding: 12, backgroundColor: colors.amberBg, borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' },
  islNoticeText: { fontSize: 12, color: colors.muted, lineHeight: 18 },

  aslCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 10 },
  aslSignBox: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.tealBg, borderWidth: 1, borderColor: 'rgba(45,212,191,0.2)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  aslSign:  { fontSize: 20, fontWeight: '900', color: colors.teal },
  aslTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 4 },
  aslDesc:  { fontSize: 13, color: colors.muted, lineHeight: 19 },
  aiTag:    { alignSelf: 'flex-start', marginTop: 6, backgroundColor: colors.greenBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  aiTagText:{ fontSize: 11, color: colors.green, fontWeight: '700' },

  islGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  islCard: { width: '47%', backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(245,158,11,0.15)', padding: 14 },
  islSign: { fontSize: 18, fontWeight: '900', color: colors.amber, marginBottom: 6 },
  islDesc: { fontSize: 12, color: colors.muted, lineHeight: 17 },
})
