/** Builds the dropdown choices for "which player" fields, shared by actions & feedbacks */
function getPlayerChoices(mpris) {
	const choices = [{ id: 'auto', label: 'Auto (currently playing / first found)' }]
	for (const p of mpris.listPlayers()) {
		choices.push({ id: p.busName, label: p.identity })
	}
	return choices
}

export { getPlayerChoices }
