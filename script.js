// Panne EDI - Game Logic

// Game state
let gameState = {
    currentScenario: 0,
    totalKarma: 0,
    maxKarma: 0, // Will be calculated based on all possible positive karma
    timerInterval: null,
    timerDuration: 30000, // 30 seconds per scenario
    digitalTimerInterval: null,
    gameMode: 'complete', // 'quick' or 'complete'
    scenarioIndices: [] // Will hold the indices of scenarios to show based on game mode
};

// Quick mode scenario indices (questions 1, 3, 4, 8, 9, 10)
const quickModeIndices = [0, 2, 3, 7, 8, 9];

// DOM Elements for karma display
const currentKarmaDisplay = document.getElementById('current-karma');
const maxKarmaDisplay = document.getElementById('max-karma');
const digitalTimer = document.getElementById('digital-timer');

// Function to update karma display
function updateKarmaDisplay() {
    currentKarmaDisplay.textContent = gameState.totalKarma;
    maxKarmaDisplay.textContent = gameState.maxKarma;
}

// Loading messages
const loadingMessages = [
    "Connexion à l'esprit d'équipe...",
    "Nettoyage des jugements hâtifs...",
    "Décompression des tensions...",
    "Chargement des situations sociales explosives...",
    "Connexion au canal Slack...",
    "Chargement du respect mutuel…",
    "Synchronisation des accents et des noms prononcés correctement…",
    "Écrasement de la hiérarchie invisible…",
    "Chargement des scénarios à haute tension sociale…"
];

