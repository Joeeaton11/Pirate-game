import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CREW_TEMPLATE_LIST, CREW_TEMPLATES } from '../data/crew';
import { ITEMS } from '../data/items';
import { RootStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';
import { maxHpFor, xpToNextLevel } from '../utils/battle';
import { OwnedCrewMember } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Crew'>;

const HEAL_ITEM_ID = 'rum_ration';

export default function CrewScreen({ navigation }: Props) {
  const crew = useGameStore((s) => s.crew);
  const activeCrewId = useGameStore((s) => s.activeCrewId);
  const setActiveCrew = useGameStore((s) => s.setActiveCrew);
  const setCrewHp = useGameStore((s) => s.setCrewHp);
  const gold = useGameStore((s) => s.gold);
  const inventory = useGameStore((s) => s.inventory);
  const consumeItem = useGameStore((s) => s.consumeItem);
  const recruitedTemplateIds = useGameStore((s) => s.recruitedTemplateIds);

  const healItem = ITEMS[HEAL_ITEM_ID];
  const healItemCount = inventory[HEAL_ITEM_ID] ?? 0;

  function handleHeal(member: OwnedCrewMember, maxHp: number) {
    if (healItemCount <= 0 || member.currentHp >= maxHp) return;
    consumeItem(HEAL_ITEM_ID);
    const healAmount = Math.round(maxHp * (healItem.healPercent ?? 0));
    setCrewHp(member.instanceId, Math.min(maxHp, member.currentHp + healAmount));
  }

  function renderItem({ item }: { item: OwnedCrewMember }) {
    const template = CREW_TEMPLATES[item.templateId];
    const maxHp = maxHpFor(item);
    const isActive = item.instanceId === activeCrewId;
    const isFainted = item.currentHp <= 0;
    const canHeal = healItemCount > 0 && item.currentHp < maxHp;

    return (
      <Pressable
        style={[styles.card, isActive && styles.cardActive]}
        onPress={() => !isFainted && setActiveCrew(item.instanceId)}
        disabled={isFainted}
      >
        <Text style={styles.emoji}>{template.emoji}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>
            {item.nickname} {isActive && '★'}
          </Text>
          <Text style={styles.subtext}>
            Lv.{item.level} · {template.specialty} · {template.rarity}
          </Text>
          <View style={styles.hpBarTrack}>
            <View
              style={[
                styles.hpBarFill,
                {
                  width: `${Math.max(0, (item.currentHp / maxHp) * 100)}%`,
                  backgroundColor: isFainted ? '#555' : '#4caf50',
                },
              ]}
            />
          </View>
          <Text style={styles.subtext}>
            {isFainted ? 'Fainted' : `${item.currentHp}/${maxHp} HP`} · XP {item.xp}/
            {xpToNextLevel(item.level)}
          </Text>
        </View>
        {canHeal && (
          <Pressable style={styles.healButton} onPress={() => handleHeal(item, maxHp)}>
            <Text style={styles.healButtonText}>{healItem.emoji} Heal</Text>
          </Pressable>
        )}
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Crew Roster</Text>
        <View style={styles.headerRight}>
          <Text style={styles.headerText}>💰 {gold} gold</Text>
          <Pressable style={styles.logButton} onPress={() => navigation.navigate('CrewLog')}>
            <Text style={styles.logButtonText}>
              Log {recruitedTemplateIds.length}/{CREW_TEMPLATE_LIST.length} ▸
            </Text>
          </Pressable>
        </View>
      </View>
      <FlatList
        data={crew}
        keyExtractor={(item) => item.instanceId}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.bag}>
        <Text style={styles.bagHeading}>Bag</Text>
        {Object.entries(inventory).filter(([, count]) => count > 0).length === 0 ? (
          <Text style={styles.bagEmpty}>No items yet — visit a General Store.</Text>
        ) : (
          <View style={styles.bagRow}>
            {Object.entries(inventory)
              .filter(([, count]) => count > 0)
              .map(([itemId, count]) => (
                <Text key={itemId} style={styles.bagItem}>
                  {ITEMS[itemId].emoji} {ITEMS[itemId].name} x{count}
                </Text>
              ))}
          </View>
        )}
      </View>
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back to Map</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0b3d5c' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#f4e9cd' },
  headerRight: { alignItems: 'flex-end', gap: 6 },
  headerText: { color: '#f4e9cd', fontSize: 15 },
  logButton: {
    backgroundColor: '#ffd166',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  logButtonText: { color: '#0b3d5c', fontWeight: '700', fontSize: 12 },
  listContent: { paddingHorizontal: 12, paddingBottom: 12, gap: 10 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#124d73',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardActive: { borderColor: '#ffd166' },
  emoji: { fontSize: 36 },
  info: { flex: 1 },
  name: { color: '#f4e9cd', fontWeight: '700', fontSize: 16 },
  subtext: { color: '#cfe3ee', fontSize: 12, marginTop: 2 },
  hpBarTrack: {
    height: 8,
    backgroundColor: '#062331',
    borderRadius: 4,
    marginTop: 6,
    overflow: 'hidden',
  },
  hpBarFill: { height: '100%', borderRadius: 4 },
  healButton: {
    backgroundColor: '#2c7a4b',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  healButtonText: { color: '#f4e9cd', fontWeight: '700', fontSize: 12 },
  bag: {
    marginHorizontal: 12,
    marginTop: 4,
    padding: 12,
    backgroundColor: '#062331',
    borderRadius: 12,
  },
  bagHeading: { color: '#ffd166', fontWeight: '800', fontSize: 14, marginBottom: 6 },
  bagEmpty: { color: '#cfe3ee', fontSize: 12, fontStyle: 'italic' },
  bagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bagItem: { color: '#f4e9cd', fontSize: 12 },
  backButton: {
    margin: 16,
    backgroundColor: '#f4e9cd',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: { color: '#0b3d5c', fontWeight: '800', fontSize: 16 },
});
