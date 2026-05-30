(function () {
  const S = window.TamakoSettings;
  const State = window.TamakoState;
  function slugify(value,fallback){const slug=String(value||"").toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");return slug||fallback;}
  function normalizeWord(raw,index){const promptText=String(raw.promptText||raw.word||"");const category=String(raw.category||raw.cat||"");const legacyKey=String(raw.legacyKey||raw.word||promptText);return{id:String(raw.id||`en_${slugify(promptText,"word")}_${index+1}`),mode:raw.mode||"english",level:Number(raw.level||1),category,promptText,reading:String(raw.reading||raw.kana||promptText),answerText:String(raw.answerText||raw.meaning||promptText),image:String(raw.image||raw.emoji||""),audioText:String(raw.audioText||raw.word||promptText),legacyKey};}
  function normalizeVocabulary(rawWords){return(Array.isArray(rawWords)?rawWords:[]).map(normalizeWord).filter((word)=>word.promptText&&word.answerText);}
  function shuffle(list){const out=list.slice();for(let i=out.length-1;i>0;i-=1){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
  function wordsForLevel(words,level){return words.filter((word)=>Number(word.level)===Number(level));}
  function learned(state,word){return!!State.wordStat(state,word).learned;}
  function learnedCount(words,state,level){return wordsForLevel(words,level).filter((word)=>learned(state,word)).length;}
  function total(words,level){return wordsForLevel(words,level).length;}
  function rate(words,state,level){const count=total(words,level);return count?learnedCount(words,state,level)/count:0;}
  function reviewWords(words,state){return words.filter((word)=>word.level<state.currentLevel&&!learned(state,word));}
  function hasReview(words,state){return reviewWords(words,state).length>0;}
  function availableCategories(words,state){const set=new Set(words.filter((word)=>Number(word.level)===Number(state.currentLevel)&&!learned(state,word)).map((word)=>word.category));const ordered=S.CATEGORY_ORDER.filter((category)=>set.has(category));Array.from(set).forEach((category)=>{if(!ordered.includes(category))ordered.push(category);});return ordered;}
  function ensureCategory(words,state,selectedCat){if(selectedCat!==S.ALL_CATEGORY_VALUE&&!availableCategories(words,state).includes(selectedCat))return S.ALL_CATEGORY_VALUE;return selectedCat||S.ALL_CATEGORY_VALUE;}
  function checkLevelUp(words,state){const beforeLevel=state.currentLevel;while(state.currentLevel<S.MAX_LEVEL&&rate(words,state,state.currentLevel)>=S.LEVEL_UP_RATE){state.currentLevel+=1;}return{leveled:state.currentLevel!==beforeLevel,beforeLevel,afterLevel:state.currentLevel};}
  function questionPool(words,state,selectedCat,mode){if(mode==="review")return reviewWords(words,state);let pool=words.filter((word)=>Number(word.level)===Number(state.currentLevel)&&!learned(state,word));if(selectedCat!==S.ALL_CATEGORY_VALUE)pool=pool.filter((word)=>word.category===selectedCat);return pool;}
  function makeQuestionList(words,state,selectedCat,mode,maxQuestions){return shuffle(questionPool(words,state,selectedCat,mode)).map((word)=>{const stat=State.wordStat(state,word);const weight=Math.max(1,6+stat.wrong*2-stat.streak*1.5-stat.seen*0.08);return{word,key:Math.random()/weight};}).sort((a,b)=>a.key-b.key).map((item)=>item.word).slice(0,maxQuestions);}
  function makeChoices(words,answer){let base=words.filter((word)=>Number(word.level)===Number(answer.level));let others=base.filter((word)=>word.id!==answer.id&&word.answerText!==answer.answerText);if(others.length<2)others=words.filter((word)=>word.id!==answer.id&&word.answerText!==answer.answerText);return shuffle([answer,...shuffle(others).slice(0,2)]).map((word)=>word.answerText);}
  window.TamakoQuiz=Object.freeze({normalizeWord,normalizeVocabulary,shuffle,wordsForLevel,learned,learnedCount,total,rate,reviewWords,hasReview,availableCategories,ensureCategory,checkLevelUp,questionPool,makeQuestionList,makeChoices});
})();