// Scenarios data
const scenarios = [
    {
        text: "Marc propose une réunion au pub. Leïla ne dit rien. Sarah baisse les yeux. Maxime est déjà en train de commander.",
        choices: [
            {
                text: "\"Parfait ! Un peu d'alcool, beaucoup de productivité.\"",
                karma: -15,
                feedback: "Inclusion ? Jamais entendu."
            },
            {
                text: "\"Tout le monde est à l'aise avec ce lieu ? Sinon on peut changer.\"",
                karma: 15,
                feedback: "Respect + initiative = leader doux et efficace."
            },
            {
                text: "\"On fait ça au parc. C'est inclusif, et y'a des écureuils.\"",
                karma: 10,
                feedback: "Une solution originale et apaisante. Tu gagnes un karma nature."
            }
        ],
        patch: {
            mechanic: "Un lieu perçu comme \"neutre\" par certains peut être excluant pour d'autres : religion, sobriété, anxiété, culture… Ces facteurs pèsent dans le silence des non-dits.",
            edi: "Principe 1 – Lieu d'échange<br>Principe 3 – Espace sûr<br>Vérifier que tout le monde est à l'aise = Respecter les diversités invisibles = Favoriser la pleine participation, même hors cadre formel"
        }
    },
    {
        text: "Sarah s'exprime avec un accent. Marc souffle : \"J'comprends rien, c'est lourd.\" Maxime reformule tout ce qu'elle dit en rigolant.",
        choices: [
            {
                text: "\"Ouais, on va faire plus simple, Sarah tu peux écrire au pire.\"",
                karma: -25,
                feedback: "Tu viens de muter une voix."
            },
            {
                text: "\"Tu veux reformuler Sarah ? On est là pour t'écouter.\"",
                karma: 15,
                feedback: "Tu viens de rebrancher le canal humain."
            },
            {
                text: "\"Elle parle mieux que moi quand j'essaie de lire un README.md.\"",
                karma: 10,
                feedback: "Humour bien placé. Détente + inclusion."
            }
        ],
        patch: {
            mechanic: "Les compliments biaisés (genre, origine, âge…) sont en réalité des microagressions : Ils sous-entendent qu'une réussite est \"surprenante\" et sapent la légitimité de la personne visée.",
            edi: "Principe 2 – Égalité des chances<br>Principe 4 – Moteur de créativité<br>Reconnaître la compétence sans biais = Renforcer la confiance = Lutter contre les stéréotypes = Favoriser une culture de mérite juste"
        }
    },
    {
        text: "Sarah a écrit un super algorithme. Marc commente : \"Wow… pour une fille en génie, c'est impressionnant !\" Silence gêné. Maxime ricane dans son hoodie.",
        choices: [
            {
                text: "\"C'est vrai ! Genre, elle code mieux que moi, c'est bizarre.\"",
                karma: -30,
                feedback: "Bravo, tu viens de lancer une microagression déguisée en fleur."
            },
            {
                text: "\"Tu veux dire qu'elle est impressionnante. Point.\"",
                karma: 15,
                feedback: "Tu viens d'éteindre le feu avec une phrase sobre et classe."
            },
            {
                text: "\"Marc, t'as activé le module Sexisme Involontaire v1.4. Mets à jour.\"",
                karma: 10,
                feedback: "Tu viens de patcher le bug social avec humour tech."
            }
        ],
        patch: {
            mechanic: "Rire aux dépens d'une autre n'est jamais anodin. Ce geste renforce l'exclusion, affaiblit la sécurité psychologique et abîme durablement la confiance au sein de l'équipe.",
            edi: "Principe 3 – Espace sûr<br>•Reconnaissance des différences comportementales et de la neurodiversité<br>Refuser la moquerie, c'est protéger l'intégrité d'un membre et envoyer un message fort : Ici, on respecte tout le monde."
        }
    },
    {
        text: "Réunion. Nora, timide, propose une idée a voix basse: \"On pourrait peut-être…\" Marc l'interrompt: \"On n'entend pas! Faut t'imposer un peu ! Sinon on va jamais avancer.\" Silence. Malaise.",
        choices: [
            {
                text: "\"Il a raison, faut oser parler. Sinon on reste invisible.\"",
                karma: -20,
                feedback: "Tu viens renforcer la pression sociale sans comprendre le fond."
            },
            {
                text: "\"Elle parlait. Fallait juste écouter.\"",
                karma: 20,
                feedback: "Tu viens de rappeler que la communication, c'est pas juste une question de volume"
            },
            {
                text: "\"et si on faisait un tour de parole ?\"",
                karma: 15,
                feedback: "Tu propose une solution simple, mais puissante pour l'inclusion."
            }
        ],
        patch: {
            mechanic: "Tout le monde ne communique pas de la même manière. L'EDI, c'est aussi donner de la place aux voix calmes, sans qu'elles soient invisibilisées par les plus affirmées.",
            edi: "Principe 1 – Lieu d'échange<br>Principe 3 – Espace sûr<br>Proposer un tour de parole = Assurer l'équité d'expression = Réduire les interruptions = Valoriser la diversité des styles d'interaction"
        }
    },
    {
        text: "En présentation, Sarah a des tics nerveux. Marc mime ses gestes derrière elle. Maxime filme.",
        choices: [
            {
                text: "\"Faut bien rire un peu, non ?\"",
                karma: -30,
                feedback: "Tu viens de valider l'humiliation."
            },
            {
                text: "\"Tu fais quoi là ? C'est pas drôle.\"",
                karma: 15,
                feedback: "Tu viens de couper net la moquerie."
            },
            {
                text: "\"Tu veux qu'on parle de ton pitch sur le tableau blanc chelou ?\"",
                karma: 10,
                feedback: "T'as détourné le malaise pour protéger. Respect."
            }
        ],
        patch: {
            mechanic: "Un conflit non résolu, même discret, affaiblit la dynamique de groupe. L'EDI, c'est aussi reconnaître que les tensions impactent tout le monde, pas seulement les personnes en désaccord.",
            edi: "Principe 1 – Lieu d'échange<br>Principe 5 – Mobilisation pour l'action<br>Favoriser une discussion ouverte = Créer un climat où les désaccords peuvent exister sans casser le lien. Écoute et médiation = Pratiques inclusives, tout comme la répartition équitable des tâches"
        }
    },
    {
        text: "Marc et Sarah ont eu un désaccord sur le code. Depuis, silence radio entre eux. Maxime dit : \"C'est chill, ils vont s'arranger seuls.\"",
        choices: [
            {
                text: "\"Ils sont grands. Nous, on avance.\"",
                karma: -15,
                feedback: "Tu viens d'activer la technique de l'autruche."
            },
            {
                text: "\"On en parle ensemble ? Le projet c'est pas juste du code.\"",
                karma: 15,
                feedback: "T'as désamorcé un conflit naissant. T'es un peu le médiateur en hoodie."
            },
            {
                text: "\"On fait un fight club ? Premier round : architecture vs logique floue.\"",
                karma: 5,
                feedback: "L'humour peut soulager… ou mettre de l'huile sur le feu."
            }
        ],
        patch: {
            mechanic: "Les tensions non adressées fragilisent la dynamique. Même quand elles ne sont pas \"techniques\", elles ont un impact réel sur la collaboration, la motivation et la qualité du travail.",
            edi: "Principe 1 : Lieu d'échange<br>Principe 5 : Mobilisation pour l'action<br>Reconnaissance de l'impact du conflit sur l'équipe, Création d'un cadre inclusif de resolution, Proposition d'un échange collectif, Passage du chacun-pour-soi à la responsabilité partagée."
        }
    },
    {
        text: "Pendant un brainstorm, Sarah propose une idée. Silence. Deux minutes plus tard, Marc dit la même chose. Maxime : \"Excellente idée !\"",
        choices: [
            {
                text: "\"Ouais, c'est mieux dit comme ça.\"",
                karma: -20,
                feedback: "Tu viens de ghoster une idée en live."
            },
            {
                text: "\"Sarah l'a dit avant. C'était déjà une bonne idée.\"",
                karma: 15,
                feedback: "Tu viens de restaurer une voix effacée."
            },
            {
                text: "\"La même idée, mais version white male. Stylé.\"",
                karma: 10,
                feedback: "T'as mis le doigt sur le bug social avec punch."
            }
        ],
        patch: {
            mechanic: "Entendre ≠ Écouter. Valider une idée uniquement quand elle est dite par une personne perçue comme \"légitime\" révèle un biais inconscient de genre ou de statut.",
            edi: "Principe 2 – Égalité des chances<br>Principe 4 – Moteur de créativité<br>Corriger ce biais, c'est rendre visibles les contributions invisibilisées et valoriser les idées à égalité, peu importe qui les émet."
        }
    },
    {
        text: "Leïla dit : \"Je suis ultra stressée par l'oral.\" Maxime : \"C'est pas un TEDx, respire.\" Marc : \"Tu lis ta slide et ça passe.\"",
        choices: [
            {
                text: "\"Ouais ben, c'est qu'un oral.\"",
                karma: -15,
                feedback: "Tu viens de réduire une tempête à un nuage."
            },
            {
                text: "\"T'inquiète. On peut répéter ensemble si tu veux ?\"",
                karma: 15,
                feedback: "Tu viens d'installer l'antidote à l'angoisse."
            },
            {
                text: "\"Maxime, t'étais en panique pour un pop quiz. Chill.\"",
                karma: 10,
                feedback: "Tu viens de recadrer un faux zen."
            }
        ],
        patch: {
            mechanic: "Minimiser l'anxiété d'un membre, même sans mauvaise intention, c'est nier une réalité émotionnelle. Le soutien concret et l'écoute active sont des piliers de la bienveillance, surtout dans les moments d'exposition.",
            edi: "Principe 3 – Espace sûr<br>Principe 1 – Lieu d'échange<br>Proposer une répétition ou un accompagnement, c'est intégrer les différences émotionnelles dans la collaboration. Cela permet de renforcer la pleine participation, même sous pression."
        }
    },
    {
        text: "L'équipe propose d'aller faire du laser tag. Sarah hésite, elle se déplace en fauteuil. Maxime : \"Tu peux regarder et encourager !\"",
        choices: [
            {
                text: "\"On peut trouver une activité où tout le monde participe.\"",
                karma: 15,
                feedback: "Tu viens de proposer une solution inclusive qui valorise la participation de tous."
            },
            {
                text: "\"Tu peux filmer ? C'est fun aussi.\"",
                karma: -20,
                feedback: "Tu viens de reléguer Sarah à un rôle passif, renforçant son exclusion."
            },
            {
                text: "\"On te met dans un char d'assaut, façon Mario Kart ?\"",
                karma: 10,
                feedback: "Tu proposes une adaptation créative qui permet l'inclusion avec humour."
            }
        ],
        patch: {
            mechanic: "Proposer une activité où tout le monde peut participer activement, c'est un réflexe d'équité. Inclure, ce n'est pas juste inviter : c'est adapter, repenser, co-construire.",
            edi: "Accessibilité universelle<br>Principe 2 – Égalité des chances<br>Principe 5 – Mobilisation pour l'action<br>Changer d'activité par souci d'inclusion, c'est traduire l'intention EDI en action concrète, en particulier dans les espaces informels."
        }
    },
    {
        text: "L'équipe jase en début de rencontre. Sarah dit tranquillement : \"J'ai repris mes études après 12 ans dans le domaine.\" Marc sourit : \"Respect. Mais t'es pas trop rouillée pour tout ça ?\" Maxime ajoute : \"Au moins t'es là pour l'équilibre générationnel !\" Leïla regarde Sarah, un peu mal à l'aise.",
        choices: [
            {
                text: "\"C'est cool d'avoir une vision… plus mature. Genre mentor.\"",
                karma: -20,
                feedback: "Tu viens de coller une étiquette passive-agressive. L'expérience ne rime pas avec stéréotype de sage silencieuse."
            },
            {
                text: "\"Tu dois avoir un recul de fou sur ce qu'on fait. Tu veux partager ?\"",
                karma: 15,
                feedback: "Tu viens de transformer un préjugé en levier d'apprentissage partagé. Respect sur deux générations."
            },
            {
                text: "\"Si on fait une rétro, tu nous files un 'storytime' à l'ancienne ?\"",
                karma: 10,
                feedback: "Humour bien placé + valorisation implicite = ambiance inter-âge validée."
            }
        ],
        patch: {
            mechanic: "Avoir un parcours atypique, une reconversion ou un âge différent ne devrait jamais faire de quelqu'un un « phénomène » ou une mascotte. L'inclusion, c'est savoir reconnaître la valeur réelle de chacun·e, sans tomber dans l'infantilisation ni l'exagération.",
            edi: "Principe 4 – Inclusion comme moteur de créativité<br>Principe 2 – Égalité des chances<br>Valorisation des compétences et de la vision de Sarah<br>Expérience perçue comme richesse collective<br>Refus de la normalisation des écarts."
        }
    }
];

