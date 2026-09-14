import { combineRgb } from '@companion-module/base'

const COLOR_WHITE = combineRgb(255, 255, 255)
const COLOR_BLACK = combineRgb(0, 0, 0)
const COLOR_DARK_GREY = combineRgb(30, 30, 30)
const COLOR_GREEN = combineRgb(0, 170, 0)

function baseStyle(text) {
	return {
		text,
		size: '18',
		color: COLOR_WHITE,
		bgcolor: COLOR_DARK_GREY,
	}
}

function simpleButton(id, name, text, actionId) {
	return {
		[id]: {
			type: 'simple',
			name,
			style: baseStyle(text),
			steps: [
				{
					down: [{ actionId, options: { player: 'auto' } }],
					up: [],
				},
			],
			feedbacks: [],
		},
	}
}

function getPresetDefinitions() {
	return {
		play_pause: {
			type: 'simple',
			name: 'Play/Pause',
			style: baseStyle('PLAY /\nPAUSE'),
			steps: [
				{
					down: [{ actionId: 'play_pause', options: { player: 'auto' } }],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'playback_status',
					options: { player: 'auto', status: 'Playing' },
					style: {
						bgcolor: COLOR_GREEN,
						color: COLOR_BLACK,
					},
				},
			],
		},
		...simpleButton('next', 'Next track', 'NEXT\n▶▶', 'next'),
		...simpleButton('previous', 'Previous track', '◀◀\nPREV', 'previous'),
		...simpleButton('stop', 'Stop', 'STOP', 'stop'),
		...simpleButton('play', 'Play', 'PLAY', 'play'),
		...simpleButton('pause', 'Pause', 'PAUSE', 'pause'),
	}
}

function getPresetStructure() {
	return [
		{
			id: 'transport',
			name: 'MPRIS Transport Controls',
			definitions: ['play_pause', 'previous', 'next', 'stop', 'play', 'pause'],
		},
	]
}

export { getPresetDefinitions, getPresetStructure }
