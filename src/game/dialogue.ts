import { NPC, Room, Gender } from './types';
import { pickOne } from './houseLayouts';

/**
 * Get pronouns for a gender
 */
function getPronouns(gender: Gender) {
  if (gender === 'male') {
    return { subject: 'he', object: 'him', possessive: 'his', reflexive: 'himself' };
  }
  return { subject: 'she', object: 'her', possessive: 'her', reflexive: 'herself' };
}

/**
 * Voice/personality modifiers for dialogue
 */
const VOICE_MODIFIERS = [
  'in a nervous voice',
  'with a haughty sniff',
  'in an annoyed voice',
  'rather defensively',
  'in a hushed whisper',
  'with obvious disdain',
  'thoughtfully',
  'after a long pause',
  'with a knowing look',
  'in a trembling voice',
  'dismissively',
  'with barely concealed anger',
];

/**
 * Accusation templates - someone says another person wanted the victim dead
 */
const ACCUSATION_TEMPLATES = [
  '{speaker} answers {voice}, "Far be it from me to meddle in your affairs, inspector, but I really think you should question {accused}. Why just the other day {accusedSubject} told me that {victim} would be better off dead."',
  '{speaker} says {voice}, "I don\'t want to point fingers, but {accused} and {victim} had a terrible row last week. {accused} said some very... unfortunate things."',
  '{speaker} replies {voice}, "You might want to look into {accused}. I overheard {accusedObject} saying {victim} was \'in the way\' of {accusedPossessive} plans."',
  '{speaker} confides {voice}, "Between you and me, inspector, {accused} had motive. {victim} knew something about {accused} that {accusedSubject} didn\'t want getting out."',
  '{speaker} answers {voice}, "Have you spoken to {accused} yet? {accusedSubject} had quite the grudge against {victim}. Something about an inheritance, I believe."',
];

/**
 * Room observation templates - someone saw someone near a room
 */
const ROOM_OBSERVATION_TEMPLATES = [
  '{speaker} mentions {voice}, "I did see {suspect} near the {room} earlier this evening. Seemed rather suspicious at the time."',
  '{speaker} recalls {voice}, "Now that you mention it, I spotted {suspect} coming out of the {room} looking quite flustered."',
  '{speaker} says {voice}, "I\'m fairly certain I saw {suspect} heading toward the {room} around the time it must have happened."',
  '{speaker} adds {voice}, "You know, I noticed {suspect} near the {room}. {suspectSubject} seemed to be in quite a hurry."',
];

/**
 * Weapon observation templates - someone noticed the murder weapon
 */
const WEAPON_CLUE_TEMPLATES = [
  '{speaker} recalls {voice}, "I saw the {weapon} in the {room} earlier. It struck me as odd at the time."',
  '{speaker} mentions {voice}, "You might check the {room} for the {weapon}. I believe I saw it there."',
  '{speaker} says {voice}, "The {weapon}? I think I last saw it in the {room}, if that helps."',
];

/**
 * Flavor text - general character responses
 */
const FLAVOR_TEMPLATES = [
  '{speaker} sighs {voice}, "This is all so dreadful. Poor {victim}."',
  '{speaker} says {voice}, "I\'ve told you everything I know, inspector."',
  '{speaker} responds {voice}, "I was minding my own business, as I always do."',
  '{speaker} replies {voice}, "This household has always had its... complications."',
];

/**
 * Alibi response templates
 */
const ALIBI_TEMPLATES = [
  '{speaker} answers {voice}, "{partner} and I spent the entire evening together in the {room}."',
  '{speaker} states {voice}, "I was with {partner} in the {room} all evening. {partnerSubject} can vouch for me."',
  '{speaker} replies {voice}, "Ask {partner}. We were in the {room} together when it happened."',
];

const NO_ALIBI_TEMPLATES = [
  '{speaker} hesitates {voice}, "I... I was alone. In my quarters. Reading."',
  '{speaker} stammers {voice}, "I don\'t have anyone who can account for my whereabouts."',
  '{speaker} says {voice}, "I prefer my own company. I was alone that evening."',
  '{speaker} replies {voice}, "I stepped outside for some air. No one saw me, I suppose."',
];

interface ClueGeneratorParams {
  npc: NPC;
  allNpcs: NPC[];
  victim: { name: string; gender: Gender };
  murderer: { name: string; gender: Gender };
  murderRoom: Room;
  murderWeaponName: string;
  // What clues this NPC should provide
  shouldAccuseMurderer: boolean;
  shouldHintRoom: boolean;
  shouldHintWeapon: boolean;
}

/**
 * Generate clues for a specific NPC
 */
