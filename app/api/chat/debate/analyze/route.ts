import { NextRequest, NextResponse } from "next/server"

// This would normally be in environment variables or a separate service
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''

interface DebateAnalysisRequest {
  audioUrl?: string;
  videoUrl?: string;
  topic: string;
  phase: string;
  duration: number;
  transcript?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { audioUrl, videoUrl, topic, phase, duration, transcript } = await req.json() as DebateAnalysisRequest;

    if ((!audioUrl && !videoUrl) || !topic || !phase) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Simulate processing delay for demo purposes
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Generate a fake transcript if none was provided
    const generatedTranscript = transcript || generateFakeTranscript(topic, phase);
    
    // Analyze the debate performance (simulated)
    const analysis = analyzeDebatePerformance(generatedTranscript, topic, phase, duration);
    
    // If we have an OpenAI key, we could use it here for real analysis
    if (OPENAI_API_KEY) {
      try {
        // This would be where you call OpenAI API to analyze the transcript
        // For now, we'll stick with the simulated analysis
      } catch (error) {
        console.error('Error calling OpenAI for debate analysis:', error);
        // Continue with the simulated response if OpenAI fails
      }
    }
    
    return NextResponse.json({
      transcript: generatedTranscript,
      analysis
    });
  } catch (error) {
    console.error("Error in debate analysis API:", error);
    return NextResponse.json(
      { error: "Failed to process debate analysis request" },
      { status: 500 }
    );
  }
}

