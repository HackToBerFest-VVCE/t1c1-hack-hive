const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      let errorMsg = `Server error ${res.status}`;
      try {
        const errJson = await res.json();
        errorMsg = errJson.detail || errorMsg;
      } catch (e) {
        // fallback to status text
      }
      throw new Error(errorMsg);
    }
    return await res.json();
  } catch (err) {
    console.warn(`API call to ${endpoint} failed:`, err.message);
    throw err;
  }
}

export async function checkApiHealth() {
  return await request('/api/health');
}

export async function analyzeCircuit(payload) {
  return await request('/api/troubleshoot', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function sendFollowUp(payload) {
  return await request('/api/troubleshoot/follow-up', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function calculateSimulation(simType, params) {
  return await request('/api/simulations/calculate', {
    method: 'POST',
    body: JSON.stringify({
      simulation_type: simType,
      parameters: params,
    }),
  });
}

export async function tutorSimulation(simType, params, calculatedValues, studentQuestion = '') {
  return await request('/api/simulations/tutor', {
    method: 'POST',
    body: JSON.stringify({
      simulation_type: simType,
      parameters: params,
      calculated_values: calculatedValues,
      student_question: studentQuestion,
    }),
  });
}

export async function fetchExperiments() {
  return await request('/api/experiments');
}

export async function askGemmaAboutExperiment(payload) {
  return await request('/api/experiments/inquire', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function draftInstructorReply(payload) {
  return await request('/api/questions/ai-draft', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function draftAssessmentQuestions(payload) {
  return await request('/api/assessments/ai-draft', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function gradeSubmission(submissionItems) {
  return await request('/api/assessments/grade', {
    method: 'POST',
    body: JSON.stringify({ submission_items: submissionItems }),
  });
}

export async function verifyInstructorInvite(code) {
  return await request('/api/auth/verify-instructor-code', {
    method: 'POST',
    body: JSON.stringify({ invite_code: code }),
  });
}
