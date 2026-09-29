import request from "./api";


export async function matchCandidate(
  candidateId,
  jobId
){

  return request(
    `/api/match/${candidateId}/${jobId}`,
    {
      method:"POST",
    }
  );

}


export async function getMatchHistory(){

  return request(
    "/api/match/"
  );

}


export async function getMatchById(id){

  return request(
    `/api/match/${id}`
  );

}