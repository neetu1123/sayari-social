import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

const MOOD_POETRY_BANK = {
  love: [
    "Ishq ne ghalib nikamma kar diya,\n वरना hum bhi aadmi the kaam ke.",
    "Kuch toh baat hai teri saadgi mein,\nJo dil tujhse milne ko betaab rehta hai.",
    "Tum mil gaye toh jaise jannat mil gayi,\nAb kisi aur chahat ki tamanna nahi rahi.",
    "Tere chehre ki muskaan hi meri khushi hai,\nTeri dhadkan hi meri zindagi hai.",
    "Haath se haath mila kar chalna hai,\nZindagi bhar tere saath hi behna hai."
  ],
  sad: [
    "Dil-e-nadaan tujhe hua kya hai,\nAakhir is dard ki dava kya hai?",
    "Zindagi se koi shikwa nahi hai,\nBas kuch apne the jo badal gaye.",
    "Rone se koi wapas nahi aata,\nBas dil ka bojh halka ho jata hai.",
    "Humne toh dil lagaya tha unse,\nPar unhone toh bas dil behlaya tha.",
    "Tanhayi ki deewaron mein qaid hoon main,\nApne hi khayalon mein khoya hoon main."
  ],
  angry: [
    "Bikhra hai sab kuch par haare nahi hum,\nToofano se ladd kar khade hain yahan.",
    "Tumhe kya laga hum toot jayenge,\nHum toh aag hain, aur bhadak jayenge.",
    "Mera waqt badla hai, mera khoon nahi,\nMera attitude hi mera guroor hai.",
    "Ab na mohabbat hogi aur na koi gila,\nJisne jaisa kiya, usko waisa hi mila.",
    "Shaant khada hoon toh kamzori mat samajh,\nSher jab peeche hat-ta hai toh shikaar karta hai."
  ],
  happy: [
    "Har pal mein khushi dhoond hi lete hain,\nMuskura kar zindagi ko gale laga lete hain.",
    "Aaj dil me ajeeb si chahat hai,\nHar shaqs se milkar muskurane ki aadat hai.",
    "Khushi ki baatein thodi saajha karein,\nZindagi ke har lamhe ko aabaad karein.",
    "Muskurahat ka koi mol nahi hota,\nDil khol kar hasne ka koi tol nahi hota.",
    "Rang-birange gubbaro ki tarah hum udte chalein,\nZindagi ki raahon mein bas haste chalein."
  ],
  alone: [
    "Rahiye ab aisi jagah chalkar jahan koi na ho,\nHamsukhan koi na ho aur hamzabaan koi na ho.",
    "Apni hi tanhayi ka maza alag hai,\nNa kisi ke aane ki khushi na jaane ka gham.",
    "Mehfil mein reh kar bhi akele hain hum,\nApne hi khayalon mein magan hain hum.",
    "Bheed bahut hai is shehar mein,\nPar dhoondne niklo toh humsafar koi nahi.",
    "Khamoshi ki aawaz suno,\nIsme bhi ek khoobsurat saaz hai."
  ],
  motivation: [
    "Khudi ko kar buland itna ki har taqdeer se pehle,\nKhuda bande se khud pooche bata teri raza kya hai.",
    "Safar me dhoop toh hogi jo chal sako toh chalo,\nSabhi hain bheed me tum bhi nikal sako toh chalo.",
    "Hausle ke tarkash mein koshish ka woh teer zinda rakho,\nHaar jao chahe zindagi mein sab kuch, phir se jeetne ki umeed zinda rakho.",
    "Utho, jaago aur tab tak mat ruko,\nJab tak tum apna lakshya na paa lo.",
    "Mushkilein toh aani hain zindagi mein,\nInhe dekh kar peeche hatna hi toh maut hai."
  ],
  friendship: [
    "Milna na milna toh kismat ki baat hai,\nPar dost kehkar yaad karna toh dil ki baat hai.",
    "Dosti ka rishta sabse pyara hota hai,\nIsme na koi uncha, na koi nicha hota hai.",
    "Har mod par saath dete hain jo dost,\nWahi toh sach mein farishte hote hain.",
    "Ek sachaa dost sau rishtedaron se behtar hai,\nJo musibat mein sabse pehle khada hota hai.",
    "Yaari teri sabse pyaari,\nZindagi bhar nibhayenge dosti humari."
  ]
};

const BLOG_HELPER_DATABASE = [
  {
    title: "10 Simple Ways to Overcome Writer's Block",
    summary: "A practical guide to unleashing your creative writing when inspiration dries out."
  },
  {
    title: "Understanding the Rhythms of Modern Poetry",
    summary: "Breaking down the meter, styling, and tone variations in free-form verse writing."
  },
  {
    title: "The Emotional Connection of Art and Poetry",
    summary: "Exploring how visuals combined with words evoke stronger feelings in digital audiences."
  }
];

export async function POST(req) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const { type, mood, text, title } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // AI Shayari Post Generator
    if (type === 'shayari') {
      const selectedMood = (mood || 'love').toLowerCase();
      
      if (apiKey) {
        try {
          const prompt = `Write a deep, creative 2-line or 4-line Shayari in Hindi (using Roman script / Hinglish) representing the mood "${selectedMood}". Return ONLY the poetry lines, no other text or explanation.`;
          
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
              })
            }
          );

          if (response.ok) {
            const data = await response.json();
            const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (generatedText) {
              return NextResponse.json({ shayari: generatedText, generatedBy: 'Gemini AI' });
            }
          }
        } catch (err) {
          console.error('Gemini API call failed, falling back to local database:', err);
        }
      }

      // Fallback Database Picker
      const bank = MOOD_POETRY_BANK[selectedMood] || MOOD_POETRY_BANK.love;
      const randomIndex = Math.floor(Math.random() * bank.length);
      return NextResponse.json({ 
        shayari: bank[randomIndex], 
        generatedBy: 'System Poetry Database (Local Offline Engine)' 
      });
    }

    // AI Blog Writing Assistant
    if (type === 'blog') {
      if (apiKey) {
        try {
          const prompt = `Generate a catchy blog post title and a 2-sentence summary based on this topic idea: "${title || text || 'Poetry writing'}". Return in JSON format like: { "title": "Catchy Title", "summary": "Short 2-sentence description" }`;
          
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
              })
            }
          );

          if (response.ok) {
            const data = await response.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
            const parsed = JSON.parse(textResponse);
            if (parsed.title && parsed.summary) {
              return NextResponse.json({ ...parsed, generatedBy: 'Gemini AI' });
            }
          }
        } catch (err) {
          console.error('Gemini Blog Assistant failed, falling back to local database:', err);
        }
      }

      // Fallback
      const randomIndex = Math.floor(Math.random() * BLOG_HELPER_DATABASE.length);
      const item = BLOG_HELPER_DATABASE[randomIndex];
      return NextResponse.json({ 
        title: title ? `${title} - Deep Insights` : item.title, 
        summary: text ? `An detailed post discussing: ${text.substring(0, 100)}...` : item.summary,
        generatedBy: 'System Assistant (Local)' 
      });
    }

    return NextResponse.json({ message: 'Invalid generation type' }, { status: 400 });
  } catch (e) {
    console.error('AI API Error:', e);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
