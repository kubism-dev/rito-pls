import axios from 'axios';
import { throttlePromise } from './helpers.js';

/**
 * Daten befinden sich in der .env-Datei.
 * @see .env
 * @type {string} Der API-Key für die Riot API.
 * @type {string} Die Basis-URL für die Riot API.
 * @type {string} Die Basis-URL für die Riot API (Europa).
 */
const apiKey = process.env.RIOT_KEY;
const riotApiBaseURL = process.env.RIOT_API_BASE_URL || 'https://euw1.api.riotgames.com';
const riotApiEuropeBaseURL = process.env.RIOT_API_EUROPE_BASE_URL || 'https://europe.api.riotgames.com';
const statusElement = document.querySelector('.js-status');

/**
 * Erzeugt zwei Instanzen von axios, die die Riot API aufrufen.
 * @param {string} baseURL - Die Basis-URL für die Riot API.
 * @returns {AxiosInstance} Eine Instanz von axios.
 */
const riotApi = axios.create({ baseURL: riotApiBaseURL });
const riotApiEurope = axios.create({ baseURL: riotApiEuropeBaseURL });

/**
 * Ruft die Konto-ID anhand des Benutzernamens ab.
 * Wird benötigt, um die PUUID zu ermitteln.
 * @see https://developer.riotgames.com/apis#summoner-v4/GET_getBySummonerName
 * @param {string} name - Der Name des Benutzers.
 * @returns {Promise<string>} Die Konto-ID (puuid) des Benutzers.
 */
async function getAccountIdByName(name) {
    try {
        const response = await riotApi.get(`/lol/summoner/v4/summoners/by-name/${encodeURIComponent(name)}?api_key=${apiKey}`);
        return response.data.puuid;
    } catch (error) {
        console.error('Fehler beim Abrufen der Konto-ID:', error);
        throw error;
    }
}

/**
 * Ruft die Match-IDs basierend auf der Konto-ID ab.
 * Zieht aber nur die letzten 20 Matches heran.
 * Jede MatchID ist ein API call. Deswegen müsste man die Results cachen und dann nur die neuen Matches abrufen.
 * @see https://developer.riotgames.com/apis#match-v5/GET_getMatchIdsByPUUID
 * @param {string} puuid - Die Konto-ID des Benutzers.
 * @param {number} startNumber - Die Startnummer des Matches, beginnend bei 0. Damit kann man noch spätere Matches abrufen.
 * @param {number} countNumber - Die Anzahl der Matches die beim Abruf zurückgegeben werden sollen.
 * @returns {Promise<string[]>} Eine Liste von Match-IDs.
 */
const startNumber = 0;
const countNumber = 50;

async function getMatchIds(puuid) {
    try {
        const response = await riotApiEurope.get(`/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${startNumber}&count=${countNumber}&api_key=${apiKey}`);
        return response.data;
    } catch (error) {
        console.error('Fehler beim Abrufen der Match-IDs:', error);
        throw error;
    }
}

/**
 * Ruft die Match-Daten basierend auf der Match-ID ab.
 * Dort sind die Daten der einzelnen Spieler enthalten. Inklusive Kills, Deaths, Assists, etc.
 * @see https://developer.riotgames.com/apis#match-v5/GET_getMatch
 * @param {string} matchId - Die ID des Matches.
 * @returns {Promise<Object>} Die Daten des Matches.
 */

async function getMatchData(matchId) {
    try {
        const response = await riotApiEurope.get(`/lol/match/v5/matches/${matchId}?api_key=${apiKey}`);
        return response.data;
    } catch (error) {
        console.error('Fehler beim Abrufen der Match-Daten:', error);
        throw error;
    }
}

/**
 * Ermittelt die am häufigsten gespielten Champions basierend auf der Konto-ID.
 * @see https://developer.riotgames.com/apis#match-v5/GET_getMatch
 * @param {string} puuid - Die Konto-ID des Benutzers.
 * @returns {Promise<Object>} Eine Statistik der am häufigsten gespielten Champions.
 */
async function getMostPlayedChampions(puuid) {
    // Throttling der API calls, um die Rate Limits nicht zu überschreiten
    const throttledGetMatchData = throttlePromise(getMatchData, 500);

    try {
        const matchIds = await getMatchIds(puuid);
        const championStats = {};

        for (const matchId of matchIds) {
            const matchData = await throttledGetMatchData(matchId);
            const participant = matchData.info.participants.find(p => p.puuid === puuid);

            if (participant) {
                const { championName, kills, deaths, assists, win } = participant;
                if (!championStats[championName]) {
                    championStats[championName] = { games: 0, wins: 0, kills: 0, deaths: 0, assists: 0 };
                }
                championStats[championName].games++;
                if (win) championStats[championName].wins++;
                championStats[championName].kills += kills;
                championStats[championName].deaths += deaths;
                championStats[championName].assists += assists;
            }
        }

        // KDA und Gewinnrate berechnen
        Object.keys(championStats).forEach(champion => {
            const stats = championStats[champion];
            stats.winRate = (stats.wins / stats.games * 100).toFixed(2) + '%';
            stats.kda = stats.deaths === 0 ? 'Perfekt' : ((stats.kills + stats.assists) / stats.deaths).toFixed(2);
        });

        return championStats;
    } catch (error) {
        console.error('Fehler beim Ermitteln der am häufigsten gespielten Champions:', error);
        throw error;
    }
}

/**
 * Die Hauptfunktion, die die Nutzerschnittstelle mit Riot API-Daten aktualisiert.
 * @param {string} summonerName - Der Name des Beschwörers.
 * @returns {Promise<void>}
 */
async function main(summonerName) {
    try {
        statusElement.classList.toggle('d-none');

        const puuid = await getAccountIdByName(summonerName);
        const mostPlayedChampions = await getMostPlayedChampions(puuid);

        // Sortierung der Champs nach der Anzahl der Spiele in absteigender Reihenfolge
        const sortedChampions = Object.entries(mostPlayedChampions).sort((a, b) => b[1].games - a[1].games);

        // Erzeugen der Tabelle mit Champion-Statistiken
        const tableBody = document.querySelector('.js-result tbody');
        tableBody.innerHTML = ''; // Löscht bestehende Inhalte

        sortedChampions.forEach(([championName, stats]) => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <tr>
                <td>${championName}</td>
                <td>${stats.games}</td>
                <td>${stats.wins}</td>
                <td>${stats.kills}</td>
                <td>${stats.deaths}</td>
                <td>${stats.assists}</td>
                <td>${stats.winRate}</td>
                <td>${stats.kda}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Fehler bei der Hauptausführung:', error);
        return `Fehler bei der Hauptausführung: ${error}, blyat`;
    } finally {
        statusElement.classList.toggle('d-none');
    }
}

export { main };