// Calculate maximum possible karma
function calculateMaxKarma() {
    let maxKarma = 0;
    scenarios.forEach(scenario => {
        let bestChoice = -Infinity;
        scenario.choices.forEach(choice => {
            if (choice.karma > bestChoice) {
                bestChoice = choice.karma;
            }
        });
        if (bestChoice > 0) {
            maxKarma += bestChoice;
        }
    });
    return maxKarma;
}

// Profiles based on final score
const profiles = [
    {
        min: 0,
        max: 30,
        title: "Le Microagressionniste 1.0",
        description: "\"Tu crois être gentil, mais t'as oublié d'écouter.\""
    },
    {
        min: 31,
        max: 60,
        title: "Le Suiveur passif",
        description: "\"Tu n'as pas dérangé… mais pas aidé non plus.\""
    },
    {
        min: 61,
        max: 85,
        title: "Le Médiateur masqué",
        description: "\"Tu veux bien faire. Et parfois, tu y arrives vraiment.\""
    },
    {
        min: 86,
        max: 100,
        title: "L'Architecte de l'équilibre",
        description: "\"Tu construis du lien. Ton karma est pur. Respect.\""
    }
];

// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const modeSelectionScreen = document.getElementById('mode-selection-screen');
const loadingScreen = document.getElementById('loading-screen');
const scenarioScreen = document.getElementById('scenario-screen');
const feedbackScreen = document.getElementById('feedback-screen');
const patchScreen = document.getElementById('patch-screen');
const finalScreen = document.getElementById('final-screen');

