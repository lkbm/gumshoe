import { HouseLayout, Room, Gender } from "./types";

// Room name pools
export const ROOM_NAMES = [
	"Parlor",
	"Conservatory",
	"Library",
	"Study",
	"Kitchen",
	"Dining Room",
	"Ballroom",
	"Billiard Room",
	"Gallery",
	"Master Bedroom",
	"Guest Room",
	"Servants' Quarters",
];

// Create the default mansion layout (similar to original Sleuth)
// Grid is 12 units wide x 8 units tall
const defaultRooms: Room[] = [
	// Top row - left side
	{
		id: "parlor",
		name: "Parlor",
		x: 0,
		y: 0,
		width: 3,
		height: 2,
		doors: [
			{ toRoomId: "library", direction: "east", position: 0.5 },
			{ toRoomId: "dining", direction: "south", position: 0.5 },
		],
	},
	{
		id: "library",
		name: "Library",
		x: 3,
		y: 0,
		width: 3,
		height: 3,
		doors: [
			{ toRoomId: "parlor", direction: "west", position: 0.3 },
			{ toRoomId: "hall", direction: "south", position: 0.5 },
			{ toRoomId: "study", direction: "east", position: 0.5 },
		],
	},
	// Top row - right side
	{
		id: "study",
		name: "Study",
		x: 6,
		y: 0,
		width: 3,
		height: 2,
		doors: [
			{ toRoomId: "library", direction: "west", position: 0.5 },
			{ toRoomId: "gallery", direction: "east", position: 0.5 },
			{ toRoomId: "conservatory", direction: "south", position: 0.5 },
		],
	},
	{
		id: "gallery",
		name: "Gallery",
		x: 9,
		y: 0,
		width: 3,
		height: 3,
		doors: [
			{ toRoomId: "study", direction: "west", position: 0.3 },
			{ toRoomId: "master", direction: "south", position: 0.5 },
		],
	},
	// Middle row
	{
		id: "dining",
		name: "Dining Room",
		x: 0,
		y: 2,
		width: 3,
		height: 3,
		doors: [
			{ toRoomId: "parlor", direction: "north", position: 0.5 },
			{ toRoomId: "hall", direction: "east", position: 0.6 },
			{ toRoomId: "kitchen", direction: "south", position: 0.5 },
		],
	},
	{
		id: "hall",
		name: "Hall",
		x: 3,
		y: 3,
		width: 3,
		height: 2,
		doors: [
			{ toRoomId: "library", direction: "north", position: 0.5 },
			{ toRoomId: "dining", direction: "west", position: 0.5 },
			{ toRoomId: "conservatory", direction: "east", position: 0.5 },
			{ toRoomId: "billiard", direction: "south", position: 0.5 },
		],
	},
	{
		id: "conservatory",
		name: "Conservatory",
		x: 6,
		y: 2,
		width: 3,
		height: 3,
		doors: [
			{ toRoomId: "study", direction: "north", position: 0.5 },
			{ toRoomId: "hall", direction: "west", position: 0.6 },
			{ toRoomId: "master", direction: "east", position: 0.7 },
			{ toRoomId: "guest", direction: "south", position: 0.5 },
		],
	},
	{
		id: "master",
		name: "Master Bedroom",
		x: 9,
		y: 3,
		width: 3,
		height: 3,
		doors: [
			{ toRoomId: "gallery", direction: "north", position: 0.5 },
			{ toRoomId: "conservatory", direction: "west", position: 0.5 },
			{ toRoomId: "servants", direction: "south", position: 0.5 },
		],
	},
	// Bottom row
	{
		id: "kitchen",
		name: "Kitchen",
		x: 0,
		y: 5,
		width: 3,
		height: 3,
		doors: [
			{ toRoomId: "dining", direction: "north", position: 0.5 },
			{ toRoomId: "billiard", direction: "east", position: 0.3 },
		],
	},
	{
		id: "billiard",
		name: "Billiard Room",
		x: 3,
		y: 5,
		width: 3,
		height: 3,
		doors: [
			{ toRoomId: "hall", direction: "north", position: 0.5 },
			{ toRoomId: "kitchen", direction: "west", position: 0.5 },
			{ toRoomId: "guest", direction: "east", position: 0.5 },
		],
	},
	{
		id: "guest",
		name: "Guest Room",
		x: 6,
		y: 5,
		width: 3,
		height: 3,
		doors: [
			{ toRoomId: "conservatory", direction: "north", position: 0.5 },
			{ toRoomId: "billiard", direction: "west", position: 0.5 },
			{ toRoomId: "servants", direction: "east", position: 0.5 },
		],
	},
	{
		id: "servants",
		name: "Servants' Quarters",
		x: 9,
		y: 6,
		width: 3,
		height: 2,
		doors: [
			{ toRoomId: "master", direction: "north", position: 0.5 },
			{ toRoomId: "guest", direction: "west", position: 0.75 },
		],
	},
];

export const DEFAULT_LAYOUT: HouseLayout = {
	name: "Blackwood Manor",
	rooms: defaultRooms,
	startingRoom: "hall",
};

// NPC data with names and genders
export const NPC_DATA: Array<{ name: string; gender: Gender }> = [
	{ name: "Victoria", gender: "female" },
	{ name: "Esther", gender: "female" },
	{ name: "Earl", gender: "male" },
	{ name: "Gerald", gender: "male" },
	{ name: "Margaret", gender: "female" },
	{ name: "Howard", gender: "male" },
	{ name: "Beatrice", gender: "female" },
	{ name: "Arthur", gender: "male" },
	{ name: "Clarence", gender: "male" },
	{ name: "Dorothy", gender: "female" },
	{ name: "Edmund", gender: "male" },
	{ name: "Florence", gender: "female" },
];

// Weapon/item pool
export const WEAPONS = [
	{ name: "Candlestick", description: "A heavy brass candlestick, tarnished with age.", icon: "🕯️" },
	{ name: "Knife", description: "A sharp carving knife from the kitchen.", icon: "🔪" },
	{ name: "Rope", description: "A length of sturdy hemp rope.", icon: "📿" },
	{ name: "Lead Pipe", description: "A section of lead plumbing pipe.", icon: "🔩" },
	{ name: "Wrench", description: "A heavy iron wrench.", icon: "🔧" },
	{ name: "Revolver", description: "A small caliber revolver, recently fired.", icon: "🔫" },
	{ name: "Poison Vial", description: "A small glass vial, traces of liquid inside.", icon: "🧪" },
	// { name: "Letter Opener", description: "An ornate silver letter opener, wickedly sharp.", icon: "✉️" },
	{ name: "Fire Poker", description: "A cast iron fire poker from the hearth.", icon: "⛏️" },
	{ name: "Dagger", description: "An antique dagger with a jeweled hilt.", icon: "🗡️" },
	{ name: "Baseball Bat", description: "A wooden baseball bat, slightly worn.", icon: "🏏" },
];

// Helper to shuffle an array
export function shuffle<T>(array: T[]): T[] {
	const result = [...array];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

// Helper to pick random items from array
export function pickRandom<T>(array: T[], count: number): T[] {
	return shuffle(array).slice(0, count);
}

// Helper to pick one random item
export function pickOne<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}
