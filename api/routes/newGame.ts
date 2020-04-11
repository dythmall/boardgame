import Dixit from '../game/Dixit';

export default class NewGame {
    game: Dixit;
    constructor() {
        this.game = new Dixit();
    }
}