function generateFakeTranscript(topic: string, phase: string): string {
  const openings = [
    `Thank you for the opportunity to discuss "${topic}".`,
    `I'd like to address the important topic of "${topic}".`,
    `Today, I'll be presenting my perspective on "${topic}".`
  ];
  
  const mainPoints = [
    `First, I believe that ${topic.includes("technology") ? "technology has revolutionized how we learn" : "this issue has far-reaching implications"}. Research from MIT shows that ${topic.includes("education") ? "educational outcomes improve by 40% when technology is properly integrated" : "addressing this challenge requires a multifaceted approach"}.`,
    
    `My second point is about the broader societal impact. ${topic.includes("climate") ? "Climate action today determines our collective future" : topic.includes("social") ? "Social dynamics are fundamentally altered by these developments" : "This affects everyone regardless of background"}. According to a recent study by ${topic.includes("work") ? "Stanford University" : "Harvard researchers"}, ${topic.includes("remote work") ? "productivity increases by 13% when employees work remotely" : "we're seeing a paradigm shift in how people engage with this issue"}.`,
    
    `Finally, I'd like to address potential counterarguments. Critics might say that ${topic.includes("artificial intelligence") ? "AI will eliminate jobs" : topic.includes("social media") ? "social platforms create more division than connection" : "the status quo is adequate"}. However, the evidence suggests ${topic.includes("artificial intelligence") ? "AI creates more jobs than it displaces" : topic.includes("social media") ? "social platforms, when properly regulated, can enhance social cohesion" : "we need significant changes to current approaches"}.`
  ];
  
  const conclusions = [
    `In conclusion, the benefits of ${topic.includes("technology") ? "embracing technological innovation" : "addressing this issue proactively"} clearly outweigh the concerns.`,
    `To summarize my position, I firmly believe that ${topic.includes("climate") ? "immediate action on climate is essential" : topic.includes("education") ? "educational reform must be prioritized" : "we must reconsider conventional wisdom on this topic"}.`,
    `Therefore, I urge you to consider these points carefully and recognize that ${topic.includes("work") ? "the future of work is evolving rapidly" : topic.includes("genetic") ? "genetic engineering offers unprecedented possibilities" : "this issue deserves our focused attention"}.`
  ];
  
  let transcript = '';
  
  if (phase === 'opening') {
    const opening = openings[Math.floor(Math.random() * openings.length)];
    const points = mainPoints.join('\n\n');
    const conclusion = conclusions[Math.floor(Math.random() * conclusions.length)];
    
    transcript = `${opening}\n\nI would like to present three key arguments supporting my position.\n\n${points}\n\n${conclusion}`;
  } 
  else if (phase === 'rebuttal') {
    transcript = `I appreciate my opponent's perspective, but there are several points that need addressing.\n\nFirst, the claim that ${topic.includes("technology") ? "technology harms education" : "the current approach is sufficient"} is not supported by evidence. Studies consistently show that ${topic.includes("technology") ? "properly implemented technology enhances learning outcomes" : "new approaches yield better results"}.\n\nSecond, my opponent overlooked the critical issue of ${topic.includes("climate") ? "long-term sustainability" : topic.includes("work") ? "workplace satisfaction" : "broader societal impacts"}. This perspective fails to account for ${topic.includes("social") ? "changing social dynamics" : "evolving research in this field"}.\n\nThe data clearly contradicts my opponent's assertions, and I stand by my original position.`;
  } 
  else if (phase === 'closing') {
    transcript = `As we conclude this debate, I want to emphasize the key points I've presented.\n\nWe've established that ${topic.includes("technology") ? "technology offers transformative potential" : topic.includes("climate") ? "climate action is urgently needed" : "this issue requires immediate attention"}.\n\nThe evidence I've presented from ${topic.includes("work") ? "workplace studies" : topic.includes("education") ? "educational research" : "recent research"} strongly supports my position.\n\nI've addressed the counterarguments and shown why they don't withstand scrutiny.\n\nI urge you to consider the compelling case I've made and recognize that ${topic.includes("artificial intelligence") ? "AI will benefit humanity" : topic.includes("social media") ? "social media can be a positive force" : "my position offers the best path forward"}.`;
  }
  else { // preparation
    transcript = `[This appears to be preparation notes]\n\nKey points to address:\n- Definition of terms related to ${topic}\n- Statistical evidence from ${topic.includes("technology") ? "MIT and Stanford studies" : "recent research"}\n- Historical context of ${topic.includes("education") ? "educational reform" : topic.includes("work") ? "workplace evolution" : "this issue"}\n- Potential counterarguments and rebuttals\n- Strong closing statement emphasizing main thesis`;
  }
  
  // Add some filler words randomly
  const fillerWords = ["um", "uh", "like", "you know", "sort of", "kind of"];
  const words = transcript.split(' ');
  
  for (let i = 0; i < words.length; i += Math.floor(Math.random() * 20) + 10) {
    if (Math.random() > 0.7) {
      words[i] = fillerWords[Math.floor(Math.random() * fillerWords.length)] + " " + words[i];
    }
  }
  
  return words.join(' ');
}

