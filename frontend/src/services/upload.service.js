import request from "./api";


export async function uploadResume(file){

  const formData = new FormData();

  formData.append(
    "file",
    file
  );


  return request(
    "/api/upload/",
    {
      method:"POST",
      body:formData,
    }
  );

}