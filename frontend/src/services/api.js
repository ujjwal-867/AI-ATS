const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";


async function request(endpoint, options = {}) {

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;


  const headers = {
    Accept: "application/json",

    ...(token && {
      Authorization: `Bearer ${token}`,
    }),

    ...options.headers,
  };


  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }


  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );


  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }


  if (!response.ok) {
    throw new Error(
      data?.detail || "Something went wrong"
    );
  }


  return data;
}


// Jobs
export async function getJobs() {
  return request(
    "/api/jobs/"
  );
}


// Matching
export async function matchCandidate(
  candidateId,
  jobId
) {
  return request(
    `/api/match/${candidateId}/${jobId}`,
    {
      method: "POST",
    }
  );
}


// Ranking
export async function getRanking(
  jobId
) {
  return request(
    `/api/ranking/${jobId}`
  );
}


// Pipeline
export async function getPipeline() {
  return request(
    "/api/pipeline/"
  );
}


export async function getPipelineCandidates() {
  return request(
    "/api/pipeline/"
  );
}


// Candidates
export async function getCandidates() {
  return request(
    "/api/candidates/"
  );
}


export async function getInterviewCandidates() {
  return request(
    "/api/candidates/interviews"
  );
}


// Interview
export async function scheduleInterview(
  candidateId,
  data
) {
  return request(
    `/api/candidates/${candidateId}/interview`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}


// Dashboard Stats
export async function getStats() {
  return request(
    "/api/stats/"
  );
}


// Analytics
export async function getAnalytics() {
  return request(
    "/api/analytics/"
  );
}


// Activity
export async function getActivity() {
  return request(
    "/api/activity/"
  );
}

// Candidate Profile
export async function getCandidateById(id){
  return request(
    `/api/candidates/${id}`
  );
}


export default request;

export async function createJob(data){


const response = await request(
"/api/jobs/",
{
method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(data)

}
);


return response;

}