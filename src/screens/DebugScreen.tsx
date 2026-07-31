import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BUILDINGS } from '../data/buildings';
import { CREW_TEMPLATE_LIST } from '../data/crew';
import { MERCHANT_ENCOUNTER_TABLE, MERCHANT_TEMPLATES } from '../data/merchants';
import { PIRATE_LORDS } from '../data/pirateLords';
import { RESOURCE_LIST } from '../data/resources';
import { SHIP_UPGRADES } from '../data/shipUpgrades';
import { SIDE_QUESTS } from '../data/sideQuests';
import { THREAT_TEMPLATES } from '../data/threats';
import { RootStackParamList } from '../navigation/types';
import { useActiveCrewMember, useGameStore } from '../store/gameStore';
import { CrewTemplate } from '../types';
import { maxHpFor } from '../utils/battle';

type Props = NativeStackScreenProps<RootStackParamList, 'Debug'>;

const LEVEL_JUMPS = [5, 10, 15, 20, 25, 30];
const GOLD_AMOUNTS = [100, 1000];
const HEAT_VALUES = [0, 30, 60, 90];

export default function DebugScreen({ navigation }: Props) {
  const activeCrew = useActiveCrewMember();
  const debugSetCrewLevel = useGameStore((s) => s.debugSetCrewLevel);
  const debugResetSave = useGameStore((s) => s.debugResetSave);
  const addGold = useGameStore((s) => s.addGold);
  const setHeat = useGameStore((s) => s.setHeat);
  const healAllCrew = useGameStore((s) => s.healAllCrew);
  const setWildEncounter = useGameStore((s) => s.setWildEncounter);
  const setCurrentPirateLord = useGameStore((s) => s.setCurrentPirateLord);
  const setCurrentSideQuest = useGameStore((s) => s.setCurrentSideQuest);
  const addResource = useGameStore((s) => s.addResource);
  const debugClearResourceCooldowns = useGameStore((s) => s.debugClearResourceCooldowns);
  const addItem = useGameStore((s) => s.addItem);
  const setCurrentBuilding = useGameStore((s) => s.setCurrentBuilding);
  const debugClearTheftCooldowns = useGameStore((s) => s.debugClearTheftCooldowns);
  const shipUpgrades = useGameStore((s) => s.shipUpgrades);
  const buyShipUpgrade = useGameStore((s) => s.buyShipUpgrade);
  const debugClearSalvageCooldowns = useGameStore((s) => s.debugClearSalvageCooldowns);
  const crew = useGameStore((s) => s.crew);
  const removeCrewMember = useGameStore((s) => s.removeCrewMember);
  const capturedCrew = useGameStore((s) => s.capturedCrew);

  function handleGrantUpgrade(upgradeId: string) {
    addGold(9999);
    const upgrade = SHIP_UPGRADES.find((u) => u.id === upgradeId);
    if (upgrade) addResource(upgrade.resourceId, upgrade.resourceCost);
    buyShipUpgrade(upgradeId);
  }

  function handleForceCapture(capturedBy: 'navy' | 'rival') {
    if (crew.length === 0) return;
    removeCrewMember(crew[0].instanceId, capturedBy);
  }

  function forceEncounter(
    templateId: string,
    level: number,
    faction: 'wild' | 'rival' | 'navy',
    template: CrewTemplate
  ) {
    const maxHp = maxHpFor(
      { instanceId: 'wild', templateId, nickname: template.name, level, xp: 0, currentHp: 0 },
      template
    );
    setWildEncounter({ templateId, level, currentHp: maxHp, faction });
    navigation.navigate('Encounter');
  }

  function handleForceWild() {
    const template = CREW_TEMPLATE_LIST[Math.floor(Math.random() * CREW_TEMPLATE_LIST.length)];
    forceEncounter(template.id, activeCrew?.level ?? 5, 'wild', template);
  }

  function handleForceRival() {
    const template = THREAT_TEMPLATES.rival_deckhand;
    forceEncounter(template.id, activeCrew?.level ?? 5, 'rival', template);
  }

  function handleForceNavy() {
    const template = THREAT_TEMPLATES.navy_marine;
    forceEncounter(template.id, activeCrew?.level ?? 5, 'navy', template);
  }

  function handleForceMerchant() {
    const slot =
      MERCHANT_ENCOUNTER_TABLE[Math.floor(Math.random() * MERCHANT_ENCOUNTER_TABLE.length)];
    const template = MERCHANT_TEMPLATES[slot.templateId];
    const maxHp = maxHpFor(
      {
        instanceId: 'wild',
        templateId: slot.templateId,
        nickname: template.name,
        level: activeCrew?.level ?? 5,
        xp: 0,
        currentHp: 0,
      },
      template
    );
    setWildEncounter({
      templateId: slot.templateId,
      level: activeCrew?.level ?? 5,
      currentHp: maxHp,
      faction: 'merchant',
    });
    navigation.navigate('Encounter');
  }

  function handleJumpToShop(buildingId: string) {
    setCurrentBuilding(buildingId);
    navigation.navigate('Building');
  }

  function handleJumpToFort(lordId: string) {
    setCurrentPirateLord(lordId);
    navigation.navigate('PirateLord');
  }

  function handleJumpToQuest(questId: string) {
    setCurrentSideQuest(questId);
    navigation.navigate('SideQuest');
  }

  function handleReset() {
    debugResetSave();
    navigation.reset({ index: 0, routes: [{ name: 'Map' }] });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>🛠 Debug Menu</Text>
        <Text style={styles.warning}>Dev builds only — not shown in production.</Text>

        <Text style={styles.sectionHeading}>
          Active Crew: {activeCrew?.nickname ?? 'none'} (Lv.{activeCrew?.level ?? '?'})
        </Text>
        <View style={styles.row}>
          {LEVEL_JUMPS.map((level) => (
            <Pressable
              key={level}
              style={styles.button}
              onPress={() => activeCrew && debugSetCrewLevel(activeCrew.instanceId, level)}
              disabled={!activeCrew}
            >
              <Text style={styles.buttonText}>Lv.{level}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionHeading}>Gold</Text>
        <View style={styles.row}>
          {GOLD_AMOUNTS.map((amount) => (
            <Pressable key={amount} style={styles.button} onPress={() => addGold(amount)}>
              <Text style={styles.buttonText}>+{amount}g</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionHeading}>Heat</Text>
        <View style={styles.row}>
          {HEAT_VALUES.map((value) => (
            <Pressable key={value} style={styles.button} onPress={() => setHeat(value)}>
              <Text style={styles.buttonText}>{value}%</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionHeading}>Crew</Text>
        <View style={styles.row}>
          <Pressable style={styles.button} onPress={() => healAllCrew()}>
            <Text style={styles.buttonText}>Heal All</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionHeading}>Force Encounter</Text>
        <View style={styles.row}>
          <Pressable style={styles.button} onPress={handleForceWild}>
            <Text style={styles.buttonText}>Wild (random)</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={handleForceRival}>
            <Text style={styles.buttonText}>Rival Ambush</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={handleForceNavy}>
            <Text style={styles.buttonText}>Navy Ambush</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={handleForceMerchant}>
            <Text style={styles.buttonText}>Merchant Ship</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionHeading}>Jump to Pirate Lord Fort</Text>
        <View style={styles.row}>
          {PIRATE_LORDS.map((lord) => (
            <Pressable key={lord.id} style={styles.button} onPress={() => handleJumpToFort(lord.id)}>
              <Text style={styles.buttonText}>
                {lord.order}. {lord.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionHeading}>Resources</Text>
        <View style={styles.row}>
          {RESOURCE_LIST.map((resource) => (
            <Pressable
              key={resource.id}
              style={styles.button}
              onPress={() => addResource(resource.id, 5)}
            >
              <Text style={styles.buttonText}>
                +5 {resource.emoji} {resource.name}
              </Text>
            </Pressable>
          ))}
          <Pressable style={styles.button} onPress={debugClearResourceCooldowns}>
            <Text style={styles.buttonText}>Clear Node Cooldowns</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={() => addItem('captains_draught', 1)}>
            <Text style={styles.buttonText}>+1 🍾 Captain's Draught</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionHeading}>Jump to Themed Shop</Text>
        <View style={styles.row}>
          {BUILDINGS.filter((b) => b.stealResourceId).map((b) => (
            <Pressable key={b.id} style={styles.button} onPress={() => handleJumpToShop(b.id)}>
              <Text style={styles.buttonText}>{b.name}</Text>
            </Pressable>
          ))}
          <Pressable style={styles.button} onPress={debugClearTheftCooldowns}>
            <Text style={styles.buttonText}>Clear Theft Cooldowns</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionHeading}>Ship Upgrades</Text>
        <View style={styles.row}>
          {SHIP_UPGRADES.map((upgrade) => {
            const owned = shipUpgrades.includes(upgrade.id);
            return (
              <Pressable
                key={upgrade.id}
                style={[styles.button, owned && styles.dangerButton]}
                onPress={() => handleGrantUpgrade(upgrade.id)}
                disabled={owned}
              >
                <Text style={styles.buttonText}>
                  {upgrade.emoji} {upgrade.name} {owned && '(owned)'}
                </Text>
              </Pressable>
            );
          })}
          <Pressable style={styles.button} onPress={debugClearSalvageCooldowns}>
            <Text style={styles.buttonText}>Clear Salvage Cooldowns</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={() => handleJumpToShop('roatan_den')}>
            <Text style={styles.buttonText}>Jump to Smuggler's Den</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionHeading}>Prisoner Rescue ({capturedCrew.length} captured)</Text>
        <View style={styles.row}>
          <Pressable style={styles.button} onPress={() => handleForceCapture('navy')}>
            <Text style={styles.buttonText}>Force-Capture (Navy)</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={() => handleForceCapture('rival')}>
            <Text style={styles.buttonText}>Force-Capture (Rival)</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={() => navigation.navigate('Rescue')}>
            <Text style={styles.buttonText}>Jump to Locked Ward</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionHeading}>Jump to Side Quest</Text>
        <View style={styles.row}>
          {SIDE_QUESTS.map((quest) => (
            <Pressable key={quest.id} style={styles.button} onPress={() => handleJumpToQuest(quest.id)}>
              <Text style={styles.buttonText}>{quest.title}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionHeading}>Save</Text>
        <View style={styles.row}>
          <Pressable style={styles.dangerButton} onPress={handleReset}>
            <Text style={styles.buttonText}>Reset Save</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back to Map</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1a1a1a' },
  content: { padding: 16, paddingBottom: 20 },
  title: { fontSize: 22, fontWeight: '800', color: '#f4e9cd' },
  warning: { color: '#ffb300', fontSize: 12, marginTop: 4, marginBottom: 16 },
  sectionHeading: { color: '#ffd166', fontWeight: '800', fontSize: 14, marginTop: 16, marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  button: {
    backgroundColor: '#2c5a7a',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  dangerButton: {
    backgroundColor: '#7a1f1f',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: { color: '#f4e9cd', fontWeight: '700', fontSize: 12 },
  backButton: {
    margin: 16,
    backgroundColor: '#f4e9cd',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: { color: '#0b3d5c', fontWeight: '800', fontSize: 16 },
});
