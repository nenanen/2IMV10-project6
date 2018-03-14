export default class Menu {

    static toggle() {
        document.querySelector('#menu').classList.toggle('active');
        document.querySelector('#toggle').classList.toggle('active');
    }
}