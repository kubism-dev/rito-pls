import { main } from './ritopls.js';
import '../scss/main.scss';


document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.js-form').addEventListener('submit', (event) => {
    event.preventDefault();

    const { value: summonerName } = event.target.elements.summonerName;

    main(summonerName);
});
});