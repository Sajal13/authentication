import { getSession } from "@/lib/session"
import { Role } from "@/lib/type";
import { redirect } from "next/navigation";

const Dashboard = async () => {
  const session = await getSession();

  if(!session || !session.user) redirect("/auth/signin");
  if(session.user.role !== Role.ADMIN)
    redirect("/auth/signin");
  console.log(session.user.role);

  if(session)
  return (
    <div>
      welcome to the dashboard
    </div>
  )
}

export default Dashboard
