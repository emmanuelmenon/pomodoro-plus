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
        //define variables
        pomodoroPeriod = atom.config.get("pomodoro-plus.pomodoroPeriod_cfg") * 60000; //convert to ms
        breakLength = atom.config.get("pomodoro-plus.breakLength_cfg") * 60000; //convert to ms
        setBreakLength = atom.config.get("pomodoro-plus.setBreakLength_cfg") * 60000; //convert to ms
        numInSet = atom.config.get("pomodoro-plus.numInSet_cfg") - 1; //because of the way the code flows, subtract 1 here
        checkmark = 0;

        //define main functionality
        function pomodoro() {
            this.pomodoroPlusView = new PomodoroPlusView();
            this.modalPanel = atom.workspace.addModalPanel({ //creates modal panel, but hides it
                item: this.pomodoroPlusView.getElement(),
                visible: false
            });

            //variable is used to access the style of the css element
            let modalHR = this.pomodoroPlusView.getElement().querySelector('hr.horizontalRule');

            //function is used to save all active text editors
            function saveFiles() {
                atom.workspace.observeTextEditors(editor => {
                    Promise.resolve(editor.save()).catch((error) => atom.notifications.addError(error));
                });
                return; //returns to whatever function called it
            }

            function shortBreak() {
                saveFiles(); //save all open text editors
                this.pomodoroPlusView.shortBreakText(breakLength / 60000); //convert back to minutes for readability, adds text to modal panel
                checkmark++; //increment the number of pomodoros completed
                modalHR.style.animationDuration = breakLength + "ms"; //sets animation duration on the shrinking line
                this.modalPanel.show(); //shows modal panel
                setTimeout(pomodoro, breakLength); //returns to the start of the main function after specified break length
            }

            function longBreak() {
                saveFiles(); //save all open text editors
                this.pomodoroPlusView.longBreakText(setBreakLength / 60000); //convert back to minutes for readability, adds text to modal panel
                checkmark = 0; //resets checkmark
                modalHR.style.animationDuration = setBreakLength + "ms"; //sets animation duration on the shrinking line
                this.modalPanel.show(); //shows modal panel
                setTimeout(pomodoro, setBreakLength); //returns to the start of the main function after specified break length
            }

            this.modalPanel.hide(); //hides modal panel

            if (checkmark < numInSet) { //if number of pomodoros completed is less than the number of pomodoros in a set:
                setTimeout(shortBreak, pomodoroPeriod); //run a short break after specified work length
            } else { //otherwise,
                setTimeout(longBreak, pomodoroPeriod); //run a long break after specified work length
            }
        }
        pomodoro(); //start the function
    },

    //run check to see if the package is active
    check() {
        if (isActive) { //if it is
            isActive = !isActive //set it to not be
            this.deactivate(); //turn off package, run clean up
        } else { //if it's not
            isActive = !isActive //set it to be
            this.begin(); //start the package
        }
    }
};
