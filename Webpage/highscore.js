const API_BASE = "https://wordyquiz.onrender.com";

async function printHighscores() {
	try {
		const res = await fetch(`${API_BASE}/score?mode=normal`);
		if (!res.ok) throw new Error("Failed to fetch scores");
		let highscores = await res.json() || [];
		highscores.sort(function (a, b) {
			return parseInt(b.score) - parseInt(a.score);
		});
		let olEl = document.getElementById("highscores");
		olEl.innerHTML = "";
		highscores.forEach(function (score) {
			let liTag = document.createElement("li");
			liTag.textContent = score.player_name + " - " + score.score;
			olEl.appendChild(liTag);
		});
	} catch (error) {
		console.error("Error printing highscores:", error);
	}
}

// Clear previous scores when users click clear
function clearHighscores() {
	window.localStorage.removeItem(
		"highscores"
	);
	window.location.reload();
}
document.getElementById(
	"clear"
).onclick = clearHighscores;

printHighscores();