const startButton = document.getElementById('start-button');
const quickModeButton = document.getElementById('quick-mode-button');
const completeModeButton = document.getElementById('complete-mode-button');
const nextButton = document.getElementById('next-button');
const continueButton = document.getElementById('continue-button');
const restartButton = document.getElementById('restart-button');

const loadingText = document.getElementById('loading-text');
const loadingBar = document.querySelector('.loading-bar');
const scenarioText = document.getElementById('scenario-text');
const choicesContainer = document.getElementById('choices');
const timerBar = document.querySelector('.timer-bar');

const choiceResult = document.getElementById('choice-result');
const karmaChange = document.getElementById('karma-change');
const feedbackText = document.getElementById('feedback-text');

const patchMechanic = document.getElementById('patch-mechanic');
const patchEdi = document.getElementById('patch-edi');

const finalScore = document.getElementById('final-score');
const profileTitle = document.getElementById('profile-title');
const profileDescription = document.getElementById('profile-description');

// Event Listeners
document.addEventListener('DOMContentLoaded', initGame);
startButton.addEventListener('click', showModeSelection);
quickModeButton.addEventListener('click', () => selectGameMode('quick'));
completeModeButton.addEventListener('click', () => selectGameMode('complete'));
nextButton.addEventListener('click', showPatchScreen);
continueButton.addEventListener('click', nextScenario);
restartButton.addEventListener('click', restartGame);

