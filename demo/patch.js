// Swaps the MPRIS manager's behaviour for the demo players (see demo/main.js).
import { MprisManager } from '../src/mpris.js'
import { FakeMprisManager } from './fakeMpris.js'

for (const name of Object.getOwnPropertyNames(FakeMprisManager.prototype)) {
	if (name !== 'constructor') {
		MprisManager.prototype[name] = FakeMprisManager.prototype[name]
	}
}
const init = MprisManager.prototype.connect
MprisManager.prototype.connect = async function () {
	// Borrow the demo players from a FakeMprisManager (its constructor fills them).
	const fake = new FakeMprisManager(this.log)
	this.players = fake.players
	this.tracks = fake.tracks
	this.album = fake.album
	return init.call(this)
}
