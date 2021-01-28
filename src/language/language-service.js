
const LanguageService = {
  serializeHead(word, totalScore) {
    return {
      nextWord: word.original,
      wordCorrectCount: word.correct_count,
      wordIncorrectCount: word.incorrect_count,
      totalScore
    }
  },

  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score',
      )
      .where('language.user_id', user_id)
      .first()
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where({ language_id })
  },

  async getWords(db, language_id) {
    try {
    const words = await this.getLanguageWords(db, language_id)
    
      let nodeIds = {};
      let nextIds = {};
      let totalScore = 0;

      words.forEach(word => {
        totalScore += word.correct_count;
        //if the current word isn't listed as another word's "next" add it to possible heads
        if(!(nextIds[word.id])){
           nodeIds[word.id] = word;
        }
        else if(nodeIds[word.id]){
          delete nodeIds[word.id]
        }
          
        //if the current word has a next and it's listed as a possible head, remove it from being a possible head
        if((nodeIds[word.next])){
          delete nodeIds[word.next]
        }

        nextIds[word.next] = { notHead: true } 
      })

      const headArray = Object.values(nodeIds);
      const head = headArray[0];

      const orderedWords = this.orderArray(head, words);

      return {head, words: orderedWords, totalScore};
    }
    catch (er) {
      throw er
    }
  },

  updateWord(db, word_id, word) {
    return db('word')
      .update(word, (returning = true))
      .where({
        id: word_id
      })
      .returning('*')
      .then( rows => {
        return rows[0]
      })
  },

  orderArray(head, words) {
    let orderedArray = [head];

    while(orderedArray.length !== words.length) {
      const orderedTail = orderedArray[orderedArray.length - 1];
      
      const nextId = this.findNextWordIndex(words, orderedTail.next)
      const nextWord = words[nextId];

      orderedArray.push(nextWord);
    }

    console.log('ordered items: ', orderedArray)
    return orderedArray;
  },

  findNextWordIndex(words, id) {
    for(let i = 0; i < words.length; i++){
      if (words[i].id === id)
        return i
    }
    return -1;
  },


  async handleGuess(db, language_id, guess) {
    try {
      const getWords = await this.getWords(db, language_id)
      const {head, totalScore } = getWords;
      let words = getWords.words

      let newTotalScore = totalScore;
      console.log('WORDS ARE: ', words);

      const isCorrect = guess === head.translation ? true : false;
      const oldHeadIndex = 0;

      let updateIndexes = [oldHeadIndex]

      let shift;
      let correct_count = head.correct_count;
      let incorrect_count = head.incorrect_count;
      if(isCorrect){
        shift = head.memory_value *2;
        correct_count++;
        newTotalScore++;
      }
      else {
        shift = 1
        incorrect_count++;
      }
        
      console.log(`IT WAS A ${isCorrect} GUESS`);
      console.log(`mem value will be updated to: `, shift);
      words[oldHeadIndex] = {
        ...words[oldHeadIndex],
        memory_value: shift,
        correct_count: correct_count,
        incorrect_count: incorrect_count
      }

      const prevWordIndex = shift < words.length ? shift : words.length-1;

      
      words[oldHeadIndex].next = words[prevWordIndex].next;
      words[prevWordIndex].next = words[oldHeadIndex].id
      updateIndexes.push(prevWordIndex);
      

      console.log('ITEMS TO CHANGE: ', updateIndexes)

      const updates = Promise.all(updateIndexes.map(index => {
        return this.updateWord(db, words[index].id, words[index]);
      }))
      
      for( promise in updates) {
        console.log(typeof(promise));
        let temp = await promise
      }

      console.log('updated wordssssssss =>', words)
      
      const guessObj = {
              nextWord: words[1].original,
              totalScore: newTotalScore,
              isCorrect: isCorrect,
              answer: words[0].translation,
              wordCorrectCount: words[1].correct_count,
              wordIncorrectCount: words[1].incorrect_count
            }

            return guessObj
    }
    catch (er) {
      throw er
    }
    
  }


}

module.exports = LanguageService
