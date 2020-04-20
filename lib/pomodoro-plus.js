'use babel';

import PomodoroPlusView from './pomodoro-plus-view';
import {
    CompositeDisposable
} from 'atom';

isActive = false;
let shortBreakTimeout;
let longBreakTimeout;
let pomodoroShortTimeout;
let pomodoroLongTimeout;
let modalPanelPublicVar;
let pomodoroViewPublicVar;

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
        //just-in-case
        document.querySelector('atom-panel-container.top').style.height = "0%";
        clearTimeout(shortBreakTimeout);
        clearTimeout(longBreakTimeout);
        clearTimeout(pomodoroShortTimeout);
        clearTimeout(pomodoroLongTimeout);

        //the usual
        modalPanelPublicVar.destroy();
        pomodoroViewPublicVar.destroy();

        //this.subscriptions.dispose();
    },

    begin() {
        this.pomodoroPlusView = new PomodoroPlusView();
        this.modalPanel = atom.workspace.addTopPanel({ //creates modal panel, but hides it
            item: this.pomodoroPlusView.getElement(),
            visible: false
        });

        //assign the newly initialised objects to public vars
        modalPanelPublicVar = this.modalPanel;
        pomodoroViewPublicVar = this.pomodoroPlusView;

        //define variables
        pomodoroPeriod = atom.config.get("pomodoro-plus.pomodoroPeriod_cfg") * 60000; //convert to ms
        breakLength = atom.config.get("pomodoro-plus.breakLength_cfg") * 60000; //convert to ms
        setBreakLength = atom.config.get("pomodoro-plus.setBreakLength_cfg") * 60000; //convert to ms
        numInSet = atom.config.get("pomodoro-plus.numInSet_cfg") - 1; //because of the way the code flows, subtract 1 here
        checkmark = 0;

        //define main functionality
        function pomodoro() {

            //variable is used to access the style of the css element
            let modalHR = pomodoroViewPublicVar.getElement().querySelector('hr.horizontalRule');

            //function is used to save all active text editors
            function saveFiles() {
                atom.workspace.observeTextEditors(editor => {
                    Promise.resolve(editor.save()).catch((error) => atom.notifications.addError(error));
                });
                return; //returns to whatever function called it
            }

            function shortBreak() {
                saveFiles(); //save all open text editors
                pomodoroViewPublicVar.shortBreakText(breakLength / 60000); //convert back to minutes for readability, adds text to modal panel
                checkmark++; //increment the number of pomodoros completed
                modalHR.style.animationDuration = breakLength + "ms"; //sets animation duration on the shrinking line
                modalPanelPublicVar.show(); //shows modal panel
                document.querySelector('atom-panel-container.top').style.height = "100%"; //removes the main editor
                shortBreakTimeout = setTimeout(pomodoro, breakLength); //returns to the start of the main function after specified break length
            }

            function longBreak() {
                saveFiles(); //save all open text editors
                pomodoroViewPublicVar.longBreakText(setBreakLength / 60000); //convert back to minutes for readability, adds text to modal panel
                checkmark = 0; //resets checkmark
                modalHR.style.animationDuration = setBreakLength + "ms"; //sets animation duration on the shrinking line
                modalPanelPublicVar.show(); //shows modal panel
                document.querySelector('atom-panel-container.top').style.height = "100%"; //removes the main editor
                longBreakTimeout = setTimeout(pomodoro, setBreakLength); //returns to the start of the main function after specified break length
            }

            document.querySelector('atom-panel-container.top').style.height = "0%"; //adds main editor back
            modalPanelPublicVar.hide(); //hides modal panel

            if (checkmark < numInSet) { //if number of pomodoros completed is less than the number of pomodoros in a set:
                pomodoroShortTimeout = setTimeout(shortBreak, pomodoroPeriod); //run a short break after specified work length
            } else { //otherwise,
                pomodoroLongTimeout = setTimeout(longBreak, pomodoroPeriod); //run a long break after specified work length
            }
        }
        pomodoro(); //start the function
    },

    //run check to see if the package is active
    check() {
        if (isActive) { //if it is
            isActive = !isActive //set it to not be
            console.log("package 'pomodoro-plus' has been disabled");
            this.deactivate(); //turn off package, run clean up
        } else { //if it's not
            isActive = !isActive //set it to be
            console.log("package 'pomodoro-plus' has been enabled");
            this.begin(); //start the package
        }
    }
};
