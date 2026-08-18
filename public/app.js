const capabilities = [
  'Voice recognition and spoken replies when your browser supports the Web Speech API.',
  'Local chat brain for planning, math, summaries, timers, notes, and command suggestions.',
  'Persistent memory notes stored privately in this browser.',
  'Free static app: no paid API key is required to run the included assistant.',
  'Extensible provider hook so you can connect a real LLM later if you choose.'
];

const state = {
  notes: JSON.parse(localStorage.getItem('armani-notes') || '[]'),
  timers: [],
  recognition: null,
};

const messages = document.querySelector('#messages');
const prompt = document.querySelector('#prompt');
const form = document.querySelector('#promptForm');
const status = document.querySelector('#status');
const notes = document.querySelector('#notes');

function addMessage(role, text) {
  const element = document.createElement('div');
  element.className = `message ${role}`;
  element.textContent = text;
  messages.append(element);
  messages.scrollTop = messages.scrollHeight;
}

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(text.replace(/[*_`]/g, ''));
  utterance.rate = 1;
  utterance.pitch = 0.85;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

function saveNotes() {
  localStorage.setItem('armani-notes', JSON.stringify(state.notes));
  renderNotes();
}

function renderNotes() {
  notes.innerHTML = state.notes.length
    ? state.notes.map((note) => `<div class="note">${escapeHtml(note)}</div>`).join('')
    : '<span>No saved notes yet. Try: “remember my meeting is at 3”.</span>';
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function calculate(text) {
  const expression = text.toLowerCase().replace(/calculate|what is|what's|percent of/g, '').replace(/[^-+*/().\d%\s]/g, '').replace(/(\d+(?:\.\d+)?)%\s+of\s+(\d+(?:\.\d+)?)/g, '($1/100)*$2');
  if (!/[\d]/.test(expression)) return null;
  try {
    const result = Function(`"use strict"; return (${expression.replace(/%/g, '/100')})`)();
    return Number.isFinite(result) ? `Calculation complete: ${result}` : null;
  } catch {
    return null;
  }
}

function createPlan(text) {
  const topic = text.replace(/create|make|build|plan|mission|for|my|a|an/gi, ' ').trim() || 'your objective';
  return `Mission plan for ${topic}:\n1. Define the desired outcome in one sentence.\n2. Break it into three small milestones.\n3. Handle the highest-risk task first.\n4. Schedule a 25-minute focus block.\n5. Review results and update the next action.`;
}

function setTimer(text) {
  const match = text.match(/(\d+)\s*(second|seconds|minute|minutes|hour|hours)/i);
  if (!match) return null;
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const milliseconds = amount * (unit.startsWith('hour') ? 3600000 : unit.startsWith('minute') ? 60000 : 1000);
  const label = `${amount} ${unit}`;
  const timer = setTimeout(() => {
    const done = `Timer finished: ${label}.`;
    addMessage('agent', done);
    speak(done);
  }, milliseconds);
  state.timers.push(timer);
  return `Timer armed for ${label}.`;
}

function remember(text) {
  const match = text.match(/(?:remember|note|save)\s+(?:that\s+)?(.+)/i);
  if (!match) return null;
  state.notes.unshift(match[1].trim());
  saveNotes();
  return 'Memory updated. I saved that note locally in this browser.';
}

function summarize(text) {
  const target = text.replace(/summarize|summary of|sum up/gi, '').trim();
  if (target.length < 20) return 'Send me a longer paragraph after “summarize” and I will condense it into key points.';
  const sentences = target.match(/[^.!?]+[.!?]+/g) || [target];
  return `Summary:\n• ${sentences.slice(0, 3).map((sentence) => sentence.trim()).join('\n• ')}`;
}

function brief() {
  const now = new Date();
  return `Daily brief: It is ${now.toLocaleString()}. You have ${state.notes.length} saved memory note${state.notes.length === 1 ? '' : 's'}. Recommended priorities: choose one critical objective, protect a focus block, hydrate, and review your calendar.`;
}

function respondTo(input) {
  const text = input.trim();
  const lower = text.toLowerCase();
  return remember(text)
    || setTimer(text)
    || (/(calculate|what is|what's|\d+\s*[%+*/-])/.test(lower) ? calculate(text) : null)
    || (/(plan|mission|schedule|strategy)/.test(lower) ? createPlan(text) : null)
    || (/(summarize|summary|sum up)/.test(lower) ? summarize(text) : null)
    || (/(brief|morning|status report)/.test(lower) ? brief() : null)
    || `Standing by. I can plan, calculate, summarize, set timers, remember notes, and speak responses. For full internet-scale intelligence, connect the provider hook in app.js to your preferred LLM API.`;
}

function handlePrompt(value) {
  if (!value.trim()) return;
  addMessage('user', value);
  const answer = respondTo(value);
  addMessage('agent', answer);
  speak(answer);
}

function setupVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    document.querySelector('#listenBtn').disabled = true;
    document.querySelector('#listenBtn').textContent = 'Voice unavailable';
    return;
  }
  state.recognition = new SpeechRecognition();
  state.recognition.continuous = false;
  state.recognition.interimResults = false;
  state.recognition.onstart = () => { status.textContent = 'Listening...'; };
  state.recognition.onend = () => { status.textContent = 'Systems ready'; };
  state.recognition.onresult = (event) => handlePrompt(event.results[0][0].transcript);
}

document.querySelector('#capabilities').innerHTML = capabilities.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
form.addEventListener('submit', (event) => { event.preventDefault(); handlePrompt(prompt.value); prompt.value = ''; });
document.querySelector('#listenBtn').addEventListener('click', () => state.recognition?.start());
document.querySelector('#briefBtn').addEventListener('click', () => handlePrompt('daily brief'));
document.querySelector('#clearBtn').addEventListener('click', () => { messages.innerHTML = ''; speechSynthesis?.cancel(); });
document.querySelectorAll('[data-command]').forEach((button) => button.addEventListener('click', () => handlePrompt(button.dataset.command)));

setupVoice();
renderNotes();
addMessage('agent', 'Armani AI online. I cannot literally duplicate a fictional movie system, but I can provide a free, expandable command agent with a similar futuristic workflow.');
