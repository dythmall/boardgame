import {v4} from 'uuid';

export default class User {
    name: string;
    id: string;
    socket: any;
    cards: any[];
    score: number;

    constructor(name: string) {
        this.name = name;
        this.id = this.createId();
        this.socket = null;
        this.cards = [];
        this.score = 0;
    }

    createId() {
        return v4();
    }
}