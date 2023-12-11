import { useState, useRef, useEffect } from 'react'
import sound from './assets/sound.png'
import axios from 'axios'
import ding from './assets/ding.mp3'
import beep from './assets/beep.mp3'

function App() {

  const [start, setStart] = useState(false)
  const [src, setSrc] = useState('tempaudio')
  const [currentWord, setCurrentWord] = useState('old')
  const [showInput, setShowInput] = useState(false)
  const [result, setResult] = useState(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [words, setWords] = useState([])
  const [restart, setRestart] = useState(false)
  const [possibleScore, setPossibleScore] = useState(null)

  const inputRef = useRef(null)
  const definitionRef = useRef(null)
  const partOfSpeechRef = useRef(null)
  const resultRef = useRef(null)
  const soundEffectRef = useRef(null)

  const audio = document.getElementById("sound")
  const definition = document.getElementById("definition")
  const partOfSpeech = document.getElementById("part-of-speech")

  useEffect(() => {
    axios.get('http://localhost:4000/api/v1/words')
      .then((res) => {
        setWords(res.data)
        setPossibleScore(res.data.length)
      })
  }, [restart])

  const getRandomIndex = () => {
    const randomIndex = Math.floor(Math.random() * words.length)
    return randomIndex
  }

  const handleStart = async () => {
    setStart(true)
    grabWord()
  }

  const handleRestart = () => {
    setDone(false)
    setScore(0)
    grabWord()
  }


  const grabWord = async () => {
    // axios.get('https://spellingbee-backend.onrender.com/api/v1/word')
    try {
      if (words.length > 0) {
        const randomIndex = getRandomIndex()
        const randomWord = words[randomIndex]
        words.splice(randomIndex, 1)
        const result = await axios.get(`http://localhost:4000/api/v1/word?w=${randomWord}`)
        const newWord = result.data
        setCurrentWord(newWord)
        const newSrc = result.data.audio
        setSrc(newSrc)
        blink()
      } else {
        setDone(true)
        setRestart(prev => !prev)
      }
    } catch (err) {
      console.log(err)
    }
  }

  const check = () => {
    const userInput = inputRef.current.value
    if (userInput.toLowerCase() == currentWord.word) {
      setResult(true)
      resultRef.current.innerText = "Correct!"
      setScore(score + 1)
      soundEffectRef.current.src = beep
      soundEffectRef.current
    } else {
      setResult(false)
      resultRef.current.innerText = "Wrong"
      soundEffectRef.current.src = ding
    }
    setTimeout(() => {
      resultRef.current.innerText = ''
      grabWord()
    }, 2000)
    definitionRef.current.innerText = ''
    partOfSpeechRef.current.innerText = ''
    inputRef.current.value = ''
    setShowInput(false)
  }

  const handleInputCheck = (e) => {
    if (e.key === "Enter") check()
  }

  const blink = () => {
    const soundIcon = document.getElementById("soundIcon")
    soundIcon.classList.toggle("sound")
    setTimeout(() => {
      soundIcon.classList.toggle("sound")
    }, 1000)
  }

  const handleRepeat = () => {
    audio.play()
    blink()
  }

  const handleDefinition = () => {
    definition.innerText = `Definition: ${currentWord.definition}`
  }

  const handlePartOfSpeech = () => {
    partOfSpeech.innerText = `Part of speech: ${currentWord.partOfSpeech}`
  }

  const handleSpell = () => {
    setShowInput(prev => !prev)
  }

  useEffect(() => {
    if (showInput) {
      inputRef.current.focus();
    }
  }, [showInput]);

  const test = () => {
    setRestart(prevState => !prevState)
    console.log(restart)
  }


  return (
    < >
      <h1 className="text-3xl font-bold text-center text-white py-6 bg" onClick={test}>Spelling Bee</h1>

      <div className='max-w-7xl mx-auto relative'>

        {/* Start modal*/}
        {!start &&
          <div className='w-full h-screen absolute z-10 start-modal'>
            <button className='absolute top-28 left-1/2 -translate-x-1/2 bg-green-600 hover:bg-green-500 p-6 text-white text-2xl z-30' onClick={handleStart}>Start</button>
          </div>
        }

        {/* Restart modal */}
        {done &&
          <div className='w-full h-full absolute bg-slate-400 z-10 flex justify-center align-middle'>
            <div className='px-7 text-white flex flex-col justify-center'>
              <p className="text-2xl text-center mb-5">{`You scored ${score} out of ${possibleScore}`}</p>
              <h2 className='text-center text-xl lg:text-3xl mb-6'>Those are all the words. Thank you for playing!</h2>
              <button className='bg-green-400 p-3 lg:p-7 text-xl lg:text-2xl hover:opacity-90' onClick={handleRestart}>Restart</button>
            </div>
          </div>
        }

        {/* Ding Beep */}
        <audio autoPlay ref={soundEffectRef}>Your browser does not support audio</audio>

        <div className="py-16 rounded-2xl relative ">

          {/* Score */}
          <div className='absolute left-1/2 -translate-x-1/2  md:left-40 top-1 text-lg lg:text-2xl font-semibold text-blue-500 bg-slate-100 p-3 lg:p-5 rounded-lg'>
            Score: {score}
          </div>

          <div className="flex flex-col items-center gap-5">

            {/* Sound icon */}
            <div className='bg-gray-100 p-4 rounded-lg mt-9 w-16 lg:w-24 cursor-pointer' id="soundIcon" onClick={handleRepeat}>
              <img src={sound} />
              <audio id="sound" autoPlay src={src}>Your browser does not support audio</audio>
            </div>

            {showInput &&
              <div className='flex'>
                <input className='px-2 lg:p-4 text-xl lg:text-3xl w-56 lg:w-96' type="text" ref={inputRef} id="input" placeholder="Spell the word" onKeyDown={handleInputCheck} />
                <button className='bg-white p-4 lg:p-6 ml-2 lg:ml-4 text-blue-700 font-medium' onClick={check}>Check</button>
              </div>
            }

            <div id="result" ref={resultRef} className={`text-4xl font-bold ${result ? 'text-green-400' : 'text-red-400'}`}></div>

            <div className='w-2/3'>
              <p id="definition" ref={definitionRef} className='text-xl lg:text-3xl bg-blue-200 rounded-md text-gray-600 text-center'></p>
            </div>

            <div className=''>
              <p id="part-of-speech" ref={partOfSpeechRef} className='text-xl lg:text-3xl bg-blue-200 rounded-md text-gray-600 text-center'></p>
            </div>


            <div className='flex rounded-lg justify-center'>
              <div className='text-left text-lg flex flex-col justify-between'>
                <div className='font-thin text-3xl text-white '>
                  <p className='my-4 option text-xl font-semibold lg:text-2xl glow' onClick={handleRepeat}>Can you please repeat the word?</p>
                  <p className='my-4 option text-xl font-semibold lg:text-2xl glow' onClick={handleDefinition}>May I have the definition?</p>
                  <p className='my-4 option text-xl font-semibold lg:text-2xl glow' onClick={handlePartOfSpeech}>May I please have the part of speech?</p>
                </div>
                <div>
                  <button className='bg-blue-400 py-3 px-6 text-white font-semibold hover:opacity-95' onClick={handleSpell}>SPELL</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default App