function analyzeDebatePerformance(transcript: string, topic: string, phase: string, duration: number) {
  // Count filler words
  const fillerWords: Record<string, number> = {
    "um": 0,
    "uh": 0,
    "like": 0,
    "you know": 0,
    "sort of": 0,
    "kind of": 0
  };
  
  Object.keys(fillerWords).forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = transcript.match(regex);
    fillerWords[word] = matches ? matches.length : 0;
  });
  
  // Calculate total words and estimate speaking pace
  const wordCount = transcript.split(/\s+/).length;
  const minutes = duration / 60;
  const wordsPerMinute = Math.round(wordCount / minutes);
  
  // Evaluate structure based on phase
  let structureScore = Math.floor(Math.random() * 30) + 70; // Base 70-99%
  
  if (phase === 'opening' && transcript.includes('three key arguments')) {
    structureScore = Math.min(100, structureScore + 10);
  }
  
  if (phase === 'rebuttal' && transcript.includes('opponent')) {
    structureScore = Math.min(100, structureScore + 5);
  }
  
  // Evaluate logic and evidence
  const evidenceMarkers = ['research', 'study', 'studies', 'evidence', 'data', 'statistics', 'according to', 'researchers'];
  const evidenceCount = evidenceMarkers.reduce((count, marker) => {
    const regex = new RegExp(`\\b${marker}\\b`, 'gi');
    const matches = transcript.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);
  
  const logicScore = Math.floor(Math.random() * 30) + 65; // Base 65-94%
  const evidenceScore = Math.min(100, Math.floor(Math.random() * 25) + 70 + evidenceCount * 2); // Base 70-94% + bonus for evidence
  
  // Evaluate delivery based on filler words and pace
  const totalFillerWords = Object.values(fillerWords).reduce((sum, count) => sum + count, 0);
  let deliveryScore = Math.floor(Math.random() * 35) + 60; // Base 60-94%
  
  // Penalize for too many filler words
  deliveryScore = Math.max(50, deliveryScore - totalFillerWords * 2);
  
  // Penalize for speaking too fast or too slow
  if (wordsPerMinute > 180 || wordsPerMinute < 120) {
    deliveryScore = Math.max(50, deliveryScore - 10);
  }
  
  // Generate strengths and improvements
  const strengths = [];
  const improvements = [];
  
  // Add strengths
  if (structureScore > 80) {
    strengths.push("Well-organized argument with clear structure");
  }
  
  if (evidenceScore > 80) {
    strengths.push("Good use of evidence and examples to support arguments");
  }
  
  if (logicScore > 80) {
    strengths.push("Strong logical reasoning and argument flow");
  }
  
  if (deliveryScore > 80) {
    strengths.push("Confident and clear delivery with good pacing");
  }
  
  if (transcript.includes('counterarguments')) {
    strengths.push("Proactively addressed potential counterarguments");
  }
  
  // Add areas for improvement
  if (structureScore < 75) {
    improvements.push("Work on organizing arguments with clearer structure");
  }
  
  if (evidenceScore < 75) {
    improvements.push("Include more specific evidence and examples to strengthen claims");
  }
  
  if (totalFillerWords > 5) {
    improvements.push("Reduce use of filler words for more polished delivery");
  }
  
  if (wordsPerMinute > 180) {
    improvements.push("Slow down your speaking pace for better clarity");
  } else if (wordsPerMinute < 120) {
    improvements.push("Increase your speaking pace to maintain audience engagement");
  }
  
  if (strengths.length < 3) {
    strengths.push("Good engagement with the topic");
    strengths.push("Clear thesis statement");
  }
  
  if (improvements.length < 2) {
    improvements.push("Consider incorporating more rhetorical techniques");
    improvements.push("Practice transitioning more smoothly between main points");
  }
  
  // Generate key insights
  const keyInsights = [
    `Your argument is ${structureScore > 80 ? 'well-structured' : 'adequately structured'} but could benefit from ${evidenceScore > 80 ? 'even more concrete examples' : 'more evidence and examples'}.`,
    `Your ${phase} phase demonstrated ${logicScore > 80 ? 'strong' : 'reasonable'} logical progression.`,
    `Speaking at ${wordsPerMinute} words per minute, your pace is ${wordsPerMinute > 180 ? 'too fast' : wordsPerMinute < 120 ? 'too slow' : 'good'} for optimal audience engagement.`,
    `You used filler words ${totalFillerWords > 10 ? 'frequently' : totalFillerWords > 5 ? 'occasionally' : 'rarely'}, which ${totalFillerWords > 5 ? 'detracts from' : 'does not significantly impact'} your authority.`
  ];
  
  // Randomly select one or two insights
  const selectedInsights = keyInsights.sort(() => 0.5 - Math.random()).slice(0, 2).join(' ');
  
  return {
    strengths,
    improvements,
    structure: structureScore,
    logic: logicScore,
    evidence: evidenceScore,
    delivery: deliveryScore,
    fillerWords,
    speakingPace: {
      average: `${wordsPerMinute} words per minute`,
      recommendation: `Try to aim for ${wordsPerMinute > 160 ? 'slower' : wordsPerMinute < 130 ? 'faster' : 'consistent'} pacing (140-160 words per minute) for optimal clarity`
    },
    keyInsights: selectedInsights
  };
} 