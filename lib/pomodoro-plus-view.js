'use babel';

export default class PomodoroPlusView {
    constructor(serializedState) {
        // Create root element
        this.element = document.createElement('div');
        this.element.classList.add('pomodoro-plus');

        // Create message element
        const message = document.createElement('h2');
        message.textContent = 'Pomodoro Plus says:';
        message.classList.add('message');
        this.element.appendChild(message);
    }

    // Returns an object that can be retrieved when package is activated
    serialize() {}

    // Tear down any state and detach
    destroy() {
        this.element.remove();
    }

    getElement() {
        return this.element;
    }

    shortBreakText(shortBreakTime) {
        const shortBreak_text = `You have set your break time at ${shortBreakTime} minutes. Try relaxing, going for walk, or maybe even meditating!`;
        this.element.children[0].textContent = shortBreak_text;
    }

    longBreakText(longBreakTime) {
        const longBreak_text = `You've completed a set of Pomodoro's! Congratulations. You have set your long break time at ${longBreakTime} minutes.`;
        this.element.children[0].textContent = longBreak_text;
    }
}
