let SPEECH_OBJECT = null;
let STORAGE_NAME_NUMBERS = 'numbers';
let STORAGE_NAME_BINGO_NUMBERS = 'bingo_numbers';
let TIME_INTERVAL = 8000;
let BINGO_INTERVAL;

setSpeechObject = function (speechObject) {
    SPEECH_OBJECT = speechObject;
}

getSpeechObject = function () {
    return SPEECH_OBJECT;
}

setStorage = function (name, data) {
    window.localStorage.setItem(name, JSON.stringify(data));
}

getStorage = function (name) {
    let data = window.localStorage.getItem(name);
    return JSON.parse(data);
}

deleteStorage = function (name) {
    window.localStorage.removeItem(name);
}

getNumbers = function () {
    return getStorage(STORAGE_NAME_NUMBERS) || [];
}

setNumbers = function (numbers) {
    setStorage(STORAGE_NAME_NUMBERS, numbers);
}

configureSpeech = function () {
    let speechObject = new SpeechSynthesisUtterance();
    let voices = window.speechSynthesis.getVoices();

    for (var i = 0; i < voices.length; i++) {
        if (voices[i].lang == 'pt-BR') {
            speechObject.voiceURI = 'Google português do Brasil';
            speechObject.lang = "pt-BR";
            speechObject.localService = true;
            speechObject.voice = voices[i];
            speechObject.pitch = 1;
            speechObject.rate = 1;
        }
    }


    if (speechObject == undefined) {
        console.log('Recursos de fala apenas funcionam no Google Chrome.');
    }

    return speechObject;
}

startSpeaking = function (line, rate) {
    let so = getSpeechObject();
    so.text = line;

    if (rate) {
        so.rate = rate;
    }

    window.speechSynthesis.speak(so);
}

generateRandom = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

showTotalNumbers = function () {
    let $totalSorteado = document.getElementById('total-sorteado');
    $totalSorteado.innerHTML = getNumbers().length;
}

highlightTablebyNumber = function (number) {
    document.querySelectorAll('#tabela-bingo td').forEach(function (td) {
        if (td.innerHTML == number) {
            td.classList.add('bg-dark');
        }
    });
}

getLetterByNumber = function (number) {
    let letter = '';

    if (number >= 1 && number <= 15) {
        letter = 'bê';
    }
    else if (number >= 16 && number <= 30) {
        letter = 'íí';
    }
    else if (number >= 31 && number <= 45) {
        letter = 'êne';
    }
    else if (number >= 46 && number <= 60) {
        letter = 'G';
    }
    else {
        letter = 'Ó';
    }

    return letter;
}


createDrawnSentence = function (letter, number) {
    return `Letra: '${letter}'. Número ${number}.`;
}

createStartSentence = function () {
    return `Bem vindos ao bingo da vovó cirila! 
            Vamos começar sorteando os números. 
            Boa sorte a todos vocês.`;
}

createFunnySentence = function (number) {
    let sentence = '';
    switch (number) {
        case 1:
            sentence = 'Começou o jogo.'
            break;

        case 13:
            sentence = 'Lula livre.'
            break;

        case 17:
            sentence = 'Fora bolsonaro.'
            break;

        case 22:
            sentence = 'Dois patinhos na lagoa.'
            break;

        case 33:
            sentence = 'Idade de cristo.'
            break;

        case 51:
            sentence = 'Boa idéia.'
            break;

        case 69:
            sentence = 'Coisa boa.'
            break;

        case 10:
        case 20:
        case 30:
        case 40:
        case 50:
        case 60:
            sentence = `Raso ${number}.`;
            break;

        case 70:
            sentence = 'Setenta, se não der você tenta de novo.'
            break;
    }

    return sentence;
}

highLigthTable = function () {
    getNumbers().map(function (number) {
        highlightTablebyNumber(number);
    });
}

createArrayRange = function (start, end) {
    return new Array(end - start).fill().map((d, i) => i + start);
}

setBingoNumbers = function (numbers) {
    setStorage(STORAGE_NAME_BINGO_NUMBERS, numbers);
}

getBingoNumbers = function () {
    return getStorage(STORAGE_NAME_BINGO_NUMBERS);
}

removeBingoNumber = function () {
    let bingoNumbers = getBingoNumbers();
    let index = generateRandom(0, bingoNumbers.length - 1);
    let numberLucky = bingoNumbers.splice(index, 1)[0];
    setBingoNumbers(bingoNumbers);

    return numberLucky;
}


startBingo = function () {
    let numbersDrawn = getNumbers();
    let number = removeBingoNumber();

    console.log('número sorteado: ', number);

    numbersDrawn.push(number);
    setNumbers(numbersDrawn);
    highlightTablebyNumber(number);
    showTotalNumbers();

    let letter = getLetterByNumber(number);
    let sentence = createDrawnSentence(letter, number);
    let funnySentence = createFunnySentence(number);

    if (funnySentence) {
        startSpeaking(funnySentence, 0.8);
    }
    startSpeaking(sentence, 0.8);
    startSpeaking(letter + '. ' + number + '.', 0.7);
}


pauseBingo = function () {
    clearInterval(BINGO_INTERVAL);
}

sortNumber = function (a, b) {
    return a - b;
}

repeatBingo = function () {
    pauseBingo();
    let offset = 0;
    let orderedNumbers = getNumbers();
    orderedNumbers.sort(sortNumber);
    startSpeaking('Olá pessoal, vamos repetir os números para quem está meio perdido aí.');

    setTimeout(function () {
        orderedNumbers.map(function (number) {
            setTimeout(function () {
                console.log('repete número: ', number);
                let letter = getLetterByNumber(number);
                let sentence = createDrawnSentence(letter, number);
                startSpeaking(sentence);
            }, TIME_INTERVAL + offset);

            offset += TIME_INTERVAL;
        });
    }, TIME_INTERVAL);
}

finalizeBingo = function () {
    deleteStorage(STORAGE_NAME_NUMBERS);
    deleteStorage(STORAGE_NAME_BINGO_NUMBERS);
    window.location.reload();
}

initBingo = function () {
    let sentence = createStartSentence();
    startSpeaking(sentence);
    setTimeout(function () {
        BINGO_INTERVAL = setInterval(startBingo, TIME_INTERVAL);
    }, TIME_INTERVAL);
}

window.speechSynthesis.onvoiceschanged = function () {
    setSpeechObject(configureSpeech());
}

init = function () {
    let bingoNumbers = getBingoNumbers();

    if (!bingoNumbers || bingoNumbers.length == 0) {
        setBingoNumbers(createArrayRange(1, 76));
    }
    setSpeechObject(configureSpeech());
    showTotalNumbers();
    highLigthTable();
}

init();

