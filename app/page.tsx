import { currentUser } from "@clerk/nextjs/server";
import Wrapper from "../components/Wrapper";
import prisma from "@/lib/db";

export default async function Home() {
  const user = await currentUser();

  if (!user) {
    return (
      <Wrapper>
        <div>
          <span className="text-7xl mt-10 flex justify-center items-center">
            Please log in to access the app
          </span>
        </div>
      </Wrapper>
    );
  }

  // Sync clerkUserId on first login
  const email = user.emailAddresses[0].emailAddress;
  const existingUser = await prisma.user.findFirst({ where: { email } });
  if (existingUser && existingUser.clerkUserId !== user.id) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { clerkUserId: user.id },
    });
  }

  return (
    <Wrapper>
      <div>
        <span className="text-7xl mt-10 flex justify-center items-center">
          Welcome to the home page
        </span>
      </div>
    </Wrapper>
  );
}