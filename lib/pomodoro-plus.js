'use babel';

import PomodoroPlusView from './pomodoro-plus-view';
import {
    CompositeDisposable
} from 'atom';

isActive = false;

export default {
    config: {
        pomodoroPeriod_cfg: {
            title: 'Timer Length',
            description: 'in minutes',
            type: 'integer',
            default: 25,
            minimum: 5
        },
        breakLength_cfg: {
            title: 'Break Length',
            description: 'in minutes',
            type: 'integer',
            default: 5,
            minimum: 1
        },
        numInSet_cfg: {
            title: 'Pomodoros Per Set',
            type: 'integer',
            default: 4,
            minimum: 1
        },
        setBreakLength_cfg: {
            title: 'Break Length After Set',
            description: 'in minutes',
            type: 'integer',
            default: 20,
            minimum: 4
        }
    },

    pomodoroPlusView: null,
    modalPanel: null,
    subscriptions: null,

    activate(state) {
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'pomodoro-plus:check': () => this.check(),
        }));
    },

    deactivate() {
        this.modalPanel.destroy();
        this.subscriptions.dispose();
        this.pomodoroPlusView.destroy();
    },

    begin() {
        pomodoroPeriod = atom.config.get("pomodoro-plus.pomodoroPeriod_cfg") * 60000;
        breakLength = atom.config.get("pomodoro-plus.breakLength_cfg") * 60000;
        setBreakLength = atom.config.get("pomodoro-plus.setBreakLength_cfg") * 60000;
        numInSet = atom.config.get("pomodoro-plus.numInSet_cfg");
        var checkmark = 0;

        function pomodoro() {
            this.pomodoroPlusView = new PomodoroPlusView();
            this.modalPanel = atom.workspace.addModalPanel({
                item: this.pomodoroPlusView.getElement(),
                visible: false
            });

            function saveFiles() {
                atom.workspace.observeTextEditors(editor => {
                    Promise.resolve(editor.save()).catch((error) => atom.notifications.addError(error));
                });
                return;
            }

            function shortBreak() {
                saveFiles();
                this.pomodoroPlusView.shortBreakText(breakLength / 60000);
                this.modalPanel.show();
                checkmark++;
                setTimeout(pomodoro, breakLength);
            }

            function longBreak() {
                saveFiles();
                this.pomodoroPlusView.longBreakText(breakLength / 60000);
                this.modalPanel.show();
                checkmark = 0;
                setTimeout(pomodoro, setBreakLength);
            }

            this.modalPanel.hide();

            if (checkmark < numInSet) {
                setTimeout(shortBreak, pomodoroPeriod);
            } else {
                longBreak();
            }
        }
        pomodoro();
    },

    end() {
        this.deactivate();
    },

    check() {
        if (isActive) {
            isActive = !isActive
            this.end();
        } else {
            isActive = !isActive
            this.begin();
        }
    }
};
