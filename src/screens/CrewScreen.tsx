import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CREW_TEMPLATE_LIST, CREW_TEMPLATES } from '../data/crew';
import { ITEMS } from '../data/items';
import { RESOURCES } from '../data/resources';
import { RootStackParamList } from '../navigation/types';
import { SHIP_CREW_CAP, useGameStore } from '../store/gameStore';
import { maxHpFor, xpToNextLevel } from '../utils/battle';
import { OwnedCrewMember } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Crew'>;

const HEAL_ITEM_ID = 'rum_ration';

export default function CrewScreen({ navigation }: Props) {
  const crew = useGameStore((s) => s.crew);
  const shipCrewIds = useGameStore((s) => s.shipCrewIds);
  const activeCrewId = useGameStore((s) => s.activeCrewId);
  const setActiveCrew = useGameStore((s) => s.setActiveCrew);
  const setCrewHp = useGameStore((s) => s.setCrewHp);
  const sendToQuarters = useGameStore((s) => s.sendToQuarters);
  const bringAboard = useGameStore((s) => s.bringAboard);
  const gold = useGameStore((s) => s.gold);
  const inventory = useGameStore((s) => s.inventory);
  const consumeItem = useGameStore((s) => s.consumeItem);
  const recruitedTemplateIds = useGameStore((s) => s.recruitedTemplateIds);
  const resources = useGameStore((s) => s.resources);

  const healItem = ITEMS[HEAL_ITEM_ID];
  const healItemCount = inventory[HEAL_ITEM_ID] ?? 0;

  const shipCrew = shipCrewIds
    .map((id) => crew.find((m) => m.instanceId === id))
    .filter((m): m is OwnedCrewMember => !!m);
  const quartersCrew = crew.filter((m) => !shipCrewIds.includes(m.instanceId));

  function handleHeal(member: OwnedCrewMember, maxHp: number) {
    if (healItemCount <= 0 || member.currentHp >= maxHp) return;
    consumeItem(HEAL_ITEM_ID);
    const healAmount = Math.round(maxHp * (healItem.healPercent ?? 0));
    setCrewHp(member.instanceId, Math.min(maxHp, member.currentHp + healAmount));
  }

  function renderCard(item: OwnedCrewMember, onboard: boolean) {
    const template = CREW_TEMPLATES[item.templateId];
    const maxHp = maxHpFor(item);
    const isActive = item.instanceId === activeCrewId;
    const isFainted = item.currentHp <= 0;
    const canHeal = healItemCount > 0 && item.currentHp < maxHp;

    return (
      <Pressable
        key={item.instanceId}
        style={[styles.card, isActive && styles.cardActive]}
        onPress={() => onboard && !isFainted && setActiveCrew(item.instanceId)}
        disabled={!onboard || isFainted}
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
        <View style={styles.cardActions}>
          {canHeal && (
            <Pressable style={styles.healButton} onPress={() => handleHeal(item, maxHp)}>
              <Text style={styles.healButtonText}>{healItem.emoji} Heal</Text>
            </Pressable>
          )}
          {onboard ? (
            <Pressable
              style={[styles.quartersButton, shipCrew.length <= 1 && styles.disabledButton]}
              onPress={() => sendToQuarters(item.instanceId)}
              disabled={shipCrew.length <= 1}
            >
              <Text style={styles.quartersButtonText}>Send to Quarters</Text>
            </Pressable>
          ) : (
            <Pressable
              style={[
                styles.quartersButton,
                shipCrew.length >= SHIP_CREW_CAP && styles.disabledButton,
              ]}
              onPress={() => bringAboard(item.instanceId)}
              disabled={shipCrew.length >= SHIP_CREW_CAP}
            >
              <Text style={styles.quartersButtonText}>Bring Aboard</Text>
            </Pressable>
          )}
        </View>
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
      <ScrollView contentContainerStyle={styles.listContent}>
        <Text style={styles.sectionHeading}>
          Ship's Crew ({shipCrew.length}/{SHIP_CREW_CAP})
        </Text>
        {shipCrew.map((item) => renderCard(item, true))}

        {quartersCrew.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>Crew Quarters ({quartersCrew.length})</Text>
            {quartersCrew.map((item) => renderCard(item, false))}
          </>
        )}
      </ScrollView>
      <View style={styles.bag}>
        <Text style={styles.bagHeading}>Cargo Hold</Text>
        {Object.entries(resources).filter(([, count]) => count > 0).length === 0 ? (
          <Text style={styles.bagEmpty}>No resources gathered yet.</Text>
        ) : (
          <View style={styles.bagRow}>
            {Object.entries(resources)
              .filter(([, count]) => count > 0)
              .map(([resourceId, count]) => (
                <Text key={resourceId} style={styles.bagItem}>
                  {RESOURCES[resourceId as keyof typeof RESOURCES].emoji}{' '}
                  {RESOURCES[resourceId as keyof typeof RESOURCES].name} x{count}
                </Text>
              ))}
          </View>
        )}
      </View>
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
  sectionHeading: { color: '#ffd166', fontWeight: '800', fontSize: 14, marginTop: 4 },
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
  cardActions: { alignItems: 'flex-end', gap: 6 },
  quartersButton: {
    backgroundColor: '#8a5a2b',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  quartersButtonText: { color: '#f4e9cd', fontWeight: '700', fontSize: 11 },
  disabledButton: { backgroundColor: '#4a4a4a' },
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
