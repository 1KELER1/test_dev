// import { get } from "./request"


// export const isTokenExpired = async() => {
//     try {
//         await get("test/");
//     }catch(error){
//         if(error.status === 401){
//             return true;
//         }
//     }
//     return false;
// }
import { jwtDecode } from "jwt-decode";

export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token); // 
    const now = Date.now() / 1000;
    return decoded.exp < now;
  } catch (e) {
    return true;
  }
};
