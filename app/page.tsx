
import { currentUser } from "@clerk/nextjs/server";
import Wrapper from "../components/Wrapper";

import { addUserToDatabase } from "@/services/userService";


export default async function Home() {
  const user = await currentUser()

  if(user){
      const fullName = `${user.firstName} ${user.lastName}` || ""
      const email = user.emailAddresses[0].emailAddress || ""
      await addUserToDatabase(user.id,fullName,email  )
  }
  

  return (
    
    <Wrapper>
      kks
      
    </Wrapper>
  );
}
