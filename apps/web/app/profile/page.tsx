import { getProfile } from "@/lib/actions"

const ProfilePage = async () => {
  const profile = await getProfile()
  return (
    <div>
      This page is protected and only accessible to authenticated users.
      <p>{JSON.stringify(profile)}</p>
    </div>
  )
}

export default ProfilePage