export function generateCluesForNPC(params: ClueGeneratorParams): string[] {
  const {
    npc,
    allNpcs,
    victim,
    murderer,
    murderRoom,
    murderWeaponName,
    shouldAccuseMurderer,
    shouldHintRoom,
    shouldHintWeapon,
  } = params;

  const clues: string[] = [];
  const voice = pickOne(VOICE_MODIFIERS);
  const murdererPronouns = getPronouns(murderer.gender);

  // Murderer gives misleading clues - accuses an innocent
  if (npc.isMurderer) {
    const innocents = allNpcs.filter((n) => !n.isMurderer && n.id !== npc.id);
    if (innocents.length > 0) {
      const scapegoat = pickOne(innocents);
      const scapegoatPronouns = getPronouns(scapegoat.gender);
      const template = pickOne(ACCUSATION_TEMPLATES);
      clues.push(
        fillTemplate(template, {
          speaker: npc.name,
          voice,
          accused: scapegoat.name,
          accusedSubject: scapegoatPronouns.subject,
          accusedObject: scapegoatPronouns.object,
          accusedPossessive: scapegoatPronouns.possessive,
          victim: victim.name,
        })
      );
    }
  } else {
    // Innocent NPCs provide useful clues based on their assigned roles

    if (shouldAccuseMurderer) {
      // This NPC provides accusation against the murderer
      const template = pickOne(ACCUSATION_TEMPLATES);
      clues.push(
        fillTemplate(template, {
          speaker: npc.name,
          voice,
          accused: murderer.name,
          accusedSubject: murdererPronouns.subject,
          accusedObject: murdererPronouns.object,
          accusedPossessive: murdererPronouns.possessive,
          victim: victim.name,
        })
      );
    }

    if (shouldHintRoom) {
      // This NPC hints at the murder room
      const template = pickOne(ROOM_OBSERVATION_TEMPLATES);
      clues.push(
        fillTemplate(template, {
          speaker: npc.name,
          voice,
          suspect: murderer.name,
          suspectSubject: capitalizeFirst(murdererPronouns.subject),
          room: murderRoom.name,
        })
      );
    }

    if (shouldHintWeapon) {
      // This NPC hints at the murder weapon location
      const template = pickOne(WEAPON_CLUE_TEMPLATES);
      clues.push(
        fillTemplate(template, {
          speaker: npc.name,
          voice,
          weapon: murderWeaponName,
          room: murderRoom.name,
        })
      );
    }

    // If NPC has no assigned clues, give flavor text
    if (clues.length === 0) {
      const template = pickOne(FLAVOR_TEMPLATES);
      clues.push(
        fillTemplate(template, {
          speaker: npc.name,
          voice,
          victim: victim.name,
        })
      );
    }
  }

  return clues;
}

/**
 * Generate an alibi response for an NPC
 */
export function generateAlibiResponse(
  npc: NPC,
  allNpcs: NPC[],
  allRooms: Room[]
): string {
  const voice = pickOne(VOICE_MODIFIERS);

  if (npc.alibi) {
    const partner = allNpcs.find((n) => n.id === npc.alibi!.withWhom);
    const room = allRooms.find((r) => r.id === npc.alibi!.inRoom);

    if (partner && room) {
      const partnerPronouns = getPronouns(partner.gender);
      const template = pickOne(ALIBI_TEMPLATES);
      return fillTemplate(template, {
        speaker: npc.name,
        voice,
        partner: partner.name,
        partnerSubject: capitalizeFirst(partnerPronouns.subject),
        room: room.name,
      });
    }
  }

  // No alibi
  const template = pickOne(NO_ALIBI_TEMPLATES);
  return fillTemplate(template, {
    speaker: npc.name,
    voice,
  });
}

/**
 * Generate a question response (returns one of the NPC's clues)
 */
export function generateQuestionResponse(npc: NPC): string {
  if (npc.clues.length === 0) {
    return `${npc.name} shrugs and says nothing useful.`;
  }

  // Return a random clue (in a real game, might track which clues were given)
  return pickOne(npc.clues);
}

/**
 * Fill a template string with values
 */
function fillTemplate(
  template: string,
  values: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate examine response for an item
 */
export function generateExamineResponse(itemName: string, description: string): string {
  return `You examine the ${itemName}. ${description}`;
}

/**
 * Generate take response
 */
export function generateTakeResponse(itemName: string): string {
  return `You pick up the ${itemName} and add it to your inventory.`;
}

/**
 * Generate move response
 */
export function generateMoveResponse(roomName: string): string {
  return `You enter the ${roomName}.`;
}

/**
 * Generate assemble response
 */
export function generateAssembleResponse(): string {
  return 'You call all the suspects to gather in this room. They look at you expectantly, waiting for your accusation.';
}

/**
 * Generate win message
 */
export function generateWinMessage(
  murdererName: string,
  victimName: string,
  weaponName: string,
  roomName: string
): string {
  return `Congratulations, Inspector! You've solved the case!\n\n${murdererName} murdered ${victimName} with the ${weaponName} in the ${roomName}.\n\nJustice has been served.`;
}

/**
 * Generate lose message
 */
export function generateLoseMessage(accusedName: string): string {
  return `You accuse ${accusedName}, but your deduction is incorrect!\n\nThe real murderer escapes justice. Your reputation as a detective is ruined.`;
}