// Initialize the game
function initGame() {
    gameState.maxKarma = calculateMaxKarma();
    updateKarmaDisplay();
}

// Show mode selection screen
function showModeSelection() {
    switchScreen(welcomeScreen, modeSelectionScreen);
}

// Select game mode and start the game
function selectGameMode(mode) {
    gameState.gameMode = mode;
    
    // Set up scenario indices based on selected mode
    if (mode === 'quick') {
        gameState.scenarioIndices = [...quickModeIndices];
    } else {
        // For complete mode, include all scenarios
        gameState.scenarioIndices = Array.from({ length: scenarios.length }, (_, i) => i);
    }
    
    // Reset game state
    gameState.currentScenario = 0;
    gameState.totalKarma = 0;
    
    // Calculate max karma for the selected mode
    let modeMaxKarma = 0;
    gameState.scenarioIndices.forEach(index => {
        let bestChoice = -Infinity;
        scenarios[index].choices.forEach(choice => {
            if (choice.karma > bestChoice) {
                bestChoice = choice.karma;
            }
        });
        if (bestChoice > 0) {
            modeMaxKarma += bestChoice;
        }
    });
    gameState.maxKarma = modeMaxKarma;
    updateKarmaDisplay();
    
    // Start the game
    switchScreen(modeSelectionScreen, loadingScreen);
    startLoadingSequence();
}

// Loading sequence
function startLoadingSequence() {
    let currentMessage = 0;
    let progress = 0;
    
    loadingText.textContent = loadingMessages[0];
    
    const loadingInterval = setInterval(() => {
        progress += 2;
        loadingBar.style.width = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(loadingInterval);
            showScenario();
            return;
        }
        
        if (progress % 20 === 0 && currentMessage < loadingMessages.length - 1) {
            currentMessage++;
            let displayedMessages = loadingMessages.slice(0, currentMessage + 1).join('<br>');
            loadingText.innerHTML = displayedMessages;
        }
    }, 100);
}

// Show current scenario
function showScenario() {
    // Check if we've gone through all scenarios for the selected mode
    if (gameState.currentScenario >= gameState.scenarioIndices.length) {
        showFinalScore();
        return;
    }
    
    // Get the actual scenario index from our scenario indices array
    const scenarioIndex = gameState.scenarioIndices[gameState.currentScenario];
    const scenario = scenarios[scenarioIndex];
    
    switchScreen(loadingScreen, scenarioScreen);
    scenarioText.textContent = scenario.text;
    
    // Clear previous choices
    choicesContainer.innerHTML = '';
    
    // Add choices
    scenario.choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.classList.add('choice-button');
        button.textContent = choice.text;
        button.dataset.index = index;
        button.addEventListener('click', () => makeChoice(index));
        choicesContainer.appendChild(button);
    });
    
    // Start timer
    startTimer();
}

