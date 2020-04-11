import GameVariables from './GameVariables';
import User from './User';

export default class Dixit {
    variables: GameVariables;

    constructor() {
        this.variables = new GameVariables();
    }

    createUser(name: string): User {
        throw new Error("Method not implemented.");
    }
}