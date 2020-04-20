'use babel';

export default class PomodoroPlusView {
    constructor(serializedState) {
        this.element = document.createElement('div');
        this.element.classList.add('pomodoro-plus');

        const h1 = document.createElement('h1');
        h1.textContent = 'Pomodoro Plus';
        h1.classList.add('title');
        this.element.appendChild(h1);

        const hr = document.createElement('hr');
        hr.classList.add('horizontalRule');
        this.element.appendChild(hr);

        const placeholder = document.createElement('p');
        placeholder.textContent = 'placeholder text';
        this.element.appendChild(placeholder);
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
        const shortBreak_text = document.createElement('p');
        shortBreak_text.textContent = `You have set your break time at ${shortBreakTime} minutes. Try relaxing, going for walk, or maybe even meditating!`;
        this.element.replaceChild(shortBreak_text, this.element.childNodes[2]);
    }

    longBreakText(longBreakTime) {
        const longBreak_text = document.createElement('p');
        longBreak_text.textContent = `You've completed a set of Pomodoros! Congratulations. You have set your long break time at ${longBreakTime} minutes.`;
        this.element.replaceChild(longBreak_text, this.element.childNodes[2]);
    }
}