// Start timer for scenario
function startTimer() {
    clearInterval(gameState.timerInterval);
    clearInterval(gameState.digitalTimerInterval);
    
    timerBar.style.width = '100%';
    
    let timeLeft = gameState.timerDuration;
    const startTime = Date.now();
    
    // Update digital timer display
    function updateDigitalTimer(remaining) {
        const seconds = Math.ceil(remaining / 1000);
        digitalTimer.textContent = seconds;
    }
    
    updateDigitalTimer(timeLeft);
    
    gameState.timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, timeLeft - elapsed);
        const percentage = (remaining / gameState.timerDuration) * 100;
        
        timerBar.style.width = `${percentage}%`;
        updateDigitalTimer(remaining);
        
        if (percentage <= 0) {
            clearInterval(gameState.timerInterval);
            clearInterval(gameState.digitalTimerInterval);
            // Add 0 karma when no choice is made
            makeChoice(-1);
        }
    }, 100);
}

// Make a choice
function makeChoice(choiceIndex) {
    clearInterval(gameState.timerInterval);
    clearInterval(gameState.digitalTimerInterval);
    
    const scenarioIndex = gameState.scenarioIndices[gameState.currentScenario];
    const scenario = scenarios[scenarioIndex];
    let choice;
    
    if (choiceIndex === -1) {
        // No choice made in time
        choice = {
            text: "Temps écoulé - Aucune réponse",
            karma: 0,
            feedback: "L'indécision a un coût. Parfois, ne pas choisir est un choix en soi."
        };
    } else {
        choice = scenario.choices[choiceIndex];
    }
    
    // Update karma
    gameState.totalKarma += choice.karma;
    updateKarmaDisplay();
    
    // Show feedback
    switchScreen(scenarioScreen, feedbackScreen);
    choiceResult.textContent = choice.text;
    
    if (choice.karma > 0) {
        karmaChange.textContent = `→ +${choice.karma} karma`;
        karmaChange.className = 'karma-change positive';
    } else {
        karmaChange.textContent = `→ ${choice.karma} karma`;
        karmaChange.className = 'karma-change negative';
    }
    
    feedbackText.textContent = choice.feedback;
}

// Show patch screen
function showPatchScreen() {
    const scenarioIndex = gameState.scenarioIndices[gameState.currentScenario];
    const scenario = scenarios[scenarioIndex];
    
    switchScreen(feedbackScreen, patchScreen);
    patchMechanic.innerHTML = scenario.patch.mechanic;
    patchEdi.innerHTML = scenario.patch.edi;
}

// Go to next scenario
function nextScenario() {
    gameState.currentScenario++;
    
    if (gameState.currentScenario >= gameState.scenarioIndices.length) {
        showFinalScore();
    } else {
        switchScreen(patchScreen, scenarioScreen);
        showScenario();
    }
}

// Show final score
function showFinalScore() {
    switchScreen(patchScreen, finalScreen);
    
    // Calculate percentage score
    const scorePercentage = Math.max(0, Math.min(100, Math.round((gameState.totalKarma / gameState.maxKarma) * 100)));
    
    finalScore.textContent = `Score de karma ÉDI: ${scorePercentage}/100`;
    
    // Determine profile
    let profile = profiles[0];
    for (const p of profiles) {
        if (scorePercentage >= p.min && scorePercentage <= p.max) {
            profile = p;
            break;
        }
    }
    
    profileTitle.textContent = profile.title;
    profileDescription.textContent = profile.description;
}

// Restart the game
function restartGame() {
    // Reset game state
    gameState.currentScenario = 0;
    gameState.totalKarma = 0;
    gameState.scenarioIndices = [];
    
    // Return to welcome screen to allow mode selection again
    switchScreen(finalScreen, welcomeScreen);
}

// Helper function to switch screens
function switchScreen(fromScreen, toScreen) {
    fromScreen.classList.remove('active');
    toScreen.classList.add('active');
}
